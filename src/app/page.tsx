import { redirect } from "next/navigation";
import { getSessionUser, roleHomePaths } from "@/lib/session";

export default async function Home() {
  const user = await getSessionUser();

  redirect(user ? roleHomePaths[user.role] : "/login");
}
