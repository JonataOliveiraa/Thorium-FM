import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

export class Spoon extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 46;
        this.Item.melee = true;
        this.Item.damage = 15;
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = 1;
        this.Item.knockBack = 8;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
    
    OnHitNPC(item, player, npc, damageDone, knockBack, crit) {
        if (npc.life > 0 || npc.value <= 0) return;
        NewItem(npc.position.X, npc.position.Y, npc.width, npc.height, ModItem.getTypeByName('MeatSlab'), 1, false, 0, false);
    }
}