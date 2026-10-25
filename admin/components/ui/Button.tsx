import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: boolean };

export function Button({
  variant = "primary",
  icon = false,
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "btn",
        variant !== "primary" && `btn-${variant}`,
        icon && "btn-icon",
        className,
      )}
      {...props}
    />
  );
}
