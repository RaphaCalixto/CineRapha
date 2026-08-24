import React, { useState, useEffect } from 'react';
import { X, Folder, Key, RefreshCw, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ onClose, onScanTriggered }) {
  const [directories, setDirectories] = useState(['E:\\']);
  const [newDir, setNewDir] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [autoScan, setAutoScan] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.scanDirectories) setDirectories(data.scanDirectories);
        if (data.tmdbApiKey !== undefined) setApiKey(data.tmdbApiKey);
        if (data.autoScan !== undefined) setAutoScan(data.autoScan);
      })
      .catch((err) => console.error('Erro ao carregar configurações:', err));
  }, []);

  const handleAddDirectory = () => {
    if (newDir.trim() && !directories.includes(newDir.trim())) {
      setDirectories([...directories, newDir.trim()]);
      setNewDir('');
    }
  };

  const handleRemoveDirectory = (index) => {
    setDirectories(directories.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanDirectories: directories,
          tmdbApiKey: apiKey,
          autoScan: autoScan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#E50914]" />
            Configurações da Biblioteca Local
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section: Scan Directories */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Pastas Monitoradas (Onde estão seus filmes)
            </label>
            <p className="text-xs text-neutral-400 mb-3">
              O app irá varrer automaticamente estas pastas em busca de vídeos e capas.
            </p>

            <div className="space-y-2 mb-3">
              {directories.map((dir, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-sm font-mono text-neutral-200"
                >
                  <span className="truncate">{dir}</span>
                  {directories.length > 1 && (
                    <button
                      onClick={() => handleRemoveDirectory(idx)}
                      className="text-neutral-500 hover:text-[#E50914] p-1 transition-colors"
                      title="Remover pasta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Exemplo: E:\ ou D:\Filmes"
                value={newDir}
                onChange={(e) => setNewDir(e.target.value)}
                className="flex-1 bg-black/60 border border-white/15 focus:border-[#E50914] text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
              />
              <button
                onClick={handleAddDirectory}
                className="btn-secondary text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Section: TMDB API Key */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#f5c518]" />
              Chave de API do TMDB (Opcional)
            </label>
            <p className="text-xs text-neutral-400 mb-2">
              Por padrão, o app já inclui uma chave de demonstração. Você pode inserir sua própria chave da API v3 do TMDB se preferir.
            </p>
            <input
              type="text"
              placeholder="Cole sua TMDB API Key aqui..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-black/60 border border-white/15 focus:border-[#E50914] text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
            />
          </div>

          {/* Section: Auto Scan Toggle */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
            <div>
              <span className="text-sm font-bold text-white block">Auto-Detecção em Tempo Real (Watcher)</span>
              <span className="text-xs text-neutral-400">
                Escanear automaticamente ao adicionar novas pastas/filmes no disco
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              className="w-5 h-5 accent-[#E50914] cursor-pointer"
            />
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => {
                onScanTriggered();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-[#E50914]" />
              <span>Forçar Re-escaneamento</span>
            </button>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Salvo!
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
