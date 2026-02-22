import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
  if (!movies?.length) return null;

  return (
    <div className="movie-row">
      <h2 className="movie-row__title">{title}</h2>
      <div className="movie-row__slider">
        {movies.map((m) => (
          <MovieCard key={m.imdbID} movie={m} />
        ))}
      </div>
    </div>
  );
}
