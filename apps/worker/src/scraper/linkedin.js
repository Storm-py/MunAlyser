import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

const EXPERIENCE_CODES = {
  "internship": "1",
  "entry": "2",
  "associate": "3",
  "mid-senior": "4",
  "director": "5"
};


async function scrapeLinkedIn(role, location, experienceLevel = "entry") {
  console.log(`🕵️ [Scraper] Searching: ${role} in ${location} (${experienceLevel || "Any Level"})`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
    executablePath: "/usr/bin/google-chrome-stable",
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

   
    let searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`;
    
   
    if (experienceLevel && EXPERIENCE_CODES[experienceLevel.toLowerCase()]) {
      searchUrl += `&f_E=${EXPERIENCE_CODES[experienceLevel.toLowerCase()]}`;
    }

    console.log(`   🔗 URL: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

    
    await autoScrollWithLoadMore(page);

    
    const basicJobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll("li");
      const data = [];

      jobNodes.forEach((node) => {
        const title = node.querySelector(".base-search-card__title")?.innerText.trim();
        const company = node.querySelector(".base-search-card__subtitle")?.innerText.trim();
        const location = node.querySelector(".job-search-card__location")?.innerText.trim();
        const link = node.querySelector("a.base-card__full-link")?.href;

        if (title && link) {
          data.push({ title, company, location, link: link.split('?')[0] });
        }
      });
      return data;
    });

    console.log(`📋 Found ${basicJobs.length} potential jobs. Processing top results...`);

    const detailedJobs = [];
    const limit = 5; 

    for (let i = 0; i < Math.min(basicJobs.length, limit); i++) {
        const job = basicJobs[i];
        try {
            await page.goto(job.link, { waitUntil: "domcontentloaded", timeout: 30000 });
            try {
                const showMore = await page.$('.show-more-less-html__button--more');
                if (showMore) await showMore.click();
            } catch(e) {}

            const description = await page.evaluate(() => {
                const selectors = [".show-more-less-html__markup", ".decorated-job-posting__details", "article"];
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el) return el.innerText.trim();
                }
                return "Not Found";
            });

            detailedJobs.push({ ...job, description });
            await delay(2000, 5000); 

        } catch (err) {
            console.error(`   ⚠️ Skipping job: ${err.message}`);
        }
    }

    await browser.close();
    return detailedJobs;

  } catch (error) {
    console.error("❌ [Scraper] Failed:", error);
    await browser.close();
    throw error;
  }
}


async function autoScrollWithLoadMore(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const maxScrolls = 50; 
            let scrolls = 0;

            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;

                
                if (scrolls % 10 === 0) {
                    const button = document.querySelector('button[aria-label="See more jobs"]');
                    if (button) button.click();
                }

                if (totalHeight >= scrollHeight || scrolls > maxScrolls) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

export { scrapeLinkedIn };