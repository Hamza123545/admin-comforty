"use client";

import { useEffect, useState } from "react";
import { FaBox, FaMoneyBillWave, FaShoppingCart, FaUsers } from "react-icons/fa";
import { client } from "@/sanity/lib/client";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalInventory, setTotalInventory] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [deliveredOrders, setDeliveredOrders] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products data
        const productQuery = `*[_type == "products"]{
          price,
          inventory,
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
          status
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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

        {/* Delivered Orders Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaShoppingCart className="text-4xl text-teal-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Delivered Orders</h2>
          <p className="text-2xl font-bold text-white">{deliveredOrders}</p>
        </motion.div>

        {/* Pending Orders Card */}
        <motion.div
          className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center cursor-pointer"
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          <FaShoppingCart className="text-4xl text-orange-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-200">Pending Orders</h2>
          <p className="text-2xl font-bold text-white">{pendingOrders}</p>
        </motion.div>
      </div>
    </div>
  );
}