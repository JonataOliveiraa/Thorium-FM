import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class TheStalkerPro extends ModProjectile {
    static MAX_ENERGY = 3;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._energyType = -1;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 22;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.scale = 1;
        this.Projectile.drawLayer = 7;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 12;

        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Flail;
        this.AIType = Terraria.ID.ProjectileID.BlueMoon;
    }

    OnSpawn(proj) {
        // Reseta a cada arremesso: so o primeiro acerto larga energia.
        proj.ai.val2 = 0;
    }

    OnHitNPC(proj, npc) {
        if (proj.ai.val2 === 1) return;
        proj.ai.val2 = 1;

        // O tipo e resolvido uma vez: getTypeByName varre a lista de projeteis.
        if (this._energyType === -1) {
            this._energyType = ModProjectile.getTypeByName('RadiantHealingEnergy') ?? -2;
        }
        if (this._energyType < 0) return;

        const player = Terraria.Main.player[proj.owner];
        if (player.ownedProjectileCounts[this._energyType] >= TheStalkerPro.MAX_ENERGY) return;

        NewProjectile(
            null,
            proj.Center,
            Vector2.new(0, -1.5),
            this._energyType,
            0, 0, proj.owner,
            0, 0, 0, null
        );
    }

    GetAlpha(proj, lightColor) {
        return Color.White;
    }
}
