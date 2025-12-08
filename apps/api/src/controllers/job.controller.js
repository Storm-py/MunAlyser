import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { addScrapingJob } from "../queue/producer.js";
import {Job} from "../models/job.model.js";
import { removeScheduledJob } from "../queue/producer.js";

const jobHunt=asyncHandler(async(req,res)=>{

    const {role,location,experienceLevel}=req.body;

    const userId=req.user._id;

    if(!userId) throw new ApiError(400,"User not found");

    if(!role || !location) throw new ApiError(400,"Role and Location are required");

    const job = addScrapingJob({role,location, userId, experienceLevel})


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
const getJobStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Job.aggregate([
    { 
      $match: { user: userId }
    },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        applied: { 
          $sum: { $cond: [{ $eq: ["$applicationStatus", "applied"] }, 1, 0] } 
        },
        interviewing: { 
          $sum: { $cond: [{ $eq: ["$applicationStatus", "interviewing"] }, 1, 0] } 
        },
        highMatches: { 
          $sum: { $cond: [{ $gte: ["$aiAnalysis.matchScore", 74] }, 1, 0] } 
        }
      }
    }
  ]);

  const defaultStats = { totalJobs: 0, applied: 0, interviewing: 0, highMatches: 0 };
  
  return res.status(200).json(
    new ApiResponse(200, stats[0] || defaultStats, "Stats fetched successfully")
  );
});
const scheduleHunt = asyncHandler(async (req, res) => {
  const { role, location, experienceLevel } = req.body;
  const userId = req.user?._id;

  if (!role || !location) {
    throw new ApiError(400, "Role and Location are required for auto-pilot");
  }

  const ONE_DAY = 24 * 60 * 60 * 1000;
  await addScrapingJob(
    { role, location, userId, experienceLevel }, 
    { every: ONE_DAY }
  );

  req.user.autoApplyEnabled = true;
  await req.user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {}, "Auto-Pilot activated! I will hunt every 24 hours.")
  );
});
const stopSchedule = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  await removeScheduledJob(userId);  
  req.user.autoApplyEnabled = false;
  await req.user.save({ validateBeforeSave: false });
  return res.status(200).json(
    new ApiResponse(200, {}, "Auto-Pilot deactivated.")
  );
});
export {
  jobHunt,
  JobsList,
  getJobStats,
  scheduleHunt,
  stopSchedule
}
