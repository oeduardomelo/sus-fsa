"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';

export default function NovoProfissionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState('');
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '', // Novo campo
    senha: '', // Novo campo
    registro_profissional: '',
    especialidade: '',
    setor: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{
          ...formData,
          cargo: cargo,
          cpf: formData.cpf.replace(/\D/g, '') 
        }]);

      if (error) throw error;

      alert("✅ Profissional cadastrado com sucesso!");
      router.push('/dashboard/profissionais');
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMasks = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === 'cpf') {
      val = val.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d)/, '$1.$2')
               .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } 
    else if (name === 'registro_profissional') {
      if (val.length > 12) val = val.slice(0, 12);
      val = val.toUpperCase();
    }
    setFormData({ ...formData, [name]: val });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 100) return;
    setFormData({ ...formData, [name]: value });
  };

  const labelStyle = "text-[11px] font-black uppercase tracking-wider text-apple-secondary ml-4 mb-1.5 block";
  const inputStyle = "apple-input w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus transition-all text-sm font-medium text-apple-label";

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-2 md:p-6 text-left">
      <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100 w-full max-w-3xl animate-in fade-in zoom-in-95 duration-500 text-left">
        
        <header className="mb-8 md:mb-10 text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-sus/10 text-sus text-[10px] font-black uppercase tracking-widest mb-4">
            Recursos Humanos
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-apple-label tracking-tight text-left">
            Cadastrar <span className="text-sus text-left">Profissional</span>
          </h1>
          <p className="text-sm text-apple-secondary font-medium mt-2 text-left">Gestão de acesso e funções da unidade.</p>
        </header>
        
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 text-left">
  {/* Nome e CPF */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 text-left">
    <div className="flex flex-col text-left">
      <label className={labelStyle}>Nome Completo</label>
      <input 
        name="nome_completo" 
        type="text" 
        className={`${inputStyle} text-[16px]`} 
        onChange={handleChange} 
        value={formData.nome_completo}
        placeholder="Nome do profissional" 
        required 
      />
    </div>
    <div className="flex flex-col text-left">
      <label className={labelStyle}>CPF</label>
      <input 
        name="cpf" 
        type="text" 
        className={`${inputStyle} text-[16px]`} 
        onChange={handleMasks} 
        value={formData.cpf}
        placeholder="000.000.000-00" 
        required 
      />
    </div>
  </div>

  {/* ACESSO: Email e Senha */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 p-6 bg-sus/[0.03] rounded-[32px] border border-sus/5 text-left">
     <div className="flex flex-col text-left">
      <label className={labelStyle}>Email de Acesso</label>
      <input 
        name="email" 
        type="email" 
        className={`${inputStyle} text-[16px]`} 
        onChange={handleChange} 
        value={formData.email}
        placeholder="exemplo@sus.gov.br" 
        required 
      />
    </div>
    <div className="flex flex-col text-left">
      <label className={labelStyle}>Senha Provisória</label>
      <input 
        name="senha" 
        type="password" 
        className={`${inputStyle} text-[16px]`} 
        onChange={handleChange} 
        value={formData.senha}
        placeholder="••••••••" 
        required 
      />
    </div>
  </div>

  <div className="flex flex-col text-left">
    <label className={labelStyle}>Função no Sistema</label>
    <div className="relative text-left">
      <select 
        className={`${inputStyle} text-[16px] appearance-none cursor-pointer`}
        value={cargo} 
        onChange={(e) => setCargo(e.target.value)}
        required
      >
        <option value="">Selecione o cargo...</option>
        <option value="Médico">Médico(a)</option>
        <option value="Enfermeiro">Enfermeiro(a)</option>
        <option value="Recepcionista">Recepcionista</option>
        <option value="TI">Administrador (TI)</option>
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
    </div>
  </div>

  <div className="animate-in fade-in slide-in-from-top-2 duration-300 text-left">
    {cargo === 'Médico' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 text-left">
        <div className="text-left">
          <label className={labelStyle}>CRM (Registro)</label>
          <input 
            name="registro_profissional" 
            type="text" 
            className={`${inputStyle} text-[16px]`} 
            onChange={handleMasks} 
            value={formData.registro_profissional || ''} 
            placeholder="Ex: 12345-BA" 
            required 
          />
        </div>
        <div className="text-left">
          <label className={labelStyle}>Especialidade</label>
          <input 
            name="especialidade" 
            type="text" 
            className={`${inputStyle} text-[16px]`} 
            onChange={handleChange} 
            value={formData.especialidade || ''} 
            placeholder="Ex: Pediatria" 
          />
        </div>
      </div>
    )}

    {cargo === 'Enfermeiro' && (
      <div className="text-left">
        <label className={labelStyle}>COREN (Registro)</label>
        <input 
          name="registro_profissional" 
          type="text" 
          className={`${inputStyle} text-[16px]`} 
          onChange={handleMasks} 
          value={formData.registro_profissional || ''} 
          placeholder="Ex: 000.000-ENF" 
          required 
        />
      </div>
    )}

    {cargo === 'Recepcionista' && (
      <div className="text-left">
        <label className={labelStyle}>Setor de Atuação</label>
        <input 
          name="setor" 
          type="text" 
          className={`${inputStyle} text-[16px]`} 
          onChange={handleChange} 
          value={formData.setor || ''} 
          placeholder="Ex: Guichê Central / Urgência" 
          required 
        />
      </div>
    )}

    {cargo === 'TI' && (
      <div className="text-left">
        <label className={labelStyle}>Área Técnica</label>
        <input 
          name="especialidade" 
          type="text" 
          className={`${inputStyle} text-[16px]`} 
          onChange={handleChange} 
          value={formData.especialidade || ''} 
          placeholder="Ex: Infraestrutura / Sistemas" 
          required 
        />
      </div>
    )}
  </div>

  <div className="flex flex-col md:flex-row gap-4 pt-6 text-left">
    <button 
      type="submit" 
      disabled={loading}
      className="btn-sus flex-1 py-5 text-lg font-black uppercase tracking-widest shadow-xl shadow-sus/20 disabled:opacity-50 rounded-3xl order-1 md:order-2" 
    >
      {loading ? 'Sincronizando...' : 'Confirmar Registro'}
    </button>
    <button 
      type="button" 
      onClick={() => router.back()}
      className="px-10 py-5 bg-gray-100 text-apple-secondary font-bold rounded-3xl hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest order-2 md:order-1"
    >
      Cancelar
    </button>
  </div>
</form>
      </div>
    </div>
  );
}