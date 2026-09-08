import zeLogo from "@/assets/ze-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function ZELogo({
  size = 40,
  className,
  sweep = false,
}: {
  size?: number;
  className?: string;
  sweep?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-[22%] ring-1 ring-border transition-transform duration-300 hover:scale-[1.04]",
        sweep && "ze-sweep",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={zeLogo.url}
        alt="ZE Copilot"
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function ZEAvatar({ size = 28 }: { size?: number }) {
  return <ZELogo size={size} className="rounded-full" />;
}

export function ZEWordmark({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <ZELogo size={size} />
      <span className="text-[15px] font-semibold tracking-tight">
        <span className="ze-text-gradient">ZE</span> Copilot
      </span>
    </span>
  );
}
