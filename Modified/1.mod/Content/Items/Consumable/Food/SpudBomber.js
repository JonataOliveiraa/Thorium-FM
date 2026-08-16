import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

let _spudAmmoType = -1;

export class SpudBomber extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.damage = 12;
    this.Item.ranged = true;
    this.Item.width = 42;
    this.Item.height = 30;
    this.Item.useTime = 28;
    this.Item.useAnimation = 28;
    this.Item.autoReuse = true;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noMelee = true;
    this.Item.knockBack = 3;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item61;
    this.Item.shootSpeed = 12;
    this.Item.crit = 4;

    // Sem um `shoot` valido o Terraria nem chega a tentar disparar a arma - era
    // por isso que ela nao fazia absolutamente nada. A municao substitui este
    // projetil, mas ele precisa existir como padrao.
    this.Item.shoot = ModProjectile.getTypeByName('SpudPro');
  }

  // O Spud e' registrado DEPOIS do SpudBomber, entao getTypeByName ainda devolvia
  // vazio durante o SetDefaults e o useAmmo nunca era atribuido - a arma acabava
  // sem municao valida. PostSetupContent roda com todos os itens ja' carregados.
  PostSetupContent() {
    if (_spudAmmoType === -1) _spudAmmoType = ModItem.getTypeByName('Spud') ?? -2;
    if (_spudAmmoType > 0) this.Item.useAmmo = _spudAmmoType;
  }
}
