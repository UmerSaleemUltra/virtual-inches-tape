import React, { useState, useRef, useEffect } from "react";

const CameraSwitchApp = () => {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user"); // Default to front camera

  // Start the camera stream based on facingMode
  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: facingMode }, // Use "user" or "environment"
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
    setFacingMode(mode); // Update facing mode
  };

  useEffect(() => {
    startCamera(); // Restart camera when facingMode changes
  }, [facingMode]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Camera Switch App</h1>

      {/* Video Preview */}
      <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* Camera Controls */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => switchCamera("user")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Front Camera
        </button>
        <button
          onClick={() => switchCamera("environment")}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Back Camera
        </button>
      </div>
    </div>
  );
};

export default CameraSwitchApp;
