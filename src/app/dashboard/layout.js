"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';



export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  // Estado para armazenar o profissional logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  

  // Busca os dados do profissional ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario_logado');
    if (storedUser) {
      setUsuarioLogado(JSON.parse(storedUser));
    }
  }, []);

  // Função para Logout
 // No seu botão de Sair/Logout:
const handleLogout = () => {
  // Remove o nome da Sidebar
  localStorage.removeItem('usuario_logado');
  
  // Destrói a chave do Middleware (expira o cookie)
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  
  window.location.href = '/login'; // Use window.location para garantir o refresh do middleware
};
  // Funções originais de navegação (Mantidas intactas)
  const isActive = (path) => pathname === path;
  const isParentActive = (path) => pathname.startsWith(path);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { 
      name: 'Triagem', 
      href: '/dashboard/triagem', 
      icon: '🩺',
      subItems: [
        { name: 'Nova Triagem', href: '/dashboard/triagem/nova' }
      ]
    },
    { 
      name: 'Equipe de Saúde', 
      href: '/dashboard/profissionais', 
      icon: '👨‍⚕️',
      subItems: [
        { name: 'Novo Profissional', href: '/dashboard/profissionais/novo' }
      ]
    },
    { 
      name: 'Pacientes', 
      href: '/dashboard/pacientes/', 
      icon: '👤' 
    },
  ];

  const SidebarContent = () => (
    <div className="p-6 flex flex-col h-full text-left">
      <div className="flex items-center gap-3 mb-10 px-2 text-left">
        <div className="w-10 h-10 bg-sus rounded-xl flex items-center justify-center shadow-lg shadow-sus/20 text-white font-bold text-xl">
          S+
        </div>
        <span className="font-bold text-lg tracking-tight text-apple-label">SUS+ Ágil</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 text-left">
        {navItems.map((item) => {
          const active = isActive(item.href) || (item.href !== '/dashboard' && isParentActive(item.href));
          
          return (
            <div key={item.href} className="flex flex-col gap-1 text-left">
              <Link 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  active 
                  ? 'bg-sus text-white shadow-md shadow-sus/20' 
                  : 'text-apple-secondary hover:bg-gray-100'
                }`}
              >
                <span className={active ? 'brightness-200 text-left' : 'text-left'}>{item.icon}</span>
                <span className="font-bold text-sm uppercase tracking-tight text-left">{item.name}</span>
              </Link>

              {/* Lógica de Pastas (Sub-itens aparecem se o pai estiver ativo) */}
              {active && item.subItems && (
                <div className="ml-9 flex flex-col border-l-2 border-sus/30 my-1 animate-in slide-in-from-left-2 duration-300 text-left">
                  {item.subItems.map(sub => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`py-2 px-4 text-xs font-bold transition-colors text-left ${
                        isActive(sub.href) ? 'text-sus' : 'text-apple-secondary hover:text-apple-label'
                      }`}
                    >
                      {isActive(sub.href) ? '• ' : '└ '} {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ÁREA DO OPERADOR ATUALIZADA */}
      <div className="mt-auto p-5 bg-white/80 rounded-[30px] border border-gray-100 shadow-sm text-left">
        <p className="text-[9px] font-black text-apple-secondary uppercase tracking-widest mb-1 text-left">Profissional Logado</p>
        <h4 className="text-[13px] font-black text-apple-label uppercase truncate text-left">
          {usuarioLogado?.nome_completo || "Carregando..."}
        </h4>
        <p className="text-[10px] font-bold text-sus uppercase italic text-left">
          {usuarioLogado?.cargo || "Acesso restrito"}
        </p>
        
        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-all border-t border-gray-100 pt-3 w-full text-left"
        >
          <span>🚪</span> Desconectar
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-apple-gray text-left">
      
      {/* Sidebar Desktop */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200 bg-white/50 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden text-left">
        <header className="h-20 border-b border-gray-200 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 md:px-8 text-left">
          
          {/* Botão Hambúrguer Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-xl"
          >
            ☰
          </button>

          <h2 className="text-[10px] md:text-sm font-black text-apple-secondary uppercase tracking-widest text-left">
            FSA • <span className="text-sus">Bahia</span>
          </h2>
          
          <button 
            onClick={handleLogout}
            className="btn-sus !py-2 !px-5 text-[10px] font-black uppercase tracking-widest !rounded-full"
          >
            Sair
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 text-left">
          <div className="max-w-7xl mx-auto text-left">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}