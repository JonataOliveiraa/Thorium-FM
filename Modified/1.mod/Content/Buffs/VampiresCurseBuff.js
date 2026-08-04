import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModMount } from '../../TL/ModMount.js';

const { Main } = Terraria;

const MAX_TIME = 600;        // 10s de morcego
const DAMAGE_TAKEN = 0.25;   // 25% de dano a mais enquanto transformado

let _mountType = -1;
let _timer = 0;

function mountType() {
    if (_mountType === -1) _mountType = ModMount.getTypeByName('VampiresCurseMount') ?? -1;
    return _mountType;
}

function isTransformed(player) {
    const type = mountType();
    return type >= 0 && player.mount && player.mount.Active && player.mount.Type === type;
}

/**
 * Transforma o jogador num morcego indefeso: sem itens, sem gancho, sem
 * desmontar. So resta voar e fugir ate passar.
 *
 * A contagem e feita aqui (_timer) e nao pelo buffTime: enquanto a montaria
 * esta ativa a vanilla reaplica o buff dela toda hora, entao o buffTime nunca
 * chegaria a zero e o jogador ficaria morcego pra sempre.
 */
export class VampiresCurseBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.debuff[this.Type] = true;
        Main.buffNoSave[this.Type] = true;
        Terraria.ID.BuffID.Sets.NurseCannotRemoveDebuff[this.Type] = true;
    }

    // Reaplicacoes vindas da propria montaria nao renovam a maldicao
    ApplyPlayer(player, buffTime) {
        if (isTransformed(player)) return;
        _timer = MAX_TIME;
    }

    ReApplyPlayer(player, buffTime, buffIndex) {
        if (!isTransformed(player)) _timer = MAX_TIME;
        return true;
    }

    UpdatePlayer(player, buffIndex) {
        const type = mountType();
        if (_timer <= 0) _timer = MAX_TIME;

        if (--_timer <= 0) {
            this._end(player);
            return;
        }

        player.buffTime[buffIndex] = _timer;
        if (type >= 0) player.mount.SetMount(type, player, false);

        try { player['void RemoveAllGrapplingHooks()'](); } catch (_) { }

        player.endurance -= DAMAGE_TAKEN;
        player.slowFall = true;

        player.controlUseItem = false;
        player.controlHook = false;
        player.controlMount = false;
        player.releaseMount = false;
        player.controlQuickHeal = false;
        player.controlQuickMana = false;
    }

    _end(player) {
        _timer = 0;
        try { player.mount.Dismount(player, false); } catch (_) { }
        try { player.ClearBuff(this.Type); } catch (_) { }
    }

    OnRemove(player, buffTime, buffIndex) {
        _timer = 0;
        if (isTransformed(player)) {
            try { player.mount.Dismount(player, false); } catch (_) { }
        }
    }
}
