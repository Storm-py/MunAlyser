import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { scrapeLinkedIn } from './scraper/linkedin.js';
import { Job } from './models/job.model.js'; 
import connectDB from './db/index.js'; 

dotenv.config({ path: './.env' });


connectDB();

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
};

console.log('🤖 MunAlyser Worker listening for jobs...');

const worker = new Worker('job-hunter-queue', async (job) => {
  
  const { role, location, userId } = job.data; 
  
  console.log(`⚙️ Processing Job ${job.id} for User ${userId}: ${role} in ${location}`);

  try {
    
    const scrapedJobs = await scrapeLinkedIn(role, location);
    console.log(`   ✅ Scraped ${scrapedJobs.length} raw jobs`);

    if (scrapedJobs.length > 0) {
     
      const jobsWithUser = scrapedJobs.map(jobData => ({
        ...jobData,
        user: userId 
      }));

      try {
        await Job.insertMany(jobsWithUser, { ordered: false });
        console.log(`   💾 Saved ${jobsWithUser.length} jobs for User ${userId} to MongoDB.`);
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