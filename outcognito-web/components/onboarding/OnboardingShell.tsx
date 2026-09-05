import type {
  ReactNode,
} from "react";

import LogoMark from "@/components/brand/LogoMark";

export default function OnboardingShell({
  step,
  eyebrow,
  title,
  description,
  children,
}: {
  step?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 py-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.045), transparent 30%)",
        }}
      />

      <section className="relative w-full max-w-[460px]">
        <LogoMark />

        <div className="mt-14">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
              {eyebrow}
            </div>

            {step && (
              <div className="font-mono text-[9px] tracking-[0.18em] text-white/20">
                {step}
              </div>
            )}
          </div>

          <h1 className="mt-5 text-[34px] font-medium leading-[1.05] tracking-[-0.045em] text-white/95 sm:text-[40px]">
            {title}
          </h1>

          <p className="mt-5 max-w-[390px] text-[13px] leading-6 text-white/40">
            {description}
          </p>

          <div className="mt-9">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}