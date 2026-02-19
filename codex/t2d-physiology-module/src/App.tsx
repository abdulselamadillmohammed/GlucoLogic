import { Navigate, Route, Routes } from "react-router-dom";
import { T2DPhysiologyPage } from "./pages/T2DPhysiology";

export function App() {
  return (
    <Routes>
      <Route path="/learn/t2d" element={<T2DPhysiologyPage />} />
      <Route path="/learn/t2d-physiology" element={<Navigate to="/learn/t2d" replace />} />
      <Route path="*" element={<Navigate to="/learn/t2d" replace />} />
    </Routes>
  );
}
