import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { getNotifications } from "../app/clientService";
import { NotificationSidebar } from "../components/layout/notification-sidebar";
import { getAuthToken } from "../lib/auth/token-storage";
import { NotificationsProvider } from "../lib/notifications-context";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../app/clientService", () => ({
  getNotifications: jest.fn(),
}));

jest.mock("../lib/auth/token-storage", () => ({
  getAuthToken: jest.fn(),
}));

const buildNotification = (index: number) => ({
  id: `notification-${index}`,
  category: "Alerts",
  title: `Alert ${index}`,
  message: `Notification ${index}`,
  time_ago: `${index} mins ago`,
  is_read: false,
  module: "Market Data",
  subtab: "Market Data",
  row_id: `TICK${index}`,
  grid_id: "market_data_grid",
  ticker: `TICK${index}`,
});

describe("NotificationSidebar", () => {
  beforeEach(() => {
    (getAuthToken as jest.Mock).mockReturnValue("token");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders notifications in 20-row batches and reveals more on fallback click", async () => {
    const notifications = Array.from({ length: 25 }, (_, index) =>
      buildNotification(index + 1),
    );
    (getNotifications as jest.Mock).mockResolvedValue({ data: notifications });

    render(
      <NotificationsProvider>
        <NotificationSidebar />
      </NotificationsProvider>,
    );

    expect(await screen.findByText("Alert 1")).toBeInTheDocument();
    expect(screen.getByText("Alert 20")).toBeInTheDocument();
    expect(screen.queryByText("Alert 21")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 20 of 25")).toBeInTheDocument();
    expect(getNotifications).toHaveBeenCalledWith({
      headers: { Authorization: "Bearer token" },
      query: { limit: 200 },
    });

    fireEvent.click(screen.getByRole("button", { name: /scroll for more/i }));

    expect(screen.getByText("Alert 25")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /scroll for more/i }),
    ).toBeNull();
    expect(screen.getByText("Showing 25 of 25")).toBeInTheDocument();
  });
});
