"use client";

import { useEffect, useState, useRef } from "react";

const svgs = [
    // 0: Suitcase
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="12" height="12" rx="2" ry="2"></rect><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M10 12h4"></path><path d="M10 16h4"></path></svg>,
    // 1: Cocktail
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"></path><path d="M12 15v7"></path><path d="m3 5 9 10 9-10Z"></path><path d="m15 5-2-4"></path><path d="M5.5 8h13"></path></svg>,
    // 2: Globe
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>,
    // 3: Ticket
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>,
    // 4: Passport
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z"></path><circle cx="12" cy="12" r="3"></circle><path d="M9 19h6"></path><path d="M10 6h4"></path></svg>
];

const generateIconProps = () => {
    const items = [];
    const totalIcons = 60; // 60 blocks for the grid to fill out, auto-wrapping

    for (let i = 0; i < totalIcons; i++) {
        // Pick an SVG index in a way that avoids immediate neighbors being identical
        const svgIndex = (i * 3 + Math.floor(i / 6)) % svgs.length;

        // Fixed larger size
        const size = 64;
        const opacity = 0.05 + ((i % 3) * 0.02); // 0.05, 0.07, 0.09 giving slight variance but clean

        items.push({
            id: `icon-${i}`,
            svg: svgs[svgIndex],
            size: `${size}px`,
            opacity
        });
    }
    return items;
};

export default function FloatingIconsBackground() {
    const [icons, setIcons] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollOffsetRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const speedRef = useRef(0.3); // Base falling speed in pixels per frame
    const maxBonusSpeed = 10;     // Max speed burst when scrolling

    useEffect(() => {
        setIcons(generateIconProps());
    }, []);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let bonusSpeed = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const diff = Math.abs(currentScrollY - lastScrollY);

            // Inject bonus speed proportional to scroll strength
            bonusSpeed = Math.min(bonusSpeed + Math.max(diff * 0.2, 1), maxBonusSpeed);
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        const tick = () => {
            // Decay bonus speed smoothly
            if (bonusSpeed > 0) {
                bonusSpeed = Math.max(0, bonusSpeed * 0.92 - 0.1);
            }

            const totalSpeed = speedRef.current + bonusSpeed;
            scrollOffsetRef.current += totalSpeed;

            if (containerRef.current) {
                // Reset offset seamlessly at 50% since we duplicate the grid exactly
                const h = containerRef.current.scrollHeight / 2;
                if (h > 0 && scrollOffsetRef.current >= h) {
                    scrollOffsetRef.current -= h;
                }
                containerRef.current.style.transform = `translateY(${scrollOffsetRef.current}px)`;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    if (icons.length === 0) return null;

    return (
        <div className="floating-icons-container">
            <div
                ref={containerRef}
                className="floating-icons-layer"
                style={{ animation: 'none', top: '-100%' }} // Start offset upwards so it falls down smoothly
            >
                <div className="icon-group">
                    {icons.map((item) => (
                        <div
                            key={item.id}
                            className="floating-icon"
                            style={{
                                width: item.size,
                                height: item.size,
                                opacity: item.opacity,
                            }}
                        >
                            {item.svg}
                        </div>
                    ))}
                </div>
                <div className="icon-group">
                    {icons.map((item) => (
                        <div
                            key={`${item.id}-clone`}
                            className="floating-icon"
                            style={{
                                width: item.size,
                                height: item.size,
                                opacity: item.opacity,
                            }}
                        >
                            {item.svg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
