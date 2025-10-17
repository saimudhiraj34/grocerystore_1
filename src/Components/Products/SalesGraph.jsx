import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,Filler } from "chart.js";
import { useParams } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,Filler);

const SalesGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { productname } = useParams();

  // Fetch sales data from the API using fetch
  const fetchSalesData = async (timePeriod) => {
    try {
        const token=localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}/prod/sales/${productname}/${timePeriod}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSalesData(data.data);
      } else {
        console.error("Error fetching sales data:", data.message);
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
    }
  };

  // Handle time period change (week, month, year)
  const handlePeriodChange = (event) => {
    const period = event.target.value;
    setSelectedPeriod(period);
    fetchSalesData(period);
  };

  // Prepare the chart data
  const chartData = {
    labels: salesData.map((sale) => new Date(sale.date).toLocaleDateString()), // Labels: dates of sales
    datasets: [
      {
        label: "Sales Amount",
        data: salesData.map((sale) => sale.totalAmount), // Data: total amount for each sale
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  useEffect(() => {
    fetchSalesData(selectedPeriod); // Fetch data for the default period (week)
  }, [selectedPeriod]);

  return (
    <div>
      <select onChange={handlePeriodChange} value={selectedPeriod}>
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
      </select>

      <Line data={chartData} />
    </div>
  );
};

const ProductList = ({ filteredProducts }) => {
  return (
    <div>
      {filteredProducts.map((product, index) => (
        <li className="eachproduct" key={index}>
          <div className="productdelete">
            <h3>{product.productname}</h3>
            <button onClick={() => {}}>
              <h3>Show Sales Graph</h3>
              <SalesGraph productname={product.productname} />
            </button>
          </div>
          <p>Price: ₹{product.price}</p>
          {product.product_img && (
            <img
              className="productimg"
              src={`data:image/png;base64,${product.product_img.data}`}
              alt={product.productname}
              width="100"
              height="100"
            />
          )}
          <p>Description: {product.description}</p>
          <p>Stock: {product.stock}</p>
        </li>
      ))}
    </div>
  );
};

export default SalesGraph;
