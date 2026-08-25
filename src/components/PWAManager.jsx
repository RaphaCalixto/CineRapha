import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Sparkles } from 'lucide-react';

export default function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            setSwRegistration(registration);
            console.log('[PWA] Service Worker registrado com sucesso!');

            setInterval(() => {
              registration.update();
            }, 30 * 60 * 1000);

            if (registration.waiting) {
              setUpdateAvailable(true);
            }

            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                });
              }
            });
          })
          .catch((err) => console.log('[PWA] Erro ao registrar Service Worker:', err));
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Aplicativo CineRapha instalado com sucesso!');
      }
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    });
  };

  const handleApplyUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {showInstallBtn && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce-slow">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-[#E50914] to-[#B20710] hover:from-[#f6121d] hover:to-[#c80812] text-white text-xs font-black px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl shadow-[#E50914]/40 border border-red-500/40 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4 text-white animate-pulse" />
            <span>Instalar App CineRapha</span>
          </button>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#121212]/95 backdrop-blur-2xl border border-[#E50914]/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(229,9,20,0.3)] animate-scale-up text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#E50914]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white leading-tight">
                Nova Atualização Disponível!
              </h4>
              <p className="text-xs text-neutral-300 font-medium mt-0.5">
                Uma nova versão do CineRapha foi instalada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplyUpdate}
              className="bg-[#E50914] hover:bg-[#b80710] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="text-neutral-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}