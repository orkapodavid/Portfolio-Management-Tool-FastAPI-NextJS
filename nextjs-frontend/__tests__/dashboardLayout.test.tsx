import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

import DashboardLayout from "../app/dashboard/layout";
import { DashboardAuthGate } from "../components/auth/dashboard-auth-gate";
import { TopNavigation } from "../components/layout/top-navigation";
import { PerformanceHeader } from "../components/layout/performance-header";
import { SubtabNavigation } from "../components/layout/subtab-navigation";
import { NotificationSidebar } from "../components/layout/notification-sidebar";
import { NotificationsProvider } from "../lib/notifications-context";

type WithChildren = { children?: ReactNode };

const asElement = (node: unknown): ReactElement<WithChildren> => {
  if (!isValidElement(node)) {
    throw new Error("Expected a React element");
  }
  return node as ReactElement<WithChildren>;
};

describe("DashboardLayout", () => {
  it("nests AuthGate -> NotificationsProvider -> chrome shell with the sidebar wired up", () => {
    const element = DashboardLayout({
      children: <div>dashboard-content</div>,
    });

    expect(element.type).toBe(DashboardAuthGate);

    const provider = asElement(element.props.children);
    expect(provider.type).toBe(NotificationsProvider);

    const shell = asElement(provider.props.children);
    expect(shell.type).toBe("div");

    const shellChildren = Children.toArray(shell.props.children);
    expect(shellChildren).toHaveLength(3);
    expect(asElement(shellChildren[0]).type).toBe(TopNavigation);
    expect(asElement(shellChildren[1]).type).toBe(PerformanceHeader);

    const lowerRow = asElement(shellChildren[2]);
    const lowerChildren = Children.toArray(lowerRow.props.children);
    expect(lowerChildren).toHaveLength(2);

    const contentColumn = asElement(lowerChildren[0]);
    const columnChildren = Children.toArray(contentColumn.props.children);
    expect(asElement(columnChildren[0]).type).toBe(SubtabNavigation);

    const main = asElement(columnChildren[1]);
    expect(main.type).toBe("main");
    expect((main.props as { children: unknown }).children).toEqual(
      <div>dashboard-content</div>
    );

    expect(asElement(lowerChildren[1]).type).toBe(NotificationSidebar);
  });
});
