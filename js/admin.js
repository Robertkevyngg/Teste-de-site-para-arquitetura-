/* =============================================================
   Editor de Portfólio — admin.js
   Editor visual client-side para data/projects.json
   ============================================================= */
(() => {
    'use strict';

    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const STORAGE_KEY = 'estudio-admin-data-v1';

    const GITHUB_USER   = 'Robertkevyngg';
    const GITHUB_REPO   = 'Teste-de-site-para-arquitetura-';
    const GITHUB_BRANCH = 'claude/architecture-portfolio-site-afIi1';
    const UPLOAD_URL    = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/upload/${GITHUB_BRANCH}/data`;

    // Elements
    const elStatus        = $('#save-status');
    const elDownloadBtn   = $('#download-btn');
    const elGithubLink    = $('#github-upload-link');
    const elSocialIg      = $('#social-instagram');
    const elSocialWpp     = $('#social-whatsapp');
    const elSocialMsg     = $('#social-message');
    const elProjectsList  = $('#projects-list');
    const elProjectsEmpty = $('#projects-empty');
    const elProjectCount  = $('#project-count');
    const elAddBtn        = $('#add-project-btn');
    const elResetBtn      = $('#reset-btn');
    const elImportFile    = $('#import-file');

    // Modal
    const elModal    = $('#project-modal');
    const elForm     = $('#project-form');
    const elFldIndex = $('#field-index');
    const elFldTitle = $('#field-title');
    const elFldCat   = $('#field-category');
    const elFldLoc   = $('#field-location');
    const elFldYear  = $('#field-year');
    const elFldDesc  = $('#field-description');
    const elFldCover = $('#field-cover');
    const elFldGal   = $('#field-gallery');
    const elPreview  = $('#cover-preview');
    const elModalTitle = $('#modal-title');

    // State
    let state = { social: {}, projects: [] };
    let isDirty = false;

    // -----------------------------
    // Utils
    // -----------------------------
    const slugify = (str) => (str || 'projeto')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || `projeto-${Date.now()}`;

    const uniqueId = (base, existing) => {
        let id = base, n = 2;
        const set = new Set(existing);
        while (set.has(id)) id = `${base}-${n++}`;
        return id;
    };

    const toast = (msg) => {
        let el = $('.toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('is-visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => el.classList.remove('is-visible'), 2400);
    };

    const setStatus = (text, kind) => {
        elStatus.textContent = text;
        elStatus.classList.remove('is-dirty', 'is-saved');
        if (kind) elStatus.classList.add(kind);
    };

    const markDirty = () => {
        isDirty = true;
        elDownloadBtn.disabled = false;
        setStatus('Alterações não publicadas', 'is-dirty');
        persistLocal();
    };

    const persistLocal = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
    };
    const loadLocal = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (_) { return null; }
    };

    // -----------------------------
    // Render
    // -----------------------------
    const render = () => {
        // Social
        elSocialIg.value  = state.social.instagram || '';
        elSocialWpp.value = state.social.whatsapp || '';
        elSocialMsg.value = state.social.whatsappMessage || '';

        // Projetos
        elProjectsList.innerHTML = '';
        const projects = state.projects || [];
        elProjectCount.textContent = `(${projects.length})`;
        elProjectsEmpty.hidden = projects.length > 0;

        projects.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = 'admin-project';
            card.innerHTML = `
                <div class="admin-project__thumb" style="background-image:url('${(p.cover || '').replace(/'/g, "\\'")}')" aria-hidden="true"></div>
                <div class="admin-project__info">
                    <span class="admin-project__tag">${categoryLabel(p.category)}</span>
                    <p class="admin-project__title">${escapeHtml(p.title || '(sem título)')}</p>
                    <p class="admin-project__meta">${escapeHtml(p.location || '—')} · ${p.year || '—'}</p>
                </div>
                <div class="admin-project__actions">
                    <button class="icon-btn" data-action="up"    title="Mover para cima"   aria-label="Mover para cima"   ${idx === 0 ? 'disabled' : ''}>▲</button>
                    <button class="icon-btn" data-action="down"  title="Mover para baixo"  aria-label="Mover para baixo"  ${idx === projects.length - 1 ? 'disabled' : ''}>▼</button>
                    <button class="icon-btn" data-action="edit"  title="Editar projeto"    aria-label="Editar projeto">✎</button>
                    <button class="icon-btn icon-btn--danger" data-action="delete" title="Excluir projeto" aria-label="Excluir projeto">×</button>
                </div>
            `;
            card.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => handleAction(idx, btn.dataset.action));
            });
            elProjectsList.appendChild(card);
        });
    };

    const categoryLabel = (cat) => ({
        residencial: 'Residencial',
        comercial: 'Comercial',
        interiores: 'Interiores'
    }[cat] || cat || 'Sem categoria');

    const escapeHtml = (str) => String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    // -----------------------------
    // Ações nos projetos
    // -----------------------------
    const handleAction = (idx, action) => {
        const arr = state.projects;
        switch (action) {
            case 'up':
                if (idx > 0) { [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]; markDirty(); render(); }
                break;
            case 'down':
                if (idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; markDirty(); render(); }
                break;
            case 'edit':
                openModal(idx);
                break;
            case 'delete':
                if (confirm(`Excluir o projeto "${arr[idx].title}"? Esta ação pode ser desfeita apenas via "Descartar mudanças locais".`)) {
                    arr.splice(idx, 1);
                    markDirty();
                    render();
                    toast('Projeto excluído');
                }
                break;
        }
    };

    // -----------------------------
    // Modal (criar/editar)
    // -----------------------------
    const openModal = (idx = null) => {
        const p = idx !== null ? state.projects[idx] : null;
        elModalTitle.textContent = idx !== null ? 'Editar projeto' : 'Novo projeto';
        elFldIndex.value = idx !== null ? idx : '';
        elFldTitle.value = p?.title || '';
        elFldCat.value   = p?.category || 'residencial';
        elFldLoc.value   = p?.location || '';
        elFldYear.value  = p?.year || '';
        elFldDesc.value  = p?.description || '';
        elFldCover.value = p?.cover || '';
        elFldGal.value   = (p?.gallery || []).join('\n');
        updatePreview();
        elModal.classList.add('is-open');
        elModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => elFldTitle.focus(), 50);
    };

    const closeModal = () => {
        elModal.classList.remove('is-open');
        elModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const updatePreview = () => {
        const url = elFldCover.value.trim();
        if (url) {
            elPreview.style.backgroundImage = `url('${url.replace(/'/g, "\\'")}')`;
            elPreview.textContent = '';
        } else {
            elPreview.style.backgroundImage = '';
            elPreview.textContent = 'Adicione uma URL acima para ver a prévia';
        }
    };
    elFldCover.addEventListener('input', updatePreview);

    elForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idx = elFldIndex.value === '' ? null : Number(elFldIndex.value);

        const title = elFldTitle.value.trim();
        const cover = elFldCover.value.trim();
        if (!title || !cover) {
            toast('Preencha título e capa.');
            return;
        }

        const gallery = elFldGal.value.split('\n').map(s => s.trim()).filter(Boolean);
        const existingIds = state.projects.map(p => p.id).filter((_, i) => i !== idx);
        const baseId = idx !== null && state.projects[idx]?.id
            ? state.projects[idx].id
            : uniqueId(slugify(title), existingIds);

        const projectData = {
            id: baseId,
            title,
            category: elFldCat.value,
            year: elFldYear.value ? Number(elFldYear.value) : null,
            location: elFldLoc.value.trim(),
            cover,
            gallery: gallery.length ? gallery : [cover],
            description: elFldDesc.value.trim()
        };
        // remove campos vazios opcionais para deixar o JSON limpo
        if (!projectData.year) delete projectData.year;
        if (!projectData.location) delete projectData.location;
        if (!projectData.description) delete projectData.description;

        if (idx !== null) {
            state.projects[idx] = projectData;
            toast('Projeto atualizado');
        } else {
            state.projects.push(projectData);
            toast('Projeto adicionado');
        }

        markDirty();
        render();
        closeModal();
    });

    $$('[data-close]', elModal).forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elModal.classList.contains('is-open')) closeModal();
    });

    // -----------------------------
    // Social fields
    // -----------------------------
    elSocialIg.addEventListener('input', () => {
        state.social.instagram = elSocialIg.value.trim();
        markDirty();
    });
    elSocialWpp.addEventListener('input', () => {
        state.social.whatsapp = elSocialWpp.value.replace(/\D/g, '');
        markDirty();
    });
    elSocialMsg.addEventListener('input', () => {
        state.social.whatsappMessage = elSocialMsg.value.trim();
        markDirty();
    });

    // -----------------------------
    // Novo, Download, Reset, Import
    // -----------------------------
    elAddBtn.addEventListener('click', () => openModal(null));

    elDownloadBtn.addEventListener('click', () => {
        const payload = {
            social: {
                instagram: state.social.instagram || '',
                whatsapp: state.social.whatsapp || '',
                whatsappMessage: state.social.whatsappMessage || ''
            },
            projects: state.projects || []
        };
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setStatus('Arquivo baixado ✓', 'is-saved');
        toast('Arquivo baixado. Agora envie ao GitHub.');
    });

    elResetBtn.addEventListener('click', async () => {
        if (!confirm('Descartar todas as mudanças locais e recarregar o conteúdo publicado?')) return;
        localStorage.removeItem(STORAGE_KEY);
        await loadRemote();
        isDirty = false;
        elDownloadBtn.disabled = true;
        setStatus('Sincronizado com o publicado', 'is-saved');
        render();
        toast('Mudanças locais descartadas');
    });

    elImportFile.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (!data || !Array.isArray(data.projects)) throw new Error('Formato inválido');
                state = {
                    social: data.social || {},
                    projects: data.projects
                };
                markDirty();
                render();
                toast('Arquivo importado');
            } catch (err) {
                alert(`Não foi possível ler o arquivo: ${err.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // -----------------------------
    // Link do GitHub
    // -----------------------------
    elGithubLink.href = UPLOAD_URL;

    // -----------------------------
    // Carrega dados
    // -----------------------------
    const loadRemote = async () => {
        const res = await fetch(`data/projects.json?_=${Date.now()}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        state = {
            social: data.social || {},
            projects: Array.isArray(data.projects) ? data.projects : []
        };
    };

    const init = async () => {
        try {
            await loadRemote();
            const local = loadLocal();
            if (local && Array.isArray(local.projects)) {
                // se há mudanças locais, oferece usar ou descartar
                const useLocal = confirm('Encontramos alterações salvas no seu navegador, ainda não publicadas. Deseja continuar de onde parou?\n\nOK = Continuar • Cancelar = Descartar');
                if (useLocal) {
                    state = local;
                    isDirty = true;
                    elDownloadBtn.disabled = false;
                    setStatus('Alterações não publicadas', 'is-dirty');
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                    setStatus('Sincronizado com o publicado', 'is-saved');
                }
            } else {
                setStatus('Sincronizado com o publicado', 'is-saved');
            }
            render();
        } catch (err) {
            console.error(err);
            // tenta cair no localStorage se não conseguir puxar remoto
            const local = loadLocal();
            if (local) {
                state = local;
                isDirty = true;
                elDownloadBtn.disabled = false;
                setStatus('Sem conexão — usando rascunho local', 'is-dirty');
                render();
            } else {
                setStatus('Erro ao carregar dados', 'is-dirty');
                alert('Não foi possível carregar os dados do site.');
            }
        }
    };

    init();

    // Avisa antes de sair se houver mudanças
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    });
})();
