import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const COUNT = 5;
const RADIUS = 46;
const SPIN = 0.03;
const LIFE = 600;
const SHADOWFLAME_TIME = 20;

const LAYER_DEFAULT = 0;
const LAYER_OVER_PLAYERS = 4;

const DEPTH_SCALE_MIN = 0.8;
const DEPTH_SCALE_RANGE = 0.25;

/**
 * Pena da barreira: as 5 giram em volta do dono, batem em quem encostar e
 * reduzem o dano que ele leva.
 *
 * A textura tem 2 quadros: o 0 e a versao normal e o 1 e a corrompida, que
 * aparece com a armadura Ebon equipada e queima com fogo sombrio.
 * ai[0] = indice da pena (define a posicao no circulo)
 */
export class FeatherBarrier extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.netImportant = true;

        // Cooldown compartilhado: sem isso as 5 penas acertariam o mesmo
        // inimigo no mesmo tick e o dano quintuplicaria
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }

    OnSpawn(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 4, this._dust(), 3, 1);
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) {
            proj.Kill();
            return;
        }

        // Quadro 1 = pena corrompida da armadura Ebon
        proj.frame = ThoriumPlayer.RadiantCorruptionActive ? 1 : 0;

        const index = new ProjAI(proj, false)[0] | 0;
        const angle = (Main.GameUpdateCount * SPIN) + (index * Math.PI * 2 / COUNT);
        const center = player.Center;

        proj.Center = Vector2.new(
            center.X + Math.cos(angle) * RADIUS,
            center.Y + Math.sin(angle) * (RADIUS * 0.6) + Math.sin(Main.GameUpdateCount / 30) * 6
        );

        proj.rotation = angle + Math.PI / 2;
        proj.spriteDirection = Math.cos(angle) > 0 ? 1 : -1;

        const depth = Math.sin(angle);
        proj.drawLayer = depth > 0 ? LAYER_OVER_PLAYERS : LAYER_DEFAULT;
        proj.scale = DEPTH_SCALE_MIN + (depth + 1) * 0.5 * DEPTH_SCALE_RANGE;

        // Piscando no fim pra avisar que vai acabar
        proj.alpha = proj.timeLeft < 120 && (proj.timeLeft % 10 < 5) ? 150 : 0;
    }

    OnHitNPC(proj, npc) {
        if (ThoriumPlayer.RadiantCorruptionActive) {
            npc.AddBuff(Terraria.ID.BuffID.ShadowFlame, SHADOWFLAME_TIME, false);
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, this._dust(), 3, 1);
    }

    _dust() {
        return ThoriumPlayer.RadiantCorruptionActive ? 86 : 13;
    }
}
