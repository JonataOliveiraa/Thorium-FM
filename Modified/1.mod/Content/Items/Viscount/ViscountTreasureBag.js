import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Rand } = Modules;

export class ViscountTreasureBag extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
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
        const source = player['IEntitySource GetItemSource_OpenItem(int itemType)'](item.type);
        const QuickSpawnItem = player['void QuickSpawnItem(IEntitySource source, int item, int stack)'];

        const weapons = [
            ModItem.getTypeByName('BatWing'),
            ModItem.getTypeByName('GuanoGunner'),
            ModItem.getTypeByName('VampireScepter'),
            ModItem.getTypeByName('ViscountCane'),
            ModItem.getTypeByName('BatScythe'),
            ModItem.getTypeByName('SonarCannon')
        ].filter(type => type >= 0);

        const first = Rand.Next(0, weapons.length);
        let second = Rand.Next(0, weapons.length);
        if (second === first) second = (second + 1) % weapons.length;

        QuickSpawnItem(source, weapons[first], 1);
        if (weapons.length > 1) QuickSpawnItem(source, weapons[second], 1);

        if (Rand.NextBool(7)) QuickSpawnItem(source, ModItem.getTypeByName('ViscountMask'), 1);

        QuickSpawnItem(source, Terraria.ID.ItemID.GoldCoin, 5);
        QuickSpawnItem(source, Terraria.ID.ItemID.HealingPotion, Rand.Next(5, 16));
    }
}
