import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Vector2, Rand } = Modules;
const { Main } = Terraria;
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const GRAVITY = 0.2; // desacelera a subida; menor = ele sobe mais alto antes de parar

let _rockFallType = -1;

/**
 * Marcador invisivel: sobe do jogador ate encostar no teto e ali vira uma pedra
 * que despenca. Se nao achar teto, cai do ponto mais alto que alcancou.
 */
export class ViscountRockSummon extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.tileCollide = false;
        this.Projectile.hostile = false;
        this.Projectile.friendly = false;
        this.Projectile.alpha = 255;
    }

    PreDraw(proj, lightColor) {
        return false;
    }

    AI(proj) {
        const vel = proj.velocity;
        vel.Y += GRAVITY;
        proj.velocity = vel;

        // Bateu no teto: e ali que a pedra nasce
        if (vel.Y < 0 && SolidCollision(Vector2.new(proj.position.X, proj.position.Y + vel.Y), proj.width, proj.height)) {
            proj.Kill();
            return;
        }

        // Comecou a cair sem achar teto nenhum: solta a pedra no apice
        if (vel.Y >= 0) proj.Kill();
    }

    OnKill(proj) {
        if (_rockFallType === -1) {
            _rockFallType = ModProjectile.getTypeByName('ViscountRockFall');
        }

        if (_rockFallType >= 0) {
            NewProjectile(
                null,
                proj.Center.X, proj.Center.Y + 8,
                0, 2,
                _rockFallType, proj.damage, 0, Main.myPlayer,
                Rand.Next(6), 0, 0, null
            );
        }

        FxHelper.burst(proj.position, proj.width, proj.height, 4, 110, 4, 0.75);
    }
}
