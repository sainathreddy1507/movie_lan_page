import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import LanguageBar from '../components/LanguageBar';
import MovieRow from '../components/MovieRow';
import { CATEGORIES_BY_LANGUAGE, searchMovies } from '../api/omdb';

function SkeletonRow({ title }) {
  return (
    <div className="movie-row">
      <h2 className="movie-row__title">{title}</h2>
      <div className="movie-row__slider">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="movie-card skeleton" style={{ minWidth: 200, aspectRatio: '16/9', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [langId, setLangId] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = CATEGORIES_BY_LANGUAGE[langId] || CATEGORIES_BY_LANGUAGE.all;

  useEffect(() => {
    setLoading(true);
    Promise.all(
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
    ).then((results) => {
      setRows(results);
      setLoading(false);
    });
  }, [langId]);

  return (
    <>
      <Hero />
      <main className="content">
        <LanguageBar activeLang={langId} onSelect={setLangId} />
        {loading ? (
          categories.map((c) => <SkeletonRow key={c.title} title={c.title} />)
        ) : (
          rows.map(({ title, movies }) => <MovieRow key={title} title={title} movies={movies} />)
        )}
      </main>
    </>
  );
}
