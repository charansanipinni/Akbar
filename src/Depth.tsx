import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { profile } from './content';

// Animate only while the pointer is moving or the spring is settling.
export function useDepth(disabled = false) {
 const ref = useRef<HTMLElement | null>(null);
 const frame = useRef(0);
 const current = useRef({ x: 0, y: 0 });
 const target = useRef({ x: 0, y: 0 });
 function tick() {
  const p=current.current, t=target.current;
  p.x+=(t.x-p.x)*.12; p.y+=(t.y-p.y)*.12;
  ref.current?.style.setProperty('--pointer-x',p.x.toFixed(4));
  ref.current?.style.setProperty('--pointer-y',p.y.toFixed(4));
  if(Math.abs(t.x-p.x)+Math.abs(t.y-p.y)>.001) frame.current=requestAnimationFrame(tick);
  else frame.current=0;
 }
 function start(){if(!frame.current)frame.current=requestAnimationFrame(tick);}
 function move(e:PointerEvent<HTMLElement>){
  if(disabled || e.pointerType!=='mouse')return;
  const r=e.currentTarget.getBoundingClientRect();
  target.current={x:Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y:Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))};start();
 }
 function reset(){target.current={x:0,y:0};start();}
 useEffect(()=>{if(disabled){cancelAnimationFrame(frame.current);frame.current=0;current.current={x:0,y:0};target.current={x:0,y:0};ref.current?.style.setProperty('--pointer-x','0');ref.current?.style.setProperty('--pointer-y','0');}return()=>{cancelAnimationFrame(frame.current);frame.current=0;};},[disabled]);
 return {ref,onPointerMove:move,onPointerLeave:reset};
}

export function Portrait({reduced,active=true}:{reduced:boolean;active?:boolean}){
 const depth=useDepth(reduced);
 const media=useRef<HTMLMediaElement|null>(null);
 const [speaking,setSpeaking]=useState(false);
 const [playError,setPlayError]=useState(false);
 const autoplayAttempted=useRef(false);
 const [replayAvailable,setReplayAvailable]=useState(false);
 useEffect(()=>{
  const player=media.current;
  if(!player||autoplayAttempted.current)return;
  autoplayAttempted.current=true;
  void player.play().catch((error:DOMException)=>{
   setReplayAvailable(true);
   if(error.name!=='NotAllowedError'&&error.name!=='AbortError')setPlayError(true);
  });
 },[]);
 useEffect(()=>{
  if(!active)media.current?.pause();
 },[active]);
 async function speak(){
  const player=media.current;if(!player)return;
  try{setPlayError(false);if(player.error)player.load();player.currentTime=0;await player.play();}catch{setPlayError(true);setSpeaking(false);}
 }
 return <figure className="portrait portrait-depth" ref={depth.ref} onPointerMove={depth.onPointerMove} onPointerLeave={depth.onPointerLeave}>
  <div className="portrait-orbit" aria-hidden="true"/><div className="portrait-halo"/>
  <div className={`portrait-person ${speaking&&profile.introMedia.videoSrc?'is-speaking':''}`}>
   <img src={profile.portrait.src} alt={profile.portrait.alt} fetchPriority="high"/>
   {profile.introMedia.videoSrc&&<video ref={el=>{media.current=el;}} className="portrait-video" src={profile.introMedia.videoSrc} playsInline preload="none" onPlaying={()=>setSpeaking(true)} onPause={()=>{setSpeaking(false);setReplayAvailable(true);}} onEnded={()=>{setSpeaking(false);setReplayAvailable(true);}} onError={()=>{setSpeaking(false);setReplayAvailable(true);setPlayError(true);}} aria-label={profile.introMedia.transcript} style={{maskImage:`url("${profile.portrait.src}")`}}><track kind="captions" src="/akbar-intro.vtt" srcLang="en" label="English" default/></video>}
  </div>
  {!profile.introMedia.videoSrc&&<audio ref={el=>{media.current=el;}} src="/akbar-intro.mp3" preload="none" onPlaying={()=>setSpeaking(true)} onPause={()=>{setSpeaking(false);setReplayAvailable(true);}} onEnded={()=>{setSpeaking(false);setReplayAvailable(true);}}/>}
  <div className="portrait-glint" aria-hidden="true"/>
  <figcaption className="intro-caption" hidden={!replayAvailable||speaking}><button className="intro-trigger" onClick={speak} title="Replay introduction" aria-describedby="intro-transcript"><span aria-hidden="true">▶</span>Meet Akbar</button>{playError&&<span role="status">Playback unavailable. Please try again.</span>}</figcaption>
  <span id="intro-transcript" className={`intro-transcript ${speaking?'is-visible':''}`}>{profile.introMedia.transcript}</span>
  <span className="portrait-caption">MD AKBAR HUSSAIN<br/>DEVELOPER IN THE MAKING</span>
  <span className="portrait-spark" aria-hidden="true">✳</span><span className="portrait-coordinate" aria-hidden="true">HYDERABAD, INDIA / ALWAYS BUILDING</span>
 </figure>;
}

export function ProjectVisual({project,reduced,onExpand}:{project:typeof profile.projects[number];reduced:boolean;onExpand:()=>void}){
  const depth = useDepth(reduced);
  const [folderOpen, setFolderOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  // Adapted from the supplied Milk Glass Folder's tab, frosted front and rising cards.
  return <div className={`project-visual milk-folder ${project.accent} ${folderOpen ? 'folder-open' : ''}`}
    ref={element => { depth.ref.current = element; }} onPointerMove={depth.onPointerMove} onPointerLeave={depth.onPointerLeave}
    onKeyDown={event => {
      if (event.key === 'Escape' && folderOpen) {
        event.stopPropagation();
        setFolderOpen(false);
        toggle.current?.focus();
      }
    }}>
    <span className="visual-label">{new URL(project.url).hostname}</span>
    <div className="folder-stage">
      <div className="folder-back" aria-hidden="true" />
      <div className="folder-papers" id={`folder-${project.id}`}>
        <div className="folder-document" aria-hidden="true">
          <small>{project.label}</small>
          <strong>{project.name}</strong>
          <p>{project.tags.join(' · ')}</p>
        </div>
        <button className="device-preview folder-preview" disabled={!folderOpen} tabIndex={folderOpen ? 0 : -1}
          onClick={onExpand} aria-label={`Expand ${project.name} preview`}>
          <img src={project.image} alt={`${project.name} website screenshot`} loading="lazy" />
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <button ref={toggle} className="folder-toggle" type="button" aria-expanded={folderOpen}
        aria-controls={`folder-${project.id}`} aria-label={`${folderOpen ? 'Close' : 'Open'} ${project.name} folder`}
        onClick={() => setFolderOpen(value => !value)}>
        <strong>{project.name}</strong>
        <span>{folderOpen ? 'Close folder' : 'View project'}<i aria-hidden="true">{folderOpen ? '−' : '+'}</i></span>
      </button>
    </div>
    <span className="visual-caption">{project.wordmark}</span>
  </div>;
}

export function PreviewDialog({project,onClose}:{project:typeof profile.projects[number];onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.querySelector<HTMLButtonElement>('.device-preview');const modal=dialog.current;modal?.showModal();const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{modal?.close();document.body.style.overflow=previousOverflow;previous?.focus({preventScroll:true});};},[]);
 return <dialog className="preview-dialog" ref={dialog} aria-labelledby="preview-title" onKeyDown={e=>{if(e.key!=='Tab')return;const nodes=e.currentTarget.querySelectorAll<HTMLElement>('button,a[href]');const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="preview-dialog-inner"><header><div><span className="eyebrow">A CLOSER LOOK</span><h2 id="preview-title">{project.name}</h2></div><button className="close-preview" onClick={onClose} aria-label="Close preview" autoFocus>✕</button></header><img src={project.image} alt={`${project.name} website enlarged`}/><a href={project.url} target="_blank" rel="noreferrer">Visit the live website ↗</a></div>
 </dialog>;
}

export function Journey(){
 const [active,setActive]=useState(0);const timeline=useRef<HTMLDivElement>(null);
 const items=[{year:'2025',date:profile.education.period,title:profile.education.degree,role:profile.education.college,description:'Undergraduate student in Hyderabad. Building a foundation in computer science, problem solving, and software development.'},...profile.experience.map((e,i)=>({year:i===0?'2026':'NOW',date:e.date,title:e.company,role:e.role,description:e.description}))];
 useEffect(()=>{const o=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(Number((e.target as HTMLElement).dataset.index));},{rootMargin:'-20% 0px -40% 0px',threshold:0});timeline.current?.querySelectorAll('.timeline-entry').forEach(e=>o.observe(e));return()=>o.disconnect();},[]);
 return <div className="story-timeline" ref={timeline}><div className="story-clock"><p className="eyebrow">MY STORY / IN THE MAKING</p><h3>Let’s go<br/><em>back in time.</em></h3><div className="year-dial"><div className="dial-ticks" aria-hidden="true"/><strong key={items[active].year}>{items[active].year}</strong></div><p className="story-period">{items[active].date}</p></div><div className="timeline-entries">{items.map((e,i)=><article key={e.title} className={`timeline-entry ${active===i?'active':''}`} data-index={i}><span className="timeline-node"/><span className="eyebrow">{e.date}</span><h3>{e.title}</h3><h4>{e.role}</h4><p>{e.description}</p></article>)}</div></div>;
}
