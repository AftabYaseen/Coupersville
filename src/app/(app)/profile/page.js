import { requireAuth } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const metadata = { title: "My Profile | FairGround" };

export default async function ProfilePage() {
  const { profile } = await requireAuth();
  return <ProfileClient profile={profile} />;
}
