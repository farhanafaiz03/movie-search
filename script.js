const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const movieGrid = document.getElementById("movieGrid");
const movieDetails = document.getElementById("movieDetails");

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchMovies();
  }
});

async function searchMovies() {
  const query = searchInput.value.trim();

  if (!query) {
    statusEl.textContent = "Please enter a movie name";
    return;
  }

  statusEl.textContent = "Searching...";
  movieGrid.innerHTML = "";
  movieDetails.innerHTML = `
    <div class="placeholder">
      <h2>Loading details…</h2>
      <p>Once results appear, select a movie to learn more.</p>
    </div>
  `;

  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Search failed");
    }

    const data = await response.json();

    if (!data.Search || data.Search.length === 0) {
      statusEl.textContent = "No movies found";
      return;
    }

    renderMovies(data.Search);
    statusEl.textContent = `Found ${data.Search.length} results for "${query}"`;
  } catch (error) {
    statusEl.textContent = error.message || "Something went wrong";
    console.error(error);
  }
}

function renderMovies(movies) {
  movieGrid.innerHTML = movies
    .map(
      (movie) => `
        <article class="movie-card" data-id="${movie.imdbID}" tabindex="0">
          ${
            movie.Poster && movie.Poster !== "N/A"
              ? `<img class="poster" src="${movie.Poster}" alt="${movie.Title}" />`
              : `<div class="no-image">No Image</div>`
          }
          <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      getMovieDetails(id);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const id = card.dataset.id;
        getMovieDetails(id);
      }
    });
  });
}

async function getMovieDetails(id) {
  try {
    const response = await fetch(`/api/movie/${id}`);

    if (!response.ok) {
      throw new Error("Failed to load movie details");
    }

    const movie = await response.json();

    if (movie.Response === "False") {
      movieDetails.innerHTML = "<p>Movie details not available.</p>";
      return;
    }

    movieDetails.innerHTML = `
      ${
        movie.Poster && movie.Poster !== "N/A"
          ? `<img class="detail-poster" src="${movie.Poster}" alt="${movie.Title}" />`
          : ""
      }
      <h2 class="detail-title">${movie.Title}</h2>
      <div class="detail-meta">
        <div><strong>Year:</strong> ${movie.Year}</div>
        <div><strong>Genre:</strong> ${movie.Genre}</div>
        <div><strong>Runtime:</strong> ${movie.Runtime}</div>
        <div><strong>Director:</strong> ${movie.Director}</div>
        <div><strong>Rating:</strong> ${movie.imdbRating || "N/A"}</div>
      </div>
      <p class="detail-plot">${movie.Plot || "No plot available."}</p>
    `;
  } catch (error) {
    console.error(error);
    movieDetails.innerHTML = "<p>Could not load movie details.</p>";
  }
}
