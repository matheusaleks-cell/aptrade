import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvestorProfile } from "@/lib/actions";
import { ProfileContainer } from "./ProfileContainer";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getInvestorProfile(session.email);
  if (!profile) redirect("/login");

  return <ProfileContainer profile={profile} />;
}
