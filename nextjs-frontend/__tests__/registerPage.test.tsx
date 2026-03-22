import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";

import { RegisterPageView } from "../app/register/register-page-view";

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

describe("Register Page", () => {
  it("renders the form with email and password input and submit button", async () => {
    render(<RegisterPageView action={jest.fn()} />);

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/password/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("submits the entered registration values to the page action", async () => {
    const action = jest.fn();
    render(<RegisterPageView action={action} />);

    fireEvent.change(await screen.findByLabelText(/email/i), {
      target: { value: "testuser@example.com" },
    });
    fireEvent.change(await screen.findByLabelText(/password/i), {
      target: { value: "@1231231%a" },
    });
    submitForm(await screen.findByRole("button", { name: /sign up/i }));

    expectSubmittedFormData(action, {
      email: "testuser@example.com",
      password: "@1231231%a",
    });
  });

  it("displays the server validation error message", async () => {
    render(
      <RegisterPageView
        action={jest.fn()}
        state={{ server_validation_error: "User already exists" }}
      />,
    );

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
  });

  it("displays the server error message", async () => {
    render(
      <RegisterPageView
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

  it("displays field validation errors from the page state", async () => {
    render(
      <RegisterPageView
        action={jest.fn()}
        state={{
          errors: {
            email: ["Invalid email address"],
            password: [
              "Password should contain at least one uppercase letter.",
              "Password should contain at least one special character.",
            ],
          },
        }}
      />,
    );

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Password should contain at least one uppercase letter.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Password should contain at least one special character.",
      ),
    ).toBeInTheDocument();
  });
});
