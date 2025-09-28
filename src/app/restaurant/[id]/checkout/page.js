import React from  'react'
import CheckoutClient from "../../../components/OrderModal";

export default function CheckoutPage({ params }) {
   const { id: ownerId } = React.use(params);
  return <CheckoutClient ownerId={ownerId} />;
}
