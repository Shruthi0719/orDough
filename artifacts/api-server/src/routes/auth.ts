import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";

const ADMIN_COOKIE = "ordough_admin";

type SignedCookieRequest = Request & {
  signedCookies?: Record<string, string | false>;
};

const router: IRouter = Router();

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? "ordough-dev-session-secret";
}

export function getCookieSecret(): string {
  const secret = getSessionSecret();
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    console.warn("[auth] SESSION_SECRET is not set. Set SESSION_SECRET before deploying.");
  }
  return secret;
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminAuthenticated(req: Request): boolean {
  const signedCookies = (req as SignedCookieRequest).signedCookies;
  return signedCookies?.[ADMIN_COOKIE] === "authenticated";
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (isAdminAuthenticated(req)) {
    next();
    return;
  }

  res.status(401).json({ error: "Administrator login required" });
}

router.post("/auth/login", (req, res): void => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    res.status(503).json({ error: "Admin credentials are not configured" });
    return;
  }

  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!safeCompare(username, adminUsername) || !safeCompare(password, adminPassword)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.cookie(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 12,
    path: "/",
  });

  res.json({ authenticated: true, username: adminUsername });
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.json({ authenticated: false });
});

router.get("/auth/me", (req, res): void => {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({ authenticated: true, username: process.env.ADMIN_USERNAME ?? "admin" });
});

export default router;
