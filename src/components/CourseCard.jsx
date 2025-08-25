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
      alert("Failed to delete course. Delete materials first");
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      <div className="flex-grow">
        {/* Course Icon Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 flex-shrink-0 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          {isTeacher && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
              title="Delete course"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Course Title */}
        <h2
          onClick={() => navigate(`/courses/${course.courseId}`)}
          className="text-xl font-semibold text-gray-800 mb-3 cursor-pointer hover:text-blue-600 transition-colors duration-200 line-clamp-2"
        >
          {course.name}
        </h2>
        
        {/* Course Description */}
        <p className="text-gray-600 mb-6 line-clamp-3">
          {course.description || "No description available."}
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate(`/materials/course/${course.courseId}`)}
          className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Materials
        </button>
      </div>
    </div>
  );
};

export default CourseCard;