import type { PatientHistory } from "../logic/types";

interface PatientHistoryDrawerProps {
  open: boolean;
  history: PatientHistory;
  onClose: () => void;
}

export function PatientHistoryDrawer({ open, history, onClose }: PatientHistoryDrawerProps) {
  return (
    <>
      <div className={`drawer-backdrop ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`history-drawer ${open ? "open" : ""}`}>
        <header>
          <h3>Full Patient History</h3>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="drawer-section">
          <h4>Labs</h4>
          <ul>{history.labs.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="drawer-section">
          <h4>Comorbidities</h4>
          <ul>{history.comorbidities.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="drawer-section">
          <h4>Constraints</h4>
          <ul>{history.constraints.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="drawer-section">
          <h4>Prior Meds</h4>
          <ul>{history.priorMeds.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="drawer-section">
          <h4>Contraindications</h4>
          <ul>{history.contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </aside>
    </>
  );
}
