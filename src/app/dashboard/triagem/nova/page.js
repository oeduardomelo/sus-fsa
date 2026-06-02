"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../../lib/supabase'; 

export default function NovaTriagemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [tentouBuscar, setTentouBuscar] = useState(false);
  
  const [triagemData, setTriagemData] = useState({
    peso: '',
    altura: '',
    pressao_arterial: '',
    temperatura: '',
    saturacao: '',
    frequencia_cardiaca: '',
    queixa_principal: '',
    classificacao_risco: 'Pouco Urgente' // Padrão Verde
  });

  // Cálculo de IMC automático Corrigido
  const [imc, setImc] = useState(null);
  useEffect(() => {
    if (triagemData.peso && triagemData.altura) {
      // Substitui vírgula por ponto para o cálculo funcionar
      const p = parseFloat(triagemData.peso.replace(',', '.'));
      const a = parseFloat(triagemData.altura.replace(',', '.'));
      
      if (p > 0 && a > 0) {
        const resultado = (p / (a * a)).toFixed(1);
        setImc(resultado);
      }
    } else {
      setImc(null);
    }
  }, [triagemData.peso, triagemData.altura]);

  // Busca inteligente enquanto o usuário digita
  useEffect(() => {
    const buscarSugestoes = async () => {
      if (termoBusca.length < 3) {
        setSugestoes([]);
        return;
      }

      const { data } = await supabase
        .from('pacientes')
        .select('id, nome_completo, cpf, cartao_sus')
        .or(`nome_completo.ilike.%${termoBusca}%,cpf.ilike.%${termoBusca}%`)
        .limit(5);

      setSugestoes(data || []);
    };

    const timer = setTimeout(buscarSugestoes, 300);
    return () => clearTimeout(timer);
  }, [termoBusca]);

  const selecionarPaciente = (paciente) => {
    setPacienteEncontrado(paciente);
    setTermoBusca('');
    setSugestoes([]);
    setTentouBuscar(false);
  };

  const salvarTriagem = async (e) => {
  e.preventDefault();
  if (!pacienteEncontrado) return alert("Identifique o paciente primeiro.");
  
  setLoading(true);
  try {
    const { error } = await supabase
      .from('triagens') // SALVA NA TABELA NOVA
      .insert([{
        paciente_id: pacienteEncontrado.id,
        pa: triagemData.pressao_arterial,
        temperatura: triagemData.temperatura,
        saturacao: triagemData.saturacao,
        fc: triagemData.frequencia_cardiaca,
        peso: triagemData.peso,
        altura: triagemData.altura,
        imc: imc,
        queixa_principal: triagemData.queixa_principal,
        classificacao_risco: triagemData.classificacao_risco
      }]);

    if (error) throw error;
    alert("✅ Triagem salva no histórico oficial!");
    router.push('/dashboard/triagem');
  } catch (error) {
    alert("Erro: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const labelStyle = "text-[11px] font-black uppercase tracking-wider text-apple-secondary ml-2 mb-1.5 block";
  const inputStyle = "w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none transition-all focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus text-apple-label font-medium";

  // Mapeamento de cores conforme Protocolo de Manchester
  const coresRisco = [
    { nome: 'Emergência', bg: 'bg-red-600', hover: 'hover:bg-red-50' },
    { nome: 'Muito Urgente', bg: 'bg-orange-500', hover: 'hover:bg-orange-50' },
    { nome: 'Urgente', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-50' },
    { nome: 'Pouco Urgente', bg: 'bg-green-500', hover: 'hover:bg-green-50' },
    { nome: 'Não Urgente', bg: 'bg-blue-600', hover: 'hover:bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-none pb-20">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-apple-label">Nova <span className="text-sus">Triagem</span></h1>
          <p className="text-gray-500 font-medium font-bold italic">Feira de Santana • Classificação de Risco</p>
        </header>

        <div className="space-y-8">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative">
            <h2 className="text-xs font-black uppercase tracking-widest text-apple-secondary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sus"></span> 1. Identificação do Paciente
            </h2>
            
            <div className="relative">
              <label className={labelStyle}>Digite Nome ou CPF</label>
              <div className="relative">
               <input 
  type="text" 
  placeholder="Ex: João Silva ou 123.456..." 
  className={`${inputStyle} pl-12 text-[16px]`}
  value={termoBusca}
  onChange={(e) => {
    setTermoBusca(e.target.value);
    if(!pacienteEncontrado) setTentouBuscar(true);
  }}
/>
                <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
              </div>

              {sugestoes.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  {sugestoes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selecionarPaciente(p)}
                      className="w-full text-left p-4 hover:bg-sus/5 border-b border-gray-50 last:border-none transition-colors"
                    >
                      <p className="font-black text-apple-label uppercase text-sm">{p.nome_completo}</p>
                      <p className="text-[10px] text-apple-secondary font-bold">CPF: {p.cpf} | SUS: {p.cartao_sus}</p>
                    </button>
                  ))}
                </div>
              )}

              {tentouBuscar && termoBusca.length > 5 && sugestoes.length === 0 && !pacienteEncontrado && (
                <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-orange-700">Paciente não encontrado no sistema.</p>
                  <Link href="/dashboard/pacientes/novo" className="text-xs font-black text-sus uppercase hover:underline">
                    + Cadastrar Novo Paciente
                  </Link>
                </div>
              )}
            </div>

            {pacienteEncontrado && (
              <div className="mt-6 p-6 bg-sus/5 rounded-3xl border border-sus/10 flex justify-between items-center animate-in zoom-in-95">
                <div>
                  <p className="text-[10px] font-black uppercase text-sus mb-1 italic">Paciente Selecionado</p>
                  <p className="text-xl font-black text-apple-label uppercase tracking-tighter">{pacienteEncontrado.nome_completo}</p>
                  <p className="text-xs font-bold text-apple-secondary">CPF: {pacienteEncontrado.cpf}</p>
                </div>
                <button 
                  onClick={() => setPacienteEncontrado(null)}
                  className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  Trocar
                </button>
              </div>
            )}
          </section>

          {pacienteEncontrado && (
            <form onSubmit={salvarTriagem} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 space-y-10">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-apple-secondary mb-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> 2. Avaliação Clínica (Sinais Vitais)
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className={labelStyle}>P.A (mmHg)</label>
                      <input type="text" placeholder="12/8" className={inputStyle} onChange={(e) => setTriagemData({...triagemData, pressao_arterial: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Temp (°C)</label>
                      <input type="text" placeholder="36.5" className={inputStyle} onChange={(e) => setTriagemData({...triagemData, temperatura: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Saturação (%)</label>
                      <input type="text" placeholder="98" className={inputStyle} onChange={(e) => setTriagemData({...triagemData, saturacao: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Freq. Card.</label>
                      <input type="text" placeholder="80" className={inputStyle} onChange={(e) => setTriagemData({...triagemData, frequencia_cardiaca: e.target.value})} required />
                    </div>
                    
                    <div>
                      <label className={labelStyle}>Peso (kg)</label>
                      <input type="text" placeholder="70.5" className={inputStyle} value={triagemData.peso} onChange={(e) => setTriagemData({...triagemData, peso: e.target.value})} required />
                    </div>
                    <div>
                      <label className={labelStyle}>Altura (m)</label>
                      <input type="text" placeholder="1.75" className={inputStyle} value={triagemData.altura} onChange={(e) => setTriagemData({...triagemData, altura: e.target.value})} required />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="px-5 py-4 bg-sus/5 border border-sus/10 rounded-2xl flex items-center justify-between shadow-inner">
                        <span className="text-[10px] font-black text-sus uppercase tracking-widest">IMC</span>
                        <span className="font-black text-apple-label text-lg">{imc || '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={labelStyle}>Queixa Principal / Motivo da Visita</label>
                  <textarea 
                    className={`${inputStyle} h-32 resize-none py-4`}
                    placeholder="Descreva detalhadamente o que o paciente está sentindo..."
                    onChange={(e) => setTriagemData({...triagemData, queixa_principal: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className={labelStyle}>Prioridade de Atendimento</label>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {coresRisco.map((cor) => (
                      <button
                        key={cor.nome}
                        type="button"
                        onClick={() => setTriagemData({...triagemData, classificacao_risco: cor.nome})}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${triagemData.classificacao_risco === cor.nome ? 'border-apple-label scale-105 shadow-lg bg-gray-50' : 'border-transparent opacity-50 ' + cor.hover}`}
                      >
                        <div className={`w-8 h-8 rounded-full ${cor.bg} mb-2 shadow-sm`}></div>
                        <span className="text-[9px] font-black uppercase text-center leading-tight text-apple-label">{cor.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-50">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-6 bg-sus text-white font-black rounded-3xl shadow-xl shadow-sus/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? 'Sincronizando...' : 'Finalizar Triagem'}
                  </button>
                  <Link href="/dashboard/triagem" className="px-8 py-6 bg-white text-apple-secondary font-bold rounded-3xl border border-gray-200 text-center uppercase text-xs tracking-widest flex items-center justify-center active:scale-95 transition-all">
                    Cancelar
                  </Link>
                </div>
              </section>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}