import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import "./Creditlistdetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../Login/Loader";
export const Creditlistdetail = () => {
  const { phonenumber,username } = useParams();
  const [creditDetails, setCreditDetails] = useState({
    products: "",
    prices: "",
  });
  const navigate=useNavigate();
  const [userCredits, setUserCredits] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [load,setload]=useState(false);
  const [del,setdel]=useState(null);
  const [pay,setpay]=useState(null)


  const handlechange = (e) => {
    const { name, value } = e.target;
    setCreditDetails({ ...creditDetails, [name]: value });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    console.log("Credit Details:", creditDetails); 
    try {

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/creditd/add/${phonenumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${token}`,
        },
        body: JSON.stringify(creditDetails),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Credit details added successfully!");
        setCreditDetails({ products: "", prices: "" });
        fetchCreditDetails();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error submitting data:", err);
      toast.error("Failed to submit credit details");
    } finally {
      setLoading(false);
    }
  };
const handledelete=async(id)=>{
  setdel(id);
  try{
  const token=localStorage.getItem("token")
   const res=await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/creditd/delete/${id}`,{
    method:"DELETE",
    headers:{     
      Authorization:`Bearer ${token}`,
    }
   })
   if(res.ok){
    toast.success("deleted");
    fetchCreditDetails();
   }
   else{
    console.log("failed")
   }
  }
   catch(err){
  console.error("error",err)
   }
   finally{
    setdel("");
   }
}
const handlepay=async(credit)=>{
  setpay(credit);
  const token=localStorage.getItem("token")
  console.log(credit.products,credit.prices,credit.Date)
     try{
      const res=await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/hist/add/${phonenumber}`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          products: credit.products,
          prices: credit.prices,
          Date: credit.Date,
        }),
      })
      if(res){
        toast.success("Payed Successfully");
        await handledelete(credit._id)
        fetchCreditDetails();
      }
      else{
        console.log("failed");
      }
     }
     catch(err){
      console.err("error",err);
     }
     finally{
     setpay("");
     }
     
}

  // ✅ Fetch Credit Details & Calculate Total Price
  const fetchCreditDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/creditd/${phonenumber}`,{       
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserCredits(data.data);

        const total = data.data.reduce((sum, credit) => sum + parseFloat(credit.prices), 0);
        setTotalPrice(total);
      } else {
        console.error("Failed to fetch:", data.message);
      }
    } catch (err) {
      console.error("Error fetching credit details:", err);
    }
  };

  useEffect(() => {
    setload(true)
     const token=localStorage.getItem("token");
    if(!token){
      navigate("/"); 
    }
    const timer=setTimeout(()=>setload(false),7000);
    fetchCreditDetails().finally(()=>{
      setload(false);
    })
    return ()=>clearTimeout(timer);

   
  }, []);

  return (
    <div className="credit-detail-container">
      <Navbar />
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

      <div className="creditouter">
        <div className="creditinnner">
          <form onSubmit={handlesubmit}>
            <h2>
              Credit Details for {username}  
              <span className="total-price"> (Total: ₹{totalPrice})</span>
            </h2>
            <div className="input-group">
              <label>Product:</label>
              <input type="text" name="products" placeholder="Product"value={creditDetails.products} onChange={handlechange} required />
            </div>

            <div className="input-group">
              <label>Price:</label>
              <input type="text" name="prices" placeholder="price"value={creditDetails.prices} onChange={handlechange} required />
            </div>

            <button className="creditbtn" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
          </form>
        </div>

         <div className="credit-list">
        <h2>Credit History  <Link to={`/hist/${username}/${phonenumber}`}><button className="creditbtn">Previous History</button></Link></h2>
        <br></br>
       
        {userCredits.length > 0 ? (
          <table className="credit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>Total Price (₹)</th>
                <th>Payed</th>
                <th>Delete</th>               
              </tr>
            </thead>
            <tbody>
              {userCredits.map((credit, index) => (
                <tr key={index}>
                  <td>{new Date(credit.Date).toLocaleDateString()}</td>
                  <td>{credit.products}</td>
                  <td>₹{credit.prices}</td>
                  <td><button onClick={() => handlepay(credit)}>{pay===credit ?"paying...":"pay"}</button></td>
                  <td><button onClick={() => handledelete(credit._id)}>{del===credit._id ? "Deleting...":"Delete"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No credit details found.</p>
        )}
      </div>
      </div>

      {/* ✅ Display Credit Details in Table */}
     </>
            )}
    </div>
  );
};
