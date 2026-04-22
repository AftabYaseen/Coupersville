"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSuggestionStatus } from "./actions";

export default function SuggestionActions({ suggestionId, currentStatus }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();

  async function handleChange(e) {
    const status = e.target.value;
    start(async () => { await updateSuggestionStatus(suggestionId, status); router.refresh(); });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="input w-auto text-xs py-1 flex-shrink-0"
    >
      {["new","reviewed","planned","done","declined"].map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
