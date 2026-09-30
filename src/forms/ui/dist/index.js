import { ref as U, readonly as dr, getCurrentInstance as pn, onMounted as en, nextTick as Ke, watch as ae, reactive as tn, renderSlot as ue, openBlock as b, createBlock as W, Teleport as no, createCommentVNode as N, useId as nn, mergeProps as q, h as cr, createApp as pr, inject as pt, createElementBlock as g, createElementVNode as E, createTextVNode as oe, toDisplayString as V, resolveComponent as Ge, resolveDirective as oo, withDirectives as ro, resolveDynamicComponent as ao, withCtx as ne, normalizeClass as A, Transition as fr, onUnmounted as Et, computed as S, watchEffect as mr, defineComponent as pe, Fragment as ee, renderList as he, createVNode as H, unref as _, withModifiers as io } from "vue";
import { addCollection as hr, Icon as be } from "@iconify/vue";
import * as on from "@wippy-fe/proxy";
import { config as fn, addIcons as br, on as kt, applyThemeMode as bt, host as vr, hostCss as gr, loadCss as yr, define as wr } from "@wippy-fe/proxy";
import { getActivePinia as xr, createPinia as kr, setActivePinia as _r } from "pinia";
var $r = Object.defineProperty, mn = Object.getOwnPropertySymbols, Sr = Object.prototype.hasOwnProperty, Pr = Object.prototype.propertyIsEnumerable, hn = (e, t, n) => t in e ? $r(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Cr = (e, t) => {
  for (var n in t || (t = {})) Sr.call(t, n) && hn(e, n, t[n]);
  if (mn) for (var n of mn(t)) Pr.call(t, n) && hn(e, n, t[n]);
  return e;
};
function Re(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Vt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let o = Array.isArray(e), r = Array.isArray(t), a, s, l;
  if (o && r) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Vt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let f = Object.keys(e);
  if (s = f.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, f[a])) return !1;
  for (a = s; a-- !== 0; ) if (l = f[a], !Vt(e[l], t[l], n)) return !1;
  return !0;
}
function Tr(e, t) {
  return Vt(e, t);
}
function rn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function X(e) {
  return !Re(e);
}
function bn(e, t) {
  return null;
}
function an(e, t, n) {
  return n ? bn() === bn() : Tr(e, t);
}
function Or(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (an(e, n)) return !0;
  }
  return !1;
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function so(e = {}, t = {}) {
  let n = Cr({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    _e(t[r]) && r in e && _e(e[r]) ? n[r] = so(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function Ar(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : so(t, n), {});
}
function fe(e, ...t) {
  return rn(e) ? e(...t) : e;
}
function ce(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ke(e) {
  return ce(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function sn(e, t = "", n = {}) {
  let o = ke(t).split("."), r = o.shift();
  if (r) {
    if (_e(e)) {
      let a = Object.keys(e).find((s) => ke(s) === r) || "";
      return sn(fe(e[a], n), o.join("."), n);
    }
    return;
  }
  return fe(e, n);
}
function lo(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Er(e) {
  return X(e) && !isNaN(e);
}
function Le(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Lr(...e) {
  return Ar(...e);
}
function He(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function jr(e) {
  return ce(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function uo(e) {
  return ce(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function co() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let o = e.get(t);
    return o ? o.push(n) : o = [n], e.set(t, o), this;
  }, off(t, n) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let o = e.get(t);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    e.clear();
  } };
}
function $e(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let a = Array.isArray(o) ? [$e(...o)] : Object.entries(o).map(([s, l]) => l ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Nr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ir(e, t) {
  if (e && t) {
    let n = (o) => {
      Nr(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Nt(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function vn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function zr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Rr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Vr(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Rr(e));
}
function ft(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function _t(e, t = {}) {
  if (ft(e)) {
    let n = (o, r) => {
      var a, s;
      let l = (a = e?.$attrs) != null && a[o] ? [(s = e?.$attrs) == null ? void 0 : s[o]] : [];
      return [r].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([f, h]) => o === "style" && (h || h === 0) ? `${f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? f : void 0);
            i = c.length ? i.concat(c.filter((f) => !!f)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? _t(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function Fr(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return _t(o, t), o.append(...n), o;
  }
}
function Br(e, t) {
  return ft(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Dr(e, t) {
  if (ft(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function gn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Mr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || vn(document.documentElement) || vn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function qr(e, t) {
  return e ? e.offsetHeight : 0;
}
function yn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function po() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ur(e, t = "", n) {
  ft(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var vt = {};
function Wr(e = "pui_id_") {
  return Object.hasOwn(vt, e) || (vt[e] = 0), vt[e]++, `${e}${vt[e]}`;
}
var Hr = Object.defineProperty, Kr = Object.defineProperties, Gr = Object.getOwnPropertyDescriptors, $t = Object.getOwnPropertySymbols, fo = Object.prototype.hasOwnProperty, mo = Object.prototype.propertyIsEnumerable, wn = (e, t, n) => t in e ? Hr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ye = (e, t) => {
  for (var n in t || (t = {})) fo.call(t, n) && wn(e, n, t[n]);
  if ($t) for (var n of $t(t)) mo.call(t, n) && wn(e, n, t[n]);
  return e;
}, It = (e, t) => Kr(e, Gr(t)), Ce = (e, t) => {
  var n = {};
  for (var o in e) fo.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && $t) for (var o of $t(e)) t.indexOf(o) < 0 && mo.call(e, o) && (n[o] = e[o]);
  return n;
}, Yr = co(), se = Yr, Ye = /{([^}]*)}/g, ho = /(\d+\s+[\+\-\*\/]\s+\d+)/g, bo = /var\([^)]+\)/g;
function xn(e) {
  return ce(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Qr(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Zr(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ft(e = "", t = "") {
  return Zr(`${ce(e, !1) && ce(t, !1) ? `${e}-` : e}${t}`);
}
function vo(e = "", t = "") {
  return `--${Ft(e, t)}`;
}
function Jr(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function go(e, t = "", n = "", o = [], r) {
  if (ce(e)) {
    let a = e.trim();
    if (Jr(a)) return;
    if (Le(a, Ye)) {
      let s = a.replaceAll(Ye, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => Le(u, d)));
        return `var(${vo(n, uo(i.join("-")))}${X(r) ? `, ${r}` : ""})`;
      });
      return Le(s.replace(bo, "0"), ho) ? `calc(${s})` : s;
    }
    return a;
  } else if (Er(e)) return e;
}
function Xr(e, t, n) {
  ce(t, !1) && e.push(`${t}:${n};`);
}
function Fe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function yo(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let i = [], u = 0, d = "", c = null, f = 0;
    for (; u <= s.length; ) {
      let h = s[u];
      if ((h === '"' || h === "'" || h === "`") && s[u - 1] !== "\\" && (c = c === h ? null : h), !c && (h === "(" && f++, h === ")" && f--, (h === "," || u === s.length) && f === 0)) {
        let w = d.trim();
        w.startsWith("dt(") ? i.push(yo(w, l)) : i.push(o(w)), d = "", u++;
        continue;
      }
      h !== void 0 && (d += h), u++;
    }
    return i;
  }
  function o(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let r = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let l = a.pop();
    a.length === 0 && r.push([l, s]);
  }
  if (!r.length) return e;
  for (let s = r.length - 1; s >= 0; s--) {
    let [l, i] = r[s], u = e.slice(l + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, l) + c + e.slice(i + 1);
  }
  return e;
}
var je = (...e) => ea(Z.getTheme(), ...e), ea = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: a } = Z.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = Le(t, Ye) ? t : `{${t}}`;
    return o === "value" || Re(o) && l === "strict" ? Z.getTokenValue(t) : go(i, void 0, s, [r.excludedKeyRegex], n);
  }
  return "";
};
function gt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, a) => {
      var s;
      return o + r + ((s = fe(t[a], { dt: je })) != null ? s : "");
    }, "");
    return yo(n, je);
  }
  return fe(e, { dt: je });
}
function ta(e, t = {}) {
  let n = Z.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: o }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let f in d) {
      let h = d[f], w = Qr(h), k = Le(f, a) ? Ft(c) : Ft(c, uo(f));
      if (_e(w)) i.push({ node: w, path: k });
      else {
        let y = vo(k), $ = go(w, k, o, [a]);
        Xr(l, y, $);
        let x = k;
        o && x.startsWith(o + "-") && (x = x.slice(o.length + 1)), s.push(x.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: Fe(r, u) };
}
var ge = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var o;
    return (o = t.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return ta(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a, s, l, i, u, d, c;
  let { preset: f, options: h } = t, w, k, y, $, x, m, p;
  if (X(f) && h.transform !== "strict") {
    let { primitive: v, semantic: P, extend: L } = f, J = P || {}, { colorScheme: C } = J, R = Ce(J, ["colorScheme"]), j = L || {}, { colorScheme: B } = j, Q = Ce(j, ["colorScheme"]), F = C || {}, { dark: re } = F, Te = Ce(F, ["dark"]), Se = B || {}, { dark: T } = Se, O = Ce(Se, ["dark"]), I = X(v) ? this._toVariables({ primitive: v }, h) : {}, D = X(R) ? this._toVariables({ semantic: R }, h) : {}, ie = X(Te) ? this._toVariables({ light: Te }, h) : {}, me = X(re) ? this._toVariables({ dark: re }, h) : {}, Oe = X(Q) ? this._toVariables({ semantic: Q }, h) : {}, mt = X(O) ? this._toVariables({ light: O }, h) : {}, Pe = X(T) ? this._toVariables({ dark: T }, h) : {}, [ht, Ko] = [(a = I.declarations) != null ? a : "", I.tokens], [Go, Yo] = [(s = D.declarations) != null ? s : "", D.tokens || []], [Qo, Zo] = [(l = ie.declarations) != null ? l : "", ie.tokens || []], [Jo, Xo] = [(i = me.declarations) != null ? i : "", me.tokens || []], [er, tr] = [(u = Oe.declarations) != null ? u : "", Oe.tokens || []], [nr, or] = [(d = mt.declarations) != null ? d : "", mt.tokens || []], [rr, ar] = [(c = Pe.declarations) != null ? c : "", Pe.tokens || []];
    w = this.transformCSS(e, ht, "light", "variable", h, o, r), k = Ko;
    let ir = this.transformCSS(e, `${Go}${Qo}`, "light", "variable", h, o, r), sr = this.transformCSS(e, `${Jo}`, "dark", "variable", h, o, r);
    y = `${ir}${sr}`, $ = [.../* @__PURE__ */ new Set([...Yo, ...Zo, ...Xo])];
    let lr = this.transformCSS(e, `${er}${nr}color-scheme:light`, "light", "variable", h, o, r), ur = this.transformCSS(e, `${rr}color-scheme:dark`, "dark", "variable", h, o, r);
    x = `${lr}${ur}`, m = [.../* @__PURE__ */ new Set([...tr, ...or, ...ar])], p = fe(f.css, { dt: je });
  }
  return { primitive: { css: w, tokens: k }, semantic: { css: y, tokens: $ }, global: { css: x, tokens: m }, style: p };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: a, selector: s }) {
  var l, i, u;
  let d, c, f;
  if (X(t) && n.transform !== "strict") {
    let h = e.replace("-directive", ""), w = t, { colorScheme: k, extend: y, css: $ } = w, x = Ce(w, ["colorScheme", "extend", "css"]), m = y || {}, { colorScheme: p } = m, v = Ce(m, ["colorScheme"]), P = k || {}, { dark: L } = P, J = Ce(P, ["dark"]), C = p || {}, { dark: R } = C, j = Ce(C, ["dark"]), B = X(x) ? this._toVariables({ [h]: ye(ye({}, x), v) }, n) : {}, Q = X(J) ? this._toVariables({ [h]: ye(ye({}, J), j) }, n) : {}, F = X(L) ? this._toVariables({ [h]: ye(ye({}, L), R) }, n) : {}, [re, Te] = [(l = B.declarations) != null ? l : "", B.tokens || []], [Se, T] = [(i = Q.declarations) != null ? i : "", Q.tokens || []], [O, I] = [(u = F.declarations) != null ? u : "", F.tokens || []], D = this.transformCSS(h, `${re}${Se}`, "light", "variable", n, r, a, s), ie = this.transformCSS(h, O, "dark", "variable", n, r, a, s);
    d = `${D}${ie}`, c = [.../* @__PURE__ */ new Set([...Te, ...T, ...I])], f = fe($, { dt: je });
  }
  return { css: d, tokens: c, style: f };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a;
  let { preset: s, options: l } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: l, params: n, set: o, defaults: r });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a, s;
  let l = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((a = i?.components) == null ? void 0 : a[l]) || ((s = i?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: o, defaults: r });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: r } = t;
  return r ? `@layer ${fe(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: a }), l = Object.entries(o).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [u, d]) => {
    if (_e(d) && Object.hasOwn(d, "css")) {
      let c = He(d.css), f = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${f}" ${l}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: n, set: r, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(o).reduce((d, [c, f]) => d.push(`${c}="${f}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${He(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let a = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Ye.test(this.value)) {
      let c = this.value.trim().replace(Ye, (f) => {
        var h;
        let w = f.slice(1, -1), k = this.tokens[w];
        if (!k) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let y = k.computed(l, i, u);
        return Array.isArray(y) && y.length === 2 ? `light-dark(${y[0].value},${y[1].value})` : (h = y?.value) != null ? h : "__UNRESOLVED__";
      });
      d = ho.test(c.replace(bo, "0")) ? `calc(${c})` : c;
    }
    return Re(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let f = Le(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${xn(d)}` : xn(d), h = u ? `${u}.${d}` : d;
      _e(c) ? s(c, f, h) : (r[f] || (r[f] = { paths: [], computed: (w, k = {}, y = []) => {
        if (r[f].paths.length === 1) return r[f].paths[0].computed(r[f].paths[0].scheme, k.binding, y);
        if (w && w !== "none") for (let $ = 0; $ < r[f].paths.length; $++) {
          let x = r[f].paths[$];
          if (x.scheme === w) return x.computed(w, k.binding, y);
        }
        return r[f].paths.map(($) => $.computed($.scheme, k[$.scheme], y));
      } }), r[f].paths.push({ path: h, value: c, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: r }));
    });
  };
  return s(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((l) => l.split(".").filter((i) => !Le(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(o = e[r]) == null ? void 0 : o.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Ce(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? Fe(X(t) ? `${e}${t},${e} ${t}` : e, o) : Fe(e, Fe(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, a, s, l) {
  if (X(t)) {
    let { cssLayer: i } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: f }) => (X(f) && (d += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, l, c, t)), d), "") : Fe(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      _e(i) && (u.name = fe(i.name, { name: e, type: o })), X(u.name) && (t = Fe(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, Z = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = It(ye({}, t), { options: ye(ye({}, this.defaults.options), t.options) }), this._tokens = ge.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), se.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = It(ye({}, this.theme), { preset: e }), this._tokens = ge.createTokens(e, this.defaults), this.clearLoadedStyleNames(), se.emit("preset:change", e), se.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = It(ye({}, this.theme), { options: e }), this.clearLoadedStyleNames(), se.emit("options:change", e), se.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return ge.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ge.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return ge.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return ge.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ge.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ge.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), se.emit(`theme:${t}:load`, e), !this._loadingStyles.size && se.emit("theme:load"));
} }, le = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
}, na = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function Qe(e) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Qe(e);
}
function kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _n(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kn(Object(n), !0).forEach(function(o) {
      oa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function oa(e, t, n) {
  return (t = ra(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ra(e) {
  var t = aa(e, "string");
  return Qe(t) == "symbol" ? t : t + "";
}
function aa(e, t) {
  if (Qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ia(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  pn() && pn().components ? en(e) : t ? e() : Ke(e);
}
var sa = 0;
function la(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), o = U(e), r = U(null), a = po() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, f = t.name, h = f === void 0 ? "style_".concat(++sa) : f, w = t.id, k = w === void 0 ? void 0 : w, y = t.media, $ = y === void 0 ? void 0 : y, x = t.nonce, m = x === void 0 ? void 0 : x, p = t.first, v = p === void 0 ? !1 : p, P = t.onMounted, L = P === void 0 ? void 0 : P, J = t.onUpdated, C = J === void 0 ? void 0 : J, R = t.onLoad, j = R === void 0 ? void 0 : R, B = t.props, Q = B === void 0 ? {} : B, F = function() {
  }, re = function(T) {
    var O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var I = _n(_n({}, Q), O), D = I.name || h, ie = I.id || k, me = I.nonce || m;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(ie) || l.createElement("style"), r.value.isConnected || (o.value = T || e, _t(r.value, {
        type: "text/css",
        id: ie,
        media: $,
        nonce: me
      }), v ? l.head.prepend(r.value) : l.head.appendChild(r.value), Ur(r.value, "data-primevue-style-id", D), _t(r.value, I), r.value.onload = function(Oe) {
        return j?.(Oe, {
          name: D
        });
      }, L?.(D)), !n.value && (F = ae(o, function(Oe) {
        r.value.textContent = Oe, C?.(D);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Te = function() {
    !l || !n.value || (F(), Vr(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && ia(re), {
    id: k,
    name: h,
    el: r,
    css: o,
    unload: Te,
    load: re,
    isLoaded: dr(n)
  };
}
function Ze(e) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ze(e);
}
var $n, Sn, Pn, Cn;
function Tn(e, t) {
  return pa(e) || ca(e, t) || da(e, t) || ua();
}
function ua() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function da(e, t) {
  if (e) {
    if (typeof e == "string") return On(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? On(e, t) : void 0;
  }
}
function On(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ca(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function pa(e) {
  if (Array.isArray(e)) return e;
}
function An(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function zt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(o) {
      fa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function fa(e, t, n) {
  return (t = ma(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ma(e) {
  var t = ha(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function ha(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function yt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ba = function(t) {
  var n = t.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, va = {}, ga = {}, Y = {
  name: "base",
  css: ba,
  style: na,
  classes: va,
  inlineStyles: ga,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, r = o(gt($n || ($n = yt(["", ""])), t));
    return X(r) ? la(He(r), zt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return Z.transformCSS(n.name || t.name, "".concat(r).concat(gt(Sn || (Sn = yt(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return Z.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return Z.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return Z.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return Z.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return Z.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = fe(this.css, {
        dt: je
      }) || "", r = He(gt(Pn || (Pn = yt(["", "", ""])), o, t)), a = Object.entries(n).reduce(function(s, l) {
        var i = Tn(l, 2), u = i[0], d = i[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return X(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return Z.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [Z.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = gt(Cn || (Cn = yt(["", ""])), fe(this.style, {
        dt: je
      })), s = He(Z.transformCSS(r, a)), l = Object.entries(n).reduce(function(i, u) {
        var d = Tn(u, 2), c = d[0], f = d[1];
        return i.push("".concat(c, '="').concat(f, '"')) && i;
      }, []).join(" ");
      X(s) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return zt(zt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ee = co();
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function En(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function wt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(o) {
      ya(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ya(e, t, n) {
  return (t = wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wa(e) {
  var t = xa(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function xa(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ka = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [le.STARTS_WITH, le.CONTAINS, le.NOT_CONTAINS, le.ENDS_WITH, le.EQUALS, le.NOT_EQUALS],
    numeric: [le.EQUALS, le.NOT_EQUALS, le.LESS_THAN, le.LESS_THAN_OR_EQUAL_TO, le.GREATER_THAN, le.GREATER_THAN_OR_EQUAL_TO],
    date: [le.DATE_IS, le.DATE_IS_NOT, le.DATE_BEFORE, le.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, _a = Symbol();
function $a(e, t) {
  var n = {
    config: tn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(_a, n), Sa(), Pa(e, n), n;
}
var Be = [];
function Sa() {
  se.clear(), Be.forEach(function(e) {
    return e?.();
  }), Be = [];
}
function Pa(e, t) {
  var n = U(!1), o = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !Z.isStyleNameLoaded("common")) {
      var d, c, f = ((d = Y.getCommonTheme) === null || d === void 0 ? void 0 : d.call(Y)) || {}, h = f.primitive, w = f.semantic, k = f.global, y = f.style, $ = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      Y.load(h?.css, wt({
        name: "primitive-variables"
      }, $)), Y.load(w?.css, wt({
        name: "semantic-variables"
      }, $)), Y.load(k?.css, wt({
        name: "global-variables"
      }, $)), Y.loadStyle(wt({
        name: "global-style"
      }, $), y), Z.setLoadedStyleName("common");
    }
  };
  se.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var r = ae(t.config, function(i, u) {
    Ee.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ae(function() {
    return t.config.ripple;
  }, function(i, u) {
    Ee.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ae(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || Z.setTheme(i), t.config.unstyled || o(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ae(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && o(), Ee.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Be.push(r), Be.push(a), Be.push(s), Be.push(l);
}
var Ca = {
  install: function(t, n) {
    var o = Lr(ka, n);
    $a(t, o);
  }
}, wo = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = po();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ta(e, t, n, o, r, a) {
  return a.inline ? ue(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (b(), W(no, {
    key: 1,
    to: n.appendTo
  }, [ue(e.$slots, "default")], 8, ["to"])) : N("", !0);
}
wo.render = Ta;
var Ae = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(t) {
    return this._loadedStyleNames.has(t);
  },
  setLoadedStyleName: function(t) {
    this._loadedStyleNames.add(t);
  },
  deleteLoadedStyleName: function(t) {
    this._loadedStyleNames.delete(t);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function Oa() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = nn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ln = Y.extend({
  name: "common"
});
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function Aa(e) {
  return _o(e) || Ea(e) || ko(e) || xo();
}
function Ea(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Me(e, t) {
  return _o(e) || La(e, t) || ko(e, t) || xo();
}
function xo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ko(e, t) {
  if (e) {
    if (typeof e == "string") return Bt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bt(e, t) : void 0;
  }
}
function Bt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function La(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function _o(e) {
  if (Array.isArray(e)) return e;
}
function jn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function K(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(o) {
      Ue(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ue(e, t, n) {
  return (t = ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ja(e) {
  var t = Na(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function Na(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var De = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(t) {
        se.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        se.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, o, r, a, s, l, i, u, d, c, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, h = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = f ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = w || h) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (a = r.onBeforeCreate) === null || a === void 0 || a.call(r);
    var k = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, y = k ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, $ = k ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = $ || y) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Oa(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Br(ft(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = K({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(t) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return rn(t) ? t.apply(void 0, o) : q.apply(void 0, o);
    },
    _load: function() {
      Ae.isStyleNameLoaded("base") || (Y.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ae.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ln.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ae.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      X(t) && Y.load(t, K({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!Z.isStyleNameLoaded("common")) {
          var o, r, a = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, s = a.primitive, l = a.semantic, i = a.global, u = a.style;
          Y.load(s?.css, K({
            name: "primitive-variables"
          }, this.$styleOptions)), Y.load(l?.css, K({
            name: "semantic-variables"
          }, this.$styleOptions)), Y.load(i?.css, K({
            name: "global-variables"
          }, this.$styleOptions)), Y.loadStyle(K({
            name: "global-style"
          }, this.$styleOptions), u), Z.setLoadedStyleName("common");
        }
        if (!Z.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, f, h, w = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, k = w.css, y = w.style;
          (f = this.$style) === null || f === void 0 || f.load(k, K({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (h = this.$style) === null || h === void 0 || h.loadStyle(K({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), y), Z.setLoadedStyleName(this.$style.name);
        }
        if (!Z.isStyleNameLoaded("layer-order")) {
          var $, x, m = ($ = this.$style) === null || $ === void 0 || (x = $.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call($);
          Y.load(m, K({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), Z.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, K({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Ae.clearLoadedStyleNames(), se.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      se.off("theme:change", this._loadCoreStyles), se.off("theme:change", this._load), se.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return sn(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!r[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a ? s ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, h = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, K(K({}, r), {}, {
        global: f || {}
      })), w = this._getPTDatasets(o);
      return u || !u && h ? c ? this._mergeProps(c, f, h, w) : K(K(K({}, f), h), w) : K(K({}, h), w);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return q(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", a = o === "root" && X((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && K(K({}, o === "root" && K(K(Ue({}, "".concat(r, "name"), ke(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ue({}, "".concat(r, "extend"), ke(this.$.type.name))), {}, Ue({}, "".concat(this.$attrSelector), ""))), {}, Ue({}, "".concat(r, "section"), ke(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ce(t) || lo(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, c = ke(o), f = ke(n.$name);
        return (i = u ? c !== f ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var a = function(k) {
        return n(k, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a(t.originalValue), h = a(t.value);
        return f === void 0 && h === void 0 ? void 0 : ce(h) ? h : ce(f) ? f : u || !u && h ? c ? this._mergeProps(c, f, h) : K(K({}, f), h) : h;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, K(K({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = q(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, K({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, K(K({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, K(K({}, this.$params), o)), a = this._getOptionValue(Ln.inlineStyles, t, K(K({}, this.$params), o));
        return [a, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return fe(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, K({}, n.$params)) || fe(o, K({}, n.$params));
      });
    },
    isUnstyled: function() {
      var t;
      return this.unstyled !== void 0 ? this.unstyled : (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var t, n = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = Me(o, 1), a = r[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return K(K({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var t;
      return {
        nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
      };
    },
    $primevueConfig: function() {
      var t;
      return (t = this.$primevue) === null || t === void 0 ? void 0 : t.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var t = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: t,
          props: t?.$props,
          state: t?.$data,
          attrs: t?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Me(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = Me(n, 2), r = o[0], a = o[1], s = r.split(":"), l = Aa(s), i = Bt(l).slice(1);
        return i?.reduce(function(u, d, c, f) {
          return !u[d] && (u[d] = c === f.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Me(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = Me(n, 2), r = o[0], a = o[1];
        return t[r] = a, t;
      }, {});
    }
  }
}, Ia = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, za = Y.extend({
  name: "baseicon",
  css: Ia
});
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function Nn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function In(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(o) {
      Ra(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ra(e, t, n) {
  return (t = Va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Va(e) {
  var t = Fa(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Fa(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Lt = {
  name: "BaseIcon",
  extends: De,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: za,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Re(this.label);
      return In(In({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: t ? void 0 : "img",
        "aria-label": t ? void 0 : this.label,
        "aria-hidden": t
      });
    }
  }
};
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function zn(e, t) {
  return qa(e) || Ma(e, t) || Da(e, t) || Ba();
}
function Ba() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Da(e, t) {
  if (e) {
    if (typeof e == "string") return Rn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rn(e, t) : void 0;
  }
}
function Rn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ma(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (o = a.call(n)).done) && (l.push(o.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function qa(e) {
  if (Array.isArray(e)) return e;
}
function Vn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function G(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vn(Object(n), !0).forEach(function(o) {
      Dt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Dt(e, t, n) {
  return (t = Ua(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ua(e) {
  var t = Wa(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Wa(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var M = {
  _getMeta: function() {
    return [_e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], fe(_e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, a;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: sn,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var x = M._getOptionValue.apply(M, arguments);
      return ce(x) || lo(x) ? {
        class: x
      } : x;
    }, u = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, f = u.mergeProps, h = f === void 0 ? !1 : f, w = l ? M._useDefaultPT(o, o.defaultPT(), i, a, s) : void 0, k = M._usePT(o, M._getPT(r, o.$name), i, a, G(G({}, s), {}, {
      global: w || {}
    })), y = M._getPTDatasets(o, a);
    return c || !c && k ? h ? M._mergeProps(o, h, w, k, y) : G(G(G({}, w), k), y) : G(G({}, k), y);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return G(G({}, n === "root" && Dt({}, "".concat(o, "name"), ke(t.$name))), {}, Dt({}, "".concat(o, "section"), ke(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var l, i = o ? o(s) : s, u = ke(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(y) {
      return o(y, r, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, f = c === void 0 ? !1 : c, h = s(n.originalValue), w = s(n.value);
      return h === void 0 && w === void 0 ? void 0 : ce(w) ? w : ce(h) ? h : d || !d && w ? f ? M._mergeProps(t, f, h, w) : G(G({}, h), w) : w;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return M._usePT(t, n, o, r, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, a = M._getConfig(o, r), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    M._loadCoreStyles(n, s), M._loadThemeStyles(n, s), M._loadScopedThemeStyles(n, s), M._removeThemeListeners(n), n.$loadStyles = function() {
      return M._loadThemeStyles(n, s);
    }, M._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ae.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      Y.loadCSS(r), (a = o.$style) === null || a === void 0 || a.loadCSS(r), Ae.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!Z.isStyleNameLoaded("common")) {
        var s, l, i = ((s = r.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = i.primitive, d = i.semantic, c = i.global, f = i.style;
        Y.load(u?.css, G({
          name: "primitive-variables"
        }, a)), Y.load(d?.css, G({
          name: "semantic-variables"
        }, a)), Y.load(c?.css, G({
          name: "global-variables"
        }, a)), Y.loadStyle(G({
          name: "global-style"
        }, a), f), Z.setLoadedStyleName("common");
      }
      if (!Z.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var h, w, k, y, $ = ((h = r.$style) === null || h === void 0 || (w = h.getDirectiveTheme) === null || w === void 0 ? void 0 : w.call(h)) || {}, x = $.css, m = $.style;
        (k = r.$style) === null || k === void 0 || k.load(x, G({
          name: "".concat(r.$style.name, "-variables")
        }, a)), (y = r.$style) === null || y === void 0 || y.loadStyle(G({
          name: "".concat(r.$style.name, "-style")
        }, a), m), Z.setLoadedStyleName(r.$style.name);
      }
      if (!Z.isStyleNameLoaded("layer-order")) {
        var p, v, P = (p = r.$style) === null || p === void 0 || (v = p.getLayerOrderThemeCSS) === null || v === void 0 ? void 0 : v.call(p);
        Y.load(P, G({
          name: "layer-order",
          first: !0
        }, a)), Z.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, a, s, l = ((r = t.$style) === null || r === void 0 || (a = r.getPresetTheme) === null || a === void 0 ? void 0 : a.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, G({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ae.clearLoadedStyleNames(), se.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    se.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, a, s) {
    var l, i, u = "on".concat(jr(n)), d = M._getConfig(r, a), c = o?.$instance, f = M._usePT(c, M._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, t), M._getOptionValue, "hooks.".concat(u)), h = M._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], M._getOptionValue, "hooks.".concat(u)), w = {
      el: o,
      binding: r,
      vnode: a,
      prevVnode: s
    };
    f?.(c, w), h?.(c, w);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return rn(t) ? t.apply(void 0, o) : q.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(l, i, u, d, c) {
      var f, h, w, k;
      i._$instances = i._$instances || {};
      var y = M._getConfig(u, d), $ = i._$instances[t] || {}, x = Re($) ? G(G({}, n), n?.methods) : {};
      i._$instances[t] = G(G({}, $), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: $.$el || i || void 0,
        $style: G({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: y,
        $attrSelector: (f = i.$pd) === null || f === void 0 || (f = f[t]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return M._getPT(y?.pt, void 0, function(p) {
            var v;
            return p == null || (v = p.directives) === null || v === void 0 ? void 0 : v[t];
          });
        },
        isUnstyled: function() {
          var p, v;
          return ((p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.unstyled) !== void 0 ? (v = i._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.unstyled : y?.unstyled;
        },
        theme: function() {
          var p;
          return (p = i._$instances[t]) === null || p === void 0 || (p = p.$primevueConfig) === null || p === void 0 ? void 0 : p.theme;
        },
        preset: function() {
          var p;
          return (p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.dt;
        },
        /* instance's methods */
        ptm: function() {
          var p, v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return M._getPTValue(i._$instances[t], (p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.pt, v, G({}, P));
        },
        ptmo: function() {
          var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, v = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", P = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return M._getPTValue(i._$instances[t], p, v, P, !1);
        },
        cx: function() {
          var p, v, P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (p = i._$instances[t]) !== null && p !== void 0 && p.isUnstyled() ? void 0 : M._getOptionValue((v = i._$instances[t]) === null || v === void 0 || (v = v.$style) === null || v === void 0 ? void 0 : v.classes, P, G({}, L));
        },
        sx: function() {
          var p, v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P ? M._getOptionValue((p = i._$instances[t]) === null || p === void 0 || (p = p.$style) === null || p === void 0 ? void 0 : p.inlineStyles, v, G({}, L)) : void 0;
        }
      }, x), i.$instance = i._$instances[t], (h = (w = i.$instance)[l]) === null || h === void 0 || h.call(w, i, u, d, c), i["$".concat(t)] = i.$instance, M._hook(t, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = G(G({}, (k = i.$pd) === null || k === void 0 ? void 0 : k[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, r = function(l) {
      var i, u, d, c = l._$instances[t], f = c?.watch, h = function(y) {
        var $, x = y.newValue, m = y.oldValue;
        return f == null || ($ = f.config) === null || $ === void 0 ? void 0 : $.call(c, x, m);
      }, w = function(y) {
        var $, x = y.newValue, m = y.oldValue;
        return f == null || ($ = f["config.ripple"]) === null || $ === void 0 ? void 0 : $.call(c, x, m);
      };
      c.$watchersCallback = {
        config: h,
        "config.ripple": w
      }, f == null || (i = f.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Ee.on("config:change", h), f == null || (u = f["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ee.on("config:ripple:change", w);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Ee.off("config:change", i.config), Ee.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Wr("pd")
        }, o("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        M._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("beforeMount", l, i, u, d), r(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        M._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        o("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        M._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        a(l), M._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var t = M._getMeta.apply(M, arguments), n = zn(t, 2), o = n[0], r = n[1];
    return G({
      extend: function() {
        var s = M._getMeta.apply(M, arguments), l = zn(s, 2), i = l[0], u = l[1];
        return M.extend(i, G(G(G({}, r), r?.methods), u));
      }
    }, M._extend(o, r));
  }
}, Ha = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, Ka = {
  root: "p-ink"
}, Ga = Y.extend({
  name: "ripple-directive",
  style: Ha,
  classes: Ka
}), Ya = M.extend({
  style: Ga
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function Qa(e) {
  return ei(e) || Xa(e) || Ja(e) || Za();
}
function Za() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(e, t) {
  if (e) {
    if (typeof e == "string") return Mt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(e, t) : void 0;
  }
}
function Xa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ei(e) {
  if (Array.isArray(e)) return Mt(e);
}
function Mt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Fn(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $o = Ya.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var n = this.getInk(t);
      n || (n = Fr("span", Fn(Fn({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, o = t.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && Nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !gn(r) && !yn(r)) {
          var a = Math.max(zr(o), qr(o));
          r.style.height = a + "px", r.style.width = a + "px";
        }
        var s = Mr(o), l = t.pageX - s.left + document.body.scrollTop - yn(r) / 2, i = t.pageY - s.top + document.body.scrollLeft - gn(r) / 2;
        r.style.top = i + "px", r.style.left = l + "px", !this.isUnstyled() && Ir(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Nt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Qa(t.children).find(function(n) {
        return Dr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const oi = "data-wippy-overlay-layer";
function So() {
  return typeof window < "u" && typeof window.document < "u";
}
function Po() {
  return So() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ri() {
  return Po() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const ai = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ii = 0;
const St = /* @__PURE__ */ new WeakMap();
function Bn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function si(e, t) {
  if (!ai.test(e.className))
    return;
  const n = e.style.cssText;
  Bn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!St.has(e)) {
    const o = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Bn(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), St.set(e, o);
  }
}
function ln(e) {
  const t = St.get(e);
  t && (t.disconnect(), St.delete(e));
}
function li(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function qt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Pt = /* @__PURE__ */ new Set(), un = /* @__PURE__ */ new WeakMap();
let Dn = !1, Ut = !1;
function ui() {
  Ut = !1;
  for (const e of Pt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ln(t);
      Pt.delete(e), un.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && qt(e);
  }
}
function Mn() {
  Ut || (Ut = !0, requestAnimationFrame(ui));
}
function di(e) {
  const t = document.createElement("div");
  t.setAttribute(oi, "");
  const n = Po();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  qt(t);
  const o = new MutationObserver((r) => {
    const a = t.__wippyAnchorName;
    for (const s of r) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && si(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && ln(l);
    }
    t.isConnected && t.childElementCount > 0 && qt(t);
  });
  return o.observe(t, { childList: !0 }), un.set(t, o), Pt.add(t), Dn || (Dn = !0, window.addEventListener("scroll", Mn, { capture: !0, passive: !0 }), window.addEventListener("resize", Mn, { passive: !0 })), t;
}
function qn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = di(e.hostRoot), ri())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ii}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Un(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && ln(t);
    Pt.delete(e.layer), un.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Wn = !1;
function ci() {
  if (Wn)
    return;
  Wn = !0;
  const e = wo;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    So() && (this.hostRoot = li(this.$el), this.mounted = !0, this.hostRoot && (this.inline || qn(this), this.$watch("inline", (t) => {
      t ? Un(this) : qn(this);
    })));
  }, e.render = function() {
    return this.inline ? ue(this.$slots, "default", { key: 0 }) : this.mounted ? cr(no, { key: 1, to: this.resolvedTarget || document.body }, [
      ue(this.$slots, "default")
    ]) : N("", !0);
  }, e.unmounted = function() {
    Un(this);
  };
}
const pi = {
  install: (e) => {
    ci(), e.use(Ca, { theme: "none" });
  }
};
var Wt = "data-wippy-visible";
function Hn(e) {
  const t = e.getAttribute(Wt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var fi = Object.defineProperty, mi = (e, t, n) => t in e ? fi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, te = (e, t, n) => mi(e, typeof t != "symbol" ? t + "" : t, n), hi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], bi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Kn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function vi(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [s, l] of Object.entries(r)) {
            const i = typeof l == "string" ? Kn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof r == "string" ? Kn(o) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function gi(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${bi} {
${t}
}`;
}
function yi(e, t) {
  const n = gi(t);
  n && Co(e, n, "@wippy-fe/css-variables-bridge");
}
function wi(e, t) {
  const o = (t ?? hi).map(async (r) => {
    const a = gr[r];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await yr(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${a}):`, s), null;
    }
  });
  return Promise.all(o).then((r) => {
    for (const a of r) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function xi(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Co(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = t, e.appendChild(o);
}
function ki(e, t) {
  Co(e, t, "@wippy-fe/custom-css");
}
function To(e) {
  return e.__wippyHost ?? null;
}
function _i(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function $i(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const o = Number.parseFloat(t);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(t, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(t);
        return n.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Rt(e, t) {
  const n = {}, o = [];
  for (const [r, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(r), l = _i(r);
    if (s === null) {
      a.default !== void 0 && (n[l] = a.default);
      continue;
    }
    const i = $i(r, s, a);
    i.error ? o.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: o };
}
var Si = class {
  constructor(e, t) {
    te(this, "_props"), te(this, "_errors"), te(this, "_content"), te(this, "_hostVisibility"), te(this, "_propsListeners", /* @__PURE__ */ new Set()), te(this, "_contentListeners", /* @__PURE__ */ new Set()), te(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), te(this, "_disposed", !1), te(this, "_emitToDom"), te(this, "props"), te(this, "events"), te(this, "content"), te(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(o, r) {
        return n._subscribeProps(o, r);
      }
    }, this.events = {
      emit(o, r) {
        n._disposed || n._emitToDom(o, r);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(o, r) {
        return n._subscribeContent(o, r);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(o, r) {
        return n._subscribeHostVisibility(o, r);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const n of this._hostVisibilityListeners)
        n(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Pi = class extends HTMLElement {
  constructor() {
    super(), te(this, "_internals"), te(this, "_contentObserver", null), te(this, "_initialized", !1), te(this, "_container", null), te(this, "_reactive", null), te(this, "_lastProps", null), te(this, "_lastErrors", []), te(this, "_lastContent", null), te(this, "_themeUnsub", null), te(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Hn(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, Wt])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return To(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let n, o;
      if (this._lastProps !== null)
        n = this._lastProps, o = this._lastErrors;
      else {
        const a = Rt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, o = a.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new Si(
        { props: n, errors: o, content: r, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(n), e.inlineCss && xi(n, e.inlineCss);
        try {
          const u = fn?.theming, d = vi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          yi(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = fn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && ki(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && wi(n, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && o.classList.add(...i), n.appendChild(o), this._container = o, br(hr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = kt("@theme", (i) => this._applyTheme(i)));
      const { props: r, errors: a } = Rt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(r));
      const s = r;
      this._lastProps = s, this._lastErrors = a;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, o, s, a, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(e = vr.getThemeMode?.()) {
    bt(e, this), this._container && bt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), bt("auto", this), this._container && bt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Wt) {
      const l = this._hostVisible, i = Hn(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: a } = Rt(this, o.propsSchema);
    o.validateProps && a.push(...o.validateProps(r));
    const s = r;
    this._lastProps = s, this._lastErrors = a, this._reactive?.notifyProps(s, a), this.onPropsChanged(s, a);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function Ci(e) {
  return e.__wippyHostBus ?? null;
}
function Ti(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Oi = Object.defineProperty, Ai = (e, t, n) => t in e ? Oi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ve = (e, t, n) => Ai(e, typeof t != "symbol" ? t + "" : t, n), Oo = /* @__PURE__ */ Symbol("wippy:emit"), Ao = /* @__PURE__ */ Symbol("wippy:props"), Eo = /* @__PURE__ */ Symbol("wippy:props_error"), Ei = /* @__PURE__ */ Symbol("wippy:content"), Li = /* @__PURE__ */ Symbol("wippy:panel-id"), ji = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ni = /* @__PURE__ */ Symbol("wippy:host"), Ii = /* @__PURE__ */ Symbol("wippy:host-visibility");
function zi() {
  const e = pt(Ao);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ri() {
  const e = pt(Oo);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Vi() {
  const e = pt(Eo);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Fi = class extends Pi {
  constructor() {
    super(...arguments), Ve(this, "_vueApp", null), Ve(this, "_propsRef", U({})), Ve(this, "_errorsRef", U([])), Ve(this, "_contentRef", U(null)), Ve(this, "_hostVisibilityRef", U(null)), Ve(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, o, r, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = o, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of o)
      this.emitEvent("invalid", { message: u });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: l.signal });
    const i = (u) => {
      if (l.signal.aborted)
        return;
      const d = xr(), c = pr(u.rootComponent);
      this._vueApp = c;
      const f = kr();
      if (u.piniaPlugins)
        for (const h of u.piniaPlugins)
          f.use(h);
      if (c.use(f), u.plugins)
        for (const h of u.plugins)
          c.use(h);
      c.provide(Ao, this._propsRef), c.provide(Eo, this._errorsRef), c.provide(Oo, this.emitEvent.bind(this)), c.provide(Ei, this._contentRef), c.provide(Ii, this._hostVisibilityRef), c.provide(Li, Ti(this)), c.provide(ji, Ci(this)), c.provide(Ni, To(this)), u.providers && u.providers(c, this), c.mount(t), d && _r(d);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), s.lazyConfig().then((d) => {
        l.signal.aborted || (u.remove(), i(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), f = document.createElement("wippy-error");
        f.setAttribute("title", "Failed to load"), f.setAttribute("message", c), u.replaceWith(f), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Bi = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows an "needs a newer app" notice instead.' }, definition: { type: "object", default: null, description: 'Immutable form definition: `title`, optional `description`, optional `submit_label`, optional `answered_message` (not displayed), and `fields` (each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`). When every field is `type: "choice"` the question-card UI renders; otherwise the radio/checkbox fields form renders.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' }, density: { type: "string", default: "compact", description: 'Question-card sizing: "compact" (default) or "comfortable", a larger size/spacing scale. Read purely through the `:host([density="comfortable"])` CSS selector — no JS reads it — but must be a declared prop so the package-tag mount path can set it as an attribute.' } } } }, Di = {
  wippy: Bi
};
var Lo = {
  name: "SpinnerIcon",
  extends: Lt
};
function Mi(e) {
  return Hi(e) || Wi(e) || Ui(e) || qi();
}
function qi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ui(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function Wi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hi(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ki(e, t, n, o, r, a) {
  return b(), g("svg", q({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Mi(t[0] || (t[0] = [E("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Lo.render = Ki;
var Gi = `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`, Yi = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": X(n.value) && String(n.value).length === 1,
      "p-badge-dot": Re(n.value) && !o.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, Qi = Y.extend({
  name: "badge",
  style: Gi,
  classes: Yi
}), Zi = {
  name: "BaseBadge",
  extends: De,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: Qi,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Gn(e, t, n) {
  return (t = Ji(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ji(e) {
  var t = Xi(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Xi(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jo = {
  name: "Badge",
  extends: Zi,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return $e(Gn(Gn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, es = ["data-p"];
function ts(e, t, n, o, r, a) {
  return b(), g("span", q({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [ue(e.$slots, "default", {}, function() {
    return [oe(V(e.value), 1)];
  })], 16, es);
}
jo.render = ts;
var ns = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: " ";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function xe(e, t, n) {
  return (t = os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function os(e) {
  var t = rs(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function rs(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (rt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var as = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", xe(xe(xe(xe(xe(xe(xe(xe(xe({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", xe({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, is = Y.extend({
  name: "button",
  style: ns,
  classes: as
}), ss = {
  name: "BaseButton",
  extends: De,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: [String, Object],
      default: null
    },
    badgeSeverity: {
      type: String,
      default: "secondary"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: is,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function de(e, t, n) {
  return (t = ls(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ls(e) {
  var t = us(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function us(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (at(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ve = {
  name: "Button",
  extends: ss,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    },
    attrs: function() {
      return q(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        "aria-label": this.defaultAriaLabel,
        "data-pc-name": "button",
        "data-p-disabled": this.disabled,
        "data-p-severity": this.severity
      };
    },
    hasFluid: function() {
      return Re(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return $e(de(de(de(de(de(de(de(de(de(de({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return $e(de(de({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return $e(de(de({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Lo,
    Badge: jo
  },
  directives: {
    ripple: $o
  }
}, ds = ["data-p"], cs = ["data-p"];
function ps(e, t, n, o, r, a) {
  var s = Ge("SpinnerIcon"), l = Ge("Badge"), i = oo("ripple");
  return e.asChild ? ue(e.$slots, "default", {
    key: 1,
    class: A(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ro((b(), W(ao(e.as), q({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: ne(function() {
      return [ue(e.$slots, "default", {}, function() {
        return [e.loading ? ue(e.$slots, "loadingicon", q({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (b(), g("span", q({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (b(), W(s, q({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ue(e.$slots, "icon", q({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (b(), g("span", q({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, ds)) : N("", !0)];
        }), e.label ? (b(), g("span", q({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), V(e.label), 17, cs)) : N("", !0), e.badge ? (b(), W(l, {
          key: 3,
          value: e.badge,
          class: A(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : N("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
ve.render = ps;
var No = {
  name: "TimesIcon",
  extends: Lt
};
function fs(e) {
  return vs(e) || bs(e) || hs(e) || ms();
}
function ms() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hs(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function bs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vs(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function gs(e, t, n, o, r, a) {
  return b(), g("svg", q({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fs(t[0] || (t[0] = [E("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
No.render = gs;
var ys = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, ws = {
  root: function(t) {
    var n = t.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, xs = Y.extend({
  name: "message",
  style: ys,
  classes: ws
}), ks = {
  name: "BaseMessage",
  extends: De,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: xs,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function Yn(e, t, n) {
  return (t = _s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _s(e) {
  var t = $s(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function $s(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var we = {
  name: "Message",
  extends: ks,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return $e(Yn(Yn({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: $o
  },
  components: {
    TimesIcon: No
  }
};
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Qn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Zn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qn(Object(n), !0).forEach(function(o) {
      Ss(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ss(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Cs(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ts = ["data-p"], Os = ["data-p"], As = ["data-p"], Es = ["aria-label", "data-p"], Ls = ["data-p"];
function js(e, t, n, o, r, a) {
  var s = Ge("TimesIcon"), l = oo("ripple");
  return b(), W(fr, q({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ne(function() {
      return [r.visible ? (b(), g("div", q({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [E("div", q({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? ue(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (b(), g("div", q({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [ue(e.$slots, "icon", {
        class: A(e.cx("icon"))
      }, function() {
        return [(b(), W(ao(e.icon ? "span" : null), q({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (b(), g("div", q({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [ue(e.$slots, "default")], 16, As)) : N("", !0), e.closable ? ro((b(), g("button", q({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, Zn(Zn({}, e.closeButtonProps), e.ptm("closeButton"))), [ue(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (b(), g("i", q({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, Ls)) : (b(), W(s, q({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Es)), [[l]]) : N("", !0)], 16, Os))], 16)], 16, Ts)) : N("", !0)];
    }),
    _: 3
  }, 16);
}
we.render = js;
const Ns = () => zi(), Is = () => Ri(), zs = Vi, Rs = 2e3;
function Vs() {
  const e = on.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Fs(e, t) {
  let n = null;
  const o = /* @__PURE__ */ new Set();
  function r() {
    n && clearTimeout(n), n = null;
  }
  ae(() => [e.value?.artifact_id, e.value?.status, e.value?.delivery], () => {
    const a = e.value;
    if (!a || a.status !== "idle" || a.delivery !== "pending" || o.has(a.artifact_id))
      return;
    r();
    const s = a.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== s || l.delivery !== "pending" || o.has(s) || (o.add(s), Vs()?.send({ type: "session_open", session_id: l.session_id }));
    }, Rs);
  }, { immediate: !0 }), Et(r);
}
const Bs = 5e3;
function Ds(e, t) {
  const n = U("idle"), o = U(null), r = U(null), a = U(null);
  let s = 0, l = null, i = null, u = null, d = null;
  function c() {
    return on.artifactState;
  }
  let f = null, h = !1;
  function w() {
    h || f || (h = !0, f = setTimeout(() => {
      f = null, y();
    }, Bs));
  }
  async function k() {
    const P = e.value;
    if (!P) {
      n.value = "idle", o.value = null, a.value = null;
      return;
    }
    const L = c();
    if (typeof L != "function") {
      n.value = "unsupported", r.value = "This form needs a newer Web Host.";
      return;
    }
    const J = ++s, C = o.value === null;
    C && (n.value = "loading");
    try {
      const R = await L(P).get();
      if (J !== s)
        return;
      o.value = R, n.value = "loaded", r.value = null, a.value = null, h = !1;
    } catch (R) {
      if (J !== s)
        return;
      const j = R instanceof Error ? R.message : "Could not load this form.";
      C ? (n.value = "error", r.value = j) : (a.value = j, w());
    }
  }
  function y() {
    return l ? (i || (i = l.then(() => (i = null, y()))), i) : (l = k().finally(() => {
      l = null;
    }), l);
  }
  function $(P) {
    d !== P && (u?.(), u = null, d = P, P && (u = kt(`artifact:${P}`, () => {
      y();
    })));
  }
  ae(e, (P) => {
    s++, o.value = null, a.value = null, $(P), y();
  }, { immediate: !0 }), ae(t, () => {
    y();
  });
  const x = S(() => {
    const P = o.value;
    return P?.session_id && (P.status === "active" && !P.stale || P.status === "idle" && P.delivery && P.delivery !== "complete") ? P.session_id : null;
  });
  let m = null;
  ae(x, (P) => {
    m?.(), m = null, P && (m = kt(`session:${P}:message:*`, (L) => {
      L.data?.type !== "chunk" && y();
    }));
  }, { immediate: !0 });
  const p = kt("@visibility", (P) => {
    P && y();
  });
  Et(() => {
    s++, f && clearTimeout(f), f = null, u?.(), u = null, m?.(), m = null, p();
  });
  async function v() {
    return await y(), o.value;
  }
  return { status: n, state: o, errorMessage: r, reloadError: a, reload: () => {
    y();
  }, refresh: v };
}
function Ms() {
  if (typeof crypto < "u" && typeof crypto.randomUUID == "function")
    return crypto.randomUUID();
  const e = new Uint8Array(16);
  if (typeof crypto < "u" && typeof crypto.getRandomValues == "function")
    crypto.getRandomValues(e);
  else
    for (let n = 0; n < e.length; n++) e[n] = Math.floor(Math.random() * 256);
  e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
  const t = Array.from(e, (n) => n.toString(16).padStart(2, "0")).join("");
  return `${t.slice(0, 8)}-${t.slice(8, 12)}-${t.slice(12, 16)}-${t.slice(16, 20)}-${t.slice(20)}`;
}
function qs(e) {
  return !!e && typeof e == "object" && ("response" in e || "request" in e);
}
function Io(e) {
  return e instanceof Error && (e.name === "ArtifactStateError" || "status" in e || "formErrors" in e);
}
function Us(e) {
  if (Io(e))
    return { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" };
  if (qs(e)) {
    const t = e.response === void 0 && e.request !== void 0;
    return { status: e.response?.status, code: e.response?.data?.code, message: e.response?.data?.message ?? e.message, known: !0, noResponse: t };
  }
  return { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Jn(e) {
  return !Io(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function Xn(e) {
  const t = Us(e);
  if (t.known) {
    const n = t.status;
    if (n === void 0)
      return t.noResponse ? { code: "network_error", message: "Network problem. Retrying…", retryable: !0, uncertain: !0, shouldReload: !1 } : { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !0, uncertain: !1, shouldReload: !1 };
    if (n === 401)
      return { code: "auth", message: "You are signed out. Sign in again, then retry.", retryable: !1, uncertain: !1, shouldReload: !1 };
    if (n === 404)
      return { code: "not_found", message: "This form is no longer available.", retryable: !1, uncertain: !1, shouldReload: !1 };
    if (n === 409) {
      const o = t.code;
      return o === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : o === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 };
    }
    return n === 429 ? { code: "rate_limited", message: "Too many attempts. Wait a moment and try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !0, uncertain: !1, shouldReload: !1 };
}
const Ws = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function Hs(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Ks(e) {
  return JSON.stringify(e);
}
function Gs(e) {
  const t = U(!1), n = U(null), o = U(null);
  let r = 0;
  ae(e, () => {
    r++, s();
  });
  function a(u) {
    const d = Ks(u);
    if (n.value && o.value === d)
      return n.value;
    const c = Ms();
    return n.value = c, o.value = d, c;
  }
  function s() {
    n.value = null, o.value = null;
  }
  function l() {
    return on.artifactState;
  }
  async function i(u, d, c) {
    const f = e.value;
    if (!f)
      return { ok: !1, message: "This form cannot be submitted here." };
    const h = l();
    if (typeof h != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const w = r, k = a(c), y = {
      form_version: u,
      request_id: k,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let $;
      try {
        $ = await h(f).submit(y);
      } catch (x) {
        if (w !== r)
          return { ok: !1, ignored: !0 };
        const m = Jn(x);
        if (m)
          return { ok: !1, fieldErrors: m.errors, formErrors: m.formErrors };
        const p = Xn(x);
        if (!p.uncertain)
          return { ok: !1, message: p.message, code: p.code, retryable: p.retryable, shouldReload: p.shouldReload };
        if (await Hs(800), w !== r)
          return { ok: !1, ignored: !0 };
        try {
          $ = await h(f).submit(y);
        } catch (v) {
          if (w !== r)
            return { ok: !1, ignored: !0 };
          const P = Jn(v);
          if (P)
            return { ok: !1, fieldErrors: P.errors, formErrors: P.formErrors };
          const L = Xn(v), J = L.uncertain ? Ws : L.message, C = L.uncertain ? !0 : L.retryable;
          return { ok: !1, message: J, code: L.code, retryable: C, shouldReload: L.shouldReload };
        }
      }
      return w !== r ? { ok: !1, ignored: !0 } : (s(), { ok: !0, accepted: $ });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: s };
}
const dn = Symbol("wippy-form:element"), xt = "data-wippy-artifact-id";
function Ys() {
  const e = pt(dn), t = U(e?.getAttribute(xt) ?? null);
  if (e) {
    let n = null;
    en(() => {
      t.value = e.getAttribute(xt), n = new MutationObserver(() => {
        t.value = e.getAttribute(xt);
      }), n.observe(e, { attributes: !0, attributeFilter: [xt] });
    }), Et(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Qs(e, t) {
  const n = pt(dn);
  n && mr(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function Zs(e) {
  const t = U(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function o() {
    t.value = !1;
  }
  return en(() => {
    window.addEventListener("online", n), window.addEventListener("offline", o);
  }), Et(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", o);
  }), { isOnline: t };
}
function Ct(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ne(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function eo(e) {
  return typeof e == "string" ? e : Ne(e) ? e.value : null;
}
function Js(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => eo(n) === t) : eo(e) === t;
}
function We(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Ct);
    return t ? t.other : "";
  }
  return Ct(e) ? e.other : "";
}
function zo(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Ct) : Ct(e);
}
function Xs(e, t) {
  if (e === void 0)
    return "";
  const o = (Array.isArray(e) ? e : [e]).find((r) => Ne(r) && r.value === t);
  return o && Ne(o) ? o.note : "";
}
const el = 2e3, tl = 1e3;
function Ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ro(e) {
  return Array.from(e).length;
}
function Vo(e) {
  return Ro(e.trim()) > el;
}
function nl(e) {
  return Ro(e.trim()) > tl;
}
function Gt(e) {
  return e.trim();
}
function ol(e) {
  return e.trim();
}
function Tt(e, t) {
  const n = ol(t);
  return n ? { value: e, note: n } : e;
}
function Fo(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], o = e.options.map((i) => i.value), r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
    for (const i of n)
      typeof i == "string" && o.includes(i) ? a.add(i) : Ne(i) && o.includes(i.value) && (a.add(i.value), r.set(i.value, i));
    const s = o.filter((i) => a.has(i)).map((i) => {
      const u = r.get(i);
      return u ? Tt(i, u.note) : i;
    }), l = n.find(Ie);
    if (l) {
      const i = Gt(l.other);
      i.length > 0 && s.push({ other: i });
    }
    return s.length > 0 ? s : void 0;
  }
  if (t !== void 0) {
    if (Ie(t)) {
      const n = Gt(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Ne(t) && e.options.some((n) => n.value === t.value))
      return Tt(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function rl(e, t) {
  const n = {};
  for (const o of e.fields) {
    const r = Fo(o, t[o.id]);
    r !== void 0 && (n[o.id] = r);
  }
  return n;
}
function al(e, t) {
  const n = [];
  for (const o of e.fields)
    o.required && Fo(o, t[o.id]) === void 0 && n.push(o.id);
  return n;
}
function il(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(Ie) : void 0 : Ie(t) ? t : void 0;
}
function sl(e, t) {
  const n = [];
  for (const o of e.fields) {
    const r = il(o, t[o.id]);
    r && Gt(r.other).length === 0 && n.push(o.id);
  }
  return n;
}
function ll(e, t) {
  const n = [];
  for (const o of e.fields) {
    const r = t[o.id];
    let a;
    if (o.multiple) {
      if (Array.isArray(r)) {
        const s = r.find(Ie);
        s && (a = s.other);
      }
    } else Ie(r) && (a = r.other);
    a !== void 0 && Vo(a) && n.push(o.id);
  }
  return n;
}
function Bo(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], o = [];
  for (const a of e.options) {
    const s = n.find((l) => typeof l == "string" ? l === a.value : Ne(l) && l.value === a.value);
    s && o.push({ label: a.label, note: Ne(s) ? s.note : void 0 });
  }
  const r = n.find(Ie);
  return r && o.push({ label: r.other, own: !0 }), o.length > 0 ? o : null;
}
function ul(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const o of e.fields) {
    const r = t[o.id];
    r !== void 0 && (n[o.id] = o.multiple ? Array.isArray(r) ? [...r] : [r] : r);
  }
  return n;
}
var Do = {
  name: "CheckIcon",
  extends: Lt
};
function dl(e) {
  return ml(e) || fl(e) || pl(e) || cl();
}
function cl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pl(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function fl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ml(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function hl(e, t, n, o, r, a) {
  return b(), g("svg", q({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [E("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Do.render = hl;
var Mo = {
  name: "MinusIcon",
  extends: Lt
};
function bl(e) {
  return wl(e) || yl(e) || gl(e) || vl();
}
function vl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gl(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function yl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function wl(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function xl(e, t, n, o, r, a) {
  return b(), g("svg", q({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), bl(t[0] || (t[0] = [E("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Mo.render = xl;
var kl = {
  name: "BaseEditableHolder",
  extends: De,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(t) {
        this.d_value = t;
      }
    },
    defaultValue: function(t) {
      this.d_value = t;
    },
    $formName: {
      immediate: !0,
      handler: function(t) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, t)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(t) {
        this.d_value !== t && (this.d_value = t);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(t) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, n) {
      var o, r;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (o = (r = this.formField).onChange) === null || o === void 0 || o.call(r, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), o = 0; o < t; o++)
        n[o] = arguments[o];
      return n.find(X);
    }
  },
  computed: {
    $filled: function() {
      return X(this.d_value);
    },
    $invalid: function() {
      var t, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var t;
      return this.$formNovalidate ? void 0 : this.name || ((t = this.$formControl) === null || t === void 0 ? void 0 : t.name);
    },
    $formControl: function() {
      var t;
      return this.formControl || ((t = this.$pcFormField) === null || t === void 0 ? void 0 : t.formControl);
    },
    $formNovalidate: function() {
      var t;
      return (t = this.$formControl) === null || t === void 0 ? void 0 : t.novalidate;
    },
    $formDefaultValue: function() {
      var t, n;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var t, n;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, jt = {
  name: "BaseInput",
  extends: kl,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var t;
      return (t = this.variant) !== null && t !== void 0 ? t : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var t;
      return (t = this.fluid) !== null && t !== void 0 ? t : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, _l = `
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`, $l = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": o.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": o.size === "small",
      "p-checkbox-lg p-inputfield-lg": o.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, Sl = Y.extend({
  name: "checkbox",
  style: _l,
  classes: $l
}), Pl = {
  name: "BaseCheckbox",
  extends: jt,
  props: {
    value: null,
    binary: Boolean,
    indeterminate: {
      type: Boolean,
      default: !1
    },
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    required: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: Sl,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function Cl(e, t, n) {
  return (t = Tl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Tl(e) {
  var t = Ol(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Ol(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Al(e) {
  return Nl(e) || jl(e) || Ll(e) || El();
}
function El() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ll(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function jl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Nl(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var Ot = {
  name: "Checkbox",
  extends: Pl,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "update:indeterminate"],
  inject: {
    $pcCheckboxGroup: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_indeterminate: this.indeterminate
    };
  },
  watch: {
    indeterminate: function(t) {
      this.d_indeterminate = t, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var o = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, r;
        this.binary ? r = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? r = o.filter(function(a) {
          return !an(a, n.value);
        }) : r = o ? [].concat(Al(o), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(r, t) : this.writeValue(r, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, o;
      this.$emit("blur", t), (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, t);
    },
    updateIndeterminate: function() {
      this.$refs.input && (this.$refs.input.indeterminate = this.d_indeterminate);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcCheckboxGroup ? this.$pcCheckboxGroup.groupName : this.$formName;
    },
    checked: function() {
      var t = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Or(this.value, t);
    },
    dataP: function() {
      return $e(Cl({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Do,
    MinusIcon: Mo
  }
}, Il = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], zl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Rl = ["data-p"];
function Vl(e, t, n, o, r, a) {
  var s = Ge("CheckIcon"), l = Ge("MinusIcon");
  return b(), g("div", q({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": r.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [E("input", q({
    ref: "input",
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: a.groupName,
    checked: a.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    })
  }, a.getPTOptions("input")), null, 16, zl), E("div", q({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [ue(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: r.d_indeterminate,
    class: A(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (b(), W(s, q({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : r.d_indeterminate ? (b(), W(l, q({
      key: 1,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : N("", !0)];
  })], 16, Rl)], 16, Il);
}
Ot.render = Vl;
var Fl = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Bl = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Dl = Y.extend({
  name: "inputtext",
  style: Fl,
  classes: Bl
}), Ml = {
  name: "BaseInputText",
  extends: jt,
  style: Dl,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function ut(e) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ut(e);
}
function ql(e, t, n) {
  return (t = Ul(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ul(e) {
  var t = Wl(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Wl(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ut(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = {
  name: "InputText",
  extends: Ml,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return q(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return $e(ql({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Hl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Kl(e, t, n, o, r, a) {
  return b(), g("input", q({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, Hl);
}
Jt.render = Kl;
var Gl = `
    .p-radiobutton {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
    }

    .p-radiobutton-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: 50%;
    }

    .p-radiobutton-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        border: 1px solid dt('radiobutton.border.color');
        background: dt('radiobutton.background');
        width: dt('radiobutton.width');
        height: dt('radiobutton.height');
        transition:
            background dt('radiobutton.transition.duration'),
            color dt('radiobutton.transition.duration'),
            border-color dt('radiobutton.transition.duration'),
            box-shadow dt('radiobutton.transition.duration'),
            outline-color dt('radiobutton.transition.duration');
        outline-color: transparent;
        box-shadow: dt('radiobutton.shadow');
    }

    .p-radiobutton-icon {
        transition-duration: dt('radiobutton.transition.duration');
        background: transparent;
        font-size: dt('radiobutton.icon.size');
        width: dt('radiobutton.icon.size');
        height: dt('radiobutton.icon.size');
        border-radius: 50%;
        backface-visibility: hidden;
        transform: translateZ(0) scale(0.1);
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.hover.border.color');
    }

    .p-radiobutton-checked .p-radiobutton-box {
        border-color: dt('radiobutton.checked.border.color');
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.color');
        transform: translateZ(0) scale(1, 1);
        visibility: visible;
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.hover.border.color');
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.checked.hover.color');
    }

    .p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.focus.border.color');
        box-shadow: dt('radiobutton.focus.ring.shadow');
        outline: dt('radiobutton.focus.ring.width') dt('radiobutton.focus.ring.style') dt('radiobutton.focus.ring.color');
        outline-offset: dt('radiobutton.focus.ring.offset');
    }

    .p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
        border-color: dt('radiobutton.checked.focus.border.color');
    }

    .p-radiobutton.p-invalid > .p-radiobutton-box {
        border-color: dt('radiobutton.invalid.border.color');
    }

    .p-radiobutton.p-variant-filled .p-radiobutton-box {
        background: dt('radiobutton.filled.background');
    }

    .p-radiobutton.p-variant-filled.p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.background');
    }

    .p-radiobutton.p-variant-filled:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box {
        background: dt('radiobutton.checked.hover.background');
    }

    .p-radiobutton.p-disabled {
        opacity: 1;
    }

    .p-radiobutton.p-disabled .p-radiobutton-box {
        background: dt('radiobutton.disabled.background');
        border-color: dt('radiobutton.checked.disabled.border.color');
    }

    .p-radiobutton-checked.p-disabled .p-radiobutton-box .p-radiobutton-icon {
        background: dt('radiobutton.icon.disabled.color');
    }

    .p-radiobutton-sm,
    .p-radiobutton-sm .p-radiobutton-box {
        width: dt('radiobutton.sm.width');
        height: dt('radiobutton.sm.height');
    }

    .p-radiobutton-sm .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.sm.size');
        width: dt('radiobutton.icon.sm.size');
        height: dt('radiobutton.icon.sm.size');
    }

    .p-radiobutton-lg,
    .p-radiobutton-lg .p-radiobutton-box {
        width: dt('radiobutton.lg.width');
        height: dt('radiobutton.lg.height');
    }

    .p-radiobutton-lg .p-radiobutton-icon {
        font-size: dt('radiobutton.icon.lg.size');
        width: dt('radiobutton.icon.lg.size');
        height: dt('radiobutton.icon.lg.size');
    }
`, Yl = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-radiobutton p-component", {
      "p-radiobutton-checked": n.checked,
      "p-disabled": o.disabled,
      "p-invalid": n.$pcRadioButtonGroup ? n.$pcRadioButtonGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-radiobutton-sm p-inputfield-sm": o.size === "small",
      "p-radiobutton-lg p-inputfield-lg": o.size === "large"
    }];
  },
  box: "p-radiobutton-box",
  input: "p-radiobutton-input",
  icon: "p-radiobutton-icon"
}, Ql = Y.extend({
  name: "radiobutton",
  style: Gl,
  classes: Yl
}), Zl = {
  name: "BaseRadioButton",
  extends: jt,
  props: {
    value: null,
    binary: Boolean,
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: null
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  style: Ql,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
  }
};
function dt(e) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, dt(e);
}
function Jl(e, t, n) {
  return (t = Xl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xl(e) {
  var t = eu(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function eu(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xt = {
  name: "RadioButton",
  extends: Zl,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  inject: {
    $pcRadioButtonGroup: {
      default: void 0
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      if (!this.disabled && !this.readonly) {
        var n = this.binary ? !this.checked : this.value;
        this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.writeValue(n, t) : this.writeValue(n, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, o;
      this.$emit("blur", t), (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, t);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.groupName : this.$formName;
    },
    checked: function() {
      var t = this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.d_value : this.d_value;
      return t != null && (this.binary ? !!t : an(t, this.value));
    },
    dataP: function() {
      return $e(Jl({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, tu = ["data-p-checked", "data-p-disabled", "data-p"], nu = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], ou = ["data-p"], ru = ["data-p"];
function au(e, t, n, o, r, a) {
  return b(), g("div", q({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [E("input", q({
    id: e.inputId,
    type: "radio",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: a.groupName,
    checked: a.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return a.onFocus && a.onFocus.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    })
  }, a.getPTOptions("input")), null, 16, nu), E("div", q({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [E("div", q({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, ru)], 16, ou)], 16, tu);
}
Xt.render = au;
const iu = ["aria-describedby"], su = { class: "text-sm font-medium text-color p-0" }, lu = {
  key: 0,
  class: "text-danger-600 dark:text-danger-400"
}, uu = {
  key: 1,
  class: "text-sm text-color break-words"
}, du = ["role", "aria-required"], cu = ["for"], pu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, fu = {
  key: 0,
  class: "flex items-start gap-2"
}, mu = { class: "flex flex-col gap-1 min-w-0 grow" }, hu = ["for"], bu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, vu = {
  key: 0,
  class: "flex items-start gap-2"
}, gu = { class: "flex flex-col gap-1 min-w-0 grow" }, qe = "choice-field-other-sentinel", cn = /* @__PURE__ */ pe({
  __name: "choice-field",
  props: {
    field: {},
    modelValue: {},
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, a = nn(), s = `${a}-desc`, l = `${a}-err`, i = `${a}-other`, u = `${i}-label`, d = `${a}-other-text`, c = `${d}-label`;
    function f(C) {
      return `${a}-opt-${C}`;
    }
    const h = U(null), w = S(() => {
      const C = [];
      return o.field.description && C.push(s), !o.readonly && o.errors.length > 0 && C.push(l), C.length > 0 ? C.join(" ") : void 0;
    }), k = S({
      get() {
        const C = o.modelValue;
        return typeof C == "string" ? C : L(C) ? qe : "";
      },
      set(C) {
        C === qe ? r("update:modelValue", { other: y.value }) : C === "" ? r("update:modelValue", void 0) : r("update:modelValue", C);
      }
    }), y = U(We(o.modelValue));
    ae(() => o.modelValue, (C) => {
      o.field.multiple || (y.value = We(C));
    }), ae(y, (C) => {
      !o.field.multiple && k.value === qe && r("update:modelValue", { other: C });
    });
    const $ = S(() => {
      const C = o.modelValue;
      return Array.isArray(C) ? C.filter((R) => typeof R == "string") : [];
    }), x = S(() => o.field.multiple && zo(o.modelValue)), m = U(We(o.modelValue));
    ae(() => o.modelValue, (C) => {
      o.field.multiple && (m.value = We(C));
    });
    function p(C, R, j) {
      const B = [...C];
      R && B.push({ other: j }), r("update:modelValue", B.length > 0 ? B : void 0);
    }
    function v(C, R) {
      const j = new Set($.value);
      R ? j.add(C) : j.delete(C), p(o.field.options.filter((B) => j.has(B.value)).map((B) => B.value), x.value, m.value);
    }
    function P(C) {
      p($.value, C, m.value);
    }
    ae(m, (C) => {
      x.value && p($.value, !0, C);
    });
    function L(C) {
      return !!C && typeof C == "object" && !Array.isArray(C) && typeof C.other == "string";
    }
    const J = S(() => {
      const C = o.modelValue;
      if (C === void 0)
        return "—";
      const R = (B) => o.field.options.find((Q) => Q.value === B)?.label ?? B, j = [];
      if (Array.isArray(C))
        for (const B of C)
          typeof B == "string" ? j.push(R(B)) : L(B) && j.push(`Other: ${B.other}`);
      else typeof C == "string" ? j.push(R(C)) : L(C) && j.push(`Other: ${C.other}`);
      return j.length > 0 ? j.join(", ") : "—";
    });
    return t({
      focusFirstControl() {
        h.value?.querySelector("input, textarea")?.focus();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const C = h.value?.querySelector(`[id="${d}"]`);
        C ? C.focus() : h.value?.querySelector("input, textarea")?.focus();
      }
    }), (C, R) => (b(), g("fieldset", {
      ref_key: "fieldsetEl",
      ref: h,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": w.value
    }, [
      E("legend", su, [
        oe(V(e.field.label), 1),
        !e.readonly && e.field.required ? (b(), g("span", lu, " (required)")) : N("", !0)
      ]),
      e.field.description ? (b(), g("p", {
        key: 0,
        id: s,
        class: "text-xs text-muted-color m-0"
      }, V(e.field.description), 1)) : N("", !0),
      e.readonly ? (b(), g("p", uu, V(J.value), 1)) : (b(), g("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup",
        "aria-required": e.field.required ? "true" : void 0
      }, [
        e.field.multiple ? (b(), g(ee, { key: 1 }, [
          (b(!0), g(ee, null, he(e.field.options, (j, B) => (b(), g("div", {
            key: j.value,
            class: "flex items-start gap-2"
          }, [
            H(_(Ot), {
              "model-value": $.value.includes(j.value),
              binary: "",
              "input-id": f(B),
              disabled: e.disabled,
              "onUpdate:modelValue": (Q) => v(j.value, !!Q)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            E("label", {
              for: f(B),
              class: "text-sm text-color break-words"
            }, [
              oe(V(j.label) + " ", 1),
              j.description ? (b(), g("span", bu, V(j.description), 1)) : N("", !0)
            ], 8, hu)
          ]))), 128)),
          e.field.allow_other ? (b(), g("div", vu, [
            H(_(Ot), {
              "model-value": x.value,
              binary: "",
              "input-id": i,
              disabled: e.disabled,
              "onUpdate:modelValue": R[3] || (R[3] = (j) => P(!!j))
            }, null, 8, ["model-value", "disabled"]),
            E("div", gu, [
              E("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              E("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              H(_(Jt), {
                id: d,
                modelValue: m.value,
                "onUpdate:modelValue": R[4] || (R[4] = (j) => m.value = j),
                disabled: e.disabled || !x.value,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64)) : (b(), g(ee, { key: 0 }, [
          (b(!0), g(ee, null, he(e.field.options, (j, B) => (b(), g("div", {
            key: j.value,
            class: "flex items-start gap-2"
          }, [
            H(_(Xt), {
              modelValue: k.value,
              "onUpdate:modelValue": R[0] || (R[0] = (Q) => k.value = Q),
              "input-id": f(B),
              name: _(a),
              value: j.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            E("label", {
              for: f(B),
              class: "text-sm text-color break-words"
            }, [
              oe(V(j.label) + " ", 1),
              j.description ? (b(), g("span", pu, V(j.description), 1)) : N("", !0)
            ], 8, cu)
          ]))), 128)),
          e.field.allow_other ? (b(), g("div", fu, [
            H(_(Xt), {
              modelValue: k.value,
              "onUpdate:modelValue": R[1] || (R[1] = (j) => k.value = j),
              "input-id": i,
              name: _(a),
              value: qe,
              disabled: e.disabled
            }, null, 8, ["modelValue", "name", "disabled"]),
            E("div", mu, [
              E("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              E("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              H(_(Jt), {
                id: d,
                modelValue: y.value,
                "onUpdate:modelValue": R[2] || (R[2] = (j) => y.value = j),
                disabled: e.disabled || k.value !== qe,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64))
      ], 8, du)),
      !e.readonly && e.errors.length > 0 ? (b(), g("ul", {
        key: 3,
        id: l,
        class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
      }, [
        (b(!0), g(ee, null, he(e.errors, (j, B) => (b(), g("li", { key: B }, V(j.message), 1))), 128))
      ])) : N("", !0)
    ], 8, iu));
  }
}), yu = {
  role: "status",
  class: "sr-only"
}, wu = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color"
}, xu = { class: "flex flex-col gap-1" }, ku = { class: "text-base font-semibold text-color break-words" }, _u = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, $u = {
  key: 1,
  class: "text-xs italic text-muted-color"
}, Su = {
  key: 1,
  class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0"
}, Pu = { class: "flex items-center gap-2" }, Cu = "Use at most 2,000 characters.", Tu = "Enter the other answer.", Ou = "You are offline. Your choices are kept.", Au = /* @__PURE__ */ pe({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, a = tn(
      ul(o.state.definition, o.state.data)
    ), s = U({}), l = U([]), i = {}, u = U("");
    function d(x, m) {
      i[x] = m;
    }
    const c = S(() => !o.submitting && !o.offline);
    function f(x, m = []) {
      const p = o.state.definition.fields.find((v) => x.includes(v.id))?.id;
      p && Ke(() => {
        const v = i[p];
        m.includes(p) ? v?.focusOtherText() : v?.focusFirstControl();
      });
    }
    function h(x) {
      u.value = x === 1 ? "1 question needs an answer." : `${x} questions need an answer.`;
    }
    function w(x, m) {
      s.value = x ?? {}, l.value = m ?? [];
      const p = Object.keys(s.value);
      f(p);
      const v = p.length + (l.value.length > 0 ? 1 : 0);
      v > 0 && h(v);
    }
    function k(x, m) {
      if (a[x] = m, s.value[x]) {
        const { [x]: p, ...v } = s.value;
        s.value = v;
      }
    }
    function y() {
      return rl(o.state.definition, a);
    }
    function $() {
      const x = sl(o.state.definition, a), m = al(o.state.definition, a).filter((v) => !x.includes(v)), p = ll(o.state.definition, a);
      if (m.length > 0 || p.length > 0 || x.length > 0) {
        const v = {};
        for (const L of m)
          v[L] = [...v[L] ?? [], { code: "required", message: "This question is required." }];
        for (const L of x)
          v[L] = [...v[L] ?? [], { code: "blank", message: Tu }];
        for (const L of p)
          v[L] = [...v[L] ?? [], { code: "too_long", message: Cu }];
        s.value = v, l.value = [];
        const P = [...m, ...x, ...p];
        f(P, x), h(new Set(P).size);
        return;
      }
      s.value = {}, l.value = [], r("submit", y());
    }
    return ae(() => o.banner, (x) => {
      x && (u.value = x.message);
    }), t({ setServerErrors: w, retry: () => r("submit", y()) }), (x, m) => (b(), g("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: io($, ["prevent"])
    }, [
      E("div", yu, V(u.value), 1),
      e.offline ? (b(), g("p", wu, V(Ou))) : N("", !0),
      E("div", xu, [
        E("h2", ku, V(e.state.definition.title), 1),
        e.state.definition.description ? (b(), g("p", _u, V(e.state.definition.description), 1)) : N("", !0),
        e.state.stale ? (b(), g("p", $u, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : N("", !0)
      ]),
      (b(!0), g(ee, null, he(e.state.definition.fields, (p) => (b(), W(cn, {
        key: p.id,
        ref_for: !0,
        ref: (v) => d(p.id, v),
        field: p,
        "model-value": a[p.id],
        errors: s.value[p.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (v) => k(p.id, v)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      l.value.length > 0 ? (b(), g("ul", Su, [
        (b(!0), g(ee, null, he(l.value, (p, v) => (b(), g("li", { key: v }, V(p.message), 1))), 128))
      ])) : N("", !0),
      e.banner ? (b(), W(_(we), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ne(() => [
          E("div", Pu, [
            E("span", null, V(e.banner.message), 1),
            e.banner.retryable ? (b(), W(_(ve), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: m[0] || (m[0] = (p) => r("retry"))
            }, {
              default: ne(() => [...m[1] || (m[1] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            })) : N("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : N("", !0),
      E("div", null, [
        H(_(ve), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !c.value
        }, null, 8, ["label", "loading", "disabled"])
      ])
    ], 32));
  }
}), Eu = { class: "flex flex-col gap-4 min-w-0" }, Lu = { class: "flex flex-col gap-1" }, ju = { class: "text-base font-semibold text-color break-words" }, Nu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Iu = { key: 0 }, zu = { key: 1 }, Ru = { key: 2 }, Vu = { key: 3 }, Fu = { key: 4 }, Bu = /* @__PURE__ */ pe({
  __name: "idle-form",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    function n(r) {
      if (!r)
        return null;
      const a = new Date(r);
      return Number.isNaN(a.getTime()) ? null : a.toLocaleString();
    }
    const o = U(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        o.value?.focus();
      }
    }), (r, a) => (b(), g("div", Eu, [
      E("div", Lu, [
        E("h2", ju, V(e.state.definition.title), 1),
        e.state.definition.description ? (b(), g("p", Nu, V(e.state.definition.description), 1)) : N("", !0)
      ]),
      (b(!0), g(ee, null, he(e.state.definition.fields, (s) => (b(), W(cn, {
        key: s.id,
        field: s,
        "model-value": e.state.data ? e.state.data[s.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      E("div", {
        ref_key: "statusEl",
        ref: o,
        tabindex: "-1",
        class: "text-xs text-muted-color flex flex-col gap-0.5 outline-none"
      }, [
        e.state.late ? (b(), g("p", Iu, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : N("", !0),
        e.state.delivery === "pending" ? (b(), g("p", zu, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (b(), g("p", Ru, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (b(), g("p", Vu, " The assistant stopped before answering. Send a message to continue. ")) : N("", !0),
        n(e.state.submitted_at) ? (b(), g("p", Fu, " Answered " + V(n(e.state.submitted_at)), 1)) : N("", !0)
      ], 512)
    ]));
  }
}), Du = { class: "flex flex-col gap-4 min-w-0" }, Mu = { class: "flex flex-col gap-1" }, qu = { class: "text-base font-semibold text-color break-words" }, Uu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Wu = /* @__PURE__ */ pe({
  __name: "no-artifact-notice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (b(), g("div", Du, [
      E("div", Mu, [
        E("h2", qu, V(e.definition.title), 1),
        e.definition.description ? (b(), g("p", Uu, V(e.definition.description), 1)) : N("", !0)
      ]),
      (b(!0), g(ee, null, he(e.definition.fields, (o) => (b(), W(cn, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      H(_(we), {
        severity: "secondary",
        closable: !1
      }, {
        default: ne(() => [...n[0] || (n[0] = [
          oe(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), At = 9;
function Hu(e, t, n) {
  const o = e.fields.length, r = o > 1, a = /* @__PURE__ */ new Set([0]), s = U(0), l = U(!1), i = U(""), u = U(""), d = U(null), c = U(0), f = tn(
    Object.fromEntries(e.fields.map((T) => {
      const O = t?.[T.id], I = T.options.filter((Pe) => Js(O, Pe.value)).map((Pe) => Pe.value), D = {};
      for (const Pe of I) {
        const ht = Xs(O, Pe);
        ht && (D[Pe] = ht);
      }
      const ie = zo(O), me = We(O), Oe = I.length > 0 || ie && me.trim() !== "", mt = { chosen: I, other: me, useOther: ie, notes: D, noteOpen: null, done: Oe };
      return [T.id, mt];
    }))
  );
  function h(T) {
    return f[T.id];
  }
  function w(T) {
    const O = h(T);
    return T.multiple ? O.chosen.length > 0 || O.other.trim() !== "" : O.chosen.length > 0 || O.useOther && O.other.trim() !== "";
  }
  function k(T) {
    return h(T).done && w(T);
  }
  const y = S(() => r && s.value === o), $ = S(() => y.value ? null : e.fields[s.value] ?? null), x = S(
    () => e.fields.map((T, O) => ({ field: T, index: O })).filter(({ field: T }) => T.required && !k(T))
  );
  function m(T) {
    u.value = "", setTimeout(() => {
      u.value = T;
    }, 30);
  }
  function p(T) {
    d.value = T, c.value++;
  }
  function v(T) {
    return Math.min(T.options.length + (T.allow_other ? 1 : 0), At);
  }
  function P(T) {
    const O = v(T), I = O > 1 ? `1–${O}` : "1", D = Math.min(T.options.length, At), ie = D > 1 ? `Shift+1–${D}` : "Shift+1", me = r ? " ← and → change questions." : "";
    return T.multiple ? `${I} ticks, ${ie} adds a note, Enter sends.${me}` : `${I} answers, ${ie} adds a note first.${me}`;
  }
  function L(T) {
    const O = h(T);
    if (T.multiple) {
      const I = T.options.filter((D) => O.chosen.includes(D.value)).map((D) => Tt(D.value, O.notes[D.value] ?? ""));
      return O.other.trim() && I.push({ other: O.other.trim() }), I.length > 0 ? I : void 0;
    }
    if (O.useOther)
      return { other: O.other.trim() };
    if (O.chosen[0])
      return Tt(O.chosen[0], O.notes[O.chosen[0]] ?? "");
  }
  function J(T) {
    return k(T) ? Bo(T, L(T)) : null;
  }
  function C() {
    const T = {};
    for (const O of e.fields) {
      if (!k(O))
        continue;
      const I = L(O);
      I !== void 0 && (T[O.id] = I);
    }
    return T;
  }
  function R(T, O = "first") {
    const I = $.value;
    I && I.multiple && !h(I).done && w(I) && (h(I).done = !0);
    const D = r ? o : o - 1;
    if (s.value = Math.max(0, Math.min(T, D)), i.value = "", y.value || a.add(s.value), y.value) {
      const ie = x.value[0];
      p(ie ? `review-item-${ie.index}` : "send-all");
    } else
      p(O);
    m(y.value ? "Review your answers" : `Question ${s.value + 1} of ${o}`);
  }
  function j() {
    x.value.length > 0 || n(C());
  }
  function B(T) {
    if (h(T).done = !0, i.value = "", !r) {
      n(C());
      return;
    }
    const O = e.fields.findIndex((I, D) => D > s.value && !a.has(D));
    R(O === -1 ? o : O);
  }
  function Q(T, O) {
    const I = h(T);
    if (O >= T.options.length) {
      p("other");
      return;
    }
    const D = T.options[O].value;
    if (I.noteOpen === D) {
      p(`note-${D}`);
      return;
    }
    if (T.multiple) {
      I.chosen = I.chosen.includes(D) ? I.chosen.filter((ie) => ie !== D) : [...I.chosen, D], w(T) || (I.done = !1), i.value = "", p(`opt-${O}`), m(I.chosen.includes(D) ? "Ticked" : "Unticked");
      return;
    }
    I.chosen = [D], I.useOther = !1, B(T);
  }
  function F(T, O, I = !1) {
    const D = h(T), ie = T.options.findIndex((me) => me.value === O);
    D.noteOpen === O && !I ? (D.noteOpen = null, p(`opt-${ie}`)) : (D.noteOpen = O, p(`note-${O}`));
  }
  function re(T, O, I) {
    h(T).notes[O] = I;
  }
  function Te(T, O) {
    const I = h(T);
    if (I.noteOpen = null, T.multiple) {
      I.chosen.includes(O) || (I.chosen = [...I.chosen, O]), p(`opt-${T.options.findIndex((D) => D.value === O)}`), m("Note saved");
      return;
    }
    I.chosen = [O], I.useOther = !1, B(T);
  }
  function Se(T) {
    const O = h(T), I = O.other.trim();
    if (T.multiple) {
      if (!I && O.chosen.length === 0)
        return;
    } else {
      if (!I)
        return;
      O.useOther = !0, O.chosen = [];
    }
    B(T);
  }
  return {
    n: o,
    multi: r,
    index: s,
    collapsed: l,
    error: i,
    liveMessage: u,
    focusTarget: d,
    focusSeq: c,
    answers: f,
    inReview: y,
    currentQuestion: $,
    missingRequired: x,
    ans: h,
    hasContent: w,
    answered: k,
    answerItemsFor: J,
    keysText: P,
    activate: Q,
    toggleNote: F,
    setNote: re,
    sendNote: Te,
    sendOther: Se,
    commit: B,
    go: R,
    submitAll: j,
    requestFocus: p,
    buildAnswers: C
  };
}
function z(e, ...t) {
  const n = t.filter((o) => !!o);
  return {
    part: [e, ...n.map((o) => `${e}-${o}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((o) => `w-form__${e}--${o}`)].join(" ")
  };
}
function Ku(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const o = n.pop() ?? "";
    n[n.length - 1] += `\`${o}`;
  }
  return n.map((o, r) => ({ text: o, code: r % 2 === 1 })).filter((o) => o.text !== "");
}
function to(e) {
  return String(e).replaceAll("`", "");
}
const Gu = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, ze = /* @__PURE__ */ pe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, o) => (b(!0), g(ee, null, he(_(Ku)(t.text), (r, a) => (b(), g(ee, { key: a }, [
      r.code ? (b(), g("code", Gu, V(r.text), 1)) : (b(), g(ee, { key: 1 }, [
        oe(V(r.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), Yu = ["part"], Qu = ["part"], Zu = ["part"], Ju = { "aria-hidden": "true" }, Xu = { class: "w-form__sr" }, ed = ["id", "part"], td = ["part"], nd = /* @__PURE__ */ pe({
  __name: "question-card-header",
  props: {
    multi: { type: Boolean },
    index: {},
    n: {},
    review: { type: Boolean },
    questionText: {},
    collapsed: { type: Boolean },
    qid: {}
  },
  emits: ["prev", "next", "toggleCollapse"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = S(() => z("header", !n.multi && "single")), a = S(() => z("nav")), s = S(() => z("prev")), l = S(() => z("counter")), i = S(() => z("next")), u = S(() => z("question")), d = S(() => z("actions")), c = S(() => z("collapse")), f = S(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), h = S(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), w = S(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (k, y) => (b(), g("div", {
      part: r.value.part,
      class: A(r.value.class)
    }, [
      e.multi ? (b(), g("div", {
        key: 0,
        part: a.value.part,
        class: A(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        H(_(ve), {
          type: "button",
          text: "",
          size: "small",
          part: s.value.part,
          class: A(s.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: y[0] || (y[0] = ($) => o("prev"))
        }, {
          icon: ne(() => [
            H(_(be), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        E("span", {
          part: l.value.part,
          class: A(l.value.class)
        }, [
          E("span", Ju, V(f.value), 1),
          E("span", Xu, V(h.value), 1)
        ], 10, Zu),
        H(_(ve), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: A(i.value.class),
          "aria-label": w.value,
          title: w.value,
          disabled: e.review,
          onClick: y[1] || (y[1] = ($) => o("next"))
        }, {
          icon: ne(() => [
            H(_(be), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, Qu)) : N("", !0),
      E("h3", {
        id: e.qid,
        part: u.value.part,
        class: A(u.value.class)
      }, [
        e.review ? (b(), g(ee, { key: 0 }, [
          oe(" Check your answers, then send them. ")
        ], 64)) : (b(), W(ze, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, ed),
      E("div", {
        part: d.value.part,
        class: A(d.value.class)
      }, [
        H(_(ve), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: A(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: y[2] || (y[2] = ($) => o("toggleCollapse"))
        }, {
          icon: ne(() => [
            H(_(be), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, td)
    ], 10, Yu));
  }
});
var od = `
    .p-inputgroup,
    .p-inputgroup .p-iconfield,
    .p-inputgroup .p-floatlabel,
    .p-inputgroup .p-iftalabel {
        display: flex;
        align-items: stretch;
        width: 100%;
    }

    .p-inputgroup .p-floatlabel .p-inputwrapper,
    .p-inputgroup .p-iftalabel .p-inputwrapper {
        display: inline-flex;
    }

    .p-inputgroup .p-inputtext,
    .p-inputgroup .p-inputwrapper {
        flex: 1 1 auto;
        width: 1%;
    }

    .p-inputgroupaddon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('inputgroup.addon.padding');
        background: dt('inputgroup.addon.background');
        color: dt('inputgroup.addon.color');
        border-block-start: 1px solid dt('inputgroup.addon.border.color');
        border-block-end: 1px solid dt('inputgroup.addon.border.color');
        min-width: dt('inputgroup.addon.min.width');
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroupaddon + .p-inputgroupaddon {
        border-inline-start: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:last-child {
        border-inline-end: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:has(.p-button) {
        padding: 0;
        overflow: hidden;
    }

    .p-inputgroupaddon .p-button {
        border-radius: 0;
    }

    .p-inputgroup > .p-component,
    .p-inputgroup > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iconfield > .p-component,
    .p-inputgroup > .p-floatlabel > .p-component,
    .p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel > .p-component,
    .p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
        border-radius: 0;
        margin: 0;
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroup > .p-component:first-child,
    .p-inputgroup > .p-inputwrapper:first-child > .p-component,
    .p-inputgroup > .p-iconfield:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroupaddon:last-child,
    .p-inputgroup > .p-component:last-child,
    .p-inputgroup > .p-inputwrapper:last-child > .p-component,
    .p-inputgroup > .p-iconfield:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroup .p-component:focus,
    .p-inputgroup .p-component.p-focus,
    .p-inputgroup .p-inputwrapper-focus,
    .p-inputgroup .p-component:focus ~ label,
    .p-inputgroup .p-component.p-focus ~ label,
    .p-inputgroup .p-inputwrapper-focus ~ label,
    .p-inputgroup .p-floatlabel .p-inputwrapper ~ label,
    .p-inputgroup .p-iftalabel .p-inputwrapper ~ label {
        z-index: 1;
    }

    .p-inputgroup > .p-button:not(.p-button-icon-only) {
        width: auto;
    }

    .p-inputgroup .p-iconfield + .p-iconfield .p-inputtext {
        border-inline-start: 0;
    }
`, rd = {
  root: "p-inputgroup"
}, ad = Y.extend({
  name: "inputgroup",
  style: od,
  classes: rd
}), id = {
  name: "BaseInputGroup",
  extends: De,
  style: ad,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, qo = {
  name: "InputGroup",
  extends: id,
  inheritAttrs: !1
};
function sd(e, t, n, o, r, a) {
  return b(), g("div", q({
    class: e.cx("root")
  }, e.ptmi("root")), [ue(e.$slots, "default")], 16);
}
qo.render = sd;
var ld = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, ud = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": o.autoResize,
      "p-textarea-sm p-inputfield-sm": o.size === "small",
      "p-textarea-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, dd = Y.extend({
  name: "textarea",
  style: ld,
  classes: ud
}), cd = {
  name: "BaseTextarea",
  extends: jt,
  props: {
    autoResize: Boolean
  },
  style: dd,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function pd(e, t, n) {
  return (t = fd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fd(e) {
  var t = md(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function md(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Uo = {
  name: "Textarea",
  extends: cd,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var t = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        t.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var t = this.$el.style.height, n = parseInt(t) || 0, o = this.$el.scrollHeight, r = !n || o > n, a = n && o < n;
        a ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : r && (this.$el.style.height = "".concat(o, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return q(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return $e(pd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, hd = ["value", "name", "disabled", "aria-invalid", "data-p"];
function bd(e, t, n, o, r, a) {
  return b(), g("textarea", q({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, hd);
}
Uo.render = bd;
const Wo = /* @__PURE__ */ pe({
  __name: "question-card-composer",
  props: {
    kind: {},
    modelValue: {},
    placeholder: {},
    label: {},
    sendLabel: {},
    enabled: { type: Boolean },
    dataFocus: {}
  },
  emits: ["update:modelValue", "send", "escape"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = S(() => z("composer", n.kind)), a = S(() => z(`${n.kind}-input`)), s = S(() => z(`${n.kind}-send`));
    function l(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && o("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), o("escape"));
    }
    return (i, u) => (b(), W(_(qo), {
      part: r.value.part,
      class: A(r.value.class)
    }, {
      default: ne(() => [
        H(_(Uo), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: A(a.value.class),
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": u[0] || (u[0] = (d) => o("update:modelValue", String(d ?? ""))),
          onKeydown: l
        }, null, 8, ["model-value", "part", "class", "placeholder", "aria-label", "data-focus"]),
        H(_(ve), {
          type: "button",
          text: "",
          rounded: "",
          part: s.value.part,
          class: A(s.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => o("send"))
        }, {
          icon: ne(() => [
            H(_(be), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), vd = ["part"], gd = ["part", "role", "aria-checked", "data-focus", "aria-keyshortcuts"], yd = ["part"], wd = ["part"], xd = ["part"], kd = ["part"], _d = ["part"], $d = { key: 1 }, Sd = ["part"], Pd = /* @__PURE__ */ pe({
  __name: "question-card-option",
  props: {
    option: {},
    index: {},
    multiple: { type: Boolean },
    selected: { type: Boolean },
    note: {},
    editing: { type: Boolean },
    noteDraft: {},
    keyLabel: {},
    noteTooLong: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["activate", "toggle-note", "update:noteDraft", "send-note", "escape-note"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = S(() => z("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = S(() => z("option-main")), s = S(() => z("option-label")), l = S(() => z("option-mark")), i = S(() => z("option-description")), u = S(() => z("option-note")), d = S(() => z("note-toggle", n.note && "has-note", n.editing && "editing")), c = S(() => z("option-key")), f = S(() => z("error"));
    function h($) {
      n.disabled || $.target.closest(".w-form__note-toggle, .w-form__composer") || o("activate");
    }
    const w = S(() => `${n.note ? "Edit the note on" : "Add a note to"} ${to(n.option.label)}`), k = S(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), y = S(() => n.multiple ? "Save the note" : "Answer with this note");
    return ($, x) => (b(), g("div", {
      part: r.value.part,
      class: A(r.value.class),
      onClick: h
    }, [
      E("div", {
        part: a.value.part,
        class: A(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        tabindex: "0",
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        E("span", {
          part: s.value.part,
          class: A(s.value.class)
        }, [
          e.multiple ? (b(), W(_(Ot), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: l.value.part,
            class: A(l.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (b(), g("span", {
            key: 1,
            part: l.value.part,
            class: A(l.value.class),
            "aria-hidden": "true"
          }, [
            H(_(be), { icon: "tabler:check" })
          ], 10, wd)) : N("", !0),
          H(ze, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, yd),
        e.option.description ? (b(), g("span", {
          key: 0,
          part: i.value.part,
          class: A(i.value.class)
        }, [
          H(ze, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, xd)) : N("", !0),
        e.note && !e.editing ? (b(), g("span", {
          key: 1,
          part: u.value.part,
          class: A(u.value.class)
        }, [
          H(_(be), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          E("span", null, V(e.note), 1)
        ], 10, kd)) : N("", !0)
      ], 10, gd),
      H(_(ve), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: A(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": w.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: x[0] || (x[0] = io((m) => o("toggle-note"), ["stop"]))
      }, {
        icon: ne(() => [
          H(_(be), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (b(), g("kbd", {
        key: 0,
        part: c.value.part,
        class: A(c.value.class),
        "aria-hidden": "true"
      }, V(e.keyLabel), 11, _d)) : (b(), g("span", $d)),
      e.editing ? (b(), g(ee, { key: 2 }, [
        H(Wo, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: k.value,
          label: `Note for ${_(to)(e.option.label)}`,
          "send-label": y.value,
          enabled: !e.noteTooLong && !e.disabled,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": x[1] || (x[1] = (m) => o("update:noteDraft", m)),
          onSend: x[2] || (x[2] = (m) => o("send-note")),
          onEscape: x[3] || (x[3] = (m) => o("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "data-focus"]),
        e.noteTooLong ? (b(), g("p", {
          key: 0,
          part: f.value.part,
          class: A(f.value.class),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Sd)) : N("", !0)
      ], 64)) : N("", !0)
    ], 10, vd));
  }
}), Cd = ["part"], Td = ["part"], Od = ["part"], Ad = ["part", "role", "aria-labelledby", "aria-describedby"], Ed = ["part"], Ld = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, jd = { key: 1 }, Nd = ["part"], Id = ["part"], zd = ["id"], Rd = ["part"], Vd = /* @__PURE__ */ pe({
  __name: "question-card-question",
  props: {
    question: {},
    controller: {},
    qid: {},
    stale: { type: Boolean },
    serverError: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = S(() => z("notice")), o = S(() => z("description")), r = S(() => z("hint")), a = S(() => z("options")), s = S(() => z("footer")), l = S(() => z("send")), i = S(() => z("error")), u = S(() => z("keys")), d = S(() => {
      const m = [];
      return t.question.multiple && m.push("Choose any that apply."), t.question.required || m.push("Optional."), m.join(" ");
    }), c = S(() => t.controller.error.value || t.serverError || "");
    function f(m) {
      return m < At ? String(m + 1) : null;
    }
    const h = S(() => {
      const m = t.question.options.length + 1;
      return m <= At ? String(m) : null;
    });
    function w() {
      return t.controller.ans(t.question);
    }
    const k = S(() => {
      const m = w(), p = t.question.multiple ? m.other.trim() !== "" : m.useOther && m.done;
      return z("option", "other", p && "selected");
    }), y = S(() => {
      const m = w();
      return m.other.trim() !== "" || t.question.multiple && m.chosen.length > 0;
    }), $ = S(() => Vo(w().other));
    function x(m) {
      m.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    return (m, p) => (b(), g(ee, null, [
      e.stale ? (b(), g("p", {
        key: 0,
        part: n.value.part,
        class: A(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Cd)) : N("", !0),
      e.question.description ? (b(), g("p", {
        key: 1,
        part: o.value.part,
        class: A(o.value.class)
      }, [
        H(ze, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Td)) : N("", !0),
      d.value ? (b(), g("p", {
        key: 2,
        part: r.value.part,
        class: A(r.value.class)
      }, V(d.value), 11, Od)) : N("", !0),
      E("div", {
        part: a.value.part,
        class: A(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": `${e.qid}-err`
      }, [
        (b(!0), g(ee, null, he(e.question.options, (v, P) => (b(), W(Pd, {
          key: v.value,
          option: v,
          index: P,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(v.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === v.value,
          note: (e.controller.ans(e.question).notes[v.value] || "").trim(),
          editing: e.controller.ans(e.question).noteOpen === v.value,
          "note-draft": e.controller.ans(e.question).notes[v.value] || "",
          "key-label": f(P),
          "note-too-long": _(nl)(e.controller.ans(e.question).notes[v.value] || ""),
          disabled: !!e.disabled,
          onActivate: (L) => e.controller.activate(e.question, P),
          onToggleNote: (L) => e.controller.toggleNote(e.question, v.value),
          "onUpdate:noteDraft": (L) => e.controller.setNote(e.question, v.value, L),
          onSendNote: (L) => e.controller.sendNote(e.question, v.value),
          onEscapeNote: (L) => e.controller.toggleNote(e.question, v.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (b(), g("div", {
          key: 0,
          part: k.value.part,
          class: A(k.value.class),
          onClick: x
        }, [
          H(Wo, {
            kind: "other",
            "model-value": w().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: y.value && !e.disabled && !$.value,
            "data-focus": "other",
            "onUpdate:modelValue": p[0] || (p[0] = (v) => {
              w().other = v;
            }),
            onSend: p[1] || (p[1] = (v) => e.controller.sendOther(e.question)),
            onEscape: p[2] || (p[2] = (v) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled"]),
          h.value ? (b(), g("kbd", Ld, V(h.value), 1)) : (b(), g("span", jd)),
          $.value ? (b(), g("p", {
            key: 2,
            part: i.value.part,
            class: A(i.value.class),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, Nd)) : N("", !0)
        ], 10, Ed)) : N("", !0)
      ], 10, Ad),
      e.question.multiple && !e.question.allow_other ? (b(), g("div", {
        key: 3,
        part: s.value.part,
        class: A(s.value.class)
      }, [
        H(_(ve), {
          type: "button",
          part: l.value.part,
          class: A(l.value.class),
          "data-focus": "send",
          disabled: e.controller.ans(e.question).chosen.length === 0 || e.disabled,
          onClick: p[3] || (p[3] = (v) => e.controller.commit(e.question))
        }, {
          default: ne(() => [
            p[4] || (p[4] = oe(" Send ", -1)),
            H(_(be), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, Id)) : N("", !0),
      c.value ? (b(), W(_(we), {
        key: 4,
        id: `${e.qid}-err`,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: A(i.value.class),
        role: "alert"
      }, {
        default: ne(() => [
          oe(V(c.value), 1)
        ]),
        _: 1
      }, 8, ["id", "part", "class"])) : (b(), g("p", {
        key: 5,
        id: `${e.qid}-err`,
        class: "hidden"
      }, null, 8, zd)),
      E("p", {
        part: u.value.part,
        class: A(u.value.class)
      }, V(e.controller.keysText(e.question)), 11, Rd)
    ], 64));
  }
}), Fd = ["part"], Bd = ["part"], Dd = ["part"], Ho = /* @__PURE__ */ pe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = S(() => z("answer-item")), o = S(() => z("answer-note")), r = S(() => z("answer-own"));
    return (a, s) => (b(!0), g(ee, null, he(t.items, (l, i) => (b(), g("span", {
      key: i,
      part: n.value.part,
      class: A(n.value.class)
    }, [
      l.own ? (b(), g(ee, { key: 0 }, [
        E("span", {
          part: r.value.part,
          class: A(r.value.class)
        }, "Own answer: ", 10, Bd),
        oe(V(l.label), 1)
      ], 64)) : (b(), W(ze, {
        key: 1,
        text: l.label
      }, null, 8, ["text"])),
      (l.note || "").trim() ? (b(), g("span", {
        key: 2,
        part: o.value.part,
        class: A(o.value.class)
      }, [
        H(_(be), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        E("span", null, V(l.note.trim()), 1)
      ], 10, Dd)) : N("", !0)
    ], 10, Fd))), 128));
  }
}), Md = ["part"], qd = ["part"], Ud = ["part", "aria-label", "data-focus", "onClick"], Wd = ["part"], Hd = ["part"], Kd = ["part"], Gd = ["part"], Yd = ["part"], Qd = ["part"], Zd = ["part"], Jd = /* @__PURE__ */ pe({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = S(() => z("review")), o = S(() => z("footer")), r = S(() => z("footer-text")), a = S(() => z("send-all")), s = S(() => z("keys")), l = S(() => z("review-number")), i = S(() => z("review-question")), u = S(() => z("review-answer")), d = S(() => z("answer-empty"));
    function c(k) {
      return z("review-item", k && "missing");
    }
    function f() {
      return z("review-edit");
    }
    const h = S(() => t.controller.missingRequired.value), w = S(() => {
      const k = h.value;
      return k.length === 0 ? "" : k.length === 1 ? `Question ${k[0].index + 1} still needs an answer.` : `Questions ${k.map((y) => y.index + 1).join(" and ")} still need answers.`;
    });
    return (k, y) => (b(), g(ee, null, [
      E("ol", {
        part: n.value.part,
        class: A(n.value.class)
      }, [
        (b(!0), g(ee, null, he(e.definition.fields, ($, x) => (b(), g("li", {
          key: $.id,
          part: c(!e.controller.answerItemsFor($) && $.required).part,
          class: A(c(!e.controller.answerItemsFor($) && $.required).class)
        }, [
          E("button", {
            type: "button",
            part: f().part,
            class: A(f().class),
            "aria-label": `Question ${x + 1}: change the answer`,
            "data-focus": `review-item-${x}`,
            onClick: (m) => e.controller.go(x, "first")
          }, [
            E("span", {
              part: l.value.part,
              class: A(l.value.class),
              "aria-hidden": "true"
            }, V(x + 1), 11, Wd),
            E("span", {
              part: i.value.part,
              class: A(i.value.class)
            }, [
              H(ze, {
                text: $.label
              }, null, 8, ["text"])
            ], 10, Hd),
            E("span", {
              part: u.value.part,
              class: A(u.value.class)
            }, [
              e.controller.answerItemsFor($) ? (b(), W(Ho, {
                key: 0,
                items: e.controller.answerItemsFor($)
              }, null, 8, ["items"])) : $.required ? (b(), g(ee, { key: 1 }, [
                oe(" Not answered yet ")
              ], 64)) : (b(), g("span", {
                key: 2,
                part: d.value.part,
                class: A(d.value.class)
              }, "Skipped", 10, Gd))
            ], 10, Kd)
          ], 10, Ud)
        ], 10, qd))), 128))
      ], 10, Md),
      E("div", {
        part: o.value.part,
        class: A(o.value.class)
      }, [
        w.value ? (b(), g("p", {
          key: 0,
          part: r.value.part,
          class: A(r.value.class)
        }, V(w.value), 11, Qd)) : N("", !0),
        H(_(ve), {
          type: "button",
          part: a.value.part,
          class: A(a.value.class),
          "data-focus": "send-all",
          disabled: h.value.length > 0 || e.disabled,
          onClick: y[0] || (y[0] = ($) => e.controller.submitAll())
        }, {
          default: ne(() => [
            y[1] || (y[1] = oe(" Send answers ", -1)),
            H(_(be), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, Yd),
      E("p", {
        part: s.value.part,
        class: A(s.value.class)
      }, " Enter sends. Pick a row to change it. ← goes back to the last question. ", 10, Zd)
    ], 64));
  }
}), Xd = ["part", "aria-busy"], ec = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, tc = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, nc = ["part"], oc = { class: "flex items-center gap-2" }, rc = {
  "aria-live": "polite",
  class: "w-form__sr"
}, ac = "You are offline. Your choices are kept.", ic = "Sending your answer…", sc = /* @__PURE__ */ pe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, a = Hu(o.state.definition, o.state.data, (m) => {
      o.offline || o.submitting || r("submit", m);
    }), s = S(() => !!o.offline || o.submitting), l = `${nn()}-q`, i = U(null);
    ae(a.inReview, (m) => r("update:state", m ? "review" : "active"), { immediate: !0 }), ae(a.collapsed, (m) => r("update:collapsed", m), { immediate: !0 });
    const u = U({}), d = U([]);
    function c(m) {
      const p = [...d.value];
      return u.value[m] && p.push(u.value[m]), p.join(" ");
    }
    const f = S(() => new Set(o.state.definition.fields.map((m) => m.id))), h = S(() => {
      const m = Object.entries(u.value).filter(([p]) => !f.value.has(p)).map(([, p]) => p);
      return [...d.value, ...m].join(" ");
    });
    ae(
      () => Object.fromEntries(o.state.definition.fields.map((m) => [m.id, JSON.stringify(a.ans(m))])),
      (m, p) => {
        if (!p)
          return;
        const v = new Set(
          o.state.definition.fields.map((P) => P.id).filter((P) => m[P] !== p[P] && u.value[P])
        );
        v.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([P]) => !v.has(P))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(m, p) {
        const v = {};
        for (const [L, J] of Object.entries(m ?? {}))
          v[L] = J.map((C) => C.message).join(" ");
        u.value = v, d.value = (p ?? []).map((L) => L.message);
        const P = o.state.definition.fields.findIndex((L) => v[L.id]);
        P >= 0 && a.go(P, "first");
      },
      retry() {
        r("submit", a.buildAnswers());
      }
    });
    const w = S(() => z("card")), k = S(() => z("title"));
    function y(m) {
      const p = i.value;
      if (!p)
        return;
      let v = null;
      if (m === "card" ? v = p : m === "first" ? v = p.querySelector(".w-form__option--selected .w-form__option-main") ?? p.querySelector(".w-form__option-main, .w-form__other-input") : v = Array.from(p.querySelectorAll("[data-focus]")).find((P) => P.dataset.focus === m) ?? null, !!v && (v.focus(), v.tagName === "TEXTAREA")) {
        const P = v;
        P.setSelectionRange(P.value.length, P.value.length);
      }
    }
    ae(a.focusSeq, () => {
      Ke(() => {
        const m = a.focusTarget.value;
        m && y(m);
      });
    });
    function $() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function x(m) {
      const p = m.composedPath()[0];
      if (p?.tagName === "TEXTAREA" || m.isComposing || m.ctrlKey || m.metaKey || m.altKey || a.collapsed.value || s.value)
        return;
      if (a.inReview.value) {
        m.key === "ArrowLeft" && (m.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const v = a.currentQuestion.value;
      if (!v)
        return;
      const P = a.ans(v), L = m.shiftKey ? /^Digit([1-9])$/.exec(m.code) : /^([1-9])$/.exec(m.key);
      if (L) {
        const R = Number(L[1]) - 1;
        if (R >= v.options.length + (v.allow_other ? 1 : 0))
          return;
        m.preventDefault(), m.shiftKey && R < v.options.length ? a.toggleNote(v, v.options[R].value, !0) : a.activate(v, R);
        return;
      }
      const J = p?.dataset?.focus ?? "", C = J.startsWith("opt-") ? Number(J.slice(4)) : -1;
      if (m.key === "ArrowDown" || m.key === "ArrowUp") {
        const R = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (R.length === 0)
          return;
        m.preventDefault();
        const j = R.indexOf(p), B = m.key === "ArrowDown" ? (j + 1) % R.length : j <= 0 ? R.length - 1 : j - 1;
        R[B]?.focus();
        return;
      }
      if (a.multi && (m.key === "ArrowRight" || m.key === "ArrowLeft")) {
        m.preventDefault(), a.go(a.index.value + (m.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((m.key === "n" || m.key === "N") && C >= 0) {
        m.preventDefault(), a.toggleNote(v, v.options[C].value, !0);
        return;
      }
      if (C >= 0 && (m.key === " " || m.key === "Enter" && !v.multiple)) {
        m.preventDefault(), a.activate(v, C);
        return;
      }
      m.key === "Enter" && v.multiple && !p?.matches?.("button") && (m.preventDefault(), P.chosen.length > 0 || P.other.trim() ? a.commit(v) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(C >= 0 ? J : "first")));
    }
    return (m, p) => (b(), g("section", {
      ref_key: "cardRoot",
      ref: i,
      part: w.value.part,
      class: A(`w-form ${w.value.class}`),
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: x
    }, [
      e.offline ? (b(), g("p", ec, V(ac))) : N("", !0),
      e.submitting ? (b(), g("p", tc, V(ic))) : N("", !0),
      h.value ? (b(), W(_(we), {
        key: 2,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          oe(V(h.value), 1)
        ]),
        _: 1
      })) : N("", !0),
      _(a).multi ? (b(), g("p", {
        key: 3,
        part: k.value.part,
        class: A(k.value.class)
      }, [
        H(_(be), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        oe(" " + V(e.state.definition.title), 1)
      ], 10, nc)) : N("", !0),
      H(nd, {
        multi: _(a).multi,
        index: _(a).index.value,
        n: _(a).n,
        review: _(a).inReview.value,
        "question-text": _(a).currentQuestion.value?.label ?? "",
        collapsed: _(a).collapsed.value,
        qid: l,
        onPrev: p[0] || (p[0] = (v) => _(a).go(_(a).index.value - 1, "first")),
        onNext: p[1] || (p[1] = (v) => _(a).go(_(a).index.value + 1, "first")),
        onToggleCollapse: $
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (b(), W(_(we), {
        key: 4,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ne(() => [
          E("div", oc, [
            E("span", null, V(e.banner.message), 1),
            e.banner.retryable ? (b(), W(_(ve), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: p[2] || (p[2] = (v) => r("retry"))
            }, {
              default: ne(() => [...p[3] || (p[3] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            })) : N("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : N("", !0),
      _(a).collapsed.value ? N("", !0) : (b(), g(ee, { key: 5 }, [
        _(a).inReview.value ? (b(), W(Jd, {
          key: 0,
          definition: e.state.definition,
          controller: _(a),
          disabled: s.value
        }, null, 8, ["definition", "controller", "disabled"])) : _(a).currentQuestion.value ? (b(), W(Vd, {
          key: 1,
          question: _(a).currentQuestion.value,
          controller: _(a),
          qid: l,
          stale: !!e.state.stale,
          "server-error": c(_(a).currentQuestion.value.id),
          disabled: s.value
        }, null, 8, ["question", "controller", "stale", "server-error", "disabled"])) : N("", !0)
      ], 64)),
      E("p", rc, V(_(a).liveMessage.value), 1)
    ], 42, Xd));
  }
}), lc = ["part", "aria-label"], uc = ["part"], dc = ["part"], cc = ["part"], pc = ["part"], fc = ["part"], mc = ["part"], hc = ["part"], bc = { key: 0 }, vc = { key: 1 }, gc = { key: 2 }, yc = { key: 3 }, wc = { key: 4 }, xc = /* @__PURE__ */ pe({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function o(w) {
      if (!w)
        return null;
      const k = new Date(w);
      return Number.isNaN(k.getTime()) ? null : k.toLocaleString();
    }
    const r = S(() => z("card", "answered")), a = S(() => z("title")), s = S(() => z("summary")), l = S(() => z("summary-item")), i = S(() => z("summary-question")), u = S(() => z("summary-answer")), d = S(() => z("answer-empty")), c = S(() => z("status"));
    function f(w) {
      const k = n.state.definition.fields.find((y) => y.id === w);
      return k ? Bo(k, n.state.data ? n.state.data[w] : void 0) : null;
    }
    const h = U(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        h.value?.focus();
      }
    }), (w, k) => (b(), g("section", {
      part: r.value.part,
      class: A(`w-form ${r.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      E("p", {
        part: a.value.part,
        class: A(a.value.class)
      }, [
        H(_(be), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        oe(" " + V(e.state.definition.title), 1)
      ], 10, uc),
      E("dl", {
        part: s.value.part,
        class: A(s.value.class)
      }, [
        (b(!0), g(ee, null, he(e.state.definition.fields, (y) => (b(), g("div", {
          key: y.id,
          part: l.value.part,
          class: A(l.value.class)
        }, [
          E("dt", {
            part: i.value.part,
            class: A(i.value.class)
          }, [
            H(ze, {
              text: y.label
            }, null, 8, ["text"])
          ], 10, pc),
          E("dd", {
            part: u.value.part,
            class: A(u.value.class)
          }, [
            f(y.id) ? (b(), W(Ho, {
              key: 0,
              items: f(y.id)
            }, null, 8, ["items"])) : (b(), g("span", {
              key: 1,
              part: d.value.part,
              class: A(d.value.class)
            }, "Skipped", 10, mc))
          ], 10, fc)
        ], 10, cc))), 128))
      ], 10, dc),
      E("div", {
        ref_key: "statusEl",
        ref: h,
        tabindex: "-1",
        part: c.value.part,
        class: A(c.value.class)
      }, [
        e.state.late ? (b(), g("p", bc, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : N("", !0),
        e.state.delivery === "pending" ? (b(), g("p", vc, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (b(), g("p", gc, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (b(), g("p", yc, " The assistant stopped before answering. Send a message to continue. ")) : N("", !0),
        o(e.state.submitted_at) ? (b(), g("p", wc, " Answered " + V(o(e.state.submitted_at)), 1)) : N("", !0)
      ], 10, hc)
    ], 10, lc));
  }
}), kc = { class: "p-3 max-w-full min-w-0" }, _c = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, $c = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Sc = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, Pc = { class: "flex items-center gap-2" }, Cc = "Could not refresh this form. Showing what you last saw.", Tc = "This form was already answered elsewhere, so your answer was not sent. The saved answer is shown below.", Oc = /* @__PURE__ */ pe({
  __name: "wippy-form",
  setup(e) {
    const t = Ns(), n = zs(), o = Is(), r = Ys(), a = S(() => t.value.definition), s = S(() => t.value.state), { status: l, state: i, errorMessage: u, reloadError: d, reload: c, refresh: f } = Ds(r, s);
    Fs(i, f);
    const { submitting: h, submit: w } = Gs(r), { isOnline: k } = Zs(() => c()), y = U(null), $ = U(!1);
    ae(r, () => {
      $.value = !1;
    });
    const x = U(null), m = U(null);
    let p = !1;
    ae(() => i.value?.status, (Q, F) => {
      if (!(Q !== "idle" || F !== "active")) {
        if (p) {
          p = !1;
          return;
        }
        $.value = !0;
      }
    });
    const v = S(() => {
      const Q = t.value.formVersion;
      if (Q !== void 0 && Q !== 1)
        return !0;
      const F = i.value?.form_version;
      return F !== void 0 && F !== 1;
    }), P = S(() => {
      const Q = a.value?.fields;
      return !!Q && Q.length > 0 && Q.every((F) => F.type === "choice");
    }), L = U("active"), J = U(!1), C = S(() => i.value?.status === "idle" ? "answered" : P.value ? L.value : "active"), R = S(() => P.value && i.value?.status === "active" && J.value);
    Qs(C, R);
    async function j(Q) {
      if (!i.value)
        return;
      y.value = null;
      const F = await w(i.value.form_version, i.value.content_version, Q);
      if (!F.ignored) {
        if (F.ok && F.accepted) {
          const re = F.accepted;
          p = !0, i.value = {
            ...i.value,
            status: "idle",
            stale: !1,
            late: re.late,
            content_version: re.content_version,
            data: Q,
            answer_message_id: re.answer_message_id,
            delivery: re.delivery
          }, o("answer-submitted", { requestId: re.request_id, answerMessageId: re.answer_message_id, late: re.late }), Ke(() => m.value?.focusStatus()), c();
          return;
        }
        if (F.fieldErrors || F.formErrors) {
          x.value?.setServerErrors(F.fieldErrors, F.formErrors);
          return;
        }
        if (F.code === "already_submitted") {
          $.value = !0, c(), Ke(() => m.value?.focusStatus());
          return;
        }
        F.shouldReload && c(), y.value = { message: F.message ?? "Could not submit this form.", retryable: F.retryable };
      }
    }
    function B() {
      x.value?.retry();
    }
    return (Q, F) => (b(), g("div", kc, [
      _(n).length > 0 ? (b(), W(_(we), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [...F[2] || (F[2] = [
          oe(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : a.value ? v.value ? (b(), W(_(we), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: ne(() => [...F[4] || (F[4] = [
          oe(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : _(r) ? _(i) ? (b(), g(ee, { key: 4 }, [
        _(d) ? (b(), g("p", _c, V(Cc))) : N("", !0),
        _(i).status === "active" && P.value ? (b(), W(sc, {
          key: _(r),
          ref_key: "activeFormRef",
          ref: x,
          state: _(i),
          submitting: _(h),
          banner: y.value,
          offline: !_(k),
          onSubmit: j,
          onRetry: B,
          "onUpdate:state": F[0] || (F[0] = (re) => {
            L.value = re;
          }),
          "onUpdate:collapsed": F[1] || (F[1] = (re) => {
            J.value = re;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : _(i).status === "active" ? (b(), W(Au, {
          key: _(r),
          ref_key: "activeFormRef",
          ref: x,
          state: _(i),
          submitting: _(h),
          banner: y.value,
          offline: !_(k),
          onSubmit: j,
          onRetry: B
        }, null, 8, ["state", "submitting", "banner", "offline"])) : _(i).status === "idle" ? (b(), g(ee, { key: 3 }, [
          $.value ? (b(), g("p", $c, V(Tc))) : N("", !0),
          P.value ? (b(), W(xc, {
            key: _(r),
            ref_key: "idleFormRef",
            ref: m,
            state: _(i)
          }, null, 8, ["state"])) : (b(), W(Bu, {
            key: _(r),
            ref_key: "idleFormRef",
            ref: m,
            state: _(i)
          }, null, 8, ["state"]))
        ], 64)) : N("", !0)
      ], 64)) : _(l) === "loading" || _(l) === "idle" ? (b(), g("wippy-loading", Sc)) : _(l) === "unsupported" ? (b(), W(_(we), {
        key: 6,
        severity: "warn",
        closable: !1
      }, {
        default: ne(() => [...F[5] || (F[5] = [
          oe(" This form needs a newer Web Host. ", -1)
        ])]),
        _: 1
      })) : _(l) === "error" ? (b(), W(_(we), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          E("div", Pc, [
            E("span", null, V(_(u) || "Could not load this form."), 1),
            H(_(ve), {
              type: "button",
              link: "",
              size: "small",
              onClick: _(c)
            }, {
              default: ne(() => [...F[6] || (F[6] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : N("", !0) : (b(), W(Wu, {
        key: 3,
        definition: a.value
      }, null, 8, ["definition"])) : (b(), W(_(we), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [...F[3] || (F[3] = [
          oe(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Ac = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.outline-none{outline:2px solid transparent;outline-offset:2px}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible,.w-form__status:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small);color:var(--_danger)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{color:var(--_danger);font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;font-size:12px;color:var(--_muted)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class Ec extends Fi {
  static get wippyConfig() {
    return {
      propsSchema: Di.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Ac
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Oc,
      plugins: [pi],
      providers(t, n) {
        t.provide(dn, n);
      }
    };
  }
}
wr(import.meta.url, Ec);
//# sourceMappingURL=index.js.map
