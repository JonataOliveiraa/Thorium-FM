import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class StrongestLink extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.sentry = true;
        this.Item.damage = 34;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 8.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item78;
        this.Item.shoot = ModProjectile.getTypeByName('StrongestLinkPro');
    }
    
    CanUseItem(item, player) {
        let num1 = Math.floor(Terraria.Main.MouseWorld.X / 16);
        let num2 = Math.floor(Terraria.Main.MouseWorld.Y / 16);
        const tile = Terraria.Main.tile.get_Item(num1, num2);
        return tile && tile['bool active()']() && Terraria.Main.tileSolid[tile.type];
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.direction = (Terraria.Main.MouseWorld.X > player.Center.X) ? 1 : -1;
        
        let num1 = Math.floor(Terraria.Main.MouseWorld.X / 16);
        let num2 = Math.floor(Terraria.Main.MouseWorld.Y / 16);
        const tile = Terraria.Main.tile.get_Item(num1, num2);
        if (tile && tile['bool active()']()) {
            const vector2 = Vector2.new((num1 * 16) + 8, (num2 * 16) + 8);
            const idx = NewProjectile(player.GetProjectileSource_Item(item), vector2, Vector2.Zero, type, damage, knockBack, player.whoAmI, vector2.X, vector2.Y, 0.0, null);
            const projectile = Terraria.Main.projectile[idx];
            projectile.spriteDirection = player.direction;
            projectile.originalDamage = item.damage;
            player.UpdateMaxTurrets();
        }
        
        return false;
    }
}