import { useState } from 'react';
import { getHDPosterUrl } from '../api/omdb';

export default function MovieCard({ movie }) {
  const [triedFallback, setTriedFallback] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const hasPoster = movie.Poster && movie.Poster !== 'N/A';
  const hdUrl = hasPoster ? getHDPosterUrl(movie.Poster) : null;
  const fallbackUrl = hasPoster ? movie.Poster : null;

  const handleError = () => {
    if (fallbackUrl && !triedFallback) {
      setTriedFallback(true);
    } else {
      setShowPlaceholder(true);
    }
  };

  if (!hasPoster) {
    return (
      <div className="movie-card" data-id={movie.imdbID}>
        <div className="movie-card__placeholder">{movie.Title}</div>
      </div>
    );
  }

  if (showPlaceholder) {
    return (
      <div className="movie-card" data-id={movie.imdbID}>
        <div className="movie-card__placeholder">{movie.Title}</div>
      </div>
    );
  }

  return (
    <div className="movie-card" data-id={movie.imdbID}>
      <img
        src={triedFallback ? fallbackUrl : hdUrl}
        alt={movie.Title}
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
}
