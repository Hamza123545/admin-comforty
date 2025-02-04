"use client";

import { useEffect, useState } from "react";
import { FaBox, FaMoneyBillWave, FaShoppingCart, FaUsers } from "react-icons/fa";
import { client } from "@/sanity/lib/client";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalInventory, setTotalInventory] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [deliveredOrders, setDeliveredOrders] = useState<number>(0);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
    }[];
  }>({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products data
        const productQuery = `*[_type == "products"]{
          price,
          inventory,
          _createdAt
        }`;

        const productsData = await client.fetch(productQuery);
        setTotalProducts(productsData.length);
        setTotalInventory(
          productsData.reduce((acc: number, product: { inventory: number }) => acc + product.inventory, 0)
        );
        setTotalAmount(
          productsData.reduce(
            (acc: number, product: { price: number; inventory: number }) =>
              acc + product.price * product.inventory,
            0
          )
        );

        // Fetch orders data
        const ordersQuery = `*[_type == "orders"]{
          status,
          _createdAt,
          totalAmount
        }`;

        const ordersData = await client.fetch(ordersQuery);
        setTotalOrders(ordersData.length);
        setCompletedOrders(
          ordersData.filter((order: { status: string }) => order.status === "completed").length
        );
        setPendingOrders(
          ordersData.filter((order: { status: string }) => order.status === "pending").length
        );
        setDeliveredOrders(
          ordersData.filter((order: { status: string }) => order.status === "delivered").length
        );

        // Process data for the chart
        const monthlyData = ordersData.reduce((acc: { [key: string]: { products: number; inventory: number; orders: number; sales: number } }, order: { _createdAt: string; totalAmount: number }) => {
          const date = new Date(order._createdAt);
          const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!acc[month]) {
            acc[month] = { products: 0, inventory: 0, orders: 0, sales: 0 };
          }
          acc[month].orders += 1;
          acc[month].sales += order.totalAmount;
          return acc;
        }, {});

        // Add products and inventory data to monthlyData
        productsData.forEach((product: { _createdAt: string; inventory: number }) => {
          const date = new Date(product._createdAt);
          const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!monthlyData[month]) {
            monthlyData[month] = { products: 0, inventory: 0, orders: 0, sales: 0 };
          }
          monthlyData[month].products += 1;
          monthlyData[month].inventory += product.inventory;
        });

        const labels = Object.keys(monthlyData);
        const productsDataPoints = labels.map((month) => monthlyData[month].products);
        const inventoryDataPoints = labels.map((month) => monthlyData[month].inventory);
        const ordersDataPoints = labels.map((month) => monthlyData[month].orders);
        const salesDataPoints = labels.map((month) => monthlyData[month].sales);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Products",
              data: productsDataPoints,
              borderColor: "rgba(99, 102, 241, 1)", // Indigo
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Total Inventory",
              data: inventoryDataPoints,
              borderColor: "rgba(236, 72, 153, 1)", // Pink
              backgroundColor: "rgba(236, 72, 153, 0.2)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Total Orders",
              data: ordersDataPoints,
              borderColor: "rgba(16, 185, 129, 1)", // Green
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Total Sales Amount",
              data: salesDataPoints,
              borderColor: "rgba(245, 158, 11, 1)", // Amber
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#fff", // White text for legend
        },
      },
      title: {
        display: true,
        text: "Monthly Overview",
        color: "#fff", // White text for title
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Light grid lines
        },
        ticks: {
          color: "#fff", // White text for x-axis
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Light grid lines
        },
        ticks: {
          color: "#fff", // White text for y-axis
        },
        beginAtZero: true,
      },
    },
  };

  // Variants for card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, type: "spring", stiffness: 75 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:ml-64">
      {/* Animated Banner */}
      <motion.div
        className="mb-8 bg-gradient-to-r from-purple-600 to-blue-500 p-6 rounded-lg shadow-lg text-center mt-20 md:mt-0"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold text-white">Welcome to Your Dashboard</h1>
        <p className="text-lg text-gray-200 mt-2">Manage your products, orders, and inventory with ease.</p>
      </motion.div>

      {/* Dashboard Heading */}
      <motion.h1
        className="text-3xl font-bold text-white mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Overview
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaBox className="text-4xl text-blue-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Total Products</h2>
          <p className="text-2xl font-bold text-white">{totalProducts}</p>
        </motion.div>

        {/* Total Inventory Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaShoppingCart className="text-4xl text-green-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Total Inventory</h2>
          <p className="text-2xl font-bold text-white">{totalInventory}</p>
        </motion.div>

        {/* Total Sales Amount Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaMoneyBillWave className="text-4xl text-yellow-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Total Sales Amount</h2>
          <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
        </motion.div>

        {/* Total Orders Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaUsers className="text-4xl text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Total Orders</h2>
          <p className="text-2xl font-bold text-white">{totalOrders}</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="animate-pulse h-96 bg-gray-700 rounded-lg" />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </motion.div>
    </div>
  );
}