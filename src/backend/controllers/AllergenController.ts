// EDIT
import "server-only";
import { AllergenInput, IdParam } from "@/src/backend/lib/schemas";
import type { AdminGuard } from "@/src/backend/middleware/AdminGuard";
import type { AllergenService } from "@/src/backend/services/AllergenService";
import { BaseController } from "@/src/backend/controllers/BaseController";

export class AllergenController extends BaseController {
  constructor(private readonly service: AllergenService, guard: AdminGuard) {
    super(guard);
  }

  async list(): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;
    return this.json(await this.service.list());
  }

  async create(request: Request): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const body = AllergenInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.create(body.data);
    if (!result.ok) return this.error("That allergen already exists.", 409);
    return this.json(result.allergen, 201);
  }

  async update(request: Request, rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const body = AllergenInput.safeParse(await this.readJson(request));
    if (!body.success) return this.error(body.error.issues[0].message, 400);

    const result = await this.service.update(id.data, body.data);
    if (!result.ok) {
      return result.reason === "not_found"
        ? this.error("Allergen not found.", 404)
        : this.error("That allergen already exists.", 409);
    }
    return this.json(result.allergen);
  }

  async remove(rawId: string): Promise<Response> {
    const denied = await this.guard.authorize();
    if (denied) return denied;

    const id = IdParam.safeParse(rawId);
    if (!id.success) return this.error("Invalid id.", 400);

    const result = await this.service.delete(id.data);
    if (!result.ok) {
      return result.reason === "not_found"
        ? this.error("Allergen not found.", 404)
        : this.error("This allergen is used by dishes or snacks and can't be deleted.", 409);
    }
    return this.noContent();
  }
}