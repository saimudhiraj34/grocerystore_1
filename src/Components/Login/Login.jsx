
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";


const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    phonenumber:"",
    shopname:"",
    address:""
    // file:""
  });
    const [loading, setLoading] = useState(false);
    const[resload,setresload]=useState(false);
       const [passwordError, setPasswordError] = useState("");
         const [showVideoPopup, setShowVideoPopup] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

const handlechange = (e) => {
  const { name, value } = e.target;

  // Convert all input values to lowercase (except password)
  let newValue = name === "password" ? value : value.toLowerCase();

  // Check password strength if the field is 'password'
  if (name === "password") {
    const password = value;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

     if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar || !isValidLength) {
        setPasswordError(
          "Password must have uppercase, lowercase, number, special character, and be at least 8 characters long."
        );
      } else {
        setPasswordError(""); // clear error
      }
    }
  setUser({ ...user, [name]: newValue });
};

  const handleRegister = () => {
    const container = document.querySelector(".container");
    if (!container.classList.contains("active")) {
      container.classList.add("active");
    }
  }; 

  const handlelogin = () => {
    document.querySelector(".container").classList.remove("active");
  };

  const submitlogin = async (e) => {
      setLoading(true); // start loader
  console.log(import.meta.env.VITE_REACT_APP_BACKEND); 
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/user/login`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(user),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successfully");
        navigate("/hero");
      } else {
        alert("Invalid credentials");
        navigate("/");
      }
    } catch (error) {
  
      console.error("Login error:", error);
    }
    finally {
      setLoading(false); // stop loader
    }
  };

  const startCamera = () => {
     setShowVideoPopup(true);
    return navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
    
  };

  const waitForVideoReady = () => {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (videoRef.current.readyState >= 2) {
          resolve();
        } else {
          requestAnimationFrame(checkReady);
        }
      };
      checkReady();
    });
  };

  const handleRegisterSubmit = async (e) => {
    setresload(true);
   
    e.preventDefault();

    if (!user.username || !user.password) {
      alert("Please enter username and password");
      return;
    }
    setShowVideoPopup(true);
    await startCamera();
    await waitForVideoReady();

    setTimeout(() => {
      captureImageAndSend();
    }, 500);
     // Short delay
  };

  const captureImageAndSend = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop()); // Stops each track (video/audio)
  
    videoRef.current.srcObject = null;
     setShowVideoPopup(false);
    canvas.toBlob(sendRegistrationData);
  };

  const sendRegistrationData = async (blob) => {
    const formData = new FormData();
    formData.append("image", blob, "capture.jpg");
    formData.append("username", user.username);
    formData.append("password", user.password);
    formData.append("phonenumber", user.phonenumber);
    formData.append("shopname",user.shopname);
    formData.append("address",user.address);
    // console.log(user.upload_file); 
    // formData.append("file", user.file); 

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND2}/register`, {
        method: "POST",
        headers: {
          // Remove content-Type from here
        },
        body: formData,
      });
      const data = await response.json();
      setMessage(data.message);
      alert(data.message);

      if (response.ok) {
        document.querySelector(".container").classList.remove("active");
      }
    } catch (err) {
      setMessage("Registration failed.");
    }
    finally{
      setresload(false);
    }
  };
  return (
    <>
    <div className="body">
    <div className="container">
      <div className="form-container signin">
             <h2 >Login</h2>
        <form onSubmit={submitlogin}>        
          <div className="username">
            <label style={{fontSize:'25px'}}>Username</label>
            <input 
           name="username"
           value={user.username}
           onChange={handlechange}
           placeholder="Username"
           required />
          </div>
          <div className="password">
            <label>Password</label>
            <input
             name="password"
             type="password"
             value={user.password}
             onChange={handlechange}
             placeholder="Password"
             required             
            />
          </div>

          <Link to="/forgot"><div>Do you forget the password </div></Link>

          {/* <div className="socialmedia">
            <span className="socialmedia icon">
              <FontAwesomeIcon icon={faInstagram} size="2x" color="white" />{" "}
            </span>
            <span className="socialmedia icon">
            <FontAwesomeIcon icon={faGithub} size="2x" color="white" />
              {/* Corrected Icon Usage */}
            {/* </span>
            <span className="socialmedia icon">
              <FontAwesomeIcon icon={faGithub} size="2x" color="white" />
              {/* Corrected Icon Usage */}
            {/* </span>
            <span className="socialmedia icon">
              <FontAwesomeIcon icon={faGithub} size="2x" color="white" />
              {/* Corrected Icon Usage */}
            {/* </span>
          </div> */}
      
    <button className="btn" type="submit" disabled={loading}>
    {loading ? <div className="spinner"></div> : "Login"}
  </button>
</form>

        
        
      </div>
      
      <div className="form-container register">
             <h2>Register</h2>
        <form onSubmit={handleRegisterSubmit}>        
          <div className="username">
            <label style={{fontSize:'25px'}}>Username</label>
            <input
                name="username"
                value={user.username}
                onChange={handlechange}
                placeholder="Username"
                required/>
          </div>
          <div className="password">
            <label style={{fontSize:'25px'}}>Password</label>
            <input
               name="password"
               type="password"
               value={user.password}
               onChange={handlechange}
               placeholder="Password"
               required
            />
          </div>
           {passwordError && <p style={{ color: "red" }}>{passwordError}</p>} 
          <div className="password">
            <label style={{fontSize:'25px'}}>Phone</label>
            <input
             name="phonenumber"
             type="phonenumber"
             value={user.phonenumber}
             onChange={handlechange}
             placeholder="Phonenumber"
             required             
            />
          </div>
          <div className="username">
            <label style={{fontSize:'25px'}}>shopname</label>
            <input
                name="shopname"
                value={user.shopname}
                onChange={handlechange}
                placeholder="shopname"
                required/>
          </div>
          <div className="username">
            <label style={{fontSize:'25px'}}>address</label>
            <input
                name="address"
                value={user.address}
                onChange={handlechange}
                placeholder="address"
                required/>
          </div>
          
          <br></br>
          <button className="btn" type="submit" disabled={resload}>
            {resload ? <div className="spinner"></div> : "Register"}
            </button>
        </form>
        <div>
        <video ref={videoRef} width="300" height="200" autoPlay></video>
        <canvas ref={canvasRef} width="300" height="200" style={{ display: 'none' }}></canvas>
        </div>
      </div>
      <div className="toggle-box">
        <div className="toggle-panel left"> 
          <h3>Welcome To StoreManager</h3>
           <p>Do you Have an Account</p> 
          <a><button  className="btn" onClick={handleRegister}>
            Register</button></a>        
        </div>
        <div className="toggle-panel right"> 
          <h3>Welcome To StoreManager</h3>
           <p>Do you Have an Account</p> 
          <a><button 
          className="btn"
          onClick={handlelogin}>Login</button></a>        
        </div>
      </div>
      

    </div>
    {showVideoPopup && (
  <div className="video-popup">
    <div className="video-content">
      <h3>Capturing Your Photo</h3>
      <video ref={videoRef} width="320" height="240" autoPlay></video>
      <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }}></canvas>
      <button className="btn" onClick={captureImageAndSend}>Capture & Continue</button>
    </div>
  </div>
)}

    </div>
    

    </>
    
  );
};

export default Login;
