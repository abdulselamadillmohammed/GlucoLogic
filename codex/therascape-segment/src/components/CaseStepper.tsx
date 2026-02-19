import type { CaseEntry } from "../logic/types";

type CaseStepperProps = {
  cases: CaseEntry[];
  activeCaseId: string;
  onCaseChange: (caseId: string) => void;
  onReset: () => void;
  onRandomizeCases: () => void;
};

export function CaseStepper({
  cases,
  activeCaseId,
  onCaseChange,
  onReset,
  onRandomizeCases
}: CaseStepperProps) {
  if (cases.length === 0) {
    return null;
  }

  const activeCase = cases.find((caseItem) => caseItem.caseId === activeCaseId) ?? cases[0];
  const difficulty = activeCase?.difficulty ?? "Intermediate";
  const estMinutes = activeCase?.estMinutes ?? 8;

  return (
    <section className="case-stepper">
      <div className="controls">
        <label htmlFor="case-select">Case</label>
        <select
          id="case-select"
          value={activeCaseId}
          onChange={(event) => onCaseChange(event.target.value)}
        >
          {cases.map((caseItem) => (
            <option key={caseItem.caseId} value={caseItem.caseId}>
              {caseItem.title} [{caseItem.difficulty ?? "Intermediate"} - {caseItem.estMinutes ?? 8} min]
            </option>
          ))}
        </select>

        <button type="button" onClick={onRandomizeCases}>
          Randomize order
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <p className="case-meta">
        <strong>Difficulty:</strong> {difficulty} <strong>Estimated time:</strong> {estMinutes} min
      </p>
      <p>{cases.length} training cases loaded.</p>
    </section>
  );
}
