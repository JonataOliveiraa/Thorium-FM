import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Rand } = Modules;

// Bolsa do Granite Energy Storm. As quantidades sao as versoes "de bolsa" do
// original: mais generosas que o drop normal.
const GRANITE_BLOCK = 3086;
const WEAPONS = ['EnergyStormPartisan', 'EnergyStormBolter', 'EnergyProjector', 'BoulderProbeStaff', 'ShockAbsorber'];

export class GraniteEnergyStormTreasureBag extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Consumable/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.BossBag[this.Type] = true;
    }

    SetDefaults() {
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.consumable = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Purple;
        this.Item.expert = true;
    }

    OpenBossBag(item, player) {
        const source = null;
        const QuickSpawnItem = player['void QuickSpawnItem(IEntitySource source, int item, int stack)'];

        const give = (type, stack = 1) => {
            if (type > 0) QuickSpawnItem(source, type, stack);
        };

        // Uma das cinco armas, como no drop normal.
        const available = WEAPONS.map(name => ModItem.getTypeByName(name)).filter(type => type > 0);
        if (available.length > 0) give(available[Rand.Next(0, available.length)]);

        give(Terraria.ID.ItemID.GoldCoin, 6);
        give(GRANITE_BLOCK, Rand.Next(70, 101));
        give(ModItem.getTypeByName('GraniteEnergyCore'), Rand.Next(6, 9));
        give(Terraria.ID.ItemID.HealingPotion, Rand.Next(5, 16));

        if (Rand.NextBool(7)) give(ModItem.getTypeByName('GraniteEnergyStormMask'));

        // No Master a bolsa tambem entrega o mascote.
        if (Terraria.Main.masterMode) give(ModItem.getTypeByName('EnergizedQuadCube'));
    }
}
