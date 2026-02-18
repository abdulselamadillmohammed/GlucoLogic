import type { CaseData } from "../logic/types";

type CaseStepperProps = {
  cases: CaseData[];
  activeCaseId: string;
  stepIndex: number;
  onCaseChange: (caseId: string) => void;
  onStepChange: (next: number) => void;
  onReset: () => void;
};

export function CaseStepper({
  cases,
  activeCaseId,
  stepIndex,
  onCaseChange,
  onStepChange,
  onReset
}: CaseStepperProps) {
  if (cases.length === 0) {
    return null;
  }

  const activeCase = cases.find((item) => item.caseId === activeCaseId) ?? cases[0];

  const canPrev = stepIndex > 0;
  const canNext = stepIndex < activeCase.steps.length - 1;

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
              {caseItem.title}
            </option>
          ))}
        </select>

        <button type="button" onClick={() => canPrev && onStepChange(stepIndex - 1)} disabled={!canPrev}>
          Previous
        </button>
        <button type="button" onClick={() => canNext && onStepChange(stepIndex + 1)} disabled={!canNext}>
          Next
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <p>
        Step {stepIndex + 1} / {activeCase.steps.length}: {activeCase.steps[stepIndex]?.title}
      </p>
    </section>
  );
}
