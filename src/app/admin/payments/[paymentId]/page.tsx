"use client";

import { useParams } from "next/navigation";
import { PaymentDetails } from "@/features/payments/components/PaymentDetails";

export default function PaymentDetailPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;

  return <PaymentDetails paymentId={paymentId} />;
}
