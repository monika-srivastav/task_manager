import { useState, useEffect,useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; 
import { ToastContainer, toast, Bounce } from 'react-toastify';
// import {database} from "../Components/firebase/Firebase"

const Home = () => {

  const fileInputRef = useRef(null);
  fileInputRef.current.value = "";
  const [formData, setFormData] = useState({
    name: "",
    status: "",
    createdAt: new Date().toLocaleString()

  });
  const [records, setRecords] = useState([]);
  const [isEdit, setIsEdit] = useState(false); // Track whether editing or adding a new task
  const [editId, setEditId] = useState(null); // Track the id of the task being edited
  const [filteredRecords, setFilteredRecords] = useState([]); // To handle filtered tasks
  const [searchTask, setsearchTask] = useState(""); // Search query state
  const [isSearching, setIsSearching] = useState(false); // Track if search is active

  // const Task =  document.getElementById("task").value;


  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get(
        "https://task-manager-7ee8a-default-rtdb.firebaseio.com/users.json"
      );
      const data = res.data;

      if (data) {
        // Convert Firebase data structure to an array
        const tasks = Object.keys(data).map((key) => ({
          id: key, // Firebase unique ID
          ...data[key],
        }));
        setRecords(tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or update task
  const addTask = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.status) {
      toast.error("Please fill all fields!", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }

    try {
      if (isEdit) {
        // Update existing task
        await axios.put(
          `https://task-manager-7ee8a-default-rtdb.firebaseio.com/users/${editId}.json`,
          formData
        );
        toast.success("Task updated successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } else {
        // Add new task
        await axios.post(
          "https://task-manager-7ee8a-default-rtdb.firebaseio.com/users.json",
          formData
        );
        toast.success("Task added successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      }
      fetchRecords();
      resetForm();
    } catch (error) {
      console.error("Error adding/updating task:", error);
    }
  };


  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
  
      // Map the parsed data to match the Firebase data structure
      try {
        const firebaseRequests = parsedData.map(async (task) => {
          const newTask = {
            name: task.name || "Unnamed Task", 
            status: task.status || "Pending", 
            createdAt: new Date().toLocaleString(),
          };
  
          // Add to Firebase
          await axios.post(
            "https://task-manager-7ee8a-default-rtdb.firebaseio.com/users.json",
            newTask
          );
          return newTask;
        });
  
        const newRecords = await Promise.all(firebaseRequests);
        setRecords((prevRecords) => [...prevRecords, ...newRecords]);
        toast.success("Excel data uploaded successfully!", {
          position: "top-center",
          transition: Bounce,
        });
      } catch (error) {
        console.error("Error uploading Excel data:", error);
        toast.error("Failed to upload Excel data.", {
          position: "top-center",
          transition: Bounce,
        });
      }
    };
  
    reader.readAsArrayBuffer(file);
  };


  const handleSearch = () => {
    if (searchTask.trim() === "") {
      setIsSearching(false); // Reset search if query is empty
      return;
    }

    const filtered = records.filter(
      (record) =>
        record.name.toLowerCase().includes(searchTask.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTask.toLowerCase())
    );

    setFilteredRecords(filtered);
    setIsSearching(true); // Enable search mode
  };



  const handleEdit = (id) => {
    const taskToEdit = records.find((task) => task.id === id);
    setFormData(taskToEdit);
    setIsEdit(true);
    setEditId(id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://task-manager-7ee8a-default-rtdb.firebaseio.com/users/${id}.json`
      );
      toast.success("Task deleted successfully!", {
        position: "top-center",
        transition: Bounce,
      });
      fetchRecords();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      status: "",

    });
    setIsEdit(false);
    setEditId(null);
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <ToastContainer />
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          value={searchTask}
          onChange={(e) => setsearchTask(e.target.value)}
          placeholder="Search tasks..."
          className="w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2  text-white rounded-md bg-green-100 hover:bg-white focus:outline-none"
        >
          <lord-icon
            src="https://cdn.lordicon.com/msoeawqm.json"
            trigger="hover"
            // colors="primary:#ffffff"
            style={{ width: "25px", height: "25px" }}
          ></lord-icon>

        </button>
      </div>




      {/* Form */}
      <section className="p-6 max-w-md bg-white shadow-lg rounded-lg mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {isEdit ? "Edit Task" : "Create Task"}
        </h2>
        <form onSubmit={addTask} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter task name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">--Select Status--</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="add"
              className="w-full flex justify-center  bg-green-600 active:bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <lord-icon
                src="https://cdn.lordicon.com/jgnvfzqg.json"
                trigger="hover"
              >
              </lord-icon>

              {isEdit ? "Update Task" : "Add Task"}
            </button>

          </div>
          <div className="flex justify-center">------------------OR------------------</div>
          <div className="mt-4">
        <input
          type="file"
          accept=".xls,.xlsx"
          ref={fileInputRef}
          onChange={handleExcelUpload}
          className="mb-2"
        />
        <button
          className="w-full flex justify-center bg-green-600 active:bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Upload
        </button>
        </div>
        </form>
      </section>

      {/* Table */}
      <section className="my-10">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
          <thead>
            <tr className="bg-green-500 text-gray-950">
              <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium">
                ID
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium">
                Name
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium">
                Created At
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {(isSearching ? filteredRecords : records).map((r, i) => (
              <tr id="task"
                key={i}
                className="bg-white hover:bg-gray-200 transition"
              >
                <td className="px-4 py-2 border border-gray-300 text-sm">
                  {i + 1}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-sm">
                  {r.name}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-sm">
                  {r.status}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-sm">
                  {r.createdAt}
                </td>
                <td className="px-4 py-2 border border-gray-300 text-sm flex space-x-2">


                  <lord-icon className="cursor-pointer "
                    onClick={() => handleEdit(r.id)}
                    src="https://cdn.lordicon.com/exymduqj.json"
                    trigger="hover"
                    style={{ "width": "25px", "height": "25px" }}>
                  </lord-icon>
                  <lord-icon className="cursor-pointer " onClick={() => handleDelete(r.id)} src="https://cdn.lordicon.com/skkahier.json" trigger="hover" style={{ "width": "25px", "height": "25px" }}> </lord-icon>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
};

export default Home;
