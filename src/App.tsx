import { Navigate, Route, Routes } from "react-router-dom";
import { ModuleMenu } from "./components/ModuleMenu";
import { PharmacologyComparePage } from "./pages/PharmacologyComparePage";
import { PharmacologyLearnPage } from "./pages/PharmacologyLearnPage";
import { PharmacologyMapPage } from "./pages/PharmacologyMapPage";
import { PharmacologyModuleShell } from "./pages/PharmacologyModuleShell";
import { T2DPhysiologyPage } from "./pages/T2DPhysiology";
import { WorkshopPage } from "./pages/WorkshopPage";

export function App() {
  return (
    <>
      <ModuleMenu />
      <Routes>
        <Route path="/learn/t2d" element={<T2DPhysiologyPage />} />
        <Route path="/learn/t2d-physiology" element={<Navigate to="/learn/t2d" replace />} />

        <Route path="/learn/pharmacology" element={<PharmacologyModuleShell />}>
          <Route index element={<Navigate to="/learn/pharmacology/map" replace />} />
          <Route path="map" element={<PharmacologyMapPage />} />
          <Route path="compare" element={<PharmacologyComparePage />} />
          <Route path="learn" element={<PharmacologyLearnPage />} />
        </Route>

        <Route path="/workshop" element={<WorkshopPage />} />

        <Route path="*" element={<Navigate to="/learn/t2d" replace />} />
      </Routes>
    </>
  );
}
