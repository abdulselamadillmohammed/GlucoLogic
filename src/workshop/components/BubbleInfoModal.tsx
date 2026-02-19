import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { DrugClass, DrugEntry, Effect, SourceIndexEntry, Subfactor } from "../logic/types";

interface Props {
  subfactor: Subfactor;
  selectedDrug: DrugEntry | null;
  selectedClass: DrugClass | null;
  sourceIndex: SourceIndexEntry[];
  onClose: () => void;
}

const BASE_EXPLANATIONS: Record<Subfactor, string> = {
  glycemia: "How well the option supports reaching glucose targets in this case.",
  weight: "How the option tends to affect weight-related goals or tradeoffs in this case.",
  hypoglycemia: "How the option relates to avoiding low blood sugar risk as a priority.",
  cardiorenal: "How the option relates to heart/kidney outcome priorities when present.",
  safety_tolerability: "How side effects and tolerability considerations influence choice.",
  access_cost: "How affordability/coverage and access constraints influence choice."
};

function sourceText(sourceId: string, sourceIndex: SourceIndexEntry[]) {
  const source = sourceIndex.find((entry) => entry.sourceId === sourceId);
  if (!source) return sourceId;
  return `${source.pdf}, p.${source.page}, ${source.where}`;
}

function effectLabel(effect: Effect) {
  if (effect === "not_stated") return "Not stated in dataset";
  return effect.charAt(0).toUpperCase() + effect.slice(1);
}

export function BubbleInfoModal({ subfactor, selectedDrug, selectedClass, sourceIndex, onClose }: Props) {
  const classEffect = selectedClass?.classSummary[subfactor];
  const drugEffect = selectedDrug?.effects[subfactor];
  const hasDatasetNotes = Boolean(classEffect || drugEffect);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card bubble-info-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          x
        </button>
        <h3>{SUBFACTOR_LABELS[subfactor]}</h3>

        <section>
          <h4>What this bubble means in this workspace</h4>
          <p>{BASE_EXPLANATIONS[subfactor]}</p>
        </section>

        <section>
          <h4>How it changes with drugs</h4>
          <p>Positive increases alignment with this decision priority; negative reduces alignment; neutral is mixed; not stated has no dataset signal.</p>
        </section>

        <section>
          <h4>Dataset notes</h4>
          {!hasDatasetNotes ? <p>Not stated in dataset.</p> : null}
          {classEffect ? (
            <div>
              <p>
                Class-level effect: <strong>{effectLabel(classEffect.effect)}</strong>
              </p>
              <ul>
                {classEffect.evidence.map((source) => (
                  <li key={`class-${source.sourceId}`}>{sourceText(source.sourceId, sourceIndex)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {drugEffect ? (
            <div>
              <p>
                Current selection impact: <strong>{effectLabel(drugEffect.effect)}</strong>
              </p>
              <ul>
                {drugEffect.sources.map((source) => (
                  <li key={`drug-${source.sourceId}`}>{sourceText(source.sourceId, sourceIndex)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
