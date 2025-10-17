import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";
import { Navbar } from "../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Products = () => {
  const navigate = useNavigate();
  const [Products, setProducts] = useState(false);
  const handleproduct = () => setProducts(true);

  const [prod, setprod] = useState({
    productname: "",
    price: "",
    product_img: "",
    description: "",
    category: "",
    stock: "",
  });

  const handlecategory = (category) => {
    navigate(`/detailcat/${category}`);
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setprod({ ...prod, [name]: value });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setprod((prev) => ({ ...prev, product_img: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prod),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Registered successfully!");
        setprod({
          productname: "",
          price: "",
          product_img: "",
          description: "",
          category: "",
          stock: "",
        });
        setProducts(false);
      } else {
        toast.error("Failed to register: " + data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const categories = [
    {
      title: "Fruits & Vegetables",
      items: [
        { name: "Fruits", img: "./fruits.jpeg" },
        { name: "Vegetables", img: "./vegetables.jpeg" },
        { name: "Organic", img: "/organic.jpeg" },
        { name: "Herbs", img: "/herbs.jpeg" },
      ],
    },
    {
      title: "Dairy & Eggs",
      items: [
        { name: "Milk", img: "/milk.jpeg" },
        { name: "Cheese", img: "/cheese.jpeg" },
        { name: "Yogurt", img: "/yogurt.jpeg" },
        { name: "Eggs", img: "/eggs.jpeg" },
      ],
    },
    {
      title: "Bakery & Beverages",
      items: [
        { name: "Breads", img: "/bread.jpeg" },
        { name: "Cakes", img: "/cake.jpeg" },
        { name: "Cookies", img: "/cookies.jpeg" },
        { name: "Buns & Rolls", img: "/bunrolls.jpeg" },
      ],
    },
    {
      title: "Beverages",
      items: [
        { name: "Tea & Coffee", img: "/teacoffee.jpeg" },
        { name: "Soft Drinks", img: "/softdrinks.jpeg" },
        { name: "Juices", img: "/juices.jpeg" },
        { name: "Energy Drinks", img: "/energydrinks.jpeg" },
      ],
    },
    {
      title: "Snacks & Packaged Foods",
      items: [
        { name: "Chips & Namkeens", img: "/chips.jpeg" },
        { name: "Chocolates & Candies", img: "/chocolate.jpeg" },
        { name: "Instant Noodles", img: "/noodles.jpeg" },
        { name: "Popcorn & Dry Snacks", img: "/drysnacks.jpeg" },
      ],
    },
    {
      title: "Grocery & Staples",
      items: [
        { name: "Rice & Grains", img: "/rice.jpeg" },
        { name: "Pulses & Lentils", img: "/pulses.jpeg" },
        { name: "Edible Oils", img: "/oils.jpeg" },
        { name: "Flour & Atta", img: "/atta.jpeg" },
      ],
    },
  ];

  return (
    <>
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
                    theme="colored" // you can try "light" or "dark" too
                  />
      {!Products ? (
        <div className="productsbody">
          <div className="productstitle">
            <h2>Categories</h2>
          </div>

          <div className="addbtn-out">
            <button className="addbtn" onClick={handleproduct}>
              + Add Product
            </button>
          </div>

          <div className="categories-container">
            {categories.map((cat, i) => (
              <div className="category-card" key={i}>
                <h3>{cat.title}</h3>
                <div className="category-out">
                  <div className="category-grid">
                    {cat.items.map((item, j) => (
                      <div
                        className="category-item"
                        key={j}
                        onClick={() => handlecategory(item.name)}
                      >
                        <img src={item.img} alt={item.name} />
                        <p>{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handlesubmit} className="add-products-page">
          <div className="add-product-details">
            <h2>Add a New Product</h2>

            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                name="productname"
                placeholder="Enter product name"
                value={prod.productname}
                onChange={handlechange}
              />
            </div>

            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={prod.price}
                onChange={handlechange}
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={prod.description}
                onChange={handlechange}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={prod.category}
                onChange={handlechange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) =>
                  cat.items.map((item, index) => (
                    <option key={`${cat.title}-${index}`} value={item.name}>
                      {item.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="form-group">
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                placeholder="Enter stock"
                value={prod.stock}
                onChange={handlechange}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Add Product
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setProducts(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );
};
