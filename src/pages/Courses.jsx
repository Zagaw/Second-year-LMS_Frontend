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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Only TEACHER can add courses */}
      {role === "ROLE_TEACHER" && <CourseForm onCourseAdded={fetchCourses} />}

      <div className="flex flex-wrap gap-4 mt-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.courseId} course={course} onAssign={fetchCourses} onDelete={handleDeleteCourse} />
          ))
        ) : (
          <p>No courses available.</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
