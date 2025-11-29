import {Worker} from 'bullmq';
import connectDB from "./db/index.js";
import { Job } from './models/job.model.js';
import { scrapeLinkedIn } from './scraper/linkedin.js';
import dotenv from 'dotenv'



dotenv.config({
    path:'./.env'
})


connectDB();

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
};


console.log('🤖 MunAlyser Worker listening for jobs...');

const worker = new Worker('job-hunter-queue', async (job) => {
  console.log(`⚙️ Processing Job ${job.id}: ${job.data.role} in ${job.data.location}`);

 
  const scrapedJobs = await scrapeLinkedIn(job.data.role, job.data.location);

  
  if (scrapedJobs.length > 0) {
    try {
      
      await Job.insertMany(scrapedJobs, { ordered: false }); 
      console.log(`💾 Saved ${scrapedJobs.length} jobs to MongoDB.`);
    } catch (err) {
      
      if (err.code !== 11000) console.error('DB Error:', err);
    }
  }

  return { count: scrapedJobs.length };

}, { 
  connection: redisOptions,
  concurrency: 1
});