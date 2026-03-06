"use client";

import { useEffect, useRef } from "react";

export default function GlobeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let angle = 0;

        function resize() {
            if (!canvas) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        // Style icône : peu de lignes, traits épais
        const LAT_LINES = 5;   // équateur + 4 parallèles
        const LON_LINES = 8;   // méridiens bien espacés
        const LINE_WIDTH = 4;   // trait épais style icône
        const STROKE = "rgba(255, 255, 255, 0.18)";

        function project(
            latDeg: number,
            lonDeg: number,
            rotY: number,
            cx: number,
            cy: number,
            radius: number
        ) {
            const phi = (latDeg * Math.PI) / 180;
            const theta = (lonDeg * Math.PI) / 180 + rotY;
            return {
                x: cx + radius * Math.cos(phi) * Math.sin(theta),
                y: cy - radius * Math.sin(phi),
                z: radius * Math.cos(phi) * Math.cos(theta),
            };
        }

        function draw() {
            if (!canvas || !ctx) return;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            // Globe qui remplit quasi toute la section
            const radius = Math.min(w, h) * 0.46;

            angle += 0.004;

            ctx.strokeStyle = STROKE;
            ctx.lineWidth = LINE_WIDTH;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // ── Lignes de latitude ──────────────────────────────────────
            for (let i = 0; i <= LAT_LINES; i++) {
                const lat = -90 + (180 / LAT_LINES) * i;
                const STEPS = 120;
                ctx.beginPath();
                let started = false;
                for (let j = 0; j <= STEPS; j++) {
                    const lon = (360 / STEPS) * j;
                    const p = project(lat, lon, angle, cx, cy, radius);
                    // masquer l'hémisphère arrière
                    if (p.z < 0) { started = false; continue; }
                    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // ── Méridiens ───────────────────────────────────────────────
            for (let i = 0; i < LON_LINES; i++) {
                const lon = (360 / LON_LINES) * i;
                const STEPS = 60;
                ctx.beginPath();
                let started = false;
                for (let j = 0; j <= STEPS; j++) {
                    const lat = -90 + (180 / STEPS) * j;
                    const p = project(lat, lon, angle, cx, cy, radius);
                    if (p.z < 0) { started = false; continue; }
                    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // ── Contour du globe (cercle externe) ───────────────────────
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = LINE_WIDTH + 1;
            ctx.stroke();

            animationId = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        />
    );
}
