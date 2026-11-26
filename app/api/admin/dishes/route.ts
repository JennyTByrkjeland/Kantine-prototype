// EDIT
import { dishController } from "@/src/backend/container";

export const GET = () => dishController.list();
export const POST = (request: Request) => dishController.create(request);