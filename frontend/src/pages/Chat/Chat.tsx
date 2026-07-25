import { useState } from "react";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/medverselogo.png";

function Chat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "Hello! I'm MedVerse AI. I can help you understand your medical reports, explain medical terms, and provide general health guidance."
    }
  ]);

  const [input, setInput] = useState("");

  const getReply = (question: string) => {

  const q = question.toLowerCase();

  if (
    q.includes("blood") ||
    q.includes("cbc") ||
    q.includes("hemoglobin") ||
    q.includes("haemoglobin") ||
    q.includes("wbc") ||
    q.includes("rbc") ||
    q.includes("platelet")
  ) {
    return `Based on your demo blood report:

• Hemoglobin: 13.8 g/dL (Normal)
• White Blood Cells: Normal
• Red Blood Cells: Normal
• Platelets: Normal

Overall, your blood report appears healthy.`;
  }

  if (
    q.includes("diabetes") ||
    q.includes("glucose") ||
    q.includes("sugar") ||
    q.includes("hba1c")
  ) {
    return `Your blood sugar is slightly elevated.

Recommendations:

• Reduce sugary foods
• Exercise regularly
• Monitor glucose levels
• Consult your physician if levels remain high.`;
  }

  if (
    q.includes("heart") ||
    q.includes("ecg") ||
    q.includes("cardiac") ||
    q.includes("bp") ||
    q.includes("blood pressure")
  ) {
    return `Your heart report appears stable in this demo.

Heart rate is within the expected range.
No major abnormalities detected.`;
  }

  if (
    q.includes("cholesterol") ||
    q.includes("ldl") ||
    q.includes("hdl") ||
    q.includes("triglyceride")
  ) {
    return `Your cholesterol is slightly above the recommended level.

Suggestions:

• Reduce saturated fats
• Exercise 30 minutes daily
• Increase dietary fiber
• Follow up with your doctor.`;
  }

  if (
    q.includes("kidney") ||
    q.includes("creatinine")
  ) {
    return `Kidney function appears normal.

Creatinine levels are within the healthy range in this demo report.`;
  }

  if (
    q.includes("liver") ||
    q.includes("bilirubin") ||
    q.includes("sgpt") ||
    q.includes("sgot")
  ) {
    return `Liver enzymes are within normal limits.

No significant liver abnormalities detected in this demo.`;
  }

  return `I'm a demo AI assistant.

After connecting the FastAPI backend and AI model, I'll answer questions based on your uploaded medical reports and provide personalized insights.`;
};

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    const aiMessage = {
      sender: "ai",
      text: getReply(input)
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow flex items-center justify-between px-8 py-4">

        <div className="flex items-center gap-4">
          <img src={logo} className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              MedVerse AI
            </h1>
            <p className="text-gray-500">
              AI Medical Assistant
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 font-semibold"
        >
          Dashboard
        </button>

      </header>

      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white rounded-2xl shadow p-5 mb-6">

          <h2 className="text-2xl font-bold mb-3">
            Suggested Questions
          </h2>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => setInput("Explain my blood report")}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              Explain my blood report
            </button>

            <button
              onClick={() => setInput("High cholesterol")}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              High cholesterol
            </button>

            <button
              onClick={() => setInput("Explain diabetes report")}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              Diabetes report
            </button>

            <button
              onClick={() => setInput("Heart health")}
              className="bg-blue-100 px-4 py-2 rounded-lg"
            >
              Heart health
            </button>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow h-[450px] overflow-y-auto p-5">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex mb-4 ${
                msg.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-lg rounded-xl px-4 py-3 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >

                <div className="flex items-center gap-2 mb-2">

                  {msg.sender === "user"
                    ? <FaUser />
                    : <FaRobot />}

                  <strong>
                    {msg.sender === "user"
                      ? "You"
                      : "MedVerse AI"}
                  </strong>

                </div>

                {msg.text}

              </div>

            </div>

          ))}

        </div>

        <div className="mt-5 flex gap-3">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your medical report..."
            className="flex-1 border rounded-xl px-4 py-3"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 rounded-xl"
          >
            <FaPaperPlane />
          </button>

        </div>

      </div>

    </div>
  );
}

export default Chat;