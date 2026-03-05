import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import Dashboard from "./pages/Dashboard";

// import DashboardLayout from "./layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Pages (No Sidebar/Header) */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> */}
 
        {/* Dashboard Layout */}
       {/* <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Route>  */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;