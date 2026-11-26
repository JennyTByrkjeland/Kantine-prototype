// EDIT
import { allergenController } from "@/src/backend/container";

export const GET = () => allergenController.list();
export const POST = (request: Request) => allergenController.create(request);