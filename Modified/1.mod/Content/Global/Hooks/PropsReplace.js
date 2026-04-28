import { ItemRarityID } from "../../../TL/Enums/ItemRarityID.js";
import { Terraria } from "../../../TL/ModImports.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { ModLocalization } from "../../../TL/ModLocalization.js"

const { ItemTooltip } =  Terraria.UI
const Item = new NativeClass('Terraria', 'Item');

export class PropsReplace extends GlobalHooks {
    Initialize() {
        Item['void SetDefaults(int Type, ItemVariant variant)'].hook((original, self, Type, variant) => {
            original(self, Type, variant);

            //Thorium Ore   
            if (Type === Terraria.ID.ItemID.TeamBlockBlue) {
                self._nameOverride = ModLocalization.Translate('ItemName.ThoriumOre'); 
                self.rare = ItemRarityID.Blue
                self.value = Terraria.Item.sellPrice(0, 0, 2, 0);
                self.maxStack = 9999;
            }

            //Life Quartz   
            if (Type === Terraria.ID.ItemID.TeamBlockRed) {
                self._nameOverride = ModLocalization.Translate('ItemName.LifeQuartzOre'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 1, 50);
                self.maxStack = 9999;                
            }

           //Thorium Anvil
           if(Type === Terraria.ID.ItemID.ChlorophyteExtractinator) {
                self._nameOverride = ModLocalization.Translate('ItemName.ThoriumAnvil'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 5, 0);
                self.maxStack = 9999;    
           } 

           //Leaky Marine   
            if (Type === Terraria.ID.ItemID.EasterBlock) {
                self._nameOverride = ModLocalization.Translate('ItemName.LeakyMarineBlock'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 0, 0);
                self.maxStack = 9999;
            }

            //Mossy Gold Ore
            if (Type === Terraria.ID.ItemID.AncientPinkDungeonBrick) {
                self._nameOverride = ModLocalization.Translate('ItemName.MossyGoldOre'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 5, 0);
                self.maxStack = 9999;
            }

            //Mossy Platinum Ore
            if (Type === Terraria.ID.ItemID.ForbiddenBlock) {
                self._nameOverride = ModLocalization.Translate('ItemName.MossyPlatinumOre'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 5, 0);
                self.maxStack = 9999;
            }

            // Aquaite
            if (Type === Terraria.ID.ItemID.AncientBlueDungeonBrick) {
                self._nameOverride = ModLocalization.Translate('ItemName.Aquaite'); 
                self.rare = ItemRarityID.Blue; 
                self.value = Terraria.Item.sellPrice(0, 0, 10, 0);
                self.maxStack = 9999;
            }

            // Aquamarine
            if (Type === Terraria.ID.ItemID.AncientGreenDungeonBrick) {
                self._nameOverride = ModLocalization.Translate('ItemName.Aquamarine'); 
                self.rare = ItemRarityID.White;
                self.value = Terraria.Item.sellPrice(0, 0, 15, 0);
                self.maxStack = 9999;
            }

            //Arcane Armor Fabricator
            if (Type === Terraria.ID.ItemID.DyeVat) {
                self._nameOverride = ModLocalization.Translate('ItemName.ArcaneArmorFabricator'); 
                self.rare = ItemRarityID.White;
                self.value = Terraria.Item.sellPrice(0, 2, 0, 0);
                self.maxStack = 9999;
            }

            //Blood Altar
            if(Type === Terraria.ID.ItemID.HoneyDispenser) {
                self._nameOverride = ModLocalization.Translate('ItemName.BloodAltar')
                self.rare = ItemRarityID.White;
                self.value = Terraria.Item.sellPrice(0, 0, 66, 66);
                self.maxStack = 9999;
            }

            //Depth Chest
            if (Type === Terraria.ID.ItemID.LesionChest) {
                self._nameOverride = ModLocalization.Translate('ItemName.DepthChest'); 
                self.rare = ItemRarityID.White;
                self.value = Terraria.Item.sellPrice(0, 0, 50, 0);
                self.maxStack = 9999;
            }

            //Scarlet Chest
            if (Type === Terraria.ID.ItemID.GolfChest) {
                self._nameOverride = ModLocalization.Translate('ItemName.ScarletChest'); 
                self.rare = ItemRarityID.White;
                self.value = Terraria.Item.sellPrice(0, 0, 50, 0);
                self.maxStack = 9999;
            }

            //Scarlet Block
            if(Type === Terraria.ID.ItemID.AncientMythrilBrick) {
                self._nameOverride = ModLocalization.Translate('ItemName.ScarletBlock');
                self.value = Terraria.Item.sellPrice(0, 0, 5, 0);
            }
        });
    }
}