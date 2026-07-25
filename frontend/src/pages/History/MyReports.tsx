import { motion } from "framer-motion";
import { FaFileMedical, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function MyReports() {

  const navigate = useNavigate();


  const reports = [
  {
    id: "MY-1001",
    patientName: "You",
    age: "24 Years",
    name: "Blood Test Report",
    type: "Complete Blood Count (CBC)",
    date: "24 July 2026",
    status: "Analyzed"
  },
  {
    id: "MY-1002",
    patientName: "You",
    age: "24 Years",
    name: "Diabetes Report",
    type: "Blood Sugar Analysis",
    date: "20 July 2026",
    status: "Analyzed"
  }
];
  return (

    <div className="space-y-5">


      {
        reports.map(report=>(


          <motion.div

            key={report.id}

            whileHover={{scale:1.02}}

            className="bg-white rounded-2xl shadow p-6 flex justify-between items-center"

          >


            <div className="flex gap-5 items-center">


              <div className="bg-blue-100 p-4 rounded-xl text-blue-600 text-3xl">

                <FaFileMedical/>

              </div>



              <div>


                <h3 className="text-xl font-bold">

                  {report.name}

                </h3>


                <p className="text-gray-500">

                  {report.type}

                </p>


                <p className="text-gray-400 text-sm">

                  {report.date}

                </p>


                <span className="text-green-600 text-sm">

                  ✓ {report.status}

                </span>


              </div>


            </div>




            <button

              onClick={()=>navigate("/analysis",{state:report})}

              className="flex gap-2 text-blue-600"

            >

              <FaEye/>

              View

            </button>


          </motion.div>


        ))
      }


    </div>

  );
}


export default MyReports;