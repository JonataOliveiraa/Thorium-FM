import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';

const { Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const MUZZLE_OFFSET = 24;

let _arrowType = -1;

export class GraniteCrossbow extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.ranged = true;
        this.SetWeaponValues(22, 6, 4);
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item5;
        this.Item.shoot = Terraria.ID.ProjectileID.WoodenArrowFriendly;
        this.Item.shootSpeed = 12;
        this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
    }

    ModifyShootStats(item, player, stats) {
        // Nasce na ponta da besta em vez de dentro do jogador, mas so se nao
        // tiver parede no caminho — senao atravessaria o bloco de graca.
        const dir = Vector2.SafeNormalize(stats.velocity, Vector2.UnitX);
        const muzzle = Vector2.Add(stats.position, Vector2.Multiply(dir, MUZZLE_OFFSET));

        if (CanHit(stats.position, 0, 0, muzzle, 0, 0)) stats.position = muzzle;
    }

    CanUseItem(item, player) {
        return AmmoHelper.Has(player, item.useAmmo);
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_arrowType === -1) _arrowType = ModProjectile.getTypeByName('GraniteArrowPro') ?? -2;
        if (_arrowType < 0) return true;

        if (AmmoHelper.Consume(player, item.useAmmo) <= 0) return false;

        NewProjectile(null, position, velocity, _arrowType, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
