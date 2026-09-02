import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const { Rand } = Modules

export class ThunderBirdBag extends ModItem {
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

    const items = [
      ModItem.getTypeByName('TalonBurst'),
      ModItem.getTypeByName('ThunderTalon'),
      ModItem.getTypeByName('StormHatchlingStaff'),
      ModItem.getTypeByName('Didgeridoo')
    ];
    const choice = items[Rand.Next(0, items.length)];
    QuickSpawnItem(source, choice, 1);
    QuickSpawnItem(source, ModItem.getTypeByName('SandstoneIngot'), Rand.Next(22, 26))
    QuickSpawnItem(source, ModItem.getTypeByName('ZephyrsGrip'), 1);
  }
}