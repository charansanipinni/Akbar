import type { AnchorHTMLAttributes, PointerEvent } from 'react';

// Local adaptation of the supplied Liquid Glass Buttons' layered lens surface.
export function LiquidGlassLink({ children, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  function moveLight(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--glass-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
    event.currentTarget.style.setProperty('--glass-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
  }

  return <a {...props} className={`liquid-glass-link ${className}`} onPointerMove={moveLight}
    onPointerLeave={event => {
      event.currentTarget.style.removeProperty('--glass-x');
      event.currentTarget.style.removeProperty('--glass-y');
    }}>
    <span className="glass-lens" aria-hidden="true" />
    <span className="glass-label">{children}</span>
    <span className="glass-arrow" aria-hidden="true">↗</span>
  </a>;
}
