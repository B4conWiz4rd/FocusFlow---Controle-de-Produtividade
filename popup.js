document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleFocusBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    const whitelistInput = document.getElementById('whitelistInput');
    const saveBtn = document.getElementById('saveWhitelistBtn');
    const blockCountDisplay = document.getElementById('blockCount');
    const timerDisplay = document.getElementById('timerDisplay');

    let timerInterval;
    let seconds = 0;

    // 1. Carregar estado inicial
    browser.storage.local.get(['isFocusMode', 'whitelist', 'blockedCount', 'startTime'], (data) => {
        updateUI(data.isFocusMode || false);
        whitelistInput.value = (data.whitelist || []).join('\n');
        blockCountDisplay.textContent = data.blockedCount || 0;
        
        // Recuperar timer se o modo estiver ativo
        if (data.isFocusMode && data.startTime) {
            const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
            seconds = elapsed;
            startTimerUI();
        }
    });

    // 2. Alternar Modo Foco
    toggleBtn.addEventListener('click', () => {
        browser.storage.local.get(['isFocusMode'], (data) => {
            const newState = !data.isFocusMode;
            
            const updateData = { isFocusMode: newState };
            
            if (newState) {
                // Iniciou o foco
                updateData.startTime = Date.now();
                startTimerUI();
            } else {
                // Parou o foco
                updateData.startTime = null;
                stopTimerUI();
            }

            browser.storage.local.set(updateData, () => {
                updateUI(newState);
            });
        });
    });

    // 3. Salvar Whitelist
    saveBtn.addEventListener('click', () => {
        const list = whitelistInput.value.split('\n')
            .map(site => site.trim())
            .filter(site => site.length > 0);
        
        browser.storage.local.set({ whitelist: list }, () => {
            saveBtn.textContent = "Salvo!";
            setTimeout(() => saveBtn.textContent = "Salvar Lista", 1000);
        });
    });

    // Funções Auxiliares de UI
    function updateUI(isActive) {
        if (isActive) {
            toggleBtn.textContent = "Desativar Modo Foco";
            toggleBtn.classList.add('active');
            statusText.textContent = "Modo Foco: Ativo";
            statusDot.classList.add('active');
        } else {
            toggleBtn.textContent = "Ativar Modo Foco";
            toggleBtn.classList.remove('active');
            statusText.textContent = "Modo Foco: Inativo";
            statusDot.classList.remove('active');
        }
    }

    function startTimerUI() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimerUI() {
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00";
        seconds = 0;
    }
});