"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/app/globals.css";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  // Lista de páginas que podem ser acessadas sem login
  const publicRoutes = ["/login"]; 

  useEffect(() => {
    // 1. Busca a chave no localStorage
    const user = localStorage.getItem("usuario_logado");
    const isPublicRoute = publicRoutes.includes(pathname);

    // 2. Lógica de Expulsão
    if (!user && !isPublicRoute) {
      // Se não tem usuário e a página não é o login -> Manda pro Login
      setAuthorized(false);
      router.replace("/login");
    } else {
      // Se tem usuário ou é a página de login -> Libera
      setAuthorized(true);
    }
  }, [pathname, router]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body 
        className="min-h-screen bg-apple-gray text-apple-label antialiased selection:bg-sus/20 selection:text-sus text-left"
      >
        {/* TRANCA VISUAL: Se estiver tentando acessar área restrita sem login, 
            mostra o carregamento e ESCONDE o children (o resto do site) */}
        {!authorized && !publicRoutes.includes(pathname) ? (
          <div className="h-screen w-full bg-apple-gray flex flex-col items-center justify-center gap-4 text-left">
            <div className="w-16 h-16 bg-sus rounded-[24px] animate-bounce flex items-center justify-center shadow-2xl shadow-sus/20">
              <span className="text-white font-black text-xl">S+</span>
            </div>
            <div className="text-center text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-secondary animate-pulse">
                Sistema SUS+ Ágil
              </p>
              <p className="text-[9px] font-bold text-sus uppercase tracking-widest mt-1">
                Verificando Acesso...
              </p>
            </div>
          </div>
        ) : (
          /* Se estiver autorizado ou for o login, renderiza o site normalmente */
          children
        )}
      </body>
    </html>
  );
}