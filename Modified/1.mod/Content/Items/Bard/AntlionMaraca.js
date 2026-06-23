// AntlionMaraca.js
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class AntlionMaraca extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('AntlionMaracaPro');
        this.Item.shootSpeed = 10;

        this.SetWeaponValues(7, 3, 4);
        this.SetDefaultWeaponStyle(24, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.noMelee = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item155, player.Center.X, player.Center.Y, 1, 0.5, 1.1);
            Empowerments.Apply(player, "MovementSpeed", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const spawnPos = Vector2.new(
            position.X + norm.X * 25,
            position.Y + norm.Y * 25
        );

        const num = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < num; i++) {
            const randomVel = Terraria.Utils.RotatedByRandom(velocity, Math.PI * 15 / 180);
            const speedMult = 1.0 - Rand.NextFloat() * 0.3;
            const finalVel = Vector2.Multiply(randomVel, speedMult);

            NewProjectile(
                player.GetProjectileSource_Item(item),
                spawnPos, finalVel, type, damage, knockBack,
                player.whoAmI, 0, 0, 0, null
            );
        }
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.AntlionMandible, 2)
            .AddIngredient(Terraria.ID.ItemID.HardenedSand, 15)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}