"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client"; // Sanity client import
import { FaSpinner } from "react-icons/fa"; // Importing a spinner icon for the loader

interface Category {
  _id: string;
  title: string;
  image: {
    asset: {
      url: string;
    };
  };
  products: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Loader state
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const query = `*[_type == "categories"]{
          _id,
          title,
          image{
            asset->{
              url
            }
          },
          products
        }`;

        const data = await client.fetch(query); // Fetching data from Sanity
        setCategories(data);
        setFilteredCategories(data); // Initialize with all categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false); // Hide loader once data is fetched
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = categories.filter((category) =>
      category.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col space-y-6 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-500">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
        {/* Navigation links */}
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
      <main className="flex-1 p-8 bg-gray-900 overflow-y-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Categories</h1>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full md:w-1/2 p-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Loading State - Custom Loader */}
        {loading ? (
          <div className="flex justify-center items-center space-x-2">
            <FaSpinner className="animate-spin text-teal-500" size={30} />
            <p className="text-gray-300">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={category.image?.asset?.url || "/placeholder.jpg"}
                      alt={category.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                    <p className="text-gray-400">{category.products} Products</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-4 text-gray-300">
                No categories found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
