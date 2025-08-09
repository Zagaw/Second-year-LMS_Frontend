// src/pages/CourseDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axio";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`courses`);
        const found = res.data.find((c) => c.courseId === parseInt(id));
        setCourse(found);
      } catch (err) {
        alert("Error loading course details");
        console.error(err);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
      <p className="text-gray-700">{course.description || "No description."}</p>
    </div>
  );
};

export default CourseDetails;
