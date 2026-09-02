import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const PET_TIME = 18000;

export class MaidBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.variants = null;
    }

    SetStaticDefaults() {
        Main.buffNoTimeDisplay[this.Type] = true;
        Main.vanityPet[this.Type] = true;
    }

    Variants() {
        if (this.variants === null) {
            this.variants = [
                ModProjectile.getTypeByName('Maid1') ?? -1,
                ModProjectile.getTypeByName('Maid2') ?? -1
            ].filter(t => t > 0);
        }
        return this.variants;
    }

    UpdatePlayer(player, buffIndex) {
        player.buffTime[buffIndex] = PET_TIME;

        if (player.whoAmI !== Main.myPlayer) return;

        const variants = this.Variants();
        if (variants.length === 0) return;

        for (const type of variants) {
            if (player.ownedProjectileCounts[type] > 0) return;
        }

        const chosen = variants[Rand.Next(variants.length)];
        NewProjectile(null, player.Center, Vector2.Zero, chosen, 0, 0, player.whoAmI, 0, 0, 0, null);
    }
}
