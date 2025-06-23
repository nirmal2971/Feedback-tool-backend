import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/dashboard" style={{ marginRight: "15px" }}>Dashboard</Link>
      <Link to="/create-feedback" style={{ marginRight: "15px" }}>Create Feedback</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;