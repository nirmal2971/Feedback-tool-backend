import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/axios";
import {
  Container,
  OutlinedInput,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setSnack({
        open: true,
        message: "✅ Registered successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        message: "❌ Registration failed!",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #43cea2, #185a9d)",
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
          elevation={6}
          sx={{
            p: 4,
            width: 400,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              color: "#333",
            }}
          >
            Register
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              required
              onChange={handleChange}
              value={formData.email}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Select Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Select Role"
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#fff",
                }}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
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
                background: "linear-gradient(to right, #00c6ff, #0072ff)",
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(to right, #00b5e5, #0060e0)",
                },
              }}
            >
              Register
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2, textTransform: "none" }}
              onClick={() => navigate("/")}
            >
              Already have an account? Login
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        TransitionProps={{ onExited: () => setSnack({ ...snack, message: "" }) }}
      >
        <Alert
          severity={snack.severity}
          sx={{
            width: "100%",
            fontFamily: "'Poppins', sans-serif",
            borderRadius: 2,
          }}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Register;
