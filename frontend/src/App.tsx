import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
// import Users from "./pages/users";
import Projects from "./pages/projects"
import ProtectedRoute from "./utils/ProtectedRoutes";
import ProjectDetails from "./pages/projectDetails";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={<ProjectDetails />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;