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
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
              Queue Cure '26
            </Link>
            <h1 className="text-xl font-semibold">Reception</h1>
          </div>
          <ConnectionBadge connected={connected} />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">In consultation</p>
            {state?.current ? (
              <div className="mt-2 flex items-baseline gap-4">
                <div className="text-5xl font-semibold tabular-nums">#{state.current.tokenNumber}</div>
                <div className="text-muted-foreground">{state.current.name ?? "Unnamed"}</div>
              </div>
            ) : (
              <p className="mt-2 text-2xl text-muted-foreground">No one is currently being seen</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={callNext}
                disabled={waitingEmpty || !connected}
                className="h-14 px-8 text-lg"
              >
                Call Next
              </Button>
              <Button size="lg" variant="secondary" onClick={complete} disabled={!state?.current}>
                Complete current
              </Button>
              <Button size="lg" variant="outline" onClick={undo}>
                Undo
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: press Enter or Space to Call Next.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Waiting list</h2>
              <span className="text-sm text-muted-foreground">
                {state?.stats.waitingCount ?? 0} waiting
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {state && state.waiting.length > 0 ? (
                state.waiting.map((p) => (
                  <li key={p.tokenNumber} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="w-12 text-xl font-semibold tabular-nums">#{p.tokenNumber}</span>
                      <span className="text-muted-foreground">{p.name ?? "Unnamed"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground tabular-nums">
                      {p.tokensAhead} ahead · ~{p.estimatedWaitMinutes} min
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-6 text-center text-muted-foreground">No patients waiting</li>
              )}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <form onSubmit={addPatient} className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Add patient</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asha"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!connected}>
              Add to queue
            </Button>
          </form>

          <form onSubmit={updateAvg} className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Avg consult time</h2>
            <div className="space-y-2">
              <Label htmlFor="avg">Minutes</Label>
              <Input
                id="avg"
                type="number"
                min={1}
                value={avg}
                onChange={(e) => setAvg(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={!connected}>
              Update
            </Button>
            {state && (
              <p className="text-xs text-muted-foreground">
                Effective average: {state.effectiveAvgMinutes} min · Completed today: {state.stats.completedCount}
              </p>
            )}
          </form>
        </aside>
      </div>
    </main>
  );
}