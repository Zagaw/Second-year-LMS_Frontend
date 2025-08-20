// src/pages/Courses.jsx
import { useEffect, useState } from "react";
import API from "../api/axio";
import CourseCard from "../components/CourseCard";
import CourseForm from "../components/CourseForm";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const role = localStorage.getItem("role") || "";

  const fetchCourses = async () => {
    try {
      const res = await API.get("courses");
      setCourses(res.data);
    } catch (err) {
      alert("Failed to fetch courses");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard 
              key={course.courseId} 
              course={course} 
              onAssign={fetchCourses} 
              onDelete={handleDeleteCourse} 
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No courses available.</p>
          </div>
        )}
      </div>

      {/* Only TEACHER can add courses */}
      {role === "ROLE_TEACHER" && <CourseForm onCourseAdded={fetchCourses} />}
    </div>
  );
};

export default Courses;