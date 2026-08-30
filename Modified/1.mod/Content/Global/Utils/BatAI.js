import { Terraria } from '../../../TL/ModImports.js';
import { Vector2 } from '../../../TL/Modules/Vector2.js';

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

export class BatAI {
    static Defaults = {
        maxX: 4,
        maxY: 1.5,
        accelX: 0.1,
        accelY: 0.04,
        reverseDampX: 0.05,
        reverseDampY: 0.03,
        overspeedY: 0.05,
        wanderDelay: 200,
        wanderResetAt: 1000,
        wanderAccelX: 0.2,
        wanderAccelY: 0.1,
        bounce: -0.5,
        minBounceX: 2,
        minBounceY: 1
    };

    static Update(npc, options) {
        const o = options ? Object.assign({}, BatAI.Defaults, options) : BatAI.Defaults;

        npc.noGravity = true;

        let velX = npc.velocity.X;
        let velY = npc.velocity.Y;

        if (npc.collideX) {
            velX = npc.oldVelocity.X * o.bounce;
            if (npc.direction === -1 && velX > 0 && velX < o.minBounceX) velX = o.minBounceX;
            if (npc.direction === 1 && velX < 0 && velX > -o.minBounceX) velX = -o.minBounceX;
        }

        if (npc.collideY) {
            velY = npc.oldVelocity.Y * o.bounce;
            if (velY > 0 && velY < o.minBounceY) velY = o.minBounceY;
            if (velY < 0 && velY > -o.minBounceY) velY = -o.minBounceY;
        }

        npc.TargetClosest(true);

        if (npc.direction === -1 && velX > -o.maxX) {
            velX -= o.accelX;
            if (velX > o.maxX) velX -= o.accelX;
            else if (velX > 0) velX += o.reverseDampX;
            if (velX < -o.maxX) velX = -o.maxX;
        } else if (npc.direction === 1 && velX < o.maxX) {
            velX += o.accelX;
            if (velX < -o.maxX) velX += o.accelX;
            else if (velX < 0) velX -= o.reverseDampX;
            if (velX > o.maxX) velX = o.maxX;
        }

        if (npc.directionY === -1 && velY > -o.maxY) {
            velY -= o.accelY;
            if (velY > o.maxY) velY -= o.overspeedY;
            else if (velY > 0) velY += o.reverseDampY;
            if (velY < -o.maxY) velY = -o.maxY;
        } else if (npc.directionY === 1 && velY < o.maxY) {
            velY += o.accelY;
            if (velY < -o.maxY) velY += o.overspeedY;
            else if (velY < 0) velY -= o.reverseDampY;
            if (velY > o.maxY) velY = o.maxY;
        }

        npc.ai[1] += 1;

        if (npc.ai[1] > o.wanderDelay) {
            const player = Terraria.Main.player[npc.target];
            const hasSight = player && player.active && !player.wet
                && CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height);

            if (hasSight) npc.ai[1] = 0;
            if (npc.ai[1] > o.wanderResetAt) npc.ai[1] = 0;

            npc.ai[2] += 1;
            if (npc.ai[2] > 300) npc.ai[2] = -300;

            if (npc.ai[2] > 0) {
                if (velY < o.maxY) velY += o.wanderAccelY;
            } else if (velY > -o.maxY) {
                velY -= o.wanderAccelY;
            }

            if (npc.ai[2] < -150 || npc.ai[2] > 150) {
                if (velX < o.maxX) velX += o.wanderAccelX;
            } else if (velX > -o.maxX) {
                velX -= o.wanderAccelX;
            }
        }

        npc.velocity = Vector2.new(velX, velY);
        npc.spriteDirection = npc.direction;
    }
}
