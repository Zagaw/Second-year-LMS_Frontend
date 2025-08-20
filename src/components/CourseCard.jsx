// src/components/CourseCard.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axio";

const CourseCard = ({ course, onAssign, onDelete }) => {
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  const handleAssign = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("You must be logged in to assign courses.");
      return;
    }

    try {
      await API.post(`courses/${course.courseId}/assign/${userId}`);
      onAssign && onAssign();
      alert("Course assigned successfully!");
    } catch (err) {
      alert("Failed to assign course.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await API.delete(`courses/${course.courseId}`);
      onDelete && onDelete(course.courseId);
      alert("Course deleted successfully!");
    } catch (err) {
      alert("Failed to delete course.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="flex-grow">
        <h2
          onClick={() => navigate(`/courses/${course.courseId}`)}
          className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
        >
          {course.name}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {course.description || "No description available."}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        <button
          onClick={() => navigate(`/materials/course/${course.courseId}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Materials
        </button>

        {/* 🔹 Only teachers see Delete button */}
        {isTeacher && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Delete Course
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;