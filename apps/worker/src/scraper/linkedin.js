import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

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

    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`;


    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    
    await autoScroll(page);


    console.log("📸 Taking debug screenshot...");
    await page.screenshot({
      path: "/app/debug_linkedin.png",
      fullPage: true,
    });

    
    const jobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll("li"); 
      const results = [];

      jobNodes.forEach((node) => {
        const title = node.querySelector(".base-search-card__title")?.innerText.trim();
        const company = node.querySelector(".base-search-card__subtitle")?.innerText.trim();
        const location = node.querySelector(".job-search-card__location")?.innerText.trim();
        const link = node.querySelector("a.base-card__full-link")?.href;

        if (title && company && link) {
          results.push({ title, company, location, link });
        }
      });
      return results;
    });

    console.log(`✅ [Scraper] Found ${jobs.length} jobs.`);
    await browser.close();
    return jobs;

  } catch (error) {
    console.error("❌ [Scraper] Error:", error);
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