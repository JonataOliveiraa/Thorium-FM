import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Effects, Vector2 } = Modules;

// Particula de cura larga pela Rotten Cod e pela The Stalker no primeiro acerto
// do golpe. Fica parada no lugar, cura quem encostar e some sozinha em 10s.
export class RadiantHealingEnergy extends ModProjectile {
    static MAX_HEAL = 4;
    static LIFETIME = 600; // 10s

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = RadiantHealingEnergy.LIFETIME;
        this.Projectile.light = 0.4;
        this.Projectile.alpha = 80;
    }

    AI(proj) {
        // Flutua no lugar em vez de cair.
        proj.velocity = Vector2.Multiply(proj.velocity, 0.94);
        proj.rotation += 0.05;

        if (proj.timeLeft % 8 === 0) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                87, 0, 0, 120, Color.Transparent, 0.9
            );
            if (dust) {
                dust.velocity = Vector2.Zero;
                dust.noGravity = true;
            }
        }

        const owner = Terraria.Main.player[proj.owner];
        if (!owner || !owner.active || owner.dead) return;

        // Cura no toque. Em singleplayer so o dono encosta, mas a checagem e
        // por Hitbox pra continuar valendo se um dia rodar com mais jogadores.
        if (owner.Hitbox.Intersects(proj.Hitbox)) {
            const value = Math.min(
                RadiantHealingEnergy.MAX_HEAL,
                Math.max(1, ThoriumPlayer.class.Healer.getHealValue())
            );
            ThoriumPlayer.HealHPInHealerClass(owner, value);
            Effects.PlaySound(Terraria.ID.SoundID.Item4, owner.Center.X | 0, owner.Center.Y | 0);
            proj.Kill();
        }
    }
}
