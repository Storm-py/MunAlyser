import { Router } from "express";
import { jobHunt, JobsList } from "../controllers/job.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();


router.route('/hunt').post(verifyJWT, jobHunt);
router.route('/jobList').get(verifyJWT , JobsList);


export default router;