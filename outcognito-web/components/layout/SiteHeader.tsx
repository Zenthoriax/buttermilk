import type { ReactNode } from "react";

import LogoMark from "@/components/brand/LogoMark";

export default function SiteHeader({
  right,
}: {
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.065] bg-[#080808]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5 sm:px-7">
        <LogoMark href="/feed" />

        {right && (
          <div className="flex items-center gap-2">
            {right}
          </div>
        )}
      </div>
    </header>
  );
}