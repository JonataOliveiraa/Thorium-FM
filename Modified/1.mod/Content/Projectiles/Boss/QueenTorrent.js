import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModNPC } from '../../../TL/ModNPC.js';

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class QueenTorrent extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 12;
    }

    SetDefaults() {
        this.Projectile.width = 160;
        this.Projectile.height = 160;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 75;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 420; 
        this.Projectile.netImportant = true;
    }

    AI(proj) {
        const QueenType = ModNPC.getTypeByName('QueenJellyfish');
        if (!Terraria.NPC['bool AnyNPCs(int Type)'](QueenType)) {
            proj.Kill();
            return;
        }

        const center = proj.Center;
        const dustType = 176;
        const players = Terraria.Main.player;
        const maxPlayers = players.length;

        for (let i = 0; i < maxPlayers; i++) {
            const player = players[i];
            if (!player.active || player.dead) continue;

            const dx = center.X - player.Center.X;
            const dy = center.Y - player.Center.Y;
            const distSq = dx * dx + dy * dy;

            if (distSq >= 250000) continue;

            if (distSq > 2500) {
                const dustIdx = NewDust(
                    player.position, player.width, player.height,
                    dustType,
                    (player.Center.X > center.X ? -1 : 1) * 6, 0,
                    100, Color.Transparent, 1.0
                );
                if (dustIdx >= 0) Terraria.Main.dust[dustIdx].noGravity = true;
            }

            let pull = 0.02;
            if (distSq < 40000) pull = 0.03;
            if (distSq < 2500) pull = 0.04;

            let vel = player.velocity;
            if (player.Center.X > center.X) {
                vel.X = Math.max(vel.X - pull, -3);
            } else {
                vel.X = Math.min(vel.X + pull, 3);
            }
            player.velocity = vel;
        }

        if (++proj.frameCounter > 2) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 12;
        }
    }
}
