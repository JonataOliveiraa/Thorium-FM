import { ModBardItem } from "../../../Common/ModBardItem.js";
import { System, Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { PlayerDB } from "../../../TL/PlayerDB.js";
import { Empowerments } from "../../Global/Empowerments.js";

const { Main } = Terraria;

export class MarineWineGlass extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
        this.instrumentStyle = 'Percussion';
        this.useWheel = true;
        this.inspirationCost = 5;
        this.inspirationMax = 20;
    }

    SetDefaults() {
        this.Item.damage = 22;
        this.Item.knockBack = 2;
        this.Item.crit = 4;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 25;
        this.Item.useAnimation = 14;
        this.Item.noUseGraphic = true;
        this.Item.useStyle = 5;
        this.Item.autoReuse = true;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('AquamarineWineGlassPro');
        this.Item.shootSpeed = 10;
    }

    UseTimeMultiplier(item, player) {
        return player.altFunctionUse === 2 ? 0.5 : 1.0;
    }

    UseAnimationMultiplier(item, player) {
        return player.altFunctionUse === 2 ? 0.5 : 1.0;
    }

    CanUseItem(item, player) {
        // Chama a verificação base corretamente
        if (!super.CanUseItem(item, player)) {
            return false;
        }

        const type = ModProjectile.getTypeByName('AquamarineWineGlassPro');
        let count = 0;
        for (let i = 0; i < Main.maxProjectiles; i++) {
            const p = Main.projectile[i];
            if (p.active && p.owner === player.whoAmI && p.type === type) {
                count++;
            }
        }

        if (player.altFunctionUse === 2) {
            return count >= 1 && (PlayerDB.get("Inspiration") ?? 0) >= 5;
        } else {
            return count < 6;
        }
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item35, player.Center.X, player.Center.Y, 1, 0.92, 1.09);
            Empowerments.Apply(player, "AquaticAbility", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (player.altFunctionUse === 2) {
            for (let i = 0; i < Main.maxProjectiles; i++) {
                const p = Main.projectile[i];
                if (p.active && p.owner === player.whoAmI && p.type === ModProjectile.getTypeByName('AquamarineWineGlassPro')) {
                    p.Kill();
                }
            }
            return false;
        }
        return true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}