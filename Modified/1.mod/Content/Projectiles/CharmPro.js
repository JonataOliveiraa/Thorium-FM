import { ModBuff } from '../../TL/ModBuff.js';
import { ModItem } from '../../TL/ModItem.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rectangle } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];

export class CharmPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 14;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = 1;
        this.aiStyle = 0
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = -1;
        this.Projectile.timeLeft = 80;
        this.Projectile.scale = 1;
    }

    GetAlpha(proj, color) {
        return Color.new(255, 255, 255, 255 - proj.alpha);
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + 1.57;

        if (Math.random() > 0.8) {
            let dustType = Math.random() > 0.5 ? 166 : 167;
            let d = Terraria.Main.dust[NewDust(proj.position, proj.width, proj.height, dustType, 0, 0, 100, Color.LightPink, 1.2)];
            d.noGravity = true;
            d.velocity = Vector2.Multiply(proj.velocity, 0.3);

            let vec2 = Vector2.new(Rand.Next(-10, 11),Rand.Next(-10, 11));
            vec2 = Vector2.Normalize(vec2);
            vec2.X *= 0.66;

            const index = NewGore(
                Vector2.Add(proj.position, Vector2.new(Rand.Next(proj.width + 1), Rand.Next(proj.height + 1))),
                Vector2.Multiply(vec2, Rand.Next(3, 6) * 0.33),
                331,
                Rand.Next(40, 121) * 0.01
            );

            Terraria.Main.gore[index].sticky = false;
        }
    }

    FadeInAndOut(proj, ai) {
        if (proj.timeLeft > 80) {
            proj.alpha -= 25;
            if (proj.alpha < 0) proj.alpha = 0;
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(ModBuff.getTypeByName('CharmedBuff'), 120, false);
        npc.loveStruck = true
    }
}
