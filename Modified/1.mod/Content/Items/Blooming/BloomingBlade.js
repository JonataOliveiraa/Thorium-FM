import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from "./../../../TL/ModBuff.js";

export class BloomingBlade extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Blooming/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;

        this.SetWeaponValues(22, 6, 4);
        this.SetDefaultWeaponStyle(22, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    OnHitNPC(item, player, npc, damageDone, knockBack) {
        player.AddBuff(ModBuff.getTypeByName('LifeRecoveryBuff'), 300, true);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}