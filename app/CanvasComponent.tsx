'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const CanvasComponent: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1080, height: 1350 });

  const canvasWidth = 1080;
  const canvasHeight = 1350;

  useEffect(() => {
    // update state to actual window dimensions once component is mounted
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawTextAndImageOnCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, fontSize: number, width: number, height: number) => {
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw the image if available
      if (uploadedImage) {
        const image = uploadedImage;

        // Calculate the image dimensions while maintaining aspect ratio
        const aspectRatio = image.width / image.height;
        let drawWidth = width;
        let drawHeight = width / aspectRatio;

        if (drawHeight < height) {
          drawHeight = height;
          drawWidth = height * aspectRatio;
        }

        // Draw the image to cover the whole canvas
        ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      } else {
        // Draw only the text without an image
        ctx.fillStyle = '#f0f0f0'; // background color
        ctx.fillRect(0, 0, width, height);
      }

      // Draw the text
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(inputText, width / 2, height / 2);
    },
    [inputText, uploadedImage]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const scaleFactor = Math.min(windowDimensions.width / canvasWidth, windowDimensions.height / canvasHeight);

    const displayWidth = canvasWidth * scaleFactor;
    const displayHeight = canvasHeight * scaleFactor;

    // adjust display canvas size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // adjust offscreen canvas size
    canvas.width = displayWidth * window.devicePixelRatio;
    canvas.height = displayHeight * window.devicePixelRatio;

    // scale context to counter the increase in size due to devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const fontSize = 50 * scaleFactor; // make font size responsive
    drawTextAndImageOnCanvas(ctx, fontSize, displayWidth, displayHeight);
  }, [inputText, windowDimensions, uploadedImage, drawTextAndImageOnCanvas]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        setUploadedImage(image);
      };
    }
  };

  const handleSave = async () => {
    // mark as async
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;

    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    drawTextAndImageOnCanvas(ctx, 50, canvasWidth, canvasHeight);

    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'my-image.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:items-center lg:justify-center">
      <div>
        <canvas className="lg:border-r-2" ref={canvasRef} />
      </div>

      <div className="p-6 w-full">
        <div className="flex flex-col">
          <label className="mb-2 font-bold text-md text-gray-700">Input Text</label>
          <textarea className="border-2 rounded p-2 text-gray-700" onChange={handleTextChange} ref={inputRef} placeholder="Add some text to the post..." />
        </div>
        <div className="my-4">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={imageInputRef} style={{ display: 'none' }} />
          <button className="mt-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200" onClick={() => imageInputRef.current?.click()}>
            Upload Image
          </button>
        </div>
        <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200" onClick={handleSave}>
          Save as PNG
        </button>
      </div>
    </div>
  );
};

export default CanvasComponent;
