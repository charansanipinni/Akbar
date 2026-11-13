import { test, expect } from '@playwright/test';
test('all doors reveal their content, keyboard and touch return focus', async ({page}, info) => {
 await page.goto('/');
 for(const name of ['UltraEditX','OPCREATORLAB','Skills & Services','My Journey']) {
  const door=page.getByRole('button',{name:`Open ${name}`,exact:true});
  await door.scrollIntoViewIfNeeded();
  if(info.project.name==='mobile') await door.tap(); else {await door.focus();await page.keyboard.press('Enter');}
  await expect(page.locator('.project-gallery')).toBeFocused();
  await expect(page.locator('.project-heading h2')).toContainText(name);
  for(const section of ['home','about','journey','contact'])await expect(page.locator('#'+section)).toBeHidden();
  await expect(page.getByRole('navigation',{name:'Main navigation',exact:true})).toBeHidden();
  if(name==='UltraEditX'||name==='OPCREATORLAB')await expect(page.locator('.project-card')).toHaveCount(1);
  if(name==='Skills & Services')await expect(page.locator('.capabilities')).toBeVisible();
  if(name==='My Journey')await expect(page.locator('.project-gallery .story-timeline')).toBeVisible();
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  for(const section of ['home','about','journey','contact'])await expect(page.locator('#'+section)).toBeHidden();
  if(name==='UltraEditX'||name==='OPCREATORLAB') {await expect(page.locator('.project-visit')).toHaveAttribute('href',name==='UltraEditX'?'https://ultraeditx.vercel.app':'https://opcreatorlab.lovable.app');}
  if(info.project.name==='mobile') await page.getByRole('button',{name:'Back to the doors'}).tap(); else await page.keyboard.press('Escape');
  await expect(door).toBeFocused();
 }
});
test('navigation, theme, portrait and contact destinations',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('.portrait img')).toHaveJSProperty('complete',true);
 expect(await page.locator('.portrait img').evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Switch to pale red theme'}).click();await expect(page.locator('.portfolio')).toHaveClass('portfolio evening');
 await page.getByRole('button',{name:'Restore cream theme'}).click();
 for(const target of ['Work','About','Journey','Contact']){await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('link',{name:new RegExp(`^${target}`)}).click();await expect(page).toHaveURL(new RegExp(`#${target.toLowerCase()}$`));}
 await expect(page.getByRole('link',{name:'Let’s talk'})).toHaveAttribute('href','mailto:mdakbarhussain550@gmail.com');
 await expect(page.locator('a[href^="tel:"]')).toHaveAttribute('href','tel:+919347066720');
 await expect(page.getByRole('link',{name:'LinkedIn'})).toHaveAttribute('href','https://linkedin.com/in/mdakbarhussain');expect(errors).toEqual([]);
});
test('title cycles continuously without a pause button and respects reduced motion',async({page})=>{
 await page.goto('/'); const card=page.locator('.notebook');const width=await card.evaluate(e=>e.clientWidth);
 expect(width).toBeLessThanOrEqual(400);
 expect(await card.locator('.notebook-page > span').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await expect(card).toHaveAttribute('aria-label','Startup Founder',{timeout:6500});expect(await card.evaluate(e=>e.clientWidth)).toBe(width);
 await expect(card).toHaveAttribute('aria-label','Aspiring Developer',{timeout:6500});
 await expect(page.locator('.motion-toggle')).toHaveCount(0);
 await expect(page.locator('.notebook-page small,.door-number,.story-count,.nav .brand')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(4900);await expect(card).toHaveAttribute('aria-label','Aspiring Developer');
 const door=page.getByRole('button',{name:'Open UltraEditX',exact:true});await door.focus();await expect(door.locator('.door-leaf')).toHaveCSS('transform','none');
});
test('responsive pages have no overflow, reveal on scroll, and maintain 2 by 2 doors',async({page},info)=>{
 await page.goto('/');
 for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`).toBe(true);await page.getByRole('button',{name:'Open Skills & Services',exact:true}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Open Skills & Services',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'Back to the doors'}).click();}
 await page.setViewportSize({width:info.project.name==='mobile'?375:1440,height:1000});
 for(const el of await page.locator('.reveal').all()){await el.scrollIntoViewIfNeeded();await expect(el).toHaveClass(/revealed/);}
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);await page.screenshot({path:`test-results/akbar-${info.project.name}-full.png`,fullPage:true});
 expect(await page.locator('.doors').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(info.project.name==='mobile'?2:4);
});



