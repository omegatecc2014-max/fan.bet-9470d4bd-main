import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, User, Bell, Palette, Shield, History, Sparkles,
  Camera, Mail, Phone, MapPin, ChevronRight, Moon, Sun, Monitor,
  Save, CameraIcon, Check, X, Loader2, Image
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { currentUser } from "@/data/mockData";

type ThemeMode = "light" | "dark" | "system";

interface FollowerHistory {
  id: string;
  name: string;
  avatar: string;
  date: string;
  action: "followed" | "unfollowed";
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const mockFollowers: FollowerHistory[] = [
  { id: "1", name: "Lucas Silva", avatar: "LS", date: "2 dias atrás", action: "followed" },
  { id: "2", name: "Ana Paula", avatar: "AP", date: "3 dias atrás", action: "followed" },
  { id: "3", name: "João Santos", avatar: "JS", date: "1 semana atrás", action: "unfollowed" },
  { id: "4", name: "Maria Costa", avatar: "MC", date: "2 semanas atrás", action: "followed" },
];

const aiSuggestions: AISuggestion[] = [
  { id: "1", title: "Otimizar horário de posts", description: "Seu público é mais ativo entre 18h-21h", icon: "⏰" },
  { id: "2", title: "Melhorar descrição do perfil", description: "Adicione palavras-chave relevantes", icon: "📝" },
  { id: "3", title: "Engajamento em alta", description: "Seu último post teve 40% mais interações", icon: "📈" },
  { id: "4", title: "Novos seguidores similares", description: "Perfil similar ao seu ganhou 500 seguidores", icon: "👥" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  
  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState("Apaixonado por apostas esportivas e análise de jogos.");
  const [email, setEmail] = useState("usuario@email.com");
  const [phone, setPhone] = useState("+55 11 99999-9999");
  const [location, setLocation] = useState("São Paulo, SP");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Notifications state
  const [notifNewFollowers, setNotifNewFollowers] = useState(true);
  const [notifTips, setNotifTips] = useState(true);
  const [notifPromotions, setNotifPromotions] = useState(false);
  const [notifResults, setNotifResults] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showFollowerModal, setShowFollowerModal] = useState(false);

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "privacy", label: "Privacidade", icon: Shield },
    { id: "history", label: "Histórico", icon: History },
    { id: "ai", label: "IA Insights", icon: Sparkles },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl gradient-star flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-xs">Gerencie sua conta</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "gradient-star text-primary-foreground glow-star"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center p-6 gradient-card rounded-2xl border border-border">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-star flex items-center justify-center text-3xl font-display font-bold text-primary-foreground">
                {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <button 
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-star flex items-center justify-center shadow-lg"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <h3 className="font-display font-bold text-lg mt-3">{currentUser.name}</h3>
            <p className="text-muted-foreground text-sm">@{currentUser.username}</p>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Nome</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted/30 border-border"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Username</Label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted/30 border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Bio</Label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-20 p-3 rounded-xl bg-muted/30 border border-border text-sm resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="bg-muted/30 border-border"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-2">
                <Phone className="w-3 h-3" /> Telefone
              </Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="bg-muted/30 border-border"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Localização
              </Label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="bg-muted/30 border-border"
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gradient-star text-primary-foreground font-display font-bold"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-star" />
              Notificações Push
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Novos seguidores</p>
                  <p className="text-xs text-muted-foreground">Receba alertas quando alguém te seguir</p>
                </div>
                <Switch 
                  checked={notifNewFollowers}
                  onCheckedChange={setNotifNewFollowers}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dicas de influenciadores</p>
                  <p className="text-xs text-muted-foreground">Notificações de novas dicas dos que você segue</p>
                </div>
                <Switch 
                  checked={notifTips}
                  onCheckedChange={setNotifTips}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Resultados de apostas</p>
                  <p className="text-xs text-muted-foreground">Avise quando seus palpites forem decidir</p>
                </div>
                <Switch 
                  checked={notifResults}
                  onCheckedChange={setNotifResults}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Promoções e bônus</p>
                  <p className="text-xs text-muted-foreground">Ofertas especiais e bônus exclusivos</p>
                </div>
                <Switch 
                  checked={notifPromotions}
                  onCheckedChange={setNotifPromotions}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Segurança</p>
                  <p className="text-xs text-muted-foreground">Avisos importantes de segurança</p>
                </div>
                <Switch 
                  checked={notifSecurity}
                  onCheckedChange={setNotifSecurity}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full gradient-star text-primary-foreground font-display font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Preferências
          </Button>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-star" />
              Tema do Aplicativo
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === "light" 
                    ? "border-star bg-star/10" 
                    : "border-border hover:border-border/80"
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === "light" ? "text-star" : "text-muted-foreground"}`} />
                <span className="text-xs font-display">Claro</span>
              </button>
              
              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === "dark" 
                    ? "border-star bg-star/10" 
                    : "border-border hover:border-border/80"
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === "dark" ? "text-star" : "text-muted-foreground"}`} />
                <span className="text-xs font-display">Escuro</span>
              </button>
              
              <button
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border text-center transition-all ${
                  theme === "system" 
                    ? "border-star bg-star/10" 
                    : "border-border hover:border-border/80"
                }`}
              >
                <Monitor className={`w-6 h-6 mx-auto mb-2 ${theme === "system" ? "text-star" : "text-muted-foreground"}`} />
                <span className="text-xs font-display">Sistema</span>
              </button>
            </div>
          </div>

          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-4">Cores de Destaque</h3>
            <div className="flex gap-3 justify-center">
              {["#facc15", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"].map((color, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full gradient-star text-primary-foreground font-display font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Aplicar Tema
          </Button>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-star" />
              Privacidade
            </h3>
            
            <div className="space-y-3">
              <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-sm">Perfil público</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-sm">Bloqueados</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-sm">Dados e cookies</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <Button 
            variant="destructive"
            className="w-full"
          >
            Excluir Conta
          </Button>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-star" />
              Histórico de Seguidores
            </h3>
            
            <p className="text-xs text-muted-foreground mb-4">
              Veja quem começou a seguir ou parou de seguir você recentemente.
            </p>

            <div className="space-y-3">
              {mockFollowers.map((follower) => (
                <div 
                  key={follower.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-10 h-10 rounded-full gradient-star flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {follower.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{follower.name}</p>
                    <p className="text-xs text-muted-foreground">{follower.date}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    follower.action === "followed" 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {follower.action === "followed" ? "+ Seguiu" : "- Deixou de seguir"}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4 border-border"
              onClick={() => setShowFollowerModal(true)}
            >
              Ver histórico completo
            </Button>
          </div>
        </motion.div>
      )}

      {/* AI Tab */}
      {activeTab === "ai" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="gradient-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-star" />
              Insights com IA
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Sugestões personalizadas para melhorar seu perfil e engajamento.
            </p>
            
            <div className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-star/10 to-purple-500/10 border border-star/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div>
                      <p className="font-display font-bold text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <h4 className="font-display font-bold text-sm mb-2">Pergunte à IA</h4>
            <div className="flex gap-2">
              <Input 
                placeholder="Como melhorar meu engajamento?"
                className="bg-muted/30 border-border text-sm"
              />
              <Button className="gradient-star text-primary-foreground px-4">
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Avatar Selection Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Escolher Foto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {["🐱", "🦁", "🐯", "🦊", "🐼", "🐨", "🐰", "🦄"].map((emoji, i) => (
                <button
                  key={i}
                  className="w-14 h-14 rounded-xl bg-muted/30 flex items-center justify-center text-2xl hover:bg-star/20 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
              <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Arraste uma imagem ou clique para selecionar</p>
            </div>

            <Button 
              onClick={() => setShowAvatarModal(false)}
              className="w-full gradient-star text-primary-foreground font-display font-bold"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Follower History Modal */}
      <Dialog open={showFollowerModal} onOpenChange={setShowFollowerModal}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Histórico de Seguidores</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Este mês</span>
              <span>+12 novos</span>
            </div>
            {mockFollowers.map((follower) => (
              <div 
                key={follower.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="w-10 h-10 rounded-full gradient-star flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {follower.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{follower.name}</p>
                  <p className="text-xs text-muted-foreground">{follower.date}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  follower.action === "followed" 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {follower.action === "followed" ? "+" : "-"}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}