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

    // Photo Upload Logic
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    const uploadText = document.getElementById('upload-text');
    let uploadedPhotoData = null;

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 150; // Smaller size for safe Google Sheet insertion
                        const scaleSize = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Compress heavily to ensure it fits in Google Sheets cell limit (50k chars)
                        uploadedPhotoData = canvas.toDataURL('image/jpeg', 0.4);
                        
                        if (photoPreview) {
                            photoPreview.src = uploadedPhotoData;
                            photoPreview.style.display = 'block';
                        }
                        if (uploadText) {
                            uploadText.textContent = '📸 Photo Selected! (Change)';
                        }
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

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
        surpriseView.style.display = 'flex';
        
        let userName = rawName.trim();
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        document.getElementById('display-name').textContent = userName;

        // When they click the surprise, start greeting and music
        surpriseView.addEventListener('click', () => {
            const envelope = document.querySelector('.envelope');
            if (envelope && !envelope.classList.contains('open')) {
                envelope.classList.add('open');
                
                // Wait for animation to finish before showing greeting
                setTimeout(() => {
                    surpriseView.style.opacity = '0';
                    setTimeout(() => {
                        surpriseView.style.display = 'none';
                        showGreetingAndPlayMusic();
                    }, 500);
                }, 2000);
            }
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
                    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbirDyxhSofoxc_Zg9Bk7cVp7sEg4u0JYKi2HjKU8JMWgI9xM6fe-FMMncwTOcXvg/exec";
                    
                    // Use URLSearchParams for reliable application/x-www-form-urlencoded submission
                    const searchParams = new URLSearchParams();
                    searchParams.append("Name", nameInput);
                    searchParams.append("Mobile", mobileInput);
                    if (uploadedPhotoData) {
                        searchParams.append("Photo", uploadedPhotoData);
                    }
                    
                    fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        body: searchParams,
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

        // Initialize 3D Lantern
        init3DLantern();
        
        
        // Show Photo if uploaded
        const greetingPhotoContainer = document.getElementById('greeting-photo-container');
        const greetingPhoto = document.getElementById('greeting-photo');
        if (uploadedPhotoData && greetingPhotoContainer && greetingPhoto) {
            greetingPhoto.src = uploadedPhotoData;
            greetingPhotoContainer.style.display = 'block';
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

    // Eidi Claim Button Logic
    const claimEidiBtn = document.getElementById('claim-eidi-btn');
    const eidiModal = document.getElementById('eidi-modal');
    const closeModal = document.getElementById('close-modal');
    const eidiMessage = document.getElementById('eidi-message');

    if (claimEidiBtn) {
        claimEidiBtn.addEventListener('click', () => {
            // Golden Confetti Explosion
            const duration = 3000;
            const end = Date.now() + duration;
            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#FFD700', '#DAA520', '#F9E596']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#FFD700', '#DAA520', '#F9E596']
                });
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            // Setup Modal Message
            const senderName = document.getElementById('display-name').textContent || 'Aapke dost';
            eidiMessage.innerHTML = `<strong>${senderName}</strong> ne aapko ₹500 ki Digital Eidi bheji hai...<br><br>Kharch mat karna! 😜`;
            
            // Show Modal
            eidiModal.style.display = 'flex';

            // Disable button
            claimEidiBtn.textContent = 'Eidi Claimed! 💰';
            claimEidiBtn.disabled = true;
            claimEidiBtn.style.opacity = '0.7';
            claimEidiBtn.style.cursor = 'not-allowed';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            eidiModal.style.display = 'none';
        });
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
            
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.location.href = whatsappUrl;
        });
    }

    // Create Own Button
    const createOwnBtn = document.getElementById('create-own');
    if (createOwnBtn) {
        createOwnBtn.addEventListener('click', () => {
            window.location.href = window.location.href.split('?')[0];
        });
    }

    // Magic Touch Sparkles
    const createSparkle = (x, y) => {
        const sparkle = document.createElement('div');
        sparkle.classList.add('magic-sparkle');
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        
        const colors = ['#D4AF37', '#F9E596', '#065f43', '#ffffff'];
        sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    };

    let lastMove = 0;
    document.addEventListener('mousemove', (e) => {
        if (Date.now() - lastMove > 30) {
            createSparkle(e.clientX, e.clientY);
            lastMove = Date.now();
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (Date.now() - lastMove > 30) {
            const touch = e.touches[0];
            createSparkle(touch.clientX, touch.clientY);
            lastMove = Date.now();
        }
    }, { passive: true });
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
let lanternInitialized = false;
function init3DLantern() {
    if (lanternInitialized) return;
    const container = document.getElementById('lantern-3d-container');
    if (!container || typeof THREE === 'undefined') return;
    lanternInitialized = true;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5.5;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const lantern = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, transmission: 0.9, opacity: 1, metalness: 0, roughness: 0.1, ior: 1.5, thickness: 0.1
    });

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.2, 6);
    const base = new THREE.Mesh(baseGeo, goldMat);
    base.position.y = -1;
    lantern.add(base);

    // Body (Glass)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 6);
    const body = new THREE.Mesh(bodyGeo, glassMat);
    body.position.y = -0.15;
    lantern.add(body);

    // Edges (Gold Frame)
    const edgeGeo = new THREE.EdgesGeometry(bodyGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
    wireframe.position.y = -0.15;
    lantern.add(wireframe);

    // Top Cap
    const capGeo = new THREE.CylinderGeometry(0.65, 0.55, 0.2, 6);
    const cap = new THREE.Mesh(capGeo, goldMat);
    cap.position.y = 0.7;
    lantern.add(cap);

    // Roof
    const roofGeo = new THREE.ConeGeometry(0.65, 0.8, 6);
    const roof = new THREE.Mesh(roofGeo, goldMat);
    roof.position.y = 1.2;
    lantern.add(roof);

    // Top Ring
    const ringGeo = new THREE.TorusGeometry(0.15, 0.04, 8, 16);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.position.y = 1.7;
    ring.rotation.x = Math.PI / 2;
    lantern.add(ring);

    scene.add(lantern);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(2, 4, 2);
    scene.add(dirLight);

    // Glowing Inner Light
    const innerLight = new THREE.PointLight(0xf9e596, 0, 10);
    innerLight.position.set(0, -0.15, 0);
    scene.add(innerLight);

    // Interaction
    let isDragging = false;
    let previousX = 0;
    let rotationVelocity = 0;
    let totalRotation = 0;
    const calligraphy = document.querySelector('.calligraphy-container');

    const onDown = (x) => { isDragging = true; previousX = x; };
    const onMove = (x) => {
        if (!isDragging) return;
        const deltaX = x - previousX;
        rotationVelocity = deltaX * 0.01;
        totalRotation += Math.abs(rotationVelocity);
        
        let intensity = Math.min(2.5, totalRotation * 0.1);
        innerLight.intensity = intensity;
        
        if (calligraphy) {
            let opacity = Math.min(1, 0.1 + totalRotation * 0.05);
            calligraphy.style.opacity = opacity;
        }

        if (intensity > 1) {
            container.classList.add('glowing');
            const hint = container.querySelector('.drag-hint');
            if (hint) hint.style.opacity = 0;
        }
        previousX = x;
    };
    const onUp = () => { isDragging = false; };

    container.addEventListener('mousedown', (e) => onDown(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onUp);

    container.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), {passive: true});
    window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), {passive: true});
    window.addEventListener('touchend', onUp);

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) rotationVelocity *= 0.95;
        if (Math.abs(rotationVelocity) < 0.005) {
            lantern.rotation.y += 0.005; // auto spin
        } else {
            lantern.rotation.y += rotationVelocity;
        }
        renderer.render(scene, camera);
    }
    animate();
}
