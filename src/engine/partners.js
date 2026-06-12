// ============================================================
// partners.js — 「なかま（おとも）モンスター育成」のルール（純関数のみ）
//
//  ・バトルで倒したモンスターは「なかま」になる（player.partners に登録）。
//  ・コイン/クリスタルで「餐やり」してレベルを上げると強くなる。
//  ・1体を「おとも」に装備（player.companion）すると、バトル中ずっと
//    攻撃力・最大HPがレベルに応じて上がる（battleBonuses に合算）。
//
//  ※ ここは monsters.js / battle.js を import しない（循環参照を避ける）。
//    モンスター定義が要る処理（最大Lv・ティア判定）は monster オブジェクトを
//    引数で受け取る形にして、呼び出し側（App）が MONSTERS から渡す。
// ============================================================

// なかまレベルの上限（ティアが高いほど高くまで育つ＝ボスのおともは強い）
export const PARTNER_MAX_LEVEL = { unit: 15, boss: 25, final: 30 };

/** モンスターのティア（"unit" | "boss" | "final"）。monster.kind から判定。 */
export function partnerTierOf(monster) {
  if (!monster) return "unit";
  if (monster.kind === "finalBoss") return "final";
  if (monster.kind === "chapterBoss") return "boss";
  return "unit";
}

/** そのモンスターのなかまレベル上限 */
export function partnerMaxLevel(monster) {
  return PARTNER_MAX_LEVEL[partnerTierOf(monster)] || PARTNER_MAX_LEVEL.unit;
}

/**
 * おとも（装備中のなかま）によるバトル補正。レベルに比例。
 *  攻撃力 +1.5%/Lv（上限+35%）・最大HP +1.0%/Lv（上限+25%）
 *  lv=0（なかまなし）なら 0。
 */
export function companionBonusFromLevel(lv = 0) {
  const L = Math.max(0, lv);
  return {
    atkPct: Math.min(0.35, L * 0.015),
    hpPct: Math.min(0.25, L * 0.01),
  };
}

/** player の「装備中おとも」のバトル補正 {atkPct,hpPct} */
export function companionBonus(player) {
  const id = player?.companion;
  const lv = id ? player?.partners?.[id]?.lv || 0 : 0;
  return companionBonusFromLevel(lv);
}

// 餐やりの種類：コイン=エサ（+1Lv・安い）/ クリスタル=ごちそう（+3Lv・速い）
export const FEED_KINDS = {
  coin:    { id: "coin",    label: "エサ",     icon: "🍖", levels: 1 },
  crystal: { id: "crystal", label: "ごちそう", icon: "🍰", levels: 3 },
};

/**
 * 現在レベル lv のなかまを1回育てるコスト。
 *  コイン：40 + lv*30（レベルが上がるほど高くなる）
 *  クリスタル：2 + floor(lv/6)（ごちそう。まとめて+3Lv）
 * @returns {{coins:number, crystals:number, levels:number}}
 */
export function feedCost(lv = 1, kind = "coin") {
  const L = Math.max(1, lv);
  if (kind === "crystal") {
    return { coins: 0, crystals: 2 + Math.floor(L / 6), levels: FEED_KINDS.crystal.levels };
  }
  return { coins: 40 + L * 30, crystals: 0, levels: FEED_KINDS.coin.levels };
}

/** 表示用：そのなかまの現在の補正を「+12% / +8%」のような形で返す */
export function companionBonusLabel(lv = 0) {
  const b = companionBonusFromLevel(lv);
  return { atk: Math.round(b.atkPct * 100), hp: Math.round(b.hpPct * 100) };
}
