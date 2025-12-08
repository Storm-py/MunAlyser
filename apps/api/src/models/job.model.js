import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      unique: true,
    },
    source: {
      type: String,
      default: "LinkedIn",
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
    aiAnalysis: {
      matchScore: Number,
      summary: String,
      missingSkills: [String],
      status: String,
    },
    experienceLevel: {
      type: String,
      default: "Any",
    },
    coverLetter:{
        type:String,
        default:""
    },
    datePosted: String,
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);
