import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DashboardAuthGate } from "../components/auth/dashboard-auth-gate";

const replaceMock = jest.fn();
const usersCurrentUserMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

jest.mock("../app/clientService", () => ({
  usersCurrentUser: (...args: unknown[]) => usersCurrentUserMock(...args),
}));

describe("DashboardAuthGate auth bypass", () => {
  const originalFlag = process.env.NEXT_PUBLIC_AUTH_DISABLED;

  beforeAll(() => {
    delete process.env.NEXT_PUBLIC_AUTH_DISABLED;
  });

  afterAll(() => {
    if (originalFlag === undefined) {
      delete process.env.NEXT_PUBLIC_AUTH_DISABLED;
    } else {
      process.env.NEXT_PUBLIC_AUTH_DISABLED = originalFlag;
    }
  });

  it("renders children by default and skips the /users/me validation call", () => {
    render(
      <DashboardAuthGate>
        <div data-testid="protected">protected-content</div>
      </DashboardAuthGate>,
    );

    expect(screen.getByTestId("protected")).toBeInTheDocument();
    expect(
      screen.queryByText(/Checking your session/i),
    ).not.toBeInTheDocument();
    expect(usersCurrentUserMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
