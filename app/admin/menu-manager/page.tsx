"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface MenuItem {
    id: string;
    image_url: string;
    category: string;
    price: number;
    active: boolean;
}

export default function MenuManager() {
    const router = useRouter();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (!isAuth) {
            router.push('/');
            return;
        }

        loadMenuItems();
    }, [router]);

    const loadMenuItems = async () => {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('category', 'MenuPage')
                .order('price', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error loading menu items:', error);
            alert('Erreur lors du chargement des items du menu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette image du menu ?')) {
            return;
        }

        try {
            setDeleting(id);
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('✅ Image supprimée avec succès !');
            loadMenuItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .update({ active: !currentActive })
                .eq('id', id);

            if (error) throw error;
            loadMenuItems();
        } catch (error) {
            console.error('Error toggling active:', error);
            alert('Erreur lors de la modification');
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', padding: '80px 16px', background: 'var(--paper)' }}>
                <div style={{ textAlign: 'center' }}>Chargement...</div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', padding: '80px 16px 32px', background: 'var(--paper)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <h1 className="font-hand" style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🍽️ Gestion du Menu
                    </h1>
                    <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                        {items.length} images dans le menu
                    </p>
                    <button onClick={() => router.back()} className="btn">
                        ← Retour au Dashboard
                    </button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {items.map((item) => (
                        <div key={item.id} className="card paper-texture" style={{ padding: '16px', border: '1.5px solid var(--vintage-border)' }}>
                            <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--vintage-border)' }}>
                                <img
                                    src={item.image_url}
                                    alt={`Menu ${item.price}`}
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>
                                    <strong>Ordre:</strong> {item.price}
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>
                                    <strong>ID:</strong> {item.id.substring(0, 8)}...
                                </p>
                                <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                                    <span className={`badge ${item.active ? 'badge-success' : 'badge-muted'}`} style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        background: item.active ? '#dcfce7' : '#e7e5e4',
                                        color: item.active ? '#166534' : '#57534e'
                                    }}>
                                        {item.active ? '✓ Actif' : '✕ Inactif'}
                                    </span>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleToggleActive(item.id, item.active)}
                                    className="btn"
                                    style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                                >
                                    {item.active ? 'Désactiver' : 'Activer'}
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        padding: '8px 12px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    disabled={deleting === item.id}
                                >
                                    {deleting === item.id ? '⏳' : '🗑️ Supprimer'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
