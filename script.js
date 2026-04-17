// ============================================
// Elements Selection
// ============================================
const welcomePage = document.getElementById('welcomePage');
const selectionScreen = document.getElementById('selectionScreen');
const mainStartBtn = document.getElementById('mainStartBtn');
const backBtn = document.getElementById('backBtn');
const selectButtons = document.querySelectorAll('.select-btn');
const userCards = document.querySelectorAll('.user-card');

// ============================================
// Smooth Scroll Function
// ============================================
function scrollToAbout() {
    const aboutSection = document.getElementById('aboutSection');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Counter Animation for Stats
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString('en-US');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString('en-US');
        }
    }, 16);
}

// ============================================
// Intersection Observer for Animations
// ============================================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Animate counters when stats section is visible
            if (entry.target.classList.contains('stat-number')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
            }
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    // Animate sections on scroll
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // Animate stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });

    // Animate feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate step cards
    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        card.style.transition = `all 0.6s ease-out ${index * 0.2}s`;
        observer.observe(card);
    });
});

// ============================================
// Main Start Button → Selection Screen
// ============================================
mainStartBtn.addEventListener('click', () => {
    welcomePage.classList.remove('active');
    selectionScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Animate cards entrance
    const cards = document.querySelectorAll('.user-card');
    cards.forEach((card, index) => {
        card.style.animation = `slideIn 0.5s ease-out ${index * 0.2}s both`;
    });
});

// ============================================
// Back Button → Welcome Page
// ============================================
backBtn.addEventListener('click', () => {
    selectionScreen.classList.remove('active');
    welcomePage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// Card Hover Effects
// ============================================
userCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// Select Button Actions
// ============================================
selectButtons.forEach((btn) => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const card = this.closest('.user-card');
        const userType = card.getAttribute('data-type');
        
        // Add selection animation
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            handleUserSelection(userType, card);
        }, 200);
    });
});

// ============================================
// Handle User Type Selection
// ============================================
function handleUserSelection(userType, card) {
    // Store user type in localStorage
    localStorage.setItem('userType', userType);
    
    // Show loading animation
    showLoadingAnimation();
    
    // Get the target URL from data attribute
    const targetUrl = card.getAttribute('data-url');
    
    // Redirect after 1.5 seconds
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 1500);
}

// ============================================
// Loading Animation
// ============================================
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="spinner"></div>
            <p>جاري التحميل...</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    const style = document.createElement('style');
    style.textContent = `
        .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 12, 41, 0.98);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease-in;
        }
        
        .loader-content {
            text-align: center;
        }
        
        .spinner {
            width: 70px;
            height: 70px;
            margin: 0 auto 25px;
            border: 5px solid rgba(255, 255, 255, 0.1);
            border-top-color: #667eea;
            border-right-color: #764ba2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loader-content p {
            color: white;
            font-size: 1.3rem;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Parallax Effect on Mouse Move
// ============================================
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ============================================
// Particle Effect on Click
// ============================================
document.addEventListener('click', function(e) {
    if (!e.target.closest('button') && !e.target.closest('.user-card')) {
        createParticles(e.clientX, e.clientY);
    }
});

function createParticles(x, y) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
    
    for(let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 120;
        
        const animation = particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});