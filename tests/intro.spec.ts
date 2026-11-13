import {test,expect} from '@playwright/test';

test.use({launchOptions:{args:['--autoplay-policy=no-user-gesture-required']}});

test('every reload and fresh visit starts a new audible introduction',async({page})=>{
 await page.goto('/');
 for(const visit of ['arrival','reload','return']){
  if(visit==='reload')await page.reload();
  if(visit==='return'){await page.goto('about:blank');await page.goto('/');}
  const video=page.locator('.portrait-video');
  await expect(video).toBeVisible();
  await expect(video).toHaveJSProperty('muted',false);
  await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.2);
  await video.evaluate((el:HTMLVideoElement)=>{el.currentTime=el.duration-.2;});
  await expect(video).toBeHidden();
 }
});

test('blocked introduction retries on the first interaction only',async({page})=>{
 await page.addInitScript(()=>{
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
   this.dataset.playCalls=String(Number(this.dataset.playCalls||0)+1);
   if(!navigator.userActivation.isActive)return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));
   return play.call(this);
  };
 });
 await page.goto('/');
 const video=page.locator('.portrait-video');
 await expect(video).toHaveAttribute('data-play-calls','1');
 await expect(page.getByRole('button',{name:'Meet Akbar',exact:true})).toBeVisible();
 await page.getByRole('heading',{level:1}).click();
 await expect(video).toBeVisible();
 await expect(video).toHaveAttribute('data-play-calls','2');
 await video.evaluate((el:HTMLVideoElement)=>{el.currentTime=el.duration-.2;});
 await expect(video).toBeHidden();
 await page.getByRole('heading',{level:1}).click();
 await expect(video).toHaveAttribute('data-play-calls','2');
});

test('introduction plays once on arrival and Meet Akbar is available afterward',async({page})=>{
 await page.addInitScript(()=>{
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
   this.dataset.playCalls=String(Number(this.dataset.playCalls||0)+1);
   return play.call(this);
  };
 });
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const video=page.locator('.portrait-video');
 const replay=page.getByRole('button',{name:'Meet Akbar',exact:true});
 await expect(video).toBeVisible();
 await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.currentTime)).toBeGreaterThan(.3);
 await expect(video).toHaveAttribute('data-play-calls','1');
 await expect(replay).toBeHidden();
 await expect(page.getByText('AI-GENERATED INTRO',{exact:true})).toHaveCount(0);
 await video.evaluate((el:HTMLVideoElement)=>{el.currentTime=el.duration-.3;});
 await expect(video).toBeHidden();
 await expect(replay).toBeVisible();
 await expect(replay).toHaveAccessibleDescription('I am MD AKBAR HUSSAIN. This is my portfolio website.');
 await page.getByRole('button',{name:'Switch to evening theme'}).click();
 await expect(video).toHaveAttribute('data-play-calls','1');
 await replay.click();
 await expect(video).toBeVisible();
 await expect(video).toHaveAttribute('data-play-calls','2');
 await page.getByRole('button',{name:'Open UltraEditX',exact:true}).click();
 await expect(page.locator('.project-gallery')).toBeVisible();
 await page.getByRole('button',{name:'Back to the doors'}).click();
 await expect(video).toHaveJSProperty('paused',true);
 await expect(video).toHaveAttribute('data-play-calls','2');
});

test('blocked autoplay keeps the portrait and Meet Akbar starts the introduction',async({page})=>{
 await page.addInitScript(()=>{
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
   if(!navigator.userActivation.isActive)return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));
   return play.call(this);
  };
 });
 await page.goto('/');
 const video=page.locator('.portrait-video');
 await expect(video).toHaveJSProperty('paused',true);
 await expect(page.locator('.portrait-person img')).toBeVisible();
 await expect(page.getByRole('status')).toHaveCount(0);
 await page.getByRole('button',{name:'Meet Akbar',exact:true}).click();
 await expect(video).toBeVisible();
 await expect(video).toHaveJSProperty('paused',false);
});

test('failed media keeps the portrait, reports the problem, and allows retry',async({page})=>{
 await page.route('**/akbar-intro.mp4',route=>route.abort());
 await page.goto('/');
 await expect(page.getByRole('status')).toHaveText('Playback unavailable. Please try again.');
 await expect(page.locator('.portrait-person img')).toBeVisible();
 await page.unroute('**/akbar-intro.mp4');
 await page.getByRole('button',{name:'Meet Akbar',exact:true}).click();
 await expect(page.locator('.portrait-video')).toBeVisible();
 await expect(page.getByRole('status')).toHaveCount(0);
});
