import Razorpay from "razorpay";

export async function POST(req) {
  const { userId } = await req.json();

  const razorpay = new Razorpay({
    key_id: "rzp_test_RXqiuDDEpmIeNG",
    key_secret: "vPMy5Kmnsps6HIqVUfu3GsFP",
  });

  try {
    // Use a pre-created plan_id for ₹99/month
    const subscription = await razorpay.subscriptions.create({
      plan_id: "plan_XXXX",
      customer_notify: 1,
      start_at: Math.floor(Date.now() / 1000),
      notes: { userId },
    });

    return new Response(JSON.stringify(subscription), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
