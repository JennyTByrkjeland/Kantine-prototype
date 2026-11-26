// EDIT
import "server-only";
import type { AdminGuard } from "@/src/backend/middleware/AdminGuard";

export abstract class BaseController {
  constructor(protected readonly guard: AdminGuard) {}

  protected json(data: unknown, status = 200) {
    return Response.json(data, { status });
  }
  protected error(message: string, status: number, extra: Record<string, unknown> = {}) {
    return Response.json({ error: message, ...extra }, { status });
  }
  protected noContent() {
    return new Response(null, { status: 204 });
  }
  protected readJson(request: Request) {
    return request.json().catch(() => null);
  }
}