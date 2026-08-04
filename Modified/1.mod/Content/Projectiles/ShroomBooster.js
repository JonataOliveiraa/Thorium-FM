import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const BUFF_RANGE_SQ = 1600;

export class ShroomBooster extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.light = 0.25;
        this.Projectile.penetrate = 2;
        this.Projectile.alpha = 255;
        this.Projectile.tileCollide = true;
        this.Projectile.timeLeft = 300;
        this.fadeInSpeed = 20;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (proj.alpha > 0) {
            proj.alpha = Math.max(0, proj.alpha - this.fadeInSpeed);
        }

        let vel = proj.velocity;
        vel.Y /= 1.0065;
        proj.velocity = vel;

        ai[1]++;
        if (ai[1] >= 0) {
            vel = proj.velocity;
            vel.Y += 1.02;
            proj.velocity = vel;
            ai[1] = -15;
        }

        if (proj.penetrate !== 1) {
            const owner = Main.player[proj.owner];
            if (owner && owner.active && Vector2.DistanceSquared(owner.Center, proj.Center) < BUFF_RANGE_SQ) {
                owner.AddBuff(ModBuff.getTypeByName('BloomBoostBuff'), 600, false);
                Effects.PlaySound(Terraria.ID.SoundID.NPCHit13, proj.position.X, proj.position.Y);
                proj.penetrate = 1;
                proj.timeLeft = 10;
            }
        }

        proj.frameCounter++;
        if (proj.frameCounter > 5) {
            proj.frame++;
            proj.frameCounter = 0;
            if (proj.frame >= Main.projFrames[this.Type]) proj.frame = 0;
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 10; i++) {
            const dust1 = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                5,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2,
                125, Color.White, 1.25
            );
            if (dust1) dust1.noGravity = true;

            const dust2 = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                39,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2,
                75, Color.White, 1.25
            );
            if (dust2) dust2.noGravity = true;
        }
    }
}