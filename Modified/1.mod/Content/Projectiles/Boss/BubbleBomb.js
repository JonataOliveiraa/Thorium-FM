import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

let BubbledBuffType = -1;

export class BubbleBomb extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 48;
        this.Projectile.height = 48;
        this.Projectile.aiStyle = 0;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = 1;
        this.Projectile.light = 0.25;
        this.Projectile.timeLeft = 300;
    }

    AI(proj) {
        const ai = new ProjAI(proj);

        if (ai[0] === 0) {
            ai[0] = 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item17, proj.Center.X, proj.Center.Y);
        }

        const vel = proj.velocity;
        const dirInt = vel.X > 0 ? 1 : -1;
        proj.rotation += dirInt * 0.05;
        proj.spriteDirection = dirInt;

        if (Math.random() < 0.333) {
            const dustIdx = NewDust(
                proj.position, proj.width, proj.height,
                29,
                vel.X * 0.2, vel.Y * 0.2,
                100, Color.Transparent, 0.75
            );
            if (dustIdx >= 0) {
                Terraria.Main.dust[dustIdx].noGravity = true;
            }
        }
    }

    OnHitPlayer(proj, target, info) {
        if (BubbledBuffType === -1) BubbledBuffType = ModBuff.getTypeByName('BubbledBuff');
        if (BubbledBuffType >= 0) {
            target.AddBuff(BubbledBuffType, 30, true);
        }
    }
}
