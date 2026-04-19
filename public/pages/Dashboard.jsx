const { useState, useEffect } = React;

const Dashboard = ({ onLogout }) => {
    const [serverData, setServerData] = useState(null);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [shaking, setShaking] = useState(false);
    const [simulateMode, setSimulateMode] = useState(false);

    const defaultAlerts = [
        { id: 1, title: "Banking System Alert", desc: "HDFC experiencing unusual volatility", sev: "HIGH", read: false },
        { id: 2, title: "Market Correlation Shift", desc: "High correlation between indices detected", sev: "MEDIUM", read: true },
    ];
    const simulatedAlerts = [
        { id: 101, title: "SIMULATED Market Liquidity Shock", desc: "Fake liquidity gap spiked across sectors", sev: "CRITICAL", read: false },
        { id: 102, title: "SIMULATED Credit Default Storm", desc: "Synthetic CDS surge triggered alert", sev: "HIGH", read: false },
        { id: 103, title: "SIMULATED Exchange Halt Event", desc: "Flash freeze event created for testing", sev: "HIGH", read: false },
    ];
    const [alerts, setAlerts] = useState(defaultAlerts);
    const time = useTime();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/status");
                const data = await res.json();
                setServerData(data);
                if (data.crisis) {
                    setShaking(true);
                    setTimeout(() => setShaking(false), 700);
                }
            } catch (err) {
                console.error("Failed to fetch status", err);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const simulatedData = {
        crisis: true,
        crisis_score: 94,
        banking_score: 92,
        market_score: 88,
        liquidity_score: 97,
        status: "CRITICAL",
        message: "SIMULATION: TRIGGERED SYSTEM ALERT",
        company_name: "Simulated Market",
        ticker: "SIM",
        timestamp: "SIMULATED",
        chart_signals: [
            { signal: "Liquidity shock", weight: 95, detected: true },
            { signal: "Credit default cascade", weight: 90, detected: true },
        ],
        news_signals: [
            { category: "Macro risk", weight: 88, detected: true },
            { category: "Regulatory stress", weight: 82, detected: true },
        ],
        news_headlines: [
            { title: "Central banks issue emergency statement", sentiment: "negative" },
            { title: "Liquidity drains surge across major markets", sentiment: "negative" },
            { title: "Cross-border contagion risk rises sharply", sentiment: "negative" },
        ],
    };

    const scoreToDelta = (score) => Math.round((score || 0) - 48);
    const effectiveData = simulateMode ? simulatedData : serverData;
    const bankingScore = effectiveData?.banking_score ?? 42;
    const marketScore = effectiveData?.market_score ?? 28;
    const liquidityScore = effectiveData?.liquidity_score ?? 71;
    const currentScore = effectiveData?.crisis_score ?? 54;
    const crisis = effectiveData?.crisis ?? false;
    const status = effectiveData?.status || "WATCH";
    const actionLabel = renderActionLabel(effectiveData?.message || effectiveData?.recommended_action || "MONITOR_CLOSELY");
    const companyName = effectiveData?.company_name || effectiveData?.ticker || "Unnamed Asset";
    const lastScan = effectiveData?.timestamp || "N/A";

    const d = {
        banking: { level: makeRiskLevel(bankingScore), score: bankingScore, spark: buildSparkData(bankingScore), delta: scoreToDelta(bankingScore) },
        market: { level: makeRiskLevel(marketScore), score: marketScore, spark: buildSparkData(marketScore), delta: scoreToDelta(marketScore) },
        liquidity: { level: makeRiskLevel(liquidityScore), score: liquidityScore, spark: buildSparkData(liquidityScore), delta: scoreToDelta(liquidityScore) },
    };

    const statusLabel = status.toUpperCase();
    const chartSignals = effectiveData?.chart_signals ?? [];
    const newsSignals = effectiveData?.news_signals ?? [];
    const newsHeadlines = effectiveData?.news_headlines ?? [];

    const refreshStatus = async () => {
        if (simulateMode) {
            return;
        }
        try {
            const res = await fetch("/api/status");
            const data = await res.json();
            setServerData(data);
        } catch (err) {
            console.error("Refresh failed", err);
        }
    };

    const toggleSimulation = () => {
        if (simulateMode) {
            setSimulateMode(false);
            setAlerts(defaultAlerts);
            refreshStatus();
            return;
        }

        setSimulateMode(true);
        setAlerts(simulatedAlerts);
        setShaking(true);
        setTimeout(() => setShaking(false), 700);
    };

    const renderContent = () => {
        switch (activeNav) {
            case "alerts":
                return <AlertsPage crisis={crisis} alerts={alerts} setAlerts={setAlerts} />;
            case "global":
                return <GlobalRiskPage serverData={effectiveData} />;
            case "stocks":
                return <StockListPage stocks={[]} />;
            case "settings":
                return <SettingsPage />;
            default:
                return dashboardContent();
        }
    };

    const dashboardContent = () => (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-void)" }} className="grid-bg">
            <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={onLogout} simulateMode={simulateMode} onToggleSimulation={toggleSimulation} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                <div style={{
                    height: 60, background: "var(--bg-deep)", borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div>
                            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.04em" }}>CrisisGuard AI</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginLeft: 10 }}>/ {activeNav.toUpperCase()}</span>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 7,
                            background: crisis ? "rgba(255,23,68,0.12)" : "rgba(255,77,109,0.08)",
                            border: `1px solid ${crisis ? "rgba(255,23,68,0.4)" : "rgba(255,77,109,0.2)"}`,
                            borderRadius: 20, padding: "4px 12px 4px 8px",
                            transition: "all 0.3s"
                        }}>
                            <div className="pulse-dot" style={{ background: crisis ? "var(--accent-critical)" : "var(--accent-high)" }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: crisis ? "var(--accent-critical)" : "var(--accent-high)", letterSpacing: "0.06em" }}>
                                {crisis ? "CRISIS DETECTED" : "LIVE MONITORING"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{time}</div>
                        <button
                            onClick={refreshStatus}
                            style={{
                                background: "transparent",
                                border: `1px solid ${crisis ? "var(--accent-critical)" : "var(--accent-blue)"}`,
                                color: crisis ? "var(--accent-critical)" : "var(--accent-blue)",
                                borderRadius: 8, padding: "7px 16px",
                                fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700,
                                cursor: "pointer", letterSpacing: "0.06em",
                                transition: "all 0.3s",
                            }}
                            onMouseEnter={e => { e.target.style.background = crisis ? "rgba(255,23,68,0.1)" : "rgba(99,132,255,0.1)"; }}
                            onMouseLeave={e => { e.target.style.background = "transparent"; }}
                        >
                            REFRESH DATA
                        </button>
                    </div>
                </div>

                <div className={shaking ? "crisis-mode" : ""} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 14 }}>REAL-TIME RISK INDICATORS</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                            <RiskCard title="Banking Instability" icon="bank" {...d.banking} sparkData={d.banking.spark} delay={0} />
                            <RiskCard title="Market Crash Risk" icon="trending" {...d.market} sparkData={d.market.spark} delay={80} />
                            <RiskCard title="Liquidity Risk" icon="droplet" {...d.liquidity} sparkData={d.liquidity.spark} delay={160} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>GLOBAL RISK TREND</div>
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>Composite Risk Index</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: crisis ? "var(--accent-critical)" : "var(--accent-cyan)" }}>
                                        {currentScore}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>CURRENT SCORE</div>
                                </div>
                            </div>
                            <GlobalRiskChart score={currentScore} />
                            <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                                {[{ label: "Latest Scan", val: lastScan }, { label: "Status", val: statusLabel }, { label: "Action", val: actionLabel }, { label: "Asset", val: companyName }].map(({ label, val }) => (
                                    <div key={label} style={{ minWidth: 120 }}>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>ACTIVE ALERTS</div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>Alert Feed</div>
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: crisis ? "rgba(255,23,68,0.1)" : "rgba(245,166,35,0.1)", color: crisis ? "var(--accent-critical)" : "var(--accent-med)", border: `1px solid ${crisis ? "rgba(255,23,68,0.3)" : "rgba(245,166,35,0.3)"}`, borderRadius: 12, padding: "3px 10px" }}>
                                    {crisis ? "ALERTS ACTIVE" : "NORMAL FLOW"}
                                </div>
                            </div>
                            <AlertPanel headlines={newsHeadlines} crisis={crisis} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>AI EXPLAINABILITY</div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Risk Factor Decomposition</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Why is this risk level being assigned?</div>
                        </div>
                        <ExplainPanel chartSignals={chartSignals} newsSignals={newsSignals} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        {[
                            { label: "Ticker", val: effectiveData?.ticker || "N/A", icon: "globe", color: "var(--accent-blue)" },
                            { label: "Status", val: statusLabel, icon: "activity", color: crisis ? "var(--accent-critical)" : "var(--accent-cyan)" },
                            { label: "Recommended", val: actionLabel, icon: "eye", color: crisis ? "var(--accent-high)" : "var(--accent-med)" },
                            { label: "Last Scan", val: lastScan, icon: "bell", color: "var(--accent-low)" },
                        ].map(({ label, val, icon, color }) => (
                            <div key={label} className="glass-card" style={{ padding: "14px 18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>{label.toUpperCase()}</div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color }}>{val}</div>
                                    </div>
                                    <div style={{ color, opacity: 0.6 }}><Icon name={icon} size={20} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-void)" }} className="grid-bg">
            <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={onLogout} simulateMode={simulateMode} onToggleSimulation={toggleSimulation} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                <div style={{
                    height: 60, background: "var(--bg-deep)", borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div>
                            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.04em" }}>CrisisGuard AI</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginLeft: 10 }}>/ {activeNav.toUpperCase()}</span>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 7,
                            background: crisis ? "rgba(255,23,68,0.12)" : "rgba(255,77,109,0.08)",
                            border: `1px solid ${crisis ? "rgba(255,23,68,0.4)" : "rgba(255,77,109,0.2)"}`,
                            borderRadius: 20, padding: "4px 12px 4px 8px",
                            transition: "all 0.3s"
                        }}>
                            <div className="pulse-dot" style={{ background: crisis ? "var(--accent-critical)" : "var(--accent-high)" }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: crisis ? "var(--accent-critical)" : "var(--accent-high)", letterSpacing: "0.06em" }}>
                                {crisis ? "CRISIS DETECTED" : "LIVE MONITORING"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{time}</div>
                        <button
                            onClick={refreshStatus}
                            style={{
                                background: "transparent",
                                border: `1px solid ${crisis ? "var(--accent-critical)" : "var(--accent-blue)"}`,
                                color: crisis ? "var(--accent-critical)" : "var(--accent-blue)",
                                borderRadius: 8, padding: "7px 16px",
                                fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700,
                                cursor: "pointer", letterSpacing: "0.06em",
                                transition: "all 0.3s",
                            }}
                            onMouseEnter={e => { e.target.style.background = crisis ? "rgba(255,23,68,0.1)" : "rgba(99,132,255,0.1)"; }}
                            onMouseLeave={e => { e.target.style.background = "transparent"; }}
                        >
                            REFRESH DATA
                        </button>
                    </div>
                </div>

                <div className={shaking ? "crisis-mode" : ""} style={{ flex: 1, overflow: "auto" }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
