// MarineWineGlass.js
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { System, Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { PlayerDB } from "../../../TL/PlayerDB.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
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

    // Velocidade de uso reduzida no alt fire
    UseTimeMultiplier(item, player) {
        return player.altFunctionUse === 2 ? 0.5 : 1.0;
    }
    UseAnimationMultiplier(item, player) {
        return player.altFunctionUse === 2 ? 0.5 : 1.0;
    }

    CanUseItem(item, player) {
        const type = this.Item.shoot;

        if (player.altFunctionUse === 2) {
            let count = 0;
            for (let i = 0; i < Main.maxProjectiles; i++) {
                const p = Main.projectile[i];
                if (p.active && p.owner === player.whoAmI && p.type === type) count++;
            }
            return count >= 1 && (PlayerDB.get("Inspiration") ?? 0) >= 5;
        } else {
            let count = 0;
            for (let i = 0; i < Main.maxProjectiles; i++) {
                const p = Main.projectile[i];
                if (p.active && p.owner === player.whoAmI && p.type === type) count++;
            }
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
                if (p.active && p.owner === player.whoAmI && p.type === type) {
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