import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

const { Color, Vector2 } = Modules;

export class Bongos extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentType = 'Percussion';
    }
    
    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 29;
        this.InspirationCost = 2;
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 0.5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('BongoDamage');
        this.Item.shootSpeed = 0.0;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('bongoSound');
            Empowerments.Apply(player, 'MovementSpeed', 2);
            this.OnPlayInstrument(player);
        }
        return true;
    }
    
    OnPlayInstrument(player) {
        const num = 50;
        for (let index = 0; index < num; index++) {
            const innerRotated = Vector2.RotatedBy(Vector2.UnitY, index * 6.2831854820251465 / num, Vector2.Zero);
            const dir = Vector2.RotatedBy(Vector2.Negate(innerRotated), Vector2.ToRotation(player.velocity), Vector2.Zero);
            const dust = Terraria.Dust.NewDustPerfect(Vector2.Add(player.Center, Vector2.Multiply(dir, 15)), 127, Vector2.Multiply(dir, 4), 0, null, 1.0);
            dust.scale = 1.35;
            dust.noGravity = true;
        }
    }

    HoldoutOffset(item) {
        return { X: 0, Y: 10 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName('Cloth'), 8)
        .AddIngredient(175, 12)
        .AddTile(18)
        .Register();
    }
}
