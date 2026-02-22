const API_KEY = 'cf05658b';
const API_BASE = 'https://www.omdbapi.com/';

export const LANGUAGES = [
  { id: 'all', label: 'All' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'malayalam', label: 'Malayalam' },
];

export const CATEGORIES_BY_LANGUAGE = {
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

export const FEATURED_IMDB_ID = 'tt8178634';

export function getHDPosterUrl(url) {
  if (!url || url === 'N/A') return null;
  return url.replace(/_SX\d+|_SY\d+/gi, '_SX1000').replace(/_UX\d+|_UY\d+/gi, '_UX1280');
}

export async function fetchMovieById(id) {
  const res = await fetch(`${API_BASE}?i=${id}&apikey=${API_KEY}`);
  return res.json();
}

export async function searchMovies(query, page = 1) {
  const res = await fetch(
    `${API_BASE}?s=${encodeURIComponent(query)}&type=movie&page=${page}&apikey=${API_KEY}`
  );
  const data = await res.json();
  const results = data.Search || [];
  return results.filter((m) => m.Type === 'movie');
}
