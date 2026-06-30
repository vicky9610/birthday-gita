// --- GLOBAL SPA NAVIGATION STATE ---
let currentSlide = 0;
const totalSlides = 14;
let isAnimating = false;

// Audio
const bgMusic = document.getElementById('bg-music');
const sfxClick = document.getElementById('sfx-click');
const sfxMagic = document.getElementById('sfx-magic');

document.addEventListener("DOMContentLoaded", () => {
    initBackgroundPhotos();
    initParticles();
    initNavigation();

    // Auto-start Slide 1 animations
    playSlideAnimations(0);
});

// --- NAVIGATION ENGINE ---
function initNavigation() {
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    btnNext.addEventListener('click', () => { sfxClick.play(); goToSlide(currentSlide + 1); });
    btnPrev.addEventListener('click', () => { sfxClick.play(); goToSlide(currentSlide - 1); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { goToSlide(currentSlide + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { goToSlide(currentSlide - 1); }
    });

    // Simple Swipe Detection
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    document.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) goToSlide(currentSlide + 1); // Swipe left -> next
        if (touchEndX > touchStartX + 50) goToSlide(currentSlide - 1); // Swipe right -> prev
    });
}

function goToSlide(index) {
    if (isAnimating || index < 0 || index >= totalSlides) return;
    isAnimating = true;

    const oldSlide = document.getElementById(`slide-${currentSlide + 1}`);
    const newSlide = document.getElementById(`slide-${index + 1}`);

    // Play music on first interaction if not playing
    if (bgMusic.paused) bgMusic.play().catch(e => console.log("Audio play blocked."));

    // GSAP Transition
    gsap.to(oldSlide, {
        opacity: 0, duration: 0.8, ease: "power2.inOut",
        onComplete: () => {
            oldSlide.classList.remove('active');
            oldSlide.classList.add('hidden');

            newSlide.classList.remove('hidden');
            newSlide.classList.add('active');

            // Randomize entrance animation
            const effects = [
                { y: 50, scale: 0.95 },
                { x: -50, scale: 1 },
                { scale: 1.1 },
                { rotationX: 10 }
            ];
            const eff = effects[Math.floor(Math.random() * effects.length)];

            gsap.fromTo(newSlide,
                { opacity: 0, ...eff },
                {
                    opacity: 1, x: 0, y: 0, scale: 1, rotationX: 0, duration: 1, ease: "power2.out",
                    onComplete: () => {
                        isAnimating = false;
                        currentSlide = index;
                        updateNavUI();
                        playSlideAnimations(currentSlide);
                    }
                }
            );
        }
    });
}

function updateNavUI() {
    const navOverlay = document.getElementById('navigation-overlay');
    // Show nav after slide 1
    if (currentSlide > 0 && currentSlide < totalSlides - 1) {
        navOverlay.classList.remove('hidden');
    } else {
        navOverlay.classList.add('hidden');
    }

    document.getElementById('slide-indicator').innerText = `${currentSlide + 1} / ${totalSlides}`;
    const pct = ((currentSlide) / (totalSlides - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${pct}%`;
}

// --- SLIDE SPECIFIC ANIMATIONS ---
function playSlideAnimations(slideIndex) {
    // S1: Terminal Loading
    if (slideIndex === 0) {
        new Typed('#terminal-text', {
            strings: ["> Initializing Love.exe...^500\n> Compiling Happiness...^500\n> Creating Birthday Surprise..."],
            typeSpeed: 40, showCursor: true,
            onComplete: () => {
                document.getElementById('loader-ui').classList.remove('hidden');
                let pct = 0;
                const int = setInterval(() => {
                    pct += Math.floor(Math.random() * 15) + 5;
                    if (pct > 100) pct = 100;
                    document.getElementById('load-pct').innerText = pct;
                    document.querySelector('.loading-bar .fill').style.width = pct + "%";
                    if (pct === 100) {
                        clearInterval(int);
                        setTimeout(() => goToSlide(1), 800);
                    }
                }, 200);
            }
        });
    }

    // S2: Hero
    if (slideIndex === 1) {
        document.querySelector('.start-btn').onclick = () => { sfxClick.play(); goToSlide(2); };
        new Typed('#hero-typing', {
            strings: ["Happy Birthday<br>My Love ❤️"],
            typeSpeed: 60, showCursor: false,
            onComplete: () => {
                const photo = document.getElementById('hero-photo');
                if (photo) {
                    photo.classList.remove('hidden');
                    gsap.fromTo(photo,
                        { scale: 0, opacity: 0, rotation: -15 },
                        { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: "back.out(1.5)" }
                    );
                }
            }
        });
    }

    // S3: Counters
    if (slideIndex === 2) {
        startCounters();
    }

    // S4: Letter
    if (slideIndex === 3) {
        const env = document.getElementById('envelope-wrapper');
        env.onclick = () => {
            if (!env.classList.contains('open')) {
                env.classList.add('open');
                sfxMagic.play();
                setTimeout(() => {
                    new Typed('#letter-typing', {
                        strings: ["Every day with you feels like the best chapter of my life. You are my dream come true. Happy Birthday. ❤️"],
                        typeSpeed: 30, showCursor: false
                    });
                }, 1000);
            }
        };
    }

    // S5: Timeline
    if (slideIndex === 4) {
        const tl = document.querySelector('.timeline-container');
        if (tl.children.length === 0) {
            const events = [
                { i: "fa-building", t: "The Beginning", d: "You joined my company." },
                { i: "fa-comments", t: "First Connection", d: "We started talking." },
                { i: "fa-person-walking-arrow-right", t: "The Plot Twist", d: "You resigned because I tried to make you my girlfriend." },
                { i: "fa-heart", t: "Never Gave Up", d: "During this time, I kept trying to make you mine." },
                { i: "fa-calendar-check", t: "April 5, 2024", d: "We met again, and you agreed to be my girlfriend! ❤️" },
                { i: "fa-infinity", t: "Forever", d: "We are still together." }
            ];
            events.forEach((ev, idx) => {
                const el = document.createElement('div');
                el.className = "timeline-event";
                el.innerHTML = `<i class="fa-solid ${ev.i}"></i><div><h4>${ev.t}</h4><p>${ev.d}</p></div>`;
                tl.appendChild(el);
                gsap.to(el, { opacity: 1, x: 0, duration: 0.8, delay: idx * 0.4, ease: "power2.out" });
            });
        }
    }

    // S6: Photo Gallery
    if (slideIndex === 5) {
        const gal = document.getElementById('photo-gallery');
        if (gal.children.length === 0) {
            // Generate exactly 82 images dynamically
            for (let i = 1; i <= 82; i++) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                const imgUrl = `photos/photo${i}.jpg`;
                const fallbackUrl = `https://picsum.photos/seed/luv${i}/600/800`;

                slide.setAttribute('data-src', imgUrl);
                const img = document.createElement('img');
                img.src = imgUrl;
                img.onerror = function () { this.src = fallbackUrl; slide.setAttribute('data-src', fallbackUrl); };

                slide.appendChild(img);
                gal.appendChild(slide);
            }

            new Swiper(".mySwiper", {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto",
                coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true },
                pagination: { el: ".swiper-pagination" },
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                loop: true,
            });

            lightGallery(gal, {
                plugins: [lgZoom, lgThumbnail],
                speed: 500,
                selector: '.swiper-slide:not(.swiper-slide-duplicate)'
            });
        }
    }

    // S7: 100 Reasons (Previously Slide 8)
    if (slideIndex === 6) {
        const deck = document.getElementById('reasons-deck');
        if (deck.children.length === 0) {
            const reasons = [
                "Everything about you ❤️",
                "Because you are you",
                "How you support my dreams",
                "Your warm hugs",
                "The way you hold my hand",
                "Your gorgeous eyes",
                "How you make me laugh",
                "Your endless kindness",
                "Your beautiful smile",
                "The way you look at me"
            ];
            reasons.forEach((r, i) => {
                const c = document.createElement('div');
                c.className = "reason-card";
                c.innerHTML = `<h3 class="font-dancing text-3xl text-pink">${r}</h3>`;
                gsap.set(c, { rotation: (Math.random() - 0.5) * 20, zIndex: 10 - i });
                c.onclick = () => {
                    sfxClick.play();
                    gsap.to(c, { x: 300, opacity: 0, rotation: 45, duration: 0.5, onComplete: () => c.remove() });
                };
                deck.appendChild(c);
            });
        }
    }

    // S8: Code Block (Previously Slide 9)
    if (slideIndex === 7) {
        document.getElementById('code-typing').innerHTML = "";
        new Typed('#code-typing', {
            strings: ["const girlfriend = {\n  beautiful: true,\n  perfect: true\n};\n\nwhile(true) {\n  love++;\n}"],
            typeSpeed: 40, showCursor: true
        });
    }

    // S9: Terminal Installation (Previously Slide 10)
    if (slideIndex === 8) {
        document.getElementById('term-cmd').innerHTML = "";
        new Typed('#term-cmd', {
            strings: ["npm install happiness"],
            typeSpeed: 50, showCursor: false,
            onComplete: () => {
                setTimeout(() => {
                    document.getElementById('term-output').classList.remove('hidden');
                    gsap.to('#install-fill', {
                        width: "100%", duration: 2, ease: "linear", onComplete: () => {
                            document.getElementById('term-success').classList.remove('hidden');
                        }
                    });
                }, 500);
            }
        });
    }

    // S10: Cake Cut Animation (Previously Slide 11)
    if (slideIndex === 9) {
        const lightBtn = document.getElementById('light-cake-btn');
        const blowBtn = document.getElementById('blow-cake-btn');
        const cutBtn = document.getElementById('cut-cake-btn');
        const flame = document.getElementById('cake-flame');
        const cakeTitle = document.getElementById('cake-title');

        cakeTitle.innerText = "Time for Cake!";

        lightBtn.onclick = () => {
            sfxMagic.play();
            flame.classList.remove('out');
            lightBtn.classList.add('hidden');
            blowBtn.classList.remove('hidden');
            cakeTitle.innerText = "Make a Wish ✨";
        };

        blowBtn.onclick = () => {
            sfxClick.play();
            flame.classList.add('out');
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });

            // Fly balloons!
            for (let i = 0; i < 30; i++) {
                const balloon = document.createElement('div');
                balloon.innerHTML = "🎈";
                balloon.style.position = 'fixed';
                balloon.style.fontSize = (Math.random() * 30 + 40) + 'px'; // 40px to 70px
                balloon.style.left = (Math.random() * 100) + 'vw';
                balloon.style.bottom = '-100px';
                balloon.style.zIndex = '9999';
                balloon.style.pointerEvents = 'none';

                document.body.appendChild(balloon);

                gsap.to(balloon, {
                    y: -window.innerHeight - 200,
                    x: `+=${Math.random() * 200 - 100}`,
                    rotation: Math.random() * 60 - 30,
                    duration: Math.random() * 4 + 4,
                    ease: "power1.inOut",
                    onComplete: () => balloon.remove()
                });
            }

            blowBtn.classList.add('hidden');
            cutBtn.classList.remove('hidden');
            cakeTitle.innerText = "Happy Birthday! 🎂";
        };

        cutBtn.onclick = () => {
            sfxClick.play();
            document.getElementById('cake-left').classList.add('cut');
            document.getElementById('cake-right').classList.add('cut');
            cutBtn.classList.add('hidden');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ff1493', '#b76e79', '#ffffff'] });
        };
    }

    // S11: Memory Quiz (Previously Slide 13)
    if (slideIndex === 10) {
        // Handled globally via checkQuiz()
    }

    // S12: Promises (Previously Slide 14)
    if (slideIndex === 11) {
        const pCont = document.getElementById('promise-container');
        if (pCont.children.length === 0) {
            const prom = [
                { i: 'fa-hand-holding-heart', t: 'I promise to always protect your heart.' },
                { i: 'fa-face-smile', t: 'I promise to make you smile every day.' },
                { i: 'fa-earth-americas', t: 'I promise to make every day special.' }
            ];
            prom.forEach((p, idx) => {
                const c = document.createElement('div');
                c.className = 'promise-card';
                c.innerHTML = `<i class="fa-solid ${p.i}"></i><p>${p.t}</p>`;
                pCont.appendChild(c);
                gsap.from(c, { y: 50, opacity: 0, duration: 0.8, delay: idx * 0.3 });
            });
        }
    }

    // S13: Future Dreams (Previously Slide 15)
    if (slideIndex === 12) {
        const dList = document.getElementById('dreams-list');
        if (dList.children.length === 0) {
            const dreams = ["Building an amazing life together", "Supporting each other's goals", "Growing old and holding hands"];
            dreams.forEach((d, idx) => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${d}`;
                dList.appendChild(li);
                gsap.to(li, { opacity: 1, y: 0, duration: 0.5, delay: idx * 0.5 });
            });
        }
    }

    // S14: Finale (Previously Slide 16)
    if (slideIndex === 13) {
        document.getElementById('final-text').innerHTML = "";
        new Typed('#final-text', {
            strings: ["No matter where life takes us...", "You will always be my favorite person.", "I love you. Forever. ❤️"],
            typeSpeed: 50, backSpeed: 30, showCursor: false,
            onComplete: () => {
                setTimeout(() => {
                    document.getElementById('final-text').classList.add('hidden');
                    document.querySelector('.finale-reveal').classList.remove('hidden');

                    // Massive Fireworks
                    const duration = 15 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
                    const interval = setInterval(function () {
                        const timeLeft = animationEnd - Date.now();
                        if (timeLeft <= 0) return clearInterval(interval);
                        const particleCount = 50 * (timeLeft / duration);
                        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
                    }, 250);
                }, 1000);
            }
        });
    }
}

// Global Helpers
function startCounters() {
    if (window.counterStarted) return;
    window.counterStarted = true;
    const startDate = new Date('2024-04-05T00:00:00').getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startDate;

        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('c-years').innerText = years;
        document.getElementById('c-months').innerText = months;
        document.getElementById('c-days').innerText = days;
        document.getElementById('c-hours').innerText = hours;
        document.getElementById('c-mins').innerText = mins;
        document.getElementById('c-secs').innerText = secs;
    }, 1000);
}

function checkQuiz(isCorrect) {
    sfxClick.play();
    const qOpts = document.getElementById('quiz-opts');
    if (isCorrect) {
        document.getElementById('quiz-q').innerText = "Correct! It's always been me ❤️";
        confetti();
        qOpts.style.display = 'none';
    } else {
        document.getElementById('quiz-q').innerText = "Wrong! Try again 😂";
        gsap.fromTo('.glass-panel', { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
    }
}

function initBackgroundPhotos() {
    const container = document.getElementById('bg-photos-container');
    if (!container || container.children.length > 0) return;

    const maxBubbles = 25; // Massive performance boost: only animate 25 DOM elements at once

    for (let i = 0; i < maxBubbles; i++) {
        const div = document.createElement('div');
        div.className = 'bg-photo-bubble';

        // Pick a random photo to start
        let photoIndex = Math.floor(Math.random() * 82) + 1;
        const imgUrl = `photos/photo${photoIndex}.jpg`;
        const fallbackUrl = `https://picsum.photos/seed/bg${photoIndex}/400/600`;
        div.style.backgroundImage = `url('${imgUrl}'), url('${fallbackUrl}')`;

        // Random size between 80px and 160px
        const size = Math.floor(Math.random() * 80) + 80;
        div.style.width = size + 'px';
        div.style.height = (size * 1.3) + 'px'; // portrait aspect ratio

        // Random start position
        const startX = Math.random() * 100; // vw
        const startY = Math.random() * 100 + 100; // start below screen

        div.style.left = startX + 'vw';
        div.style.top = startY + 'vh';

        container.appendChild(div);

        // GSAP Float animation
        const duration = Math.random() * 40 + 40; // 40-80 seconds (very slow)

        gsap.to(div, {
            y: `-250vh`,
            x: `+=${Math.random() * 20 - 10}vw`, // slight horizontal drift
            rotation: Math.random() * 60 - 30, // slow rotation
            duration: duration,
            ease: "none",
            repeat: -1,
            delay: -(Math.random() * duration), // Negative delay scatters them across the screen instantly
            onRepeat: () => {
                // Hot-swap photo when it reaches the top to cycle through all 82 without lag!
                let newIndex = Math.floor(Math.random() * 82) + 1;
                div.style.backgroundImage = `url('photos/photo${newIndex}.jpg'), url('https://picsum.photos/seed/bg${newIndex}/400/600')`;
            }
        });
    }
}

function initParticles() {
    // 1. Small Background Dots
    tsParticles.load("tsparticles", {
        particles: {
            number: { value: 50 },
            color: { value: ["#ff1493", "#b76e79", "#ffffff"] },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: { min: 2, max: 6 } }, /* Small circles */
            move: { enable: true, speed: 1.2, direction: "top", out_mode: "out" }
        },
        interactivity: { events: { onhover: { enable: true, mode: "bubble" } }, modes: { bubble: { size: 8, distance: 100 } } }
    });

    // 2. Large Floating Hearts
    tsParticles.load("tsparticles-hearts", {
        particles: {
            number: { value: 20 },
            color: { value: ["#ff1493", "#b76e79", "#ffffff"] },
            shape: {
                type: "char",
                options: {
                    char: {
                        value: ["❤️", "💖"],
                        font: "Arial"
                    }
                }
            },
            opacity: { value: 0.6, random: true },
            size: { value: { min: 12, max: 28 } }, /* Huge hearts */
            move: { enable: true, speed: 2, direction: "top", out_mode: "out" }
        },
        interactivity: { events: { onhover: { enable: true, mode: "bubble" } }, modes: { bubble: { size: 35, distance: 100 } } }
    });
}
