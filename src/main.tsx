import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/lib/sounds";

createRoot(document.getElementById("root")!).render(<App />);
