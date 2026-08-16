import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const PET_DURATION = 18000;

export class EnergizedQuadCubeBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
        this.petType = 0;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
        Terraria.Main.vanityPet[this.Type] = true;
    }

    // O original usa BuffHandle_SpawnPetIfNeededAndSetTime, que recebe um `ref bool`
    // para lembrar se o mascote ja existe - algo que a ponte JS nao consegue passar.
    // Este e' o mesmo padrao explicito que os outros buffs de invocacao do projeto
    // usam: conta os projeteis do jogador e so' cria quando nao ha nenhum.
    UpdatePlayer(player, buffIndex) {
        if (!this.petType) this.petType = ModProjectile.getTypeByName('EnergizedQuadCubePro') ?? 0;
        if (!this.petType) return;

        player.buffTime[buffIndex] = PET_DURATION;

        if (player.ownedProjectileCounts[this.petType] > 0) return;

        NEW_PROJECTILE(null, player.Center, Vector2.Zero, this.petType, 0, 0, player.whoAmI, 0, 0, 0, null);
    }
}
