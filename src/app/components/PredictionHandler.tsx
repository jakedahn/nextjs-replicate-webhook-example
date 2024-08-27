"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PromptForm from "./PromptForm";
import { Prediction } from "../types";

export default function PredictionHandler() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up SSE connection");
    const eventSource = new EventSource("/api/sse");

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      console.log("Received SSE event:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed SSE data:", data);
        setPrediction((prev) => {
          console.log("Previous prediction:", prev);
          console.log("New prediction:", data);
          return data;
        });
        if (data.status === "succeeded") {
          console.log("Prediction succeeded");
          setIsLoading(false);
          if (data.output && data.output.length > 0) {
            console.log("Setting image URL:", data.output[0]);
            setImageUrl(data.output[0]);
          }
        } else if (data.status === "failed") {
          console.log("Prediction failed");
          setIsLoading(false);
          setError("Image generation failed. Please try again.");
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []);

  const handleSubmit = async (prompt: string) => {
    console.log("Submitting prompt:", prompt);
    setError(null);
    setPrediction(null);
    setImageUrl(null);
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
      console.log("New prediction:", newPrediction);
      setPrediction(newPrediction);
    } catch (err) {
      console.error("Error starting prediction:", err);
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-2">
          Status:{" "}
          <span className="text-blue-600">
            {prediction?.status || "No prediction"}
          </span>
        </p>
        <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
        <p>Image URL: {imageUrl || "No image URL"}</p>
        {isLoading && (
          <p className="text-gray-600">Generating image, please wait...</p>
        )}
        {imageUrl && (
          <div className="mt-4">
            <Image
              src={imageUrl}
              alt="Generated image"
              width={512}
              height={512}
              className="rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
