import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Forgot.css"
import Loader from "../Login/Loader";


export const Forgot = () => {
  const [user, setUser] = useState({
    username: '',
    phonenumber: ''
  });
    const [form, setForm] = useState({
      phonenumber: '',
      newPassword: ''
    });
    const[lo,setlo]=useState(false);
     const[loader,setloader]=useState(false);
     const[update,setupdate]=useState(false);
      const handleChangeupdate = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
      };
  const navigate = useNavigate();
  const [load,setload]=useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer=setTimeout(()=>{setlo(false),5000});
    
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
    
      return()=>{clearTimeout(timer)};
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmitupdate = async (e) => {
    setloader(true);
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
    finally{
      setloader(false);
    }
  };
  const handleSubmit = (e) => {
    setload(true);
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
       setupdate(true);
      }
    } catch (err) {
      alert("Face verification failed.");    
      console.error(err);
    }
  };
  return (
    <>
    {!update &&(
      
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
            {load ? "Verifying...": "Capture & Verify Face"}
          </button>
        </form>
        <video ref={videoRef} className="forgot-video" autoPlay muted />
        <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
      </div>
    </div>
    )}

    {update && (
      <div className="update-container">
      <div className="update-form-container">
        <h2 className="update-title">Update Password</h2>
        <form onSubmit={handleSubmitupdate} className="update-form">
          
          <label className="update-label">Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            value={form.phonenumber}
            onChange={handleChangeupdate}
            required
            className="update-input"
          />
  
          <label className="update-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChangeupdate}
            required
            className="update-input"
          />
  
          <button type="submit" className="update-button">
           {loader ? "Loading..." :"update_password"}
          </button>
        </form>
      </div>
    </div>
    )}
    </>
    
  );};
