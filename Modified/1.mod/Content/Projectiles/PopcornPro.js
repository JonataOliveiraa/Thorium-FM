import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Effects } = Modules;
const { Main } = Terraria;

export class PopcornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._recoveryBuff = -1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 6;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = 14;
        this.Projectile.friendly = true;
        this.Projectile.scale = 0.75;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 900;
    }

    RecoveryBuff() {
        if (this._recoveryBuff === -1) this._recoveryBuff = ModBuff.getTypeByName('LifeRecoveryBuff') ?? -2;
        return this._recoveryBuff;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);
        if (local[0] === 0) {
            local[0] = 1;
            const frame = proj.ai.val1 | 0;
            proj.frame = frame < 0 ? 0 : (frame > 5 ? 5 : frame);
        }

        if (proj.timeLeft <= 20) {
            proj.alpha = 255 - Math.floor(255 * proj.timeLeft / 20);
            return;
        }

        if (proj.alpha > 0) {
            proj.alpha = Math.max(0, proj.alpha - 15);
            return;
        }

        const localOnly = Main.netMode === 0;
        const count = localOnly ? 1 : Main.maxPlayers;
        const pos = proj.position;
        const right = pos.X + proj.width;
        const bottom = pos.Y + proj.height;

        for (let i = 0; i < count; i++) {
            const player = Main.player[localOnly ? Main.myPlayer : i];
            if (!player || !player.active || player.dead) continue;

            const target = player.position;
            if (right < target.X || target.X + player.width < pos.X) continue;
            if (bottom < target.Y || target.Y + player.height < pos.Y) continue;

            this.Eat(proj, player);
            return;
        }
    }

    Eat(proj, player) {
        player.Heal(1);

        const buff = this.RecoveryBuff();
        if (buff > 0) player.AddBuff(buff, 300, false);

        const vel = proj.velocity;
        for (let i = 0; i < 8; i++) {
            const dust = Main.dust[Effects.NewDust(
                proj.position, proj.width, proj.height, 79,
                vel.X * 0.2, vel.Y * 0.2, 175, Color.White, 1.25
            )];
            if (dust) dust.noGravity = true;
        }

        const center = proj.Center;
        Effects.PlaySound(2, center.X | 0, center.Y | 0, 2, 0, 0.7);
        proj.Kill();
    }

    OnTileCollide(proj, hitDirection) {
        return false;
    }
}
