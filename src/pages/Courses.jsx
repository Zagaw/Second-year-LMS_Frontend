// src/pages/Courses.jsx
import { useEffect, useState } from "react";
import API from "../api/axio";
import CourseCard from "../components/CourseCard";
import CourseForm from "../components/CourseForm";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const role = localStorage.getItem("role") || "";

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("courses");
      setCourses(res.data);
    } catch (err) {
      alert("Failed to fetch courses");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Courses</h1>
                <p className="text-blue-100 mt-2">Explore and manage your learning courses</p>
              </div>
              {role === "ROLE_TEACHER" && (
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30">
                  <span className="font-medium">Teacher Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
           
            {/* Courses Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Courses</h2>
              
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard 
                      key={course.courseId} 
                      course={course} 
                      onAssign={fetchCourses} 
                      onDelete={handleDeleteCourse} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No courses available</h3>
                  <p className="text-gray-500">Create your first course to get started</p>
                </div>
              )}
            </div>

            {/* Only TEACHER can add courses */}
            {role === "ROLE_TEACHER" && <CourseForm onCourseAdded={fetchCourses} />}

          </>
        )}
      </div>
    </div>
  );
};

export default Courses;