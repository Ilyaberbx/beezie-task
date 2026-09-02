"use client";

import { useEffect, useState } from "react";

function read() {
  const probe = document.getElementById("inset-probe");
  const insets = probe ? getComputedStyle(probe) : null;
  const header = document.querySelector("header")?.getBoundingClientRect();
  const bar = document.querySelector<HTMLElement>("body > div.fixed")?.getBoundingClientRect();
  const vv = window.visualViewport;

  return [
    `inner ${window.innerWidth}x${window.innerHeight}`,
    `client ${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
    `vv ${vv ? `${Math.round(vv.width)}x${Math.round(vv.height)} top ${Math.round(vv.offsetTop)} pageTop ${Math.round(vv.pageTop)} scale ${vv.scale}` : "none"}`,
    `env t/b/l/r ${insets ? `${insets.paddingTop}/${insets.paddingBottom}/${insets.paddingLeft}/${insets.paddingRight}` : "?"}`,
    `scrollY ${Math.round(window.scrollY)} el ${Math.round(document.scrollingElement?.scrollTop ?? -1)}`,
    `header top ${header ? Math.round(header.top) : "?"} h ${header ? Math.round(header.height) : "?"}`,
    `bar bottom ${bar ? Math.round(bar.bottom) : "none"}`,
    `sticky ${header ? getComputedStyle(document.querySelector("header")!).position : "?"}`,
    `ua ${navigator.userAgent.slice(-60)}`,
  ].join("\n");
}

export function ViewportProbe() {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("probe")) return;

    const tick = () => setText(read());
    tick();

    const events: [EventTarget, string][] = [
      [window, "scroll"],
      [window, "resize"],
      [window, "orientationchange"],
    ];
    if (window.visualViewport) {
      events.push([window.visualViewport, "resize"], [window.visualViewport, "scroll"]);
    }
    for (const [target, name] of events) target.addEventListener(name, tick, { passive: true });
    const timer = setInterval(tick, 500);

    return () => {
      for (const [target, name] of events) target.removeEventListener(name, tick);
      clearInterval(timer);
    };
  }, []);

  if (!text) return null;

  return (
    <>
      <div
        id="inset-probe"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      />
      <pre
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          margin: 0,
          padding: "4px 6px",
          font: "10px/1.35 ui-monospace, monospace",
          color: "#0f0",
          background: "#000c",
          whiteSpace: "pre-wrap",
          pointerEvents: "none",
        }}
      >
        {text}
      </pre>
    </>
  );
}
