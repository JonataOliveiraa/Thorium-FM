import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Rand, Vector2 } = Modules;

export class ObsidianScale extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.accessory = true;
        this.Item.rare = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.defense = 2;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        player.fireWalk = true;
        ThoriumPlayer.accReducedKnockback = true;
        const npcArr = Terraria.Main.npc, maxNPCs = Terraria.Main.maxNPCs;
        const index2 = 323;
        for (let index1 = 0; index1 < maxNPCs; index1++) {
            const npc = npcArr[index1];
            if (npc.CanBeChasedBy(null, false) && player.DistanceSQ(npc.Center) < 30625.0) {
                if (!npc.wet && !npc.buffImmune[index2] && npc.FindBuffIndex(index2) < 0) {
                    const dustArr = Terraria.Main.dust;
                    for (let index3 = 0; index3 < 15; index3++) {
                        const index4 = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 174, 0.0, 0.0, 125, null, 1.35);
                        const dust = dustArr[index4];
                        dust.noGravity = true;
                        dust.velocity = Vector2.Multiply(dust.velocity, 0.75);
                        let num1 = Rand.Next(-50, 51), num2 = Rand.Next(-50, 51);
                        dust.position = Vector2.new(dust.position.X + num1, dust.position.Y + num2);
                        dust.velocity = Vector2.new(-(num1 * 0.075000002980232239), -(num2 * 0.075000002980232239));
                    }
                }
                npc.AddBuff(index2, 30, false);
            }
        }
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('BlacksmithsBarrierShield'))
        .AddIngredient(193)
        .AddIngredient(ModItem.getTypeByName('MoltenScale'))
        .AddTile(114)
        .Register();
    }
}