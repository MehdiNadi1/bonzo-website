document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.contains('active');
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', !isActive);
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 2. Sticky Navbar Background
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Intersection Observer for Slide-up Animations (Lazy Loading elements)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // trigger slightly before it hits the bottom
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Removed unobserve so animations happen every time if preferred, 
                // but for performance we keep it unobserve as requested initially
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide-up').forEach(el => observer.observe(el));

    // 4. Hero Sequence Canvas Animation
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        const frameCount = 216; // The user provided 216 frames
        
        // Use relative path for local structure (images in parent directory)
        const currentFrame = index => (
            `../ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (images[0] && images[0].complete) {
                // Ensure correct scaling after resize
                const frameIndex = getScrollFrameIndex();
                if(images[frameIndex]) {
                    drawImageCentered(images[frameIndex]);
                }
            }
        };
        
        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        // Load first frame immediately
        const firstImg = new Image();
        firstImg.src = currentFrame(1);
        images[0] = firstImg;
        firstImg.onload = () => {
            drawImageCentered(firstImg);
        }

        // Asynchronously preload the rest so scrolling is smooth
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images[i - 1] = img;
        }

        const drawImageCentered = (imgElement) => {
            if (!imgElement || !imgElement.complete) return;
            // Scale and center the image to max size covering center
            const hRatio = canvas.width / imgElement.width;
            const vRatio = canvas.height / imgElement.height;
            const ratio  = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - imgElement.width * ratio) / 2;
            const centerShift_y = (canvas.height - imgElement.height * ratio) / 2;  
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height,
                                centerShift_x, centerShift_y, imgElement.width * ratio, imgElement.height * ratio);
        };

        const heroSection = document.querySelector('.hero-scroll-container');
        
        const getScrollFrameIndex = () => {
            const scrollTop = window.scrollY;
            const sectionTop = heroSection.offsetTop;
            const sectionHeight = heroSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            const scrollDistance = sectionHeight - viewportHeight;
            let scrollFraction = (scrollTop - sectionTop) / scrollDistance;
            
            if (scrollFraction < 0) scrollFraction = 0;
            if (scrollFraction > 1) scrollFraction = 1;

            return Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );
        }

        window.addEventListener('scroll', () => {  
            const frameIndex = getScrollFrameIndex();

            // Draw current frame efficiently
            if (images[frameIndex]) {
                requestAnimationFrame(() => drawImageCentered(images[frameIndex]));
            }
        });
    }

    // 5. Native Form Handling Showcase
    const form = document.getElementById('subscribe-form');
    const msg = document.getElementById('form-msg');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email-input');
            const email = emailInput.value;
            
            if (email) {
                msg.textContent = "COMM-LINK ESTABLISHED: Welcome to the network.";
                msg.style.display = 'block';
                form.reset();
                setTimeout(() => {
                    msg.style.display = 'none';
                }, 4000);
            }
        });
    }
});
