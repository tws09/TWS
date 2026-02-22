// ULTRA-PREMIUM WORLD-CLASS JAVASCRIPT
// Micro-interactions and delightful animations

// DOM element selections
const mobileMenuToggle = document.getElementById('hamburger');
const navLinks = document.getElementById('navMenu');

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
const initialTheme = savedTheme || systemTheme;

if (initialTheme === 'light') {
    html.setAttribute('data-theme', 'light');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        if (newTheme === 'light') {
            html.setAttribute('data-theme', 'light');
        } else {
            html.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', newTheme);

        // Add subtle animation effect to button
        themeToggle.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.9)' },
            { transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        });
    });
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Smooth scroll with offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 72;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans.forEach(span => span.style.transform = 'none');
                spans[1].style.opacity = '1';
            }
        }
    });
});

// Navbar Acrylic Effect on Scroll - Enhanced with Deep Scroll
const navbar = document.querySelector('.navbar');
let lastScrollPos = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Add scrolled class after 50px
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
        navbar.classList.remove('scrolled-deep');
    }

    // Add deep scroll class after 300px for enhanced effect
    if (currentScroll > 300) {
        navbar.classList.add('scrolled-deep');
    } else {
        navbar.classList.remove('scrolled-deep');
    }

    lastScrollPos = currentScroll;
});

// Magnetic button effect (premium interaction)
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// Reveal highlight effect (world-class interaction)
const cards = document.querySelectorAll(
    '.what-is-card, .feature-card, .erp-card, .trust-card, .step-card, ' +
    '.automate-card, .more-feature-card, .contact-item, .stat'
);

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Create subtle glow
        const glow = `radial-gradient(circle 300px at ${x}px ${y}px, rgba(99, 102, 241, 0.08), transparent)`;
        card.style.backgroundImage = glow;
    });

    card.addEventListener('mouseleave', () => {
        card.style.backgroundImage = 'none';
    });
});

// Scroll reveal animations (premium entrance)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 50); // Stagger effect
        }
    });
}, observerOptions);

// Observe all animatable elements
const animatedElements = document.querySelectorAll(
    '.what-is-card, .feature-card, .erp-card, .trust-card, .step-card, ' +
    '.automate-card, .more-feature-card, .section-header, .stat, .tech-item, .testimonial-card'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)';
    revealObserver.observe(el);
});

// Premium counter animation with easing
const animateCounter = (element, target) => {
    let current = 0;
    const duration = 2000;
    const start = performance.now();
    const hasPercent = element.textContent.includes('%');
    const hasPlus = element.textContent.includes('+');

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCounter = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);

        current = Math.floor(eased * target);

        let text = current.toString();
        if (hasPlus && progress === 1) text += '+';
        if (hasPercent) text += '%';

        element.textContent = text;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            let finalText = target.toString();
            if (hasPlus) finalText += '+';
            if (hasPercent) finalText += '%';
            element.textContent = finalText;
        }
    };

    requestAnimationFrame(updateCounter);
};

// Observe stat numbers
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const text = entry.textContent;
            const number = parseInt(text.replace(/\D/g, ''));

            if (number) {
                animateCounter(entry.target, number);
            }
        }
    });
}, { threshold: 0.8 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

// Active link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinksList = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinksList.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Parallax effect for hero
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    if (hero && window.scrollY < window.innerHeight) {
        const scrolled = window.scrollY;
        hero.style.transform = `translateY(${scrolled * 0.2}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.3;
    }
});

// Smooth cursor follow on hero title
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;

        heroTitle.style.transform = `translate(${xPercent * 10}px, ${yPercent * 10}px)`;
    });
}

// Button ripple effect (premium feedback)
buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            pointer-events: none;
            transform: scale(0);
            opacity: 1;
            animation: ripple 0.6s cubic-bezier(0.33, 1, 0.68, 1);
        `;

        this.style.position = 'relative';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }
`;
document.head.appendChild(style);

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
});

// Add smooth page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';

    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
        document.body.style.opacity = '1';
    }, 100);

    // Reveal hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(40px)';

        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s cubic-bezier(0.33, 1, 0.68, 1), transform 1s cubic-bezier(0.33, 1, 0.68, 1)';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
});

// Gradient text glow effect
const gradientTexts = document.querySelectorAll('.gradient-text');
gradientTexts.forEach(text => {
    text.setAttribute('data-text', text.textContent);
});

// Premium scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    z-index: 10000;
    transition: width 0.1s cubic-bezier(0.33, 1, 0.68, 1);
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
`;
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';
});

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.renderTime || entry.loadTime);
        }
    }
});
perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });

// Premium console message
console.log(
    '%c🐺 TWS - THE WOLF STACK',
    'font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 16px 0; letter-spacing: -0.02em;'
);
console.log(
    '%c✨ ULTRA-PREMIUM WORLD-CLASS DESIGN',
    'font-size: 14px; color: #A8A8A8; font-weight: 600; letter-spacing: 0.1em;'
);
console.log(
    '%cCombining Apple\'s elegance, Linear\'s boldness, and Stripe\'s sophistication',
    'font-size: 12px; color: #666; font-style: italic;'
);
