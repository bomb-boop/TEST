
import { useState } from "react";

const buyers = [
  {
    id: 1,
    company: "Matsumoto Kiyoshi Holdings",
    country: "🇯🇵 Japan",
    revenue: "¥300B+",
    pnl: "영업이익 ¥12B (약 4%)",
    headcount: "약 6,800명",
    decisionMaker: "Kenichi Yamamoto",
    email: "k.yamamoto@matsukiyo.co.jp",
    phone: "+81-3-5295-7777",
    website: "https://www.matsukiyo.co.jp",
    stores: "1,700+ 점포",
    channel: "드러그스토어 체인",
    brand: "JMsolution",
    stage: "발굴",
    category: "drugstore",
    flag: "🇯🇵",
  },
  {
    id: 2,
    company: "Watsons Thailand",
    country: "🇹🇭 Thailand",
    revenue: "THB 8B+",
    pnl: "영업이익 THB 600M (약 7.5%)",
    headcount: "약 3,200명",
    decisionMaker: "Supawan Thanakit",
    email: "s.thanakit@watsons.co.th",
    phone: "+66-2-694-8000",
    website: "https://www.watsons.co.th",
    stores: "800+ 점포",
    channel: "헬스&뷰티 체인",
    brand: "jmella",
    stage: "발굴",
    category: "hb_chain",
    flag: "🇹🇭",
  },
  {
    id: 3,
    company: "Ulta Beauty",
    country: "🇺🇸 USA",
    revenue: "$10B+",
    pnl: "영업이익 $1.2B (약 12%)",
    headcount: "약 40,000명",
    decisionMaker: "Paula Oyibo",
    email: "p.oyibo@ulta.com",
    phone: "+1-630-410-4800",
    website: "https://www.ulta.com",
    stores: "1,385+ 점포",
    channel: "프리미엄 뷰티 리테일",
    brand: "troistouch",
    stage: "발굴",
    category: "premium_beauty",
    flag: "🇺🇸",
  },
];

const stages = ["발굴", "메일발송완료", "회신대기", "미팅진행", "계약완료", "드랍"];

const stageColors = {
  "발굴": { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
  "메일발송완료": { bg: "#ede9fe", text: "#6d28d9", border: "#c4b5fd" },
  "회신대기": { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  "미팅진행": { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  "계약완료": { bg: "#d1fae5", text: "#065f46", border: "#34d399" },
  "드랍": { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

const brandColors = {
  JMsolution: { bg: "#1e293b", text: "#38bdf8" },
  jmella: { bg: "#4a1942", text: "#f0abfc" },
  troistouch: { bg: "#1c1917", text: "#fbbf24" },
};

const emailTemplates = {
  JMsolution: (buyer) => `Subject: Partnership Proposal – JMsolution K-Beauty Skincare for ${buyer.company}

Dear ${buyer.decisionMaker},

I hope this message finds you well. My name is [Your Name], Global Business Development Manager at GP Club Co., Ltd., the exclusive distributor of JMsolution — one of Korea's fastest-growing functional skincare brands.

JMsolution has achieved remarkable success across Asian markets, with standout products including our Marine Luminous Pearl Deep Moisture Mask and Active Propolis Nourishing Ampoule. Our dermatologically tested formulations are specifically designed to resonate with customers seeking affordable, high-efficacy K-beauty solutions — a perfect fit for ${buyer.company}'s health-and-beauty focused shopper base.

Why JMsolution × ${buyer.company}?
• Proven track record: Top-5 bestseller in multiple Asian pharmacy chains
• Price-competitive: Retail price range ¥500–¥2,800 with strong margin potential
• Localization-ready: Japanese-language packaging and POS materials available immediately
• MOQ flexibility: Initial trial order from 500 units/SKU

We would love to explore a pilot listing across a select number of your ${buyer.stores} locations, with a full nationwide rollout roadmap pending performance review.

I would greatly appreciate 20–30 minutes of your time for a virtual meeting at your earliest convenience. Please let me know your preferred date and time, or feel free to reach me directly at the contact information below.

Warm regards,
[Your Name]
Global Business Development | GP Club Co., Ltd.
📧 globalbd@gpclub.co.kr | 📞 +82-2-0000-0000
www.gpclub.co.kr`,

  jmella: (buyer) => `Subject: Introducing jmella – Premium K-Beauty Hair & Body Care for ${buyer.company}

Dear ${buyer.decisionMaker},

Greetings from GP Club Co., Ltd., the brand owner and global distributor of jmella — a premium Korean hair and body care brand celebrated for its French-inspired fragrances and salon-quality formulations.

jmella has quickly become a cult favorite in Southeast Asia, with our In France Hair Perfume Shampoo series and Body Lotion collection generating exceptional repeat purchase rates. With ${buyer.company}'s expansive network of ${buyer.stores} across Thailand, we see a tremendous opportunity to bring jmella's sensory-first beauty experience to your discerning customers.

Key partnership highlights:
• Trending product: jmella In France Shampoo ranked #1 on multiple SEA e-commerce platforms
• Consumer-friendly pricing: THB 350–THB 990 retail range with healthy margin structure
• Marketing support: Influencer campaign assets, sampling kits, and in-store display units included
• Regulatory-ready: Thailand FDA registration support provided by our team

We propose a 3-month trial in 50 pilot stores, scaling to full-network distribution based on sell-through results. Our regional team in Bangkok is ready to provide dedicated on-ground support.

I would welcome the opportunity to present our full brand deck and commercial terms at a time convenient for you. Please don't hesitate to reach out — I'm available via email or phone anytime.

Best regards,
[Your Name]
Global Business Development | GP Club Co., Ltd.
📧 globalbd@gpclub.co.kr | 📞 +82-2-0000-0000
www.gpclub.co.kr`,

  troistouch: (buyer) => `Subject: troistouch – Elevating the K-Beauty Prestige Experience at ${buyer.company}

Dear ${buyer.decisionMaker},

I'm reaching out on behalf of GP Club Co., Ltd., the global brand house behind troistouch — a sophisticated Korean skincare and color cosmetics brand crafted for the prestige beauty segment.

troistouch blends the precision of Korean skincare innovation with minimalist, editorial aesthetics that speak directly to the informed, beauty-passionate consumer that defines ${buyer.company}'s core shopper. With over ${buyer.stores} locations across the United States, Ulta Beauty represents the ideal launchpad for troistouch's North American debut.

Why troistouch is right for Ulta Beauty:
• Prestige positioning: Retail price range $28–$120, consistent with your mid-to-premium assortment
• Hero products: troistouch Glow Serum Foundation and Triple-Peptide Barrier Cream — both with viral TikTok traction (5M+ combined views)
• Diversity of assortment: 24 SKUs ready for US launch, with clean-beauty compliant formulations
• Marketing co-investment: GP Club commits to a $150K launch support package including influencer seeding, GWP, and digital assets

We envision an initial launch in 100–150 Ulta doors, supported by a robust omnichannel campaign targeting Gen Z and Millennial beauty enthusiasts. Our US-based logistics partner ensures full compliance with FDA regulations and EDI requirements.

We would be honored to schedule a formal brand presentation with your buying team at your earliest convenience. Please let me know how best to connect.

With great enthusiasm,
[Your Name]
Global Business Development | GP Club Co., Ltd.
📧 globalbd@gpclub.co.kr | 📞 +82-2-0000-0000
www.gpclub.co.kr`,
};

export default function GPClubDashboard() {
  const [buyerList, setBuyerList] = useState(buyers);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("buyers");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const moveStage = (buyerId, newStage) => {
    setBuyerList((prev) =>
      prev.map((b) => (b.id === buyerId ? { ...b, stage: newStage } : b))
    );
  };

  const handleCopy = () => {
    if (!selectedBuyer) return;
    const text = emailTemplates[selectedBuyer.brand](selectedBuyer);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (draggedId !== null) {
      moveStage(draggedId, stage);
      setDraggedId(null);
      setDragOverStage(null);
    }
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const getBuyersInStage = (stage) => buyerList.filter((b) => b.stage === stage);

  const containerStyle = {
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    padding: "0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  };

  const headerInnerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const logoIconStyle = {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  };

  const titleStyle = {
    color: "#f8fafc",
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.3px",
  };

  const subtitleStyle = {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "2px",
  };

  const badgeRowStyle = {
    display: "flex",
    gap: "10px",
  };

  const statBadgeStyle = (color) => ({
    background: color + "22",
    border: `1px solid ${color}44`,
    color: color,
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  });

  const mainStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "28px 32px",
  };

  const tabBarStyle = {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
    background: "#e2e8f0",
    padding: "4px",
    borderRadius: "12px",
    width: "fit-content",
  };

  const tabStyle = (active) => ({
    padding: "10px 22px",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.2s",
    background: active ? "#1e293b" : "transparent",
    color: active ? "#f8fafc" : "#64748b",
    boxShadow: active ? "0 2px 8px rgba(30,41,59,0.3)" : "none",
  });

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const cardGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "36px",
  };

  const buyerCardStyle = (selected, brand) => ({
    background: "#fff",
    borderRadius: "16px",
    boxShadow: selected
      ? "0 0 0 3px #38bdf8, 0 8px 32px rgba(56,189,248,0.2)"
      : "0 2px 12px rgba(0,0,0,0.08)",
    padding: "0",
    cursor: "pointer",
    transition: "all 0.2s",
    overflow: "hidden",
    border: selected ? "none" : "1px solid #e2e8f0",
  });

  const cardHeaderStyle = (brand) => ({
    background: brandColors[brand]?.bg || "#1e293b",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  const brandBadgeStyle = (brand) => ({
    background: brandColors[brand]?.text + "22" || "#38bdf822",
    border: `1px solid ${brandColors[brand]?.text || "#38bdf8"}55`,
    color: brandColors[brand]?.text || "#38bdf8",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  });

  const cardBodyStyle = {
    padding: "20px",
  };

  const companyNameStyle = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "4px",
  };

  const countryStyle = {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "14px",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "16px",
  };

  const infoItemStyle = {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "10px 12px",
  };

  const infoLabelStyle = {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  };

  const infoValueStyle = {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "700",
  };

  const dividerStyle = {
    height: "1px",
    background: "#f1f5f9",
    margin: "14px 0",
  };

  const contactRowStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const contactItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#475569",
  };

  const contactIconStyle = {
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    flexShrink: 0,
  };

  const stageSelectStyle = {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const selectStyle = {
    flex: 1,
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    background: "#f8fafc",
    cursor: "pointer",
  };

  const emailBtnStyle = {
    background: "linear-gradient(135deg, #38bdf8, #818cf8)",
    color: "#fff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  // Kanban
  const kanbanStyle = {
    display: "flex",
    gap: "14px",
    overflowX: "auto",
    paddingBottom: "12px",
  };

  const kanbanColStyle = (isOver) => ({
    minWidth: "190px",
    background: isOver ? "#e0f2fe" : "#f8fafc",
    borderRadius: "14px",
    border: isOver ? "2px dashed #38bdf8" : "2px dashed #e2e8f0",
    padding: "14px",
    transition: "all 0.15s",
    flex: "1",
  });

  const kanbanColHeaderStyle = (stage) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  });

  const kanbanStageLabelStyle = (stage) => ({
    fontSize: "12px",
    fontWeight: "800",
    color: stageColors[stage]?.text || "#1e293b",
    background: stageColors[stage]?.bg || "#f1f5f9",
    border: `1px solid ${stageColors[stage]?.border || "#e2e8f0"}`,
    padding: "4px 10px",
    borderRadius: "20px",
  });

  const kanbanCountStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    background: "#e2e8f0",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const kanbanCardStyle = (brand) => ({
    background: "#fff",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
    cursor: "grab",
    transition: "all 0.15s",
  });

  // Email modal
  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalStyle = {
    background: "#fff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "720px",
    maxHeight: "88vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
  };

  const modalHeaderStyle = {
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const modalTitleStyle = {
    color: "#f8fafc",
    fontSize: "16px",
    fontWeight: "800",
  };

  const closeButtonStyle = {
    background: "#ffffff22",
    border: "none",
    color: "#fff",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalBodyStyle = {
    padding: "20px 24px",
    overflowY: "auto",
    flex: 1,
  };

  const emailPreStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    fontSize: "13.5px",
    lineHeight: "1.8",
    color: "#334155",
    whiteSpace: "pre-wrap",
    fontFamily: "'Courier New', monospace",
    maxHeight: "480px",
    overflowY: "auto",
  };

  const copyButtonStyle = {
    background: copied
      ? "linear-gradient(135deg, #22c55e, #16a34a)"
      : "linear-gradient(135deg, #38bdf8, #818cf8)",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  };

  const modalFooterStyle = {
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fafafa",
  };

  const brandTagStyle = (brand) => ({
    background: brandColors[brand]?.bg || "#1e293b",
    color: brandColors[brand]?.text || "#38bdf8",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
  });

  const progressStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "28px",
    overflowX: "auto",
    paddingBottom: "4px",
  };

  const progressItemStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  });

  const progressDotStyle = (active, stage) => ({
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: active ? stageColors[stage]?.text || "#1e293b" : "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    color: active ? "#fff" : "#94a3b8",
    fontWeight: "800",
    flexShrink: 0,
  });

  const progressLabelStyle = (active, stage) => ({
    fontSize: "12px",
    fontWeight: "700",
    color: active ? stageColors[stage]?.text || "#1e293b" : "#94a3b8",
  });

  const progressArrowStyle = {
    color: "#cbd5e1",
    fontSize: "16px",
    flexShrink: 0,
  };

  const totalBuyers = buyerList.length;
  const contacted = buyerList.filter((b) => b.stage !== "발굴" && b.stage !== "드랍").length;
  const closed = buyerList.filter((b) => b.stage === "계약완료").length;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={logoStyle}>
            <div style={logoIconStyle}>🌏</div>
            <div>
              <div style={titleStyle}>GP Club · 해외 바이어 발굴 & 컨택 대시보드</div>
              <div style={subtitleStyle}>Global Business Development · K-Beauty Expansion Hub</div>
            </div>
          </div>
          <div style={badgeRowStyle}>
            <div style={statBadgeStyle("#38bdf8")}>총 바이어 {totalBuyers}개사</div>
            <div style={statBadgeStyle("#a78bfa")}>컨택 진행중 {contacted}개사</div>
            <div style={statBadgeStyle("#34d399")}>계약완료 {closed}개사</div>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "12px 32px" }}>
            <div style={progressStyle}>
              {stages.map((stage, i) => {
                const count = buyerList.filter((b) => b.stage === stage).length;
                const active = count > 0;
                return (
                  <div key={stage} style={progressItemStyle(active)}>
                    {i > 0 && <span style={progressArrowStyle}>›</span>}
                    <div style={progressDotStyle(active, stage)}>{count || i + 1}</div>
                    <div style={progressLabelStyle(active, stage)}>{stage}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={mainStyle}>
        {/* Tab Bar */}
        <div style={tabBarStyle}>
          <button style={tabStyle(activeTab === "buyers")} onClick={() => setActiveTab("buyers")}>
            🎯 오늘의 추천 바이어
          </button>
          <button style={tabStyle(activeTab === "kanban")} onClick={() => setActiveTab("kanban")}>
            📋 파이프라인 칸반
          </button>
        </div>

        {/* Buyers Tab */}
        {activeTab === "buyers" && (
          <>
            <div style={sectionTitleStyle}>
              <span>✨</span>
              <span>오늘의 추천 바이어</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#94a3b8" }}>
                · AI 매칭 기반 · {new Date().toLocaleDateString("ko-KR")}
              </span>
            </div>
            <div style={cardGridStyle}>
              {buyerList.map((buyer) => (
                <div
                  key={buyer.id}
                  style={buyerCardStyle(selectedBuyer?.id === buyer.id, buyer.brand)}
                  onClick={() => setSelectedBuyer(buyer)}
                >
                  <div style={cardHeaderStyle(buyer.brand)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "28px" }}>{buyer.flag}</span>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: "800", fontSize: "15px" }}>
                          {buyer.channel}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                          {buyer.stores}
                        </div>
                      </div>
                    </div>
                    <div style={brandBadgeStyle(buyer.brand)}>{buyer.brand}</div>
                  </div>

                  <div style={cardBodyStyle}>
                    <div style={companyNameStyle}>{buyer.company}</div>
                    <div style={countryStyle}>{buyer.country}</div>

                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>연 매출</div>
                        <div style={infoValueStyle}>{buyer.revenue}</div>
                      </div>
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>수익성</div>
                        <div style={infoValueStyle}>{buyer.pnl}</div>
                      </div>
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>임직원 수</div>
                        <div style={infoValueStyle}>{buyer.headcount}</div>
                      </div>
                      <div style={infoItemStyle}>
                        <div style={infoLabelStyle}>채널/점포</div>
                        <div style={infoValueStyle}>{buyer.stores}</div>
                      </div>
                    </div>

                    <div style={dividerStyle} />

                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      핵심 의사결정자
                    </div>
                    <div style={contactRowStyle}>
                      <div style={contactItemStyle}>
                        <div style={{ ...contactIconStyle, background: "#e0f2fe" }}>👤</div>
                        <span style={{ fontWeight: "700", color: "#1e293b" }}>{buyer.decisionMaker}</span>
                      </div>
                      <div style={contactItemStyle}>
                        <div style={{ ...contactIconStyle, background: "#ede9fe" }}>✉</div>
                        <span style={{ color: "#3b82f6" }}>{buyer.email}</span>
                      </div>
                      <div style={contactItemStyle}>
                        <div style={{ ...contactIconStyle, background: "#dcfce7" }}>📞</div>
                        <span>{buyer.phone}</span>
                      </div>
                      <div style={contactItemStyle}>
                        <div style={{ ...contactIconStyle, background: "#fef9c3" }}>🌐</div>
                        <a
                          href={buyer.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#3b82f6", textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {buyer.website}
                        </a>
                      </div>
                    </div>

                    <div style={stageSelectStyle}>
                      <select
                        style={selectStyle}
                        value={buyer.stage}
                        onChange={(e) => {
                          e.stopPropagation();
                          moveStage(buyer.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        style={emailBtnStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBuyer(buyer);
                          setCopied(false);
                          // open modal directly
                          setActiveTab("email");
                        }}
                      >
                        ✍ 메일 초안
                      </button>
                    </div>

                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          ...stageColors[buyer.stage],
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          border: `1px solid ${stageColors[buyer.stage]?.border}`,
                        }}
                      >
                        {buyer.stage}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>현재 단계</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Kanban Tab */}
        {activeTab === "kanban" && (
          <>
            <div style={sectionTitleStyle}>
              <span>📋</span>
              <span>파이프라인 칸반 보드</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#94a3b8" }}>
                · 드래그 앤 드랍으로 단계 이동
              </span>
            </div>
            <div style={kanbanStyle}>
              {stages.map((stage) => {
                const stageBuyers = getBuyersInStage(stage);
                const isOver = dragOverStage === stage;
                return (
                  <div
                    key={stage}
                    style={kanbanColStyle(isOver)}
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDrop={(e) => handleDrop(e, stage)}
                    onDragLeave={() => setDragOverStage(null)}
                  >
                    <div style={kanbanColHeaderStyle(stage)}>
                      <div style={kanbanStageLabelStyle(stage)}>{stage}</div>
                      <div style={kanbanCountStyle}>{stageBuyers.length}</div>
                    </div>
                    {stageBuyers.map((buyer) => (
                      <div
                        key={buyer.id}
                        style={kanbanCardStyle(buyer.brand)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, buyer.id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "20px" }}>{buyer.flag}</span>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
                              {buyer.company}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{buyer.channel}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{
                            background: brandColors[buyer.brand]?.bg || "#1e293b",
                            color: brandColors[buyer.brand]?.text || "#38bdf8",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "800",
                          }}>
                            {buyer.brand}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                            {buyer.revenue}
                          </div>
                        </div>
                        <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              flex: 1,
                              padding: "5px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#64748b",
                            }}
                            onClick={() => {
                              setSelectedBuyer(buyer);
                              setCopied(false);
                              setActiveTab("email");
                            }}
                          >
                            ✍ 메일초안
                          </button>
                          <select
                            style={{
                              flex: 1,
                              padding: "5px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                              color: "#1e293b",
                            }}
                            value={buyer.stage}
                            onChange={(e) => moveStage(buyer.id, e.target.value)}
                          >
                            {stages.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {stageBuyers.length === 0 && (
                      <div style={{
                        textAlign: "center",
                        padding: "24px 12px",
                        color: "#cbd5e1",
                        fontSize: "12px",
                      }}>
                        여기에 드래그하세요
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Email Tab (hidden, opened via modal) */}
      </div>

      {/* Email Modal */}
      {activeTab === "email" && selectedBuyer && (
        <div style={modalOverlayStyle} onClick={() => setActiveTab("buyers")}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>
                  ✍ 맞춤형 제안 메일 초안 · {selectedBuyer.company}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                  {selectedBuyer.flag} {selectedBuyer.country} · {selectedBuyer.decisionMaker} 앞
                </div>
              </div>
              <button style={closeButtonStyle} onClick={() => setActiveTab("buyers")}>✕</button>
            </div>
            <div style={modalBodyStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>추천 브랜드 매칭:</div>
                <div style={brandTagStyle(selectedBuyer.brand)}>{selectedBuyer.brand}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>← {selectedBuyer.channel} 최적 제품라인</div>
              </div>
              <pre style={emailPreStyle}>
                {emailTemplates[selectedBuyer.brand](selectedBuyer)}
              </pre>
            </div>
            <div style={modalFooterStyle}>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                📌 발송 전 [Your Name] 및 연락처를 반드시 수정하세요
              </div>
              <button style={copyButtonStyle} onClick={handleCopy}>
                {copied ? "✅ 복사완료!" : "📋 클립보드 복사"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
