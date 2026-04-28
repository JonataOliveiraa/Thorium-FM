import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumAnvil } from '../../Global/Tiles/ThoriumAnvil.js';

export class ThoriumSpear extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.SkipsInitialUseSound[this.Type] = true;
    }
    
    SetDefaults() {
        // Common Properties
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        
        // Use Properties
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.useAnimation = 12;
        this.Item.useTime = 18;
        this.Item.autoReuse = true;
        this.Item.UseSound = Terraria.ID.SoundID.Item71;
        
        // Weapon Properties
        this.Item.damage = 25;
        this.Item.knockBack = 6.5;
        this.Item.noUseGraphic = true;
        this.Item.melee = true;
        this.Item.noMelee = true;
        
        // Projectile Properties
        this.Item.shoot = ModProjectile.getTypeByName('ThoriumSpearPro');
        this.Item.shootSpeed = 3.7;
    }
    
    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (!Terraria.Main.dedServ && item.UseSound !== null) {
            Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'
            ](item.UseSound, player.Center, 0, 1);
        }
        return true;
    }

    AddRecipes() {
            this.CreateRecipe(1)
                .AddIngredient(ModItem.getTypeByName("ThoriumBar"), 8)
                .AddTile(ThoriumAnvil.Type)
                .Register();
        }
}