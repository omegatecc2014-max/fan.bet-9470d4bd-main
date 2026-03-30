import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display font-extrabold text-6xl text-star mb-4">404</h1>
      <p className="text-muted-foreground font-body mb-6">Esta página não existe</p>
      <button onClick={() => navigate("/")} className="gradient-star text-primary-foreground font-display font-bold px-6 py-2.5 rounded-full glow-star">
        Voltar ao Feed
      </button>
    </div>
  );
};

export default NotFound;
