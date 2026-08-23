import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class RosySlimeStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = 1;
    }
    
    SetDefaults() {
        this.Item.damage = 12;
        this.Item.summon = true;
        this.Item.mana = 10;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 3.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 60, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.buffType = ModBuff.getTypeByName('RosySlimeStaffBuff');
        this.Item.shoot = ModProjectile.getTypeByName('RosySlimeStaffPro');
    }
    
    ModifyShootStats(item, player, stats) {
        stats.position = Terraria.Main.MouseWorld;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(this.Item.buffType, 3600, false);
        
        const projIndex = NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        const proj = Terraria.Main.projectile[projIndex];
        proj.originalDamage = item.damage;
        
        return false;
    }
}