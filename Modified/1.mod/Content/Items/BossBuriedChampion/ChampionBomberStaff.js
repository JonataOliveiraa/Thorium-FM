import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class ChampionBomberStaff extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Item.staff[this.Item.type] = true;
  }

  SetDefaults() {
    this.Item.damage = 24;
    this.Item.magic = true;
    this.Item.mana = 10;
    this.Item.width = 40;
    this.Item.height = 40;
    this.Item.useTime = 30;
    this.Item.useAnimation = 30;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noMelee = true;
    this.Item.knockBack = 3;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item43;
    this.Item.autoReuse = true;
    this.Item.shootSpeed = 8;

    if (_proType === -1) _proType = ModProjectile.getTypeByName('ChampionBomberStaffPro') ?? -2;
    if (_proType >= 0) this.Item.shoot = _proType;
  }
}
