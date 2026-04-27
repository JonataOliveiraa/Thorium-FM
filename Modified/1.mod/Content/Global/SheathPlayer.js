import { Terraria } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Color } from "../../TL/Modules/Color.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";

export class SheathPlayer extends ModPlayer {
    static _hitThisSwing = false;
    static Types = {
        0: 'LeatherSheath',
        1: 'LeechingSheath',
        2: 'TitanSlayerSheath'
    };

    static SheatType = undefined;
    static SheathMaxCooldown = undefined;
    static SheathCooldown = 0;
    static SheatDamageMultiplier = 0;
    static SheatCriticalChanceBonus = 0;

    constructor() {
        super();
        this.previousItemType = -1; // Rastreia o ID do item atual na mão
    }

    ResetEffects(player) {
        SheathPlayer.SheatType = undefined;
        SheathPlayer.SheathMaxCooldown = undefined;
        SheathPlayer.SheatDamageMultiplier = 0;
        SheathPlayer.SheatCriticalChanceBonus = 0;
    }

    PreUpdate(player) {
        // Reseta o cooldown se o jogador morrer
        if (player.dead) {
            SheathPlayer.SheathCooldown = 0;
        }

        // Reseta o cooldown se houver troca de item
        if (player.HeldItem) {
            if (player.HeldItem.type !== this.previousItemType) {
                SheathPlayer.SheathCooldown = 0;
                this.previousItemType = player.HeldItem.type;
            }
        }
    }

    ModifyWeaponDamage(player, item, damage) {
        if (
            SheathPlayer.SheathMaxCooldown !== undefined &&
            SheathPlayer.SheatType !== undefined &&
            SheathPlayer.SheathCooldown >= SheathPlayer.SheathMaxCooldown &&
            item.melee &&
            item.useStyle === Terraria.ID.ItemUseStyleID.Swing
        ) {
            switch (SheathPlayer.SheatType) {
                case 0:
                    return this.WeaponDamage = this.MultiplyDamage(damage);
            }
        }

        return this.WeaponDamage = damage;
    }

    G

    OnHitNPC(player, item, target, damage, knockback, crit) {
        if (
            SheathPlayer.SheathMaxCooldown !== undefined &&
            SheathPlayer.SheatType !== undefined &&
            SheathPlayer.SheathCooldown >= SheathPlayer.SheathMaxCooldown &&
            item.melee &&
            item.useStyle === Terraria.ID.ItemUseStyleID.Swing
        ) {
            SheathPlayer.SheathCooldown = 0;
            SheathPlayer._hitThisSwing = true;
        }
    }

    PostItemCheck(player) {
        if (player.itemAnimation === 1 && 
            SheathPlayer.SheatType !== undefined && 
            player.HeldItem.melee) {
            
            // Sempre reseta no final do swing (hit ou miss)
            SheathPlayer.SheathCooldown = 0;
            SheathPlayer._hitThisSwing = false;
        }
    }

    MultiplyDamage(damage) {
        return damage * (1 + SheathPlayer.SheatDamageMultiplier);
    }

    static ReadySeathEffect(player) {
        const numDusts = 36; // Aumentei um pouco para fechar melhor o círculo
        const baseSpeed = 7; // Velocidade base de expansão

        // 1. Camada Principal (Explosão maior e mais rápida)
        for (let i = 0; i < numDusts; i++) {
            const angle = (i / numDusts) * Math.PI * 2;
            
            // Adiciona uma leve variação na velocidade para um efeito mais orgânico e menos rígido
            const speedVariation = baseSpeed + (Math.random() * 2.0 - 1.0); 
            
            const speedX = Math.cos(angle) * speedVariation;
            const speedY = Math.sin(angle) * speedVariation;
            const dustType = 228;

            let dustIndex = Terraria.Dust.NewDust(
                player.Center, // position
                0,             // width
                0,             // height
                dustType,      // dustType
                0,             // speedX (vamos forçar via Vector2 abaixo)
                0,             // speedY
                50,            // alpha
                Color.White,   // Color
                2.0 + (Math.random() * 0.6) // Scale variando entre 2.0 e 2.6
            );

            let d = Terraria.Main.dust[dustIndex];
            d.noGravity = true;
            d.rotation = angle;
            
            // CORREÇÃO: Atribuindo um novo Vector2 diretamente
            d.velocity = Vector2.new(speedX, speedY);
        }

        // 2. Camada Secundária (Brilho interno, menor e mais lento) para dar profundidade
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speedX = Math.cos(angle) * (baseSpeed * 0.35); // Mais lento
            const speedY = Math.sin(angle) * (baseSpeed * 0.35);
            
            let dustIndex = Terraria.Dust.NewDust(
                player.Center, 
                0, 0, 
                228, 
                0, 0, 
                100, // Um pouco mais transparente
                Color.White, 
                1.3 + (Math.random() * 0.4) // Menor que a camada principal
            );
            
            let d = Terraria.Main.dust[dustIndex];
            d.noGravity = true;
            
            // CORREÇÃO: Atribuindo um novo Vector2 diretamente
            d.velocity = Vector2.new(speedX, speedY);
        }
    }
}