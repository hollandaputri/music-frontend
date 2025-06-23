import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  Box,
  createTheme,
  ThemeProvider,
  Stack,
  Autocomplete,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1DB954" },
    background: { default: "#f2f2f2" },
    text: { primary: "#000", secondary: "#555" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

function App() {
  const [formData, setFormData] = useState({
    user_id: "",
    judul_lagu: "",
    artis: "",
    genre: "",
    top_n: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);

  const genreOptions = [
    "clasiccal", "edm", "hiphop", "indie", "ipop",
    "jazz", "kpop", "latin", "pop", "rnb", "rock",
  ];

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/lagu`)
      .then((res) => res.json())
      .then((data) => {
        setAllSongs(data);
        const uniqueArtists = [...new Set(data.map((item) => item.artist))];
        setArtistOptions(uniqueArtists);
      })
      .catch((err) => console.error("Gagal mengambil lagu:", err));
  }, []);

  const handleArtistChange = (event, value) => {
    setFormData((prev) => ({ ...prev, artis: value || "", judul_lagu: "" }));
    const filtered = allSongs.filter((item) => item.artist === value);
    setFilteredSongs(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: formData.user_id,
          judul_lagu: formData.judul_lagu,
          artis: formData.artis,
          genre: formData.genre,
          top_n: parseInt(formData.top_n),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Server Error");
      }

      const data = await res.json();
      setResults(data.recommendations);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f2f2", py: 6 }}>
        <Container maxWidth="sm">
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            SISTEM REKOMENDASI LAGU
          </Typography>
          <Typography variant="subtitle2" align="center" gutterBottom>
            SELAMAT MENDENGARKAN
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ background: "#fff", p: 4, borderRadius: 2, boxShadow: 1, mb: 4 }}
          >
            <TextField
              label="User ID"
              name="user_id"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              fullWidth
              required
              margin="normal"
            />

            <Autocomplete
              options={artistOptions}
              value={formData.artis}
              onChange={handleArtistChange}
              renderInput={(params) => <TextField {...params} label="Artis" required margin="normal" />}
            />

            <Autocomplete
              options={filteredSongs}
              getOptionLabel={(option) => option.title || ""}
              isOptionEqualToValue={(option, value) => option.title === value.title}
              value={filteredSongs.find((s) => s.title === formData.judul_lagu) || null}
              onChange={(e, value) =>
                setFormData((prev) => ({ ...prev, judul_lagu: value ? value.title : "" }))
              }
              renderInput={(params) => <TextField {...params} label="Judul Lagu" required margin="normal" />}
            />

            <Autocomplete
              options={genreOptions}
              value={formData.genre}
              onChange={(e, value) => setFormData((prev) => ({ ...prev, genre: value || "" }))}
              renderInput={(params) => <TextField {...params} label="Genre" required margin="normal" />}
            />

            <TextField
              label="Jumlah Rekomendasi (top_n)"
              name="top_n"
              type="number"
              inputProps={{ min: 1, max: 20 }}
              value={formData.top_n}
              onChange={(e) => setFormData({ ...formData, top_n: e.target.value })}
              fullWidth
              margin="normal"
            />

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, borderRadius: 2 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Cari Rekomendasi"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {results.length > 0 && (
            <Stack spacing={2}>
              {results.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <MusicNoteIcon color="action" sx={{ mr: 1 }} />
                  <GraphicEqIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      <Link
                        href={item.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="inherit"
                      >
                        {item["Judul Lagu"]} - {item.Artis}
                      </Link>
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ position: "absolute", bottom: 4, right: 12, fontSize: 12, color: "gray" }}
                  >
                    Skor: {item["Skor Hybrid"].toFixed(3)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
