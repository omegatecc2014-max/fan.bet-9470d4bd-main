import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Image, Send, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { categories, influencers } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCamera } from "@/hooks/useCamera";
import { useGeolocation } from "@/hooks/useGeolocation";
import { localDB } from "@/lib/storage";

export default function PostHintPage() {
  const navigate = useNavigate();
  const [hintText, setHintText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [includeLocation, setIncludeLocation] = useState(false);

  const { stream, isCameraActive, videoRef, startCamera, stopCamera, capturePhoto } = useCamera();
  const { location, requestLocation, clearLocation } = useGeolocation();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleImageUpload = async () => {
    await startCamera();
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setPreviewImage(photo);
      stopCamera();
    }
  };

  const toggleLocation = () => {
    if (includeLocation) {
      setIncludeLocation(false);
      clearLocation();
    } else {
      setIncludeLocation(true);
      requestLocation();
    }
  };

  const handlePost = async () => {
    if (!previewImage) {
      toast.error("Por favor, tire uma foto para a dica.");
      return;
    }
    if (!hintText.trim()) {
      toast.error("Escreva uma dica para seus fãs!");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Selecione pelo menos uma categoria");
      return;
    }
    
    const newPost = {
      id: `local_${Date.now()}`,
      influencer: influencers[0],
      hintImage: previewImage,
      hintText,
      categories: selectedCategories,
      bettingClosesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isOpen: true,
      postedAt: "Agora",
      location: location ? { latitude: location.latitude, longitude: location.longitude } : undefined
    };

    try {
      await localDB.savePost(newPost);
      toast.success("Dica publicada! 🎉", {
        description: "Seus fãs agora podem ver a sua dica.",
      });
      navigate("/influencer");
    } catch (e) {
      toast.error("Erro ao salvar post", { description: "O limite de armazenamento pode ter sido excedido." });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/influencer")} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg text-foreground">Postar Dica do Dia</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {isCameraActive ? (
          <div className="relative rounded-xl overflow-hidden bg-black h-48 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <button
              onClick={handleCapture}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-muted hover:bg-gray-200 transition-colors"
            >
              <Camera className="text-black w-6 h-6" />
            </button>
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : previewImage ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={previewImage} alt="Prévia da dica" className="w-full h-48 object-cover" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleImageUpload}
            className="w-full h-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-star/50 hover:text-star transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Adicionar uma foto como dica</span>
            <span className="text-xs">Toque para enviar</span>
          </button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground block">Sua Dica</label>
          <button
            onClick={toggleLocation}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
              includeLocation ? "border-star text-star bg-star/10" : "border-border text-muted-foreground"
            }`}
          >
            <MapPin className="w-3 h-3" />
            {includeLocation ? (location ? "Localização Anexada" : "Obtendo...") : "Adicionar Local"}
          </button>
        </div>
        <Textarea
          value={hintText}
          onChange={(e) => setHintText(e.target.value)}
          placeholder="Dê uma pista enigmática para seus fãs... 🤫"
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground min-h-[100px] text-base"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{hintText.length}/200</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className="text-sm font-medium text-foreground mb-2 block">Categorias</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(cat.id)
                  ? "bg-star text-primary-foreground glow-star"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Button
          onClick={handlePost}
          className="w-full h-14 gradient-star text-primary-foreground font-display font-semibold text-base glow-star"
        >
          <Send className="w-5 h-5 mr-2" />
          Publicar Dica
        </Button>
      </motion.div>
    </div>
  );
}
