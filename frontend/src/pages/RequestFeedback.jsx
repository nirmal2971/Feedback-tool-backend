import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../api/axios";

function RequestFeedback() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [managers, setManagers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await api.get("/users/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setManagers(res.data);
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    };

    fetchManagers();
  }, [token]);

  const handleSubmit = async () => {
    try {
      await api.post(
        "/feedback-requests",
        {
          manager_id: selectedManagerId,
          message: message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      setMessage("");
      setSelectedManagerId("");
    } catch (err) {
      console.error("Failed to request feedback", err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 5, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Request Feedback
        </Typography>

        <TextField
          label="Write your feedback request"
          multiline
          rows={4}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Manager</InputLabel>
          <Select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            label="Select Manager"
          >
            {managers.map((manager) => (
              <MenuItem key={manager.id} value={manager.id}>
                {manager.name || `Manager #${manager.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!message.trim() || !selectedManagerId}
        >
          Submit Request
        </Button>

        {success && (
          <Typography sx={{ mt: 2, color: "green" }}>
            Request sent successfully!
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default RequestFeedback;
