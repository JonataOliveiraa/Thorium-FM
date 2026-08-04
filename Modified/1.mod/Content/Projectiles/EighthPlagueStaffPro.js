import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Main } = Terraria;

export class EighthPlagueStaffPro extends ModProjectile {
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
        this.Projectile.aiStyle = 1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.alpha = 255;
        this.Projectile.timeLeft = 90;

        this.AIType = 14;
    }

    AI(proj) {
        if (++proj.frameCounter > 3) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 4;
        }
    }

    OnHitNPC(proj, npc) {
        if (Math.random() * 3 >= 1) return;
        npc.AddBuff(Terraria.ID.BuffID.Poisoned, 120, false);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height + 5, 15, 39, 1, 1.2, 100);
    }
}
