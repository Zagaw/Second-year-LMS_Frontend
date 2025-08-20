import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axio";

export default function QuizzesPage() {

  const navigate = useNavigate();
  const { materialId } = useParams();
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });
  const [answers, setAnswers] = useState({});
  const [bulkQuestions, setBulkQuestions] = useState([
    { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" },
  ]);

  useEffect(() => {
    checkUserRole();
    fetchQuiz();
  }, [materialId]);

  const checkUserRole = () => {
    const role = localStorage.getItem("role");
    if (role === "ROLE_TEACHER") setIsTeacher(true);
  };

  const fetchQuiz = async () => {
    try {
      const res = await API.get(`/quizzes/material/${materialId}`);
      if (res.data.length > 0) {
        setQuiz(res.data[0]);
        fetchQuestions(res.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching quiz", err);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await API.get(`/quizzes/${quizId}/questions`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions", err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/quizzes/${quiz.id}/questions`, newQuestion);
      setNewQuestion({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error adding question", err);
    }
  };

  const handleAddBulkQuestions = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/quizzes/${quiz.id}/questions/bulk`, { questions: bulkQuestions });
      setBulkQuestions([{ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" }]);
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error adding bulk questions", err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/quizzes/material/${materialId}`, { title: newQuizTitle });
      setQuiz(res.data);
      setNewQuizTitle("");
    } catch (err) {
      console.error("Error creating quiz", err);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz and all its questions?")) return;
    try {
      await API.delete(`/quizzes/${quiz.id}`);
      setQuiz(null);
      setQuestions([]);
      alert("Quiz deleted successfully.");
    } catch (err) {
      console.error("Error deleting quiz", err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/quizzes/questions/${questionId}`);
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error deleting question", err);
    }
  };

  const handleBulkChange = (index, field, value) => {
    const updated = [...bulkQuestions];
    updated[index][field] = value;
    setBulkQuestions(updated);
  };

  const addBulkRow = () => {
    setBulkQuestions([...bulkQuestions, { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" }]);
  };

  const removeBulkRow = (index) => {
    if (bulkQuestions.length === 1) return;
    const updated = bulkQuestions.filter((_, i) => i !== index);
    setBulkQuestions(updated);
  };

  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const payload = {
      studentId: parseInt(localStorage.getItem("userId")),
      answers: questions.map((q) => ({
        questionId: q.questionId,
        selectedAnswer: answers[q.questionId] || "",
      })),
    };
    try {
      const res = await API.post(`/quizzes/${quiz.id}/submissions`, payload);
      alert(`Submitted! Score: ${res.data.score}/${res.data.totalQuestions}`);
    } catch (err) { console.error(err); alert("Failed to submit quiz"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quiz for Material #{materialId}
        </h1>
        <button
            onClick={() => navigate(`/materials/course/${courseId}`)}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to Materials
        </button>
      </div>


      {/* If no quiz exists, show create quiz form for teacher */}
      {!quiz && isTeacher && (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Create New Quiz</h2>
          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Quiz Title"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Create Quiz
            </button>
          </form>
        </div>
      )}

      {quiz ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">{quiz.title}</h2>
              {isTeacher && (
                <button
                  onClick={handleDeleteQuiz}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Delete Quiz
                </button>
              )}
            </div>
          </div>

          {/* Teacher-only: add question */}
          {isTeacher && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <input
                  type="text"
                  placeholder="Question Text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Option A</label>
                    <input
                      type="text"
                      placeholder="Option A"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newQuestion.optionA}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionA: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Option B</label>
                    <input
                      type="text"
                      placeholder="Option B"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newQuestion.optionB}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionB: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Option C</label>
                    <input
                      type="text"
                      placeholder="Option C"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newQuestion.optionC}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionC: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Option D</label>
                    <input
                      type="text"
                      placeholder="Option D"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={newQuestion.optionD}
                      onChange={(e) => setNewQuestion({ ...newQuestion, optionD: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Add Question
                </button>
              </form>
            </div>
          )}

          {/* Bulk add form */}
          {isTeacher && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Bulk Add Questions</h3>
              <form onSubmit={handleAddBulkQuestions} className="space-y-6">
                {bulkQuestions.map((q, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <input 
                      type="text" 
                      placeholder="Question Text" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                      value={q.questionText} 
                      onChange={(e) => handleBulkChange(idx, "questionText", e.target.value)} 
                      required 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Option A</label>
                        <input 
                          type="text" 
                          placeholder="Option A" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                          value={q.optionA} 
                          onChange={(e) => handleBulkChange(idx, "optionA", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Option B</label>
                        <input 
                          type="text" 
                          placeholder="Option B" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                          value={q.optionB} 
                          onChange={(e) => handleBulkChange(idx, "optionB", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Option C</label>
                        <input 
                          type="text" 
                          placeholder="Option C" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                          value={q.optionC} 
                          onChange={(e) => handleBulkChange(idx, "optionC", e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Option D</label>
                        <input 
                          type="text" 
                          placeholder="Option D" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                          value={q.optionD} 
                          onChange={(e) => handleBulkChange(idx, "optionD", e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                        <select 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                          value={q.correctAnswer} 
                          onChange={(e) => handleBulkChange(idx, "correctAnswer", e.target.value)}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg" 
                        onClick={() => removeBulkRow(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex space-x-4">
                  <button 
                    type="button" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg" 
                    onClick={addBulkRow}
                  >
                    Add Another Question
                  </button>
                  <button 
                    type="submit" 
                    className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Submit Bulk Questions
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions */}
          <div className="p-6">
            {questions.length > 0 ? (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.questionId} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="mb-4">
                      <p className="text-lg font-medium text-gray-800 mb-4">
                        <span className="text-blue-600 font-semibold">Q{idx + 1}:</span> {q.questionText}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["A", "B", "C", "D"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleSelectAnswer(q.questionId, opt)}
                            className={`border rounded-xl p-4 text-left transition-all duration-200 ${
                              answers[q.questionId] === opt
                                ? "bg-blue-100 border-blue-500 shadow-inner"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                            }`}
                          >
                            <span className="font-semibold text-gray-700">{opt}.</span> {q[`option${opt}`]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteQuestion(q.questionId)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        Delete Question
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No questions added yet.</p>
            )}
          </div>

          {/* Sticky submit button for students */}
          {!isTeacher && questions.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="max-w-4xl mx-auto flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No quiz found for this material.</p>
        </div>
      )}
    </div>
  );
}