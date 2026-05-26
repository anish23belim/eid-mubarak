document.addEventListener('DOMContentLoaded', () => {
    // 1. Generate Stars
    createStars();

    const formView = document.getElementById('form-view');
    const surpriseView = document.getElementById('surprise-view');
    const greetingView = document.getElementById('greeting-view');
    const greetingForm = document.getElementById('greeting-form');
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    // Messages for rotation
    const messages = [
        "May the divine blessings of Allah bring you hope, faith, and joy on Eid-ul-Fitr and forever.",
        "Eid Mubarak! Wishing you joy, peace, and infinite blessings today and always.",
        "May this Eid bring smiles that never fade. Eid Mubarak!",
        "Blessed Eid to you and your loved ones!",
        "Wishing you and your family a beautiful and blessed Eid celebration. May this day bring you closer to those you love. Eid Mubarak!"
    ];
    let currentMessageIndex = 0;
    let messageInterval;

    // Check URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const rawName = urlParams.get('name');
    
    if (rawName && rawName.trim().length > 0) {
        // Someone received a link, show the "Surprise" view first
        formView.style.display = 'none';
        surpriseView.style.display = 'block';
        
        let userName = rawName.trim();
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        document.getElementById('display-name').textContent = userName;

        // When they click the surprise, start greeting and music
        surpriseView.addEventListener('click', () => {
            surpriseView.style.display = 'none';
            showGreetingAndPlayMusic();
        });
    } else {
        // Normal form view
        formView.style.display = 'block';
        if (greetingForm) {
            greetingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('name').value.trim();
                const mobileInput = document.getElementById('mobile') ? document.getElementById('mobile').value.trim() : '';
                
                if (nameInput) {
                    // Send Data to Google Sheet
                    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYCesuqNayvkafF2_X8zbHdWw8tbr4iUL6qdWe0-PC5iCKTKKcQnf5aHX4uEXxt1SI/exec";
                    
                    const formData = new FormData();
                    formData.append("Name", nameInput);
                    formData.append("Mobile", mobileInput);
                    
                    fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors' // Important for simple Google Script integration
                    }).catch(err => console.error("Error saving to sheet:", err));

                    const formattedName = nameInput.charAt(0).toUpperCase() + nameInput.slice(1);
                    document.getElementById('display-name').textContent = formattedName;
                    formView.style.display = 'none';
                    showGreetingAndPlayMusic();
                }
            });
        }
    }

    function showGreetingAndPlayMusic() {
        greetingView.style.display = 'block';
        if (musicBtn) musicBtn.style.display = 'block';
        
        // Trigger SVG Drawing Animation
        const calligraphyText = document.getElementById('arabic-text-svg');
        if (calligraphyText) {
            calligraphyText.classList.remove('draw-animation');
            void calligraphyText.offsetWidth; // Trigger reflow to restart animation
            calligraphyText.classList.add('draw-animation');
        }
        
        // Start Music
        if (bgMusic) {
            bgMusic.play().then(() => {
                isPlaying = true;
                if (musicBtn) musicBtn.textContent = '⏸ Pause Music';
            }).catch(err => {
                console.log("Audio play failed:", err);
                isPlaying = false;
                if (musicBtn) musicBtn.textContent = '🎵 Play Music';
            });
        }

        // Start Confetti
        if (typeof confetti === 'function') {
            setTimeout(shootConfetti, 500);
            setInterval(shootConfetti, 4000);
        }

        // Start Message Rotation
        const messageElement = document.getElementById('dynamic-message');
        if (messageElement) {
            messageElement.textContent = messages[0];
            messageInterval = setInterval(() => {
                messageElement.style.opacity = 0;
                setTimeout(() => {
                    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
                    messageElement.textContent = messages[currentMessageIndex];
                    messageElement.style.opacity = 1;
                }, 500);
            }, 5000);
        }
    }

    // Music Toggle Button
    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicBtn.textContent = '🎵 Play Music';
            } else {
                bgMusic.play();
                musicBtn.textContent = '⏸ Pause Music';
            }
            isPlaying = !isPlaying;
        });
    }

    // WhatsApp Share Button
    const waBtn = document.getElementById('whatsapp-share');
    if (waBtn) {
        waBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentName = document.getElementById('display-name').textContent;
            
            // Build the URL with the name parameter
            const baseUrl = window.location.href.split('?')[0];
            const shareUrl = `${baseUrl}?name=${encodeURIComponent(currentName)}`;
            
            const message = `✨ Eid Mubarak! ✨\n\nI have sent you a special Eid greeting. Check it out here:\n${shareUrl}\n\nMay this Eid bring you joy and peace! 🌙`;
            
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // Create Own Button
    const createOwnBtn = document.getElementById('create-own');
    if (createOwnBtn) {
        createOwnBtn.addEventListener('click', () => {
            window.location.href = window.location.href.split('?')[0];
        });
    }
});

// Helper Functions
function createStars() {
    const starsContainer = document.getElementById('stars-container');
    if (!starsContainer) return;
    
    // Regular twinkling stars
    const count = 50;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 3 + 2;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }

    // Shooting stars
    const shootingCount = 5;
    for (let j = 0; j < shootingCount; j++) {
        const shooting = document.createElement('div');
        shooting.classList.add('shooting-star');
        const sx = Math.random() * 100;
        const sy = Math.random() * 50; // Start mostly in top half
        const sDelay = Math.random() * 10;
        const sDuration = Math.random() * 2 + 2;
        shooting.style.left = `${sx}%`;
        shooting.style.top = `${sy}%`;
        shooting.style.animation = `shooting ${sDuration}s linear infinite`;
        shooting.style.animationDelay = `${sDelay}s`;
        
        // Dynamic keyframes for shooting star
        const animName = 'shoot' + j;
        const styleSheet = document.styleSheets[0];
        const keyframes = `
            @keyframes ${animName} {
                0% { transform: translate(0, 0) rotate(45deg); opacity: 1; }
                20% { transform: translate(-300px, 300px) rotate(45deg); opacity: 0; }
                100% { opacity: 0; }
            }
        `;
        try {
            styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
            shooting.style.animationName = animName;
        } catch(e) {}
        
        starsContainer.appendChild(shooting);
    }
}

function shootConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#D4AF37', '#065f43', '#ffffff']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#D4AF37', '#065f43', '#ffffff']
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
