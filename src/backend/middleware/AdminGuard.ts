//EDIT
import "server-only";
import { requireAdmin } from "@/src/backend/lib/require-admin";

export class AdminGuard {
  // Returns a 401 response if not allowed, otherwise null
  async authorize(): Promise<Response | null> {
    try {
      await requireAdmin();          // becomes a real session check later
      return null;
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
}