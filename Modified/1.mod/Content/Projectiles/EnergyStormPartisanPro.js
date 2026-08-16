import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const HITS_PER_BLAST = 2;

let _blastType = -1;

export class EnergyStormPartisanPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.AIType = 49;
    }

    SetDefaults() {
        // DefaultToSpear ja' cuida de aiStyle/penetrate/tileCollide/ownerHitCheck e,
        // principalmente, do drawLayer 7 - a camada em que a lanca aparece na mao.
        this.DefaultToSpear();

        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.light = 0.4;
        this.Projectile.timeLeft = 600;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 8;
    }

    // O numHits do original vira um contador em localAI: a instancia do
    // ModProjectile e compartilhada, mas a lanca vive uma estocada so.
    OnHitNPC(proj, npc) {
        const localAI = new ProjAI(proj, true);
        if (++localAI[0] % HITS_PER_BLAST !== 0) return;

        if (_blastType < 0) _blastType = ModProjectile.getTypeByName('EnergyExplosion') ?? -1;
        if (_blastType < 0 || Main.myPlayer !== proj.owner) return;

        NewProjectile(
            null,
            npc.Center, Vector2.new(0.2 * proj.direction, 0),
            _blastType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null
        );
    }
}
