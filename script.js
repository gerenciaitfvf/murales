/* ============================================
   MURAL VINOTINTO - Interactividad
   ============================================ */
(function () {
    'use strict';

    const mural = document.getElementById('mural');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxPlate = document.getElementById('lightboxPlate');
    const lightboxClose = document.getElementById('lightboxClose');
    const panels = document.querySelectorAll('.panel');

    /* --------------------------------------------
       LIGHTBOX
       -------------------------------------------- */
    function openLightbox(panel) {
        // Resuelve la imagen a mostrar: usa el <img> si existe,
        // o el primer background-image de un stack-item (secuencias).
        const img = panel.querySelector('img');
        const stackItem = panel.querySelector('.stack-item');

        if (img) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
        } else if (stackItem) {
            const bg = window.getComputedStyle(stackItem).backgroundImage;
            const match = bg.match(/url\(['"]?(.+?)['"]?\)/);
            if (!match) return;
            lightboxImg.src = match[1];
            lightboxImg.alt = panel.dataset.title || '';
        } else {
            return;
        }

        lightboxTitle.textContent = panel.dataset.title || '';
        lightboxDesc.textContent = panel.dataset.desc || '';
        lightboxPlate.textContent = panel.dataset.plate
            ? 'Placa N° ' + panel.dataset.plate
            : 'Placa del archivo';

        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    /* --------------------------------------------
       CLICK EN PANEL -> LIGHTBOX
       -------------------------------------------- */
    panels.forEach(panel => {
        panel.addEventListener('click', () => openLightbox(panel));
    });

    function highlightPanel(target) {
        panels.forEach(p => {
            if (p === target) {
                p.classList.add('is-highlight');
                p.classList.remove('is-dimmed');
            } else {
                p.classList.add('is-dimmed');
                p.classList.remove('is-highlight');
            }
        });
    }

    function clearHighlight() {
        panels.forEach(p => {
            p.classList.remove('is-highlight');
            p.classList.remove('is-dimmed');
        });
    }

    /* --------------------------------------------
       CIERRE DEL LIGHTBOX
       -------------------------------------------- */
    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });

    /* --------------------------------------------
       FILTRADO POR CATEGORÍA
       -------------------------------------------- */
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            panels.forEach(panel => {
                const cat = panel.dataset.category;
                if (filter === 'all' || cat === filter) {
                    panel.style.display = '';
                    requestAnimationFrame(() => {
                        panel.style.opacity = '1';
                        panel.style.transform = 'scale(1)';
                    });
                } else {
                    panel.style.opacity = '0';
                    panel.style.transform = 'scale(0.9)';
                    setTimeout(() => { panel.style.display = 'none'; }, 300);
                }
            });
        });
    });

    /* --------------------------------------------
       ACCESIBILIDAD - Soporte teclado
       -------------------------------------------- */
    panels.forEach(panel => {
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('role', 'button');
        panel.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(panel);
            }
        });
    });

})();
