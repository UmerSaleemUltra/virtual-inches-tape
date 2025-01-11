import React, { useState, useRef, useEffect } from "react";

const VirtualInchesTape = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user"); // Default to front camera
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [measurement, setMeasurement] = useState(null);

  // Start the camera stream based on facingMode
  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: facingMode },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error starting the camera:", error);
      alert("Unable to access the camera. Please check permissions.");
    }
  };

  // Switch camera when facingMode changes
  const switchCamera = (mode) => {
    setFacingMode(mode);
  };

  useEffect(() => {
    startCamera(); // Restart camera when facingMode changes
  }, [facingMode]);

  // Handle touch or click to start and stop measuring
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!isMeasuring) {
      setStartPoint({ x, y });
      setEndPoint(null);
      setMeasurement(null);
      setIsMeasuring(true);
    } else {
      setEndPoint({ x, y });
      setIsMeasuring(false);

      // Calculate distance in pixels and convert to inches
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const distanceInPixels = Math.sqrt(dx ** 2 + dy ** 2);
      const inches = (distanceInPixels / canvas.width) * 12; // Example scale: canvas width = 12 inches
      setMeasurement(inches.toFixed(2));
    }
  };

  // Draw measurement line on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (startPoint) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (startPoint && endPoint) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  }, [startPoint, endPoint]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Virtual Inches Tape
      </h1>

      {/* Video Preview */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {/* Canvas overlay for measurement */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Measurement Display */}
      <div className="mt-4 text-lg text-center text-gray-700 bg-white p-3 rounded-md shadow-md w-full max-w-md">
        {measurement
          ? `Measurement: ${Math.floor(measurement / 12)} ft ${
              measurement % 12
            } in`
          : isMeasuring
          ? "Tap to set the end point"
          : "Tap to start measuring"}
      </div>

      {/* Camera Controls */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => switchCamera("user")}
          className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 shadow-md transition"
        >
          Front Camera
        </button>
        <button
          onClick={() => switchCamera("environment")}
          className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 shadow-md transition"
        >
          Back Camera
        </button>
      </div>
    </div>
  );
};

export default VirtualInchesTape;
