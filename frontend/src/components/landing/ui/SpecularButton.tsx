import React from "react";
import { cn } from "../../../lib/utils";

export const SpecularButton = ({
  className,
  children,
  href,
  ...props
}: any) => {
  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white font-body text-base font-bold shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 border border-leaf/30 bg-herbal",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[specular-shine_1.5s_ease-in-out_infinite] z-0"></div>
      <div className="relative z-10 flex items-center gap-2">{children}</div>
    </div>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }
  return <button>{inner}</button>;
};
