'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const CanvasComponent: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1080, height: 1350 });
  const [staticImage, setStaticImage] = useState<HTMLImageElement | null>(null);

  const canvasWidth = 1080;
  const canvasHeight = 1350;

  const staticImageOptions = [
    { name: 'FactBolt', url: '/image/factbolt-overlay.png' },
    // Add more image options here
  ];
  const [selectedStaticImage, setSelectedStaticImage] = useState<string | null>(staticImageOptions[0].url);

  // Function to handle changes in the dropdown selection
  const handleStaticImageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedImage = event.target.value;
    setSelectedStaticImage(selectedImage);
  };

  useEffect(() => {
    // Load the selected static image
    if (selectedStaticImage) {
      const image = new Image();
      image.src = selectedStaticImage;
      image.onload = () => {
        setStaticImage(image);
      };
    } else {
      // If no image is selected, set staticImage to null
      setStaticImage(null);
    }
  }, [selectedStaticImage]);

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
        ctx.fillStyle = '#202020'; // background color
        ctx.fillRect(0, 0, width, height);
      }

      // Draw the static image if available
      if (staticImage) {
        // Calculate the static image dimensions while maintaining aspect ratio
        const aspectRatio = staticImage.width / staticImage.height;
        let drawWidth = width;
        let drawHeight = width / aspectRatio;

        if (drawHeight < height) {
          drawHeight = height;
          drawWidth = height * aspectRatio;
        }

        // Draw the static image to cover the whole canvas
        ctx.drawImage(staticImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      }

      // Draw the text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px Avenir`; // change the font here
      ctx.shadowColor = 'black'; // color of the shadow
      ctx.shadowBlur = 10; // the blur level of the shadow
      ctx.shadowOffsetX = 3; // horizontal offset of the shadow
      ctx.shadowOffsetY = 3; // vertical offset of the shadow

      const paddingRatio = 0.06;
      const padding = width * paddingRatio;

      const lines = inputText.split('\n'); // Split text into lines based on newline characters

      const lineHeight = fontSize * 1.5; // line height for multiline text. You can adjust this value as per your need

      // Draw each line separately
      for (let i = 0; i < lines.length; i++) {
        const words = lines[i].split(' ');
        let currentLine = words[0];
        for (let j = 1; j < words.length; j++) {
          const word = words[j];
          const widthWithSpace = ctx.measureText(currentLine + ' ' + word).width;
          if (widthWithSpace < width - 2 * padding) {
            currentLine += ' ' + word;
          } else {
            // Draw the line if it exceeds the width
            ctx.fillText(currentLine, width / 2, height / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
            currentLine = word;
          }
        }

        // Draw the last line of the text
        ctx.fillText(currentLine, width / 2, height / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
      }

      // Reset shadow to default state (no shadow)
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    [inputText, staticImage, uploadedImage]
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
    const text = event.target.value;
    setInputText(text);
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
    <div className="flex flex-col xl:flex-row h-screen md:items-center md:justify-center">
      <div>
        <canvas ref={canvasRef} />
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col">
          {/* Select Overlay/Static Image */}
          <label className="mb-2 font-bold text-md text-gray-700">Select Static Image: </label>
          <select className="border-2 rounded p-2 text-gray-700" value={selectedStaticImage || ''} onChange={handleStaticImageChange}>
            <option value="">None</option>
            {staticImageOptions.map((option) => (
              <option key={option.url} value={option.url}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        {/* Text field */}
        <div className="flex flex-col">
          <label className="mb-2 font-bold text-md text-gray-700">Input Text</label>
          <textarea className="border-2 rounded p-2 text-gray-700" onChange={handleTextChange} ref={inputRef} placeholder="Add some text to the post..." />
        </div>
        {/* Buttons */}
        <div className="flex flex-row gap-2">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={imageInputRef} style={{ display: 'none' }} />
          <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200" onClick={() => imageInputRef.current?.click()}>
            Upload Image
          </button>
          <button className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors duration-200" onClick={handleSave}>
            Save as PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasComponent;
