import { redirect } from "next/navigation";

export default async function LegacyPurchasePage({ params }: PageProps<"/caja/[code]">) {
  const { code } = await params;

  redirect(`/caja?code=${code}`);
}
