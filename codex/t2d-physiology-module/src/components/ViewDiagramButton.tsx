interface ViewDiagramButtonProps {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}

export function ViewDiagramButton({ label = "View diagram", onClick, disabled = false, hint }: ViewDiagramButtonProps) {
  return (
    <button
      type="button"
      className={`soft-btn focus-ring ${disabled ? "opacity-60" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={hint}
    >
      {label}
    </button>
  );
}
