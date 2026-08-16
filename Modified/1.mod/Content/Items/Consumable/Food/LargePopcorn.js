import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

const { Rand } = Modules;
const { BuffID } = Terraria.ID;

const DURATION = 600;

// Um de cada balde. A ideia e' que o balde sempre traga um susto junto com o
// premio, entao nenhum dos lados pode ser forte demais.
const BAD = [BuffID.Slow, BuffID.Weak, BuffID.Confused, BuffID.Darkness, BuffID.Silenced];
const MEDIUM = [BuffID.Shine, BuffID.NightOwl, BuffID.Hunter, BuffID.Spelunker, BuffID.Dangersense];
const GOOD = [BuffID.Ironskin, BuffID.Regeneration, BuffID.Swiftness, BuffID.Archery, BuffID.Thorns];

export class LargePopcorn extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.ID.ItemID.Sets.IsFood[this.Type] = true;
  }

  SetDefaults() {
    this.Item.width = 20;
    this.Item.height = 20;
    this.Item.useTime = 30;
    this.Item.useAnimation = 30;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.EatFood;
    this.Item.useTurn = true;
    this.Item.consumable = true;
    this.Item.maxStack = 9999;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.UseSound = Terraria.ID.SoundID.Item2;
  }

  _pick(pool) {
    return pool[Rand.Next(0, pool.length)];
  }

  OnConsumeItem(item, player) {
    player.AddBuff(this._pick(BAD), DURATION, true, false);
    player.AddBuff(this._pick(MEDIUM), DURATION, true, false);
    player.AddBuff(this._pick(GOOD), DURATION, true, false);
  }
}
