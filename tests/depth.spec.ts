import {test,expect} from '@playwright/test';

test('portrait follows a mouse and resets; reduced motion disables depth',async({page},info)=>{
 test.skip(info.project.name==='mobile','Mouse-only enhancement');
 await page.goto('/');const portrait=page.locator('.portrait-depth');await portrait.scrollIntoViewIfNeeded();const r=(await portrait.boundingBox())!;
 await page.mouse.move(r.x+r.width*.8,r.y+r.height*.3);
 await expect.poll(()=>portrait.evaluate(e=>Number(getComputedStyle(e).getPropertyValue('--pointer-x')))).toBeGreaterThan(.4);
 await page.mouse.move(5,5);
 await expect.poll(()=>portrait.evaluate(e=>Math.abs(Number(getComputedStyle(e).getPropertyValue('--pointer-x'))))).toBeLessThan(.01);
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(r.x+r.width*.8,r.y+r.height*.3);
 await expect(page.locator('.portrait-person')).toHaveCSS('transform','none');
});

test('door cut completes and expanded preview traps focus and returns it',async({page},info)=>{
 await page.goto('/');const door=page.getByRole('button',{name:'Open UltraEditX',exact:true});await door.scrollIntoViewIfNeeded();
 if(info.project.name==='mobile')await door.tap();else await door.click();
 await expect(page.locator('.door-cut')).toHaveCount(1);
 await expect(page.locator('.door-cut')).toHaveCount(0,{timeout:3500});
 await page.getByRole('button',{name:'Open UltraEditX folder'}).click();
 const expand=page.getByRole('button',{name:'Expand UltraEditX preview'});await expand.click();
 await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('button',{name:'Close preview'})).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(page.getByRole('link',{name:'Visit the live website'})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(expand).toBeFocused();
 await expect(page.locator('body')).not.toHaveCSS('overflow','hidden');
 await page.getByRole('button',{name:'Back to the doors'}).click();await expect(door).toBeFocused();
 await page.emulateMedia({reducedMotion:'reduce'});await door.click();await expect(page.locator('.project-gallery')).toBeVisible();await expect(page.locator('.door-cut')).toHaveCount(0);
});
