import type { Metadata } from "next";
import { SubscriptionPage } from "@/features/subscriptions/SubscriptionPage";

export const metadata: Metadata = { title: "Subscription" };

export default function Page() {
  return <SubscriptionPage />;
}
