import { Router } from "express"
import {searchGymsController} from "./gym.controller"
import { authenticate } from "../../middleware/authenticate";
import {getGymByIdController} from "./gym.controller";
import {getALLEquipController} from "./gym.controller"
import {createGymController} from "./gym.controller"



const router = Router();


router.get('/search', authenticate, searchGymsController);
router.get('/equip', authenticate, getALLEquipController);
router.get('/:id', authenticate, getGymByIdController);
router.post('/', authenticate, createGymController);

export default router;