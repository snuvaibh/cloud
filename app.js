/* =============================================================
   VELVET CRUMB — Main App JavaScript
   Handles: Particles, Scroll Animations, Parallax, Interactions
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. PARTICLE SYSTEM ─────────────────────────────────
  const canvas  = document.getElementById('particles-canvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let animId;

  const PARTICLE_SHAPES = ['✦', '·', '⋆', '◦', '✿', '·'];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 8 + 4;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(Math.random() * 0.5 + 0.1);
      this.alpha= Math.random() * 0.35 + 0.05;
      this.dAlpha = (Math.random() - 0.5) * 0.003;
      this.char = PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)];
      this.color= `hsl(${Math.random() * 30 + 25}, 60%, ${Math.random() * 20 + 45}%)`;
    }

    update() {
      this.x     += this.vx;
      this.y     += this.vy;
      this.alpha += this.dAlpha;

      if (this.alpha <= 0 || this.alpha >= 0.45) this.dAlpha *= -1;
      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle   = this.color;
      ctx.font        = `${this.size}px serif`;
      ctx.fillText(this.char, this.x, this.y);
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 20), 60);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animateParticles);
  }

  resizeCanvas();
  initParticles();
  animateParticles();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });


  // ─── 2. SCROLL-TRIGGERED FADE-UP ANIMATIONS ─────────────
  const fadeEls = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));


  // ─── 3. PARALLAX ON HERO MASCOT ─────────────────────────
  const mascotFigure = document.querySelector('.mascot-figure');
  const heroSection  = document.querySelector('.hero-section');

  if (mascotFigure && heroSection) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroH   = heroSection.offsetHeight;
      if (scrollY < heroH) {
        const ratio = scrollY / heroH;
        mascotFigure.style.transform = `translateX(-50%) translateY(${ratio * -40}px)`;
      }
    }, { passive: true });
  }


  // ─── 4. SMOOTH ACTIVE NAV HIGHLIGHT ─────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => sectionObserver.observe(sec));


  // ─── 5. CARD MICRO-INTERACTIONS (Tilt) ──────────────────
  const cards = document.querySelectorAll('.delight-card, .blog-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -6;
      const tiltY  = dx *  6;
      card.style.transform = `translateY(-8px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });


  // ─── 6. SPARKLE CLICK EFFECT ON CTA ─────────────────────
  const ctaBtn = document.getElementById('explore-menu-btn');

  if (ctaBtn) {
    ctaBtn.addEventListener('click', function(e) {
      createSparkles(e.clientX, e.clientY);
    });
  }

  function createSparkles(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x}px;
        width: 8px;
        height: 8px;
        background: hsl(${Math.random() * 30 + 20}, 70%, 60%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: sparkleOut 0.7s ease-out forwards;
      `;
      document.body.appendChild(sparkle);

      const angle = (i / count) * Math.PI * 2;
      const dist  = Math.random() * 80 + 40;
      sparkle.animate([
        { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' }).onfinish = () => sparkle.remove();
    }
  }


  // ─── 7. NAV SCROLL BLUR ─────────────────────────────────
  const nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.boxShadow = '0 8px 40px rgba(149, 69, 53, 0.18)';
      } else {
        nav.style.boxShadow = '0 8px 32px rgba(149, 69, 53, 0.15)';
      }
    }, { passive: true });
  }


  // ─── 8. STAGGERED CARD REVEAL ────────────────────────────
  const delightCards = document.querySelectorAll('.delight-card');
  delightCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
  });

  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        delightCards.forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const delightsGrid = document.querySelector('.delights-grid');
  if (delightsGrid) gridObserver.observe(delightsGrid);


  // ─── 9. DOODLE PARALLAX ON MOUSE MOVE ────────────────────
  const doodles = document.querySelectorAll('.doodle');
  const hero    = document.querySelector('.hero-section');

  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const mx = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const my = (e.clientY - rect.top  - rect.height / 2) / rect.height;

      doodles.forEach((d, i) => {
        const f = (i % 3 + 1) * 8;
        d.style.transform = `translate(${mx * f}px, ${my * f}px)`;
      });
    });

    hero.addEventListener('mouseleave', () => {
      doodles.forEach(d => { d.style.transform = ''; });
    });
  }


  // ─── 10. VIEW ALL BUTTON ─────────────────────────────────
  const viewAllBtn = document.querySelector('.view-all-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      // Scroll back up to top of delights section
      document.getElementById('coming-soon').scrollIntoView({ behavior: 'smooth' });
    });
    // Wrap text in span so ::before pseudoelement doesn't overlap
    viewAllBtn.innerHTML = `<span>${viewAllBtn.textContent}</span>`;
  }

  // ─── 11. READ MORE BUTTONS ────────────────────────────────
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Future: open modal or navigate to blog post
      const card  = btn.closest('.blog-card');
      const title = card?.querySelector('.blog-card-title')?.textContent || 'this post';
      createSparkles(
        btn.getBoundingClientRect().left + btn.offsetWidth / 2,
        btn.getBoundingClientRect().top
      );
    });
  });

});
