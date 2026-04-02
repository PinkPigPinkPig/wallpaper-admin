import { Page } from "@playwright/test";
import path from "path";

// Seeded admin credentials (from prisma/seed/index.ts)
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin";

// Set localStorage auth tokens directly (bypass login API)
export function setAuthTokens(
  page: Page,
  accessToken: string,
  refreshToken: string
) {
  const expiry = Date.now() + 1000 * 60 * 60;
  page.evaluate(
    ({ accessToken, refreshToken, expiry }) => {
      localStorage.setItem("fingerprint", "test-fingerprint");
      localStorage.setItem(
        "tokens",
        JSON.stringify({
          accessToken,
          refreshToken,
          expiresAt: expiry,
          remember: true,
        })
      );
      localStorage.setItem(
        "user",
        JSON.stringify({
          user: { id: 1, username: "admin" },
          expiresAt: expiry,
        })
      );
    },
    { accessToken, refreshToken, expiry }
  );
}

// Clear all localStorage auth data
export function clearAuthTokens(page: Page) {
  page.evaluate(() => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    localStorage.removeItem("fingerprint");
  });
}

// Standard UI login
export async function login(
  page: Page,
  username?: string,
  password?: string
) {
  await page.goto("/auth/signin");
  await page.fill(
    'input[name="username"]',
    username || ADMIN_USERNAME
  );
  await page.fill(
    'input[name="password"]',
    password || ADMIN_PASSWORD
  );
  await page.click("button[type='submit']");
  await page.waitForURL("**/admin/wallpaper", { timeout: 10000 });
}

// Retrieve accessToken from localStorage on the page
async function getAccessToken(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const tokens = localStorage.getItem("tokens");
    if (!tokens) return "";
    try {
      return JSON.parse(tokens).accessToken || "";
    } catch {
      return "";
    }
  });
}

export async function cleanupWallpaper(page: Page, id: number) {
  const token = await getAccessToken(page);
  const resp = await page.request.delete(
    `http://localhost:3001/api/v1/admin/wallpaper/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`cleanup wallpaper ${id} failed: ${resp.status()}`);
  }
}

export async function cleanupCategory(page: Page, id: number) {
  const token = await getAccessToken(page);
  const resp = await page.request.delete(
    `http://localhost:3001/api/v1/wallpaper/category/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`cleanup category ${id} failed: ${resp.status()}`);
  }
}

export async function cleanupMenu(page: Page, id: number) {
  const token = await getAccessToken(page);
  const resp = await page.request.delete(
    `http://localhost:3001/api/v1/admin/menu/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!resp.ok() && resp.status() !== 404) {
    console.warn(`cleanup menu ${id} failed: ${resp.status()}`);
  }
}

export function samplePngPath(): string {
  return path.join(__dirname, "sample.png");
}
