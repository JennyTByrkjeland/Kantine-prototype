// EDIT
import { hotSnackController } from "@/src/backend/container";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  return hotSnackController.get((await params).id);
}
export async function PUT(request: Request, { params }: Ctx) {
  return hotSnackController.update(request, (await params).id);
}
export async function DELETE(request: Request, { params }: Ctx) {
  return hotSnackController.remove(request, (await params).id);
}