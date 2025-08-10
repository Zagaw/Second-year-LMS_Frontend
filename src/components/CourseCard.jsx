// src/components/CourseCard.jsx
import { useNavigate } from "react-router-dom";
import API from "../api/axio";
import { jwtDecode } from "jwt-decode";

const CourseCard = ({ course, onAssign }) => {
  const navigate = useNavigate();

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

  return (
    <div className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition w-full sm:w-[48%] lg:w-[30%]">
      <h2
        onClick={() => navigate(`/courses/${course.courseId}`)}
        className="text-xl font-semibold mb-2 cursor-pointer hover:text-blue-600"
      >
        {course.name}
      </h2>
      <p className="text-gray-600">{course.description || "No description."}</p>
      <button
        onClick={handleAssign}
        className="mt-3 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
      >
        Assign to Me
      </button>
    </div>
  );
};

export default CourseCard;
