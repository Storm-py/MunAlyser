import { Queue } from 'bullmq';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
};

const jobQueue = new Queue('job-hunter-queue', {
  connection: redisOptions
});

export const addScrapingJob = async (data, schedule = null) => {
  const opts = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
  };
  if (schedule) {
    opts.jobId = `auto-hunt-${data.userId}`; 
    opts.repeat = schedule;
  }

  const job = await jobQueue.add('scrape-linkedin', data, opts);
  return job;
};

export const removeScheduledJob = async (userId) => {
    
    const repeatConfig = { every: 24 * 60 * 60 * 1000 }; 
    
   
    await jobQueue.removeRepeatable('scrape-linkedin', repeatConfig, `auto-hunt-${userId}`);
    return true;
};