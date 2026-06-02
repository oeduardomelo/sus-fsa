"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { supabase } from '../../../../lib/supabase';

export default function ProfissionaisPage() {
  const [equipe, setEquipe] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para o Modal e Edição
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editForm, setEditForm] = useState({
    nome_completo: '',
    registro_profissional: '',
    especialidade: '',
    setor: ''
  });

  // Busca os profissionais no banco
  async function buscarEquipe() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      setEquipe(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarEquipe();
  }, []);

  // Função para abrir detalhes e preparar edição
  const abrirDetalhes = (p, editar = false) => {
    setProfissionalSelecionado(p);
    setEditForm({
      nome_completo: p.nome_completo,
      registro_profissional: p.registro_profissional || '',
      especialidade: p.especialidade || '',
      setor: p.setor || ''
    });
    setModoEdicao(editar);
    setIsModalOpen(true);
  };

  // Função para salvar a edição via Popup
  const salvarEdicao = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .update(editForm)
        .eq('id', profissionalSelecionado.id);

      if (error) throw error;

      alert("✅ Dados atualizados com sucesso!");
      setIsModalOpen(false);
      buscarEquipe(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar profissional
  async function deletarProfissional(id, nome) {
    if (!confirm(`Deseja realmente remover ${nome} da equipe?`)) return;

    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw error;
      setEquipe(equipe.filter(p => p.id !== id));
      alert("Profissional removido com sucesso.");
    } catch (error) {
      alert("Erro ao deletar: " + error.message);
    }
  }

  // Filtro de busca
  const equipeFiltrada = equipe.filter(p => 
    p.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf.includes(busca)
  );

  // Função para definir a cor do Badge do Cargo
  const getBadgeStyle = (cargo) => {
    switch (cargo) {
      case 'Médico': return 'bg-red-100 text-red-600';
      case 'Enfermeiro': return 'bg-orange-100 text-orange-600';
      case 'Recepcionista': return 'bg-green-100 text-green-600';
      case 'TI': return 'bg-blue-100 text-blue-600 font-black';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus transition-all text-sm font-bold text-apple-label mt-1";

  return (
    <div className="space-y-6 pb-10">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-apple-label">Equipe de <span className="text-sus">Saúde</span></h1>
          <p className="text-apple-secondary text-sm font-medium italic">Gestão de profissionais da unidade FSA.</p>
        </div>
        <Link href="/dashboard/profissionais/novo" className="btn-sus !py-3 !px-6 text-sm shadow-xl shadow-sus/20 text-center !rounded-3xl">
          + Novo Profissional
        </Link>
      </div>

      {/* Barra de Pesquisa Estilo Apple */}
      <div className="apple-card p-4 flex items-center gap-4 focus-within:ring-2 focus-within:ring-sus/20 transition-all border-none shadow-sm !rounded-[32px]">
        <span className="text-xl ml-2">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar por nome ou CPF..." 
          className="bg-transparent flex-1 outline-none text-apple-label font-bold text-sm"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela Responsiva */}
      <div className="apple-card overflow-hidden border-none shadow-sm !rounded-[40px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-apple-secondary">Nome / Registro</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-apple-secondary">Cargo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-apple-secondary hidden md:table-cell">Especialidade / Setor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-apple-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !isModalOpen ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center animate-pulse text-apple-secondary font-bold text-xs uppercase">Sincronizando equipe...</td>
                </tr>
              ) : equipeFiltrada.length > 0 ? (
                equipeFiltrada.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => abrirDetalhes(p)}
                        className="flex flex-col text-left hover:opacity-70 transition-opacity"
                      >
                        <span className="text-sm font-black text-apple-label uppercase tracking-tight decoration-sus/30 decoration-2 ">{p.nome_completo}</span>
                        <span className="text-[10px] text-apple-secondary font-bold font-mono">
                          {p.registro_profissional ? p.registro_profissional : `CPF: ${p.cpf}`}
                        </span>
                      </button>
                    </td>
                    <td className="px-1.5 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getBadgeStyle(p.cargo)}`}>
                        {p.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-medium text-apple-secondary">
                        {p.especialidade || p.setor || "Geral"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        {/* BOTÃO EDITAR - Agora abre o Modal diretamente */}
                        <button 
                          onClick={() => abrirDetalhes(p, true)}
                          className="p-2 rounded-xl text-apple-secondary hover:bg-sus/10 hover:text-sus transition-all md:opacity-0 md:group-hover:opacity-100"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {/* BOTÃO EXCLUIR */}
                        <button 
                          onClick={() => deletarProfissional(p.id, p.nome_completo)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all md:opacity-0 md:group-hover:opacity-100"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-apple-secondary italic">Nenhum profissional encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHES E EDIÇÃO DO PROFISSIONAL */}
      {isModalOpen && profissionalSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-white border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-sus uppercase tracking-tighter">
                    {modoEdicao ? 'Editar Profissional' : 'Perfil Profissional'}
                  </h2>
                  <p className="text-xs font-bold opacity-80 text-black uppercase tracking-widest">{profissionalSelecionado.cargo}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-2xl text-black hover:scale-110 transition-transform">✕</button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {modoEdicao ? (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-black text-apple-secondary uppercase ml-2">Nome Completo</label>
                    <input 
                      className={inputStyle}
                      value={editForm.nome_completo}
                      onChange={(e) => setEditForm({...editForm, nome_completo: e.target.value})}
                    />
                  </div>
                  
                  {(profissionalSelecionado.cargo === 'Médico' || profissionalSelecionado.cargo === 'Enfermeiro') && (
                    <div>
                      <label className="text-[10px] font-black text-apple-secondary uppercase ml-2">Registro (CRM/COREN)</label>
                      <input 
                        className={inputStyle}
                        value={editForm.registro_profissional}
                        onChange={(e) => setEditForm({...editForm, registro_profissional: e.target.value})}
                      />
                    </div>
                  )}

                  {profissionalSelecionado.cargo === 'Recepcionista' ? (
                    <div>
                      <label className="text-[10px] font-black text-apple-secondary uppercase ml-2">Setor</label>
                      <input 
                        className={inputStyle}
                        value={editForm.setor}
                        onChange={(e) => setEditForm({...editForm, setor: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black text-apple-secondary uppercase ml-2">Especialidade / Área</label>
                      <input 
                        className={inputStyle}
                        value={editForm.especialidade}
                        onChange={(e) => setEditForm({...editForm, especialidade: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={salvarEdicao}
                      className="flex-1 py-4 bg-sus text-white font-black rounded-[24px] uppercase text-[11px] shadow-lg shadow-sus/20 active:scale-95 transition-all"
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button 
                      onClick={() => setModoEdicao(false)}
                      className="px-6 py-4 bg-gray-100 text-apple-secondary font-bold rounded-[24px] uppercase text-[11px]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] font-black text-apple-secondary uppercase tracking-widest block mb-1">Nome Completo</span>
                    <h3 className="text-xl font-black text-apple-label uppercase leading-tight">{profissionalSelecionado.nome_completo}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100">
                      <span className="block text-[9px] font-black text-apple-secondary uppercase mb-1">Documento</span>
                      <p className="text-xs font-bold text-apple-label">CPF: {profissionalSelecionado.cpf}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-[24px] border border-gray-100">
                      <span className="block text-[9px] font-black text-apple-secondary uppercase mb-1">Registro</span>
                      <p className="text-xs font-bold text-apple-label">{profissionalSelecionado.registro_professional || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-sus/5 rounded-[24px] border border-sus/10">
                    <p className="text-[10px] font-black text-sus uppercase tracking-widest mb-1">Atuação</p>
                    <p className="text-sm font-bold text-apple-label uppercase italic">
                      {profissionalSelecionado.especialidade || profissionalSelecionado.setor || "Clínica Geral"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setModoEdicao(true)}
                      className="flex-1 py-4 bg-apple-label text-white font-black rounded-[24px] uppercase tracking-widest text-[11px] hover:bg-black transition-all"
                    >
                      Editar Dados
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-4 bg-gray-100 text-apple-secondary font-bold rounded-[24px] uppercase text-[11px] hover:bg-gray-200"
                    >
                      Fechar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Funções de cor mantidas conforme sua solicitação
function getCorCorManchester(risco) {
  const r = risco?.toUpperCase() || "";
  if (r.includes('EMERGÊNCIA') || r.includes('VERMELHO')) return 'bg-red-600';
  if (r.includes('MUITO URGENTE') || r.includes('LARANJA')) return 'bg-orange-500';
  if (r.includes('URGENTE') || r.includes('AMARELO')) return 'bg-yellow-400';
  if (r.includes('POUCO URGENTE') || r.includes('VERDE')) return 'bg-green-500';
  if (r.includes('NÃO URGENTE') || r.includes('AZUL')) return 'bg-blue-600';
  return 'bg-gray-400';
}

function getTextoCorManchester(risco) {
  const r = risco?.toUpperCase() || "";
  if (r.includes('EMERGÊNCIA') || r.includes('VERMELHO')) return 'text-red-600';
  if (r.includes('MUITO URGENTE') || r.includes('LARANJA')) return 'text-orange-500';
  if (r.includes('URGENTE') || r.includes('AMARELO')) return 'text-yellow-600';
  if (r.includes('POUCO URGENTE') || r.includes('VERDE')) return 'text-green-600';
  if (r.includes('NÃO URGENTE') || r.includes('AZUL')) return 'text-blue-600';
  return 'text-gray-400';
}