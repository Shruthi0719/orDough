export const adminAuthQueryKey = ["admin-auth"] as const;

export type AdminSession = {
  authenticated: boolean;
  username?: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function getAdminSession(): Promise<AdminSession> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function loginAdmin(username: string, password: string): Promise<AdminSession> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function logoutAdmin(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { accept: "application/json" },
  });
}
