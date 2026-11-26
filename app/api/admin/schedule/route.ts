import { scheduleController } from "@/src/backend/container";

export const GET = () => scheduleController.list();
export const DELETE = (request: Request) => scheduleController.clear(request);