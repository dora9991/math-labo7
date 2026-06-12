// ============================================================
// partners.js — 「なかま（仲間モンスター）」のルール（純関数のみ）
//
//  ・バトルで「魔物のエサ」を使った敵をたおすと、一定確率で仲間になる
//    （ザコ50%／ボス25%・その敵の単元を簡単/普通/難しい全て★1以上が条件）。
//  ・仲間はコイン/クリスタルで「餐やり」してレベルを上げると強くなる。
//  ・「ストック」最大4体まで編成でき、そのうち1体を「アクティブ」にすると、
//    バトルに主人公とともに参戦して一緒に戦う（残り3体は控え＝参戦しない）。
//
//  ※ ここは monsters.js / battle.js を import しない（循環参照を避ける）。
//    モンスター定義が要る処理は monster オブジェクトを引数で受け取る。
// ============================================================

// ストック（編成）に入れられる最大数。うち1体だけがバトルに参戦する。
export const PARTY_MAX = 4;

// 魔物のエサの値段（items.js の bait と一致させる）
export const BAIT_COST = 500;

// 仲間になる確率（エサ使用済みの敵をたおしたとき）
export const RECRUIT_CHANCE = { zako: 0.5, boss: 0.25 };

// なかまレベルの上限（ティアが高いほど高くまで育つ＝ボスは強い仲間になる）
export const PARTNER_MAX_LEVEL = { unit: 15, boss: 25, final: 30 };

/** モンスターのティア（"unit" | "boss" | "final"）。monster.kind から判定。 */
export function partnerTierOf(monster) {
  if (!monster) return "unit";
  if (monster.kind === "finalBoss") return "final";
  if (monster.kind === "chapterBoss") return "boss";
  return "unit";
}

/** そのモンスターを仲間にできる確率（ボス/魔王=25%・それ以外=50%） */
export function recruitChance(monster) {
  const t = partnerTierOf(monster);
  return t === "unit" ? RECRUIT_CHANCE.zako : RECRUIT_CHANCE.boss;
}

/** そのモンスターのなかまレベル上限 */
export function partnerMaxLevel(monster) {
  return PARTNER_MAX_LEVEL[partnerTierOf(monster)] || PARTNER_MAX_LEVEL.unit;
}

/**
 * 仲間モンスターのバトル用ステータス（HP・攻撃力）。
 *  敵としての強さ(monster.atk)とレベルから算出（深い敵・高Lvほど強い仲間）。
 *   攻撃力 = monster.atk × (0.5 + (lv-1)*0.07)
 *   最大HP = monster.atk × 4 × (0.6 + (lv-1)*0.09)
 * @returns {{maxHp:number, atk:number}}
 */
export function allyStats(monster, lv = 1) {
  const base = Math.max(4, monster?.atk || 8);
  const L = Math.max(1, lv);
  const atk = Math.max(1, Math.round(base * (0.5 + (L - 1) * 0.07)));
  const maxHp = Math.max(8, Math.round(base * 4 * (0.6 + (L - 1) * 0.09)));
  return { maxHp, atk };
}

// 餐やりの種類：コイン=エサ（+1Lv・安い）/ クリスタル=ごちそう（+3Lv・速い）
export const FEED_KINDS = {
  coin:    { id: "coin",    label: "エサ",     icon: "🍖", levels: 1 },
  crystal: { id: "crystal", label: "ごちそう", icon: "🍰", levels: 3 },
};

/**
 * 現在レベル lv の仲間を1回育てるコスト。
 *  コイン：40 + lv*30 / クリスタル：2 + floor(lv/6)（ごちそうは+3Lv）
 * @returns {{coins:number, crystals:number, levels:number}}
 */
export function feedCost(lv = 1, kind = "coin") {
  const L = Math.max(1, lv);
  if (kind === "crystal") {
    return { coins: 0, crystals: 2 + Math.floor(L / 6), levels: FEED_KINDS.crystal.levels };
  }
  return { coins: 40 + L * 30, crystals: 0, levels: FEED_KINDS.coin.levels };
}
