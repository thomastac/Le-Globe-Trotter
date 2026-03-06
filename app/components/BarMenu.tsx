"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
};

export default function BarMenu() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('menu_items')
                .select('*')
                .eq('active', true)
                .order('category');
            if (data) setItems(data);
            setLoading(false);
        })();
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Chargement du menu...</div>;
    if (items.length === 0) return null;

    const grouped = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <h2 className="font-hand" style={{ textAlign: 'center', fontSize: '3.5rem', color: '#fff', marginBottom: 12 }}>Le Bar des GlobeTrotters</h2>
            <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
                Découvrez nos spécialités inspirées de nos voyages.
            </p>

            <div className="menu-grid">
                {Object.entries(grouped).map(([category, catItems]) => (
                    <div key={category} className="menu-category">
                        <h3 className="font-hand" style={{ fontSize: '2.5rem', color: '#f6b17a', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>{category}</h3>
                        <div className="menu-list">
                            {catItems.map((item) => (
                                <div key={item.id} className="menu-item">
                                    {item.image_url && (
                                        <div className="menu-item-img">
                                            <img src={item.image_url} alt={item.name} />
                                        </div>
                                    )}
                                    <div className="menu-item-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{item.name}</h4>
                                            <span style={{ fontWeight: 700, color: '#f6b17a' }}>{item.price}€</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#9ca3af', fontStyle: 'italic' }}>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .menu-grid {
          display: grid;
          gap: 48px;
        }
        @media (min-width: 768px) {
          .menu-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .menu-item {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
        }
        .menu-item-img {
          flex: 0 0 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .menu-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .menu-item-content {
          flex: 1;
        }
      `}</style>
        </div>
    );
}
