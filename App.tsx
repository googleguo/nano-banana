import React, { useState } from 'react';
import { AppMode, AspectRatio, GeneratedImage } from './types';
import { generateImageContent, optimizePrompt } from './services/geminiService';
import { 
  MagicIcon, 
  PhotoIcon, 
  EditIcon, 
  SpinnerIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  CloseIcon,
  ChevronRightIcon 
} from './components/ui/Icons';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';

// --- Prompt Library Data ---
const PROMPT_LIBRARY = [
  {
    category: "Photography",
    items: [
      "A cinematic shot of a rainy street in Tokyo at night, neon lights reflecting on puddles, shot on 35mm lens, f/1.8, high contrast, realistic texture, 8k resolution.",
      "Portrait of an elderly fisherman with a weathered face, natural lighting, intricate details, depth of field, National Geographic style.",
      "Macro photography of a dew drop on a spider web, morning light, bokeh background, sharp focus, vibrant colors."
    ]
  },
  {
    category: "Digital Art & Fantasy",
    items: [
      "A cyberpunk samurai standing on a rooftop, futuristic city background, vibrant neon colors, glitch effect, detailed armor, digital painting style.",
      "A whimsical forest house inside a giant mushroom, fairy lights, magical atmosphere, soft pastel colors, ghibli studio style.",
      "An isometric view of a futuristic space station, low poly style, soft lighting, pastel color palette, highly detailed."
    ]
  },
  {
    category: "3D & Texture",
    items: [
      "A fluffy cute monster made of wool felt, stop motion style, studio lighting, soft shadows, 3d render, blender cycles.",
      "A futuristic car made of translucent glass and gold, studio lighting, subsurface scattering, octane render, 4k.",
      "Delicious looking gourmet burger with melting cheese, steam rising, professional food photography, 8k, highly detailed texture."
    ]
  }
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT_TO_IMAGE);
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description or instruction.');
      return;
    }
    
    if ((mode === AppMode.IMAGE_TO_IMAGE || mode === AppMode.IMAGE_EDIT) && !selectedImage) {
      setError('Please upload a reference image.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultBase64 = await generateImageContent({
        prompt,
        imageBase64: selectedImage || undefined,
        aspectRatio,
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: resultBase64,
        prompt,
        mode,
        timestamp: Date.now(),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while generating the image.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) return;
    
    setOptimizing(true);
    setError(null);
    try {
      const enhancedPrompt = await optimizePrompt(prompt);
      setPrompt(enhancedPrompt);
    } catch (err) {
      setError("Failed to optimize prompt. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  const handleSelectLibraryPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setShowLibrary(false);
  };

  const navItems = [
    { id: AppMode.TEXT_TO_IMAGE, label: 'Text to Image', icon: <MagicIcon className="w-4 h-4" /> },
    { id: AppMode.IMAGE_TO_IMAGE, label: 'Image to Image', icon: <PhotoIcon className="w-4 h-4" /> },
    { id: AppMode.IMAGE_EDIT, label: 'Image Edit', icon: <EditIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 pb-12 relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              N
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-800">
              Nano Banana Studio
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMode(item.id);
                    setError(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${mode === item.id 
                      ? 'bg-white text-yellow-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
             ))}
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex p-2 gap-2 min-w-max">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                   setMode(item.id);
                   setError(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${mode === item.id 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {item.icon}
                {item.label}
              </button>
           ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                   {mode === AppMode.TEXT_TO_IMAGE && <MagicIcon className="w-5 h-5 text-yellow-500" />}
                   {mode === AppMode.IMAGE_TO_IMAGE && <PhotoIcon className="w-5 h-5 text-yellow-500" />}
                   {mode === AppMode.IMAGE_EDIT && <EditIcon className="w-5 h-5 text-yellow-500" />}
                   <h2 className="text-lg font-semibold text-gray-800">
                      {mode === AppMode.TEXT_TO_IMAGE && 'Create from Text'}
                      {mode === AppMode.IMAGE_TO_IMAGE && 'Reimagine Image'}
                      {mode === AppMode.IMAGE_EDIT && 'Edit with Instructions'}
                   </h2>
                </div>
                
                {/* Library Button */}
                <button 
                  onClick={() => setShowLibrary(true)}
                  className="text-xs flex items-center gap-1.5 text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  Library
                </button>
              </div>

              {/* Conditional Image Uploader */}
              {(mode === AppMode.IMAGE_TO_IMAGE || mode === AppMode.IMAGE_EDIT) && (
                <div className="mb-6">
                  <ImageUploader 
                    label="Reference Image"
                    selectedImage={selectedImage}
                    onImageSelected={setSelectedImage}
                  />
                </div>
              )}

              {/* Prompt Input Area */}
              <div className="mb-6 relative">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === AppMode.IMAGE_EDIT ? 'Instructions' : 'Prompt'}
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      mode === AppMode.IMAGE_EDIT 
                      ? "E.g., Make it a cyberpunk city, Add a cat in the foreground..." 
                      : "E.g., A futuristic banana spaceship orbiting Saturn, cinematic lighting..."
                    }
                    className="w-full h-40 px-4 py-3 pb-12 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 resize-none transition-all placeholder:text-gray-400 text-gray-800 text-sm leading-relaxed"
                  />
                  
                  {/* Prompt Optimization Button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={handleOptimizePrompt}
                      disabled={!prompt.trim() || optimizing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm
                        ${!prompt.trim() || optimizing 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-md hover:scale-105'}`}
                      title="Enhance your prompt with AI"
                    >
                      {optimizing ? (
                        <SpinnerIcon className="w-3.5 h-3.5" />
                      ) : (
                        <SparklesIcon className="w-3.5 h-3.5" />
                      )}
                      {optimizing ? 'Optimizing...' : 'Optimize'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.values(AspectRatio).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all
                        ${aspectRatio === ratio 
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-700' 
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-yellow-400/20 transition-all transform active:scale-[0.98]
                  ${loading 
                    ? 'bg-yellow-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <SpinnerIcon className="w-5 h-5" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <MagicIcon className="w-5 h-5" />
                    <span>Generate</span>
                  </div>
                )}
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
               <h3 className="text-sm font-semibold text-blue-900 mb-1">Tip</h3>
               <p className="text-xs text-blue-700">
                 {mode === AppMode.TEXT_TO_IMAGE && "Use the 'Optimize' button to turn simple ideas into detailed, artistic prompts."}
                 {mode === AppMode.IMAGE_TO_IMAGE && "The model will use your image as a structural reference. Strong prompts work best."}
                 {mode === AppMode.IMAGE_EDIT && "Describe exactly what you want to change or add to the scene."}
               </p>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
              {generatedImages.length > 0 && (
                <span className="text-sm text-gray-500">{generatedImages.length} creations</span>
              )}
            </div>

            {generatedImages.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-[500px] flex flex-col items-center justify-center text-center p-8 text-gray-400">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <PhotoIcon className="w-10 h-10 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 mb-1">No images yet</h3>
                 <p className="max-w-xs mx-auto">Your creative masterpieces will appear here. Start by describing an idea or pick one from the library!</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedImages.map((image) => (
                  <ResultCard key={image.id} image={image} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Prompt Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Prompt Library</h3>
                  <p className="text-xs text-gray-500">Select a prompt to get started</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLibrary(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8">
              {PROMPT_LIBRARY.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{category.category}</h4>
                  <div className="grid gap-3">
                    {category.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => handleSelectLibraryPrompt(item)}
                        className="text-left p-4 rounded-xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group group-hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <p className="text-sm text-gray-700 leading-relaxed flex-1 group-hover:text-gray-900">{item}</p>
                          <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-yellow-500 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
              <p className="text-xs text-gray-500">
                Tip: You can edit these prompts after selecting them.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
