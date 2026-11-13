import { useEffect, useRef } from 'react';
import { profile } from './content';
import './reveal-footer.css';
import { LiquidGlassLink } from './LiquidGlassLink';

// Adapted from the supplied Framer Reveal Footer and its Ink Reveal Image.
function InkPanorama({ reduced }: { reduced: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const revealed = useRef(false);

  useEffect(() => {
    const element = container.current;
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    if (!element || !surface || !context) return;

    const image = new Image();
    let frame = 0;
    let start = 0;
    let progress = revealed.current || reduced ? 1 : 0;
    let inView = false;
    let width = 0;
    let height = 0;

    function paint() {
      if (!context || !image.naturalWidth) return;
      context.clearRect(0, 0, width, height);
      if (progress === 0) return;
      context.save();
      if (progress < 1) {
        const front = width * progress;
        context.beginPath();
        context.moveTo(0, 0);
        for (let y = 0; y <= height + 3; y += 3) {
          const edge = Math.sin(y * .048 + progress * 5.1) * 12
            + Math.sin(y * .193 + 1.7) * 8;
          context.lineTo(Math.max(0, front + edge), y);
        }
        context.lineTo(0, height);
        context.closePath();
        context.clip();
      }
      context.drawImage(image, 0, 0, width, height);
      context.restore();
    }

    function animate(now: number) {
      if (!start) start = now;
      progress = Math.min(1, Math.max(0, (now - start - 120) / 1600));
      paint();
      if (progress < 1) frame = requestAnimationFrame(animate);
      else revealed.current = true;
    }

    function reveal() {
      if (!image.naturalWidth || !inView) return;
      if (reduced || revealed.current) {
        progress = 1;
        revealed.current = true;
        paint();
        return;
      }
      if (!frame) frame = requestAnimationFrame(animate);
    }

    const resize = new ResizeObserver(() => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const density = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.max(1, Math.round(width * density));
      surface.height = Math.max(1, Math.round(height * density));
      context.setTransform(density, 0, 0, density, 0, 0);
      paint();
    });
    const visibility = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        inView = true;
        reveal();
        visibility.disconnect();
      }
    }, { threshold: .12 });

    resize.observe(element);
    visibility.observe(element);
    image.onload = reveal;
    image.src = '/footer-panorama.png';
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      image.onload = null;
    };
  }, [reduced]);

  return <div className="footer-panorama" ref={container} aria-hidden="true">
    <canvas ref={canvas} />
  </div>;
}

export function RevealFooter({ hidden, reduced }: { hidden: boolean; reduced: boolean }) {
  return <footer id="contact" className="reveal-footer" hidden={hidden}>
    <div className="shell footer-content">
      <div className="footer-editorial">
        <div className="footer-statement">
          <p className="footer-signature"><span className="footer-orbit" aria-hidden="true" />{profile.name}</p>
          <h2>Got an idea?<br />Let’s <em>build it.</em></h2>
          <p className="footer-invitation">A project, a collaboration, or just a hello.</p>
          <LiquidGlassLink className="footer-contact-link" href={`mailto:${profile.contact.email}`}>Let’s talk</LiquidGlassLink>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <div>
            <p className="eyebrow">EXPLORE</p>
            <a href="#home">Home</a>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#journey">Journey</a>
          </div>
          <div>
            <p className="eyebrow">CONNECT</p>
            {profile.socials.map(social => <a key={social.name} href={social.url} target="_blank" rel="noreferrer">{social.name} ↗</a>)}
            <a href={`mailto:${profile.contact.email}`}>Email ↗</a>
          </div>
        </nav>
      </div>
      <div className="footer-contact-details">
        <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
        <a href={`tel:${profile.contact.phoneHref}`}>+91 {profile.contact.phone}</a>
        <span>{profile.contact.location}</span>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} {profile.name}</small>
        <a href="#home">BACK TO TOP ↑</a>
      </div>
    </div>
    <div className="footer-art"><InkPanorama reduced={reduced} /></div>
  </footer>;
}
