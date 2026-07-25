import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import MyReports from "./MyReports";
import FamilyMembers from "./FamilyMembers";

import logo from "../../assets/images/medverselogo.png";


function History(){

const navigate=useNavigate();

const [tab,setTab]=useState("my");


return (

<div className="min-h-screen bg-gray-50">


<header className="flex justify-between items-center bg-white px-8 py-5 shadow">


<div className="flex items-center gap-4">

<img
src={logo}
className="h-14 w-14"
/>


<div>

<h1 className="text-2xl font-bold text-blue-700">
MedVerse AI
</h1>

<p className="text-gray-500">
Report History
</p>

</div>

</div>


<button
onClick={()=>navigate("/dashboard")}
className="text-blue-600 flex gap-2"
>

<FaArrowLeft/>

Dashboard

</button>


</header>




<main className="p-8">


<h2 className="text-3xl font-bold">
Medical History
</h2>



<div className="flex gap-4 mt-6">


<button

onClick={()=>setTab("my")}

className="bg-blue-600 text-white px-6 py-3 rounded-xl"

>

My Reports

</button>




<button

onClick={()=>setTab("family")}

className="bg-white shadow px-6 py-3 rounded-xl"

>

Family Members

</button>


</div>



<div className="mt-8">

{
tab==="my"
?
<MyReports/>
:
<FamilyMembers/>
}

</div>


</main>


</div>

);


}


export default History;