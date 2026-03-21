// ---- Preloader ----
(function initPreloader() {
    document.body.classList.add('loading');
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    function hidePreloader() {
        // Small extra delay so the animation feels intentional
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
            // Remove from DOM after transition ends
            preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
        }, 400);
    }

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
        // Fallback: hide after 4s no matter what
        setTimeout(hidePreloader, 4000);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // ---- Theme Toggle ----
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // ---- Mobile Menu ----
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Prevent background scroll when menu is open
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on outside click
    navMenu.addEventListener('click', (e) => {
        if (e.target === navMenu) closeMenu();
    });

    // ---- Smooth Scroll with Fixed Header Offset ----
    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const top = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- Contact Form (EmailJS) ----
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            emailjs.sendForm('service_irwc2yh', 'template_3ukozeb', form)
                .then(() => {
                    showToast('Message sent successfully! ✓');
                    form.reset();
                }, (error) => {
                    showToast('Failed to send. Please try again.', true);
                    console.error('EmailJS Error:', error);
                })
                .finally(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                });
        });
    }

    // Simple toast notification (replaces alert())
    function showToast(message, isError = false) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 24px;
            background: ${isError ? '#333' : '#fff'};
            color: ${isError ? '#fff' : '#000'};
            border: 1px solid ${isError ? '#555' : '#fff'};
            padding: 0.9rem 1.5rem;
            font-family: inherit;
            font-size: 0.9rem;
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            animation: fadeInUp 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(toast);

        // Add fade in animation
        if (!document.querySelector('#toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.textContent = `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.transition = 'opacity 0.4s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // ---- Scroll Animations (IntersectionObserver) ----
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ---- Skill Progress Bars (animate when in view) ----
    const progressFills = document.querySelectorAll('.progress-fill');

    if (progressFills.length > 0) {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const targetWidth = fill.getAttribute('data-width') || '0';
                    // Stagger based on position in its parent
                    const siblings = Array.from(fill.closest('.skill-bars')?.querySelectorAll('.progress-fill') || [fill]);
                    const delay = siblings.indexOf(fill) * 150;
                    setTimeout(() => {
                        fill.style.width = targetWidth + '%';
                        // Add animated class to show dot marker
                        setTimeout(() => fill.classList.add('animated'), 300);
                    }, delay);
                    skillObserver.unobserve(fill);
                }
            });
        }, { threshold: 0.3 });

        progressFills.forEach(fill => skillObserver.observe(fill));
    }

    // ---- 3D Tilt Card Effect ----
    const tiltCards = document.querySelectorAll('.tilt-card');
    const MAX_TILT = 12; // degrees

    // Only enable on devices with fine pointer (mouse, not touch)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        tiltCards.forEach(card => {
            const glare = card.querySelector('.tilt-glare');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2); // -1 to 1
                const dy = (e.clientY - cy) / (rect.height / 2); // -1 to 1

                const rotX = (-dy * MAX_TILT).toFixed(2); // tilt up/down
                const rotY = (dx * MAX_TILT).toFixed(2); // tilt left/right

                card.classList.remove('reset');
                card.style.transform =
                    `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;

                // Move glare to cursor position
                if (glare) {
                    const glareX = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                    const glareY = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                    glare.style.background =
                        `radial-gradient(circle at ${glareX}% ${glareY}%,
                            rgba(255,255,255,0.15) 0%,
                            rgba(255,255,255,0) 60%)`;
                }
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                card.classList.add('reset');
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
                if (glare) {
                    glare.style.background =
                        `radial-gradient(circle at 50% 50%,
                            rgba(255,255,255,0.12) 0%,
                            rgba(255,255,255,0) 60%)`;
                }
                // Remove reset class after transition ends
                setTimeout(() => card.classList.remove('reset'), 500);
            });
        });
    }

    const modalBtns = document.querySelectorAll('.read-more-btn');
    const closeBtns = document.querySelectorAll('.close-modal');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            // Trap focus inside modal
            modal.querySelector('.close-modal')?.focus();
        }
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(btn.getAttribute('data-modal'));
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    // Close modal on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => {
                if (m.style.display === 'block') closeModal(m);
            });
        }
    });

    // ---- Scroll Progress Bar ----
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        function updateProgress() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progressBar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) + '%' : '0%';
        }
        window.addEventListener('scroll', updateProgress, { passive: true });
    }

    // ---- Header scroll shadow ----
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 20px rgba(255,255,255,0.05)';
            } else {
                header.style.boxShadow = 'none';
            }
        }, { passive: true });
    }

    // ---- Active nav link on scroll ----
    const sections = document.querySelectorAll('section[id]');
    function updateActiveNav() {
        const scrollY = window.scrollY + headerHeight + 20;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.style.opacity = '1';
                    link.style.fontWeight = '700';
                } else {
                    link.style.opacity = '';
                    link.style.fontWeight = '';
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ---- Typing Text Animation ----
    const typingText = document.querySelector('.typing-text');
    const cursor = document.querySelector('.cursor');

    if (typingText && cursor) {
        const textArray = ["App Developer", "Flutter Expert", "Web Designer", "UI/UX Enthusiast"];
        const typingDelay = 100;
        const erasingDelay = 50;
        const newTextDelay = 2000;
        let textArrayIndex = 0;
        let charIndex = 0;

        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                cursor.classList.add('typing');
                typingText.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, typingDelay);
            } else {
                cursor.classList.remove('typing');
                setTimeout(erase, newTextDelay);
            }
        }

        function erase() {
            if (charIndex > 0) {
                cursor.classList.add('typing');
                typingText.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, erasingDelay);
            } else {
                cursor.classList.remove('typing');
                textArrayIndex = (textArrayIndex + 1) % textArray.length;
                setTimeout(type, typingDelay + 1100);
            }
        }

        if (textArray.length) setTimeout(type, newTextDelay + 250);
    }
});