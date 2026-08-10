import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Rand } = Modules;

export class BuriedChampionTreasureBag extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.BossBag[this.Type] = true;
    }

    SetDefaults() {
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.consumable = true;
        this.Item.width = 32;
        this.Item.height = 32;
        this.Item.rare = Terraria.ID.ItemRarityID.Purple;
        this.Item.expert = true;
    }

    OpenBossBag(item, player) {
        const source = null;
        const QuickSpawnItem = player['void QuickSpawnItem(IEntitySource source, int item, int stack)'];

        // Item Exclusivo de Expert Mode
        const wingId = ModItem.getTypeByName('ChampionWing');
        if (wingId > 0) QuickSpawnItem(source, wingId, 1);

        // 1 Arma aleatoria do boss
        const weapons = [
            ModItem.getTypeByName('ChampionSwiftBlade'),
            ModItem.getTypeByName('ChampionsTrifectaShot'),
            ModItem.getTypeByName('ChampionBomberStaff'),
            ModItem.getTypeByName('ChampionsGodHand'),
            ModItem.getTypeByName('ChampionsRebuttal')
        ].filter(type => type > 0);

        if (weapons.length > 0) {
            const choice = weapons[Rand.Next(0, weapons.length)];
            QuickSpawnItem(source, choice, 1);
        }

        // Materiais
        const fragId = ModItem.getTypeByName('BronzeAlloyFragments');
        if (fragId > 0) QuickSpawnItem(source, fragId, Rand.Next(6, 9));
        QuickSpawnItem(source, Terraria.ID.ItemID.Marble, Rand.Next(70, 101));

        // Máscara (1/7 chance)
        const maskId = ModItem.getTypeByName('BuriedChampionMask');
        if (maskId > 0 && Rand.Next(7) === 0) {
            QuickSpawnItem(source, maskId, 1);
        }

        // Poções de Cura e Moedas
        QuickSpawnItem(source, Terraria.ID.ItemID.HealingPotion, Rand.Next(5, 16));
        QuickSpawnItem(source, Terraria.ID.ItemID.GoldCoin, 6);
    }
}
