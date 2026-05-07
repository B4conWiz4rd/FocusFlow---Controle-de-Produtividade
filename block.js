document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const originalUrl = params.get('url');
    const continueBtn = document.getElementById('continueBtn');
    const countdownSpan = document.getElementById('countdown');
    const titleEl = document.getElementById('dynamicTitle');
    const msgEl = document.getElementById('dynamicMessage');

    // 1. Combate à Habituação: Mensagens Dinâmicas
    const interventions = [
        { title: "Respire fundo...", msg: "O seu objetivo principal é mais importante que este clique." },
        { title: "Cuidado com o piloto automático!", msg: "Você está prestes a quebrar um ciclo de foco." },
        { title: "Lembre-se do porquê...", msg: "Por que você ativou o Modo Foco?" },
        { title: "Micro-pausa sugerida", msg: "Que tal alongar as costas por 30 segundos em vez de navegar?" }
    ];

    // Escolhe uma mensagem aleatória
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

    // Botão Continuar
    continueBtn.addEventListener('click', () => {
        if (originalUrl) {
            window.location.href = originalUrl;
        }
    });

    // Botão Voltar (Fecha a aba ou vai para uma página em branco)
    document.getElementById('closeTabBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.close(); // Funciona na maioria dos casos se aberto via popup/script
        // Alternativa se window.close não funcionar: window.location.href = "about:blank";
    });
});