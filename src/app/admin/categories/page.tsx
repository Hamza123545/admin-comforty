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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="p-4 md:p-8 bg-gray-900 overflow-y-auto ml-0 md:ml-64"> {/* Adjusted padding and margin for small devices */}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">Categories</h1>

        {/* Search Bar */}
        <div className="mb-4 md:mb-6 flex justify-start items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full p-2 md:p-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-500 text-sm md:text-base"
          />
        </div>

        {/* Loading State - Custom Loader */}
        {loading ? (
          <div className="flex justify-start items-center space-x-2">
            <FaSpinner className="animate-spin text-teal-500" size={24} />
            <p className="text-gray-300 text-sm md:text-base">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300"
                >
                  <div className="relative h-40 md:h-64 w-full">
                    <Image
                      src={category.image?.asset?.url || "/placeholder.jpg"}
                      alt={category.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">{category.title}</h3>
                    <p className="text-gray-400 text-sm md:text-base">{category.products} Products</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-4 text-gray-300 text-sm md:text-base">
                No categories found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}