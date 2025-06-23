import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

// Slide transition for Snackbar
function SlideTransition(props) {
  return <Slide {...props} direction="right" />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Snackbar state
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const token = response.data.access_token;
    localStorage.setItem("token", token);

    const userRes = await api.get("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSnackMessage("✅ Login successful!");
    setSnackSeverity("success");
    setSnackOpen(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  } catch (err) {
    console.error(err);
    setSnackMessage("❌ Login failed. Please check your credentials.");
    setSnackSeverity("error");
    setSnackOpen(true);
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: 2,
        borderRadius: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: 400,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            boxShadow:
              "0 8px 20px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "700",
              fontFamily: "'Poppins', sans-serif",
              color: "#333",
              letterSpacing: 1,
            }}
          >
            Login
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel htmlFor="login-password">Password</InputLabel>
              <OutlinedInput
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <Button
              fullWidth
              type="submit"
              sx={{
                mt: 3,
                py: 1.3,
                fontWeight: "bold",
                fontSize: "16px",
                borderRadius: 3,
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(to right, #5f10b3, #1e60e0)",
                },
              }}
            >
              Login
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/register")}
              sx={{
                mt: 2,
                py: 1.3,
                fontWeight: "bold",
                borderColor: "#1976d2",
                color: "#1976d2",
                borderRadius: 3,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              Register
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            fontFamily: "'Poppins', sans-serif", // 👈 Change the font here
            fontSize: "15px", // 👈 Optional: Adjust size
            fontWeight: 500, // 👈 Optional: Adjust weight
          }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;
