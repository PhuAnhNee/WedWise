import React, { useState, useEffect } from "react";
import Carousel from "../../component/carousel/index";
import { Pagination } from "antd";
// Định nghĩa interface cho dữ liệu

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: number;
  picture: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  createdUser: null | string;
  updatedUser: null | string;
}

interface Quiz {
  src: string;
  title: string;
  desc: string;
}

// Component cho Stat Item
const StatItem: React.FC<{ number: string; text: string; color: string }> = ({
  number,
  text,
  color,
}) => (
  <div className="group transform hover:scale-105 transition-transform duration-300 py-4 px-2 rounded-xl hover:bg-gray-50">
    <p
      className={`text-${color}-500 text-3xl md:text-4xl font-bold group-hover:text-${color}-600 transition-colors duration-300`}
    >
      {number}
    </p>
    <p className="text-gray-600 text-base md:text-lg mt-3 group-hover:text-gray-800 transition-colors duration-300">
      {text}
    </p>
  </div>
);

// Component cho Featured Quiz
const FeaturedQuiz: React.FC<{ quiz: Quiz; featuredHover: boolean; setFeaturedHover: (value: boolean) => void }> = ({
  quiz,
  featuredHover,
  setFeaturedHover,
}) => (
  <div
    className={`bg-white rounded-xl overflow-hidden transition-all duration-500 ${featuredHover ? "shadow-2xl transform -translate-y-1" : "shadow-lg"
      }`}
    onMouseEnter={() => setFeaturedHover(true)}
    onMouseLeave={() => setFeaturedHover(false)}
  >
    <div className="relative">
      <img
        src={quiz.src}
        alt={`Illustration for ${quiz.title}`}
        className={`w-full h-48 object-cover transition-transform duration-700 ${featuredHover ? "scale-105" : "scale-100"
          }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-500 ${featuredHover ? "opacity-100" : "opacity-70"
          }`}
      ></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <span className="bg-blue-600 text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">
          Featured Quiz
        </span>
        <h4 className="text-xl md:text-2xl font-bold mt-2">{quiz.title}</h4>
        <p
          className={`text-gray-200 mt-2 text-sm max-w-xs transition-all duration-500 ${featuredHover ? "opacity-100" : "opacity-0"
            }`}
        >
          {quiz.desc}
        </p>
      </div>
    </div>
    <div className="p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
      <div className="flex items-center">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <span className="text-gray-600 text-sm">5 min quiz</span>
      </div>
      <a
        className={`text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 ${featuredHover
          ? "bg-blue-600 shadow-lg shadow-blue-400/30"
          : "bg-blue-500"
          }`}
        href="/home/quizzes"
      >
        Take Quiz
      </a>
    </div>
  </div>
);

// Updated ArticleCard to work with BlogPost interface
const ArticleCard: React.FC<{ blog: BlogPost }> = ({ blog }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
    <div className="relative overflow-hidden">
      <img
        src={blog.picture}
        alt={`Illustration for ${blog.title}`}
        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
    <div className="p-4">
      <span className="text-xs font-semibold text-blue-500 capitalize">
        Blog
      </span>
      <h4 className="text-base md:text-lg font-bold mt-2 text-gray-800 group-hover:text-blue-500 transition-colors duration-300">
        {blog.title}
      </h4>
      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
        {blog.content}
      </p>
      <div className="mt-3 flex justify-end">
        <button className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-300">
          Read Article →
        </button>
      </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const [animate, setAnimate] = useState(false);
  const [featuredHover, setFeaturedHover] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize] = useState(4); // Số bài mỗi trang
  const [totalBlogs, setTotalBlogs] = useState(0); // Tổng số blog posts
  // Hàm fetch dữ liệu blog
  const fetchBlogPosts = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Blog/Get_All_Blog"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const filteredBlogs = data.filter((blog: BlogPost) => blog.status === 0);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setBlogPosts(filteredBlogs.slice(start, end)); // Cắt dữ liệu theo trang từ danh sách đã lọc
      setTotalBlogs(filteredBlogs.length); // Cập nhật tổng số blog sau khi lọc
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect chạy khi component mount và khi currentPage thay đổi
  useEffect(() => {
    setAnimate(true);
    fetchBlogPosts(currentPage); // Gọi fetch với trang hiện tại
  }, [currentPage]); // Thêm currentPage vào dependency array

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // We'll keep the original quizzes data
  const quizzes: Quiz[] = [
    {
      src: "https://storage.googleapis.com/a1aa/image/6MkNmKPd-tap0mEzFHEYlVT_EZymea5Ms60dIJoN0hY.jpg",
      title: "Will He Leave His Wife for Me Quiz",
      desc: "Discover insights about your relationship situation and potential outcomes.",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/vATXqHxJlwTkaZ3cNPQtcKgUfk4x7qbYunzmr9Itbcs.jpg",
      title: "Does My Mom Hate Me Quiz",
      desc: "Understand your relationship with your mother better.",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/23i2CzV3xEd2KvnHKhbcaaornML6BcHNk3lpos0pYQs.jpg",
      title: "Who Is My Boyfriend Quiz",
      desc: "Learn more about your boyfriend's personality type.",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/rQNqDGNn2dCyTRhEC_ngm0zfJwgqtMIFuba_2nhxe9w.jpg",
      title: "Does He Miss Me Quiz",
      desc: "Find out if he's thinking about you when you're apart.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <Carousel />

      <div
        className={`max-w-[2000px] mx-auto p-6 transition-opacity duration-1000 ${animate ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className={`text-2xl md:text-3xl font-bold text-gray-700 transition-transform duration-700 ${animate ? "translate-y-0" : "translate-y-10"
              }`}
          >
            Join Millions Building
          </h1>
          <h2
            className={`text-3xl md:text-4xl font-bold text-gray-900 mt-2 transition-transform duration-700 delay-100 ${animate ? "translate-y-0" : "translate-y-10"
              }`}
          >
            Healthier, Happier{" "}
            <span className="text-blue-600 relative">
              Relationships
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-full"></span>
            </span>
          </h2>
          <p
            className={`text-gray-600 mt-6 text-lg md:text-xl max-w-2xl mx-auto transition-opacity duration-700 delay-200 ${animate ? "opacity-100" : "opacity-0"
              }`}
          >
            The world's <span className="text-red-500 font-semibold">#1</span>{" "}
            resource for marriage and relationship support
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-16 transform hover:shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <StatItem number="100M+" text="People Helped Every Year" color="blue" />
            <StatItem number="10K+" text="Free Articles, Videos & More" color="red" />
            <StatItem number="1K+" text="Therapist & Expert Contributors" color="blue" />
          </div>
        </div>

        {/* Popular Quizzes */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                Popular Quizzes
              </h3>
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-500 rounded-full"></div>
            </div>
            <a
              className="text-blue-500 font-medium hover:text-blue-700 transition-colors duration-300 text-base md:text-lg flex items-center group"
              href="#"
            >
              <span>View all</span>
              <svg
                className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeaturedQuiz
              quiz={quizzes[0]}
              featuredHover={featuredHover}
              setFeaturedHover={setFeaturedHover}
            />
            {/* Bạn có thể thêm các quiz khác ở đây nếu muốn */}
          </div>
        </div>

        {/* Top Reads - Now using API data */}
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                Top Reads
              </h3>
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {blogPosts.length > 0 ? (
                  blogPosts.map((blog) => (
                    <ArticleCard key={blog.id} blog={blog} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No blog posts available at the moment.
                  </div>
                )}
              </div>

              {/* Phân trang */}
              {blogPosts.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalBlogs}
                    onChange={handlePageChange}
                    showSizeChanger={false} // Ẩn tùy chọn thay đổi pageSize nếu không cần
                    className="antd-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;