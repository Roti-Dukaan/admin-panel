"use client";

import { Header } from "@/components/layout/header";
import { AdminTeamSection } from "@/features/rbac/components/AdminTeamSection";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        <Header
          title="Team"
          subtitle="Manage admin portal users and send invitations."
          showSearch={false}
        />
        <AdminTeamSection />
      </div>
    </div>
  );
}
