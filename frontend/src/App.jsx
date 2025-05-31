import { Routes, Route } from "react-router-dom"
import Login from "./pages/Auth/loginPage"
import Dashboard from "./pages/Admin/dashboard"
import { Toaster } from "@/components/ui/toaster"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
