import definitions from "../../../data/workshop/definitions.json";
import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { DrugClass, DrugEntry, SourceIndexEntry, Subfactor } from "../logic/types";

interface Props {
  subfactor: Subfactor;
  selectedDrug: DrugEntry | null;
  selectedClass: DrugClass | null;
  sourceIndex: SourceIndexEntry[];
  onClose: () => void;
}

const WHY_MATTERS: Record<Subfactor, string> = {
  glycemia:
    "This captures how strongly an option supports reaching glycemic targets in the case.",
  hypoglycemia:
    "If avoiding low blood sugar is important, prioritize options that align with lower hypoglycemia risk.",
  weight:
    "If weight is a target, prioritize options that align with weight goals while still meeting glycemic needs.",
  cardiorenal:
    "If heart/kidney outcomes matter in this case, choose options aligned with those goals (only as supported by dataset).",
  safety_tolerability:
    "Some options are limited by side effects or tolerability. This bubble makes that constraint visible.",
  access_cost:
    "Even effective options may be impractical if cost/access is a barrier. This bubble captures feasibility."
};

interface DefinitionEntry {
  definition?: string;
  type?: string;
  sources: Array<{ name: string; ref: string }>;
}

type DefinitionsMap = Record<string, DefinitionEntry>;

function sourceText(sourceId: string, sourceIndex: SourceIndexEntry[]) {
  const source = sourceIndex.find((entry) => entry.sourceId === sourceId);
  if (!source) return sourceId;
  return `${source.pdf}, p.${source.page}, ${source.where}`;
}

function effectLabel(effect: string) {
  if (effect === "not_stated") return "Not stated in dataset";
  return effect.charAt(0).toUpperCase() + effect.slice(1);
}

const definitionKey: Record<Subfactor, string> = {
  glycemia: "glycemia",
  hypoglycemia: "hypoglycemia",
  weight: "weight",
  cardiorenal: "cardiorenal_health",
  safety_tolerability: "safety_tolerability",
  access_cost: "access_cost"
};

export function NotebookPopover({ subfactor, selectedDrug, selectedClass, sourceIndex, onClose }: Props) {
  const defs = definitions as DefinitionsMap;
  const definition = defs[definitionKey[subfactor]];
  const classEffect = selectedClass?.classSummary[subfactor];
  const drugEffect = selectedDrug?.effects[subfactor];
  const hasDatasetNotes = Boolean(classEffect || drugEffect);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card notebook-popover" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          x
        </button>
        <h3>{SUBFACTOR_LABELS[subfactor]}</h3>

        {definition?.definition ? (
          <section>
            <h4>Definition</h4>
            <p>{definition.definition}</p>
            {definition.sources.length ? (
              <ul>
                {definition.sources.map((source) => (
                  <li key={`${source.name}-${source.ref}`}>
                    {source.name}: {source.ref}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <section>
          <h4>Why it matters</h4>
          <p>
            This bubble represents a decision priority. When you pick a drug, you may trade off benefits and risks across priorities.
            This helps you make those tradeoffs explicit for this case.
          </p>
          <p>{WHY_MATTERS[subfactor]}</p>
        </section>

        <section>
          <h4>How to interpret colors here</h4>
          <p>Positive and negative both use full-height fill animations; only the color changes. Neutral is low-fill. Not stated has no fill and only pulse.</p>
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
