import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class TabooWand extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/DD/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = 2;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 24;
        this.Item.summon = true;
        this.Item.damage = 20;
        this.Item.mana = 10;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 5.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.buffType = ModBuff.getTypeByName('TabooWandBuff');
        this.Item.shoot = ModProjectile.getTypeByName('TabooWandPro');
        this.Item.shootSpeed = 10.0;
        this.Item.expert = true;
    }
    
    CanUseItem(item, player) {
        return player.maxMinions >= Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type];
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(item.buffType, 3600, false);
        const idx = NewProjectile(player.GetProjectileSource_Item(item), position, velocity, type, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        Terraria.Main.projectile[idx].originalDamage = item.damage;
        return false;
    }
}