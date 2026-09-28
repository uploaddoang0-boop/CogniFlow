class CogniFlowEngine {
    constructor() {
        this.DOM = {
            screens: { home: document.getElementById('screen-home'), practiceMenu: document.getElementById('screen-practice-menu'), profile: document.getElementById('screen-profile'), quiz: document.getElementById('screen-quiz'), result: document.getElementById('screen-result') },
            navItems: { home: document.getElementById('nav-home'), practice: document.getElementById('nav-practice'), profile: document.getElementById('nav-profile') },
            mainNav: document.getElementById('main-nav'),
            buttons: { startDaily: document.getElementById('btn-start-daily'), startPracSeries: document.getElementById('btn-practice-series'), startPracSyllogism: document.getElementById('btn-practice-syllogism'), home: document.getElementById('btn-home'), hint: document.getElementById('btn-hint'), nextPractice: document.getElementById('btn-next-practice') },
            quiz: { questionContainer: document.getElementById('question-container'), optionsContainer: document.getElementById('options-container'), timerDisplay: document.getElementById('timer-display'), levelIndicator: document.getElementById('level-indicator'), explanationContainer: document.getElementById('explanation-container'), explanationText: document.getElementById('explanation-text') },
            dashboard: { streak: document.getElementById('stat-streak'), accuracy: document.getElementById('stat-accuracy'), time: document.getElementById('stat-time') },
            resultSummary: document.getElementById('result-summary')
        };

        this.state = { mode: null, subType: null, questionPool: [], usedQuestionIds: new Set(), currentQuestion: null, targetDifficulty: 2, questionStartTime: 0, questionsAnswered: 0, maxQuestions: 5, correctAnswers: 0, sessionTimeLeft: 900, timerInterval: null };
        this.userStats = { streakDays: 0, lastPlayedDate: null, totalCorrect: 0, totalAnswered: 0, totalResponseTime: 0 };
    }

    init() { 
        this.loadLocalStorage(); 
        this.updateDashboardUI(); 
        this.attachEventListeners(); 
        console.log("CogniFlow Engine v2.0 [TXT Database Parser] Ready.");
    }

    loadLocalStorage() { const saved = localStorage.getItem('cogniflow_stats'); if (saved) { this.userStats = JSON.parse(saved); } else { this.saveLocalStorage(); } }
    saveLocalStorage() { localStorage.setItem('cogniflow_stats', JSON.stringify(this.userStats)); }

    updateDashboardUI() {
        if(!this.DOM.dashboard.streak) return;
        const accuracy = this.userStats.totalAnswered === 0 ? 0 : Math.round((this.userStats.totalCorrect / this.userStats.totalAnswered) * 100);
        const avgTime = this.userStats.totalAnswered === 0 ? 0 : Math.round(this.userStats.totalResponseTime / this.userStats.totalAnswered);
        this.DOM.dashboard.streak.textContent = `🔥 ${this.userStats.streakDays} Hari Streak`;
        this.DOM.dashboard.accuracy.textContent = `🎯 ${accuracy}% Akurasi`;
        this.DOM.dashboard.time.textContent = `⚡ ${avgTime}s Rata-rata`;
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

    switchTab(tabId) {
        Object.values(this.DOM.navItems).forEach(item => item.classList.remove('active'));
        if (this.DOM.navItems[tabId === 'practiceMenu' ? 'practice' : tabId]) { this.DOM.navItems[tabId === 'practiceMenu' ? 'practice' : tabId].classList.add('active'); }
        this.navigate(tabId);
    }

    navigate(screenId) {
        Object.values(this.DOM.screens).forEach(screen => { if (screen) screen.classList.remove('active'); });
        if(this.DOM.screens[screenId]) this.DOM.screens[screenId].classList.add('active');
        this.DOM.mainNav.style.display = (screenId === 'quiz' || screenId === 'result') ? 'none' : 'flex';
    }

    attachEventListeners() {
        this.DOM.navItems.home.addEventListener('click', () => this.switchTab('home'));
        this.DOM.navItems.practice.addEventListener('click', () => this.switchTab('practiceMenu'));
        this.DOM.navItems.profile.addEventListener('click', () => this.switchTab('profile'));

        this.DOM.buttons.startDaily.addEventListener('click', () => this.startSession('assessment'));
        this.DOM.buttons.startPracSeries.addEventListener('click', () => this.startSession('practice', 'series'));
        this.DOM.buttons.startPracSyllogism.addEventListener('click', () => this.startSession('practice', 'syllogism'));
        
        this.DOM.buttons.home.addEventListener('click', () => { this.updateDashboardUI(); this.switchTab('home'); });
        this.DOM.buttons.hint.addEventListener('click', () => { if (this.state.currentQuestion.hints && this.state.currentQuestion.hints.length > 0) alert("Pemantik Logika: \n\n" + this.state.currentQuestion.hints[0]); });
        this.DOM.buttons.nextPractice.addEventListener('click', () => { this.DOM.quiz.explanationContainer.style.display = 'none'; this.DOM.quiz.optionsContainer.style.pointerEvents = 'auto'; this.prepareNextQuestion(); });
    }

    startSession(mode, subType = null) {
        this.state.mode = mode; this.state.subType = subType;
        
        // Membaca dari memori global yang di-injeksi oleh TXT Parser
        this.state.questionPool = window.globalQuestionDatabase.filter(q => q.pool === mode && (!subType || q.type === subType));
        if(this.state.questionPool.length === 0) return alert(`Sistem: Bank soal belum tersedia untuk modul ini. Pastikan file TXT tidak kosong.`);
        
        this.state.usedQuestionIds.clear(); this.state.questionsAnswered = 0; this.state.correctAnswers = 0;
        this.state.targetDifficulty = 2; this.state.maxQuestions = (mode === 'assessment') ? 5 : 3; 
        
        if (mode === 'assessment') { this.DOM.quiz.timerDisplay.style.display = 'block'; this.DOM.buttons.hint.style.display = 'none'; this.startTimer(); } 
        else { this.DOM.quiz.timerDisplay.style.display = 'none'; this.DOM.buttons.hint.style.display = 'block'; }

        this.navigate('quiz'); this.prepareNextQuestion();
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
        this.DOM.quiz.levelIndicator.textContent = `Tingkat Kognitif: ${q.difficulty}`;
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
        
        if (navigator.vibrate) isCorrect ? navigator.vibrate([30, 50, 30]) : navigator.vibrate(200);

        this.DOM.quiz.optionsContainer.style.pointerEvents = 'none';
        btnElement.style.backgroundColor = isCorrect ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)';
        btnElement.style.borderColor = isCorrect ? 'var(--success)' : 'var(--error)';
        btnElement.style.color = isCorrect ? 'var(--success)' : 'var(--error)';

        if (isCorrect) this.state.correctAnswers++;
        this.state.questionsAnswered++;
        
        this.userStats.totalAnswered++;
        if (isCorrect) this.userStats.totalCorrect++;
        this.userStats.totalResponseTime += timeTaken;

        if (this.state.mode === 'assessment') {
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
        this.updateTimerUI();
        this.state.timerInterval = setInterval(() => {
            this.state.sessionTimeLeft--; this.updateTimerUI();
            if (this.state.sessionTimeLeft <= 0) { clearInterval(this.state.timerInterval); this.endSession(); }
        }, 1000);
    }

    updateTimerUI() {
        const m = Math.floor(this.state.sessionTimeLeft / 60).toString().padStart(2, '0');
        const s = (this.state.sessionTimeLeft % 60).toString().padStart(2, '0');
        this.DOM.quiz.timerDisplay.textContent = `${m}:${s}`;
        this.DOM.quiz.timerDisplay.style.color = this.state.sessionTimeLeft < 60 ? 'var(--error)' : 'var(--accent)';
    }

    endSession() {
        clearInterval(this.state.timerInterval);
        this.checkDailyStreak(); this.saveLocalStorage(); 

        const sessionAccuracy = Math.round((this.state.correctAnswers / this.state.questionsAnswered) * 100) || 0;
        this.DOM.resultSummary.innerHTML = `
            <div style="font-size: 2rem; color: ${sessionAccuracy >= 75 ? 'var(--success)' : 'var(--error)'}; margin-bottom: 10px;">${sessionAccuracy}%</div>
            Akurasi Kognitif Sesi Ini<br><br>
            <span style="font-size: 0.9rem; color: var(--text-muted);">Anda menjawab benar ${this.state.correctAnswers} dari total ${this.state.questionsAnswered} soal.</span>
        `;
        this.navigate('result');
    }
}

/* =========================================================
   ASYNCHRONOUS TXT PARSER ENGINE 
   ========================================================= */
async function buildDatabaseFromTXT() {
    window.globalQuestionDatabase = [];
    const files = ['deret.txt', 'silogisme.txt', 'latihan.txt'];

    for (const file of files) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                console.warn(`[CogniFlow Parser] File ${file} tidak ditemukan atau gagal dimuat.`);
                continue;
            }
            const textContent = await response.text();
            
            // Pisahkan berdasarkan delimiter '==='
            const blocks = textContent.split('===');
            
            for (const block of blocks) {
                if (block.trim().length === 0) continue; // Lewati blok kosong
                
                // Fungsi Helper Ekstraksi RegEx
                const extractField = (fieldName) => {
                    const regex = new RegExp(`\\[${fieldName}\\]\\s*(.*)`);
                    const match = block.match(regex);
                    return match ? match[1].trim() : '';
                };

                const type = extractField('TIPE').toLowerCase();
                const contentStr = extractField('KONTEN');
                
                // Logika Parsing Tipe Spesifik
                let parsedContent = {};
                if (type === 'series') {
                    // Pecah koma jadi array angka/tanda tanya
                    parsedContent.sequence = contentStr.split(',').map(s => s.trim());
                } else if (type === 'syllogism') {
                    // Pecah berdasarkan titik atau baris baru
                    parsedContent.premises = contentStr.split(/(?:\r?\n|\. )/)
                        .map(s => s.trim().replace(/\.$/, ''))
                        .filter(s => s.length > 0);
                }

                // Ambil & bersihkan Opsi Jawaban
                const optionsRaw = extractField('OPSI');
                const options = optionsRaw.split('|').map(s => s.trim());
                
                const hint = extractField('PETUNJUK');

                // Rakit Objek (Meniru data.js lama)
                const questionObj = {
                    id: extractField('ID'),
                    type: type,
                    pool: extractField('POOL').toLowerCase(),
                    difficulty: parseInt(extractField('KESULITAN')) || 1,
                    content: { ...parsedContent, options: options },
                    correctAnswer: extractField('JAWABAN'),
                    hints: hint ? [hint] : [],
                    explanation: { text: extractField('PEMBAHASAN') }
                };

                // Validasi Data Keamanan (Cegah masuk jika data korup)
                if (questionObj.id && questionObj.content.options.length > 1) {
                    window.globalQuestionDatabase.push(questionObj);
                }
            }
        } catch (error) {
            console.error(`[CogniFlow Parser Error] Gagal membedah ${file}:`, error);
        }
    }
}

// BOOTSTRAP APLIKASI
// Jalankan Parser asinkronus DULU, setelah selesai baru nyalakan mesin CogniFlow.
document.addEventListener('DOMContentLoaded', async () => {
    // Tombol di-disable dulu saat parsing agar user tidak klik sebelum data siap
    const startBtns = document.querySelectorAll('button[id^="btn-start"]');
    startBtns.forEach(btn => btn.style.opacity = '0.5');

    await buildDatabaseFromTXT(); // Tunggu file teks diterjemahkan
    
    // Nyalakan Mesin UI
    window.CogniFlow = new CogniFlowEngine();
    
    // Buka kunci tombol
    startBtns.forEach(btn => btn.style.opacity = '1');
});

// BOOTSTRAP APLIKASI (DENGAN PROTEKSI ERROR VISUAL)
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kunci tombol sementara
    const startBtns = document.querySelectorAll('#btn-start-daily, #btn-practice-series, #btn-practice-syllogism');
    startBtns.forEach(btn => btn.style.opacity = '0.5');

    try {
        // 2. Jalankan Parser TXT
        await buildDatabaseFromTXT();
        
        // 3. Validasi Keberhasilan Parser
        if (window.globalQuestionDatabase.length === 0) {
            alert("⚠️ KESALAHAN PARSER: File TXT berhasil dibaca, tetapi tidak ada soal yang valid. Periksa apakah format [TIPE], [KONTEN], dan [OPSI] sudah persis sesuai instruksi AI.");
            return; // Hentikan eksekusi agar tidak crash
        }
        
        // 4. Nyalakan Mesin UI jika data aman
        window.CogniFlow = new CogniFlowEngine();
        
        // 5. Buka kunci tombol
        startBtns.forEach(btn => {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });

    } catch (e) {
        alert("⚠️ KESALAHAN JARINGAN: Gagal memuat aplikasi. Pastikan Anda tidak membuka file ini langsung dari C:/ (Gunakan Live Server atau GitHub Pages). Error: " + e.message);
    }
});