import Link from "next/link";

export default function LogoMark({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3"
    >
      <div
        className={[
          "flex shrink-0 items-center justify-center",
          "border border-white/10 bg-white/[0.035]",
          "font-mono font-medium tracking-[-0.08em]",
          "text-white/80 transition",
          "group-hover:border-white/20 group-hover:bg-white/[0.06]",
          compact
            ? "h-7 w-7 rounded-lg text-[8px]"
            : "h-9 w-9 rounded-xl text-[9px]",
        ].join(" ")}
      >
        OC
      </div>

      {!compact && (
        <div>
          <div className="text-[12px] font-medium tracking-[0.02em] text-white/90">
            OUTCOGNITO
          </div>

          <div className="font-mono text-[8px] uppercase tracking-[0.17em] text-white/25">
            public browser society
          </div>
        </div>
      )}
    </Link>
  );
}