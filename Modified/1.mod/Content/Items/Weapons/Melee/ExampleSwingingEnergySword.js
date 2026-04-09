import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

export class ExampleSwingingEnergySword extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.melee = true;
        this.Item.noMelee = true;
        // (damage, knockback, crit);
        this.SetWeaponValues(72, 4.5, 0);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(20, true);
        this.Item.scale = 1.0;
        
        this.Item.value = Terraria.Item.buyPrice(0, 23, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Pink;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        
        this.Item.shoot = ModProjectile.getTypeByName('ExampleSwingingEnergySwordProjectile');
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        let adjustedItemScale = player.GetAdjustedItemScale(item);
        
        player.direction = Terraria.Main.MouseWorld.X < player.Center.X ? -1 : 1;
        velocity.X = player.direction;
        velocity.Y = 0;
        
        Terraria.Projectile[
        'int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'
        ](
            player.GetProjectileSource_Item(item),
            player.MountedCenter, velocity,
            type, damage, knockBack, player.whoAmI,
            player.direction * player.gravDir,
            player.itemAnimationMax,
            adjustedItemScale,
            null
        );
        
        return false;
    }
}