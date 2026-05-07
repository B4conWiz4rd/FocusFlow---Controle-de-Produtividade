// Função para verificar se a URL está na whitelist
function isAllowed(url, whitelist) {
    try {
        const hostname = new URL(url).hostname;
        // Permitir acesso à página de bloqueio da própria extensão
        if (hostname.includes("moz-extension") || hostname.includes("chrome-extension")) return true;
        // Permitir páginas internas do navegador
        if (url.startsWith("about:") || url.startsWith("chrome://")) return true;

        return whitelist.some(site => hostname.includes(site));
    } catch (e) {
        return true; // Se falhar ao ler URL, permite para evitar erros
    }
}

// Escutar eventos de navegação
browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Ignorar iframes e sub-recursos, focar apenas na aba principal
    if (details.frameId !== 0) return;

    const { isFocusMode, whitelist } = await browser.storage.local.get(['isFocusMode', 'whitelist']);

    // Se o modo foco NÃO estiver ativo, não faz nada (tudo liberado)
    if (!isFocusMode) return;

    // Se a whitelist estiver vazia, bloqueia tudo (ou define uma padrão se preferir)
    const safeWhitelist = whitelist || [];

    if (!isAllowed(details.url, safeWhitelist)) {
        // SITE BLOQUEADO
        
        // 1. Registrar log (Parâmetro de Resultados)
        const today = new Date().toLocaleDateString();
        browser.storage.local.get(['blockedCount', 'dailyStats'], (data) => {
            const newCount = (data.blockedCount || 0) + 1;
            const stats = data.dailyStats || {};
            stats[today] = (stats[today] || 0) + 1;
            
            browser.storage.local.set({
                blockedCount: newCount,
                dailyStats: stats
            });
        });

        // 2. Redirecionar para a página de bloqueio com Atrito
        // Passamos a URL original como parâmetro para permitir o "Continuar" depois do delay
        const blockUrl = browser.runtime.getURL('block.html') + `?url=${encodeURIComponent(details.url)}`;
        
        browser.tabs.update(details.tabId, { url: blockUrl });
    }
});