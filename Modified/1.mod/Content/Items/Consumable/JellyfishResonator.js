import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { gRecipes } from "../../Global/gRecipes.js";

const { Main, NPC } = Terraria;
const NewNPC = NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const AnyNPCs = NPC['bool AnyNPCs(int Type)'];

export class JellyfishResonator extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Consumable/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.maxStack = 99;
        this.Item.consumable = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.useStyle = 4;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
    }

    CanUseItem(item, player) {
        if (!Main.dayTime) return false;
        if (!player.ZoneBeach) return false;
        const queenType = ModNPC.getTypeByName('QueenJellyfish');
        if (queenType > 0 && AnyNPCs(queenType)) return false;
        return true;
    }

    UseItem(item, player) {
        const queenType = ModNPC.getTypeByName('QueenJellyfish');
        if (queenType <= 0) return false;

        const spawnX = player.Center.X + (Math.random() < 0.5 ? -600 : 600);
        const spawnY = player.Center.Y - 130;

        const source = Terraria.Projectile.GetNoneSource();
        NewNPC(source, spawnX, spawnY, queenType, 0, 0, 0, 0, 0, player.whoAmI);

        Effects.PlaySound(15, player.Center.X, player.Center.Y, 0, 1.0, 1.0);

        return true
    }

    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(Terraria.ID.ItemID.Coral, 4)
        .AddIngredient(2625, 1)
        .AddIngredient(2626, 1)
        .AddTile(Terraria.ID.TileID.DemonAltar)
        .Register()
    }
}

        // this.CreateRecipe()
        // .AddIngredient(Terraria.ID.ItemID.Coral, 2)
        // .AddRecipeGroup(gRecipes.CustomGroups.get('JellyfishesBait'))
        // .AddIngredient(2436, 1)
        // .AddTile(Terraria.ID.TileID.DemonAltar)
        // .Register()