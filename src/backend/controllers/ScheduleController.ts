import "server-only";
import {
  IdParam,
  MoveScheduledDishInput,
  MoveScheduledSnackInput,
  ScheduleDishInput,
  ScheduleSnackInput,
} from "@/src/backend/lib/schemas";
import type { AdminGuard } from "@/src/backend/middleware/AdminGuard";
import type { ScheduleService } from "@/src/backend/services/ScheduleService";
import { BaseController } from "@/src/backend/controllers/BaseController";

export class ScheduleController extends BaseController {
  constructor(private readonly service: ScheduleService, guard: AdminGuard) {
    super(guard);
  }

  // GET /api/admin/schedule: the whole weekly plan
  async list(): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;
    return this.json(await this.service.listAll());
  }

  // DELETE /api/admin/schedule[?confirm=true]: clear the whole week
  async clear(request: Request): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const confirmed = new URL(request.url).searchParams.get("confirm") === "true";
    if (!confirmed) {
      const counts = await this.service.count();
      if (counts.dishes + counts.snacks === 0) {
        return this.json({ removed: counts });           // nothing to clear
      }
      return this.error("This removes the whole weekly menu. Continue?", 409, {
        requiresConfirmation: true,
        wouldRemove: counts,
      });
    }

    return this.json({ removed: await this.service.clear() });
  }

  // ---------- Dishes ----------

  async addDish(request: Request): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const body = ScheduleDishInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.addDish(body.data.dishId, body.data.weekday);
    if (!result.ok) {
      return result.reason === "item_not_found"
        ? this.error("Dish not found.", 404)
        : this.error("This dish is already scheduled on that day.", 409);
    }
    return this.json(result.entry, 201);
  }

  async moveDish(request: Request, rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const body = MoveScheduledDishInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.moveDish(id.data, body.data.weekday);
    if (!result.ok) {
      return result.reason === "not_found"
        ? this.error("Scheduled dish not found.", 404)
        : this.error("This dish is already scheduled on that day.", 409);
    }
    return this.json(result.entry);
  }

  async removeDish(rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const result = await this.service.removeDish(id.data);
    return result.ok ? this.noContent() : this.error("Scheduled dish not found.", 404);
  }

  // ---------- Hot snacks ----------

  async addSnack(request: Request): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const body = ScheduleSnackInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.addSnack(body.data.hotSnackId, body.data.weekday);
    if (!result.ok) {
      return result.reason === "item_not_found"
        ? this.error("Hot snack not found.", 404)
        : this.error("This hot snack is already scheduled on that day.", 409);
    }
    return this.json(result.entry, 201);
  }

  async moveSnack(request: Request, rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const body = MoveScheduledSnackInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.moveSnack(id.data, body.data.weekday);
    if (!result.ok) {
      return result.reason === "not_found"
        ? this.error("Scheduled snack not found.", 404)
        : this.error("This hot snack is already scheduled on that day.", 409);
    }
    return this.json(result.entry);
  }

  async removeSnack(rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const result = await this.service.removeSnack(id.data);
    return result.ok ? this.noContent() : this.error("Scheduled snack not found.", 404);
  }
}