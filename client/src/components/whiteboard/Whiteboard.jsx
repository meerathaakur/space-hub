import { useState, useRef, useEffect } from 'react';
import { FiEdit, FiTrash2, FiDownload, FiCornerUpLeft, FiCornerUpRight } from 'react-icons/fi';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, currentStep + 1), imageData]);
    setCurrentStep(prev => prev + 1);
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[currentStep - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(prev => prev + 1);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[currentStep + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleTextInput = (e) => {
    if (textPosition && e.key === 'Enter') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.font = `${lineWidth * 8}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(textInput, textPosition.x, textPosition.y);
      
      setTextInput('');
      setTextPosition(null);
      saveToHistory();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveToHistory();
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool === 'image') {
      document.getElementById('imageUpload').click();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToolChange('pen')}
            className={`p-2 rounded-lg ${
              tool === 'pen' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
          <button
            onClick={undo}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiCornerUpLeft className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiCornerUpRight className="w-5 h-5" />
          </button>
          <button
            onClick={saveCanvas}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FiDownload className="w-5 h-5" />
          </button>
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-32"
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-100 p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="bg-white rounded-lg shadow-lg w-full h-full"
        />
      </div>

      {/* Text Input */}
      {textPosition && (
        <div
          className="absolute"
          style={{
            left: textPosition.x,
            top: textPosition.y,
          }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleTextInput}
            className="border border-gray-300 rounded px-2 py-1"
            autoFocus
          />
        </div>
      )}

      {/* Collaboration Status */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {isCollaborating ? 'Collaborating with others...' : 'Ready to collaborate'}
          </span>
          <button
            onClick={() => setIsCollaborating(!isCollaborating)}
            className={`px-3 py-1 rounded-full text-sm ${
              isCollaborating
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isCollaborating ? 'Collaborating' : 'Start Collaboration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard; 