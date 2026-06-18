export class Bard {
  constructor() {
    this.symphonicDamage = 10;
    this.multiplier = 1.0;
    this.inspirationMax2 = 0;
    this.inspirationRegenTimer = 0
    this.inspirationRegenBonus = 1.0
    this.inspirationRegenBase = 1
    this.bardBuffDurationX = 1.0
    this.bardBuffDurationFlat = 0
    this.inspirationConsume = 1
    this.description = "Bard";
  }

  itemNamePrefix = '[i:3943]'
}

export class Healer {
    constructor() {
        this.radiantDamage = 0;
        this.multiplier = 1.0;
        this.healPowerMultiply = 1.0;
        this.healPowerExtraValue = 0
        this.description = "Healer";
    }

    itemNamePrefix = '[i:6033]'
}

export class Thrower {
    constructor() {
        this.throwingDamage = 0;
        this.multiplier = 1.0;
        this.healPower = 0;
        this.description = "Thrower";
    }

    itemNamePrefix = '[i:5160]'
}