interface ShameModalProps {
  open: boolean;
  title: string;
  message: string;
  emoji: string;
  onDismiss: () => void;
}

export default function ShameModal({
  open,
  title,
  message,
  emoji,
  onDismiss,
}: ShameModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6">
      <div className="bg-surface rounded-lg p-8 max-w-sm w-full text-center shadow-nav">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="font-display text-title font-bold mb-2">{title}</h2>
        <p className="text-body-sz text-ink-600 mb-6">{message}</p>
        <button
          onClick={onDismiss}
          className="btn-primary w-full"
        >
          I accept my shame
        </button>
      </div>
    </div>
  );
}
