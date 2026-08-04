import { Terraria, Modules } from '../../../TL/ModImports.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

// Getters de Color/Vector2 sao chamadas nativas: resolve uma vez so
const WHITE = Color.White;

// Circulos unitarios ficam em cache por quantidade de pontos, entao os aneis
// nao precisam de RotatedBy/SafeNormalize (chamada nativa) por particula.
const circles = new Map();

function unitCircle(count) {
    let pts = circles.get(count);
    if (pts) return pts;

    pts = new Array(count);
    const step = Math.PI * 2 / count;
    for (let i = 0; i < count; i++) {
        const a = i * step;
        pts[i] = { x: Math.sin(a), y: -Math.cos(a) };
    }
    circles.set(count, pts);
    return pts;
}

export class FxHelper {
    /**
     * Anel de dust. rotation gira o anel inteiro; inward faz as particulas
     * convergirem pro centro em vez de explodirem pra fora.
     */
    static ring(cx, cy, count, radiusX, radiusY, dustType, speed, scale, rotation = 0, alpha = 100, inward = false) {
        const pts = unitCircle(count);
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const origin = Vector2.new(cx, cy);
        const push = inward ? -speed : speed;

        for (let i = 0; i < count; i++) {
            const ox = pts[i].x * radiusX;
            const oy = pts[i].y * radiusY;
            const rx = ox * cos - oy * sin;
            const ry = ox * sin + oy * cos;

            const dust = Main.dust[Effects.NewDust(origin, 0, 0, dustType, 0, 0, alpha, WHITE, scale)];
            if (!dust) continue;

            dust.noGravity = true;
            dust.position = Vector2.new(cx + rx, cy + ry);

            if (speed === 0) continue;
            const len = Math.sqrt(rx * rx + ry * ry) || 1;
            dust.velocity = Vector2.new(rx / len * push, ry / len * push);
        }
    }

    static burst(position, width, height, count, dustType, spread, scale, alpha = 100, noGravity = true) {
        for (let i = 0; i < count; i++) {
            const dust = Main.dust[Effects.NewDust(
                position, width, height, dustType,
                (Math.random() * 2 - 1) * spread, (Math.random() * 2 - 1) * spread,
                alpha, WHITE, scale
            )];
            if (dust && noGravity) dust.noGravity = true;
        }
    }
}
