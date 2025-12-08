import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from 'fs';
import axios from 'axios';
import path from 'path';

const stealth = StealthPlugin();
puppeteer.use(stealth);

const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

async function downloadResume(url) {
    try {
        const tempPath = path.resolve('/app/temp_resume.pdf');
        const writer = fs.createWriteStream(tempPath);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempPath));
            writer.on('error', reject);
        });
    } catch (e) {
        console.error("❌ Failed to download resume for application:", e.message);
        return null;
    }
}

async function loginToLinkedIn(page, cookie) {
    if (!cookie) {
        console.log("👤 No cookie provided. Continuing as Guest.");
        return;
    }
    console.log("🔓 Injecting LinkedIn Session Cookie...");
    await page.setCookie({
        name: "li_at",
        value: cookie,
        domain: ".linkedin.com",
        path: "/",
    });
    
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    console.log("✅ Successfully Logged In!");
}


async function applyToJob(page, resumePath) {
    try {
        console.log("   🚀 Attempting Auto-Apply...");

        const applyBtn = await page.$('.jobs-apply-button--top-card');
        
        if (!applyBtn) {
            console.log("   ⚠️ No Apply button found (or already applied).");
            return "Skipped";
        }

        const btnText = await page.evaluate(el => el.innerText, applyBtn);
        if (!btnText.toLowerCase().includes('easy apply')) {
            console.log("   ⚠️ Job requires external application. Skipping.");
            return "External";
        }

        await applyBtn.click();
        await delay(2000, 4000);

        for (let step = 0; step < 5; step++) {
            
            
            const submitBtn = await page.$('button[aria-label="Submit application"]');
            if (submitBtn) {
                console.log("   ✅ Found Submit button! Sending application...");
                await submitBtn.click();
                await delay(3000, 5000); 
                
               
                try { await page.click('button[aria-label="Dismiss"]'); } catch(e){}
                return "Applied";
            }

            const reviewBtn = await page.$('button[aria-label="Review your application"]');
            if (reviewBtn) {
                await reviewBtn.click();
                await delay(1000, 2000);
                continue;
            }

            const nextBtn = await page.$('button[aria-label="Continue to next step"]');
            if (nextBtn) {

                const uploadInput = await page.$('input[type="file"]');
                if (uploadInput && resumePath) {
                    console.log("   📄 Uploading Resume...");
                    await uploadInput.uploadFile(resumePath);
                    await delay(2000, 3000);
                }


                await nextBtn.click();
                await delay(1000, 2000);
                continue;
            }

            const error = await page.$('.artdeco-inline-feedback--error');
            if (error) {
                console.log("   ❌ Form validation error. Cannot proceed.");
                return "Failed: Form Error";
            }

            break;
        }

        return "Failed: Unknown State";

    } catch (e) {
        console.error("   ❌ Apply Logic Crashed:", e.message);
        return "Error";
    }
}

async function scrapeLinkedIn(role, location, experienceLevel = "", linkedinCookie = "", resumeUrl = "") {
  console.log(`🕵️ [Scraper] Starting search for: ${role} in ${location}`);

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
      "--disable-blink-features=AutomationControlled"
    ],
    executablePath: "/usr/bin/google-chrome-stable",
  });
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let resumePath = null;
    if (resumeUrl) {
        resumePath = await downloadResume(resumeUrl);
    }

    await loginToLinkedIn(page, linkedinCookie);

    let searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`;


    console.log(`   🔗 URL: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await autoScrollWithLoadMore(page);


    try {
        await page.waitForSelector('.scaffold-layout__list-container, .jobs-search-results-list', { timeout: 15000 });
    } catch(e) {
        console.log("   ⚠️ List container not found immediately. Page might be empty or loading slowly.");
    }
    
    const basicJobs = await page.evaluate(() => {
      const data = [];
      const TITLE_BLOCKLIST = ["senior", "lead", "principal", "manager", "architect"];

      let listItems = document.querySelectorAll(".scaffold-layout__list-container li");

      if (listItems.length === 0) listItems = document.querySelectorAll(".jobs-search-results__list-item");
      if (listItems.length === 0) listItems = document.querySelectorAll("li");
      
      listItems.forEach((node) => {
        const titleEl = node.querySelector(".job-card-list__title") || 
                        node.querySelector(".base-search-card__title") || 
                        node.querySelector(".artdeco-entity-lockup__title") ||
                        node.querySelector("strong"); 

        const linkEl = node.querySelector("a.job-card-container__link") || 
                       node.querySelector("a.base-card__full-link") ||
                       node.querySelector("a.job-card-list__title"); // Often the title is the link

        const companyEl = node.querySelector(".job-card-container__primary-description") || 
                          node.querySelector(".base-search-card__subtitle") ||
                          node.querySelector(".artdeco-entity-lockup__subtitle");

        const locEl = node.querySelector(".job-card-container__metadata-item") || 
                      node.querySelector(".job-search-card__location");

        const title = titleEl?.innerText.trim();
        const link = linkEl?.href;
        const company = companyEl?.innerText.trim();
        const location = locEl?.innerText.trim();

        if (title && link) {
            const isBlocked = TITLE_BLOCKLIST.some(badWord => title.toLowerCase().includes(badWord));
            if (!isBlocked) {
                 const cleanLink = link.split('?')[0];
                 data.push({ title, company, location, link: cleanLink });
            }
        }
      });
      return data;
    });

    console.log(`📋 Found ${basicJobs.length} jobs. Starting Detail Scrape & Apply...`);

    const detailedJobs = [];
    for (let i = 0; i < Math.min(basicJobs.length, 10); i++) {
      const job = basicJobs[i];
      console.log(`🔍 [${i+1}] Processing: ${job.title}`);

      try {
        await page.goto(job.link, { waitUntil: "domcontentloaded", timeout: 30000 });

        try {
             await page.waitForSelector('.jobs-description__content, #job-details, .jobs-box__html-content', { timeout: 5000 });
        } catch(e) {}

        try {
            const expandBtn = await page.$('button[aria-label*="Click to see more description"]'); 
            if(expandBtn) await expandBtn.click();
            else {
                 const altBtn = await page.$('.jobs-description__footer-button');
                 if(altBtn) await altBtn.click();
            }
        } catch(e) {}

        const description = await page.evaluate(() => {
            const selectors = [
                ".jobs-description__content",      
                ".jobs-box__html-content",         
                "#job-details",                    
                ".jobs-description-content__text", 
                ".show-more-less-html__markup",    
                "article"                          
            ];
            
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.length > 50) { 
                    return el.innerText.trim();
                }
            }
            return "Description not found";
        });

        let applicationStatus = "scraped";

        if (description) {
           const status = await applyToJob(page, resumePath);
           if (status === "Applied") applicationStatus = "applied";
        }

        detailedJobs.push({ 
            ...job, 
            description, 
            applicationStatus 
        });

        await delay(3000, 8000);

      } catch (err) {
        console.error(`⚠️ Error processing job:`, err.message);
      }
    }

    await browser.close();
    if (resumePath && fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
    
    return detailedJobs;

  } catch (error) {
    console.error("❌ Critical Error:", error);
    await page.screenshot({ path: 'linkedin_error.png' });
    await browser.close();
    throw error;
  }
}

async function autoScrollWithLoadMore(page) {
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