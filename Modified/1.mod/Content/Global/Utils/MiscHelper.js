import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Point } from "../../../TL/Modules/Point.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";

const { Main } = Terraria;
const { WorldGen, Framing, Collision } = Terraria;

const InWorld_IntInt = WorldGen['bool InWorld(int x, int y, int fluff)'];
const GetTileSafely = Framing['Tile GetTileSafely(int i, int j)'];
const SolidCollision = Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

export class MiscHelper {
    static TenToRoman(number) {
        const map = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X" };
        return map[number] || "";
    }

    static ToTicks(minutes = 0, seconds = 0) {
        return minutes * 60 * 60 + seconds * 60;
    }

    static Log(message) {
        tl.log(message.toString());
    }

    static SolidTile(tile) {
        return tile['bool active()']() && !tile['bool inActive()']() && Main.tileSolid[tile.type] && !Main.tileSolidTop[tile.type];
    }

    static SolidOrSolidTopTile(tile) {
        return tile['bool active()']() && !tile['bool inActive()']() && (Main.tileSolid[tile.type] || Main.tileSolidTop[tile.type]);
    }

    static SolidTileAt(i, j) {
        if (!InWorld_IntInt(i, j, 0)) return false;
        return MiscHelper.SolidTile(Main.tile.get_Item(i, j));
    }

    static SolidOrSolidTopTileAt(i, j) {
        if (!InWorld_IntInt(i, j, 0)) return false;
        return MiscHelper.SolidOrSolidTopTile(Main.tile.get_Item(i, j));
    }

    static CanHitLine(startX, startY, endX, endY) {
        if (!InWorld_IntInt(startX, startY, 0) || !InWorld_IntInt(endX, endY, 0)) return false;
        if (MiscHelper.SolidTileAt(startX, startY)) return false;

        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const stepX = endX > startX ? 1 : -1;
        const stepY = endY > startY ? 1 : -1;
        let err = 0;
        let x = startX;
        let y = startY;

        while (x !== endX || y !== endY) {
            const err2 = 2 * (err + dy) - dx;
            if (err2 > 0 || (err2 === 0 && stepX > 0)) {
                err -= dx;
                y += stepY;
            } else {
                err += dy;
                x += stepX;
            }
            if (MiscHelper.SolidTileAt(x, y)) return false;
            if (MiscHelper.SolidTileAt(x - stepX, y) || MiscHelper.SolidTileAt(x, y - stepY)) return false;
        }
        return true;
    }

    static CanHitLineWorld(pos1, pos2) {
        const start = pos1.ToTileCoordinates();
        const end = pos2.ToTileCoordinates();
        return MiscHelper.CanHitLine(start.X, start.Y, end.X, end.Y);
    }

    static IsOnStandableGround(startX, y, width, onlySolid = false) {
        let x = startX;
        while (x < startX + width) {
            const tilePos = Point.new(Math.floor(x / 16), Math.floor((y + 0.01) / 16));
            if (onlySolid) {
                if (MiscHelper.SolidTileAt(tilePos.X, tilePos.Y)) return true;
            } else {
                if (MiscHelper.SolidOrSolidTopTileAt(tilePos.X, tilePos.Y)) return true;
            }
            x += 16;
        }
        return false;
    }

    static DistanceSQ(rect, point) {
        if (point.X >= rect.X && point.X <= rect.X + rect.Width &&
            point.Y >= rect.Y && point.Y <= rect.Y + rect.Height) {
            return 0;
        }
        if (point.X >= rect.X && point.X <= rect.X + rect.Width) {
            return point.Y < rect.Y ? (rect.Y - point.Y) ** 2 : (point.Y - rect.Y - rect.Height) ** 2;
        }
        if (point.Y >= rect.Y && point.Y <= rect.Y + rect.Height) {
            return point.X < rect.X ? (rect.X - point.X) ** 2 : (point.X - rect.X - rect.Width) ** 2;
        }
        const cornerX = point.X < rect.X ? rect.X : rect.X + rect.Width;
        const cornerY = point.Y < rect.Y ? rect.Y : rect.Y + rect.Height;
        return (point.X - cornerX) ** 2 + (point.Y - cornerY) ** 2;
    }

    static ModifyVelocityForGravity(position, targetPos, gravity, velocity, ticksWithoutGravity = 0, terminalCap = 16, factor = 1, offsetCap = 2.5) {
        const dx = targetPos.X - position.X;
        const num1 = Math.abs(Math.floor(dx / velocity.X));
        let sumWithGravity = 0;
        let sumWithout = 0;
        let velY = velocity.Y;
        for (let i = 0; i < num1; i++) {
            if (i >= ticksWithoutGravity) {
                velY += gravity;
                if (velY > terminalCap) velY = terminalCap;
            }
            sumWithGravity += velY;
            sumWithout += velocity.Y;
        }
        const num5 = Math.min((sumWithGravity - sumWithout) / num1, offsetCap);
        velocity.Y -= factor * num5;
    }

    static ModifyPositionForUnstuckTowardsOrigin(origin, desiredPosition) {
        const dir = desiredPosition['Vector2 DirectionTo(Vector2 Target)'](origin);
        if (dir['float Length()']() === 0) return;

        const size = Vector2.new(16, 16);
        let checkPos = Vector2.new(desiredPosition.X - size.X / 2, desiredPosition.Y - size.Y / 2);
        while (SolidCollision(checkPos, size.X, size.Y)) {
            checkPos.X += dir.X * 8;
            checkPos.Y += dir.Y * 8;
            if (Vector2['float DistanceSquared(Vector2 value1, Vector2 value2)'](checkPos, origin) < 256) {
                desiredPosition.X = origin.X;
                desiredPosition.Y = origin.Y;
                return;
            }
        }
        desiredPosition.X = checkPos.X + size.X / 2;
        desiredPosition.Y = checkPos.Y + size.Y / 2;
    }

    static ThoriumChatMessage(key, color, ...substitutions) {
        const fullKey = `Mods.ThoriumMod.Announcements.${key}`;
        const text = substitutions.length > 0
            ? ModLocalization.Translate(fullKey).replace(/\{(\d+)\}/g, (_, i) => substitutions[i] || "")
            : ModLocalization.Translate(fullKey);
        Main.NewText(text, color.R, color.G, color.B);
    }
}