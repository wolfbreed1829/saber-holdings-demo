/* Progressive enhancement: content remains visible if scripting is unavailable. */
(() => {
  const root = document.querySelector('.aetheris-showcase');
  if (!root || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const ambient = new Map();
  let paused = false;
  const control = document.createElement('button');
  control.className = 'motion-control';
  control.type = 'button';
  document.querySelector('.hero-bottom').append(control);
  const hero = document.querySelector('.hero');
  const atmosphere = document.createElement('div');
  atmosphere.className = 'hero-atmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) {
    const beam = document.createElement('div');
    beam.className = 'hero-beam beam-' + i;
    atmosphere.append(beam);
  }
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('i');
    particle.className = 'hero-particle';
    particle.style.setProperty('--x', ((i * 37 + 13) % 100) + '%');
    particle.style.setProperty('--y', ((i * 23 + 7) % 100) + '%');
    particle.style.setProperty('--duration', (7 + i % 6) + 's');
    particle.style.setProperty('--delay', (-i * 1.3) + 's');
    atmosphere.append(particle);
  }
  hero.prepend(atmosphere);
  const heroVisibility = new IntersectionObserver(entries => {
    hero.classList.toggle('hero-out-of-view', !entries[0].isIntersecting);
  });
  heroVisibility.observe(hero);
  const allowed = () => !reduced.matches && !paused && !document.hidden;
  function sync() {
    root.classList.toggle('motion-off', !allowed());
    control.hidden = reduced.matches;
    control.textContent = paused ? 'Resume motion' : 'Pause motion';
    control.setAttribute('aria-pressed', String(paused));
    for (const animation of animations) {
      if (reduced.matches) animation.finish();
      else if (allowed()) animation.play();
      else animation.pause();
    }
    for (const [element, state] of ambient) {
      if (allowed() && state.visible) state.animation.play();
      else state.animation.pause();
    }
  }
  function reveal(element, index = 0) {
    if (!allowed() || element.contains(document.activeElement)) return;
    const animation = element.animate([
      { opacity: 0.15, translate: '0 24px' },
      { opacity: 1, translate: '0 0' }
    ], { duration: 850, delay: index * 85, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target, Number(entry.target.dataset.motionOrder || 0));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  const selectors = '#mission > div, .nexus-identity, .nexus-system, .nexus-intro > p, .features article, .philosophy, #leadership > .section-heading, .executive, .ownership .editorial > div, .closing > h2, .closing-copy';
  document.querySelectorAll(selectors).forEach(element => observer.observe(element));
  document.querySelectorAll('.features article').forEach((el, i) => el.dataset.motionOrder = i % 3);
  document.querySelectorAll('.executive').forEach((el, i) => el.dataset.motionOrder = i);
  document.querySelectorAll('.hero-copy > *, .hero-logo').forEach((el, i) => reveal(el, Math.min(i, 4)));
  const ambientObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = ambient.get(entry.target);
      state.visible = entry.isIntersecting;
      if (allowed() && state.visible) state.animation.play();
      else state.animation.pause();
    });
  });
  document.querySelectorAll('.hero-logo img, .nexus-tiger-logo, .closing-logo').forEach(element => {
    const animation = element.animate([
      { translate: '0 0', rotate: '0deg' }, { translate: element.closest('.hero') ? '0 -18px' : '0 -7px', rotate: element.closest('.hero') ? '-1deg' : '0deg' }, { translate: '0 0', rotate: '0deg' }
    ], { duration: 6500, iterations: Infinity, easing: 'ease-in-out' });
    animation.pause();
    ambient.set(element, { animation, visible: false });
    ambientObserver.observe(element);
  });
  control.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  root.addEventListener('focusin', event => {
    for (const animation of animations) {
      if (animation.effect.target.contains(event.target)) animation.finish();
    }
  });
  const links = [...document.querySelectorAll('.chapter-nav a')];
  links.forEach(link => {
    const line = document.createElement('i');
    line.className = 'chapter-line';
    line.setAttribute('aria-hidden', 'true');
    link.append(line);
    link.addEventListener('pointermove', event => {
      if (!allowed() || event.pointerType === 'touch') return;
      const rect = link.getBoundingClientRect();
      link.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      link.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
    link.addEventListener('pointerleave', () => {
      link.style.removeProperty('--pointer-x');
      link.style.removeProperty('--pointer-y');
    });
  });
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  function updateChapter() {
    scheduled = false;
    let active = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= innerHeight * 0.4) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateChapter); }
  }, { passive: true });
  updateChapter();
  sync();
})();
