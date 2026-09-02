import { Modules } from '../../../TL/ModImports.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color } = Modules;

const CustomCurrencyManager = new NativeClass('Terraria.GameContent.UI', 'CustomCurrencyManager');
const CustomCurrencySingleCoin = new NativeClass('Terraria.GameContent.UI', 'CustomCurrencySingleCoin');

const CURRENCY_CAP = 999;
const TEXT_KEY = 'Others.VanquisherMedalCurrency';

const TEXT_R = 138;
const TEXT_G = 43;
const TEXT_B = 226;

export class VanquisherMedalCurrency {
    static CurrencyId = null;

    static Initialize(coinItemId) {
        if (VanquisherMedalCurrency.CurrencyId !== null) return;

        const currency = CustomCurrencySingleCoin.new();
        currency['void .ctor(int coinItemID, long currencyCap)'](coinItemId, BigInt(CURRENCY_CAP));
        currency.CurrencyTextKey = ModLocalization.Translate(TEXT_KEY);
        currency.CurrencyTextColor = Color.new(TEXT_R, TEXT_G, TEXT_B);

        VanquisherMedalCurrency.CurrencyId = CustomCurrencyManager.RegisterCurrency(currency);
    }
}
