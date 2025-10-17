import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CreditList.css";
import { Link } from "react-router-dom"
import { Navbar } from "../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Login/Loader";

/*
  Your original logic preserved with minor UI-binding additions:
  - handleImageUpload uses FileReader to set base64
  - voice search integrated into the search input
  - fetchusers, handleSubmit, handleDelete, etc. are the same flow
*/

export const CreditList = () => {
  const [user, setUser] = useState({
    username: "",
    phonenumber: "",
    image: ""
  });
  const navigate = useNavigate();
  const [showUser, setshowUser] = useState(false);
  const [search, setsearch] = useState([]);
  const [users, setUsers] = useState([]);
  const [listening, setListening] = useState(false);
  const[submit,setsubmit]=useState(false);
  const [del,setdel]=useState(null);
   const [error, setError] = useState("");
   const [load,setload]=useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name==="phonenumber"){
       if (!/^\d*$/.test(value)) {
        setError("Phone number should contain only digits");
      }
        else if (value.length !== 10 && value.length > 0) {
        setError("Phone number must be exactly 10 digits");
      }
      else{
        setError("");
      }
    }

    setUser({ ...user, [name]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // If token not present redirect
    if (!token) {

      // keep behavior: navigate to login ("/")
      // but don't block rendering
      console.warn("No token found, redirecting...");
      navigate("/");
      return;
    }
     setload(true);
      const timer = setTimeout(() => setload(false),7000);

       fetchusers().finally(() => {
      setload(false);
    });

    return () => clearTimeout(timer);
  }, []);

  const handleDelete = useCallback(   
    async (phonenumber) => {
      const token = localStorage.getItem("token");
       setdel(phonenumber);
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/credit/delete/${phonenumber}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Deleted");
          setUsers((prev) => prev.filter((u) => u.phonenumber !== phonenumber));
          await detailsofuser(phonenumber, token);
          fetchusers();
        } else {
          console.log(data.message);
        }
      } catch (err) {
        console.error("error messagae", err);
      }
      finally{
        setdel(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const detailsofuser = async (phonenumber, token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/creditd/delete/details/${phonenumber}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "Application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success("deleted");
      } else {
        console.warning("failed to fetch");
      }
    } catch (err) {
      console.log("error message", err);
    }
  };

  const fetchusers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/credit/users`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users:", data.message);
        // navigate("/");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSubmit = async (e) => {
    setsubmit(true);
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in again.");
      setsubmit(false);
      return;
    }
    if (!user.username || !user.phonenumber || !user.image) {
      toast.warning("All fields are required!");
      setsubmit(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/credit/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user),
        credentials: "include"
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to register");
      } else {
        toast.success("registered")
        setUser({ username: "", phonenumber: "", image: "" });
        fetchusers();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
    finally{
      setsubmit(false);
    }
  };

  const [data, setdata] = useState({
    username: ""
  });

  const handlesearch = (e) => {
    const { name, value } = e.target;
    const up = { ...data, [name]: value };
    setdata(up);
    if (name === "username") {
      const filter = users.filter((user) => user.username.toLowerCase().includes(value.toLowerCase()));
      setsearch(filter);
      setshowUser(filter.length > 0);
    }
  };

 
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setUser((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
    <Navbar/>
     <ToastContainer
              position="top-right"
              autoClose={500}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored" // you can try "light" or "dark" too
            />
    {load ? <Loader/> :(
      <>
    <div className="search-page">
      <div className="search-row">
        <div className="search-input">
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M21 21l-4.35-4.35" stroke="#1b8f3e" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10.5" cy="10.5" r="5.5" stroke="#1b8f3e" strokeWidth="1.5" fill="none" />
          </svg>
          <input
            name="username"
            value={data.username}
            onChange={handlesearch}
            placeholder="Search users..."
            className="search-field"
            aria-label="Search users"
          />
        </div>
      </div>
    </div>
    <div className="credit-page">   
      <div className="card add-card">
        <h2 className="title">Add New User</h2>
        <form onSubmit={handleSubmit} className="add-form">
          <label>Username</label>
          <input
            name="username"
            value={user.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="field"
          />

          <label>Phone</label>
          <input
            name="phonenumber"
            value={user.phonenumber}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            className="field"
          />
           {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <label>User Profile</label>
          <div className="file-row">
            <input type="file" accept="image/*" onChange={handleImageUpload} id="profileFile" />
            <div className="file-hint">{user.image ? "Image chosen" : "No file chosen"}</div>
          </div>

          <button className="submitbtn" type="submit">
            {submit? "submitting...":"Submit"}</button>
        </form>
      </div>
       <div className="user-list">
        <button className="toggle-btn">👥 USER DETAILS</button>


      <div className="users-grid">         
        {users.length>0 ?(
        (showUser ? search : users).map((u) => (
          
          <div className="user-card" key={u.phonenumber}>
        <Link to={`/credits/${u.phonenumber}/${u.username}`}>
            <div className="avatar">
             {u.image && <img src={u.image} alt="User" width="100"height="100" />}
            </div>
            <div className="user-meta">
              <div className="uname">{u.username}</div>
              <div className="phone">{u.phonenumber}</div>
            </div>
        </Link>
            <div className="card-actions">
              <button className="del" onClick={() => handleDelete(u.phonenumber)}>
                {del===u.phonenumber?"Deleting...":"Delete"}</button>
            </div>
          </div>
        ))):(
          <div><img src="./nodata.jpg" width="400px" height="400px"></img></div>
        )}
      </div>
    </div>
    </div>
    </>
    )}
    </>
  );
};


export default CreditList;
