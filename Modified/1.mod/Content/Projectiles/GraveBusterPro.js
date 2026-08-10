import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const CLIMB = -8;      // degrau pra cima
const FALL = 8;        // queda quando acaba o chao
const STEP_CHECK = 8;  // altura testada pra decidir se sobe
const SPAWN_GAP = 6;   // ticks entre cada lapide

let _graveType = -1;

/**
 * Marcador invisivel que corre rente ao chao (mesma ideia do GeyserPro) e vai
 * plantando lapides no caminho.
 */
export class GraveBusterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 40;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = false;
    }

    // ai[1] = espera ate a proxima lapide (negativo = recarregando)
    AI(proj) {
        const vel = proj.velocity;
        proj.direction = vel.X > 0 ? 1 : -1;

        const bl = proj.BottomLeft;

        // Tem bloco na altura do degrau: sobe. Tem chao raso: segue reto.
        // Nao tem nada: despenca ate achar chao de novo.
        let vy;
        if (MiscHelper.IsOnStandableGround(bl.X, bl.Y - STEP_CHECK, proj.width)) vy = CLIMB;
        else if (MiscHelper.IsOnStandableGround(bl.X, bl.Y, proj.width)) vy = 0;
        else vy = FALL;

        proj.velocity = Vector2.new(vel.X, vy);

        const ai = new ProjAI(proj, false);
        ai[1] = ai[1] + 1;
        if (ai[1] < 0) return;

        if (Main.myPlayer === proj.owner) {
            if (_graveType === -1) _graveType = ModProjectile.getTypeByName('GraveBusterPro2') ?? -2;

            if (_graveType >= 0) {
                NewProjectile(
                    null,
                    Vector2.new(proj.Center.X, proj.Bottom.Y - 30),
                    Vector2.new(vel.X * 0.01, 8),
                    _graveType, proj.damage, proj.knockBack, proj.owner,
                    0, 0, 0, null
                );
            }
        }

        ai[1] = -SPAWN_GAP;
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
