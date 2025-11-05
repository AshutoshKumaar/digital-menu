import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const razorpay = new Razorpay({
      key_id: "rzp_test_RbMJyZOXsNLyXH",
      key_secret: "3fmNrhjKmkVrX0IN1hgHBS2z",
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: "plan_RbMZtBbxSZScaq",
      customer_notify: 1,
      total_count: 12
    });

    return new Response(
      JSON.stringify({ id: subscription.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Razorpay Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
