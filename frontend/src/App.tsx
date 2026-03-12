import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/core/Dashboard";
import Leads from "./pages/leads/Leads";
import BookingsPage from "./pages/Booking/BookingsPage";
import QuotationsPage from "./pages/Quotation/QuotationsPage";
import QuotationBuilderPage from "./pages/Quotation/QuotationBuilderPage";
import Settings from "./components/layout/Settings";

import LeadsDetail from "./pages/leads/LeadDetails";
import CreateLead from "./pages/leads/CreateLead";

import DashboardLayout from "./components/layout/Layout";
import Payments from "./components/layout/Payments";
import PermissionRoute from "./components/ui/PermissionRoute";
import RefundsPage from "./pages/refunds/RefundsPage";
import VisaCasesPage from "./pages/visa/VisaCasesPage";
import VisaDetailPage from "./pages/visa/VisaDetailPage";
import ComplaintsPage from "./pages/complaints/ComplaintsPage";
import ReportsHubPage from "./pages/reports/ReportsHubPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Auth Pages (No Sidebar/Header) */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 

        {/* Dashboard Layout */}
        <Route element={<PermissionRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/quotations/builder" element={<QuotationBuilderPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leads-details" element={<LeadsDetail />} />
            <Route path="/create-lead" element={<CreateLead />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/refunds" element={<RefundsPage />} />
            <Route path="/visa" element={<VisaCasesPage />} />
            <Route path="/visa/:id" element={<VisaDetailPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/reports" element={<ReportsHubPage />} />
          </Route>
        </Route>

 

      </Routes>
    </BrowserRouter>
  );
}

export default App;
