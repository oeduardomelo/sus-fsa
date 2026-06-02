"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';

export default function NovoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Estado para o botão saber que está salvando
  const [formData, setFormData] = useState({
    cartao_sus: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    nome_completo: '',
    sexo: '', // Campo Sexo
    endereco: '',
    municipio: 'Feira de Santana',
    is_especial: false,
    tem_alergia: false,
    alergias_desc: '',
    tem_doenca: false,
    doencas_desc: '',
    toma_remedio: false,
    remedios_desc: '',
    nome_responsavel: '',
    contato_emergencia: ''
  });

  const [isMenor, setIsMenor] = useState(false);

  // Lógica para verificar se é menor de idade (18 anos)
  useEffect(() => {
    if (formData.data_nascimento) {
      const hoje = new Date();
      const nascimento = new Date(formData.data_nascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      setIsMenor(idade < 18);
    }
  }, [formData.data_nascimento]);

  // FUNÇÃO QUE REALMENTE ENVIA PARA O SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('pacientes')
        .insert([
          {
            nome_completo: formData.nome_completo,
            sexo: formData.sexo,
            cpf: formData.cpf,
            cartao_sus: formData.cartao_sus,
            rg: formData.rg,
            data_nascimento: formData.data_nascimento,
            endereco: formData.endereco,
            municipio: formData.municipio,
            is_especial: formData.is_especial,
            nome_responsavel: (isMenor || formData.is_especial) ? formData.nome_responsavel : null,
            contato_emergencia_fone: formData.contato_emergencia,
            alergias_desc: formData.tem_alergia ? formData.alergias_desc : null,
            doencas_cronicas_desc: formData.tem_doenca ? formData.doencas_desc : null,
            medicacoes_continuas_desc: formData.toma_remedio ? formData.remedios_desc : null,
          }
        ]);

      if (error) throw error;

      alert("✅ Paciente registrado com sucesso!");
      router.push('/dashboard/pacientes'); 
    } catch (err) {
      alert("❌ Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar máscaras com limite de caracteres
  const handleMask = (e, type) => {
    const { name } = e.target;
    let val = e.target.value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      if (val.length > 11) val = val.slice(0, 11); 
      val = val.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else if (type === 'sus') {
      if (val.length > 15) val = val.slice(0, 15); 
      val = val.replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2');
    } else if (type === 'tel') {
      if (val.length > 11) val = val.slice(0, 11); 
      val = val.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    setFormData({ ...formData, [name]: val });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'rg' && value.length > 12) return;

    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const precisaResponsavel = isMenor || formData.is_especial;

  const labelStyle = "text-[11px] font-black uppercase tracking-wider text-apple-secondary ml-1 mb-1";
  const inputStyle = "w-full px-5 h-14 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-sus/10 focus:border-sus/50 text-apple-label placeholder:text-gray-400 font-medium";

  return (
    <div className="min-h-screen bg-none pb-10">
      <div className="max-w-5xl mx-auto pt-0 md:pt-12 px-4 md:px-6">
        
        <nav className="mb-3">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-apple-secondary hover:text-apple-label transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 active:scale-95"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Voltar
          </button>
        </nav>

        <header className="mb-14 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sus/10 text-sus text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sus animate-pulse"></span> Sistema de Gestão de Saúde
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-apple-label mb-4">
            Novo <span className="text-sus">Paciente</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl leading-relaxed">
            Certifique-se de preencher todos os campos obrigatórios. O sistema validará automaticamente a necessidade de um responsável legal.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <section className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-sus text-white flex items-center justify-center font-black shadow-lg shadow-sus/20">01</div>
              <h2 className="text-sm font-black uppercase tracking-widest text-apple-label">Documentação Civil</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Cartão SUS', name: 'cartao_sus', mask: 'sus', placeholder: '000 0000 0000 0000', max: 18 },
                { label: 'CPF', name: 'cpf', mask: 'cpf', placeholder: '000.000.000-00', max: 14 },
                { label: 'RG / Identidade', name: 'rg', mask: null, placeholder: 'Dígitos apenas', max: 12 },
                { label: 'Data de Nasc.', name: 'data_nascimento', type: 'date' }
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className={labelStyle}>{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type || "text"}
                    maxLength={field.max}
                    value={formData[field.name]}
                    onChange={(e) => field.mask ? handleMask(e, field.mask) : handleChange(e)}
                    placeholder={field.placeholder}
                    className={inputStyle}
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-sus text-white flex items-center justify-center font-black shadow-lg shadow-sus/20">02</div>
              <h2 className="text-sm font-black uppercase tracking-widest text-apple-label">Informações Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-3 flex flex-col">
                <label className={labelStyle}>Nome Completo do Paciente</label>
                <input name="nome_completo" type="text" value={formData.nome_completo} onChange={handleChange} placeholder='Nome Completo' className={inputStyle} required />
              </div>

              <div className="md:col-span-1 flex flex-col">
                <label className={labelStyle}>Sexo</label>
                <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputStyle} required>
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <label className={labelStyle}>Município</label>
                <input name="municipio" type="text" value={formData.municipio} placeholder='Feira de Santana' readOnly className={`${inputStyle} bg-gray-100/50 cursor-not-allowed border-transparent`} />
              </div>

              <div className="md:col-span-6 flex flex-col">
                <label className={labelStyle}>Endereço Residencial Atual</label>
                <input name="endereco" type="text" value={formData.endereco} onChange={handleChange} placeholder="Rua, Número, Bairro e Ponto de Referência" className={inputStyle} required />
              </div>
              
              <div className="md:col-span-6">
                <label className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${formData.is_especial ? 'border-sus bg-sus/5 shadow-inner' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_especial ? 'bg-sus border-sus' : 'bg-white border-gray-300'}`}>
                      {formData.is_especial && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <input name="is_especial" type="checkbox" checked={formData.is_especial} onChange={handleChange} className="hidden" />
                    <span className="text-sm font-bold text-apple-label uppercase tracking-tight">Paciente com Deficiência ou Especial</span>
                  </div>
                  {formData.is_especial && <span className="text-[10px] font-black text-sus tracking-[0.2em] animate-pulse">ATIVADO</span>}
                </label>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white rounded-[48px] p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Triagem Rápida
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Possui Alergias?', check: 'tem_alergia', desc: 'alergias_desc' },
                  { label: 'Doença Crônica?', check: 'tem_doenca', desc: 'doencas_desc' },
                  { label: 'Toma Medicação?', check: 'toma_remedio', desc: 'remedios_desc' }
                ].map((item) => (
                  <div key={item.check} className={`p-4 rounded-3xl transition-all duration-300 ${formData[item.check] ? 'bg-orange-50/50 border border-orange-100 shadow-sm' : 'bg-gray-50/50 border border-transparent'}`}>
                    <label className="flex items-center gap-3 text-xs font-black text-apple-label cursor-pointer uppercase py-1">
                      <input name={item.check} type="checkbox" checked={formData[item.check]} onChange={handleChange} className="w-5 h-5 accent-orange-500 rounded-lg" /> 
                      {item.label}
                    </label>
                    {formData[item.check] && (
                      <div className="mt-4 animate-in zoom-in-95 duration-200">
                        <input 
                          name={item.desc} 
                          type="text" 
                          value={formData[item.desc]} 
                          onChange={handleChange} 
                          placeholder="Detalhes..." 
                          className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 text-[16px] font-medium"
                          required={formData[item.check]} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-[48px] p-8 md:p-10 shadow-sm border-2 transition-all duration-500 ${precisaResponsavel ? 'bg-red-50/40 border-red-100 shadow-md' : 'bg-white border-gray-100'}`}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Segurança & Contato
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <label className={labelStyle}>Contato</label>
                  <input 
                    name="contato_emergencia" 
                    type="text" 
                    value={formData.contato_emergencia} 
                    onChange={(e) => handleMask(e, 'tel')} 
                    placeholder="(75) 00000-0000" 
                    className={inputStyle} 
                    required 
                  />
                </div>

                {precisaResponsavel && (
                  <div className="flex flex-col animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[11px] font-black uppercase text-red-500 ml-1 mb-1">Responsável Legal (Obrigatório)</label>
                    <input 
                      name="nome_responsavel" 
                      type="text" 
                      value={formData.nome_responsavel} 
                      onChange={handleChange} 
                      placeholder="Nome completo do responsável" 
                      className={`${inputStyle} border-red-200 focus:ring-red-500/10 focus:border-red-400`}
                      required={precisaResponsavel} 
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="pt-10 flex flex-col md:flex-row-reverse gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-6 bg-sus hover:bg-sus/90 text-white text-xl font-black rounded-[32px] shadow-xl shadow-sus/30 transition-all hover:-translate-y-1 active:scale-[0.98] uppercase tracking-tighter disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Finalizar Registro'}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-12 py-6 bg-white text-apple-label font-black rounded-[32px] border-2 border-gray-200 hover:bg-gray-50 transition-all uppercase text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}