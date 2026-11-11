import { Router } from "express"
import {searchGymsController} from "./gym.controller"
import { authenticate } from "../../middleware/authenticate";
import {getGymByIdController} from "./gym.controller";
const router = Router();

router.get('/search', authenticate, searchGymsController);
router.get('/:id', authenticate, getGymByIdController);

export default router;