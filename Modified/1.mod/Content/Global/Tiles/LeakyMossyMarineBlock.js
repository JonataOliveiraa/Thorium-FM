import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMossyMarineBlock extends GlobalTile {
    Type = Terraria.ID.TileID.TeamBlockYellow;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(105, 160, 165);
        
        Terraria.Main.tileMergeDirt[this.Type] = true;
    }

    static InjectTexture() {
        const TeamBlockYellowTile = Terraria.ID.TileID.TeamBlockYellow;
        const TeamBlockYellowItem = Terraria.ID.ItemID.TeamBlockYellow;

        const leakyMossyMarineItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockYellow/LeakyMossyMarineBlock_Item.png");
        const leakyMossyMarineTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockYellow/LeakyMossyMarineBlock_Tile.png");

        if (leakyMossyMarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[TeamBlockYellowTile] = true
            Terraria.GameContent.TextureAssets.Tile[TeamBlockYellowTile].Value = leakyMossyMarineTileTexture;
        }

        if (leakyMossyMarineItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[TeamBlockYellowItem].Value = leakyMossyMarineItemTexture;
        }
    }
}