import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Queue Cure '26" },
      { name: "description", content: "Real-time clinic token queue system." },
      { property: "og:title", content: "Queue Cure '26" },
      { property: "og:description", content: "Real-time clinic token queue system." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Queue Cure '26</p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground">
            Real-time clinic queue
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick a screen to open. Both stay in sync live.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/reception"
            className="group rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Staff</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Reception</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add patients, call next, manage queue.
            </p>
          </Link>
          <Link
            to="/patient"
            className="group rounded-2xl border border-border bg-card p-8 text-left shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Public</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Waiting room</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Large display of the currently serving token.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
