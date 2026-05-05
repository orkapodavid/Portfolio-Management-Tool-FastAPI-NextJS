import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import { LoginPageView } from "../app/login/login-page-view";

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

describe("Login Page", () => {
  it("renders the form with username and password input and submit button", async () => {
    render(<LoginPageView action={jest.fn()} />);

    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("submits the entered credentials to the page action", async () => {
    const action = jest.fn();
    render(<LoginPageView action={action} />);

    fireEvent.change(await screen.findByLabelText(/username/i), {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(await screen.findByLabelText(/password/i), {
      target: { value: "#123176a@" },
    });
    submitForm(await screen.findByRole("button", { name: /sign in/i }));

    expectSubmittedFormData(action, {
      username: "testuser@example.com",
      password: "#123176a@",
    });
  });

  it("displays the server validation error message", async () => {
    render(
      <LoginPageView
        action={jest.fn()}
        state={{ server_validation_error: "LOGIN_BAD_CREDENTIALS" }}
      />,
    );

    expect(await screen.findByText("LOGIN_BAD_CREDENTIALS")).toBeInTheDocument();
  });

  it("displays the server error message", async () => {
    render(
      <LoginPageView
        action={jest.fn()}
        state={{
          server_error: "An unexpected error occurred. Please try again later.",
        }}
      />,
    );

    expect(
      await screen.findByText(
        "An unexpected error occurred. Please try again later.",
      ),
    ).toBeInTheDocument();
  });
});
