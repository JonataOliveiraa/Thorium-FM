import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _boltType = -1;

export class ChampionsGodHand extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.damage = 33;
    this.Item.ranged = true;
    this.Item.crit = 6;
    this.Item.width = 30;
    this.Item.height = 30;
    this.Item.useTime = 22;
    this.Item.useAnimation = 22;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
    this.Item.autoReuse = true;
    this.Item.noMelee = true;
    this.Item.noUseGraphic = true;
    this.Item.knockBack = 3;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item8;
    this.Item.shootSpeed = 15;

    if (_boltType === -1) _boltType = ModProjectile.getTypeByName('LightBolt') ?? -2;
    if (_boltType >= 0) this.Item.shoot = _boltType;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    if (_boltType === -1) _boltType = ModProjectile.getTypeByName('LightBolt') ?? -2;
    const projType = _boltType > 0 ? _boltType : type;
    const source = null;

    const fastVel = Vector2.new(velocity.X * 1.65, velocity.Y * 1.65);
    NewProjectile(source, position, fastVel, projType, damage, knockBack, player.whoAmI, 0, 0, 0, null);

    return false;
  }
}
