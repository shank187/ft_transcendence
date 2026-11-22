import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { upload_gym_image } from "../../middleware/upload_gym";
import {
    approveSubmissionController,
    createGymController,
    CurrentGymCOntroller,
    getALLEquipController,
    getGymByIdController,
    getNameController,
    getSubmissionsController,
    rejectSubmissionController,
    searchGymsController,
    uploadGymImageController,
} from "./gym.controller";

const router = Router();

router.get("/submissions", authenticate, getSubmissionsController);
router.get("/search", authenticate, searchGymsController);
router.get("/equip", authenticate, getALLEquipController);
router.post("/", authenticate, createGymController);
router.post("/upload-image", authenticate, upload_gym_image, uploadGymImageController);

router.patch("/submissions/:id/reject", authenticate, rejectSubmissionController);
router.patch("/submissions/:id/approve", authenticate, approveSubmissionController);
router.patch("/me/current", authenticate, CurrentGymCOntroller);

router.get("/name", authenticate, getNameController);
router.get("/:id", authenticate, getGymByIdController);

export default router;