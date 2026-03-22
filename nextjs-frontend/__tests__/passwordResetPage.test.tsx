import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import { PasswordRecoveryPageView } from "../app/password-recovery/password-recovery-page-view";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: () => ({
    pending: false,
  }),
}));

function submitForm(button: HTMLElement) {
  const form = button.closest("form");
  if (!form) {
    throw new Error("Submit button is not inside a form");
  }

  fireEvent.submit(form);
}

function expectSubmittedFormData(
  action: jest.Mock,
  expected: Record<string, string>,
) {
  expect(action).toHaveBeenCalledTimes(1);
  const [submittedFormData] = action.mock.calls[0] as [FormData];
  expect(Object.fromEntries(submittedFormData.entries())).toEqual(expected);
}

describe("Password Reset Page", () => {
  it("renders the form with email input and submit button", async () => {
    render(<PasswordRecoveryPageView action={jest.fn()} />);

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /send/i }),
    ).toBeInTheDocument();
  });

  it("submits the entered email to the page action", async () => {
    const action = jest.fn();
    render(<PasswordRecoveryPageView action={action} />);

    fireEvent.change(await screen.findByLabelText(/email/i), {
      target: { value: "testuser@example.com" },
    });
    submitForm(await screen.findByRole("button", { name: /send/i }));

    expectSubmittedFormData(action, {
      email: "testuser@example.com",
    });
  });

  it("displays success and error state messages", async () => {
    const { rerender } = render(
      <PasswordRecoveryPageView
        action={jest.fn()}
        state={{ message: "Password reset instructions sent to your email." }}
      />,
    );

    expect(
      await screen.findByText("Password reset instructions sent to your email."),
    ).toBeInTheDocument();

    rerender(
      <PasswordRecoveryPageView
        action={jest.fn()}
        state={{ server_validation_error: "User not found" }}
      />,
    );

    expect(await screen.findByText("User not found")).toBeInTheDocument();
  });
});
