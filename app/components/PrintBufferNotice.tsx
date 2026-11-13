"use client";

import React from "react";
import { useTx } from "@/app/utils/useTx";
import {
  PRINT_HANDLING_MINUTES,
  formatMinutes,
} from "@/app/utils/scheduling";
import type { PrintBuffer } from "@/app/utils/scheduling";

/** Completion-window notice for a print job. High-volume jobs get an assertive alert. */
export function PrintBufferNotice({ buffer }: { buffer: PrintBuffer }) {
  const { language, tx } = useTx();
  const windowText = formatMinutes(buffer.windowMinutes, language);

  if (!buffer.isHighVolume) {
    return (
      <p className="mt-4 text-sm text-text-secondary">
        {tx(
          `Standard job: ready in about ${windowText}.`,
          `مهمة عادية: جاهزة خلال نحو ${windowText}.`
        )}
      </p>
    );
  }

  const printTime = formatMinutes(buffer.printMinutes, language);
  const handling = formatMinutes(PRINT_HANDLING_MINUTES, language);

  return (
    <div role="alert" className="mt-4 border-2 border-black bg-black p-4 text-sm text-white">
      <p className="font-bold">
        {tx(
          `High-volume job: allow at least ${windowText} before pickup.`,
          `مهمة طباعة كبيرة: يلزم ${windowText} على الأقل قبل الاستلام.`
        )}
      </p>
      <p className="mt-1">
        {tx(
          `${buffer.totalPages} pages need about ${printTime} of print time, plus ${handling} for handling and checks.`,
          `${buffer.totalPages} صفحة تحتاج نحو ${printTime} للطباعة، إضافة إلى ${handling} للتجهيز والمراجعة.`
        )}
      </p>
    </div>
  );
}
