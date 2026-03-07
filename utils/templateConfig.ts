/**
 * Gestion de la configuration du template de boarding pass
 */

export interface TemplateBlock {
    left: number;
    top: number;
    width?: number;
    height?: number;
    fontSize?: number;
    color?: string;
    fontWeight?: number;
}

export interface TemplateConfig {
    backgroundImage: string;
    blocks: {
        photo: TemplateBlock;
        name: TemplateBlock;
        destination: TemplateBlock;
        anecdote: TemplateBlock;
        stop1: TemplateBlock;
        stop2: TemplateBlock;
        stop3: TemplateBlock;
        bonPlan1: TemplateBlock;
        bonPlan2: TemplateBlock;
        bonPlan3: TemplateBlock;
    };
}

const DEFAULT_CONFIG: TemplateConfig = {
    backgroundImage: '/img/tampon d embarcation.png',
    blocks: {
        photo: {
            left: 587,
            top: 60,
            width: 590,
            height: 663
        },
        stop1: {
            left: 297,
            top: 515,
            fontSize: 24,
            color: '#1a1a1a',
            fontWeight: 800
        },
        stop2: {
            left: 312,
            top: 648,
            fontSize: 24,
            color: '#1a1a1a',
            fontWeight: 800
        },
        stop3: {
            left: 327,
            top: 792,
            fontSize: 24,
            color: '#1a1a1a',
            fontWeight: 800
        },
        bonPlan1: {
            left: 450,
            top: 515,
            fontSize: 20,
            color: '#1a1a1a',
            fontWeight: 600
        },
        bonPlan2: {
            left: 465,
            top: 648,
            fontSize: 20,
            color: '#1a1a1a',
            fontWeight: 600
        },
        bonPlan3: {
            left: 480,
            top: 792,
            fontSize: 20,
            color: '#1a1a1a',
            fontWeight: 600
        },
        name: {
            left: 283,
            top: 1064,
            fontSize: 34,
            color: 'white',
            fontWeight: 900
        },
        destination: {
            left: 869,
            top: 1176,
            fontSize: 40,
            color: '#1a1a1a',
            fontWeight: 900
        },
        anecdote: {
            left: 500,
            top: 1349,
            width: 450,
            fontSize: 22,
            color: '#2a2a2a',
            fontWeight: 700
        }
    }
};

/**
 * Récupère la configuration (depuis localStorage ou défaut)
 */
export function getTemplateConfig(): TemplateConfig {
    if (typeof window === 'undefined') {
        return DEFAULT_CONFIG;
    }

    try {
        const saved = localStorage.getItem('boarding_pass_config');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_CONFIG,
                ...parsed,
                blocks: {
                    ...DEFAULT_CONFIG.blocks,
                    ...(parsed.blocks || {})
                }
            };
        }
    } catch (error) {
        console.error('Error loading template config:', error);
    }

    return DEFAULT_CONFIG;
}

/**
 * Helper: compresse une image base64 pour éviter de saturer le localStorage
 */
async function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
    if (!dataUrl.startsWith('data:image/')) return dataUrl; // Ne pas toucher aux URLs classiques

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(dataUrl);

            ctx.drawImage(img, 0, 0, width, height);
            // Toujours compresser en JPEG pour réduire la taille, même si c'était un PNG originellement,
            // sauf s'il y a de la transparence, mais pour un boarding pass background, le JPEG suffit.
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

/**
 * Retourne la configuration par défaut
 */
export function getDefaultConfig(): TemplateConfig {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * Récupère la configuration (depuis localStorage ou API)
 */
export async function fetchTemplateConfig(): Promise<TemplateConfig> {
    if (typeof window === 'undefined') {
        return DEFAULT_CONFIG; // Sur le serveur strict
    }
    
    try {
        const res = await fetch(`/api/template-config?t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            return {
                ...DEFAULT_CONFIG,
                ...data,
                blocks: {
                    ...DEFAULT_CONFIG.blocks,
                    ...(data.blocks || {})
                }
            };
        }
    } catch (e) {
        console.warn('Network template config fetch failed, falling back to local');
    }
    
    // Fallback local storage
    return getTemplateConfig();
}

/**
 * Sauvegarde la configuration dans Supabase !
 */
export async function saveTemplateConfig(config: TemplateConfig): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const configToSave = { ...config };

        // Compresser l'image de fond si elle est trop volumineuse (base64)
        if (configToSave.backgroundImage && configToSave.backgroundImage.startsWith('data:') && configToSave.backgroundImage.length > 500000) {
            console.log('Compressing background image before saving...');
            configToSave.backgroundImage = await compressImage(configToSave.backgroundImage, 1200, 0.6);
        }
        
        // 1. Sauvegarder en local pour réponse rapide Admin
        const configString = JSON.stringify(configToSave);
        localStorage.setItem('boarding_pass_config', configString);
        
        // 2. Sauvegarder pour tous les utilisateurs sur Supabase
        const res = await fetch('/api/admin/template-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: configString
        });
        
        if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || 'Erreur API upload config');
        }

    } catch (error) {
        console.error('Error saving template config:', error);
        throw error;
    }
}

/**
 * Reset vers la configuration par défaut
 */
export async function resetTemplateConfig(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('boarding_pass_config');
        await fetch('/api/admin/template-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEFAULT_CONFIG)
        });
    } catch (error) {
        console.error('Error resetting template config:', error);
    }
}
