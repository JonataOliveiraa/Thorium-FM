import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Color } = Modules;

export class SpringWater extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 30;
        Terraria.ID.ItemID.Sets.DrinkParticleColors[this.Type] = [
            Color.new(90, 200, 210),
            Color.new(60, 165, 190),
            Color.new(35, 120, 160)
        ].makeGeneric(Microsoft.Xna.Framework.Graphics.Color);
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 26;
        this.Item.useTime = 17;
        this.Item.useAnimation = 17;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.DrinkLiquid;
        this.Item.useTurn = true;
        this.Item.healLife = 125;
        this.Item.consumable = true;
        this.Item.potion = true;
        this.Item.maxStack = 9999;
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item3;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('WaterChestnut'), 2)
            .AddIngredient(Terraria.ID.ItemID.HealingPotion, 1)
            .AddTile(Terraria.ID.TileID.Bottles)
            .Register();
    }
}
