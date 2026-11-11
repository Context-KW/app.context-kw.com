import React from "react";

/**
 * Brand logo from public/logo.png. The background is already transparent and the
 * image is trimmed, so it is shown as-is. Pass a width class (for example "w-36");
 * the height follows the image's own proportions.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Context | \u0643\u0648\u0646\u062a\u0643\u0633\u062a"
      draggable={false}
      className={`block h-auto max-w-none ${className}`}
    />
  );
}