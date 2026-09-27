import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}

export function refreshExpiryDate(): Date {
  // Parses values like "7d", "15m", "1h". Falls back to 7 days.
  const match = REFRESH_EXPIRES_IN.match(/^(\d+)([smhd])$/);
  const now = new Date();
  if (!match) {
    now.setDate(now.getDate() + 7);
    return now;
  }
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "s") now.setSeconds(now.getSeconds() + value);
  else if (unit === "m") now.setMinutes(now.getMinutes() + value);
  else if (unit === "h") now.setHours(now.getHours() + value);
  else if (unit === "d") now.setDate(now.getDate() + value);
  return now;
}
