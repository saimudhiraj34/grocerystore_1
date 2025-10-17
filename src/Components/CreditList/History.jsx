import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./History.css"; // ✅ Import the CSS file
import { Navbar } from "../Navbar/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Login/Loader";

export const History = () => {
  const { phonenumber, username } = useParams();
  const [historyData, setHistoryData] = useState([]);
  const[clear,setclear]=useState(false);

  const[load,setload]=useState(false);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/hist/get/${phonenumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setHistoryData(data.data);
      } else {
        console.error("Error:", data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } 
  };

  useEffect(() => {
    setload(true);
      const timer=setTimeout(()=>setload(false),7000);
    fetchHistory().finally(()=>{
      setload(false);
    })
    return ()=>clearTimeout(timer);
  }, [phonenumber]);

  const handledelete = async (phonenumber) => {
    setclear(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}/hist/delete/${phonenumber}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        toast.success("cleared successfully");
        fetchHistory();
      } else {
        console.log("Not deleted");
      }
    } catch (err) {
      console.log(err);
    }
    finally{
      setclear(false);
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
    <div className="history-container">
      <h2 className="history-header">Payment History of: {username}</h2>

      <button
        className="clear-btn"
        onClick={() => handledelete(phonenumber)}
      >{clear ? "clearing...":" Clear History"}
       
      </button>

      {load ? (
       <Loader/>
      ) : historyData.length === 0 ? (
        <p className="history-text">No payment history found.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                <td>{new Date(entry.Date).toLocaleDateString()}</td>
                <td>{entry.products}</td>
                <td>₹{entry.prices}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
};
