import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./detailedcat.css";

const DetailedCategory = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { category } = useParams();
  const navigate = useNavigate();

  const handleGraph = (productname) => {
    navigate(`/SalesGraph/${productname}`);
  };

  const handleCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
       `${import.meta.env.VITE_REACT_APP_BACKEND}/prod/category/${category}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) setFilteredProducts(data.cat);
      else console.log("Something went wrong");
    } catch (err) {
      console.error("Error message", err);
    }
  };

  const handleDelete = async (productname) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/delete/${productname}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Deleted");
        setFilteredProducts(filteredProducts.filter(p => p.productname !== productname));
      } else {
        console.log(data.message);
      }
    } catch (err) {
      console.error("Error message", err);
    }
  };

  useEffect(() => {
    if (category) handleCategory();
  }, [category]);

  return (
    <div className="category-container">
      <Navbar />
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
              theme="colored"
            />
      <div className="categorybody">
        <h2 className="category-title">Category: {category}</h2>

        {filteredProducts.length === 0 ? (
          <p className="no-products-text">No products found</p>
        ) : (
          <div className="categories-grid">
            {filteredProducts.map((product) => (
              <div
                className={`categories-card ${
                  product.stock === 0 ? "out-of-stock" : ""
                }`}
                key={product.productname}
              >
                <div className="categories-image-wrapper">
                  {product.stock === 0 && (
                    <div className="out-of-stock-overlay">OUT OF STOCK</div>
                  )}
                  <img
                    src={product.product_img}
                    alt={product.productname}
                    className="categories-image"
                  />
                </div>

                <div className="categories-info">
                  <h3>{product.productname}</h3>
                  <p className="cat-price">Price: ₹{product.price}</p>
                  <p className="cat-desc">{product.description}</p>
                  <p className="cat-stock">
                    Stock: <span>{product.stock}</span>
                  </p>
                </div>

                <div className="cat-actions">
                  <button
                    className="graph-btn"
                    onClick={() => handleGraph(product.productname)}
                  >
                    Show Sales Graph
                  </button>

                  <Link to={`/update/${product.productname}`}>
                    <button className="update-btn">Update</button>
                  </Link>

                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleDelete(product.productname)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedCategory;
