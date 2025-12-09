import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Square, Circle, Pencil, Check } from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

type Tool = 'rectangle' | 'ellipse' | 'freehand' | null;
type StrokeSize = 'small' | 'medium' | 'large';

interface RedactionShape {
  id: string;
  type: 'rectangle' | 'ellipse' | 'freehand';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
  strokeSize?: number;
}

/**
 * Anonymize page - allows users to redact sensitive information from documents
 * before digitization. Users can draw rectangles, ellipses, or freehand strokes.
 */
const Anonymize = () => {
  const { fileIndex } = useParams();
  const navigate = useNavigate();
  const { state, updateAnonymizedImage } = useApp();
  
  const currentIndex = parseInt(fileIndex || '0', 10);
  const currentFile = state.uploadedFiles[currentIndex];
  const totalFiles = state.uploadedFiles.length;
  const isLastFile = currentIndex === totalFiles - 1;
  const isFirstFile = currentIndex === 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(null);
  const [strokeSize, setStrokeSize] = useState<StrokeSize>('medium');
  const [shapes, setShapes] = useState<RedactionShape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<RedactionShape | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const strokeSizeValues = { small: 8, medium: 16, large: 24 };

  // Get the image to display (anonymized if available, otherwise original)
  const getDisplayImage = useCallback(() => {
    return currentFile?.anonymizedDataURL || currentFile?.dataURL;
  }, [currentFile]);

  // Load and draw image on canvas
  useEffect(() => {
    if (!currentFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      setImageDimensions({ width: img.width, height: img.height });
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };
    img.src = getDisplayImage() || '';

    // Reset shapes when file changes
    setShapes([]);
  }, [currentFile, getDisplayImage]);

  // Redraw canvas with shapes
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw image
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw all shapes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 2;

      [...shapes, currentShape].filter(Boolean).forEach(shape => {
        if (!shape) return;

        if (shape.type === 'rectangle') {
          const x = Math.min(shape.startX, shape.endX);
          const y = Math.min(shape.startY, shape.endY);
          const width = Math.abs(shape.endX - shape.startX);
          const height = Math.abs(shape.endY - shape.startY);
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
        } else if (shape.type === 'ellipse') {
          const centerX = (shape.startX + shape.endX) / 2;
          const centerY = (shape.startY + shape.endY) / 2;
          const radiusX = Math.abs(shape.endX - shape.startX) / 2;
          const radiusY = Math.abs(shape.endY - shape.startY) / 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (shape.type === 'freehand' && shape.points) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = shape.strokeSize || strokeSizeValues.medium;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.beginPath();
          shape.points.forEach((point, idx) => {
            if (idx === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        }
      });
    };
    img.src = getDisplayImage() || '';
  }, [shapes, currentShape, imageLoaded, getDisplayImage, strokeSizeValues.medium]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);

    const newShape: RedactionShape = {
      id: Date.now().toString(),
      type: selectedTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      points: selectedTool === 'freehand' ? [{ x, y }] : undefined,
      strokeSize: selectedTool === 'freehand' ? strokeSizeValues[strokeSize] : undefined,
    };

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentShape) return;

    const { x, y } = getCanvasCoordinates(e);

    if (currentShape.type === 'freehand') {
      setCurrentShape(prev => prev ? {
        ...prev,
        points: [...(prev.points || []), { x, y }],
        endX: x,
        endY: y,
      } : null);
    } else {
      setCurrentShape(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  };

  const handleMouseUp = () => {
    if (currentShape) {
      setShapes(prev => [...prev, currentShape]);
      setCurrentShape(null);
    }
    setIsDrawing(false);
  };

  const handleAnonymize = () => {
    if (!canvasRef.current || shapes.length === 0) {
      toast.error('Please draw at least one redaction region');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw all shapes as solid black (permanent)
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    shapes.forEach(shape => {
      if (shape.type === 'rectangle') {
        const x = Math.min(shape.startX, shape.endX);
        const y = Math.min(shape.startY, shape.endY);
        const width = Math.abs(shape.endX - shape.startX);
        const height = Math.abs(shape.endY - shape.startY);
        ctx.fillRect(x, y, width, height);
      } else if (shape.type === 'ellipse') {
        const centerX = (shape.startX + shape.endX) / 2;
        const centerY = (shape.startY + shape.endY) / 2;
        const radiusX = Math.abs(shape.endX - shape.startX) / 2;
        const radiusY = Math.abs(shape.endY - shape.startY) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape.type === 'freehand' && shape.points) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = shape.strokeSize || strokeSizeValues.medium;
        ctx.beginPath();
        shape.points.forEach((point, idx) => {
          if (idx === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    });

    // Save the anonymized image
    const anonymizedDataURL = canvas.toDataURL('image/png');
    updateAnonymizedImage(currentFile.id, anonymizedDataURL);

    // Clear shapes after anonymization
    setShapes([]);
    toast.success('Document anonymized successfully');
  };

  const handleNext = () => {
    if (isLastFile) {
      // Navigate to digitization page
      navigate('/upload/preview/0');
    } else {
      navigate(`/upload/anonymize/${currentIndex + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/upload/anonymize/${currentIndex - 1}`);
    }
  };

  const handleFileSelect = (index: number) => {
    navigate(`/upload/anonymize/${index}`);
  };

  const handleBackToUpload = () => {
    navigate('/upload/review');
  };

  if (!state.currentPatient || !currentFile) {
    navigate('/home');
    return null;
  }

  // Only show canvas for images
  const isImage = currentFile.type.startsWith('image/');

  return (
    <div className="h-screen bg-muted flex flex-col overflow-hidden overscroll-y-none">
      <Header />
      
      {/* Compact Navigation Header */}
      <div className="bg-background border-b border-border px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back to Upload */}
          <button
            onClick={handleBackToUpload}
            className="vmtb-btn-outline flex items-center gap-1 px-2.5 py-1 text-xs flex-shrink-0"
            aria-label="Back to uploads"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Upload
          </button>

          {/* Center: File Name with Dropdown + File Type */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary truncate max-w-[180px] md:max-w-[280px]">
                  {currentFile.name}
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="max-h-60 overflow-y-auto">
                {state.uploadedFiles.map((file, index) => (
                  <DropdownMenuItem
                    key={file.id}
                    onClick={() => handleFileSelect(index)}
                    className={index === currentIndex ? 'bg-primary/10' : ''}
                  >
                    <span className={file.name.length > 100 ? 'truncate max-w-[200px]' : ''}>
                      {file.name.length > 100 ? file.name.substring(0, 97) + '...' : file.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* File Type Tag */}
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0">
              {currentFile.fileCategory}
            </span>
          </div>

          {/* Right: Previous and Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstFile}
              className="vmtb-btn-outline flex items-center gap-1 px-2.5 py-1 text-xs disabled:opacity-50 flex-shrink-0"
              aria-label="Previous file"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button 
              onClick={handleNext} 
              className="vmtb-btn-primary flex items-center gap-1 px-2.5 py-1 text-xs flex-shrink-0"
              aria-label="Next file"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Tools */}
        <div className="w-16 md:w-20 bg-background border-r border-border p-2 flex flex-col gap-2 flex-shrink-0">
          <p className="text-[10px] text-muted-foreground text-center font-medium mb-1">Tools</p>
          
          {/* Rectangle Tool */}
          <button
            onClick={() => setSelectedTool(selectedTool === 'rectangle' ? null : 'rectangle')}
            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              selectedTool === 'rectangle' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
            title="Rectangle redaction"
          >
            <Square className="w-4 h-4" />
            <span className="text-[9px]">Rect</span>
          </button>

          {/* Ellipse Tool */}
          <button
            onClick={() => setSelectedTool(selectedTool === 'ellipse' ? null : 'ellipse')}
            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              selectedTool === 'ellipse' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
            title="Ellipse redaction"
          >
            <Circle className="w-4 h-4" />
            <span className="text-[9px]">Ellipse</span>
          </button>

          {/* Freehand Tool */}
          <button
            onClick={() => setSelectedTool(selectedTool === 'freehand' ? null : 'freehand')}
            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              selectedTool === 'freehand' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
            title="Freehand redaction"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-[9px]">Draw</span>
          </button>

          {/* Stroke Size (only for freehand) */}
          {selectedTool === 'freehand' && (
            <div className="mt-2 space-y-1">
              <p className="text-[9px] text-muted-foreground text-center">Size</p>
              {(['small', 'medium', 'large'] as StrokeSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setStrokeSize(size)}
                  className={`w-full py-1 rounded text-[9px] transition-colors ${
                    strokeSize === size 
                      ? 'bg-primary/20 text-primary font-medium' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Undo last shape */}
          {shapes.length > 0 && (
            <button
              onClick={() => setShapes(prev => prev.slice(0, -1))}
              className="w-full py-1.5 mt-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[9px] transition-colors"
              title="Undo last"
            >
              Undo
            </button>
          )}
        </div>

        {/* Right: Canvas Area with Zoom */}
        <div className="flex-1 p-3 overflow-hidden" ref={containerRef}>
          <div className="h-full rounded-lg overflow-hidden bg-background relative border border-border">
            {isImage ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ mode: 'reset' }}
                disabled={!!selectedTool}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {/* Zoom Controls + Anonymize Button */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <button
                        onClick={() => zoomIn()}
                        className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => zoomOut()}
                        className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="w-4 h-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => resetTransform()}
                        className="w-8 h-8 bg-background/90 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Fit to view"
                      >
                        <Maximize className="w-4 h-4 text-foreground" />
                      </button>
                      
                      {/* Anonymize Button */}
                      <button
                        onClick={handleAnonymize}
                        disabled={shapes.length === 0}
                        className="h-8 px-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        aria-label="Anonymize"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Anonymize
                      </button>
                    </div>

                    {/* Canvas */}
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={`max-w-full max-h-full object-contain ${
                          selectedTool ? 'cursor-crosshair' : 'cursor-grab'
                        }`}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          width: imageDimensions.width > 0 ? 'auto' : '100%',
                          height: imageDimensions.height > 0 ? 'auto' : '100%',
                        }}
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
                <p className="text-sm mb-2">Anonymization is only available for image files.</p>
                <p className="text-xs">This file type ({currentFile.type}) will be processed as-is.</p>
                <button
                  onClick={handleNext}
                  className="vmtb-btn-primary mt-4 text-sm px-4 py-2"
                >
                  Continue to Next File
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Anonymize;
