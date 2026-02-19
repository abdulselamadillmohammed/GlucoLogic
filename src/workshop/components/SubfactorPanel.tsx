import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { CaseEntry, DrugEntry, SourceIndexEntry, Subfactor } from "../logic/types";

interface Props {
  selectedSubfactor: Subfactor | null;
  caseEntry: CaseEntry;
  selectedDrug: DrugEntry | null;
  sourceIndex: SourceIndexEntry[];
}

function sourceText(sourceId: string, sourceIndex: SourceIndexEntry[]) {
  const source = sourceIndex.find((item) => item.sourceId === sourceId);
  if (!source) return sourceId;
  return `${source.pdf} p.${source.page} (${source.where})`;
}

export function SubfactorPanel({ selectedSubfactor, caseEntry, selectedDrug, sourceIndex }: Props) {
  if (!selectedSubfactor) {
    return (
      <section className="glass subfactor-panel">
        <h3>Subfactor Bubble Panel</h3>
        <p>Select a reasoning group to drill down.</p>
      </section>
    );
  }

  const targets = caseEntry.learningTargets.filter((target) => target.subfactor === selectedSubfactor);
  const drugEffect = selectedDrug?.effects[selectedSubfactor];
  return (
    <section className="glass subfactor-panel">
      <h3>Subfactor Bubble Panel</h3>
      <p>Select a reasoning group to drill down.</p>
      <h4>{SUBFACTOR_LABELS[selectedSubfactor]}</h4>
      <ul>
        {targets.map((target, index) => (
          <li key={`${target.subfactor}-${index}`}>
            {target.goal}
            <small>{target.sources.map((src) => sourceText(src.sourceId, sourceIndex)).join(" | ")}</small>
          </li>
        ))}
      </ul>
      {drugEffect ? (
        <div>
          <p>
            Current drug effect: <strong>{drugEffect.effect}</strong>
          </p>
          <small>{drugEffect.sources.map((src) => sourceText(src.sourceId, sourceIndex)).join(" | ")}</small>
        </div>
      ) : null}
    </section>
  );
}
