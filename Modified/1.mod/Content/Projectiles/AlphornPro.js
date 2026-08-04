import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const SIGHT = 800;
const SEARCH_EVERY = 15; // ticks entre uma varredura de alvos e outra

export class AlphornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 36;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 240;
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, 1 - proj.alpha / 255);
    }

    /**
     * ai[0] conta os ticks. Nos primeiros 20 a nota sobe e freia; depois disso
     * ela para no ar e sai atras do inimigo mais proximo.
     */
    AI(proj) {
        proj.rotation = 0;

        const ai = new ProjAI(proj, false);
        ai[0] = ai[0] + 1;

        if (ai[0] < 20) {
            proj.velocity = Vector2.Multiply(proj.velocity, 0.9);
        } else if (ai[0] === 20) {
            proj.velocity = Vector2.Zero;
        } else {
            this._chase(proj);
        }

        if (++proj.frameCounter > 3) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 4;
        }

        // Some nos ultimos 50 ticks
        if (proj.timeLeft < 50) proj.alpha = Math.min(255, proj.alpha + 5);
    }

    _chase(proj) {
        const center = proj.Center;
        const best = this._findTarget(proj, center);
        if (!best) return;

        const dx = best.Center.X - center.X;
        const dy = best.Center.Y - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const vel = proj.velocity;

        proj.velocity = Vector2.new(
            (vel.X * 20 + dx / dist * 5) / 21,
            (vel.Y * 20 + dy / dist * 5) / 21
        );
    }

    /**
     * ai[1] = ticks ate refazer a busca | ai[2] = alvo guardado (indice + 1).
     * Varrer os 200 NPCs todo tick, com varias notas no ar ao mesmo tempo,
     * era caro a toa: o alvo raramente muda de um tick pro outro.
     */
    _findTarget(proj, center) {
        const ai = new ProjAI(proj, false);
        const cached = ai[2] | 0;

        if (ai[1] > 0) {
            ai[1] = ai[1] - 1;

            if (cached > 0) {
                const npc = Main.npc[cached - 1];
                if (npc && npc.active && npc.CanBeChasedBy(proj, false)) return npc;
            }
            return null;
        }

        ai[1] = SEARCH_EVERY;

        let best = null;
        let bestDistSq = SIGHT * SIGHT;

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (!npc || !npc.active || !npc.CanBeChasedBy(proj, false)) continue;

            const dx = npc.Center.X - center.X;
            const dy = npc.Center.Y - center.Y;
            const distSq = dx * dx + dy * dy;
            if (distSq >= bestDistSq) continue;

            bestDistSq = distSq;
            best = npc;
        }

        ai[2] = best ? best.whoAmI + 1 : 0;
        return best;
    }

    // Nao morre na parede: a nota atravessa o cenario
    OnTileCollide(proj, hitDirection) {
        return false;
    }

    OnKill(proj) {
        const center = proj.Center;
        FxHelper.ring(center.X, center.Y, 15, 10, 5, 16, 1, 1.25, proj.rotation, 125);
    }
}
