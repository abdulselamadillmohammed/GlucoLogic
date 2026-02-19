import type { CaseEntry } from "../logic/types";

interface Props {
  selectedCase: CaseEntry;
  cases: CaseEntry[];
  onCaseChange: (caseId: string) => void;
  onRandomize: () => void;
  onReset: () => void;
}

export function CaseSelectorBar({ selectedCase, cases, onCaseChange, onRandomize, onReset }: Props) {
  return (
    <section className="glass top-card">
      <h1>Complication-centric therapeutic reasoning workspace</h1>
      <div className="case-row">
        <label>
          <span>Case</span>
          <select value={selectedCase.caseId} onChange={(event) => onCaseChange(event.target.value)}>
            {cases.map((caseEntry) => (
              <option key={caseEntry.caseId} value={caseEntry.caseId}>
                {caseEntry.title} [{caseEntry.difficulty} - {caseEntry.estimatedMinutes} min]
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onRandomize}>
          Randomize order
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="meta-row">
        <p>
          Difficulty: <strong>{selectedCase.difficulty}</strong>
        </p>
        <p>
          Estimated time: <strong>{selectedCase.estimatedMinutes} min</strong>
        </p>
      </div>
      <p>{cases.length} training cases loaded.</p>
    </section>
  );
}
