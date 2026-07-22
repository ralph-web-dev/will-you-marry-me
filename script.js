document.addEventListener('DOMContentLoaded', () => {
    const bgCanvas = document.getElementById('bg-canvas');
    const celebrationCanvas = document.getElementById('celebration-canvas');
    const ringTrigger = document.getElementById('ring-trigger');
    const proposalModal = document.getElementById('proposal-modal');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const runawayToast = document.getElementById('runaway-toast');
    const successOverlay = document.getElementById('success-overlay');
    const replayBtn = document.getElementById('replay-btn');
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = themeBtn ? themeBtn.querySelector('.theme-label') : null;
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    const soundLabel = soundBtn.querySelector('.control-label');
    const fearlessSong = document.getElementById('fearless-song');
    const catOverlay = document.getElementById('cat-overlay');
    const catSong = document.getElementById('cat-song');
    const catCloseBtn = document.getElementById('cat-close-btn');
    const catTriggerBadge = document.getElementById('cat-trigger-badge');

    let soundEnabled = true;
    let currentTheme = 'dark';
    let audioCtx = null;
    let isNoBtnRunaway = false;
    let toastTimeout = null;

    const runawayQuotes = [
        "BLEHHH! HAHA! 😜",
        "BLEHHH! Nice try! 😛",
        "BLEHHH! Only YES allowed! 💕",
        "BLEHHH! Catch me! 💨",
        "BLEHHH! HAHA! 🏃‍♂️",
        "BLEHHH! Too slow! ⚡",
        "BLEHHH! Can't touch this! 😜",
        "BLEHHH! YES is right there! 👉💖"
    ];

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playNote(freq, type = 'sine', duration = 0.3, delay = 0, gainVal = 0.15) {
        if (!soundEnabled) return;
        initAudioContext();
        if (!audioCtx) return;

        setTimeout(() => {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {}
        }, delay * 1000);
    }

    function playRingClickSound() {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            playNote(freq, 'sine', 0.6, idx * 0.08, 0.12);
        });
    }

    let lastNoSoundTime = 0;

    function playFunnyBoingSound() {
        if (!soundEnabled) return;
        initAudioContext();
        if (!audioCtx) return;

        const now = Date.now();
        if (now - lastNoSoundTime < 350) return;
        lastNoSoundTime = now;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.14);

            gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.16);
        } catch (e) {}
    }

    function playVictorySound() {
        if (!soundEnabled) return;
        initAudioContext();
        if (!audioCtx) return;

        const sweetNotes = [
            { f: 349.23, d: 1.2, t: 0.0, gain: 0.15 },
            { f: 440.00, d: 1.2, t: 0.08, gain: 0.15 },
            { f: 523.25, d: 1.2, t: 0.16, gain: 0.15 },
            { f: 659.25, d: 1.4, t: 0.24, gain: 0.18 },
            { f: 783.99, d: 1.5, t: 0.38, gain: 0.18 },
            { f: 1046.50, d: 1.8, t: 0.52, gain: 0.20 },
            { f: 1318.51, d: 2.2, t: 0.70, gain: 0.22 }
        ];

        sweetNotes.forEach(n => {
            try {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(n.f, audioCtx.currentTime + n.t);

                gain.gain.setValueAtTime(0.001, audioCtx.currentTime + n.t);
                gain.gain.exponentialRampToValueAtTime(n.gain, audioCtx.currentTime + n.t + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + n.t + n.d);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(audioCtx.currentTime + n.t);
                osc.stop(audioCtx.currentTime + n.t + n.d);
            } catch (e) {}
        });
    }

    const faviconElement = document.getElementById('favicon');
    const paletteDots = document.querySelectorAll('.palette-dot');

    const themeFavicons = {
        cream: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='40' r='17' fill='none' stroke='%23C59B27' stroke-width='4.5'/%3E%3Cpolygon points='32,10 41,20 32,29 23,20' fill='%23FFFFFF' stroke='%23C59B27' stroke-width='1.2'/%3E%3Cpolygon points='32,10 41,20 32,20' fill='%23FFFBF7'/%3E%3Cpolygon points='32,20 41,20 32,29' fill='%23E05275' opacity='0.3'/%3E%3Cpath d='M44,12 L46,15 L49,15 L46,17 L47,20 L44,18 L41,20 L42,17 L39,15 L42,15 Z' fill='%23C59B27'/%3E%3C/svg%3E",
        dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='40' r='17' fill='none' stroke='%23F4C430' stroke-width='4.5'/%3E%3Cpolygon points='32,10 41,20 32,29 23,20' fill='%23FFFFFF' stroke='%23F4C430' stroke-width='1.2'/%3E%3Cpolygon points='32,10 41,20 32,20' fill='%23FFF2A1'/%3E%3Cpolygon points='32,20 41,20 32,29' fill='%23FF3B6B' opacity='0.4'/%3E%3Cpath d='M44,12 L46,15 L49,15 L46,17 L47,20 L44,18 L41,20 L42,17 L39,15 L42,15 Z' fill='%23FFF2A1'/%3E%3C/svg%3E",
        blush: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='40' r='17' fill='none' stroke='%23FF4D6D' stroke-width='4.5'/%3E%3Cpolygon points='32,10 41,20 32,29 23,20' fill='%23FFFFFF' stroke='%23FF4D6D' stroke-width='1.2'/%3E%3Cpolygon points='32,10 41,20 32,20' fill='%23FFF0F3'/%3E%3Cpolygon points='32,20 41,20 32,29' fill='%23FF4D6D' opacity='0.3'/%3E%3Cpath d='M44,12 L46,15 L49,15 L46,17 L47,20 L44,18 L41,20 L42,17 L39,15 L42,15 Z' fill='%23FF4D6D'/%3E%3C/svg%3E",
        lavender: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='40' r='17' fill='none' stroke='%23C77DFF' stroke-width='4.5'/%3E%3Cpolygon points='32,10 41,20 32,29 23,20' fill='%23FFFFFF' stroke='%23C77DFF' stroke-width='1.2'/%3E%3Cpolygon points='32,10 41,20 32,20' fill='%23E0AAFF'/%3E%3Cpolygon points='32,20 41,20 32,29' fill='%23C77DFF' opacity='0.4'/%3E%3Cpath d='M44,12 L46,15 L49,15 L46,17 L47,20 L44,18 L41,20 L42,17 L39,15 L42,15 Z' fill='%23E0AAFF'/%3E%3C/svg%3E",
        sage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='40' r='17' fill='none' stroke='%2352796F' stroke-width='4.5'/%3E%3Cpolygon points='32,10 41,20 32,29 23,20' fill='%23FFFFFF' stroke='%2352796F' stroke-width='1.2'/%3E%3Cpolygon points='32,10 41,20 32,20' fill='%23F4F7F4'/%3E%3Cpolygon points='32,20 41,20 32,29' fill='%2352796F' opacity='0.3'/%3E%3Cpath d='M44,12 L46,15 L49,15 L46,17 L47,20 L44,18 L41,20 L42,17 L39,15 L42,15 Z' fill='%23C59B27'/%3E%3C/svg%3E"
    };

    function applyPaletteTheme(themeName) {
        currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        
        if (faviconElement && themeFavicons[themeName]) {
            faviconElement.href = themeFavicons[themeName];
        }

        paletteDots.forEach(dot => {
            if (dot.getAttribute('data-theme-val') === themeName) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    paletteDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const selectedTheme = dot.getAttribute('data-theme-val');
            applyPaletteTheme(selectedTheme);
        });
    });

    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🎵' : '🔇';
        soundLabel.textContent = soundEnabled ? 'Sound On' : 'Muted';
        if (soundEnabled) {
            initAudioContext();
            if (catSong && catOverlay && !catOverlay.classList.contains('hidden')) {
                catSong.play().catch(e => console.log('Audio play error:', e));
            } else if (fearlessSong && !successOverlay.classList.contains('hidden')) {
                fearlessSong.play().catch(e => console.log('Audio play error:', e));
            }
        } else {
            if (fearlessSong) fearlessSong.pause();
            if (catSong) catSong.pause();
        }
    });

    const bgCtx = bgCanvas.getContext('2d');
    let bgParticles = [];
    const particleCount = 45;

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();

    class BgParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * bgCanvas.width;
            this.y = initial ? Math.random() * bgCanvas.height : bgCanvas.height + 20;
            this.size = Math.random() * 14 + 8;
            this.speedY = Math.random() * 0.8 + 0.3;
            this.sway = Math.random() * 0.02 + 0.005;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
            this.color = Math.random() > 0.5 ? '#ff7597' : '#f4c430';
        }

        update() {
            this.y -= this.speedY;
            this.swayOffset += this.sway;
            this.x += Math.sin(this.swayOffset) * 0.6;

            if (this.y < -30) {
                this.reset(false);
            }
        }

        draw() {
            bgCtx.save();
            bgCtx.globalAlpha = this.opacity;
            bgCtx.fillStyle = this.color;

            if (this.type === 'heart') {
                bgCtx.font = `${this.size}px serif`;
                bgCtx.fillText('❤️', this.x, this.y);
            } else {
                bgCtx.font = `${this.size * 0.8}px serif`;
                bgCtx.fillText('✨', this.x, this.y);
            }
            bgCtx.restore();
        }
    }

    function initBgParticles() {
        bgParticles = [];
        for (let i = 0; i < particleCount; i++) {
            bgParticles.push(new BgParticle());
        }
    }

    function animateBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgParticles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateBg);
    }

    initBgParticles();
    animateBg();

    let modalOpenedTime = 0;

    function openModal() {
        initAudioContext();
        playRingClickSound();
        proposalModal.classList.remove('hidden');
        resetNoBtnPosition();
        modalOpenedTime = Date.now();
    }

    ringTrigger.addEventListener('click', openModal);
    ringTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    const buttonsArea = document.getElementById('buttons-area');

    function resetNoBtnPosition() {
        isNoBtnRunaway = false;
        noBtn.classList.remove('runaway');
        noBtn.style.display = '';
        noBtn.style.left = '';
        noBtn.style.top = '';
        noBtn.style.transform = '';
        if (buttonsArea && noBtn.parentElement !== buttonsArea) {
            buttonsArea.appendChild(noBtn);
        }
        if (runawayToast) runawayToast.classList.add('hidden');
    }

    function showToast(text) {
        if (!runawayToast) return;
        const blehhhText = runawayToast.querySelector('.blehhh-text');
        if (blehhhText) {
            blehhhText.textContent = text;
        } else {
            runawayToast.textContent = text;
        }
        runawayToast.classList.remove('hidden');

        requestAnimationFrame(() => {
            const toastRect = runawayToast.getBoundingClientRect();
            let shiftX = 0;
            if (toastRect.left < 12) {
                shiftX = 12 - toastRect.left;
            } else if (toastRect.right > window.innerWidth - 12) {
                shiftX = (window.innerWidth - 12) - toastRect.right;
            }
            runawayToast.style.transform = `translateX(calc(-50% + ${shiftX}px))`;
        });

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            runawayToast.classList.add('hidden');
        }, 1500);
    }

    function getSafeRunawayPosition(noRect) {
        const isSmallScreen = window.innerWidth < 600;
        const yesRect = yesBtn ? yesBtn.getBoundingClientRect() : null;

        const btnW = noRect.width || 100;
        const btnH = noRect.height || 45;

        const minX = isSmallScreen ? 40 : 70;
        const maxX = Math.max(minX, window.innerWidth - btnW - (isSmallScreen ? 40 : 70));
        const minY = isSmallScreen ? 85 : 120;
        const maxY = Math.max(minY, window.innerHeight - btnH - (isSmallScreen ? 25 : 45));

        let randomX = minX + Math.random() * (maxX - minX);
        let randomY = minY + Math.random() * (maxY - minY);

        if (yesRect && yesRect.width > 0) {
            const buffer = 35;
            for (let i = 0; i < 20; i++) {
                const overlapX = (randomX < yesRect.right + buffer) && (randomX + btnW > yesRect.left - buffer);
                const overlapY = (randomY < yesRect.bottom + buffer) && (randomY + btnH > yesRect.top - buffer);
                if (!overlapX || !overlapY) break;
                randomX = minX + Math.random() * (maxX - minX);
                randomY = minY + Math.random() * (maxY - minY);
            }
        }

        return { x: randomX, y: randomY };
    }

    function escapeNoButton(cursorX, cursorY) {
        if (proposalModal.classList.contains('hidden')) return;
        if (Date.now() - modalOpenedTime < 600) return;

        const isSmallScreen = window.innerWidth < 600;
        const proximityThreshold = isSmallScreen ? 70 : 150;

        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dx = cursorX - btnCenterX;
        const dy = cursorY - btnCenterY;
        const distance = Math.hypot(dx, dy);

        if (distance < proximityThreshold) {
            playFunnyBoingSound();

            if (!isNoBtnRunaway) {
                isNoBtnRunaway = true;
                noBtn.classList.add('runaway');
                document.body.appendChild(noBtn);
            }

            const safePos = getSafeRunawayPosition(rect);
            noBtn.style.left = `${safePos.x}px`;
            noBtn.style.top = `${safePos.y}px`;

            const randomQuote = runawayQuotes[Math.floor(Math.random() * runawayQuotes.length)];
            showToast(randomQuote);
        }
    }

    document.addEventListener('mousemove', (e) => {
        escapeNoButton(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            escapeNoButton(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    const interceptEvents = ['mouseenter', 'mouseover', 'touchstart', 'pointerdown', 'focus'];
    interceptEvents.forEach(evtType => {
        noBtn.addEventListener(evtType, (e) => {
            if (proposalModal.classList.contains('hidden')) return;
            if (Date.now() - modalOpenedTime < 600) return;
            if (e.target !== noBtn && !noBtn.contains(e.target)) return;

            e.preventDefault();

            const rect = noBtn.getBoundingClientRect();
            
            if (!isNoBtnRunaway) {
                isNoBtnRunaway = true;
                noBtn.classList.add('runaway');
                document.body.appendChild(noBtn);
            }

            const safePos = getSafeRunawayPosition(rect);
            noBtn.style.left = `${safePos.x}px`;
            noBtn.style.top = `${safePos.y}px`;

            playFunnyBoingSound();
            showToast("BLEHHH! HAHA! 😜");
        });
    });

    const celCtx = celebrationCanvas.getContext('2d');
    let confettiParticles = [];
    let celAnimationId = null;
    let celebrationInterval = null;

    function resizeCelCanvas() {
        celebrationCanvas.width = window.innerWidth;
        celebrationCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCelCanvas);
    resizeCelCanvas();

    class Confetti {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 10 + 6;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 2;
            this.gravity = 0.22;
            this.drag = 0.96;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.15;
            this.colors = ['#ff3b6b', '#f4c430', '#fff2a1', '#ff7597', '#ffffff', '#80deea'];
            this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
            this.opacity = 1;
            this.decay = Math.random() * 0.015 + 0.01;
        }

        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.opacity -= this.decay;
        }

        draw() {
            if (this.opacity <= 0) return;
            celCtx.save();
            celCtx.globalAlpha = this.opacity;
            celCtx.translate(this.x, this.y);
            celCtx.rotate(this.rotation);
            celCtx.fillStyle = this.color;

            if (this.shape === 'rect') {
                celCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            } else {
                celCtx.beginPath();
                celCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                celCtx.fill();
            }

            celCtx.restore();
        }
    }

    function triggerConfettiBurst() {
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight / 2;

        if (confettiParticles.length > 80) return;

        for (let i = 0; i < 45; i++) {
            confettiParticles.push(new Confetti(originX, originY));
        }

        for (let i = 0; i < 15; i++) {
            confettiParticles.push(new Confetti(50, window.innerHeight - 50));
            confettiParticles.push(new Confetti(window.innerWidth - 50, window.innerHeight - 50));
        }
    }

    function animateCelebration() {
        celCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

        confettiParticles = confettiParticles.filter(p => p.opacity > 0);
        confettiParticles.forEach(p => {
            p.update();
            p.draw();
        });

        if (confettiParticles.length > 0) {
            celAnimationId = requestAnimationFrame(animateCelebration);
        } else {
            celCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
        }
    }

    let fadeInInterval = null;
    let fadeOutInterval = null;
    let catCrashTimeout = null;
    // Set timestamp in seconds to jump straight to the chorus (e.g. 48s for Fearless chorus)
    const SONG_START_TIME = 48;

    function playFearlessSong() {
        if (!fearlessSong || !soundEnabled) return;
        if (fadeInInterval) clearInterval(fadeInInterval);
        if (fadeOutInterval) clearInterval(fadeOutInterval);
        if (catCrashTimeout) clearTimeout(catCrashTimeout);

        fearlessSong.currentTime = SONG_START_TIME;
        fearlessSong.volume = 0;
        const playPromise = fearlessSong.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                let vol = 0;
                fadeInInterval = setInterval(() => {
                    vol = Math.min(1, vol + 0.08);
                    fearlessSong.volume = vol;
                    if (vol >= 1) clearInterval(fadeInInterval);
                }, 50);

                // Crash the proposal with cat MENGGAY after 7.5 seconds into chorus
                catCrashTimeout = setTimeout(() => {
                    if (successOverlay && !successOverlay.classList.contains('hidden')) {
                        showCatSurprise();
                    }
                }, 7500);
            }).catch(e => console.log('Audio play error:', e));
        }
    }

    function stopFearlessSong() {
        if (!fearlessSong) return;
        if (fadeInInterval) clearInterval(fadeInInterval);
        if (fadeOutInterval) clearInterval(fadeOutInterval);
        if (catCrashTimeout) clearTimeout(catCrashTimeout);

        let vol = fearlessSong.volume;
        fadeOutInterval = setInterval(() => {
            vol = Math.max(0, vol - 0.15);
            fearlessSong.volume = vol;
            if (vol <= 0) {
                clearInterval(fadeOutInterval);
                fearlessSong.pause();
                fearlessSong.currentTime = 0;
            }
        }, 40);
    }

    const slideItems = document.querySelectorAll('.slide-item');
    const slideDots = document.querySelectorAll('.slide-dots .dot');
    const slidesTrack = document.getElementById('slides-track');
    let currentSlideIndex = 0;
    let slideshowInterval = null;

    function goToSlide(index) {
        if (!slideItems.length) return;
        currentSlideIndex = (index + slideItems.length) % slideItems.length;

        if (slidesTrack) {
            slidesTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        }

        slideItems.forEach((slide, i) => {
            if (i === currentSlideIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        slideDots.forEach((dot, i) => {
            if (i === currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    slideDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
            goToSlide(slideIdx);
        });
    });

    function startSlideshowSync() {
        goToSlide(0);
        if (slideshowInterval) clearInterval(slideshowInterval);

        const slideDurationMs = 3800;

        slideshowInterval = setInterval(() => {
            if (successOverlay.classList.contains('hidden')) {
                clearInterval(slideshowInterval);
                return;
            }

            const nextIdx = (currentSlideIndex + 1) % slideItems.length;
            goToSlide(nextIdx);
        }, slideDurationMs);
    }

    function handleYesClick() {
        playVictorySound();
        proposalModal.classList.add('hidden');
        if (noBtn) {
            noBtn.style.display = 'none';
        }

        setTimeout(() => {
            const successCard = successOverlay.querySelector('.success-card');
            if (successCard) {
                successCard.style.animation = 'none';
                void successCard.offsetWidth;
                successCard.style.animation = '';
            }
            successOverlay.classList.remove('hidden');
            playFearlessSong();
            startSlideshowSync();
        }, 150);

        triggerConfettiBurst();
        if (celAnimationId) cancelAnimationFrame(celAnimationId);
        animateCelebration();

        setTimeout(() => {
            if (!successOverlay.classList.contains('hidden')) {
                triggerConfettiBurst();
                animateCelebration();
            }
        }, 450);

        if (celebrationInterval) clearInterval(celebrationInterval);
        celebrationInterval = setInterval(() => {
            if (successOverlay.classList.contains('hidden')) {
                clearInterval(celebrationInterval);
                return;
            }
            triggerConfettiBurst();
            animateCelebration();
        }, 2200);
    }

    let catDismissTimeout = null;

    function dismissCatSurprise() {
        if (catDismissTimeout) clearTimeout(catDismissTimeout);
        if (catSong) {
            catSong.pause();
            catSong.currentTime = 0;
        }
        if (fearlessSong && soundEnabled && !successOverlay.classList.contains('hidden')) {
            fearlessSong.volume = 1;
            fearlessSong.play().catch(e => console.log('Fearless resume error:', e));
        }
        if (catOverlay) catOverlay.classList.add('hidden');
    }

    function showCatSurprise() {
        if (fearlessSong) {
            fearlessSong.pause();
        }
        if (catOverlay) catOverlay.classList.remove('hidden');

        if (soundEnabled && catSong) {
            catSong.currentTime = 0;
            catSong.volume = 1;
            catSong.play().catch(e => console.log('Cat song play error:', e));
        }

        triggerConfettiBurst();
        if (celAnimationId) cancelAnimationFrame(celAnimationId);
        animateCelebration();
    }

    if (catTriggerBadge) {
        catTriggerBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            showCatSurprise();
        });
    }

    if (catCloseBtn) {
        catCloseBtn.addEventListener('click', () => {
            dismissCatSurprise();
        });
    }

    yesBtn.addEventListener('click', handleYesClick);

    replayBtn.addEventListener('click', () => {
        if (celebrationInterval) clearInterval(celebrationInterval);
        if (slideshowInterval) clearInterval(slideshowInterval);
        if (catCrashTimeout) clearTimeout(catCrashTimeout);
        if (catDismissTimeout) clearTimeout(catDismissTimeout);
        confettiParticles = [];
        celCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
        stopFearlessSong();
        if (catSong) {
            catSong.pause();
            catSong.currentTime = 0;
        }
        if (catOverlay) catOverlay.classList.add('hidden');
        goToSlide(0);
        successOverlay.classList.add('hidden');
        resetNoBtnPosition();
    });
});
