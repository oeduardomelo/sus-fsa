"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    triagensDia: 0,
    medicos: 0,
    enfermeiros: 0,
    recepcionistas: 0
  });
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  async function carregarDados() {
    try {
      setLoading(true);
      
      // AJUSTE DE DATA PARA HOJE (Fuso Horário Local)
      const agora = new Date();
      const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).toISOString();
      
      const { data: triagens, error: errorTriagens } = await supabase
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
        .eq('concluido', false)
        .order('criado_at', { ascending: true });

      if (errorTriagens) throw errorTriagens;

      // Mapeia os dados exatamente como na Triagem Central
      const higienizados = triagens?.map(item => ({
        ...item,
        dados_paciente: Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes
      }));

      // CONTAGEM DE TUDO O QUE FOI CRIADO DESDE O INÍCIO DO DIA ATUAL
      const { count: totalDia } = await supabase
        .from('triagens')
        .select('*', { count: 'exact', head: true })
        .gte('criado_at', inicioDia);

      const { data: profs } = await supabase.from('usuarios').select('cargo');
      
      const contagem = {
        medicos: profs?.filter(p => p.cargo === 'Médico').length || 0,
        enfermeiros: profs?.filter(p => p.cargo === 'Enfermeiro').length || 0,
        recepcionistas: profs?.filter(p => p.cargo === 'Recepcionista').length || 0,
        triagensDia: totalDia || 0
      };

      setStats(contagem);
      setPendentes(higienizados || []);
    } catch (error) {
      console.error("Erro no Dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  async function concluirTriagem(id) {
    if (!confirm("Deseja arquivar este atendimento?")) return;
    try {
      const { error } = await supabase
        .from('triagens')
        .update({ concluido: true })
        .eq('id', id);

      if (error) throw error;
      setPendentes(pendentes.filter(t => t.id !== id));
      carregarDados();
    } catch (error) {
      alert("Erro ao arquivar: " + error.message);
    }
  }

  const handlePrint = (item) => {
    setPacienteSelecionado(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const cardStyle = "apple-card p-4 md:p-8 flex flex-col justify-between min-h-[140px] md:min-h-[180px] transition-all hover:shadow-xl !rounded-[24px] md:!rounded-[32px] border-none shadow-sm";

  return (
    <div className="space-y-6 md:space-y-10 pb-10 text-left">
      {/* CSS DE IMPRESSÃO PROFISSIONAL - FORÇA 1 FOLHA */}
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
            padding: 10mm !important;
            color: black !important;
            background: white !important;
            font-family: 'Arial', sans-serif;
            height: 99vh;
            overflow: hidden;
          }
        }
      `}</style>

      <header className="px-1 text-left">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-apple-label text-left">Painel de <span className="text-sus">Controle</span></h1>
        <p className="text-apple-secondary mt-1 font-medium italic text-xs text-left">Monitoramento em tempo real - Unidade FSA.</p>
      </header>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 text-left">
        <div className={cardStyle}>
          <div className="flex justify-between items-start">
            <span className="text-[8px] md:text-[10px] font-black text-sus uppercase tracking-widest text-left">Triagens</span>
            <span className="text-sm md:text-xl text-left">📋</span>
          </div>
          <div className="text-left">
            <p className="text-3xl md:text-5xl font-black text-apple-label text-left">{stats.triagensDia}</p>
            <p className="hidden md:block text-[10px] text-apple-secondary mt-2 font-bold uppercase tracking-tighter text-left">Registradas Hoje</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex justify-between items-start">
            <span className="text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-widest text-left">Médicos</span>
            <span className="text-sm md:text-xl text-left">🩺</span>
          </div>
          <div className="text-left">
            <p className="text-3xl md:text-5xl font-black text-apple-label text-left">{stats.medicos}</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex justify-between items-start">
            <span className="text-[8px] md:text-[10px] font-black text-orange-500 uppercase tracking-widest text-left">Enfermeiros</span>
            <span className="text-sm md:text-xl text-left">💉</span>
          </div>
          <div className="text-left">
            <p className="text-3xl md:text-5xl font-black text-apple-label text-left">{stats.enfermeiros}</p>
          </div>
        </div>

        <div className={cardStyle}>
          <div className="flex justify-between items-start">
            <span className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest text-left">Recepc.</span>
            <span className="text-sm md:text-xl text-left">🏢</span>
          </div>
          <div className="text-left">
            <p className="text-3xl md:text-5xl font-black text-apple-label text-left">{stats.recepcionistas}</p>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between px-2 text-left">
          <h2 className="text-xs md:text-lg font-black uppercase tracking-widest text-apple-label text-left">Triagens em Aberto</h2>
          <span className="bg-sus/10 text-sus px-3 py-1 rounded-full text-[10px] font-black text-left">{pendentes.length} FILA</span>
        </div>

        <div className="apple-card !rounded-[30px] md:!rounded-[40px] overflow-hidden border-none shadow-sm min-h-[200px] text-left">
          {loading ? (
             <div className="flex items-center justify-center h-64 animate-pulse uppercase font-black text-apple-secondary text-[10px] text-left">Sincronizando...</div>
          ) : pendentes.length > 0 ? (
            <div className="divide-y divide-gray-100 text-left">
              {pendentes.map((t) => {
                const p = t.dados_paciente;
                const idade = p?.data_nascimento ? (new Date().getFullYear() - new Date(p.data_nascimento).getFullYear()) : 0;
                return (
                  <div key={t.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all text-left">
                    <div className="flex items-center gap-3 md:gap-4 text-left">
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full shadow-sm flex-shrink-0 ${getCorCorManchester(t.classificacao_risco)}`}></div>
                      <div className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2 mb-1 text-left">
                            <h4 className="font-black text-apple-label uppercase tracking-tight text-sm md:text-base truncate text-left">{p?.nome_completo}</h4>
                            {p?.is_especial && <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black animate-pulse uppercase text-left">PCD</span>}
                            {idade >= 60 && <span className="bg-sus text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase text-left">60+ IDOSO</span>}
                        </div>
                        <p className="text-[9px] md:text-[10px] text-apple-secondary font-bold uppercase tracking-tighter text-left">
                          <span className={getTextoCorManchester(t.classificacao_risco)}>{t.classificacao_risco}</span> • {new Date(t.criado_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-left">
                      <button onClick={() => handlePrint(t)} className="p-3 bg-gray-100 rounded-xl text-sm hover:bg-sus hover:text-white transition-colors text-left" title="Imprimir Ficha">🖨️</button>
                      <Link href="/dashboard/triagem" className="p-3 bg-gray-100 rounded-xl text-sm hover:bg-apple-label hover:text-white transition-colors text-left" title="Ir para Central">🔍</Link>
                      <button 
                        onClick={() => concluirTriagem(t.id)}
                        className="flex-1 md:flex-none bg-green-500 text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 text-left"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-30 grayscale gap-2 text-left">
              <span className="text-3xl text-left">✅</span>
              <p className="font-black uppercase text-[9px] tracking-widest px-4 text-left">Nenhuma triagem pendente.</p>
            </div>
          )}
        </div>
      </div>

      {/* ESTRUTURA DE IMPRESSÃO (IGUAL À TRIAGEM CENTRAL) */}
      {pacienteSelecionado && (
        <div id="section-to-print" className="hidden print:block">
          <div className="border-[4px] border-black p-8 bg-white text-black text-left">
            <div className="text-center border-b-[4px] border-black pb-4 mb-4">
              <h1 className="text-4xl font-black uppercase text-center">Ficha de Triagem - SUS+ ÁGIL</h1>
              <p className="font-bold tracking-widest uppercase text-xl text-center">FSA CENTRAL - BA</p>
            </div>
            
            <div className="grid grid-cols-2 gap-10 mb-6 border-b-2 border-black pb-6 text-left">
              <div className="text-left">
                <h2 className="text-xs font-black uppercase mb-1 text-left">Paciente</h2>
                <div className="flex items-center gap-2 text-left">
                  <p className="text-2xl font-black uppercase mb-1 text-left">{pacienteSelecionado.dados_paciente?.nome_completo}</p>
                  {pacienteSelecionado.dados_paciente?.is_especial && <span className="border-2 border-black px-2 py-0.5 text-xs font-black">PCD</span>}
                  {(new Date().getFullYear() - new Date(pacienteSelecionado.dados_paciente?.data_nascimento).getFullYear()) >= 60 && (
                      <span className="border-2 border-black px-2 py-0.5 text-xs font-black uppercase italic">IDOSO</span>
                  )}
                </div>
                <p className="font-bold text-left">CPF: {pacienteSelecionado.dados_paciente?.cpf}</p>
                <p className="font-bold text-left">CARTÃO SUS: {pacienteSelecionado.dados_paciente?.cartao_sus}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xs font-black uppercase mb-1 text-right">Classificação de Risco</h2>
                <div className="inline-block border-[4px] border-black px-6 py-3">
                   <p className="text-3xl font-black uppercase text-center">{pacienteSelecionado.classificacao_risco}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 border-b-2 border-black pb-4 text-left">
              <h2 className="text-lg font-black uppercase mb-3 underline decoration-2 text-left">Histórico e Alertas Médicos</h2>
              <div className="grid grid-cols-1 gap-3 text-left">
                <p className="text-lg font-bold uppercase text-left text-left"><span className="text-xs block text-gray-500 text-left uppercase font-black">Alergias:</span> {pacienteSelecionado.dados_paciente?.alergias_desc || 'NÃO INFORMADO'}</p>
                <div className="grid grid-cols-2 gap-6 text-left">
                    <p className="text-sm font-bold uppercase text-left"><span className="text-xs block text-gray-500 text-left uppercase font-black">Doenças Crônicas:</span> {pacienteSelecionado.dados_paciente?.doencas_cronicas_desc || 'NADA CONSTA'}</p>
                    <p className="text-sm font-bold uppercase text-left"><span className="text-xs block text-gray-500 text-left uppercase font-black">Medicamentos Contínuos:</span> {pacienteSelecionado.dados_paciente?.medicacoes_continuas_desc || 'NADA CONSTA'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 border-b-2 border-black pb-4 text-left">
              <h2 className="text-lg font-black uppercase mb-3 text-left">Sinais Vitais</h2>
              <div className="grid grid-cols-3 gap-6 text-xl font-bold uppercase text-left">
                <div className="text-left">PA: {pacienteSelecionado.pa}</div>
                <div className="text-left">T: {pacienteSelecionado.temperatura}°C</div>
                <div className="text-left">SAT: {pacienteSelecionado.saturacao}%</div>
                <div className="text-left">FC: {pacienteSelecionado.fc} bpm</div>
                <div className="text-left">Peso: {pacienteSelecionado.peso}kg</div>
                <div className="text-left">IMC: {pacienteSelecionado.imc}</div>
              </div>
            </div>

            <div className="mb-8 text-left">
              <h2 className="text-lg font-black uppercase border-b-2 border-black mb-3 text-left">Queixa Principal Relatada</h2>
              <p className="text-xl font-medium uppercase italic leading-relaxed text-left">"{pacienteSelecionado.queixa_principal}"</p>
            </div>

            <div className="mt-8 flex justify-between items-end text-left">
               <div className="text-center border-t-2 border-black pt-2 w-72 text-center">
                 <p className="font-black uppercase text-sm text-center">Assinatura Responsável</p>
               </div>
               <div className="text-right text-[10px] font-bold uppercase text-right">
                 <p className="text-right">Gerado em: {new Date(pacienteSelecionado.criado_at).toLocaleString('pt-BR')}</p>
                 <p className="text-right">Sistema SUS+ Ágil - FSA/BA</p>
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