import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueueSocket } from "@/hooks/useQueueSocket";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reception")({
  head: () => ({
    meta: [
      { title: "Reception — Queue Cure '26" },
      { name: "description", content: "Receptionist controls for the clinic queue." },
    ],
  }),
  component: ReceptionPage,
});

function ReceptionPage() {
  const { state, connected, socket } = useQueueSocket("reception");
  const [name, setName] = useState("");
  const [avg, setAvg] = useState<string>("");
  const lastCallRef = useRef(0);

  useEffect(() => {
    if (state && avg === "") setAvg(String(state.avgConsultMinutes));
  }, [state, avg]);

  const callNext = () => {
    const now = Date.now();
    if (now - lastCallRef.current < 500) return;
    if (!state || state.waiting.length === 0) return;
    lastCallRef.current = now;
    socket.emit("reception:callNext", {});
  };

  const addPatient = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit("reception:addPatient", { name: name.trim() || undefined });
    setName("");
  };

  const undo = () => socket.emit("reception:undo", {});
  const complete = () => socket.emit("reception:completeCurrent", {});

  const updateAvg = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(avg);
    if (!Number.isFinite(m) || m <= 0) return;
    socket.emit("reception:setAvgTime", { minutes: m });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const waitingEmpty = !state || state.waiting.length === 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border" style={{ background: "var(--gradient-surface)" }}>
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <Link to="/" className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground">
              Queue Cure '26 / Staff
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">Reception desk</h1>
          </div>
          <ConnectionBadge connected={connected} />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div
            className="relative overflow-hidden rounded-3xl border border-border p-8 text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" aria-hidden />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary-foreground/70">In consultation</p>
              {state?.current ? (
                <div className="mt-3 flex items-baseline gap-5">
                  <div className="text-7xl font-semibold tabular-nums leading-none">
                    #{state.current.tokenNumber}
                  </div>
                  <div className="text-xl text-primary-foreground/85">
                    {state.current.name ?? "Unnamed"}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-3xl font-medium text-primary-foreground/80">
                  No one is being seen
                </p>
              )}
            </div>
          </div>

          <div
            className="rounded-3xl border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <Button
                onClick={callNext}
                disabled={waitingEmpty}
                className="h-16 text-lg font-semibold sm:col-span-3"
              >
                Call Next
              </Button>
              <Button variant="secondary" onClick={complete} disabled={!state?.current} className="h-12">
                Complete current
              </Button>
              <Button variant="outline" onClick={undo} className="h-12">
                Undo last call
              </Button>
              <div className="h-12 flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground px-3">
                Press Enter or Space
              </div>
            </div>
            <p className="sr-only">
              Tip: press Enter or Space to Call Next.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Waiting list</h2>
              <span className="text-sm text-muted-foreground tabular-nums">
                {state?.stats.waitingCount ?? 0} waiting
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {state && state.waiting.length > 0 ? (
                state.waiting.map((p) => (
                  <li key={p.tokenNumber} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-10 w-14 items-center justify-center rounded-lg bg-secondary text-base font-semibold tabular-nums text-secondary-foreground">
                        {p.tokenNumber}
                      </span>
                      <span className="text-foreground">{p.name ?? "Unnamed"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground tabular-nums">
                      {p.tokensAhead} ahead · ~{p.estimatedWaitMinutes} min
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-10 text-center text-muted-foreground">No patients waiting</li>
              )}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <form onSubmit={addPatient} className="rounded-3xl border border-border bg-card p-6 space-y-4" style={{ boxShadow: "var(--shadow-soft)" }}>
            <h2 className="text-lg font-semibold">Add patient</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asha"
                autoComplete="off"
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11">
              Add to queue
            </Button>
          </form>

          <form onSubmit={updateAvg} className="rounded-3xl border border-border bg-card p-6 space-y-4" style={{ boxShadow: "var(--shadow-soft)" }}>
            <h2 className="text-lg font-semibold">Avg consult time</h2>
            <div className="space-y-2">
              <Label htmlFor="avg">Minutes</Label>
              <Input
                id="avg"
                type="number"
                min={1}
                value={avg}
                onChange={(e) => setAvg(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full h-11">
              Update
            </Button>
            {state && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Effective avg</span><span className="tabular-nums text-foreground">{state.effectiveAvgMinutes} min</span></div>
                <div className="flex justify-between"><span>Completed today</span><span className="tabular-nums text-foreground">{state.stats.completedCount}</span></div>
              </div>
            )}
          </form>
        </aside>
      </div>
    </main>
  );
}