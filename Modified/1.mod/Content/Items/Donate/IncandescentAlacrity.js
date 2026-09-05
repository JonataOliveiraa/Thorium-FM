import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const RUN_ACCELERATION = 0.25;
const JUMP_BOOST = 2.5;
const FALL_SPEED_MULTIPLIER = 2.5;
const FALL_SPEED_MULTIPLIER_WET = 2.25;
const FALL_ACCELERATION = 0.2;

export class IncandescentAlacrity extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 7, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.accIncandescentAlacrity = true;
        player.noFallDmg = true;
        player.runAcceleration += RUN_ACCELERATION;
        player.jumpSpeedBoost = JUMP_BOOST;

        if (!player.controlDown || player.controlUp) return;

        player.maxFallSpeed *= player.wet ? FALL_SPEED_MULTIPLIER_WET : FALL_SPEED_MULTIPLIER;

        const velocity = player.velocity;
        if (velocity.Y >= player.maxFallSpeed) return;
        if (MiscHelper.IsOnStandableGround(player.position.X, player.position.Y + player.height, player.width)) return;

        velocity.Y += FALL_ACCELERATION;
        player.velocity = velocity;
    }
}
