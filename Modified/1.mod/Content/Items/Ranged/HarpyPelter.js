import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

const { Effects } = Modules;

export class HarpyPelter extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.SkipsInitialUseSound[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(12, 3, 6);
        this.Item.ranged = true;
        this.Item.width = 42;
        this.Item.height = 30;
        this.Item.useTime = 9;
        this.Item.useAnimation = 18;
        this.Item.reuseDelay = 18;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item11;
        this.Item.shoot = Terraria.ID.ProjectileID.Bullet;
        this.Item.shootSpeed = 8;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }

    /**
     * SkipsInitialUseSound tira o som automatico e a gente toca na mao. Sem
     * isso a rajada de 2 tiros so soaria uma vez, no comeco da animacao.
     */
    UseItem(item, player) {
        Effects.PlaySound(Terraria.ID.SoundID.Item11, player.position.X, player.position.Y);
        return true;
    }

    HoldoutOffset(item, player) {
        return { X: 0, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Feather, 7)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
