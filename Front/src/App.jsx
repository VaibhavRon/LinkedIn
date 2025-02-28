import { useQuery} from "@tanstack/react-query"
import  Layout  from "./components/layouts/Layout"
import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import { Navigate, Route, Routes } from "react-router-dom"
import { toast } from "react-hot-toast"
import { axiosInstance } from "./lib/axios"
import { Toaster } from "react-hot-toast"
import NetworkPage from "./pages/NetworkPage"

import ProfilePage from "./pages/ProfilePage"


function App() {

  const {data:authUser,isLoading}=useQuery({
    queryKey:["authUser"],
    queryFn:async()=>{
      try{
        const response=await axiosInstance.get("/auth/me");
        return response.data
      }catch(Err)
      {
        if(Err && Err.response.status===401)
        {
          return null
        }
      }
      toast.error("Error")
    }
  })


  if(isLoading){
    return null;
  }

  return (
    <>
    <Layout>
    <Routes>
        <Route path='/' element={authUser ? <Home /> : <Navigate to={"/login"} />} />
				<Route path='/signup' element={!authUser ? <Signup /> : <Navigate to={"/"} />} />
				<Route path='/login' element={!authUser ? <Login /> : <Navigate to={"/"} />} />
      
        <Route path='/network' element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />} />
       
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
      </Routes>
      <Toaster/>
    </Layout>
    </>
  )
}

export default App
