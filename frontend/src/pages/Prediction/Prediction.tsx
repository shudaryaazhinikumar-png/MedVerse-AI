import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaRobot,
  FaChartLine,
  FaHeartbeat,
  FaDownload
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";

function Prediction() {

  const navigate = useNavigate();

  const trends = [
    {
      title: "Blood Sugar",
      month1: "4.8 mmol/L",
      month2: "6.2 mmol/L",
      month3: "7.8 mmol/L",
      status: "Increasing"
    },
    {
      title: "Cholesterol",
      month1: "215 mg/dL",
      month2: "198 mg/dL",
      month3: "175 mg/dL",
      status: "Improving"
    },
    {
      title: "Hemoglobin",
      month1: "11.2 g/dL",
      month2: "12.4 g/dL",
      month3: "13.8 g/dL",
      status: "Improving"
    }
  ];

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      <Navbar />

      <main className="max-w-7xl mx-auto p-8">

        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
        >

          <button
            onClick={()=>navigate("/dashboard")}
            className="mb-6 flex items-center gap-2 text-blue-600"
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <h1 className="text-4xl font-bold text-blue-700">
            🤖 Health Trend AI
          </h1>

          <p className="mt-3 text-gray-600">
            Compare previous medical reports and understand your health progress.
          </p>

        </motion.div>

        {/* AI Observation */}

        <motion.div
          initial={{opacity:0,y:30}}
          animate={{opacity:1,y:0}}
          transition={{delay:0.2}}
          className="mt-8 rounded-2xl bg-white p-8 shadow-lg"
        >

          <div className="flex items-center gap-3">

            <FaRobot className="text-3xl text-blue-600"/>

            <h2 className="text-2xl font-bold">
              AI Observation
            </h2>

          </div>

          <p className="mt-5 leading-8 text-gray-600">

            Based on your previous reports, your blood sugar has shown an
            increasing trend over the last three months.

            Your hemoglobin and cholesterol values have improved,
            indicating positive progress.

            Continue following your doctor's treatment plan and
            maintain regular health check-ups.

          </p>

        </motion.div>

        {/* Trend Cards */}

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {trends.map((item,index)=>(

            <motion.div

              key={index}

              whileHover={{scale:1.04}}

              className="rounded-2xl bg-white p-6 shadow-lg"

            >

              <FaChartLine
                className="text-3xl text-blue-600"
              />

              <h3 className="mt-4 text-xl font-bold">
                {item.title}
              </h3>

              <div className="mt-5 space-y-2">

                <p>
                  Month 1 : <b>{item.month1}</b>
                </p>

                <p>
                  Month 2 : <b>{item.month2}</b>
                </p>

                <p>
                  Month 3 : <b>{item.month3}</b>
                </p>

              </div>

              <div className="mt-5">

                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  item.status==="Improving"
                  ?
                  "bg-green-100 text-green-700"
                  :
                  "bg-red-100 text-red-700"
                }`}>

                  {item.status}

                </span>

              </div>

            </motion.div>

          ))}

        </div>

        {/* Prediction */}

        <motion.div

          initial={{opacity:0}}
          animate={{opacity:1}}

          transition={{delay:0.5}}

          className="mt-8 rounded-2xl bg-blue-600 p-8 text-white shadow-xl"

        >

          <div className="flex items-center gap-3">

            <FaHeartbeat className="text-3xl"/>

            <h2 className="text-2xl font-bold">
              AI Prediction
            </h2>

          </div>

          <p className="mt-5 leading-8">

            If your current lifestyle and treatment continue,
            your cholesterol and hemoglobin are likely to remain stable.

            However, blood sugar levels require closer monitoring.

            This prediction is generated for informational purposes and
            should not replace professional medical advice.

          </p>

          <button
            className="mt-8 flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700"
          >

            <FaDownload />

            Download Prediction Report

          </button>

        </motion.div>

      </main>

    </div>

  );

}

export default Prediction;