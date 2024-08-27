"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PromptForm from "./PromptForm";
import { Prediction } from "../types";

export default function PredictionHandler() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrediction(data);
      if (data.status === "succeeded" || data.status === "failed") {
        setIsLoading(false);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSubmit = async (prompt: string) => {
    setError(null);
    setPrediction(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to start prediction");
      }

      const newPrediction: Prediction = await response.json();
      setPrediction(newPrediction);
    } catch (err) {
      setError("Error starting prediction. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>
      )}
      {prediction && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg font-semibold mb-2">
            Status: <span className="text-blue-600">{prediction.status}</span>
          </p>
          {prediction.output && prediction.output.length > 0 && (
            <div className="mt-4">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="Generated image"
                width={512}
                height={512}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
