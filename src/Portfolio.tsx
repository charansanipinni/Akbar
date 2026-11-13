import { useEffect, useRef, useState } from 'react';
import { profile as c } from './content';
import './redesign.css';
import { Portrait, ProjectVisual, PreviewDialog, Journey } from './Depth';
import './cinematic.css';
import './evening-theme.css';
import { RevealFooter } from './RevealFooter';
import { ModernNavbar } from './ModernNavbar';
import { ParticleName } from './ParticleName';
import { LiquidGlassLink } from './LiquidGlassLink';
import './glass-components.css';
export default function Portfolio() {
 const [title,setTitle]=useState(0), [flip,setFlip]=useState(false), [selected,setSelected]=useState<string|null>(null), [opening,setOpening]=useState<string|null>(null), [dark,setDark]=useState(false);
 const [preview,setPreview]=useState<typeof c.projects[number]|null>(null);
 const [cut,setCut]=useState<{top:number;right:number;bottom:number;left:number;name:string}|null>(null);
 const cutTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const detail=useRef<HTMLDivElement>(null), lastDoor=useRef(''), timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>setReduced(m.matches); m.addEventListener('change',update); return ()=>m.removeEventListener('change',update);},[]);
 useEffect(()=>{if(reduced){setFlip(false);return;} let timeout:ReturnType<typeof setTimeout>; const interval=setInterval(()=>{setFlip(true);timeout=setTimeout(()=>{setTitle(i=>(i+1)%c.titles.length);setFlip(false);},400);},4400);return()=>{clearInterval(interval);clearTimeout(timeout);};},[reduced]);
 useEffect(()=>()=>{clearTimeout(timer.current);clearTimeout(cutTimer.current);},[]);
 useEffect(()=>{const o=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');o.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>o.observe(el));return()=>o.disconnect();},[selected]);
 useEffect(()=>{if(selected){detail.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}},[selected,reduced]);
 function openDoor(id:string){
  if(opening)return;lastDoor.current=id;
  if(reduced){setSelected(id);return;}
  const rect=document.getElementById('door-'+id)?.getBoundingClientRect();
  if(rect)setCut({top:Math.max(0,rect.top),right:Math.max(0,innerWidth-rect.right),bottom:Math.max(0,innerHeight-rect.bottom),left:Math.max(0,rect.left),name:c.categories.find(d=>d.id===id)?.name||''});
  setOpening(id);
  timer.current=setTimeout(()=>{setSelected(id);},900);
  cutTimer.current=setTimeout(()=>{setOpening(null);setCut(null);},1400);
 }
 function back(){clearTimeout(timer.current);clearTimeout(cutTimer.current);setOpening(null);setCut(null);setSelected(null);requestAnimationFrame(()=>document.getElementById(`door-${lastDoor.current}`)?.focus());}
 const category=c.categories.find(x=>x.id===selected),project=c.projects.find(x=>x.id===selected);
 const journey=<Journey/>;
 return <div className={`portfolio${dark ? ' evening' : ''}${selected ? ' door-view' : ''}`}><a className="skip-link" href="#main">Skip to content</a><ModernNavbar hidden={Boolean(selected)}/><main id="main">
 <section id="home" hidden={Boolean(selected)} className="hero shell"><div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> A CURIOUS MIND. A BUILDER AT HEART.</p><h1>Hi, I’m <ParticleName reduced={reduced} evening={dark}/><br/><span className="muted-title">I am {title === 0 ? 'an' : 'a'}</span></h1><div className={`notebook ${flip?'page-turn':''}`} aria-label={c.titles[title]}><div className="notebook-rings" aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i}/>)}</div><div className="notebook-page"><span>{c.titles[title]}</span></div></div><p className="hero-description">{c.intro}</p><div className="hero-actions"><LiquidGlassLink href="#contact">Let’s connect</LiquidGlassLink><a className="text-link" href="#work">See my work ↘</a></div><p className="hero-note">STUDENT BY DAY. BUILDER BY INSTINCT.</p></div><Portrait reduced={reduced} active={!selected}/><button className="light-cord" onClick={()=>setDark(v=>!v)} aria-label={dark?'Restore cream theme':'Switch to evening theme'} aria-pressed={dark}><span/><i/><small>PULL FOR A CHANGE</small></button><div className="hero-bottom"><span>OPEN TO IDEAS & COLLABORATIONS</span><span>CODE · CREATE · BUILD</span><a href="#work">SCROLL TO EXPLORE ↓</a></div></section>
 <div className="intro-strip" hidden={Boolean(selected)}><span>COMPUTER SCIENCE STUDENT</span><i>✳</i><span>STARTUP FOUNDER</span><i>✳</i><span>ASPIRING DEVELOPER</span><i>✳</i><span>ALWAYS LEARNING</span></div>
 <section id="work" className="work-section"><div className="shell">{!selected?<div className="door-gallery"><div className="work-heading reveal"><h2>Magic happens behind the <em>doors.</em></h2><p>Ventures, ideas, and everything in between.<br/>Pick a door. Get to know my world.</p></div><div className="doors">{c.categories.map((d,i)=><div className={`door-unit ${d.color} reveal`} style={{transitionDelay:`${i*90}ms`}} key={d.id}><button id={`door-${d.id}`} className={`door-frame ${opening===d.id?'opening':''}`} aria-label={`Open ${d.name}`} onClick={()=>openDoor(d.id)}><span className="door-inside" aria-hidden="true"><span>✳</span><small>COME ON IN</small></span><span className="door-leaf"><span className="door-arch-line"/><span className="door-hinges"/><span className="door-panel"/><span className="nameplate">{d.name}</span><span className="door-handle"/><span className="door-keyhole"/><span className="door-bottom-panel"/></span></button><div className="door-label"><span>{d.name}</span><span>↗</span></div></div>)}</div><p className="door-hint">↳ A little curiosity opens a lot of doors.</p></div>:<div ref={detail} className="project-gallery" tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape')back();}}><button className="back-button" onClick={back}>← Back to the doors</button><div className="project-heading"><h2>{category?.name}<span>.</span></h2><p>{category?.caption}</p></div>{project&&<article className={`project-card ${project.accent}`}><div className="project-copy"><span className="sample-badge">{project.label}</span><p className="project-name">{project.name}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p><div className="tool-tags">{project.tags.map(t=><span key={t}>{t}</span>)}</div><LiquidGlassLink className="project-visit" href={project.url} target="_blank" rel="noreferrer">Explore {project.name}</LiquidGlassLink></div><ProjectVisual project={project} reduced={reduced} onExpand={()=>setPreview(project)}/></article>}{selected==='skills'&&<div className="capabilities"><div><span className="eyebrow">SKILLS & EXPERTISE</span><h3>Curiosity is my<br/><em>favourite tool.</em></h3><div className="skill-cloud">{c.skills.map(s=><span key={s}>{s}</span>)}</div></div><div className="services"><span className="eyebrow">AREAS I’M WORKING IN</span>{c.services.map(s=><p key={s}>{s}<span>↗</span></p>)}</div></div>}{selected==='journey'&&journey}</div>}</div></section>
 <section id="about" hidden={Boolean(selected)} className="about-section shell reveal"><div><p className="eyebrow">THE PERSON BEHIND THE IDEAS</p><h2>A little code.<br/>A lot of <em>curiosity.</em></h2><span className="about-location">↗ {c.contact.location}</span></div><div className="about-copy"><span className="about-star" aria-hidden="true">✳</span><p>{c.bio}</p><p className="bio-more">{c.bioMore}</p><div className="about-tools"><span className="eyebrow">MY MINDSET</span><div className="tool-tags"><span>Learn by doing</span><span>Build with purpose</span><span>Stay curious</span></div></div></div></section>
 <section id="journey" hidden={Boolean(selected)} className="journey-section"><div className="shell">{journey}<div className="achievement-block reveal"><p className="eyebrow">MILESTONES ALONG THE WAY</p><div className="achievement-grid">{c.achievements.map(a=><article key={a}><h3>{a}</h3></article>)}</div></div></div></section>

 </main><RevealFooter hidden={Boolean(selected)} reduced={reduced}/>{cut&&!reduced&&<div className="door-cut" aria-hidden="true" style={{'--cut-top':cut.top+'px','--cut-right':cut.right+'px','--cut-bottom':cut.bottom+'px','--cut-left':cut.left+'px'} as import('react').CSSProperties}><span><small>STEP INSIDE</small>{cut.name}</span></div>}{preview&&<PreviewDialog project={preview} onClose={()=>setPreview(null)}/>}</div>;
}






