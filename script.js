const sideMenu = document.querySelector('#sideMenu');
const navBar = document.querySelector('nav');
const navLinks = document.querySelector('nav ul');

function openMenu() {
  if (!sideMenu) return;
  sideMenu.style.transform = 'translateX(-16rem)';
  document.body.classList.add('menu-open');
}
function closeMenu() {
  if (!sideMenu) return;
  sideMenu.style.transform = 'translateX(16rem)';
  document.body.classList.remove('menu-open');
}

window.addEventListener('scroll', () => {
  if (!navBar) return;
  navBar.classList.toggle('nav-scrolled', window.scrollY > 16);
}, { passive: true });

function toggleTheme() {
  const root = document.documentElement;
  root.classList.toggle('dark');
  try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (_) {}
}

// Start in the requested dark style unless the visitor has explicitly chosen light mode.
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');
} catch (_) { document.documentElement.classList.add('dark'); }

// Subtle scroll reveals; content remains visible when reduced motion is preferred.
const revealTargets = document.querySelectorAll('#about, #services, #work, #experience, #certifications, #contact, .project-card, #services .border, #certifications .border');
revealTargets.forEach((el) => el.classList.add('reveal'));
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// Close the mobile menu after navigation and allow Escape to dismiss it.
document.querySelectorAll('#sideMenu a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
