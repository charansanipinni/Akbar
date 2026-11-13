import { useEffect, useRef, useState, type PointerEvent } from 'react';

type Particle = { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number };

// Adapted from the supplied ParticleText's sampled letters and pointer repulsion.
export function ParticleName({ reduced, evening }: { reduced: boolean; evening: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const pointer = useRef({ x: -1000, y: -1000 });
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    setReady(false);
    const element = root.current;
    const surface = canvas.current;
    if (reduced || !element || !surface) return;
    const context = surface.getContext('2d');
    if (!context) return;

    let particles: Particle[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let color = '';
    let disposed = false;

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      let moving = false;
      for (const particle of particles) {
        const dx = particle.x - pointer.current.x;
        const dy = particle.y - pointer.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 65) {
          const force = (65 - distance) / 65 * 1.5;
          particle.vx += dx / Math.max(distance, 1) * force;
          particle.vy += dy / Math.max(distance, 1) * force;
        }
        particle.vx = (particle.vx + (particle.homeX - particle.x) * .045) * .86;
        particle.vy = (particle.vy + (particle.homeY - particle.y) * .045) * .86;
        particle.x += particle.vx;
        particle.y += particle.vy;
        moving ||= Math.abs(particle.vx) + Math.abs(particle.vy) > .03 || distance < 65;
        context.beginPath();
        context.arc(particle.x, particle.y, 1.25, 0, Math.PI * 2);
        context.fill();
      }
      frame = moving ? requestAnimationFrame(draw) : 0;
    }

    function start() {
      if (!frame && particles.length) frame = requestAnimationFrame(draw);
    }
    wake.current = start;

    function sample() {
      if (!element || !surface || !context || disposed || element.clientWidth === 0) return;
      cancelAnimationFrame(frame);
      frame = 0;
      const style = getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize);
      width = element.clientWidth + 24;
      height = element.clientHeight + 20;
      const density = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(width * density);
      surface.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, width, height);
      context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      context.letterSpacing = style.letterSpacing;
      context.textBaseline = 'alphabetic';
      context.fillStyle = '#000';
      const metrics = context.measureText('Akbar.');
      const ascent = metrics.fontBoundingBoxAscent ?? fontSize * .8;
      const descent = metrics.fontBoundingBoxDescent ?? fontSize * .2;
      const baseline = 10 + (element.clientHeight - ascent - descent) / 2 + ascent;
      context.fillText('Akbar.', 12, baseline);
      const pixels = context.getImageData(0, 0, surface.width, surface.height).data;
      particles = [];
      const gap = Math.max(2, Math.round(3 * density));
      for (let y = 0; y < surface.height; y += gap) {
        for (let x = 0; x < surface.width; x += gap) {
          if (pixels[(y * surface.width + x) * 4 + 3] > 128) {
            particles.push({ x: x / density, y: y / density, homeX: x / density, homeY: y / density, vx: 0, vy: 0 });
          }
        }
      }
      color = style.color;
      draw();
      setReady(particles.length > 0);
    }

    const observer = new ResizeObserver(sample);
    void document.fonts.ready.then(() => {
      if (disposed) return;
      sample();
      observer.observe(element);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      wake.current = () => {};
    };
  }, [reduced, evening]);

  function move(event: PointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== 'mouse' || reduced) return;
    const bounds = canvas.current?.getBoundingClientRect();
    if (!bounds) return;
    pointer.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    wake.current();
  }

  return <span ref={root} className={`particle-name ${ready ? 'particles-ready' : ''}`}
    onPointerMove={move} onPointerLeave={() => { pointer.current = { x: -1000, y: -1000 }; wake.current(); }}>
    <span className="particle-fallback">Akbar.</span>
    <canvas ref={canvas} aria-hidden="true" />
  </span>;
}
