import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/app/page-bits";
import { Rise } from "@/components/app/motion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE, listUsers } from "@/server/admin/repo";
import { signOutUserAction, verifyUserEmailAction } from "@/server/admin/actions";
import { formatCount, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const search = (sp.q ?? "").slice(0, 100).trim();
  const page = Math.max(1, Math.min(10_000, Number(sp.page) || 1));
  const { rows, total } = await listUsers(search, page);
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE));
  const link = (p: number) => `/admin/users?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(p) }).toString()}`;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" intro={`${formatCount(total)} user${total === 1 ? "" : "s"}${search ? ` matching “${search}”` : ""}.`} />
      <Rise>
        <SectionCard title="Find a user">
          <form className="flex flex-wrap gap-2" role="search">
            <label htmlFor="u-q" className="sr-only">Search by email or name</label>
            <div className="relative min-w-[240px] flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <Input id="u-q" name="q" defaultValue={search} placeholder="Email or name" className="pl-9" />
            </div>
            <Button type="submit" variant="ink" size="sm">Search</Button>
          </form>
        </SectionCard>
      </Rise>
      <Rise delay={0.05}>
        <SectionCard title="Results">
          {rows.length === 0 ? (
            <p className="text-sm text-muted">No users match.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[13px] text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">User</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Workspaces</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Email</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Last login</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Joined</th>
                    <th scope="col" className="py-2 font-semibold"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id} className="border-b border-line/70 last:border-0">
                      <td className="max-w-[240px] py-2.5 pr-3">
                        <span className="block truncate font-semibold">{u.name}</span>
                        <span className="block truncate text-[13px] text-muted">{u.email}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="flex flex-wrap gap-1">
                          {u.workspaces
                            ? u.workspaces.split("|").map((w) => {
                                const [wid, ...name] = w.split(":");
                                return (
                                  <Link key={wid} href={`/admin/workspaces/${wid}`} className="rounded-full bg-mist px-2.5 py-0.5 text-[12px] font-semibold text-ink no-underline hover:bg-mint">
                                    {name.join(":")}
                                  </Link>
                                );
                              })
                            : <span className="text-muted">None</span>}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{u.verified ? <Badge variant="mint" size="sm">Verified</Badge> : <Badge variant="sun" size="sm">Unverified</Badge>}</td>
                      <td className="py-2.5 pr-3 text-[13px] text-muted">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</td>
                      <td className="py-2.5 pr-3 text-[13px] text-muted">{timeAgo(u.createdAt)}</td>
                      <td className="py-2.5">
                        <span className="flex justify-end gap-1">
                          {!u.verified && (
                            <form action={verifyUserEmailAction}>
                              <input type="hidden" name="userId" value={u.id} />
                              <Button type="submit" variant="ghost" size="sm">Mark verified</Button>
                            </form>
                          )}
                          {u.sessions > 0 && (
                            <form action={signOutUserAction}>
                              <input type="hidden" name="userId" value={u.id} />
                              <Button type="submit" variant="ghost" size="sm">Sign out ({u.sessions})</Button>
                            </form>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">Page {page} of {pages}</span>
              <span className="flex gap-2">
                {page > 1 && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link(page - 1)}>Previous</Link>}
                {page < pages && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link(page + 1)}>Next</Link>}
              </span>
            </div>
          )}
        </SectionCard>
      </Rise>
    </>
  );
}
