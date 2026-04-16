/* =============================================================
   Estúdio Arquitetura — Main JS
   ============================================================= */
(() => {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // -----------------------------
    // Year no footer
    // -----------------------------
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // -----------------------------
    // Header scroll state
    // -----------------------------
    const header = $('#header');
    const updateHeader = () => {
        if (window.scrollY > 40) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // -----------------------------
    // Mobile nav toggle
    // -----------------------------
    const navToggle = $('.nav__toggle');
    const navMenu   = $('#nav-menu');
    if (navToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Abrir menu');
        };
        const openMenu = () => {
            navMenu.classList.add('is-open');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'Fechar menu');
        };
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });
        navMenu.addEventListener('click', (e) => {
            if (e.target.matches('a')) closeMenu();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // -----------------------------
    // Reveal on scroll (IntersectionObserver)
    // -----------------------------
    const revealEls = $$('[data-reveal]');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    // -----------------------------
    // Estado global (dados do JSON)
    // -----------------------------
    const state = {
        projects: [],
        filter: 'all',
        lightbox: { images: [], index: 0 }
    };

    // -----------------------------
    // Renderização dos projetos
    // -----------------------------
    const grid = $('#projects-grid');

    const categoryLabel = (cat) => ({
        residencial: 'Residencial',
        comercial: 'Comercial',
        interiores: 'Interiores'
    }[cat] || cat);

    const renderProjects = () => {
        if (!grid) return;
        grid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        state.projects.forEach((p, i) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.category = p.category;
            card.dataset.id = p.id;
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Abrir projeto ${p.title}`);

            card.innerHTML = `
                <img class="card__image" src="${p.cover}" alt="${p.title} — ${categoryLabel(p.category)}" loading="lazy">
                <div class="card__overlay">
                    <span class="card__tag">${categoryLabel(p.category)}</span>
                    <h3 class="card__title">${p.title}</h3>
                    <p class="card__meta">${p.location} · ${p.year}</p>
                </div>
            `;

            card.style.transitionDelay = `${i * 40}ms`;
            card.addEventListener('click', () => openLightbox(p, 0));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(p, 0);
                }
            });

            fragment.appendChild(card);
        });

        grid.appendChild(fragment);
        applyFilter();
    };

    // -----------------------------
    // Filtros por categoria
    // -----------------------------
    const applyFilter = () => {
        $$('.card', grid).forEach(card => {
            const match = state.filter === 'all' || card.dataset.category === state.filter;
            card.classList.toggle('is-hidden', !match);
        });
    };

    $$('.filter').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter').forEach(b => {
                b.classList.remove('is-active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-selected', 'true');
            state.filter = btn.dataset.filter;
            applyFilter();
        });
    });

    // -----------------------------
    // Lightbox (galeria + navegação)
    // -----------------------------
    const lightbox     = $('#lightbox');
    const lightboxImg  = $('#lightbox-img');
    const lightboxCap  = $('#lightbox-caption');
    const lightboxPrev = $('.lightbox__prev');
    const lightboxNext = $('.lightbox__next');
    const lightboxCls  = $('.lightbox__close');

    function openLightbox(project, startIndex = 0) {
        state.lightbox.images = project.gallery && project.gallery.length
            ? project.gallery.map(src => ({ src, caption: `${project.title} — ${project.location}` }))
            : [{ src: project.cover, caption: `${project.title} — ${project.location}` }];
        state.lightbox.index = startIndex;
        showLightboxImage();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxCls.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showLightboxImage() {
        const { images, index } = state.lightbox;
        const item = images[index];
        if (!item) return;
        lightboxImg.src = item.src;
        lightboxImg.alt = item.caption;
        lightboxCap.textContent = images.length > 1
            ? `${item.caption} (${index + 1}/${images.length})`
            : item.caption;

        const multi = images.length > 1;
        lightboxPrev.style.display = multi ? '' : 'none';
        lightboxNext.style.display = multi ? '' : 'none';
    }

    function nextImage() {
        const { images } = state.lightbox;
        state.lightbox.index = (state.lightbox.index + 1) % images.length;
        showLightboxImage();
    }
    function prevImage() {
        const { images } = state.lightbox;
        state.lightbox.index = (state.lightbox.index - 1 + images.length) % images.length;
        showLightboxImage();
    }

    lightboxCls.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft')  prevImage();
    });

    // -----------------------------
    // Links sociais (Instagram / WhatsApp)
    // -----------------------------
    const wireSocial = (social) => {
        const igUrl = social.instagram || '#';
        const wppNum = (social.whatsapp || '').replace(/\D/g, '');
        const wppMsg = encodeURIComponent(social.whatsappMessage || 'Olá!');
        const wppUrl = wppNum ? `https://wa.me/${wppNum}?text=${wppMsg}` : '#';

        $$('[data-contact="instagram"]').forEach(a => {
            a.setAttribute('href', igUrl);
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });
        $$('[data-contact="whatsapp"]').forEach(a => {
            a.setAttribute('href', wppUrl);
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });
    };

    // -----------------------------
    // Carregar dados
    // -----------------------------
    fetch('data/projects.json', { cache: 'no-cache' })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            state.projects = data.projects || [];
            renderProjects();
            wireSocial(data.social || {});
            // re-observa novos elementos que tenham data-reveal (caso existam no futuro)
        })
        .catch(err => {
            console.error('Erro ao carregar projects.json:', err);
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--color-muted);">
                        <p>Não foi possível carregar os projetos. Recarregue a página.</p>
                    </div>
                `;
            }
        });
})();
