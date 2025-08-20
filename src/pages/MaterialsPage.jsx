import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axio";
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
    const role = localStorage.getItem("role");
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
      fetchMaterials();
    } catch (error) {
      console.error("Error deleting material", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Course Materials</h1>
        <button
          onClick={() => navigate("/courses")}
          className="bg-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Back to Courses
        </button>
      </div>

      {/* Material List */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <div key={mat.materialId} className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="h-full flex flex-col">
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{mat.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{mat.description}</p>
                  {mat.fileUrl && (
                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Material
                    </a>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteMaterial(mat.materialId)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/quizzes/material/${mat.materialId}`, { state: { courseId: courseId } })}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No materials found for this course.</p>
        </div>
      )}

      {/* Add Material Form (Teacher only) */}
      {isTeacher && (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Material</h2>
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Title</label>
              <input
                type="text"
                placeholder="Enter material title"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Description</label>
              <textarea
                placeholder="Enter material description"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                rows="3"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">File URL (Optional)</label>
              <input
                type="text"
                placeholder="Enter file URL"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={newMaterial.fileUrl}
                onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Add Material
            </button>
          </form>
        </div>
      )}
    </div>
  );
}