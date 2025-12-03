import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { addScrapingJob } from "../queue/producer.js";
import {Job} from "../models/job.model.js";

const jobHunt=asyncHandler(async(req,res)=>{

    const {role,location}=req.body;

    const userId=req.user._id;

    if(!userId) throw new ApiError(400,"User not found");

    if(!role || !location) throw new ApiError(400,"Role and Location are required");

    const job = addScrapingJob({role,location, userId})


    console.log(`🎯 [API] Job added: ${role} in ${location}`);

    res.status(202).json({
      status: 'queued',
      message: 'Job scraping started in background',
      jobId: job.id,
      data: { role, location }
    });

})



const JobsList= asyncHandler(async(req,res)=>{
  
  const user=req.user._id;

  if(!user) throw new ApiError(400,"User not found")

  const jobs=await Job.find({user})

  if(!jobs) throw new ApiError(404,"No jobs found")
  
  res.status(200).json(
     new ApiResponse(200,jobs,"Jobs fetched successfully")
)
})

export {
  jobHunt,
  JobsList
}
