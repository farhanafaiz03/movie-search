export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (data.Response === "False") {
      return res.status(404).json({
        error: data.Error || "No movies found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("OMDb search error:", error);
    return res.status(500).json({ error: "Failed to fetch movie data" });
  }
}