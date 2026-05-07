document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const originalUrl = params.get('url');
    const tabId = params.get('tabId'); // Pega o ID da aba que veio na URL
    const continueBtn = document.getElementById('continueBtn');
    const countdownSpan = document.getElementById('countdown');
    const titleEl = document.getElementById('dynamicTitle');
    const msgEl = document.getElementById('dynamicMessage');

    // 1. Mensagens Dinâmicas (Combate à Habituação)
    const interventions = [
        { title: "Respire fundo...", msg: "O seu objetivo principal é mais importante que este clique." },
        { title: "Cuidado com o piloto automático!", msg: "Você está prestes a quebrar um ciclo de foco." },
        { title: "Lembre-se do porquê...", msg: "Por que você ativou o Modo Foco?" },
        { title: "Micro-pausa sugerida", msg: "Que tal alongar as costas por 30 segundos em vez de navegar?" }
    ];

    const randomIntervention = interventions[Math.floor(Math.random() * interventions.length)];
    titleEl.textContent = randomIntervention.title;
    msgEl.textContent = randomIntervention.msg;

    // 2. Mecanismo de Atrito: Delay de 5 segundos
    let timeLeft = 5;
    
    const timer = setInterval(() => {
        timeLeft--;
        countdownSpan.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            continueBtn.disabled = false;
            continueBtn.textContent = "Acessar Site (Ciente do risco)";
        }
    }, 1000);

    // Botão Continuar - Lógica CORRIGIDA
    continueBtn.addEventListener('click', () => {
        if (originalUrl && tabId) {
            // 1. Envia mensagem para o background avisar que vamos pular o bloqueio
            browser.runtime.sendMessage({
                action: "allowOverride",
                url: originalUrl,
                tabId: parseInt(tabId)
            }, (response) => {
                // 2. Só redireciona após receber confirmação (ou logo em seguida)
                if (browser.runtime.lastError) {
                    console.log("Erro ao comunicar com background:", browser.runtime.lastError);
                }
                window.location.href = originalUrl;
            });
        }
    });

    // Botão Voltar
    document.getElementById('closeTabBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.close();
        // Alternativa se close não funcionar:
        window.location.href = "about:blank";
    });
});