import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const { Rand } = Modules

export class QueenJellyfishBag extends ModItem {
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
    const source = player['IEntitySource GetItemSource_OpenItem(int itemType)'](item.type);
    const QuickSpawnItem = player['void QuickSpawnItem(IEntitySource source, int item, int stack)'];

    const items = [
      ModItem.getTypeByName('BuccaneerBlunderBuss'),
      ModItem.getTypeByName('ConchShell'),
      ModItem.getTypeByName('GiantGlowstick'),
      ModItem.getTypeByName('JellyPondWand'),
      ModItem.getTypeByName('SparkingJellyBall'),
    ];
    const choice = items[Rand.Next(0, items.length)];

    if(Rand.NextBool(6)) QuickSpawnItem(source, ModItem.getTypeByName('QueensGlowstick'), 1);
    QuickSpawnItem(source, choice, 1);
    QuickSpawnItem(source, Terraria.ID.ItemID.GoldCoin, 3);
    QuickSpawnItem(source, Terraria.ID.ItemID.PinkGel, Rand.Next(5, 11));
    QuickSpawnItem(source, ModItem.getTypeByName('MarineKelp'), Rand.Next(3, 7));
    QuickSpawnItem(source, Terraria.ID.ItemID.LesserHealingPotion, Rand.Next(5, 16));
  }
}