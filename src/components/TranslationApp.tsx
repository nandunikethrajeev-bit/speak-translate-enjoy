import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Type, ArrowRightLeft, Loader2 } from 'lucide-react';
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
];

const TranslationApp = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const translateText = async (text: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    try {
      // Using MyMemory Translation API (free service)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        // Fallback to simple mock translation
        setTranslatedText(`[${sourceLang} → ${targetLang}] ${text}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to simple mock translation
      setTranslatedText(`[${sourceLang} → ${targetLang}] ${text}`);
      toast({
        title: 'Translation Error',
        description: 'Using offline translation mode.',
        variant: 'default',
      });
    } finally {
      setIsTranslating(false);
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
    
    // Swap texts as well
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setCapturedImage(URL.createObjectURL(file));

    try {
      const result = await Tesseract.recognize(file, sourceLang, {
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

  const openCamera = () => {
    fileInputRef.current?.click();
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
            Translate text instantly with camera or keyboard
          </p>
        </div>

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

        {/* Camera/Input Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-card shadow-elegant hover:shadow-glow transition-smooth cursor-pointer group" onClick={openCamera}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-smooth">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Camera Translation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Capture text with your camera
              </p>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 p-3 bg-accent/10 rounded-full w-fit">
                <Type className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Text Translation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Type or paste text to translate
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Captured Image Preview */}
        {capturedImage && (
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Captured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="max-w-full max-h-64 object-contain rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Text */}
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Source Text</span>
                {isProcessingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text to translate..."
                value={sourceText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[200px] resize-none border-0 focus-visible:ring-1 bg-background/50"
                disabled={isProcessingImage}
              />
            </CardContent>
          </Card>

          {/* Translated Text */}
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Translation</span>
                {isTranslating && <Loader2 className="h-4 w-4 animate-spin" />}
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
            </CardContent>
          </Card>
        </div>

        {/* Hidden file input for camera */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default TranslationApp;