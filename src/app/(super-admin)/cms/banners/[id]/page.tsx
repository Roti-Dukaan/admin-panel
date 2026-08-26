import { redirect } from "next/navigation";

export default function LegacyBannerEditPage({ params }: { params: { id: string } }) {
  redirect(`/mobile-app/banners/${params.id}`);
}
