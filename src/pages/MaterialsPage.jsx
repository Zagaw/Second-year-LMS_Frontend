import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axio"; // Your Axios instance
import { useNavigate } from "react-router-dom";

export default function MaterialsPage() {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: "", description: "", fileUrl: "" });
  const [isTeacher, setIsTeacher] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
    checkUserRole();
  }, [courseId]);

  const checkUserRole = () => {
    const role = localStorage.getItem("role"); // Store role after login
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  const fetchMaterials = async () => {
    try {
      const res = await API.get(`/materials/course/${courseId}`);
      setMaterials(res.data);
    } catch (error) {
      console.error("Error fetching materials", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/materials/course/${courseId}`, newMaterial);
      setNewMaterial({ title: "", description: "", fileUrl: "" });
      fetchMaterials();
    } catch (error) {
      console.error("Error adding material", error);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await API.delete(`/materials/course/${courseId}/${materialId}`);
      fetchMaterials(); // refresh list after delete
    } catch (error) {
      console.error("Error deleting material", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black-600">Course Materials</h1>
        <button
          onClick={() => navigate("/courses")}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back to Courses
        </button>
      </div>

      {/* Material List */}
      {materials.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {materials.map((mat) => (
            <div key={mat.materialId} className="bg-white p-4 shadow-md rounded-lg border border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{mat.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{mat.description}</p>
                {mat.fileUrl && (
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Material
                  </a>
                )}
              </div>

              <div>
                {/* Delete button (only for teachers) */}
                {isTeacher && (
                  <button
                    onClick={() => handleDeleteMaterial(mat.materialId)}
                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 self-end"
                  >
                    Delete
                  </button>
                )}
                <button
                    onClick={() => navigate(`/quizzes/material/${mat.materialId}`)}
                    className="mt-3 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 self-end"
                  >
                    Take Quizzes
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No materials found for this course.</p>
      )}

      {/* Add Material Form (Teacher only) */}
      {isTeacher && (
        <form onSubmit={handleAddMaterial} className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Add New Material</h2>
          <input
            type="text"
            placeholder="Title"
            className="w-full border px-3 py-2 rounded-lg mb-3"
            value={newMaterial.title}
            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full border px-3 py-2 rounded-lg mb-3"
            value={newMaterial.description}
            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
          ></textarea>
          <input
            type="text"
            placeholder="File URL"
            className="w-full border px-3 py-2 rounded-lg mb-3"
            value={newMaterial.fileUrl}
            onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Material
          </button>
        </form>
      )}
    </div>
  );
}
