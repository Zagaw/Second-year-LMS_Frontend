import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axio";

export default function QuizzesPage() {
  const { materialId } = useParams();
  const [quiz, setQuiz] = useState(null); // only one quiz
  const [questions, setQuestions] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState(""); // For creating new quiz
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

    // For bulk questions
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


  // Fetch the single quiz for this material
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

  // Fetch questions for the quiz
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

    // Bulk add questions
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

    // Create a new quiz
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

    // Delete quiz
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

  // Delete a single question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/quizzes/questions/${questionId}`);
      fetchQuestions(quiz.id);
    } catch (err) {
      console.error("Error deleting question", err);
    }
  };

    // Bulk form helpers
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Quiz for material {materialId}
      </h1>

      {/* If no quiz exists, show create quiz form for teacher */}
      {!quiz && isTeacher && (
        <form onSubmit={handleCreateQuiz} className="border p-4 rounded-lg bg-white space-y-2">
          <h2 className="font-semibold">Create New Quiz</h2>
          <input
            type="text"
            placeholder="Quiz Title"
            className="w-full border px-2 py-1 rounded"
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Create Quiz
          </button>
        </form>
      )}

      {quiz ? (
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{quiz.title}</h2>
            {isTeacher && (
              <button
                onClick={handleDeleteQuiz}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete Quiz
              </button>
            )}
          </div>

          {/* Teacher-only: add question */}
          {isTeacher && (
            <form onSubmit={handleAddQuestion} className="mt-4 space-y-2 border-t pt-2">
              <input
                type="text"
                placeholder="Question Text"
                className="w-full border px-2 py-1 rounded"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A"
                  className="border px-2 py-1 rounded"
                  value={newQuestion.optionA}
                  onChange={(e) => setNewQuestion({ ...newQuestion, optionA: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Option B"
                  className="border px-2 py-1 rounded"
                  value={newQuestion.optionB}
                  onChange={(e) => setNewQuestion({ ...newQuestion, optionB: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Option C"
                  className="border px-2 py-1 rounded"
                  value={newQuestion.optionC}
                  onChange={(e) => setNewQuestion({ ...newQuestion, optionC: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Option D"
                  className="border px-2 py-1 rounded"
                  value={newQuestion.optionD}
                  onChange={(e) => setNewQuestion({ ...newQuestion, optionD: e.target.value })}
                  required
                />
              </div>
              <select
                className="border px-2 py-1 rounded"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Add Question
              </button>
            </form>
          )}

          {/* Bulk add form */}
          {isTeacher && (
            <form onSubmit={handleAddBulkQuestions} className="space-y-4 border-t pt-2">
              <h3 className="font-semibold">Bulk Add Questions</h3>
              {bulkQuestions.map((q, idx) => (
                <div key={idx} className="border p-2 rounded space-y-2 bg-gray-50">
                  <input type="text" placeholder="Question Text" className="w-full border px-2 py-1 rounded" value={q.questionText} onChange={(e) => handleBulkChange(idx, "questionText", e.target.value)} required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Option A" className="border px-2 py-1 rounded" value={q.optionA} onChange={(e) => handleBulkChange(idx, "optionA", e.target.value)} required />
                    <input type="text" placeholder="Option B" className="border px-2 py-1 rounded" value={q.optionB} onChange={(e) => handleBulkChange(idx, "optionB", e.target.value)} required />
                    <input type="text" placeholder="Option C" className="border px-2 py-1 rounded" value={q.optionC} onChange={(e) => handleBulkChange(idx, "optionC", e.target.value)} required />
                    <input type="text" placeholder="Option D" className="border px-2 py-1 rounded" value={q.optionD} onChange={(e) => handleBulkChange(idx, "optionD", e.target.value)} required />
                  </div>
                  <select className="border px-2 py-1 rounded" value={q.correctAnswer} onChange={(e) => handleBulkChange(idx, "correctAnswer", e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                  <button type="button" className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onClick={() => removeBulkRow(idx)}>Remove</button>
                </div>
              ))}
              <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={addBulkRow}>Add Another Question</button>
              <button type="submit" className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">Submit Bulk Questions</button>
            </form>
          )}

          {/* Questions */}
          {questions.length > 0 ? (
            <div className="mt-4 space-y-2">
              {questions.map((q) => (
                <div key={q.questionId} className="border p-2 rounded bg-gray-50">
                  <div>
                    <p className="font-medium">{q.questionText}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <span>A. {q.optionA}</span>
                        <span>B. {q.optionB}</span>
                        <span>C. {q.optionC}</span>
                        <span>D. {q.optionD}</span>
                    </div>
                  </div>
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteQuestion(q.questionId)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No questions added yet.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No quiz found for this material.</p>
      )}
    </div>
  );
}
