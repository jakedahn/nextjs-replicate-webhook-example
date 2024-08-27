import PredictionHandler from "./components/PredictionHandler";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI Image Generation
      </h1>
      <PredictionHandler />
    </div>
  );
}
