import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ButterflyStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = 1;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.summon = true;
        this.Item.damage = 12;
        this.Item.mana = 10;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 2.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.buffType = ModBuff.getTypeByName('ButterflyStaffBuff');
        this.Item.shoot = ModProjectile.getTypeByName('ButterflyStaffPro');
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(item.buffType, 3600, false);
        
        const source = player.GetProjectileSource_Item(item);
        position = Terraria.Main.MouseWorld;
        for (let i = 0; i < 3; i++) {
            let num = Rand.Next(11);
            let num2 = NewProjectile(source, position, Vector2.new(velocity.X, velocity.Y + Rand.NextFloat(5)), type, damage * 0.75, knockBack, player.whoAmI, num, 0, 0, null);
            Terraria.Main.projectile[num2].originalDamage = item.damage;
        }
        
        return false;
    }

    AddRecipes() {
        // GoldBar
        this.CreateRecipe(1)
        .AddIngredient(19, 8)
        .AddIngredient(2891)
        .AddTile(16)
        .Register();
        
        // PlatinumBar
        this.CreateRecipe(1)
        .AddIngredient(706, 8)
        .AddIngredient(2891)
        .AddTile(16)
        .Register();
    }
}