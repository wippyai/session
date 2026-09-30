import { ref as W, readonly as uo, getCurrentInstance as pn, onMounted as tn, nextTick as Ge, watch as ae, reactive as nn, renderSlot as ue, openBlock as h, createBlock as K, Teleport as nr, createCommentVNode as N, useId as Et, mergeProps as U, h as co, createApp as po, inject as ft, createElementBlock as v, createElementVNode as j, createTextVNode as re, toDisplayString as B, resolveComponent as Ye, resolveDirective as rr, withDirectives as or, resolveDynamicComponent as ar, withCtx as ne, normalizeClass as L, Transition as fo, onUnmounted as Lt, computed as P, watchEffect as mo, defineComponent as pe, Fragment as ee, renderList as he, createVNode as H, unref as $, withModifiers as ir } from "vue";
import { addCollection as ho, Icon as be } from "@iconify/vue";
import * as rn from "@wippy-fe/proxy";
import { config as fn, addIcons as bo, on as Ue, applyThemeMode as vt, host as vo, hostCss as go, loadCss as yo, define as wo } from "@wippy-fe/proxy";
import { getActivePinia as xo, createPinia as ko, setActivePinia as _o } from "pinia";
var $o = Object.defineProperty, mn = Object.getOwnPropertySymbols, So = Object.prototype.hasOwnProperty, Po = Object.prototype.propertyIsEnumerable, hn = (e, t, n) => t in e ? $o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Co = (e, t) => {
  for (var n in t || (t = {})) So.call(t, n) && hn(e, n, t[n]);
  if (mn) for (var n of mn(t)) Po.call(t, n) && hn(e, n, t[n]);
  return e;
};
function Re(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ft(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, l;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Ft(e[a], t[a], n)) return !1;
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
  for (a = s; a-- !== 0; ) if (l = f[a], !Ft(e[l], t[l], n)) return !1;
  return !0;
}
function To(e, t) {
  return Ft(e, t);
}
function on(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function X(e) {
  return !Re(e);
}
function bn(e, t) {
  return null;
}
function an(e, t, n) {
  return n ? bn() === bn() : To(e, t);
}
function Oo(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (an(e, n)) return !0;
  }
  return !1;
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function sr(e = {}, t = {}) {
  let n = Co({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    _e(t[o]) && o in e && _e(e[o]) ? n[o] = sr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Ao(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : sr(t, n), {});
}
function fe(e, ...t) {
  return on(e) ? e(...t) : e;
}
function ce(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ke(e) {
  return ce(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function sn(e, t = "", n = {}) {
  let r = ke(t).split("."), o = r.shift();
  if (o) {
    if (_e(e)) {
      let a = Object.keys(e).find((s) => ke(s) === o) || "";
      return sn(fe(e[a], n), r.join("."), n);
    }
    return;
  }
  return fe(e, n);
}
function lr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Eo(e) {
  return X(e) && !isNaN(e);
}
function je(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Lo(...e) {
  return Ao(...e);
}
function Ke(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function jo(e) {
  return ce(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function ur(e) {
  return ce(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function dr() {
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
function $e(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [$e(...r)] : Object.entries(r).map(([s, l]) => l ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function No(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Io(e, t) {
  if (e && t) {
    let n = (r) => {
      No(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function It(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function vn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function zo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ro(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Vo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Ro(e));
}
function mt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function _t(e, t = {}) {
  if (mt(e)) {
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
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? _t(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Fo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return _t(r, t), r.append(...n), r;
  }
}
function Bo(e, t) {
  return mt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Do(e, t) {
  if (mt(e)) {
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
function Mo(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || vn(document.documentElement) || vn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function qo(e, t) {
  return e ? e.offsetHeight : 0;
}
function yn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function cr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Uo(e, t = "", n) {
  mt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var gt = {};
function Wo(e = "pui_id_") {
  return Object.hasOwn(gt, e) || (gt[e] = 0), gt[e]++, `${e}${gt[e]}`;
}
var Ho = Object.defineProperty, Ko = Object.defineProperties, Go = Object.getOwnPropertyDescriptors, $t = Object.getOwnPropertySymbols, pr = Object.prototype.hasOwnProperty, fr = Object.prototype.propertyIsEnumerable, wn = (e, t, n) => t in e ? Ho(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ye = (e, t) => {
  for (var n in t || (t = {})) pr.call(t, n) && wn(e, n, t[n]);
  if ($t) for (var n of $t(t)) fr.call(t, n) && wn(e, n, t[n]);
  return e;
}, zt = (e, t) => Ko(e, Go(t)), Ce = (e, t) => {
  var n = {};
  for (var r in e) pr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && $t) for (var r of $t(e)) t.indexOf(r) < 0 && fr.call(e, r) && (n[r] = e[r]);
  return n;
}, Yo = dr(), se = Yo, Qe = /{([^}]*)}/g, mr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, hr = /var\([^)]+\)/g;
function xn(e) {
  return ce(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Qo(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Zo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Bt(e = "", t = "") {
  return Zo(`${ce(e, !1) && ce(t, !1) ? `${e}-` : e}${t}`);
}
function br(e = "", t = "") {
  return `--${Bt(e, t)}`;
}
function Jo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function vr(e, t = "", n = "", r = [], o) {
  if (ce(e)) {
    let a = e.trim();
    if (Jo(a)) return;
    if (je(a, Qe)) {
      let s = a.replaceAll(Qe, (l) => {
        let i = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => je(u, d)));
        return `var(${br(n, ur(i.join("-")))}${X(o) ? `, ${o}` : ""})`;
      });
      return je(s.replace(hr, "0"), mr) ? `calc(${s})` : s;
    }
    return a;
  } else if (Eo(e)) return e;
}
function Xo(e, t, n) {
  ce(t, !1) && e.push(`${t}:${n};`);
}
function Fe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function gr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let i = [], u = 0, d = "", c = null, f = 0;
    for (; u <= s.length; ) {
      let m = s[u];
      if ((m === '"' || m === "'" || m === "`") && s[u - 1] !== "\\" && (c = c === m ? null : m), !c && (m === "(" && f++, m === ")" && f--, (m === "," || u === s.length) && f === 0)) {
        let y = d.trim();
        y.startsWith("dt(") ? i.push(gr(y, l)) : i.push(r(y)), d = "", u++;
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
var Ne = (...e) => ea(J.getTheme(), ...e), ea = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = J.defaults || {}, { prefix: s, transform: l } = e?.options || a || {}, i = je(t, Qe) ? t : `{${t}}`;
    return r === "value" || Re(r) && l === "strict" ? J.getTokenValue(t) : vr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function yt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = fe(t[a], { dt: Ne })) != null ? s : "");
    }, "");
    return gr(n, Ne);
  }
  return fe(e, { dt: Ne });
}
function ta(e, t = {}) {
  let n = J.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], l = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let f in d) {
      let m = d[f], y = Qo(m), _ = je(f, a) ? Bt(c) : Bt(c, ur(f));
      if (_e(y)) i.push({ node: y, path: _ });
      else {
        let b = br(_), x = vr(y, _, r, [a]);
        Xo(l, b, x);
        let S = _;
        r && S.startsWith(r + "-") && (S = S.slice(r.length + 1)), s.push(S.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: Fe(o, u) };
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
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return ta(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, l, i, u, d, c;
  let { preset: f, options: m } = t, y, _, b, x, S, C, p;
  if (X(f) && m.transform !== "strict") {
    let { primitive: g, semantic: k, extend: w } = f, R = k || {}, { colorScheme: T } = R, V = Ce(R, ["colorScheme"]), A = w || {}, { colorScheme: F } = A, Q = Ce(A, ["colorScheme"]), D = T || {}, { dark: oe } = D, Oe = Ce(D, ["dark"]), Se = F || {}, { dark: O } = Se, E = Ce(Se, ["dark"]), z = X(g) ? this._toVariables({ primitive: g }, m) : {}, M = X(V) ? this._toVariables({ semantic: V }, m) : {}, ie = X(Oe) ? this._toVariables({ light: Oe }, m) : {}, me = X(oe) ? this._toVariables({ dark: oe }, m) : {}, Ae = X(Q) ? this._toVariables({ semantic: Q }, m) : {}, ht = X(E) ? this._toVariables({ light: E }, m) : {}, Pe = X(O) ? this._toVariables({ dark: O }, m) : {}, [bt, Hr] = [(a = z.declarations) != null ? a : "", z.tokens], [Kr, Gr] = [(s = M.declarations) != null ? s : "", M.tokens || []], [Yr, Qr] = [(l = ie.declarations) != null ? l : "", ie.tokens || []], [Zr, Jr] = [(i = me.declarations) != null ? i : "", me.tokens || []], [Xr, eo] = [(u = Ae.declarations) != null ? u : "", Ae.tokens || []], [to, no] = [(d = ht.declarations) != null ? d : "", ht.tokens || []], [ro, oo] = [(c = Pe.declarations) != null ? c : "", Pe.tokens || []];
    y = this.transformCSS(e, bt, "light", "variable", m, r, o), _ = Hr;
    let ao = this.transformCSS(e, `${Kr}${Yr}`, "light", "variable", m, r, o), io = this.transformCSS(e, `${Zr}`, "dark", "variable", m, r, o);
    b = `${ao}${io}`, x = [.../* @__PURE__ */ new Set([...Gr, ...Qr, ...Jr])];
    let so = this.transformCSS(e, `${Xr}${to}color-scheme:light`, "light", "variable", m, r, o), lo = this.transformCSS(e, `${ro}color-scheme:dark`, "dark", "variable", m, r, o);
    S = `${so}${lo}`, C = [.../* @__PURE__ */ new Set([...eo, ...no, ...oo])], p = fe(f.css, { dt: Ne });
  }
  return { primitive: { css: y, tokens: _ }, semantic: { css: b, tokens: x }, global: { css: S, tokens: C }, style: p };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var l, i, u;
  let d, c, f;
  if (X(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), y = t, { colorScheme: _, extend: b, css: x } = y, S = Ce(y, ["colorScheme", "extend", "css"]), C = b || {}, { colorScheme: p } = C, g = Ce(C, ["colorScheme"]), k = _ || {}, { dark: w } = k, R = Ce(k, ["dark"]), T = p || {}, { dark: V } = T, A = Ce(T, ["dark"]), F = X(S) ? this._toVariables({ [m]: ye(ye({}, S), g) }, n) : {}, Q = X(R) ? this._toVariables({ [m]: ye(ye({}, R), A) }, n) : {}, D = X(w) ? this._toVariables({ [m]: ye(ye({}, w), V) }, n) : {}, [oe, Oe] = [(l = F.declarations) != null ? l : "", F.tokens || []], [Se, O] = [(i = Q.declarations) != null ? i : "", Q.tokens || []], [E, z] = [(u = D.declarations) != null ? u : "", D.tokens || []], M = this.transformCSS(m, `${oe}${Se}`, "light", "variable", n, o, a, s), ie = this.transformCSS(m, E, "dark", "variable", n, o, a, s);
    d = `${M}${ie}`, c = [.../* @__PURE__ */ new Set([...Oe, ...O, ...z])], f = fe(x, { dt: Ne });
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
  return o ? `@layer ${fe(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), l = Object.entries(r).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [u, d]) => {
    if (_e(d) && Object.hasOwn(d, "css")) {
      let c = Ke(d.css), f = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${f}" ${l}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let l = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((d, [c, f]) => d.push(`${c}="${f}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Ke(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(l, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Qe.test(this.value)) {
      let c = this.value.trim().replace(Qe, (f) => {
        var m;
        let y = f.slice(1, -1), _ = this.tokens[y];
        if (!_) return console.warn(`Token not found for path: ${y}`), "__UNRESOLVED__";
        let b = _.computed(l, i, u);
        return Array.isArray(b) && b.length === 2 ? `light-dark(${b[0].value},${b[1].value})` : (m = b?.value) != null ? m : "__UNRESOLVED__";
      });
      d = mr.test(c.replace(hr, "0")) ? `calc(${c})` : c;
    }
    return Re(i.binding) && delete i.binding, u.pop(), { colorScheme: l, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, i, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let f = je(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${xn(d)}` : xn(d), m = u ? `${u}.${d}` : d;
      _e(c) ? s(c, f, m) : (o[f] || (o[f] = { paths: [], computed: (y, _ = {}, b = []) => {
        if (o[f].paths.length === 1) return o[f].paths[0].computed(o[f].paths[0].scheme, _.binding, b);
        if (y && y !== "none") for (let x = 0; x < o[f].paths.length; x++) {
          let S = o[f].paths[x];
          if (S.scheme === y) return S.computed(y, _.binding, b);
        }
        return o[f].paths.map((x) => x.computed(x.scheme, _[x.scheme], b));
      } }), o[f].paths.push({ path: m, value: c, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((i) => !je(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Ce(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Fe(X(t) ? `${e}${t},${e} ${t}` : e, r) : Fe(e, Fe(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, l) {
  if (X(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: f }) => (X(f) && (d += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, l, c, t)), d), "") : Fe(l ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      _e(i) && (u.name = fe(i.name, { name: e, type: r })), X(u.name) && (t = Fe(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, J = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = zt(ye({}, t), { options: ye(ye({}, this.defaults.options), t.options) }), this._tokens = ge.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = zt(ye({}, this.theme), { preset: e }), this._tokens = ge.createTokens(e, this.defaults), this.clearLoadedStyleNames(), se.emit("preset:change", e), se.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = zt(ye({}, this.theme), { options: e }), this.clearLoadedStyleNames(), se.emit("options:change", e), se.emit("theme:change", this.theme);
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
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ge.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ge.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
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
function Ze(e) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ze(e);
}
function kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function _n(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kn(Object(n), !0).forEach(function(r) {
      ra(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ra(e, t, n) {
  return (t = oa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oa(e) {
  var t = aa(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function aa(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ze(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ia(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  pn() && pn().components ? tn(e) : t ? e() : Ge(e);
}
var sa = 0;
function la(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = W(!1), r = W(e), o = W(null), a = cr() ? window.document : void 0, s = t.document, l = s === void 0 ? a : s, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, f = t.name, m = f === void 0 ? "style_".concat(++sa) : f, y = t.id, _ = y === void 0 ? void 0 : y, b = t.media, x = b === void 0 ? void 0 : b, S = t.nonce, C = S === void 0 ? void 0 : S, p = t.first, g = p === void 0 ? !1 : p, k = t.onMounted, w = k === void 0 ? void 0 : k, R = t.onUpdated, T = R === void 0 ? void 0 : R, V = t.onLoad, A = V === void 0 ? void 0 : V, F = t.props, Q = F === void 0 ? {} : F, D = function() {
  }, oe = function(O) {
    var E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var z = _n(_n({}, Q), E), M = z.name || m, ie = z.id || _, me = z.nonce || C;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || l.getElementById(ie) || l.createElement("style"), o.value.isConnected || (r.value = O || e, _t(o.value, {
        type: "text/css",
        id: ie,
        media: x,
        nonce: me
      }), g ? l.head.prepend(o.value) : l.head.appendChild(o.value), Uo(o.value, "data-primevue-style-id", M), _t(o.value, z), o.value.onload = function(Ae) {
        return A?.(Ae, {
          name: M
        });
      }, w?.(M)), !n.value && (D = ae(r, function(Ae) {
        o.value.textContent = Ae, T?.(M);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Oe = function() {
    !l || !n.value || (D(), Vo(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && ia(oe), {
    id: _,
    name: m,
    el: o,
    css: r,
    unload: Oe,
    load: oe,
    isLoaded: uo(n)
  };
}
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
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
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ca(e, t) {
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
function pa(e) {
  if (Array.isArray(e)) return e;
}
function An(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Rt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(r) {
      fa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fa(e, t, n) {
  return (t = ma(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ma(e) {
  var t = ha(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function ha(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function wt(e, t) {
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
}, va = {}, ga = {}, Z = {
  name: "base",
  css: ba,
  style: na,
  classes: va,
  inlineStyles: ga,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(yt($n || ($n = wt(["", ""])), t));
    return X(o) ? la(Ke(o), Rt({
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
      return J.transformCSS(n.name || t.name, "".concat(o).concat(yt(Sn || (Sn = wt(["", ""])), r)));
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
  getPresetTheme: function(t, n, r) {
    return J.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return J.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = fe(this.css, {
        dt: Ne
      }) || "", o = Ke(yt(Pn || (Pn = wt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, l) {
        var i = Tn(l, 2), u = i[0], d = i[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return X(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return J.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [J.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = yt(Cn || (Cn = wt(["", ""])), fe(this.style, {
        dt: Ne
      })), s = Ke(J.transformCSS(o, a)), l = Object.entries(n).reduce(function(i, u) {
        var d = Tn(u, 2), c = d[0], f = d[1];
        return i.push("".concat(c, '="').concat(f, '"')) && i;
      }, []).join(" ");
      X(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Rt(Rt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Le = dr();
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function En(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function xt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(r) {
      ya(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ya(e, t, n) {
  return (t = wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wa(e) {
  var t = xa(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function xa(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
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
    config: nn(t)
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
  var n = W(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !J.isStyleNameLoaded("common")) {
      var d, c, f = ((d = Z.getCommonTheme) === null || d === void 0 ? void 0 : d.call(Z)) || {}, m = f.primitive, y = f.semantic, _ = f.global, b = f.style, x = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      Z.load(m?.css, xt({
        name: "primitive-variables"
      }, x)), Z.load(y?.css, xt({
        name: "semantic-variables"
      }, x)), Z.load(_?.css, xt({
        name: "global-variables"
      }, x)), Z.loadStyle(xt({
        name: "global-style"
      }, x), b), J.setLoadedStyleName("common");
    }
  };
  se.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ae(t.config, function(i, u) {
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
    n.value || J.setTheme(i), t.config.unstyled || r(), n.value = !1, Le.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ae(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), Le.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Be.push(o), Be.push(a), Be.push(s), Be.push(l);
}
var Ca = {
  install: function(t, n) {
    var r = Lo(ka, n);
    $a(t, r);
  }
}, yr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = cr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ta(e, t, n, r, o, a) {
  return a.inline ? ue(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (h(), K(nr, {
    key: 1,
    to: n.appendTo
  }, [ue(e.$slots, "default")], 8, ["to"])) : N("", !0);
}
yr.render = Ta;
var Ee = {
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
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Et();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ln = Z.extend({
  name: "common"
});
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function Aa(e) {
  return kr(e) || Ea(e) || xr(e) || wr();
}
function Ea(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Me(e, t) {
  return kr(e) || La(e, t) || xr(e, t) || wr();
}
function wr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xr(e, t) {
  if (e) {
    if (typeof e == "string") return Dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(e, t) : void 0;
  }
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function La(e, t) {
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
function kr(e) {
  if (Array.isArray(e)) return e;
}
function jn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function G(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(r) {
      We(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function We(e, t, n) {
  return (t = ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ja(e) {
  var t = Na(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Na(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
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
        var r = this;
        se.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, s, l, i, u, d, c, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, y = f ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = y || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var _ = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, b = _ ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, x = _ ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = x || b) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Oa(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Bo(mt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = G({
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
      return on(t) ? t.apply(void 0, r) : U.apply(void 0, r);
    },
    _load: function() {
      Ee.isStyleNameLoaded("base") || (Z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ee.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ee.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ln.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ee.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      X(t) && Z.load(t, G({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!J.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, l = a.semantic, i = a.global, u = a.style;
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
          var d, c, f, m, y = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, _ = y.css, b = y.style;
          (f = this.$style) === null || f === void 0 || f.load(_, G({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(G({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), b), J.setLoadedStyleName(this.$style.name);
        }
        if (!J.isStyleNameLoaded("layer-order")) {
          var x, S, C = (x = this.$style) === null || x === void 0 || (S = x.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(x);
          Z.load(C, G({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), J.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, G({
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
      Ee.clearLoadedStyleNames(), se.on("theme:change", t);
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return sn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, G(G({}, o), {}, {
        global: f || {}
      })), y = this._getPTDatasets(r);
      return u || !u && m ? c ? this._mergeProps(c, f, m, y) : G(G(G({}, f), m), y) : G(G({}, m), y);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return U(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && X((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && G(G({}, r === "root" && G(G(We({}, "".concat(o, "name"), ke(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && We({}, "".concat(o, "extend"), ke(this.$.type.name))), {}, We({}, "".concat(this.$attrSelector), ""))), {}, We({}, "".concat(o, "section"), ke(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ce(t) || lr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(l) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = ke(r), f = ke(n.$name);
        return (i = u ? c !== f ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(_) {
        return n(_, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = l.mergeSections, u = i === void 0 ? !0 : i, d = l.mergeProps, c = d === void 0 ? !1 : d, f = a(t.originalValue), m = a(t.value);
        return f === void 0 && m === void 0 ? void 0 : ce(m) ? m : ce(f) ? f : u || !u && m ? c ? this._mergeProps(c, f, m) : G(G({}, f), m) : m;
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
      return this._getPTValue(this.pt, t, G(G({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = U(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, G({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, G(G({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, G(G({}, this.$params), r)), a = this._getOptionValue(Ln.inlineStyles, t, G(G({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return fe(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, G({}, n.$params)) || fe(r, G({}, n.$params));
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
        var o = Me(r, 1), a = o[0];
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
        var n = Me(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Me(n, 2), o = r[0], a = r[1], s = o.split(":"), l = Aa(s), i = Dt(l).slice(1);
        return i?.reduce(function(u, d, c, f) {
          return !u[d] && (u[d] = c === f.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Me(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Me(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
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
`, za = Z.extend({
  name: "baseicon",
  css: Ia
});
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
function In(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(r) {
      Ra(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ra(e, t, n) {
  return (t = Va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Va(e) {
  var t = Fa(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Fa(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var jt = {
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
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
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
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ma(e, t) {
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
function qa(e) {
  if (Array.isArray(e)) return e;
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
function Y(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vn(Object(n), !0).forEach(function(r) {
      Mt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Mt(e, t, n) {
  return (t = Ua(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ua(e) {
  var t = Wa(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Wa(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var q = {
  _getMeta: function() {
    return [_e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], fe(_e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: sn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var S = q._getOptionValue.apply(q, arguments);
      return ce(S) || lr(S) ? {
        class: S
      } : S;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, f = u.mergeProps, m = f === void 0 ? !1 : f, y = l ? q._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, _ = q._usePT(r, q._getPT(o, r.$name), i, a, Y(Y({}, s), {}, {
      global: y || {}
    })), b = q._getPTDatasets(r, a);
    return c || !c && _ ? m ? q._mergeProps(r, m, y, _, b) : Y(Y(Y({}, y), _), b) : Y(Y({}, _), b);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return Y(Y({}, n === "root" && Mt({}, "".concat(r, "name"), ke(t.$name))), {}, Mt({}, "".concat(r, "section"), ke(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var l, i = r ? r(s) : s, u = ke(n);
      return (l = i?.[u]) !== null && l !== void 0 ? l : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(b) {
      return r(b, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, i = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, f = c === void 0 ? !1 : c, m = s(n.originalValue), y = s(n.value);
      return m === void 0 && y === void 0 ? void 0 : ce(y) ? y : ce(m) ? m : d || !d && y ? f ? q._mergeProps(t, f, m, y) : Y(Y({}, m), y) : y;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return q._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = q._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    q._loadCoreStyles(n, s), q._loadThemeStyles(n, s), q._loadScopedThemeStyles(n, s), q._removeThemeListeners(n), n.$loadStyles = function() {
      return q._loadThemeStyles(n, s);
    }, q._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ee.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      Z.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ee.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!J.isStyleNameLoaded("common")) {
        var s, l, i = ((s = o.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = i.primitive, d = i.semantic, c = i.global, f = i.style;
        Z.load(u?.css, Y({
          name: "primitive-variables"
        }, a)), Z.load(d?.css, Y({
          name: "semantic-variables"
        }, a)), Z.load(c?.css, Y({
          name: "global-variables"
        }, a)), Z.loadStyle(Y({
          name: "global-style"
        }, a), f), J.setLoadedStyleName("common");
      }
      if (!J.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, y, _, b, x = ((m = o.$style) === null || m === void 0 || (y = m.getDirectiveTheme) === null || y === void 0 ? void 0 : y.call(m)) || {}, S = x.css, C = x.style;
        (_ = o.$style) === null || _ === void 0 || _.load(S, Y({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (b = o.$style) === null || b === void 0 || b.loadStyle(Y({
          name: "".concat(o.$style.name, "-style")
        }, a), C), J.setLoadedStyleName(o.$style.name);
      }
      if (!J.isStyleNameLoaded("layer-order")) {
        var p, g, k = (p = o.$style) === null || p === void 0 || (g = p.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(p);
        Z.load(k, Y({
          name: "layer-order",
          first: !0
        }, a)), J.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, l = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = l.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, Y({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ee.clearLoadedStyleNames(), se.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    se.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var l, i, u = "on".concat(jo(n)), d = q._getConfig(o, a), c = r?.$instance, f = q._usePT(c, q._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), q._getOptionValue, "hooks.".concat(u)), m = q._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], q._getOptionValue, "hooks.".concat(u)), y = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    f?.(c, y), m?.(c, y);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return on(t) ? t.apply(void 0, r) : U.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, i, u, d, c) {
      var f, m, y, _;
      i._$instances = i._$instances || {};
      var b = q._getConfig(u, d), x = i._$instances[t] || {}, S = Re(x) ? Y(Y({}, n), n?.methods) : {};
      i._$instances[t] = Y(Y({}, x), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: x.$el || i || void 0,
        $style: Y({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: b,
        $attrSelector: (f = i.$pd) === null || f === void 0 || (f = f[t]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return q._getPT(b?.pt, void 0, function(p) {
            var g;
            return p == null || (g = p.directives) === null || g === void 0 ? void 0 : g[t];
          });
        },
        isUnstyled: function() {
          var p, g;
          return ((p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.unstyled) !== void 0 ? (g = i._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : b?.unstyled;
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
          var p, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return q._getPTValue(i._$instances[t], (p = i._$instances[t]) === null || p === void 0 || (p = p.$binding) === null || p === void 0 || (p = p.value) === null || p === void 0 ? void 0 : p.pt, g, Y({}, k));
        },
        ptmo: function() {
          var p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", k = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return q._getPTValue(i._$instances[t], p, g, k, !1);
        },
        cx: function() {
          var p, g, k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (p = i._$instances[t]) !== null && p !== void 0 && p.isUnstyled() ? void 0 : q._getOptionValue((g = i._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, k, Y({}, w));
        },
        sx: function() {
          var p, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return k ? q._getOptionValue((p = i._$instances[t]) === null || p === void 0 || (p = p.$style) === null || p === void 0 ? void 0 : p.inlineStyles, g, Y({}, w)) : void 0;
        }
      }, S), i.$instance = i._$instances[t], (m = (y = i.$instance)[l]) === null || m === void 0 || m.call(y, i, u, d, c), i["$".concat(t)] = i.$instance, q._hook(t, l, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = Y(Y({}, (_ = i.$pd) === null || _ === void 0 ? void 0 : _[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(l) {
      var i, u, d, c = l._$instances[t], f = c?.watch, m = function(b) {
        var x, S = b.newValue, C = b.oldValue;
        return f == null || (x = f.config) === null || x === void 0 ? void 0 : x.call(c, S, C);
      }, y = function(b) {
        var x, S = b.newValue, C = b.oldValue;
        return f == null || (x = f["config.ripple"]) === null || x === void 0 ? void 0 : x.call(c, S, C);
      };
      c.$watchersCallback = {
        config: m,
        "config.ripple": y
      }, f == null || (i = f.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Le.on("config:change", m), f == null || (u = f["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Le.on("config:ripple:change", y);
    }, a = function(l) {
      var i = l._$instances[t].$watchersCallback;
      i && (Le.off("config:change", i.config), Le.off("config:ripple:change", i["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, i, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Wo("pd")
        }, r("created", l, i, u, d);
      },
      beforeMount: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", l, i, u, d), o(l);
      },
      mounted: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", l, i, u, d);
      },
      beforeUpdate: function(l, i, u, d) {
        r("beforeUpdate", l, i, u, d);
      },
      updated: function(l, i, u, d) {
        var c;
        q._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", l, i, u, d);
      },
      beforeUnmount: function(l, i, u, d) {
        var c;
        a(l), q._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, i, u, d);
      },
      unmounted: function(l, i, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, i, u, d);
      }
    };
  },
  extend: function() {
    var t = q._getMeta.apply(q, arguments), n = zn(t, 2), r = n[0], o = n[1];
    return Y({
      extend: function() {
        var s = q._getMeta.apply(q, arguments), l = zn(s, 2), i = l[0], u = l[1];
        return q.extend(i, Y(Y(Y({}, o), o?.methods), u));
      }
    }, q._extend(r, o));
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
}, Ga = Z.extend({
  name: "ripple-directive",
  style: Ha,
  classes: Ka
}), Ya = q.extend({
  style: Ga
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
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
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function Xa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ei(e) {
  if (Array.isArray(e)) return qt(e);
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Fn(e, t, n) {
  return (t = ti(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ti(e) {
  var t = ni(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function ni(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _r = Ya.extend("ripple", {
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
      n || (n = Fo("span", Fn(Fn({
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
        if (!this.isUnstyled() && It(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !gn(o) && !yn(o)) {
          var a = Math.max(zo(r), qo(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = Mo(r), l = t.pageX - s.left + document.body.scrollTop - yn(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - gn(o) / 2;
        o.style.top = i + "px", o.style.left = l + "px", !this.isUnstyled() && Io(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && It(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && It(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Qa(t.children).find(function(n) {
        return Do(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ri = "data-wippy-overlay-layer";
function $r() {
  return typeof window < "u" && typeof window.document < "u";
}
function Sr() {
  return $r() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function oi() {
  return Sr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
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
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Bn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), St.set(e, r);
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
function Ut(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Pt = /* @__PURE__ */ new Set(), un = /* @__PURE__ */ new WeakMap();
let Dn = !1, Wt = !1;
function ui() {
  Wt = !1;
  for (const e of Pt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ln(t);
      Pt.delete(e), un.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ut(e);
  }
}
function Mn() {
  Wt || (Wt = !0, requestAnimationFrame(ui));
}
function di(e) {
  const t = document.createElement("div");
  t.setAttribute(ri, "");
  const n = Sr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ut(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && si(l, a);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && ln(l);
    }
    t.isConnected && t.childElementCount > 0 && Ut(t);
  });
  return r.observe(t, { childList: !0 }), un.set(t, r), Pt.add(t), Dn || (Dn = !0, window.addEventListener("scroll", Mn, { capture: !0, passive: !0 }), window.addEventListener("resize", Mn, { passive: !0 })), t;
}
function qn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = di(e.hostRoot), oi())) {
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
  const e = yr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    $r() && (this.hostRoot = li(this.$el), this.mounted = !0, this.hostRoot && (this.inline || qn(this), this.$watch("inline", (t) => {
      t ? Un(this) : qn(this);
    })));
  }, e.render = function() {
    return this.inline ? ue(this.$slots, "default", { key: 0 }) : this.mounted ? co(nr, { key: 1, to: this.resolvedTarget || document.body }, [
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
var Ht = "data-wippy-visible";
function Hn(e) {
  const t = e.getAttribute(Ht);
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
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, l] of Object.entries(o)) {
            const i = typeof l == "string" ? Kn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? Kn(r) : null;
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
  n && Pr(e, n, "@wippy-fe/css-variables-bridge");
}
function wi(e, t) {
  const r = (t ?? hi).map(async (o) => {
    const a = go[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await yo(a);
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
function xi(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Pr(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function ki(e, t) {
  Pr(e, t, "@wippy-fe/custom-css");
}
function Cr(e) {
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
function Vt(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), l = _i(o);
    if (s === null) {
      a.default !== void 0 && (n[l] = a.default);
      continue;
    }
    const i = $i(o, s, a);
    i.error ? r.push(i.error) : n[l] = i.value;
  }
  return { props: n, errors: r };
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ht])];
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
    return Cr(this);
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
        const a = Vt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Si(
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
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && wi(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, bo(ho);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Ue("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Vt(this, e.propsSchema);
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
  _applyTheme(e = vo.getThemeMode?.()) {
    vt(e, this), this._container && vt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), vt("auto", this), this._container && vt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ht) {
      const l = this._hostVisible, i = Hn(this);
      if (i === l)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, l), this.onHostVisibilityChanged(i, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Vt(this, r.propsSchema);
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
function Ci(e) {
  return e.__wippyHostBus ?? null;
}
function Ti(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Oi = Object.defineProperty, Ai = (e, t, n) => t in e ? Oi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ve = (e, t, n) => Ai(e, typeof t != "symbol" ? t + "" : t, n), Tr = /* @__PURE__ */ Symbol("wippy:emit"), Or = /* @__PURE__ */ Symbol("wippy:props"), Ar = /* @__PURE__ */ Symbol("wippy:props_error"), Ei = /* @__PURE__ */ Symbol("wippy:content"), Li = /* @__PURE__ */ Symbol("wippy:panel-id"), ji = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ni = /* @__PURE__ */ Symbol("wippy:host"), Ii = /* @__PURE__ */ Symbol("wippy:host-visibility");
function zi() {
  const e = ft(Or);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ri() {
  const e = ft(Tr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Vi() {
  const e = ft(Ar);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Fi = class extends Pi {
  constructor() {
    super(...arguments), Ve(this, "_vueApp", null), Ve(this, "_propsRef", W({})), Ve(this, "_errorsRef", W([])), Ve(this, "_contentRef", W(null)), Ve(this, "_hostVisibilityRef", W(null)), Ve(this, "_bridgeAbort", null);
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
      const d = xo(), c = po(u.rootComponent);
      this._vueApp = c;
      const f = ko();
      if (u.piniaPlugins)
        for (const m of u.piniaPlugins)
          f.use(m);
      if (c.use(f), u.plugins)
        for (const m of u.plugins)
          c.use(m);
      c.provide(Or, this._propsRef), c.provide(Ar, this._errorsRef), c.provide(Tr, this.emitEvent.bind(this)), c.provide(Ei, this._contentRef), c.provide(Ii, this._hostVisibilityRef), c.provide(Li, Ti(this)), c.provide(ji, Ci(this)), c.provide(Ni, Cr(this)), u.providers && u.providers(c, this), c.mount(t), d && _o(d);
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
var Er = {
  name: "SpinnerIcon",
  extends: jt
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
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function Wi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hi(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ki(e, t, n, r, o, a) {
  return h(), v("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Mi(t[0] || (t[0] = [j("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Er.render = Ki;
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
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": X(n.value) && String(n.value).length === 1,
      "p-badge-dot": Re(n.value) && !r.$slots.default,
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
}, Qi = Z.extend({
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
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Lr = {
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
function ts(e, t, n, r, o, a) {
  return h(), v("span", U({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [ue(e.$slots, "default", {}, function() {
    return [re(B(e.value), 1)];
  })], 16, es);
}
Lr.render = ts;
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
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function xe(e, t, n) {
  return (t = rs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rs(e) {
  var t = os(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function os(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var as = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", xe(xe(xe(xe(xe(xe(xe(xe(xe({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", xe({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, is = Z.extend({
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
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function de(e, t, n) {
  return (t = ls(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ls(e) {
  var t = us(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function us(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
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
    SpinnerIcon: Er,
    Badge: Lr
  },
  directives: {
    ripple: _r
  }
}, ds = ["data-p"], cs = ["data-p"];
function ps(e, t, n, r, o, a) {
  var s = Ye("SpinnerIcon"), l = Ye("Badge"), i = rr("ripple");
  return e.asChild ? ue(e.$slots, "default", {
    key: 1,
    class: L(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : or((h(), K(ar(e.as), U({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: ne(function() {
      return [ue(e.$slots, "default", {}, function() {
        return [e.loading ? ue(e.$slots, "loadingicon", U({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (h(), v("span", U({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (h(), K(s, U({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ue(e.$slots, "icon", U({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (h(), v("span", U({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, ds)) : N("", !0)];
        }), e.label ? (h(), v("span", U({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), B(e.label), 17, cs)) : N("", !0), e.badge ? (h(), K(l, {
          key: 3,
          value: e.badge,
          class: L(e.badgeClass),
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
var jr = {
  name: "TimesIcon",
  extends: jt
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
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function bs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vs(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function gs(e, t, n, r, o, a) {
  return h(), v("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), fs(t[0] || (t[0] = [j("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jr.render = gs;
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
}, xs = Z.extend({
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
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Yn(e, t, n) {
  return (t = _s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _s(e) {
  var t = $s(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function $s(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
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
    ripple: _r
  },
  components: {
    TimesIcon: jr
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
function Qn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Zn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qn(Object(n), !0).forEach(function(r) {
      Ss(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ss(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Cs(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ts = ["data-p"], Os = ["data-p"], As = ["data-p"], Es = ["aria-label", "data-p"], Ls = ["data-p"];
function js(e, t, n, r, o, a) {
  var s = Ye("TimesIcon"), l = rr("ripple");
  return h(), K(fo, U({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ne(function() {
      return [o.visible ? (h(), v("div", U({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [j("div", U({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? ue(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (h(), v("div", U({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [ue(e.$slots, "icon", {
        class: L(e.cx("icon"))
      }, function() {
        return [(h(), K(ar(e.icon ? "span" : null), U({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (h(), v("div", U({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [ue(e.$slots, "default")], 16, As)) : N("", !0), e.closable ? or((h(), v("button", U({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, Zn(Zn({}, e.closeButtonProps), e.ptm("closeButton"))), [ue(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (h(), v("i", U({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, Ls)) : (h(), K(s, U({
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
  const e = rn.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Fs(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function o() {
    n && clearTimeout(n), n = null;
  }
  ae(() => [e.value?.artifact_id, e.value?.status, e.value?.delivery], () => {
    const a = e.value;
    if (!a || a.status !== "idle" || a.delivery !== "pending" || r.has(a.artifact_id))
      return;
    o();
    const s = a.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== s || l.delivery !== "pending" || r.has(s) || (r.add(s), Vs()?.send({ type: "session_open", session_id: l.session_id }));
    }, Rs);
  }, { immediate: !0 }), Lt(o);
}
const Bs = 5e3;
function Ds(e, t) {
  const n = W("idle"), r = W(null), o = W(null), a = W(null);
  let s = 0, l = null, i = null, u = null, d = null;
  function c() {
    return rn.artifactState;
  }
  let f = null, m = !1;
  function y() {
    m || f || (m = !0, f = setTimeout(() => {
      f = null, b();
    }, Bs));
  }
  async function _() {
    const w = e.value;
    if (!w) {
      n.value = "idle", r.value = null, a.value = null;
      return;
    }
    const R = c();
    if (typeof R != "function") {
      n.value = "unsupported", o.value = "This form needs a newer Web Host.";
      return;
    }
    const T = ++s, V = r.value === null;
    V && (n.value = "loading");
    try {
      const A = await R(w).get();
      if (T !== s)
        return;
      r.value = A, n.value = "loaded", o.value = null, a.value = null, m = !1;
    } catch (A) {
      if (T !== s)
        return;
      const F = A instanceof Error ? A.message : "Could not load this form.";
      V ? (n.value = "error", o.value = F) : (a.value = F, y());
    }
  }
  function b() {
    return l ? (i || (i = l.then(() => (i = null, b()))), i) : (l = _().finally(() => {
      l = null;
    }), l);
  }
  function x(w) {
    d !== w && (u?.(), u = null, d = w, w && (u = Ue(`artifact:${w}`, () => {
      b();
    })));
  }
  ae(e, (w) => {
    s++, r.value = null, a.value = null, x(w), b();
  }, { immediate: !0 }), ae(t, () => {
    b();
  });
  const S = P(() => {
    const w = r.value;
    return w?.session_id && (w.status === "active" && !w.stale || w.status === "idle" && w.delivery && w.delivery !== "complete") ? w.session_id : null;
  });
  let C = null;
  ae(S, (w) => {
    C?.(), C = null, w && (C = Ue(`session:${w}:message:*`, (R) => {
      R.data?.type !== "chunk" && b();
    }));
  }, { immediate: !0 });
  const p = Ue("@visibility", (w) => {
    w && b();
  }), g = Ue("@reconnect", () => {
    b();
  });
  Lt(() => {
    s++, f && clearTimeout(f), f = null, u?.(), u = null, C?.(), C = null, p(), g();
  });
  async function k() {
    return await b(), r.value;
  }
  return { status: n, state: r, errorMessage: o, reloadError: a, reload: () => {
    b();
  }, refresh: k };
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
function Nr(e) {
  return e instanceof Error && (e.name === "ArtifactStateError" || "status" in e || "formErrors" in e);
}
function Us(e) {
  if (Nr(e))
    return { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" };
  if (qs(e)) {
    const t = e.response === void 0 && e.request !== void 0;
    return { status: e.response?.status, code: e.response?.data?.code, message: e.response?.data?.message ?? e.message, known: !0, noResponse: t };
  }
  return { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Jn(e) {
  return !Nr(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
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
      const r = t.code;
      return r === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : r === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 };
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
  const t = W(!1), n = W(null), r = W(null);
  let o = 0;
  ae(e, () => {
    o++, s();
  });
  function a(u) {
    const d = Ks(u);
    if (n.value && r.value === d)
      return n.value;
    const c = Ms();
    return n.value = c, r.value = d, c;
  }
  function s() {
    n.value = null, r.value = null;
  }
  function l() {
    return rn.artifactState;
  }
  async function i(u, d, c) {
    const f = e.value;
    if (!f)
      return { ok: !1, message: "This form cannot be submitted here." };
    const m = l();
    if (typeof m != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const y = o, _ = a(c), b = {
      form_version: u,
      request_id: _,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let x;
      try {
        x = await m(f).submit(b);
      } catch (S) {
        if (y !== o)
          return { ok: !1, ignored: !0 };
        const C = Jn(S);
        if (C)
          return { ok: !1, fieldErrors: C.errors, formErrors: C.formErrors };
        const p = Xn(S);
        if (!p.uncertain)
          return { ok: !1, message: p.message, code: p.code, retryable: p.retryable, shouldReload: p.shouldReload };
        if (await Hs(800), y !== o)
          return { ok: !1, ignored: !0 };
        try {
          x = await m(f).submit(b);
        } catch (g) {
          if (y !== o)
            return { ok: !1, ignored: !0 };
          const k = Jn(g);
          if (k)
            return { ok: !1, fieldErrors: k.errors, formErrors: k.formErrors };
          const w = Xn(g), R = w.uncertain ? Ws : w.message, T = w.uncertain ? !0 : w.retryable;
          return { ok: !1, message: R, code: w.code, retryable: T, shouldReload: w.shouldReload };
        }
      }
      return y !== o ? { ok: !1, ignored: !0 } : (s(), { ok: !0, accepted: x });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: s };
}
const dn = Symbol("wippy-form:element"), kt = "data-wippy-artifact-id";
function Ys() {
  const e = ft(dn), t = W(e?.getAttribute(kt) ?? null);
  if (e) {
    let n = null;
    tn(() => {
      t.value = e.getAttribute(kt), n = new MutationObserver(() => {
        t.value = e.getAttribute(kt);
      }), n.observe(e, { attributes: !0, attributeFilter: [kt] });
    }), Lt(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Qs(e, t) {
  const n = ft(dn);
  n && mo(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function Zs(e) {
  const t = W(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return tn(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), Lt(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
function Ct(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function er(e) {
  return typeof e == "string" ? e : Ie(e) ? e.value : null;
}
function Js(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => er(n) === t) : er(e) === t;
}
function He(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Ct);
    return t ? t.other : "";
  }
  return Ct(e) ? e.other : "";
}
function Ir(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Ct) : Ct(e);
}
function Xs(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((o) => Ie(o) && o.value === t);
  return r && Ie(r) ? r.note : "";
}
const el = 2e3, tl = 1e3;
function ze(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function zr(e) {
  return Array.from(e).length;
}
function Rr(e) {
  return zr(e.trim()) > el;
}
function nl(e) {
  return zr(e.trim()) > tl;
}
function Yt(e) {
  return e.trim();
}
function rl(e) {
  return e.trim();
}
function Tt(e, t) {
  const n = rl(t);
  return n ? { value: e, note: n } : e;
}
function Vr(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], r = e.options.map((i) => i.value), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
    for (const i of n)
      typeof i == "string" && r.includes(i) ? a.add(i) : Ie(i) && r.includes(i.value) && (a.add(i.value), o.set(i.value, i));
    const s = r.filter((i) => a.has(i)).map((i) => {
      const u = o.get(i);
      return u ? Tt(i, u.note) : i;
    }), l = n.find(ze);
    if (l) {
      const i = Yt(l.other);
      i.length > 0 && s.push({ other: i });
    }
    return s.length > 0 ? s : void 0;
  }
  if (t !== void 0) {
    if (ze(t)) {
      const n = Yt(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Ie(t) && e.options.some((n) => n.value === t.value))
      return Tt(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function ol(e, t) {
  const n = {};
  for (const r of e.fields) {
    const o = Vr(r, t[r.id]);
    o !== void 0 && (n[r.id] = o);
  }
  return n;
}
function al(e, t) {
  const n = [];
  for (const r of e.fields)
    r.required && Vr(r, t[r.id]) === void 0 && n.push(r.id);
  return n;
}
function il(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(ze) : void 0 : ze(t) ? t : void 0;
}
function sl(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = il(r, t[r.id]);
    o && Yt(o.other).length === 0 && n.push(r.id);
  }
  return n;
}
function ll(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = t[r.id];
    let a;
    if (r.multiple) {
      if (Array.isArray(o)) {
        const s = o.find(ze);
        s && (a = s.other);
      }
    } else ze(o) && (a = o.other);
    a !== void 0 && Rr(a) && n.push(r.id);
  }
  return n;
}
function Fr(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const a of e.options) {
    const s = n.find((l) => typeof l == "string" ? l === a.value : Ie(l) && l.value === a.value);
    s && r.push({ label: a.label, note: Ie(s) ? s.note : void 0 });
  }
  const o = n.find(ze);
  return o && r.push({ label: o.other, own: !0 }), r.length > 0 ? r : null;
}
function ul(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const r of e.fields) {
    const o = t[r.id];
    o !== void 0 && (n[r.id] = r.multiple ? Array.isArray(o) ? [...o] : [o] : o);
  }
  return n;
}
var Br = {
  name: "CheckIcon",
  extends: jt
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
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function fl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ml(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function hl(e, t, n, r, o, a) {
  return h(), v("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [j("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Br.render = hl;
var Dr = {
  name: "MinusIcon",
  extends: jt
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
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function yl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function wl(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function xl(e, t, n, r, o, a) {
  return h(), v("svg", U({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), bl(t[0] || (t[0] = [j("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dr.render = xl;
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
}, Nt = {
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
}, Sl = Z.extend({
  name: "checkbox",
  style: _l,
  classes: $l
}), Pl = {
  name: "BaseCheckbox",
  extends: Nt,
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
function ut(e) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ut(e);
}
function Cl(e, t, n) {
  return (t = Tl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Tl(e) {
  var t = Ol(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Ol(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
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
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function jl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Nl(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
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
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, o;
        this.binary ? o = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? o = r.filter(function(a) {
          return !an(a, n.value);
        }) : o = r ? [].concat(Al(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(o, t) : this.writeValue(o, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Oo(this.value, t);
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
    CheckIcon: Br,
    MinusIcon: Dr
  }
}, Il = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], zl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Rl = ["data-p"];
function Vl(e, t, n, r, o, a) {
  var s = Ye("CheckIcon"), l = Ye("MinusIcon");
  return h(), v("div", U({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": o.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [j("input", U({
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
  }, a.getPTOptions("input")), null, 16, zl), j("div", U({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [ue(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: o.d_indeterminate,
    class: L(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (h(), K(s, U({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : o.d_indeterminate ? (h(), K(l, U({
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
}, Dl = Z.extend({
  name: "inputtext",
  style: Fl,
  classes: Bl
}), Ml = {
  name: "BaseInputText",
  extends: Nt,
  style: Dl,
  provide: function() {
    return {
      $pcInputText: this,
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
function ql(e, t, n) {
  return (t = Ul(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ul(e) {
  var t = Wl(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Wl(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xt = {
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
      return U(this.ptmi("root", {
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
function Kl(e, t, n, r, o, a) {
  return h(), v("input", U({
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
Xt.render = Kl;
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
}, Ql = Z.extend({
  name: "radiobutton",
  style: Gl,
  classes: Yl
}), Zl = {
  name: "BaseRadioButton",
  extends: Nt,
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
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function Jl(e, t, n) {
  return (t = Xl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xl(e) {
  var t = eu(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function eu(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var en = {
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
}, tu = ["data-p-checked", "data-p-disabled", "data-p"], nu = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], ru = ["data-p"], ou = ["data-p"];
function au(e, t, n, r, o, a) {
  return h(), v("div", U({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [j("input", U({
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
  }, a.getPTOptions("input")), null, 16, nu), j("div", U({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [j("div", U({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, ou)], 16, ru)], 16, tu);
}
en.render = au;
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
    const r = e, o = n, a = Et(), s = `${a}-desc`, l = `${a}-err`, i = `${a}-other`, u = `${i}-label`, d = `${a}-other-text`, c = `${d}-label`;
    function f(T) {
      return `${a}-opt-${T}`;
    }
    const m = W(null), y = P(() => {
      const T = [];
      return r.field.description && T.push(s), !r.readonly && r.errors.length > 0 && T.push(l), T.length > 0 ? T.join(" ") : void 0;
    }), _ = P({
      get() {
        const T = r.modelValue;
        return typeof T == "string" ? T : w(T) ? qe : "";
      },
      set(T) {
        T === qe ? o("update:modelValue", { other: b.value }) : T === "" ? o("update:modelValue", void 0) : o("update:modelValue", T);
      }
    }), b = W(He(r.modelValue));
    ae(() => r.modelValue, (T) => {
      r.field.multiple || (b.value = He(T));
    }), ae(b, (T) => {
      !r.field.multiple && _.value === qe && o("update:modelValue", { other: T });
    });
    const x = P(() => {
      const T = r.modelValue;
      return Array.isArray(T) ? T.filter((V) => typeof V == "string") : [];
    }), S = P(() => r.field.multiple && Ir(r.modelValue)), C = W(He(r.modelValue));
    ae(() => r.modelValue, (T) => {
      r.field.multiple && (C.value = He(T));
    });
    function p(T, V, A) {
      const F = [...T];
      V && F.push({ other: A }), o("update:modelValue", F.length > 0 ? F : void 0);
    }
    function g(T, V) {
      const A = new Set(x.value);
      V ? A.add(T) : A.delete(T), p(r.field.options.filter((F) => A.has(F.value)).map((F) => F.value), S.value, C.value);
    }
    function k(T) {
      p(x.value, T, C.value);
    }
    ae(C, (T) => {
      S.value && p(x.value, !0, T);
    });
    function w(T) {
      return !!T && typeof T == "object" && !Array.isArray(T) && typeof T.other == "string";
    }
    const R = P(() => {
      const T = r.modelValue;
      if (T === void 0)
        return "—";
      const V = (F) => r.field.options.find((Q) => Q.value === F)?.label ?? F, A = [];
      if (Array.isArray(T))
        for (const F of T)
          typeof F == "string" ? A.push(V(F)) : w(F) && A.push(`Other: ${F.other}`);
      else typeof T == "string" ? A.push(V(T)) : w(T) && A.push(`Other: ${T.other}`);
      return A.length > 0 ? A.join(", ") : "—";
    });
    return t({
      focusFirstControl() {
        m.value?.querySelector("input, textarea")?.focus();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const T = m.value?.querySelector(`[id="${d}"]`);
        T ? T.focus() : m.value?.querySelector("input, textarea")?.focus();
      }
    }), (T, V) => (h(), v("fieldset", {
      ref_key: "fieldsetEl",
      ref: m,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": y.value
    }, [
      j("legend", su, [
        re(B(e.field.label), 1),
        !e.readonly && e.field.required ? (h(), v("span", lu, " (required)")) : N("", !0)
      ]),
      e.field.description ? (h(), v("p", {
        key: 0,
        id: s,
        class: "text-xs text-muted-color m-0"
      }, B(e.field.description), 1)) : N("", !0),
      e.readonly ? (h(), v("p", uu, B(R.value), 1)) : (h(), v("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup",
        "aria-required": e.field.required ? "true" : void 0
      }, [
        e.field.multiple ? (h(), v(ee, { key: 1 }, [
          (h(!0), v(ee, null, he(e.field.options, (A, F) => (h(), v("div", {
            key: A.value,
            class: "flex items-start gap-2"
          }, [
            H($(Ot), {
              "model-value": x.value.includes(A.value),
              binary: "",
              "input-id": f(F),
              disabled: e.disabled,
              "onUpdate:modelValue": (Q) => g(A.value, !!Q)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            j("label", {
              for: f(F),
              class: "text-sm text-color break-words"
            }, [
              re(B(A.label) + " ", 1),
              A.description ? (h(), v("span", bu, B(A.description), 1)) : N("", !0)
            ], 8, hu)
          ]))), 128)),
          e.field.allow_other ? (h(), v("div", vu, [
            H($(Ot), {
              "model-value": S.value,
              binary: "",
              "input-id": i,
              disabled: e.disabled,
              "onUpdate:modelValue": V[3] || (V[3] = (A) => k(!!A))
            }, null, 8, ["model-value", "disabled"]),
            j("div", gu, [
              j("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              j("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              H($(Xt), {
                id: d,
                modelValue: C.value,
                "onUpdate:modelValue": V[4] || (V[4] = (A) => C.value = A),
                disabled: e.disabled || !S.value,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64)) : (h(), v(ee, { key: 0 }, [
          (h(!0), v(ee, null, he(e.field.options, (A, F) => (h(), v("div", {
            key: A.value,
            class: "flex items-start gap-2"
          }, [
            H($(en), {
              modelValue: _.value,
              "onUpdate:modelValue": V[0] || (V[0] = (Q) => _.value = Q),
              "input-id": f(F),
              name: $(a),
              value: A.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            j("label", {
              for: f(F),
              class: "text-sm text-color break-words"
            }, [
              re(B(A.label) + " ", 1),
              A.description ? (h(), v("span", pu, B(A.description), 1)) : N("", !0)
            ], 8, cu)
          ]))), 128)),
          e.field.allow_other ? (h(), v("div", fu, [
            H($(en), {
              modelValue: _.value,
              "onUpdate:modelValue": V[1] || (V[1] = (A) => _.value = A),
              "input-id": i,
              name: $(a),
              value: qe,
              disabled: e.disabled
            }, null, 8, ["modelValue", "name", "disabled"]),
            j("div", mu, [
              j("label", {
                id: u,
                for: i,
                class: "text-sm text-color"
              }, "Other"),
              j("label", {
                id: c,
                for: d,
                class: "sr-only"
              }, "Other answer"),
              H($(Xt), {
                id: d,
                modelValue: b.value,
                "onUpdate:modelValue": V[2] || (V[2] = (A) => b.value = A),
                disabled: e.disabled || _.value !== qe,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64))
      ], 8, du)),
      !e.readonly && e.errors.length > 0 ? (h(), v("ul", {
        key: 3,
        id: l,
        class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
      }, [
        (h(!0), v(ee, null, he(e.errors, (A, F) => (h(), v("li", { key: F }, B(A.message), 1))), 128))
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
    const r = e, o = n, a = nn(
      ul(r.state.definition, r.state.data)
    ), s = W({}), l = W([]), i = {}, u = W("");
    function d(S, C) {
      i[S] = C;
    }
    const c = P(() => !r.submitting && !r.offline);
    function f(S, C = []) {
      const p = r.state.definition.fields.find((g) => S.includes(g.id))?.id;
      p && Ge(() => {
        const g = i[p];
        C.includes(p) ? g?.focusOtherText() : g?.focusFirstControl();
      });
    }
    function m(S) {
      u.value = S === 1 ? "1 question needs an answer." : `${S} questions need an answer.`;
    }
    function y(S, C) {
      s.value = S ?? {}, l.value = C ?? [];
      const p = Object.keys(s.value);
      f(p);
      const g = p.length + (l.value.length > 0 ? 1 : 0);
      g > 0 && m(g);
    }
    function _(S, C) {
      if (a[S] = C, s.value[S]) {
        const { [S]: p, ...g } = s.value;
        s.value = g;
      }
    }
    function b() {
      return ol(r.state.definition, a);
    }
    function x() {
      const S = sl(r.state.definition, a), C = al(r.state.definition, a).filter((g) => !S.includes(g)), p = ll(r.state.definition, a);
      if (C.length > 0 || p.length > 0 || S.length > 0) {
        const g = {};
        for (const w of C)
          g[w] = [...g[w] ?? [], { code: "required", message: "This question is required." }];
        for (const w of S)
          g[w] = [...g[w] ?? [], { code: "blank", message: Tu }];
        for (const w of p)
          g[w] = [...g[w] ?? [], { code: "too_long", message: Cu }];
        s.value = g, l.value = [];
        const k = [...C, ...S, ...p];
        f(k, S), m(new Set(k).size);
        return;
      }
      s.value = {}, l.value = [], o("submit", b());
    }
    return ae(() => r.banner, (S) => {
      S && (u.value = S.message);
    }), t({ setServerErrors: y, retry: () => o("submit", b()) }), (S, C) => (h(), v("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: ir(x, ["prevent"])
    }, [
      j("div", yu, B(u.value), 1),
      e.offline ? (h(), v("p", wu, B(Ou))) : N("", !0),
      j("div", xu, [
        j("h2", ku, B(e.state.definition.title), 1),
        e.state.definition.description ? (h(), v("p", _u, B(e.state.definition.description), 1)) : N("", !0),
        e.state.stale ? (h(), v("p", $u, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : N("", !0)
      ]),
      (h(!0), v(ee, null, he(e.state.definition.fields, (p) => (h(), K(cn, {
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
      l.value.length > 0 ? (h(), v("ul", Su, [
        (h(!0), v(ee, null, he(l.value, (p, g) => (h(), v("li", { key: g }, B(p.message), 1))), 128))
      ])) : N("", !0),
      e.banner ? (h(), K($(we), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ne(() => [
          j("div", Pu, [
            j("span", null, B(e.banner.message), 1),
            e.banner.retryable ? (h(), K($(ve), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: C[0] || (C[0] = (p) => o("retry"))
            }, {
              default: ne(() => [...C[1] || (C[1] = [
                re(" Retry ", -1)
              ])]),
              _: 1
            })) : N("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : N("", !0),
      j("div", null, [
        H($(ve), {
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
    function n(o) {
      if (!o)
        return null;
      const a = new Date(o);
      return Number.isNaN(a.getTime()) ? null : a.toLocaleString();
    }
    const r = W(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        r.value?.focus();
      }
    }), (o, a) => (h(), v("div", Eu, [
      j("div", Lu, [
        j("h2", ju, B(e.state.definition.title), 1),
        e.state.definition.description ? (h(), v("p", Nu, B(e.state.definition.description), 1)) : N("", !0)
      ]),
      (h(!0), v(ee, null, he(e.state.definition.fields, (s) => (h(), K(cn, {
        key: s.id,
        field: s,
        "model-value": e.state.data ? e.state.data[s.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      j("div", {
        ref_key: "statusEl",
        ref: r,
        tabindex: "-1",
        class: "text-xs text-muted-color flex flex-col gap-0.5 outline-none"
      }, [
        e.state.late ? (h(), v("p", Iu, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : N("", !0),
        e.state.delivery === "pending" ? (h(), v("p", zu, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (h(), v("p", Ru, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (h(), v("p", Vu, " The assistant stopped before answering. Send a message to continue. ")) : N("", !0),
        n(e.state.submitted_at) ? (h(), v("p", Fu, " Answered " + B(n(e.state.submitted_at)), 1)) : N("", !0)
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
    return (t, n) => (h(), v("div", Du, [
      j("div", Mu, [
        j("h2", qu, B(e.definition.title), 1),
        e.definition.description ? (h(), v("p", Uu, B(e.definition.description), 1)) : N("", !0)
      ]),
      (h(!0), v(ee, null, he(e.definition.fields, (r) => (h(), K(cn, {
        key: r.id,
        field: r,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      H($(we), {
        severity: "secondary",
        closable: !1
      }, {
        default: ne(() => [...n[0] || (n[0] = [
          re(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), At = 9;
function Hu(e, t, n) {
  const r = e.fields.length, o = r > 1, a = /* @__PURE__ */ new Set([0]), s = W(0), l = W(!1), i = W(""), u = W(""), d = W(null), c = W(0), f = nn(
    Object.fromEntries(e.fields.map((O) => {
      const E = t?.[O.id], z = O.options.filter((Pe) => Js(E, Pe.value)).map((Pe) => Pe.value), M = {};
      for (const Pe of z) {
        const bt = Xs(E, Pe);
        bt && (M[Pe] = bt);
      }
      const ie = Ir(E), me = He(E), Ae = z.length > 0 || ie && me.trim() !== "", ht = { chosen: z, other: me, useOther: ie, notes: M, noteOpen: null, done: Ae };
      return [O.id, ht];
    }))
  );
  function m(O) {
    return f[O.id];
  }
  function y(O) {
    const E = m(O);
    return O.multiple ? E.chosen.length > 0 || E.other.trim() !== "" : E.chosen.length > 0 || E.useOther && E.other.trim() !== "";
  }
  function _(O) {
    return m(O).done && y(O);
  }
  const b = P(() => o && s.value === r), x = P(() => b.value ? null : e.fields[s.value] ?? null), S = P(
    () => e.fields.map((O, E) => ({ field: O, index: E })).filter(({ field: O }) => O.required && !_(O))
  );
  function C(O) {
    u.value = "", setTimeout(() => {
      u.value = O;
    }, 30);
  }
  function p(O) {
    d.value = O, c.value++;
  }
  function g(O) {
    return Math.min(O.options.length + (O.allow_other ? 1 : 0), At);
  }
  function k(O) {
    const E = g(O), z = E > 1 ? `1–${E}` : "1", M = Math.min(O.options.length, At), ie = M > 1 ? `Shift+1–${M}` : "Shift+1", me = o ? " ← and → change questions." : "";
    return O.multiple ? `${z} ticks, ${ie} adds a note, Enter sends.${me}` : `${z} answers, ${ie} adds a note first.${me}`;
  }
  function w(O) {
    const E = m(O);
    if (O.multiple) {
      const z = O.options.filter((M) => E.chosen.includes(M.value)).map((M) => Tt(M.value, E.notes[M.value] ?? ""));
      return E.other.trim() && z.push({ other: E.other.trim() }), z.length > 0 ? z : void 0;
    }
    if (E.useOther)
      return { other: E.other.trim() };
    if (E.chosen[0])
      return Tt(E.chosen[0], E.notes[E.chosen[0]] ?? "");
  }
  function R(O) {
    return _(O) ? Fr(O, w(O)) : null;
  }
  function T() {
    const O = {};
    for (const E of e.fields) {
      if (!_(E))
        continue;
      const z = w(E);
      z !== void 0 && (O[E.id] = z);
    }
    return O;
  }
  function V(O, E = "first") {
    const z = x.value;
    z && z.multiple && !m(z).done && y(z) && (m(z).done = !0);
    const M = o ? r : r - 1;
    if (s.value = Math.max(0, Math.min(O, M)), i.value = "", b.value || a.add(s.value), b.value) {
      const ie = S.value[0];
      p(ie ? `review-item-${ie.index}` : "send-all");
    } else
      p(E);
    C(b.value ? "Review your answers" : `Question ${s.value + 1} of ${r}`);
  }
  function A() {
    S.value.length > 0 || n(T());
  }
  function F(O) {
    if (m(O).done = !0, i.value = "", !o) {
      n(T());
      return;
    }
    const E = e.fields.findIndex((z, M) => M > s.value && !a.has(M));
    V(E === -1 ? r : E);
  }
  function Q(O, E) {
    const z = m(O);
    if (E >= O.options.length) {
      p("other");
      return;
    }
    const M = O.options[E].value;
    if (z.noteOpen === M && !O.multiple) {
      p(`note-${M}`);
      return;
    }
    if (O.multiple) {
      z.chosen = z.chosen.includes(M) ? z.chosen.filter((ie) => ie !== M) : [...z.chosen, M], y(O) || (z.done = !1), i.value = "", p(`opt-${E}`), C(z.chosen.includes(M) ? "Ticked" : "Unticked");
      return;
    }
    z.chosen = [M], z.useOther = !1, F(O);
  }
  function D(O, E, z = !1) {
    const M = m(O), ie = O.options.findIndex((me) => me.value === E);
    M.noteOpen === E && !z ? (M.noteOpen = null, p(`opt-${ie}`)) : (M.noteOpen = E, p(`note-${E}`));
  }
  function oe(O, E, z) {
    m(O).notes[E] = z;
  }
  function Oe(O, E) {
    const z = m(O);
    if (z.noteOpen = null, O.multiple) {
      z.chosen.includes(E) || (z.chosen = [...z.chosen, E]), p(`opt-${O.options.findIndex((M) => M.value === E)}`), C("Note saved");
      return;
    }
    z.chosen = [E], z.useOther = !1, F(O);
  }
  function Se(O) {
    const E = m(O), z = E.other.trim();
    if (O.multiple) {
      if (!z && E.chosen.length === 0)
        return;
    } else {
      if (!z)
        return;
      E.useOther = !0, E.chosen = [];
    }
    F(O);
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
    inReview: b,
    currentQuestion: x,
    missingRequired: S,
    ans: m,
    hasContent: y,
    answered: _,
    answerItemsFor: R,
    keysText: k,
    activate: Q,
    toggleNote: D,
    setNote: oe,
    sendNote: Oe,
    sendOther: Se,
    commit: F,
    go: V,
    submitAll: A,
    requestFocus: p,
    buildAnswers: T
  };
}
function I(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function Ku(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, o) => ({ text: r, code: o % 2 === 1 })).filter((r) => r.text !== "");
}
function tr(e) {
  return String(e).replaceAll("`", "");
}
const Gu = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Te = /* @__PURE__ */ pe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, r) => (h(!0), v(ee, null, he($(Ku)(t.text), (o, a) => (h(), v(ee, { key: a }, [
      o.code ? (h(), v("code", Gu, B(o.text), 1)) : (h(), v(ee, { key: 1 }, [
        re(B(o.text), 1)
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
    const n = e, r = t, o = P(() => I("header", !n.multi && "single")), a = P(() => I("nav")), s = P(() => I("prev")), l = P(() => I("counter")), i = P(() => I("next")), u = P(() => I("question")), d = P(() => I("actions")), c = P(() => I("collapse")), f = P(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), m = P(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), y = P(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (_, b) => (h(), v("div", {
      part: o.value.part,
      class: L(o.value.class)
    }, [
      e.multi ? (h(), v("div", {
        key: 0,
        part: a.value.part,
        class: L(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        H($(ve), {
          type: "button",
          text: "",
          size: "small",
          part: s.value.part,
          class: L(s.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: b[0] || (b[0] = (x) => r("prev"))
        }, {
          icon: ne(() => [
            H($(be), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        j("span", {
          part: l.value.part,
          class: L(l.value.class)
        }, [
          j("span", Ju, B(f.value), 1),
          j("span", Xu, B(m.value), 1)
        ], 10, Zu),
        H($(ve), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: L(i.value.class),
          "aria-label": y.value,
          title: y.value,
          disabled: e.review,
          onClick: b[1] || (b[1] = (x) => r("next"))
        }, {
          icon: ne(() => [
            H($(be), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, Qu)) : N("", !0),
      j("h3", {
        id: e.qid,
        part: u.value.part,
        class: L(u.value.class)
      }, [
        e.review ? (h(), v(ee, { key: 0 }, [
          re(" Check your answers, then send them. ")
        ], 64)) : (h(), K(Te, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, ed),
      j("div", {
        part: d.value.part,
        class: L(d.value.class)
      }, [
        H($(ve), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: L(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: b[2] || (b[2] = (x) => r("toggleCollapse"))
        }, {
          icon: ne(() => [
            H($(be), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, td)
    ], 10, Yu));
  }
});
var rd = `
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
`, od = {
  root: "p-inputgroup"
}, ad = Z.extend({
  name: "inputgroup",
  style: rd,
  classes: od
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
}, Mr = {
  name: "InputGroup",
  extends: id,
  inheritAttrs: !1
};
function sd(e, t, n, r, o, a) {
  return h(), v("div", U({
    class: e.cx("root")
  }, e.ptmi("root")), [ue(e.$slots, "default")], 16);
}
Mr.render = sd;
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
}, dd = Z.extend({
  name: "textarea",
  style: ld,
  classes: ud
}), cd = {
  name: "BaseTextarea",
  extends: Nt,
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
function pt(e) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pt(e);
}
function pd(e, t, n) {
  return (t = fd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fd(e) {
  var t = md(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function md(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qr = {
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
      return U(this.ptmi("root", {
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
function bd(e, t, n, r, o, a) {
  return h(), v("textarea", U({
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
qr.render = bd;
const Ur = /* @__PURE__ */ pe({
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
    const n = e, r = t, o = P(() => I("composer", n.kind)), a = P(() => I(`${n.kind}-input`)), s = P(() => I(`${n.kind}-send`));
    function l(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && r("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), r("escape"));
    }
    return (i, u) => (h(), K($(Mr), {
      part: o.value.part,
      class: L(o.value.class)
    }, {
      default: ne(() => [
        H($(qr), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: L(a.value.class),
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
        H($(ve), {
          type: "button",
          text: "",
          rounded: "",
          part: s.value.part,
          class: L(s.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => r("send"))
        }, {
          icon: ne(() => [
            H($(be), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), vd = ["part"], gd = ["part", "role", "aria-checked", "aria-disabled", "data-focus", "aria-keyshortcuts"], yd = ["part"], wd = ["part"], xd = ["part"], kd = ["part"], _d = ["part"], $d = { key: 1 }, Sd = ["part"], Pd = /* @__PURE__ */ pe({
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
    const n = e, r = t, o = P(() => I("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = P(() => I("option-main")), s = P(() => I("option-label")), l = P(() => I("option-mark")), i = P(() => I("option-description")), u = P(() => I("option-note")), d = P(() => I("note-toggle", n.note && "has-note", n.editing && "editing")), c = P(() => I("option-key")), f = P(() => I("error")), m = `${Et()}-note-err`;
    function y(S) {
      n.disabled || S.target.closest(".w-form__note-toggle, .w-form__composer") || r("activate");
    }
    const _ = P(() => `${n.note ? "Edit the note on" : "Add a note to"} ${tr(n.option.label)}`), b = P(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), x = P(() => n.multiple ? "Save the note" : "Answer with this note");
    return (S, C) => (h(), v("div", {
      part: o.value.part,
      class: L(o.value.class),
      onClick: y
    }, [
      j("div", {
        part: a.value.part,
        class: L(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        tabindex: "0",
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        j("span", {
          part: s.value.part,
          class: L(s.value.class)
        }, [
          e.multiple ? (h(), K($(Ot), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: l.value.part,
            class: L(l.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (h(), v("span", {
            key: 1,
            part: l.value.part,
            class: L(l.value.class),
            "aria-hidden": "true"
          }, [
            H($(be), { icon: "tabler:check" })
          ], 10, wd)) : N("", !0),
          H(Te, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, yd),
        e.option.description ? (h(), v("span", {
          key: 0,
          part: i.value.part,
          class: L(i.value.class)
        }, [
          H(Te, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, xd)) : N("", !0),
        e.note && !e.editing ? (h(), v("span", {
          key: 1,
          part: u.value.part,
          class: L(u.value.class)
        }, [
          H($(be), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          j("span", null, B(e.note), 1)
        ], 10, kd)) : N("", !0)
      ], 10, gd),
      H($(ve), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: L(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": _.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: C[0] || (C[0] = ir((p) => r("toggle-note"), ["stop"]))
      }, {
        icon: ne(() => [
          H($(be), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (h(), v("kbd", {
        key: 0,
        part: c.value.part,
        class: L(c.value.class),
        "aria-hidden": "true"
      }, B(e.keyLabel), 11, _d)) : (h(), v("span", $d)),
      e.editing ? (h(), v(ee, { key: 2 }, [
        H(Ur, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: b.value,
          label: `Note for ${$(tr)(e.option.label)}`,
          "send-label": x.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": e.noteTooLong ? m : void 0,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": C[1] || (C[1] = (p) => r("update:noteDraft", p)),
          onSend: C[2] || (C[2] = (p) => r("send-note")),
          onEscape: C[3] || (C[3] = (p) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (h(), v("p", {
          key: 0,
          id: m,
          part: f.value.part,
          class: L(f.value.class),
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
    const t = e, n = P(() => I("notice")), r = P(() => I("description")), o = P(() => I("hint")), a = P(() => I("options")), s = P(() => I("footer")), l = P(() => I("send")), i = P(() => I("error")), u = P(() => I("keys")), d = P(() => {
      const k = [];
      return t.question.multiple && k.push("Choose any that apply."), t.question.required || k.push("Optional."), k.join(" ");
    }), c = P(() => t.controller.error.value || t.serverError || "");
    function f(k) {
      return k < At ? String(k + 1) : null;
    }
    const m = P(() => {
      const k = t.question.options.length + 1;
      return k <= At ? String(k) : null;
    });
    function y() {
      return t.controller.ans(t.question);
    }
    const _ = P(() => {
      const k = y(), w = t.question.multiple ? k.other.trim() !== "" : k.useOther && k.done;
      return I("option", "other", w && "selected");
    }), b = P(() => {
      const k = y();
      return k.other.trim() !== "" || t.question.multiple && k.chosen.length > 0;
    }), x = P(() => Rr(y().other)), S = `${t.qid}-other-err`, C = P(() => {
      const k = [];
      return x.value && k.push(S), c.value && k.push(`${t.qid}-err`), k.join(" ") || void 0;
    }), p = P(() => x.value || !!c.value);
    function g(k) {
      k.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    return (k, w) => (h(), v(ee, null, [
      e.stale ? (h(), v("p", {
        key: 0,
        part: n.value.part,
        class: L(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Cd)) : N("", !0),
      e.question.description ? (h(), v("p", {
        key: 1,
        part: r.value.part,
        class: L(r.value.class)
      }, [
        H(Te, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Td)) : N("", !0),
      d.value ? (h(), v("p", {
        key: 2,
        part: o.value.part,
        class: L(o.value.class)
      }, B(d.value), 11, Od)) : N("", !0),
      j("div", {
        part: a.value.part,
        class: L(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": `${e.qid}-err`
      }, [
        (h(!0), v(ee, null, he(e.question.options, (R, T) => (h(), K(Pd, {
          key: R.value,
          option: R,
          index: T,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(R.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === R.value,
          note: (e.controller.ans(e.question).notes[R.value] || "").trim(),
          editing: e.controller.ans(e.question).noteOpen === R.value,
          "note-draft": e.controller.ans(e.question).notes[R.value] || "",
          "key-label": f(T),
          "note-too-long": $(nl)(e.controller.ans(e.question).notes[R.value] || ""),
          disabled: !!e.disabled,
          onActivate: (V) => e.controller.activate(e.question, T),
          onToggleNote: (V) => e.controller.toggleNote(e.question, R.value),
          "onUpdate:noteDraft": (V) => e.controller.setNote(e.question, R.value, V),
          onSendNote: (V) => e.controller.sendNote(e.question, R.value),
          onEscapeNote: (V) => e.controller.toggleNote(e.question, R.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (h(), v("div", {
          key: 0,
          part: _.value.part,
          class: L(_.value.class),
          onClick: g
        }, [
          H(Ur, {
            kind: "other",
            "model-value": y().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: b.value && !e.disabled && !x.value,
            invalid: p.value,
            "described-by": C.value,
            "data-focus": "other",
            "onUpdate:modelValue": w[0] || (w[0] = (R) => {
              y().other = R;
            }),
            onSend: w[1] || (w[1] = (R) => e.controller.sendOther(e.question)),
            onEscape: w[2] || (w[2] = (R) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          m.value ? (h(), v("kbd", Ld, B(m.value), 1)) : (h(), v("span", jd)),
          x.value ? (h(), v("p", {
            key: 2,
            id: S,
            part: i.value.part,
            class: L(i.value.class),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, Nd)) : N("", !0)
        ], 10, Ed)) : N("", !0)
      ], 10, Ad),
      e.question.multiple && !e.question.allow_other ? (h(), v("div", {
        key: 3,
        part: s.value.part,
        class: L(s.value.class)
      }, [
        H($(ve), {
          type: "button",
          part: l.value.part,
          class: L(l.value.class),
          "data-focus": "send",
          disabled: e.controller.ans(e.question).chosen.length === 0 || e.disabled,
          onClick: w[3] || (w[3] = (R) => e.controller.commit(e.question))
        }, {
          default: ne(() => [
            w[4] || (w[4] = re(" Send ", -1)),
            H($(be), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, Id)) : N("", !0),
      c.value ? (h(), K($(we), {
        key: 4,
        id: `${e.qid}-err`,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: L(i.value.class),
        role: "alert"
      }, {
        default: ne(() => [
          re(B(c.value), 1)
        ]),
        _: 1
      }, 8, ["id", "part", "class"])) : (h(), v("p", {
        key: 5,
        id: `${e.qid}-err`,
        class: "hidden"
      }, null, 8, zd)),
      j("p", {
        part: u.value.part,
        class: L(u.value.class)
      }, B(e.controller.keysText(e.question)), 11, Rd)
    ], 64));
  }
}), Fd = ["part"], Bd = ["part"], Dd = ["part"], Wr = /* @__PURE__ */ pe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = P(() => I("answer-item")), r = P(() => I("answer-note")), o = P(() => I("answer-own"));
    return (a, s) => (h(!0), v(ee, null, he(t.items, (l, i) => (h(), v("span", {
      key: i,
      part: n.value.part,
      class: L(n.value.class)
    }, [
      l.own ? (h(), v(ee, { key: 0 }, [
        j("span", {
          part: o.value.part,
          class: L(o.value.class)
        }, "Own answer: ", 10, Bd),
        re(B(l.label), 1)
      ], 64)) : (h(), K(Te, {
        key: 1,
        text: l.label
      }, null, 8, ["text"])),
      (l.note || "").trim() ? (h(), v("span", {
        key: 2,
        part: r.value.part,
        class: L(r.value.class)
      }, [
        H($(be), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        j("span", null, B(l.note.trim()), 1)
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
    const t = e, n = P(() => I("review")), r = P(() => I("footer")), o = P(() => I("footer-text")), a = P(() => I("send-all")), s = P(() => I("keys")), l = P(() => I("review-number")), i = P(() => I("review-question")), u = P(() => I("review-answer")), d = P(() => I("answer-empty"));
    function c(_) {
      return I("review-item", _ && "missing");
    }
    function f() {
      return I("review-edit");
    }
    const m = P(() => t.controller.missingRequired.value), y = P(() => {
      const _ = m.value;
      return _.length === 0 ? "" : _.length === 1 ? `Question ${_[0].index + 1} still needs an answer.` : `Questions ${_.map((b) => b.index + 1).join(" and ")} still need answers.`;
    });
    return (_, b) => (h(), v(ee, null, [
      j("ol", {
        part: n.value.part,
        class: L(n.value.class)
      }, [
        (h(!0), v(ee, null, he(e.definition.fields, (x, S) => (h(), v("li", {
          key: x.id,
          part: c(!e.controller.answerItemsFor(x) && x.required).part,
          class: L(c(!e.controller.answerItemsFor(x) && x.required).class)
        }, [
          j("button", {
            type: "button",
            part: f().part,
            class: L(f().class),
            "aria-label": `Question ${S + 1}: change the answer`,
            "data-focus": `review-item-${S}`,
            onClick: (C) => e.controller.go(S, "first")
          }, [
            j("span", {
              part: l.value.part,
              class: L(l.value.class),
              "aria-hidden": "true"
            }, B(S + 1), 11, Wd),
            j("span", {
              part: i.value.part,
              class: L(i.value.class)
            }, [
              H(Te, {
                text: x.label
              }, null, 8, ["text"])
            ], 10, Hd),
            j("span", {
              part: u.value.part,
              class: L(u.value.class)
            }, [
              e.controller.answerItemsFor(x) ? (h(), K(Wr, {
                key: 0,
                items: e.controller.answerItemsFor(x)
              }, null, 8, ["items"])) : x.required ? (h(), v(ee, { key: 1 }, [
                re(" Not answered yet ")
              ], 64)) : (h(), v("span", {
                key: 2,
                part: d.value.part,
                class: L(d.value.class)
              }, "Skipped", 10, Gd))
            ], 10, Kd)
          ], 10, Ud)
        ], 10, qd))), 128))
      ], 10, Md),
      j("div", {
        part: r.value.part,
        class: L(r.value.class)
      }, [
        y.value ? (h(), v("p", {
          key: 0,
          part: o.value.part,
          class: L(o.value.class)
        }, B(y.value), 11, Qd)) : N("", !0),
        H($(ve), {
          type: "button",
          part: a.value.part,
          class: L(a.value.class),
          "data-focus": "send-all",
          disabled: m.value.length > 0 || e.disabled,
          onClick: b[0] || (b[0] = (x) => e.controller.submitAll())
        }, {
          default: ne(() => [
            b[1] || (b[1] = re(" Send answers ", -1)),
            H($(be), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, Yd),
      j("p", {
        part: s.value.part,
        class: L(s.value.class)
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
}, nc = ["part"], rc = ["part"], oc = { class: "flex items-center gap-2" }, ac = {
  "aria-live": "polite",
  class: "w-form__sr"
}, ic = "You are offline. Your choices are kept.", sc = "Sending your answer…", lc = /* @__PURE__ */ pe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = Hu(r.state.definition, r.state.data, (p) => {
      r.offline || r.submitting || o("submit", p);
    }), s = P(() => !!r.offline || r.submitting), l = `${Et()}-q`, i = W(null);
    ae(a.inReview, (p) => o("update:state", p ? "review" : "active"), { immediate: !0 }), ae(a.collapsed, (p) => o("update:collapsed", p), { immediate: !0 });
    const u = W({}), d = W([]);
    function c(p) {
      const g = [...d.value];
      return u.value[p] && g.push(u.value[p]), g.join(" ");
    }
    const f = P(() => new Set(r.state.definition.fields.map((p) => p.id))), m = P(() => {
      const p = Object.entries(u.value).filter(([g]) => !f.value.has(g)).map(([, g]) => g);
      return [...d.value, ...p].join(" ");
    });
    ae(
      () => Object.fromEntries(r.state.definition.fields.map((p) => [p.id, JSON.stringify(a.ans(p))])),
      (p, g) => {
        if (!g)
          return;
        const k = new Set(
          r.state.definition.fields.map((w) => w.id).filter((w) => p[w] !== g[w] && u.value[w])
        );
        k.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([w]) => !k.has(w))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(p, g) {
        const k = {};
        for (const [R, T] of Object.entries(p ?? {}))
          k[R] = T.map((V) => V.message).join(" ");
        u.value = k, d.value = (g ?? []).map((R) => R.message);
        const w = r.state.definition.fields.findIndex((R) => k[R.id]);
        w >= 0 && a.go(w, "first");
      },
      retry() {
        o("submit", a.buildAnswers());
      }
    });
    const y = P(() => I("card")), _ = P(() => I("title")), b = P(() => I("form-description"));
    function x(p) {
      const g = i.value;
      if (!g)
        return;
      let k = null;
      if (p === "card" ? k = g : p === "first" ? k = g.querySelector(".w-form__option--selected .w-form__option-main") ?? g.querySelector(".w-form__option-main, .w-form__other-input") : k = Array.from(g.querySelectorAll("[data-focus]")).find((w) => w.dataset.focus === p) ?? null, !!k && (k.focus(), k.tagName === "TEXTAREA")) {
        const w = k;
        w.setSelectionRange(w.value.length, w.value.length);
      }
    }
    ae(a.focusSeq, () => {
      Ge(() => {
        const p = a.focusTarget.value;
        p && x(p);
      });
    });
    function S() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function C(p) {
      const g = p.composedPath()[0];
      if (g?.tagName === "TEXTAREA" || p.isComposing || p.ctrlKey || p.metaKey || p.altKey || a.collapsed.value || s.value)
        return;
      if (a.inReview.value) {
        p.key === "ArrowLeft" && (p.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const k = a.currentQuestion.value;
      if (!k)
        return;
      const w = a.ans(k), R = p.shiftKey ? /^Digit([1-9])$/.exec(p.code) : /^([1-9])$/.exec(p.key);
      if (R) {
        const A = Number(R[1]) - 1;
        if (A >= k.options.length + (k.allow_other ? 1 : 0))
          return;
        p.preventDefault(), p.shiftKey && A < k.options.length ? a.toggleNote(k, k.options[A].value, !0) : a.activate(k, A);
        return;
      }
      const T = g?.dataset?.focus ?? "", V = T.startsWith("opt-") ? Number(T.slice(4)) : -1;
      if (p.key === "ArrowDown" || p.key === "ArrowUp") {
        const A = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (A.length === 0)
          return;
        p.preventDefault();
        const F = A.indexOf(g), Q = p.key === "ArrowDown" ? (F + 1) % A.length : F <= 0 ? A.length - 1 : F - 1;
        A[Q]?.focus();
        return;
      }
      if (a.multi && (p.key === "ArrowRight" || p.key === "ArrowLeft")) {
        p.preventDefault(), a.go(a.index.value + (p.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((p.key === "n" || p.key === "N") && V >= 0) {
        p.preventDefault(), a.toggleNote(k, k.options[V].value, !0);
        return;
      }
      if (V >= 0 && (p.key === " " || p.key === "Enter" && !k.multiple)) {
        p.preventDefault(), a.activate(k, V);
        return;
      }
      p.key === "Enter" && k.multiple && !g?.matches?.("button") && (p.preventDefault(), w.chosen.length > 0 || w.other.trim() ? a.commit(k) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(V >= 0 ? T : "first")));
    }
    return (p, g) => (h(), v("section", {
      ref_key: "cardRoot",
      ref: i,
      part: y.value.part,
      class: L(`w-form ${y.value.class}`),
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: C
    }, [
      e.offline ? (h(), v("p", ec, B(ic))) : N("", !0),
      e.submitting ? (h(), v("p", tc, B(sc))) : N("", !0),
      m.value ? (h(), K($(we), {
        key: 2,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          re(B(m.value), 1)
        ]),
        _: 1
      })) : N("", !0),
      j("p", {
        part: _.value.part,
        class: L(_.value.class)
      }, [
        H($(be), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        re(" " + B(e.state.definition.title), 1)
      ], 10, nc),
      e.state.definition.description ? (h(), v("p", {
        key: 3,
        part: b.value.part,
        class: L(b.value.class)
      }, [
        H(Te, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, rc)) : N("", !0),
      H(nd, {
        multi: $(a).multi,
        index: $(a).index.value,
        n: $(a).n,
        review: $(a).inReview.value,
        "question-text": $(a).currentQuestion.value?.label ?? "",
        collapsed: $(a).collapsed.value,
        qid: l,
        onPrev: g[0] || (g[0] = (k) => $(a).go($(a).index.value - 1, "first")),
        onNext: g[1] || (g[1] = (k) => $(a).go($(a).index.value + 1, "first")),
        onToggleCollapse: S
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (h(), K($(we), {
        key: 4,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ne(() => [
          j("div", oc, [
            j("span", null, B(e.banner.message), 1),
            e.banner.retryable ? (h(), K($(ve), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: g[2] || (g[2] = (k) => o("retry"))
            }, {
              default: ne(() => [...g[3] || (g[3] = [
                re(" Retry ", -1)
              ])]),
              _: 1
            })) : N("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : N("", !0),
      $(a).collapsed.value ? N("", !0) : (h(), v(ee, { key: 5 }, [
        $(a).inReview.value ? (h(), K(Jd, {
          key: 0,
          definition: e.state.definition,
          controller: $(a),
          disabled: s.value
        }, null, 8, ["definition", "controller", "disabled"])) : $(a).currentQuestion.value ? (h(), K(Vd, {
          key: 1,
          question: $(a).currentQuestion.value,
          controller: $(a),
          qid: l,
          stale: !!e.state.stale,
          "server-error": c($(a).currentQuestion.value.id),
          disabled: s.value
        }, null, 8, ["question", "controller", "stale", "server-error", "disabled"])) : N("", !0)
      ], 64)),
      j("p", ac, B($(a).liveMessage.value), 1)
    ], 42, Xd));
  }
}), uc = ["part", "aria-label"], dc = ["part"], cc = ["part"], pc = ["part"], fc = ["part"], mc = ["part"], hc = ["part"], bc = ["part"], vc = ["part"], gc = { key: 0 }, yc = { key: 1 }, wc = { key: 2 }, xc = { key: 3 }, kc = { key: 4 }, _c = /* @__PURE__ */ pe({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function r(_) {
      if (!_)
        return null;
      const b = new Date(_);
      return Number.isNaN(b.getTime()) ? null : b.toLocaleString();
    }
    const o = P(() => I("card", "answered")), a = P(() => I("title")), s = P(() => I("form-description")), l = P(() => I("summary")), i = P(() => I("summary-item")), u = P(() => I("summary-question")), d = P(() => I("summary-answer")), c = P(() => I("answer-empty")), f = P(() => I("status"));
    function m(_) {
      const b = n.state.definition.fields.find((x) => x.id === _);
      return b ? Fr(b, n.state.data ? n.state.data[_] : void 0) : null;
    }
    const y = W(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        y.value?.focus();
      }
    }), (_, b) => (h(), v("section", {
      part: o.value.part,
      class: L(`w-form ${o.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      j("p", {
        part: a.value.part,
        class: L(a.value.class)
      }, [
        H($(be), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        re(" " + B(e.state.definition.title), 1)
      ], 10, dc),
      e.state.definition.description ? (h(), v("p", {
        key: 0,
        part: s.value.part,
        class: L(s.value.class)
      }, [
        H(Te, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, cc)) : N("", !0),
      j("dl", {
        part: l.value.part,
        class: L(l.value.class)
      }, [
        (h(!0), v(ee, null, he(e.state.definition.fields, (x) => (h(), v("div", {
          key: x.id,
          part: i.value.part,
          class: L(i.value.class)
        }, [
          j("dt", {
            part: u.value.part,
            class: L(u.value.class)
          }, [
            H(Te, {
              text: x.label
            }, null, 8, ["text"])
          ], 10, mc),
          j("dd", {
            part: d.value.part,
            class: L(d.value.class)
          }, [
            m(x.id) ? (h(), K(Wr, {
              key: 0,
              items: m(x.id)
            }, null, 8, ["items"])) : (h(), v("span", {
              key: 1,
              part: c.value.part,
              class: L(c.value.class)
            }, "Skipped", 10, bc))
          ], 10, hc)
        ], 10, fc))), 128))
      ], 10, pc),
      j("div", {
        ref_key: "statusEl",
        ref: y,
        tabindex: "-1",
        part: f.value.part,
        class: L(f.value.class)
      }, [
        e.state.late ? (h(), v("p", gc, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : N("", !0),
        e.state.delivery === "pending" ? (h(), v("p", yc, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (h(), v("p", wc, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (h(), v("p", xc, " The assistant stopped before answering. Send a message to continue. ")) : N("", !0),
        r(e.state.submitted_at) ? (h(), v("p", kc, " Answered " + B(r(e.state.submitted_at)), 1)) : N("", !0)
      ], 10, vc)
    ], 10, uc));
  }
}), $c = { class: "p-3 max-w-full min-w-0" }, Sc = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Pc = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Cc = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, Tc = { class: "flex items-center gap-2" }, Oc = "Could not refresh this form. Showing what you last saw.", Ac = "This form was already answered elsewhere, so your answer was not sent. The saved answer is shown below.", Ec = /* @__PURE__ */ pe({
  __name: "wippy-form",
  setup(e) {
    const t = Ns(), n = zs(), r = Is(), o = Ys(), a = P(() => t.value.definition), s = P(() => t.value.state), { status: l, state: i, errorMessage: u, reloadError: d, reload: c, refresh: f } = Ds(o, s);
    Fs(i, f);
    const { submitting: m, submit: y } = Gs(o), { isOnline: _ } = Zs(() => c()), b = W(null), x = W(!1);
    ae(o, () => {
      x.value = !1;
    });
    const S = W(null), C = W(null);
    let p = !1;
    ae(() => i.value?.status, (Q, D) => {
      if (!(Q !== "idle" || D !== "active")) {
        if (p) {
          p = !1;
          return;
        }
        x.value = !0;
      }
    });
    const g = P(() => {
      const Q = t.value.formVersion;
      if (Q !== void 0 && Q !== 1)
        return !0;
      const D = i.value?.form_version;
      return D !== void 0 && D !== 1;
    }), k = P(() => {
      const Q = a.value?.fields;
      return !!Q && Q.length > 0 && Q.every((D) => D.type === "choice");
    }), w = W("active"), R = W(!1), T = P(() => g.value ? "unsupported" : i.value?.status === "idle" ? "answered" : k.value ? w.value : "active"), V = P(() => !g.value && k.value && i.value?.status === "active" && R.value);
    Qs(T, V);
    async function A(Q) {
      if (!i.value)
        return;
      b.value = null;
      const D = await y(i.value.form_version, i.value.content_version, Q);
      if (!D.ignored) {
        if (D.ok && D.accepted) {
          const oe = D.accepted;
          p = !0, i.value = {
            ...i.value,
            status: "idle",
            stale: !1,
            late: oe.late,
            content_version: oe.content_version,
            data: Q,
            answer_message_id: oe.answer_message_id,
            delivery: oe.delivery
          }, r("answer-submitted", { requestId: oe.request_id, answerMessageId: oe.answer_message_id, late: oe.late }), Ge(() => C.value?.focusStatus()), c();
          return;
        }
        if (D.fieldErrors || D.formErrors) {
          S.value?.setServerErrors(D.fieldErrors, D.formErrors);
          return;
        }
        if (D.code === "already_submitted") {
          x.value = !0, await f(), Ge(() => C.value?.focusStatus());
          return;
        }
        D.shouldReload && c(), b.value = { message: D.message ?? "Could not submit this form.", retryable: D.retryable };
      }
    }
    function F() {
      S.value?.retry();
    }
    return (Q, D) => (h(), v("div", $c, [
      $(n).length > 0 ? (h(), K($(we), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [...D[2] || (D[2] = [
          re(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : a.value ? g.value ? (h(), K($(we), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: ne(() => [...D[4] || (D[4] = [
          re(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : $(o) ? $(i) ? (h(), v(ee, { key: 4 }, [
        $(d) ? (h(), v("p", Sc, B(Oc))) : N("", !0),
        $(i).status === "active" && k.value ? (h(), K(lc, {
          key: $(o),
          ref_key: "activeFormRef",
          ref: S,
          state: $(i),
          submitting: $(m),
          banner: b.value,
          offline: !$(_),
          onSubmit: A,
          onRetry: F,
          "onUpdate:state": D[0] || (D[0] = (oe) => {
            w.value = oe;
          }),
          "onUpdate:collapsed": D[1] || (D[1] = (oe) => {
            R.value = oe;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : $(i).status === "active" ? (h(), K(Au, {
          key: $(o),
          ref_key: "activeFormRef",
          ref: S,
          state: $(i),
          submitting: $(m),
          banner: b.value,
          offline: !$(_),
          onSubmit: A,
          onRetry: F
        }, null, 8, ["state", "submitting", "banner", "offline"])) : $(i).status === "idle" ? (h(), v(ee, { key: 3 }, [
          x.value ? (h(), v("p", Pc, B(Ac))) : N("", !0),
          k.value ? (h(), K(_c, {
            key: $(o),
            ref_key: "idleFormRef",
            ref: C,
            state: $(i)
          }, null, 8, ["state"])) : (h(), K(Bu, {
            key: $(o),
            ref_key: "idleFormRef",
            ref: C,
            state: $(i)
          }, null, 8, ["state"]))
        ], 64)) : N("", !0)
      ], 64)) : $(l) === "loading" || $(l) === "idle" ? (h(), v("wippy-loading", Cc)) : $(l) === "unsupported" ? (h(), K($(we), {
        key: 6,
        severity: "warn",
        closable: !1
      }, {
        default: ne(() => [...D[5] || (D[5] = [
          re(" This form needs a newer Web Host. ", -1)
        ])]),
        _: 1
      })) : $(l) === "error" ? (h(), K($(we), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [
          j("div", Tc, [
            j("span", null, B($(u) || "Could not load this form."), 1),
            H($(ve), {
              type: "button",
              link: "",
              size: "small",
              onClick: $(c)
            }, {
              default: ne(() => [...D[6] || (D[6] = [
                re(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : N("", !0) : (h(), K(Wu, {
        key: 3,
        definition: a.value
      }, null, 8, ["definition"])) : (h(), K($(we), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ne(() => [...D[3] || (D[3] = [
          re(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Lc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.outline-none{outline:2px solid transparent;outline-offset:2px}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible,.w-form__status:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small);color:var(--_danger)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{color:var(--_danger);font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;font-size:12px;color:var(--_muted)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class jc extends Fi {
  static get wippyConfig() {
    return {
      propsSchema: Di.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Lc
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Ec,
      plugins: [pi],
      providers(t, n) {
        t.provide(dn, n);
      }
    };
  }
}
wo(import.meta.url, jc);
//# sourceMappingURL=index.js.map
