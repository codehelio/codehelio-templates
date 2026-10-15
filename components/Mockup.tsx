import type { Template } from "@/lib/templates";

const Line = ({ w, dark = false }: { w: string; dark?: boolean }) => (
  <div className={`h-2 rounded-full ${dark ? "bg-white/70" : "bg-ink/15"}`} style={{ width: w }} />
);

export default function Mockup({ t }: { t: Template }) {
  const a = t.accent;
  const tint = `${a}1f`;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
      <div className="flex items-center gap-1.5 border-b border-ink/10 bg-mist px-3 py-2">
        <i className="size-2 rounded-full bg-ink/20" />
        <i className="size-2 rounded-full bg-ink/20" />
        <i className="size-2 rounded-full bg-ink/20" />
        <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[10px] text-ink/50">
          {t.slug}.codehelio.com
        </span>
      </div>

      <div className="relative h-56 overflow-hidden" aria-hidden>
        <div className="mockup-scroll absolute inset-x-0 top-0 space-y-4 pb-4">
          {/* nav */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="h-4 w-14 rounded" style={{ background: a }} />
            <div className="flex gap-2"><Line w="24px" /><Line w="24px" /><Line w="24px" /></div>
          </div>

          {/* hero */}
          {t.layout === "split" && (
            <div className="mx-4 grid grid-cols-2 items-center gap-3 rounded-lg p-4" style={{ background: tint }}>
              <div className="space-y-2">
                <div className="h-3 w-4/5 rounded-full" style={{ background: a }} />
                <div className="h-3 w-3/5 rounded-full" style={{ background: a }} />
                <Line w="90%" /><Line w="70%" />
                <div className="mt-2 h-5 w-16 rounded" style={{ background: a }} />
              </div>
              <div className="h-24 rounded-lg" style={{ background: a, opacity: 0.85 }} />
            </div>
          )}
          {t.layout === "center" && (
            <div className="mx-4 flex flex-col items-center gap-2 rounded-lg px-6 py-7" style={{ background: a }}>
              <div className="h-3 w-3/4 rounded-full bg-white" />
              <div className="h-3 w-1/2 rounded-full bg-white" />
              <Line w="65%" dark />
              <div className="mt-2 h-5 w-20 rounded bg-white" />
            </div>
          )}
          {t.layout === "grid" && (
            <div className="mx-4 space-y-2">
              <div className="h-16 rounded-lg" style={{ background: a, opacity: 0.9 }} />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 rounded" style={{ background: tint }} />)}
              </div>
            </div>
          )}

          {/* cards */}
          <div className="grid grid-cols-3 gap-2 px-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5 rounded-lg border border-ink/10 p-2">
                <div className="h-10 rounded" style={{ background: tint }} />
                <Line w="80%" /><Line w="55%" />
              </div>
            ))}
          </div>

          {/* text + band */}
          <div className="space-y-2 px-4"><Line w="60%" /><Line w="95%" /><Line w="85%" /></div>
          <div className="mx-4 flex items-center justify-between rounded-lg px-4 py-4" style={{ background: a }}>
            <div className="space-y-1.5"><Line w="90px" dark /><Line w="60px" dark /></div>
            <div className="h-5 w-14 rounded bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2 px-4">
            <div className="h-14 rounded-lg" style={{ background: tint }} />
            <div className="h-14 rounded-lg" style={{ background: tint }} />
          </div>
          <div className="mx-4 flex justify-between border-t border-ink/10 pt-3"><Line w="50px" /><Line w="80px" /></div>
        </div>
      </div>
    </div>
  );
}
