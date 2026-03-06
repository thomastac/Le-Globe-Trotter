import React from 'react';
import FloatingIconsBackground from '../components/FloatingIconsBackground';

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <FloatingIconsBackground />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </>
    );
}
