import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const DRAG = 0.975;
const GROW_EVERY = 2;     // ticks entre cada crescida
const GROW_PX = 4;        // quanto a hitbox cresce por vez
const GROW_SCALE = 0.1;
const MAX_SCALE = 1.75;
const DUST_TYPE = 16;
const DUST_PER_TICK = 4;

export class FlurryPro extends ModProjectile {
    constructor() {
        super();
        // Sem textura: o sopro inteiro e feito de poeira
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 6;
        this.Projectile.height = 6;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 60;
        this.Projectile.extraUpdates = 1;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.Frostburn, 90, false);
    }

    // ai[0] conta os ticks ate a proxima crescida
    AI(proj) {
        const vel = proj.velocity;
        proj.velocity = Vector2.new(vel.X * DRAG, vel.Y * DRAG);

        const ai = new ProjAI(proj, false);
        ai[0] = ai[0] + 1;

        // A nuvem vai abrindo conforme avanca. A posicao e corrigida pros dois
        // lados pra hitbox crescer a partir do centro, nao do canto.
        if (ai[0] > GROW_EVERY && proj.scale < MAX_SCALE) {
            const pos = proj.position;
            const cx = pos.X + proj.width / 2;
            const cy = pos.Y + proj.height / 2;

            proj.width += GROW_PX;
            proj.height += GROW_PX;
            proj.scale += GROW_SCALE;

            proj.position = Vector2.new(cx - proj.width / 2, cy - proj.height / 2);
            ai[0] = 0;
        }

        const trailPos = Vector2.new(proj.position.X - vel.X, proj.position.Y - vel.Y);

        for (let i = 0; i < DUST_PER_TICK; i++) {
            const dust = Main.dust[Effects.NewDust(
                trailPos, proj.width, proj.height, DUST_TYPE, 0, 0, 150, WHITE, 1
            )];
            if (!dust) continue;

            dust.velocity = Vector2.Zero;
            dust.fadeIn = 1.25 + Math.random() * 0.25;
            dust.noGravity = true;
        }
    }

    OnKill(proj) {
        const center = proj.Center;
        const vel = proj.velocity;

        for (let i = 0; i < 8; i++) {
            const dust = Main.dust[Effects.NewDust(
                center, 10, 10, DUST_TYPE, vel.X * 0.25, vel.Y * 0.25, 150, WHITE, 1
            )];
            if (!dust) continue;

            dust.fadeIn = 1.3 + Math.random() * 0.2;
            dust.noGravity = true;

            const dv = dust.velocity;
            dust.position = Vector2.new(dust.position.X + dv.X * 4, dust.position.Y + dv.Y * 4);
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
