import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrapeLinkedIn } from './scraper/linkedin.js';
import { Job } from './models/job.model.js';
import { User } from './models/user.model.js';
import { analyzeMatch } from './ai/gemini.js';
import connectDB from './db/index.js';

dotenv.config({ path: './.env' });
connectDB();

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log('🤖 MunAlyser Worker listening for jobs...');

const worker = new Worker('job-hunter-queue', async (job) => {
  const { role, location, userId, experienceLevel, isAuto } = job.data; 
  
  const jobType = isAuto ? "🤖 AUTO-PILOT" : "👤 MANUAL";
  console.log(`⚙️ [${jobType}] Processing Job ${job.id} for User ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) {
        console.warn(`⚠️ User ${userId} not found!`);
        return;
    }
    
    if (isAuto && !user.autoApplyEnabled) {
        console.log(`🛑 User disabled Auto-Pilot. Skipping.`);
        return; 
    }

    const resumeText = user?.parsedCv || user?.resumeText || ""; 
    const cookie = user?.linkedinCookie || ""; 

    const scrapedJobs = await scrapeLinkedIn(role, location, experienceLevel, cookie);
    console.log(`   ✅ Scraped ${scrapedJobs.length} raw jobs`);

    if (scrapedJobs.length > 0) {
      const finalJobs = [];

      for (const jobData of scrapedJobs) {
        
        let processedJob = { 
            ...jobData, 
            user: userId,
            experienceLevel: experienceLevel || "Any"
        };

        if (resumeText && jobData.description && jobData.description !== "Not Found") {
             console.log(`   🧠 Analyzing: ${jobData.title.substring(0, 20)}...`);
             const analysis = await analyzeMatch(resumeText, jobData.description);
             
             if (analysis) {
                processedJob.aiAnalysis = analysis;
                console.log(`      ⚖️ Score: ${analysis.matchScore}%`);
             }
             await sleep(4000); 
        }
        finalJobs.push(processedJob);
      }
      try {
        await Job.insertMany(finalJobs, { ordered: false });
        console.log(`   💾 Saved ${finalJobs.length} jobs.`);
      } catch (err) {
        if (err.code !== 11000) console.error('   ⚠️ DB Partial Error:', err.message);
      }
    }
    return { count: scrapedJobs.length };

  } catch (error) {
    console.error(`❌ Job ${job.id} Failed:`, error);
    throw error;
  }
}, { 
  connection: redisOptions,
  concurrency: 1
});