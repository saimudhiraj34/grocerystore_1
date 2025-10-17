import React, { useEffect, useState } from "react";
import "./Profile.css";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Login/Loader";


export const Profile = () => {
  const [profile, setProfile] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [backendImage, setBackendImage] = useState("");
  const [load,setload]=useState(false);


  useEffect(() => {
        setload(true);
    const timer=setTimeout(()=>setload(false),5000);
    fetchProfile().finally(()=>{
      setload(false);
    })
    return ()=>clearTimeout(timer);
    }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/profile-image`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.user);
        if (data.user.profile_image) setBackendImage(data.user.profile_image);
      } else {
        toast.error("update profile to see data")
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Please select an image first.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/profile-image`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_img: base64Image }),
        });

        if (res.ok) {
          toast.success("Image updated successfully");
          fetchProfile();
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    };
    reader.readAsDataURL(selectedFile);
  };


  return (
    <div className="profile-page">
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // you can try "light" or "dark" too
      />
      {load ? <Loader/>:(
        <>
      <div className="profile-card">
        <h2 className="profile-title">Profile</h2>

        <div className="profile-image-section">
          <div className="image-wrapper">
            {backendImage ? (
              <img src={backendImage} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
            <label className="upload-btn">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              📷
            </label>
          </div>
        </div>

        <div className="profile-details">
          <div className="input-group">
            <label>User Name</label>
            <input type="text" value={profile.username || ""}/>
          </div>

          <h3>Shop Information</h3>

          <div className="input-group">
            <label>Shop Name</label>
            <input type="text" value={profile.shopname || ""}/>
          </div>

          <div className="input-group">
            <label>Shop Address</label>
            <input type="text" value={profile.address || ""} />
          </div>

          <button className="update-btn" onClick={handleUpload}>
            Update Profile
          </button>

          <Link to="/hero" className="back-link">
            ← Back
          </Link>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
