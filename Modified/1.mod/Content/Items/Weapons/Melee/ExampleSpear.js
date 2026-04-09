import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

export class ExampleSpear extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.SkipsInitialUseSound[this.Type] = true;
    }
    
    SetDefaults() {
        // Common Properties
        this.Item.rare = Terraria.ID.ItemRarityID.Pink;
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
        this.Item.shoot = ModProjectile.getTypeByName('ExampleSpearProjectile');
        this.Item.shootSpeed = 3.7;
    }
    
    CanUseItem(item, player) {
        // Ensures no more than one spear can be thrown out, use this when using autoReuse
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        // Because we're skipping sound playback on use animation start, we have to play it ourselves whenever the item is actually used.
        if (!Terraria.Main.dedServ && item.UseSound !== null) {
            Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'
            ](item.UseSound, player.Center, 0, 1);
        }
        return true;
    }
}