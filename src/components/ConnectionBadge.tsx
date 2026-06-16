export function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-primary" : "bg-destructive animate-pulse"}`}
        aria-hidden
      />
      {connected ? "Live" : "Reconnecting..."}
    </div>
  );
}