// EDIT
import { allergenController } from "@/src/backend/container";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  return allergenController.update(request, (await params).id);
}
export async function DELETE(_request: Request, { params }: Ctx) {
  return allergenController.remove((await params).id);
}