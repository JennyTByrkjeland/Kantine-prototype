// EDIT
import { scheduleController } from "@/src/backend/container";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  return scheduleController.moveSnack(request, (await params).id);
}
export async function DELETE(_request: Request, { params }: Ctx) {
  return scheduleController.removeSnack((await params).id);
}