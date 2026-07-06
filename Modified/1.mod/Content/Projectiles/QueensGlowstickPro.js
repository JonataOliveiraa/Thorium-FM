// QueenGlowstickPro.js
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { QueensGlowstick } from '../Items/QueenJellyfish/QueensGlowstick.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class QueensGlowstickPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = 14;
        this.Projectile.timeLeft = 1800;
        this.Projectile.netImportant = true;
        this.AIType = 50;
    }

    GetAlpha(proj, lightColor) {
        return Color.new(255, 255, 255, Math.floor(0.01 * proj.timeLeft));
    }

    OnTileCollide(proj, oldVelocity) {
        return false;
    }

    AI(proj) {
        const center = proj.Center;
        const glowColor = QueensGlowstick.GetGlowColor();
        const r = glowColor.R / 255;
        const g = glowColor.G / 255;
        const b = glowColor.B / 255;
        Terraria.Lighting['void AddLight(Vector2 position, float r, float g, float b)'](center, r, g, b);
    }
}