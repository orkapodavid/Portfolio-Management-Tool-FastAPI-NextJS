import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import PasswordResetConfirmPage from "../app/password-recovery/confirm/page";
import { ResetPasswordConfirmPageView } from "../app/password-recovery/confirm/reset-password-confirm-page-view";

const mockNotFound = jest.fn();
const mockUseSearchParamsGet = jest.fn();
const mockUseActionState = jest.fn();
const mockUseEffect = jest.fn((callback: () => void) => callback());

jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockUseSearchParamsGet,
  }),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: (...args: unknown[]) => mockUseActionState(...args),
  useEffect: (callback: () => void) => mockUseEffect(callback),
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

describe("Password Reset Confirm Page", () => {
  beforeEach(() => {
    mockNotFound.mockReset();
    mockUseSearchParamsGet.mockReset();
    mockUseActionState.mockReset();
    mockUseEffect.mockClear();
    mockUseActionState.mockReturnValue([undefined, jest.fn()]);
  });

  it("renders the form with password fields, submit button, and reset token", async () => {
    render(
      <ResetPasswordConfirmPageView action={jest.fn()} token="mock-token" />,
    );

    expect(await screen.findByLabelText("Password")).toBeInTheDocument();
    expect(await screen.findByLabelText("Password Confirm")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("mock-token")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /send/i }),
    ).toBeInTheDocument();
  });

  it("submits the new password values and token to the page action", async () => {
    const action = jest.fn();
    render(<ResetPasswordConfirmPageView action={action} token="mock-token" />);

    fireEvent.change(await screen.findByLabelText("Password"), {
      target: { value: "P12345678#" },
    });
    fireEvent.change(await screen.findByLabelText("Password Confirm"), {
      target: { value: "P12345678#" },
    });
    submitForm(await screen.findByRole("button", { name: /send/i }));

    expectSubmittedFormData(action, {
      password: "P12345678#",
      passwordConfirm: "P12345678#",
      resetToken: "mock-token",
    });
  });

  it("displays the server validation error message", async () => {
    render(
      <ResetPasswordConfirmPageView
        action={jest.fn()}
        token="invalid-mock-token"
        state={{ server_validation_error: "Invalid Token" }}
      />,
    );

    expect(await screen.findByText("Invalid Token")).toBeInTheDocument();
  });

  it("displays field validation errors from the page state", async () => {
    render(
      <ResetPasswordConfirmPageView
        action={jest.fn()}
        token="mock-token"
        state={{
          errors: {
            password: ["Password should contain at least one uppercase letter."],
            passwordConfirm: ["Passwords must match."],
          },
        }}
      />,
    );

    expect(
      await screen.findByText(
        "Password should contain at least one uppercase letter.",
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("Passwords must match.")).toBeInTheDocument();
  });

  it("calls notFound from the route module when the reset token is missing", async () => {
    mockUseSearchParamsGet.mockReturnValue(null);

    render(<PasswordResetConfirmPage />);

    await waitFor(() => {
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });
  });
});
