import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  SentimentSatisfiedAlt as SentimentSatisfiedAltIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

const COLORS = ["#4caf50", "#ff9800", "#f44336"];

function Dashboard() {
  const [role, setRole] = useState("");
  const [managerData, setManagerData] = useState({});
  const [managerFeedbacks, setManagerFeedbacks] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editStrengths, setEditStrengths] = useState("");
  const [editImprovements, setEditImprovements] = useState("");
  const [editSentiment, setEditSentiment] = useState("");
  const [openRequest, setOpenRequest] = useState(false);
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [employees, setEmployees] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const location = useLocation();
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const respondedEmployeeId = location.state?.respondedEmployeeId;
  const filteredFeedbacks = managerFeedbacks.filter((fb) => {
    return (
      (!sentimentFilter || fb.sentiment === sentimentFilter) &&
      (!employeeFilter || fb.employee_id === parseInt(employeeFilter))
    );
  });

  const exportFeedbacksAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Manager Feedback Report", 20, 20);
    doc.setFontSize(12);

    let y = 30;

    managerData.feedbacks.forEach((fb, index) => {
      const empName = getEmployeeName(fb.employee_id) || "Unknown";
      const date = new Date(fb.created_at).toLocaleString();

      doc.text(`Feedback #${index + 1}`, 20, y);
      y += 8;
      doc.text(`Employee: ${empName}`, 25, y);
      y += 8;
      doc.text(`Sentiment: ${fb.sentiment}`, 25, y);
      y += 8;
      doc.text(`Strengths: ${fb.strengths}`, 25, y);
      y += 8;
      doc.text(`Improvements: ${fb.improvements}`, 25, y);
      y += 8;
      doc.text(`Date: ${date}`, 25, y);
      y += 12;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("Manager_Feedback_Report.pdf");
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/users/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const fetchFeedbackRequests = async () => {
    try {
      const res = await api.get("/feedback-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackRequests(res.data);
    } catch (err) {
      console.error("Failed to load feedback requests", err);
    }
  };

  const handleEdit = (fb) => {
    setEditData(fb);
    setEditStrengths(fb.strengths);
    setEditImprovements(fb.improvements);
    setEditSentiment(fb.sentiment);
    setOpenEdit(true);
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(
        `/feedbacks/${editData.id}`,
        {
          strengths: editStrengths,
          improvements: editImprovements,
          sentiment: editSentiment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenEdit(false);
      fetchManagerDashboard(); // Refresh updated feedback list
    } catch (error) {
      console.error("Failed to update feedback", error);
    }
  };

  const fetchManagerDashboard = async () => {
    try {
      const res = await api.get("/dashboard/manager", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagerData(res.data);
      setManagerFeedbacks(res.data.feedbacks); // ✅ Make sure this line is present
    } catch (err) {
      console.error("Failed to load manager dashboard", err);
    }
  };

  const fetchEmployeeDashboard = async () => {
    try {
      const res = await api.get("/dashboard/employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeData(res.data);
    } catch (err) {
      console.error("Employee dashboard error", err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get("/users/managers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers(res.data);
    } catch (err) {
      console.error("Error fetching managers", err);
    }
  };

  const getEmployeeName = (id) => {
    if (!employees || employees.length === 0) return id; // 🛡 Prevent crash
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.name || emp.email} (${emp.id})` : id;
  };

  const handleAcknowledge = async (id) => {
    try {
      await api.put(`/feedbacks/${id}/acknowledge`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeData((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, acknowledged: true } : fb))
      );
    } catch (error) {
      console.error("Failed to acknowledge feedback", error);
    }
  };

  useEffect(() => {
    if (location.state?.respondedEmployeeId) {
      console.log(
        "Removing responded card:",
        location.state.respondedEmployeeId
      ); // ✅ Debug

      setFeedbackRequests((prev) =>
        prev.filter(
          (req) =>
            req.employee_id !== Number(location.state.respondedEmployeeId)
        )
      );
      // Clear state from browser history so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.respondedRequestId) {
      const respondedId = Number(location.state.respondedRequestId);
      console.log("✅ Removing requestId:", respondedId);

      setFeedbackRequests((prev) => {
        const newList = prev.filter((req) => {
          console.log("🧪 Checking req.id:", req.id, "typeof:", typeof req.id);
          return Number(req.id) !== respondedId;
        });
        console.log("💡 After filter:", newList);
        return newList;
      });

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.role;
      setRole(userRole);

      if (userRole === "manager") {
        fetchManagerDashboard();
        fetchFeedbackRequests();
        fetchEmployees(); // 🔥 For displaying employee names
      } else if (userRole === "employee") {
        fetchEmployeeDashboard();
        fetchManagers();
      } else {
        console.error("Unknown role:", userRole);
      }
    } catch (e) {
      console.error("Token decode failed:", e);
      navigate("/login");
    }
  }, [token]);

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
        return sentiment;
    }
  };

  // const handleEdit = (fb) => {
  //   setEditData(fb);
  //   setOpenEdit(true);
  // };

  const handleRequestSubmit = async () => {
    try {
      await api.post(
        "/feedback-requests",
        {
          manager_id: selectedManagerId,
          message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      setMessage("");
      setSelectedManagerId("");
      setTimeout(() => {
        setOpenRequest(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to send feedback request", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #e0f7fa, #ede7f6)",
        py: 4,
        px: 2,
        position: "relative",
      }}
    >
      {/* Logout and Request Feedback Button */}
      <Box
        sx={{
          position: "fixed",
          top: 20, // distance from top
          right: 20, // distance from right
          zIndex: 1300, // make sure it stays above other components
        }}
      >
        {role === "employee" && (
          <Button
            onClick={() => setOpenRequest(true)}
            sx={{
              mr: 2, // adds space to the right

              background: "linear-gradient(to right, #42a5f5, #7e57c2)",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              "&:hover": {
                background: "linear-gradient(to right, #1e88e5, #673ab7)",
              },
            }}
          >
            Request Feedback
          </Button>
        )}
        <Tooltip title="Logout">
          <IconButton
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
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

      <Container maxWidth="lg">
        {/* Manager View */}
        {role === "manager" && (
          <>
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: "bold", mb: 5 }}
            >
              Manager Dashboard
            </Typography>
            <Button
              onClick={() => navigate("/create-feedback")}
              sx={{
                mb: 2,
                background: "linear-gradient(to right, #66bb6a, #43a047)",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "linear-gradient(to right, #388e3c, #2e7d32)",
                },
              }}
            >
              + Give Feedback
            </Button>
            <Typography variant="h6">
              Total Feedbacks Given: {managerData.total_feedback_given}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Sentiment Summary:
            </Typography>

            <Box display="flex" gap={2} mb={4}>
              {managerData.sentiment_summary &&
                Object.entries(managerData.sentiment_summary).map(
                  ([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      variant="outlined"
                    />
                  )
                )}
            </Box>

            {managerData.sentiment_summary && (
              <Box
                display="flex"
                gap={4}
                flexWrap="wrap"
                alignItems="flex-start"
              >
                {/* Pie Chart (Left Side) */}
                <Box>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={Object.entries(managerData.sentiment_summary).map(
                        ([k, v]) => ({
                          name: k,
                          value: v,
                        })
                      )}
                      dataKey="value"
                      outerRadius={100}
                      label
                    >
                      {Object.keys(managerData.sentiment_summary).map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </Box>

                {/* Feedback Requests (Right Side) */}
                {feedbackRequests.length > 0 && (
                  <Box
                    sx={{
                      flex: 1,
                      maxHeight: 400,
                      overflowY: "auto",
                      minWidth: 300,
                      pr: 1,
                      borderLeft: "2px solid #ccc",
                      pl: 2,
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Feedback Requests from Employees
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {feedbackRequests.map((req) => (
                        <Grid item xs={12} key={req.id}>
                          <Card
                            sx={{
                              borderLeft: "5px solid #42a5f5",
                              borderRadius: 2,
                            }}
                          >
                            <CardContent>
                              <Typography>
                                <strong>Employee:</strong>{" "}
                                {getEmployeeName(req.employee_id)}
                              </Typography>
                              <Typography>
                                <strong>Message:</strong> {req.message}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                <strong>Date:</strong>{" "}
                                {new Date(req.created_at).toLocaleString()}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() =>
                                  navigate(
                                    `/create-feedback/${req.employee_id}`,
                                    {
                                      state: { requestId: req.id },
                                    }
                                  )
                                }
                              >
                                Respond
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              Feedbacks Given:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                mb: 3,
              }}
            >
              {/* Filter by Sentiment */}
              <FormControl
                size="small"
                sx={{
                  minWidth: 170,
                  backgroundColor: "#f5f7fa",
                  borderRadius: 2,
                  boxShadow: 1,
                  "& .MuiInputLabel-root": {
                    fontWeight: 500,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#90caf9",
                    },
                    "&:hover fieldset": {
                      borderColor: "#42a5f5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1e88e5",
                    },
                  },
                }}
              >
                <InputLabel id="sentiment-label">Sentiment</InputLabel>
                <Select
                  labelId="sentiment-label"
                  value={sentimentFilter}
                  label="Sentiment"
                  onChange={(e) => setSentimentFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="positive">🌟 Positive</MenuItem>
                  <MenuItem value="neutral">😐 Neutral</MenuItem>
                  <MenuItem value="negative">⚠️ Negative</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters Button */}
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setSentimentFilter("");
                  setEmployeeFilter("");
                }}
                sx={{
                  textTransform: "none",
                  height: 40,
                  fontWeight: "bold",
                  background: "linear-gradient(to right, #42a5f5, #1e88e5)",
                  color: "white",
                  boxShadow: 2,
                  borderRadius: 2,
                  "&:hover": {
                    background:
                      "linear-gradient(to right,rgb(198, 80, 1),rgb(185, 194, 204))",
                  },
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={exportFeedbacksAsPDF}
                sx={{
                  textTransform: "none",
                  height: 40,
                  fontWeight: "bold",
                  background:
                    "linear-gradient(to right,rgb(110, 30, 30),rgb(255, 4, 4))",
                  color: "white",
                  boxShadow: 2,
                  borderRadius: 2,
                  "&:hover": {
                    background:
                      "linear-gradient(to right,rgb(0, 163, 30),rgb(185, 194, 204))",
                  },
                }}
              >
                Export PDF
              </Button>
            </Box>

            <Grid container spacing={3}>
              {filteredFeedbacks?.map((fb) => (
                <Grid item xs={12} md={6} key={fb.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardContent>
                      <Typography>
                        <strong>Employee:</strong>{" "}
                        {getEmployeeName(fb.employee_id)}
                      </Typography>

                      <Typography>
                        <strong>Strengths:</strong> {fb.strengths}
                      </Typography>
                      <Typography>
                        <strong>Improvements:</strong> {fb.improvements}
                      </Typography>
                      <Typography>
                        <strong>Sentiment:</strong>{" "}
                        {renderSentiment(fb.sentiment)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Date:</strong>{" "}
                        {new Date(fb.created_at).toLocaleString()}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEdit(fb)}
                        sx={{
                          mt: 1,
                          background:
                            "linear-gradient(to right, #42a5f5, #1e88e5)",
                          fontWeight: "bold",
                          textTransform: "none",
                          "&:hover": {
                            background:
                              "linear-gradient(to right, #1e88e5, #1565c0)",
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {/* Employee View */}
        {role === "employee" && (
          <>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold", mb: 4 }}
            >
              My Feedback Timeline
            </Typography>

            {employeeData.length === 0 ? (
              <Typography align="center" variant="body1">
                No feedback found.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {employeeData.map((fb) => (
                  <Grid item xs={12} md={6} key={fb.id}>
                    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                      <CardContent>
                        <Typography>
                          <strong>Strengths:</strong> {fb.strengths}
                        </Typography>
                        <Typography>
                          <strong>Improvements:</strong> {fb.improvements}
                        </Typography>
                        <Typography>
                          <strong>Sentiment:</strong>{" "}
                          {renderSentiment(fb.sentiment)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong>{" "}
                          {new Date(fb.created_at).toLocaleString()}
                        </Typography>
                        <Box mt={1} display="flex" alignItems="center" gap={1}>
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
                          {!fb.acknowledged && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleAcknowledge(fb.id)}
                              sx={{
                                background:
                                  "linear-gradient(to right, #42a5f5, #7e57c2)",
                                fontWeight: "bold",
                                textTransform: "none",
                                "&:hover": {
                                  background:
                                    "linear-gradient(to right, #1e88e5, #673ab7)",
                                },
                              }}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
      {/* Feedback Request Dialog */}
      <Dialog
        open={openRequest}
        onClose={() => setOpenRequest(false)}
        fullWidth
      >
        <DialogTitle>Request Feedback</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Manager</InputLabel>
            <Select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              label="Select Manager"
            >
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name || manager.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Message"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {success && (
            <Typography sx={{ color: "green", mt: 1 }}>
              Request sent successfully!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequest(false)}>Cancel</Button>
          <Button
            onClick={handleRequestSubmit}
            variant="contained"
            disabled={!message.trim() || !selectedManagerId}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            label="Strengths"
            fullWidth
            margin="normal"
            value={editStrengths}
            onChange={(e) => setEditStrengths(e.target.value)}
          />
          <TextField
            label="Improvements"
            fullWidth
            margin="normal"
            value={editImprovements}
            onChange={(e) => setEditImprovements(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Sentiment</InputLabel>
            <Select
              value={editSentiment}
              onChange={(e) => setEditSentiment(e.target.value)}
              label="Sentiment"
            >
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={
              !editStrengths.trim() ||
              !editImprovements.trim() ||
              !editSentiment.trim()
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;
