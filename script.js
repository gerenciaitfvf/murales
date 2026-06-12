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
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const panels = document.querySelectorAll('.panel');

    // Estado del lightbox para navegación de secuencias
    let lightboxImages = [];
    let lightboxIndex = 0;

    /* --------------------------------------------
       WEBP SUPPORT DETECTION
       -------------------------------------------- */
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
    }

    const webpSupported = supportsWebP();

    function toWebP(src) {
        if (!webpSupported) return src;
        return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    }

    /* --------------------------------------------
       LAZY LOADING + WEBP CONVERSION
       -------------------------------------------- */
    function optimizeImages() {
        document.querySelectorAll('.panel img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            if (webpSupported && img.src) {
                const webpSrc = toWebP(img.getAttribute('src'));
                const test = new Image();
                test.onload = function() { img.src = webpSrc; };
                test.onerror = function() { /* keep png */ };
                test.src = webpSrc;
            }
        });

        document.querySelectorAll('.stack-item').forEach(item => {
            const bg = item.style.backgroundImage;
            if (webpSupported && bg) {
                const match = bg.match(/url\(['"]?(.+?\.(?:png|jpg|jpeg))['"]?\)/i);
                if (match) {
                    const webpUrl = toWebP(match[1]);
                    item.style.backgroundImage = `url('${webpUrl}')`;
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
        optimizeImages();
    }

    /* --------------------------------------------
       LIGHTBOX
       -------------------------------------------- */
    function extractBgUrl(bgValue) {
        if (!bgValue || bgValue === 'none') return null;
        const match = bgValue.match(/url\(['"]?(.+?)['"]?\)/);
        return match ? match[1] : null;
    }

    function buildImageList(panel) {
        // Si el panel es una secuencia, junta todos los stack-items
        const stackItems = panel.querySelectorAll('.stack-item');
        if (stackItems.length > 0) {
            const urls = [];
            stackItems.forEach(item => {
                const url = extractBgUrl(item.style.backgroundImage);
                if (url) urls.push(url);
            });
            return urls;
        }
        // Si tiene un <img>, usa solo esa imagen
        const img = panel.querySelector('img');
        if (img) return [img.currentSrc || img.src];
        return [];
    }

    function showImage(index) {
        if (index < 0 || index >= lightboxImages.length) return;
        lightboxIndex = index;
        lightboxImg.src = lightboxImages[index];
        if (lightboxImages.length > 1) {
            lightboxCounter.textContent = (index + 1) + ' / ' + lightboxImages.length;
            lightboxCounter.hidden = false;
            lightboxPrev.hidden = false;
            lightboxNext.hidden = false;
        } else {
            lightboxCounter.hidden = true;
            lightboxPrev.hidden = true;
            lightboxNext.hidden = true;
        }
    }

    function openLightbox(panel) {
        lightboxImages = buildImageList(panel);
        if (lightboxImages.length === 0) return;

        showImage(0);

        lightboxTitle.textContent = panel.dataset.title || '';
        lightboxDesc.textContent = panel.dataset.desc || '';
        lightboxPlate.textContent = panel.dataset.plate
            ? 'Placa N° ' + panel.dataset.plate
            : '';

        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function navigatePrev() {
        if (lightboxImages.length < 2) return;
        const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        showImage(newIndex);
    }

    function navigateNext() {
        if (lightboxImages.length < 2) return;
        const newIndex = (lightboxIndex + 1) % lightboxImages.length;
        showImage(newIndex);
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
       CIERRE Y NAVEGACIÓN DEL LIGHTBOX
       -------------------------------------------- */
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', e => { e.stopPropagation(); navigatePrev(); });
    lightboxNext.addEventListener('click', e => { e.stopPropagation(); navigateNext(); });

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigatePrev();
        if (e.key === 'ArrowRight') navigateNext();
    });

    /* --------------------------------------------
       FILTRADO POR CATEGORÍA
       -------------------------------------------- */
    const filterButtons = document.querySelectorAll('[data-filter]');
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
