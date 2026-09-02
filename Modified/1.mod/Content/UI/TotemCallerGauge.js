import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { UIDraw } from './UIDraw.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const SHEET_PATH = 'Textures/UI/ResourceBars/TotemCallerGauge_Sheet.png';
const ROWS = 5;
const OFFSET_Y = 30;
const FADE_FULL = 1.8;
const FADE_STEP = 0.01;

let _sheet = null;

export class TotemCallerGauge {
    static Sheet() {
        if (_sheet === null) {
            try {
                _sheet = tl.texture.load(SHEET_PATH);
            } catch (e) {
                _sheet = false;
            }
        }
        return _sheet || null;
    }

    static Update(player) {
        if (!ThoriumPlayer.totemCallerDisplay) {
            ThoriumPlayer.totemCallerFade = FADE_FULL;
            return;
        }
        if (ThoriumPlayer.totemCallerFade > 0) ThoriumPlayer.totemCallerFade -= FADE_STEP;
    }

    static Draw(player) {
        if (!ThoriumPlayer.totemCallerDisplay) return;
        if (player.dead || player.ghost) return;

        const sheet = TotemCallerGauge.Sheet();
        if (!sheet) return;

        const fade = Math.max(0, Math.min(1, ThoriumPlayer.totemCallerFade));
        if (fade <= 0) return;

        const frameHeight = (sheet.Height / ROWS) | 0;
        const bottom = player.Bottom;
        const screen = Main.screenPosition;

        const x = Math.floor(bottom.X - screen.X - sheet.Width * 0.5);
        const y = Math.floor(bottom.Y - screen.Y + OFFSET_Y + player.gfxOffY);

        const dest = Rectangle.new(x, y, sheet.Width, frameHeight);
        const color = Color.Multiply(Microsoft.Xna.Framework.Graphics.Color.White, fade);

        const idle = Rectangle.new(0, 0, sheet.Width, frameHeight);
        UIDraw.RectangleFramed(sheet, dest, idle, color);

        const stage = ThoriumPlayer.totemCallerStage;
        const active = Rectangle.new(0, frameHeight * (stage + 1), sheet.Width, frameHeight);
        UIDraw.RectangleFramed(sheet, dest, active, color);
    }
}
