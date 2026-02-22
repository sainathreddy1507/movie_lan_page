import { useState, useEffect } from 'react';
import { fetchMovieById, getHDPosterUrl, FEATURED_IMDB_ID } from '../api/omdb';

export default function Hero() {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetchMovieById(FEATURED_IMDB_ID)
      .then((data) => setMovie(data?.Response === 'False' ? null : data))
      .catch(() => setMovie(null));
  }, []);

  const title = movie?.Title || 'Welcome to themoive';
  const description = movie?.Plot || 'Discover thousands of movies and TV shows.';
  const bgUrl = movie?.Poster ? getHDPosterUrl(movie.Poster) || movie.Poster : null;

  return (
    <section className="hero">
      <div className="hero__bg" style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}} />
      <div className="hero__gradient" />
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__description">{description}</p>
        <div className="hero__actions">
          <button className="btn btn--primary">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Play
          </button>
          <button className="btn btn--secondary">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}
