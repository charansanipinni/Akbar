import { useEffect, useRef, useState } from 'react';
import { LiquidGlassLink } from './LiquidGlassLink';

const destinations = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
];

// Adapted from the supplied Modern Navbar's pill layout and mobile disclosure.
export function ModernNavbar({ hidden }: { hidden: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
    for (const destination of destinations) {
      const section = document.getElementById(destination.id);
      if (section) observer.observe(section);
    }
    const desktop = matchMedia('(min-width: 721px)');
    const closeOnResize = () => setOpen(false);
    desktop.addEventListener('change', closeOnResize);
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', closeOnResize);
    };
  }, []);

  return <header className="modern-header" hidden={hidden}>
    <nav className={`modern-nav shell ${open ? 'menu-open' : ''}`} aria-label="Main navigation"
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}>
      <span className="modern-location"><span className="live-dot" />HYDERABAD, IN</span>
      <div id="main-navigation-links" className="modern-links">
        {destinations.map(destination => <a key={destination.id} href={`#${destination.id}`}
          aria-current={active === destination.id ? 'location' : undefined}
          onClick={() => { setActive(destination.id); setOpen(false); }}>
          {destination.label}
        </a>)}
      </div>
      <div className="modern-nav-actions">
        <LiquidGlassLink href="#contact" className="nav-contact" onClick={() => setOpen(false)}>Contact</LiquidGlassLink>
        <button ref={toggle} type="button" className="menu-toggle"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open} aria-controls="main-navigation-links" onClick={() => setOpen(value => !value)}>
          <span /><span />
        </button>
      </div>
    </nav>
  </header>;
}
