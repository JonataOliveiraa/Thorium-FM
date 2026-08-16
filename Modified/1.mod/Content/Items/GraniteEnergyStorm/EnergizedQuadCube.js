import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const PET_DURATION = 18000;

export class EnergizedQuadCube extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.damage = 0;
        this.Item.noMelee = true;
        // O `master` do original nao existe neste binding de Item (so' `expert` /
        // `expertOnly`), e serve apenas para o rotulo "Master Mode" no tooltip.
        // Sem ele o item funciona igual; a raridade abaixo mantem a leitura visual.
        // useStyle 4 = HoldUp, o gesto padrao de invocar mascote.
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.UseSound = Terraria.ID.SoundID.NPCHit3;
        this.Item.value = Terraria.Item.sellPrice(0, 5, 0, 0);
        // -13 = Master (arco-iris). Literal em vez de ItemRarityID.Master porque
        // esse nome nao esta em uso em nenhum outro ponto do projeto.
        this.Item.rare = -13;

        this.Item.shoot = ModProjectile.getTypeByName('EnergizedQuadCubePro');
        this.Item.buffType = ModBuff.getTypeByName('EnergizedQuadCubeBuff');
    }

    UseItem(item, player) {
        player.AddBuff(item.buffType, PET_DURATION, false);
    }
}
