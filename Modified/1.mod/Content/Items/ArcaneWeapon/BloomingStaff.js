import { Terraria, Modules } from "./../../../TL/ModImports.js";
import { ModItem } from "./../../../TL/ModItem.js";
import { ModProjectile } from "./../../../TL/ModProjectile.js";

const { Main } = Terraria;

export class BloomingStaff extends ModItem {
    constructor() {
        super();
        this.Texture = "Items/ArcaneWeapon/" + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.damage = 18;
        this.Item.magic = true;
        this.Item.mana = 10;
        this.Item.noMelee = true;
        this.Item.shoot = ModProjectile.getTypeByName('BloomingStaffPro');
        this.Item.shootSpeed = 10;
        this.Item.useStyle = 5;
        
        this.Item.useAnimation = 12; 
        this.Item.useTime = 6;
        
        this.Item.reuseDelay = 20;
        this.Item.knockBack = 4;
        this.Item.rare = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item20;
        this.Item.autoReuse = true;
    }

    ModifyShootStats(player, position, velocity, type, damage, knockback) {
        let speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        let angle = Math.atan2(velocity.X, velocity.Y);

        angle += (Math.random() - 0.5) * 0.2;
        let scale = Math.random() * 0.2 + 0.95;

        velocity.X = speed * scale * Math.sin(angle);
        velocity.Y = speed * scale * Math.cos(angle);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}