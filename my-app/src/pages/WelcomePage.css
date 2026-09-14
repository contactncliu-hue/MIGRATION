.welcome-stage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--surface-cream);
  overflow: visible;
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
}

.welcome-schedule-btn {
  position: absolute;
  top: calc(var(--sp-5) + 52px);
  left: var(--sp-5);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border: 1.5px solid var(--n-300);
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.9);
  font-family: var(--font-game);
  font-size: var(--fs-sm);
  font-weight: 800;
  color: var(--n-800);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, transform 0.12s ease;
}
.welcome-schedule-btn:hover {
  border-color: var(--c-gold);
  color: var(--c-gold-deep);
}
.welcome-schedule-btn:active {
  transform: scale(0.97);
}

/* ---------- main two-column layout ---------- */
/* single margin-top here keeps left column + panels aligned and moves both down together */
.welcome-layout {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-5);
  flex: 1;
  width: 100%;
  position: relative;
  margin-top: var(--sp-6, 40px);
}

/* left stack: trophy card, red zOo title, tree branches */
.welcome-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 24%;
  min-width: 220px;
  max-width: 420px;
  height: 100%;
  position: relative;
}

/* panel 1 — constant, always full brightness, but clickable */
.welcome-feature {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.welcome-feature:hover {
  transform: translateY(-4px);
}

.welcome-title {
  width: 82%;
  height: auto;
  margin-top: calc(var(--sp-3) + 12px);
  position: relative;
  z-index: 1;
}

/* flower/branches — bigger, in front */
.welcome-branches {
  width: 160%;
  max-width: none;
  height: auto;
  margin-top: var(--sp-2);
  margin-left: -12%;
  pointer-events: none;
  position: relative;
  z-index: 10;
}

/* right: three tall arch panels */
.welcome-panels {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  flex: 1;
  height: 100%;
}

.welcome-panel {
  position: relative;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.welcome-panel:hover {
  transform: translateY(-4px);
}

.welcome-panel-bg {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.45; /* dimmed by default — opacity only, no brightness (avoids wash-out) */
  transition: opacity 0.2s ease;
}

.welcome-panel-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46%;
  height: auto;
  pointer-events: none;
  opacity: 0; /* hidden by default */
  transition: opacity 0.2s ease;
}

/* selected state: full opacity, icon visible, slightly bigger */
.welcome-panel.is-selected {
  transform: scale(1.06) translateY(-4px);
}
.welcome-panel.is-selected:hover {
  transform: scale(1.06) translateY(-6px);
}
.welcome-panel.is-selected .welcome-panel-bg {
  opacity: 1;
}
.welcome-panel.is-selected .welcome-panel-icon {
  opacity: 1;
}

/* ---------- footer: full-width border + caption ---------- */
.welcome-line {
  width: 100%;
  height: auto;
  display: block;
  margin-top: var(--sp-4);
  position: relative;
  z-index: 5;
}

.welcome-caption {
  align-self: flex-end;
  margin-top: var(--sp-2);
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #7a2b2b;
}

@media (max-width: 760px) {
  .welcome-layout {
    flex-direction: column;
    margin-top: var(--sp-5);
  }
  .welcome-left {
    width: 100%;
    max-width: none;
    height: auto;
  }
  .welcome-branches {
    width: 80%;
    margin-left: 0;
    margin-top: var(--sp-4);
  }
  .welcome-panels {
    width: 100%;
    height: auto;
    margin-top: var(--sp-4);
  }
  .welcome-caption {
    align-self: center;
  }
}
