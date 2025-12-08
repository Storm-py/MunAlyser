import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateCoverLetter = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const user = req.user;

  if (!jobId) throw new ApiError(400, "Job ID is required");
  if (!user.parsedCv) throw new ApiError(400, "Please upload your resume first");

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  try {

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `
      You are a professional career coach. Write a tailored Cover Letter for the following candidate and job.
      
      CANDIDATE RESUME:
      ${user.parsedCv.substring(0, 5000)}
      
      JOB DESCRIPTION:
      ${job.description.substring(0, 5000)}
      
      Requirements:
      - Tone: Professional, confident, and enthusiastic.
      - Highlight specific skills from the resume that match the job.
      - Keep it under 300 words.
      - Return ONLY the letter text, no conversational filler.
    `;

    const result = await model.generateContent(prompt);
    const letter = result.response.text();

    job.coverLetter = letter;
    await job.save();
    
    res.status(200).json(
        new ApiResponse(200, { letter }, "Cover letter generated successfully")
    );

  } catch (error) {
    throw new ApiError(500, "AI generation failed: " + error.message);
  }
});