import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class BronzeHelmet extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.ID.ArmorIDs.Head.Sets.PreventBeardDraw[this.Item.headSlot] = true;
  }

  SetDefaults() {
    this.Item.width = 18;
    this.Item.height = 18;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.defense = 6;
  }

  UpdateEquip(item, player) {
    player.rangedCrit += 10;
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName('BronzeBreastplate'),
      ModItem.getTypeByName('BronzeGreaves'),
      // A chave ArmorSetBonus.Bronze ja' existia traduzida nos 4 idiomas; o texto
      // cru em ingles que estava aqui nunca passava pela localizacao.
      ModLocalization.getTranslationArmorSetBonus('Bronze')
    );
  }

  UpdateArmorSet(item, player) {
    ThoriumPlayer.setBronze = true;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 12)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
