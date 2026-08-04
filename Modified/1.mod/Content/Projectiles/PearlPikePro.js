import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { MathHelper, Vector2 } = Modules;
const { Main } = Terraria;

let _buffType = -1;

export class PearlPikePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        // Alcance da estocada: de onde ela sai ate onde chega
        this.HoldoutRangeMin = 24;
        this.HoldoutRangeMax = 96;

        // O sprite e desenhado centrado no proj.Center, entao sem isso o
        // jogador segurava a lanca pelo meio e o cabo inteiro ficava pra tras.
        // Empurrando a lanca pra frente, a mao cai mais perto do cabo.
        this.GripOffset = 34;
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ProjectileID.Spear);

        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.melee = true;
        this.Projectile.friendly = true;
        this.Projectile.ownerHitCheck = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 600;
        this.Projectile.tileCollide = false;
    }

    // Estocada: sai da mao, vai ate o alcance maximo e volta
    PreAI(proj) {
        const player = Main.player[proj.owner];
        if (!player) return false;

        const duration = player.itemAnimationMax;
        player.heldProj = proj.whoAmI;

        if (proj.timeLeft > duration) proj.timeLeft = duration;

        proj.velocity = Vector2.Normalize(proj.velocity);

        const half = duration * 0.5;
        const progress = proj.timeLeft < half
            ? proj.timeLeft / half
            : (duration - proj.timeLeft) / half;

        const reach = Vector2.SmoothStep(
            Vector2.Multiply(proj.velocity, this.HoldoutRangeMin),
            Vector2.Multiply(proj.velocity, this.HoldoutRangeMax),
            progress
        );

        proj.Center = Vector2.Add(
            player.MountedCenter,
            Vector2.Add(reach, Vector2.Multiply(proj.velocity, this.GripOffset))
        );

        proj.rotation += MathHelper.ToRadians(proj.spriteDirection === -1 ? 45 : 135);

        return false;
    }

    // Acertar da um pique de velocidade e de pulo
    OnHitNPC(proj, npc) {
        if (_buffType === -1) _buffType = ModBuff.getTypeByName('PearlPikeBuff') ?? -2;
        if (_buffType < 0) return;

        const player = Main.player[proj.owner];
        if (player) player.AddBuff(_buffType, 120, true);
    }
}
