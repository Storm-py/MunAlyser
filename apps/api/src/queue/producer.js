import { Queue } from 'bullmq';


const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
};

const jobQueue = new Queue('job-hunter-queue', {
  connection: redisOptions
});


export const addScrapingJob = async (data) => {
  const job = await jobQueue.add('scrape-linkedin', data, {
    attempts: 3,             
    backoff: {
      type: 'exponential',
      delay: 5000            
    },
    removeOnComplete: true, 
    removeOnFail: false
  });
  
  return job;
};