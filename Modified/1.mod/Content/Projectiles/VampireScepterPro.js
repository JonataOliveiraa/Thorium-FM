import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const LIFE = 120;
const HEAL_NORMAL = 3;
const HEAL_LOW_LIFE = 6; // cura maior quando o jogador esta abaixo de 50%

let _orbType = -1;

export class VampireScepterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.magic = true;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;

        if (proj.timeLeft === LIFE) {
            FxHelper.ring(proj.Center.X, proj.Center.Y, 12, 2, 10, 5, 1, 1, Math.atan2(vel.Y, vel.X), 175);
            return;
        }

        if (proj.timeLeft % 3 === 0) {
            const dust = Main.dust[Effects.NewDust(proj.position, proj.width, proj.height, 5, 0, 0, 175, WHITE, 1.4)];
            if (dust) {
                dust.noGravity = true;
                dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            }
        }
    }

    OnHitNPC(proj, npc) {
        if (npc.friendly || npc.townNPC) return;

        const player = Main.player[proj.owner];
        if (!player || !player.active) return;

        const heal = player.statLife < player.statLifeMax2 * 0.5 ? HEAL_LOW_LIFE : HEAL_NORMAL;

        if (_orbType === -1) _orbType = ModProjectile.getTypeByName('VampireScepterPro2');
        if (_orbType < 0) return;

        // Cada orbe volta pro jogador e cura 1 ao chegar
        for (let i = 0; i < heal; i++) {
            NewProjectile(
                Terraria.Projectile.GetNoneSource(),
                proj.Center.X, proj.Center.Y,
                Math.random() * 6 - 3, Math.random() * 6 - 3,
                _orbType, 0, 0, proj.owner, 0, 0, 0, null
            );
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 6, 5, 3, 1.25, 150);
    }
}
