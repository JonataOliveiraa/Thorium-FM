import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const Utils = Terraria.Utils;
const FontAssets = Terraria.GameContent.FontAssets;
const LayoutCalculator = new NativeClass('', 'LayoutCalculator');

const SPRITE_NONE = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;
const COLOR_BLACK = Microsoft.Xna.Framework.Graphics.Color.Black;
const COLOR_WHITE = Microsoft.Xna.Framework.Graphics.Color.White;

const DRAW_RECT = 'void Draw(Texture2D texture, Rectangle destinationRectangle, Color color)';
const DRAW_RECT_SRC = 'void Draw(Texture2D texture, Rectangle destinationRectangle, Nullable`1 sourceRectangle, Color color)';
const DRAW_STRING = 'void DrawString(SpriteFont spriteFont, string text, Vector2 position, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const BORDER_STRING = 'void DrawBorderStringFourWay(SpriteBatch sb, SpriteFont font, string text, float x, float y, Color textColor, Color borderColor, Vector2 origin, float scale)';
const INV_BG = 'void DrawInvBG(SpriteBatch sb, Rectangle R, Color c)';
const MEASURE = 'Vector2 MeasureString(string text)';

export class UIDraw {
    static GetAnchoredPosition(anchorControl, anchor, location) {
        return LayoutCalculator.GetAnchoredPosition(anchorControl, anchor, location);
    }

    static InvBG(rect, color) {
        Utils[INV_BG](Main.spriteBatch, rect, color);
    }

    static Rectangle(texture, rectangle, color) {
        Main.spriteBatch[DRAW_RECT](texture, rectangle, color);
    }

    static RectangleFramed(texture, destRectangle, sourceRectangle, color) {
        Main.spriteBatch[DRAW_RECT_SRC](texture, destRectangle, sourceRectangle, color);
    }

    static Font() {
        return FontAssets.MouseText.Value;
    }

    static StringSize(text) {
        return UIDraw.Font()[MEASURE](text);
    }

    static String(text, position, color = COLOR_WHITE, scale = 1) {
        Main.spriteBatch[DRAW_STRING](
            UIDraw.Font(), text, position, color, 0, Vector2.Zero, scale, SPRITE_NONE, 0
        );
    }

    static BorderString(text, position, color = COLOR_WHITE, scale = 1) {
        Utils[BORDER_STRING](
            Main.spriteBatch, UIDraw.Font(), text, position.X, position.Y,
            color, COLOR_BLACK, Vector2.Zero, scale
        );
    }

    static BorderStringCentered(text, position, color = COLOR_WHITE, scale = 1) {
        const size = UIDraw.StringSize(text);
        const origin = Vector2.new(size.X * 0.5, size.Y * 0.5);
        Utils[BORDER_STRING](
            Main.spriteBatch, UIDraw.Font(), text, position.X, position.Y,
            color, COLOR_BLACK, origin, scale
        );
    }
}
