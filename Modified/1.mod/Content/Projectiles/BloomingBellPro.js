import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _flowerType = -1;

/**
 * Semente jogada pra frente que cai girando. Ela ricocheteia uma vez no chao e,
 * na segunda batida, planta a flor.
 */
export class BloomingBellPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = 2; // faca de arremesso: cai girando
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;

        this.AIType = Terraria.ID.ProjectileID.ThrowingKnife;
    }

    // localAI[0] marca que ela ja quicou uma vez
    OnTileCollide(proj, hitDirection) {
        const local = new ProjAI(proj, true);

        if (local[0] === 0) {
            local[0] = 1;
            return false;
        }

        SoundHelper.play(['Grass', 'Item10'], proj.position.X, proj.position.Y);

        if (proj.owner === Main.myPlayer) {
            if (_flowerType === -1) _flowerType = ModProjectile.getTypeByName('BloomingBellPro2') ?? -2;

            if (_flowerType >= 0) {
                // Sobe um pouco quando a queda foi freada, pra flor nascer
                // apoiada no chao em vez de meio enterrada
                const center = proj.Center;
                const offset = proj.velocity.Y > 0 ? 12 : -12;

                NewProjectile(
                    proj.GetProjectileSource_FromThis(),
                    Vector2.new(center.X, center.Y + offset), Vector2.Zero,
                    _flowerType, proj.damage, proj.knockBack, proj.owner,
                    0, 0, 0, null
                );
            }
        }

        return true;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 2, 3, 1, 175);
    }
}
