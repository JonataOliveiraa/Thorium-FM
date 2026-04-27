import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";

export class ToolTipsReplace extends GlobalHooks {
    constructor() {
        super();
    }

    Initialize() {
        const RebuildTooltip = Terraria.Item['void RebuildTooltip()'];

        RebuildTooltip.hook((original, self) => {
            original(self);

            //Arcane Armor Fabricator
            if (self.type === Terraria.ID.ItemID.DyeVat) {
                const tooltip = Terraria.UI.ItemTooltip.new();
                tooltip['void .ctor(short id, string key)'](self.type, ModLocalization.Translate('ItemTooltip.ArcaneArmorFabricator'));
                self.ToolTip = tooltip;
            }

            //Blood Altar
            if (self.type === Terraria.ID.ItemID.HoneyDispenser) {
                const tooltip = Terraria.UI.ItemTooltip.new();
                tooltip['void .ctor(short id, string key)'](self.type, ModLocalization.Translate('ItemTooltip.BloodAltar'));
                self.ToolTip = tooltip;
            }
        });
    }
}