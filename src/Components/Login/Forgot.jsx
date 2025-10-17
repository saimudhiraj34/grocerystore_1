import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Forgot.css"


export const Forgot = () => {
  const [user, setUser] = useState({
    username: '',
    phonenumber: ''
  });

  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Request access to webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    captureImageAndSendForVerification();
  };

  const captureImageAndSendForVerification = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop()); // Stops each track (video/audio)
  
    videoRef.current.srcObject = null;
    canvas.toBlob(sendFaceForVerification);
  };

  const sendFaceForVerification = async (blob) => {
    const formData = new FormData();
    formData.append("image", blob, "capture.jpg");
    formData.append("username", user.username);
    formData.append("phonenumber", user.phonenumber);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND2}/verify_face`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        console.log("Face verified successfully.");
        navigate('/update')
      }
    } catch (err) {
      alert("Face verification failed.");
    
      console.error(err);
    }
  };
  return (
    <div className="forgot-container">
      <div className="forgot-form-container">
        <h2 className="forgot-title">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="forgot-form">
          <label className="forgot-label">Username</label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
            className="forgot-input"
          />
          <label className="forgot-label">Phone Number</label>
          <input
            type="number"
            name="phonenumber"
            value={user.phonenumber}
            onChange={handleChange}
            required
            className="forgot-input"
          />
          <button type="submit" className="forgot-button">
            Capture & Verify Face
          </button>
        </form>
        <video ref={videoRef} className="forgot-video" autoPlay muted />
        <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
      </div>
    </div>
  );};
