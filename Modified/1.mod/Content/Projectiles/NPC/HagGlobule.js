import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class HagGlobule extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
        this._dropletType = -1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 12;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 34;
        this.Projectile.aiStyle = 0;
        this.Projectile.alpha = 85;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
    }

    DropletType() {
        if (this._dropletType === -1) this._dropletType = ModProjectile.getTypeByName('HagGlobulePro') ?? -2;
        return this._dropletType;
    }

    AI(proj) {
        Effects.AddLight(proj.Center, 0.2, 0.1, 0.55);

        proj.frameCounter++;
        if (proj.frameCounter > 9) {
            proj.frameCounter = 0;
            if (proj.frame < 11) proj.frame++;
        }
    }

    OnKill(proj, timeLeft) {
        Effects.PlaySound(Terraria.ID.SoundID.Item54, proj.position.X | 0, proj.position.Y | 0);

        if (Main.netMode !== 2) {
            for (let i = 0; i < 10; i++) {
                NewDust(proj.position, proj.width, proj.height, 29, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, 1);
            }
        }

        const droplet = this.DropletType();
        if (droplet <= 0 || Main.netMode === 1) return;

        const center = proj.Center;
        const spread = [1.5, 0.85, 0, -0.85, -1.5];
        for (const speedX of spread) {
            NewProjectile(
                null,
                Vector2.new(center.X, center.Y - 6),
                Vector2.new(speedX, -4.75),
                droplet, proj.damage, 1, proj.owner, 0, 0, 0, null
            );
        }
    }
}
