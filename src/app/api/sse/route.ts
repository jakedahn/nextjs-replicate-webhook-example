import { NextResponse } from "next/server";

let clients: Set<ReadableStreamDefaultController> = new Set();

export function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      return () => {
        clients.delete(controller);
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
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) =>
    client.enqueue(new TextEncoder().encode(message))
  );
}
