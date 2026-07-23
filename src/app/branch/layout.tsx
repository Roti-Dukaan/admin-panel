import BranchPage from "@/components/layout/branch-page"

export default function BranchLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <BranchPage title="Branch Dashboard" description="Branch management workspace">{children}</BranchPage>
}
