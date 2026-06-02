"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identificador: '', // Aceita Email ou CPF
    senha: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Limpa caracteres do identificador caso seja CPF para a busca
      const buscaLimpa = formData.identificador.replace(/\D/g, '');

      // Busca o usuário que tenha o Email OU o CPF correspondente
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`email.eq.${formData.identificador},cpf.eq.${buscaLimpa}`)
        .single();

      if (error || !usuario) {
        throw new Error("Usuário não encontrado.");
      }

      // Verificação de senha
      if (usuario.senha !== formData.senha) {
        throw new Error("Senha incorreta.");
      }

      // 1. SALVA O COOKIE PARA O MIDDLEWARE (A TRANCA DO URL)
      // ... dentro do seu try { } após validar o usuário no Supabase
if (usuario.senha === formData.senha) {
  // CRIA O COOKIE (A CHAVE)
  document.cookie = "auth_token=true; path=/; max-age=86400; SameSite=Lax";

  // GUARDA NO LOCALSTORAGE (O NOME NA SIDEBAR)
  localStorage.setItem('usuario_logado', JSON.stringify({
    nome_completo: usuario.nome_completo,
    cargo: usuario.cargo
  }));

  router.push('/dashboard');
}
      
    } catch (error) {
      alert("Falha no login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-apple-gray text-left">
      <div className="apple-card w-full max-w-[440px] p-10 flex flex-col gap-8 text-left animate-in fade-in zoom-in-95 duration-500 !rounded-[44px]">
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-sus rounded-[28px] flex items-center justify-center shadow-xl shadow-sus/30">
            <span className="text-white text-3xl font-black">S+</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-apple-label">SUS+ Ágil FSA</h1>
            <p className="text-apple-secondary text-sm font-medium italic">Portal do Profissional de Saúde</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-apple-secondary ml-6 text-left">
              E-mail ou CPF
            </label>
            <input 
              name="identificador"
              type="text" 
              placeholder="exemplo@saude.gov.br"
              className="apple-input w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus transition-all text-[16px] font-medium"
              value={formData.identificador}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-apple-secondary ml-6 text-left">
              Senha
            </label>
            <input 
              name="senha"
              type="password" 
              placeholder="••••••••"
className="apple-input w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus transition-all text-[16px] font-medium"              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-sus mt-4 w-full py-4 text-lg font-black uppercase tracking-widest shadow-xl shadow-sus/20 active:scale-95 transition-all disabled:opacity-50 !rounded-full"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        
      </div>

      <div className="absolute bottom-8 text-apple-secondary/40 text-[9px] font-black mb-6 uppercase tracking-[0.3em] text-center w-full">
        Prefeitura de Feira de Santana
      </div>
    </main>
  );
}