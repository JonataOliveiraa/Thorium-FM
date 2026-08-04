import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const FRAMES = 2;
const LIFE_STEAL = 1;   // vida roubada no primeiro acerto
const TRAIL_RATE = 2;

export class LeechBoltPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 300;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
    }

    // Cada tiro sai com um dos dois desenhos, sorteado no spawn
    OnSpawn(proj) {
        proj.frame = Rand.Next(FRAMES);
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;

        if (proj.timeLeft % TRAIL_RATE !== 0) return;

        const dust = Main.dust[Effects.NewDust(proj.position, proj.width, proj.height, 5, 0, 0, 125, WHITE, 1)];
        if (!dust) return;
        dust.noGravity = true;
        dust.velocity = Vector2.new(
            dust.velocity.X * 0.5 + vel.X * 0.1,
            dust.velocity.Y * 0.5 + vel.Y * 0.1
        );
    }

    // Rouba vida uma unica vez por tiro (ai[0] marca que ja sugou)
    OnHitNPC(proj, npc) {
        if (npc.friendly || npc.townNPC) return;

        const ai = new ProjAI(proj, false);
        if (ai[0] === 1) return;
        ai[0] = 1;

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) return;

        try { player['void HealEffect(int healAmount, bool broadcast)'](LIFE_STEAL, true); } catch (_) { }
        player.statLife = Math.min(player.statLife + LIFE_STEAL, player.statLifeMax2);

        FxHelper.ring(player.Center.X, player.Center.Y, 10, 50, 50, 5, 3.75, 1, 0, 125, true);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 5, 2, 1, 125);
        FxHelper.burst(proj.position, proj.width, proj.height, 3, 60, 6, 1.25, 100);
    }
}
