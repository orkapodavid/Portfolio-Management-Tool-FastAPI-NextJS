"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { getNotifications } from "@/app/clientService";
import { getAuthToken } from "@/lib/auth/token-storage";
import { getApiData, getApiError } from "@/lib/utils";

export type NotificationType = "alert" | "warning" | "info";

export type NotificationItem = {
  id: string;
  header: string;
  ticker: string;
  timestamp: string;
  instruction: string;
  type: NotificationType;
  read: boolean;
  module: string;
  subtab: string;
  rowId: string;
  gridId: string;
};

const CATEGORY_TO_TYPE: Record<string, NotificationType> = {
  Alerts: "alert",
  Portfolio: "info",
  News: "info",
  System: "info",
};

type RawNotification = {
  id?: string | number;
  category?: string;
  title?: string;
  message?: string;
  time_ago?: string;
  is_read?: boolean;
  module?: string;
  subtab?: string;
  row_id?: string;
  grid_id?: string;
  ticker?: string;
};

function adapt(raw: RawNotification, index: number): NotificationItem {
  return {
    id: String(raw.id ?? index + 1),
    header: raw.title ?? "Notification",
    ticker: raw.ticker ?? raw.row_id ?? "N/A",
    timestamp: raw.time_ago ?? "Just now",
    instruction: raw.message ?? "",
    type: CATEGORY_TO_TYPE[raw.category ?? ""] ?? "info",
    read: raw.is_read ?? false,
    module: raw.module ?? "",
    subtab: raw.subtab ?? "",
    rowId: raw.row_id ?? "",
    gridId: raw.grid_id ?? "",
  };
}

type FilterValue = "all" | "alert" | "info";

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  filter: FilterValue;
  isLoading: boolean;
  errorMessage: string | null;
  toggleOpen: () => void;
  setOpen: (next: boolean) => void;
  setFilter: (next: FilterValue) => void;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setIsLoading(true);
    const response = await getNotifications({
      headers: { Authorization: `Bearer ${token}` },
      query: { limit: 50 },
    });

    const error = getApiError(response);
    if (error) {
      setErrorMessage("Could not load notifications.");
      setIsLoading(false);
      return;
    }

    const raw = (getApiData(response) as RawNotification[] | null) ?? [];
    setNotifications(raw.map(adapt));
    setErrorMessage(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const setOpen = useCallback((next: boolean) => setIsOpen(next), []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo<NotificationsContextValue>(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    return {
      notifications,
      unreadCount,
      isOpen,
      filter,
      isLoading,
      errorMessage,
      toggleOpen,
      setOpen,
      setFilter,
      markRead,
      dismiss,
      refresh,
    };
  }, [
    notifications,
    isOpen,
    filter,
    isLoading,
    errorMessage,
    toggleOpen,
    setOpen,
    markRead,
    dismiss,
    refresh,
  ]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside <NotificationsProvider>"
    );
  }
  return ctx;
}
