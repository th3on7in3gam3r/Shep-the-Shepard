import { PageHeader } from "@/components/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Your Journey" subtitle="Faith stats & quick access" />
      <DashboardView />
    </>
  );
}
