// EDIT
import { dishController } from "@/src/backend/container";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  return dishController.get((await params).id);
}
export async function PUT(request: Request, { params }: Ctx) {
  return dishController.update(request, (await params).id);
}
export async function DELETE(request: Request, { params }: Ctx) {
  return dishController.remove(request, (await params).id);
}