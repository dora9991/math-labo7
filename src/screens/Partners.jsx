// ============================================================
// Partners.jsx — なかま（おとも）育成画面
//  ・バトルで倒したモンスターが「なかま」として並ぶ。
//  ・コイン/クリスタルで「餐やり」してレベルを上げると強くなる。
//  ・1体を「おとも」に装備すると、バトル中ずっと攻撃力・最大HPが上がる。
// ============================================================
import Header from "../components/Header.jsx";
import MonsterSprite from "../components/MonsterSprite.jsx";
import { findMonster } from "../data/monsters.js";
import {
  feedCost, partnerMaxLevel, partnerTierOf, companionBonusLabel, FEED_KINDS,
} from "../engine/partners.js";

const TIER_LABEL = { unit: "なかま", boss: "章ボス", final: "魔王" };
const TIER_COLOR = { unit: "rgba(103,232,249,.5)", boss: "#f472b6", final: "#fde047" };

export default function Partners({ player, onFeed, onEquip, onBack }) {
  const coins = player.coins ?? 0;
  const crystals = player.crystals ?? 0;
  const partners = player.partners || {};
  // 捕獲順がわからないので id 一覧（MONSTERS の並び＝進行順に寄せる）
  const list = Object.keys(partners)
    .map((id) => ({ id, mon: findMonster(id), lv: partners[id]?.lv || 1 }))
    .filter((x) => x.mon);

  const equippedId = player.companion || null;
  const equipped = equippedId ? findMonster(equippedId) : null;
  const equippedLv = equippedId ? (partners[equippedId]?.lv || 1) : 0;
  const eb = companionBonusLabel(equippedLv);

  return (
    <div className="app">
      <Header player={player} back="ホーム" onBack={onBack} />
      <div className="content">
        <div className="pg-ttl">🐾 なかま（おとも）</div>
        <div className="pg-sub">倒したモンスターはなかまになる。育てて「おとも」にすると、バトルが有利に！</div>

        {/* 装備中おとものまとめ */}
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
          {equipped ? (
            <>
              <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MonsterSprite monster={equipped} mini state="idle" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.5)" }}>いまの おとも</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{equipped.name}（Lv.{equippedLv}）</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24" }}>⚔️ 攻撃 +{eb.atk}%　🛡️ HP +{eb.hp}%</div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>おとも未設定。下のなかまから「おともにする」を選ぼう。</div>
          )}
        </div>

        {list.length === 0 ? (
          <div className="glass">
            <div className="empty">
              <div className="empty-icon">🥚</div>
              <p>まだなかまがいません。<br />バトルでモンスターをたおすと、なかまになります！</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map(({ id, mon, lv }) => {
              const tier = partnerTierOf(mon);
              const maxLv = partnerMaxLevel(mon);
              const maxed = lv >= maxLv;
              const b = companionBonusLabel(lv);
              const isEquipped = id === equippedId;
              const coinCost = feedCost(lv, "coin");
              const cryCost = feedCost(lv, "crystal");
              const canCoin = !maxed && coins >= coinCost.coins;
              const canCry = !maxed && crystals >= cryCost.crystals;
              return (
                <div key={id} className="glass" style={{ padding: "10px 12px", border: `1.5px solid ${isEquipped ? TIER_COLOR[tier] : "rgba(255,255,255,.08)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MonsterSprite monster={mon} mini state="idle" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>{mon.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: TIER_COLOR[tier], border: `1px solid ${TIER_COLOR[tier]}`, borderRadius: 999, padding: "1px 6px" }}>{TIER_LABEL[tier]}</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", marginTop: 2 }}>
                        Lv.{lv}{maxed ? "（最大）" : ` / ${maxLv}`}　⚔️+{b.atk}% 🛡️HP+{b.hp}%
                      </div>
                      {/* レベルバー */}
                      <div style={{ height: 6, background: "rgba(255,255,255,.1)", borderRadius: 4, overflow: "hidden", marginTop: 5 }}>
                        <div style={{ width: (lv / maxLv) * 100 + "%", height: "100%", background: "linear-gradient(90deg,#fbbf24,#f472b6)" }} />
                      </div>
                    </div>
                  </div>
                  {/* ボタン列 */}
                  <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                    <button data-sfx="none" onClick={() => onEquip(id)}
                      style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 900,
                        background: isEquipped ? "#6366f1" : "rgba(255,255,255,.08)", color: "#fff" }}>
                      {isEquipped ? "✓ おとも中" : "おともにする"}
                    </button>
                    <button data-sfx="none" disabled={!canCoin} onClick={() => onFeed(id, "coin")}
                      style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", cursor: canCoin ? "pointer" : "default", fontFamily: "inherit", fontSize: 11.5, fontWeight: 900,
                        background: canCoin ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "rgba(255,255,255,.06)", color: canCoin ? "#3a2a00" : "rgba(255,255,255,.35)" }}>
                      {maxed ? "最大" : `${FEED_KINDS.coin.icon}💰${coinCost.coins}`}
                    </button>
                    <button data-sfx="none" disabled={!canCry} onClick={() => onFeed(id, "crystal")}
                      style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", cursor: canCry ? "pointer" : "default", fontFamily: "inherit", fontSize: 11.5, fontWeight: 900,
                        background: canCry ? "linear-gradient(135deg,#22d3ee,#67e8f9)" : "rgba(255,255,255,.06)", color: canCry ? "#063b44" : "rgba(255,255,255,.35)" }}>
                      {maxed ? "最大" : `${FEED_KINDS.crystal.icon}💎${cryCost.crystals}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,.45)", textAlign: "center", lineHeight: 1.6 }}>
          🍖エサ（コイン）＝Lv+1／🍰ごちそう（クリスタル）＝Lv+3。ボス・魔王ほど高Lvまで育ち、強いおともになります。
        </div>
      </div>
    </div>
  );
}
