import React from 'react'
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import "./Updatestock.css"
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from '../Login/Loader';

export const Updatestock = () => {
  const { productname } = useParams();
  const[update,setupdate] =useState(false);
  const [productData, setProductData] = useState({
    category: '',
    name: '',
    price: 0,
    image: '',
    stock: 0,
  });
  const navigate=useNavigate();
  const [error, setError] = useState('');
  const[load,setload]=useState(false); 
    const fetchProduct = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${productname}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          const product = data.cat[0]; // Extracting the first product
          setProductData({
            category: product.category,
            name: product.productname,
            price: product.price,
            image: product.product_img,
            stock: product.stock,
          });
   
        } else {
          setError(data.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to fetch product data");
      } 
    };
useEffect(() => {
  setload(true);

  // Call your async function and handle loader via promise
  fetchProduct()
    .catch((err) => {
      console.error("Error fetching product:", err);
    })
    .finally(() => {
      setload(false);
    });

  return () => {
    // Optional: cancel any pending side effects
    // (Promise can't be truly cancelled, but cleanup avoids leaks)
  };
}, []);

  const handleUpdateStock = async () => {
    const token = localStorage.getItem("token");
    setupdate(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${productname}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ stock: productData.stock })
      });

      const data = await response.json();
     if (response.ok) {
  toast.success("Stock updated successfully!", {
    onClose: () => {
      navigate(`/detailcat/${data.cat.category}`);
    },
  });
  await fetchProduct();
} else {
        toast.error(data.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.warning("Something went wrong");
    }
    finally{
      setupdate(false);
    }
  };

  const incrementStock = () => {
    setProductData((prev) => ({
      ...prev,
      stock: prev.stock + 1,
    }));
  };

  const decrementStock = () => {
    setProductData((prev) => ({
      ...prev,
      stock: prev.stock > 0 ? prev.stock - 1 : 0,
    }));
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
      {load ?<Loader/>:(
        <>
    <div className="product-container">
      <h1 className="product-header">Update Stock for <span className="product-title"><h2>{productData.name}</h2></span></h1>
  
      <div className="details-container">
        <div className="image-container">
          <img src={productData.image} alt={productData.name}          
     />
        </div>
  
        <div className="info-container">
          <p><strong>Category:</strong> {productData.category}</p>
          <p><strong>Price:</strong> ${productData.price}</p>
          <p><strong>Stock:</strong> {productData.stock}</p>
        </div>
      </div>
  
      <div className="stock-control-container">
        <button onClick={decrementStock} className="decrease-btn">-</button>
  
        <div className="stock-display">{productData.stock}</div>
  
        <button onClick={incrementStock} className="increase-btn">+</button>
      </div>
  
      <button onClick={handleUpdateStock} className="submit-btn">{update ?"updating..." :"Update Stock"}</button>
    </div>
    </>
      )}
    </>
  );
  
};


