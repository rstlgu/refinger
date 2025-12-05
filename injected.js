// Script iniettato nel main world per intercettare le risposte API di Chainalysis

(function() {
  'use strict';
  
  if (window.__btcFingerprintInjected) return;
  window.__btcFingerprintInjected = true;
  if (typeof window.__btcFingerprintEnabled === 'undefined') {
    window.__btcFingerprintEnabled = true;
  }
  
  console.log('[BTC Fingerprint] 🚀 Main world script loaded');
  
  // Estrai indirizzo wallet dall'URL
  function extractWalletAddress(url) {
    const match = url.match(/\/cluster\/[^/]+\/([^/]+)/);
    return match ? match[1] : null;
  }
  
  // Filtra solo transazioni in uscita (valueFp negativo)
  function filterOutgoingTransactions(data, walletAddress) {
    return data.filter(tx => {
      // Le transazioni in uscita hanno valueFp negativo
      const value = parseFloat(tx.valueFp);
      return value < 0;
    });
  }
  
  // Intercetta fetch
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const response = await originalFetch.apply(this, arguments);
    
    const urlString = (typeof url === 'string' ? url : url?.url) || '';
    
    // Intercetta solo le richieste /transfers per Bitcoin
    if (urlString.includes('/transfers') && urlString.includes('bip122:000000000019d6689c085ae165831e93')) {
      if (!window.__btcFingerprintEnabled) return response;
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        if (Array.isArray(data) && data.length > 0 && data[0].hash) {
          const walletAddress = extractWalletAddress(urlString);
          
          // Filtra solo transazioni in uscita
          const outgoingTx = filterOutgoingTransactions(data);
          
          console.log('[BTC Fingerprint] ✅ Transazioni totali:', data.length, '| In uscita:', outgoingTx.length);
          
          if (outgoingTx.length > 0) {
            window.postMessage({
              type: 'BTC_FINGERPRINT_TRANSFERS',
              data: outgoingTx,
              walletAddress: walletAddress,
              totalTransactions: data.length
            }, '*');
          }
        }
      } catch (e) {
        console.error('[BTC Fingerprint] Errore parsing fetch:', e);
      }
    }
    
    return response;
  };
  
  // Intercetta XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._btcFpUrl = url;
    return originalXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    xhr.addEventListener('load', function() {
      const urlString = xhr._btcFpUrl?.toString() || '';
      
      if (urlString.includes('/transfers') && urlString.includes('bip122:000000000019d6689c085ae165831e93')) {
        if (!window.__btcFingerprintEnabled) return;
        try {
          const data = JSON.parse(xhr.responseText);
          
          if (Array.isArray(data) && data.length > 0 && data[0].hash) {
            const walletAddress = extractWalletAddress(urlString);
            
            // Filtra solo transazioni in uscita
            const outgoingTx = filterOutgoingTransactions(data);
            
            console.log('[BTC Fingerprint] ✅ Transazioni totali:', data.length, '| In uscita:', outgoingTx.length);
            
            if (outgoingTx.length > 0) {
              window.postMessage({
                type: 'BTC_FINGERPRINT_TRANSFERS',
                data: outgoingTx,
                walletAddress: walletAddress,
                totalTransactions: data.length
              }, '*');
            }
          }
        } catch (e) {
          console.error('[BTC Fingerprint] Errore parsing XHR:', e);
        }
      }
    });
    
    return originalXHRSend.apply(this, arguments);
  };
  
  console.log('[BTC Fingerprint] 🔧 API interception ready');
})();
