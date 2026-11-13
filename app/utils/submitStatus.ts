import { pickText } from "@/app/utils/format";
import type { Language } from "@/app/context/LanguageContext";
import type { SubmitFailure } from "@/app/utils/supabase/submissions";

export type SubmitState = "idle" | "incomplete" | "saving" | "done" | SubmitFailure;

/** Bilingual status line for a form submission. Null when there is nothing to show. */
export function submitStatusText(state: SubmitState, language: Language): string | null {
  switch (state) {
    case "incomplete":
      return pickText(
        language,
        "Please enter your name, a valid email, and a date and time.",
        "يرجى إدخال اسمك وبريد إلكتروني صحيح واختيار تاريخ ووقت."
      );
    case "saving":
      return pickText(language, "Saving your request…", "جارٍ حفظ طلبك…");
    case "done":
      return pickText(
        language,
        "Your request was saved. Our team will contact you to confirm.",
        "تم حفظ طلبك. سيتواصل معك فريقنا للتأكيد."
      );
    case "not_configured":
      return pickText(
        language,
        "Online requests are not set up yet. Please contact us directly.",
        "الطلبات الإلكترونية غير مفعلة بعد. يرجى التواصل معنا مباشرة."
      );
    case "invalid_file":
      return pickText(
        language,
        "Upload a PDF, Word, PNG, or JPG file up to 20 MB.",
        "ارفع ملف PDF أو Word أو PNG أو JPG بحجم لا يتجاوز 20 ميغابايت."
      );
    case "failed":
      return pickText(
        language,
        "We could not save your request. Please try again.",
        "تعذر حفظ طلبك. يرجى المحاولة مرة أخرى."
      );
    default:
      return null;
  }
}
