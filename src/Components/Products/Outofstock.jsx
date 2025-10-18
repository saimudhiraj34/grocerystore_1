import React, { useEffect, useState } from 'react';
import { Navbar } from '../Navbar/Navbar';
import "./Outofstock.css";
import Loader from '../Login/Loader';

export const Outofstock = () => {
  const [outprod, setoutprod] = useState([]);
  const[load,setload]=useState(false);

  const fetchoutofstock = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/pro/outofstock`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("Response status:", response.status); // Log the response status
        const data = await response.json();
        console.log("Response Data:", data.out);

        if (response.ok) {
          setoutprod(Array.isArray(data.out) ? data.out : []);
        } else {
            console.error("Error:", data.message);
            setoutprod([]);
        }
    } catch (error) {
        console.error("Error fetching out-of-stock products:", error);
    }
};

useEffect(() => {
  setload(true);

  fetchoutofstock()
    .catch((err) => {
      console.error("Error fetching out-of-stock items:", err);
    })
    .finally(() => {
      setload(false);
    });

}, []);


  return (
    <div className="outofstock-container">
      <Navbar />
      {load ?<Loader/>:(
      <>
      <h2 className="outofstock-title">Out of Stock Products</h2>
      {outprod.length ===0 ? (
        <p className="no-products">No Products Found</p>
      ) : (
        <div className="outofstock-grid">
          {outprod.map((product, index) => (
            <div className="outofstock-card" key={index}>
              <h3 className="product-name">{product.productname}</h3>
              {product.product_img && (
                <img
                  className="product-image"
                  src={product.product_img}
                  alt={product.productname}
                />
              )}
              <p className="product-detail">Price: ₹{product.price}</p>
              <p className="product-detail">Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};
