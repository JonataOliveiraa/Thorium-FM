// GeyserPro2.js
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Main, Collision } = Terraria;
const { Color } = Modules;
const CanHitLine = Collision['bool CanHitLine(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

export class GeyserPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.tileCollide = false;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
    }

    ModifyHitNPC(proj, npc, hit, modifiers) {
        const player = Main.player[proj.owner];
        modifiers.HitDirectionOverride = npc.Center.X < player.Center.X ? -1 : 1;
        if (!CanHitLine(player.position, player.width, player.height, npc.position, npc.width, npc.height)) {
            modifiers.SourceDamage *= 0.5;
        }
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (ai[0] >= 1 || !MiscHelper.IsOnStandableGround(proj.BottomLeft.X, proj.BottomLeft.Y, proj.width)) return;

        ai[0]++;
        proj.friendly = true;
        proj.timeLeft = 30;
        let vel = proj.velocity;
        vel.Y = -0.4;
        proj.velocity = vel;

        for (let i = 0; i < 20; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height + 12,
                101,
                Rand.Next(-1, 1),
                Rand.Next(-9, -4),
                0, Color.White, 1.5
            );
            const dust = Main.dust[dustIdx];
            if (dust) dust.noGravity = true;
        }
    }
}