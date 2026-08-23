import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

export class Knife extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 46;
        this.Item.height = 48;
        this.Item.melee = true;
        this.Item.damage = 18;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = 1;
        this.Item.knockBack = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
    
    OnHitNPC(item, player, npc, damageDone, knockBack, crit) {
        if (npc.life > 0 || npc.value <= 0) return;
        NewItem(npc.position.X, npc.position.Y, npc.width, npc.height, ModItem.getTypeByName('MeatSlab'), 1, false, 0, false);
    }
}