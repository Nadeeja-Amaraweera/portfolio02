// ── CURSOR ──
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animateCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a, button, .tool-chip, .service-card, .project-card, .testimonial-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
        cursor.style.background = 'rgba(211,84,0,0.6)';
        cursorRing.style.width = '60px'; cursorRing.style.height = '60px';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        cursor.style.background = 'var(--orange)';
        cursorRing.style.width = '36px'; cursorRing.style.height = '36px';
    });
});

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── INTERSECTION OBSERVER ──
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => io.observe(el));

// ── COUNTER ──
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            const target = +el.dataset.target;
            let current = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = current;
                if (current >= target) clearInterval(timer);
            }, 28);
            counterObs.unobserve(el);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

// ── SERVICE TAGS ──
document.querySelectorAll('.service-tag').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
});

// ── NAV SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── PARALLAX HERO GLOW ──
document.addEventListener('mousemove', e => {
    const glow = document.querySelector('.hero-glow');
    if (!glow) return;
    const xOffset = (e.clientX / window.innerWidth - 0.5) * 60;
    const yOffset = (e.clientY / window.innerHeight - 0.5) * 30;
    glow.style.transform = `translateX(calc(-50% + ${xOffset}px)) translateY(${yOffset}px)`;
});

/* -------------------------------------------------
   Circular skill progress animation on scroll
   ------------------------------------------------- */
(function () {
    // Helper to detect when an element enters the viewport
    function isInViewport(el) {
        const r = el.getBoundingClientRect();
        return (
            r.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            r.bottom >= 0
        );
    }

    // Animate all circular progress elements when #tools becomes visible
    function animateCircularSkills() {
        const toolsSection = document.getElementById('tools');
        if (!toolsSection) return;

        if (isInViewport(toolsSection)) {
            const circles = toolsSection.querySelectorAll('.circular-progress');
            circles.forEach(circle => {
                const perc = circle.dataset.perc;
                const radius = 15.9155; // matches path radius in SVG
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (perc / 100) * circumference;
                const progressPath = circle.querySelector('.progress');
                if (progressPath) {
                    progressPath.style.strokeDasharray = `${circumference}`;
                    progressPath.style.strokeDashoffset = `${circumference}`;
                    // Trigger reflow then set final offset for animation
                    void progressPath.offsetWidth;
                    progressPath.style.strokeDashoffset = `${offset}`;
                }
            });
            // Remove listener after first animation
            window.removeEventListener('scroll', animateCircularSkills);
        }
    }

    // Run once in case the section is already visible, then on scroll
    animateCircularSkills();
    window.addEventListener('scroll', animateCircularSkills);
})();

const skills = document.querySelectorAll('.Oneskill');

const observer3 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

        if (entry.isIntersecting) {
            const ring = entry.target.querySelector('.ring-path');

            // read percentage from h2 (ex: "90%")
            let percent = entry.target.querySelector('h2').innerText.replace('%', '');
            percent = Number(percent) / 100;

            // ring full length = 600
            let offset = 600 - (600 * percent);

            ring.style.strokeDashoffset = offset;
        }

    });
}, { threshold: 0.4 });

skills.forEach(skill => observer3.observe(skill));

// ── MOBILE MENU TOGGLE ──
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (navBurger && navLinks) {
    navBurger.addEventListener('click', () => {
        navBurger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navBurger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
}

// ── HERO IMAGE ZOOM SCROLL / SCALING ──
function updateHeroImageScale() {
    const img = document.querySelector('.person-placeholder img');
    if (!img) return;
    
    const ratio = window.devicePixelRatio || 1;
    let scale = 1;
    
    // Zoom out (ratio < 1) -> increase scale
    if (ratio < 1) {
        scale = 1 / ratio;
    }
    
    // Also scale up based on viewport width for larger/wider screens
    const width = window.innerWidth;
    if (width > 1200) {
        const widthScale = 1 + (width - 1200) * 0.0003;
        scale *= widthScale;
    }
    
    // Bound the scale factor to reasonable limits
    scale = Math.max(1, Math.min(scale, 2.2));
    
    img.style.setProperty('--img-scale', scale.toFixed(3));
}

// Listen to resize events (triggered by screen size change and browser zoom)
window.addEventListener('resize', updateHeroImageScale);

// ── TESTIMONIALS CAROUSEL DOTS ──
function initTestimonialsCarousel() {
    const grid = document.querySelector('.testimonials-grid');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    if (!grid || dots.length === 0) return;

    const updateActiveStates = () => {
        const scrollLeft = grid.scrollLeft;
        const firstCard = grid.querySelector('.testimonial-card');
        if (!firstCard) return;
        const cardWidth = firstCard.clientWidth + 16; // width + gap
        const index = Math.round(scrollLeft / cardWidth);
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        const cards = grid.querySelectorAll('.testimonial-card');
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
    };

    grid.addEventListener('scroll', updateActiveStates);
    updateActiveStates(); // Initialize active states on page load

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const card = grid.children[index];
            if (card) {
                grid.scrollTo({
                    left: card.offsetLeft - grid.offsetLeft - 24, // adjust for left padding/margin breakout
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ── PROJECTS CAROUSEL DOTS ──
function initProjectsCarousel() {
    const container = document.querySelector('.project-container');
    const dots = document.querySelectorAll('.projects-dots .dot');
    if (!container || dots.length === 0) return;

    // With display:contents on .work-row-grid, all .work-item are effectively
    // direct scroll children of .project-container
    const cards = container.querySelectorAll('.work-item');

    const updateActiveStates = () => {
        const scrollLeft = container.scrollLeft;
        if (cards.length === 0) return;
        const cardWidth = cards[0].clientWidth + 16; // card width + gap
        const index = Math.min(Math.round(scrollLeft / cardWidth), cards.length - 1);

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    };

    container.addEventListener('scroll', updateActiveStates);
    updateActiveStates();

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (cards[index]) {
                container.scrollTo({
                    left: cards[index].offsetLeft - container.offsetLeft - 24,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize on page load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    updateHeroImageScale();
    initTestimonialsCarousel();
    initProjectsCarousel();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        updateHeroImageScale();
        initTestimonialsCarousel();
        initProjectsCarousel();
    });
}
