import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const prediction = await replicate.predictions.create({
    version: "5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f",
    input: {
      width: 1024,
      height: 1024,
      prompt,
      scheduler: "K_EULER",
      num_outputs: 1,
      guidance_scale: 0,
      negative_prompt: "worst quality, low quality",
      num_inference_steps: 4,
    },
    webhook: `${process.env.NEXT_PUBLIC_API_URL}/api/webhook`,
    webhook_events_filter: ["completed"],
  });

  return NextResponse.json(prediction, { status: 201 });
}
