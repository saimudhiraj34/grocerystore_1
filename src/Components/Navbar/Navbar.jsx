import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser } from "react-icons/fa";
export const Navbar = ({ Products, setProducts }) => {
  useEffect(() => {
    fetchlogin();
  }, []);

  const [profile, setprofile] = useState([]);
  const [backendImage, setBackendImage] = useState("");
  const navigate = useNavigate();

  const fetchlogin = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/profile-image`, {
        method: "GET",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setprofile(data.user);
        if (data.user.profile_image) {
          setBackendImage(data.user.profile_image); // Set base64 string from the backend
        }
      } else {
        console.log("");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        navigate("/");
        throw new Error("Logout failed");
      }
      localStorage.removeItem("token");
      alert("Logged out successfully");
      window.location.href = "/"; // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
return (

  

     <nav className="navbar">
        <div className="logo">🛒 GroceryStore</div>
          <ul className="nav-links">
          <Link to="/hero"><li>Home</li></Link>
          <Link to="/products"><li>Products</li></Link>
          <Link to="/creditlist"><li>Credits</li></Link>
          <Link to="/outofstock"><li>OutOfStock</li></Link>
          <Link to="/payment"><li>Payment</li></Link>
        </ul>

      {/* Right Section: User */}
      <div className="user-section">
       <Link to="/profile"> <FaUser className="user-icon" /></Link>
        <span className="username"><h3>{profile.username}</h3></span>
        <button onClick={handleLogout}className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};
