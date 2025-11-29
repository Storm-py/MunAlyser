import { Router } from "express";
import { jobHunt } from "../controllers/job.controller.js";

const router = Router();


router.route('/hunt').post(jobHunt);


export default router;