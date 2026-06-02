"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';

export default function PacientesPage() {
  const [busca, setBusca] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const [editData, setEditData] = useState({});

  const labelStyle = "text-[11px] font-black uppercase tracking-wider text-apple-secondary ml-4 mb-2 block";
  const inputStyle = "w-full px-6 h-14 bg-gray-50/80 border border-gray-200 rounded-[22px] outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus text-apple-label placeholder:text-gray-400 font-bold text-sm shadow-sm";

  async function buscarPacientes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarPacientes();
  }, []);

  const pacientesFiltrados = pacientes?.filter(p => {
    if (!p) return false;
    const termo = busca.toLowerCase();
    return (
      p.nome_completo?.toLowerCase().includes(termo) ||
      p.cpf?.includes(busca) ||
      p.cartao_sus?.includes(busca)
    );
  }) || [];

  const handleVerDetalhes = (paciente) => {
    setPacienteSelecionado(paciente);
    setIsModalDetalhesOpen(true);
  };

  const handleEditar = (paciente) => {
    setPacienteSelecionado(paciente);
    setEditData({ 
      ...paciente,
      sexo: paciente.sexo || "",
      alergias_desc: paciente.alergias_desc || "",
      doencas_cronicas_desc: paciente.doencas_cronicas_desc || "",
      medicacoes_continuas_desc: paciente.medicacoes_continuas_desc || "",
      municipio: paciente.municipio || "",
      endereco: paciente.endereco || "",
      contato_emergencia_fone: paciente.contato_emergencia_fone || "",
      nome_completo: paciente.nome_completo || "",
      cpf: paciente.cpf || "",
      cartao_sus: paciente.cartao_sus || "",
      data_nascimento: paciente.data_nascimento || ""
    });
    setIsModalEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData.id) return alert("Erro: ID do paciente não encontrado.");
    
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .update({
          nome_completo: editData.nome_completo,
          cpf: editData.cpf,
          cartao_sus: editData.cartao_sus,
          rg: editData.rg,
          data_nascimento: editData.data_nascimento,
          sexo: editData.sexo, 
          endereco: editData.endereco,
          municipio: editData.municipio,
          is_especial: editData.is_especial,
          nome_responsavel: editData.nome_responsavel,
          contato_emergencia_fone: editData.contato_emergencia_fone,
          alergias_desc: editData.alergias_desc,
          doencas_cronicas_desc: editData.doencas_cronicas_desc,
          medicacoes_continuas_desc: editData.medicacoes_continuas_desc
        })
        .eq('id', editData.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setPacientes(pacientes.map(p => p.id === editData.id ? data[0] : p));
        setIsModalEditOpen(false);
        alert("✅ Alterações salvas com sucesso!");
      }
    } catch (error) {
      console.error("Erro completo:", error);
      alert("❌ Erro: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 pb-10 h-full relative text-left">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1 text-left">
        <div className="text-left">
          <h1 className="text-4xl font-black tracking-tight text-apple-label text-left">Pacientes</h1>
          <p className="text-apple-secondary text-sm font-medium italic mt-1 text-left">Base de dados unificada da unidade FSA.</p>
        </div>
        <Link href="/dashboard/pacientes/novo" className="btn-sus !py-4 !px-10 shadow-2xl shadow-sus/30 !rounded-[24px] text-sm font-black uppercase tracking-widest active:scale-95 transition-all text-left">
          + Cadastrar Novo Paciente
        </Link>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="apple-card p-4 flex items-center gap-4 bg-white/60 backdrop-blur-md focus-within:ring-4 focus-within:ring-sus/10 transition-all border-none shadow-xl !rounded-[32px] text-left">
        <div className="bg-sus/10 p-4 rounded-2xl text-left">
          <span className="text-2xl text-left">🔍</span>
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar por Nome, CPF ou Cartão SUS..." 
          className="bg-transparent flex-1 outline-none text-apple-label font-bold text-base placeholder:text-gray-400 text-left"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA DE PACIENTES */}
      <div className="apple-card border-none shadow-xl !rounded-[40px] overflow-hidden bg-white/80 text-left">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-left">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-apple-secondary text-left">Paciente / Documento</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-apple-secondary text-left">Data de Nasc.</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-apple-secondary text-left">Contato</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-apple-secondary text-right text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center animate-pulse text-apple-secondary font-black text-xs uppercase tracking-widest text-left text-center">Sincronizando base de dados...</td>
                </tr>
              ) : pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id} className="group hover:bg-sus/[0.02] transition-colors cursor-pointer text-left" onClick={() => handleVerDetalhes(paciente)}>
                    <td className="px-8 py-5 text-left text-left">
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-apple-label uppercase tracking-tight group-hover:text-sus transition-colors text-left">{paciente.nome_completo}</span>
                        <span className="text-[10px] text-apple-secondary font-bold mt-1 uppercase tracking-tighter text-left">CPF: {paciente.cpf} | SUS: {paciente.cartao_sus}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-apple-label text-left">
                      {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5 text-left">
                      <span className="text-xs font-black text-apple-label bg-gray-100 px-3 py-1.5 rounded-full text-left">{paciente.contato_emergencia_fone}</span>
                    </td>
                    <td className="px-8 py-5 text-right text-left">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditar(paciente); }} 
                        className="p-3 hover:bg-white hover:shadow-md rounded-[18px] transition-all text-xl text-left"
                      >
                        📝
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center text-apple-secondary text-xs font-black uppercase tracking-widest italic opacity-40 text-left text-center">Nenhum paciente localizado na base FSA</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELO DE CONEXÃO */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white/40 backdrop-blur-sm rounded-full w-fit mx-auto border border-white/50 text-[10px] text-apple-secondary font-black uppercase tracking-[0.2em] shadow-sm text-left">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-green-500/50 shadow-lg text-left"></div>
        Rede Municipal Integrada • Feira de Santana
      </div>

      {/* MODAL PRONTUÁRIO RÁPIDO */}
      {isModalDetalhesOpen && pacienteSelecionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto text-left">
          <div className="bg-white rounded-[50px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20 text-left my-auto">
            <div className="flex justify-between items-start mb-8 text-left">
              <div className="text-left text-left">
                <h2 className="text-3xl font-black text-apple-label uppercase tracking-tighter text-left">Prontuário Rápido</h2>
                <div className="flex items-center gap-2 mt-2 text-left text-left">
                  <span className="text-[10px] font-black bg-sus/10 text-sus px-3 py-1 rounded-full uppercase tracking-widest text-left">{pacienteSelecionado.cartao_sus}</span>
                  {pacienteSelecionado.is_especial && <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase text-left text-left">PCD</span>}
                </div>
              </div>
              <button onClick={() => setIsModalDetalhesOpen(false)} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90 font-bold text-left text-center">✕</button>
            </div>
            
            <div className="space-y-8 text-left">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-5 bg-gray-50 rounded-[28px] text-left">
                  <span className="block text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">Gênero Bio</span>
                  <span className="text-sm font-black text-apple-label uppercase text-left">{pacienteSelecionado.sexo === 'M' ? 'Masculino' : pacienteSelecionado.sexo === 'F' ? 'Feminino' : 'Outro'}</span>
                </div>
                <div className="p-5 bg-gray-50 rounded-[28px] text-left">
                  <span className="block text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest text-left">Deficiência</span>
                  <span className={`text-sm font-black uppercase text-left ${pacienteSelecionado.is_especial ? 'text-red-500' : 'text-apple-label'}`}>
                    {pacienteSelecionado.is_especial ? 'SIM' : 'NÃO'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className={`p-6 rounded-[32px] border-2 transition-all text-left ${pacienteSelecionado.alergias_desc ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-transparent'}`}>
                  <span className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest italic text-left">⚠️ Alergias Críticas</span>
                  <p className="text-sm font-bold text-apple-label leading-tight text-left">{pacienteSelecionado.alergias_desc || 'Nenhuma alergia informada pelo paciente.'}</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-[32px] border border-transparent text-left">
                  <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest italic text-left">🩺 Condições Pré-existentes</span>
                  <p className="text-sm font-bold text-apple-label leading-tight text-left">{pacienteSelecionado.doencas_cronicas_desc || 'Sem histórico de doenças crônicas.'}</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-[32px] border border-transparent text-left">
                  <span className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase mb-2 tracking-widest italic text-left">💊 Farmacoterapia Ativa</span>
                  <p className="text-sm font-bold text-apple-label leading-tight text-left">{pacienteSelecionado.medicacoes_continuas_desc || 'Nenhuma medicação de uso contínuo.'}</p>
                </div>
              </div>

              <div className="p-6 bg-apple-label text-white rounded-[32px] space-y-3 shadow-lg text-left">
                <p className="text-xs font-bold leading-relaxed opacity-90 text-left"><strong className="text-white uppercase text-[9px] opacity-60 block mb-1 text-left">Endereço Residencial:</strong> {pacienteSelecionado.endereco}, {pacienteSelecionado.municipio}</p>
                <div className="pt-2 border-t border-white/10 flex justify-between text-left">
                   <span className="text-[10px] font-black uppercase text-left">Responsável: {pacienteSelecionado.nome_responsavel || 'O Próprio'}</span>
                   <span className="text-xs font-black text-left">{pacienteSelecionado.contato_emergencia_fone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO COMPLETA */}
      {isModalEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[999] flex items-center justify-center p-2 md:p-4 text-left">
          <form onSubmit={handleUpdate} className="bg-white rounded-[40px] md:rounded-[50px] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-left relative">
            
            {/* CABEÇALHO DO MODAL - FIXO */}
            <div className="px-8 py-6 md:px-12 md:py-8 border-b border-gray-100 flex flex-row justify-between items-center bg-white z-20">
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-black text-apple-label uppercase tracking-tighter text-left text-left">Atualizar <span className="text-sus text-left">Registro</span></h2>
                <p className="text-[7px] text-apple-secondary font-bold uppercase tracking-widest mt-1 text-left">ID do Registro: {editData.id}</p>
              </div>
              <button type="button" onClick={() => setIsModalEditOpen(false)} className="w-12 h-12 md:w-14 md:h-14 min-w-[48px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all font-bold text-xl text-center">✕</button>
            </div>

            {/* CORPO DO FORMULÁRIO - SCROLLABLE */}
           <div className="p-8 md:p-12 overflow-y-auto space-y-8 flex-1 text-left">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
    <div className="flex flex-col gap-2 md:col-span-2 text-left">
      <label className={labelStyle}>Nome Completo do Paciente</label>
      <input type="text" value={editData.nome_completo || ""} onChange={(e) => setEditData({...editData, nome_completo: e.target.value})} className={`${inputStyle} text-[16px]`} required />
    </div>
    
    <div className="flex flex-col gap-2 text-left">
      <label className={labelStyle}>CPF</label>
      <input type="text" value={editData.cpf || ""} onChange={(e) => setEditData({...editData, cpf: e.target.value})} className={`${inputStyle} text-[16px]`} required />
    </div>

    <div className="flex flex-col gap-2 text-left">
      <label className={labelStyle}>Cartão Nacional SUS</label>
      <input type="text" value={editData.cartao_sus || ""} onChange={(e) => setEditData({...editData, cartao_sus: e.target.value})} className={`${inputStyle} text-[16px]`} required />
    </div>

    <div className="flex flex-col gap-2 text-left">
      <label className={labelStyle}>Data de Nascimento</label>
      <input type="date" value={editData.data_nascimento || ""} onChange={(e) => setEditData({...editData, data_nascimento: e.target.value})} className={`${inputStyle} text-[16px]`} required />
    </div>

    <div className="flex flex-col gap-2 text-left text-left">
      <label className={labelStyle}>Gênero</label>
      <select value={editData.sexo || ""} onChange={(e) => setEditData({...editData, sexo: e.target.value})} className={`${inputStyle} text-[16px] appearance-none cursor-pointer text-left`} required>
        <option value="">Selecione...</option>
        <option value="M">Masculino</option>
        <option value="F">Feminino</option>
        <option value="O">Outro</option>
      </select>
    </div>

    <div className="flex flex-col gap-2 text-left text-left text-left">
      <label className={labelStyle}>Município</label>
      <input type="text" value={editData.municipio || ""} onChange={(e) => setEditData({...editData, municipio: e.target.value})} className={`${inputStyle} text-[16px]`} />
    </div>

    <div className="flex flex-col gap-2 text-left text-left">
      <label className={labelStyle}>Telefone de Contato</label>
      <input type="text" value={editData.contato_emergencia_fone || ""} onChange={(e) => setEditData({...editData, contato_emergencia_fone: e.target.value})} className={`${inputStyle} text-[16px]`} />
    </div>

    <div className="md:col-span-2 flex flex-col gap-2 text-left text-left">
      <label className={labelStyle}>Endereço Residencial</label>
      <input type="text" value={editData.endereco || ""} onChange={(e) => setEditData({...editData, endereco: e.target.value})} className={`${inputStyle} text-[16px]`} />
    </div>

    <div className="md:col-span-2 flex flex-col gap-2 text-left text-left">
      <label className="text-[10px] font-black uppercase text-orange-600 ml-4 tracking-widest italic text-left">⚠️ Alertas de Alergias</label>
      <textarea value={editData.alergias_desc || ""} onChange={(e) => setEditData({...editData, alergias_desc: e.target.value})} className="w-full px-6 py-4 bg-orange-50/30 border border-orange-100 rounded-[28px] outline-none h-28 text-[16px] font-bold text-apple-label text-left" />
    </div>

    <div className="md:col-span-2 flex flex-col gap-2 text-left text-left">
      <label className="text-[10px] font-black uppercase text-blue-600 ml-4 tracking-widest italic text-left">🩺 Doenças Crônicas & Histórico</label>
      <textarea value={editData.doencas_cronicas_desc || ""} onChange={(e) => setEditData({...editData, doencas_cronicas_desc: e.target.value})} className="w-full px-6 py-4 bg-blue-50/30 border border-blue-100 rounded-[28px] outline-none h-28 text-[16px] font-bold text-apple-label text-left" />
    </div>

    <div className="md:col-span-2 flex flex-col gap-2 text-left text-left">
      <label className="text-[10px] font-black uppercase text-green-600 ml-4 tracking-widest italic text-left text-left">💊 Medicações de Uso Contínuo</label>
      <textarea value={editData.medicacoes_continuas_desc || ""} onChange={(e) => setEditData({...editData, medicacoes_continuas_desc: e.target.value})} className="w-full px-6 py-4 bg-green-50/30 border border-green-100 rounded-[28px] outline-none h-28 text-[16px] font-bold text-apple-label text-left" />
    </div>
  </div>
</div>

            {/* RODAPÉ DO MODAL - FIXO */}
            <div className="px-8 py-6 md:px-12 md:py-8 border-t border-gray-50 bg-white z-20 text-left">
              <button type="submit" disabled={updating} className="w-full py-6 bg-sus text-white font-black rounded-[28px] shadow-2xl shadow-sus/30 hover:shadow-sus/40 hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50 text-sm text-center">
                {updating ? 'Sincronizando com Servidor...' : 'Confirmar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}