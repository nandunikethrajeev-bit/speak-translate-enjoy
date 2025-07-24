import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Type, ArrowRightLeft, Loader2, Mic, MicOff, Volume2, Copy, Share2, History, Download, Trash2, X, CameraOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Tesseract from 'tesseract.js';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'cs', name: 'Czech' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'fa', name: 'Persian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'my', name: 'Myanmar' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'ka', name: 'Georgian' },
  { code: 'am', name: 'Amharic' },
  { code: 'sw', name: 'Swahili' },
  { code: 'zu', name: 'Zulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'cy', name: 'Welsh' },
  { code: 'eu', name: 'Basque' },
  { code: 'ca', name: 'Catalan' },
  { code: 'gl', name: 'Galician' },
  { code: 'mt', name: 'Maltese' },
];

// Offline translation data (basic phrases)
const offlineTranslations: Record<string, Record<string, string>> = {
  'hello': {
    'es': 'hola', 'fr': 'bonjour', 'de': 'hallo', 'it': 'ciao', 'pt': 'olá',
    'ru': 'привет', 'ja': 'こんにちは', 'ko': '안녕하세요', 'zh': '你好', 'ar': 'مرحبا', 'hi': 'नमस्ते'
  },
  'thank you': {
    'es': 'gracias', 'fr': 'merci', 'de': 'danke', 'it': 'grazie', 'pt': 'obrigado',
    'ru': 'спасибо', 'ja': 'ありがとう', 'ko': '감사합니다', 'zh': '谢谢', 'ar': 'شكرا', 'hi': 'धन्यवाद'
  },
  'goodbye': {
    'es': 'adiós', 'fr': 'au revoir', 'de': 'auf wiedersehen', 'it': 'ciao', 'pt': 'tchau',
    'ru': 'до свидания', 'ja': 'さようなら', 'ko': '안녕히 가세요', 'zh': '再见', 'ar': 'وداعا', 'hi': 'अलविदा'
  },
  'yes': {
    'es': 'sí', 'fr': 'oui', 'de': 'ja', 'it': 'sì', 'pt': 'sim',
    'ru': 'да', 'ja': 'はい', 'ko': '네', 'zh': '是', 'ar': 'نعم', 'hi': 'हाँ'
  },
  'no': {
    'es': 'no', 'fr': 'non', 'de': 'nein', 'it': 'no', 'pt': 'não',
    'ru': 'нет', 'ja': 'いいえ', 'ko': '아니요', 'zh': '不', 'ar': 'لا', 'hi': 'नहीं'
  }
};

interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

const TranslationApp = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [activeTab, setActiveTab] = useState('translate');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (sourceText: string, translatedText: string, sourceLang: string, targetLang: string) => {
    const newEntry: TranslationHistory = {
      id: Date.now().toString(),
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      timestamp: new Date()
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50 translations
    setHistory(updatedHistory);
    localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
  };

  // Offline translation fallback
  const getOfflineTranslation = (text: string, sourceLang: string, targetLang: string): string => {
    const lowerText = text.toLowerCase().trim();
    if (offlineTranslations[lowerText] && offlineTranslations[lowerText][targetLang]) {
      return offlineTranslations[lowerText][targetLang];
    }
    return `[Offline: ${sourceLang} → ${targetLang}] ${text}`;
  };

  const translateText = async (text: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    let translation = '';
    
    try {
      // Try online translation first
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        translation = data.responseData.translatedText;
      } else {
        // Use offline translation
        translation = getOfflineTranslation(text, sourceLang, targetLang);
        toast({
          title: 'Offline Mode',
          description: 'Using offline translation for common phrases.',
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Use offline translation
      translation = getOfflineTranslation(text, sourceLang, targetLang);
      toast({
        title: 'Offline Mode',
        description: 'Network unavailable, using offline translation.',
      });
    } finally {
      setTranslatedText(translation);
      setIsTranslating(false);
      
      // Save to history
      if (translation && text !== translation) {
        saveToHistory(text, translation, sourceLang, targetLang);
      }
    }
  };

  const handleTextChange = (text: string) => {
    setSourceText(text);
    translateText(text);
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  // Voice input setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSourceText(transcript);
        translateText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: 'Voice Input Error',
          description: 'Could not capture voice input.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [sourceLang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support voice input.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = sourceLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-speech
  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Speech Not Supported',
        description: 'Your browser does not support text-to-speech.',
        variant: 'destructive',
      });
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        
        // Process the captured image
        processImage(imageData);
      }
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessingImage(true);
    try {
      const result = await Tesseract.recognize(imageData, sourceLang, {
        logger: m => console.log(m)
      });
      
      const extractedText = result.data.text.trim();
      if (extractedText) {
        setSourceText(extractedText);
        translateText(extractedText);
        toast({
          title: 'Text Extracted',
          description: 'Successfully extracted text from image!',
        });
      } else {
        toast({
          title: 'No Text Found',
          description: 'Could not extract text from the image.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'OCR Error',
        description: 'Failed to extract text from image.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageData = URL.createObjectURL(file);
    setCapturedImage(imageData);
    processImage(imageData);
  };

  // Copy and share functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard.',
      });
    });
  };

  const shareTranslation = () => {
    if (navigator.share && sourceText && translatedText) {
      navigator.share({
        title: 'Translation',
        text: `${sourceText} → ${translatedText}`,
      });
    } else {
      copyToClipboard(`${sourceText} → ${translatedText}`);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('translationHistory');
    toast({
      title: 'History Cleared',
      description: 'Translation history has been cleared.',
    });
  };

  const loadFromHistory = (item: TranslationHistory) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setActiveTab('translate');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Universal Translator
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced translation with voice, camera, and offline support
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translate">Translate</TabsTrigger>
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="translate" className="space-y-6">
            {/* Language Selection */}
            <Card className="bg-gradient-card shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">From</label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={swapLanguages}
                    className="mt-6 hover:bg-primary/10 hover:text-primary transition-smooth"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">To</label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translation Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Text */}
              <Card className="bg-gradient-card shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Source Text</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleVoiceInput}
                        className={`hover:bg-primary/10 ${isListening ? 'text-red-500' : 'text-primary'}`}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={isListening ? "Listening..." : "Enter text to translate..."}
                    value={sourceText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="min-h-[200px] resize-none border-0 focus-visible:ring-1 bg-background/50"
                    disabled={isListening}
                  />
                  {sourceText && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(sourceText, sourceLang)}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Speak
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(sourceText)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Translated Text */}
              <Card className="bg-gradient-card shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Translation
                      {isTranslating && <Loader2 className="h-4 w-4 animate-spin" />}
                    </span>
                    {translatedText && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={shareTranslation}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] p-3 bg-background/50 rounded-md border-input border">
                    {translatedText ? (
                      <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Translation will appear here...</p>
                    )}
                  </div>
                  {translatedText && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(translatedText, targetLang)}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        Speak
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(translatedText)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="space-y-6">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Camera Translation
                  <div className="flex gap-2">
                    {isProcessingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isCameraOpen && !capturedImage && (
                  <div className="text-center space-y-4">
                    <div className="p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Capture text with your camera or upload an image
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={startCamera}>
                          <Camera className="h-4 w-4 mr-2" />
                          Open Camera
                        </Button>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Download className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isCameraOpen && (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <Button onClick={capturePhoto} size="lg">
                          <Camera className="h-5 w-5 mr-2" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          <CameraOff className="h-5 w-5 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full rounded-lg border"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCapturedImage(null)}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={startCamera} variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Take Another
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Upload Different
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Translation History
                  {history.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No translation history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-background/50 rounded-lg border cursor-pointer hover:bg-background/70 transition-smooth"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-muted-foreground">
                            {languages.find(l => l.code === item.sourceLang)?.name} → {languages.find(l => l.code === item.targetLang)?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">{item.sourceText}</p>
                          <p className="text-sm text-primary font-medium">{item.translatedText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hidden elements */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default TranslationApp;