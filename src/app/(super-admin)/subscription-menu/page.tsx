import { redirect } from "next/navigation";

/** Legacy route — subscription dishes now come from Menu Items at runtime. */
export default function SubscriptionMenuRedirectPage() {
  redirect("/menu");
}
