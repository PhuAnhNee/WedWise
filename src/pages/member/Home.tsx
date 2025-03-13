import React, { useState, useEffect, useMemo } from "react";
import Carousel from "../../component/carousel/index";

// Định nghĩa interface cho dữ liệu
interface Article {
  src: string;
  title: string;
  category: "all" | "relationship" | "family" | "communication";
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
        href="#"
      >
        Take Quiz
      </a>
    </div>
  </div>
);

// Component cho Article Card
const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
    <div className="relative overflow-hidden">
      <img
        src={article.src}
        alt={`Illustration for ${article.title}`}
        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
    <div className="p-4">
      <span className="text-xs font-semibold text-blue-500 capitalize">
        {article.category}
      </span>
      <h4 className="text-base md:text-lg font-bold mt-2 text-gray-800 group-hover:text-blue-500 transition-colors duration-300">
        {article.title}
      </h4>
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
  const [activeCategory, setActiveCategory] = useState<"all" | "relationship" | "family" | "communication">("all");

  useEffect(() => {
    setAnimate(true);
  }, []);

  const categories = ["all", "relationship", "family", "communication"] as const;

  const articles: Article[] = [
    {
      src: "https://storage.googleapis.com/a1aa/image/XjfjUgYpvB7JxDOCtTDfj50f2EQpSE4zWkNWvzcrNgY.jpg",
      title: "25 Romantic Dinner Ideas",
      category: "relationship",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/yvRP3kvEvyiVJLdMiTnDzlBwjcBLFE1ac0tXB83Qj5k.jpg",
      title: "10 Reasons Why Communication is Key",
      category: "communication",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/MLQpd9ol2Dhb_aypAfCl98ttlkdz82anidwvIYBGVng.jpg",
      title: "Reconnecting with Your Partner",
      category: "relationship",
    },
    {
      src: "https://storage.googleapis.com/a1aa/image/DdjwR_7p3-_90-7oJJ-1SFQ8Q4UJ4m14Vv5yEMk7f3M.jpg",
      title: "Building a Happy Family",
      category: "family",
    },
  ];

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

  const filteredArticles = useMemo(() => {
    return activeCategory === "all"
      ? articles
      : articles.filter((article) => article.category === activeCategory);
  }, [activeCategory, articles]);

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

        {/* Top Reads */}
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                Top Reads
              </h3>
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 mt-4 md:mt-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300 ${activeCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;