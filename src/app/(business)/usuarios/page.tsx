import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { NewUserButton, UserRowActions } from "@/features/business/user-dialogs";
import { listUsers } from "@/lib/api/users";
import { requireSession } from "@/lib/session";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("business.users");

  return { title: t("metaTitle") };
}

export default async function UsersPage() {
  await connection();
  const session = await requireSession();
  const t = await getTranslations("business.users");
  const format = await getFormatter();
  const users = await listUsers();

  const formatDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <Reveal variant="entrance" index={1}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle", { count: users.length })}
          actions={<NewUserButton />}
        />
      </Reveal>
      <Reveal variant="entrance" index={2}>
        <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none">
          <table className="hidden w-full lg:table">
            <thead className="bg-surface-muted text-left text-sm text-muted">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">{t("columns.user")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("columns.role")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("columns.status")}</th>
                <th scope="col" className="px-4 py-3 font-medium">{t("columns.createdAt")}</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">{t("columns.actions")}</span></th>
              </tr>
            </thead>
            <tbody className="table-reveal">
              {users.map((user) => {
                const isSelf = user.id === session.id;

                return (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar name={user.name} photoUrl={user.photoUrl} />
                        <span className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-2 text-base font-medium text-foreground">
                            {user.name}
                            {isSelf ? <Badge tone="neutral">{t("you")}</Badge> : null}
                          </span>
                          <span className="text-sm text-muted">{user.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.role === "admin" ? "primary" : "neutral"}>{t(`roles.${user.role}`)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.isActive ? "success" : "danger"}>
                        {t(user.isActive ? "status.active" : "status.inactive")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-base text-muted">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-3">
                      <UserRowActions user={user} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="row-reveal lg:hidden">
            {users.map((user) => {
              const isSelf = user.id === session.id;

              return (
                <li key={user.id} className="flex flex-col gap-3 border-t border-border px-4 py-4 first:border-t-0">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} photoUrl={user.photoUrl} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2 text-base font-medium text-foreground">
                        <span className="truncate">{user.name}</span>
                        {isSelf ? <Badge tone="neutral">{t("you")}</Badge> : null}
                      </span>
                      <span className="truncate text-sm text-muted">{user.email}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Badge tone={user.role === "admin" ? "primary" : "neutral"}>{t(`roles.${user.role}`)}</Badge>
                      <Badge tone={user.isActive ? "success" : "danger"}>
                        {t(user.isActive ? "status.active" : "status.inactive")}
                      </Badge>
                    </span>
                    <UserRowActions user={user} isSelf={isSelf} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>
    </>
  );
}
