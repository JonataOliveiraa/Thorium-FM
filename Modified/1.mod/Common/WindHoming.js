import { Terraria, Modules } from '../TL/ModImports.js';
import { ThoriumPlayer } from '../Content/Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const RANGE = 384;
const BASE_WEIGHT = 1 / 21;
const SPEED_WEIGHT_DIVISOR = 300;

const MAX_PROJ = Main.maxProjectiles ?? 1000;
const _initialSpeed = new Float32Array(MAX_PROJ);

export class WindHoming {
    static Reset(proj) {
        _initialSpeed[proj.whoAmI] = 0;
    }

    static Active() {
        return ThoriumPlayer.accMouthPiece === true;
    }

    static Apply(proj, speedOverride = 0) {
        const slot = proj.whoAmI;
        const velocity = proj.velocity;

        if (_initialSpeed[slot] === 0) {
            _initialSpeed[slot] = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        }

        const speed = speedOverride > 0 ? speedOverride : _initialSpeed[slot];
        if (speed <= 0) return false;

        const target = FindTargetWithinRange(proj, RANGE, true);
        if (!target) return false;

        const center = proj.Center;
        const targetCenter = target.Center;
        const dx = targetCenter.X - center.X;
        const dy = targetCenter.Y - center.Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) return false;

        const weight = Math.min(1, BASE_WEIGHT + speed / SPEED_WEIGHT_DIVISOR);
        const pull = speed / distance * weight;

        proj.velocity = Vector2.new(
            velocity.X * (1 - weight) + dx * pull,
            velocity.Y * (1 - weight) + dy * pull
        );

        return true;
    }
}
