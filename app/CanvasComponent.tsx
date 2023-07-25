'use client';

import React, { useRef, useState } from 'react';
import { fabric } from 'fabric';

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the container
  const [text, setText] = useState<string>('');

  // Function to update canvas size on resize
  const handleResize = () => {
    if (canvasRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const aspectRatio = 1080 / 1350; // Aspect ratio of 1080x1350

      let canvasWidth, canvasHeight;
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than the aspect ratio
        canvasWidth = containerHeight * aspectRatio;
        canvasHeight = containerHeight;
      } else {
        // Container is taller than the aspect ratio
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / aspectRatio;
      }

      // Set the canvas dimensions
      canvasRef.current.setDimensions({ width: canvasWidth, height: canvasHeight });
      canvasRef.current.renderAll();
    }
  };

  // Initialize canvas on mount
  React.useEffect(() => {
    if (!canvasRef.current) {
      const canvas = new fabric.Canvas('canvas', {
        width: 1080,
        height: 1350,
        backgroundColor: '#f0f0f0',
      });
      canvasRef.current = canvas;
      handleResize(); // Set initial canvas size
      window.addEventListener('resize', handleResize); // Listen for resize events
    }
    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on unmount
    };
  }, []);

  // Function to add an image layer from file
  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        fabric.Image.fromURL(
          url,
          (img) => {
            img.scaleToWidth(canvasRef.current!.getWidth());
            img.scaleToHeight(canvasRef.current!.getHeight());
            img.set({
              lockMovementX: false, // Enable horizontal dragging
              lockMovementY: false, // Enable vertical dragging
              selectable: false, // Disable selection for the image
            });
            canvasRef.current!.add(img);
            img.sendToBack(); // Place the image behind other objects on the canvas
            canvasRef.current!.renderAll();
          },
          { crossOrigin: 'anonymous' }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to update the text on canvas
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    const textObject = canvasRef.current?.getObjects().find((obj) => obj.type === 'i-text') as fabric.IText;
    if (textObject) {
      textObject.set('text', event.target.value);
      canvasRef.current!.renderAll();
    } else {
      const newTextBox = new fabric.IText(event.target.value, {
        left: canvasRef.current!.getWidth() / 2,
        top: canvasRef.current!.getHeight() / 2,
        fontFamily: 'Inter', // Set the font to "Inter"
        fontSize: 30,
        fill: 'black',
        originX: 'center',
        originY: 'center',
        lockMovementX: true, // Disable horizontal dragging
        lockMovementY: true, // Disable vertical dragging
        selectable: false, // Disable selection for the text
        textAlign: 'center',
      });
      canvasRef.current!.add(newTextBox);
      canvasRef.current!.setActiveObject(newTextBox);
      canvasRef.current!.renderAll();
    }
  };

  // Function to save the canvas content as PNG
  const handleSaveCanvas = () => {
    const dataURL = canvasRef.current?.toDataURL({
      format: 'png',
    });
    if (dataURL) {
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas.png';
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div ref={containerRef} className="border ">
        <canvas width={1080} height={1350} id="canvas" className="h-full w-full" />
      </div>
      <input type="file" accept="image/*" onChange={handleAddImage} className="mt-4" />
      <textarea value={text} onChange={handleTextChange} placeholder="Enter text here..." className="mt-2 p-2 border" />
      <button onClick={handleSaveCanvas} className="mt-2 bg-blue-500 text-white p-2">
        Save Canvas
      </button>
    </div>
  );
};

export default CanvasComponent;
