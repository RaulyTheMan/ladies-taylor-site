import { verifySession } from "@/lib/admin/dal";
import StudioShell from "@/components/studio/StudioShell";

// Belt-and-suspenders: every studio data page already forces dynamic
// rendering itself, but pinning it here too guarantees the whole route tree is
// never prefetched or served from Next's client/data caches — admins always
// see the live database state.
export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  return <StudioShell userEmail={user.email ?? ""}>{children}</StudioShell>;
}
