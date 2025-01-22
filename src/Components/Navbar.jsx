import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="flex justify-between bg-gradient-to-tr from-blue-300 to-blue-950 px-2 py-5">
      <div className="logo text-4xl font-extrabold">TASK MANAGER</div>
      <ul className="flex  ">
       
       <Link to="/home"> <li className="p-3 cursor-pointer text-xl hover:underline">Home</li></Link>
        <Link to='/AddTask'><li className="p-3 cursor-pointer text-xl hover:underline">Add Task</li></Link>
       
      </ul>
    </div>
  )
}

export default Navbar
