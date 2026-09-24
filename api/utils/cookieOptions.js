export const getRefreshTokenCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 10 * 24 * 60 * 60 * 1000,
  };
};
