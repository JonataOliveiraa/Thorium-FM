import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";

const POPUP_SUPPRESSED = -1;

const SILENT_PICKUPS = ['InspirationNote', 'InspirationNoteNoble'];

export class HidePickupText extends GlobalHooks {
    static _types = null;

    static IsSilent(type) {
        if (HidePickupText._types === null) {
            const resolved = new Set();
            for (const name of SILENT_PICKUPS) {
                const id = ModItem.getTypeByName(name);
                if (id > 0) resolved.add(id);
            }
            HidePickupText._types = resolved;
        }
        return HidePickupText._types.has(type);
    }

    Initialize() {
        Terraria.PopupText['int NewText(PopupTextContext context, Item newItem, Vector2 position, int stack, bool noStack, bool longText)']
            .hook((original, context, newItem, position, stack, noStack, longText) => {
                if (newItem && HidePickupText.IsSilent(newItem.type)) return POPUP_SUPPRESSED;
                return original(context, newItem, position, stack, noStack, longText);
            });
    }
}
