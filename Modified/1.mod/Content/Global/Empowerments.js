import { Terraria, Modules, Microsoft } from "../../TL/ModImports.js";
import { ModLocalization } from "../../TL/ModLocalization.js";
import { ThoriumPlayer } from "./ThoriumPlayer.js";

const { Main } = Terraria
const { Color, Vector2 } = Modules

const _pos = Vector2.new(0, 0);
const _color = Color.new(255, 255, 255, 255);
const _activeIcons = [];
const _drawData = [];

export class Empowerments {
  static MaxLevel = 5;
  static Active = new Map();
  static LoadTextures = false;

  // Cores para o texto de combate
  static Colors = {
    AquaticAbility: [75, 255, 200],
    AttackSpeed: [255, 135, 40],
    CriticalStrikeChance: [250, 215, 0],
    Damage: [255, 0, 0],
    DamageReduction: [50, 75, 255],
    Defense: [50, 150, 255],
    FlatDamage: [175, 0, 0],
    FlightTime: [0, 220, 20],
    InvincibilityFrames: [0, 255, 255],
    JumpHeight: [175, 255, 25],
    LifeRegeneration: [175, 175, 175],
    MovementSpeed: [110, 255, 0],
    ResourceConsumptionChance: [255, 125, 255],
    ResourceGrabRange: [255, 255, 255],
    ResourceMaximum: [200, 25, 255],
    ResourceRegen: [125, 75, 255],
    // fallback
    Default: [255, 255, 255]
  };

  static Registry = {
    AttackSpeed: {
      Icon: null,
      Update(player, level) {
        player.meleeSpeed += level * 0.03;
      },
      GetDisplayValue(level) { return (level * 3).toString(); }
    },
    CriticalStrikeChance: {
      Icon: null,
      Update(player, level) {
        const bonus = level * 5;
        player.meleeCrit += bonus;
        player.rangedCrit += bonus;
        player.magicCrit += bonus;
        ThoriumPlayer.class.Bard.symphonicCrit += bonus
        ThoriumPlayer.class.Healer.radiantCrit += bonus
      },
      GetDisplayValue(level) { return (level * 5).toString(); }
    },
    Damage: {
      Icon: null,
      Update(player, level) {
        player.meleeDamage += level * 0.05;
        player.magicDamage += level * 0.05;
        player.rangedDamage += level * 0.05;
        player.minionDamage += level * 0.05;
      },
      GetDisplayValue(level) { return (level * 5).toString(); }
    },
    FlatDamage: {
      Icon: null,
      Update(player, level) {
        ThoriumPlayer.class.Bard.symphonicDamage += level * 1;
      },
      GetDisplayValue(level) { return (level * 1).toString(); }
    },
    InvincibilityFrames: {
      Icon: null,
      Update(player, level) {
        ThoriumPlayer.InvincibilityFrameBonus = level * 12;
      },
      GetDisplayValue(level) { return (level * 12 / 60).toFixed(1); } // segundos
    },
    AquaticAbility: {
      Icon: null,
      Update(player, level) {
        if (player.wet) {
          player.moveSpeed += level * 0.25;
          player.ignoreWater = true;
        }
      },
      GetDisplayValue(level) { return (level * 25).toString(); }
    },
    Defense: {
      Icon: null,
      Update(player, level) {
        player.statDefense += level * 4;
      },
      GetDisplayValue(level) { return (level * 4).toString(); }
    },
    JumpHeight: {
      Icon: null,
      Update(player, level) {
        player.jumpSpeedBoost += level * 0.6;
      },
      GetDisplayValue(level) { return (level * 1).toString(); } // blocos
    },
    MovementSpeed: {
      Icon: null,
      Update(player, level) {
        player.moveSpeed += level * 0.1;
        player.runAcceleration += level * 0.05;
      },
      GetDisplayValue(level) { return (level * 10).toString(); }
    },
    ResourceMaximum: {
      Icon: null,
      Update(player, level) {
        ThoriumPlayer.class.Bard.inspirationMax2 += level * 2;
      },
      GetDisplayValue(level) { return (level * 5).toString(); }
    },
    LifeRegeneration: {
      Icon: null,
      Update(player, level) {
        player.lifeRegen += level;
        player.lifeRegenTime += level * 4;
      },
      GetDisplayValue(level) { return (level * 1).toString(); }
    },
    ResourceGrabRange: {
      Icon: null,
      Update(player, level) {
        player.treasureMagnet = true;
      },
      GetDisplayValue(level) { return level * 3; }
    },
    EmpowermentProlongation: {
      Icon: null,
      Update(player, level) {
        ThoriumPlayer.class.Bard.bardBuffDurationX += level * 0.3;
      },
      GetDisplayValue(level) { return (level * 0.3 * 100).toString(); }
    },
    DamageReduction: {
      Icon: null,
      Update(player, level) {
        player.endurance += level * 0.03;
      },
      GetDisplayValue(level) { return (level * 4).toString(); }
    },
    FlightTime: {
      Icon: null,
      Update(player, level) {
        if (player.wingTimeMax <= 0) return;
        player.wingTimeMax += level * 10 + player.wingTimeMax * (level * 0.05);
      },
      GetDisplayValue(level) { return (level * 10).toString(); }
    },
    ResourceConsumptionChance: {
      Icon: null,
      Update(player, level) {
        ThoriumPlayer.class.Bard.inspirationConsume -= level * 0.05;
      },
      GetDisplayValue(level) { return (level * 5).toString(); }
    },
    ResourceRegen: {
      Icon: null,
      Update(player, level) {
        player.manaRegenBonus += level * 2;
        player.manaRegenDelayBonus += level;
        ThoriumPlayer.class.Bard.inspirationRegenBonus += level * 0.05;
      },
      GetDisplayValue(level) { return (level * 5).toString(); }
    }
  };

  static Draw(texture, x, y, brightness, scale) {
    const b = Math.round(brightness * 255);
    _color.R = b; _color.G = b; _color.B = b; _color.A = 255;
    _pos.X = x; _pos.Y = y;

    Main.spriteBatch[
      "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
    ](texture, _pos, null, _color, 0, Vector2.Zero, scale, null, 0.0);
  }

  static Apply(player, name, level) {
    const empowerment = Empowerments.Registry[name];
    if (!empowerment) return;

    level = Math.min(level, Empowerments.MaxLevel);
    let duration = Math.floor(300 * ThoriumPlayer.class.Bard.bardBuffDurationX) + ThoriumPlayer.class.Bard.bardBuffDurationFlat;

    if (empowerment.ModifyApplication) {
      const modified = empowerment.ModifyApplication(player, level, duration);
      level = modified.level;
      duration = modified.duration;
    }

    const current = Empowerments.Active.get(name);

    // Texto flutuante apenas se for um empowerment NOVO
    if (!current) {
      // Prepara o valor a ser exibido
      let displayValue = "";
      if (empowerment.GetDisplayValue) {
        displayValue = empowerment.GetDisplayValue(level);
      } else {
        // fallback genérico
        displayValue = level.toString();
      }

      const translationKey = `Empowerments.${name}`;
      const translated = ModLocalization.Translate(translationKey);
      const text = translated.replace('{0}', displayValue);

      const rgb = Empowerments.Colors[name] || Empowerments.Colors.Default;
      const color = Color.new(rgb[0], rgb[1], rgb[2], 255);

      const PopupText = Terraria.PopupText;
      const AdvancedPopupRequest = new NativeClass('Terraria', 'AdvancedPopupRequest');

      const request = AdvancedPopupRequest.new();
      request.Text = text;
      request.Color = color;
      request.DurationInFrames = 90;            // 1.5 segundos
      request.Velocity = Vector2.new(0, -3);    // sobe suavemente

      // Posição inicial: acima do jogador (evita que nasça dentro dele)
      const position = Vector2.new(player.Center.X, player.position.Y - 10);
      const index = PopupText['int NewText(AdvancedPopupRequest request, Vector2 position)'](request, position);

      if (index >= 0 && index < 20) {
        const popup = PopupText.popupText[index];

        let baseVel = Vector2.new(0, -3);

        const angle = (Math.random() - 0.5) * Math.PI * 0.3; // ±30° em radianos
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        baseVel = Vector2.new(
          baseVel.X * cos - baseVel.Y * sin,
          baseVel.X * sin + baseVel.Y * cos
        );

        let vel = popup.velocity;
        vel.X = baseVel.X + player.velocity.X;
        vel.Y = baseVel.Y + player.velocity.Y;
        popup.velocity = vel;

        popup.lifeTime += Math.floor(popup.lifeTime / 2);
        popup.color = Color.new(rgb[0], rgb[1], rgb[2], 220);
      }
    }

    if (current) {
      current.level = Math.max(current.level, level);
      current.duration = duration;
    } else {
      Empowerments.Active.set(name, { level, duration });
    }
  }

  static Update(player) {
    Empowerments.OrbitRotation += 0.02;
    for (const [name, data] of Empowerments.Active.entries()) {
      const empowerment = Empowerments.Registry[name];

      if (!empowerment) continue;
      if (data.duration > 0) {
        data.duration--;

        Empowerments.Active.set(name, data);
        empowerment.Update(player, data.level);

      } else {
        Empowerments.Active.delete(name);
      }
    }
  }

  static OrbitRotation = 0;

  static DrawIcons(frontLayer = true) {
    if (!Empowerments.LoadTextures) {
      for (const name in Empowerments.Registry) {
        Empowerments.Registry[name].Icon =
          tl.texture.load(`Textures/Empowerments/${name}.png`);
      }
      Empowerments.LoadTextures = true;
    }

    const player = Main.player[Main.myPlayer];

    _activeIcons.length = 0;
    _drawData.length = 0;

    for (const [name] of Empowerments.Active.entries()) {
      const icon = Empowerments.Registry[name]?.Icon;
      if (icon) _activeIcons.push(icon);
    }

    const total = _activeIcons.length;
    if (total <= 0) return;

    const cx = player.Center.X - Main.screenPosition.X;
    const cy = player.Center.Y - Main.screenPosition.Y;
    const radiusX = 42, radiusY = 12, baseScale = 0.65;
    const angleStep = (Math.PI * 2) / total;

    for (let i = 0; i < total; i++) {
      const angle = Empowerments.OrbitRotation + angleStep * i;
      const orbitY = Math.sin(angle);
      const isFront = orbitY < 0;
      if (isFront !== frontLayer) continue;

      const orbitX = Math.cos(angle);
      const depth = (orbitY + 1) / 2;
      const scale = baseScale + depth * 0.18;
      const texture = _activeIcons[i];

      _drawData.push({
        texture,
        x: cx + orbitX * radiusX - (texture.Width * scale / 2),
        y: cy + orbitY * radiusY - (texture.Height * scale / 2),
        scale,
        brightness: 0.45 + depth * 0.55,
        depth: orbitY
      });
    }

    _drawData.sort((a, b) => a.depth - b.depth);

    for (const d of _drawData) {
      Empowerments.Draw(d.texture, d.x, d.y, d.brightness, d.scale);
    }
  }

  static Has(name) {
    return (
      Empowerments.Active.has(name) &&
      Empowerments.Active.get(name).duration > 0
    );
  }

  static GetLevel(name) {
    return Empowerments.Has(name)
      ? Empowerments.Active.get(name).level
      : 0;
  }

  static Clear() {
    Empowerments.Active.clear();
  }
}