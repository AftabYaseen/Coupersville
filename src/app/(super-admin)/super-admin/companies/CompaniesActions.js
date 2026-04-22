"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCompanyStatus } from "./actions";

export default function CompaniesActions({ companyId, currentStatus }) {
  const router             = useRouter();
  const [isPending, start] = useTransition();

  async function handleChange(e) {
    const status = e.target.value;
    start(async () => { await setCompanyStatus(companyId, status); router.refresh(); });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="input w-auto text-xs py-1"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="suspended">Suspended</option>
    </select>
  );
}
