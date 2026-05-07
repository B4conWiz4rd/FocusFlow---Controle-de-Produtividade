// Cache temporário para permitir bypass (Passe Temporário)
// Estrutura: { [tabId]: "url_liberada" }
const bypassCache = {};

// Função para verificar se a URL está na whitelist ou é segura
function isAllowed(url, whitelist, tabId) {
    // 1. Permite páginas internas do navegador
    if (url.startsWith("about:") || url.startsWith("chrome://") || url.startsWith("edge://")) {
        return true;
    }

    // 2. Permite arquivos DA PRÓPRIA EXTENSÃO
    if (url.includes("moz-extension") || url.includes("chrome-extension")) {
        return true;
    }

    // 3. Verifica se está no Cache de Bypass (O usuário clicou em "Continuar")
    // Se a URL atual bater com a URL que foi liberada para essa aba, permite e limpa o cache
    if (bypassCache[tabId] && bypassCache[tabId] === url) {
        delete bypassCache[tabId]; // Remove o passe após usar (uso único)
        return true;
    }

    // 4. Verifica a Whitelist do usuário
    try {
        const hostname = new URL(url).hostname;
        
        if (!whitelist || whitelist.length === 0) {
            return false;
        }

        return whitelist.some(site => {
            const cleanSite = site.replace(/^www\./, "");
            const cleanHost = hostname.replace(/^www\./, "");
            return cleanHost.includes(cleanSite) || cleanSite.includes(cleanHost);
        });

    } catch (e) {
        return true;
    }
}

// Escutar mensagens vindas do block.js (quando o usuário clica em continuar)
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "allowOverride") {
        // Guarda a URL liberada para o ID da aba específica
        bypassCache[request.tabId] = request.url;
    }
});

browser.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return;

    const { isFocusMode, whitelist } = await browser.storage.local.get(['isFocusMode', 'whitelist']);

    if (!isFocusMode) return;

    // Verifica se é permitido (passando o tabId agora)
    if (!isAllowed(details.url, whitelist, details.tabId)) {
        
        // 1. Registrar log
        const today = new Date().toLocaleDateString();
        browser.storage.local.get(['blockedCount', 'dailyStats'], (data) => {
            const newCount = (data.blockedCount || 0) + 1;
            const stats = data.dailyStats || {};
            stats[today] = (stats[today] || 0) + 1;
            browser.storage.local.set({ blockedCount: newCount, dailyStats: stats });
        });

        // 2. Redirecionar para a página de bloqueio
        // IMPORTANTE: Agora passamos o tabId na URL para sabermos quem é quem depois
        const blockUrl = browser.runtime.getURL('block.html') + 
                         `?url=${encodeURIComponent(details.url)}&tabId=${details.tabId}`;
        
        browser.tabs.update(details.tabId, { url: blockUrl });
    }
});