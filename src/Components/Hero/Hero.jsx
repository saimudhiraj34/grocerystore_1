import React, { useEffect, useState } from "react";
import './Hero.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "../Navbar/Navbar";
import { Link } from "react-router-dom";

export const Hero=()=>{
  const [outprod, setoutprod] = useState([]);
  const [Users, setUsers] = useState([]);
  const [sale, setsale] = useState([]);
  const [data, setData] = useState({ category: "", search: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setshowSearch] = useState(false);
  const [searchUser, setSearchUser] = useState([]);
  const [showUser, setshowUser] = useState(false);
  const [highsale, sethighsale] = useState([]);
  const [showhigh, setshowhigh] = useState(false);
  const [listening, setListening] = useState(false);

  const fetchoutofstock = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/pro/outofstock`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setoutprod(Array.isArray(data.out) ? data.out : []);
      } else {
        setoutprod([]);
      }
    } catch (error) {
      console.error("Error fetching out-of-stock products:", error);
    }
  };

  const fetchTopSellingProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/pro/top-selling`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data) {
        setsale(Array.isArray(data.topProducts) ? data.topProducts : []);
      }
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
    }
  };

  const fetchusers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/credit/users`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handlecategory = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...data, [name]: value };
    setData(updatedData);

    if (name === "search") {
      if (updatedData.category === "outofstock" && value.trim() !== "") {
        const filter = outprod.filter((product) =>
          product.productname.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(filter);
        setshowSearch(filter.length > 0);
      } else {
        setSearchResults([]);
        setshowSearch(false);
      }

      if (updatedData.category === "creditlist" && value.trim() !== "") {
        const filter = Users.filter((user) =>
          user.username.toLowerCase().includes(value.toLowerCase())
        );
        setSearchUser(filter);
        setshowUser(filter.length > 0);
      } else {
        setSearchUser([]);
        setshowUser(false);
      }

      if (updatedData.category === "highsales" && value.trim() !== "") {
        const filter = sale.filter((prod) =>
          prod.productname.toLowerCase().includes(value.toLowerCase())
        );
        sethighsale(filter);
        setshowhigh(filter.length > 0);
      } else {
        sethighsale([]);
        setshowhigh(false);
      }
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    setListening(true);
    recognition.start();

    const timeout = setTimeout(() => {
      recognition.stop();
    }, 12000);

    recognition.onresult = (event) => {
      let speechText = event.results[event.results.length - 1][0].transcript;
      speechText = speechText.trim().replace(/[.,!?;:]+$/, "").toLowerCase();
      setData((prev) => ({ ...prev, search: speechText }));
      handlecategory({ target: { name: "search", value: speechText } });
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      clearTimeout(timeout);
    };

    recognition.onend = () => {
      setListening(false);
      clearTimeout(timeout);
    };
  };

  useEffect(() => {
    fetchoutofstock();
    fetchusers();
    fetchTopSellingProducts();
  }, []);

  return (
    <div className="page-container">
      {/* Navbar */}
    <Navbar/>

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">Dear,<b>Merchant</b></h1>
        <p className="hero-subtitle">
          Track your <span className="highlight">stock</span>. Track your <span className="highlight">users</span>.
          <span className=""> Track your <span className="highlight">High_sales</span></span>
        </p>
      </header>

      {/* Search Section */}
      <div className="filter-search">
        <select className="filter-dropdown" name="category" value={data.category} onChange={handlecategory}>
          <option value="outofstock">OutOfStock</option>
          <option value="creditlist">CreditList</option>
          <option value="highsales">HighSales</option>
        </select>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            name="search"
            value={data.search}
            onChange={handlecategory}
          />
          <button className="search-btn">
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button  className="mic-btn"onClick={handleVoiceSearch} style={{ cursor: "pointer", fontSize: "16px" }}>🎤</button>
          {listening && <span style={{ color: "red", fontWeight: "bold" }}>Listening...</span>}
        </div>
      </div>

      {/* Out Of Stock Section */}
       <h2>Out of Stock</h2>
      <section className="product-grid">
      {outprod.length>0 ?(
        (showSearch ? searchResults : outprod).map((product, index) => (
          <div key={index} className="product-card">
            {product.product_img ? (
              <img src={product.product_img} alt={product.productname} width="200" height="200" />
            ) : (
              <div className="placeholder-img">❌</div>
            )}
            <p>{product.productname}</p>
            <s>${product.price}</s>
          </div>
        ))
        ): 
        <div><img src="./nodata.jpg" width="200px" height="200px"></img></div>
        }
      </section>

      {/* Credit List Section */}
        <h2>Credit Users</h2>
      <section className="product-grid">
        {Users.length>0? (
        (showUser ? searchUser : Users).map((user, index) => (
         <Link to={`/credits/${user.phonenumber}/${user.username}`}>
          <div key={index} className="product-card">
            {user.image ? (
              <img src={user.image} alt={user.username} width="180" height="200" />
            ) : (
              <div className="placeholder-img">👤</div>
            )}
            <p>{user.username}</p>
            <p>{user.total}</p>
          </div>
        </Link>
        ))
        ): 
        <div><img src="./nodata.jpg" width="200px" height="200px"></img></div>
        }
      </section>

      {/* High Sales Section */}
        <h2>High Sales</h2>
        <section className="product-grid">
        {(sale && sale.length > 0)? (
          (showhigh ? highsale : sale).map((product, index) => (
            <div key={index} className="product-card">
              {product.product_img ? (
                <img src={product.product_img} alt={product.productname} width="200" height="200" />
              ) : (
                <div className="placeholder-img">💹</div>
              )}
              <p>{product.productname}</p>
                <p>📈 Sales: {product.salesCount}</p>
              <s>${product.price}</s>
            
            </div>
          ))
          ):(
          <div><img src="./nodata.jpg" width="200px" height="200px"></img></div>
          )}
        </section>
      </div>
    );
  }
