export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Movie id is required" });
  }

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}&plot=full`
    );

    const data = await response.json();

    if (data.Response === "False") {
      return res.status(404).json({
        error: data.Error || "Movie not found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("OMDb movie detail error:", error);
    return res.status(500).json({ error: "Failed to fetch movie details" });
  }
}