import type { CaseEntry } from "../logic/types";

interface Props {
  caseEntry: CaseEntry;
  onClose: () => void;
}

export function PatientHistoryModal({ caseEntry, onClose }: Props) {
  const vitals = caseEntry.prompt.vitalsLabs;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card patient-history-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          x
        </button>

        <header className="patient-modal-header">
          <h3>{caseEntry.title}</h3>
          <p>Patient history</p>
          <div className="vitals-row">
            <span>A1C: {vitals.a1c}</span>
            <span>eGFR: {vitals.egfr}</span>
            <span>BMI: {vitals.bmi}</span>
          </div>
        </header>

        <div className="patient-modal-grid">
          <section className="history-block">
            <h4>History</h4>
            <ul>{caseEntry.fullHistory.history.map((item) => <li key={`h-${item}`}>{item}</li>)}</ul>
          </section>

          <section className="history-block">
            <h4>Prior approach</h4>
            <ul>{caseEntry.prompt.summaryBullets.map((item) => <li key={`s-${item}`}>{item}</li>)}</ul>
          </section>

          <section className="history-block">
            <h4>Current meds</h4>
            <ul>{caseEntry.fullHistory.meds.map((item) => <li key={`m-${item}`}>{item}</li>)}</ul>
          </section>

          <section className="history-block">
            <h4>Comorbidities</h4>
            <ul>{caseEntry.fullHistory.comorbidities.map((item) => <li key={`c-${item}`}>{item}</li>)}</ul>
          </section>

          <section className="history-block">
            <h4>Constraints</h4>
            <ul>{caseEntry.fullHistory.constraints.map((item) => <li key={`k-${item}`}>{item}</li>)}</ul>
          </section>
        </div>
      </div>
    </div>
  );
}
