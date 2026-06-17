/* ============================================
   Muhammad Kashif — Portfolio Scripts (Light Green Particles)
   ============================================ */

   document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initNavbar();
    initMobileNav();
    initScrollReveal();
    initParticles();
    initTerminal();
    initCounters();
    initSkillBars();
    initContactForm();
    initMagneticButtons();
    initOrbitItems();
  });
  
  /* ---- Page Loader ---- */
  function initPageLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    document.body.prepend(loader);
  
    loader.classList.add('loading');
    window.addEventListener('load', () => {
      loader.classList.remove('loading');
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 400);
    });
  }
  
  /* ---- Navbar Scroll Effect ---- */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
  
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
  
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  
  /* ---- Mobile Navigation ---- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
  
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
  
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }
  
  /* ---- Scroll Reveal ---- */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!elements.length) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
  
    elements.forEach(el => observer.observe(el));
  }
  
  /* ---- Particle Network (light green) ---- */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
  
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  
    function createParticles() {
      const count = Math.min(Math.floor(window.innerWidth / 15), 80);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
  
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(76, 255, 158, 0.5)';   // light green
        ctx.fill();
  
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
  
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(76, 255, 158, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
  
      animationId = requestAnimationFrame(draw);
    }
  
    resize();
    createParticles();
    draw();
  
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });
  }
  
  /* ---- Animated Terminal ---- */
  function initTerminal() {
    const terminal = document.querySelector('.terminal-body[data-terminal]');
    if (!terminal) return;
  
    const lines = [
      { type: 'command', text: 'kubectl get pods --all-namespaces' },
      { type: 'output', text: 'NAMESPACE     NAME                          STATUS' },
      { type: 'output success', text: 'production    api-server-7d4f8b-xk2m9       Running' },
      { type: 'output success', text: 'production    nginx-ingress-5c9d7-abc12       Running' },
      { type: 'output success', text: 'monitoring    prometheus-0                  Running' },
      { type: 'command', text: 'terraform apply -auto-approve' },
      { type: 'output', text: 'Apply complete! Resources: 12 added, 0 changed, 0 destroyed.' },
      { type: 'output success', text: '✓ Infrastructure deployed successfully' },
      { type: 'command', text: 'ansible-playbook deploy.yml' },
      { type: 'output success', text: 'PLAY RECAP *** 3 hosts ok, 0 changed, 0 failed' },
    ];
  
    let lineIndex = 0;
    let charIndex = 0;
    let currentLine = null;
  
    function typeNext() {
      if (lineIndex >= lines.length) {
        setTimeout(() => {
          terminal.innerHTML = '';
          lineIndex = 0;
          charIndex = 0;
          currentLine = null;
          typeNext();
        }, 4000);
        return;
      }
  
      const data = lines[lineIndex];
  
      if (!currentLine) {
        currentLine = document.createElement('div');
        currentLine.className = 'terminal-line';
  
        if (data.type === 'command') {
          currentLine.innerHTML = '<span class="terminal-prompt">$ </span><span class="terminal-command"></span>';
        } else {
          currentLine.className = `terminal-line terminal-output ${data.type.replace('output ', '')}`;
          currentLine.textContent = '';
        }
  
        terminal.appendChild(currentLine);
        charIndex = 0;
      }
  
      const target = data.type === 'command'
        ? currentLine.querySelector('.terminal-command')
        : currentLine;
  
      if (charIndex < data.text.length) {
        target.textContent += data.text[charIndex];
        charIndex++;
        setTimeout(typeNext, 25 + Math.random() * 30);
      } else {
        lineIndex++;
        currentLine = null;
        setTimeout(typeNext, 300);
      }
    }
  
    setTimeout(typeNext, 1000);
  }
  
  /* ---- Animated Counters ---- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
  
    counters.forEach(counter => observer.observe(counter));
  }
  
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
  
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
  
      el.textContent = current + suffix;
  
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
  
    requestAnimationFrame(update);
  }
  
  /* ---- Skill Bars ---- */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill[data-width]');
    if (!bars.length) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.width + '%';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
  
    bars.forEach(bar => observer.observe(bar));
  }
  
  /* ---- Contact Form ---- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #4cff9e, #00b86b)';
      btn.disabled = true;
  
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }
  
  /* ---- Magnetic Button Effect ---- */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .magnetic');
    if (window.matchMedia('(max-width: 768px)').matches) return;
  
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
  
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
  
  /* ---- Orbit Items Positioning ---- */
  function initOrbitItems() {
    const orbit = document.querySelector('.tech-orbit');
    if (!orbit) return;
  
    const rings = [
      { selector: '.orbit-ring-1', items: orbit.querySelectorAll('[data-orbit="1"]') },
      { selector: '.orbit-ring-2', items: orbit.querySelectorAll('[data-orbit="2"]') },
      { selector: '.orbit-ring-3', items: orbit.querySelectorAll('[data-orbit="3"]') },
    ];
  
    rings.forEach(ring => {
      const items = ring.items;
      const count = items.length;
      items.forEach((item, i) => {
        const angle = (360 / count) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = ring.selector === '.orbit-ring-1' ? 110
          : ring.selector === '.orbit-ring-2' ? 170 : 230;
  
        item.style.left = `calc(50% + ${Math.cos(rad) * radius}px - 28px)`;
        item.style.top = `calc(50% + ${Math.sin(rad) * radius}px - 28px)`;
      });
    });
  }