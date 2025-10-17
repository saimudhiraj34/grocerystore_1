import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Update.css"

export const Update = () => {
  const [form, setForm] = useState({
    phonenumber: '',
    newPassword: ''
  });
const navigate=useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/update_password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        // Redirect or show success
        console.log("Password updated successfully");
        navigate("/")

      }
    } catch (err) {
      console.error("Password update failed", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="update-container">
      <div className="update-form-container">
        <h2 className="update-title">Update Password</h2>
        <form onSubmit={handleSubmit} className="update-form">
          
          <label className="update-label">Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            value={form.phonenumber}
            onChange={handleChange}
            required
            className="update-input"
          />
  
          <label className="update-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            className="update-input"
          />
  
          <button type="submit" className="update-button">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
