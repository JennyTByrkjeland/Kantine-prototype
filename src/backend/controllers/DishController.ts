import "server-only";
import { DishInput, IdParam } from "@/src/backend/lib/schemas";
import type { AdminGuard } from "@/src/backend/middleware/AdminGuard";
import type { DishService } from "@/src/backend/services/DishService";
import { BaseController } from "@/src/backend/controllers/BaseController";

export class DishController extends BaseController {
  constructor(private readonly service: DishService, guard: AdminGuard) {
    super(guard);
  }

  async list(): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;
    return this.json(await this.service.list());
  }

  async get(rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const dish = await this.service.findById(id.data);
    return dish ? this.json(dish) : this.error("Dish not found.", 404);
  }

  async create(request: Request): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const body = DishInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.create(body.data);
    if (!result.ok) {
      return result.reason === "duplicate"
        ? this.error("A dish with that name already exists.", 409)
        : this.error("One or more allergens don't exist.", 400);
    }
    return this.json(await this.service.findById(result.id), 201);
  }

  async update(request: Request, rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const body = DishInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.update(id.data, body.data);
    if (!result.ok) {
      if (result.reason === "not_found") return this.error("Dish not found.", 404);
      if (result.reason === "duplicate") {
        return this.error("A dish with that name already exists.", 409);
      }
      return this.error("One or more allergens don't exist.", 400);
    }
    return this.json(await this.service.findById(result.id));
  }

  async remove(request: Request, rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    // Warn if the dish is on the weekly menu; ?confirm=true skips the warning
    const confirmed = new URL(request.url).searchParams.get("confirm") === "true";
    if (!confirmed && (await this.service.isScheduled(id.data))) {
      return this.error("This dish is on the weekly menu. Delete anyway?", 409, {
        requiresConfirmation: true,
      });
    }

    const result = await this.service.delete(id.data);
    return result.ok ? this.noContent() : this.error("Dish not found.", 404);
  }
}