import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ConchShell extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 28;
        this.Item.knockBack = 3;
        this.Item.crit = 4;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.autoReuse = true;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.shoot = ModProjectile.getTypeByName('ConchShellPro');
        this.Item.shootSpeed = 0; // não usado, velocidades manuais
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2; // Rarity Green/Blue (2)
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item21, player.Center.X, player.Center.Y, 1, -0.23, 0.8); // placeholder Conch_Sound
            Empowerments.Apply(player, "CriticalStrikeChance", 2);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const dir = player.direction; 
        const speeds = [2.5, 3.0, 3.5, 4.0, 4.5];
        const offsetX = 25 * dir;
        const spawnPos = Vector2.new(position.X + offsetX, position.Y);

        for (const speed of speeds) {
            const vel = Vector2.new(speed * dir, 0);
            NewProjectile(
                player.GetProjectileSource_Item(item),
                spawnPos, vel, type, damage, knockBack,
                player.whoAmI, 0, 0, 0, null
            );
        }
        return false;
    }
}