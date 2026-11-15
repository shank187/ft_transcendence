import { Router } from "express";
import { getEquipmentController } from "./equipment.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.get("/", authenticate, getEquipmentController);

export default router;
