import RestaurantClient from "@/app/components/RestaurantClient";
import AuthWatcher from "@/app/components/AuthWatcher";

export default async  function RestaurantPage({ params }) {
  const { id } = await  params; // params ko await karo
  return <>
    <AuthWatcher/>
    <RestaurantClient ownerId={id} />
  </>;
}
