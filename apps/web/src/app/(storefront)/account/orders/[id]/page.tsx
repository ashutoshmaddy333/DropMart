import { OrderDetailView } from "@/components/storefront/account/order-detail-view";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailView orderId={params.id} />;
}
