import { FaUserPlus, FaUser } from "react-icons/fa";


function FamilyMembers(){


const members=[

{
name:"Father",
age:"58 Years",
relation:"Father",
reports:4
},

{
name:"Mother",
age:"52 Years",
relation:"Mother",
reports:6
},

{
name:"Brother",
age:"24 Years",
relation:"Brother",
reports:2
}

];



return (

<div>


<button className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl">

<FaUserPlus/>

Add Family Member

</button>



<div className="grid md:grid-cols-3 gap-6">


{
members.map((member,index)=>(


<div

key={index}

className="bg-white rounded-2xl shadow p-6"

>


<div className="text-blue-600 text-3xl">

<FaUser/>

</div>


<h3 className="mt-4 text-xl font-bold">

{member.name}

</h3>


<p className="text-gray-500">

{member.relation}

</p>


<p>

Age: {member.age}

</p>


<p className="mt-2 text-blue-600">

Reports: {member.reports}

</p>


</div>


))
}


</div>


</div>

);


}


export default FamilyMembers;