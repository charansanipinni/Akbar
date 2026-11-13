import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const b=await chromium.launch();const request=await b.newContext();await fs.mkdir('public/fonts',{recursive:true});
const url='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap';
let css=await (await request.request.get(url)).text();let i=0;for(const match of [...css.matchAll(/url\((https[^)]+)\)/g)]){const path=`/fonts/font-${i++}.woff2`;const r=await request.request.get(match[1]);await fs.writeFile(`public${path}`,await r.body());css=css.replace(match[1],path);}await fs.writeFile('public/fonts/fonts.css',css);console.log('Saved local fonts',i);await b.close();
