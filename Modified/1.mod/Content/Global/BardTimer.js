import { Terraria, Modules } from "../../TL/ModImports.js";
import { Effects } from "../../TL/Modules/Effects.js";

const { Main } = Terraria;
const { Vector2, Color } = Modules;
const SpriteFrame = new NativeClass('Terraria.DataStructures', 'SpriteFrame');

export class BardTimer {
    static MinAngle = -Math.PI / 2;      // -90°
    static MaxAngle = Math.PI / 2;       // +90°
    static ZoneBoundary = 0;             // 0° = linha divisória

    static SwingSpeed = 0.06;
    static VerticalOffset = 25;
    static PointerYOffset = -12;

    static LeftZoneIsActive = true;
    static InvertZoneLogic = false;

    static Sheet = null;
    static PointerSheet = null;

    static Active = false;
    static Style = null;

    static CurrentAngle = 0;
    static PreviousAngle = 0;

    static SwingDirection = 1;

    static CurrentZone = 'left';
    static PreviousZone = 'left';

    static _pos = Vector2.new(0, 0);
    static _pointerPos = Vector2.new(0, 0);
    static _originArc = Vector2.new(0, 0);
    static _originPointer = Vector2.new(0, 0);

    static _arcOrigins = {};
    static _spriteFrame = null;

    static Initialize() {
        if (!BardTimer.Sheet) {
            BardTimer.Sheet = tl.texture.load('Textures/UI/Bard/BardTimer_Sheet.png');
        }
        if (!BardTimer.PointerSheet) {
            BardTimer.PointerSheet = tl.texture.load('Textures/UI/Bard/BardTimer_Sheet2.png');
        }
        if (!BardTimer._spriteFrame) {
            BardTimer._spriteFrame = SpriteFrame.new();
            BardTimer._spriteFrame['void .ctor(byte columns, byte rows)'](5, 6);
        }
        if (BardTimer.PointerSheet) {
            BardTimer._originPointer.X = BardTimer.PointerSheet.Width / 2;
            BardTimer._originPointer.Y = BardTimer.PointerSheet.Height / 2;
        }
    }

    static GetArcOrigin(row) {
        if (!BardTimer._arcOrigins[row]) {
            const sprite = SpriteFrame.new();
            sprite['void .ctor(byte columns, byte rows)'](5, 6);
            sprite.CurrentColumn = 0;
            sprite.CurrentRow = row;
            const frame = sprite.GetSourceRectangle(BardTimer.Sheet);
            BardTimer._arcOrigins[row] = {
                X: frame.Width / 2,
                Y: frame.Height / 2
            };
        }
        return BardTimer._arcOrigins[row];
    }

    static GetCurrentZone() {
        return BardTimer.CurrentAngle > BardTimer.ZoneBoundary ? 'left' : 'right';
    }

    static IsInActiveZone() {
        const zone = BardTimer.GetCurrentZone();
        let result = BardTimer.LeftZoneIsActive ? (zone === 'left') : (zone === 'right');

        if (BardTimer.InvertZoneLogic) {
            result = !result;
        }

        return result;
    }

    static Start(style) {
        BardTimer.Initialize();
        BardTimer.Style = style;
        BardTimer.Active = true;
        BardTimer.CurrentAngle = BardTimer.MinAngle;
        BardTimer.PreviousAngle = BardTimer.MinAngle;
        BardTimer.SwingDirection = 1;

        BardTimer.CurrentZone = BardTimer.GetCurrentZone();
        BardTimer.PreviousZone = BardTimer.CurrentZone;

        BardTimer.GetArcOrigin(3);
    }

    static Stop() {
        BardTimer.Active = false;
        BardTimer.Style = null;
    }

    static Update() {
        if (!BardTimer.Active) return;

        BardTimer.PreviousAngle = BardTimer.CurrentAngle;
        BardTimer.PreviousZone = BardTimer.CurrentZone;

        BardTimer.CurrentAngle += BardTimer.SwingSpeed * BardTimer.SwingDirection;

        if (BardTimer.CurrentAngle >= BardTimer.MaxAngle) {
            BardTimer.CurrentAngle = BardTimer.MaxAngle;
            BardTimer.SwingDirection = -1;
        } else if (BardTimer.CurrentAngle <= BardTimer.MinAngle) {
            BardTimer.CurrentAngle = BardTimer.MinAngle;
            BardTimer.SwingDirection = 1;
        }

        BardTimer.CurrentZone = BardTimer.GetCurrentZone();
    }

    static Draw(player) {
        if (!BardTimer.Active) return;

        const worldX = player.Center.X;
        const worldY = player.position.Y + player.height + BardTimer.VerticalOffset;

        BardTimer._pos.X = worldX - Main.screenPosition.X;
        BardTimer._pos.Y = worldY - Main.screenPosition.Y;

        const scale = 1.0 / Main.UIScale;
        const row = 3;

        BardTimer.DrawArc(row, scale, 0);

        if (BardTimer.IsInActiveZone()) {
            BardTimer.DrawArc(row, scale, 1);
        }

        BardTimer._pointerPos.X = BardTimer._pos.X;
        BardTimer._pointerPos.Y = BardTimer._pos.Y + BardTimer.PointerYOffset;
        BardTimer.DrawPointer(scale);
    }

    static DrawArc(row, scale, column) {
        BardTimer._spriteFrame.CurrentColumn = column;
        BardTimer._spriteFrame.CurrentRow = row;
        const frame = BardTimer._spriteFrame.GetSourceRectangle(BardTimer.Sheet);

        const origin = BardTimer.GetArcOrigin(row);
        BardTimer._originArc.X = origin.X;
        BardTimer._originArc.Y = origin.Y;

        Main.spriteBatch[
            "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
        ](BardTimer.Sheet, BardTimer._pos, frame, Color.White, 0, BardTimer._originArc, scale, null, 0.0);
    }

    static DrawPointer(scale) {
        const rotation = BardTimer.CurrentAngle - Math.PI / 4 + Math.PI / 2;

        Main.spriteBatch[
            "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
        ](BardTimer.PointerSheet, BardTimer._pointerPos, null, Color.White, rotation, BardTimer._originPointer, scale, null, 0.0);
    }

    static GetAngleInDegrees() {
        return (BardTimer.CurrentAngle * 180) / Math.PI;
    }

    static GetDebugInfo() {
        return {
            active: BardTimer.Active,
            angleRadians: BardTimer.CurrentAngle.toFixed(3),
            angleDegrees: BardTimer.GetAngleInDegrees().toFixed(1),
            currentZone: BardTimer.CurrentZone,
            previousZone: BardTimer.PreviousZone,
            isInActiveZone: BardTimer.IsInActiveZone(),
            swingDirection: BardTimer.SwingDirection === 1 ? 'RIGHT →' : 'LEFT ←',
            zoneLayout: BardTimer.LeftZoneIsActive ? 'Esquerda AZUL, Direita AMARELA' : 'Esquerda AMARELA, Direita AZUL',
            invertZoneLogic: BardTimer.InvertZoneLogic
        };
    }
}