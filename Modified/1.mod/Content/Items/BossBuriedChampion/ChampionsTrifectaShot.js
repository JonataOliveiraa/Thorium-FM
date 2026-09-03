import { Terraria, Modules } from '../../../TL/ModImports.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _pro1 = -1, _pro2 = -1, _pro3 = -1;

export class ChampionsTrifectaShot extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 40;
    this.Item.height = 40;
    this.Item.damage = 28;
    this.Item.ranged = true;
    this.Item.useTime = 24;
    this.Item.useAnimation = 24;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noMelee = true;
    this.Item.knockBack = 4;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
    this.Item.autoReuse = true;
    this.Item.shoot = Terraria.ID.ProjectileID.WoodenArrowFriendly;
    this.Item.shootSpeed = 10;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
  }

  HoldoutOffset(item, player) {
    return { X: -4, Y: 0 };
  }

  CanUseItem(item, player) {
    return AmmoHelper.Has(player, item.useAmmo);
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    if (_pro1 === -1) _pro1 = ModProjectile.getTypeByName('ChampionsTrifectaShotPro') ?? -2;
    if (_pro2 === -1) _pro2 = ModProjectile.getTypeByName('ChampionsTrifectaShotPro2') ?? -2;
    if (_pro3 === -1) _pro3 = ModProjectile.getTypeByName('ChampionsTrifectaShotPro3') ?? -2;

    if (AmmoHelper.Consume(player, item.useAmmo) <= 0) return false;

    const counter = ThoriumPlayer.itemChampionsTrifectaShotCounter;
    const source = null;

    if (counter === 0 && _pro1 > 0) {
      NewProjectile(source, position, velocity, _pro1, Math.floor(damage * 1.25), knockBack, player.whoAmI, 0, 0, 0, null);
    } else if (counter === 1 && _pro2 > 0) {
      const fastVel = Vector2.new(velocity.X * 1.25, velocity.Y * 1.25);
      NewProjectile(source, position, fastVel, _pro2, damage, knockBack, player.whoAmI, 0, 0, 0, null);
    } else if (_pro3 > 0) {
      NewProjectile(source, position, velocity, _pro3, damage, knockBack * 0.5, player.whoAmI, 0, 0, 0, null);
    }

    ThoriumPlayer.itemChampionsTrifectaShotCounter++;
    if (ThoriumPlayer.itemChampionsTrifectaShotCounter > 2) {
      ThoriumPlayer.itemChampionsTrifectaShotCounter = 0;
    }

    return false;
  }
}
