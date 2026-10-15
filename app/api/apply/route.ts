import { NextResponse } from "next/server";

type Body = {
  fullName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  domain?: string;
  notes?: string;
  clientCode?: string;
  template?: string;
};

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Body | null;

  if (!b?.fullName || !b.businessName || !b.email || !b.phone || !b.clientCode || !b.template) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  // TODO: save to your database / send an email here.
  console.log("New CodeHelio application:", b);

  return NextResponse.json({ ok: true, clientCode: b.clientCode });
}
