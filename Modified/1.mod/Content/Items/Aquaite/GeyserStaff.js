// GeyserStaff.js
import { ModItem } from "../../../TL/ModItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GeyserStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.damage = 26;
        this.Item.magic = true;
        this.Item.mana = 14;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 18;
        this.Item.useAnimation = 18;
        this.Item.reuseDelay = 26;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item13;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('GeyserPro');
        this.Item.shootSpeed = 0;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const dir = player.direction > 0 ? 30 : -30;
        const velX = player.direction > 0 ? 3 : -3;
        const spawnPos = Vector2.new(player.Center.X + dir, player.Bottom.Y - 20);
        const vel = Vector2.new(velX, 0);
        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos, vel, type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 15)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 5)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}