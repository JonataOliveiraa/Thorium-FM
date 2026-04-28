import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const OceanBlue = Color.new(41, 223, 255, 255);
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThoriumSpark extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Textures/Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.alpha = 255;
        this.Projectile.ignoreWater = true;
        this.Projectile.magic = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj);

        for (let i = 0; i < 2; i++) {
            const spread = (Math.random() - 0.5) * 3;
            const dustIndex = Effects.NewDust(
                proj.position, proj.width, proj.height,
                15, spread, spread, 80, Math.random() > 0.2 ? OceanBlue : Color.White, 1.2
            );
            const dust = Terraria.Main.dust[dustIndex];
            if (dust) {
                dust.position = Vector2.Subtract(
                    proj.Center,
                    Vector2.new(proj.velocity.X / 2 * i, proj.velocity.Y / 2 * i)
                );
                dust.noGravity = true;
            }
        }

        if (proj.timeLeft <= 118) proj.friendly = true;

        ai[0]++;
        if (ai[0] > 30) ai[0] = 30;

        if (ai[0] >= 30) {
            const target = proj['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'](800, true);
            if (target != null && target.active) {
                proj.friendly = true;
                const homingSpeed = 9.0;
                const direction = Vector2.Multiply(
                    Vector2.Normalize(Vector2.Subtract(target.Center, proj.Center)),
                    homingSpeed
                );
                proj.velocity = Vector2.Divide(
                    Vector2.Add(Vector2.Multiply(proj.velocity, 14), direction),
                    15
                );
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        const ai = new ProjAI(proj);

        if (ai[1] >= 5) return true;

        ai[1]++;

        let newVelX = proj.velocity.X;
        let newVelY = proj.velocity.Y;

        if (newVelX !== oldVelocity.X) newVelX = -oldVelocity.X;
        if (newVelY !== oldVelocity.Y) newVelY = -oldVelocity.Y;

        proj.velocity = Vector2.new(newVelX, newVelY);
        return false;
    }
}