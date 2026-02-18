import type { FullHistory } from "../logic/types";

type PatientHistoryDrawerProps = {
  open: boolean;
  history: FullHistory;
  onClose: () => void;
};

export function PatientHistoryDrawer({ open, history, onClose }: PatientHistoryDrawerProps) {
  return (
    <aside className={`history-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-head">
        <h3>Full Patient History</h3>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <section>
        <h4>Labs</h4>
        <ul>
          {history.labs.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Comorbidities</h4>
        <ul>
          {history.comorbidities.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Constraints</h4>
        <ul>
          {history.constraints.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Prior medications</h4>
        <ul>
          {history.priorMeds.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Contraindications</h4>
        <ul>
          {history.contraindications.length > 0 ? (
            history.contraindications.map((entry) => <li key={entry}>{entry}</li>)
          ) : (
            <li>None documented</li>
          )}
        </ul>
      </section>
    </aside>
  );
}
