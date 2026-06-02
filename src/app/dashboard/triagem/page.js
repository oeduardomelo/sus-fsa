"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase'; 

export default function TriagemCentralPage() {
  const [busca, setBusca] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, criticos: 0 });
  
  const [abaAtiva, setAbaAtiva] = useState('abertas'); 

  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function buscarAtendimentos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('triagens') 
        .select(`
          *,
          pacientes (
            nome_completo,
            cpf,
            cartao_sus,
            is_especial,
            data_nascimento,
            alergias_desc,
            doencas_cronicas_desc,
            medicacoes_continuas_desc
          )
        `)
        .eq('concluido', abaAtiva === 'concluidas')
        .order('criado_at', { ascending: false });

      if (error) throw error;

      const higienizados = data?.map(item => ({
        ...item,
        dados_paciente: Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes
      }));

      setAtendimentos(higienizados || []);
      
      const contadorPrioritarios = higienizados?.filter(t => {
        const risco = t.classificacao_risco?.toUpperCase() || "";
        const p = t.dados_paciente;
        let isIdoso = false;
        if (p?.data_nascimento) {
          const anoNasc = new Date(p.data_nascimento).getFullYear();
          isIdoso = (new Date().getFullYear() - anoNasc) >= 60;
        }
        return risco.includes('EMERGÊNCIA') || risco.includes('MUITO URGENTE') || p?.is_especial || isIdoso;
      }).length || 0;

      setStats({ total: higienizados?.length || 0, criticos: contadorPrioritarios });
    } catch (error) {
      console.error('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoConcluida(id) {
    if (!confirm("Deseja concluir este atendimento e movê-lo para o histórico?")) return;
    
    try {
      const { error } = await supabase
        .from('triagens')
        .update({ concluido: true })
        .eq('id', id);

      if (error) throw error;
      
      setAtendimentos(prev => prev.filter(item => item.id !== id));
      alert("✅ Atendimento concluído com sucesso!");
      if (isModalOpen) setIsModalOpen(false);
      buscarAtendimentos(); 
    } catch (error) {
      alert("Erro ao concluir consulta: " + error.message);
    }
  }

  useEffect(() => {
    buscarAtendimentos();
  }, [abaAtiva]);

  const handlePrint = (item) => {
    setPacienteSelecionado(item);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleVerProntuário = (triagem) => {
    setPacienteSelecionado(triagem);
    setIsModalOpen(true);
  };

  const triagensFiltradas = atendimentos.filter(t => 
    t.dados_paciente?.nome_completo?.toLowerCase().includes(busca.toLowerCase()) ||
    t.dados_paciente?.cpf?.includes(busca)
  );

  return (
    <div className="space-y-8 pb-10">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #section-to-print, #section-to-print * { visibility: visible; }
          #section-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 15mm !important;
            color: black !important;
            background: white !important;
            font-family: 'Arial', sans-serif;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-apple-label text-left">Central de <span className="text-sus">Triagem</span></h1>
          <p className="text-apple-secondary text-sm font-medium italic text-left">Gerencie atendimentos abertos e o histórico da unidade.</p>
        </div>
        <Link href="/dashboard/triagem/nova" className="btn-sus !py-3 !px-6 shadow-xl shadow-sus/20 !rounded-[24px]">
          + Iniciar Nova Triagem
        </Link>
      </div>

      {/* Seletor de Pastas (Abas) */}
      <div className="flex gap-2 p-1 bg-gray-200/50 w-fit rounded-2xl border border-gray-200">
        <button 
          onClick={() => setAbaAtiva('abertas')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${abaAtiva === 'abertas' ? 'bg-white text-sus shadow-sm' : 'text-apple-secondary hover:bg-white/50'}`}
        >
          📂 Abertas
        </button>
        <button 
          onClick={() => setAbaAtiva('concluidas')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${abaAtiva === 'concluidas' ? 'bg-white text-green-600 shadow-sm' : 'text-apple-secondary hover:bg-white/50'}`}
        >
          ✅ Concluídas
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="apple-card p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-sus/20 transition-all border-none shadow-sm !rounded-[32px]">
        <span className="text-xl ml-2">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar paciente por nome ou CPF..." 
          className="bg-transparent flex-1 outline-none text-apple-label font-bold text-[16px]"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className={`${abaAtiva === 'concluidas' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6 transition-all`}>
          <div className="apple-card overflow-hidden border-none shadow-sm !rounded-[40px]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-secondary">
                {abaAtiva === 'abertas' ? 'Pacientes em Espera' : 'Pacientes Atendidos'}
              </h2>
              <span className="text-[10px] bg-sus/10 text-sus px-3 py-1 rounded-full font-black uppercase">FSA - Central</span>
            </div>
            
            <div className="divide-y divide-gray-50 text-left">
              {loading ? (
                <div className="p-12 text-center animate-pulse text-apple-secondary font-bold text-xs uppercase">Carregando triagens...</div>
              ) : triagensFiltradas.length > 0 ? (
                triagensFiltradas.map((item) => {
                   const p = item.dados_paciente;
                   const idade = p?.data_nascimento ? (new Date().getFullYear() - new Date(p.data_nascimento).getFullYear()) : null;
                   
                   // CORREÇÃO DO HORÁRIO (Fuso Horário Local - Brasil)
                   // CORREÇÃO: Ajuste manual de 3 horas para fuso de Brasília
const dataBanco = new Date(item.criado_at);
dataBanco.setHours(dataBanco.getHours() - 3);

const horaConclusao = dataBanco.toLocaleTimeString('pt-BR', { 
  hour: '2-digit', 
  minute: '2-digit' 
});

                   return (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-3 h-3 rounded-full ${getCorCorManchester(item.classificacao_risco)} shadow-sm`}></div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-apple-label uppercase tracking-tight">{p?.nome_completo}</h3>
                          {abaAtiva === 'concluidas' && (
                            <span className="text-[10px] font-black text-sus bg-sus/5 px-2 py-0.5 rounded-md border border-sus/10">
                              🕒 {horaConclusao}
                            </span>
                          )}
                          <div className="flex gap-1">
                            {p?.is_especial && <span className="px-1.5 py-0.5 rounded-lg bg-blue-600 text-white text-[8px] font-black uppercase animate-pulse">PCD</span>}
                            {idade >= 60 && <span className="px-1.5 py-0.5 rounded-lg bg-sus text-white text-[8px] font-black uppercase">60+ IDOSO</span>}
                          </div>
                        </div>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[10px] text-apple-secondary font-bold font-mono">CPF: {p?.cpf}</span>
                          <span className={`text-[9px] font-black uppercase tracking-tighter italic ${getTextoCorManchester(item.classificacao_risco)}`}>
                             {item.classificacao_risco || 'Não Classificado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* AÇÕES SEMPRE VISÍVEIS (removido opacity-0) */}
                    <div className="flex items-center gap-2 transition-all">
                      {abaAtiva === 'abertas' && (
                        <button 
                          onClick={() => marcarComoConcluida(item.id)}
                          className="p-2 rounded-xl hover:bg-green-100 transition-all text-lg"
                          title="Marcar como Concluída"
                        >
                          ✅
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint(item)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-all text-lg"
                        title="Imprimir"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => handleVerProntuário(item)}
                        className="bg-apple-gray px-4 py-2 rounded-[18px] text-[10px] font-black uppercase hover:bg-sus hover:text-white transition-all"
                      >
                        Detalhes →
                      </button>
                    </div>
                  </div>
                )})
              ) : (
                <div className="px-6 py-12 text-center text-apple-secondary italic font-bold tracking-widest uppercase text-[10px]">Vazio</div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo da Pasta - Some no Concluídos (Mantido como solicitado) */}
        {abaAtiva === 'abertas' && (
          <aside className="space-y-6">
            <div className="apple-card p-6 space-y-4 border-none shadow-sm !rounded-[32px]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-apple-secondary text-left">Resumo da Pasta</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-apple-gray rounded-[24px]">
                  <span className="text-xs font-bold uppercase text-apple-label tracking-tight text-left">Total</span>
                  <span className="font-black text-sus text-xl leading-none">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-[24px] border border-red-100">
                  <span className="text-xs font-bold uppercase text-red-600 tracking-tight text-left">Prioritários</span>
                  <span className="font-black text-red-600 text-xl leading-none">{stats.criticos}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* MODAL DE DETALHES */}
      {isModalOpen && pacienteSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`p-8 ${getCorCorManchester(pacienteSelecionado.classificacao_risco)} text-white`}>
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-left">Resumo da Triagem</h2>
                  <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest text-left">{pacienteSelecionado.classificacao_risco}</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => handlePrint(pacienteSelecionado)} className="text-xl hover:scale-110 transition-all">🖨️</button>
                   <button onClick={() => setIsModalOpen(false)} className="text-2xl hover:scale-110 transition-all">✕</button>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh] text-left">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-[10px] font-black text-apple-secondary uppercase block text-left">Paciente</span>
                  <h3 className="text-xl font-black text-apple-label uppercase tracking-tight text-left">{pacienteSelecionado.dados_paciente?.nome_completo}</h3>
                  <div className="flex gap-2 mt-1">
                    <p className="text-xs font-bold text-apple-secondary uppercase tracking-widest text-left">Status: {pacienteSelecionado.concluido ? 'CONCLUÍDO' : 'EM ABERTO'}</p>
                    {(new Date().getFullYear() - new Date(pacienteSelecionado.dados_paciente?.data_nascimento).getFullYear()) >= 60 && (
                        <span className="text-[10px] font-black text-sus uppercase tracking-tighter italic underline underline-offset-2">IDOSO PRIORITÁRIO</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {pacienteSelecionado.dados_paciente?.is_especial && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">PCD</span>
                  )}
                  {(new Date().getFullYear() - new Date(pacienteSelecionado.dados_paciente?.data_nascimento).getFullYear()) >= 60 && (
                    <span className="bg-sus text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">60+</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-red-50 border border-red-100 rounded-3xl text-left">
                  <span className="text-[9px] font-black text-red-600 uppercase block mb-1">⚠️ Alergias</span>
                  <p className="text-sm font-bold text-red-900">{pacienteSelecionado.dados_paciente?.alergias_desc || 'Nenhuma informada'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl text-left text-left">
                    <span className="text-[9px] font-black text-apple-secondary uppercase block mb-1">Doenças Crônicas</span>
                    <p className="text-xs font-bold text-apple-label">{pacienteSelecionado.dados_paciente?.doencas_cronicas_desc || 'Nenhuma'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-3xl text-left text-left">
                    <span className="text-[9px] font-black text-apple-secondary uppercase block mb-1">Medicamentos</span>
                    <p className="text-xs font-bold text-apple-label">{pacienteSelecionado.dados_paciente?.medicacoes_continuas_desc || 'Nenhum'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-gray-50 rounded-[30px] border border-gray-100 text-[11px] font-bold">
                  <span className="block text-[9px] font-black uppercase mb-2 text-apple-secondary">Sinais Vitais</span>
                  <p>PA: {pacienteSelecionado.pa} | FC: {pacienteSelecionado.fc} bpm</p>
                  <p>TEMP: {pacienteSelecionado.temperatura}°C | SAT: {pacienteSelecionado.saturacao}%</p>
                  <p className="text-sus mt-1 font-black underline underline-offset-4">IMC: {pacienteSelecionado.imc}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-[30px] border border-gray-100 text-left">
                   <span className="block text-[9px] font-black uppercase mb-1 text-apple-secondary text-left">Queixa Principal</span>
                   <p className="text-xs font-bold leading-tight italic">"{pacienteSelecionado.queixa_principal}"</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {abaAtiva === 'abertas' && (
                  <button 
                    onClick={() => marcarComoConcluida(pacienteSelecionado.id)}
                    className="flex-1 py-5 bg-green-500 text-white font-black rounded-[24px] uppercase tracking-widest text-[11px] hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                  >
                    Finalizar
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-apple-label text-white font-black rounded-[24px] uppercase tracking-widest text-[11px] hover:bg-black transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTRUTURA DE IMPRESSÃO */}
      {pacienteSelecionado && (
        <div id="section-to-print" className="hidden print:block text-left">
          <div className="border-[4px] border-black p-8 bg-white text-black text-left">
            <div className="text-center border-b-[4px] border-black pb-4 mb-6">
              <h1 className="text-4xl font-black uppercase text-center">Ficha de Triagem - SUS+ ÁGIL</h1>
              <p className="font-bold tracking-widest uppercase text-xl text-center">FSA CENTRAL - BA</p>
            </div>
            
            <div className="grid grid-cols-2 gap-10 mb-8 border-b-2 border-black pb-8 text-left">
              <div className="text-left">
                <h2 className="text-xs font-black uppercase mb-2 text-left">Paciente</h2>
                <div className="flex items-center gap-2 text-left">
                  <p className="text-2xl font-black uppercase mb-2 text-left">{pacienteSelecionado.dados_paciente?.nome_completo}</p>
                  {pacienteSelecionado.dados_paciente?.is_especial && <span className="border-2 border-black px-2 py-0.5 text-xs font-black">PCD</span>}
                  {(new Date().getFullYear() - new Date(pacienteSelecionado.dados_paciente?.data_nascimento).getFullYear()) >= 60 && (
                      <span className="border-2 border-black px-2 py-0.5 text-xs font-black uppercase italic">IDOSO</span>
                  )}
                </div>
                <p className="font-bold text-left text-left text-left">CPF: {pacienteSelecionado.dados_paciente?.cpf}</p>
                <p className="font-bold text-left text-left text-left">CARTÃO SUS: {pacienteSelecionado.dados_paciente?.cartao_sus}</p>
              </div>
              <div className="text-right text-right text-right">
                <h2 className="text-xs font-black uppercase mb-2 text-right">Classificação de Risco</h2>
                <div className="inline-block border-[4px] border-black px-6 py-4">
                   <p className="text-3xl font-black uppercase text-center">{pacienteSelecionado.classificacao_risco}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b-2 border-black pb-6 text-left">
              <h2 className="text-lg font-black uppercase mb-4 underline decoration-2 text-left">Histórico e Alertas Médicos</h2>
              <div className="grid grid-cols-1 gap-4 text-left">
                <p className="text-lg font-bold uppercase text-left"><span className="text-xs block text-gray-500 uppercase font-black text-left">Alergias:</span> {pacienteSelecionado.dados_paciente?.alergias_desc || 'NÃO INFORMADO'}</p>
                <div className="grid grid-cols-2 gap-6 text-left">
                    <p className="text-sm font-bold uppercase text-left"><span className="text-xs block text-gray-500 uppercase font-black text-left">Doenças Crônicas:</span> {pacienteSelecionado.dados_paciente?.doencas_cronicas_desc || 'NADA CONSTA'}</p>
                    <p className="text-sm font-bold uppercase text-left"><span className="text-xs block text-gray-500 uppercase font-black text-left">Medicamentos Contínuos:</span> {pacienteSelecionado.dados_paciente?.medicacoes_continuas_desc || 'NADA CONSTA'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b-2 border-black pb-6 text-left">
              <h2 className="text-lg font-black uppercase mb-4 text-left">Sinais Vitais</h2>
              <div className="grid grid-cols-3 gap-6 text-xl font-bold uppercase text-left">
                <div className="text-left">PA: {pacienteSelecionado.pa}</div>
                <div className="text-left">T: {pacienteSelecionado.temperatura}°C</div>
                <div className="text-left">SAT: {pacienteSelecionado.saturacao}%</div>
                <div className="text-left">FC: {pacienteSelecionado.fc} bpm</div>
                <div className="text-left">Peso: {pacienteSelecionado.peso}kg</div>
                <div className="text-left">IMC: {pacienteSelecionado.imc}</div>
              </div>
            </div>

            <div className="mb-10 text-left">
              <h2 className="text-lg font-black uppercase border-b-2 border-black mb-4 text-left text-left">Queixa Principal Relatada</h2>
              <p className="text-xl font-medium uppercase italic leading-relaxed text-left text-left">"{pacienteSelecionado.queixa_principal}"</p>
            </div>

            <div className="mt-20 flex justify-between items-end text-left">
               <div className="text-center border-t-2 border-black pt-2 w-72 text-left">
                 <p className="font-black uppercase text-sm text-center">Assinatura Responsável</p>
               </div>
               <div className="text-right text-[10px] font-bold uppercase text-right text-right">
                 {/* Ajuste de horário na impressão também */}
                 <p>Gerado em: {(() => {
  const d = new Date(pacienteSelecionado.criado_at);
  d.setHours(d.getHours() - 3);
  return d.toLocaleString('pt-BR');
})()}</p>
                 <p>Sistema SUS+ Ágil - FSA/BA</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCorCorManchester(risco) {
  const r = risco?.toUpperCase() || "";
  if (r.includes('EMERGÊNCIA')) return 'bg-red-600';
  if (r.includes('MUITO URGENTE')) return 'bg-orange-500';
  if (r.includes('POUCO URGENTE')) return 'bg-green-500'; 
  if (r.includes('NÃO URGENTE')) return 'bg-blue-600';    
  if (r.includes('URGENTE')) return 'bg-yellow-400';
  return 'bg-gray-400';
}

function getTextoCorManchester(risco) {
  const r = risco?.toUpperCase() || "";
  if (r.includes('EMERGÊNCIA')) return 'text-red-600';
  if (r.includes('MUITO URGENTE')) return 'text-orange-500';
  if (r.includes('POUCO URGENTE')) return 'text-green-600'; 
  if (r.includes('NÃO URGENTE')) return 'text-blue-600';    
  if (r.includes('URGENTE')) return 'text-yellow-600';
  return 'text-gray-400';
}