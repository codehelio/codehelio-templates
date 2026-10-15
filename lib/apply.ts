import Swal from "sweetalert2";
import type { Template } from "./templates";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid mix-ups

/** e.g. CH-SAF-2610-K7M2Q */
export function makeClientCode(slug: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `CH-${slug.slice(0, 3).toUpperCase()}-${ym}-${rand}`;
}

type Fields = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  domain: string;
  notes: string;
};

const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: "ch-popup",
    title: "ch-title",
    htmlContainer: "ch-html",
    confirmButton: "ch-confirm",
    cancelButton: "ch-cancel",
    validationMessage: "ch-validation",
  },
} as const;

export async function openApply(t: Template): Promise<void> {
  const code = makeClientCode(t.slug);

  const result = await Swal.fire<Fields>({
    ...swalBase,
    title: `Apply for ${t.name}`,
    width: 640,
    showCancelButton: true,
    confirmButtonText: "Send application",
    cancelButtonText: "Cancel",
    focusConfirm: false,
    showLoaderOnConfirm: true,
    html: `
      <div class="ch-code"><span>Your client code</span><strong>${code}</strong></div>
      <div class="ch-grid">
        <div><label class="ch-label" for="ch-name">Full name</label><input id="ch-name" class="ch-input" autocomplete="name" /></div>
        <div><label class="ch-label" for="ch-biz">Business name</label><input id="ch-biz" class="ch-input" autocomplete="organization" /></div>
        <div><label class="ch-label" for="ch-email">Email</label><input id="ch-email" type="email" class="ch-input" autocomplete="email" /></div>
        <div><label class="ch-label" for="ch-phone">Phone / WhatsApp</label><input id="ch-phone" type="tel" class="ch-input" autocomplete="tel" /></div>
        <div class="full"><label class="ch-label" for="ch-domain">Domain you want (optional)</label><input id="ch-domain" class="ch-input" placeholder="yourbusiness.lk" /></div>
        <div class="full"><label class="ch-label" for="ch-notes">What should we change in this template? (optional)</label><textarea id="ch-notes" class="ch-input"></textarea></div>
      </div>`,
    didOpen: () => Swal.getPopup()?.querySelector<HTMLInputElement>("#ch-name")?.focus(),
    preConfirm: async () => {
      const q = (id: string) =>
        (Swal.getPopup()?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)?.value ?? "").trim();
      const f: Fields = {
        fullName: q("ch-name"),
        businessName: q("ch-biz"),
        email: q("ch-email"),
        phone: q("ch-phone"),
        domain: q("ch-domain"),
        notes: q("ch-notes"),
      };
      if (!f.fullName || !f.businessName) return void Swal.showValidationMessage("Enter your name and business name.");
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return void Swal.showValidationMessage("Enter a valid email address.");
      if (f.phone.replace(/\D/g, "").length < 9) return void Swal.showValidationMessage("Enter a phone number with at least 9 digits.");

      try {
        const res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...f, clientCode: code, template: t.slug }),
        });
        if (!res.ok) throw new Error();
        return f;
      } catch {
        Swal.showValidationMessage("Could not send your application. Check your connection and try again.");
      }
    },
  });

  if (!result.isConfirmed) return;

  await Swal.fire({
    ...swalBase,
    icon: "success",
    iconColor: "#027cc7",
    title: "Application sent",
    html: `<div class="ch-html" style="text-align:center">
      <p style="margin:0 0 .75rem">We received your request for <b>${t.name}</b>. Quote this code when you contact us:</p>
      <div class="ch-code" style="justify-content:center"><strong>${code}</strong></div></div>`,
    confirmButtonText: "Done",
    showDenyButton: true,
    denyButtonText: "Copy code",
    customClass: { ...swalBase.customClass, denyButton: "ch-cancel" },
    preDeny: () => {
      navigator.clipboard?.writeText(code);
      Swal.showValidationMessage("Code copied");
      return false;
    },
  });
}
