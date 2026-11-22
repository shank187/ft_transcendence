import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { upload_gym_image } from "../../middleware/upload_gym";
import {
    approveSubmissionController,
    createGymController,
    CurrentGymCOntroller,
    EditGymCOntroller,
    getALLEquipController,
    getCurrentGymCOntroller,
    getGymByIdController,
    getPrivateController,
    getSubmissionsController,
    getUserSubmissionsController,
    rejectSubmissionController,
    RMPrivateGymController,
    searchGymsController,
    uploadGymImageController,
} from "./gym.controller";

const router = Router();

router.get("/submissions", authenticate, getSubmissionsController);
router.get("/me/submissions", authenticate, getUserSubmissionsController);

router.get("/search", authenticate, searchGymsController);
router.get("/equip", authenticate, getALLEquipController);

router.post("/", authenticate, createGymController);
router.post("/upload-image", authenticate, upload_gym_image, uploadGymImageController);

router.patch("/submissions/:id/reject", authenticate, rejectSubmissionController);
router.patch("/submissions/:id/approve", authenticate, approveSubmissionController);

router.patch("/me/current", authenticate, CurrentGymCOntroller);
router.get("/me/current", authenticate, getCurrentGymCOntroller);
router.get("/private", authenticate, getPrivateController);

router.patch("/:id", authenticate, EditGymCOntroller);
router.delete("/:id", authenticate, RMPrivateGymController);
router.get("/:id", authenticate, getGymByIdController);

export default router;
