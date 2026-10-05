class CogniFlowEngine {
    constructor() {
        this.DOM = {
            screens: { home: document.getElementById('screen-home'), simulasi: document.getElementById('screen-simulasi'), practice: document.getElementById('screen-practice'), quiz: document.getElementById('screen-quiz'), result: document.getElementById('screen-result') },
            navItems: { home: document.getElementById('nav-home'), simulasi: document.getElementById('nav-simulasi'), practice: document.getElementById('nav-practice') },
            mainNav: document.getElementById('main-nav'),
            buttons: { 
                startDaily: document.getElementById('btn-start-daily'), 
                testSeries: document.getElementById('btn-test-series'), 
                testSyl: document.getElementById('btn-test-syllogism'), 
                pracSeries: document.getElementById('btn-prac-series'), 
                pracSyl: document.getElementById('btn-prac-syllogism'), 
                home: document.getElementById('btn-home'), 
                nextPractice: document.getElementById('btn-next-practice'), 
                exitQuiz: document.getElementById('btn-exit-quiz'), 
                cancelExit: document.getElementById('btn-cancel-exit'), 
                confirmExit: document.getElementById('btn-confirm-exit'),
                toggleSound: document.getElementById('btn-toggle-sound')
            },
            quiz: { questionContainer: document.getElementById('question-container'), optionsContainer: document.getElementById('options-container'), timerDisplay: document.getElementById('timer-display'), levelIndicator: document.getElementById('level-indicator'), explanationContainer: document.getElementById('explanation-container'), explanationText: document.getElementById('explanation-text') },
            stats: { deretAcc: document.getElementById('stat-deret-acc'), deretTime: document.getElementById('stat-deret-time'), sylAcc: document.getElementById('stat-syl-acc'), sylTime: document.getElementById('stat-syl-time'), streak: document.getElementById('streak-display'), diagText: document.getElementById('diag-text'), diagCard: document.getElementById('diagnostic-card') },
            result: { summary: document.getElementById('result-summary'), reviewContainer: document.getElementById('review-container'), reviewList: document.getElementById('review-list') },
            modal: { exit: document.getElementById('exit-modal') },
            drawer: {
                el: document.getElementById('cheat-sheet-drawer'),
                overlay: document.getElementById('drawer-overlay'),
                closeBtn: document.getElementById('btn-close-drawer'),
                container: document.getElementById('drawer-cards-container'),
                searchInput: document.getElementById('drawer-search-input'),
                tabs: document.querySelectorAll('.drawer-tab-btn'),
                toggleBtn: document.getElementById('btn-toggle-tips'),
                openMaterialsBtn: document.getElementById('btn-open-materials'),
                contextualTipBtn: document.getElementById('btn-contextual-tip')
            }
        };

        this.state = { mode: null, subType: null, questionPool: [], usedQuestionIds: new Set(), currentQuestion: null, questionStartTime: 0, questionsAnswered: 0, maxQuestions: 20, correctAnswers: 0, sessionTimeLeft: 60, timerInterval: null, sessionHistory: [], sessionQueue: [] };
        
        this.userStats = { streakDays: 0, lastPlayedDate: null, series: { correct: 0, answered: 0, time: 0 }, syllogism: { correct: 0, answered: 0, time: 0 } };
        this.audioCtx = null;
        this.soundEnabled = localStorage.getItem('cogniflow_sound_enabled') !== 'false';
        this.materialCategory = 'all';
        this.materialSearchQuery = '';
    }

    init() { 
        this.loadLocalStorage(); 
        this.updateDashboardUI(); 
        this.updateSoundToggleUI();
        this.renderMaterialsList();
        this.attachEventListeners(); 
        console.log("CogniFlow Engine v5.1 [Evidence-Based Cognitive Design] Bersedia.");
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
            } else if (s.answered > 0 && (deretAcc < sylAcc || syl.answered === 0)) {
                this.DOM.stats.diagText.innerHTML = `Akurasi Deret Bilangan (${deretAcc}%) lebih rendah. Disarankan memperbanyak <strong>Latihan Deret Bilangan</strong>.`;
                this.DOM.stats.diagCard.style.borderLeftColor = 'var(--accent)';
            } else {
                this.DOM.stats.diagText.innerHTML = `Performa kedua modul seimbang (${deretAcc}%). Pertahankan konsistensi latihan!`;
                this.DOM.stats.diagCard.style.borderLeftColor = 'var(--success)';
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

    initAudio() { 
        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('cogniflow_sound_enabled', this.soundEnabled.toString());
        this.updateSoundToggleUI();
    }

    updateSoundToggleUI() {
        if (!this.DOM.buttons.toggleSound) return;
        const iconOn = this.DOM.buttons.toggleSound.querySelector('.icon-sound-on');
        const iconOff = this.DOM.buttons.toggleSound.querySelector('.icon-sound-off');
        if (iconOn && iconOff) {
            iconOn.style.display = this.soundEnabled ? 'block' : 'none';
            iconOff.style.display = this.soundEnabled ? 'none' : 'block';
        }
        this.DOM.buttons.toggleSound.title = this.soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara';
    }
    
    /* 2.D PSIKOAKUSTIK: SMOOTH SINE WAVE DENGAN ENVELOPE ADSR HALUS */
    playFeedback(isCorrect) {
        if (!this.soundEnabled) return;
        try {
            this.initAudio();
            if (!this.audioCtx) return;
            const t = this.audioCtx.currentTime;
            
            if (isCorrect) {
                // Major Third Chord (C5: 523.25 Hz & E5: 659.25 Hz) berdurasi 250ms
                const chord = [523.25, 659.25];
                chord.forEach(freq => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);

                    // ADSR Envelope: 15ms attack, 235ms decay
                    gain.gain.setValueAtTime(0.0001, t);
                    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);

                    osc.start(t);
                    osc.stop(t + 0.25);
                });
                if (navigator.vibrate) navigator.vibrate([25, 40, 25]);
            } else {
                // Muted Double-Pulse Thud (220 Hz ke 196 Hz) berdurasi 180ms
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.exponentialRampToValueAtTime(196, t + 0.18);

                // Smooth muted thud envelope
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start(t);
                osc.stop(t + 0.18);

                if (navigator.vibrate) navigator.vibrate(80);
            }
        } catch(e) { console.warn("Audio/Haptic tidak disokong", e); }
    }

    switchTab(tabId) {
        Object.values(this.DOM.navItems).forEach(item => item.classList.remove('active'));
        if (this.DOM.navItems[tabId]) this.DOM.navItems[tabId].classList.add('active');
        this.navigate(tabId); 
    }

    navigate(screenId) {
        Object.values(this.DOM.screens).forEach(screen => { if (screen) screen.classList.remove('active'); });
        if(this.DOM.screens[screenId]) this.DOM.screens[screenId].classList.add('active');
        this.DOM.mainNav.style.display = (screenId === 'quiz' || screenId === 'result') ? 'none' : 'flex';
        this.closeCheatSheet();
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
        
        if (this.DOM.buttons.toggleSound) {
            this.DOM.buttons.toggleSound.addEventListener('click', () => this.toggleSound());
        }

        // PUSAT MATERI & TRIK CEPAT: Tombol aksi & Drawer listeners
        if (this.DOM.drawer.toggleBtn) {
            this.DOM.drawer.toggleBtn.addEventListener('click', () => {
                if (this.state.mode === 'practice') {
                    this.toggleCheatSheet();
                }
            });
        }

        if (this.DOM.drawer.openMaterialsBtn) {
            this.DOM.drawer.openMaterialsBtn.addEventListener('click', () => {
                this.openCheatSheet('all');
            });
        }

        if (this.DOM.drawer.contextualTipBtn) {
            this.DOM.drawer.contextualTipBtn.addEventListener('click', () => {
                if (this.state.mode === 'practice') {
                    const cat = this.state.currentQuestion?.type || 'all';
                    this.openCheatSheet(cat);
                }
            });
        }

        if (this.DOM.drawer.closeBtn) {
            this.DOM.drawer.closeBtn.addEventListener('click', () => this.closeCheatSheet());
        }

        if (this.DOM.drawer.overlay) {
            this.DOM.drawer.overlay.addEventListener('click', () => this.closeCheatSheet());
        }

        if (this.DOM.drawer.searchInput) {
            this.DOM.drawer.searchInput.addEventListener('input', (e) => {
                this.materialSearchQuery = e.target.value;
                this.renderMaterialsList();
            });
        }

        if (this.DOM.drawer.tabs) {
            this.DOM.drawer.tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.DOM.drawer.tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.materialCategory = tab.dataset.category || 'all';
                    this.renderMaterialsList();
                });
            });
        }

        this.DOM.buttons.exitQuiz.addEventListener('click', () => this.DOM.modal.exit.style.display = 'flex');
        this.DOM.buttons.cancelExit.addEventListener('click', () => this.DOM.modal.exit.style.display = 'none');
        this.DOM.buttons.confirmExit.addEventListener('click', () => {
            this.DOM.modal.exit.style.display = 'none'; 
            clearInterval(this.state.timerInterval); 
            this.updateDashboardUI(); // Kemas kini stat latihan yang dilakukan sebelum keluar
            this.switchTab('home');
        });
        this.DOM.buttons.home.addEventListener('click', () => { this.updateDashboardUI(); this.switchTab('home'); });
        
        this.DOM.buttons.nextPractice.addEventListener('click', () => { 
            this.DOM.quiz.explanationContainer.style.display = 'none'; 
            this.prepareNextQuestion(); 
        });

        // ACCESSIBILITY & SPEED HOTKEYS: Navigasi keyboard A/B/C/D, 1/2/3/4, T/M, Enter, Space, Escape
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Jika drawer cheat sheet terbuka: tombol Escape menutupnya
            if (this.DOM.drawer.el && this.DOM.drawer.el.classList.contains('open')) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.closeCheatSheet();
                    return;
                }
            }

            // PINTASAN T atau M: HANYA AKTIF SAAT LATIHAN BEBAS (SESUAI REQUEST USER: SIMULASI TIDAK MEMILIKI CONTEKAN)
            if (e.key === 't' || e.key === 'T' || e.key === 'm' || e.key === 'M') {
                const isPracticeQuiz = (this.DOM.screens.quiz && this.DOM.screens.quiz.classList.contains('active') && this.state.mode === 'practice');
                const isPracticeScreen = (this.DOM.screens.practice && this.DOM.screens.practice.classList.contains('active'));
                
                if (isPracticeQuiz || isPracticeScreen) {
                    e.preventDefault();
                    this.toggleCheatSheet();
                    return;
                }
                // Jika sedang Simulasi Ujian (assessment), tidak merespons demi atmosfir ujian sesungguhnya
            }

            if (this.DOM.modal.exit && this.DOM.modal.exit.style.display === 'flex') {
                if (e.key === 'Escape') this.DOM.buttons.cancelExit.click();
                if (e.key === 'Enter') this.DOM.buttons.confirmExit.click();
                return;
            }

            if (this.DOM.screens.quiz && this.DOM.screens.quiz.classList.contains('active')) {
                const key = e.key.toUpperCase();
                
                if (this.DOM.quiz.explanationContainer.style.display === 'block') {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.DOM.buttons.nextPractice.click();
                        return;
                    }
                }

                const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
                const targetLetter = keyMap[key] || key;

                if (['A', 'B', 'C', 'D', 'E'].includes(targetLetter)) {
                    const targetCard = this.DOM.quiz.optionsContainer.querySelector(`.option-card[data-key="${targetLetter}"]`);
                    if (targetCard && !targetCard.disabled) {
                        e.preventDefault();
                        targetCard.click();
                    }
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.DOM.buttons.exitQuiz.click();
                }
            }
        });
    }

    /* UTILITY: FISHER-YATES UNIFORM SHUFFLE */
    shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    /* PENGAMBILAN SOAL ACAK DENGAN PENCEGAHAN DUPLIKASI */
    getRandomQ(pool, diff, count, chosenIds = new Set()) {
        const matching = this.shuffleArray(pool.filter(q => q.difficulty === diff && !chosenIds.has(q.id)));
        const selected = matching.slice(0, count);
        selected.forEach(q => chosenIds.add(q.id));

        if (selected.length < count) {
            const needed = count - selected.length;
            const extras = this.shuffleArray(pool.filter(q => q.difficulty !== diff && !chosenIds.has(q.id))).slice(0, needed);
            extras.forEach(q => chosenIds.add(q.id));
            selected.push(...extras);
        }
        return selected;
    }

    /* BLUEPRINT KOMPOSISI UJIAN (10%, 20%, 35%, 20%, 15%) DENGAN ZERO DUPLICATES */
    buildAssessmentQueue(pool, subType) {
        let queue = [];
        const chosenIds = new Set();

        if (subType === 'series') {
            queue.push(...this.getRandomQ(pool, 1, 2, chosenIds)); // 10%
            queue.push(...this.getRandomQ(pool, 2, 4, chosenIds)); // 20%
            queue.push(...this.getRandomQ(pool, 3, 7, chosenIds)); // 35%
            queue.push(...this.getRandomQ(pool, 4, 4, chosenIds)); // 20%
            queue.push(...this.getRandomQ(pool, 5, 3, chosenIds)); // 15%
        } else if (subType === 'syllogism') {
            queue.push(...this.getRandomQ(pool, 1, 4, chosenIds));
            queue.push(...this.getRandomQ(pool, 2, 4, chosenIds));
            queue.push(...this.getRandomQ(pool, 3, 4, chosenIds));
            queue.push(...this.getRandomQ(pool, 4, 4, chosenIds));
            queue.push(...this.getRandomQ(pool, 5, 4, chosenIds));
        } else if (subType === 'mix') {
            let sPool = pool.filter(q => q.type === 'series');
            let syPool = pool.filter(q => q.type === 'syllogism');
            queue.push(
                ...this.getRandomQ(sPool, 1, 1, chosenIds),
                ...this.getRandomQ(sPool, 2, 2, chosenIds),
                ...this.getRandomQ(sPool, 3, 4, chosenIds),
                ...this.getRandomQ(sPool, 4, 2, chosenIds),
                ...this.getRandomQ(sPool, 5, 1, chosenIds)
            );
            queue.push(
                ...this.getRandomQ(syPool, 1, 2, chosenIds),
                ...this.getRandomQ(syPool, 2, 2, chosenIds),
                ...this.getRandomQ(syPool, 3, 2, chosenIds),
                ...this.getRandomQ(syPool, 4, 2, chosenIds),
                ...this.getRandomQ(syPool, 5, 2, chosenIds)
            );
        }
        return this.shuffleArray(queue); // Acak urutan tampil secara merata
    }

    async startSession(mode, subType) {
        this.state.mode = mode; this.state.subType = subType;
        
        if (window.dbReadyPromise) {
            await window.dbReadyPromise;
        }

        let db = window.globalQuestionDatabase || [];
        if (db.length === 0) {
            alert("⚠️ SAFE MODE: Pangkalan data soal gagal dimuat. Menggunakan Data Sandaran.");
            db = getSafeModeData();
        }

        this.state.questionPool = db.filter(q => q.pool === mode && (subType === 'mix' || q.type === subType));
        if(this.state.questionPool.length === 0) return alert(`Sistem: Bank soalan belum tersedia untuk modul ini.`);
        
        this.state.usedQuestionIds.clear(); 
        this.state.questionsAnswered = 0; 
        this.state.correctAnswers = 0;
        this.state.sessionHistory = []; 
        
        if (mode === 'assessment') { 
            this.state.maxQuestions = 20; 
            this.state.sessionQueue = this.buildAssessmentQueue(this.state.questionPool, subType);
            this.DOM.quiz.timerDisplay.textContent = '01:00';
            this.DOM.quiz.timerDisplay.style.color = 'var(--accent)';
            // SEMBUNYIKAN TOMBOL TRIK CEPAT SAAT SIMULASI (ATMOSFIR UJIAN ASLI SESUAI PERMINTAAN USER)
            if (this.DOM.drawer && this.DOM.drawer.toggleBtn) this.DOM.drawer.toggleBtn.style.display = 'none';
            this.closeCheatSheet();
        } else { 
            this.state.maxQuestions = Infinity; // Tanpa Batas untuk Latihan
            this.DOM.quiz.timerDisplay.textContent = '∞';
            this.DOM.quiz.timerDisplay.style.color = 'var(--accent)';
            // TAMPILKAN TOMBOL TRIK CEPAT HANYA SAAT LATIHAN BEBAS
            if (this.DOM.drawer && this.DOM.drawer.toggleBtn) this.DOM.drawer.toggleBtn.style.display = 'inline-flex';
        }

        this.navigate('quiz'); 
        this.prepareNextQuestion();
    }

    prepareNextQuestion() {
        if (this.state.mode === 'assessment') {
            if (this.state.questionsAnswered >= this.state.maxQuestions || this.state.questionsAnswered >= this.state.sessionQueue.length) {
                return this.endSession();
            }
            this.state.currentQuestion = this.state.sessionQueue[this.state.questionsAnswered];
        } else {
            // Mode Latihan: Pilih acak tanpa batas
            let available = this.state.questionPool.filter(q => !this.state.usedQuestionIds.has(q.id));
            if (available.length === 0) {
                this.state.usedQuestionIds.clear(); // Loop ulang bank soal
                available = this.state.questionPool;
            }
            this.state.currentQuestion = available[Math.floor(Math.random() * available.length)];
            this.state.usedQuestionIds.add(this.state.currentQuestion.id);
        }
        
        this.renderQuestionData();
    }

    /* 2.A & 2.C KOGNITIF CHUNKING, SEMANTIC SCAFFOLDING & TABULAR MONO */
    renderQuestionData() {
        const q = this.state.currentQuestion;
        
        // Pembedaan Informasi Header
        if (this.state.mode === 'assessment') {
            this.DOM.quiz.levelIndicator.textContent = `Soal ${this.state.questionsAnswered + 1} dari ${this.state.maxQuestions} • Kesulitan ${q.difficulty}`;
        } else {
            this.DOM.quiz.levelIndicator.textContent = `Telah dikerjakan: ${this.state.questionsAnswered} soal • Kesulitan ${q.difficulty}`;
        }

        this.state.questionStartTime = Date.now();
        this.DOM.quiz.explanationContainer.style.display = 'none';
        this.DOM.quiz.questionContainer.innerHTML = '';

        if (q.type === 'series') {
            const labelEl = document.createElement('div');
            labelEl.style.cssText = 'font-weight: 700; font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;';
            labelEl.textContent = 'Analisis Pola Deret Berikut:';

            const streamContainer = document.createElement('div');
            streamContainer.className = 'series-stream-container';

            const seqItems = Array.isArray(q.content.sequence) ? q.content.sequence : String(q.content.sequence).split(',');
            seqItems.forEach(item => {
                const trimmed = String(item).trim();
                const chip = document.createElement('div');
                const isTarget = (trimmed === '?' || trimmed === '...' || trimmed === '…');
                chip.className = `series-chip ${isTarget ? 'series-target' : ''}`;
                chip.textContent = trimmed;
                streamContainer.appendChild(chip);
            });

            this.DOM.quiz.questionContainer.appendChild(labelEl);
            this.DOM.quiz.questionContainer.appendChild(streamContainer);
        } else {
            const labelEl = document.createElement('div');
            labelEl.style.cssText = 'font-weight: 700; font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;';
            labelEl.textContent = 'Tarik kesimpulan dari premis berikut:';

            const stackContainer = document.createElement('div');
            stackContainer.className = 'syllogism-card-stack';

            const premiseItems = Array.isArray(q.content.premises) ? q.content.premises : [q.content.premises];
            premiseItems.forEach((p, idx) => {
                const row = document.createElement('div');
                row.className = 'premise-badge-row';
                const tagLabel = idx === 0 ? 'Premis Mayor (P1)' : (idx === 1 ? 'Premis Minor (P2)' : `Premis Tambahan (P${idx + 1})`);
                row.innerHTML = `<span class="badge-premise">${tagLabel}</span><p class="premise-statement">${p}</p>`;
                stackContainer.appendChild(row);
            });

            this.DOM.quiz.questionContainer.appendChild(labelEl);
            this.DOM.quiz.questionContainer.appendChild(stackContainer);
        }

        // 2.A OPTION CARDS (FLEXBOX TOP-ALIGNED BADGE)
        this.DOM.quiz.optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D', 'E'];
        // ACAK POSISI OPSI (FISHER-YATES SHUFFLE): Mencegah bias pola letak kunci jawaban (misal mayoritas Opsi B)
        const displayOptions = this.shuffleArray(q.content.options);
        displayOptions.forEach((opt, idx) => {
            const letter = letters[idx] || String.fromCharCode(65 + idx);
            const card = document.createElement('button');
            card.className = 'option-card';
            card.dataset.key = letter;
            card.innerHTML = `<span class="option-key">${letter}</span><span class="option-text">${opt}</span>`;
            card.addEventListener('click', () => this.handleAnswer(opt, card));
            this.DOM.quiz.optionsContainer.appendChild(card);
        });

        if (this.state.mode === 'assessment') {
            this.startTimer();
        }
    }

    handleAnswer(selectedOpt, btnElement) {
        clearInterval(this.state.timerInterval); 

        const q = this.state.currentQuestion;
        const isCorrect = (String(selectedOpt).trim() === String(q.correctAnswer).trim());
        const timeTaken = (Date.now() - this.state.questionStartTime) / 1000;
        
        this.playFeedback(isCorrect); 

        const allCards = this.DOM.quiz.optionsContainer.querySelectorAll('.option-card');
        allCards.forEach(card => {
            card.disabled = true;
            const optText = card.querySelector('.option-text')?.textContent?.trim();
            if (optText === String(q.correctAnswer).trim()) {
                card.classList.add('correct');
            }
        });
        
        if (!isCorrect) {
            btnElement.classList.add('incorrect');
        }

        if (isCorrect) this.state.correctAnswers++;
        this.state.questionsAnswered++;
        
        const typeStat = q.type === 'series' ? this.userStats.series : this.userStats.syllogism;
        typeStat.answered++;
        if (isCorrect) typeStat.correct++;
        typeStat.time += timeTaken;
        
        this.saveLocalStorage(); // Simpan instan agar mode Latihan Infinite terekam bila user menekan 'Keluar'

        if (this.state.mode === 'assessment') {
            this.state.sessionHistory.push({ questionType: q.type, content: q.content, selected: selectedOpt, isCorrect: isCorrect, correctAns: q.correctAnswer, exp: q.explanation?.text || '' });
            setTimeout(() => this.prepareNextQuestion(), 900); // Kalibrasi 900ms agar user dapat memproses feedback
        } else {
            this.DOM.quiz.explanationText.textContent = q.explanation?.text || 'Tidak ada penjelasan lanjutan.';
            this.DOM.quiz.explanationContainer.style.display = 'block';
        }
    }

    startTimer() {
        clearInterval(this.state.timerInterval); 
        this.state.sessionTimeLeft = 60; 
        this.updateTimerUI();
        
        this.state.timerInterval = setInterval(() => {
            this.state.sessionTimeLeft--; 
            this.updateTimerUI();
            if (this.state.sessionTimeLeft <= 0) { 
                clearInterval(this.state.timerInterval); 
                this.handleTimeout(); 
            }
        }, 1000);
    }

    updateTimerUI() {
        const m = Math.floor(this.state.sessionTimeLeft / 60).toString().padStart(2, '0');
        const s = (this.state.sessionTimeLeft % 60).toString().padStart(2, '0');
        this.DOM.quiz.timerDisplay.textContent = `${m}:${s}`;
        this.DOM.quiz.timerDisplay.style.color = this.state.sessionTimeLeft <= 10 ? 'var(--error)' : 'var(--accent)';
    }

    handleTimeout() {
        const q = this.state.currentQuestion;
        this.playFeedback(false); 

        const allBtns = this.DOM.quiz.optionsContainer.querySelectorAll('button');
        allBtns.forEach(btn => btn.disabled = true);
        
        this.DOM.quiz.timerDisplay.textContent = "WAKTU HABIS";

        this.state.questionsAnswered++;
        const typeStat = q.type === 'series' ? this.userStats.series : this.userStats.syllogism;
        typeStat.answered++;
        typeStat.time += 60; 
        this.saveLocalStorage();

        if (this.state.mode === 'assessment') {
            this.state.sessionHistory.push({ questionType: q.type, content: q.content, selected: "WAKTU HABIS", isCorrect: false, correctAns: q.correctAnswer, exp: q.explanation?.text || '' });
            setTimeout(() => this.prepareNextQuestion(), 1000); 
        }
    }

    endSession() {
        clearInterval(this.state.timerInterval);
        this.checkDailyStreak(); 

        const sessionAccuracy = Math.round((this.state.correctAnswers / this.state.questionsAnswered) * 100) || 0;
        this.DOM.result.summary.innerHTML = `
            <div style="font-size: 2rem; color: ${sessionAccuracy >= 75 ? 'var(--success)' : 'var(--error)'}; margin-bottom: 10px;">${sessionAccuracy}%</div>
            Akurasi Kognitif Sesi Ini<br><br>
            <span style="font-size: 0.9rem; color: var(--text-muted);">Benar ${this.state.correctAnswers} dari ${this.state.questionsAnswered} soal simulasi.</span>
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

        this.navigate('result'); 
    }

    /* =========================================================
       PUSAT MATERI & CHEAT SHEET CONTROLLER (EPIC 6)
       ========================================================= */
    openCheatSheet(category = null) {
        if (category) {
            this.materialCategory = category;
            if (this.DOM.drawer && this.DOM.drawer.tabs) {
                this.DOM.drawer.tabs.forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.category === category);
                });
            }
        }
        this.renderMaterialsList();
        this.DOM.drawer.el?.classList.add('open');
        this.DOM.drawer.overlay?.classList.add('active');
    }

    closeCheatSheet() {
        this.DOM.drawer.el?.classList.remove('open');
        this.DOM.drawer.overlay?.classList.remove('active');
    }

    toggleCheatSheet(category = null) {
        if (this.DOM.drawer.el?.classList.contains('open')) {
            this.closeCheatSheet();
        } else {
            const targetCat = category || (this.state.currentQuestion?.type === 'series' ? 'series' : (this.state.currentQuestion?.type === 'syllogism' ? 'syllogism' : null));
            this.openCheatSheet(targetCat);
        }
    }

    renderMaterialsList() {
        const container = this.DOM.drawer && this.DOM.drawer.container;
        if (!container) return;

        const materials = window.CogniFlowMaterials || [];
        const cat = this.materialCategory;
        const q = (this.materialSearchQuery || '').toLowerCase().trim();

        const filtered = materials.filter(m => {
            const matchCat = (cat === 'all' || m.category === cat);
            const matchQ = !q || (
                m.title.toLowerCase().includes(q) ||
                m.summary.toLowerCase().includes(q) ||
                m.rule.toLowerCase().includes(q) ||
                m.tips.toLowerCase().includes(q)
            );
            return matchCat && matchQ;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-tertiary);">
                    <p style="font-size: 1rem; margin-bottom: 8px; font-weight: 600;">Tidak ada rumus atau materi yang cocok.</p>
                    <span style="font-size: 0.85rem;">Coba kata kunci lain atau pilih tab kategori yang berbeda.</span>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(m => `
            <article class="cheat-card" id="${m.id}">
                <div class="cheat-card-header">
                    <h4 class="cheat-card-title">${m.title}</h4>
                    <span class="cheat-card-badge">${m.badge}</span>
                </div>
                <p class="cheat-card-summary">${m.summary}</p>
                <div class="cheat-card-rule">${m.rule}</div>
                ${m.example ? `
                    <div class="cheat-card-example">
                        <strong>Contoh Penerapan:</strong>
                        <div><em>Soal:</em> ${m.example.question}</div>
                        <div style="margin-top: 4px; color: var(--text-secondary);"><em>Solusi:</em> ${m.example.solution.replace(/\n/g, '<br>')}</div>
                    </div>
                ` : ''}
                <div class="cheat-card-tips">
                    <span>💡</span>
                    <span>${m.tips}</span>
                </div>
            </article>
        `).join('');
    }
}

/* =========================================================
   ASYNCHRONOUS JSON DATABASE LOADER (v2 — Replaces TXT Parser)
   JSON.parse() native browser engine: 10-50x faster than RegEx
   ========================================================= */
async function buildDatabaseFromJSON() {
    window.globalQuestionDatabase = [];
    const dbConfigs = [
        { file: 'test_deret.json',       pool: 'assessment', type: 'series' },
        { file: 'test_silogisme.json',   pool: 'assessment', type: 'syllogism' },
        { file: 'latihan_deret.json',    pool: 'practice',   type: 'series' },
        { file: 'latihan_silogisme.json', pool: 'practice',  type: 'syllogism' }
    ];

    const fetchPromises = dbConfigs.map(config =>
        fetch(config.file)
            .then(res => res.ok ? res.json() : null)
            .then(data => ({ config, data }))
            .catch(() => ({ config, data: null }))
    );

    const results = await Promise.all(fetchPromises);

    results.forEach(({ config, data }) => {
        if (!data || !Array.isArray(data)) return;

        data.forEach(q => {
            q.type = config.type;
            q.pool = config.pool;
            window.globalQuestionDatabase.push(q);
        });
    });
}

function getSafeModeData() {
    return [
        { id: "safe_s1", pool: "assessment", type: "series", difficulty: 1, content: { sequence: ["2", "4", "6", "8", "?"], options: ["10", "12", "14", "16"] }, correctAnswer: "10", explanation: { text: "Pola deret aritmatika dasar (+2): 8 + 2 = 10." } },
        { id: "safe_s2", pool: "assessment", type: "series", difficulty: 2, content: { sequence: ["3", "9", "27", "81", "?"], options: ["162", "243", "300", "324"] }, correctAnswer: "243", explanation: { text: "Pola deret geometri perkalian 3: 81 × 3 = 243." } },
        { id: "safe_sy1", pool: "assessment", type: "syllogism", difficulty: 1, content: { premises: ["Semua atlet memiliki stamina tinggi.", "Budi adalah seorang atlet."], options: ["Budi memiliki stamina tinggi.", "Budi bukan atlet.", "Semua yang berstamina adalah Budi.", "Tidak dapat disimpulkan."] }, correctAnswer: "Budi memiliki stamina tinggi.", explanation: { text: "Silogisme kategoris deduktif langsung (Modus Barbara)." } },
        { id: "safe_sy2", pool: "assessment", type: "syllogism", difficulty: 2, content: { premises: ["Jika hari ini hujan, jalanan menjadi basah.", "Hari ini hujan."], options: ["Jalanan menjadi basah.", "Jalanan tidak basah.", "Kemarin hujan.", "Tidak ada kesimpulan."] }, correctAnswer: "Jalanan menjadi basah.", explanation: { text: "Modus Ponens (jika P maka Q; P terjadi, maka Q)." } },
        { id: "safe_ps1", pool: "practice", type: "series", difficulty: 1, content: { sequence: ["5", "10", "15", "20", "?"], options: ["22", "25", "30", "35"] }, correctAnswer: "25", explanation: { text: "Pola deret aritmatika bertambah 5: 20 + 5 = 25." } },
        { id: "safe_psy1", pool: "practice", type: "syllogism", difficulty: 1, content: { premises: ["Semua mamalia bernapas dengan paru-paru.", "Paus adalah mamalia."], options: ["Paus bernapas dengan insang.", "Paus bernapas dengan paru-paru.", "Sebagian mamalia adalah paus.", "Tidak dapat disimpulkan."] }, correctAnswer: "Paus bernapas dengan paru-paru.", explanation: { text: "Deduksi logis kategoris universal." } }
    ];
}

document.addEventListener('DOMContentLoaded', () => {
    window.CogniFlow = new CogniFlowEngine();
    window.CogniFlow.init();
    window.dbReadyPromise = buildDatabaseFromJSON();
});
