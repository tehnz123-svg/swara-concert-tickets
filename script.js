document.addEventListener('DOMContentLoaded', function () {
    // Scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    // Countdown timer (only for index.html)
    if (document.getElementById('days')) {
        const eventDate = new Date('September 4, 2025 16:30:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = eventDate - now;

            if (distance < 0) {
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
});


// Audio Visualizer Effect
function createAudioVisualizer() {
    if (!document.querySelector('.hero-section')) return;
    
    const heroSection = document.querySelector('.hero-section');
    const visualizerContainer = document.createElement('div');
    visualizerContainer.className = 'audio-visualizer';
    visualizerContainer.style.position = 'absolute';
    visualizerContainer.style.width = '100%';
    visualizerContainer.style.height = '100%';
    visualizerContainer.style.top = '0';
    visualizerContainer.style.left = '0';
    visualizerContainer.style.zIndex = '1';
    visualizerContainer.style.overflow = 'hidden';
    
    heroSection.appendChild(visualizerContainer);
    
    // Create bars
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.position = 'absolute';
        bar.style.bottom = '0';
        bar.style.width = '2px';
        bar.style.height = '5px';
        bar.style.backgroundColor = 'rgba(255, 215, 0, 0.7)';
        bar.style.left = `${i * (100 / 50)}%`;
        bar.style.transformOrigin = 'bottom center';
        visualizerContainer.appendChild(bar);
    }
    
    const bars = document.querySelectorAll('.visualizer-bar');
    
    function animateBars() {
        bars.forEach((bar, index) => {
            const randomHeight = Math.random() * 100 + 5;
            const randomRotation = Math.random() * 30 - 15;
            
            bar.style.height = `${randomHeight}px`;
            bar.style.transform = `rotate(${randomRotation}deg)`;
            bar.style.transition = `all ${0.1 + Math.random() * 0.2}s ease-out`;
            bar.style.opacity = `${0.3 + Math.random() * 0.7}`;
        });
        
        requestAnimationFrame(animateBars);
    }
    
    animateBars();
}

createAudioVisualizer();

// Floating Musical Notes
function createFloatingNotes() {
    const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '♯'];
    const colors = ['#ffd700', '#ffec8e', '#ffffff', '#ff9999', '#99ff99', '#9999ff'];
    
    function createNote() {
        if (Math.random() > 0.3) return; // Control density
        
        const note = document.createElement('div');
        note.className = 'floating-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.position = 'fixed';
        note.style.color = colors[Math.floor(Math.random() * colors.length)];
        note.style.fontSize = `${Math.random() * 20 + 10}px`;
        note.style.opacity = '0';
        note.style.zIndex = '1000';
        note.style.pointerEvents = 'none';
        note.style.userSelect = 'none';
        note.style.left = `${Math.random() * 100}vw`;
        note.style.top = '100vh';
        
        document.body.appendChild(note);
        
        // Animation
        const duration = Math.random() * 10000 + 5000;
        const delay = Math.random() * 3000;
        
        note.style.transition = `opacity ${duration/2000}ms ease-in`;
        note.style.opacity = '0.7';
        
        setTimeout(() => {
            note.style.transition = `all ${duration/1000}s linear`;
            note.style.transform = `translateY(-${Math.random() * 50 + 100}vh) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg)`;
            note.style.opacity = '0';
        }, delay);
        
        // Remove after animation
        setTimeout(() => {
            note.remove();
        }, delay + duration);
    }
    
    // Create notes periodically
    setInterval(createNote, 300);
    
    // Initial burst of notes
    for (let i = 0; i < 20; i++) {
        setTimeout(createNote, i * 150);
    }
}

createFloatingNotes();

