import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { Empowerments } from '../Global/Empowerments.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const LIFE = 120;
const DUST = 110;
const SPAWN_RING = 14;
const TRAIL_RING = 8;
const TRAIL_RATE = 6;
const MAX_BOUNCES = 1;
const CATCH_DIST_SQ = 3600; // 60px: distancia pra "pegar" o eco de volta

/**
 * Onda sonora do Sonar Cannon: quica uma vez e, se voltar pra voce depois do
 * quique, devolve o eco como empoderamento.
 */
export class EchoWave extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false; // colisao na mao pra controlar o quique
        this.Projectile.ignoreWater = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 20;
    }

    AI(proj) {
        const vel = proj.velocity;
        const rot = Math.atan2(vel.Y, vel.X);
        proj.rotation = rot + Math.PI / 2;

        const timeLeft = proj.timeLeft;
        const ai = new ProjAI(proj, false);

        if (timeLeft === LIFE) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, SPAWN_RING, 4, 14, DUST, 3, 1, rot, 0);
        }

        // Quique
        if (ai[0] < MAX_BOUNCES &&
            SolidCollision(Vector2.new(proj.position.X + vel.X, proj.position.Y + vel.Y), proj.width, proj.height)) {
            const nx = SolidCollision(Vector2.new(proj.position.X + vel.X, proj.position.Y), proj.width, proj.height) ? -vel.X : vel.X;
            const ny = SolidCollision(Vector2.new(proj.position.X, proj.position.Y + vel.Y), proj.width, proj.height) ? -vel.Y : vel.Y;

            proj.velocity = Vector2.new(
                nx === vel.X && ny === vel.Y ? -vel.X : nx,
                nx === vel.X && ny === vel.Y ? -vel.Y : ny
            );
            ai[0] = ai[0] + 1;
        }

        if (timeLeft % TRAIL_RATE === 0) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, TRAIL_RING, 8, 14, DUST, 0, 1.25, rot, 0);
        }

        // Depois de quicar, encostar no dono devolve o eco
        if (ai[0] < MAX_BOUNCES) return;

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) return;

        const center = proj.Center;
        const dx = player.Center.X - center.X;
        const dy = player.Center.Y - center.Y;
        if (dx * dx + dy * dy >= CATCH_DIST_SQ) return;

        Empowerments.Apply(player, 'EmpowermentProlongation', 1);
        FxHelper.ring(player.Center.X, player.Center.Y, 16, 18, 18, DUST, 2, 1.5, 0, 0);
        proj.Kill();
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, DUST, 4, 0.8, 0);
    }
}
