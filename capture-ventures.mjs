import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const [name,url] of [['ultraeditx','https://ultraeditx.vercel.app'],['opcreatorlab','https://opcreatorlab.lovable.app']]) {
 const page=await browser.newPage({viewport:{width:1280,height:850},deviceScaleFactor:1});
 try { await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000}); await page.waitForTimeout(4000); await page.screenshot({path:`public/${name}-preview.png`}); console.log(name,await page.title()); } catch(e) {console.log(name,e.message);}
 await page.close();
}
await browser.close();

