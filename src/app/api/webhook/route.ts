import { NextResponse } from "next/server";
import { validateWebhook } from "replicate";
import { sendEventToAll } from "../sse/route";

export async function POST(request: Request) {
  const webhookSecret = process.env.REPLICATE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("REPLICATE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  try {
    const isValid = await validateWebhook(request.clone(), webhookSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    console.log("Received valid webhook:", payload);

    // Send the webhook payload to all connected clients
    sendEventToAll(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
