import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class MantisCane extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
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
        this.Item.damage = 24;
        this.Item.mana = 10;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 5.0;
        this.Item.value = Terraria.Item.sellPrice(0, 3, 0, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.buffType = ModBuff.getTypeByName('MantisCaneBuff');
        this.Item.shoot = ModProjectile.getTypeByName('MantisCanePro');
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(item.buffType, 3600, false);
        
        const idx = NewProjectile(player.GetProjectileSource_Item(item), Terraria.Main.MouseWorld, velocity, type, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        Terraria.Main.projectile[idx].originalDamage = item.damage;
        
        return false;
    }
}