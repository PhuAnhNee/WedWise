import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-gray-700">Join Millions Building</h1>
        <h2 className="text-3xl font-bold text-gray-900">
          Healthier, Happier <span className="text-blue-500">Relationships</span>
        </h2>
        <p className="text-gray-600 mt-2 text-lg">
          The world's <span className="text-red-500 font-semibold">#1</span> resource for marriage and relationship support
        </p>
      </div>

      {/* Stats Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-blue-500 text-3xl font-bold">100M+</p>
            <p className="text-gray-600 text-lg">People Helped Every Year</p>
          </div>
          <div>
            <p className="text-red-500 text-3xl font-bold">10K+</p>
            <p className="text-gray-600 text-lg">Free Articles, Videos & More</p>
          </div>
          <div>
            <p className="text-blue-500 text-3xl font-bold">1K+</p>
            <p className="text-gray-600 text-lg">Therapist & Expert Contributors</p>
          </div>
        </div>
      </div>

      {/* Popular Quizzes Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Popular Quizzes</h3>
          <a className="text-blue-500 font-medium hover:underline" href="#">View all</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-4 flex">
            <img src="https://storage.googleapis.com/a1aa/image/6MkNmKPd-tap0mEzFHEYlVT_EZymea5Ms60dIJoN0hY.jpg" 
                 alt="Quiz" className="w-24 h-24 rounded-lg object-cover mr-4" />
            <div>
              <h4 className="text-lg font-bold">Will He Leave His Wife for Me Quiz</h4>
              <a className="text-blue-500 mt-2 inline-block hover:underline" href="#">Take Quiz</a>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="space-y-4">
              {[
                { src: "https://storage.googleapis.com/a1aa/image/vATXqHxJlwTkaZ3cNPQtcKgUfk4x7qbYunzmr9Itbcs.jpg", title: "Does My Mom Hate Me Quiz" },
                { src: "https://storage.googleapis.com/a1aa/image/23i2CzV3xEd2KvnHKhbcaaornML6BcHNk3lpos0pYQs.jpg", title: "Who Is My Boyfriend Quiz" },
                { src: "https://storage.googleapis.com/a1aa/image/rQNqDGNn2dCyTRhEC_ngm0zfJwgqtMIFuba_2nhxe9w.jpg", title: "Does He Miss Me Quiz" }
              ].map((quiz, index) => (
                <div key={index} className="flex items-center">
                  <img src={quiz.src} alt={quiz.title} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <h4 className="text-lg font-semibold">{quiz.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Reads Section */}
      <div>
        <h3 className="text-xl font-bold mb-6">Top Reads</h3>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <img src="https://storage.googleapis.com/a1aa/image/QGOt77OvH8Bv2txQqbksWXxGv_yjJPnd0orP5mhvUdw.jpg"
               alt="Wedding couple holding hands" className="w-full h-60 rounded-lg object-cover mb-6" />
          <span className="bg-blue-100 text-blue-500 text-xs font-bold px-2 py-1 rounded-full">Relationship</span>
          <h4 className="text-lg font-bold mt-2 mb-2">Wedding Letter: For A Newly Married Couple</h4>
          <p className="text-gray-600 leading-relaxed">
            To the Happy Couple, Your wedding day...the nervous excitement and the frantic last minute details is one of 
            the wonderful and precious milestones of life. As you embark on this journey of...
          </p>
          <div className="flex items-center mt-4">
            <img src="https://storage.googleapis.com/a1aa/image/nXnEBfO0IwvaQqvD0nT59UK-bmYP8e2fSYs0u9dwW-I.jpg"
                 alt="Theresa K. Cooke" className="w-12 h-12 rounded-full object-cover mr-3" />
            <div>
              <p className="text-gray-800 font-bold">By Theresa K. Cooke</p>
              <p className="text-gray-600 text-sm">Psychologist</p>
            </div>
          </div>
        </div>

        {/* Grid of Additional Reads */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { src: "https://storage.googleapis.com/a1aa/image/XjfjUgYpvB7JxDOCtTDfj50f2EQpSE4zWkNWvzcrNgY.jpg", title: "25 Romantic Dinner Ideas" },
            { src: "https://storage.googleapis.com/a1aa/image/yvRP3kvEvyiVJLdMiTnDzlBwjcBLFE1ac0tXB83Qj5k.jpg", title: "10 Reasons Why Communication is Key" },
            { src: "https://storage.googleapis.com/a1aa/image/MLQpd9ol2Dhb_aypAfCl98ttlkdz82anidwvIYBGVng.jpg", title: "Reconnecting with Your Partner" },
            { src: "https://storage.googleapis.com/a1aa/image/DdjwR_7p3-_90-7oJJ-1SFQ8Q4UJ4m14Vv5yEMk7f3M.jpg", title: "Building a Happy Family" }
          ].map((article, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-4">
              <img src={article.src} alt={article.title} className="w-full h-28 rounded-lg object-cover mb-3" />
              <h4 className="text-sm font-bold">{article.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
