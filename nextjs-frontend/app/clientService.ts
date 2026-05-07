export * from "./openapi-client";

import { ensureClientConfigured } from "@/lib/clientConfig";
import {
  authAuthJwtLogin,
  authAuthJwtLogout,
  authRegisterRegister,
  authResetForgotPassword,
  authResetResetPassword,
  itemCreateItem,
  itemDeleteItem,
  itemReadItem,
  marketDataGetMarketData,
  marketDataGetTopMovers,
  notificationsGetNotifications,
  performanceGetKpiData,
  performanceGetPortfolioHoldings,
  usersUsersCurrentUser,
} from "./openapi-client";

export type {
  AuthAuthJwtLoginError as AuthJwtLoginError,
  AuthRegisterRegisterError as RegisterRegisterError,
} from "./openapi-client";

const withConfiguredClient = async <T>(
  callback: () => T,
): Promise<Awaited<T>> => {
  await ensureClientConfigured();
  return await callback();
};

export const authJwtLogin = (options: Parameters<typeof authAuthJwtLogin>[0]) =>
  withConfiguredClient(() => authAuthJwtLogin(options));

export const authJwtLogout = (
  options?: Parameters<typeof authAuthJwtLogout>[0],
) => withConfiguredClient(() => authAuthJwtLogout(options));

export const registerRegister = (
  options: Parameters<typeof authRegisterRegister>[0],
) => withConfiguredClient(() => authRegisterRegister(options));

export const resetForgotPassword = (
  options: Parameters<typeof authResetForgotPassword>[0],
) => withConfiguredClient(() => authResetForgotPassword(options));

export const resetResetPassword = (
  options: Parameters<typeof authResetResetPassword>[0],
) => withConfiguredClient(() => authResetResetPassword(options));

export const createItem = (options: Parameters<typeof itemCreateItem>[0]) =>
  withConfiguredClient(() => itemCreateItem(options));

export const deleteItem = (options: Parameters<typeof itemDeleteItem>[0]) =>
  withConfiguredClient(() => itemDeleteItem(options));

export const readItem = (options: Parameters<typeof itemReadItem>[0]) =>
  withConfiguredClient(() => itemReadItem(options));

export const getMarketData = (
  options?: Parameters<typeof marketDataGetMarketData>[0],
) => withConfiguredClient(() => marketDataGetMarketData(options));

export const usersCurrentUser = (
  options?: Parameters<typeof usersUsersCurrentUser>[0],
) => withConfiguredClient(() => usersUsersCurrentUser(options));

export const getNotifications = (
  options?: Parameters<typeof notificationsGetNotifications>[0],
) => withConfiguredClient(() => notificationsGetNotifications(options));

export const getKpiData = (
  options?: Parameters<typeof performanceGetKpiData>[0],
) => withConfiguredClient(() => performanceGetKpiData(options));

export const getPortfolioHoldings = (
  options?: Parameters<typeof performanceGetPortfolioHoldings>[0],
) => withConfiguredClient(() => performanceGetPortfolioHoldings(options));

export const getTopMovers = (
  options?: Parameters<typeof marketDataGetTopMovers>[0],
) => withConfiguredClient(() => marketDataGetTopMovers(options));
