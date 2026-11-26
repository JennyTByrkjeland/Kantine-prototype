// EDIT
import { hotSnackController } from "@/src/backend/container";

export const GET = () => hotSnackController.list();
export const POST = (request: Request) => hotSnackController.create(request);