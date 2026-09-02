import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

const VALUE_CUT = 0.02;
const DROP_THRESHOLD = 100;

const COINS = [
    { value: 1000000, type: Terraria.ID.ItemID.PlatinumCoin },
    { value: 10000, type: Terraria.ID.ItemID.GoldCoin },
    { value: 100, type: Terraria.ID.ItemID.SilverCoin },
    { value: 1, type: Terraria.ID.ItemID.CopperCoin }
];

export class TrackersSkinningBlade extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.melee = true;
        this.SetWeaponValues(16, 5, 4);
        this.Item.useTime = 18;
        this.Item.useAnimation = 18;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.autoReuse = true;
        this.Item.useTurn = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    OnHitNPC(item, player, npc, damageDone, knockBack, crit) {
        if (npc.boss) return;

        ThoriumPlayer.skinningBladeMoney += npc.value * VALUE_CUT;
        if (ThoriumPlayer.skinningBladeMoney < DROP_THRESHOLD) return;

        let remaining = Math.floor(ThoriumPlayer.skinningBladeMoney);
        ThoriumPlayer.skinningBladeMoney -= remaining;

        const center = npc.Center;
        for (const coin of COINS) {
            const amount = Math.floor(remaining / coin.value);
            if (amount <= 0) continue;
            remaining -= amount * coin.value;
            NewItem(center.X, center.Y, npc.width, npc.height, coin.type, amount, false, 0, false);
        }
    }
}
