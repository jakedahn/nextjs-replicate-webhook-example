import { NextResponse } from "next/server";

let clients: Set<ReadableStreamDefaultController> = new Set();

export function GET() {
  console.log("New SSE connection established");
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      console.log("Client added, total clients:", clients.size);

      return () => {
        clients.delete(controller);
        console.log("Client removed, total clients:", clients.size);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function sendEventToAll(data: any) {
  if (!data) {
    console.log("Attempted to send empty event, skipping");
    return;
  }
  console.log("Sending event to all clients:", data);
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) =>
    client.enqueue(new TextEncoder().encode(message))
  );
}
