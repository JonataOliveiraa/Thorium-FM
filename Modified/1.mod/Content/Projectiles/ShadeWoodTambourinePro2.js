import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class ShadeWoodTambourinePro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Bard/' + this.constructor.name;
        this.fadeOutTime = 30;
    }

    SetDefaults() {
        this.Projectile.width = 38;
        this.Projectile.height = 38;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 5;
    }

    AI(proj) {
        if (proj.localAI[0] === 0) {
            proj.localAI[0] = 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item35, proj.Center.X, proj.Center.Y, 1, 0.92, 1.09);
            for (let i = 0; i < 15; i++) {
                const dust = Terraria.Dust.NewDustDirect(
                    proj.Center, 20, 20, 90,
                    Rand.NextFloat(-3, 3),
                    Rand.NextFloat(-3, 3),
                    75, Color.White, 1.15
                );
                if (dust) dust.noGravity = true;
            }
        }

        if (proj.timeLeft > 18) {
            proj.scale += 0.04;
        } else {
            proj.scale -= 0.025;
        }
    }

    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X -= 8;
        hitbox.Y -= 8;
        hitbox.Width += 16;
        hitbox.Height += 16;
    }

    OnHitNPC(proj, npc) {
        const player = Main.player[proj.owner];
        if (player && player.active) {
            const direction = npc.Center.X < player.Center.X ? -1 : 1;
            npc.velocity = Vector2.new(direction * 6, -4);
        }
    }
}