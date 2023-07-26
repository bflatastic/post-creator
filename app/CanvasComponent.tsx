'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AiFillInstagram, AiFillFileImage } from 'react-icons/ai';
import { IoTrashBin } from 'react-icons/io5';
import { BiSolidDownload, BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { v4 as uuidv4 } from 'uuid';

const CanvasComponent: React.FC = () => {
  const [inputText, setInputText] = useState('Replace this text');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1080, height: 1350 });
  const [staticImage, setStaticImage] = useState<HTMLImageElement | null>(null);
  const [paddingRatio, setPaddingRatio] = useState(0.06);
  const [fontSize, setFontSize] = useState(50);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  const canvasWidth = 1080;
  const canvasHeight = 1350;

  const staticImageOptions = [
    { name: 'FactBolt', url: '/image/factbolt-overlay.png' },
    { name: 'TechnoBolt', url: '/image/technobolt-overlay.png' },
    { name: 'FootBolt', url: '/image/footbolt-overlay.png' },
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
        ctx.fillStyle = '#000000'; // background color
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
      ctx.shadowOffsetX = 0; // horizontal offset of the shadow
      ctx.shadowOffsetY = 0; // vertical offset of the shadow

      const textPaddingRatio = paddingRatio;
      const padding = width * textPaddingRatio;
      const lineHeight = fontSize * 1.35; // line height for multiline text.

      const words = inputText.split(' ');
      let line: string[] = [];
      let lines = [];

      // Create an array of lines
      for (let i = 0; i < words.length; i++) {
        line.push(words[i]);
        if (ctx.measureText(line.join(' ')).width > width - 2 * padding) {
          // Remove the last word from the line
          line.pop();

          // Add the line to the lines array
          lines.push(line.join(' '));

          // Start a new line with the current word
          line = [words[i]];
        }
      }

      // Add the last line to the lines array
      lines.push(line.join(' '));

      // Draw each line separately
      for (let i = 0; i < lines.length; i++) {
        // Draw the line of the text
        ctx.fillText(lines[i], width / 2, height / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight);
      }

      // Reset shadow to default state (no shadow)
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    [inputText, paddingRatio, staticImage, uploadedImage]
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

    const canvasFontSize = fontSize * scaleFactor; // make font size responsive
    drawTextAndImageOnCanvas(ctx, canvasFontSize, displayWidth, displayHeight);
  }, [inputText, windowDimensions, uploadedImage, drawTextAndImageOnCanvas, fontSize]);

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

  const handleRemoveUploadedImage: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setUploadedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const uuid = uuidv4();
    const fileName = `${uuid}.png`;

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

    drawTextAndImageOnCanvas(ctx, fontSize, canvasWidth, canvasHeight);

    const dataUrl = offscreenCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col xl:flex-row xl:h-screen md:items-center xl:justify-center bg-gray-900">
      <div className="p-6 flex flex-col gap-6 w-full max-w-[550px] bg-slate-800 rounded-lg ring-1 ring-slate-900/5 shadow-xl">
        <div className="flex flex-row items-center gap-4">
          <span className="inline-flex items-center justify-center p-2 bg-indigo-500 rounded-lg shadow-lg">
            <AiFillInstagram size="25" />
          </span>
          <h1 className="text-2xl font-bold">Instagram Post Creator</h1>
        </div>

        <div className="flex flex-col">
          {/* Select Overlay/Static Image */}
          <label className="mb-2 font-medium text-sm text-slate-400">Select Overlay Image</label>
          <div className="relative">
            <select className="w-full px-3 py-3 rounded-md text-white outline-none bg-slate-600 focus:ring focus:ring-indigo-500 appearance-none" value={selectedStaticImage || ''} onChange={handleStaticImageChange}>
              <option value="">None</option>
              {staticImageOptions.map((option) => (
                <option key={option.url} value={option.url}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
              <BiChevronDown className="text-white" size="20" />
            </div>
          </div>
        </div>
        {/* Text field */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-sm text-slate-400">Post Text</label>
          <textarea rows={3} className="p-3 rounded-md text-white outline-none bg-slate-600 focus:ring focus:ring-indigo-500" onChange={handleTextChange} ref={inputRef} placeholder="Add some text to the post..." />
        </div>

        {/* Advanced Settings Accordion */}
        <div className="flex flex-col">
          <div className="flex flex-row items-center cursor-pointer" onClick={() => setIsAdvancedSettingsOpen((prev) => !prev)}>
            <h5 className="text-sm font-bold text-slate-300">Advanced Settings</h5>
            {isAdvancedSettingsOpen ? <BiChevronUp size="20" /> : <BiChevronDown size="20" />}
          </div>
          {isAdvancedSettingsOpen && (
            <div className="flex flex-row gap-4 mt-4">
              <div className="flex flex-col flex-grow">
                <label className="mb-2 font-medium text-sm text-slate-400">Padding Ratio:</label>
                <input className="p-3 rounded-md text-white outline-none bg-slate-600 focus:ring focus:ring-indigo-500" type="number" min="0" max="1" step="0.01" value={paddingRatio} onChange={(e) => setPaddingRatio(parseFloat(e.target.value))} />
              </div>
              <div className="flex flex-col flex-grow">
                <label className="mb-2 font-medium text-sm text-slate-400">Font Size:</label>
                <input className="p-3 rounded-md text-white outline-none bg-slate-600 focus:ring focus:ring-indigo-500" type="number" min="1" max="100" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))} />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 lg:flex-row mt-2">
          <input type="file" accept="image/*" onChange={handleImageChange} ref={imageInputRef} style={{ display: 'none' }} />
          <button className="px-4 py-3 rounded-md bg-slate-600 text-white font-semibold hover:bg-slate-700 transition-colors duration-200 text-sm" onClick={() => imageInputRef.current?.click()}>
            <div className="flex flex-row items-center gap-2 justify-center">
              <AiFillFileImage size="16" />
              Upload Image
            </div>
          </button>

          <button className="px-4 py-3 rounded-md bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors duration-200 text-sm" onClick={handleSave}>
            <div className="flex flex-row items-center gap-2 justify-center">
              <BiSolidDownload size="18" />
              Save as PNG
            </div>
          </button>

          {uploadedImage !== null && (
            <button className="py-1 text-red-400 font-semibold hover:text-red-500 transition-colors duration-200 text-sm" onClick={handleRemoveUploadedImage}>
              <div className="flex flex-row items-center gap-2 justify-center">
                <IoTrashBin size="16" />
                Remove Image
              </div>
            </button>
          )}
        </div>
      </div>
      <div>
        <canvas ref={canvasRef} className="p-6" />
      </div>
    </div>
  );
};

export default CanvasComponent;
