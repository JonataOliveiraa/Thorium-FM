import { Terraria, Modules } from "./../../TL/ModImports.js";
import { ModProjectile } from "./../../TL/ModProjectile.js";
import { Effects } from "./../../TL/Modules/Effects.js";
import { Color } from "./../../TL/Modules/Color.js";
import { ProjAI } from "./../../TL/ProjAI.js";
import { ModBuff } from "../../TL/ModBuff.js";

const { Vector2 } = Modules;
const DUST_COLOR = Color.new(180, 255, 100);
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BloomingWandPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.alpha = 255;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 100;
        this.Projectile.tileCollide = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 20;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj, false);

        if (localAI[0] === 0 && localAI[1] === 0) {
            localAI[0] = proj.velocity.X;
            localAI[1] = proj.velocity.Y;
        }

        ai[0]++;

        if (proj.alpha > 0) proj.alpha = Math.max(0, proj.alpha - 25);

        const baseX = localAI[0];
        const baseY = localAI[1];
        const baseLen = Math.sqrt(baseX * baseX + baseY * baseY);
        const dirX = baseLen > 0 ? baseX / baseLen : 0;
        const dirY = baseLen > 0 ? baseY / baseLen : 0;

        const perpX = -dirY;
        const perpY = dirX;

        const amplitude = Math.min(ai[0] * 0.08, 4.0);
        const wave = Math.sin(ai[0] * 0.4) * amplitude; // 0.25 → 0.4 (mais zigzag)

        proj.velocity = Vector2.new(
            baseX + perpX * wave * 0.15,
            baseY + perpY * wave * 0.15
        );

        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);

        const spawnDust = (scale, alpha, offsetX = 0, offsetY = 0) => {
            const pos = Vector2.new(proj.Center.X + offsetX, proj.Center.Y + offsetY);
            const dustIndex = Effects.NewDust(pos, 0, 0, 89, 0, 0, alpha, DUST_COLOR, scale);
            if (dustIndex >= 0 && dustIndex < 2000) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.noGravity = true;
                dust.noLight = true;
                const dv = dust.velocity;
                dv.X = 0;
                dv.Y = 0;
                dust.velocity = dv;
            }
        };

        // Trail grande — 6 dusts por frame em posições ao redor do centro
        spawnDust(1.1, 80);
        spawnDust(0.9, 100, -dirX * 6, -dirY * 6);
        spawnDust(0.9, 100, dirX * 6, dirY * 6);
        spawnDust(0.7, 130, perpX * 4, perpY * 4);
        spawnDust(0.7, 130, -perpX * 4, -perpY * 4);
        if (proj.alpha === 0) spawnDust(0.5, 160, -dirX * 12, -dirY * 12);
    }

    OnHitNPC(proj, npc) {
        Terraria.Main.LocalPlayer.AddBuff(ModBuff.getTypeByName('LifeRecoveryBuff'), 180, true);

        if (npc.life <= 0) {
            const staffType = ModProjectile.getTypeByName('BloomingStaffPro');
            const source = Terraria.Projectile.GetNoneSource();
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 3;
                const vel = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
                NewProjectile(source, proj.Center, vel, staffType, proj.damage, 0, proj.owner, 0, 0, 0, null);
            }
        }
    }

    OnKill(proj) {
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const dustIndex = Effects.NewDust(
                proj.Center, 0, 0, 89,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0, DUST_COLOR, 0.7 + Math.random() * 0.4
            );
            if (dustIndex >= 0 && dustIndex < 2000) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.noGravity = true;
                dust.noLight = true;
            }
        }
    }

    PreDraw() { return false; }
}