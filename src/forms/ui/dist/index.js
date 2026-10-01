import { ref as M, readonly as pr, getCurrentInstance as fn, onMounted as on, nextTick as Ye, watch as ae, reactive as rn, renderSlot as de, openBlock as f, createBlock as K, Teleport as ro, createCommentVNode as z, useId as jt, mergeProps as U, h as fr, createApp as mr, inject as mt, createElementBlock as b, createElementVNode as N, createTextVNode as ie, toDisplayString as B, resolveComponent as Qe, resolveDirective as ao, withDirectives as io, resolveDynamicComponent as so, withCtx as oe, normalizeClass as I, Transition as hr, onUnmounted as Lt, computed as S, watchEffect as br, defineComponent as ce, Fragment as X, renderList as fe, createVNode as W, unref as k, withModifiers as lo } from "vue";
import { addCollection as vr, Icon as ve } from "@iconify/vue";
import * as an from "@wippy-fe/proxy";
import { config as mn, addIcons as gr, on as Be, applyThemeMode as gt, host as yr, hostCss as wr, loadCss as xr, define as kr } from "@wippy-fe/proxy";
import { getActivePinia as _r, createPinia as $r, setActivePinia as Sr } from "pinia";
var Pr = Object.defineProperty, hn = Object.getOwnPropertySymbols, Cr = Object.prototype.hasOwnProperty, Tr = Object.prototype.propertyIsEnumerable, bn = (e, t, n) => t in e ? Pr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Or = (e, t) => {
  for (var n in t || (t = {})) Cr.call(t, n) && bn(e, n, t[n]);
  if (hn) for (var n of hn(t)) Tr.call(t, n) && bn(e, n, t[n]);
  return e;
};
function Ve(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Dt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let o = Array.isArray(e), r = Array.isArray(t), a, s, l;
  if (o && r) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Dt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let m = Object.keys(e);
  if (s = m.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, m[a])) return !1;
  for (a = s; a-- !== 0; ) if (l = m[a], !Dt(e[l], t[l], n)) return !1;
  return !0;
}
function Ar(e, t) {
  return Dt(e, t);
}
function sn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function ee(e) {
  return !Ve(e);
}
function vn(e, t) {
  return null;
}
function ln(e, t, n) {
  return n ? vn() === vn() : Ar(e, t);
}
function Er(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (ln(e, n)) return !0;
  }
  return !1;
}
function $e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function uo(e = {}, t = {}) {
  let n = Or({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    $e(t[r]) && r in e && $e(e[r]) ? n[r] = uo(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function jr(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : uo(t, n), {});
}
function he(e, ...t) {
  return sn(e) ? e(...t) : e;
}
function me(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function _e(e) {
  return me(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function un(e, t = "", n = {}) {
  let o = _e(t).split("."), r = o.shift();
  if (r) {
    if ($e(e)) {
      let a = Object.keys(e).find((s) => _e(s) === r) || "";
      return un(he(e[a], n), o.join("."), n);
    }
    return;
  }
  return he(e, n);
}
function co(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Lr(e) {
  return ee(e) && !isNaN(e);
}
function Ne(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Nr(...e) {
  return jr(...e);
}
function Ge(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ir(e) {
  return me(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function po(e) {
  return me(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function fo() {
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
function Se(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let a = Array.isArray(o) ? [Se(...o)] : Object.entries(o).map(([s, l]) => l ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function zr(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Rr(e, t) {
  if (e && t) {
    let n = (o) => {
      zr(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Rt(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function gn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Vr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Fr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Br(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Fr(e));
}
function ht(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function $t(e, t = {}) {
  if (ht(e)) {
    let n = (o, r) => {
      var a, s;
      let l = (a = e?.$attrs) != null && a[o] ? [(s = e?.$attrs) == null ? void 0 : s[o]] : [];
      return [r].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([m, h]) => o === "style" && (h || h === 0) ? `${m.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? m : void 0);
            i = c.length ? i.concat(c.filter((m) => !!m)) : i;
          }
        }
        return i;
      }, l);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let a = o.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? $t(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function Dr(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return $t(o, t), o.append(...n), o;
  }
}
function Mr(e, t) {
  return ht(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function qr(e, t) {
  if (ht(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function yn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Ur(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || gn(document.documentElement) || gn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Wr(e, t) {
  return e ? e.offsetHeight : 0;
}
function wn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function mo() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Hr(e, t = "", n) {
  ht(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var yt = {};
function Kr(e = "pui_id_") {
  return Object.hasOwn(yt, e) || (yt[e] = 0), yt[e]++, `${e}${yt[e]}`;
}
var Gr = Object.defineProperty, Yr = Object.defineProperties, Qr = Object.getOwnPropertyDescriptors, St = Object.getOwnPropertySymbols, ho = Object.prototype.hasOwnProperty, bo = Object.prototype.propertyIsEnumerable, xn = (e, t, n) => t in e ? Gr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, we = (e, t) => {
  for (var n in t || (t = {})) ho.call(t, n) && xn(e, n, t[n]);
  if (St) for (var n of St(t)) bo.call(t, n) && xn(e, n, t[n]);
  return e;
}, Vt = (e, t) => Yr(e, Qr(t)), Te = (e, t) => {
  var n = {};
  for (var o in e) ho.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && St) for (var o of St(e)) t.indexOf(o) < 0 && bo.call(e, o) && (n[o] = e[o]);
  return n;
}, Zr = fo(), le = Zr, Ze = /{([^}]*)}/g, vo = /(\d+\s+[\+\-\*\/]\s+\d+)/g, go = /var\([^)]+\)/g;
function kn(e) {
  return me(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Jr(e) {
  return $e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Xr(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Mt(e = "", t = "") {
  return Xr(`${me(e, !1) && me(t, !1) ? `${e}-` : e}${t}`);
}
function yo(e = "", t = "") {
  return `--${Mt(e, t)}`;
}
function ea(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function wo(e, t = "", n = "", o = [], r) {
  if (me(e)) {
    let a = e.trim();
    if (ea(a)) return;
    if (Ne(a, Ze)) {
      let s = a.replaceAll(Ze, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => Ne(u, d)));
        return `var(${yo(n, po(i.join("-")))}${ee(r) ? `, ${r}` : ""})`;
      });
      return Ne(s.replace(go, "0"), vo) ? `calc(${s})` : s;
    }
    return a;
  } else if (Lr(e)) return e;
}
function ta(e, t, n) {
  me(t, !1) && e.push(`${t}:${n};`);
}
function De(e, t) {
  return e ? `${e}{${t}}` : "";
}
function xo(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let i = [], u = 0, d = "", c = null, m = 0;
    for (; u <= s.length; ) {
      let h = s[u];
      if ((h === '"' || h === "'" || h === "`") && s[u - 1] !== "\\" && (c = c === h ? null : h), !c && (h === "(" && m++, h === ")" && m--, (h === "," || u === s.length) && m === 0)) {
        let y = d.trim();
        y.startsWith("dt(") ? i.push(xo(y, l)) : i.push(o(y)), d = "", u++;
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
var Ie = (...e) => na(J.getTheme(), ...e), na = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: a } = J.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = Ne(t, Ze) ? t : `{${t}}`;
    return o === "value" || Ve(o) && l === "strict" ? J.getTokenValue(t) : wo(i, void 0, s, [r.excludedKeyRegex], n);
  }
  return "";
};
function wt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, a) => {
      var s;
      return o + r + ((s = he(t[a], { dt: Ie })) != null ? s : "");
    }, "");
    return xo(n, Ie);
  }
  return he(e, { dt: Ie });
}
function oa(e, t = {}) {
  let n = J.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: o }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let m in d) {
      let h = d[m], y = Jr(h), _ = Ne(m, a) ? Mt(c) : Mt(c, po(m));
      if ($e(y)) i.push({ node: y, path: _ });
      else {
        let v = yo(_), x = wo(y, _, o, [a]);
        ta(l, v, x);
        let $ = _;
        o && $.startsWith(o + "-") && ($ = $.slice(o.length + 1)), s.push($.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: De(r, u) };
}
var ye = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return oa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var a, s, l, i, u, d, c;
  let { preset: m, options: h } = t, y, _, v, x, $, P, p;
  if (ee(m) && h.transform !== "strict") {
    let { primitive: g, semantic: T, extend: j } = m, C = T || {}, { colorScheme: w } = C, E = Te(C, ["colorScheme"]), A = j || {}, { colorScheme: V } = A, Y = Te(A, ["colorScheme"]), D = w || {}, { dark: re } = D, Ae = Te(D, ["dark"]), Pe = V || {}, { dark: O } = Pe, L = Te(Pe, ["dark"]), F = ee(g) ? this._toVariables({ primitive: g }, h) : {}, H = ee(E) ? this._toVariables({ semantic: E }, h) : {}, te = ee(Ae) ? this._toVariables({ light: Ae }, h) : {}, be = ee(re) ? this._toVariables({ dark: re }, h) : {}, Ee = ee(Y) ? this._toVariables({ semantic: Y }, h) : {}, bt = ee(L) ? this._toVariables({ light: L }, h) : {}, Ce = ee(O) ? this._toVariables({ dark: O }, h) : {}, [vt, Yo] = [(a = F.declarations) != null ? a : "", F.tokens], [Qo, Zo] = [(s = H.declarations) != null ? s : "", H.tokens || []], [Jo, Xo] = [(l = te.declarations) != null ? l : "", te.tokens || []], [er, tr] = [(i = be.declarations) != null ? i : "", be.tokens || []], [nr, or] = [(u = Ee.declarations) != null ? u : "", Ee.tokens || []], [rr, ar] = [(d = bt.declarations) != null ? d : "", bt.tokens || []], [ir, sr] = [(c = Ce.declarations) != null ? c : "", Ce.tokens || []];
    y = this.transformCSS(e, vt, "light", "variable", h, o, r), _ = Yo;
    let lr = this.transformCSS(e, `${Qo}${Jo}`, "light", "variable", h, o, r), ur = this.transformCSS(e, `${er}`, "dark", "variable", h, o, r);
    v = `${lr}${ur}`, x = [.../* @__PURE__ */ new Set([...Zo, ...Xo, ...tr])];
    let dr = this.transformCSS(e, `${nr}${rr}color-scheme:light`, "light", "variable", h, o, r), cr = this.transformCSS(e, `${ir}color-scheme:dark`, "dark", "variable", h, o, r);
    $ = `${dr}${cr}`, P = [.../* @__PURE__ */ new Set([...or, ...ar, ...sr])], p = he(m.css, { dt: Ie });
  }
  return { primitive: { css: y, tokens: _ }, semantic: { css: v, tokens: x }, global: { css: $, tokens: P }, style: p };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: a, selector: s }) {
  var l, i, u;
  let d, c, m;
  if (ee(t) && n.transform !== "strict") {
    let h = e.replace("-directive", ""), y = t, { colorScheme: _, extend: v, css: x } = y, $ = Te(y, ["colorScheme", "extend", "css"]), P = v || {}, { colorScheme: p } = P, g = Te(P, ["colorScheme"]), T = _ || {}, { dark: j } = T, C = Te(T, ["dark"]), w = p || {}, { dark: E } = w, A = Te(w, ["dark"]), V = ee($) ? this._toVariables({ [h]: we(we({}, $), g) }, n) : {}, Y = ee(C) ? this._toVariables({ [h]: we(we({}, C), A) }, n) : {}, D = ee(j) ? this._toVariables({ [h]: we(we({}, j), E) }, n) : {}, [re, Ae] = [(l = V.declarations) != null ? l : "", V.tokens || []], [Pe, O] = [(i = Y.declarations) != null ? i : "", Y.tokens || []], [L, F] = [(u = D.declarations) != null ? u : "", D.tokens || []], H = this.transformCSS(h, `${re}${Pe}`, "light", "variable", n, r, a, s), te = this.transformCSS(h, L, "dark", "variable", n, r, a, s);
    d = `${H}${te}`, c = [.../* @__PURE__ */ new Set([...Ae, ...O, ...F])], m = he(x, { dt: Ie });
  }
  return { css: d, tokens: c, style: m };
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
  return r ? `@layer ${he(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: a }), l = Object.entries(o).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [u, d]) => {
    if ($e(d) && Object.hasOwn(d, "css")) {
      let c = Ge(d.css), m = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${m}" ${l}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: n, set: r, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(o).reduce((d, [c, m]) => d.push(`${c}="${m}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Ge(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let a = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Ze.test(this.value)) {
      let c = this.value.trim().replace(Ze, (m) => {
        var h;
        let y = m.slice(1, -1), _ = this.tokens[y];
        if (!_) return console.warn(`Token not found for path: ${y}`), "__UNRESOLVED__";
        let v = _.computed(l, i, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (h = v?.value) != null ? h : "__UNRESOLVED__";
      });
      d = vo.test(c.replace(go, "0")) ? `calc(${c})` : c;
    }
    return Ve(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let m = Ne(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${kn(d)}` : kn(d), h = u ? `${u}.${d}` : d;
      $e(c) ? s(c, m, h) : (r[m] || (r[m] = { paths: [], computed: (y, _ = {}, v = []) => {
        if (r[m].paths.length === 1) return r[m].paths[0].computed(r[m].paths[0].scheme, _.binding, v);
        if (y && y !== "none") for (let x = 0; x < r[m].paths.length; x++) {
          let $ = r[m].paths[x];
          if ($.scheme === y) return $.computed(y, _.binding, v);
        }
        return r[m].paths.map((x) => x.computed(x.scheme, _[x.scheme], v));
      } }), r[m].paths.push({ path: h, value: c, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: r }));
    });
  };
  return s(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((l) => l.split(".").filter((i) => !Ne(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(o = e[r]) == null ? void 0 : o.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Te(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? De(ee(t) ? `${e}${t},${e} ${t}` : e, o) : De(e, De(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, a, s, l) {
  if (ee(t)) {
    let { cssLayer: i } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: m }) => (ee(m) && (d += m.includes("[CSS]") ? m.replace("[CSS]", t) : this.getSelectorRule(m, l, c, t)), d), "") : De(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      $e(i) && (u.name = he(i.name, { name: e, type: o })), ee(u.name) && (t = De(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, J = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Vt(we({}, t), { options: we(we({}, this.defaults.options), t.options) }), this._tokens = ye.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), le.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Vt(we({}, this.theme), { preset: e }), this._tokens = ye.createTokens(e, this.defaults), this.clearLoadedStyleNames(), le.emit("preset:change", e), le.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Vt(we({}, this.theme), { options: e }), this.clearLoadedStyleNames(), le.emit("options:change", e), le.emit("theme:change", this.theme);
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
  return ye.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ye.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return ye.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return ye.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ye.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ye.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), le.emit(`theme:${t}:load`, e), !this._loadingStyles.size && le.emit("theme:load"));
} }, ue = {
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
}, ra = `
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
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function _n(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function $n(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _n(Object(n), !0).forEach(function(o) {
      aa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _n(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function aa(e, t, n) {
  return (t = ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ia(e) {
  var t = sa(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function sa(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function la(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  fn() && fn().components ? on(e) : t ? e() : Ye(e);
}
var ua = 0;
function da(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = M(!1), o = M(e), r = M(null), a = mo() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, m = t.name, h = m === void 0 ? "style_".concat(++ua) : m, y = t.id, _ = y === void 0 ? void 0 : y, v = t.media, x = v === void 0 ? void 0 : v, $ = t.nonce, P = $ === void 0 ? void 0 : $, p = t.first, g = p === void 0 ? !1 : p, T = t.onMounted, j = T === void 0 ? void 0 : T, C = t.onUpdated, w = C === void 0 ? void 0 : C, E = t.onLoad, A = E === void 0 ? void 0 : E, V = t.props, Y = V === void 0 ? {} : V, D = function() {
  }, re = function(O) {
    var L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var F = $n($n({}, Y), L), H = F.name || h, te = F.id || _, be = F.nonce || P;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(H, '"]')) || l.getElementById(te) || l.createElement("style"), r.value.isConnected || (o.value = O || e, $t(r.value, {
        type: "text/css",
        id: te,
        media: x,
        nonce: be
      }), g ? l.head.prepend(r.value) : l.head.appendChild(r.value), Hr(r.value, "data-primevue-style-id", H), $t(r.value, F), r.value.onload = function(Ee) {
        return A?.(Ee, {
          name: H
        });
      }, j?.(H)), !n.value && (D = ae(o, function(Ee) {
        r.value.textContent = Ee, w?.(H);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Ae = function() {
    !l || !n.value || (D(), Br(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && la(re), {
    id: _,
    name: h,
    el: r,
    css: o,
    unload: Ae,
    load: re,
    isLoaded: pr(n)
  };
}
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
var Sn, Pn, Cn, Tn;
function On(e, t) {
  return ma(e) || fa(e, t) || pa(e, t) || ca();
}
function ca() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pa(e, t) {
  if (e) {
    if (typeof e == "string") return An(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? An(e, t) : void 0;
  }
}
function An(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function fa(e, t) {
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
function ma(e) {
  if (Array.isArray(e)) return e;
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
function Ft(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(o) {
      ha(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ha(e, t, n) {
  return (t = ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ba(e) {
  var t = va(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function va(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function xt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ga = function(t) {
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
}, ya = {}, wa = {}, Z = {
  name: "base",
  css: ga,
  style: ra,
  classes: ya,
  inlineStyles: wa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, r = o(wt(Sn || (Sn = xt(["", ""])), t));
    return ee(r) ? da(Ge(r), Ft({
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
      return J.transformCSS(n.name || t.name, "".concat(r).concat(wt(Pn || (Pn = xt(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return J.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return J.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return J.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return J.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return J.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = he(this.css, {
        dt: Ie
      }) || "", r = Ge(wt(Cn || (Cn = xt(["", "", ""])), o, t)), a = Object.entries(n).reduce(function(s, l) {
        var i = On(l, 2), u = i[0], d = i[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return ee(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return J.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [J.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = wt(Tn || (Tn = xt(["", ""])), he(this.style, {
        dt: Ie
      })), s = Ge(J.transformCSS(r, a)), l = Object.entries(n).reduce(function(i, u) {
        var d = On(u, 2), c = d[0], m = d[1];
        return i.push("".concat(c, '="').concat(m, '"')) && i;
      }, []).join(" ");
      ee(s) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Ft(Ft({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Le = fo();
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
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
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(o) {
      xa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function xa(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = _a(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function _a(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $a = {
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
    text: [ue.STARTS_WITH, ue.CONTAINS, ue.NOT_CONTAINS, ue.ENDS_WITH, ue.EQUALS, ue.NOT_EQUALS],
    numeric: [ue.EQUALS, ue.NOT_EQUALS, ue.LESS_THAN, ue.LESS_THAN_OR_EQUAL_TO, ue.GREATER_THAN, ue.GREATER_THAN_OR_EQUAL_TO],
    date: [ue.DATE_IS, ue.DATE_IS_NOT, ue.DATE_BEFORE, ue.DATE_AFTER]
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
}, Sa = Symbol();
function Pa(e, t) {
  var n = {
    config: rn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Sa, n), Ca(), Ta(e, n), n;
}
var Me = [];
function Ca() {
  le.clear(), Me.forEach(function(e) {
    return e?.();
  }), Me = [];
}
function Ta(e, t) {
  var n = M(!1), o = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !J.isStyleNameLoaded("common")) {
      var d, c, m = ((d = Z.getCommonTheme) === null || d === void 0 ? void 0 : d.call(Z)) || {}, h = m.primitive, y = m.semantic, _ = m.global, v = m.style, x = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      Z.load(h?.css, kt({
        name: "primitive-variables"
      }, x)), Z.load(y?.css, kt({
        name: "semantic-variables"
      }, x)), Z.load(_?.css, kt({
        name: "global-variables"
      }, x)), Z.loadStyle(kt({
        name: "global-style"
      }, x), v), J.setLoadedStyleName("common");
    }
  };
  le.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var r = ae(t.config, function(i, u) {
    Le.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ae(function() {
    return t.config.ripple;
  }, function(i, u) {
    Le.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = ae(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || J.setTheme(i), t.config.unstyled || o(), n.value = !1, Le.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ae(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && o(), Le.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Me.push(r), Me.push(a), Me.push(s), Me.push(l);
}
var Oa = {
  install: function(t, n) {
    var o = Nr($a, n);
    Pa(t, o);
  }
}, ko = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = mo();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Aa(e, t, n, o, r, a) {
  return a.inline ? de(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (f(), K(ro, {
    key: 1,
    to: n.appendTo
  }, [de(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
ko.render = Aa;
var je = {
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
function Ea() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = jt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ln = Z.extend({
  name: "common"
});
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function ja(e) {
  return So(e) || La(e) || $o(e) || _o();
}
function La(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ue(e, t) {
  return So(e) || Na(e, t) || $o(e, t) || _o();
}
function _o() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $o(e, t) {
  if (e) {
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Na(e, t) {
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
function So(e) {
  if (Array.isArray(e)) return e;
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
function G(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(o) {
      He(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function He(e, t, n) {
  return (t = Ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ia(e) {
  var t = za(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function za(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qe = {
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
        le.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        le.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, o, r, a, s, l, i, u, d, c, m = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, h = m ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, y = m ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = y || h) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (a = r.onBeforeCreate) === null || a === void 0 || a.call(r);
    var _ = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, v = _ ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, x = _ ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = x || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Ea(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Mr(ht(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = G({
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
      return sn(t) ? t.apply(void 0, o) : U.apply(void 0, o);
    },
    _load: function() {
      je.isStyleNameLoaded("base") || (Z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), je.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !je.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ln.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), je.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      ee(t) && Z.load(t, G({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!J.isStyleNameLoaded("common")) {
          var o, r, a = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, s = a.primitive, l = a.semantic, i = a.global, u = a.style;
          Z.load(s?.css, G({
            name: "primitive-variables"
          }, this.$styleOptions)), Z.load(l?.css, G({
            name: "semantic-variables"
          }, this.$styleOptions)), Z.load(i?.css, G({
            name: "global-variables"
          }, this.$styleOptions)), Z.loadStyle(G({
            name: "global-style"
          }, this.$styleOptions), u), J.setLoadedStyleName("common");
        }
        if (!J.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, m, h, y = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, _ = y.css, v = y.style;
          (m = this.$style) === null || m === void 0 || m.load(_, G({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (h = this.$style) === null || h === void 0 || h.loadStyle(G({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), J.setLoadedStyleName(this.$style.name);
        }
        if (!J.isStyleNameLoaded("layer-order")) {
          var x, $, P = (x = this.$style) === null || x === void 0 || ($ = x.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(x);
          Z.load(P, G({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), J.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, a = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, G({
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
      je.clearLoadedStyleNames(), le.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      le.off("theme:change", this._loadCoreStyles), le.off("theme:change", this._load), le.off("theme:change", this._themeScopedListener);
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
      return un(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!r[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = a ? s ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, h = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, G(G({}, r), {}, {
        global: m || {}
      })), y = this._getPTDatasets(o);
      return u || !u && h ? c ? this._mergeProps(c, m, h, y) : G(G(G({}, m), h), y) : G(G({}, h), y);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return U(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", a = o === "root" && ee((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && G(G({}, o === "root" && G(G(He({}, "".concat(r, "name"), _e(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && He({}, "".concat(r, "extend"), _e(this.$.type.name))), {}, He({}, "".concat(this.$attrSelector), ""))), {}, He({}, "".concat(r, "section"), _e(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return me(t) || co(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, c = _e(o), m = _e(n.$name);
        return (i = u ? c !== m ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var a = function(_) {
        return n(_, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, m = a(t.originalValue), h = a(t.value);
        return m === void 0 && h === void 0 ? void 0 : me(h) ? h : me(m) ? m : u || !u && h ? c ? this._mergeProps(c, m, h) : G(G({}, m), h) : h;
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
      return this._getPTValue(this.pt, t, G(G({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = U(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, G({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, G(G({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, G(G({}, this.$params), o)), a = this._getOptionValue(Ln.inlineStyles, t, G(G({}, this.$params), o));
        return [a, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return he(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, G({}, n.$params)) || he(o, G({}, n.$params));
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
        var r = Ue(o, 1), a = r[0];
        return n?.includes(a);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return G(G({
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
        var n = Ue(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = Ue(n, 2), r = o[0], a = o[1], s = r.split(":"), l = ja(s), i = qt(l).slice(1);
        return i?.reduce(function(u, d, c, m) {
          return !u[d] && (u[d] = c === m.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ue(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = Ue(n, 2), r = o[0], a = o[1];
        return t[r] = a, t;
      }, {});
    }
  }
}, Ra = `
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
`, Va = Z.extend({
  name: "baseicon",
  css: Ra
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function In(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function zn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? In(Object(n), !0).forEach(function(o) {
      Fa(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Fa(e, t, n) {
  return (t = Ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ba(e) {
  var t = Da(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Da(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Nt = {
  name: "BaseIcon",
  extends: qe,
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
  style: Va,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ve(this.label);
      return zn(zn({}, !this.isUnstyled && {
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
function Rn(e, t) {
  return Wa(e) || Ua(e, t) || qa(e, t) || Ma();
}
function Ma() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qa(e, t) {
  if (e) {
    if (typeof e == "string") return Vn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Vn(e, t) : void 0;
  }
}
function Vn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ua(e, t) {
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
function Wa(e) {
  if (Array.isArray(e)) return e;
}
function Fn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Q(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Fn(Object(n), !0).forEach(function(o) {
      Ut(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ut(e, t, n) {
  return (t = Ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ha(e) {
  var t = Ka(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ka(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var q = {
  _getMeta: function() {
    return [$e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], he($e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, a;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: un,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var $ = q._getOptionValue.apply(q, arguments);
      return me($) || co($) ? {
        class: $
      } : $;
    }, u = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, m = u.mergeProps, h = m === void 0 ? !1 : m, y = l ? q._useDefaultPT(o, o.defaultPT(), i, a, s) : void 0, _ = q._usePT(o, q._getPT(r, o.$name), i, a, Q(Q({}, s), {}, {
      global: y || {}
    })), v = q._getPTDatasets(o, a);
    return c || !c && _ ? h ? q._mergeProps(o, h, y, _, v) : Q(Q(Q({}, y), _), v) : Q(Q({}, _), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return Q(Q({}, n === "root" && Ut({}, "".concat(o, "name"), _e(t.$name))), {}, Ut({}, "".concat(o, "section"), _e(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var l, i = o ? o(s) : s, u = _e(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(v) {
      return o(v, r, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, m = c === void 0 ? !1 : c, h = s(n.originalValue), y = s(n.value);
      return h === void 0 && y === void 0 ? void 0 : me(y) ? y : me(h) ? h : d || !d && y ? m ? q._mergeProps(t, m, h, y) : Q(Q({}, h), y) : y;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return q._usePT(t, n, o, r, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, a = q._getConfig(o, r), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    q._loadCoreStyles(n, s), q._loadThemeStyles(n, s), q._loadScopedThemeStyles(n, s), q._removeThemeListeners(n), n.$loadStyles = function() {
      return q._loadThemeStyles(n, s);
    }, q._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!je.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var a;
      Z.loadCSS(r), (a = o.$style) === null || a === void 0 || a.loadCSS(r), je.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!J.isStyleNameLoaded("common")) {
        var s, l, i = ((s = r.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = i.primitive, d = i.semantic, c = i.global, m = i.style;
        Z.load(u?.css, Q({
          name: "primitive-variables"
        }, a)), Z.load(d?.css, Q({
          name: "semantic-variables"
        }, a)), Z.load(c?.css, Q({
          name: "global-variables"
        }, a)), Z.loadStyle(Q({
          name: "global-style"
        }, a), m), J.setLoadedStyleName("common");
      }
      if (!J.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var h, y, _, v, x = ((h = r.$style) === null || h === void 0 || (y = h.getDirectiveTheme) === null || y === void 0 ? void 0 : y.call(h)) || {}, $ = x.css, P = x.style;
        (_ = r.$style) === null || _ === void 0 || _.load($, Q({
          name: "".concat(r.$style.name, "-variables")
        }, a)), (v = r.$style) === null || v === void 0 || v.loadStyle(Q({
          name: "".concat(r.$style.name, "-style")
        }, a), P), J.setLoadedStyleName(r.$style.name);
      }
      if (!J.isStyleNameLoaded("layer-order")) {
        var p, g, T = (p = r.$style) === null || p === void 0 || (g = p.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(p);
        Z.load(T, Q({
          name: "layer-order",
          first: !0
        }, a)), J.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, a, s, l = ((r = t.$style) === null || r === void 0 || (a = r.getPresetTheme) === null || a === void 0 ? void 0 : a.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, Q({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    je.clearLoadedStyleNames(), le.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    le.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, a, s) {
    var l, i, u = "on".concat(Ir(n)), d = q._getConfig(r, a), c = o?.$instance, m = q._usePT(c, q._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, t), q._getOptionValue, "hooks.".concat(u)), h = q._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], q._getOptionValue, "hooks.".concat(u)), y = {
      el: o,
      binding: r,
      vnode: a,
      prevVnode: s
    };
    m?.(c, y), h?.(c, y);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return sn(t) ? t.apply(void 0, o) : U.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(l, i, u, d, c) {
      var m, h, y, _;
      i._$instances = i._$instances || {};
      var v = q._getConfig(u, d), x = i._$instances[t] || {}, $ = Ve(x) ? Q(Q({}, n), n?.methods) : {};
      i._$instances[t] = Q(Q({}, x), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: x.$el || i || void 0,
        $style: Q({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: v,
        $attrSelector: (m = i.$pd) === null || m === void 0 || (m = m[t]) === null || m === void 0 ? void 0 : m.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return q._getPT(v?.pt, void 0, function(p) {
            var g;
            return p == null || (g = p.directives) === null || g === void 0 ? void 0 : g[t];
          });
        },
        isUnstyled: function() {
          var p, g;
          return ((p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.unstyled) !== void 0 ? (g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : v?.unstyled;
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
          var p, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return q._getPTValue(i._$instances[t], (p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.pt, g, Q({}, T));
        },
        ptmo: function() {
          var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", T = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return q._getPTValue(i._$instances[t], p, g, T, !1);
        },
        cx: function() {
          var p, g, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", j = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (p = i._$instances[t]) !== null && p !== void 0 && p.isUnstyled() ? void 0 : q._getOptionValue((g = i._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, T, Q({}, j));
        },
        sx: function() {
          var p, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, j = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T ? q._getOptionValue((p = i._$instances[t]) === null || p === void 0 || (p = p.$style) === null || p === void 0 ? void 0 : p.inlineStyles, g, Q({}, j)) : void 0;
        }
      }, $), i.$instance = i._$instances[t], (h = (y = i.$instance)[l]) === null || h === void 0 || h.call(y, i, u, d, c), i["$".concat(t)] = i.$instance, q._hook(t, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = Q(Q({}, (_ = i.$pd) === null || _ === void 0 ? void 0 : _[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, r = function(l) {
      var i, u, d, c = l._$instances[t], m = c?.watch, h = function(v) {
        var x, $ = v.newValue, P = v.oldValue;
        return m == null || (x = m.config) === null || x === void 0 ? void 0 : x.call(c, $, P);
      }, y = function(v) {
        var x, $ = v.newValue, P = v.oldValue;
        return m == null || (x = m["config.ripple"]) === null || x === void 0 ? void 0 : x.call(c, $, P);
      };
      c.$watchersCallback = {
        config: h,
        "config.ripple": y
      }, m == null || (i = m.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Le.on("config:change", h), m == null || (u = m["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Le.on("config:ripple:change", y);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Le.off("config:change", i.config), Le.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Kr("pd")
        }, o("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("beforeMount", l, i, u, d), r(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        o("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), o("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        a(l), q._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var t = q._getMeta.apply(q, arguments), n = Rn(t, 2), o = n[0], r = n[1];
    return Q({
      extend: function() {
        var s = q._getMeta.apply(q, arguments), l = Rn(s, 2), i = l[0], u = l[1];
        return q.extend(i, Q(Q(Q({}, r), r?.methods), u));
      }
    }, q._extend(o, r));
  }
}, Ga = `
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
`, Ya = {
  root: "p-ink"
}, Qa = Z.extend({
  name: "ripple-directive",
  style: Ga,
  classes: Ya
}), Za = q.extend({
  style: Qa
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Ja(e) {
  return ni(e) || ti(e) || ei(e) || Xa();
}
function Xa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ei(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function ti(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ni(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Bn(e, t, n) {
  return (t = oi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oi(e) {
  var t = ri(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function ri(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (rt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Po = Za.extend("ripple", {
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
      n || (n = Dr("span", Bn(Bn({
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
        if (!this.isUnstyled() && Rt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !yn(r) && !wn(r)) {
          var a = Math.max(Vr(o), Wr(o));
          r.style.height = a + "px", r.style.width = a + "px";
        }
        var s = Ur(o), l = t.pageX - s.left + document.body.scrollTop - wn(r) / 2, i = t.pageY - s.top + document.body.scrollLeft - yn(r) / 2;
        r.style.top = i + "px", r.style.left = l + "px", !this.isUnstyled() && Rr(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Rt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Rt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ja(t.children).find(function(n) {
        return qr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ai = "data-wippy-overlay-layer";
function Co() {
  return typeof window < "u" && typeof window.document < "u";
}
function To() {
  return Co() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ii() {
  return To() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const si = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let li = 0;
const Pt = /* @__PURE__ */ new WeakMap();
function Dn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function ui(e, t) {
  if (!si.test(e.className))
    return;
  const n = e.style.cssText;
  Dn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Pt.has(e)) {
    const o = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Dn(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Pt.set(e, o);
  }
}
function dn(e) {
  const t = Pt.get(e);
  t && (t.disconnect(), Pt.delete(e));
}
function di(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ht(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ct = /* @__PURE__ */ new Set(), cn = /* @__PURE__ */ new WeakMap();
let Mn = !1, Kt = !1;
function ci() {
  Kt = !1;
  for (const e of Ct) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && dn(t);
      Ct.delete(e), cn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ht(e);
  }
}
function qn() {
  Kt || (Kt = !0, requestAnimationFrame(ci));
}
function pi(e) {
  const t = document.createElement("div");
  t.setAttribute(ai, "");
  const n = To();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ht(t);
  const o = new MutationObserver((r) => {
    const a = t.__wippyAnchorName;
    for (const s of r) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && ui(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && dn(l);
    }
    t.isConnected && t.childElementCount > 0 && Ht(t);
  });
  return o.observe(t, { childList: !0 }), cn.set(t, o), Ct.add(t), Mn || (Mn = !0, window.addEventListener("scroll", qn, { capture: !0, passive: !0 }), window.addEventListener("resize", qn, { passive: !0 })), t;
}
function Un(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = pi(e.hostRoot), ii())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++li}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Wn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && dn(t);
    Ct.delete(e.layer), cn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Hn = !1;
function fi() {
  if (Hn)
    return;
  Hn = !0;
  const e = ko;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Co() && (this.hostRoot = di(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Un(this), this.$watch("inline", (t) => {
      t ? Wn(this) : Un(this);
    })));
  }, e.render = function() {
    return this.inline ? de(this.$slots, "default", { key: 0 }) : this.mounted ? fr(ro, { key: 1, to: this.resolvedTarget || document.body }, [
      de(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    Wn(this);
  };
}
const mi = {
  install: (e) => {
    fi(), e.use(Oa, { theme: "none" });
  }
};
var Gt = "data-wippy-visible";
function Kn(e) {
  const t = e.getAttribute(Gt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var hi = Object.defineProperty, bi = (e, t, n) => t in e ? hi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ne = (e, t, n) => bi(e, typeof t != "symbol" ? t + "" : t, n), vi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], gi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Gn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function yi(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [s, l] of Object.entries(r)) {
            const i = typeof l == "string" ? Gn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof r == "string" ? Gn(o) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function wi(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${gi} {
${t}
}`;
}
function xi(e, t) {
  const n = wi(t);
  n && Oo(e, n, "@wippy-fe/css-variables-bridge");
}
function ki(e, t) {
  const o = (t ?? vi).map(async (r) => {
    const a = wr[r];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await xr(a);
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
function _i(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Oo(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = t, e.appendChild(o);
}
function $i(e, t) {
  Oo(e, t, "@wippy-fe/custom-css");
}
function Ao(e) {
  return e.__wippyHost ?? null;
}
function Si(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Pi(e, t, n) {
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
function Bt(e, t) {
  const n = {}, o = [];
  for (const [r, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(r), l = Si(r);
    if (s === null) {
      a.default !== void 0 && (n[l] = a.default);
      continue;
    }
    const i = Pi(r, s, a);
    i.error ? o.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: o };
}
var Ci = class {
  constructor(e, t) {
    ne(this, "_props"), ne(this, "_errors"), ne(this, "_content"), ne(this, "_hostVisibility"), ne(this, "_propsListeners", /* @__PURE__ */ new Set()), ne(this, "_contentListeners", /* @__PURE__ */ new Set()), ne(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), ne(this, "_disposed", !1), ne(this, "_emitToDom"), ne(this, "props"), ne(this, "events"), ne(this, "content"), ne(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Ti = class extends HTMLElement {
  constructor() {
    super(), ne(this, "_internals"), ne(this, "_contentObserver", null), ne(this, "_initialized", !1), ne(this, "_container", null), ne(this, "_reactive", null), ne(this, "_lastProps", null), ne(this, "_lastErrors", []), ne(this, "_lastContent", null), ne(this, "_themeUnsub", null), ne(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Kn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Gt])];
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
    return Ao(this);
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
        const a = Bt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, o = a.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new Ci(
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
        this.onInit(n), e.inlineCss && _i(n, e.inlineCss);
        try {
          const u = mn?.theming, d = yi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          xi(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = mn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && $i(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && ki(n, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && o.classList.add(...i), n.appendChild(o), this._container = o, gr(vr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Be("@theme", (i) => this._applyTheme(i)));
      const { props: r, errors: a } = Bt(this, e.propsSchema);
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
  _applyTheme(e = yr.getThemeMode?.()) {
    gt(e, this), this._container && gt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), gt("auto", this), this._container && gt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Gt) {
      const l = this._hostVisible, i = Kn(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: a } = Bt(this, o.propsSchema);
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
function Oi(e) {
  return e.__wippyHostBus ?? null;
}
function Ai(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Ei = Object.defineProperty, ji = (e, t, n) => t in e ? Ei(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Fe = (e, t, n) => ji(e, typeof t != "symbol" ? t + "" : t, n), Eo = /* @__PURE__ */ Symbol("wippy:emit"), jo = /* @__PURE__ */ Symbol("wippy:props"), Lo = /* @__PURE__ */ Symbol("wippy:props_error"), Li = /* @__PURE__ */ Symbol("wippy:content"), Ni = /* @__PURE__ */ Symbol("wippy:panel-id"), Ii = /* @__PURE__ */ Symbol("wippy:layout-bus"), zi = /* @__PURE__ */ Symbol("wippy:host"), Ri = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Vi() {
  const e = mt(jo);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Fi() {
  const e = mt(Eo);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Bi() {
  const e = mt(Lo);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Di = class extends Ti {
  constructor() {
    super(...arguments), Fe(this, "_vueApp", null), Fe(this, "_propsRef", M({})), Fe(this, "_errorsRef", M([])), Fe(this, "_contentRef", M(null)), Fe(this, "_hostVisibilityRef", M(null)), Fe(this, "_bridgeAbort", null);
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
      const d = _r(), c = mr(u.rootComponent);
      this._vueApp = c;
      const m = $r();
      if (u.piniaPlugins)
        for (const h of u.piniaPlugins)
          m.use(h);
      if (c.use(m), u.plugins)
        for (const h of u.plugins)
          c.use(h);
      c.provide(jo, this._propsRef), c.provide(Lo, this._errorsRef), c.provide(Eo, this.emitEvent.bind(this)), c.provide(Li, this._contentRef), c.provide(Ri, this._hostVisibilityRef), c.provide(Ni, Ai(this)), c.provide(Ii, Oi(this)), c.provide(zi, Ao(this)), u.providers && u.providers(c, this), c.mount(t), d && Sr(d);
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
        const c = d instanceof Error ? d.message : String(d), m = document.createElement("wippy-error");
        m.setAttribute("title", "Failed to load"), m.setAttribute("message", c), u.replaceWith(m), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Mi = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead.' }, definition: { type: "object", default: null, description: 'Immutable form definition: `title`, optional `description`, optional `submit_label`, optional `answered_message` (not displayed), and `fields` (each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`). When every field is `type: "choice"` the question-card UI renders; otherwise the radio/checkbox fields form renders.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' }, density: { type: "string", default: "compact", description: 'Question-card sizing: "compact" (default) or "comfortable", a larger size/spacing scale. Read purely through the `:host([density="comfortable"])` CSS selector — no JS reads it — but must be a declared prop so the package-tag mount path can set it as an attribute.' } } } }, qi = {
  wippy: Mi
};
var No = {
  name: "SpinnerIcon",
  extends: Nt
};
function Ui(e) {
  return Gi(e) || Ki(e) || Hi(e) || Wi();
}
function Wi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hi(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function Ki(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gi(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Yi(e, t, n, o, r, a) {
  return f(), b("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ui(t[0] || (t[0] = [N("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
No.render = Yi;
var Qi = `
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
`, Zi = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ee(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ve(n.value) && !o.$slots.default,
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
}, Ji = Z.extend({
  name: "badge",
  style: Qi,
  classes: Zi
}), Xi = {
  name: "BaseBadge",
  extends: qe,
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
  style: Ji,
  provide: function() {
    return {
      $pcBadge: this,
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
function Yn(e, t, n) {
  return (t = es(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function es(e) {
  var t = ts(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function ts(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (at(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Io = {
  name: "Badge",
  extends: Xi,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Se(Yn(Yn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ns = ["data-p"];
function os(e, t, n, o, r, a) {
  return f(), b("span", U({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [de(e.$slots, "default", {}, function() {
    return [ie(B(e.value), 1)];
  })], 16, ns);
}
Io.render = os;
var rs = `
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
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function ke(e, t, n) {
  return (t = as(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function as(e) {
  var t = is(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function is(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ss = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", ke(ke(ke(ke(ke(ke(ke(ke(ke({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ke({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ls = Z.extend({
  name: "button",
  style: rs,
  classes: ss
}), us = {
  name: "BaseButton",
  extends: qe,
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
  style: ls,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
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
function pe(e, t, n) {
  return (t = ds(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ds(e) {
  var t = cs(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function cs(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ge = {
  name: "Button",
  extends: us,
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
      return U(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ve(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Se(pe(pe(pe(pe(pe(pe(pe(pe(pe(pe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Se(pe(pe({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Se(pe(pe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: No,
    Badge: Io
  },
  directives: {
    ripple: Po
  }
}, ps = ["data-p"], fs = ["data-p"];
function ms(e, t, n, o, r, a) {
  var s = Qe("SpinnerIcon"), l = Qe("Badge"), i = ao("ripple");
  return e.asChild ? de(e.$slots, "default", {
    key: 1,
    class: I(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : io((f(), K(so(e.as), U({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: oe(function() {
      return [de(e.$slots, "default", {}, function() {
        return [e.loading ? de(e.$slots, "loadingicon", U({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), b("span", U({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), K(s, U({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : de(e.$slots, "icon", U({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), b("span", U({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, ps)) : z("", !0)];
        }), e.label ? (f(), b("span", U({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), B(e.label), 17, fs)) : z("", !0), e.badge ? (f(), K(l, {
          key: 3,
          value: e.badge,
          class: I(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : z("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
ge.render = ms;
var zo = {
  name: "TimesIcon",
  extends: Nt
};
function hs(e) {
  return ys(e) || gs(e) || vs(e) || bs();
}
function bs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vs(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function gs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ys(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ws(e, t, n, o, r, a) {
  return f(), b("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), hs(t[0] || (t[0] = [N("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
zo.render = ws;
var xs = `
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
`, ks = {
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
}, _s = Z.extend({
  name: "message",
  style: xs,
  classes: ks
}), $s = {
  name: "BaseMessage",
  extends: qe,
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
  style: _s,
  provide: function() {
    return {
      $pcMessage: this,
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
function Qn(e, t, n) {
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = Ps(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Ps(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var xe = {
  name: "Message",
  extends: $s,
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
      return Se(Qn(Qn({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Po
  },
  components: {
    TimesIcon: zo
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
function Zn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Jn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Zn(Object(n), !0).forEach(function(o) {
      Cs(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Zn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Cs(e, t, n) {
  return (t = Ts(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ts(e) {
  var t = Os(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Os(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ut(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var As = ["data-p"], Es = ["data-p"], js = ["data-p"], Ls = ["aria-label", "data-p"], Ns = ["data-p"];
function Is(e, t, n, o, r, a) {
  var s = Qe("TimesIcon"), l = ao("ripple");
  return f(), K(hr, U({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: oe(function() {
      return [r.visible ? (f(), b("div", U({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [N("div", U({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? de(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (f(), b("div", U({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [de(e.$slots, "icon", {
        class: I(e.cx("icon"))
      }, function() {
        return [(f(), K(so(e.icon ? "span" : null), U({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (f(), b("div", U({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [de(e.$slots, "default")], 16, js)) : z("", !0), e.closable ? io((f(), b("button", U({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, Jn(Jn({}, e.closeButtonProps), e.ptm("closeButton"))), [de(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (f(), b("i", U({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, Ns)) : (f(), K(s, U({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ls)), [[l]]) : z("", !0)], 16, Es))], 16)], 16, As)) : z("", !0)];
    }),
    _: 3
  }, 16);
}
xe.render = Is;
const zs = () => Vi(), Rs = () => Fi(), Vs = Bi, Fs = 2e3;
function Bs() {
  const e = an.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Ds(e, t) {
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
      !l || l.artifact_id !== s || l.delivery !== "pending" || o.has(s) || (o.add(s), Bs()?.send({ type: "session_open", session_id: l.session_id }));
    }, Fs);
  }, { immediate: !0 }), Lt(r);
}
const Ms = 5e3;
function qs(e, t) {
  const n = M("idle"), o = M(null), r = M(null), a = M(null);
  let s = 0, l = null, i = null, u = null, d = null;
  function c() {
    return an.artifactState;
  }
  let m = null, h = !1;
  function y() {
    h || m || (h = !0, m = setTimeout(() => {
      m = null, v();
    }, Ms));
  }
  async function _() {
    const C = c();
    if (typeof C != "function") {
      n.value = "unsupported", r.value = "This form needs a newer Web Host.";
      return;
    }
    const w = e.value;
    if (!w) {
      n.value = "idle", o.value = null, a.value = null;
      return;
    }
    const E = ++s, A = o.value === null;
    A && (n.value = "loading");
    try {
      const V = await C(w).get();
      if (E !== s)
        return;
      o.value = V, n.value = "loaded", r.value = null, a.value = null, h = !1;
    } catch (V) {
      if (E !== s)
        return;
      const Y = V instanceof Error ? V.message : "Could not load this form.";
      A ? (n.value = "error", r.value = Y) : (a.value = Y, y());
    }
  }
  function v() {
    return l ? (i || (i = l.then(() => (i = null, v()))), i) : (l = _().finally(() => {
      l = null;
    }), l);
  }
  function x(C) {
    d !== C && (u?.(), u = null, d = C, C && (u = Be(`artifact:${C}`, () => {
      v();
    })));
  }
  ae(e, (C) => {
    s++, o.value = null, a.value = null, x(C), v();
  }, { immediate: !0 }), ae(t, () => {
    v();
  });
  const $ = S(() => {
    const C = o.value;
    return C?.session_id && (C.status === "active" && !C.stale || C.status === "idle" && C.delivery && C.delivery !== "complete") ? C.session_id : null;
  });
  let P = null, p = null;
  ae($, (C) => {
    P?.(), P = null, p?.(), p = null, C && (P = Be(`session:${C}:message:*`, (w) => {
      w.data?.type !== "chunk" && v();
    }), p = Be(`session:${C}`, () => {
      v();
    }));
  }, { immediate: !0 });
  const g = Be("@visibility", (C) => {
    C && v();
  }), T = Be("@reconnect", () => {
    v();
  });
  Lt(() => {
    s++, m && clearTimeout(m), m = null, u?.(), u = null, P?.(), P = null, p?.(), p = null, g(), T();
  });
  async function j() {
    return await v(), o.value;
  }
  return { status: n, state: o, errorMessage: r, reloadError: a, reload: () => {
    v();
  }, refresh: j };
}
function Us() {
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
const Ws = Symbol.for("wippy.artifactStateError");
function Ro(e) {
  return typeof e == "object" && e !== null && e[Ws] === !0;
}
function Hs(e) {
  return Ro(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Xn(e) {
  return !Ro(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function eo(e) {
  const t = Hs(e);
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
    return n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? "Could not submit this form.", retryable: !0, uncertain: !1, shouldReload: !1 };
}
const Ks = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function Gs(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Ys(e) {
  return JSON.stringify(e);
}
function Qs(e) {
  const t = M(!1), n = M(null), o = M(null);
  let r = 0;
  ae(e, () => {
    r++, s();
  });
  function a(u) {
    const d = Ys(u);
    if (n.value && o.value === d)
      return n.value;
    const c = Us();
    return n.value = c, o.value = d, c;
  }
  function s() {
    n.value = null, o.value = null;
  }
  function l() {
    return an.artifactState;
  }
  async function i(u, d, c) {
    const m = e.value;
    if (!m)
      return { ok: !1, message: "This form cannot be submitted here." };
    const h = l();
    if (typeof h != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const y = r, _ = a(c), v = {
      form_version: u,
      request_id: _,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let x;
      try {
        x = await h(m).submit(v);
      } catch ($) {
        if (y !== r)
          return { ok: !1, ignored: !0 };
        const P = Xn($);
        if (P)
          return { ok: !1, fieldErrors: P.errors, formErrors: P.formErrors };
        const p = eo($);
        if (!p.uncertain)
          return { ok: !1, message: p.message, code: p.code, retryable: p.retryable, shouldReload: p.shouldReload };
        if (await Gs(800), y !== r)
          return { ok: !1, ignored: !0 };
        try {
          x = await h(m).submit(v);
        } catch (g) {
          if (y !== r)
            return { ok: !1, ignored: !0 };
          const T = Xn(g);
          if (T)
            return { ok: !1, fieldErrors: T.errors, formErrors: T.formErrors };
          const j = eo(g), C = j.uncertain ? Ks : j.message, w = j.uncertain ? !0 : j.retryable;
          return { ok: !1, message: C, code: j.code, retryable: w, shouldReload: j.shouldReload };
        }
      }
      return y !== r ? { ok: !1, ignored: !0 } : (s(), { ok: !0, accepted: x });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: s };
}
const pn = Symbol("wippy-form:element"), _t = "data-wippy-artifact-id";
function Zs() {
  const e = mt(pn), t = M(e?.getAttribute(_t) ?? null);
  if (e) {
    let n = null;
    on(() => {
      t.value = e.getAttribute(_t), n = new MutationObserver(() => {
        t.value = e.getAttribute(_t);
      }), n.observe(e, { attributes: !0, attributeFilter: [_t] });
    }), Lt(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Js(e, t) {
  const n = mt(pn);
  n && br(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function Xs(e) {
  const t = M(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function o() {
    t.value = !1;
  }
  return on(() => {
    window.addEventListener("online", n), window.addEventListener("offline", o);
  }), Lt(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", o);
  }), { isOnline: t };
}
function Tt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function ze(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function to(e) {
  return typeof e == "string" ? e : ze(e) ? e.value : null;
}
function el(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => to(n) === t) : to(e) === t;
}
function Ke(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Tt);
    return t ? t.other : "";
  }
  return Tt(e) ? e.other : "";
}
function Vo(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Tt) : Tt(e);
}
function tl(e, t) {
  if (e === void 0)
    return "";
  const o = (Array.isArray(e) ? e : [e]).find((r) => ze(r) && r.value === t);
  return o && ze(o) ? o.note : "";
}
const nl = 2e3, ol = 1e3;
function Re(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Fo(e) {
  return Array.from(e).length;
}
function Bo(e) {
  return Fo(se(e)) > nl;
}
function rl(e) {
  return Fo(se(e)) > ol;
}
function se(e) {
  return e.trim();
}
function Zt(e) {
  return se(e);
}
function al(e) {
  return se(e);
}
function Ot(e, t) {
  const n = al(t);
  return n ? { value: e, note: n } : e;
}
function Do(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], o = e.options.map((i) => i.value), r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
    for (const i of n)
      typeof i == "string" && o.includes(i) ? a.add(i) : ze(i) && o.includes(i.value) && (a.add(i.value), r.set(i.value, i));
    const s = o.filter((i) => a.has(i)).map((i) => {
      const u = r.get(i);
      return u ? Ot(i, u.note) : i;
    }), l = n.find(Re);
    if (l) {
      const i = Zt(l.other);
      i.length > 0 && s.push({ other: i });
    }
    return s.length > 0 ? s : void 0;
  }
  if (t !== void 0) {
    if (Re(t)) {
      const n = Zt(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (ze(t) && e.options.some((n) => n.value === t.value))
      return Ot(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function il(e, t) {
  const n = {};
  for (const o of e.fields) {
    const r = Do(o, t[o.id]);
    r !== void 0 && (n[o.id] = r);
  }
  return n;
}
function sl(e, t) {
  const n = [];
  for (const o of e.fields)
    o.required && Do(o, t[o.id]) === void 0 && n.push(o.id);
  return n;
}
function ll(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(Re) : void 0 : Re(t) ? t : void 0;
}
function ul(e, t) {
  const n = [];
  for (const o of e.fields) {
    const r = ll(o, t[o.id]);
    r && Zt(r.other).length === 0 && n.push(o.id);
  }
  return n;
}
function dl(e, t) {
  const n = [];
  for (const o of e.fields) {
    const r = t[o.id];
    let a;
    if (o.multiple) {
      if (Array.isArray(r)) {
        const s = r.find(Re);
        s && (a = s.other);
      }
    } else Re(r) && (a = r.other);
    a !== void 0 && Bo(a) && n.push(o.id);
  }
  return n;
}
function Mo(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], o = [];
  for (const a of e.options) {
    const s = n.find((l) => typeof l == "string" ? l === a.value : ze(l) && l.value === a.value);
    s && o.push({ label: a.label, note: ze(s) ? s.note : void 0 });
  }
  const r = n.find(Re);
  return r && o.push({ label: r.other, own: !0 }), o.length > 0 ? o : null;
}
function cl(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const o of e.fields) {
    const r = t[o.id];
    r !== void 0 && (n[o.id] = o.multiple ? Array.isArray(r) ? [...r] : [r] : r);
  }
  return n;
}
var qo = {
  name: "CheckIcon",
  extends: Nt
};
function pl(e) {
  return bl(e) || hl(e) || ml(e) || fl();
}
function fl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ml(e, t) {
  if (e) {
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function hl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function bl(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function vl(e, t, n, o, r, a) {
  return f(), b("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), pl(t[0] || (t[0] = [N("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qo.render = vl;
var Uo = {
  name: "MinusIcon",
  extends: Nt
};
function gl(e) {
  return kl(e) || xl(e) || wl(e) || yl();
}
function yl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wl(e, t) {
  if (e) {
    if (typeof e == "string") return Xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xt(e, t) : void 0;
  }
}
function xl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function kl(e) {
  if (Array.isArray(e)) return Xt(e);
}
function Xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function _l(e, t, n, o, r, a) {
  return f(), b("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), gl(t[0] || (t[0] = [N("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Uo.render = _l;
var $l = {
  name: "BaseEditableHolder",
  extends: qe,
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
      return n.find(ee);
    }
  },
  computed: {
    $filled: function() {
      return ee(this.d_value);
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
}, It = {
  name: "BaseInput",
  extends: $l,
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
}, Sl = `
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
`, Pl = {
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
}, Cl = Z.extend({
  name: "checkbox",
  style: Sl,
  classes: Pl
}), Tl = {
  name: "BaseCheckbox",
  extends: It,
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
  style: Cl,
  provide: function() {
    return {
      $pcCheckbox: this,
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
function Ol(e, t, n) {
  return (t = Al(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Al(e) {
  var t = El(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function El(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function jl(e) {
  return zl(e) || Il(e) || Nl(e) || Ll();
}
function Ll() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nl(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function Il(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zl(e) {
  if (Array.isArray(e)) return en(e);
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var At = {
  name: "Checkbox",
  extends: Tl,
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
          return !ln(a, n.value);
        }) : r = o ? [].concat(jl(o), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(r, t) : this.writeValue(r, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Er(this.value, t);
    },
    dataP: function() {
      return Se(Ol({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: qo,
    MinusIcon: Uo
  }
}, Rl = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Vl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Fl = ["data-p"];
function Bl(e, t, n, o, r, a) {
  var s = Qe("CheckIcon"), l = Qe("MinusIcon");
  return f(), b("div", U({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": r.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [N("input", U({
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
  }, a.getPTOptions("input")), null, 16, Vl), N("div", U({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [de(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: r.d_indeterminate,
    class: I(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (f(), K(s, U({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : r.d_indeterminate ? (f(), K(l, U({
      key: 1,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : z("", !0)];
  })], 16, Fl)], 16, Rl);
}
At.render = Bl;
var Dl = `
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
`, Ml = {
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
}, ql = Z.extend({
  name: "inputtext",
  style: Dl,
  classes: Ml
}), Ul = {
  name: "BaseInputText",
  extends: It,
  style: ql,
  provide: function() {
    return {
      $pcInputText: this,
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
function Wl(e, t, n) {
  return (t = Hl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hl(e) {
  var t = Kl(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Kl(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var tn = {
  name: "InputText",
  extends: Ul,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return U(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Se(Wl({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Gl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Yl(e, t, n, o, r, a) {
  return f(), b("input", U({
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
  }, a.attrs), null, 16, Gl);
}
tn.render = Yl;
var Ql = `
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
`, Zl = {
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
}, Jl = Z.extend({
  name: "radiobutton",
  style: Ql,
  classes: Zl
}), Xl = {
  name: "BaseRadioButton",
  extends: It,
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
  style: Jl,
  provide: function() {
    return {
      $pcRadioButton: this,
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
function eu(e, t, n) {
  return (t = tu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function tu(e) {
  var t = nu(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function nu(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (pt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var nn = {
  name: "RadioButton",
  extends: Xl,
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
      return t != null && (this.binary ? !!t : ln(t, this.value));
    },
    dataP: function() {
      return Se(eu({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ou = ["data-p-checked", "data-p-disabled", "data-p"], ru = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], au = ["data-p"], iu = ["data-p"];
function su(e, t, n, o, r, a) {
  return f(), b("div", U({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [N("input", U({
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
  }, a.getPTOptions("input")), null, 16, ru), N("div", U({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [N("div", U({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, iu)], 16, au)], 16, ou);
}
nn.render = su;
const lu = ["aria-describedby"], uu = { class: "text-sm font-medium text-color p-0" }, du = {
  key: 0,
  class: "text-danger-600 dark:text-danger-400"
}, cu = {
  key: 1,
  class: "text-sm text-color break-words"
}, pu = ["role", "aria-required"], fu = ["for"], mu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, hu = {
  key: 0,
  class: "flex items-start gap-2"
}, bu = { class: "flex flex-col gap-1 min-w-0 grow" }, vu = ["for"], gu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, yu = {
  key: 0,
  class: "flex items-start gap-2"
}, wu = { class: "flex flex-col gap-1 min-w-0 grow" }, We = "choice-field-other-sentinel", zt = /* @__PURE__ */ ce({
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
    const o = e, r = n, a = jt(), s = `${a}-desc`, l = `${a}-err`, i = `${a}-other`, u = `${i}-label`, d = `${a}-other-text`, c = `${d}-label`;
    function m(w) {
      return `${a}-opt-${w}`;
    }
    const h = M(null), y = S(() => {
      const w = [];
      return o.field.description && w.push(s), !o.readonly && o.errors.length > 0 && w.push(l), w.length > 0 ? w.join(" ") : void 0;
    }), _ = S({
      get() {
        const w = o.modelValue;
        return typeof w == "string" ? w : j(w) ? We : "";
      },
      set(w) {
        w === We ? r("update:modelValue", { other: v.value }) : w === "" ? r("update:modelValue", void 0) : r("update:modelValue", w);
      }
    }), v = M(Ke(o.modelValue));
    ae(() => o.modelValue, (w) => {
      o.field.multiple || (v.value = Ke(w));
    }), ae(v, (w) => {
      !o.field.multiple && _.value === We && r("update:modelValue", { other: w });
    });
    const x = S(() => {
      const w = o.modelValue;
      return Array.isArray(w) ? w.filter((E) => typeof E == "string") : [];
    }), $ = S(() => o.field.multiple && Vo(o.modelValue)), P = M(Ke(o.modelValue));
    ae(() => o.modelValue, (w) => {
      o.field.multiple && (P.value = Ke(w));
    });
    function p(w, E, A) {
      const V = [...w];
      E && V.push({ other: A }), r("update:modelValue", V.length > 0 ? V : void 0);
    }
    function g(w, E) {
      const A = new Set(x.value);
      E ? A.add(w) : A.delete(w), p(o.field.options.filter((V) => A.has(V.value)).map((V) => V.value), $.value, P.value);
    }
    function T(w) {
      p(x.value, w, P.value);
    }
    ae(P, (w) => {
      $.value && p(x.value, !0, w);
    });
    function j(w) {
      return !!w && typeof w == "object" && !Array.isArray(w) && typeof w.other == "string";
    }
    const C = S(() => {
      const w = o.modelValue;
      if (w === void 0)
        return "—";
      const E = (V) => o.field.options.find((Y) => Y.value === V)?.label ?? V, A = [];
      if (Array.isArray(w))
        for (const V of w)
          typeof V == "string" ? A.push(E(V)) : j(V) && A.push(`Other: ${V.other}`);
      else typeof w == "string" ? A.push(E(w)) : j(w) && A.push(`Other: ${w.other}`);
      return A.length > 0 ? A.join(", ") : "—";
    });
    return t({
      focusFirstControl() {
        h.value?.querySelector("input, textarea")?.focus();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const w = h.value?.querySelector(`[id="${d}"]`);
        w ? w.focus() : h.value?.querySelector("input, textarea")?.focus();
      }
    }), (w, E) => (f(), b("fieldset", {
      ref_key: "fieldsetEl",
      ref: h,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": y.value
    }, [
      N("legend", uu, [
        ie(B(e.field.label), 1),
        !e.readonly && e.field.required ? (f(), b("span", du, " (required)")) : z("", !0)
      ]),
      e.field.description ? (f(), b("p", {
        key: 0,
        id: s,
        class: "text-xs text-muted-color m-0"
      }, B(e.field.description), 1)) : z("", !0),
      e.readonly ? (f(), b("p", cu, B(C.value), 1)) : (f(), b("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup",
        "aria-required": e.field.required ? "true" : void 0
      }, [
        e.field.multiple ? (f(), b(X, { key: 1 }, [
          (f(!0), b(X, null, fe(e.field.options, (A, V) => (f(), b("div", {
            key: A.value,
            class: "flex items-start gap-2"
          }, [
            W(k(At), {
              "model-value": x.value.includes(A.value),
              binary: "",
              "input-id": m(V),
              disabled: e.disabled,
              "onUpdate:modelValue": (Y) => g(A.value, !!Y)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            N("label", {
              for: m(V),
              class: "text-sm text-color break-words"
            }, [
              ie(B(A.label) + " ", 1),
              A.description ? (f(), b("span", gu, B(A.description), 1)) : z("", !0)
            ], 8, vu)
          ]))), 128)),
          e.field.allow_other ? (f(), b("div", yu, [
            W(k(At), {
              "model-value": $.value,
              binary: "",
              "input-id": i,
              disabled: e.disabled,
              "onUpdate:modelValue": E[3] || (E[3] = (A) => T(!!A))
            }, null, 8, ["model-value", "disabled"]),
            N("div", wu, [
              N("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              N("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              W(k(tn), {
                id: d,
                modelValue: P.value,
                "onUpdate:modelValue": E[4] || (E[4] = (A) => P.value = A),
                disabled: e.disabled || !$.value,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : z("", !0)
        ], 64)) : (f(), b(X, { key: 0 }, [
          (f(!0), b(X, null, fe(e.field.options, (A, V) => (f(), b("div", {
            key: A.value,
            class: "flex items-start gap-2"
          }, [
            W(k(nn), {
              modelValue: _.value,
              "onUpdate:modelValue": E[0] || (E[0] = (Y) => _.value = Y),
              "input-id": m(V),
              name: k(a),
              value: A.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            N("label", {
              for: m(V),
              class: "text-sm text-color break-words"
            }, [
              ie(B(A.label) + " ", 1),
              A.description ? (f(), b("span", mu, B(A.description), 1)) : z("", !0)
            ], 8, fu)
          ]))), 128)),
          e.field.allow_other ? (f(), b("div", hu, [
            W(k(nn), {
              modelValue: _.value,
              "onUpdate:modelValue": E[1] || (E[1] = (A) => _.value = A),
              "input-id": i,
              name: k(a),
              value: We,
              disabled: e.disabled
            }, null, 8, ["modelValue", "name", "disabled"]),
            N("div", bu, [
              N("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              N("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              W(k(tn), {
                id: d,
                modelValue: v.value,
                "onUpdate:modelValue": E[2] || (E[2] = (A) => v.value = A),
                disabled: e.disabled || _.value !== We,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : z("", !0)
        ], 64))
      ], 8, pu)),
      !e.readonly && e.errors.length > 0 ? (f(), b("ul", {
        key: 3,
        id: l,
        class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
      }, [
        (f(!0), b(X, null, fe(e.errors, (A, V) => (f(), b("li", { key: V }, B(A.message), 1))), 128))
      ])) : z("", !0)
    ], 8, lu));
  }
}), xu = {
  role: "status",
  class: "sr-only"
}, ku = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color"
}, _u = { class: "flex flex-col gap-1" }, $u = { class: "text-base font-semibold text-color break-words" }, Su = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Pu = {
  key: 1,
  class: "text-xs italic text-muted-color"
}, Cu = {
  key: 1,
  class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0"
}, Tu = { class: "flex items-center gap-2" }, Ou = "Use at most 2,000 characters.", Au = "Enter the other answer.", Eu = "You are offline. Your choices are kept.", ju = /* @__PURE__ */ ce({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, a = rn(
      cl(o.state.definition, o.state.data)
    ), s = M({}), l = M([]), i = {}, u = M("");
    function d($, P) {
      i[$] = P;
    }
    const c = S(() => !o.submitting && !o.offline);
    function m($, P = []) {
      const p = o.state.definition.fields.find((g) => $.includes(g.id))?.id;
      p && Ye(() => {
        const g = i[p];
        P.includes(p) ? g?.focusOtherText() : g?.focusFirstControl();
      });
    }
    function h($) {
      u.value = $ === 1 ? "1 question needs an answer." : `${$} questions need an answer.`;
    }
    function y($, P) {
      s.value = $ ?? {}, l.value = P ?? [];
      const p = Object.keys(s.value);
      m(p);
      const g = p.length + (l.value.length > 0 ? 1 : 0);
      g > 0 && h(g);
    }
    function _($, P) {
      if (a[$] = P, s.value[$]) {
        const { [$]: p, ...g } = s.value;
        s.value = g;
      }
    }
    function v() {
      return il(o.state.definition, a);
    }
    function x() {
      const $ = ul(o.state.definition, a), P = sl(o.state.definition, a).filter((g) => !$.includes(g)), p = dl(o.state.definition, a);
      if (P.length > 0 || p.length > 0 || $.length > 0) {
        const g = {};
        for (const j of P)
          g[j] = [...g[j] ?? [], { code: "required", message: "This question is required." }];
        for (const j of $)
          g[j] = [...g[j] ?? [], { code: "blank", message: Au }];
        for (const j of p)
          g[j] = [...g[j] ?? [], { code: "too_long", message: Ou }];
        s.value = g, l.value = [];
        const T = [...P, ...$, ...p];
        m(T, $), h(new Set(T).size);
        return;
      }
      s.value = {}, l.value = [], r("submit", v());
    }
    return ae(() => o.banner, ($) => {
      $ && (u.value = $.message);
    }), t({
      setServerErrors: y,
      retry: () => r("submit", v()),
      // See QuestionCardActive's own `hasUnsentInput` — a field whose current
      // draft would actually serialize to something counts as unsent input a
      // background "answered elsewhere" swap would otherwise silently discard
      // without explanation.
      hasUnsentInput: () => Object.keys(v()).length > 0
    }), ($, P) => (f(), b("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: lo(x, ["prevent"])
    }, [
      N("div", xu, B(u.value), 1),
      e.offline ? (f(), b("p", ku, B(Eu))) : z("", !0),
      N("div", _u, [
        N("h2", $u, B(e.state.definition.title), 1),
        e.state.definition.description ? (f(), b("p", Su, B(e.state.definition.description), 1)) : z("", !0),
        e.state.stale ? (f(), b("p", Pu, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : z("", !0)
      ]),
      (f(!0), b(X, null, fe(e.state.definition.fields, (p) => (f(), K(zt, {
        key: p.id,
        ref_for: !0,
        ref: (g) => d(p.id, g),
        field: p,
        "model-value": a[p.id],
        errors: s.value[p.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (g) => _(p.id, g)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      l.value.length > 0 ? (f(), b("ul", Cu, [
        (f(!0), b(X, null, fe(l.value, (p, g) => (f(), b("li", { key: g }, B(p.message), 1))), 128))
      ])) : z("", !0),
      e.banner ? (f(), K(k(xe), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: oe(() => [
          N("div", Tu, [
            N("span", null, B(e.banner.message), 1),
            e.banner.retryable ? (f(), K(k(ge), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: P[0] || (P[0] = (p) => r("retry"))
            }, {
              default: oe(() => [...P[1] || (P[1] = [
                ie(" Retry ", -1)
              ])]),
              _: 1
            })) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : z("", !0),
      N("div", null, [
        W(k(ge), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !c.value
        }, null, 8, ["label", "loading", "disabled"])
      ])
    ], 32));
  }
}), Lu = { class: "flex flex-col gap-4 min-w-0" }, Nu = { class: "flex flex-col gap-1" }, Iu = { class: "text-base font-semibold text-color break-words" }, zu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Ru = { key: 0 }, Vu = { key: 1 }, Fu = { key: 2 }, Bu = { key: 3 }, Du = { key: 4 }, Mu = /* @__PURE__ */ ce({
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
    const o = M(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        o.value?.focus();
      }
    }), (r, a) => (f(), b("div", Lu, [
      N("div", Nu, [
        N("h2", Iu, B(e.state.definition.title), 1),
        e.state.definition.description ? (f(), b("p", zu, B(e.state.definition.description), 1)) : z("", !0)
      ]),
      (f(!0), b(X, null, fe(e.state.definition.fields, (s) => (f(), K(zt, {
        key: s.id,
        field: s,
        "model-value": e.state.data ? e.state.data[s.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      N("div", {
        ref_key: "statusEl",
        ref: o,
        tabindex: "-1",
        class: "text-xs text-muted-color flex flex-col gap-0.5 outline-none"
      }, [
        e.state.late ? (f(), b("p", Ru, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : z("", !0),
        e.state.delivery === "pending" ? (f(), b("p", Vu, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (f(), b("p", Fu, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (f(), b("p", Bu, " The assistant stopped before answering. Send a message to continue. ")) : z("", !0),
        n(e.state.submitted_at) ? (f(), b("p", Du, " Answered " + B(n(e.state.submitted_at)), 1)) : z("", !0)
      ], 512)
    ]));
  }
}), qu = { class: "flex flex-col gap-4 min-w-0" }, Uu = { class: "flex flex-col gap-1" }, Wu = { class: "text-base font-semibold text-color break-words" }, Hu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Ku = /* @__PURE__ */ ce({
  __name: "needs-newer-host-notice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (f(), b("div", qu, [
      N("div", Uu, [
        N("h2", Wu, B(e.definition.title), 1),
        e.definition.description ? (f(), b("p", Hu, B(e.definition.description), 1)) : z("", !0)
      ]),
      (f(!0), b(X, null, fe(e.definition.fields, (o) => (f(), K(zt, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      W(k(xe), {
        severity: "warn",
        closable: !1
      }, {
        default: oe(() => [...n[0] || (n[0] = [
          ie(" This form needs a newer Web Host. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), Gu = { class: "flex flex-col gap-4 min-w-0" }, Yu = { class: "flex flex-col gap-1" }, Qu = { class: "text-base font-semibold text-color break-words" }, Zu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Ju = /* @__PURE__ */ ce({
  __name: "no-artifact-notice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (f(), b("div", Gu, [
      N("div", Yu, [
        N("h2", Qu, B(e.definition.title), 1),
        e.definition.description ? (f(), b("p", Zu, B(e.definition.description), 1)) : z("", !0)
      ]),
      (f(!0), b(X, null, fe(e.definition.fields, (o) => (f(), K(zt, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      W(k(xe), {
        severity: "secondary",
        closable: !1
      }, {
        default: oe(() => [...n[0] || (n[0] = [
          ie(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), Et = 9;
function Xu(e, t, n) {
  const o = e.fields.length, r = o > 1, a = /* @__PURE__ */ new Set([0]), s = M(0), l = M(!1), i = M(""), u = M(""), d = M(null), c = M(0), m = rn(
    Object.fromEntries(e.fields.map((O) => {
      const L = t?.[O.id], F = O.options.filter((Ce) => el(L, Ce.value)).map((Ce) => Ce.value), H = {};
      for (const Ce of F) {
        const vt = tl(L, Ce);
        vt && (H[Ce] = vt);
      }
      const te = Vo(L), be = Ke(L), Ee = F.length > 0 || te && se(be) !== "", bt = { chosen: F, other: be, useOther: te, notes: H, noteOpen: null, done: Ee };
      return [O.id, bt];
    }))
  );
  function h(O) {
    return m[O.id];
  }
  function y(O) {
    const L = h(O);
    return O.multiple ? L.chosen.length > 0 || se(L.other) !== "" : L.chosen.length > 0 || L.useOther && se(L.other) !== "";
  }
  function _(O) {
    return h(O).done && y(O);
  }
  const v = S(() => r && s.value === o), x = S(() => v.value ? null : e.fields[s.value] ?? null), $ = S(
    () => e.fields.map((O, L) => ({ field: O, index: L })).filter(({ field: O }) => O.required && !_(O))
  );
  function P(O) {
    u.value = "", setTimeout(() => {
      u.value = O;
    }, 30);
  }
  function p(O) {
    d.value = O, c.value++;
  }
  function g(O) {
    return Math.min(O.options.length + (O.allow_other ? 1 : 0), Et);
  }
  function T(O) {
    const L = g(O), F = L > 1 ? `1–${L}` : "1", H = Math.min(O.options.length, Et), te = H > 1 ? `Shift+1–${H}` : "Shift+1", be = r ? " ← and → change questions." : "";
    return O.multiple ? `${F} ticks, ${te} adds a note, Enter sends.${be}` : `${F} answers, ${te} adds a note first.${be}`;
  }
  function j(O) {
    const L = h(O);
    if (O.multiple) {
      const F = O.options.filter((te) => L.chosen.includes(te.value)).map((te) => Ot(te.value, L.notes[te.value] ?? "")), H = se(L.other);
      return H && F.push({ other: H }), F.length > 0 ? F : void 0;
    }
    if (L.useOther)
      return { other: se(L.other) };
    if (L.chosen[0])
      return Ot(L.chosen[0], L.notes[L.chosen[0]] ?? "");
  }
  function C(O) {
    return _(O) ? Mo(O, j(O)) : null;
  }
  function w() {
    const O = {};
    for (const L of e.fields) {
      if (!_(L))
        continue;
      const F = j(L);
      F !== void 0 && (O[L.id] = F);
    }
    return O;
  }
  function E(O, L = "first") {
    const F = x.value;
    F && F.multiple && !h(F).done && y(F) && (h(F).done = !0);
    const H = r ? o : o - 1;
    if (s.value = Math.max(0, Math.min(O, H)), i.value = "", v.value || a.add(s.value), v.value) {
      const te = $.value[0];
      p(te ? `review-item-${te.index}` : "send-all");
    } else
      p(L);
    P(v.value ? "Review your answers" : `Question ${s.value + 1} of ${o}`);
  }
  function A() {
    $.value.length > 0 || n(w());
  }
  function V(O) {
    if (h(O).done = !0, i.value = "", !r) {
      n(w());
      return;
    }
    const L = e.fields.findIndex((F, H) => H > s.value && !a.has(H));
    E(L === -1 ? o : L);
  }
  function Y(O, L) {
    const F = h(O);
    if (L >= O.options.length) {
      p("other");
      return;
    }
    const H = O.options[L].value;
    if (F.noteOpen === H && !O.multiple) {
      p(`note-${H}`);
      return;
    }
    if (O.multiple) {
      F.chosen = F.chosen.includes(H) ? F.chosen.filter((te) => te !== H) : [...F.chosen, H], y(O) || (F.done = !1), i.value = "", p(`opt-${L}`), P(F.chosen.includes(H) ? "Ticked" : "Unticked");
      return;
    }
    F.chosen = [H], F.useOther = !1, V(O);
  }
  function D(O, L, F = !1) {
    const H = h(O), te = O.options.findIndex((be) => be.value === L);
    H.noteOpen === L && !F ? (H.noteOpen = null, p(`opt-${te}`)) : (H.noteOpen = L, p(`note-${L}`));
  }
  function re(O, L, F) {
    h(O).notes[L] = F;
  }
  function Ae(O, L) {
    const F = h(O);
    if (F.noteOpen = null, O.multiple) {
      F.chosen.includes(L) || (F.chosen = [...F.chosen, L]), p(`opt-${O.options.findIndex((H) => H.value === L)}`), P("Note saved");
      return;
    }
    F.chosen = [L], F.useOther = !1, V(O);
  }
  function Pe(O) {
    const L = h(O), F = se(L.other);
    if (O.multiple) {
      if (!F && L.chosen.length === 0)
        return;
    } else {
      if (!F)
        return;
      L.useOther = !0, L.chosen = [];
    }
    V(O);
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
    answers: m,
    inReview: v,
    currentQuestion: x,
    missingRequired: $,
    ans: h,
    hasContent: y,
    answered: _,
    answerItemsFor: C,
    keysText: T,
    activate: Y,
    toggleNote: D,
    setNote: re,
    sendNote: Ae,
    sendOther: Pe,
    commit: V,
    go: E,
    submitAll: A,
    requestFocus: p,
    buildAnswers: w
  };
}
function R(e, ...t) {
  const n = t.filter((o) => !!o);
  return {
    part: [e, ...n.map((o) => `${e}-${o}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((o) => `w-form__${e}--${o}`)].join(" ")
  };
}
function ed(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const o = n.pop() ?? "";
    n[n.length - 1] += `\`${o}`;
  }
  return n.map((o, r) => ({ text: o, code: r % 2 === 1 })).filter((o) => o.text !== "");
}
function no(e) {
  return String(e).replaceAll("`", "");
}
function td(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const nd = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Oe = /* @__PURE__ */ ce({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, o) => (f(!0), b(X, null, fe(k(ed)(t.text), (r, a) => (f(), b(X, { key: a }, [
      r.code ? (f(), b("code", nd, B(r.text), 1)) : (f(), b(X, { key: 1 }, [
        ie(B(r.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), od = ["part"], rd = ["part"], ad = ["part"], id = { "aria-hidden": "true" }, sd = { class: "w-form__sr" }, ld = ["id", "part"], ud = ["part"], dd = /* @__PURE__ */ ce({
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
    const n = e, o = t, r = S(() => R("header", !n.multi && "single")), a = S(() => R("nav")), s = S(() => R("prev")), l = S(() => R("counter")), i = S(() => R("next")), u = S(() => R("question")), d = S(() => R("actions")), c = S(() => R("collapse")), m = S(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), h = S(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), y = S(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (_, v) => (f(), b("div", {
      part: r.value.part,
      class: I(r.value.class)
    }, [
      e.multi ? (f(), b("div", {
        key: 0,
        part: a.value.part,
        class: I(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        W(k(ge), {
          type: "button",
          text: "",
          size: "small",
          part: s.value.part,
          class: I(s.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: v[0] || (v[0] = (x) => o("prev"))
        }, {
          icon: oe(() => [
            W(k(ve), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        N("span", {
          part: l.value.part,
          class: I(l.value.class)
        }, [
          N("span", id, B(m.value), 1),
          N("span", sd, B(h.value), 1)
        ], 10, ad),
        W(k(ge), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: I(i.value.class),
          "aria-label": y.value,
          title: y.value,
          disabled: e.review,
          onClick: v[1] || (v[1] = (x) => o("next"))
        }, {
          icon: oe(() => [
            W(k(ve), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, rd)) : z("", !0),
      N("h3", {
        id: e.qid,
        part: u.value.part,
        class: I(u.value.class)
      }, [
        e.review ? (f(), b(X, { key: 0 }, [
          ie(" Check your answers, then send them. ")
        ], 64)) : (f(), K(Oe, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, ld),
      N("div", {
        part: d.value.part,
        class: I(d.value.class)
      }, [
        W(k(ge), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: I(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: v[2] || (v[2] = (x) => o("toggleCollapse"))
        }, {
          icon: oe(() => [
            W(k(ve), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, ud)
    ], 10, od));
  }
});
var cd = `
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
`, pd = {
  root: "p-inputgroup"
}, fd = Z.extend({
  name: "inputgroup",
  style: cd,
  classes: pd
}), md = {
  name: "BaseInputGroup",
  extends: qe,
  style: fd,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Wo = {
  name: "InputGroup",
  extends: md,
  inheritAttrs: !1
};
function hd(e, t, n, o, r, a) {
  return f(), b("div", U({
    class: e.cx("root")
  }, e.ptmi("root")), [de(e.$slots, "default")], 16);
}
Wo.render = hd;
var bd = `
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
`, vd = {
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
}, gd = Z.extend({
  name: "textarea",
  style: bd,
  classes: vd
}), yd = {
  name: "BaseTextarea",
  extends: It,
  props: {
    autoResize: Boolean
  },
  style: gd,
  provide: function() {
    return {
      $pcTextarea: this,
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
function wd(e, t, n) {
  return (t = xd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xd(e) {
  var t = kd(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function kd(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (ft(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ho = {
  name: "Textarea",
  extends: yd,
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
      return U(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Se(wd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, _d = ["value", "name", "disabled", "aria-invalid", "data-p"];
function $d(e, t, n, o, r, a) {
  return f(), b("textarea", U({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, _d);
}
Ho.render = $d;
const Ko = /* @__PURE__ */ ce({
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
    const n = e, o = t, r = S(() => R("composer", n.kind)), a = S(() => R(`${n.kind}-input`)), s = S(() => R(`${n.kind}-send`));
    function l(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && o("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), o("escape"));
    }
    return (i, u) => (f(), K(k(Wo), {
      part: r.value.part,
      class: I(r.value.class)
    }, {
      default: oe(() => [
        W(k(Ho), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: I(a.value.class),
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": u[0] || (u[0] = (d) => o("update:modelValue", String(d ?? ""))),
          onKeydown: l
        }, null, 8, ["model-value", "part", "class", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        W(k(ge), {
          type: "button",
          text: "",
          rounded: "",
          part: s.value.part,
          class: I(s.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => o("send"))
        }, {
          icon: oe(() => [
            W(k(ve), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), Sd = ["part"], Pd = ["part", "role", "aria-checked", "aria-disabled", "tabindex", "data-focus", "aria-keyshortcuts"], Cd = ["part"], Td = ["part"], Od = ["part"], Ad = ["part"], Ed = ["part"], jd = { key: 1 }, Ld = ["part"], Nd = /* @__PURE__ */ ce({
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
    rovingTabbable: { type: Boolean }
  },
  emits: ["activate", "toggle-note", "update:noteDraft", "send-note", "escape-note"],
  setup(e, { emit: t }) {
    const n = e, o = t, r = S(() => R("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = S(() => R("option-main")), s = S(() => R("option-label")), l = S(() => R("option-mark")), i = S(() => R("option-description")), u = S(() => R("option-note")), d = S(() => R("note-toggle", n.note && "has-note", n.editing && "editing")), c = S(() => R("option-key")), m = S(() => R("error")), h = `${jt()}-note-err`;
    function y($) {
      n.disabled || $.target.closest(".w-form__note-toggle, .w-form__composer") || o("activate");
    }
    const _ = S(() => `${n.note ? "Edit the note on" : "Add a note to"} ${no(n.option.label)}`), v = S(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), x = S(() => n.multiple ? "Save the note" : "Answer with this note");
    return ($, P) => (f(), b("div", {
      part: r.value.part,
      class: I(r.value.class),
      onClick: y
    }, [
      N("div", {
        part: a.value.part,
        class: I(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        N("span", {
          part: s.value.part,
          class: I(s.value.class)
        }, [
          e.multiple ? (f(), K(k(At), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: l.value.part,
            class: I(l.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (f(), b("span", {
            key: 1,
            part: l.value.part,
            class: I(l.value.class),
            "aria-hidden": "true"
          }, [
            W(k(ve), { icon: "tabler:check" })
          ], 10, Td)) : z("", !0),
          W(Oe, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, Cd),
        e.option.description ? (f(), b("span", {
          key: 0,
          part: i.value.part,
          class: I(i.value.class)
        }, [
          W(Oe, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, Od)) : z("", !0),
        e.note && !e.editing ? (f(), b("span", {
          key: 1,
          part: u.value.part,
          class: I(u.value.class)
        }, [
          W(k(ve), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          N("span", null, B(e.note), 1)
        ], 10, Ad)) : z("", !0)
      ], 10, Pd),
      W(k(ge), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: I(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": _.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: P[0] || (P[0] = lo((p) => o("toggle-note"), ["stop"]))
      }, {
        icon: oe(() => [
          W(k(ve), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (f(), b("kbd", {
        key: 0,
        part: c.value.part,
        class: I(c.value.class),
        "aria-hidden": "true"
      }, B(e.keyLabel), 11, Ed)) : (f(), b("span", jd)),
      e.editing ? (f(), b(X, { key: 2 }, [
        W(Ko, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: v.value,
          label: `Note for ${k(no)(e.option.label)}`,
          "send-label": x.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": e.noteTooLong ? h : void 0,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": P[1] || (P[1] = (p) => o("update:noteDraft", p)),
          onSend: P[2] || (P[2] = (p) => o("send-note")),
          onEscape: P[3] || (P[3] = (p) => o("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (f(), b("p", {
          key: 0,
          id: h,
          part: m.value.part,
          class: I(m.value.class),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Ld)) : z("", !0)
      ], 64)) : z("", !0)
    ], 10, Sd));
  }
}), Id = ["part"], zd = ["part"], Rd = ["part"], Vd = ["part", "role", "aria-labelledby", "aria-describedby"], Fd = ["part"], Bd = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, Dd = { key: 1 }, Md = ["part"], qd = ["part"], Ud = ["id"], Wd = ["part"], Hd = /* @__PURE__ */ ce({
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
    const t = e, n = S(() => R("notice")), o = S(() => R("description")), r = S(() => R("hint")), a = S(() => R("options")), s = S(() => R("footer")), l = S(() => R("send")), i = S(() => R("error")), u = S(() => R("keys")), d = S(() => {
      const C = [];
      return t.question.multiple && C.push("Choose any that apply."), t.question.required || C.push("Optional."), C.join(" ");
    }), c = S(() => t.controller.error.value || t.serverError || "");
    function m(C) {
      return C < Et ? String(C + 1) : null;
    }
    const h = S(() => {
      const C = t.question.options.length + 1;
      return C <= Et ? String(C) : null;
    });
    function y() {
      return t.controller.ans(t.question);
    }
    const _ = S(() => {
      const C = y(), w = t.question.multiple ? se(C.other) !== "" : C.useOther && C.done;
      return R("option", "other", w && "selected");
    }), v = S(() => {
      const C = y();
      return se(C.other) !== "" || t.question.multiple && C.chosen.length > 0;
    }), x = S(() => Bo(y().other)), $ = `${t.qid}-other-err`, P = S(() => {
      const C = [];
      return x.value && C.push($), c.value && C.push(`${t.qid}-err`), C.join(" ") || void 0;
    }), p = S(() => x.value || !!c.value);
    function g(C) {
      C.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    const T = M(0);
    ae(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const C = y(), w = C.useOther ? -1 : t.question.options.findIndex((E) => E.value === C.chosen[0]);
      T.value = w >= 0 ? w : 0;
    }, { immediate: !0 });
    function j(C) {
      if (t.question.multiple)
        return;
      const w = C.target?.dataset?.focus ?? "";
      w.startsWith("opt-") && (T.value = Number(w.slice(4)));
    }
    return (C, w) => (f(), b(X, null, [
      e.stale ? (f(), b("p", {
        key: 0,
        part: n.value.part,
        class: I(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Id)) : z("", !0),
      e.question.description ? (f(), b("p", {
        key: 1,
        part: o.value.part,
        class: I(o.value.class)
      }, [
        W(Oe, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, zd)) : z("", !0),
      d.value ? (f(), b("p", {
        key: 2,
        part: r.value.part,
        class: I(r.value.class)
      }, B(d.value), 11, Rd)) : z("", !0),
      N("div", {
        part: a.value.part,
        class: I(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": `${e.qid}-err`,
        onFocusin: j
      }, [
        (f(!0), b(X, null, fe(e.question.options, (E, A) => (f(), K(Nd, {
          key: E.value,
          option: E,
          index: A,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(E.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === E.value,
          note: k(se)(e.controller.ans(e.question).notes[E.value] || ""),
          editing: e.controller.ans(e.question).noteOpen === E.value,
          "note-draft": e.controller.ans(e.question).notes[E.value] || "",
          "key-label": m(A),
          "note-too-long": k(rl)(e.controller.ans(e.question).notes[E.value] || ""),
          disabled: !!e.disabled,
          "roving-tabbable": A === T.value,
          onActivate: (V) => e.controller.activate(e.question, A),
          onToggleNote: (V) => e.controller.toggleNote(e.question, E.value),
          "onUpdate:noteDraft": (V) => e.controller.setNote(e.question, E.value, V),
          onSendNote: (V) => e.controller.sendNote(e.question, E.value),
          onEscapeNote: (V) => e.controller.toggleNote(e.question, E.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (f(), b("div", {
          key: 0,
          part: _.value.part,
          class: I(_.value.class),
          onClick: g
        }, [
          W(Ko, {
            kind: "other",
            "model-value": y().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: v.value && !e.disabled && !x.value,
            invalid: p.value,
            "described-by": P.value,
            "data-focus": "other",
            "onUpdate:modelValue": w[0] || (w[0] = (E) => {
              y().other = E;
            }),
            onSend: w[1] || (w[1] = (E) => e.controller.sendOther(e.question)),
            onEscape: w[2] || (w[2] = (E) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          h.value ? (f(), b("kbd", Bd, B(h.value), 1)) : (f(), b("span", Dd)),
          x.value ? (f(), b("p", {
            key: 2,
            id: $,
            part: i.value.part,
            class: I(i.value.class),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, Md)) : z("", !0)
        ], 10, Fd)) : z("", !0)
      ], 42, Vd),
      e.question.multiple && !e.question.allow_other ? (f(), b("div", {
        key: 3,
        part: s.value.part,
        class: I(s.value.class)
      }, [
        W(k(ge), {
          type: "button",
          part: l.value.part,
          class: I(l.value.class),
          "data-focus": "send",
          disabled: e.controller.ans(e.question).chosen.length === 0 || e.disabled,
          onClick: w[3] || (w[3] = (E) => e.controller.commit(e.question))
        }, {
          default: oe(() => [
            w[4] || (w[4] = ie(" Send ", -1)),
            W(k(ve), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, qd)) : z("", !0),
      c.value ? (f(), K(k(xe), {
        key: 4,
        id: `${e.qid}-err`,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: I(i.value.class),
        role: "alert"
      }, {
        default: oe(() => [
          ie(B(c.value), 1)
        ]),
        _: 1
      }, 8, ["id", "part", "class"])) : (f(), b("p", {
        key: 5,
        id: `${e.qid}-err`,
        class: "hidden"
      }, null, 8, Ud)),
      N("p", {
        part: u.value.part,
        class: I(u.value.class)
      }, B(e.controller.keysText(e.question)), 11, Wd)
    ], 64));
  }
}), Kd = ["part"], Gd = ["part"], Yd = { key: 0 }, Qd = ["part"], Go = /* @__PURE__ */ ce({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = S(() => R("answer-item")), o = S(() => R("answer-note")), r = S(() => R("answer-own"));
    return (a, s) => (f(!0), b(X, null, fe(t.items, (l, i) => (f(), b("span", {
      key: i,
      part: n.value.part,
      class: I(n.value.class)
    }, [
      l.own ? (f(), b(X, { key: 0 }, [
        N("span", {
          part: r.value.part,
          class: I(r.value.class)
        }, "Own answer: ", 10, Gd),
        (f(!0), b(X, null, fe(k(td)(l.label), (u, d) => (f(), b(X, { key: d }, [
          d > 0 ? (f(), b("br", Yd)) : z("", !0),
          ie(B(u), 1)
        ], 64))), 128))
      ], 64)) : (f(), K(Oe, {
        key: 1,
        text: l.label
      }, null, 8, ["text"])),
      k(se)(l.note || "") ? (f(), b("span", {
        key: 2,
        part: o.value.part,
        class: I(o.value.class)
      }, [
        W(k(ve), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        N("span", null, B(k(se)(l.note)), 1)
      ], 10, Qd)) : z("", !0)
    ], 10, Kd))), 128));
  }
}), Zd = ["part"], Jd = ["part"], Xd = ["part", "aria-label", "data-focus", "onClick"], ec = ["part"], tc = ["part"], nc = ["part"], oc = ["part"], rc = ["part"], ac = ["part"], ic = ["part"], sc = /* @__PURE__ */ ce({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = S(() => R("review")), o = S(() => R("footer")), r = S(() => R("footer-text")), a = S(() => R("send-all")), s = S(() => R("keys")), l = S(() => R("review-number")), i = S(() => R("review-question")), u = S(() => R("review-answer")), d = S(() => R("answer-empty"));
    function c(_) {
      return R("review-item", _ && "missing");
    }
    function m() {
      return R("review-edit");
    }
    const h = S(() => t.controller.missingRequired.value), y = S(() => {
      const _ = h.value;
      return _.length === 0 ? "" : _.length === 1 ? `Question ${_[0].index + 1} still needs an answer.` : `Questions ${_.map((v) => v.index + 1).join(" and ")} still need answers.`;
    });
    return (_, v) => (f(), b(X, null, [
      N("ol", {
        part: n.value.part,
        class: I(n.value.class)
      }, [
        (f(!0), b(X, null, fe(e.definition.fields, (x, $) => (f(), b("li", {
          key: x.id,
          part: c(!e.controller.answerItemsFor(x) && x.required).part,
          class: I(c(!e.controller.answerItemsFor(x) && x.required).class)
        }, [
          N("button", {
            type: "button",
            part: m().part,
            class: I(m().class),
            "aria-label": `Question ${$ + 1}: change the answer`,
            "data-focus": `review-item-${$}`,
            onClick: (P) => e.controller.go($, "first")
          }, [
            N("span", {
              part: l.value.part,
              class: I(l.value.class),
              "aria-hidden": "true"
            }, B($ + 1), 11, ec),
            N("span", {
              part: i.value.part,
              class: I(i.value.class)
            }, [
              W(Oe, {
                text: x.label
              }, null, 8, ["text"])
            ], 10, tc),
            N("span", {
              part: u.value.part,
              class: I(u.value.class)
            }, [
              e.controller.answerItemsFor(x) ? (f(), K(Go, {
                key: 0,
                items: e.controller.answerItemsFor(x)
              }, null, 8, ["items"])) : x.required ? (f(), b(X, { key: 1 }, [
                ie(" Not answered yet ")
              ], 64)) : (f(), b("span", {
                key: 2,
                part: d.value.part,
                class: I(d.value.class)
              }, "Skipped", 10, oc))
            ], 10, nc)
          ], 10, Xd)
        ], 10, Jd))), 128))
      ], 10, Zd),
      N("div", {
        part: o.value.part,
        class: I(o.value.class)
      }, [
        y.value ? (f(), b("p", {
          key: 0,
          part: r.value.part,
          class: I(r.value.class)
        }, B(y.value), 11, ac)) : z("", !0),
        W(k(ge), {
          type: "button",
          part: a.value.part,
          class: I(a.value.class),
          "data-focus": "send-all",
          disabled: h.value.length > 0 || e.disabled,
          onClick: v[0] || (v[0] = (x) => e.controller.submitAll())
        }, {
          default: oe(() => [
            v[1] || (v[1] = ie(" Send answers ", -1)),
            W(k(ve), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, rc),
      N("p", {
        part: s.value.part,
        class: I(s.value.class)
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
}, hc = "You are offline. Your choices are kept.", bc = "Sending your answer…", vc = /* @__PURE__ */ ce({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, a = Xu(o.state.definition, o.state.data, (p) => {
      o.offline || o.submitting || r("submit", p);
    }), s = S(() => !!o.offline || o.submitting), l = `${jt()}-q`, i = M(null);
    ae(a.inReview, (p) => r("update:state", p ? "review" : "active"), { immediate: !0 }), ae(a.collapsed, (p) => r("update:collapsed", p), { immediate: !0 });
    const u = M({}), d = M([]);
    function c(p) {
      const g = [...d.value];
      return u.value[p] && g.push(u.value[p]), g.join(" ");
    }
    const m = S(() => new Set(o.state.definition.fields.map((p) => p.id))), h = S(() => {
      const p = Object.entries(u.value).filter(([g]) => !m.value.has(g)).map(([, g]) => g);
      return [...d.value, ...p].join(" ");
    });
    ae(
      () => Object.fromEntries(o.state.definition.fields.map((p) => [p.id, JSON.stringify(a.ans(p))])),
      (p, g) => {
        if (!g)
          return;
        const T = new Set(
          o.state.definition.fields.map((j) => j.id).filter((j) => p[j] !== g[j] && u.value[j])
        );
        T.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([j]) => !T.has(j))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(p, g) {
        const T = {};
        for (const [C, w] of Object.entries(p ?? {}))
          T[C] = w.map((E) => E.message).join(" ");
        u.value = T, d.value = (g ?? []).map((C) => C.message);
        const j = o.state.definition.fields.findIndex((C) => T[C.id]);
        j >= 0 && a.go(j, "first");
      },
      retry() {
        r("submit", a.buildAnswers());
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
          (p) => p.chosen.length > 0 || se(p.other) !== "" || Object.values(p.notes).some((g) => se(g) !== "")
        );
      }
    });
    const y = S(() => R("card")), _ = S(() => R("title")), v = S(() => R("form-description"));
    function x(p) {
      const g = i.value;
      if (!g)
        return;
      let T = null;
      if (p === "card" ? T = g : p === "first" ? T = g.querySelector(".w-form__option--selected .w-form__option-main") ?? g.querySelector(".w-form__option-main, .w-form__other-input") : T = Array.from(g.querySelectorAll("[data-focus]")).find((j) => j.dataset.focus === p) ?? null, !!T && (T.focus(), T.tagName === "TEXTAREA")) {
        const j = T;
        j.setSelectionRange(j.value.length, j.value.length);
      }
    }
    ae(a.focusSeq, () => {
      Ye(() => {
        const p = a.focusTarget.value;
        p && x(p);
      });
    });
    function $() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function P(p) {
      const g = p.composedPath()[0];
      if (g?.tagName === "TEXTAREA" || p.isComposing || p.ctrlKey || p.metaKey || p.altKey || a.collapsed.value || s.value)
        return;
      if (a.inReview.value) {
        p.key === "ArrowLeft" && (p.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const T = a.currentQuestion.value;
      if (!T)
        return;
      const j = a.ans(T), C = p.shiftKey ? /^Digit([1-9])$/.exec(p.code) : /^([1-9])$/.exec(p.key);
      if (C) {
        const A = Number(C[1]) - 1;
        if (A >= T.options.length + (T.allow_other ? 1 : 0))
          return;
        p.preventDefault(), p.shiftKey && A < T.options.length ? a.toggleNote(T, T.options[A].value, !0) : a.activate(T, A);
        return;
      }
      const w = g?.dataset?.focus ?? "", E = w.startsWith("opt-") ? Number(w.slice(4)) : -1;
      if (p.key === "ArrowDown" || p.key === "ArrowUp") {
        const A = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (A.length === 0)
          return;
        p.preventDefault();
        const V = A.indexOf(g), Y = p.key === "ArrowDown" ? (V + 1) % A.length : V <= 0 ? A.length - 1 : V - 1;
        A[Y]?.focus();
        return;
      }
      if (a.multi && (p.key === "ArrowRight" || p.key === "ArrowLeft")) {
        p.preventDefault(), a.go(a.index.value + (p.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((p.key === "n" || p.key === "N") && E >= 0) {
        p.preventDefault(), a.toggleNote(T, T.options[E].value, !0);
        return;
      }
      if (E >= 0 && (p.key === " " || p.key === "Enter" && !T.multiple)) {
        p.preventDefault(), a.activate(T, E);
        return;
      }
      p.key === "Enter" && T.multiple && !g?.matches?.("button") && (p.preventDefault(), j.chosen.length > 0 || se(j.other) ? a.commit(T) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(E >= 0 ? w : "first")));
    }
    return (p, g) => (f(), b("section", {
      ref_key: "cardRoot",
      ref: i,
      part: y.value.part,
      class: I(`w-form ${y.value.class}`),
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: P
    }, [
      e.offline ? (f(), b("p", uc, B(hc))) : z("", !0),
      e.submitting ? (f(), b("p", dc, B(bc))) : z("", !0),
      h.value ? (f(), K(k(xe), {
        key: 2,
        severity: "error",
        closable: !1
      }, {
        default: oe(() => [
          ie(B(h.value), 1)
        ]),
        _: 1
      })) : z("", !0),
      N("p", {
        part: _.value.part,
        class: I(_.value.class)
      }, [
        W(k(ve), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        ie(" " + B(e.state.definition.title), 1)
      ], 10, cc),
      e.state.definition.description ? (f(), b("p", {
        key: 3,
        part: v.value.part,
        class: I(v.value.class)
      }, [
        W(Oe, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, pc)) : z("", !0),
      W(dd, {
        multi: k(a).multi,
        index: k(a).index.value,
        n: k(a).n,
        review: k(a).inReview.value,
        "question-text": k(a).currentQuestion.value?.label ?? "",
        collapsed: k(a).collapsed.value,
        qid: l,
        onPrev: g[0] || (g[0] = (T) => k(a).go(k(a).index.value - 1, "first")),
        onNext: g[1] || (g[1] = (T) => k(a).go(k(a).index.value + 1, "first")),
        onToggleCollapse: $
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (f(), K(k(xe), {
        key: 4,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: oe(() => [
          N("div", fc, [
            N("span", null, B(e.banner.message), 1),
            e.banner.retryable ? (f(), K(k(ge), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: g[2] || (g[2] = (T) => r("retry"))
            }, {
              default: oe(() => [...g[3] || (g[3] = [
                ie(" Retry ", -1)
              ])]),
              _: 1
            })) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : z("", !0),
      k(a).collapsed.value ? z("", !0) : (f(), b(X, { key: 5 }, [
        k(a).inReview.value ? (f(), K(sc, {
          key: 0,
          definition: e.state.definition,
          controller: k(a),
          disabled: s.value
        }, null, 8, ["definition", "controller", "disabled"])) : k(a).currentQuestion.value ? (f(), K(Hd, {
          key: 1,
          question: k(a).currentQuestion.value,
          controller: k(a),
          qid: l,
          stale: !!e.state.stale,
          "server-error": c(k(a).currentQuestion.value.id),
          disabled: s.value
        }, null, 8, ["question", "controller", "stale", "server-error", "disabled"])) : z("", !0)
      ], 64)),
      N("p", mc, B(k(a).liveMessage.value), 1)
    ], 42, lc));
  }
}), gc = ["part", "aria-label"], yc = ["part"], wc = ["part"], xc = ["part"], kc = ["part"], _c = ["part"], $c = ["part"], Sc = ["part"], Pc = ["part"], Cc = { key: 0 }, Tc = { key: 1 }, Oc = { key: 2 }, Ac = { key: 3 }, Ec = { key: 4 }, jc = /* @__PURE__ */ ce({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function o(_) {
      if (!_)
        return null;
      const v = new Date(_);
      return Number.isNaN(v.getTime()) ? null : v.toLocaleString();
    }
    const r = S(() => R("card", "answered")), a = S(() => R("title")), s = S(() => R("form-description")), l = S(() => R("summary")), i = S(() => R("summary-item")), u = S(() => R("summary-question")), d = S(() => R("summary-answer")), c = S(() => R("answer-empty")), m = S(() => R("status"));
    function h(_) {
      const v = n.state.definition.fields.find((x) => x.id === _);
      return v ? Mo(v, n.state.data ? n.state.data[_] : void 0) : null;
    }
    const y = M(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        y.value?.focus();
      }
    }), (_, v) => (f(), b("section", {
      part: r.value.part,
      class: I(`w-form ${r.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      N("p", {
        part: a.value.part,
        class: I(a.value.class)
      }, [
        W(k(ve), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        ie(" " + B(e.state.definition.title), 1)
      ], 10, yc),
      e.state.definition.description ? (f(), b("p", {
        key: 0,
        part: s.value.part,
        class: I(s.value.class)
      }, [
        W(Oe, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, wc)) : z("", !0),
      N("dl", {
        part: l.value.part,
        class: I(l.value.class)
      }, [
        (f(!0), b(X, null, fe(e.state.definition.fields, (x) => (f(), b("div", {
          key: x.id,
          part: i.value.part,
          class: I(i.value.class)
        }, [
          N("dt", {
            part: u.value.part,
            class: I(u.value.class)
          }, [
            W(Oe, {
              text: x.label
            }, null, 8, ["text"])
          ], 10, _c),
          N("dd", {
            part: d.value.part,
            class: I(d.value.class)
          }, [
            h(x.id) ? (f(), K(Go, {
              key: 0,
              items: h(x.id)
            }, null, 8, ["items"])) : (f(), b("span", {
              key: 1,
              part: c.value.part,
              class: I(c.value.class)
            }, "Skipped", 10, Sc))
          ], 10, $c)
        ], 10, kc))), 128))
      ], 10, xc),
      N("div", {
        ref_key: "statusEl",
        ref: y,
        tabindex: "-1",
        part: m.value.part,
        class: I(m.value.class)
      }, [
        e.state.late ? (f(), b("p", Cc, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : z("", !0),
        e.state.delivery === "pending" ? (f(), b("p", Tc, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (f(), b("p", Oc, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (f(), b("p", Ac, " The assistant stopped before answering. Send a message to continue. ")) : z("", !0),
        o(e.state.submitted_at) ? (f(), b("p", Ec, " Answered " + B(o(e.state.submitted_at)), 1)) : z("", !0)
      ], 10, Pc)
    ], 10, gc));
  }
}), Lc = { class: "p-3 max-w-full min-w-0" }, Nc = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Ic = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, zc = {
  key: 6,
  "no-bg": "",
  title: "Loading form…"
}, Rc = { class: "flex items-center gap-2" }, Vc = "Could not refresh this form. Showing what you last saw.", Fc = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", oo = 1, Bc = /* @__PURE__ */ ce({
  __name: "wippy-form",
  setup(e) {
    const t = zs(), n = Vs(), o = Rs(), r = Zs(), a = S(() => t.value.definition), s = S(() => t.value.state), { status: l, state: i, errorMessage: u, reloadError: d, reload: c, refresh: m } = qs(r, s);
    Ds(i, m);
    const { submitting: h, submit: y } = Qs(r), { isOnline: _ } = Xs(() => c()), v = M(null), x = M(!1);
    ae(r, () => {
      x.value = !1;
    });
    const $ = M(null), P = M(null);
    let p = !1;
    ae(() => i.value?.status, (Y, D) => {
      if (Y !== "idle" || D !== "active")
        return;
      if (p) {
        p = !1;
        return;
      }
      ($.value?.hasUnsentInput?.() ?? !0) && (x.value = !0);
    });
    const g = S(() => {
      const Y = t.value.formVersion;
      if (Y !== void 0 && Y !== oo)
        return !0;
      const D = i.value?.form_version;
      return D !== void 0 && D !== oo;
    }), T = S(() => {
      const Y = a.value?.fields;
      return !!Y && Y.length > 0 && Y.every((D) => D.type === "choice");
    }), j = M("active"), C = M(!1), w = S(() => g.value || l.value === "unsupported" ? "unsupported" : i.value === null ? "loading" : i.value.status === "idle" ? "answered" : T.value ? j.value : "active"), E = S(() => !g.value && T.value && i.value?.status === "active" && C.value);
    Js(w, E);
    async function A(Y) {
      if (!i.value)
        return;
      v.value = null;
      const D = await y(i.value.form_version, i.value.content_version, Y);
      if (!D.ignored) {
        if (D.ok && D.accepted) {
          const re = D.accepted;
          p = !0, i.value = {
            ...i.value,
            status: "idle",
            stale: !1,
            late: re.late,
            content_version: re.content_version,
            data: Y,
            answer_message_id: re.answer_message_id,
            delivery: re.delivery
          }, o("answer-submitted", { requestId: re.request_id, answerMessageId: re.answer_message_id, late: re.late }), Ye(() => P.value?.focusStatus()), c();
          return;
        }
        if (D.fieldErrors || D.formErrors) {
          $.value?.setServerErrors(D.fieldErrors, D.formErrors);
          return;
        }
        if (D.code === "already_submitted") {
          x.value = !0, await m(), Ye(() => P.value?.focusStatus());
          return;
        }
        D.shouldReload && c(), v.value = { message: D.message ?? "Could not submit this form.", retryable: D.retryable };
      }
    }
    function V() {
      $.value?.retry();
    }
    return (Y, D) => (f(), b("div", Lc, [
      k(n).length > 0 ? (f(), K(k(xe), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: oe(() => [...D[2] || (D[2] = [
          ie(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : a.value ? g.value ? (f(), K(k(xe), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: oe(() => [...D[4] || (D[4] = [
          ie(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : k(l) === "unsupported" ? (f(), K(Ku, {
        key: 3,
        definition: a.value
      }, null, 8, ["definition"])) : k(r) ? k(i) ? (f(), b(X, { key: 5 }, [
        k(d) ? (f(), b("p", Nc, B(Vc))) : z("", !0),
        k(i).status === "active" && T.value ? (f(), K(vc, {
          key: k(r),
          ref_key: "activeFormRef",
          ref: $,
          state: k(i),
          submitting: k(h),
          banner: v.value,
          offline: !k(_),
          onSubmit: A,
          onRetry: V,
          "onUpdate:state": D[0] || (D[0] = (re) => {
            j.value = re;
          }),
          "onUpdate:collapsed": D[1] || (D[1] = (re) => {
            C.value = re;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : k(i).status === "active" ? (f(), K(ju, {
          key: k(r),
          ref_key: "activeFormRef",
          ref: $,
          state: k(i),
          submitting: k(h),
          banner: v.value,
          offline: !k(_),
          onSubmit: A,
          onRetry: V
        }, null, 8, ["state", "submitting", "banner", "offline"])) : k(i).status === "idle" ? (f(), b(X, { key: 3 }, [
          x.value ? (f(), b("p", Ic, B(Fc))) : z("", !0),
          T.value ? (f(), K(jc, {
            key: k(r),
            ref_key: "idleFormRef",
            ref: P,
            state: k(i)
          }, null, 8, ["state"])) : (f(), K(Mu, {
            key: k(r),
            ref_key: "idleFormRef",
            ref: P,
            state: k(i)
          }, null, 8, ["state"]))
        ], 64)) : z("", !0)
      ], 64)) : k(l) === "loading" || k(l) === "idle" ? (f(), b("wippy-loading", zc)) : k(l) === "error" ? (f(), K(k(xe), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: oe(() => [
          N("div", Rc, [
            N("span", null, B(k(u) || "Could not load this form."), 1),
            W(k(ge), {
              type: "button",
              link: "",
              size: "small",
              onClick: k(c)
            }, {
              default: oe(() => [...D[5] || (D[5] = [
                ie(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : z("", !0) : (f(), K(Ju, {
        key: 4,
        definition: a.value
      }, null, 8, ["definition"])) : (f(), K(k(xe), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: oe(() => [...D[3] || (D[3] = [
          ie(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Dc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.table{display:table}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.outline-none{outline:2px solid transparent;outline-offset:2px}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible,.w-form__status:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__error:not(.p-message){color:var(--_danger)}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small);color:var(--_danger)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{color:var(--_danger);font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;font-size:12px;color:var(--_muted)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class Mc extends Di {
  static get wippyConfig() {
    return {
      propsSchema: qi.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Dc
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Bc,
      plugins: [mi],
      providers(t, n) {
        t.provide(pn, n);
      }
    };
  }
}
kr(import.meta.url, Mc);
//# sourceMappingURL=index.js.map
