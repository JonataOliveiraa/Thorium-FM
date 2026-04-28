import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const OceanBlue = Color.new(0, 140, 220, 255);
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThoriumBolt extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Textures/Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 240;
    }

    AI(proj) {
        for (let i = 0; i < 3; i++) {
            const dustIndex = Effects.NewDust(
                proj.position, proj.width, proj.height,
                15, 0, 0, 80, OceanBlue, 1.4
            );
            const dust = Terraria.Main.dust[dustIndex];
            if (dust) {
                dust.position = Vector2.Subtract(
                    proj.Center,
                    Vector2.new(proj.velocity.X / 3 * i, proj.velocity.Y / 3 * i)
                );
                dust.velocity = Vector2.Zero;
                dust.noGravity = true;
            }
        }
    }

    OnKill(proj, timeLeft) {
        if (proj.owner !== Terraria.Main.myPlayer) return;

        const sparkType = ModProjectile.getTypeByName('ThoriumSpark');
        const damage = Math.floor(proj.damage * 0.5);
        const center = proj.Center;

        const directions = [
            Vector2.new(1, 0),
            Vector2.new(0, 1),
            Vector2.new(-1, 0),
            Vector2.new(0, -1)
        ];

        for (const dir of directions) {
            NewProjectile(
                proj.GetProjectileSource_FromThis(),
                Vector2.new(center.X, center.Y),
                Vector2.Multiply(dir, 5),
                sparkType, damage, proj.knockBack,
                proj.owner, 0, 0, 0, null
            );
        }
    }

    OnTileCollide(proj, oldVelocity) {
        Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
        return true;
    }
}