import type { CaseConfig } from "../logic/types";

interface CaseStepperProps {
  cases: CaseConfig[];
  activeCaseId: string;
  activeStep: number;
  onCaseChange: (caseId: string) => void;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onRandomizeCases: () => void;
}

export function CaseStepper({
  cases,
  activeCaseId,
  activeStep,
  onCaseChange,
  onStepChange,
  onNext,
  onRandomizeCases
}: CaseStepperProps) {
  const currentCase = cases.find((entry) => entry.caseId === activeCaseId) ?? cases[0];
  const totalSteps = currentCase.steps.length;

  return (
    <section className="case-stepper">
      <div className="step-head">
        <h2>{currentCase.title}</h2>
        <span>
          Step {activeStep} / {totalSteps}
        </span>
      </div>

      <div className="case-switcher">
        {cases.map((item) => (
          <button
            key={item.caseId}
            type="button"
            className={item.caseId === activeCaseId ? "active" : ""}
            onClick={() => onCaseChange(item.caseId)}
          >
            {item.caseId}
          </button>
        ))}
      </div>

      <ol>
        {currentCase.steps.map((step) => (
          <li key={step.step}>
            <button
              type="button"
              className={step.step === activeStep ? "active" : ""}
              onClick={() => onStepChange(step.step)}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="step-actions">
        <button type="button" className="next-btn" onClick={onNext} disabled={activeStep >= totalSteps}>
          Reveal Next Step
        </button>
        <button type="button" className="randomize-btn" onClick={onRandomizeCases}>
          Randomize Cases
        </button>
      </div>
    </section>
  );
}
