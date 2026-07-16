import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const { Main, Collision } = Terraria;
const NewDustDirect = Terraria.Dust.NewDustDirect;
const CanHit = Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

export class ScubaCurvaPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.extraUpdates = 1;
    }

    GetAlpha(proj, lightColor) {
        return Color.White;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) return;

        proj.rotation += 0.15;

        const dustPos = Vector2.new(
            player.position.X - player.velocity.X,
            player.position.Y - 4 - player.velocity.Y
        );
        const dust = NewDustDirect(
            dustPos,
            player.width,
            player.height - 14,
            56,
            player.direction * 35,
            0,
            150,
            Color.White,
            2.15
        );
        if (dust) {
            let dv = dust.velocity;
            dv.X *= 0.999;
            dv.Y *= 0.999;
            dust.velocity = dv;
            dust.noGravity = true;
        }

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (!npc.active || npc.friendly || npc.dontTakeDamage) continue;
            if (!npc.CanBeChasedBy(proj, false)) continue;
            if (!CanHit(npc.Center, 1, 1, player.Center, 1, 1)) continue;

            const distSq = Vector2.DistanceSquared(proj.Center, npc.Center);
            if (distSq >= 25600) continue;

            const npcTop = npc.position.Y;
            const npcBottom = npc.position.Y + npc.height;
            const playerTop = player.position.Y - 40;
            const playerBottom = player.position.Y + player.height + 40;
            if (npcBottom < playerTop || npcTop > playerBottom) continue;

            let vel = npc.velocity;
            if (npc.Center.X > player.Center.X && player.direction === 1) {
                vel.X += 0.05;
            } else if (npc.Center.X < player.Center.X && player.direction === -1) {
                vel.X -= 0.05;
            }
            npc.velocity = vel;
        }
    }

    PreDraw() {
        return false;
    }
}