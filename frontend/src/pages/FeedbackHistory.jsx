import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch feedbacks
  const fetchFeedback = async () => {
    try {
      const res = await api.get("/my-feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setFeedbacks(sorted);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [token]);

  // Optimistic update for acknowledge
  const handleAcknowledge = async (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, acknowledged: true } : fb))
    );

    try {
      await api.put(`/feedbacks/${id}/acknowledge`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Acknowledge failed", err);
      // Revert on error
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, acknowledged: false } : fb))
      );
    }
  };

  const renderSentiment = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return (
          <Chip
            icon={<SentimentSatisfiedAltIcon />}
            label="Positive"
            color="success"
          />
        );
      case "neutral":
        return (
          <Chip
            icon={<SentimentNeutralIcon />}
            label="Neutral"
            color="warning"
          />
        );
      case "negative":
        return (
          <Chip
            icon={<SentimentVeryDissatisfiedIcon />}
            label="Negative"
            color="error"
          />
        );
      default:
        return <Chip label={sentiment} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0f7fa, #ede7f6)",
        py: 5,
        px: 2,
        position: "relative",
      }}
    >
      {/* Logout Button */}
      <Tooltip title="Logout">
        <IconButton
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "linear-gradient(to right, #f06292, #7e57c2)",
            color: "#fff",
            borderRadius: "12px",
            p: 1.2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            "&:hover": {
              background: "linear-gradient(to right, #ec407a, #673ab7)",
            },
            zIndex: 1000,
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>

      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#512da8", mb: 4 }}
        >
          My Feedback History
        </Typography>

        {feedbacks.length === 0 ? (
          <Typography align="center" variant="body1">
            No feedback found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {feedbacks.map((fb) => {
              // 🐞 Add this debug log!
              console.log(
                "ID:",
                fb.id,
                "acknowledged:",
                fb.acknowledged,
                "Type:",
                typeof fb.acknowledged
              );

              return (
                <Grid item xs={12} md={6} key={fb.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle1">
                          <strong>Strengths:</strong> {fb.strengths}
                        </Typography>
                        <Typography variant="subtitle1">
                          <strong>Improvements:</strong> {fb.improvements}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1">
                            <strong>Sentiment:</strong>
                          </Typography>
                          {renderSentiment(fb.sentiment)}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong>{" "}
                          {new Date(fb.created_at).toLocaleString()}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mt={1}
                        >
                          <Chip
                            label={
                              fb.acknowledged
                                ? "Acknowledged"
                                : "Not Acknowledged"
                            }
                            color={fb.acknowledged ? "success" : "default"}
                            icon={
                              fb.acknowledged ? (
                                <CheckCircleIcon />
                              ) : (
                                <CancelIcon />
                              )
                            }
                          />
                          {/* ✅ This condition must evaluate to true to show button */}
                          {!fb.acknowledged && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleAcknowledge(fb.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default FeedbackHistory;
