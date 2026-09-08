import React from "react";
import { cn } from "../../../lib/utils";

export const StarBorder = ({
  as: Component = "div",
  className,
  innerClassName,
  color = "#22C55E",
  speed = "6s",
  children,
  ...rest
}: any) => {
  return (
    <Component className={cn("relative inline-block overflow-hidden rounded-[20px] p-[2px]", className)} {...rest}>
      {/* Blurred luminous aura for bright radiant shine */}
      <div
        className="absolute inset-[-100%] z-0 rounded-full pointer-events-none blur-[4px] opacity-80"
        style={{
          animation: `star-border-spin ${speed} linear infinite`,
          background: `conic-gradient(from 180deg at 50% 50%, ${color} 0%, #4ADE80 25%, #86EFAC 35%, transparent 60%, transparent 100%)`,
        }}
      />
      {/* Crisp focused beam */}
      <div
        className="absolute inset-[-100%] z-0 rounded-full pointer-events-none"
        style={{
          animation: `star-border-spin ${speed} linear infinite`,
          background: `conic-gradient(from 180deg at 50% 50%, ${color} 0%, #4ADE80 20%, #86EFAC 30%, transparent 50%, transparent 100%)`,
        }}
      />
      <div className={cn("relative z-10 h-full w-full rounded-[18px] bg-parchment", innerClassName)}>
        {children}
      </div>
    </Component>
  );
};

