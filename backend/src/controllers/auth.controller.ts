import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshExpiryDate,
} from "../utils/jwt";

const userRepo = () => AppDataSource.getRepository(User);
const refreshRepo = () => AppDataSource.getRepository(RefreshToken);

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await userRepo().findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = userRepo().create({ email, password: hashed, name });
  await userRepo().save(user);

  return res.status(201).json({
    message: "Registered successfully",
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await userRepo().findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await refreshRepo().save(
    refreshRepo().create({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    })
  );

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "refreshToken is required" });
  }

  const stored = await refreshRepo().findOne({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: "Refresh token is invalid or expired" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Rotate refresh token: revoke old, issue new
    stored.revoked = true;
    await refreshRepo().save(stored);

    const newPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await refreshRepo().save(
      refreshRepo().create({
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: refreshExpiryDate(),
      })
    );

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token is invalid or expired" });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "refreshToken is required" });
  }

  const stored = await refreshRepo().findOne({ where: { token: refreshToken } });
  if (stored) {
    stored.revoked = true;
    await refreshRepo().save(stored);
  }

  return res.json({ message: "Logged out successfully" });
}
