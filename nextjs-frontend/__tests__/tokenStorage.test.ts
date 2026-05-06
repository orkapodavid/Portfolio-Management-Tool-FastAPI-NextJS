describe("token storage auth bypass", () => {
  const originalAuthDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED;
  const originalDesktopTarget = process.env.NEXT_PUBLIC_DESKTOP_TARGET;

  afterEach(() => {
    restoreEnv("NEXT_PUBLIC_AUTH_DISABLED", originalAuthDisabled);
    restoreEnv("NEXT_PUBLIC_DESKTOP_TARGET", originalDesktopTarget);
    window.localStorage.clear();
    jest.resetModules();
  });

  it("returns the no-auth token by default", async () => {
    delete process.env.NEXT_PUBLIC_AUTH_DISABLED;
    delete process.env.NEXT_PUBLIC_DESKTOP_TARGET;

    const { getAuthToken, isAuthDisabled } = await import(
      "../lib/auth/token-storage"
    );

    expect(isAuthDisabled()).toBe(true);
    expect(getAuthToken()).toBe("no-auth");
  });

  it("returns the no-auth token for desktop targets by default", async () => {
    delete process.env.NEXT_PUBLIC_AUTH_DISABLED;
    process.env.NEXT_PUBLIC_DESKTOP_TARGET = "1";

    const { getAuthToken, isAuthDisabled } = await import(
      "../lib/auth/token-storage"
    );

    expect(isAuthDisabled()).toBe(true);
    expect(getAuthToken()).toBe("no-auth");
  });

  it("keeps browser targets authenticated when the bypass flag is explicitly off", async () => {
    process.env.NEXT_PUBLIC_AUTH_DISABLED = "0";
    delete process.env.NEXT_PUBLIC_DESKTOP_TARGET;

    const { getAuthToken, isAuthDisabled } = await import(
      "../lib/auth/token-storage"
    );

    expect(isAuthDisabled()).toBe(false);
    expect(getAuthToken()).toBe(null);
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
