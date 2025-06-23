import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Paper,
  IconButton,
  Tooltip,
  Slide,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Snackbar, Alert } from "@mui/material";

function CreateFeedback() {
  const [employeeId, setEmployeeId] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [sentiment, setSentiment] = useState("positive");
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Add this inside your component
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const token = localStorage.getItem("token");
  const { employeeId: routeEmployeeId } = useParams();
  const requestId = location.state?.requestId;

  function SlideTransition(props) {
    return <Slide {...props} direction="right" />;
  }

  useEffect(() => {
    if (routeEmployeeId) {
      setEmployeeId(routeEmployeeId); // update state only
    }
  }, [routeEmployeeId]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem("token");
      console.log("🟢 useEffect running to fetch employees");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/users/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchEmployees();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/feedbacks",
        {
          employee_id: parseInt(employeeId),
          strengths,
          improvements,
          sentiment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackMessage("✅ Feedback submitted successfully");
      setSnackSeverity("success");
      setSnackOpen(true);
      setEmployeeId("");
      setStrengths("");
      setImprovements("");
      setSentiment("positive");
      setTimeout(() => {
        navigate("/dashboard", {
          state: { respondedRequestId: requestId },
        });
      }, 1500);
    } catch (err) {
      console.error("❌ Feedback submission failed", err);
      setSnackMessage("❌ Error: Could not submit feedback");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: 'url("/89124.jpg")', // ✅ Starts with a slash
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          position: "relative",
          zIndex: 1, // needed for absolute button inside
        }}
      >
        {/* ✅ Logout Button */}
        <Box
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Logout">
            <IconButton
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              sx={{
                background: "linear-gradient(to right, #f06292, #7e57c2)",
                color: "#fff",
                borderRadius: "12px",
                p: 1.2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "linear-gradient(to right, #ec407a, #673ab7)",
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: "#ffffffdd",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                color: "#512da8",
                fontWeight: "bold",
                mb: 3,
                borderBottom: "2px solid #512da8",
                display: "inline-block",
                pb: 1,
              }}
            >
              Create Feedback
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={employeeId}
                  label="Select Employee"
                  onChange={(e) => setEmployeeId(e.target.value)}
                  sx={{ backgroundColor: "#f3e5f5" }}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Strengths"
                multiline
                rows={3}
                fullWidth
                required
                margin="normal"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                sx={{ backgroundColor: "#e0f7fa" }}
              />

              <TextField
                label="Areas for Improvement"
                multiline
                rows={3}
                fullWidth
                required
                margin="normal"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                sx={{ backgroundColor: "#e0f2f1" }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Sentiment</InputLabel>
                <Select
                  value={sentiment}
                  label="Sentiment"
                  onChange={(e) => setSentiment(e.target.value)}
                  sx={{ backgroundColor: "#ede7f6" }}
                >
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="neutral">Neutral</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                </Select>
              </FormControl>

              <Box mt={3}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    backgroundColor: "#00acc1",
                    "&:hover": {
                      backgroundColor: "#00838f",
                    },
                  }}
                >
                  Submit Feedback
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
        <Snackbar
          open={snackOpen}
          autoHideDuration={3000}
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
              borderRadius: 3,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {snackMessage}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
}

export default CreateFeedback;
