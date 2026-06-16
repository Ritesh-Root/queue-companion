import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueueSocket } from "@/hooks/useQueueSocket";
import { ConnectionBadge } from "@/components/ConnectionBadge";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Waiting room — Queue Cure '26" },
      { name: "description", content: "Live now-serving display for patients." },
    ],
  }),
  component: PatientPage,
});

function PatientPage() {
  const { state, connected } = useQueueSocket("patient");
  const waitingCount = state?.stats.waitingCount ?? 0;
  const nextWait = state?.waiting[0]?.estimatedWaitMinutes ?? null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
            Queue Cure '26 — Waiting room
          </Link>
          <ConnectionBadge connected={connected} />
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl text-center space-y-12">
          <div>
            <p className="text-2xl md:text-3xl uppercase tracking-[0.3em] text-muted-foreground">
              Now Serving
            </p>
            <div className="mt-6">
              {state?.current ? (
                <>
                  <div className="text-[14rem] leading-none font-semibold tabular-nums text-primary">
                    {state.current.tokenNumber}
                  </div>
                  {state.current.name && (
                    <p className="mt-4 text-3xl text-foreground">{state.current.name}</p>
                  )}
                </>
              ) : (
                <div className="text-7xl md:text-8xl font-semibold text-muted-foreground">
                  Please wait
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Tokens waiting</p>
              <p className="mt-3 text-6xl font-semibold tabular-nums">{waitingCount}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-8">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Next wait</p>
              <p className="mt-3 text-6xl font-semibold tabular-nums">
                {nextWait !== null ? `~${nextWait}` : "—"}
                {nextWait !== null && <span className="text-2xl text-muted-foreground ml-2">min</span>}
              </p>
            </div>
          </div>

          {state && state.waiting.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Up next</p>
              <div className="flex flex-wrap justify-center gap-3">
                {state.waiting.slice(0, 6).map((p) => (
                  <div
                    key={p.tokenNumber}
                    className="rounded-xl bg-secondary px-5 py-3 text-2xl font-semibold tabular-nums text-secondary-foreground"
                  >
                    #{p.tokenNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}