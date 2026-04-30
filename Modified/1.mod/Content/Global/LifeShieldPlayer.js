import { Microsoft, Terraria } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { ModTexture } from "../../TL/ModTexture.js";
import { Color } from "../../TL/Modules/Color.js";
import { Rectangle } from "../../TL/Modules/Rectangle.js";
import { TextureReplace } from "./Hooks/TextureReplace.js";

export class LifeShieldPlayer extends ModPlayer {
    constructor() {
        super();
    }

    static MaxExtraLife = null
    static HealValue = 1
    static TimeDelay = 0
    static MaxTimeDelay = 120

    static Default_Heart
    static Default_Heart2
    static Default_HeartFancy
    static Default_HeartFancy2
    static Default_BarHeart
    static Default_BarHeart2

    static Heart_Shield_Texture;
    static Heart2_Shield_Texture;
    static BarHeart_Shield_Texture;
    static BarHeart2_Shield_Texture;

    static Active = false
    static isDefault = true

    ResetEffects(player) {
        LifeShieldPlayer.Active = false
    }

    static SaveDefaultTextures() {
        this.Default_Heart = Terraria.GameContent.TextureAssets.Heart
        this.Default_Heart2 = Terraria.GameContent.TextureAssets.Heart
        this.Default_HeartFancy = Terraria.GameContent.TextureAssets.FancyHeart
        this.Default_HeartFancy2 = Terraria.GameContent.TextureAssets.FancyHeart2

        this.Default_BarHeart= Terraria.GameContent.TextureAssets.BarHeart
        this.Default_BarHeart2 = Terraria.GameContent.TextureAssets.BarHeart2
    }

    static HealPlayer(player, amount) {
    const location = Rectangle.new(
            Math.floor(player.position.X),
            Math.floor(player.position.Y),
            player.width,
            player.height
        );

        Terraria.CombatText['int NewText(Rectangle location, Color color, int amount, bool dramatic, bool dot)'](
            location, Color.Aqua, amount, false, false
        );
        player.statLife += amount
    }

    static LoadTextures() {
        LifeShieldPlayer.Heart_Shield_Texture = new ModTexture('Textures/UI/Health/Health_Shield').asset.asset
        LifeShieldPlayer.Heart2_Shield_Texture = new ModTexture('Textures/UI/Health/Health2_Shield').asset.asset
        LifeShieldPlayer.BarHeart_Shield_Texture = new ModTexture('Textures/UI/Health/BarHeart_Shield').asset.asset
        LifeShieldPlayer.BarHeart2_Shield_Texture = new ModTexture('Textures/UI/Health/BarHeart2_Shield').asset.asset
    }

    PreUpdate(player) {
        if (LifeShieldPlayer.Active) {
            Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Heart_Shield_Texture
            Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Heart2_Shield_Texture
            Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Heart_Shield_Texture
            Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Heart2_Shield_Texture

            Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.BarHeart_Shield_Texture
            Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.BarHeart2_Shield_Texture
            
            LifeShieldPlayer.isDefault = false

            if(player.statLife === player.statLifeMax2) return;
            
            LifeShieldPlayer.TimeDelay++

            if(LifeShieldPlayer.MaxTimeDelay <= LifeShieldPlayer.TimeDelay) {
                LifeShieldPlayer.TimeDelay = 0
                LifeShieldPlayer.HealPlayer(player, LifeShieldPlayer.HealValue)
            }
        } else if(!LifeShieldPlayer.isDefault) {
            Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Default_Heart
            Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Default_Heart2
            Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Default_HeartFancy
            Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Default_HeartFancy2

            Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.Default_BarHeart
            Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.Default_BarHeart2

            LifeShieldPlayer.isDefault = true
        }
    }

    ModifyMaxStats(player) {
        if(LifeShieldPlayer.Active) return this.CumulativeHealth = LifeShieldPlayer.MaxExtraLife
        return this.CumulativeHealth = 0
    }
}