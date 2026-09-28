class CogniFlowEngine {
    constructor() {
        this.DOM = {
            screens: { home: document.getElementById('screen-home'), simulasi: document.getElementById('screen-simulasi'), practice: document.getElementById('screen-practice'), quiz: document.getElementById('screen-quiz'), result: document.getElementById('screen-result') },
            navItems: { home: document.getElementById('nav-home'), simulasi: document.getElementById('nav-simulasi'), practice: document.getElementById('nav-practice') },
            mainNav: document.getElementById('main-nav'),
            buttons: { startDaily: document.getElementById('btn-start-daily'), testSeries: document.getElementById('btn-test-series'), testSyl: document.getElementById('btn-test-syllogism'), pracSeries: document.getElementById('btn-prac-series'), pracSyl: document.getElementById('btn-prac-syllogism'), home: document.getElementById('btn-home'), nextPractice: document.getElementById('btn-next-practice'), exitQuiz: document.getElementById('btn-exit-quiz'), cancelExit: document.getElementById('btn-cancel-exit'), confirmExit: document.getElementById('btn-confirm-exit') },
            quiz: { questionContainer: document.getElementById('question-container'), optionsContainer: document.getElementById('options-container'), timerDisplay: document.getElementById('timer-display'), levelIndicator: document.getElementById('level-indicator'), explanationContainer: document.getElementById('explanation-container'), explanationText: document.getElementById('explanation-text') },
            stats: { deretAcc: document.getElementById('stat-deret-acc'), deretTime: document.getElementById('stat-deret-time'), sylAcc: document.getElementById('stat-syl-acc'), sylTime: document.getElementById('stat-syl-time'), streak: document.getElementById('streak-display'), diagText: document.getElementById('diag-text'), diagCard: document.getElementById('diagnostic-card') },
            result: { summary: document.getElementById('result-summary'), reviewContainer: document.getElementById('review-container'), reviewList: document.getElementById('review-list') },
            modal: { exit: document.getElementById('exit-modal') }
        };

        this.state = { mode: null, subType: null, questionPool: [], usedQuestionIds: new Set(), currentQuestion: null, targetDifficulty: 2, questionStartTime: 0, questionsAnswered: 0, maxQuestions: 5, correctAnswers: 0, sessionTimeLeft: 900, timerInterval: null, sessionHistory: [] };
        
        this.userStats = { streakDays: 0, lastPlayedDate: null, series: { correct: 0, answered: 0, time: 0 }, syllogism: { correct: 0, answered: 0, time: 0 } };
        this.audioCtx = null;
    }

    init() { 
        this.loadLocalStorage(); 
        this.updateDashboardUI(); 
        this.attachEventListeners(); 
        console.log("CogniFlow Engine v3.1 [Router Fixed] Ready.");
    }

    loadLocalStorage() { const saved = localStorage.getItem('cogniflow_stats_v2'); if (saved) { this.userStats = JSON.parse(saved); } else { this.saveLocalStorage(); } }
    saveLocalStorage() { localStorage.setItem('cogniflow_stats_v2', JSON.stringify(this.userStats)); }

    updateDashboardUI() {
        if(!this.DOM.stats.deretAcc) return;
        this.DOM.stats.streak.textContent = `🔥 ${this.userStats.streakDays} Hari Streak Aktif`;
        
        const s = this.userStats.series;
        const syl = this.userStats.syllogism;
        
        const deretAcc = s.answered === 0 ? 0 : Math.round((s.correct / s.answered) * 100);
        const deretTime = s.answered === 0 ? 0 : Math.round(s.time / s.answered);
        
        const sylAcc = syl.answered === 0 ? 0 : Math.round((syl.correct / syl.answered) * 100);
        const sylTime = syl.answered === 0 ? 0 : Math.round(syl.time / syl.answered);

        this.DOM.stats.deretAcc.textContent = `${deretAcc}%`;
        this.DOM.stats.deretTime.textContent = `${deretTime}s`;
        this.DOM.stats.sylAcc.textContent = `${sylAcc}%`;
        this.DOM.stats.sylTime.textContent = `${sylTime}s`;

        if (s.answered > 0 || syl.answered > 0) {
            if (syl.answered > 0 && (sylAcc < deretAcc || s.answered === 0)) {
                this.DOM.stats.diagText.innerHTML = `Akurasi Silogisme Anda (${sylAcc}%) perlu ditingkatkan. Disarankan mengulang <strong>Latihan Silogisme</strong>.`;
                this.DOM.stats.diagCard.style.borderLeftColor = 'var(--error)';
            } else {
                this.DOM.stats.diagText.innerHTML = `Akurasi Deret Bilangan (${deretAcc}%) lebih rendah. Disarankan memperbanyak <strong>Latihan Deret Bilangan</strong>.`;
                this.DOM.stats.diagCard.style.borderLeftColor = 'var(--accent)';
            }
        }
    }

    checkDailyStreak() {
        const today = new Date().toDateString();
        if (this.userStats.lastPlayedDate !== today) {
            const lastPlayed = new Date(this.userStats.lastPlayedDate);
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            if (lastPlayed.toDateString() === yesterday.toDateString()) { this.userStats.streakDays++; } 
            else if (this.userStats.lastPlayedDate !== null) { this.userStats.streakDays = 1; } 
            else { this.userStats.streakDays = 1; }
            this.userStats.lastPlayedDate = today;
        }
    }

    initAudio() { if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (this.audioCtx.state === 'suspended') this.audioCtx.resume(); }
    
    playFeedback(isCorrect) {
        try {
            this.initAudio();
            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain); gain.connect(this.audioCtx.destination);
            
            if (isCorrect) {
                const osc2 = this.audioCtx.createOscillator(); osc2.connect(gain);
                osc.type = 'sine'; osc2.type = 'sine';
                osc.frequency.setValueAtTime(587.33, t); osc2.frequency.setValueAtTime(880.00, t); 
                gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                osc.start(t); osc2.start(t); osc.stop(t + 0.5); osc2.stop(t + 0.5);
                if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
            } else {
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t);
                gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                osc.start(t); osc.stop(t + 0.4);
                if (navigator.vibrate) navigator.vibrate(200);
            }
        } catch(e) { console.warn("Audio/Haptic not supported or blocked"); }
    }

    // --- PERBAIKAN ROUTER (BUG FIX) ---
    switchTab(tabId) {
        Object.values(this.DOM.navItems).forEach(item => item.classList.remove('active'));
        if (this.DOM.navItems[tabId]) this.DOM.navItems[tabId].classList.add('active');
        this.navigate(tabId); // Perbaikan: menggunakan bare key
    }

    navigate(screenId) {
        Object.values(this.DOM.screens).forEach(screen => { if (screen) screen.classList.remove('active'); });
        if(this.DOM.screens[screenId]) this.DOM.screens[screenId].classList.add('active');
        this.DOM.mainNav.style.display = (screenId === 'quiz' || screenId === 'result') ? 'none' : 'flex';
    }

    attachEventListeners() {
        this.DOM.navItems.home.addEventListener('click', () => this.switchTab('home'));
        this.DOM.navItems.simulasi.addEventListener('click', () => this.switchTab('simulasi'));
        this.DOM.navItems.practice.addEventListener('click', () => this.switchTab('practice'));

        this.DOM.buttons.startDaily.addEventListener('click', () => this.startSession('assessment', 'mix'));
        this.DOM.buttons.testSeries.addEventListener('click', () => this.startSession('assessment', 'series'));
        this.DOM.buttons.testSyl.addEventListener('click', () => this.startSession('assessment', 'syllogism'));
        this.DOM.buttons.pracSeries.addEventListener('click', () => this.startSession('practice', 'series'));
        this.DOM.buttons.pracSyl.addEventListener('click', () => this.startSession('practice', 'syllogism'));
        
        this.DOM.buttons.exitQuiz.addEventListener('click', () => this.DOM.modal.exit.style.display = 'flex');
        this.DOM.buttons.cancelExit.addEventListener('click', () => this.DOM.modal.exit.style.display = 'none');
        this.DOM.buttons.confirmExit.addEventListener('click', () => {
            this.DOM.modal.exit.style.display = 'none'; clearInterval(this.state.timerInterval); this.switchTab('home');
        });
        this.DOM.buttons.home.addEventListener('click', () => { this.updateDashboardUI(); this.switchTab('home'); });
        
        this.DOM.buttons.nextPractice.addEventListener('click', () => { 
            this.DOM.quiz.explanationContainer.style.display = 'none'; 
            this.prepareNextQuestion(); 
        });
    }

    startSession(mode, subType) {
        this.state.mode = mode; this.state.subType = subType;
        
        let db = window.globalQuestionDatabase || [];
        if (db.length === 0) {
            alert("⚠️ SAFE MODE: File TXT gagal dimuat. Menggunakan Data Cadangan.");
            db = getSafeModeData();
        }

        this.state.questionPool = db.filter(q => q.pool === mode && (subType === 'mix' || q.type === subType));
        if(this.state.questionPool.length === 0) return alert(`Sistem: Bank soal belum tersedia untuk modul ini.`);
        
        this.state.usedQuestionIds.clear(); this.state.questionsAnswered = 0; this.state.correctAnswers = 0;
        this.state.targetDifficulty = 2; this.state.maxQuestions = (mode === 'assessment') ? 5 : 3; 
        this.state.sessionHistory = []; 
        
        if (mode === 'assessment') { 
            this.DOM.quiz.timerDisplay.textContent = '15:00';
            this.startTimer(); 
        } else { 
            this.DOM.quiz.timerDisplay.textContent = '∞';
        }

        this.navigate('quiz'); // Perbaikan: menggunakan bare key
        this.prepareNextQuestion();
    }

    prepareNextQuestion() {
        if (this.state.questionsAnswered >= this.state.maxQuestions) return this.endSession();
        let available = this.state.questionPool.filter(q => !this.state.usedQuestionIds.has(q.id) && q.difficulty === this.state.targetDifficulty);
        if (available.length === 0) available = this.state.questionPool.filter(q => !this.state.usedQuestionIds.has(q.id));
        if (available.length === 0) return this.endSession();

        this.state.currentQuestion = available[Math.floor(Math.random() * available.length)];
        this.state.usedQuestionIds.add(this.state.currentQuestion.id);
        this.renderQuestionData();
    }

    renderQuestionData() {
        const q = this.state.currentQuestion;
        this.DOM.quiz.levelIndicator.textContent = `Level Kesulitan: ${q.difficulty}`;
        this.state.questionStartTime = Date.now();
        this.DOM.quiz.explanationContainer.style.display = 'none';

        this.DOM.quiz.questionContainer.innerHTML = q.type === 'series' 
            ? `<div style="font-weight:600; margin-bottom:10px;">Analisis Pola Deret Berikut:</div><div style="font-size:1.5rem; letter-spacing:4px; font-weight:700; color:var(--accent);">${q.content.sequence.join(' , ')}</div>`
            : `<div style="font-weight:600; margin-bottom:10px;">Tarik kesimpulan dari premis berikut:</div><ul style="padding-left:20px; color:var(--text-muted);">${q.content.premises.map(p => `<li style="margin-bottom:6px;">${p}</li>`).join('')}</ul>`;

        this.DOM.quiz.optionsContainer.innerHTML = '';
        q.content.options.forEach(opt => {
            const btn = document.createElement('button'); btn.className = 'option-btn'; btn.textContent = opt;
            btn.addEventListener('click', (e) => this.handleAnswer(opt, e.target));
            this.DOM.quiz.optionsContainer.appendChild(btn);
        });
    }

    handleAnswer(selectedOpt, btnElement) {
        const q = this.state.currentQuestion;
        const isCorrect = (selectedOpt.trim() === q.correctAnswer.trim());
        const timeTaken = (Date.now() - this.state.questionStartTime) / 1000;
        
        this.playFeedback(isCorrect); 

        const allBtns = this.DOM.quiz.optionsContainer.querySelectorAll('button');
        allBtns.forEach(btn => btn.disabled = true);
        
        btnElement.style.backgroundColor = isCorrect ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)';
        btnElement.style.borderColor = isCorrect ? 'var(--success)' : 'var(--error)';
        btnElement.style.color = isCorrect ? 'var(--success)' : 'var(--error)';

        if (isCorrect) this.state.correctAnswers++;
        this.state.questionsAnswered++;
        
        const typeStat = q.type === 'series' ? this.userStats.series : this.userStats.syllogism;
        typeStat.answered++;
        if (isCorrect) typeStat.correct++;
        typeStat.time += timeTaken;

        if (this.state.mode === 'assessment') {
            this.state.sessionHistory.push({ questionType: q.type, content: q.content, selected: selectedOpt, isCorrect: isCorrect, correctAns: q.correctAnswer, exp: q.explanation.text });
            if (isCorrect && timeTaken < 20) this.state.targetDifficulty = Math.min(this.state.targetDifficulty + 1, 5);
            else if (!isCorrect) this.state.targetDifficulty = Math.max(this.state.targetDifficulty - 1, 1);
            
            setTimeout(() => this.prepareNextQuestion(), 600);
        } else {
            this.DOM.quiz.explanationText.textContent = q.explanation.text;
            this.DOM.quiz.explanationContainer.style.display = 'block';
        }
    }

    startTimer() {
        clearInterval(this.state.timerInterval); this.state.sessionTimeLeft = 900;
        this.state.timerInterval = setInterval(() => {
            this.state.sessionTimeLeft--; 
            const m = Math.floor(this.state.sessionTimeLeft / 60).toString().padStart(2, '0');
            const s = (this.state.sessionTimeLeft % 60).toString().padStart(2, '0');
            this.DOM.quiz.timerDisplay.textContent = `${m}:${s}`;
            this.DOM.quiz.timerDisplay.style.color = this.state.sessionTimeLeft < 60 ? 'var(--error)' : 'var(--accent)';
            if (this.state.sessionTimeLeft <= 0) { clearInterval(this.state.timerInterval); this.endSession(); }
        }, 1000);
    }

    endSession() {
        clearInterval(this.state.timerInterval);
        this.checkDailyStreak(); this.saveLocalStorage(); 

        const sessionAccuracy = Math.round((this.state.correctAnswers / this.state.questionsAnswered) * 100) || 0;
        this.DOM.result.summary.innerHTML = `
            <div style="font-size: 2rem; color: ${sessionAccuracy >= 75 ? 'var(--success)' : 'var(--error)'}; margin-bottom: 10px;">${sessionAccuracy}%</div>
            Akurasi Kognitif Sesi Ini<br><br>
            <span style="font-size: 0.9rem; color: var(--text-muted);">Benar ${this.state.correctAnswers} dari total ${this.state.questionsAnswered} soal.</span>
        `;
        
        if (this.state.mode === 'assessment' && this.state.sessionHistory.length > 0) {
            this.DOM.result.reviewContainer.style.display = 'block';
            this.DOM.result.reviewList.innerHTML = this.state.sessionHistory.map((h, i) => `
                <div class="review-item" style="border-left: 3px solid ${h.isCorrect ? 'var(--success)' : 'var(--error)'};">
                    <h5>Soal ${i + 1} (${h.questionType === 'series' ? 'Deret' : 'Silogisme'})</h5>
                    <p style="font-size:0.85rem; margin-bottom: 8px;">Jawaban Anda: <strong>${h.selected}</strong> ${h.isCorrect ? '✅' : '❌ (Kunci: ' + h.correctAns + ')'}</p>
                    <div class="exp">Pembahasan: ${h.exp}</div>
                </div>
            `).join('');
        } else {
            this.DOM.result.reviewContainer.style.display = 'none';
        }

        this.navigate('result'); // Perbaikan: menggunakan bare key
    }
}

async function buildDatabaseFromTXT() {
    window.globalQuestionDatabase = [];
    const dbConfigs = [
        { file: 'test_deret.txt', pool: 'assessment', type: 'series' },
        { file: 'test_silogisme.txt', pool: 'assessment', type: 'syllogism' },
        { file: 'latihan_deret.txt', pool: 'practice', type: 'series' },
        { file: 'latihan_silogisme.txt', pool: 'practice', type: 'syllogism' }
    ];

    const fetchPromises = dbConfigs.map(config => 
        fetch(config.file).then(res => res.ok ? res.text() : null)
        .then(text => ({ config, text }))
        .catch(() => ({ config, text: null }))
    );

    const results = await Promise.all(fetchPromises);

    results.forEach(({ config, text }) => {
        if (!text) return;
        const blocks = text.split('===');
        
        for (const block of blocks) {
            if (block.trim().length === 0) continue; 
            
            const extractField = (fieldName) => {
                const regex = new RegExp(`\\[${fieldName}\\]\\s*(.*)`, 'i');
                const match = block.match(regex);
                return match ? match[1].trim() : '';
            };

            const contentStr = extractField('SOAL');
            let parsedContent = {};
            if (config.type === 'series') {
                parsedContent.sequence = contentStr.split(',').map(s => s.trim());
            } else if (config.type === 'syllogism') {
                parsedContent.premises = contentStr.split(/(?:\r?\n|\. )/).map(s => s.trim().replace(/\.$/, '')).filter(s => s.length > 0);
            }

            const optionsRaw = extractField('OPSI');
            const options = optionsRaw.split('|').map(s => s.trim());

            const questionObj = {
                id: extractField('ID') || Math.random().toString(),
                type: config.type,
                pool: config.pool,
                difficulty: parseInt(extractField('KESULITAN')) || 1,
                content: { ...parsedContent, options: options },
                correctAnswer: extractField('JAWABAN'),
                explanation: { text: extractField('PEMBAHASAN') }
            };

            if (questionObj.content.options.length > 1) {
                window.globalQuestionDatabase.push(questionObj);
            }
        }
    });
}

function getSafeModeData() {
    return [
        { id: "safe_1", pool: "assessment", type: "series", difficulty: 2, content: { sequence: ["Data", "Cadangan", "Aktif", "?"], options: ["Oke", "Paham", "Gagal", "Error"] }, correctAnswer: "Oke", explanation: { text: "Anda melihat ini karena file TXT gagal dimuat." } },
        { id: "safe_2", pool: "practice", type: "syllogism", difficulty: 2, content: { premises: ["Mode aman aktif.", "TXT diblokir peramban lokal."], options: ["Oke", "Paham", "Gagal", "Error"] }, correctAnswer: "Oke", explanation: { text: "Pastikan nama file TXT Anda sudah sesuai (test_deret.txt, dll)." } }
    ];
}

document.addEventListener('DOMContentLoaded', async () => {
    window.CogniFlow = new CogniFlowEngine();
    window.CogniFlow.init();
    await buildDatabaseFromTXT();
});
