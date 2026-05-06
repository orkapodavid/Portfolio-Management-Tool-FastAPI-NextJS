import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { getAuthToken } from "../lib/auth/token-storage";
import {
  NotificationsProvider,
  useNotifications,
} from "../lib/notifications-context";

jest.mock("../lib/auth/token-storage", () => ({
  getAuthToken: jest.fn(),
}));

jest.mock("../app/clientService", () => ({
  getNotifications: jest.fn(),
}));

function Probe() {
  const { isOpen, setOpen, toggleOpen } = useNotifications();
  return (
    <div>
      <span data-testid="state">{isOpen ? "open" : "closed"}</span>
      <button type="button" onClick={toggleOpen}>
        Toggle
      </button>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <NotificationsProvider>
      <Probe />
    </NotificationsProvider>,
  );

describe("NotificationsProvider sidebar preference", () => {
  beforeEach(() => {
    (getAuthToken as jest.Mock).mockReturnValue(null);
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("defaults the sidebar open when no preference is stored", () => {
    renderProbe();

    expect(screen.getByTestId("state")).toHaveTextContent("open");
  });

  it("honors a stored collapsed preference and persists later changes", async () => {
    window.localStorage.setItem("pmt:next:notificationSidebarOpen", "false");
    renderProbe();

    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("closed"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByTestId("state")).toHaveTextContent("open");
    expect(
      window.localStorage.getItem("pmt:next:notificationSidebarOpen"),
    ).toBe("true");
  });

  it("persists toggle changes under the pmt:next namespace", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));

    expect(screen.getByTestId("state")).toHaveTextContent("closed");
    expect(
      window.localStorage.getItem("pmt:next:notificationSidebarOpen"),
    ).toBe("false");
  });
});
