import { Router } from "express";
import { jobHunt, JobsList,getJobStats,scheduleHunt,stopSchedule } from "../controllers/job.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();


router.route('/hunt').post(verifyJWT, jobHunt);
router.route('/jobList').get(verifyJWT , JobsList);
router.route('/scheduleHunt').post(verifyJWT, scheduleHunt);
router.route('/stats').get(verifyJWT,getJobStats);
router.route('/stopSchedule').post(verifyJWT, stopSchedule);


export default router;