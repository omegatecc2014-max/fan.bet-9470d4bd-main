import influencer1 from "@/assets/influencer-1.jpg";
import influencer2 from "@/assets/influencer-2.jpg";
import influencer3 from "@/assets/influencer-3.jpg";

export type RankTier = "bronze" | "silver" | "gold" | "diamond";

export interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  verified: boolean;
  hasNewStory?: boolean;
}

export interface HintCard {
  id: string;
  influencer: Influencer;
  hintImage: string;
  hintText: string;
  categories: string[];
  bettingClosesAt: string;
  isOpen: boolean;
  postedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  stars: number;
  rank: RankTier;
  totalBets: number;
  wins: number;
  avatar: string;
  following: string[];
}

export interface RankingEntry {
  rank: number;
  user: { name: string; username: string; avatar: string };
  tier: RankTier;
  stars: number;
  winRate: number;
}

export const influencers: Influencer[] = [
  { id: "1", name: "Valentina Rose", username: "@valentinarose", avatar: influencer1, followers: 2400000, verified: true, hasNewStory: true },
  { id: "2", name: "Marco Fit", username: "@marcofit", avatar: influencer2, followers: 1800000, verified: true, hasNewStory: true },
  { id: "3", name: "Sofia Eats", username: "@sofiaeats", avatar: influencer3, followers: 950000, verified: true, hasNewStory: false },
];

export const hintCards: HintCard[] = [
  {
    id: "1",
    influencer: influencers[0],
    hintImage: influencer1,
    hintText: "Me sentindo colorida hoje 🌈 O que vocês acham que estou vestindo?",
    categories: ["Roupa", "Social"],
    bettingClosesAt: "2026-03-16T20:00:00Z",
    isOpen: true,
    postedAt: "2h atrás",
  },
  {
    id: "2",
    influencer: influencers[1],
    hintImage: influencer2,
    hintText: "Dia de perna ou descanso? 🏋️ Façam suas apostas!",
    categories: ["Academia", "Comida"],
    bettingClosesAt: "2026-03-16T18:00:00Z",
    isOpen: true,
    postedAt: "4h atrás",
  },
  {
    id: "3",
    influencer: influencers[2],
    hintImage: influencer3,
    hintText: "Experimentando algo novo hoje à noite 🍝 Conseguem adivinhar?",
    categories: ["Comida", "Viagem"],
    bettingClosesAt: "2026-03-16T22:00:00Z",
    isOpen: true,
    postedAt: "1h atrás",
  },
];

export const currentUser: UserProfile = {
  id: "user1",
  name: "Alex Player",
  username: "@alexplayer",
  stars: 2450,
  rank: "gold",
  totalBets: 87,
  wins: 52,
  avatar: "",
  following: ["1", "2"],
};

export const rankings: RankingEntry[] = [
  { rank: 1, user: { name: "NightOwl", username: "@nightowl", avatar: "" }, tier: "diamond", stars: 15200, winRate: 78 },
  { rank: 2, user: { name: "BetKing", username: "@betking", avatar: "" }, tier: "diamond", stars: 12800, winRate: 72 },
  { rank: 3, user: { name: "LuckyVibes", username: "@luckyvibes", avatar: "" }, tier: "gold", stars: 9400, winRate: 68 },
  { rank: 4, user: { name: "StarChaser", username: "@starchaser", avatar: "" }, tier: "gold", stars: 7200, winRate: 65 },
  { rank: 5, user: { name: "Alex Player", username: "@alexplayer", avatar: "" }, tier: "gold", stars: 2450, winRate: 60 },
  { rank: 6, user: { name: "NewFan", username: "@newfan", avatar: "" }, tier: "silver", stars: 1800, winRate: 55 },
  { rank: 7, user: { name: "Rookie", username: "@rookie", avatar: "" }, tier: "bronze", stars: 500, winRate: 40 },
];

export const categories = [
  { id: "food", label: "🍔 Comida", icon: "🍔" },
  { id: "clothing", label: "👕 Roupa", icon: "👕" },
  { id: "gym", label: "🏋️ Academia", icon: "🏋️" },
  { id: "travel", label: "✈️ Viagem", icon: "✈️" },
  { id: "social", label: "🎉 Social", icon: "🎉" },
  { id: "politics", label: "🏛️ Política", icon: "🏛️" },
  { id: "football", label: "⚽ Futebol", icon: "⚽" },
  { id: "journalism", label: "📰 Jornalismo", icon: "📰" },
  { id: "shopping", label: "🛍️ Compras", icon: "🛍️" },
  { id: "courses", label: "📚 Cursos", icon: "📚" },
  { id: "family", label: "👨‍👩‍👧‍👦 Família", icon: "👨‍👩‍👧‍👦" },
  { id: "beauty", label: "💄 Beleza", icon: "💄" },
  { id: "sports", label: "🏅 Esporte", icon: "🏅" },
];

export interface PoliticLeader {
  id: string;
  name: string;
  party: string;
  role: string;
  emoji: string;
  color: string;
}

export const politicLeaders: PoliticLeader[] = [
  { id: "lula", name: "Lula", party: "PT", role: "Presidente da República", emoji: "🔴", color: "#c0392b" },
  { id: "bolsonaro", name: "Bolsonaro", party: "PL", role: "Ex-Presidente", emoji: "🟡", color: "#f39c12" },
  { id: "lira", name: "Arthur Lira", party: "PP", role: "Ex-Presidente da Câmara", emoji: "🔵", color: "#2980b9" },
  { id: "pacheco", name: "Rodrigo Pacheco", party: "PSD", role: "Presidente do Senado", emoji: "🟣", color: "#8e44ad" },
  { id: "tebet", name: "Simone Tebet", party: "MDB", role: "Ministra do Planejamento", emoji: "🟠", color: "#e67e22" },
  { id: "ciro", name: "Ciro Gomes", party: "PDT", role: "Ex-Ministro / Oposição", emoji: "⚫", color: "#2c3e50" },
  { id: "doria", name: "João Dória", party: "PSDB", role: "Ex-Governador SP", emoji: "🔷", color: "#3498db" },
  { id: "marina", name: "Marina Silva", party: "REDE", role: "Ministra do Meio Ambiente", emoji: "🟢", color: "#27ae60" },
  { id: "tarcisio", name: "Tarcísio de Freitas", party: "Republicanos", role: "Governador SP", emoji: "🟤", color: "#795548" },
  { id: "moro", name: "Sérgio Moro", party: "União Brasil", role: "Senador", emoji: "⚪", color: "#607d8b" },
];

export interface PredictionQuestion {
  question: string;
  options: string[];
}

export const predictionQuestions: Record<string, PredictionQuestion[]> = {
  food: [
    {
      question: "Qual tipo de comida vai rolar hoje?",
      options: ["🍕 Pizza", "🥗 Salada Fit", "🍣 Sushi/Japonês", "🍔 Hambúrguer", "🍝 Massa Italiana", "🥩 Churrasco", "🌮 Mexicano"],
    },
    {
      question: "Vai comer em casa ou fora?",
      options: ["🏠 Em Casa", "🍽️ Restaurante", "🚗 Drive-thru", "📦 Delivery"],
    },
    {
      question: "Qual bebida vai acompanhar?",
      options: ["💧 Água/Suco natural", "🥤 Refrigerante", "🍺 Cerveja gelada", "🍷 Vinho", "☕ Café especial"],
    },
  ],
  clothing: [
    {
      question: "Qual cor vai predominar no look?",
      options: ["⬛ Preto total", "⬜ Branco clean", "🔵 Azul/Jeans", "🔴 Vermelho vibrante", "🟢 Verde", "🟤 Marrom/Nude", "🌈 Colorido"],
    },
    {
      question: "Qual estilo de roupa vai usar?",
      options: ["👗 Vestido/Saia", "👖 Calça Jeans", "🩳 Short/Bermuda", "🩱 Conjunto", "👔 Social/Blazer", "🏃 Moletom/Casual"],
    },
    {
      question: "Vai usar acessórios?",
      options: ["💍 Várias joias", "⌚ Só relógio", "🕶️ Óculos de Sol", "👒 Chapéu/Boné", "❌ Sem acessórios"],
    },
  ],
  gym: [
    {
      question: "Vai treinar hoje?",
      options: ["✅ Com certeza!", "❌ Dia de descanso", "🤔 Talvez mais tarde", "😴 Tô de folga"],
    },
    {
      question: "Qual grupo muscular vai focar?",
      options: ["🦵 Perna/Glúteo", "💪 Peito/Tríceps", "🔙 Costas/Bíceps", "🏋️ Ombro", "🧘 Full Body", "🏃 Cardio/Corrida"],
    },
    {
      question: "O que vai comer pós-treino?",
      options: ["🥤 Whey Protein", "🍗 Frango com Arroz", "🍌 Banana com Ovos", "🥑 Açaí na Tigela", "🥗 Salada proteica"],
    },
  ],
  travel: [
    {
      question: "Vai viajar?",
      options: ["✅ Sim, já arrumando as malas!", "❌ Não, ficando em casa", "🤔 Planejando para breve"],
    },
    {
      question: "Qual o destino da vez?",
      options: ["🏖️ Praia brasileira", "⛰️ Serra/Montanha", "🌆 Capital/Cidade Grande", "🌎 Destino Internacional", "🏕️ Camping/Natureza"],
    },
    {
      question: "Como vai se locomover?",
      options: ["✈️ Avião", "🚗 Carro Próprio", "🚌 Ônibus", "🚂 Trem/Metro", "🛳️ Cruzeiro"],
    },
  ],
  social: [
    {
      question: "Vai sair hoje à noite?",
      options: ["🎉 Sim, tô animado(a)!", "🏠 Fico em casa mesmo", "🤔 Depende do rolê"],
    },
    {
      question: "Qual o programa social?",
      options: ["🥂 Bar/Balada", "🍿 Cinema/Streaming", "🎮 Jogos com amigos", "🍽️ Jantar especial", "🎭 Show/Teatro/Festival", "🏠 Reunião em casa"],
    },
    {
      question: "Com quem vai sair?",
      options: ["👫 A dois (casal)", "👯 Com amigas(os)", "👨‍👩‍👧‍👦 Família toda", "🕺 Galera grande", "🐾 Passeio solo"],
    },
  ],
  politics: [
    {
      question: "Quem vai liderar as pesquisas esta semana?",
      options: ["🔴 Lula (PT)", "🟡 Bolsonaro (PL)", "🟤 Tarcísio de Freitas (Rep.)", "🟠 Simone Tebet (MDB)", "🟢 Marina Silva (REDE)", "⚫ Ciro Gomes (PDT)"],
    },
    {
      question: "Quem vai dominar o noticiário político hoje?",
      options: ["🔴 Lula - nova declaração", "🟡 Bolsonaro - movimento político", "🔵 Arthur Lira - votação na Câmara", "🟣 Rodrigo Pacheco - pauta do Senado", "🟤 Tarcísio - SP em foco", "⚪ Sérgio Moro - investigações"],
    },
    {
      question: "Qual pauta política vai bombear hoje?",
      options: ["💰 Reforma Tributária/Fiscal", "🌿 Meio Ambiente/Desmatamento", "🔫 Segurança Pública", "📚 Educação", "🏥 Saúde/SUS", "🚜 Agronegócio", "💼 Emprego e Economia"],
    },
    {
      question: "Qual partido vai ganhar mais espaço na mídia?",
      options: ["🔴 PT (Lula)", "🟡 PL (Bolsonaro)", "🔵 PP/Centrão", "🟣 PSD (Pacheco)", "🟢 REDE/Partidos Verdes", "🟤 Republicanos (Tarcísio)"],
    },
    {
      question: "Qual será a avaliação do governo Lula?",
      options: ["📈 Ótimo/Bom (acima de 50%)", "📊 Regular (entre 40-50%)", "📉 Ruim/Péssimo (abaixo de 40%)", "❓ Polarização extrema"],
    },
  ],
  football: [
    {
      question: "Qual será o resultado do jogo?",
      options: ["🏠 Vitória do mandante", "🚗 Vitória do visitante", "🤝 Empate"],
    },
    {
      question: "Quem vai marcar o primeiro gol?",
      options: ["⚽ Vini Jr. (Real/Brasil)", "⚽ Richarlison (Brasil)", "⚽ Endrick (Real Madrid)", "⚽ Gabriel Martinelli", "⚽ Rodrygo (Real)", "⚽ Neymar Jr.", "⚽ Pedro (Flamengo)"],
    },
    {
      question: "Qual time vai ser campeão do Brasileirão?",
      options: ["🔴⚫ Flamengo", "🔴⚫ Internacional", "🔴🔵 Fluminense", "🔵⚫ Botafogo", "🟡🔵 Palmeiras", "🔴🔵 São Paulo", "⚫🔴 Atlético-MG"],
    },
    {
      question: "Quantos gols no total?",
      options: ["0️⃣ Nenhum (0x0)", "1️⃣ Um gol total", "2️⃣ Dois gols", "3️⃣ Três gols", "4️⃣+ Quatro ou mais"],
    },
    {
      question: "Vai rolar cartão vermelho?",
      options: ["🟥 Sim, vai ter expulsão!", "🟨 Só amarelo", "✅ Jogo limpo, sem cartões sérios"],
    },
  ],
  journalism: [
    {
      question: "Qual veículo vai dar o furo de notícia?",
      options: ["📺 Globo/G1", "📺 Band/BandNews", "📺 Record", "📺 SBT", "📺 CNN Brasil", "🌐 Portal UOL", "📱 Agência Reuters/AP"],
    },
    {
      question: "Qual assunto vai dominar as manchetes?",
      options: ["🏛️ Política Nacional", "💰 Economia/Dólar", "⚽ Esporte/Futebol", "🌿 Meio Ambiente", "🔫 Segurança Pública", "🎭 Entretenimento/Celebridades", "🏥 Saúde"],
    },
    {
      question: "Qual programa terá mais audiência hoje?",
      options: ["📺 Jornal Nacional (Globo)", "📺 Jornal da Band", "📺 Jornal da Record", "📺 SBT Brasil", "🎙️ Podcast/Rádio", "🌐 Portal de Notícias Online"],
    },
  ],
  shopping: [
    {
      question: "Onde vai fazer as compras?",
      options: ["🟧 Mercado Livre", "🟠 Shopee", "🛒 Amazon Brasil", "🏪 Casas Bahia/Magazine", "👗 Shein", "🏬 Shopping/Loja Física", "📦 Americanas"],
    },
    {
      question: "Qual categoria de produto vai comprar?",
      options: ["👕 Roupas/Moda", "📱 Eletrônicos/Tech", "🏠 Casa e Decoração", "💅 Beleza/Cosméticos", "📚 Livros/Cursos", "🎮 Games/Entretenimento", "🍳 Cozinha/Utensílios"],
    },
    {
      question: "Qual o valor da compra?",
      options: ["💵 Até R$50 (pequena)", "💴 R$50 a R$200", "💶 R$200 a R$500", "💷 Acima de R$500", "💸 Gastou mais do que planejou!"],
    },
  ],
  courses: [
    {
      question: "Vai assistir alguma aula hoje?",
      options: ["✅ Sim, aula marcada!", "❌ Não hoje", "🤔 Talvez assista uns vídeos", "📖 Vou ler material/livro"],
    },
    {
      question: "Qual área de estudo?",
      options: ["💻 Tecnologia/Programação", "💼 Negócios/Empreendedorismo", "🎨 Design/Criatividade", "🗣️ Idiomas/Inglês", "📈 Finanças/Investimentos", "🏋️ Saúde/Bem-estar", "🍳 Gastronomia/Culinária"],
    },
    {
      question: "Qual plataforma de ensino?",
      options: ["🟪 Hotmart", "🟦 Udemy", "🟨 Coursera/edX", "🟩 YouTube (gratuito)", "🔵 Alura", "🟠 Rocketseat/DIO"],
    },
  ],
  family: [
    {
      question: "Vai ter reunião de família hoje?",
      options: ["✅ Sim, almoço/jantar juntos!", "❌ Não, cada um no seu canto", "📞 Só ligação/videochamada"],
    },
    {
      question: "Qual atividade vai rolar com a família?",
      options: ["🥩 Churrasco/Almoço especial", "🎮 Jogos e diversão", "🎬 Maratona de filmes", "🚗 Passeio/Viagem juntos", "🌳 Parque ao ar livre", "🛒 Fazer compras juntos"],
    },
    {
      question: "Quem vai ser o destaque da família hoje?",
      options: ["👴 O avô/avó com histórias", "👩‍🍳 Alguém que cozinhou demais", "🤣 O tio/prima engraçado", "👶 O bebê/criançada", "🐕 O pet querido da família"],
    },
  ],
  beauty: [
    {
      question: "Qual procedimento beauty vai fazer?",
      options: ["✂️ Corte de Cabelo", "💅 Manicure/Pedicure", "💇 Escova/Hidratação capilar", "💄 Maquiagem especial", "🧖 Limpeza de Pele/Facial", "✨ Nada hoje (natural)"],
    },
    {
      question: "Qual o estilo de maquiagem?",
      options: ["✨ Natural/Sem maquiagem", "💄 Make completo (smoky eye)", "🌸 Colorido e vibrante", "💋 Batom vermelho clássico", "👁️ Foco nos olhos", "🌟 Glitter/Make festivo"],
    },
    {
      question: "Qual tendência beauty vai lançar?",
      options: ["💆 Skincare minimalista", "💄 Batom/Gloss novo", "💅 Nail art criativa", "🌿 Produto natural/vegano", "✨ Sérum/Creme facial", "🎨 Make artístico"],
    },
  ],
  sports: [
    {
      question: "Qual esporte vai praticar?",
      options: ["🏃 Corrida ao ar livre", "🏊 Natação", "🚴 Ciclismo", "🏋️ Musculação", "⚽ Futebol amador", "🏀 Basquete", "🎾 Tênis/Padel", "🧘 Yoga/Pilates"],
    },
    {
      question: "Qual será o resultado do desafio esportivo?",
      options: ["🏆 Novo recorde pessoal!", "💪 Superou a meta do dia", "✅ Treino completo normal", "😤 Teve dificuldades mas foi", "❌ Não conseguiu completar"],
    },
    {
      question: "Quem vai ganhar a competição esportiva?",
      options: ["🇧🇷 Brasil 🤙", "🇦🇷 Argentina", "🇺🇸 Estados Unidos", "🇫🇷 França", "🇩🇪 Alemanha", "🇪🇸 Espanha"],
    },
  ],
};

export const rankColors: Record<RankTier, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-gray-400 to-gray-200",
  gold: "from-yellow-500 to-amber-300",
  diamond: "from-cyan-400 to-blue-300",
};

export const rankBorderColors: Record<RankTier, string> = {
  bronze: "border-amber-600",
  silver: "border-gray-400",
  gold: "border-yellow-400",
  diamond: "border-cyan-400",
};
