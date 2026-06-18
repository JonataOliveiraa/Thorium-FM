// ViciousMockery.js
import { BardItemSound } from "../../../Common/Enum/BardItemSound.js";
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { PlayerDB } from "../../../TL/PlayerDB.js";
import { Empowerments } from "../../Global/Empowerments.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const BikeHornSound = BardItemSound.Lute;

export class ViciousMockery extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('ViciousMockeryPro');
        this.Item.shootSpeed = 8;

        this.SetWeaponValues(18, 5, 4);
        this.SetDefaultWeaponStyle(38, true); // useTime = useAnimation = 38

        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0); // 1 gold
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.noMelee = true;
        this.Item.holdStyle = 3;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(BikeHornSound, player.Center.X, player.Center.Y, 1, 0.5, 0.7);
            Empowerments.Apply(player, "FlatDamage", 1);
        }
        return true;
    }

    ModifyWeaponDamage(item, player, damage) {
        let finalDamage = super.ModifyWeaponDamage(item, player, damage);

        const currentInspiration = PlayerDB.get("Inspiration") ?? 0;
        const baseMax = this.inspirationMax ?? 20;
        const maxInspiration = baseMax + ThoriumPlayer.class.Bard.inspirationMax2;
        const bonus = 0.5 * (currentInspiration / maxInspiration);
        finalDamage *= 1 + bonus;

        return finalDamage;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const advanceX = norm.X * 30;
        const advanceY = norm.Y * 30;
        const perpX = -norm.Y * player.direction * 6;
        const perpY = norm.X * player.direction * 6;

        const spawnPos = Vector2.new(
            position.X + advanceX - perpX,
            position.Y + advanceY - perpY
        );
        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos, velocity, type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.HellstoneBar, 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}