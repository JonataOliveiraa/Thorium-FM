import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class NoviceClericCowl extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NoviceCleric/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('NoviceClericTabard'),
            ModItem.getTypeByName('NoviceClericPants'),
            ModLocalization.getTranslationArmorSetBonus('NoviceCleric')
        );
    }

    UpdateEquip(item, player) {
        NoviceClericCowl.ReduceDamage10Perc(player);
        ThoriumPlayer.class.Healer.multiplier += 0.03;
        ThoriumPlayer.class.Healer.healPowerExtraValue += 1;
        player.statManaMax2 += 5;
        player.manaRegen += 1
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.NoviceClericSetBonus = true;
        if (player.whoAmI !== Terraria.Main.myPlayer) return;

        ThoriumPlayer.NoviceClericCrossDelay++;
        if (ThoriumPlayer.NoviceClericCrossDelay < 180) return;

        // Só faz o trabalho pesado quando o timer estourar
        let orbitCount = 0;
        const usedSlots = new Set();

        for (const id of ThoriumPlayer.NoviceClericCrossIds) {
            const p = Terraria.Main.projectile[id];
            if (!p || !p.active) {
                ThoriumPlayer.NoviceClericCrossIds.delete(id);
                continue;
            }
            const pai = new ProjAI(p, false);
            if (pai[0] === 0) {
                orbitCount++;
                usedSlots.add(pai[1]);
            }
        }

        if (orbitCount >= 3) return;

        ThoriumPlayer.NoviceClericCrossDelay = 0;

        let slot = 0;
        for (let s = 0; s < 3; s++) {
            if (!usedSlots.has(s)) { slot = s; break; }
        }

        const crossType = ModProjectile.getTypeByName('NoviceClericCrossPro');
        const id = NewProjectile(
            player.GetProjectileSource_Item(item),
            player.Center, Vector2.Zero,
            crossType, 15, 0, player.whoAmI,
            0, slot, 0, null
        );
        if (id >= 0 && id < 1000) ThoriumPlayer.NoviceClericCrossIds.add(id);
    }

    static ReduceDamage10Perc(player) {
        player.meleeDamage -= player.meleeDamage * 0.1;
        player.magicDamage -= player.magicDamage * 0.1;
        player.minionDamage -= player.minionDamage * 0.1;
        player.rangedDamage -= player.rangedDamage * 0.1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Silk, 3)
            .AddIngredient(ModItem.getTypeByName('PurifiedShards'), 2)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}