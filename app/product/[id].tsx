import ProductDetailScreen from "@/src/screens/ProductDetailScreen/ProductDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null; // replace with an Invalid product UI
  }

  return <ProductDetailScreen productId={productId} />;
}
