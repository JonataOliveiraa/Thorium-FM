import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

export class GraniteBoomBox extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentType = 'Electronic';
    }

    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 12;
        this.InspirationCost = 5;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 4;
        this.Item.knockBack = 8.0;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('GraniteBoomBoxPro');
        this.Item.shootSpeed = 0.0;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('boomBoxSound');
            Empowerments.Apply(player, 'EmpowermentProlongation', 2);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const projArr = Terraria.Main.projectile;
        for (let index = 0; index < Terraria.Main.maxProjectiles; index++) {
            const projectile = projArr[index];
            if (projectile.active && projectile.type === type && projectile.owner === player.whoAmI) {
                ModProjectile.getModProjectile(type).Prolong(projectile);
                return false;
            }
        }
        return true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 8)
        .AddTile(16)
        .Register();
    }
}
