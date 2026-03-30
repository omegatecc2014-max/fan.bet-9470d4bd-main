import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Question {
  id: string;
  category: string;
  emoji: string;
  question: string;
  options: string[];
}

const dailyQuestions: Question[] = [
  {
    id: "food",
    category: "Comida",
    emoji: "🍔",
    question: "O que você comeu na refeição principal de hoje?",
    options: ["Pizza", "Sushi", "Salada", "Massa", "Hambúrguer", "Comida caseira"],
  },
  {
    id: "clothing",
    category: "Roupa",
    emoji: "👕",
    question: "Qual foi a cor principal da sua roupa hoje?",
    options: ["Preto", "Branco", "Vermelho", "Azul", "Verde", "Colorido/Estampado"],
  },
  {
    id: "gym",
    category: "Academia",
    emoji: "🏋️",
    question: "Você se exercitou hoje?",
    options: ["Sim - Cardio", "Sim - Musculação", "Sim - Yoga/Alongamento", "Dia de descanso", "Atividade ao ar livre"],
  },
  {
    id: "travel",
    category: "Viagem",
    emoji: "✈️",
    question: "Onde você foi hoje?",
    options: ["Fiquei em casa", "Fui trabalhar/estúdio", "Restaurante/Café", "Shopping", "Viajei para outra cidade"],
  },
  {
    id: "social",
    category: "Social",
    emoji: "🎉",
    question: "Como foi sua noite?",
    options: ["Noite tranquila em casa", "Jantar com amigos", "Festa/Evento", "Encontro romântico", "Trabalhando até tarde"],
  },
  {
    id: "politics",
    category: "Política",
    emoji: "🏛️",
    question: "Acompanhou alguma notícia política hoje?",
    options: ["Sim, li artigos", "Assisti ao jornal", "Discuti com amigos", "Vi nas redes sociais", "Não acompanhei"],
  },
  {
    id: "football",
    category: "Futebol",
    emoji: "⚽",
    question: "Como foi sua interação com o esporte hoje?",
    options: ["Assisti a um jogo", "Joguei uma partida", "Acompanhei os resultados", "Apenas vi notícias", "Nenhuma interação"],
  },
  {
    id: "journalism",
    category: "Jornalismo",
    emoji: "📰",
    question: "Como você se informou hoje?",
    options: ["Portais de notícias", "Jornal na TV", "Redes Sociais", "Podcasts/Rádio", "Não li notícias hoje"],
  },
  {
    id: "shopping",
    category: "Compras",
    emoji: "🛍️",
    question: "Qual foi o seu foco em compras hoje?",
    options: ["Roupas e Acessórios", "Eletrônicos", "Supermercado/Comida", "Serviços e Lazer", "Não fiz compras"],
  },
  {
    id: "courses",
    category: "Cursos",
    emoji: "📚",
    question: "Dedicou tempo aos seus estudos hoje?",
    options: ["Fiz uma aula online", "Estudei presencialmente", "Apenas li materiais", "Fiz exercícios práticos", "Dia de descanso"],
  },
  {
    id: "family",
    category: "Família",
    emoji: "👨‍👩‍👧‍👦",
    question: "Como foi o tempo com a família hoje?",
    options: ["Refeição em família", "Passeio juntos", "Conversa por vídeo", "Apenas mensagens instantâneas", "Pouca interação hoje"],
  },
  {
    id: "beauty",
    category: "Beleza",
    emoji: "💄",
    question: "Qual foi seu foco em cuidados pessoais hoje?",
    options: ["Skincare detalhado", "Foco na maquiagem", "Cuidado especial com cabelo", "Tratamento em clínica/salão", "Apenas o básico"],
  },
  {
    id: "sports",
    category: "Esporte",
    emoji: "🏅",
    question: "Como foi sua relação com exercícios esportivos hoje?",
    options: ["Treino intenso", "Acompanhei minha equipe", "Esporte como lazer", "Li sobre um campeonato", "Nenhum envolvimento"],
  },
];

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const current = dailyQuestions[currentIndex];
  const progress = ((currentIndex + 1) / dailyQuestions.length) * 100;
  const isLast = currentIndex === dailyQuestions.length - 1;

  const handleNext = () => {
    if (!answers[current.id]) {
      toast.error("Por favor, selecione uma resposta");
      return;
    }
    if (isLast) {
      setSubmitted(true);
      toast.success("Todas as respostas confirmadas! ✅", {
        description: "Os pagamentos serão processados automaticamente.",
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 pb-24 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-2">
          <h2 className="font-display font-bold text-2xl text-foreground">Tudo Pronto!</h2>
          <p className="text-muted-foreground text-sm">Suas respostas foram confirmadas. Os pagamentos estão sendo processados para seus fãs.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3 w-full">
          {dailyQuestions.map((q) => (
            <Card key={q.id} className="border-border/50">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{q.emoji}</span>
                  <span className="text-sm text-foreground">{q.category}</span>
                </div>
                <span className="text-sm font-medium text-accent">{answers[q.id]}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>
        <Button onClick={() => navigate("/influencer")} variant="outline" className="mt-4">
          Voltar ao Painel
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/influencer")} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg text-foreground">Questionário Diário</h1>
      </motion.div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pergunta {currentIndex + 1} de {dailyQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-star"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="gradient-card border-border/50">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current.emoji}</span>
                <div>
                  <p className="text-xs text-star font-medium uppercase tracking-wider">{current.category}</p>
                  <h2 className="font-display font-semibold text-foreground">{current.question}</h2>
                </div>
              </div>

              <RadioGroup
                value={answers[current.id] || ""}
                onValueChange={(val) => setAnswers((prev) => ({ ...prev, [current.id]: val }))}
                className="space-y-2"
              >
                {current.options.map((option) => (
                  <motion.div key={option} whileTap={{ scale: 0.98 }}>
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        answers[current.id] === option
                          ? "border-star bg-star/10"
                          : "border-border/50 bg-muted/30 hover:border-muted-foreground/30"
                      }`}
                    >
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-sm text-foreground cursor-pointer flex-1">
                        {option}
                      </Label>
                    </label>
                  </motion.div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <Button
        onClick={handleNext}
        className={`w-full h-14 font-display font-semibold text-base ${
          isLast
            ? "gradient-violet text-secondary-foreground glow-violet"
            : "gradient-star text-primary-foreground glow-star"
        }`}
      >
        {isLast ? "Confirmar Todas as Respostas" : "Próxima Pergunta"}
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </div>
  );
}
