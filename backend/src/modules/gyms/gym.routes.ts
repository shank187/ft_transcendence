import { Router } from "express"
import {searchGymsController} from "./gym.controller"
import { authenticate } from "../../middleware/authenticate";
import {getGymByIdController} from "./gym.controller";
import {getALLEquipController} from "./gym.controller"
import {createGymController} from "./gym.controller"
import {getSubmissionsController} from "./gym.controller";
import {getCurrentGymCOntroller} from "./gym.controller";


import { upload_gym_image } from "../../middleware/upload_gym";
import { uploadGymImageController } from "./gym.controller";
import {CurrentGymCOntroller} from "./gym.controller";
import {getPrivateController} from "./gym.controller";


const router = Router();


router.get('/submissions', authenticate, getSubmissionsController);
router.get('/search', authenticate, searchGymsController);
router.get('/equip', authenticate, getALLEquipController);
router.post('/', authenticate, createGymController);
router.post('/upload-image', authenticate, upload_gym_image, uploadGymImageController);

router.patch('/me/current', authenticate, CurrentGymCOntroller);
router.get('/me/current', authenticate, getCurrentGymCOntroller);
router.get('/private', authenticate, getPrivateController);

router.get('/:id', authenticate, getGymByIdController);

export default router;