# Adaptações de mecânica — acessórios

Registro dos acessórios cuja mecânica original **não pôde ser reproduzida** com a API disponível
no TL Pro, e que por isso receberam uma mecânica alternativa.

Um acessório só entra aqui depois de o agente responsável ter confirmado, **lendo o código e a API**,
que a mecânica original não é viável. "É difícil" não é motivo para adaptar.

Quando um acessório é adaptado, a tooltip nos 4 idiomas descreve a mecânica **nova**, não a original.

---

## Fan Letter — variante de bioma omitida

**Mecânica original:**
`ThoriumGlobalTile.Drop`, ramo `type == 31`, sorteia 50/50 entre Fan Letter e Dark Heart ao
quebrar um Shadow Orb / Crimson Heart. No ramo do Fan Letter, `flag = frameX >= 0 && frameX < 36`
decide entre duas classes: Shadow Orb dropa `FanLetter2`, Crimson Heart dropa `FanLetter`.
`FanLetter2` é `public class FanLetter2 : FanLetter {}` — subclasse vazia, stats e efeito
idênticos, e existe `FanLetter2.png` como sprite separado.

**Problema técnico:**
Nenhum. A mecânica é implementável.

**Mecânica utilizada:**
Só o `FanLetter` foi implementado, dropando nas duas variantes de orbe. Os 50% do Dark Heart
não dropam nada por enquanto — o Dark Heart ainda não existe no port.

**Motivo da escolha:**
`FanLetter2` não tem diferença funcional alguma: mesmo nome, mesma tooltip, mesmo efeito, só
outro sprite. Duplicar o item custaria mais um registro e mais 8 entradas de localização para
uma diferença puramente cosmética de bioma. Fica registrado como divergência consciente, não
como limitação técnica — se o sprite por bioma for desejado depois, é só criar a subclasse e
trocar o item pelo `frameX` no `DropItems` de `gTilesLoot.js`.

Quando o Dark Heart for implementado, o `if (!Rand.NextBool()) return;` vira um `else` com o
segundo `NewItem`, sem mexer no resto.

<!-- Formato para as próximas: -->

<!--
## Nome do acessório

**Mecânica original:**

**Problema técnico:**

**Mecânica utilizada:**

**Motivo da escolha:**
-->
