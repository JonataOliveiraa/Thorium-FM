import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

const { BuffID } = Terraria.ID;

const VANILLA_DEBUFFS = [
    BuffID.Bleeding,
    BuffID.BrokenArmor,
    BuffID.Chilled,
    BuffID.Confused,
    BuffID.Cursed,
    BuffID.Darkness,
    BuffID.Frozen,
    BuffID.Ichor,
    BuffID.Silenced,
    BuffID.Slow,
    BuffID.Stoned,
    BuffID.Weak,
    BuffID.Webbed
];

const MOD_DEBUFFS = ['Staggered', 'Liquefied'];

let _modTypes = null;

export class CactusFruitBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/CactusFruitBuff';
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = false;
        Terraria.Main.buffNoTimeDisplay[this.Type] = false;
    }

    UpdatePlayer(player, buffIndex) {
        if (!player || !player.active) return;

        for (const id of VANILLA_DEBUFFS) {
            if (id > 0) player.buffImmune[id] = true;
        }

        if (_modTypes === null) {
            _modTypes = MOD_DEBUFFS.map(name => ModBuff.getTypeByName(name) ?? -1);
        }

        for (const id of _modTypes) {
            if (id > 0) player.buffImmune[id] = true;
        }
    }
}
