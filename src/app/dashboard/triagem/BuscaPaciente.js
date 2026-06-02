"use client"
import { useState } from 'react';

export default function BuscaPaciente({ onSelectPaciente }) {
  const [cpf, setCpf] = useState('');

  const buscar = async () => {
    // Aqui você faria a chamada ao seu banco (Supabase/API)
    // Exemplo de lógica:
    console.log("Buscando histórico do CPF:", cpf);
  };

  return (
    <div className="apple-card p-6 flex flex-col md:flex-row items-end gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-xs font-bold text-apple-secondary ml-4 uppercase">Identificar Paciente (CPF)</label>
        <input 
          type="text" 
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00" 
          className="apple-input" 
        />
      </div>
      <button onClick={buscar} className="btn-sus !h-[58px] px-8">
        Verificar Histórico
      </button>
    </div>
  );
}