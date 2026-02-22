// OMDB API - Free, no signup required (1000 requests/day)
const API_KEY = 'cf05658b';
const API_BASE = 'https://www.omdbapi.com/';

// Language bar options
const LANGUAGES = [
  { id: 'all', label: 'All' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
];

// Category config by language - search terms for each row
const CATEGORIES_BY_LANGUAGE = {
  all: [
    { title: 'Trending Now', search: 'rrr' },
    { title: 'Bollywood Hits', search: 'bollywood' },
    { title: 'South Indian Blockbusters', search: 'bahubali' },
    { title: 'Indian Comedy', search: '3 idiots' },
    { title: 'Aamir Khan', search: 'aamir khan' },
    { title: 'Indian Drama', search: 'dangal' },
    { title: 'Tamil Cinema', search: 'vijay' },
    { title: 'Indian Action', search: 'war hindi' },
  ],
  hindi: [
    { title: 'Trending Now', search: 'dangal' },
    { title: 'Bollywood Hits', search: 'bollywood' },
    { title: 'Indian Comedy', search: '3 idiots' },
    { title: 'Indian Drama', search: 'dangal' },
    { title: 'Indian Action', search: 'war hindi' },
    { title: 'Romance', search: 'dilwale' },
  ],
  tamil: [
    { title: 'Trending Now', search: 'vijay' },
    { title: 'Tamil Blockbusters', search: 'tamil' },
    { title: 'Rajinikanth', search: 'rajinikanth' },
    { title: 'Vijay', search: 'vijay tamil' },
    { title: 'Tamil Action', search: 'tamil action' },
  ],
  telugu: [
    { title: 'Trending Now', search: 'rrr' },
    { title: 'Telugu Blockbusters', search: 'bahubali' },
    { title: 'Prabhas', search: 'prabhas' },
    { title: 'Telugu Action', search: 'telugu' },
    { title: 'Jr NTR', search: 'jr ntr' },
  ],
  malayalam: [
    { title: 'Trending Now', search: 'malayalam' },
    { title: 'Mohanlal', search: 'mohanlal' },
    { title: 'Mammootty', search: 'mammootty' },
    { title: 'Malayalam Drama', search: 'malayalam movie' },
  ],
};

// Featured movie for hero (RRR - OMDB ID)
const FEATURED_IMDB_ID = 'tt8178634';

function getHDPosterUrl(url) {
  if (!url || url === 'N/A') return null;
  return url.replace(/_SX\d+|_SY\d+/gi, '_SX1000').replace(/_UX\d+|_UY\d+/gi, '_UX1280');
}

async function fetchMovieById(id) {
  const res = await fetch(`${API_BASE}?i=${id}&apikey=${API_KEY}`);
  return res.json();
}

async function searchMovies(query, page = 1) {
  const res = await fetch(`${API_BASE}?s=${encodeURIComponent(query)}&type=movie&page=${page}&apikey=${API_KEY}`);
  const data = await res.json();
  const results = data.Search || [];
  return results.filter((m) => m.Type === 'movie');
}

function renderHero(movie) {
  const hero = document.getElementById('hero');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDescription');
  const bgEl = hero.querySelector('.hero__bg');

  if (!movie || movie.Response === 'False') {
    titleEl.textContent = 'Welcome to themoive';
    descEl.textContent = 'Discover thousands of movies and TV shows.';
    return;
  }

  titleEl.textContent = movie.Title;
  descEl.textContent = movie.Plot || '';
  const posterUrl = getHDPosterUrl(movie.Poster) || movie.Poster;
  bgEl.style.backgroundImage = posterUrl ? `url(${posterUrl})` : 'none';
}

function renderMovieRow(title, movies) {
  if (!movies || movies.length === 0) return '';

  const cards = movies.map((m) => {
    const hasPoster = m.Poster && m.Poster !== 'N/A';
    const hdUrl = hasPoster ? getHDPosterUrl(m.Poster) : null;
    const origUrl = hasPoster ? m.Poster : null;
    const safeTitle = (m.Title || '').replace(/"/g, '&quot;');

    if (!hasPoster) {
      return `
    <div class="movie-card" data-id="${m.imdbID}">
      <div class="movie-card__placeholder">${safeTitle}</div>
    </div>
  `;
    }

    const safeOrigUrl = origUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `
    <div class="movie-card" data-id="${m.imdbID}">
      <img src="${hdUrl}" data-fallback="${safeOrigUrl}" alt="${safeTitle}" loading="lazy"
           onerror="var f=this.dataset.fallback;if(f){this.src=f;this.dataset.fallback=''}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
      <div class="movie-card__placeholder" style="display:none">${safeTitle}</div>
    </div>
  `;
  }).join('');

  return `
    <div class="movie-row">
      <h2 class="movie-row__title">${title}</h2>
      <div class="movie-row__slider">${cards}</div>
    </div>
  `;
}

function renderSkeletonRow(title) {
  const cards = Array(6).fill(0).map(() => `
    <div class="movie-card skeleton" style="min-width: 200px; aspect-ratio: 16/9; border-radius: 4px;"></div>
  `).join('');

  return `
    <div class="movie-row">
      <h2 class="movie-row__title">${title}</h2>
      <div class="movie-row__slider">${cards}</div>
    </div>
  `;
}

function renderLanguageBar(container) {
  const html = `
    <div class="language-bar">
      ${LANGUAGES.map(
        (lang) =>
          `<button class="language-bar__btn ${lang.id === 'all' ? 'active' : ''}" data-lang="${lang.id}">${lang.label}</button>`
      ).join('')}
    </div>
  `;
  container.innerHTML = html;
}

async function loadMoviesForLanguage(langId) {
  const rowsEl = document.getElementById('movieRows');
  const categories = CATEGORIES_BY_LANGUAGE[langId] || CATEGORIES_BY_LANGUAGE.all;

  rowsEl.innerHTML = categories.map((c) => renderSkeletonRow(c.title)).join('');

  const results = await Promise.all(
    categories.map(async (cat) => {
      try {
        let movies = await searchMovies(cat.search, 1);
        if (movies.length < 6) {
          const more = await searchMovies(cat.search, 2);
          const ids = new Set(movies.map((m) => m.imdbID));
          movies = [...movies, ...more.filter((m) => !ids.has(m.imdbID))];
        }
        return { ...cat, movies };
      } catch {
        return { ...cat, movies: [] };
      }
    })
  );

  rowsEl.innerHTML = results
    .map(({ title, movies }) => renderMovieRow(title, movies))
    .join('');
}

async function init() {
  const contentEl = document.querySelector('.content');
  const rowsEl = document.getElementById('movieRows');

  // Add language bar before movie rows
  const langBarWrapper = document.createElement('div');
  langBarWrapper.className = 'language-bar-wrapper';
  contentEl.insertBefore(langBarWrapper, rowsEl);
  renderLanguageBar(langBarWrapper);

  // Fetch featured movie for hero
  try {
    const featured = await fetchMovieById(FEATURED_IMDB_ID);
    renderHero(featured);
  } catch (e) {
    renderHero(null);
  }

  // Load movies for default language
  await loadMoviesForLanguage('all');

  // Language bar click handler
  contentEl.querySelector('.language-bar').addEventListener('click', async (e) => {
    const btn = e.target.closest('.language-bar__btn');
    if (!btn) return;
    const langId = btn.dataset.lang;
    contentEl.querySelectorAll('.language-bar__btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    await loadMoviesForLanguage(langId);
  });

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

init();
