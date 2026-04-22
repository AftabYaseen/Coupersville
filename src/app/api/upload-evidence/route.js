import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase  = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData   = await request.formData();
  const files      = formData.getAll("files");
  const companyId  = formData.get("companyId");
  const incidentId = formData.get("incidentId");

  if (!files.length) {
    return NextResponse.json({ urls: [] });
  }

  const urls = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const ext  = file.name.split(".").pop();
    const path = `${companyId}/${incidentId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("incident-evidence")
      .upload(path, buffer, {
        contentType:  file.type,
        cacheControl: "3600",
        upsert:       false,
      });

    if (!error) {
      const { data } = supabase.storage
        .from("incident-evidence")
        .getPublicUrl(path);
      if (data.publicUrl) urls.push(data.publicUrl);
    }
  }

  return NextResponse.json({ urls });
}
