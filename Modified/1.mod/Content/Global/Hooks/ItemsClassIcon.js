import { ModBardItem } from "../../../Common/ModBardItem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { ModThrowerItem } from "../../../Common/ModThrowerItem.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";

const GUIPageIcons = new NativeClass('', 'GUIPageIcons');
const GUICrafting = new NativeClass('', 'GUICrafting');
const GUICraftGuidePopup = new NativeClass('', 'GUICraftGuidePopup');

const CLASS_ICON = {
    healer: 6033,
    bard: 3943,
    thrower: 5160,
};

// get_HoverName e chamado o tempo todo (tooltip, item no chao, inventario).
// As flags de classe nao mudam por tipo de item, entao o prefixo do icone
// fica guardado e sobra so uma leitura nativa (item.type) por chamada.
const PREFIX_BY_TYPE = new Map();

export class ItemsClassIcon extends GlobalHooks {
    constructor() {
        super();
        this._tip55Original = null;
        this._originalTips = {};
        this._lastTip55 = null;
    }

    getCustomClass(typeOrItem) {
        const type = typeof typeOrItem === 'number' ? typeOrItem : typeOrItem?.type;
        if (ModHealerItem.healerItemsName.has(type)) return 'healer';
        if (ModBardItem.bardItemsName.has(type)) return 'bard';
        if (ModThrowerItem.throwerItemsName.has(type)) return 'thrower';
        return null;
    }

    setCustomTranslation() {
        if (!Terraria.Lang.tip?.[55]) return;
        if (this._tip55Original === null) this._tip55Original = Terraria.Lang.tip[55].Value;

        const hoverItem = Terraria.Main.HoverItem;
        const cls = this.getCustomClass(hoverItem);

        let newValue = this._tip55Original;
        if (cls === 'healer') newValue = ModLocalization.Translate('ThoriumClasses.Tooltips.radiantDamage');
        if (cls === 'bard') newValue = ModLocalization.Translate('ThoriumClasses.Tooltips.symphonicDamage');
        if (cls === 'thrower') newValue = ModLocalization.Translate('ThoriumClasses.Tooltips.throwingDamage');

        if (cls && hoverItem.crit > 0) {
            const player = Terraria.Main.LocalPlayer;
            const crit = player.meleeCrit - player.inventory[player.selectedItem].crit + hoverItem.crit;
            newValue += `\n${crit}${Terraria.Lang.tip[5].Value}`;
        }

        // SetValue e interop e isso rodava a cada desenho do inventario, mesmo
        // com o texto identico ao que ja estava la
        if (newValue === this._lastTip55) return;
        this._lastTip55 = newValue;

        Terraria.Lang.tip[55]['void SetValue(string text)'](newValue);
    }

    isVanillaFlagClass(item) {
        return item.magic || item.melee || item.ranged || item.summon;
    }

    Initialize() {
        Terraria.Item.get_HoverName.hook((original, item) => {
            const type = item.type;
            let prefix = PREFIX_BY_TYPE.get(type);

            if (prefix === undefined) {
                prefix = '';
                const cls = this.getCustomClass(type);

                if (cls && !item.hammer && !item.pick && !item.accessory && !item.consumable) {
                    prefix = `[i:${CLASS_ICON[cls]}]`;
                } else if (item.melee) {
                    prefix = '[i:490]';
                } else if (item.magic) {
                    prefix = '[i:489]';
                } else if (item.ranged) {
                    prefix = '[i:491]';
                } else if (item.summon) {
                    prefix = '[i:2998]';
                }

                PREFIX_BY_TYPE.set(type, prefix);
            }

            return prefix === '' ? original(item) : prefix + original(item);
        });

        GUIPageIcons.DrawInventoryPage.hook((original, self) => {
            original(self);

            this.setCustomTranslation()
        });

        GUICraftGuidePopup.Draw.hook((original, self) => {
            original(self)

            this.setCustomTranslation()
        })

        // GUICrafting.DrawCraftButton.hook((original, self) => {
        //     original(self)

        //     if (!Terraria.Lang.tip?.[55]) return;
        //     if (this._tip55Original === null) this._tip55Original = Terraria.Lang.tip[55].Value;
        //     if (!this._originalTips[7]) {
        //         for (let i = 7; i < 14; i++) {
        //             this._originalTips[i] = Terraria.Lang.tip[i].Value;
        //         }
        //     }

        //     const hoverItem = Terraria.Main.HoverItem;
        //     const cls = this.getCustomClass(hoverItem);

        //     if (!cls) {
        //         Terraria.Lang.tip[55]['void SetValue(string text)'](this._tip55Original);

        //         for (let i = 7; i < 14; i++) {
        //             Terraria.Lang.tip[i]['void SetValue(string text)'](this._originalTips[i]);
        //         }

        //         return;
        //     }

        //     let newValueForDamage = this._tip55Original;
        //     let newValueForCrit;

        //     if (cls === 'healer') newValueForDamage = ModLocalization.Translate('ThoriumClasses.Tooltips.radiantDamage');
        //     if (cls === 'bard') newValueForDamage = ModLocalization.Translate('ThoriumClasses.Tooltips.symphonicDamage');
        //     if (cls === 'thrower') newValueForDamage = ModLocalization.Translate('ThoriumClasses.Tooltips.throwingDamage');

        //     if (cls && hoverItem.crit > 0) {
        //         const player = Terraria.Main.LocalPlayer;
        //         const crit = player.meleeCrit - player.inventory[player.selectedItem].crit + hoverItem.crit;
        //         newValueForCrit = `${crit}${Terraria.Lang.tip[5].Value}`
        //     }

        //     Terraria.Lang.tip[55]['void SetValue(string text)'](newValueForDamage);

        //     if (newValueForCrit) {
        //         for (let index = 7; index < 14; index++) {
        //             const original = this._originalTips[index];
        //             const aligned = original.padStart(
        //                 Math.max(original.length, newValueForCrit.length + 1),
        //                 " "
        //             );

        //             Terraria.Lang.tip[index]['void SetValue(string text)'](
        //                 `${newValueForCrit}\n${aligned}`
        //             );
        //         }
        //     }
        // })
    }
}