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


// Load additional public repositories from the owner's GitHub profile.
// Repository names/descriptions/languages are taken directly from GitHub's public API.
(async function loadMoreGitHubProjects() {
  const grid = document.getElementById('github-repo-grid');
  const status = document.getElementById('github-repo-status');
  if (!grid) return;
  const featured = new Set(['hireflow-ai', 'student-attendance-system', 'student-information-management-system']);
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  try {
    const response = await fetch('https://api.github.com/users/akshat0502/repos?per_page=100&sort=updated', {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const repos = await response.json();
    const selected = repos
      .filter(repo => !repo.fork && !repo.archived && !featured.has(repo.name.toLowerCase()) && repo.name.toLowerCase() !== 'akshat-saxena')
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
      .slice(0, 9);
    grid.replaceChildren();
    if (!selected.length) {
      grid.append(make('p', 'col-span-full text-center text-gray-500 dark:text-gray-300', 'No additional public repositories were found. Visit GitHub to explore all repositories.'));
      return;
    }
    selected.forEach(repo => {
      const card = make('article', 'rounded-2xl border border-gray-300 dark:border-white/15 bg-white/70 dark:bg-white/[.03] p-6 flex flex-col min-h-[230px] hover:-translate-y-1 hover:border-cyan-400/60 transition-all duration-300');
      const top = make('div', 'flex items-start justify-between gap-3');
      top.append(make('h4', 'text-lg font-semibold text-gray-900 dark:text-white break-words', repo.name));
      top.append(make('span', 'text-[11px] rounded-full border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 px-2 py-1 shrink-0', repo.private ? 'Private' : 'Public'));
      card.append(top);
      card.append(make('p', 'text-sm text-gray-600 dark:text-gray-300 mt-3 leading-6 flex-1', repo.description || 'Public repository. Open GitHub to explore the source code and project details.'));
      const meta = make('div', 'flex flex-wrap gap-2 mt-4 text-xs');
      if (repo.language) meta.append(make('span', 'rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-200 px-3 py-1', repo.language));
      if (repo.stargazers_count > 0) meta.append(make('span', 'rounded-full bg-white/10 text-gray-600 dark:text-gray-300 px-3 py-1', `★ ${repo.stargazers_count}`));
      card.append(meta);
      const link = make('a', 'inline-flex w-fit items-center gap-2 mt-5 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:underline');
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View repository ↗';
      card.append(link);
      grid.append(card);
    });
    if (status) status.textContent = `Showing ${selected.length} additional public repositories · Data loaded from github.com/akshat0502.`;
  } catch (error) {
    grid.replaceChildren();
    const message = make('p', 'col-span-full text-center text-gray-500 dark:text-gray-300', 'GitHub projects could not be loaded right now. You can still browse all repositories directly.');
    grid.append(message);
    if (status) status.textContent = 'Live repository loading may be temporarily limited by GitHub. Use the View All GitHub Projects link below.';
  }
})();
