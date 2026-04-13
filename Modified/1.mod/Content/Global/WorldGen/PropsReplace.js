import { ItemRarityID } from "../../../TL/Enums/ItemRarityID.js";
import { Terraria } from "../../../TL/ModImports.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";

const Item = new NativeClass('Terraria', 'Item');

export class PropsReplace extends GlobalHooks {
    Initialize() {
        Item['void SetDefaults(int Type, ItemVariant variant)'].hook((original, self, Type, variant) => {
            original(self, Type, variant);

            //Opal Ore   
            if (Type === Terraria.ID.ItemID.TeamBlockRed) {
                self._nameOverride = "Opal Ore"; 
                
                self.rare = ItemRarityID.White
                self.value = Terraria.Item.sellPrice(0, 0, 0, 50);
                self.maxStack = 9999; // Limite na mochilas

            }
        });
    }
}