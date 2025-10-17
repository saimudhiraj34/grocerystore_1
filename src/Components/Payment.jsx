import React, { useState, useEffect } from "react";
import "./Payment.css";
import { Navbar } from "./Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Payment = () => {
  const [paymentuser, setpaymentuser] = useState({
    username: "",
    phonenumber: "",
    productname: "",
    price: "",
    quantity: "",
  });
  const [user, setUser] = useState({
    username: "",
    phonenumber: "",
    image: "",
  });

  const [products, setProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [showCreditModal, setShowCreditModal] = useState(false);

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setpaymentuser({ ...paymentuser, [name]: value });
  };

  const addProduct = async () => {
    if (
      !paymentuser.productname ||
      !paymentuser.price ||
      !paymentuser.quantity
    ) {
      toast.warning("Please fill all product details!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      // 1️⃣ GET: Check product stock
      const getRes = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${paymentuser.productname}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const getData = await getRes.json();
      if (!getRes.ok || !getData.success) {
        toast.error("Product not found!");
        return;
      }

      const productData = getData.cat[0];
      const availableStock = productData.stock;

      // 2️⃣ Check if stock is sufficient
      if (availableStock < parseInt(paymentuser.quantity)) {
        toast.warning(
          `Insufficient stock! Only ${availableStock} items available.`
        );
        return;
      }

      // 3️⃣ PUT: Update stock in backend
      const updatedStock = availableStock - parseInt(paymentuser.quantity);

      const putRes = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${paymentuser.productname}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: updatedStock }),
        }
      );

      const putData = await putRes.json();
      if (!putRes.ok || !putData.success) {
        toast.error("Error updating stock!");
        return;
      }

      // 4️⃣ Add product to frontend list
      const newProduct = {
        id: Date.now(),
        username: paymentuser.username,
        productName: paymentuser.productname,
        price: parseFloat(paymentuser.price),
        quantity: parseInt(paymentuser.quantity),
        total: parseFloat(paymentuser.price) * parseInt(paymentuser.quantity),
      };

      setProducts((prev) => [...prev, newProduct]);

      // 5️⃣ Clear input fields
      setpaymentuser({
        ...paymentuser,
        productname: "",
        price: "",
        quantity: "",
      });

      toast.success("✅ Product added and stock updated successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Something went wrong while adding product!");
    }
  };

  const removeProduct = async (id) => {
    const token = localStorage.getItem("token");

    // Find the product to remove
    const removedProduct = products.find((p) => p.id === id);
    if (!removedProduct) return;

    try {
      // 1️⃣ GET: Fetch current stock for that product
      const getRes = await fetch(
       `${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${removedProduct.productName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const getData = await getRes.json();
      if (!getRes.ok || !getData.success) {
        toast.error("Product not found!");
        return;
      }

      const productData = getData.cat[0];
      const currentStock = productData.stock;

      // 2️⃣ Add back the removed quantity
      const restoredStock = currentStock + removedProduct.quantity;

      // 3️⃣ PUT: Update stock in backend
      const putRes = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/prod/${removedProduct.productName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: restoredStock }),
        }
      );

      const putData = await putRes.json();
      if (!putRes.ok || !putData.success) {
        toast.error("Error updating stock back!");
        return;
      }

      // 4️⃣ Remove from frontend state
      setProducts(products.filter((p) => p.id !== id));

      toast.success(
        `🗑️ Product "${removedProduct.productName}" removed and stock restored successfully!`
      );
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("Something went wrong while removing product!");
    }
  };

  const getTotalAmount = () => {
    return products.reduce((sum, item) => sum + item.total, 0);
  };

  const handleProceedToPayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found! Please log in again.");
      return;
    }

    if (!paymentuser.username || !paymentuser.phonenumber) {
      toast.error("Please enter username and phone number first!");
      return;
    }

    try {
      // 1️⃣ Check if credit user exists
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/credit/check/${paymentuser.phonenumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      // 2️⃣ If exists → directly add to credit user
      if (data.exists) {
        await addToCreditUser();
      } else {
        toast.warning("add user below")
        setUser({
          username: paymentuser.username,
          phonenumber: paymentuser.phonenumber,
          image: "",
        });
        setShowCreditModal(true);
      }
    } catch (err) {
      console.error("Error checking credit user:", err);
    }
  };

  const handleCreateCreditUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in again.");
      return;
    }
    if (!user.username || !user.phonenumber || !user.image) {
      toast.warning("All fields are required!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/credit/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
        credentials: "include",
      });

      if (res.ok) {
        toast.success(
          "Credit user created successfully! Now click Proceed to Payment again."
        );
        setShowCreditModal(false);
      } else {
        toast.error("Failed to create credit user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCreditUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found! Please log in again.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/creditd/addmany/${paymentuser.phonenumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ products }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Added to Credit User successfully!");
        setProducts([]);
      } else {
        toast.error(data.message || "Failed to add to credit user");
      }
    } catch (err) {
      console.error("Error adding products:", err);
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
    <div className="billing-container">
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
      <div className="user-box">
        <h2>User Information</h2>
        <div className="user-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={paymentuser.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phonenumber"
              placeholder="Enter phone number"
              value={paymentuser.phonenumber}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="billing-card">
        <h1 className="page-title">Billing Page</h1>

        <div className="form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="productname"
              placeholder="Enter product name"
              value={paymentuser.productname}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={paymentuser.price}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              value={paymentuser.quantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="add-product-btn" onClick={addProduct}>
          + Add Product
        </button>
      </div>

      <div className="product-list-card">
        <h2 className="section-title">📦 Product List</h2>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p className="empty-title">No products added yet</p>
            <p className="empty-subtitle">
              Add your first product to get started
            </p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.username}</td>
                    <td>{p.productName}</td>
                    <td>₹{p.price}</td>
                    <td>{p.quantity}</td>
                    <td>₹{p.total}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeProduct(p.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total-amount">
              <span>Total Amount:</span>
              <span className="amount">₹{getTotalAmount()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="payment-card">
        <h2 className="section-title">Choose Payment Method</h2>

        <div className="payment-options">
          {["credit-card", "debit-card", "paypal", "credit-option"].map(
            (method, idx) => (
              <div
                key={idx}
                className={`payment-option ${
                  paymentMethod === method ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod(method)}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                <span className="payment-label">
                  {method
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                {paymentMethod === method && (
                  <span className="check-icon">✓</span>
                )}
              </div>
            )
          )}
        </div>

        <button className="proceed-btn" onClick={handleProceedToPayment}>
          ✓ Proceed to Payment
        </button>
      </div>
      {showCreditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Credit User</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={user.username}
                onChange={handleChangeUser}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phonenumber"
                value={user.phonenumber}
                onChange={handleChangeUser}
              />
            </div>
            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="profileFile"
              />
              <div className="file-hint">
                {user.image ? "Image chosen" : "No file chosen"}
              </div>
            </div>
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleCreateCreditUser}>
                Submit
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowCreditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
