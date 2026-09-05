import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;

export class GraniteBoomBoxPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 2;
        this.Projectile.height = 2;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        //this.Projectile.extraUpdates = 50;
        this.Projectile.extraUpdates = 10;
    }

    OnHitNPC(proj, npc) {
        //npc.AddBuff(ModBuff.getTypeByName('GraniteSurge'), 120, false);
    }
    
    AI(proj) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] === 0) {
            localAI[0] = 1;
            const projArr = Terraria.Main.projectile;
            const boomBoxType = ModProjectile.getTypeByName('GraniteBoomBoxPro');
            for (let index = 0; index < Terraria.Main.maxProjectiles; index++) {
                const projectile = projArr[index];
                if (projectile.active && projectile.owner === proj.owner && projectile.type === boomBoxType) {
                    const modProjectile = ModProjectile.getModProjectile(boomBoxType);
                    if (modProjectile) modProjectile.SetPulseFX();
                    break;
                }
            }
        }

        const ai = new ProjAI(proj);
        ai[0]++;

        if (ai[0] === 8.0) {
            for (let index = 0; index < 8; index++) {
                const dust = Terraria.Dust.NewDustDirect(proj.Center, 2, 2, 15, Rand.NextFloat(-2, 2), Rand.NextFloat(-2, 2), 255, null, 1.0);
                dust.noGravity = true;
            }
        }

        if (ai[0] <= 8.0) return;

        for (let index = 0; index < 2; index++) {
            const pos = Vector2.Subtract(proj.Center, Vector2.Multiply(Vector2.Multiply(proj.velocity, index), 0.25));
            const dust1 = Terraria.Dust.NewDustPerfect(pos, 59, null, 0, null, 1.0);
            dust1.noGravity = true;
            dust1.velocity = Vector2.Multiply(dust1.velocity, 0.2);
            const dust2 = Terraria.Dust.NewDustPerfect(pos, 15, null, 0, null, 1.0);
            dust2.alpha = 255;
            dust2.noGravity = true;
            dust2.velocity = Vector2.Multiply(dust2.velocity, 0.2);
        }
    }
}
