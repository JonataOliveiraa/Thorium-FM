import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { UIDraw } from './UIDraw.js';

const { Rectangle } = Modules;
const { Main } = Terraria;

const COLOR_WHITE = Microsoft.Xna.Framework.Graphics.Color.White;
const PlaySound = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];

const CONTAINS = 'bool Contains(int x, int y)';
const CLICK_SOUND = 12;
const CLICKED_TIME = 10;

export class ModButton {
    static Buttons = [];
    static ClickedButtons = [];
    static Time = 0;

    constructor() {
        this.Area = Rectangle.new();
        this.Hovered = false;
        this.Pressed = false;
        this.Clicked = false;
        this.LastClicked = 0;
        ModButton.Buttons.push(this);
    }

    Clear() {
        this.Hovered = this.Pressed = this.Clicked = false;
        this.LastClicked = 0;
    }

    GetColor() {
        return COLOR_WHITE;
    }

    GetTexture() {
        return null;
    }

    GetIconTexture() {
        return null;
    }

    ClickSound() {
        return CLICK_SOUND;
    }

    OnClick() {

    }

    Draw(rect) {
        const texture = this.GetTexture();
        if (!texture) return;

        const color = this.GetColor();
        UIDraw.Rectangle(texture, rect, color);

        const icon = this.GetIconTexture();
        if (icon) UIDraw.Rectangle(icon, rect, color);
    }

    static ClearAll() {
        ModButton.ClickedButtons = [];
        for (const button of ModButton.Buttons) button.Clear();
    }

    static Update() {
        const still = [];
        for (const button of ModButton.ClickedButtons) {
            if (ModButton.Time - button.LastClicked >= CLICKED_TIME) {
                button.Clicked = false;
                continue;
            }
            still.push(button);
        }
        ModButton.ClickedButtons = still;
    }

    static UpdateButton(button, rect) {
        button.Hovered = !button.Clicked && rect[CONTAINS](Main.mouseX, Main.mouseY);

        if (Main.mouseLeft && Main.mouseLeftRelease && !button.Pressed && !button.Clicked && button.Hovered) {
            button.Pressed = true;
            return;
        }

        if (Main.mouseLeftRelease && button.Pressed) {
            button.Pressed = false;
            if (button.Hovered) ModButton.Press(button);
        }
    }

    static Press(button) {
        const sound = button.ClickSound();
        if (sound !== null) PlaySound(sound, Main.LocalPlayer.Center, 1, 0);

        button.OnClick();

        button.Pressed = false;
        button.Clicked = true;
        button.LastClicked = ModButton.Time;
        ModButton.ClickedButtons.push(button);
    }
}
