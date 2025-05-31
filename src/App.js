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
  createFilterOptions,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1DB954",
    },
    background: {
      default: "#f2f2f2",
    },
    text: {
      primary: "#000",
      secondary: "#555",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

const filter = createFilterOptions();

function App() {
  const [formData, setFormData] = useState({ user_id: "", judul_lagu: "", artis: "", genre: "", top_n: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [songOptions, setSongOptions] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/lagu`)
      .then((res) => res.json())
      .then((data) => setSongOptions(data))
      .catch((err) => console.error("Gagal mengambil lagu:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <Autocomplete
              options={songOptions}
              getOptionLabel={(option) => option.title || ""}
              isOptionEqualToValue={(option, value) => option.title === value.title}
              filterOptions={(options, state) =>
                filter(options, {
                  ...state,
                  matchFrom: "start",
                  stringify: (option) => (option.title || "").toLowerCase(),
                })
              }
              renderInput={(params) => <TextField {...params} label="Judul Lagu" required margin="normal" />}
              onChange={(e, value) => {
                if (value) {
                  setFormData((prev) => ({
                    ...prev,
                    judul_lagu: value.title,
                    artis: value.artist,
                  }));
                } else {
                  setFormData((prev) => ({ ...prev, judul_lagu: "", artis: "" }));
                }
              }}
            />

            <TextField
              label="Artis"
              name="artis"
              value={formData.artis}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Jumlah Rekomendasi (top_n)"
              name="top_n"
              type="number"
              inputProps={{ min: 1, max: 20 }}
              value={formData.top_n}
              onChange={handleChange}
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
