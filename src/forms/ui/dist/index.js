import { ref as q, readonly as fo, getCurrentInstance as bn, onMounted as sn, nextTick as Ne, watch as oe, reactive as ln, renderSlot as ce, openBlock as p, createBlock as W, Teleport as sr, createCommentVNode as I, useId as Lt, mergeProps as H, h as mo, createApp as ho, inject as ht, createElementBlock as v, createElementVNode as L, createTextVNode as se, toDisplayString as F, resolveComponent as Ze, resolveDirective as lr, withDirectives as ur, resolveDynamicComponent as dr, withCtx as ae, normalizeClass as j, Transition as bo, onUnmounted as It, computed as _, watchEffect as vo, defineComponent as pe, Fragment as te, renderList as me, createVNode as K, unref as x, withModifiers as cr } from "vue";
import { addCollection as go, Icon as ye } from "@iconify/vue";
import * as un from "@wippy-fe/proxy";
import { config as vn, addIcons as yo, on as Me, applyThemeMode as yt, host as wo, hostCss as xo, loadCss as ko, define as _o } from "@wippy-fe/proxy";
import { getActivePinia as $o, createPinia as So, setActivePinia as Po } from "pinia";
var Co = Object.defineProperty, gn = Object.getOwnPropertySymbols, To = Object.prototype.hasOwnProperty, Oo = Object.prototype.propertyIsEnumerable, yn = (e, t, n) => t in e ? Co(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ao = (e, t) => {
  for (var n in t || (t = {})) To.call(t, n) && yn(e, n, t[n]);
  if (gn) for (var n of gn(t)) Oo.call(t, n) && yn(e, n, t[n]);
  return e;
};
function Fe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function qt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, l;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!qt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let f = Object.keys(e);
  if (s = f.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, f[a])) return !1;
  for (a = s; a-- !== 0; ) if (l = f[a], !qt(e[l], t[l], n)) return !1;
  return !0;
}
function Eo(e, t) {
  return qt(e, t);
}
function dn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function ne(e) {
  return !Fe(e);
}
function wn(e, t) {
  return null;
}
function cn(e, t, n) {
  return n ? wn() === wn() : Eo(e, t);
}
function jo(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (cn(e, n)) return !0;
  }
  return !1;
}
function Ce(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function pr(e = {}, t = {}) {
  let n = Ao({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    Ce(t[o]) && o in e && Ce(e[o]) ? n[o] = pr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Lo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : pr(t, n), {});
}
function ve(e, ...t) {
  return dn(e) ? e(...t) : e;
}
function he(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Pe(e) {
  return he(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function pn(e, t = "", n = {}) {
  let r = Pe(t).split("."), o = r.shift();
  if (o) {
    if (Ce(e)) {
      let a = Object.keys(e).find((s) => Pe(s) === o) || "";
      return pn(ve(e[a], n), r.join("."), n);
    }
    return;
  }
  return ve(e, n);
}
function fr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Io(e) {
  return ne(e) && !isNaN(e);
}
function ze(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function No(...e) {
  return Lo(...e);
}
function Qe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function zo(e) {
  return he(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function mr(e) {
  return he(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function hr() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function Te(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Te(...r)] : Object.entries(r).map(([s, l]) => l ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Ro(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Vo(e, t) {
  if (e && t) {
    let n = (r) => {
      Ro(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Bt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function xn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Bo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Fo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Do(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Fo(e));
}
function bt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function St(e, t = {}) {
  if (bt(e)) {
    let n = (r, o) => {
      var a, s;
      let l = (a = e?.$attrs) != null && a[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([f, m]) => r === "style" && (m || m === 0) ? `${f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? f : void 0);
            i = c.length ? i.concat(c.filter((f) => !!f)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? St(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Mo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return St(r, t), r.append(...n), r;
  }
}
function qo(e, t) {
  return bt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Uo(e, t) {
  if (bt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function kn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Wo(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || xn(document.documentElement) || xn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ho(e, t) {
  return e ? e.offsetHeight : 0;
}
function _n(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function br() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ko(e, t = "", n) {
  bt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var wt = {};
function Go(e = "pui_id_") {
  return Object.hasOwn(wt, e) || (wt[e] = 0), wt[e]++, `${e}${wt[e]}`;
}
var Yo = Object.defineProperty, Qo = Object.defineProperties, Zo = Object.getOwnPropertyDescriptors, Pt = Object.getOwnPropertySymbols, vr = Object.prototype.hasOwnProperty, gr = Object.prototype.propertyIsEnumerable, $n = (e, t, n) => t in e ? Yo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ke = (e, t) => {
  for (var n in t || (t = {})) vr.call(t, n) && $n(e, n, t[n]);
  if (Pt) for (var n of Pt(t)) gr.call(t, n) && $n(e, n, t[n]);
  return e;
}, Ft = (e, t) => Qo(e, Zo(t)), Oe = (e, t) => {
  var n = {};
  for (var r in e) vr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Pt) for (var r of Pt(e)) t.indexOf(r) < 0 && gr.call(e, r) && (n[r] = e[r]);
  return n;
}, Jo = hr(), ue = Jo, Je = /{([^}]*)}/g, yr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, wr = /var\([^)]+\)/g;
function Sn(e) {
  return he(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Xo(e) {
  return Ce(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ea(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ut(e = "", t = "") {
  return ea(`${he(e, !1) && he(t, !1) ? `${e}-` : e}${t}`);
}
function xr(e = "", t = "") {
  return `--${Ut(e, t)}`;
}
function ta(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function kr(e, t = "", n = "", r = [], o) {
  if (he(e)) {
    let a = e.trim();
    if (ta(a)) return;
    if (ze(a, Je)) {
      let s = a.replaceAll(Je, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => ze(u, d)));
        return `var(${xr(n, mr(i.join("-")))}${ne(o) ? `, ${o}` : ""})`;
      });
      return ze(s.replace(wr, "0"), yr) ? `calc(${s})` : s;
    }
    return a;
  } else if (Io(e)) return e;
}
function na(e, t, n) {
  he(t, !1) && e.push(`${t}:${n};`);
}
function qe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function _r(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let i = [], u = 0, d = "", c = null, f = 0;
    for (; u <= s.length; ) {
      let m = s[u];
      if ((m === '"' || m === "'" || m === "`") && s[u - 1] !== "\\" && (c = c === m ? null : m), !c && (m === "(" && f++, m === ")" && f--, (m === "," || u === s.length) && f === 0)) {
        let w = d.trim();
        w.startsWith("dt(") ? i.push(_r(w, l)) : i.push(r(w)), d = "", u++;
        continue;
      }
      m !== void 0 && (d += m), u++;
    }
    return i;
  }
  function r(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let l = a.pop();
    a.length === 0 && o.push([l, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [l, i] = o[s], u = e.slice(l + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, l) + c + e.slice(i + 1);
  }
  return e;
}
var Re = (...e) => ra(ee.getTheme(), ...e), ra = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = ee.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = ze(t, Je) ? t : `{${t}}`;
    return r === "value" || Fe(r) && l === "strict" ? ee.getTokenValue(t) : kr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function xt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = ve(t[a], { dt: Re })) != null ? s : "");
    }, "");
    return _r(n, Re);
  }
  return ve(e, { dt: Re });
}
function oa(e, t = {}) {
  let n = ee.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let f in d) {
      let m = d[f], w = Xo(m), P = ze(f, a) ? Ut(c) : Ut(c, mr(f));
      if (Ce(w)) i.push({ node: w, path: P });
      else {
        let g = xr(P), $ = kr(w, P, r, [a]);
        na(l, g, $);
        let k = P;
        r && k.startsWith(r + "-") && (k = k.slice(r.length + 1)), s.push(k.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: qe(o, u) };
}
var xe = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return oa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, l, i, u, d, c;
  let { preset: f, options: m } = t, w, P, g, $, k, S, b;
  if (ne(f) && m.transform !== "strict") {
    let { primitive: C, semantic: B, extend: M } = f, D = B || {}, { colorScheme: h } = D, A = Oe(D, ["colorScheme"]), y = M || {}, { colorScheme: T } = y, V = Oe(y, ["colorScheme"]), G = h || {}, { dark: N } = G, J = Oe(G, ["dark"]), be = T || {}, { dark: _e } = be, Ee = Oe(be, ["dark"]), O = ne(C) ? this._toVariables({ primitive: C }, m) : {}, E = ne(A) ? this._toVariables({ semantic: A }, m) : {}, R = ne(J) ? this._toVariables({ light: J }, m) : {}, Q = ne(N) ? this._toVariables({ dark: N }, m) : {}, re = ne(V) ? this._toVariables({ semantic: V }, m) : {}, $e = ne(Ee) ? this._toVariables({ light: Ee }, m) : {}, vt = ne(_e) ? this._toVariables({ dark: _e }, m) : {}, [Vt, je] = [(a = O.declarations) != null ? a : "", O.tokens], [gt, Zr] = [(s = E.declarations) != null ? s : "", E.tokens || []], [Jr, Xr] = [(l = R.declarations) != null ? l : "", R.tokens || []], [eo, to] = [(i = Q.declarations) != null ? i : "", Q.tokens || []], [no, ro] = [(u = re.declarations) != null ? u : "", re.tokens || []], [oo, ao] = [(d = $e.declarations) != null ? d : "", $e.tokens || []], [io, so] = [(c = vt.declarations) != null ? c : "", vt.tokens || []];
    w = this.transformCSS(e, Vt, "light", "variable", m, r, o), P = je;
    let lo = this.transformCSS(e, `${gt}${Jr}`, "light", "variable", m, r, o), uo = this.transformCSS(e, `${eo}`, "dark", "variable", m, r, o);
    g = `${lo}${uo}`, $ = [.../* @__PURE__ */ new Set([...Zr, ...Xr, ...to])];
    let co = this.transformCSS(e, `${no}${oo}color-scheme:light`, "light", "variable", m, r, o), po = this.transformCSS(e, `${io}color-scheme:dark`, "dark", "variable", m, r, o);
    k = `${co}${po}`, S = [.../* @__PURE__ */ new Set([...ro, ...ao, ...so])], b = ve(f.css, { dt: Re });
  }
  return { primitive: { css: w, tokens: P }, semantic: { css: g, tokens: $ }, global: { css: k, tokens: S }, style: b };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var l, i, u;
  let d, c, f;
  if (ne(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), w = t, { colorScheme: P, extend: g, css: $ } = w, k = Oe(w, ["colorScheme", "extend", "css"]), S = g || {}, { colorScheme: b } = S, C = Oe(S, ["colorScheme"]), B = P || {}, { dark: M } = B, D = Oe(B, ["dark"]), h = b || {}, { dark: A } = h, y = Oe(h, ["dark"]), T = ne(k) ? this._toVariables({ [m]: ke(ke({}, k), C) }, n) : {}, V = ne(D) ? this._toVariables({ [m]: ke(ke({}, D), y) }, n) : {}, G = ne(M) ? this._toVariables({ [m]: ke(ke({}, M), A) }, n) : {}, [N, J] = [(l = T.declarations) != null ? l : "", T.tokens || []], [be, _e] = [(i = V.declarations) != null ? i : "", V.tokens || []], [Ee, O] = [(u = G.declarations) != null ? u : "", G.tokens || []], E = this.transformCSS(m, `${N}${be}`, "light", "variable", n, o, a, s), R = this.transformCSS(m, Ee, "dark", "variable", n, o, a, s);
    d = `${E}${R}`, c = [.../* @__PURE__ */ new Set([...J, ..._e, ...O])], f = ve($, { dt: Re });
  }
  return { css: d, tokens: c, style: f };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: s, options: l } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s;
  let l = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((a = i?.components) == null ? void 0 : a[l]) || ((s = i?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${ve(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), l = Object.entries(r).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [u, d]) => {
    if (Ce(d) && Object.hasOwn(d, "css")) {
      let c = Qe(d.css), f = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${f}" ${l}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((d, [c, f]) => d.push(`${c}="${f}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Qe(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Je.test(this.value)) {
      let c = this.value.trim().replace(Je, (f) => {
        var m;
        let w = f.slice(1, -1), P = this.tokens[w];
        if (!P) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let g = P.computed(l, i, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (m = g?.value) != null ? m : "__UNRESOLVED__";
      });
      d = yr.test(c.replace(wr, "0")) ? `calc(${c})` : c;
    }
    return Fe(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let f = ze(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${Sn(d)}` : Sn(d), m = u ? `${u}.${d}` : d;
      Ce(c) ? s(c, f, m) : (o[f] || (o[f] = { paths: [], computed: (w, P = {}, g = []) => {
        if (o[f].paths.length === 1) return o[f].paths[0].computed(o[f].paths[0].scheme, P.binding, g);
        if (w && w !== "none") for (let $ = 0; $ < o[f].paths.length; $++) {
          let k = o[f].paths[$];
          if (k.scheme === w) return k.computed(w, P.binding, g);
        }
        return o[f].paths.map(($) => $.computed($.scheme, P[$.scheme], g));
      } }), o[f].paths.push({ path: m, value: c, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !ze(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Oe(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? qe(ne(t) ? `${e}${t},${e} ${t}` : e, r) : qe(e, qe(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, l) {
  if (ne(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: f }) => (ne(f) && (d += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, l, c, t)), d), "") : qe(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      Ce(i) && (u.name = ve(i.name, { name: e, type: r })), ne(u.name) && (t = qe(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, ee = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Ft(ke({}, t), { options: ke(ke({}, this.defaults.options), t.options) }), this._tokens = xe.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ue.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Ft(ke({}, this.theme), { preset: e }), this._tokens = xe.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ue.emit("preset:change", e), ue.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Ft(ke({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ue.emit("options:change", e), ue.emit("theme:change", this.theme);
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
  return xe.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return xe.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return xe.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return xe.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return xe.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return xe.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return xe.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return xe.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return xe.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ue.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ue.emit("theme:load"));
} }, de = {
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
}, aa = `
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
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function Pn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Cn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      ia(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ia(e, t, n) {
  return (t = sa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sa(e) {
  var t = la(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function la(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ua(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  bn() && bn().components ? sn(e) : t ? e() : Ne(e);
}
var da = 0;
function ca(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = q(!1), r = q(e), o = q(null), a = br() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, f = t.name, m = f === void 0 ? "style_".concat(++da) : f, w = t.id, P = w === void 0 ? void 0 : w, g = t.media, $ = g === void 0 ? void 0 : g, k = t.nonce, S = k === void 0 ? void 0 : k, b = t.first, C = b === void 0 ? !1 : b, B = t.onMounted, M = B === void 0 ? void 0 : B, D = t.onUpdated, h = D === void 0 ? void 0 : D, A = t.onLoad, y = A === void 0 ? void 0 : A, T = t.props, V = T === void 0 ? {} : T, G = function() {
  }, N = function(_e) {
    var Ee = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var O = Cn(Cn({}, V), Ee), E = O.name || m, R = O.id || P, Q = O.nonce || S;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(E, '"]')) || l.getElementById(R) || l.createElement("style"), o.value.isConnected || (r.value = _e || e, St(o.value, {
        type: "text/css",
        id: R,
        media: $,
        nonce: Q
      }), C ? l.head.prepend(o.value) : l.head.appendChild(o.value), Ko(o.value, "data-primevue-style-id", E), St(o.value, O), o.value.onload = function(re) {
        return y?.(re, {
          name: E
        });
      }, M?.(E)), !n.value && (G = oe(r, function(re) {
        o.value.textContent = re, h?.(E);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, J = function() {
    !l || !n.value || (G(), Do(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && ua(N), {
    id: P,
    name: m,
    el: o,
    css: r,
    unload: J,
    load: N,
    isLoaded: fo(n)
  };
}
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
var Tn, On, An, En;
function jn(e, t) {
  return ha(e) || ma(e, t) || fa(e, t) || pa();
}
function pa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fa(e, t) {
  if (e) {
    if (typeof e == "string") return Ln(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ln(e, t) : void 0;
  }
}
function Ln(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ma(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function ha(e) {
  if (Array.isArray(e)) return e;
}
function In(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Dt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? In(Object(n), !0).forEach(function(r) {
      ba(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ba(e, t, n) {
  return (t = va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function va(e) {
  var t = ga(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function kt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ya = function(t) {
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
}, wa = {}, xa = {}, X = {
  name: "base",
  css: ya,
  style: aa,
  classes: wa,
  inlineStyles: xa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(xt(Tn || (Tn = kt(["", ""])), t));
    return ne(o) ? ca(Qe(o), Dt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return ee.transformCSS(n.name || t.name, "".concat(o).concat(xt(On || (On = kt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return ee.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return ee.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return ee.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return ee.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return ee.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ve(this.css, {
        dt: Re
      }) || "", o = Qe(xt(An || (An = kt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, l) {
        var i = jn(l, 2), u = i[0], d = i[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return ne(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return ee.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [ee.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = xt(En || (En = kt(["", ""])), ve(this.style, {
        dt: Re
      })), s = Qe(ee.transformCSS(o, a)), l = Object.entries(n).reduce(function(i, u) {
        var d = jn(u, 2), c = d[0], f = d[1];
        return i.push("".concat(c, '="').concat(f, '"')) && i;
      }, []).join(" ");
      ne(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Dt(Dt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ie = hr();
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function Nn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(r) {
      ka(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ka(e, t, n) {
  return (t = _a(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _a(e) {
  var t = $a(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function $a(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Sa = {
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
    text: [de.STARTS_WITH, de.CONTAINS, de.NOT_CONTAINS, de.ENDS_WITH, de.EQUALS, de.NOT_EQUALS],
    numeric: [de.EQUALS, de.NOT_EQUALS, de.LESS_THAN, de.LESS_THAN_OR_EQUAL_TO, de.GREATER_THAN, de.GREATER_THAN_OR_EQUAL_TO],
    date: [de.DATE_IS, de.DATE_IS_NOT, de.DATE_BEFORE, de.DATE_AFTER]
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
}, Pa = Symbol();
function Ca(e, t) {
  var n = {
    config: ln(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Pa, n), Ta(), Oa(e, n), n;
}
var Ue = [];
function Ta() {
  ue.clear(), Ue.forEach(function(e) {
    return e?.();
  }), Ue = [];
}
function Oa(e, t) {
  var n = q(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !ee.isStyleNameLoaded("common")) {
      var d, c, f = ((d = X.getCommonTheme) === null || d === void 0 ? void 0 : d.call(X)) || {}, m = f.primitive, w = f.semantic, P = f.global, g = f.style, $ = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      X.load(m?.css, _t({
        name: "primitive-variables"
      }, $)), X.load(w?.css, _t({
        name: "semantic-variables"
      }, $)), X.load(P?.css, _t({
        name: "global-variables"
      }, $)), X.loadStyle(_t({
        name: "global-style"
      }, $), g), ee.setLoadedStyleName("common");
    }
  };
  ue.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = oe(t.config, function(i, u) {
    Ie.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = oe(function() {
    return t.config.ripple;
  }, function(i, u) {
    Ie.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = oe(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || ee.setTheme(i), t.config.unstyled || r(), n.value = !1, Ie.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = oe(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), Ie.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ue.push(o), Ue.push(a), Ue.push(s), Ue.push(l);
}
var Aa = {
  install: function(t, n) {
    var r = No(Sa, n);
    Ca(t, r);
  }
}, $r = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = br();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ea(e, t, n, r, o, a) {
  return a.inline ? ce(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (p(), W(sr, {
    key: 1,
    to: n.appendTo
  }, [ce(e.$slots, "default")], 8, ["to"])) : I("", !0);
}
$r.render = Ea;
var Le = {
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
function ja() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Lt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var zn = X.extend({
  name: "common"
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function La(e) {
  return Cr(e) || Ia(e) || Pr(e) || Sr();
}
function Ia(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function He(e, t) {
  return Cr(e) || Na(e, t) || Pr(e, t) || Sr();
}
function Sr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pr(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Na(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Cr(e) {
  if (Array.isArray(e)) return e;
}
function Rn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Y(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rn(Object(n), !0).forEach(function(r) {
      Ge(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ge(e, t, n) {
  return (t = za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function za(e) {
  var t = Ra(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ra(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var We = {
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
        ue.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ue.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, r, o, a, s, l, i, u, d, c, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = f ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = w || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var P = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, g = P ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, $ = P ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = $ || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = ja(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = qo(bt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = Y({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), r?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return dn(t) ? t.apply(void 0, r) : H.apply(void 0, r);
    },
    _load: function() {
      Le.isStyleNameLoaded("base") || (X.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Le.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Le.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (zn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Le.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      ne(t) && X.load(t, Y({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!ee.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, l = a.semantic, i = a.global, u = a.style;
          X.load(s?.css, Y({
            name: "primitive-variables"
          }, this.$styleOptions)), X.load(l?.css, Y({
            name: "semantic-variables"
          }, this.$styleOptions)), X.load(i?.css, Y({
            name: "global-variables"
          }, this.$styleOptions)), X.loadStyle(Y({
            name: "global-style"
          }, this.$styleOptions), u), ee.setLoadedStyleName("common");
        }
        if (!ee.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, f, m, w = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, P = w.css, g = w.style;
          (f = this.$style) === null || f === void 0 || f.load(P, Y({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(Y({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), ee.setLoadedStyleName(this.$style.name);
        }
        if (!ee.isStyleNameLoaded("layer-order")) {
          var $, k, S = ($ = this.$style) === null || $ === void 0 || (k = $.getLayerOrderThemeCSS) === null || k === void 0 ? void 0 : k.call($);
          X.load(S, Y({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), ee.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, Y({
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
      Le.clearLoadedStyleNames(), ue.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ue.off("theme:change", this._loadCoreStyles), ue.off("theme:change", this._load), ue.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return pn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, Y(Y({}, o), {}, {
        global: f || {}
      })), w = this._getPTDatasets(r);
      return u || !u && m ? c ? this._mergeProps(c, f, m, w) : Y(Y(Y({}, f), m), w) : Y(Y({}, m), w);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return H(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && ne((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && Y(Y({}, r === "root" && Y(Y(Ge({}, "".concat(o, "name"), Pe(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ge({}, "".concat(o, "extend"), Pe(this.$.type.name))), {}, Ge({}, "".concat(this.$attrSelector), ""))), {}, Ge({}, "".concat(o, "section"), Pe(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return he(t) || fr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = Pe(r), f = Pe(n.$name);
        return (i = u ? c !== f ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(P) {
        return n(P, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a(t.originalValue), m = a(t.value);
        return f === void 0 && m === void 0 ? void 0 : he(m) ? m : he(f) ? f : u || !u && m ? c ? this._mergeProps(c, f, m) : Y(Y({}, f), m) : m;
      }
      return a(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, Y(Y({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = H(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, Y({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, Y(Y({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, Y(Y({}, this.$params), r)), a = this._getOptionValue(zn.inlineStyles, t, Y(Y({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ve(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, Y({}, n.$params)) || ve(r, Y({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = He(r, 1), a = o[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return Y(Y({
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
        var n = He(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = He(n, 2), o = r[0], a = r[1], s = o.split(":"), l = La(s), i = Wt(l).slice(1);
        return i?.reduce(function(u, d, c, f) {
          return !u[d] && (u[d] = c === f.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = He(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = He(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Va = `
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
`, Ba = X.extend({
  name: "baseicon",
  css: Va
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Vn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Bn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vn(Object(n), !0).forEach(function(r) {
      Fa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Fa(e, t, n) {
  return (t = Da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Da(e) {
  var t = Ma(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Ma(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Nt = {
  name: "BaseIcon",
  extends: We,
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
  style: Ba,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Fe(this.label);
      return Bn(Bn({}, !this.isUnstyled && {
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
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Fn(e, t) {
  return Ha(e) || Wa(e, t) || Ua(e, t) || qa();
}
function qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ua(e, t) {
  if (e) {
    if (typeof e == "string") return Dn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dn(e, t) : void 0;
  }
}
function Dn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Wa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, l = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (l.push(r.value), l.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Ha(e) {
  if (Array.isArray(e)) return e;
}
function Mn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Z(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Mn(Object(n), !0).forEach(function(r) {
      Ht(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Mn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ht(e, t, n) {
  return (t = Ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ka(e) {
  var t = Ga(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ga(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var U = {
  _getMeta: function() {
    return [Ce(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ve(Ce(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: pn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var k = U._getOptionValue.apply(U, arguments);
      return he(k) || fr(k) ? {
        class: k
      } : k;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, f = u.mergeProps, m = f === void 0 ? !1 : f, w = l ? U._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, P = U._usePT(r, U._getPT(o, r.$name), i, a, Z(Z({}, s), {}, {
      global: w || {}
    })), g = U._getPTDatasets(r, a);
    return c || !c && P ? m ? U._mergeProps(r, m, w, P, g) : Z(Z(Z({}, w), P), g) : Z(Z({}, P), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return Z(Z({}, n === "root" && Ht({}, "".concat(r, "name"), Pe(t.$name))), {}, Ht({}, "".concat(r, "section"), Pe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var l, i = r ? r(s) : s, u = Pe(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(g) {
      return r(g, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, f = c === void 0 ? !1 : c, m = s(n.originalValue), w = s(n.value);
      return m === void 0 && w === void 0 ? void 0 : he(w) ? w : he(m) ? m : d || !d && w ? f ? U._mergeProps(t, f, m, w) : Z(Z({}, m), w) : w;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return U._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = U._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    U._loadCoreStyles(n, s), U._loadThemeStyles(n, s), U._loadScopedThemeStyles(n, s), U._removeThemeListeners(n), n.$loadStyles = function() {
      return U._loadThemeStyles(n, s);
    }, U._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Le.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      X.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Le.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!ee.isStyleNameLoaded("common")) {
        var s, l, i = ((s = o.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = i.primitive, d = i.semantic, c = i.global, f = i.style;
        X.load(u?.css, Z({
          name: "primitive-variables"
        }, a)), X.load(d?.css, Z({
          name: "semantic-variables"
        }, a)), X.load(c?.css, Z({
          name: "global-variables"
        }, a)), X.loadStyle(Z({
          name: "global-style"
        }, a), f), ee.setLoadedStyleName("common");
      }
      if (!ee.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, w, P, g, $ = ((m = o.$style) === null || m === void 0 || (w = m.getDirectiveTheme) === null || w === void 0 ? void 0 : w.call(m)) || {}, k = $.css, S = $.style;
        (P = o.$style) === null || P === void 0 || P.load(k, Z({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (g = o.$style) === null || g === void 0 || g.loadStyle(Z({
          name: "".concat(o.$style.name, "-style")
        }, a), S), ee.setLoadedStyleName(o.$style.name);
      }
      if (!ee.isStyleNameLoaded("layer-order")) {
        var b, C, B = (b = o.$style) === null || b === void 0 || (C = b.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(b);
        X.load(B, Z({
          name: "layer-order",
          first: !0
        }, a)), ee.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, l = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, Z({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Le.clearLoadedStyleNames(), ue.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ue.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var l, i, u = "on".concat(zo(n)), d = U._getConfig(o, a), c = r?.$instance, f = U._usePT(c, U._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), U._getOptionValue, "hooks.".concat(u)), m = U._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], U._getOptionValue, "hooks.".concat(u)), w = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    f?.(c, w), m?.(c, w);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return dn(t) ? t.apply(void 0, r) : H.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, d, c) {
      var f, m, w, P;
      i._$instances = i._$instances || {};
      var g = U._getConfig(u, d), $ = i._$instances[t] || {}, k = Fe($) ? Z(Z({}, n), n?.methods) : {};
      i._$instances[t] = Z(Z({}, $), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: $.$el || i || void 0,
        $style: Z({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: g,
        $attrSelector: (f = i.$pd) === null || f === void 0 || (f = f[t]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return U._getPT(g?.pt, void 0, function(b) {
            var C;
            return b == null || (C = b.directives) === null || C === void 0 ? void 0 : C[t];
          });
        },
        isUnstyled: function() {
          var b, C;
          return ((b = i._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.unstyled) !== void 0 ? (C = i._$instances[t]) === null || C === void 0 || (C = C.$binding) === null || C === void 0 || (C = C.value) === null || C === void 0 ? void 0 : C.unstyled : g?.unstyled;
        },
        theme: function() {
          var b;
          return (b = i._$instances[t]) === null || b === void 0 || (b = b.$primevueConfig) === null || b === void 0 ? void 0 : b.theme;
        },
        preset: function() {
          var b;
          return (b = i._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.dt;
        },
        /* instance's methods */
        ptm: function() {
          var b, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return U._getPTValue(i._$instances[t], (b = i._$instances[t]) === null || b === void 0 || (b = b.$binding) === null || b === void 0 || (b = b.value) === null || b === void 0 ? void 0 : b.pt, C, Z({}, B));
        },
        ptmo: function() {
          var b = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", B = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return U._getPTValue(i._$instances[t], b, C, B, !1);
        },
        cx: function() {
          var b, C, B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", M = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (b = i._$instances[t]) !== null && b !== void 0 && b.isUnstyled() ? void 0 : U._getOptionValue((C = i._$instances[t]) === null || C === void 0 || (C = C.$style) === null || C === void 0 ? void 0 : C.classes, B, Z({}, M));
        },
        sx: function() {
          var b, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, M = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return B ? U._getOptionValue((b = i._$instances[t]) === null || b === void 0 || (b = b.$style) === null || b === void 0 ? void 0 : b.inlineStyles, C, Z({}, M)) : void 0;
        }
      }, k), i.$instance = i._$instances[t], (m = (w = i.$instance)[l]) === null || m === void 0 || m.call(w, i, u, d, c), i["$".concat(t)] = i.$instance, U._hook(t, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = Z(Z({}, (P = i.$pd) === null || P === void 0 ? void 0 : P[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(l) {
      var i, u, d, c = l._$instances[t], f = c?.watch, m = function(g) {
        var $, k = g.newValue, S = g.oldValue;
        return f == null || ($ = f.config) === null || $ === void 0 ? void 0 : $.call(c, k, S);
      }, w = function(g) {
        var $, k = g.newValue, S = g.oldValue;
        return f == null || ($ = f["config.ripple"]) === null || $ === void 0 ? void 0 : $.call(c, k, S);
      };
      c.$watchersCallback = {
        config: m,
        "config.ripple": w
      }, f == null || (i = f.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Ie.on("config:change", m), f == null || (u = f["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ie.on("config:ripple:change", w);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Ie.off("config:change", i.config), Ie.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Go("pd")
        }, r("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        U._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", l, i, u, d), o(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        U._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        r("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        U._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        a(l), U._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var t = U._getMeta.apply(U, arguments), n = Fn(t, 2), r = n[0], o = n[1];
    return Z({
      extend: function() {
        var s = U._getMeta.apply(U, arguments), l = Fn(s, 2), i = l[0], u = l[1];
        return U.extend(i, Z(Z(Z({}, o), o?.methods), u));
      }
    }, U._extend(r, o));
  }
}, Ya = `
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
`, Qa = {
  root: "p-ink"
}, Za = X.extend({
  name: "ripple-directive",
  style: Ya,
  classes: Qa
}), Ja = U.extend({
  style: Za
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Xa(e) {
  return ri(e) || ni(e) || ti(e) || ei();
}
function ei() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ti(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function ni(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ri(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function qn(e, t, n) {
  return (t = oi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oi(e) {
  var t = ai(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function ai(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Tr = Ja.extend("ripple", {
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
      n || (n = Mo("span", qn(qn({
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
      var n = this, r = t.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && Bt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !kn(o) && !_n(o)) {
          var a = Math.max(Bo(r), Ho(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = Wo(r), l = t.pageX - s.left + document.body.scrollTop - _n(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - kn(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Vo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Bt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Bt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Xa(t.children).find(function(n) {
        return Uo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ii = "data-wippy-overlay-layer";
function Or() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ar() {
  return Or() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function si() {
  return Ar() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const li = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ui = 0;
const Ct = /* @__PURE__ */ new WeakMap();
function Un(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function di(e, t) {
  if (!li.test(e.className))
    return;
  const n = e.style.cssText;
  Un(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Ct.has(e)) {
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Un(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Ct.set(e, r);
  }
}
function fn(e) {
  const t = Ct.get(e);
  t && (t.disconnect(), Ct.delete(e));
}
function ci(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Gt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Tt = /* @__PURE__ */ new Set(), mn = /* @__PURE__ */ new WeakMap();
let Wn = !1, Yt = !1;
function pi() {
  Yt = !1;
  for (const e of Tt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && fn(t);
      Tt.delete(e), mn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Gt(e);
  }
}
function Hn() {
  Yt || (Yt = !0, requestAnimationFrame(pi));
}
function fi(e) {
  const t = document.createElement("div");
  t.setAttribute(ii, "");
  const n = Ar();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Gt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && di(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && fn(l);
    }
    t.isConnected && t.childElementCount > 0 && Gt(t);
  });
  return r.observe(t, { childList: !0 }), mn.set(t, r), Tt.add(t), Wn || (Wn = !0, window.addEventListener("scroll", Hn, { capture: !0, passive: !0 }), window.addEventListener("resize", Hn, { passive: !0 })), t;
}
function Kn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = fi(e.hostRoot), si())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ui}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Gn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && fn(t);
    Tt.delete(e.layer), mn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Yn = !1;
function mi() {
  if (Yn)
    return;
  Yn = !0;
  const e = $r;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Or() && (this.hostRoot = ci(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Kn(this), this.$watch("inline", (t) => {
      t ? Gn(this) : Kn(this);
    })));
  }, e.render = function() {
    return this.inline ? ce(this.$slots, "default", { key: 0 }) : this.mounted ? mo(sr, { key: 1, to: this.resolvedTarget || document.body }, [
      ce(this.$slots, "default")
    ]) : I("", !0);
  }, e.unmounted = function() {
    Gn(this);
  };
}
const hi = {
  install: (e) => {
    mi(), e.use(Aa, { theme: "none" });
  }
};
var Qt = "data-wippy-visible";
function Qn(e) {
  const t = e.getAttribute(Qt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var bi = Object.defineProperty, vi = (e, t, n) => t in e ? bi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ie = (e, t, n) => vi(e, typeof t != "symbol" ? t + "" : t, n), gi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Zn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function wi(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, l] of Object.entries(o)) {
            const i = typeof l == "string" ? Zn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? Zn(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function xi(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${yi} {
${t}
}`;
}
function ki(e, t) {
  const n = xi(t);
  n && Er(e, n, "@wippy-fe/css-variables-bridge");
}
function _i(e, t) {
  const r = (t ?? gi).map(async (o) => {
    const a = xo[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await ko(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function $i(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Er(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Si(e, t) {
  Er(e, t, "@wippy-fe/custom-css");
}
function jr(e) {
  return e.__wippyHost ?? null;
}
function Pi(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ci(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Mt(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), l = Pi(o);
    if (s === null) {
      a.default !== void 0 && (n[l] = a.default);
      continue;
    }
    const i = Ci(o, s, a);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
}
var Ti = class {
  constructor(e, t) {
    ie(this, "_props"), ie(this, "_errors"), ie(this, "_content"), ie(this, "_hostVisibility"), ie(this, "_propsListeners", /* @__PURE__ */ new Set()), ie(this, "_contentListeners", /* @__PURE__ */ new Set()), ie(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), ie(this, "_disposed", !1), ie(this, "_emitToDom"), ie(this, "props"), ie(this, "events"), ie(this, "content"), ie(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, o) {
        return n._subscribeProps(r, o);
      }
    }, this.events = {
      emit(r, o) {
        n._disposed || n._emitToDom(r, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, o) {
        return n._subscribeContent(r, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, o) {
        return n._subscribeHostVisibility(r, o);
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
}, Oi = class extends HTMLElement {
  constructor() {
    super(), ie(this, "_internals"), ie(this, "_contentObserver", null), ie(this, "_initialized", !1), ie(this, "_container", null), ie(this, "_reactive", null), ie(this, "_lastProps", null), ie(this, "_lastErrors", []), ie(this, "_lastContent", null), ie(this, "_themeUnsub", null), ie(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Qn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Qt])];
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
    return jr(this);
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
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const a = Mt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Ti(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
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
      let r;
      if (t)
        r = this._container;
      else {
        this.onInit(n), e.inlineCss && $i(n, e.inlineCss);
        try {
          const u = vn?.theming, d = wi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          ki(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = vn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Si(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && _i(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, yo(go);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Me("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Mt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, a, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = wo.getThemeMode?.()) {
    yt(e, this), this._container && yt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), yt("auto", this), this._container && yt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Qt) {
      const l = this._hostVisible, i = Qn(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Mt(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const s = o;
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
function Ai(e) {
  return e.__wippyHostBus ?? null;
}
function Ei(e) {
  return e.dataset.wippyPanelId ?? null;
}
var ji = Object.defineProperty, Li = (e, t, n) => t in e ? ji(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, De = (e, t, n) => Li(e, typeof t != "symbol" ? t + "" : t, n), Lr = /* @__PURE__ */ Symbol("wippy:emit"), Ir = /* @__PURE__ */ Symbol("wippy:props"), Nr = /* @__PURE__ */ Symbol("wippy:props_error"), Ii = /* @__PURE__ */ Symbol("wippy:content"), Ni = /* @__PURE__ */ Symbol("wippy:panel-id"), zi = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ri = /* @__PURE__ */ Symbol("wippy:host"), Vi = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Bi() {
  const e = ht(Ir);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Fi() {
  const e = ht(Lr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Di() {
  const e = ht(Nr);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Mi = class extends Oi {
  constructor() {
    super(...arguments), De(this, "_vueApp", null), De(this, "_propsRef", q({})), De(this, "_errorsRef", q([])), De(this, "_contentRef", q(null)), De(this, "_hostVisibilityRef", q(null)), De(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
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
      const d = $o(), c = ho(u.rootComponent);
      this._vueApp = c;
      const f = So();
      if (u.piniaPlugins)
        for (const m of u.piniaPlugins)
          f.use(m);
      if (c.use(f), u.plugins)
        for (const m of u.plugins)
          c.use(m);
      c.provide(Ir, this._propsRef), c.provide(Nr, this._errorsRef), c.provide(Lr, this.emitEvent.bind(this)), c.provide(Ii, this._contentRef), c.provide(Vi, this._hostVisibilityRef), c.provide(Ni, Ei(this)), c.provide(zi, Ai(this)), c.provide(Ri, jr(this)), u.providers && u.providers(c, this), c.mount(t), d && Po(d);
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
const qi = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead.' }, definition: { type: "object", default: null, description: 'Immutable form definition: `title`, optional `description`, optional `submit_label`, optional `answered_message` (not displayed), and `fields` (each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`). When every field is `type: "choice"` the question-card UI renders; otherwise the radio/checkbox fields form renders.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' }, density: { type: "string", default: "compact", description: 'Question-card sizing: "compact" (default) or "comfortable", a larger size/spacing scale. Read purely through the `:host([density="comfortable"])` CSS selector — no JS reads it — but must be a declared prop so the package-tag mount path can set it as an attribute.' } } } }, Ui = {
  wippy: qi
};
var zr = {
  name: "SpinnerIcon",
  extends: Nt
};
function Wi(e) {
  return Yi(e) || Gi(e) || Ki(e) || Hi();
}
function Hi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ki(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function Gi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Yi(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Qi(e, t, n, r, o, a) {
  return p(), v("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Wi(t[0] || (t[0] = [L("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
zr.render = Qi;
var Zi = `
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
`, Ji = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ne(n.value) && String(n.value).length === 1,
      "p-badge-dot": Fe(n.value) && !r.$slots.default,
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
}, Xi = X.extend({
  name: "badge",
  style: Zi,
  classes: Ji
}), es = {
  name: "BaseBadge",
  extends: We,
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
  style: Xi,
  provide: function() {
    return {
      $pcBadge: this,
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
function Jn(e, t, n) {
  return (t = ts(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ts(e) {
  var t = ns(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function ns(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rr = {
  name: "Badge",
  extends: es,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Te(Jn(Jn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, rs = ["data-p"];
function os(e, t, n, r, o, a) {
  return p(), v("span", H({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [ce(e.$slots, "default", {}, function() {
    return [se(F(e.value), 1)];
  })], 16, rs);
}
Rr.render = os;
var as = `
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
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Se(e, t, n) {
  return (t = is(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function is(e) {
  var t = ss(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function ss(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ls = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", Se(Se(Se(Se(Se(Se(Se(Se(Se({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", Se({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, us = X.extend({
  name: "button",
  style: as,
  classes: ls
}), ds = {
  name: "BaseButton",
  extends: We,
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
  style: us,
  provide: function() {
    return {
      $pcButton: this,
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
function fe(e, t, n) {
  return (t = cs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function cs(e) {
  var t = ps(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function ps(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var we = {
  name: "Button",
  extends: ds,
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
      return H(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Fe(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Te(fe(fe(fe(fe(fe(fe(fe(fe(fe(fe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Te(fe(fe({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Te(fe(fe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: zr,
    Badge: Rr
  },
  directives: {
    ripple: Tr
  }
}, fs = ["data-p"], ms = ["data-p"];
function hs(e, t, n, r, o, a) {
  var s = Ze("SpinnerIcon"), l = Ze("Badge"), i = lr("ripple");
  return e.asChild ? ce(e.$slots, "default", {
    key: 1,
    class: j(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ur((p(), W(dr(e.as), H({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: ae(function() {
      return [ce(e.$slots, "default", {}, function() {
        return [e.loading ? ce(e.$slots, "loadingicon", H({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (p(), v("span", H({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (p(), W(s, H({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ce(e.$slots, "icon", H({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (p(), v("span", H({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, fs)) : I("", !0)];
        }), e.label ? (p(), v("span", H({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), F(e.label), 17, ms)) : I("", !0), e.badge ? (p(), W(l, {
          key: 3,
          value: e.badge,
          class: j(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : I("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
we.render = hs;
var Vr = {
  name: "TimesIcon",
  extends: Nt
};
function bs(e) {
  return ws(e) || ys(e) || gs(e) || vs();
}
function vs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gs(e, t) {
  if (e) {
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function ys(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ws(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function xs(e, t, n, r, o, a) {
  return p(), v("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), bs(t[0] || (t[0] = [L("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vr.render = xs;
var ks = `
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
`, _s = {
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
}, $s = X.extend({
  name: "message",
  style: ks,
  classes: _s
}), Ss = {
  name: "BaseMessage",
  extends: We,
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
  style: $s,
  provide: function() {
    return {
      $pcMessage: this,
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
function Xn(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Cs(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ge = {
  name: "Message",
  extends: Ss,
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
      return Te(Xn(Xn({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Tr
  },
  components: {
    TimesIcon: Vr
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
function er(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function tr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? er(Object(n), !0).forEach(function(r) {
      Ts(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : er(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ts(e, t, n) {
  return (t = Os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Os(e) {
  var t = As(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function As(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Es = ["data-p"], js = ["data-p"], Ls = ["data-p"], Is = ["aria-label", "data-p"], Ns = ["data-p"];
function zs(e, t, n, r, o, a) {
  var s = Ze("TimesIcon"), l = lr("ripple");
  return p(), W(bo, H({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ae(function() {
      return [o.visible ? (p(), v("div", H({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [L("div", H({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? ce(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (p(), v("div", H({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [ce(e.$slots, "icon", {
        class: j(e.cx("icon"))
      }, function() {
        return [(p(), W(dr(e.icon ? "span" : null), H({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (p(), v("div", H({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [ce(e.$slots, "default")], 16, Ls)) : I("", !0), e.closable ? ur((p(), v("button", H({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, tr(tr({}, e.closeButtonProps), e.ptm("closeButton"))), [ce(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (p(), v("i", H({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, Ns)) : (p(), W(s, H({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Is)), [[l]]) : I("", !0)], 16, js))], 16)], 16, Es)) : I("", !0)];
    }),
    _: 3
  }, 16);
}
ge.render = zs;
const Rs = () => Bi(), Vs = () => Fi(), Bs = Di, Fs = 2e3;
function Ds() {
  const e = un.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Ms(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function o() {
    n && clearTimeout(n), n = null;
  }
  oe(() => [e.value?.artifact_id, e.value?.status, e.value?.delivery], () => {
    const a = e.value;
    if (!a || a.status !== "idle" || a.delivery !== "pending" || r.has(a.artifact_id))
      return;
    o();
    const s = a.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== s || l.delivery !== "pending" || r.has(s) || (r.add(s), Ds()?.send({ type: "session_open", session_id: l.session_id }));
    }, Fs);
  }, { immediate: !0 }), It(o);
}
const qs = 5e3;
function Us(e, t) {
  const n = q("idle"), r = q(null), o = q(null), a = q(null);
  let s = 0, l = null, i = null, u = null, d = null;
  function c() {
    return un.artifactState;
  }
  let f = null, m = !1;
  function w() {
    m || f || (m = !0, f = setTimeout(() => {
      f = null, g();
    }, qs));
  }
  async function P() {
    const D = c();
    if (typeof D != "function") {
      n.value = "unsupported", o.value = "This form needs a newer Web Host.";
      return;
    }
    const h = e.value;
    if (!h) {
      n.value = "idle", r.value = null, a.value = null;
      return;
    }
    const A = ++s, y = r.value === null;
    y && (n.value = "loading");
    try {
      const T = await D(h).get();
      if (A !== s)
        return;
      r.value = T, n.value = "loaded", o.value = null, a.value = null, m = !1;
    } catch (T) {
      if (A !== s)
        return;
      const V = T instanceof Error ? T.message : "Could not load this form.";
      y ? (n.value = "error", o.value = V) : (a.value = V, w());
    }
  }
  function g() {
    return l ? (i || (i = l.then(() => (i = null, g()))), i) : (l = P().finally(() => {
      l = null;
    }), l);
  }
  function $(D) {
    d !== D && (u?.(), u = null, d = D, D && (u = Me(`artifact:${D}`, () => {
      g();
    })));
  }
  oe(e, (D) => {
    s++, r.value = null, a.value = null, $(D), g();
  }, { immediate: !0 }), oe(t, () => {
    g();
  });
  const k = _(() => {
    const D = r.value;
    return D?.session_id && (D.status === "active" && !D.stale || D.status === "idle" && D.delivery && D.delivery !== "complete") ? D.session_id : null;
  });
  let S = null, b = null;
  oe(k, (D) => {
    S?.(), S = null, b?.(), b = null, D && (S = Me(`session:${D}:message:*`, (h) => {
      h.data?.type !== "chunk" && g();
    }), b = Me(`session:${D}`, () => {
      g();
    }));
  }, { immediate: !0 });
  const C = Me("@visibility", (D) => {
    D && g();
  }), B = Me("@reconnect", () => {
    g();
  });
  It(() => {
    s++, f && clearTimeout(f), f = null, u?.(), u = null, S?.(), S = null, b?.(), b = null, C(), B();
  });
  async function M() {
    return await g(), r.value;
  }
  return { status: n, state: r, errorMessage: o, reloadError: a, reload: () => {
    g();
  }, refresh: M };
}
function Ws() {
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
const Hs = Symbol.for("wippy.artifactStateError");
function Br(e) {
  return typeof e == "object" && e !== null && e[Hs] === !0;
}
function Ks(e) {
  return Br(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function nr(e) {
  return !Br(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function rr(e) {
  const t = Ks(e);
  if (t.known) {
    const n = t.status;
    if (n === void 0)
      return t.noResponse ? { code: "network_error", message: "Network problem. Retrying…", retryable: !0, uncertain: !0, shouldReload: !1 } : { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !0, uncertain: !1, shouldReload: !1 };
    if (n === 401)
      return { code: "auth", message: "You are signed out. Sign in again, then retry.", retryable: !1, uncertain: !1, shouldReload: !1 };
    if (n === 404)
      return { code: "not_found", message: "This form is no longer available.", retryable: !1, uncertain: !1, shouldReload: !1 };
    if (n === 409) {
      const r = t.code;
      return r === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : r === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 };
    }
    return n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !0, uncertain: !1, shouldReload: !1 };
}
const Gs = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function Ys(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Qs(e) {
  return JSON.stringify(e);
}
function Zs(e) {
  const t = q(!1), n = q(null), r = q(null);
  let o = 0;
  oe(e, () => {
    o++, s();
  });
  function a(u) {
    const d = Qs(u);
    if (n.value && r.value === d)
      return n.value;
    const c = Ws();
    return n.value = c, r.value = d, c;
  }
  function s() {
    n.value = null, r.value = null;
  }
  function l() {
    return un.artifactState;
  }
  async function i(u, d, c) {
    const f = e.value;
    if (!f)
      return { ok: !1, message: "This form cannot be submitted here." };
    const m = l();
    if (typeof m != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const w = o, P = a(c), g = {
      form_version: u,
      request_id: P,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let $;
      try {
        $ = await m(f).submit(g);
      } catch (k) {
        if (w !== o)
          return { ok: !1, ignored: !0 };
        const S = nr(k);
        if (S)
          return { ok: !1, fieldErrors: S.errors, formErrors: S.formErrors };
        const b = rr(k);
        if (!b.uncertain)
          return { ok: !1, message: b.message, code: b.code, retryable: b.retryable, shouldReload: b.shouldReload };
        if (await Ys(800), w !== o)
          return { ok: !1, ignored: !0 };
        try {
          $ = await m(f).submit(g);
        } catch (C) {
          if (w !== o)
            return { ok: !1, ignored: !0 };
          const B = nr(C);
          if (B)
            return { ok: !1, fieldErrors: B.errors, formErrors: B.formErrors };
          const M = rr(C), D = M.uncertain ? Gs : M.message, h = M.uncertain ? !0 : M.retryable;
          return { ok: !1, message: D, code: M.code, retryable: h, shouldReload: M.shouldReload };
        }
      }
      return w !== o ? { ok: !1, ignored: !0 } : (s(), { ok: !0, accepted: $ });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: s };
}
const hn = Symbol("wippy-form:element"), $t = "data-wippy-artifact-id";
function Js() {
  const e = ht(hn), t = q(e?.getAttribute($t) ?? null);
  if (e) {
    let n = null;
    sn(() => {
      t.value = e.getAttribute($t), n = new MutationObserver(() => {
        t.value = e.getAttribute($t);
      }), n.observe(e, { attributes: !0, attributeFilter: [$t] });
    }), It(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Xs(e, t) {
  const n = ht(hn);
  n && vo(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function el(e) {
  const t = q(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return sn(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), It(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
function Ot(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ve(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function or(e) {
  return typeof e == "string" ? e : Ve(e) ? e.value : null;
}
function tl(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => or(n) === t) : or(e) === t;
}
function Ye(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Ot);
    return t ? t.other : "";
  }
  return Ot(e) ? e.other : "";
}
function Fr(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Ot) : Ot(e);
}
function nl(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((o) => Ve(o) && o.value === t);
  return r && Ve(r) ? r.note : "";
}
const rl = 2e3, ol = 1e3;
function Be(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Dr(e) {
  return Array.from(e).length;
}
function Mr(e) {
  return Dr(le(e)) > rl;
}
function al(e) {
  return Dr(le(e)) > ol;
}
function le(e) {
  return e.trim();
}
function Xt(e) {
  return le(e);
}
function il(e) {
  return le(e);
}
function At(e, t) {
  const n = il(t);
  return n ? { value: e, note: n } : e;
}
function qr(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], r = e.options.map((i) => i.value), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
    for (const i of n)
      typeof i == "string" && r.includes(i) ? a.add(i) : Ve(i) && r.includes(i.value) && (a.add(i.value), o.set(i.value, i));
    const s = r.filter((i) => a.has(i)).map((i) => {
      const u = o.get(i);
      return u ? At(i, u.note) : i;
    }), l = n.find(Be);
    if (l) {
      const i = Xt(l.other);
      i.length > 0 && s.push({ other: i });
    }
    return s.length > 0 ? s : void 0;
  }
  if (t !== void 0) {
    if (Be(t)) {
      const n = Xt(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Ve(t) && e.options.some((n) => n.value === t.value))
      return At(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function sl(e, t) {
  const n = {};
  for (const r of e.fields) {
    const o = qr(r, t[r.id]);
    o !== void 0 && (n[r.id] = o);
  }
  return n;
}
function ll(e, t) {
  const n = [];
  for (const r of e.fields)
    r.required && qr(r, t[r.id]) === void 0 && n.push(r.id);
  return n;
}
function ul(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(Be) : void 0 : Be(t) ? t : void 0;
}
function dl(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = ul(r, t[r.id]);
    o && Xt(o.other).length === 0 && n.push(r.id);
  }
  return n;
}
function cl(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = t[r.id];
    let a;
    if (r.multiple) {
      if (Array.isArray(o)) {
        const s = o.find(Be);
        s && (a = s.other);
      }
    } else Be(o) && (a = o.other);
    a !== void 0 && Mr(a) && n.push(r.id);
  }
  return n;
}
function Ur(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const a of e.options) {
    const s = n.find((l) => typeof l == "string" ? l === a.value : Ve(l) && l.value === a.value);
    s && r.push({ label: a.label, note: Ve(s) ? s.note : void 0 });
  }
  const o = n.find(Be);
  return o && r.push({ label: o.other, own: !0 }), r.length > 0 ? r : null;
}
function pl(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const r of e.fields) {
    const o = t[r.id];
    o !== void 0 && (n[r.id] = r.multiple ? Array.isArray(o) ? [...o] : [o] : o);
  }
  return n;
}
var Wr = {
  name: "CheckIcon",
  extends: Nt
};
function fl(e) {
  return vl(e) || bl(e) || hl(e) || ml();
}
function ml() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hl(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function bl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vl(e) {
  if (Array.isArray(e)) return en(e);
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function gl(e, t, n, r, o, a) {
  return p(), v("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fl(t[0] || (t[0] = [L("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wr.render = gl;
var Hr = {
  name: "MinusIcon",
  extends: Nt
};
function yl(e) {
  return _l(e) || kl(e) || xl(e) || wl();
}
function wl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xl(e, t) {
  if (e) {
    if (typeof e == "string") return tn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tn(e, t) : void 0;
  }
}
function kl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function _l(e) {
  if (Array.isArray(e)) return tn(e);
}
function tn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function $l(e, t, n, r, o, a) {
  return p(), v("svg", H({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), yl(t[0] || (t[0] = [L("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Hr.render = $l;
var Sl = {
  name: "BaseEditableHolder",
  extends: We,
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, t)) || {};
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
      var r, o;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (o = this.formField).onChange) === null || r === void 0 || r.call(o, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(ne);
    }
  },
  computed: {
    $filled: function() {
      return ne(this.d_value);
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
}, zt = {
  name: "BaseInput",
  extends: Sl,
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
}, Pl = `
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
`, Cl = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": r.size === "small",
      "p-checkbox-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, Tl = X.extend({
  name: "checkbox",
  style: Pl,
  classes: Cl
}), Ol = {
  name: "BaseCheckbox",
  extends: zt,
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
  style: Tl,
  provide: function() {
    return {
      $pcCheckbox: this,
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
function Al(e, t, n) {
  return (t = El(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function El(e) {
  var t = jl(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function jl(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ll(e) {
  return Rl(e) || zl(e) || Nl(e) || Il();
}
function Il() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nl(e, t) {
  if (e) {
    if (typeof e == "string") return nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(e, t) : void 0;
  }
}
function zl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Rl(e) {
  if (Array.isArray(e)) return nn(e);
}
function nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Et = {
  name: "Checkbox",
  extends: Ol,
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
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, o;
        this.binary ? o = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? o = r.filter(function(a) {
          return !cn(a, n.value);
        }) : o = r ? [].concat(Ll(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(o, t) : this.writeValue(o, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : jo(this.value, t);
    },
    dataP: function() {
      return Te(Al({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Wr,
    MinusIcon: Hr
  }
}, Vl = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Bl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Fl = ["data-p"];
function Dl(e, t, n, r, o, a) {
  var s = Ze("CheckIcon"), l = Ze("MinusIcon");
  return p(), v("div", H({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": o.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [L("input", H({
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
  }, a.getPTOptions("input")), null, 16, Bl), L("div", H({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [ce(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: o.d_indeterminate,
    class: j(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (p(), W(s, H({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : o.d_indeterminate ? (p(), W(l, H({
      key: 1,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : I("", !0)];
  })], 16, Fl)], 16, Vl);
}
Et.render = Dl;
var Ml = `
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
`, ql = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": r.size === "small",
      "p-inputtext-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ul = X.extend({
  name: "inputtext",
  style: Ml,
  classes: ql
}), Wl = {
  name: "BaseInputText",
  extends: zt,
  style: Ul,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function pt(e) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pt(e);
}
function Hl(e, t, n) {
  return (t = Kl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Kl(e) {
  var t = Gl(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Gl(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var rn = {
  name: "InputText",
  extends: Wl,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return H(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Te(Hl({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Yl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Ql(e, t, n, r, o, a) {
  return p(), v("input", H({
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
  }, a.attrs), null, 16, Yl);
}
rn.render = Ql;
var Zl = `
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
`, Jl = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-radiobutton p-component", {
      "p-radiobutton-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcRadioButtonGroup ? n.$pcRadioButtonGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-radiobutton-sm p-inputfield-sm": r.size === "small",
      "p-radiobutton-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-radiobutton-box",
  input: "p-radiobutton-input",
  icon: "p-radiobutton-icon"
}, Xl = X.extend({
  name: "radiobutton",
  style: Zl,
  classes: Jl
}), eu = {
  name: "BaseRadioButton",
  extends: zt,
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
  style: Xl,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
  }
};
function ft(e) {
  "@babel/helpers - typeof";
  return ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ft(e);
}
function tu(e, t, n) {
  return (t = nu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function nu(e) {
  var t = ru(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function ru(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var on = {
  name: "RadioButton",
  extends: eu,
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
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.groupName : this.$formName;
    },
    checked: function() {
      var t = this.$pcRadioButtonGroup ? this.$pcRadioButtonGroup.d_value : this.d_value;
      return t != null && (this.binary ? !!t : cn(t, this.value));
    },
    dataP: function() {
      return Te(tu({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ou = ["data-p-checked", "data-p-disabled", "data-p"], au = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], iu = ["data-p"], su = ["data-p"];
function lu(e, t, n, r, o, a) {
  return p(), v("div", H({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [L("input", H({
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
  }, a.getPTOptions("input")), null, 16, au), L("div", H({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [L("div", H({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, su)], 16, iu)], 16, ou);
}
on.render = lu;
const uu = ["aria-describedby"], du = { class: "text-sm font-medium text-color p-0" }, cu = {
  key: 0,
  class: "text-danger-600 dark:text-danger-400"
}, pu = {
  key: 1,
  class: "text-sm text-color break-words"
}, fu = ["role", "aria-required"], mu = ["for"], hu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, bu = {
  key: 0,
  class: "flex items-start gap-2"
}, vu = { class: "flex flex-col gap-1 min-w-0 grow" }, gu = ["for"], yu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, wu = {
  key: 0,
  class: "flex items-start gap-2"
}, xu = { class: "flex flex-col gap-1 min-w-0 grow" }, Ke = "choice-field-other-sentinel", Rt = /* @__PURE__ */ pe({
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
    const r = e, o = n, a = Lt(), s = `${a}-desc`, l = `${a}-err`, i = `${a}-other`, u = `${i}-label`, d = `${a}-other-text`, c = `${d}-label`;
    function f(h) {
      return `${a}-opt-${h}`;
    }
    const m = q(null), w = _(() => {
      const h = [];
      return r.field.description && h.push(s), !r.readonly && r.errors.length > 0 && h.push(l), h.length > 0 ? h.join(" ") : void 0;
    }), P = _({
      get() {
        const h = r.modelValue;
        return typeof h == "string" ? h : M(h) ? Ke : "";
      },
      set(h) {
        h === Ke ? o("update:modelValue", { other: g.value }) : h === "" ? o("update:modelValue", void 0) : o("update:modelValue", h);
      }
    }), g = q(Ye(r.modelValue));
    oe(() => r.modelValue, (h) => {
      r.field.multiple || (g.value = Ye(h));
    }), oe(g, (h) => {
      !r.field.multiple && P.value === Ke && o("update:modelValue", { other: h });
    });
    const $ = _(() => {
      const h = r.modelValue;
      return Array.isArray(h) ? h.filter((A) => typeof A == "string") : [];
    }), k = _(() => r.field.multiple && Fr(r.modelValue)), S = q(Ye(r.modelValue));
    oe(() => r.modelValue, (h) => {
      r.field.multiple && (S.value = Ye(h));
    });
    function b(h, A, y) {
      const T = [...h];
      A && T.push({ other: y }), o("update:modelValue", T.length > 0 ? T : void 0);
    }
    function C(h, A) {
      const y = new Set($.value);
      A ? y.add(h) : y.delete(h), b(r.field.options.filter((T) => y.has(T.value)).map((T) => T.value), k.value, S.value);
    }
    function B(h) {
      b($.value, h, S.value);
    }
    oe(S, (h) => {
      k.value && b($.value, !0, h);
    });
    function M(h) {
      return !!h && typeof h == "object" && !Array.isArray(h) && typeof h.other == "string";
    }
    const D = _(() => {
      const h = r.modelValue;
      if (h === void 0)
        return "—";
      const A = (T) => r.field.options.find((V) => V.value === T)?.label ?? T, y = [];
      if (Array.isArray(h))
        for (const T of h)
          typeof T == "string" ? y.push(A(T)) : M(T) && y.push(`Other: ${T.other}`);
      else typeof h == "string" ? y.push(A(h)) : M(h) && y.push(`Other: ${h.other}`);
      return y.length > 0 ? y.join(", ") : "—";
    });
    return t({
      focusFirstControl() {
        m.value?.querySelector("input, textarea")?.focus();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const h = m.value?.querySelector(`[id="${d}"]`);
        h ? h.focus() : m.value?.querySelector("input, textarea")?.focus();
      }
    }), (h, A) => (p(), v("fieldset", {
      ref_key: "fieldsetEl",
      ref: m,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": w.value
    }, [
      L("legend", du, [
        se(F(e.field.label), 1),
        !e.readonly && e.field.required ? (p(), v("span", cu, " (required)")) : I("", !0)
      ]),
      e.field.description ? (p(), v("p", {
        key: 0,
        id: s,
        class: "text-xs text-muted-color m-0"
      }, F(e.field.description), 1)) : I("", !0),
      e.readonly ? (p(), v("p", pu, F(D.value), 1)) : (p(), v("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup",
        "aria-required": e.field.required ? "true" : void 0
      }, [
        e.field.multiple ? (p(), v(te, { key: 1 }, [
          (p(!0), v(te, null, me(e.field.options, (y, T) => (p(), v("div", {
            key: y.value,
            class: "flex items-start gap-2"
          }, [
            K(x(Et), {
              "model-value": $.value.includes(y.value),
              binary: "",
              "input-id": f(T),
              disabled: e.disabled,
              "onUpdate:modelValue": (V) => C(y.value, !!V)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            L("label", {
              for: f(T),
              class: "text-sm text-color break-words"
            }, [
              se(F(y.label) + " ", 1),
              y.description ? (p(), v("span", yu, F(y.description), 1)) : I("", !0)
            ], 8, gu)
          ]))), 128)),
          e.field.allow_other ? (p(), v("div", wu, [
            K(x(Et), {
              "model-value": k.value,
              binary: "",
              "input-id": i,
              disabled: e.disabled,
              "onUpdate:modelValue": A[3] || (A[3] = (y) => B(!!y))
            }, null, 8, ["model-value", "disabled"]),
            L("div", xu, [
              L("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              L("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              K(x(rn), {
                id: d,
                modelValue: S.value,
                "onUpdate:modelValue": A[4] || (A[4] = (y) => S.value = y),
                disabled: e.disabled || !k.value,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : I("", !0)
        ], 64)) : (p(), v(te, { key: 0 }, [
          (p(!0), v(te, null, me(e.field.options, (y, T) => (p(), v("div", {
            key: y.value,
            class: "flex items-start gap-2"
          }, [
            K(x(on), {
              modelValue: P.value,
              "onUpdate:modelValue": A[0] || (A[0] = (V) => P.value = V),
              "input-id": f(T),
              name: x(a),
              value: y.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            L("label", {
              for: f(T),
              class: "text-sm text-color break-words"
            }, [
              se(F(y.label) + " ", 1),
              y.description ? (p(), v("span", hu, F(y.description), 1)) : I("", !0)
            ], 8, mu)
          ]))), 128)),
          e.field.allow_other ? (p(), v("div", bu, [
            K(x(on), {
              modelValue: P.value,
              "onUpdate:modelValue": A[1] || (A[1] = (y) => P.value = y),
              "input-id": i,
              name: x(a),
              value: Ke,
              disabled: e.disabled
            }, null, 8, ["modelValue", "name", "disabled"]),
            L("div", vu, [
              L("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              L("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              K(x(rn), {
                id: d,
                modelValue: g.value,
                "onUpdate:modelValue": A[2] || (A[2] = (y) => g.value = y),
                disabled: e.disabled || P.value !== Ke,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : I("", !0)
        ], 64))
      ], 8, fu)),
      !e.readonly && e.errors.length > 0 ? (p(), v("ul", {
        key: 3,
        id: l,
        class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
      }, [
        (p(!0), v(te, null, me(e.errors, (y, T) => (p(), v("li", { key: T }, F(y.message), 1))), 128))
      ])) : I("", !0)
    ], 8, uu));
  }
}), ku = {
  role: "status",
  class: "sr-only"
}, _u = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color"
}, $u = { class: "flex flex-col gap-1" }, Su = { class: "text-base font-semibold text-color break-words" }, Pu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Cu = {
  key: 1,
  class: "text-xs italic text-muted-color"
}, Tu = {
  key: 1,
  class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0"
}, Ou = { class: "flex items-center gap-2" }, Au = "Use at most 2,000 characters.", Eu = "Enter the other answer.", ju = "You are offline. Your choices are kept.", Lu = /* @__PURE__ */ pe({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = ln(
      pl(r.state.definition, r.state.data)
    ), s = q({}), l = q([]), i = {}, u = q("");
    function d(k, S) {
      i[k] = S;
    }
    const c = _(() => !r.submitting && !r.offline);
    function f(k, S = []) {
      const b = r.state.definition.fields.find((C) => k.includes(C.id))?.id;
      b && Ne(() => {
        const C = i[b];
        S.includes(b) ? C?.focusOtherText() : C?.focusFirstControl();
      });
    }
    function m(k) {
      u.value = k === 1 ? "1 question needs an answer." : `${k} questions need an answer.`;
    }
    function w(k, S) {
      s.value = k ?? {}, l.value = S ?? [];
      const b = Object.keys(s.value);
      f(b);
      const C = b.length + (l.value.length > 0 ? 1 : 0);
      C > 0 && m(C);
    }
    function P(k, S) {
      if (a[k] = S, s.value[k]) {
        const { [k]: b, ...C } = s.value;
        s.value = C;
      }
    }
    function g() {
      return sl(r.state.definition, a);
    }
    function $() {
      const k = dl(r.state.definition, a), S = ll(r.state.definition, a).filter((C) => !k.includes(C)), b = cl(r.state.definition, a);
      if (S.length > 0 || b.length > 0 || k.length > 0) {
        const C = {};
        for (const M of S)
          C[M] = [...C[M] ?? [], { code: "required", message: "This question is required." }];
        for (const M of k)
          C[M] = [...C[M] ?? [], { code: "blank", message: Eu }];
        for (const M of b)
          C[M] = [...C[M] ?? [], { code: "too_long", message: Au }];
        s.value = C, l.value = [];
        const B = [...S, ...k, ...b];
        f(B, k), m(new Set(B).size);
        return;
      }
      s.value = {}, l.value = [], o("submit", g());
    }
    return oe(() => r.banner, (k) => {
      k && (u.value = k.message);
    }), t({
      setServerErrors: w,
      retry: () => o("submit", g()),
      // See QuestionCardActive's own `hasUnsentInput` — a field whose current
      // draft would actually serialize to something counts as unsent input a
      // background "answered elsewhere" swap would otherwise silently discard
      // without explanation.
      hasUnsentInput: () => Object.keys(g()).length > 0
    }), (k, S) => (p(), v("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: cr($, ["prevent"])
    }, [
      L("div", ku, F(u.value), 1),
      e.offline ? (p(), v("p", _u, F(ju))) : I("", !0),
      L("div", $u, [
        L("h2", Su, F(e.state.definition.title), 1),
        e.state.definition.description ? (p(), v("p", Pu, F(e.state.definition.description), 1)) : I("", !0),
        e.state.stale ? (p(), v("p", Cu, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : I("", !0)
      ]),
      (p(!0), v(te, null, me(e.state.definition.fields, (b) => (p(), W(Rt, {
        key: b.id,
        ref_for: !0,
        ref: (C) => d(b.id, C),
        field: b,
        "model-value": a[b.id],
        errors: s.value[b.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (C) => P(b.id, C)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      l.value.length > 0 ? (p(), v("ul", Tu, [
        (p(!0), v(te, null, me(l.value, (b, C) => (p(), v("li", { key: C }, F(b.message), 1))), 128))
      ])) : I("", !0),
      e.banner ? (p(), W(x(ge), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ae(() => [
          L("div", Ou, [
            L("span", null, F(e.banner.message), 1),
            e.banner.retryable ? (p(), W(x(we), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: S[0] || (S[0] = (b) => o("retry"))
            }, {
              default: ae(() => [...S[1] || (S[1] = [
                se(" Retry ", -1)
              ])]),
              _: 1
            })) : I("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : I("", !0),
      L("div", null, [
        K(x(we), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !c.value
        }, null, 8, ["label", "loading", "disabled"])
      ])
    ], 32));
  }
}), Iu = { class: "flex flex-col gap-4 min-w-0" }, Nu = { class: "flex flex-col gap-1" }, zu = { class: "text-base font-semibold text-color break-words" }, Ru = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Vu = { key: 0 }, Bu = { key: 1 }, Fu = { key: 2 }, Du = { key: 3 }, Mu = { key: 4 }, qu = /* @__PURE__ */ pe({
  __name: "idle-form",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    function n(o) {
      if (!o)
        return null;
      const a = new Date(o);
      return Number.isNaN(a.getTime()) ? null : a.toLocaleString();
    }
    const r = q(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        r.value?.focus();
      }
    }), (o, a) => (p(), v("div", Iu, [
      L("div", Nu, [
        L("h2", zu, F(e.state.definition.title), 1),
        e.state.definition.description ? (p(), v("p", Ru, F(e.state.definition.description), 1)) : I("", !0)
      ]),
      (p(!0), v(te, null, me(e.state.definition.fields, (s) => (p(), W(Rt, {
        key: s.id,
        field: s,
        "model-value": e.state.data ? e.state.data[s.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      L("div", {
        ref_key: "statusEl",
        ref: r,
        tabindex: "-1",
        class: "text-xs text-muted-color flex flex-col gap-0.5 outline-none"
      }, [
        e.state.late ? (p(), v("p", Vu, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : I("", !0),
        e.state.delivery === "pending" ? (p(), v("p", Bu, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), v("p", Fu, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), v("p", Du, " The assistant stopped before answering. Send a message to continue. ")) : I("", !0),
        n(e.state.submitted_at) ? (p(), v("p", Mu, " Answered " + F(n(e.state.submitted_at)), 1)) : I("", !0)
      ], 512)
    ]));
  }
}), Uu = { class: "flex flex-col gap-4 min-w-0" }, Wu = { class: "flex flex-col gap-1" }, Hu = { class: "text-base font-semibold text-color break-words" }, Ku = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Gu = /* @__PURE__ */ pe({
  __name: "needs-newer-host-notice",
  props: {
    definition: {},
    answered: { type: Boolean }
  },
  setup(e) {
    return (t, n) => (p(), v("div", Uu, [
      L("div", Wu, [
        L("h2", Hu, F(e.definition.title), 1),
        e.definition.description ? (p(), v("p", Ku, F(e.definition.description), 1)) : I("", !0)
      ]),
      (p(!0), v(te, null, me(e.definition.fields, (r) => (p(), W(Rt, {
        key: r.id,
        field: r,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      e.answered ? (p(), W(x(ge), {
        key: 0,
        severity: "secondary",
        closable: !1
      }, {
        default: ae(() => [...n[0] || (n[0] = [
          se(" This form was answered. Your answer is in the chat. ", -1)
        ])]),
        _: 1
      })) : (p(), W(x(ge), {
        key: 1,
        severity: "warn",
        closable: !1
      }, {
        default: ae(() => [...n[1] || (n[1] = [
          se(" This form needs a newer Web Host. If you already answered it, your answer is in the chat. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Yu = { class: "flex flex-col gap-4 min-w-0" }, Qu = { class: "flex flex-col gap-1" }, Zu = { class: "text-base font-semibold text-color break-words" }, Ju = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Xu = /* @__PURE__ */ pe({
  __name: "no-artifact-notice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (p(), v("div", Yu, [
      L("div", Qu, [
        L("h2", Zu, F(e.definition.title), 1),
        e.definition.description ? (p(), v("p", Ju, F(e.definition.description), 1)) : I("", !0)
      ]),
      (p(!0), v(te, null, me(e.definition.fields, (r) => (p(), W(Rt, {
        key: r.id,
        field: r,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      K(x(ge), {
        severity: "secondary",
        closable: !1
      }, {
        default: ae(() => [...n[0] || (n[0] = [
          se(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), jt = 9;
function ed(e, t, n) {
  const r = e.fields.length, o = r > 1, a = /* @__PURE__ */ new Set([0]), s = q(0), l = q(!1), i = q(""), u = q(""), d = q(null), c = q(0), f = ln(
    Object.fromEntries(e.fields.map((O) => {
      const E = t?.[O.id], R = O.options.filter((je) => tl(E, je.value)).map((je) => je.value), Q = {};
      for (const je of R) {
        const gt = nl(E, je);
        gt && (Q[je] = gt);
      }
      const re = Fr(E), $e = Ye(E), vt = R.length > 0 || re && le($e) !== "", Vt = { chosen: R, other: $e, useOther: re, notes: Q, noteOpen: null, done: vt };
      return [O.id, Vt];
    }))
  );
  function m(O) {
    return f[O.id];
  }
  function w(O) {
    const E = m(O);
    return O.multiple ? E.chosen.length > 0 || le(E.other) !== "" : E.chosen.length > 0 || E.useOther && le(E.other) !== "";
  }
  function P(O) {
    return m(O).done && w(O);
  }
  const g = _(() => o && s.value === r), $ = _(() => g.value ? null : e.fields[s.value] ?? null), k = _(
    () => e.fields.map((O, E) => ({ field: O, index: E })).filter(({ field: O }) => O.required && !P(O))
  );
  let S;
  function b(O) {
    clearTimeout(S), u.value = "", S = setTimeout(() => {
      u.value = O;
    }, 30);
  }
  function C() {
    clearTimeout(S), u.value = "";
  }
  function B(O) {
    d.value = O, c.value++;
  }
  function M(O) {
    return Math.min(O.options.length + (O.allow_other ? 1 : 0), jt);
  }
  function D(O) {
    const E = M(O), R = E > 1 ? `1–${E}` : "1", Q = Math.min(O.options.length, jt), re = Q > 1 ? `Shift+1–${Q}` : "Shift+1", $e = o ? " ← and → change questions." : "";
    return O.multiple ? `${R} ticks, ${re} adds a note, Enter sends.${$e}` : `${R} answers, ${re} adds a note first.${$e}`;
  }
  function h(O) {
    const E = m(O);
    if (O.multiple) {
      const R = O.options.filter((re) => E.chosen.includes(re.value)).map((re) => At(re.value, E.notes[re.value] ?? "")), Q = le(E.other);
      return Q && R.push({ other: Q }), R.length > 0 ? R : void 0;
    }
    if (E.useOther)
      return { other: le(E.other) };
    if (E.chosen[0])
      return At(E.chosen[0], E.notes[E.chosen[0]] ?? "");
  }
  function A(O) {
    return P(O) ? Ur(O, h(O)) : null;
  }
  function y() {
    const O = {};
    for (const E of e.fields) {
      if (!P(E))
        continue;
      const R = h(E);
      R !== void 0 && (O[E.id] = R);
    }
    return O;
  }
  function T(O, E = "first") {
    const R = $.value;
    R && R.multiple && !m(R).done && w(R) && (m(R).done = !0);
    const Q = o ? r : r - 1;
    if (s.value = Math.max(0, Math.min(O, Q)), i.value = "", g.value || a.add(s.value), g.value) {
      const re = k.value[0];
      B(re ? `review-item-${re.index}` : "send-all");
    } else
      B(E);
    b(g.value ? "Review your answers" : `Question ${s.value + 1} of ${r}`);
  }
  function V() {
    k.value.length > 0 || n(y());
  }
  function G(O) {
    if (m(O).done = !0, i.value = "", !o) {
      n(y());
      return;
    }
    const E = e.fields.findIndex((R, Q) => Q > s.value && !a.has(Q));
    T(E === -1 ? r : E);
  }
  function N(O, E) {
    const R = m(O);
    if (E >= O.options.length) {
      B("other");
      return;
    }
    const Q = O.options[E].value;
    if (R.noteOpen === Q && !O.multiple) {
      B(`note-${Q}`);
      return;
    }
    if (O.multiple) {
      R.chosen = R.chosen.includes(Q) ? R.chosen.filter((re) => re !== Q) : [...R.chosen, Q], w(O) || (R.done = !1), i.value = "", B(`opt-${E}`), b(R.chosen.includes(Q) ? "Ticked" : "Unticked");
      return;
    }
    R.chosen = [Q], R.useOther = !1, G(O);
  }
  function J(O, E, R = !1) {
    const Q = m(O), re = O.options.findIndex(($e) => $e.value === E);
    Q.noteOpen === E && !R ? (Q.noteOpen = null, B(`opt-${re}`)) : (Q.noteOpen = E, B(`note-${E}`));
  }
  function be(O, E, R) {
    m(O).notes[E] = R;
  }
  function _e(O, E) {
    const R = m(O);
    if (R.noteOpen = null, O.multiple) {
      R.chosen.includes(E) || (R.chosen = [...R.chosen, E]), B(`opt-${O.options.findIndex((Q) => Q.value === E)}`), b("Note saved");
      return;
    }
    R.chosen = [E], R.useOther = !1, B(`opt-${O.options.findIndex((Q) => Q.value === E)}`), G(O);
  }
  function Ee(O) {
    const E = m(O), R = le(E.other);
    if (O.multiple) {
      if (!R && E.chosen.length === 0)
        return;
    } else {
      if (!R)
        return;
      E.useOther = !0, E.chosen = [];
    }
    G(O);
  }
  return {
    n: r,
    multi: o,
    index: s,
    collapsed: l,
    error: i,
    liveMessage: u,
    focusTarget: d,
    focusSeq: c,
    answers: f,
    inReview: g,
    currentQuestion: $,
    missingRequired: k,
    ans: m,
    hasContent: w,
    answered: P,
    answerItemsFor: A,
    keysText: D,
    activate: N,
    toggleNote: J,
    setNote: be,
    sendNote: _e,
    sendOther: Ee,
    commit: G,
    go: T,
    submitAll: V,
    requestFocus: B,
    quiet: C,
    buildAnswers: y
  };
}
const an = "text-danger-600 dark:text-danger-400";
function z(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function td(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, o) => ({ text: r, code: o % 2 === 1 })).filter((r) => r.text !== "");
}
function ar(e) {
  return String(e).replaceAll("`", "");
}
function nd(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const rd = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Ae = /* @__PURE__ */ pe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, r) => (p(!0), v(te, null, me(x(td)(t.text), (o, a) => (p(), v(te, { key: a }, [
      o.code ? (p(), v("code", rd, F(o.text), 1)) : (p(), v(te, { key: 1 }, [
        se(F(o.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), od = ["part"], ad = ["part"], id = ["part"], sd = { "aria-hidden": "true" }, ld = { class: "w-form__sr" }, ud = ["id", "part"], dd = ["part"], cd = /* @__PURE__ */ pe({
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
    const n = e, r = t, o = _(() => z("header", !n.multi && "single")), a = _(() => z("nav")), s = _(() => z("prev")), l = _(() => z("counter")), i = _(() => z("next")), u = _(() => z("question")), d = _(() => z("actions")), c = _(() => z("collapse")), f = _(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), m = _(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), w = _(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (P, g) => (p(), v("div", {
      part: o.value.part,
      class: j(o.value.class)
    }, [
      e.multi ? (p(), v("div", {
        key: 0,
        part: a.value.part,
        class: j(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        K(x(we), {
          type: "button",
          text: "",
          size: "small",
          part: s.value.part,
          class: j(s.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: g[0] || (g[0] = ($) => r("prev"))
        }, {
          icon: ae(() => [
            K(x(ye), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        L("span", {
          part: l.value.part,
          class: j(l.value.class)
        }, [
          L("span", sd, F(f.value), 1),
          L("span", ld, F(m.value), 1)
        ], 10, id),
        K(x(we), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: j(i.value.class),
          "aria-label": w.value,
          title: w.value,
          disabled: e.review,
          onClick: g[1] || (g[1] = ($) => r("next"))
        }, {
          icon: ae(() => [
            K(x(ye), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, ad)) : I("", !0),
      L("h3", {
        id: e.qid,
        part: u.value.part,
        class: j(u.value.class)
      }, [
        e.review ? (p(), v(te, { key: 0 }, [
          se(" Check your answers, then send them. ")
        ], 64)) : (p(), W(Ae, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, ud),
      L("div", {
        part: d.value.part,
        class: j(d.value.class)
      }, [
        K(x(we), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: j(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: g[2] || (g[2] = ($) => r("toggleCollapse"))
        }, {
          icon: ae(() => [
            K(x(ye), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, dd)
    ], 10, od));
  }
});
var pd = `
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
`, fd = {
  root: "p-inputgroup"
}, md = X.extend({
  name: "inputgroup",
  style: pd,
  classes: fd
}), hd = {
  name: "BaseInputGroup",
  extends: We,
  style: md,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Kr = {
  name: "InputGroup",
  extends: hd,
  inheritAttrs: !1
};
function bd(e, t, n, r, o, a) {
  return p(), v("div", H({
    class: e.cx("root")
  }, e.ptmi("root")), [ce(e.$slots, "default")], 16);
}
Kr.render = bd;
var vd = `
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
`, gd = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": r.autoResize,
      "p-textarea-sm p-inputfield-sm": r.size === "small",
      "p-textarea-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, yd = X.extend({
  name: "textarea",
  style: vd,
  classes: gd
}), wd = {
  name: "BaseTextarea",
  extends: zt,
  props: {
    autoResize: Boolean
  },
  style: yd,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function mt(e) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, mt(e);
}
function xd(e, t, n) {
  return (t = kd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function kd(e) {
  var t = _d(e, "string");
  return mt(t) == "symbol" ? t : t + "";
}
function _d(e, t) {
  if (mt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Gr = {
  name: "Textarea",
  extends: wd,
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
        var t = this.$el.style.height, n = parseInt(t) || 0, r = this.$el.scrollHeight, o = !n || r > n, a = n && r < n;
        a ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : o && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return H(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Te(xd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, $d = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Sd(e, t, n, r, o, a) {
  return p(), v("textarea", H({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, $d);
}
Gr.render = Sd;
const Yr = /* @__PURE__ */ pe({
  __name: "question-card-composer",
  props: {
    kind: {},
    modelValue: {},
    placeholder: {},
    label: {},
    sendLabel: {},
    enabled: { type: Boolean },
    dataFocus: {},
    invalid: { type: Boolean },
    describedBy: {}
  },
  emits: ["update:modelValue", "send", "escape"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = _(() => z("composer", n.kind)), a = _(() => z(`${n.kind}-input`)), s = _(() => z(`${n.kind}-send`));
    function l(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && r("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), r("escape"));
    }
    return (i, u) => (p(), W(x(Kr), {
      part: o.value.part,
      class: j(o.value.class)
    }, {
      default: ae(() => [
        K(x(Gr), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: j(a.value.class),
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": u[0] || (u[0] = (d) => r("update:modelValue", String(d ?? ""))),
          onKeydown: l
        }, null, 8, ["model-value", "part", "class", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        K(x(we), {
          type: "button",
          text: "",
          rounded: "",
          part: s.value.part,
          class: j(s.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => r("send"))
        }, {
          icon: ae(() => [
            K(x(ye), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), Pd = ["part"], Cd = ["part", "role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], Td = ["part"], Od = ["part"], Ad = ["part"], Ed = ["part"], jd = ["part"], Ld = { key: 1 }, Id = ["part"], Nd = /* @__PURE__ */ pe({
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
    disabled: { type: Boolean },
    describedBy: {},
    invalid: { type: Boolean },
    rovingTabbable: { type: Boolean }
  },
  emits: ["activate", "toggle-note", "update:noteDraft", "send-note", "escape-note"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = _(() => z("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = _(() => z("option-main")), s = _(() => z("option-label")), l = _(() => z("option-mark")), i = _(() => z("option-description")), u = _(() => z("option-note")), d = _(() => z("note-toggle", n.note && "has-note", n.editing && "editing")), c = _(() => z("option-key")), f = _(() => z("error")), m = `${Lt()}-note-err`, w = _(() => [
      n.noteTooLong ? m : "",
      n.describedBy ?? ""
    ].filter(Boolean).join(" ") || void 0);
    function P(S) {
      n.disabled || S.target.closest(".w-form__note-toggle, .w-form__composer") || r("activate");
    }
    const g = _(() => `${n.note ? "Edit the note on" : "Add a note to"} ${ar(n.option.label)}`), $ = _(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), k = _(() => n.multiple ? "Save the note" : "Answer with this note");
    return (S, b) => (p(), v("div", {
      part: o.value.part,
      class: j(o.value.class),
      onClick: P
    }, [
      L("div", {
        part: a.value.part,
        class: j(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        L("span", {
          part: s.value.part,
          class: j(s.value.class)
        }, [
          e.multiple ? (p(), W(x(Et), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: l.value.part,
            class: j(l.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (p(), v("span", {
            key: 1,
            part: l.value.part,
            class: j(l.value.class),
            "aria-hidden": "true"
          }, [
            K(x(ye), { icon: "tabler:check" })
          ], 10, Od)) : I("", !0),
          K(Ae, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, Td),
        e.option.description ? (p(), v("span", {
          key: 0,
          part: i.value.part,
          class: j(i.value.class)
        }, [
          K(Ae, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, Ad)) : I("", !0),
        e.note && !e.editing ? (p(), v("span", {
          key: 1,
          part: u.value.part,
          class: j(u.value.class)
        }, [
          K(x(ye), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          L("span", null, F(e.note), 1)
        ], 10, Ed)) : I("", !0)
      ], 10, Cd),
      K(x(we), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: j(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": g.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: b[0] || (b[0] = cr((C) => r("toggle-note"), ["stop"]))
      }, {
        icon: ae(() => [
          K(x(ye), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (p(), v("kbd", {
        key: 0,
        part: c.value.part,
        class: j(c.value.class),
        "aria-hidden": "true"
      }, F(e.keyLabel), 11, jd)) : (p(), v("span", Ld)),
      e.editing ? (p(), v(te, { key: 2 }, [
        K(Yr, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: $.value,
          label: `Note for ${x(ar)(e.option.label)}`,
          "send-label": k.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": w.value,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": b[1] || (b[1] = (C) => r("update:noteDraft", C)),
          onSend: b[2] || (b[2] = (C) => r("send-note")),
          onEscape: b[3] || (b[3] = (C) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (p(), v("p", {
          key: 0,
          id: m,
          part: f.value.part,
          class: j(f.value.class),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Id)) : I("", !0)
      ], 64)) : I("", !0)
    ], 10, Pd));
  }
}), zd = ["part"], Rd = ["part"], Vd = ["part"], Bd = ["part", "role", "aria-labelledby", "aria-invalid"], Fd = ["part"], Dd = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, Md = { key: 1 }, qd = ["part"], Ud = ["part"], Wd = ["part"], Hd = /* @__PURE__ */ pe({
  __name: "question-card-question",
  props: {
    question: {},
    controller: {},
    qid: {},
    stale: { type: Boolean },
    serverError: {},
    cardErrorIds: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = _(() => z("notice")), r = _(() => z("description")), o = _(() => z("hint")), a = _(() => z("options")), s = _(() => z("footer")), l = _(() => z("send")), i = _(() => z("error")), u = _(() => z("keys")), d = _(() => {
      const y = [];
      return t.question.multiple && y.push("Choose any that apply."), t.question.required || y.push("Optional."), y.join(" ");
    }), c = _(() => t.controller.error.value || t.serverError || "");
    function f(y) {
      return y < jt ? String(y + 1) : null;
    }
    const m = _(() => {
      const y = t.question.options.length + 1;
      return y <= jt ? String(y) : null;
    });
    function w() {
      return t.controller.ans(t.question);
    }
    const P = _(() => {
      const y = w(), T = t.question.multiple ? le(y.other) !== "" : y.useOther && y.done;
      return z("option", "other", T && "selected");
    }), g = _(() => {
      const y = w();
      return le(y.other) !== "" || t.question.multiple && y.chosen.length > 0;
    }), $ = _(() => Mr(w().other)), k = `${t.qid}-other-err`, S = `${t.qid}-err`, b = _(() => [
      c.value ? S : "",
      t.cardErrorIds ?? ""
    ].filter(Boolean).join(" ") || void 0), C = _(() => [
      $.value ? k : "",
      b.value ?? ""
    ].filter(Boolean).join(" ") || void 0), B = _(() => $.value || !!c.value);
    function M() {
      t.disabled || t.controller.commit(t.question);
    }
    function D(y) {
      y.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    const h = q(0);
    oe(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const y = w(), T = y.useOther ? -1 : t.question.options.findIndex((V) => V.value === y.chosen[0]);
      h.value = T >= 0 ? T : 0;
    }, { immediate: !0 });
    function A(y) {
      if (t.question.multiple)
        return;
      const T = y.target?.dataset?.focus ?? "";
      T.startsWith("opt-") && (h.value = Number(T.slice(4)));
    }
    return (y, T) => (p(), v(te, null, [
      e.stale ? (p(), v("p", {
        key: 0,
        part: n.value.part,
        class: j(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, zd)) : I("", !0),
      e.question.description ? (p(), v("p", {
        key: 1,
        part: r.value.part,
        class: j(r.value.class)
      }, [
        K(Ae, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Rd)) : I("", !0),
      d.value ? (p(), v("p", {
        key: 2,
        part: o.value.part,
        class: j(o.value.class)
      }, F(d.value), 11, Vd)) : I("", !0),
      L("div", {
        part: a.value.part,
        class: j(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": S,
        "aria-invalid": !e.question.multiple && c.value ? "true" : void 0,
        onFocusin: A
      }, [
        (p(!0), v(te, null, me(e.question.options, (V, G) => (p(), W(Nd, {
          key: V.value,
          option: V,
          index: G,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(V.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === V.value,
          note: x(le)(e.controller.ans(e.question).notes[V.value] || ""),
          editing: e.controller.ans(e.question).noteOpen === V.value,
          "note-draft": e.controller.ans(e.question).notes[V.value] || "",
          "key-label": f(G),
          "note-too-long": x(al)(e.controller.ans(e.question).notes[V.value] || ""),
          disabled: !!e.disabled,
          "described-by": b.value,
          invalid: !!c.value,
          "roving-tabbable": G === h.value,
          onActivate: (N) => e.controller.activate(e.question, G),
          onToggleNote: (N) => e.controller.toggleNote(e.question, V.value),
          "onUpdate:noteDraft": (N) => e.controller.setNote(e.question, V.value, N),
          onSendNote: (N) => e.controller.sendNote(e.question, V.value),
          onEscapeNote: (N) => e.controller.toggleNote(e.question, V.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (p(), v("div", {
          key: 0,
          part: P.value.part,
          class: j(P.value.class),
          onClick: D
        }, [
          K(Yr, {
            kind: "other",
            "model-value": w().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: g.value && !e.disabled && !$.value,
            invalid: B.value,
            "described-by": C.value,
            "data-focus": "other",
            "onUpdate:modelValue": T[0] || (T[0] = (V) => {
              w().other = V;
            }),
            onSend: T[1] || (T[1] = (V) => e.controller.sendOther(e.question)),
            onEscape: T[2] || (T[2] = (V) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          m.value ? (p(), v("kbd", Dd, F(m.value), 1)) : (p(), v("span", Md)),
          $.value ? (p(), v("p", {
            key: 2,
            id: k,
            part: i.value.part,
            class: j(i.value.class),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, qd)) : I("", !0)
        ], 10, Fd)) : I("", !0)
      ], 42, Bd),
      e.question.multiple && !e.question.allow_other ? (p(), v("div", {
        key: 3,
        part: s.value.part,
        class: j(s.value.class)
      }, [
        K(x(we), {
          type: "button",
          part: l.value.part,
          class: j([l.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send",
          "aria-describedby": b.value,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: e.controller.ans(e.question).chosen.length === 0,
          onClick: M
        }, {
          default: ae(() => [
            T[3] || (T[3] = se(" Send ", -1)),
            K(x(ye), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, Ud)) : I("", !0),
      c.value ? (p(), W(x(ge), {
        key: 4,
        id: S,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: j(i.value.class),
        role: "alert"
      }, {
        default: ae(() => [
          L("span", {
            class: j(x(an))
          }, F(c.value), 3)
        ]),
        _: 1
      }, 8, ["part", "class"])) : (p(), v("p", {
        key: 5,
        id: S,
        class: "hidden"
      })),
      L("p", {
        part: u.value.part,
        class: j(u.value.class)
      }, F(e.controller.keysText(e.question)), 11, Wd)
    ], 64));
  }
}), Kd = ["part"], Gd = ["part"], Yd = { key: 0 }, Qd = ["part"], Qr = /* @__PURE__ */ pe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = _(() => z("answer-item")), r = _(() => z("answer-note")), o = _(() => z("answer-own"));
    return (a, s) => (p(!0), v(te, null, me(t.items, (l, i) => (p(), v("span", {
      key: i,
      part: n.value.part,
      class: j(n.value.class)
    }, [
      l.own ? (p(), v(te, { key: 0 }, [
        L("span", {
          part: o.value.part,
          class: j(o.value.class)
        }, "Own answer: ", 10, Gd),
        (p(!0), v(te, null, me(x(nd)(l.label), (u, d) => (p(), v(te, { key: d }, [
          d > 0 ? (p(), v("br", Yd)) : I("", !0),
          se(F(u), 1)
        ], 64))), 128))
      ], 64)) : (p(), W(Ae, {
        key: 1,
        text: l.label
      }, null, 8, ["text"])),
      x(le)(l.note || "") ? (p(), v("span", {
        key: 2,
        part: r.value.part,
        class: j(r.value.class)
      }, [
        K(x(ye), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        L("span", null, F(x(le)(l.note)), 1)
      ], 10, Qd)) : I("", !0)
    ], 10, Kd))), 128));
  }
}), Zd = ["part"], Jd = ["part"], Xd = ["part", "aria-label", "data-focus", "onClick"], ec = ["part"], tc = ["part"], nc = ["part"], rc = ["part"], oc = ["part"], ac = ["part"], ic = ["part"], sc = /* @__PURE__ */ pe({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = _(() => z("review")), r = _(() => z("footer")), o = _(() => z("footer-text")), a = _(() => z("send-all")), s = _(() => z("keys")), l = _(() => z("review-number")), i = _(() => z("review-question")), u = _(() => z("review-answer")), d = _(() => z("answer-empty"));
    function c(g) {
      return z("review-item", g && "missing");
    }
    function f() {
      return z("review-edit");
    }
    function m() {
      t.disabled || t.controller.submitAll();
    }
    const w = _(() => t.controller.missingRequired.value), P = _(() => {
      const g = w.value;
      return g.length === 0 ? "" : g.length === 1 ? `Question ${g[0].index + 1} still needs an answer.` : `Questions ${g.map(($) => $.index + 1).join(" and ")} still need answers.`;
    });
    return (g, $) => (p(), v(te, null, [
      L("ol", {
        part: n.value.part,
        class: j(n.value.class)
      }, [
        (p(!0), v(te, null, me(e.definition.fields, (k, S) => (p(), v("li", {
          key: k.id,
          part: c(!e.controller.answerItemsFor(k) && k.required).part,
          class: j(c(!e.controller.answerItemsFor(k) && k.required).class)
        }, [
          L("button", {
            type: "button",
            part: f().part,
            class: j(f().class),
            "aria-label": `Question ${S + 1}: change the answer`,
            "data-focus": `review-item-${S}`,
            onClick: (b) => e.controller.go(S, "first")
          }, [
            L("span", {
              part: l.value.part,
              class: j(l.value.class),
              "aria-hidden": "true"
            }, F(S + 1), 11, ec),
            L("span", {
              part: i.value.part,
              class: j(i.value.class)
            }, [
              K(Ae, {
                text: k.label
              }, null, 8, ["text"])
            ], 10, tc),
            L("span", {
              part: u.value.part,
              class: j(u.value.class)
            }, [
              e.controller.answerItemsFor(k) ? (p(), W(Qr, {
                key: 0,
                items: e.controller.answerItemsFor(k)
              }, null, 8, ["items"])) : k.required ? (p(), v(te, { key: 1 }, [
                se(" Not answered yet ")
              ], 64)) : (p(), v("span", {
                key: 2,
                part: d.value.part,
                class: j(d.value.class)
              }, "Skipped", 10, rc))
            ], 10, nc)
          ], 10, Xd)
        ], 10, Jd))), 128))
      ], 10, Zd),
      L("div", {
        part: r.value.part,
        class: j(r.value.class)
      }, [
        P.value ? (p(), v("p", {
          key: 0,
          part: o.value.part,
          class: j(o.value.class)
        }, F(P.value), 11, ac)) : I("", !0),
        K(x(we), {
          type: "button",
          part: a.value.part,
          class: j([a.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send-all",
          "aria-describedby": e.cardErrorIds,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: w.value.length > 0,
          onClick: m
        }, {
          default: ae(() => [
            $[0] || ($[0] = se(" Send answers ", -1)),
            K(x(ye), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, oc),
      L("p", {
        part: s.value.part,
        class: j(s.value.class)
      }, " Enter sends. Pick a row to change it. ← goes back to the last question. ", 10, ic)
    ], 64));
  }
}), lc = ["part", "aria-busy"], uc = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, dc = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, cc = ["part"], pc = ["part"], fc = { class: "flex items-center gap-2" }, mc = {
  "aria-live": "polite",
  class: "w-form__sr"
}, hc = "You are offline. Your choices are kept.", bc = "Sending your answer…", vc = /* @__PURE__ */ pe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = ed(r.state.definition, r.state.data, (h) => {
      r.offline || r.submitting || o("submit", h);
    }), s = _(() => !!r.offline || r.submitting), l = `${Lt()}-q`, i = q(null);
    oe(a.inReview, (h) => o("update:state", h ? "review" : "active"), { immediate: !0 }), oe(a.collapsed, (h) => o("update:collapsed", h), { immediate: !0 }), oe(() => r.submitting, (h) => {
      h && a.quiet();
    });
    const u = q({}), d = q([]);
    function c(h) {
      return u.value[h] ?? "";
    }
    const f = _(() => new Set(r.state.definition.fields.map((h) => h.id))), m = _(() => {
      const h = Object.entries(u.value).filter(([A]) => !f.value.has(A)).map(([, A]) => A);
      return [...d.value, ...h].join(" ");
    }), w = `${l}-general-err`, P = `${l}-banner`, g = _(() => [
      m.value ? w : "",
      r.banner ? P : ""
    ].filter(Boolean).join(" ") || void 0);
    oe(
      () => Object.fromEntries(r.state.definition.fields.map((h) => [h.id, JSON.stringify(a.ans(h))])),
      (h, A) => {
        if (!A)
          return;
        const y = new Set(
          r.state.definition.fields.map((T) => T.id).filter((T) => h[T] !== A[T] && u.value[T])
        );
        y.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([T]) => !y.has(T))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(h, A) {
        const y = {};
        for (const [V, G] of Object.entries(h ?? {}))
          y[V] = G.map((N) => N.message).join(" ");
        u.value = y, d.value = (A ?? []).map((V) => V.message);
        const T = r.state.definition.fields.findIndex((V) => y[V.id]);
        T >= 0 ? a.go(T, "first") : Ne(B);
      },
      retry() {
        o("submit", a.buildAnswers());
      },
      /**
       * True once ANY question has a chosen/ticked answer, a note, or Other
       * text that has not yet been sent — a saved-but-never-submitted draft.
       * `wippy-form.vue` reads this before showing the "answered elsewhere"
       * notice for a background state flip (another tab/client answering the
       * same artifact): a passive copy that never touched this card must just
       * switch to the read-only summary, not claim an answer went unsent when
       * nothing was ever entered.
       */
      hasUnsentInput() {
        return Object.values(a.answers).some(
          (h) => h.chosen.length > 0 || le(h.other) !== "" || Object.values(h.notes).some((A) => le(A) !== "")
        );
      }
    });
    const $ = _(() => z("card")), k = _(() => z("title")), S = _(() => z("form-description"));
    function b(h) {
      const A = i.value;
      if (!A)
        return;
      let y = null;
      if (h === "card" ? y = A : h === "first" ? y = A.querySelector(".w-form__option--selected .w-form__option-main") ?? A.querySelector(".w-form__option-main, .w-form__other-input") : y = Array.from(A.querySelectorAll("[data-focus]")).find((T) => T.dataset.focus === h) ?? null, !!y && (y.focus(), y.tagName === "TEXTAREA")) {
        const T = y;
        T.setSelectionRange(T.value.length, T.value.length);
      }
    }
    oe(a.focusSeq, () => {
      Ne(() => {
        const h = a.focusTarget.value;
        h && b(h);
      });
    });
    function C() {
      const h = i.value?.ownerDocument;
      if (!h)
        return !1;
      const A = h.activeElement;
      return !A || A === h.body || A === h.documentElement;
    }
    function B() {
      C() && a.requestFocus(a.inReview.value ? "send-all" : "first");
    }
    oe(() => r.banner, (h) => {
      h && Ne(B);
    });
    function M() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function D(h) {
      const A = h.composedPath()[0];
      if (A?.tagName === "TEXTAREA" || h.isComposing || h.ctrlKey || h.metaKey || h.altKey || a.collapsed.value || s.value)
        return;
      if (a.inReview.value) {
        h.key === "ArrowLeft" && (h.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const y = a.currentQuestion.value;
      if (!y)
        return;
      const T = a.ans(y), V = h.shiftKey ? /^Digit([1-9])$/.exec(h.code) : /^([1-9])$/.exec(h.key);
      if (V) {
        const J = Number(V[1]) - 1;
        if (J >= y.options.length + (y.allow_other ? 1 : 0))
          return;
        h.preventDefault(), h.shiftKey && J < y.options.length ? a.toggleNote(y, y.options[J].value, !0) : a.activate(y, J);
        return;
      }
      const G = A?.dataset?.focus ?? "", N = G.startsWith("opt-") ? Number(G.slice(4)) : -1;
      if (h.key === "ArrowDown" || h.key === "ArrowUp") {
        const J = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (J.length === 0)
          return;
        h.preventDefault();
        const be = J.indexOf(A), _e = h.key === "ArrowDown" ? (be + 1) % J.length : be <= 0 ? J.length - 1 : be - 1;
        J[_e]?.focus();
        return;
      }
      if (a.multi && (h.key === "ArrowRight" || h.key === "ArrowLeft")) {
        h.preventDefault(), a.go(a.index.value + (h.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((h.key === "n" || h.key === "N") && N >= 0) {
        h.preventDefault(), a.toggleNote(y, y.options[N].value, !0);
        return;
      }
      if (N >= 0 && (h.key === " " || h.key === "Enter" && !y.multiple)) {
        h.preventDefault(), a.activate(y, N);
        return;
      }
      h.key === "Enter" && y.multiple && !A?.matches?.("button") && (h.preventDefault(), T.chosen.length > 0 || le(T.other) ? a.commit(y) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(N >= 0 ? G : "first")));
    }
    return (h, A) => (p(), v("section", {
      ref_key: "cardRoot",
      ref: i,
      part: $.value.part,
      class: j(`w-form ${$.value.class}`),
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: D
    }, [
      e.offline ? (p(), v("p", uc, F(hc))) : I("", !0),
      e.submitting ? (p(), v("p", dc, F(bc))) : I("", !0),
      m.value ? (p(), W(x(ge), {
        key: 2,
        id: w,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          L("span", {
            class: j(x(an))
          }, F(m.value), 3)
        ]),
        _: 1
      })) : I("", !0),
      L("p", {
        part: k.value.part,
        class: j(k.value.class)
      }, [
        K(x(ye), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        se(" " + F(e.state.definition.title), 1)
      ], 10, cc),
      e.state.definition.description ? (p(), v("p", {
        key: 3,
        part: S.value.part,
        class: j(S.value.class)
      }, [
        K(Ae, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, pc)) : I("", !0),
      K(cd, {
        multi: x(a).multi,
        index: x(a).index.value,
        n: x(a).n,
        review: x(a).inReview.value,
        "question-text": x(a).currentQuestion.value?.label ?? "",
        collapsed: x(a).collapsed.value,
        qid: l,
        onPrev: A[0] || (A[0] = (y) => x(a).go(x(a).index.value - 1, "first")),
        onNext: A[1] || (A[1] = (y) => x(a).go(x(a).index.value + 1, "first")),
        onToggleCollapse: M
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (p(), W(x(ge), {
        key: 4,
        id: P,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ae(() => [
          L("div", fc, [
            L("span", {
              class: j(x(an))
            }, F(e.banner.message), 3),
            e.banner.retryable ? (p(), W(x(we), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: A[2] || (A[2] = (y) => o("retry"))
            }, {
              default: ae(() => [...A[3] || (A[3] = [
                se(" Retry ", -1)
              ])]),
              _: 1
            })) : I("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : I("", !0),
      x(a).collapsed.value ? I("", !0) : (p(), v(te, { key: 5 }, [
        x(a).inReview.value ? (p(), W(sc, {
          key: 0,
          definition: e.state.definition,
          controller: x(a),
          "card-error-ids": g.value,
          disabled: s.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : x(a).currentQuestion.value ? (p(), W(Hd, {
          key: 1,
          question: x(a).currentQuestion.value,
          controller: x(a),
          qid: l,
          stale: !!e.state.stale,
          "server-error": c(x(a).currentQuestion.value.id),
          "card-error-ids": g.value,
          disabled: s.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : I("", !0)
      ], 64)),
      L("p", mc, F(x(a).liveMessage.value), 1)
    ], 42, lc));
  }
}), gc = ["part", "aria-label"], yc = ["part"], wc = ["part"], xc = ["part"], kc = ["part"], _c = ["part"], $c = ["part"], Sc = ["part"], Pc = ["part"], Cc = { key: 0 }, Tc = { key: 1 }, Oc = { key: 2 }, Ac = { key: 3 }, Ec = { key: 4 }, jc = /* @__PURE__ */ pe({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function r(P) {
      if (!P)
        return null;
      const g = new Date(P);
      return Number.isNaN(g.getTime()) ? null : g.toLocaleString();
    }
    const o = _(() => z("card", "answered")), a = _(() => z("title")), s = _(() => z("form-description")), l = _(() => z("summary")), i = _(() => z("summary-item")), u = _(() => z("summary-question")), d = _(() => z("summary-answer")), c = _(() => z("answer-empty")), f = _(() => z("status"));
    function m(P) {
      const g = n.state.definition.fields.find(($) => $.id === P);
      return g ? Ur(g, n.state.data ? n.state.data[P] : void 0) : null;
    }
    const w = q(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        w.value?.focus();
      }
    }), (P, g) => (p(), v("section", {
      part: o.value.part,
      class: j(`w-form ${o.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      L("p", {
        part: a.value.part,
        class: j(a.value.class)
      }, [
        K(x(ye), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        se(" " + F(e.state.definition.title), 1)
      ], 10, yc),
      e.state.definition.description ? (p(), v("p", {
        key: 0,
        part: s.value.part,
        class: j(s.value.class)
      }, [
        K(Ae, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, wc)) : I("", !0),
      L("dl", {
        part: l.value.part,
        class: j(l.value.class)
      }, [
        (p(!0), v(te, null, me(e.state.definition.fields, ($) => (p(), v("div", {
          key: $.id,
          part: i.value.part,
          class: j(i.value.class)
        }, [
          L("dt", {
            part: u.value.part,
            class: j(u.value.class)
          }, [
            K(Ae, {
              text: $.label
            }, null, 8, ["text"])
          ], 10, _c),
          L("dd", {
            part: d.value.part,
            class: j(d.value.class)
          }, [
            m($.id) ? (p(), W(Qr, {
              key: 0,
              items: m($.id)
            }, null, 8, ["items"])) : (p(), v("span", {
              key: 1,
              part: c.value.part,
              class: j(c.value.class)
            }, "Skipped", 10, Sc))
          ], 10, $c)
        ], 10, kc))), 128))
      ], 10, xc),
      L("div", {
        ref_key: "statusEl",
        ref: w,
        tabindex: "-1",
        part: f.value.part,
        class: j(f.value.class)
      }, [
        e.state.late ? (p(), v("p", Cc, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : I("", !0),
        e.state.delivery === "pending" ? (p(), v("p", Tc, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), v("p", Oc, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), v("p", Ac, " The assistant stopped before answering. Send a message to continue. ")) : I("", !0),
        r(e.state.submitted_at) ? (p(), v("p", Ec, " Answered " + F(r(e.state.submitted_at)), 1)) : I("", !0)
      ], 10, Pc)
    ], 10, gc));
  }
}), Lc = { class: "p-3 max-w-full min-w-0" }, Ic = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Nc = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, zc = {
  key: 6,
  "no-bg": "",
  title: "Loading form…"
}, Rc = { class: "flex items-center gap-2" }, Vc = "Could not refresh this form. Showing what you last saw.", Bc = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", ir = 1, Fc = /* @__PURE__ */ pe({
  __name: "wippy-form",
  setup(e) {
    const t = Rs(), n = Bs(), r = Vs(), o = Js(), a = _(() => t.value.definition), s = _(() => t.value.state), l = _(() => s.value === "idle"), { status: i, state: u, errorMessage: d, reloadError: c, reload: f, refresh: m } = Us(o, s);
    Ms(u, m);
    const { submitting: w, submit: P } = Zs(o), { isOnline: g } = el(() => f()), $ = q(null), k = q(!1);
    oe(o, () => {
      k.value = !1;
    });
    const S = q(null), b = q(null);
    let C = !1;
    oe(() => u.value?.status, (G, N) => {
      if (G !== "idle" || N !== "active")
        return;
      if (C) {
        C = !1;
        return;
      }
      (S.value?.hasUnsentInput?.() ?? !0) && (k.value = !0);
    });
    const B = _(() => {
      const G = t.value.formVersion;
      if (G !== void 0 && G !== ir)
        return !0;
      const N = u.value?.form_version;
      return N !== void 0 && N !== ir;
    }), M = _(() => {
      const G = a.value?.fields;
      return !!G && G.length > 0 && G.every((N) => N.type === "choice");
    }), D = q("active"), h = q(!1), A = _(() => B.value || i.value === "unsupported" ? "unsupported" : u.value === null ? "loading" : u.value.status === "idle" ? "answered" : M.value ? D.value : "active"), y = _(() => !B.value && M.value && u.value?.status === "active" && h.value);
    Xs(A, y);
    async function T(G) {
      if (!u.value)
        return;
      $.value = null;
      const N = await P(u.value.form_version, u.value.content_version, G);
      if (!N.ignored) {
        if (N.ok && N.accepted) {
          const J = N.accepted;
          C = !0, u.value = {
            ...u.value,
            status: "idle",
            stale: !1,
            late: J.late,
            content_version: J.content_version,
            data: G,
            answer_message_id: J.answer_message_id,
            delivery: J.delivery
          }, r("answer-submitted", { requestId: J.request_id, answerMessageId: J.answer_message_id, late: J.late }), Ne(() => b.value?.focusStatus()), f();
          return;
        }
        if (N.fieldErrors || N.formErrors) {
          S.value?.setServerErrors(N.fieldErrors, N.formErrors);
          return;
        }
        if (N.code === "already_submitted") {
          k.value = !0, await m(), Ne(() => b.value?.focusStatus());
          return;
        }
        N.shouldReload && f(), $.value = { message: N.message ?? "Could not submit this form.", retryable: N.retryable };
      }
    }
    function V() {
      S.value?.retry();
    }
    return (G, N) => (p(), v("div", Lc, [
      x(n).length > 0 ? (p(), W(x(ge), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [...N[2] || (N[2] = [
          se(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : a.value ? B.value ? (p(), W(x(ge), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: ae(() => [...N[4] || (N[4] = [
          se(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : x(i) === "unsupported" ? (p(), W(Gu, {
        key: 3,
        definition: a.value,
        answered: l.value
      }, null, 8, ["definition", "answered"])) : x(o) ? x(u) ? (p(), v(te, { key: 5 }, [
        x(c) ? (p(), v("p", Ic, F(Vc))) : I("", !0),
        x(u).status === "active" && M.value ? (p(), W(vc, {
          key: x(o),
          ref_key: "activeFormRef",
          ref: S,
          state: x(u),
          submitting: x(w),
          banner: $.value,
          offline: !x(g),
          onSubmit: T,
          onRetry: V,
          "onUpdate:state": N[0] || (N[0] = (J) => {
            D.value = J;
          }),
          "onUpdate:collapsed": N[1] || (N[1] = (J) => {
            h.value = J;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : x(u).status === "active" ? (p(), W(Lu, {
          key: x(o),
          ref_key: "activeFormRef",
          ref: S,
          state: x(u),
          submitting: x(w),
          banner: $.value,
          offline: !x(g),
          onSubmit: T,
          onRetry: V
        }, null, 8, ["state", "submitting", "banner", "offline"])) : x(u).status === "idle" ? (p(), v(te, { key: 3 }, [
          k.value ? (p(), v("p", Nc, F(Bc))) : I("", !0),
          M.value ? (p(), W(jc, {
            key: x(o),
            ref_key: "idleFormRef",
            ref: b,
            state: x(u)
          }, null, 8, ["state"])) : (p(), W(qu, {
            key: x(o),
            ref_key: "idleFormRef",
            ref: b,
            state: x(u)
          }, null, 8, ["state"]))
        ], 64)) : I("", !0)
      ], 64)) : x(i) === "loading" || x(i) === "idle" ? (p(), v("wippy-loading", zc)) : x(i) === "error" ? (p(), W(x(ge), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          L("div", Rc, [
            L("span", null, F(x(d) || "Could not load this form."), 1),
            K(x(we), {
              type: "button",
              link: "",
              size: "small",
              onClick: x(f)
            }, {
              default: ae(() => [...N[5] || (N[5] = [
                se(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : I("", !0) : (p(), W(Xu, {
        key: 4,
        definition: a.value
      }, null, 8, ["definition"])) : (p(), W(x(ge), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [...N[3] || (N[3] = [
          se(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Dc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.container{width:100%}@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1280px}}@media(min-width:1536px){.container{max-width:1536px}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.table{display:table}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-danger{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-500) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.blur{--tw-blur: blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__error:not(.p-message){color:var(--_danger)}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small);color:var(--_danger)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{color:var(--_danger);font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class Mc extends Mi {
  static get wippyConfig() {
    return {
      propsSchema: Ui.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Dc
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Fc,
      plugins: [hi],
      providers(t, n) {
        t.provide(hn, n);
      }
    };
  }
}
_o(import.meta.url, Mc);
//# sourceMappingURL=index.js.map
