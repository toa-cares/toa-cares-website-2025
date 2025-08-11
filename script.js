// TOA Cares Website Interactive Elements

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Donation amount selection
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    
    amountButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            amountButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the custom amount input value
            const amount = this.getAttribute('data-amount');
            if (customAmountInput) {
                customAmountInput.value = amount;
            }
        });
    });

    // Custom amount input handler
    if (customAmountInput) {
        customAmountInput.addEventListener('input', function() {
            // Remove active class from all preset buttons when custom amount is entered
            amountButtons.forEach(btn => btn.classList.remove('active'));
        });
    }

    // Rotating text effect for hero section
    const rotatingTextElement = document.querySelector('.rotating-text');
    
    if (rotatingTextElement) {
        const words = [
            'to communities',
            'to the elders',
            'to the environment',
            'to everyone'
        ];
        
        let currentIndex = 0;
        
        function rotateText() {
            rotatingTextElement.style.opacity = '0.3';
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % words.length;
                rotatingTextElement.textContent = words[currentIndex];
                rotatingTextElement.style.opacity = '1';
            }, 150);
        }
        
        // Start rotation after initial load
        setInterval(rotateText, 3000);
    }

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Form submissions (placeholder functionality)
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message (in a real application, this would submit to a server)
            const formType = this.classList.contains('donation-form') ? 'donation' : 
                            this.classList.contains('volunteer-form') ? 'volunteer application' : 
                            this.classList.contains('contact-form') ? 'message' : 'form';
            
            alert(`Thank you! Your ${formType} has been submitted successfully. We will get back to you soon.`);
            
            // Reset form
            this.reset();
            
            // Remove active states from donation buttons
            if (this.classList.contains('donation-form')) {
                amountButtons.forEach(btn => btn.classList.remove('active'));
            }
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.program-card, .news-card, .stat, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(43, 45, 66, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = 'var(--space-cadet)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat h3');
    
    const animateCounters = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = parseInt(target.textContent.replace(/\D/g, ''));
                const suffix = target.textContent.replace(/[0-9]/g, '');
                let current = 0;
                const increment = finalNumber / 50;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= finalNumber) {
                        target.textContent = finalNumber + suffix;
                        clearInterval(timer);
                    } else {
                        target.textContent = Math.floor(current) + suffix;
                    }
                }, 30);
                
                counterObserver.unobserve(target);
            }
        });
    };

    const counterObserver = new IntersectionObserver(animateCounters, {
        threshold: 0.5
    });

    stats.forEach(stat => {
        counterObserver.observe(stat);
    });
});

// Additional utility functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mobile-specific enhancements
function isMobile() {
    return window.innerWidth <= 768;
}

// Touch-friendly interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add touch feedback to buttons and cards
    const touchElements = document.querySelectorAll('.btn, .program-card, .news-card, .stat, .contact-item');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            if (isMobile()) {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            }
        });
        
        element.addEventListener('touchend', function() {
            if (isMobile()) {
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            }
        });
    });
    
    // Improve form interactions on mobile
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        // Prevent zoom on iOS when focusing inputs
        input.addEventListener('focus', function() {
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            }
        });
        
        input.addEventListener('blur', function() {
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            }
        });
    });
});

// Add scroll to top functionality
window.addEventListener('scroll', function() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        window.scrollTo(0, window.pageYOffset);
    }, 100);
});

// Team sorting and view functionality
document.addEventListener('DOMContentLoaded', function() {
    const teamsGrid = document.getElementById('teams-grid');
    const sortSelect = document.getElementById('team-sort');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    if (!teamsGrid || !sortSelect) return;
    
    // Store original order
    const originalCards = Array.from(teamsGrid.children);
    
    // Sorting functionality
    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const cards = Array.from(teamsGrid.children);
        
        let sortedCards;
        
        switch (sortValue) {
            case 'alphabetical':
                sortedCards = cards.sort((a, b) => {
                    const nameA = a.dataset.teamName.toLowerCase();
                    const nameB = b.dataset.teamName.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
                
            case 'alphabetical-desc':
                sortedCards = cards.sort((a, b) => {
                    const nameA = a.dataset.teamName.toLowerCase();
                    const nameB = b.dataset.teamName.toLowerCase();
                    return nameB.localeCompare(nameA);
                });
                break;
                
            case 'type':
                sortedCards = cards.sort((a, b) => {
                    const typeA = a.dataset.teamType.toLowerCase();
                    const typeB = b.dataset.teamType.toLowerCase();
                    if (typeA === typeB) {
                        const nameA = a.dataset.teamName.toLowerCase();
                        const nameB = b.dataset.teamName.toLowerCase();
                        return nameA.localeCompare(nameB);
                    }
                    return typeA.localeCompare(typeB);
                });
                break;
                
            default:
                sortedCards = originalCards.slice();
                break;
        }
        
        // Clear and re-append sorted cards with animation
        teamsGrid.style.opacity = '0.5';
        setTimeout(() => {
            teamsGrid.innerHTML = '';
            sortedCards.forEach(card => teamsGrid.appendChild(card));
            teamsGrid.style.opacity = '1';
        }, 150);
    });
    
    // View toggle functionality
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.dataset.view;
            
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update grid class
            if (viewType === 'list') {
                teamsGrid.classList.add('list-view');
            } else {
                teamsGrid.classList.remove('list-view');
            }
        });
    });
});

// Build hero carousel from action images
const carousel = document.querySelector('.carousel');
if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    // Discover images by trying multiple extensions per base name
    const baseNames = ['3 juni', '26 juli', '12 April', '17 mei 1', '17 mei 2', '11 Maret'];
    const candidateExts = ['webp', 'jpg', 'jpeg', 'png'];

    function tryLoad(baseName) {
        return new Promise((resolve, reject) => {
            let idx = 0;
            function attempt() {
                if (idx >= candidateExts.length) { reject(new Error('no match')); return; }
                const url = (`action images/${baseName}.` + candidateExts[idx]).replace(/ /g, '%20');
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => { idx += 1; attempt(); };
                img.src = url;
            }
            attempt();
        });
    }

    Promise.allSettled(baseNames.map(tryLoad)).then(results => {
        const urls = results.filter(r => r.status === 'fulfilled').map(r => r.value);

        if (urls.length === 0) {
            const fallback = document.createElement('div');
            fallback.className = 'carousel-slide';
            fallback.innerHTML = '<img src="toa-cares-logo.webp" alt="TOA Cares">';
            track.appendChild(fallback);
        } else {
            urls.forEach((src, idx) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Action photo ' + (idx + 1);
                slide.appendChild(img);
                track.appendChild(slide);

                const dot = document.createElement('button');
                dot.className = 'carousel-dot';
                dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
                dot.addEventListener('click', () => goToSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }

        const slideElements = Array.from(track.children);
        if (slideElements.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
        }

        let current = 0;
        let autoTimer = null;

        function update() {
            slideElements.forEach((el, i) => {
                el.style.opacity = i === current ? '1' : '0';
                el.style.transition = 'opacity 0.5s ease';
                el.style.position = 'absolute';
                el.style.inset = '0';
            });
            const dots = Array.from(dotsContainer.children);
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function goToSlide(index) {
            current = (index + slideElements.length) % slideElements.length;
            update();
            restartAuto();
        }

        function next() { goToSlide(current + 1); }
        function prev() { goToSlide(current - 1); }

        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);

        function startAuto() {
            stopAuto();
            if (slideElements.length > 1) {
                autoTimer = setInterval(next, 5000);
            }
        }
        function stopAuto() {
            if (autoTimer) clearInterval(autoTimer);
            autoTimer = null;
        }
        function restartAuto() { startAuto(); }

        update();
        startAuto();

        // Pause on hover (desktop)
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        // Swipe support
        let startX = 0;
        carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) {
                if (dx < 0) next(); else prev();
            }
        });
    });
}