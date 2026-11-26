// server/container.ts: the one place that creates and connects the objects
import "server-only";
import { sql } from "@/src/backend/lib/db";
import { AdminGuard } from "@/src/backend/middleware/AdminGuard";
import { MenuService } from "@/src/backend/services/MenuService";
import { AllergenService } from "@/src/backend/services/AllergenService";
import { DishService } from "@/src/backend/services/DishService";
import { HotSnackService } from "@/src/backend/services/HotSnackService";
import { ScheduleService } from "@/src/backend/services/ScheduleService";
import { AllergenController } from "@/src/backend/controllers/AllergenController";
import { DishController } from "@/src/backend/controllers/DishController";
import { HotSnackController } from "@/src/backend/controllers/HotSnackController";
import { ScheduleController } from "@/src/backend/controllers/ScheduleController";

const guard = new AdminGuard();

export const menuService = new MenuService(sql);
export const allergenController = new AllergenController(new AllergenService(sql), guard);
export const dishController = new DishController(new DishService(sql), guard);
export const hotSnackController = new HotSnackController(new HotSnackService(sql), guard);
export const scheduleController = new ScheduleController(new ScheduleService(sql), guard);