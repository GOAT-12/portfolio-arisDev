type TiltOptions = {
    maxTiltDeg: number;
    perspectivePx: number;
    scale: number;
    glare: boolean;
};

const defaultOptions: TiltOptions = {
    maxTiltDeg: 10,
    perspectivePx: 900,
    scale: 1.02,
    glare: false,
};

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function parseNumberAttr(el: HTMLElement, name: string): number | undefined {
    const raw = el.getAttribute(name);
    if (!raw) return undefined;
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
}

function getOptions(el: HTMLElement): TiltOptions {
    return {
        maxTiltDeg: parseNumberAttr(el, 'data-tilt-max') ?? defaultOptions.maxTiltDeg,
        perspectivePx: parseNumberAttr(el, 'data-tilt-perspective') ?? defaultOptions.perspectivePx,
        scale: parseNumberAttr(el, 'data-tilt-scale') ?? defaultOptions.scale,
        glare: (el.getAttribute('data-tilt-glare') ?? '').toLowerCase() === 'true' || defaultOptions.glare,
    };
}

function ensureGlare(el: HTMLElement): HTMLDivElement {
    let glare = el.querySelector<HTMLDivElement>(':scope > [data-tilt-glare-layer]');
    if (glare) return glare;

    glare = document.createElement('div');
    glare.setAttribute('data-tilt-glare-layer', '');
    glare.style.position = 'absolute';
    glare.style.inset = '0';
    glare.style.pointerEvents = 'none';
    glare.style.borderRadius = 'inherit';
    glare.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%)';
    glare.style.opacity = '0';
    glare.style.transition = 'opacity 160ms ease';

    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') {
        el.style.position = 'relative';
    }

    el.appendChild(glare);
    return glare;
}

function setTransform(el: HTMLElement, rx: number, ry: number, scale: number) {
    el.style.transform = `perspective(var(--tilt-perspective, 900px)) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
}

export function initTilt3D(root: ParentNode = document): void {
    if (prefersReducedMotion()) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-tilt]'));
    for (const el of targets) {
        if (el.dataset.tiltInit === 'true') continue;
        el.dataset.tiltInit = 'true';

        const opts = getOptions(el);

        el.style.willChange = 'transform';
        el.style.transformStyle = 'preserve-3d';
        el.style.transition = el.style.transition || 'transform 160ms ease';
        el.style.setProperty('--tilt-perspective', `${opts.perspectivePx}px`);

        const glareLayer = opts.glare ? ensureGlare(el) : null;

        let raf = 0;

        const onMove = (clientX: number, clientY: number) => {
            const rect = el.getBoundingClientRect();
            const px = (clientX - rect.left) / rect.width;
            const py = (clientY - rect.top) / rect.height;

            const dx = clamp(px * 2 - 1, -1, 1);
            const dy = clamp(py * 2 - 1, -1, 1);

            const rx = -(dy * opts.maxTiltDeg);
            const ry = dx * opts.maxTiltDeg;

            if (glareLayer) {
                glareLayer.style.opacity = '1';
                glareLayer.style.transform = `translate3d(${dx * 6}px, ${dy * 6}px, 0)`;
            }

            setTransform(el, rx, ry, opts.scale);
        };

        const reset = () => {
            if (glareLayer) glareLayer.style.opacity = '0';
            setTransform(el, 0, 0, 1);
        };

        el.addEventListener('pointerenter', () => {
            el.style.transition = 'transform 80ms ease';
        });

        el.addEventListener('pointermove', (e) => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => onMove(e.clientX, e.clientY));
        });

        el.addEventListener('pointerleave', () => {
            el.style.transition = 'transform 220ms ease';
            reset();
        });

        el.addEventListener('blur', reset, true);

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') reset();
        });
    }
}
