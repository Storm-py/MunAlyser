import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { addScrapingJob } from "../queue/producer.js";

const jobHunt=asyncHandler(async(req,res)=>{
    const {role,location}=req.body;

    if(!role || !location) throw new ApiError(400,"Role and Location are required");

    const job = addScrapingJob({role,location})


    console.log(`🎯 [API] Job added: ${role} in ${location}`);

    res.status(202).json({
      status: 'queued',
      message: 'Job scraping started in background',
      jobId: job.id,
      data: { role, location }
    });

})



export {
    jobHunt
}
