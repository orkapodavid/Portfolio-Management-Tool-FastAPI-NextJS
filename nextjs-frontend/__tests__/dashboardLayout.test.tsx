import { Children, isValidElement } from "react";

import DashboardLayout from "../app/dashboard/layout";
import { DashboardAuthGate } from "../components/auth/dashboard-auth-gate";
import { TopNavigation } from "../components/layout/top-navigation";
import { PerformanceHeader } from "../components/layout/performance-header";
import { SubtabNavigation } from "../components/layout/subtab-navigation";

describe("DashboardLayout", () => {
  it("wraps the full dashboard shell in the auth gate", () => {
    const element = DashboardLayout({
      children: <div>dashboard-content</div>,
    });

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe(DashboardAuthGate);

    const shell = element.props.children;
    expect(isValidElement(shell)).toBe(true);
    expect(shell.type).toBe("div");

    const shellChildren = Children.toArray(shell.props.children);

    expect(shellChildren).toHaveLength(4);
    expect(isValidElement(shellChildren[0]) && shellChildren[0].type).toBe(
      TopNavigation,
    );
    expect(isValidElement(shellChildren[1]) && shellChildren[1].type).toBe(
      PerformanceHeader,
    );
    expect(isValidElement(shellChildren[2]) && shellChildren[2].type).toBe(
      SubtabNavigation,
    );

    const mainElement = shellChildren[3];

    expect(isValidElement(mainElement)).toBe(true);
    if (!isValidElement(mainElement)) {
      throw new Error("Expected dashboard main element");
    }

    const mainProps = mainElement.props as { children: unknown };

    expect(mainElement.type).toBe("main");
    expect(mainProps.children).toEqual(<div>dashboard-content</div>);
  });
});
