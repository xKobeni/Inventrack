import { Routes, Route } from "react-router-dom"
import Login from "./pages/Auth/loginPage"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default App
