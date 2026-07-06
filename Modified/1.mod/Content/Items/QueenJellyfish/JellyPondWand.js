import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class JellyPondWand extends ModItem {

    constructor() {
        super();
        this.Texture = "Items/QueenJellyfish/" + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.noMelee = true;

        this.Item.width = 40;
        this.Item.height = 40;

        this.Item.mana = 11;

        this.SetWeaponValues(21, 3, 4);
        this.SetDefaultWeaponStyle(26, true);

        this.Item.UseSound = Terraria.ID.SoundID.Item43;

        this.Item.shoot = ModProjectile.getTypeByName("JellySpawnPro");
        this.Item.shootSpeed = 8;

        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }
}