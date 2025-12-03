import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

async function scrapeLinkedIn(role, location) {
  console.log(`🕵️ [Scraper] Starting stealth search for: ${role} in ${location}`);

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

  
    const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await autoScroll(page);

    const basicJobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll("li");
      const data = [];
      jobNodes.forEach((node) => {
        const title = node.querySelector(".base-search-card__title")?.innerText.trim();
        const company = node.querySelector(".base-search-card__subtitle")?.innerText.trim();
        const location = node.querySelector(".job-search-card__location")?.innerText.trim();
        const link = node.querySelector("a.base-card__full-link")?.href;
        if (title && link) data.push({ title, company, location, link: link.split('?')[0] });
      });
      return data;
    });

    console.log(`📋 Found ${basicJobs.length} job cards. Starting Deep Scrape...`);

    
    const detailedJobs = [];
    const limit = 20; 

    for (let i = 0; i < Math.min(basicJobs.length, limit); i++) {
      const job = basicJobs[i];
      console.log(`🔍 [${i+1}/${limit}] Visiting: ${job.title}`);

      try {
        await page.goto(job.link, { waitUntil: "domcontentloaded", timeout: 30000 });
        
        
        try {
            const showMore = await page.$('.show-more-less-html__button--more');
            if (showMore) await showMore.click();
        } catch(e) {}

        const bodyClass = await page.evaluate(() => document.body.className);
        console.log(`    -> Page Body Classes: ${bodyClass}`);

       
        const description = await page.evaluate(() => {
            
            const mainContainer = document.querySelector(".show-more-less-html__markup");
            if (mainContainer) return mainContainer.innerText.trim();

            
            const decorated = document.querySelector(".decorated-job-posting__details");
            if (decorated) return decorated.innerText.trim();
            
            
            const descSection = document.querySelector("#job-details");
            if (descSection) return descSection.innerText.trim();

           
            const article = document.querySelector("article");
            if (article) return article.innerText.trim();

            return null;
        });

        if (description) {
            console.log(`    ✅ Description found (${description.substring(0, 30)}...)`);
            detailedJobs.push({ ...job, description });
        } else {
            console.error(`    ⚠️ NO DESCRIPTION FOUND. Taking snapshot...`);
            await page.screenshot({ path: `/app/error_no_desc_${i}.png`, fullPage: true });
            detailedJobs.push({ ...job, description: "Not Found" });
        }

        await delay(2000, 5000);

      } catch (err) {
        console.error(`    ❌ Navigation Error: ${err.message}`);
      }
    }

    await browser.close();
    return detailedJobs;

  } catch (error) {
    console.error("❌ [Scraper] Critical Error:", error);
    await browser.close();
    throw error;
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export { scrapeLinkedIn };