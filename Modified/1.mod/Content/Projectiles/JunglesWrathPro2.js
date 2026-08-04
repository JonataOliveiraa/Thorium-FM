import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

export class JunglesWrathPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.tileCollide = false;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }

    GetAlpha(proj, color) {
        const opacity = 1 - proj.alpha / 255;
        return Color.Multiply(Color.new(255, 255, 255, 0), 0.85 * opacity);
    }

    // O empurrao sai de voce, nao do esporo
    ModifyHitNPC(proj, npc, hit, modifiers) {
        const player = Main.player[proj.owner];
        if (player) modifiers.HitDirectionOverride = npc.Center.X < player.Center.X ? -1 : 1;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.Poisoned, 120, false);
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.rotation += vel.X > 0 ? 0.15 : -0.15;

        if (proj.timeLeft < 20) proj.alpha = Math.min(255, proj.alpha + 10);

        if (Math.random() < 0.5) return;

        const dust = Main.dust[Effects.NewDust(
            proj.position, proj.width, proj.height,
            44, vel.X * 0.2, vel.Y * 0.2, 150, Color.White, 1
        )];
        if (dust) dust.noGravity = true;
    }
}
