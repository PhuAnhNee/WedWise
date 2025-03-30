import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Sử dụng useParams để lấy id từ URL
import { Link } from "react-router-dom";

// Định nghĩa interface cho BlogPost (giữ nguyên từ HomePage)
interface BlogPost {
  id: string;
  title: string;
  content: string;
  body: string;
  status: number;
  picture: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  createdUser: null | string;
  updatedUser: null | string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL params
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog data by ID
  const fetchBlogDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Blog/Get_Blog_By_Id?id=${id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : blog ? (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Blog Image */}
            <img
              src={blog.picture}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />

            {/* Blog Content */}
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {blog.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex items-center text-gray-600 mb-6">
                <span>Published on {formatDate(blog.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>Last updated on {formatDate(blog.updatedAt)}</span>
              </div>

              {/* Blog Body */}
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{blog.body}</p>
              </div>

              {/* Back Button */}
              <div className="mt-8">
                <Link
                  to="/home"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Blog post not found
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;