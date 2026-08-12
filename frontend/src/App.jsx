import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Locations from "./pages/Locations";
import Attendance from "./pages/Attendance";
import Calls from "./pages/Calls";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/employees" element={<Employees />} />

          <Route path="/locations" element={<Locations />} />

          <Route path="/attendance" element={<Attendance />} />

          <Route path="/calls" element={<Calls />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
