import { type IToken } from "@/utils/interfaces";

const refreshTokenKey = "refresh_token";
const accessTokenKey = "access_token";

export const getAccessToken = () => {
  return localStorage.getItem(accessTokenKey);
};

export const getRefreshToken = () => {
  return localStorage.getItem(refreshTokenKey);
};

export const setTokens = (tokens: IToken) => {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
};

export const removeTokens = () => {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
};
