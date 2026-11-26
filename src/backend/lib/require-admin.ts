// REWRITE ON AUTHORIZATION CREATION
import "server-only";

export async function requireAdmin() {
  // TODO: replace with a real session check (Better Auth) before deploying.
  // Until then, refuse to run in production so unprotected writes can't go live.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Admin authorization is not implemented yet.");
  }
}