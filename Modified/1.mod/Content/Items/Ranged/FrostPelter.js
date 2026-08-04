import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SHOTS = 4;
const SPREAD = 15 * Math.PI / 180; // 15 graus pra cada lado
const SPEED_JITTER = 0.15;         // ate 15% mais devagar por bola

let _proType = -1;

export class FrostPelter extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(2, 0, 0);
        this.Item.ranged = true;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 48;
        this.Item.useAnimation = 48;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item41;
        this.Item.shootSpeed = 10;
        this.Item.useAmmo = Terraria.ID.AmmoID.Snowball;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('FrostPelterPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    ModifyShootStats(item, player, stats) {
        stats.knockBack = stats.knockBack / 2;
        return stats;
    }

    // Cospe 4 bolas de neve num leque, cada uma um pouco mais lenta
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        const source = player.GetProjectileSource_Item(item);

        for (let i = 0; i < SHOTS; i++) {
            const angle = (Math.random() * 2 - 1) * SPREAD;
            const ca = Math.cos(angle);
            const sa = Math.sin(angle);
            const slow = 1 - Math.random() * SPEED_JITTER;

            NewProjectile(
                source, position,
                Vector2.new(
                    (velocity.X * ca - velocity.Y * sa) * slow,
                    (velocity.X * sa + velocity.Y * ca) * slow
                ),
                _proType, damage, knockBack, player.whoAmI,
                0, 0, 0, null
            );
        }

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: -2, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('IcyShard'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
