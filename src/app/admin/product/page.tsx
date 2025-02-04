'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { Product } from "../../../../interface";
import { FaSpinner, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = `*[_type == "products"]{
          _id, // Fetching Sanity's dynamic ID
          title,
          price,
          originalPrice,
          discount,
          stock,
          rating { rate, count },
          badge,
          tags,
          dimensions { height, depth, width },
          "image": image.asset->url,
          "category": category->{ _id, title, "image": image.asset->url },
          description
        }`;

        const data = await client.fetch(query);

        // Convert `_id` to `id` as a string for consistency
        const formattedData = data.map((product: any) => ({
          ...product,
          id: String(product._id), // Ensure `id` is always a string
        }));

        setProducts(formattedData);
        setFilteredProducts(formattedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.title?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/product/edit/${id}`);
  };

  const handleAddProduct = () => {
    router.push("/admin/product/add");
  };

  return (
    <div className="relative flex min-h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col items-center space-y-6 shadow-lg">
        <h1 className="text-4xl font-bold text-blue-500 mb-8">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
        <nav className="mt-8 space-y-4">
          <a href="#" className="text-lg hover:text-blue-300 transition duration-200">
            Dashboard
          </a>
          <a href="#" className="text-lg hover:text-blue-300 transition duration-200">
            Categories
          </a>
          <a href="#" className="text-lg hover:text-blue-300 transition duration-200">
            Products
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-900 text-white overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">PRODUCTS</h1>

        {/* Add Product Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={handleAddProduct}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 px-6 rounded-xl hover:bg-gradient-to-l hover:from-blue-600 hover:to-blue-500 transition duration-200"
          >
            <FaPlus className="mr-2" /> Add Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full md:w-1/2 p-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center space-x-2">
            <FaSpinner className="animate-spin text-teal-500" size={30} />
            <p className="text-gray-400">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300 ease-in-out"
                >
                  <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-300">{product.title}</h3>
                  <p className="text-gray-400 mt-2">{product.category?.title?.toUpperCase() || "Uncategorized"}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-white">${product.price}</span>
                    <span className="text-sm text-gray-400">{product.stock} in stock</span>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-sm text-gray-500">Rating: </span>
                    <span className="text-sm text-yellow-400 ml-2">
                      {product.rating ? `${product.rating.rate} ⭐ (${product.rating.count})` : "No ratings"}
                    </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-6 space-x-4">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-2 rounded-xl hover:bg-gradient-to-l hover:from-green-600 hover:to-green-500 transition duration-200"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center w-full bg-gradient-to-r from-red-500 to-red-400 text-white py-2 rounded-xl hover:bg-gradient-to-l hover:from-red-600 hover:to-red-500 transition duration-200"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">No products found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
