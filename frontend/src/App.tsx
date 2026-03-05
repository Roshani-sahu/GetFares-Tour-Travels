import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/core/Dashboard";

import DashboardLayout from "./components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Pages (No Sidebar/Header) */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 

        {/* Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Route>  

      </Routes>
    </BrowserRouter>
  );
}

export default App;