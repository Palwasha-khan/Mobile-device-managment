import React from 'react'
import axiosClient from "./api/axiosClient";

import { loginRequest } from "./api/endpoints/authApi";


const App = () => {
  console.log("Axios client:", axiosClient);
  loginRequest("admin@mail.com", "AdminPass123")
  .then((res) => console.log("Login worked:", res.data))
  .catch((err) => console.log("Login failed:", err.response?.data || err.message));
   console.log("API URL:", import.meta.env.VITE_API_URL);
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      
    </div>
  )
}

export default App