import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Microsoft, Terraria } from "../../../TL/ModImports.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";
import { Empowerments } from "../Empowerments.js";
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { BardTimer } from "../BardTimer.js";
import { Profiler } from "../../../Profiler.js";
import { ModItem } from "../../../TL/ModItem.js";
import { WorldDB } from "../../../TL/WorldDB.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

const { Main } = Terraria;
const LegacyPlayerRenderer = new NativeClass("Terraria.Graphics.Renderers", "LegacyPlayerRenderer");

let _cachedBardItem = null;
let _cachedHeldType = -1;

function getCachedBardItem(player) {
  const type = player.HeldItem?.type ?? -1;
  if (type !== _cachedHeldType) {
    _cachedHeldType = type;
    _cachedBardItem = ModBardItem.bardItemsName.has(type)
      ? ModBardItem.getModItem(type)
      : null;
  }
  return _cachedBardItem;
}

export class DrawWorldCursor extends GlobalHooks {
  Initialize() {
    Main["void DrawInterface_14_EntityHealthBars()"].hook((original, self) => {
      original(self);
      const player = Main.player[Main.myPlayer];
      const bardItem = getCachedBardItem(player);

      if (bardItem?.useWheel) {
        ThoriumPlayer.BardWheel();
      }
    });

    Main["void DrawRain()"].hook((original, self) => {
      if (self === null) self = Main.instance;
      original(self);
    });

    LegacyPlayerRenderer["void DrawPlayerFull(Camera camera, Player drawPlayer)"].hook(
      (original, self, camera, drawPlayer) => {
        const player = Main.player[Main.myPlayer];
        const bardItem = getCachedBardItem(player);

        if (drawPlayer?.whoAmI === Main.myPlayer) {
          Empowerments.DrawIcons(true);
        }
        if (bardItem?.useTimer) {
          BardTimer.Draw(player);
        }

        if (ThoriumPlayer.IsHoldingGrimPointer) {
          const GrimPointer = ModItem.getByName('GrimPointer');
          const pointerTexture = GrimPointer?.BatCavePointerTexture;
          const pos =  GrimPointer?.BloodChamberPos

          if (pointerTexture && pos) {
            const targetX = pos.X;
            const targetY = pos.Y;

            tl.log(targetX)
            tl.log(targetY)

            const playerPos = player.Center;
            const deltaX = targetX - playerPos.X;
            const deltaY = targetY - playerPos.Y;
            const rotation = Math.atan2(deltaY, deltaX);

            const offsetY = -player.height * 0.7;
            const worldX = player.Center.X;
            const worldY = player.position.Y + offsetY;

            const screenX = worldX - Main.screenPosition.X;
            const screenY = worldY - Main.screenPosition.Y;

            const origin = Vector2.new(pointerTexture.Width / 2, pointerTexture.Height / 2);
            const drawPos = Vector2.new(screenX, screenY);

            Main.spriteBatch[
              "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
            ](pointerTexture, drawPos, null, Color.White, rotation, origin, 1.0, Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0);
          }
        }

        original(self, camera, drawPlayer);

        if (drawPlayer?.whoAmI === Main.myPlayer) {
          Empowerments.DrawIcons(false);
        }
      }
    );
  }
}