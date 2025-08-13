import RestaurantClient from "@/app/components/RestaurantClient";

export default async  function RestaurantPage({ params }) {
  const { id } = await  params; // params ko await karo
  return <RestaurantClient ownerId={id} />;
}
