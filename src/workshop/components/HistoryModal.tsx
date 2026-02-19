import type { CaseEntry } from "../logic/types";

interface Props {
  caseEntry: CaseEntry;
  onClose: () => void;
}

export function HistoryModal({ caseEntry, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>{caseEntry.title}</h3>
        <section>
          <h4>History</h4>
          <ul>{caseEntry.fullHistory.history.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h4>Current meds</h4>
          <ul>{caseEntry.fullHistory.meds.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h4>Comorbidities</h4>
          <ul>{caseEntry.fullHistory.comorbidities.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h4>Constraints</h4>
          <ul>{caseEntry.fullHistory.constraints.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
