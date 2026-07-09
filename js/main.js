

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

// ── SERVICE TAGS (toggle active for contact form) ──
document.querySelectorAll('#servicesGroup .service-tag').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        // Clear services error when user selects one
        const err = document.getElementById('servicesError');
        const selected = document.querySelectorAll('#servicesGroup .service-tag.active');
        if (selected.length > 0) {
            err.textContent = '';
            err.classList.remove('show');
        }
    });
});

(function () {
    const WEB3FORMS_ACCESS_KEY = '97b5f21f-ca8d-4940-b760-9c779ed7c48a';

    // DOM refs
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('formToast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMsg = document.getElementById('toastMsg');

    if (!form) return;

    // ── Validation helpers ──
    function showError(inputEl, errorEl, message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
        inputEl.classList.add('input-error');
        inputEl.classList.remove('input-success');
    }

    function showSuccess(inputEl, errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        inputEl.classList.remove('input-error');
        inputEl.classList.add('input-success');
    }

    function clearState(inputEl, errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        inputEl.classList.remove('input-error', 'input-success');
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ── Field validators ──
    function validateName() {
        const err = document.getElementById('nameError');
        const val = nameInput.value.trim();
        if (!val) { showError(nameInput, err, 'Please enter your name'); return false; }
        if (val.length < 2) { showError(nameInput, err, 'Name must be at least 2 characters'); return false; }
        showSuccess(nameInput, err);
        return true;
    }

    function validateEmail() {
        const err = document.getElementById('emailError');
        const val = emailInput.value.trim();
        if (!val) { showError(emailInput, err, 'Please enter your email address'); return false; }
        if (!isValidEmail(val)) { showError(emailInput, err, 'Please enter a valid email address'); return false; }
        showSuccess(emailInput, err);
        return true;
    }

    function validateSubject() {
        const err = document.getElementById('subjectError');
        const val = subjectInput.value.trim();
        if (!val) { showError(subjectInput, err, 'Please enter a subject'); return false; }
        if (val.length < 3) { showError(subjectInput, err, 'Subject must be at least 3 characters'); return false; }
        showSuccess(subjectInput, err);
        return true;
    }

    function validateMessage() {
        const err = document.getElementById('messageError');
        const val = messageInput.value.trim();
        if (!val) { showError(messageInput, err, 'Please enter your message'); return false; }
        if (val.length < 10) { showError(messageInput, err, 'Message must be at least 10 characters'); return false; }
        showSuccess(messageInput, err);
        return true;
    }

    function validateServices() {
        const err = document.getElementById('servicesError');
        const selected = document.querySelectorAll('#servicesGroup .service-tag.active');
        if (selected.length === 0) {
            err.textContent = 'Please select at least one service';
            err.classList.add('show');
            return false;
        }
        err.textContent = '';
        err.classList.remove('show');
        return true;
    }

    // ── Real-time validation on blur & input ──
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    subjectInput.addEventListener('blur', validateSubject);
    messageInput.addEventListener('blur', validateMessage);

    // Clear error as user types (live feedback)
    nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('input-error')) validateName();
    });
    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('input-error')) validateEmail();
    });
    subjectInput.addEventListener('input', () => {
        if (subjectInput.classList.contains('input-error')) validateSubject();
    });
    messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('input-error')) validateMessage();
    });

    // ── Toast helper ──
    function showToast(type, message) {
        toast.className = 'toast ' + type + ' show';
        toastIcon.textContent = type === 'success' ? '✓' : '✕';
        toastMsg.textContent = message;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // ── Form submit ──
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Run all validators
        const isNameOk = validateName();
        const isEmailOk = validateEmail();
        const isSubjectOk = validateSubject();
        const isMessageOk = validateMessage();
        const isServicesOk = validateServices();

        if (!isNameOk || !isEmailOk || !isSubjectOk || !isMessageOk || !isServicesOk) {
            // Scroll to first error
            const firstError = form.querySelector('.input-error, .field-error.show');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');

        // Gather selected services
        const selectedServices = [];
        document.querySelectorAll('#servicesGroup .service-tag.active').forEach(tag => {
            selectedServices.push(tag.dataset.service);
        });

        // Prepare form data for Web3Forms
        const formData = new FormData();
        formData.append('access_key', WEB3FORMS_ACCESS_KEY);
        formData.append('name', nameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('subject', subjectInput.value.trim());
        formData.append('message', messageInput.value.trim());
        formData.append('services', selectedServices.join(', '));
        formData.append('from_name', 'Portfolio Contact Form');

        try {
            // Send email via Web3Forms API
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                showToast('success', 'Message sent successfully! I\'ll get back to you soon.');

                // Reset form
                form.reset();
                document.querySelectorAll('#servicesGroup .service-tag').forEach(t => t.classList.remove('active'));
                [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
                    inp.classList.remove('input-success', 'input-error');
                });
                document.querySelectorAll('.field-error').forEach(e => {
                    e.textContent = '';
                    e.classList.remove('show');
                });
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Web3Forms Error:', error);
            showToast('error', 'Failed to send message. Please try again later.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    });
})();

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
