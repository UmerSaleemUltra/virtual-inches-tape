import React, { useEffect, useRef, useState } from "react";

const VirtualTapeMeasure = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [measuring, setMeasuring] = useState(false); // Toggle for measuring mode

  useEffect(() => {
    // Fetch and start the camera feed
    const startCamera = async (deviceId) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    // Get available video input devices
    const fetchDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
          startCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, []);

  const handleCanvasTouch = (e) => {
    if (!measuring) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    addPoint(x, y);
  };

  const handleCanvasClick = (e) => {
    if (!measuring) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addPoint(x, y);
  };

  const addPoint = (x, y) => {
    setPoints((prev) => {
      const newPoints = [...prev, { x, y }];
      drawCanvas(newPoints);

      if (newPoints.length === 2) {
        // Calculate distance (arbitrary scale)
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const pixelDistance = Math.sqrt(dx ** 2 + dy ** 2);

        // Convert to real-world scale (assuming 10 pixels = 1 inch)
        const inches = pixelDistance / 10;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);

        setDistance({ feet, inches: remainingInches });
        setMeasuring(false); // Stop measuring after two points
      }

      return newPoints.length === 2 ? [] : newPoints;
    });
  };

  const drawCanvas = (points) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();
    }

    if (points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const switchCamera = async (deviceId) => {
    setCurrentDeviceId(deviceId);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const startMeasurement = () => {
    setMeasuring(true);
    setPoints([]);
    setDistance(null);
  };

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gray-100">
      <div className="relative w-full max-w-lg h-96">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="absolute top-0 left-0 w-full h-full"
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouch}
        />
      </div>
      <div className="mt-4 text-center">
        {distance && (
          <p className="text-lg font-semibold text-gray-700">
            Distance: {distance.feet} ft {distance.inches} in
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Click "Start Measurement" and tap two points on the screen to measure the distance.
        </p>
        <div className="flex flex-col items-center gap-2 mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={startMeasurement}
          >
            Start Measurement
          </button>
          <select
            className="p-2 border rounded-md"
            value={currentDeviceId || ""}
            onChange={(e) => switchCamera(e.target.value)}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default VirtualTapeMeasure;
