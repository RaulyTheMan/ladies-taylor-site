import { verifySession } from "@/lib/admin/dal";
import AdminShell from "@/components/admin/AdminShell";

// Belt-and-suspenders: every admin data page already forces dynamic
// rendering itself, but pinning it here too guarantees the whole dashboard
// route tree is never prefetched or served from Next's client/data caches —
// admins always see the live database state.
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
