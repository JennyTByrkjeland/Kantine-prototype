// EDIT
import { scheduleController } from "@/src/backend/container";

export const POST = (request: Request) => scheduleController.addSnack(request);