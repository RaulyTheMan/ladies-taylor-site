import { verifySession } from "@/lib/admin/dal";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
