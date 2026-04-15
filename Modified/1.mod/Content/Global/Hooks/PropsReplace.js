import { ItemRarityID } from "../../../TL/Enums/ItemRarityID.js";
import { Terraria } from "../../../TL/ModImports.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { ModLocalization } from "../../../TL/ModLocalization.js"

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
                self._nameOverride = ModLocalization.Translate('ItemName.LifeQuartz'); 
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 1, 50);
                self.maxStack = 9999;                
            }

           //Thorium Anvil
           if(Type === Terraria.ID.ItemID.NebulaPiano) {
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
        });
    }
}