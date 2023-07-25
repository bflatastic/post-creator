'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(30);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Set initial canvas size
        canvas.width = 1080;
        canvas.height = 1350;
      }
    }
  }, []);

  const drawText = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image first
        if (image) {
          const aspectRatio = image.width / image.height;
          let newWidth = canvas.width;
          let newHeight = canvas.width / aspectRatio;
          let y = (canvas.height - newHeight) / 2;

          ctx.drawImage(image, 0, y, newWidth, newHeight);
        }

        // Then draw the text
        if (text) {
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          let y = (canvas.height + fontSize) / 2;
          ctx.fillText(text, canvas.width / 2, y);
        }
      }
    }
  }, [image, text, fontSize]);

  const drawImage = useCallback(() => {
    if (canvasRef.current && image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const aspectRatio = image.width / image.height;
        let newWidth = canvas.width;
        let newHeight = canvas.width / aspectRatio;
        let y = (canvas.height - newHeight) / 2;

        ctx.drawImage(image, 0, y, newWidth, newHeight);
      }
    }
  }, [image]);

  useEffect(() => {
    // Draw the image when it changes
    drawImage();
  }, [image, drawImage]);

  useEffect(() => {
    // Draw the text when it changes
    drawText();
  }, [text, fontSize, drawText]);

  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (canvasRef.current) {
      const newImage = document.createElement('img');

      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
          newImage.onload = () => {
            setImage(newImage);
          };
          newImage.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(event.target.value));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleSaveImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Create a data URL of the canvas content
      const dataUrl = canvas.toDataURL('image/png');
      // Create a new 'a' element
      const a = document.createElement('a');
      // Set the download URL to the data URL
      a.href = dataUrl;
      // Set the download attribute to specify filename
      a.download = 'canvas.png';
      // Trigger the download by simulating a click
      a.click();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <canvas className="md:border-r-2" ref={canvasRef} />

      <div className="p-6">
        <input type="file" accept="image/*" onChange={handleAddImage} className="w-full shadow-sm text-gray-500 focus:outline-none mb-5" />
        <input type="number" value={fontSize} onChange={handleFontSizeChange} className="w-full p-3 border-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2" min="1" step="1" />
        <input type="text" value={text} onChange={handleTextChange} className="w-full p-3 border-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSaveImage} className="w-full p-3 mt-4 bg-blue-600 text-white rounded-md">
          Save as Image
        </button>
      </div>
    </div>
  );
};

export default CanvasComponent;
