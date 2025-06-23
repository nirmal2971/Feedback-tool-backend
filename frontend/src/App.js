import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FeedbackHistory from "./pages/FeedbackHistory";
import CreateFeedback from "./pages/CreateFeedback";
import Navbar from "./pages/Navbar";
import RequestFeedback from "./pages/RequestFeedback";
import "./App.css";

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/feedback" element={<FeedbackHistory />} />
        <Route
          path="/create-feedback/:employeeId"
          element={<CreateFeedback />}
        />
        <Route path="/create-feedback" element={<CreateFeedback />} />

        <Route path="/request-feedback" element={<RequestFeedback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
