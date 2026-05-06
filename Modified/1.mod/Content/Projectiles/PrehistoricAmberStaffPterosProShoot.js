import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class PrehistoricAmberStaffPterosProShoot extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.MinionShot[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.ThrownProjectile;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = false;
        this.Projectile.timeLeft = 300;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 6; i++) {
            NewDust(
                proj.position, proj.width, proj.height,
                31,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.8) * 3,
                0,
                Color.new(255, 240, 180, 180),
                0.9 + Math.random() * 0.5
            );
        }
        for (let i = 0; i < 4; i++) {
            const dustIndex = NewDust(
                proj.position, proj.width, proj.height,
                267,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.9) * 1.5,
                0,
                Color.new(255, 255, 220, 0),
                0.7 + Math.random() * 0.3
            );
            if (dustIndex >= 0 && dustIndex < 2000) {
                Terraria.Main.dust[dustIndex].noGravity = true;
            }
        }
    }
}