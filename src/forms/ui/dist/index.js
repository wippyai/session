import { ref as U, readonly as ko, getCurrentInstance as bn, onMounted as It, nextTick as qe, watch as re, reactive as lr, renderSlot as ce, openBlock as b, createBlock as M, Teleport as ur, createCommentVNode as j, useId as Rt, mergeProps as y, h as _o, createApp as $o, inject as zt, onUnmounted as Vt, computed as V, watchEffect as So, createElementBlock as v, createElementVNode as L, createTextVNode as ae, toDisplayString as q, resolveComponent as Qe, resolveDirective as dr, withDirectives as cr, resolveDynamicComponent as Ot, withCtx as ie, normalizeClass as Ue, Transition as Co, defineComponent as pe, unref as m, Fragment as ne, renderList as Le, normalizeProps as oe, guardReactiveProps as ge, createVNode as W, withModifiers as To } from "vue";
import { addCollection as Po, Icon as ke } from "@iconify/vue";
import * as Oo from "@wippy-fe/proxy";
import { config as hn, addIcons as Eo, on as De, applyThemeMode as xt, host as Ao, hostCss as No, loadCss as Lo, define as jo } from "@wippy-fe/proxy";
import { getActivePinia as Io, createPinia as Ro, setActivePinia as zo } from "pinia";
var Vo = Object.defineProperty, gn = Object.getOwnPropertySymbols, Bo = Object.prototype.hasOwnProperty, Do = Object.prototype.propertyIsEnumerable, vn = (e, t, n) => t in e ? Vo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Fo = (e, t) => {
  for (var n in t || (t = {})) Bo.call(t, n) && vn(e, n, t[n]);
  if (gn) for (var n of gn(t)) Do.call(t, n) && vn(e, n, t[n]);
  return e;
};
function Ve(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Ht(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), i, s, l;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (i = s; i-- !== 0; ) if (!Ht(e[i], t[i], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let a = e instanceof Date, u = t instanceof Date;
  if (a != u) return !1;
  if (a && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (s = p.length, s !== Object.keys(t).length) return !1;
  for (i = s; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[i])) return !1;
  for (i = s; i-- !== 0; ) if (l = p[i], !Ht(e[l], t[l], n)) return !1;
  return !0;
}
function Mo(e, t) {
  return Ht(e, t);
}
function sn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function Z(e) {
  return !Ve(e);
}
function yn(e, t) {
  return null;
}
function ln(e, t, n) {
  return n ? yn() === yn() : Mo(e, t);
}
function qo(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (ln(e, n)) return !0;
  }
  return !1;
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function pr(e = {}, t = {}) {
  let n = Fo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    _e(t[o]) && o in e && _e(e[o]) ? n[o] = pr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Uo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : pr(t, n), {});
}
function be(e, ...t) {
  return sn(e) ? e(...t) : e;
}
function me(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function xe(e) {
  return me(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function un(e, t = "", n = {}) {
  let r = xe(t).split("."), o = r.shift();
  if (o) {
    if (_e(e)) {
      let i = Object.keys(e).find((s) => xe(s) === o) || "";
      return un(be(e[i], n), r.join("."), n);
    }
    return;
  }
  return be(e, n);
}
function fr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Ho(e) {
  return Z(e) && !isNaN(e);
}
function Re(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Wo(...e) {
  return Uo(...e);
}
function Ge(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ko(e) {
  return me(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function mr(e) {
  return me(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function br() {
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
        let i = Array.isArray(r) ? [$e(...r)] : Object.entries(r).map(([s, l]) => l ? s : void 0);
        t = i.length ? t.concat(i.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Go(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Yo(e, t) {
  if (e && t) {
    let n = (r) => {
      Go(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ft(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function wn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Qo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Zo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Xo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Zo(e));
}
function gt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Et(e, t = {}) {
  if (gt(e)) {
    let n = (r, o) => {
      var i, s;
      let l = (i = e?.$attrs) != null && i[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            a = c.length ? a.concat(c.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Et(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Jo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Et(r, t), r.append(...n), r;
  }
}
function ei(e, t) {
  return gt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ti(e, t) {
  if (gt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function xn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function ni(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || wn(document.documentElement) || wn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function ri(e, t) {
  return e ? e.offsetHeight : 0;
}
function kn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function hr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function oi(e, t = "", n) {
  gt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var kt = {};
function ii(e = "pui_id_") {
  return Object.hasOwn(kt, e) || (kt[e] = 0), kt[e]++, `${e}${kt[e]}`;
}
var ai = Object.defineProperty, si = Object.defineProperties, li = Object.getOwnPropertyDescriptors, At = Object.getOwnPropertySymbols, gr = Object.prototype.hasOwnProperty, vr = Object.prototype.propertyIsEnumerable, _n = (e, t, n) => t in e ? ai(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ye = (e, t) => {
  for (var n in t || (t = {})) gr.call(t, n) && _n(e, n, t[n]);
  if (At) for (var n of At(t)) vr.call(t, n) && _n(e, n, t[n]);
  return e;
}, Mt = (e, t) => si(e, li(t)), Ce = (e, t) => {
  var n = {};
  for (var r in e) gr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && At) for (var r of At(e)) t.indexOf(r) < 0 && vr.call(e, r) && (n[r] = e[r]);
  return n;
}, ui = br(), le = ui, Ze = /{([^}]*)}/g, yr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, wr = /var\([^)]+\)/g;
function $n(e) {
  return me(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function di(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ci(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Wt(e = "", t = "") {
  return ci(`${me(e, !1) && me(t, !1) ? `${e}-` : e}${t}`);
}
function xr(e = "", t = "") {
  return `--${Wt(e, t)}`;
}
function pi(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function kr(e, t = "", n = "", r = [], o) {
  if (me(e)) {
    let i = e.trim();
    if (pi(i)) return;
    if (Re(i, Ze)) {
      let s = i.replaceAll(Ze, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Re(u, d)));
        return `var(${xr(n, mr(a.join("-")))}${Z(o) ? `, ${o}` : ""})`;
      });
      return Re(s.replace(wr, "0"), yr) ? `calc(${s})` : s;
    }
    return i;
  } else if (Ho(e)) return e;
}
function fi(e, t, n) {
  me(t, !1) && e.push(`${t}:${n};`);
}
function Fe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function _r(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let a = [], u = 0, d = "", c = null, p = 0;
    for (; u <= s.length; ) {
      let f = s[u];
      if ((f === '"' || f === "'" || f === "`") && s[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === s.length) && p === 0)) {
        let w = d.trim();
        w.startsWith("dt(") ? a.push(_r(w, l)) : a.push(r(w)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return a;
  }
  function r(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let o = [], i = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") i.push(s), s += 2;
  else if (e[s] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && o.push([l, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [l, a] = o[s], u = e.slice(l + 3, a), d = n(u, t), c = t(...d);
    e = e.slice(0, l) + c + e.slice(a + 1);
  }
  return e;
}
var ze = (...e) => mi(G.getTheme(), ...e), mi = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = G.defaults || {}, { prefix: s, transform: l } = e?.options || i || {}, a = Re(t, Ze) ? t : `{${t}}`;
    return r === "value" || Ve(r) && l === "strict" ? G.getTokenValue(t) : kr(a, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function _t(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var s;
      return r + o + ((s = be(t[i], { dt: ze })) != null ? s : "");
    }, "");
    return _r(n, ze);
  }
  return be(e, { dt: ze });
}
function bi(e, t = {}) {
  let n = G.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, s = [], l = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: d, path: c } = a.pop();
    for (let p in d) {
      let f = d[p], w = di(f), x = Re(p, i) ? Wt(c) : Wt(c, mr(p));
      if (_e(w)) a.push({ node: w, path: x });
      else {
        let k = xr(x), C = kr(w, x, r, [i]);
        fi(l, k, C);
        let $ = x;
        r && $.startsWith(r + "-") && ($ = $.slice(r.length + 1)), s.push($.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: Fe(o, u) };
}
var ve = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return bi(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, s, l, a, u, d, c;
  let { preset: p, options: f } = t, w, x, k, C, $, T, g;
  if (Z(p) && f.transform !== "strict") {
    let { primitive: E, semantic: I, extend: h } = p, A = I || {}, { colorScheme: N } = A, B = Ce(A, ["colorScheme"]), Y = h || {}, { colorScheme: J } = Y, Q = Ce(Y, ["colorScheme"]), ee = N || {}, { dark: R } = ee, se = Ce(ee, ["dark"]), Se = J || {}, { dark: Te } = Se, _ = Ce(Se, ["dark"]), S = Z(E) ? this._toVariables({ primitive: E }, f) : {}, P = Z(B) ? this._toVariables({ semantic: B }, f) : {}, D = Z(se) ? this._toVariables({ light: se }, f) : {}, X = Z(R) ? this._toVariables({ dark: R }, f) : {}, he = Z(Q) ? this._toVariables({ semantic: Q }, f) : {}, vt = Z(_) ? this._toVariables({ light: _ }, f) : {}, yt = Z(Te) ? this._toVariables({ dark: Te }, f) : {}, [Pe, wt] = [(i = S.declarations) != null ? i : "", S.tokens], [io, ao] = [(s = P.declarations) != null ? s : "", P.tokens || []], [so, lo] = [(l = D.declarations) != null ? l : "", D.tokens || []], [uo, co] = [(a = X.declarations) != null ? a : "", X.tokens || []], [po, fo] = [(u = he.declarations) != null ? u : "", he.tokens || []], [mo, bo] = [(d = vt.declarations) != null ? d : "", vt.tokens || []], [ho, go] = [(c = yt.declarations) != null ? c : "", yt.tokens || []];
    w = this.transformCSS(e, Pe, "light", "variable", f, r, o), x = wt;
    let vo = this.transformCSS(e, `${io}${so}`, "light", "variable", f, r, o), yo = this.transformCSS(e, `${uo}`, "dark", "variable", f, r, o);
    k = `${vo}${yo}`, C = [.../* @__PURE__ */ new Set([...ao, ...lo, ...co])];
    let wo = this.transformCSS(e, `${po}${mo}color-scheme:light`, "light", "variable", f, r, o), xo = this.transformCSS(e, `${ho}color-scheme:dark`, "dark", "variable", f, r, o);
    $ = `${wo}${xo}`, T = [.../* @__PURE__ */ new Set([...fo, ...bo, ...go])], g = be(p.css, { dt: ze });
  }
  return { primitive: { css: w, tokens: x }, semantic: { css: k, tokens: C }, global: { css: $, tokens: T }, style: g };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: s }) {
  var l, a, u;
  let d, c, p;
  if (Z(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), w = t, { colorScheme: x, extend: k, css: C } = w, $ = Ce(w, ["colorScheme", "extend", "css"]), T = k || {}, { colorScheme: g } = T, E = Ce(T, ["colorScheme"]), I = x || {}, { dark: h } = I, A = Ce(I, ["dark"]), N = g || {}, { dark: B } = N, Y = Ce(N, ["dark"]), J = Z($) ? this._toVariables({ [f]: ye(ye({}, $), E) }, n) : {}, Q = Z(A) ? this._toVariables({ [f]: ye(ye({}, A), Y) }, n) : {}, ee = Z(h) ? this._toVariables({ [f]: ye(ye({}, h), B) }, n) : {}, [R, se] = [(l = J.declarations) != null ? l : "", J.tokens || []], [Se, Te] = [(a = Q.declarations) != null ? a : "", Q.tokens || []], [_, S] = [(u = ee.declarations) != null ? u : "", ee.tokens || []], P = this.transformCSS(f, `${R}${Se}`, "light", "variable", n, o, i, s), D = this.transformCSS(f, _, "dark", "variable", n, o, i, s);
    d = `${P}${D}`, c = [.../* @__PURE__ */ new Set([...se, ...Te, ...S])], p = be(C, { dt: ze });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: s, options: l } = t, a = (i = s?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: a, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, s;
  let l = e.replace("-directive", ""), { preset: a, options: u } = t, d = ((i = a?.components) == null ? void 0 : i[l]) || ((s = a?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${be(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), l = Object.entries(r).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, d]) => {
    if (_e(d) && Object.hasOwn(d, "css")) {
      let c = Ge(d.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${c}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var s;
  let l = { name: e, theme: t, params: n, set: o, defaults: i }, a = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(r).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Ge(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Ze.test(this.value)) {
      let c = this.value.trim().replace(Ze, (p) => {
        var f;
        let w = p.slice(1, -1), x = this.tokens[w];
        if (!x) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let k = x.computed(l, a, u);
        return Array.isArray(k) && k.length === 2 ? `light-dark(${k[0].value},${k[1].value})` : (f = k?.value) != null ? f : "__UNRESOLVED__";
      });
      d = yr.test(c.replace(wr, "0")) ? `calc(${c})` : c;
    }
    return Ve(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, a, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let p = Re(d, t.variable.excludedKeyRegex) ? a : a ? `${a}.${$n(d)}` : $n(d), f = u ? `${u}.${d}` : d;
      _e(c) ? s(c, p, f) : (o[p] || (o[p] = { paths: [], computed: (w, x = {}, k = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, x.binding, k);
        if (w && w !== "none") for (let C = 0; C < o[p].paths.length; C++) {
          let $ = o[p].paths[C];
          if ($.scheme === w) return $.computed(w, x.binding, k);
        }
        return o[p].paths.map((C) => C.computed(C.scheme, x[C.scheme], k));
      } }), o[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((a) => !Re(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, a) => {
    let u = a, { colorScheme: d } = u, c = Ce(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Fe(Z(t) ? `${e}${t},${e} ${t}` : e, r) : Fe(e, Fe(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, s, l) {
  if (Z(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (Z(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, l, c, t)), d), "") : Fe(l ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      _e(a) && (u.name = be(a.name, { name: e, type: r })), Z(u.name) && (t = Fe(`@layer ${u.name}`, t), i?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, G = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Mt(ye({}, t), { options: ye(ye({}, this.defaults.options), t.options) }), this._tokens = ve.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Mt(ye({}, this.theme), { preset: e }), this._tokens = ve.createTokens(e, this.defaults), this.clearLoadedStyleNames(), le.emit("preset:change", e), le.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Mt(ye({}, this.theme), { options: e }), this.clearLoadedStyleNames(), le.emit("options:change", e), le.emit("theme:change", this.theme);
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
  return ve.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ve.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ve.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ve.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ve.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ve.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
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
}, hi = `
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
function Sn(e, t) {
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
    t % 2 ? Sn(Object(n), !0).forEach(function(r) {
      gi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Sn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function gi(e, t, n) {
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vi(e) {
  var t = yi(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function yi(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function wi(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  bn() && bn().components ? It(e) : t ? e() : qe(e);
}
var xi = 0;
function ki(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), r = U(e), o = U(null), i = hr() ? window.document : void 0, s = t.document, l = s === void 0 ? i : s, a = t.immediate, u = a === void 0 ? !0 : a, d = t.manual, c = d === void 0 ? !1 : d, p = t.name, f = p === void 0 ? "style_".concat(++xi) : p, w = t.id, x = w === void 0 ? void 0 : w, k = t.media, C = k === void 0 ? void 0 : k, $ = t.nonce, T = $ === void 0 ? void 0 : $, g = t.first, E = g === void 0 ? !1 : g, I = t.onMounted, h = I === void 0 ? void 0 : I, A = t.onUpdated, N = A === void 0 ? void 0 : A, B = t.onLoad, Y = B === void 0 ? void 0 : B, J = t.props, Q = J === void 0 ? {} : J, ee = function() {
  }, R = function(Te) {
    var _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var S = Cn(Cn({}, Q), _), P = S.name || f, D = S.id || x, X = S.nonce || T;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(P, '"]')) || l.getElementById(D) || l.createElement("style"), o.value.isConnected || (r.value = Te || e, Et(o.value, {
        type: "text/css",
        id: D,
        media: C,
        nonce: X
      }), E ? l.head.prepend(o.value) : l.head.appendChild(o.value), oi(o.value, "data-primevue-style-id", P), Et(o.value, S), o.value.onload = function(he) {
        return Y?.(he, {
          name: P
        });
      }, h?.(P)), !n.value && (ee = re(r, function(he) {
        o.value.textContent = he, N?.(P);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, se = function() {
    !l || !n.value || (ee(), Xo(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && wi(R), {
    id: x,
    name: f,
    el: o,
    css: r,
    unload: se,
    load: R,
    isLoaded: ko(n)
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
var Tn, Pn, On, En;
function An(e, t) {
  return Ci(e) || Si(e, t) || $i(e, t) || _i();
}
function _i() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $i(e, t) {
  if (e) {
    if (typeof e == "string") return Nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nn(e, t) : void 0;
  }
}
function Nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Si(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, s, l = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Ci(e) {
  if (Array.isArray(e)) return e;
}
function Ln(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function qt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ln(Object(n), !0).forEach(function(r) {
      Ti(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ti(e, t, n) {
  return (t = Pi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Pi(e) {
  var t = Oi(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function Oi(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function $t(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Ei = function(t) {
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
}, Ai = {}, Ni = {}, K = {
  name: "base",
  css: Ei,
  style: hi,
  classes: Ai,
  inlineStyles: Ni,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(_t(Tn || (Tn = $t(["", ""])), t));
    return Z(o) ? ki(Ge(o), qt({
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
      return G.transformCSS(n.name || t.name, "".concat(o).concat(_t(Pn || (Pn = $t(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return G.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return G.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return G.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return G.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return G.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = be(this.css, {
        dt: ze
      }) || "", o = Ge(_t(On || (On = $t(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(s, l) {
        var a = An(l, 2), u = a[0], d = a[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return Z(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return G.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [G.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = _t(En || (En = $t(["", ""])), be(this.style, {
        dt: ze
      })), s = Ge(G.transformCSS(o, i)), l = Object.entries(n).reduce(function(a, u) {
        var d = An(u, 2), c = d[0], p = d[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      Z(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return qt(qt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ee = br();
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
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function St(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? jn(Object(n), !0).forEach(function(r) {
      Li(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : jn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Li(e, t, n) {
  return (t = ji(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ji(e) {
  var t = Ii(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Ii(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ri = {
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
}, zi = Symbol();
function Vi(e, t) {
  var n = {
    config: lr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(zi, n), Bi(), Di(e, n), n;
}
var Me = [];
function Bi() {
  le.clear(), Me.forEach(function(e) {
    return e?.();
  }), Me = [];
}
function Di(e, t) {
  var n = U(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !G.isStyleNameLoaded("common")) {
      var d, c, p = ((d = K.getCommonTheme) === null || d === void 0 ? void 0 : d.call(K)) || {}, f = p.primitive, w = p.semantic, x = p.global, k = p.style, C = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      K.load(f?.css, St({
        name: "primitive-variables"
      }, C)), K.load(w?.css, St({
        name: "semantic-variables"
      }, C)), K.load(x?.css, St({
        name: "global-variables"
      }, C)), K.loadStyle(St({
        name: "global-style"
      }, C), k), G.setLoadedStyleName("common");
    }
  };
  le.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = re(t.config, function(a, u) {
    Ee.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = re(function() {
    return t.config.ripple;
  }, function(a, u) {
    Ee.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = re(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || G.setTheme(a), t.config.unstyled || r(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = re(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && r(), Ee.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Me.push(o), Me.push(i), Me.push(s), Me.push(l);
}
var Fi = {
  install: function(t, n) {
    var r = Wo(Ri, n);
    Vi(t, r);
  }
}, $r = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = hr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Mi(e, t, n, r, o, i) {
  return i.inline ? ce(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (b(), M(ur, {
    key: 1,
    to: n.appendTo
  }, [ce(e.$slots, "default")], 8, ["to"])) : j("", !0);
}
$r.render = Mi;
var Oe = {
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
function qi() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Rt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var In = K.extend({
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
function Ui(e) {
  return Tr(e) || Hi(e) || Cr(e) || Sr();
}
function Hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function We(e, t) {
  return Tr(e) || Wi(e, t) || Cr(e, t) || Sr();
}
function Sr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Cr(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Wi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, s, l = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Tr(e) {
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
function F(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rn(Object(n), !0).forEach(function(r) {
      Ke(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ke(e, t, n) {
  return (t = Ki(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ki(e) {
  var t = Gi(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Gi(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var He = {
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
        var r = this;
        le.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, i, s, l, a, u, d, c, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = w || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var x = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, k = x ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, C = x ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = C || k) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = qi(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = ei(gt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = F({
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
      return sn(t) ? t.apply(void 0, r) : y.apply(void 0, r);
    },
    _load: function() {
      Oe.isStyleNameLoaded("base") || (K.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Oe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Oe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (In.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Oe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      Z(t) && K.load(t, F({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!G.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = i.primitive, l = i.semantic, a = i.global, u = i.style;
          K.load(s?.css, F({
            name: "primitive-variables"
          }, this.$styleOptions)), K.load(l?.css, F({
            name: "semantic-variables"
          }, this.$styleOptions)), K.load(a?.css, F({
            name: "global-variables"
          }, this.$styleOptions)), K.loadStyle(F({
            name: "global-style"
          }, this.$styleOptions), u), G.setLoadedStyleName("common");
        }
        if (!G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, w = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, x = w.css, k = w.style;
          (p = this.$style) === null || p === void 0 || p.load(x, F({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(F({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), k), G.setLoadedStyleName(this.$style.name);
        }
        if (!G.isStyleNameLoaded("layer-order")) {
          var C, $, T = (C = this.$style) === null || C === void 0 || ($ = C.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(C);
          K.load(T, F({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), G.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = i.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, F({
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
      Oe.clearLoadedStyleNames(), le.on("theme:change", t);
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return un(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, d = l.mergeProps, c = d === void 0 ? !1 : d, p = i ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, F(F({}, o), {}, {
        global: p || {}
      })), w = this._getPTDatasets(r);
      return u || !u && f ? c ? this._mergeProps(c, p, f, w) : F(F(F({}, p), f), w) : F(F({}, f), w);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return y(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && Z((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && F(F({}, r === "root" && F(F(Ke({}, "".concat(o, "name"), xe(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Ke({}, "".concat(o, "extend"), xe(this.$.type.name))), {}, Ke({}, "".concat(this.$attrSelector), ""))), {}, Ke({}, "".concat(o, "section"), xe(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return me(t) || fr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(l) : l, c = xe(r), p = xe(n.$name);
        return (a = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && a !== void 0 ? a : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(x) {
        return n(x, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, d = l.mergeProps, c = d === void 0 ? !1 : d, p = i(t.originalValue), f = i(t.value);
        return p === void 0 && f === void 0 ? void 0 : me(f) ? f : me(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : F(F({}, p), f) : f;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, F(F({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = y(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, F({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, F(F({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, F(F({}, this.$params), r)), i = this._getOptionValue(In.inlineStyles, t, F(F({}, this.$params), r));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return be(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, F({}, n.$params)) || be(r, F({}, n.$params));
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
        var o = We(r, 1), i = o[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return F(F({
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
        var n = We(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], i = r[1], s = o.split(":"), l = Ui(s), a = Kt(l).slice(1);
        return a?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? i : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = We(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, Yi = `
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
`, Qi = K.extend({
  name: "baseicon",
  css: Yi
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function zn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Vn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(r) {
      Zi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Zi(e, t, n) {
  return (t = Xi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xi(e) {
  var t = Ji(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ji(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bt = {
  name: "BaseIcon",
  extends: He,
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
  style: Qi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ve(this.label);
      return Vn(Vn({}, !this.isUnstyled && {
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
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Bn(e, t) {
  return ra(e) || na(e, t) || ta(e, t) || ea();
}
function ea() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ta(e, t) {
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
function na(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, s, l = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(a = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function ra(e) {
  if (Array.isArray(e)) return e;
}
function Fn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function H(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Fn(Object(n), !0).forEach(function(r) {
      Gt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Gt(e, t, n) {
  return (t = oa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oa(e) {
  var t = ia(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function ia(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var z = {
  _getMeta: function() {
    return [_e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], be(_e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: un,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var $ = z._getOptionValue.apply(z, arguments);
      return me($) || fr($) ? {
        class: $
      } : $;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, w = l ? z._useDefaultPT(r, r.defaultPT(), a, i, s) : void 0, x = z._usePT(r, z._getPT(o, r.$name), a, i, H(H({}, s), {}, {
      global: w || {}
    })), k = z._getPTDatasets(r, i);
    return c || !c && x ? f ? z._mergeProps(r, f, w, x, k) : H(H(H({}, w), x), k) : H(H({}, x), k);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return H(H({}, n === "root" && Gt({}, "".concat(r, "name"), xe(t.$name))), {}, Gt({}, "".concat(r, "section"), xe(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var l, a = r ? r(s) : s, u = xe(n);
      return (l = a?.[u]) !== null && l !== void 0 ? l : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, s = function(k) {
      return r(k, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, a = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = a.mergeSections, d = u === void 0 ? !0 : u, c = a.mergeProps, p = c === void 0 ? !1 : c, f = s(n.originalValue), w = s(n.value);
      return f === void 0 && w === void 0 ? void 0 : me(w) ? w : me(f) ? f : d || !d && w ? p ? z._mergeProps(t, p, f, w) : H(H({}, f), w) : w;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return z._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = z._getConfig(r, o), s = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    z._loadCoreStyles(n, s), z._loadThemeStyles(n, s), z._loadScopedThemeStyles(n, s), z._removeThemeListeners(n), n.$loadStyles = function() {
      return z._loadThemeStyles(n, s);
    }, z._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Oe.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      K.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), Oe.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!G.isStyleNameLoaded("common")) {
        var s, l, a = ((s = o.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = a.primitive, d = a.semantic, c = a.global, p = a.style;
        K.load(u?.css, H({
          name: "primitive-variables"
        }, i)), K.load(d?.css, H({
          name: "semantic-variables"
        }, i)), K.load(c?.css, H({
          name: "global-variables"
        }, i)), K.loadStyle(H({
          name: "global-style"
        }, i), p), G.setLoadedStyleName("common");
      }
      if (!G.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, w, x, k, C = ((f = o.$style) === null || f === void 0 || (w = f.getDirectiveTheme) === null || w === void 0 ? void 0 : w.call(f)) || {}, $ = C.css, T = C.style;
        (x = o.$style) === null || x === void 0 || x.load($, H({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (k = o.$style) === null || k === void 0 || k.loadStyle(H({
          name: "".concat(o.$style.name, "-style")
        }, i), T), G.setLoadedStyleName(o.$style.name);
      }
      if (!G.isStyleNameLoaded("layer-order")) {
        var g, E, I = (g = o.$style) === null || g === void 0 || (E = g.getLayerOrderThemeCSS) === null || E === void 0 ? void 0 : E.call(g);
        K.load(I, H({
          name: "layer-order",
          first: !0
        }, i)), G.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, s, l = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, a = l.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(a, H({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Oe.clearLoadedStyleNames(), le.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    le.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, s) {
    var l, a, u = "on".concat(Ko(n)), d = z._getConfig(o, i), c = r?.$instance, p = z._usePT(c, z._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), z._getOptionValue, "hooks.".concat(u)), f = z._useDefaultPT(c, d == null || (a = d.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], z._getOptionValue, "hooks.".concat(u)), w = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: s
    };
    p?.(c, w), f?.(c, w);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return sn(t) ? t.apply(void 0, r) : y.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, a, u, d, c) {
      var p, f, w, x;
      a._$instances = a._$instances || {};
      var k = z._getConfig(u, d), C = a._$instances[t] || {}, $ = Ve(C) ? H(H({}, n), n?.methods) : {};
      a._$instances[t] = H(H({}, C), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: C.$el || a || void 0,
        $style: H({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: k,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return z._getPT(k?.pt, void 0, function(g) {
            var E;
            return g == null || (E = g.directives) === null || E === void 0 ? void 0 : E[t];
          });
        },
        isUnstyled: function() {
          var g, E;
          return ((g = a._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (E = a._$instances[t]) === null || E === void 0 || (E = E.$binding) === null || E === void 0 || (E = E.value) === null || E === void 0 ? void 0 : E.unstyled : k?.unstyled;
        },
        theme: function() {
          var g;
          return (g = a._$instances[t]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = a._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return z._getPTValue(a._$instances[t], (g = a._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, E, H({}, I));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", I = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return z._getPTValue(a._$instances[t], g, E, I, !1);
        },
        cx: function() {
          var g, E, I = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", h = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = a._$instances[t]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : z._getOptionValue((E = a._$instances[t]) === null || E === void 0 || (E = E.$style) === null || E === void 0 ? void 0 : E.classes, I, H({}, h));
        },
        sx: function() {
          var g, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return I ? z._getOptionValue((g = a._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, E, H({}, h)) : void 0;
        }
      }, $), a.$instance = a._$instances[t], (f = (w = a.$instance)[l]) === null || f === void 0 || f.call(w, a, u, d, c), a["$".concat(t)] = a.$instance, z._hook(t, l, a, u, d, c), a.$pd || (a.$pd = {}), a.$pd[t] = H(H({}, (x = a.$pd) === null || x === void 0 ? void 0 : x[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, o = function(l) {
      var a, u, d, c = l._$instances[t], p = c?.watch, f = function(k) {
        var C, $ = k.newValue, T = k.oldValue;
        return p == null || (C = p.config) === null || C === void 0 ? void 0 : C.call(c, $, T);
      }, w = function(k) {
        var C, $ = k.newValue, T = k.oldValue;
        return p == null || (C = p["config.ripple"]) === null || C === void 0 ? void 0 : C.call(c, $, T);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": w
      }, p == null || (a = p.config) === null || a === void 0 || a.call(c, c?.$primevueConfig), Ee.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ee.on("config:ripple:change", w);
    }, i = function(l) {
      var a = l._$instances[t].$watchersCallback;
      a && (Ee.off("config:change", a.config), Ee.off("config:ripple:change", a["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, a, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: ii("pd")
        }, r("created", l, a, u, d);
      },
      beforeMount: function(l, a, u, d) {
        var c;
        z._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), r("beforeMount", l, a, u, d), o(l);
      },
      mounted: function(l, a, u, d) {
        var c;
        z._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), r("mounted", l, a, u, d);
      },
      beforeUpdate: function(l, a, u, d) {
        r("beforeUpdate", l, a, u, d);
      },
      updated: function(l, a, u, d) {
        var c;
        z._loadStyles((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), r("updated", l, a, u, d);
      },
      beforeUnmount: function(l, a, u, d) {
        var c;
        i(l), z._removeThemeListeners((c = l.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", l, a, u, d);
      },
      unmounted: function(l, a, u, d) {
        var c;
        (c = l.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", l, a, u, d);
      }
    };
  },
  extend: function() {
    var t = z._getMeta.apply(z, arguments), n = Bn(t, 2), r = n[0], o = n[1];
    return H({
      extend: function() {
        var s = z._getMeta.apply(z, arguments), l = Bn(s, 2), a = l[0], u = l[1];
        return z.extend(a, H(H(H({}, o), o?.methods), u));
      }
    }, z._extend(r, o));
  }
}, aa = `
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
`, sa = {
  root: "p-ink"
}, la = K.extend({
  name: "ripple-directive",
  style: aa,
  classes: sa
}), ua = z.extend({
  style: la
});
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function da(e) {
  return ma(e) || fa(e) || pa(e) || ca();
}
function ca() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pa(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ma(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Mn(e, t, n) {
  return (t = ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ba(e) {
  var t = ha(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function ha(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pr = ua.extend("ripple", {
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
      n || (n = Jo("span", Mn(Mn({
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
        if (!this.isUnstyled() && Ft(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !xn(o) && !kn(o)) {
          var i = Math.max(Qo(r), ri(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var s = ni(r), l = t.pageX - s.left + document.body.scrollTop - kn(o) / 2, a = t.pageY - s.top + document.body.scrollLeft - xn(o) / 2;
        o.style.top = a + "px", o.style.left = l + "px", !this.isUnstyled() && Yo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Ft(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ft(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? da(t.children).find(function(n) {
        return ti(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ga = "data-wippy-overlay-layer";
function Or() {
  return typeof window < "u" && typeof window.document < "u";
}
function Er() {
  return Or() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function va() {
  return Er() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const ya = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let wa = 0;
const Nt = /* @__PURE__ */ new WeakMap();
function qn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function xa(e, t) {
  if (!ya.test(e.className))
    return;
  const n = e.style.cssText;
  qn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Nt.has(e)) {
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && qn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Nt.set(e, r);
  }
}
function dn(e) {
  const t = Nt.get(e);
  t && (t.disconnect(), Nt.delete(e));
}
function ka(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Qt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Lt = /* @__PURE__ */ new Set(), cn = /* @__PURE__ */ new WeakMap();
let Un = !1, Zt = !1;
function _a() {
  Zt = !1;
  for (const e of Lt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && dn(t);
      Lt.delete(e), cn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Qt(e);
  }
}
function Hn() {
  Zt || (Zt = !0, requestAnimationFrame(_a));
}
function $a(e) {
  const t = document.createElement("div");
  t.setAttribute(ga, "");
  const n = Er();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Qt(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const s of o) {
      if (i)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && xa(l, i);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && dn(l);
    }
    t.isConnected && t.childElementCount > 0 && Qt(t);
  });
  return r.observe(t, { childList: !0 }), cn.set(t, r), Lt.add(t), Un || (Un = !0, window.addEventListener("scroll", Hn, { capture: !0, passive: !0 }), window.addEventListener("resize", Hn, { passive: !0 })), t;
}
function Wn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = $a(e.hostRoot), va())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++wa}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Kn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && dn(t);
    Lt.delete(e.layer), cn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Gn = !1;
function Sa() {
  if (Gn)
    return;
  Gn = !0;
  const e = $r;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Or() && (this.hostRoot = ka(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Wn(this), this.$watch("inline", (t) => {
      t ? Kn(this) : Wn(this);
    })));
  }, e.render = function() {
    return this.inline ? ce(this.$slots, "default", { key: 0 }) : this.mounted ? _o(ur, { key: 1, to: this.resolvedTarget || document.body }, [
      ce(this.$slots, "default")
    ]) : j("", !0);
  }, e.unmounted = function() {
    Kn(this);
  };
}
const Ca = {
  install: (e) => {
    Sa(), e.use(Fi, { theme: "none" });
  }
};
var Xt = "data-wippy-visible";
function Yn(e) {
  const t = e.getAttribute(Xt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Ta = Object.defineProperty, Pa = (e, t, n) => t in e ? Ta(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, te = (e, t, n) => Pa(e, typeof t != "symbol" ? t + "" : t, n), Oa = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Ea = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Qn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Aa(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, l] of Object.entries(o)) {
            const a = typeof l == "string" ? Qn(s) : null;
            a && t.add(a);
          }
          continue;
        }
        const i = typeof o == "string" ? Qn(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Na(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Ea} {
${t}
}`;
}
function La(e, t) {
  const n = Na(t);
  n && Ar(e, n, "@wippy-fe/css-variables-bridge");
}
function ja(e, t) {
  const r = (t ?? Oa).map(async (o) => {
    const i = No[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Lo(i);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const s = document.createElement("style");
      s.textContent = i, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function Ia(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ar(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Ra(e, t) {
  Ar(e, t, "@wippy-fe/custom-css");
}
function Nr(e) {
  return e.__wippyHost ?? null;
}
function za(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Va(e, t, n) {
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
function Ut(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), l = za(o);
    if (s === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const a = Va(o, s, i);
    a.error ? r.push(a.error) : n[l] = a.value;
  }
  return { props: n, errors: r };
}
var Ba = class {
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
}, Da = class extends HTMLElement {
  constructor() {
    super(), te(this, "_internals"), te(this, "_contentObserver", null), te(this, "_initialized", !1), te(this, "_container", null), te(this, "_reactive", null), te(this, "_lastProps", null), te(this, "_lastErrors", []), te(this, "_lastContent", null), te(this, "_themeUnsub", null), te(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Yn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Xt])];
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
    return Nr(this);
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
        const i = Ut(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Ba(
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
        this.onInit(n), e.inlineCss && Ia(n, e.inlineCss);
        try {
          const u = hn?.theming, d = Aa(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          La(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = hn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Ra(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && ja(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const a = e.containerClasses ?? [];
        a.length > 0 && r.classList.add(...a), n.appendChild(r), this._container = r, Eo(Po);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = De("@theme", (a) => this._applyTheme(a)));
      const { props: o, errors: i } = Ut(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const a = this._extractContent(e.contentTemplate);
        this._lastContent = a, this._reactive?.notifyContent(a), this.onContentChanged(a);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ao.getThemeMode?.()) {
    xt(e, this), this._container && xt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), xt("auto", this), this._container && xt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Xt) {
      const l = this._hostVisible, a = Yn(this);
      if (a === l)
        return;
      this._hostVisible = a, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(a, l), this.onHostVisibilityChanged(a, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = Ut(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = i, this._reactive?.notifyProps(s, i), this.onPropsChanged(s, i);
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
function Fa(e) {
  return e.__wippyHostBus ?? null;
}
function Ma(e) {
  return e.dataset.wippyPanelId ?? null;
}
var qa = Object.defineProperty, Ua = (e, t, n) => t in e ? qa(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Be = (e, t, n) => Ua(e, typeof t != "symbol" ? t + "" : t, n), Ha = /* @__PURE__ */ Symbol("wippy:emit"), Lr = /* @__PURE__ */ Symbol("wippy:props"), jr = /* @__PURE__ */ Symbol("wippy:props_error"), Wa = /* @__PURE__ */ Symbol("wippy:content"), Ka = /* @__PURE__ */ Symbol("wippy:panel-id"), Ga = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ya = /* @__PURE__ */ Symbol("wippy:host"), Qa = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Za() {
  const e = zt(Lr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Xa() {
  const e = zt(jr);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Ja = class extends Da {
  constructor() {
    super(...arguments), Be(this, "_vueApp", null), Be(this, "_propsRef", U({})), Be(this, "_errorsRef", U([])), Be(this, "_contentRef", U(null)), Be(this, "_hostVisibilityRef", U(null)), Be(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, i) {
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
    const a = (u) => {
      if (l.signal.aborted)
        return;
      const d = Io(), c = $o(u.rootComponent);
      this._vueApp = c;
      const p = Ro();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (c.use(p), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(Lr, this._propsRef), c.provide(jr, this._errorsRef), c.provide(Ha, this.emitEvent.bind(this)), c.provide(Wa, this._contentRef), c.provide(Qa, this._hostVisibilityRef), c.provide(Ka, Ma(this)), c.provide(Ga, Fa(this)), c.provide(Ya, Nr(this)), u.providers && u.providers(c, this), c.mount(t), d && zo(d);
    };
    if (s.rootComponent)
      a(s);
    else if (s.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), s.lazyConfig().then((d) => {
        l.signal.aborted || (u.remove(), a(d));
      }).catch((d) => {
        if (l.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", c), u.replaceWith(p), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const es = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead.' }, definition: { type: "object", default: null, description: 'The questions to ask: `title`, optional `description`, and `fields`, a list of choice questions, each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`. Optional `submit_label` and `answered_message` are accepted and not shown. A definition with no fields shows an error message.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' } } } }, ts = {
  wippy: es
};
function pn(e) {
  return Oo[e];
}
const ns = 2e3;
function rs(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function o() {
    n && clearTimeout(n), n = null;
  }
  re([() => e.value?.artifact_id, () => e.value?.status, () => e.value?.delivery], () => {
    const i = e.value;
    if (!i || i.status !== "idle" || i.delivery !== "pending" || r.has(i.artifact_id))
      return;
    o();
    const s = i.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== s || l.delivery !== "pending" || r.has(s) || (r.add(s), pn("ws")?.send({ type: "session_open", session_id: l.session_id }));
    }, ns);
  }, { immediate: !0 }), Vt(o);
}
const Ir = "This form needs a newer Web Host.", Rr = "This form cannot be submitted here.", Pt = "Could not submit this form.", zr = "Could not load this form.", os = 5e3;
function is(e, t) {
  const n = U("idle"), r = U(null), o = U(null), i = U(null);
  let s = 0, l = null, a = null, u = null, d = null, c = null, p = !1;
  function f() {
    p || c || (p = !0, c = setTimeout(() => {
      c = null, x();
    }, os));
  }
  async function w() {
    const h = pn("artifactState");
    if (typeof h != "function") {
      n.value = "unsupported";
      return;
    }
    const A = e.value;
    if (!A) {
      n.value = "idle", r.value = null, i.value = null;
      return;
    }
    const N = ++s, B = r.value === null;
    B && (n.value = "loading");
    try {
      const Y = await h(A).get();
      if (N !== s)
        return;
      r.value = Y, n.value = "loaded", o.value = null, i.value = null, p = !1;
    } catch (Y) {
      if (N !== s)
        return;
      const J = Y instanceof Error ? Y.message : zr;
      B ? (n.value = "error", o.value = J) : (i.value = J, f());
    }
  }
  function x() {
    return l ? (a || (a = l.then(() => (a = null, x()))), a) : (l = w().finally(() => {
      l = null;
    }), l);
  }
  function k(h) {
    d !== h && (u?.(), u = null, d = h, h && (u = De(`artifact:${h}`, () => {
      x();
    })));
  }
  re(t, () => {
    x();
  });
  const C = V(() => {
    const h = r.value;
    return h?.session_id && (h.status === "active" && !h.stale || h.status === "idle" && h.delivery && h.delivery !== "complete") ? h.session_id : null;
  });
  let $ = null, T = null, g = null, E = null;
  It(() => {
    re(e, (h) => {
      s++, r.value = null, i.value = null, k(h), x();
    }, { immediate: !0 }), re(C, (h) => {
      $?.(), $ = null, T?.(), T = null, h && ($ = De(`session:${h}:message:*`, (A) => {
        A.data?.type !== "chunk" && x();
      }), T = De(`session:${h}`, () => {
        x();
      }));
    }, { immediate: !0 }), g = De("@visibility", (h) => {
      h && x();
    }), E = De("@reconnect", () => {
      x();
    });
  }), Vt(() => {
    s++, c && clearTimeout(c), c = null, u?.(), $?.(), T?.(), g?.(), E?.();
  });
  async function I() {
    return await x(), r.value;
  }
  return { status: n, state: r, errorMessage: o, reloadError: i, reload: () => {
    x();
  }, refresh: I };
}
function as() {
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
const ss = Symbol.for("wippy.artifactStateError");
function Vr(e) {
  return typeof e == "object" && e !== null && e[ss] === !0;
}
function ls(e) {
  return Vr(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function us(e) {
  return !Vr(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function Br(e) {
  const t = ls(e);
  if (t.known) {
    const n = t.status;
    return n === void 0 ? t.noResponse ? { code: "network_error", message: "Network problem. Retrying…", retryable: !0, uncertain: !0, shouldReload: !1 } : { code: "unknown", message: t.message ?? Pt, retryable: !0, uncertain: !1, shouldReload: !1 } : n === 401 ? { code: "auth", message: "You are signed out. Sign in again, then retry.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 404 ? { code: "not_found", message: "This form is no longer available.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 409 ? t.code === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : t.code === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 } : n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? Pt, retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? Pt, retryable: !0, uncertain: !1, shouldReload: !1 };
}
const ds = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.", cs = 800, Ct = { ok: !1, ignored: !0 };
function ps(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Zn(e, { exhausted: t }) {
  const n = us(e);
  if (n)
    return { ok: !1, fieldErrors: n.errors, formErrors: n.formErrors };
  const r = Br(e);
  return {
    ok: !1,
    message: t && r.uncertain ? ds : r.message,
    code: r.code,
    retryable: r.retryable,
    shouldReload: r.shouldReload
  };
}
function fs(e) {
  const t = U(!1), n = U(null), r = U(null);
  let o = 0;
  re(e, () => {
    o++, s();
  });
  function i(a) {
    const u = JSON.stringify(a);
    if (n.value && r.value === u)
      return n.value;
    const d = as();
    return n.value = d, r.value = u, d;
  }
  function s() {
    n.value = null, r.value = null;
  }
  async function l(a, u, d) {
    const c = e.value;
    if (!c)
      return { ok: !1, message: Rr };
    const p = pn("artifactState");
    if (typeof p != "function")
      return { ok: !1, message: Ir };
    const f = o, w = () => f !== o, x = {
      form_version: a,
      request_id: i(d),
      expected_content_version: u,
      answers: d
    }, k = () => p(c).submit(x);
    t.value = !0;
    try {
      let C;
      try {
        C = await k();
      } catch ($) {
        if (w())
          return Ct;
        if (!Br($).uncertain)
          return Zn($, { exhausted: !1 });
        if (await ps(cs), w())
          return Ct;
        try {
          C = await k();
        } catch (T) {
          return w() ? Ct : Zn(T, { exhausted: !0 });
        }
      }
      return w() ? Ct : (s(), { ok: !0, accepted: C });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: l };
}
const fn = Symbol("wippy-form:element"), Tt = "data-wippy-artifact-id";
function ms() {
  const e = zt(fn), t = U(e?.getAttribute(Tt) ?? null);
  if (e) {
    let n = null;
    It(() => {
      t.value = e.getAttribute(Tt), n = new MutationObserver(() => {
        t.value = e.getAttribute(Tt);
      }), n.observe(e, { attributes: !0, attributeFilter: [Tt] });
    }), Vt(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function bs(e, t) {
  const n = zt(fn);
  n && So(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function hs(e) {
  const t = U(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return It(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), Vt(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
const gs = () => Za(), vs = Xa;
var Dr = {
  name: "SpinnerIcon",
  extends: Bt
};
function ys(e) {
  return _s(e) || ks(e) || xs(e) || ws();
}
function ws() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xs(e, t) {
  if (e) {
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function ks(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function _s(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function $s(e, t, n, r, o, i) {
  return b(), v("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ys(t[0] || (t[0] = [L("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dr.render = $s;
var Ss = `
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
`, Cs = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Z(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ve(n.value) && !r.$slots.default,
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
}, Ts = K.extend({
  name: "badge",
  style: Ss,
  classes: Cs
}), Ps = {
  name: "BaseBadge",
  extends: He,
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
  style: Ts,
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
function Xn(e, t, n) {
  return (t = Os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Os(e) {
  var t = Es(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function Es(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Fr = {
  name: "Badge",
  extends: Ps,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return $e(Xn(Xn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, As = ["data-p"];
function Ns(e, t, n, r, o, i) {
  return b(), v("span", y({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [ce(e.$slots, "default", {}, function() {
    return [ae(q(e.value), 1)];
  })], 16, As);
}
Fr.render = Ns;
var Ls = `
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
function we(e, t, n) {
  return (t = js(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function js(e) {
  var t = Is(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function Is(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rs = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", we(we(we(we(we(we(we(we(we({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", we({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, zs = K.extend({
  name: "button",
  style: Ls,
  classes: Rs
}), Vs = {
  name: "BaseButton",
  extends: He,
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
  style: zs,
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
function fe(e, t, n) {
  return (t = Bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bs(e) {
  var t = Ds(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function Ds(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ne = {
  name: "Button",
  extends: Vs,
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
      return y(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return $e(fe(fe(fe(fe(fe(fe(fe(fe(fe(fe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return $e(fe(fe({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return $e(fe(fe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Dr,
    Badge: Fr
  },
  directives: {
    ripple: Pr
  }
}, Fs = ["data-p"], Ms = ["data-p"];
function qs(e, t, n, r, o, i) {
  var s = Qe("SpinnerIcon"), l = Qe("Badge"), a = dr("ripple");
  return e.asChild ? ce(e.$slots, "default", {
    key: 1,
    class: Ue(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : cr((b(), M(Ot(e.as), y({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: ie(function() {
      return [ce(e.$slots, "default", {}, function() {
        return [e.loading ? ce(e.$slots, "loadingicon", y({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (b(), v("span", y({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (b(), M(s, y({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ce(e.$slots, "icon", y({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (b(), v("span", y({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, Fs)) : j("", !0)];
        }), e.label ? (b(), v("span", y({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), q(e.label), 17, Ms)) : j("", !0), e.badge ? (b(), M(l, {
          key: 3,
          value: e.badge,
          class: Ue(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : j("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
Ne.render = qs;
var Mr = {
  name: "TimesIcon",
  extends: Bt
};
function Us(e) {
  return Gs(e) || Ks(e) || Ws(e) || Hs();
}
function Hs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ws(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function Ks(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gs(e) {
  if (Array.isArray(e)) return en(e);
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ys(e, t, n, r, o, i) {
  return b(), v("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Us(t[0] || (t[0] = [L("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Mr.render = Ys;
var Qs = `
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
`, Zs = {
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
}, Xs = K.extend({
  name: "message",
  style: Qs,
  classes: Zs
}), Js = {
  name: "BaseMessage",
  extends: He,
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
  style: Xs,
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
function Jn(e, t, n) {
  return (t = el(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function el(e) {
  var t = tl(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function tl(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qr = {
  name: "Message",
  extends: Js,
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
      return $e(Jn(Jn({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Pr
  },
  components: {
    TimesIcon: Mr
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
      nl(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : er(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function nl(e, t, n) {
  return (t = rl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rl(e) {
  var t = ol(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function ol(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var il = ["data-p"], al = ["data-p"], sl = ["data-p"], ll = ["aria-label", "data-p"], ul = ["data-p"];
function dl(e, t, n, r, o, i) {
  var s = Qe("TimesIcon"), l = dr("ripple");
  return b(), M(Co, y({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ie(function() {
      return [o.visible ? (b(), v("div", y({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": i.dataP
      }, e.ptm("root")), [L("div", y({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? ce(e.$slots, "container", {
        key: 0,
        closeCallback: i.close
      }) : (b(), v("div", y({
        key: 1,
        class: e.cx("content"),
        "data-p": i.dataP
      }, e.ptm("content")), [ce(e.$slots, "icon", {
        class: Ue(e.cx("icon"))
      }, function() {
        return [(b(), M(Ot(e.icon ? "span" : null), y({
          class: [e.cx("icon"), e.icon],
          "data-p": i.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (b(), v("div", y({
        key: 0,
        class: e.cx("text"),
        "data-p": i.dataP
      }, e.ptm("text")), [ce(e.$slots, "default")], 16, sl)) : j("", !0), e.closable ? cr((b(), v("button", y({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": i.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(a) {
          return i.close(a);
        }),
        "data-p": i.dataP
      }, tr(tr({}, e.closeButtonProps), e.ptm("closeButton"))), [ce(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (b(), v("i", y({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, ul)) : (b(), M(s, y({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, ll)), [[l]]) : j("", !0)], 16, al))], 16)], 16, il)) : j("", !0)];
    }),
    _: 3
  }, 16);
}
qr.render = dl;
const dt = "text-danger-600 dark:text-danger-400", cl = "text-warn-700 dark:text-warn-400";
function pl(e) {
  return e === "error" ? dt : e === "warn" ? cl : void 0;
}
const fl = { class: "flex items-center gap-2" }, Ae = /* @__PURE__ */ pe({
  __name: "form-message",
  props: {
    severity: {},
    retry: { type: Boolean }
  },
  emits: ["retry"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (b(), M(m(qr), {
      severity: e.severity,
      closable: !1
    }, {
      default: ie(() => [
        L("div", fl, [
          L("span", {
            class: Ue(m(pl)(e.severity))
          }, [
            ce(r.$slots, "default")
          ], 2),
          e.retry ? (b(), M(m(Ne), {
            key: 0,
            type: "button",
            link: "",
            size: "small",
            onClick: o[0] || (o[0] = (i) => n("retry"))
          }, {
            default: ie(() => [...o[1] || (o[1] = [
              ae(" Retry ", -1)
            ])]),
            _: 1
          })) : j("", !0)
        ])
      ]),
      _: 3
    }, 8, ["severity"]));
  }
});
var Ur = {
  name: "CheckIcon",
  extends: Bt
};
function ml(e) {
  return vl(e) || gl(e) || hl(e) || bl();
}
function bl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hl(e, t) {
  if (e) {
    if (typeof e == "string") return tn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tn(e, t) : void 0;
  }
}
function gl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vl(e) {
  if (Array.isArray(e)) return tn(e);
}
function tn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function yl(e, t, n, r, o, i) {
  return b(), v("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ml(t[0] || (t[0] = [L("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ur.render = yl;
var Hr = {
  name: "MinusIcon",
  extends: Bt
};
function wl(e) {
  return $l(e) || _l(e) || kl(e) || xl();
}
function xl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kl(e, t) {
  if (e) {
    if (typeof e == "string") return nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(e, t) : void 0;
  }
}
function _l(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $l(e) {
  if (Array.isArray(e)) return nn(e);
}
function nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Sl(e, t, n, r, o, i) {
  return b(), v("svg", y({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wl(t[0] || (t[0] = [L("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Hr.render = Sl;
var Cl = {
  name: "BaseEditableHolder",
  extends: He,
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
      return n.find(Z);
    }
  },
  computed: {
    $filled: function() {
      return Z(this.d_value);
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
}, Dt = {
  name: "BaseInput",
  extends: Cl,
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
}, Tl = `
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
}, Ol = K.extend({
  name: "checkbox",
  style: Tl,
  classes: Pl
}), El = {
  name: "BaseCheckbox",
  extends: Dt,
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
  style: Ol,
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
  return (t = Nl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Nl(e) {
  var t = Ll(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Ll(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function jl(e) {
  return Vl(e) || zl(e) || Rl(e) || Il();
}
function Il() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rl(e, t) {
  if (e) {
    if (typeof e == "string") return rn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rn(e, t) : void 0;
  }
}
function zl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vl(e) {
  if (Array.isArray(e)) return rn(e);
}
function rn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var mn = {
  name: "Checkbox",
  extends: El,
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
        this.binary ? o = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? o = r.filter(function(i) {
          return !ln(i, n.value);
        }) : o = r ? [].concat(jl(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(o, t) : this.writeValue(o, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : qo(this.value, t);
    },
    dataP: function() {
      return $e(Al({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Ur,
    MinusIcon: Hr
  }
}, Bl = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Dl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Fl = ["data-p"];
function Ml(e, t, n, r, o, i) {
  var s = Qe("CheckIcon"), l = Qe("MinusIcon");
  return b(), v("div", y({
    class: e.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-indeterminate": o.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [L("input", y({
    ref: "input",
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: i.groupName,
    checked: i.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, Dl), L("div", y({
    class: e.cx("box")
  }, i.getPTOptions("box"), {
    "data-p": i.dataP
  }), [ce(e.$slots, "icon", {
    checked: i.checked,
    indeterminate: o.d_indeterminate,
    class: Ue(e.cx("icon")),
    dataP: i.dataP
  }, function() {
    return [i.checked ? (b(), M(s, y({
      key: 0,
      class: e.cx("icon")
    }, i.getPTOptions("icon"), {
      "data-p": i.dataP
    }), null, 16, ["class", "data-p"])) : o.d_indeterminate ? (b(), M(l, y({
      key: 1,
      class: e.cx("icon")
    }, i.getPTOptions("icon"), {
      "data-p": i.dataP
    }), null, 16, ["class", "data-p"])) : j("", !0)];
  })], 16, Fl)], 16, Bl);
}
mn.render = Ml;
var ql = `
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
`, Ul = {
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
}, Hl = K.extend({
  name: "inputtext",
  style: ql,
  classes: Ul
}), Wl = {
  name: "BaseInputText",
  extends: Dt,
  style: Hl,
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
function Kl(e, t, n) {
  return (t = Gl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gl(e) {
  var t = Yl(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Yl(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Wr = {
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
      return y(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return $e(Kl({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ql = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Zl(e, t, n, r, o, i) {
  return b(), v("input", y({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Ql);
}
Wr.render = Zl;
var Xl = `
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
}, eu = K.extend({
  name: "radiobutton",
  style: Xl,
  classes: Jl
}), tu = {
  name: "BaseRadioButton",
  extends: Dt,
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
  style: eu,
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
function nu(e, t, n) {
  return (t = ru(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ru(e) {
  var t = ou(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function ou(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Kr = {
  name: "RadioButton",
  extends: tu,
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
      return t != null && (this.binary ? !!t : ln(t, this.value));
    },
    dataP: function() {
      return $e(nu({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, iu = ["data-p-checked", "data-p-disabled", "data-p"], au = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], su = ["data-p"], lu = ["data-p"];
function uu(e, t, n, r, o, i) {
  return b(), v("div", y({
    class: e.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [L("input", y({
    id: e.inputId,
    type: "radio",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: i.groupName,
    checked: i.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, au), L("div", y({
    class: e.cx("box")
  }, i.getPTOptions("box"), {
    "data-p": i.dataP
  }), [L("div", y({
    class: e.cx("icon")
  }, i.getPTOptions("icon"), {
    "data-p": i.dataP
  }), null, 16, lu)], 16, su)], 16, iu);
}
Kr.render = uu;
const du = ["aria-describedby"], cu = { class: "text-sm font-medium text-color p-0" }, pu = ["role"], fu = ["for"], mu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, bu = {
  key: 0,
  class: "flex items-start gap-2"
}, hu = { class: "flex flex-col gap-1 min-w-0 grow" }, gu = /* @__PURE__ */ pe({
  __name: "choice-field",
  props: {
    field: {}
  },
  setup(e) {
    const t = e, n = Rt(), r = `${n}-desc`, o = `${n}-other`, i = `${n}-other-text`, s = V(() => t.field.multiple ? mn : Kr);
    function l(u) {
      return `${n}-opt-${u}`;
    }
    function a(u, d) {
      return t.field.multiple ? { inputId: u, binary: !0, modelValue: !1, disabled: !0 } : { inputId: u, name: n, value: d, disabled: !0 };
    }
    return (u, d) => (b(), v("fieldset", {
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": e.field.description ? r : void 0
    }, [
      L("legend", cu, [
        ae(q(e.field.label), 1),
        e.field.required ? (b(), v("span", {
          key: 0,
          class: Ue(m(dt))
        }, " (required)", 2)) : j("", !0)
      ]),
      e.field.description ? (b(), v("p", {
        key: 0,
        id: r,
        class: "text-xs text-muted-color m-0"
      }, q(e.field.description), 1)) : j("", !0),
      L("div", {
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup"
      }, [
        (b(!0), v(ne, null, Le(e.field.options, (c, p) => (b(), v("div", {
          key: c.value,
          class: "flex items-start gap-2"
        }, [
          (b(), M(Ot(s.value), y({ ref_for: !0 }, a(l(p), c.value)), null, 16)),
          L("label", {
            for: l(p),
            class: "text-sm text-color break-words"
          }, [
            ae(q(c.label) + " ", 1),
            c.description ? (b(), v("span", mu, q(c.description), 1)) : j("", !0)
          ], 8, fu)
        ]))), 128)),
        e.field.allow_other ? (b(), v("div", bu, [
          (b(), M(Ot(s.value), oe(ge(a(o, "other"))), null, 16)),
          L("div", hu, [
            L("label", {
              for: o,
              class: "text-sm text-color"
            }, "Other"),
            L("label", {
              for: i,
              class: "sr-only"
            }, "Other answer"),
            W(m(Wr), {
              id: i,
              disabled: "",
              size: "small",
              class: "w-full"
            })
          ])
        ])) : j("", !0)
      ], 8, pu)
    ], 8, du));
  }
}), vu = { class: "w-form gap-4 min-w-0" }, yu = { class: "flex flex-col gap-1" }, wu = { class: "text-base font-semibold text-color break-words" }, xu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, ku = /* @__PURE__ */ pe({
  __name: "form-notice",
  props: {
    definition: {},
    severity: {},
    message: {}
  },
  setup(e) {
    return (t, n) => (b(), v("div", vu, [
      L("div", yu, [
        L("h2", wu, q(e.definition.title), 1),
        e.definition.description ? (b(), v("p", xu, q(e.definition.description), 1)) : j("", !0)
      ]),
      (b(!0), v(ne, null, Le(e.definition.fields, (r) => (b(), M(gu, {
        key: r.id,
        field: r
      }, null, 8, ["field"]))), 128)),
      W(Ae, { severity: e.severity }, {
        default: ie(() => [
          ae(q(e.message), 1)
        ]),
        _: 1
      }, 8, ["severity"])
    ]));
  }
});
function mt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function bt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function nr(e) {
  return typeof e == "string" ? e : bt(e) ? e.value : null;
}
function _u(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => nr(n) === t) : nr(e) === t;
}
function $u(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(mt);
    return t ? t.other : "";
  }
  return mt(e) ? e.other : "";
}
function Su(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(mt) : mt(e);
}
function Cu(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((o) => bt(o) && o.value === t);
  return r && bt(r) ? r.note : "";
}
const rr = 2e3, Gr = 1e3;
function de(e) {
  return e.trim();
}
function or(e, t) {
  return Array.from(de(e)).length > t;
}
function Tu(e) {
  return `Use at most ${e.toLocaleString("en-US")} characters.`;
}
function ir(e, t) {
  const n = de(t);
  return n ? { value: e, note: n } : e;
}
function Yr(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const i of e.options) {
    const s = n.find((l) => typeof l == "string" ? l === i.value : bt(l) && l.value === i.value);
    s && r.push({ label: i.label, note: bt(s) ? s.note : void 0 });
  }
  const o = n.find(mt);
  return o && r.push({ label: o.other, own: !0 }), r.length > 0 ? r : null;
}
function Ye(e) {
  return `opt-${e}`;
}
function on(e) {
  return `note-${e}`;
}
function Qr(e) {
  return `review-item-${e}`;
}
function Zr(e) {
  return e?.startsWith("opt-") ? Number(e.slice(4)) : -1;
}
const an = 9;
function Pu(e, t, n) {
  const r = e.fields.length, o = r > 1, i = /* @__PURE__ */ new Set([0]), s = U(0), l = U(!1), a = U(""), u = U(""), d = U(null), c = U(0), p = lr(
    Object.fromEntries(e.fields.map((_) => {
      const S = t?.[_.id], P = _.options.filter((Pe) => _u(S, Pe.value)).map((Pe) => Pe.value), D = {};
      for (const Pe of P) {
        const wt = Cu(S, Pe);
        wt && (D[Pe] = wt);
      }
      const X = Su(S), he = $u(S), vt = P.length > 0 || X && de(he) !== "", yt = { chosen: P, other: he, useOther: X, notes: D, noteOpen: null, done: vt };
      return [_.id, yt];
    }))
  );
  function f(_) {
    return p[_.id];
  }
  function w(_) {
    const S = f(_);
    return _.multiple ? S.chosen.length > 0 || de(S.other) !== "" : S.chosen.length > 0 || S.useOther && de(S.other) !== "";
  }
  function x(_) {
    return f(_).done && w(_);
  }
  const k = V(() => o && s.value === r), C = V(() => k.value ? null : e.fields[s.value] ?? null), $ = V(
    () => e.fields.map((_, S) => ({ field: _, index: S })).filter(({ field: _ }) => _.required && !x(_))
  );
  let T;
  function g(_) {
    clearTimeout(T), u.value = "", T = setTimeout(() => {
      u.value = _;
    }, 30);
  }
  function E() {
    clearTimeout(T), u.value = "";
  }
  function I(_) {
    d.value = _, c.value++;
  }
  function h(_) {
    const S = Math.min(_.options.length + (_.allow_other ? 1 : 0), an), P = S > 1 ? `1–${S}` : "1", D = Math.min(_.options.length, an), X = D > 1 ? `Shift+1–${D}` : "Shift+1", he = o ? " ← and → change questions." : "";
    return _.multiple ? `${P} ticks, ${X} adds a note, Enter sends.${he}` : `${P} answers, ${X} adds a note first.${he}`;
  }
  function A(_) {
    const S = f(_);
    if (_.multiple) {
      const P = _.options.filter((X) => S.chosen.includes(X.value)).map((X) => ir(X.value, S.notes[X.value] ?? "")), D = de(S.other);
      return D && P.push({ other: D }), P.length > 0 ? P : void 0;
    }
    if (S.useOther)
      return { other: de(S.other) };
    if (S.chosen[0])
      return ir(S.chosen[0], S.notes[S.chosen[0]] ?? "");
  }
  function N(_) {
    return x(_) ? Yr(_, A(_)) : null;
  }
  function B() {
    const _ = {};
    for (const S of e.fields) {
      if (!x(S))
        continue;
      const P = A(S);
      P !== void 0 && (_[S.id] = P);
    }
    return _;
  }
  function Y(_, S = "first") {
    const P = C.value;
    P && P.multiple && !f(P).done && w(P) && (f(P).done = !0);
    const D = o ? r : r - 1;
    if (s.value = Math.max(0, Math.min(_, D)), a.value = "", k.value || i.add(s.value), k.value) {
      const X = $.value[0];
      I(X ? Qr(X.index) : "send-all");
    } else
      I(S);
    g(k.value ? "Review your answers" : `Question ${s.value + 1} of ${r}`);
  }
  function J() {
    $.value.length > 0 || n(B());
  }
  function Q(_) {
    if (f(_).done = !0, a.value = "", !o) {
      n(B());
      return;
    }
    const S = e.fields.findIndex((P, D) => D > s.value && !i.has(D));
    Y(S === -1 ? r : S);
  }
  function ee(_, S) {
    const P = f(_);
    if (S >= _.options.length) {
      I("other");
      return;
    }
    const D = _.options[S].value;
    if (P.noteOpen === D && !_.multiple) {
      I(on(D));
      return;
    }
    if (_.multiple) {
      P.chosen = P.chosen.includes(D) ? P.chosen.filter((X) => X !== D) : [...P.chosen, D], w(_) || (P.done = !1), a.value = "", I(Ye(S)), g(P.chosen.includes(D) ? "Ticked" : "Unticked");
      return;
    }
    P.chosen = [D], P.useOther = !1, Q(_);
  }
  function R(_, S, P = !1) {
    const D = f(_);
    D.noteOpen === S && !P ? (D.noteOpen = null, I(Ye(_.options.findIndex((X) => X.value === S)))) : (D.noteOpen = S, I(on(S)));
  }
  function se(_, S, P) {
    f(_).notes[S] = P;
  }
  function Se(_, S) {
    const P = f(_);
    P.noteOpen = null;
    const D = Ye(_.options.findIndex((X) => X.value === S));
    if (_.multiple) {
      P.chosen.includes(S) || (P.chosen = [...P.chosen, S]), I(D), g("Note saved");
      return;
    }
    P.chosen = [S], P.useOther = !1, I(D), Q(_);
  }
  function Te(_) {
    const S = f(_), P = de(S.other);
    if (_.multiple) {
      if (!P && S.chosen.length === 0)
        return;
    } else {
      if (!P)
        return;
      S.useOther = !0, S.chosen = [];
    }
    Q(_);
  }
  return {
    n: r,
    multi: o,
    index: s,
    collapsed: l,
    error: a,
    liveMessage: u,
    focusTarget: d,
    focusSeq: c,
    answers: p,
    inReview: k,
    currentQuestion: C,
    missingRequired: $,
    ans: f,
    answerItemsFor: N,
    keysText: h,
    activate: ee,
    toggleNote: R,
    setNote: se,
    sendNote: Se,
    sendOther: Te,
    commit: Q,
    go: Y,
    submitAll: J,
    requestFocus: I,
    quiet: E,
    buildAnswers: B
  };
}
function jt(...e) {
  return e.filter(Boolean).join(" ") || void 0;
}
function O(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function Ie(e, t) {
  return t ? `.w-form__${e}--${t}` : `.w-form__${e}`;
}
function Ou(e) {
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
function Eu(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const Au = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, je = /* @__PURE__ */ pe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    return (t, n) => (b(!0), v(ne, null, Le(m(Ou)(e.text), (r, o) => (b(), v(ne, { key: o }, [
      r.code ? (b(), v("code", Au, q(r.text), 1)) : (b(), v(ne, { key: 1 }, [
        ae(q(r.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), Nu = { "aria-hidden": "true" }, Lu = { class: "sr-only" }, ju = ["id"], Iu = /* @__PURE__ */ pe({
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
  emits: ["prev", "next", "toggle-collapse"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = V(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), i = V(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), s = V(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (l, a) => (b(), v("div", oe(ge(m(O)("header", !e.multi && "single"))), [
      e.multi ? (b(), v("div", y({ key: 0 }, m(O)("nav"), {
        role: "group",
        "aria-label": "Questions"
      }), [
        W(m(Ne), y(m(O)("prev"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: a[0] || (a[0] = (u) => r("prev"))
        }), {
          icon: ie(() => [
            W(m(ke), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 16, ["disabled"]),
        L("span", oe(ge(m(O)("counter"))), [
          L("span", Nu, q(o.value), 1),
          L("span", Lu, q(i.value), 1)
        ], 16),
        W(m(Ne), y(m(O)("next"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": s.value,
          title: s.value,
          disabled: e.review,
          onClick: a[1] || (a[1] = (u) => r("next"))
        }), {
          icon: ie(() => [
            W(m(ke), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 16, ["aria-label", "title", "disabled"])
      ], 16)) : j("", !0),
      L("h3", y(m(O)("question"), { id: e.qid }), [
        e.review ? (b(), v(ne, { key: 0 }, [
          ae(" Check your answers, then send them. ")
        ], 64)) : (b(), M(je, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 16, ju),
      L("div", oe(ge(m(O)("actions"))), [
        W(m(Ne), y(m(O)("collapse"), {
          type: "button",
          text: "",
          size: "small",
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: a[2] || (a[2] = (u) => r("toggle-collapse"))
        }), {
          icon: ie(() => [
            W(m(ke), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 16, ["aria-expanded", "aria-label", "title"])
      ], 16)
    ], 16));
  }
}), Xr = /* @__PURE__ */ pe({
  __name: "question-card-heading",
  props: {
    definition: {},
    icon: {}
  },
  setup(e) {
    return (t, n) => (b(), v(ne, null, [
      L("p", oe(ge(m(O)("title"))), [
        W(m(ke), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        ae(" " + q(e.definition.title), 1)
      ], 16),
      e.definition.description ? (b(), v("p", oe(y({ key: 0 }, m(O)("form-description"))), [
        W(je, {
          text: e.definition.description
        }, null, 8, ["text"])
      ], 16)) : j("", !0)
    ], 64));
  }
});
var Ru = `
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
`, zu = {
  root: "p-inputgroup"
}, Vu = K.extend({
  name: "inputgroup",
  style: Ru,
  classes: zu
}), Bu = {
  name: "BaseInputGroup",
  extends: He,
  style: Vu,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Jr = {
  name: "InputGroup",
  extends: Bu,
  inheritAttrs: !1
};
function Du(e, t, n, r, o, i) {
  return b(), v("div", y({
    class: e.cx("root")
  }, e.ptmi("root")), [ce(e.$slots, "default")], 16);
}
Jr.render = Du;
var Fu = `
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
`, Mu = {
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
}, qu = K.extend({
  name: "textarea",
  style: Fu,
  classes: Mu
}), Uu = {
  name: "BaseTextarea",
  extends: Dt,
  props: {
    autoResize: Boolean
  },
  style: qu,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function ht(e) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ht(e);
}
function Hu(e, t, n) {
  return (t = Wu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wu(e) {
  var t = Ku(e, "string");
  return ht(t) == "symbol" ? t : t + "";
}
function Ku(e, t) {
  if (ht(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var eo = {
  name: "Textarea",
  extends: Uu,
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
        var t = this.$el.style.height, n = parseInt(t) || 0, r = this.$el.scrollHeight, o = !n || r > n, i = n && r < n;
        i ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : o && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return y(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return $e(Hu({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Gu = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Yu(e, t, n, r, o, i) {
  return b(), v("textarea", y({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Gu);
}
eo.render = Yu;
const to = /* @__PURE__ */ pe({
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
    const n = e, r = t;
    function o(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && r("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), r("escape"));
    }
    return (i, s) => (b(), M(m(Jr), oe(ge(m(O)("composer", e.kind))), {
      default: ie(() => [
        W(m(eo), y(m(O)(`${e.kind}-input`), {
          "model-value": e.modelValue,
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": s[0] || (s[0] = (l) => r("update:modelValue", String(l ?? ""))),
          onKeydown: o
        }), null, 16, ["model-value", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        W(m(Ne), y(m(O)(`${e.kind}-send`), {
          type: "button",
          text: "",
          rounded: "",
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: s[1] || (s[1] = (l) => r("send"))
        }), {
          icon: ie(() => [
            W(m(ke), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 16, ["disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 16));
  }
}), no = /* @__PURE__ */ pe({
  __name: "question-card-length-alert",
  props: {
    max: {}
  },
  setup(e) {
    return (t, n) => (b(), v("p", y(m(O)("error"), {
      class: m(dt),
      role: "alert"
    }), q(m(Tu)(e.max)), 17));
  }
}), Qu = ["role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], Zu = { key: 1 }, Xu = /* @__PURE__ */ pe({
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
    const n = e, r = t, o = `${Rt()}-note-err`, i = V(() => jt(n.noteTooLong && o, n.describedBy)), s = `${Ie("note-toggle")}, ${Ie("composer")}`;
    function l(c) {
      n.disabled || c.target.closest(s) || r("activate");
    }
    const a = V(() => `${n.note ? "Edit the note on" : "Add a note to"} ${ar(n.option.label)}`), u = V(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), d = V(() => n.multiple ? "Save the note" : "Answer with this note");
    return (c, p) => (b(), v("div", y(m(O)("option", e.selected && "selected", e.note && "has-note", e.editing && "editing"), { onClick: l }), [
      L("div", y(m(O)("option-main"), {
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": m(Ye)(e.index),
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }), [
        L("span", oe(ge(m(O)("option-label"))), [
          e.multiple ? (b(), M(m(mn), y({ key: 0 }, m(O)("option-mark"), {
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true"
          }), null, 16, ["model-value"])) : e.selected ? (b(), v("span", y({ key: 1 }, m(O)("option-mark"), { "aria-hidden": "true" }), [
            W(m(ke), { icon: "tabler:check" })
          ], 16)) : j("", !0),
          W(je, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 16),
        e.option.description ? (b(), v("span", oe(y({ key: 0 }, m(O)("option-description"))), [
          W(je, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 16)) : j("", !0),
        e.note && !e.editing ? (b(), v("span", oe(y({ key: 1 }, m(O)("option-note"))), [
          W(m(ke), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          L("span", null, q(e.note), 1)
        ], 16)) : j("", !0)
      ], 16, Qu),
      W(m(Ne), y(m(O)("note-toggle", e.note && "has-note", e.editing && "editing"), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": a.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: p[0] || (p[0] = To((f) => r("toggle-note"), ["stop"]))
      }), {
        icon: ie(() => [
          W(m(ke), { icon: "tabler:note" })
        ]),
        _: 1
      }, 16, ["disabled", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (b(), v("kbd", y({ key: 0 }, m(O)("option-key"), { "aria-hidden": "true" }), q(e.keyLabel), 17)) : (b(), v("span", Zu)),
      e.editing ? (b(), v(ne, { key: 2 }, [
        W(to, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: u.value,
          label: `Note for ${m(ar)(e.option.label)}`,
          "send-label": d.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": i.value,
          "data-focus": m(on)(e.option.value),
          "onUpdate:modelValue": p[1] || (p[1] = (f) => r("update:noteDraft", f)),
          onSend: p[2] || (p[2] = (f) => r("send-note")),
          onEscape: p[3] || (p[3] = (f) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (b(), M(no, {
          key: 0,
          id: o,
          max: m(Gr)
        }, null, 8, ["max"])) : j("", !0)
      ], 64)) : j("", !0)
    ], 16));
  }
}), ro = /* @__PURE__ */ pe({
  __name: "question-card-send-button",
  props: {
    name: {},
    label: {},
    blocked: { type: Boolean },
    nothingToSend: { type: Boolean },
    describedBy: {}
  },
  emits: ["send"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function o() {
      n.blocked || r("send");
    }
    return (i, s) => (b(), M(m(Ne), y({ type: "button" }, m(O)(e.name), {
      class: e.blocked && "p-disabled",
      "data-focus": e.name,
      "aria-describedby": e.describedBy,
      "aria-disabled": e.blocked ? "true" : void 0,
      disabled: e.nothingToSend,
      onClick: o
    }), {
      default: ie(() => [
        ae(q(e.label) + " ", 1),
        W(m(ke), {
          icon: "tabler:send-2",
          "aria-hidden": "true"
        })
      ]),
      _: 1
    }, 16, ["class", "data-focus", "aria-describedby", "aria-disabled", "disabled"]));
  }
}), Ju = ["role", "aria-labelledby", "aria-describedby", "aria-invalid"], ed = { key: 1 }, td = /* @__PURE__ */ pe({
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
    const t = e, n = V(() => {
      const $ = [];
      return t.question.multiple && $.push("Choose any that apply."), t.question.required || $.push("Optional."), $.join(" ");
    }), r = V(() => t.controller.ans(t.question)), o = V(() => t.controller.error.value || t.serverError || "");
    function i($) {
      return $ < an ? String($ + 1) : null;
    }
    const s = V(() => i(t.question.options.length)), l = V(() => t.question.multiple ? de(r.value.other) !== "" : r.value.useOther && r.value.done), a = V(() => de(r.value.other) !== "" || t.question.multiple && r.value.chosen.length > 0), u = V(() => or(r.value.other, rr)), d = `${t.qid}-other-err`, c = `${t.qid}-err`, p = V(() => jt(o.value && c, t.cardErrorIds)), f = V(() => jt(u.value && d, p.value)), w = V(() => u.value || !!o.value);
    function x($) {
      $.target.closest(Ie("composer")) || t.controller.requestFocus("other");
    }
    const k = U(0);
    re(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const $ = r.value, T = $.useOther ? -1 : t.question.options.findIndex((g) => g.value === $.chosen[0]);
      k.value = T >= 0 ? T : 0;
    }, { immediate: !0 });
    function C($) {
      if (t.question.multiple)
        return;
      const T = Zr($.target?.dataset?.focus);
      T >= 0 && (k.value = T);
    }
    return ($, T) => (b(), v(ne, null, [
      e.stale ? (b(), v("p", oe(y({ key: 0 }, m(O)("notice"))), " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 16)) : j("", !0),
      e.question.description ? (b(), v("p", oe(y({ key: 1 }, m(O)("description"))), [
        W(je, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 16)) : j("", !0),
      n.value ? (b(), v("p", oe(y({ key: 2 }, m(O)("hint"))), q(n.value), 17)) : j("", !0),
      L("div", y(m(O)("options"), {
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": o.value ? c : void 0,
        "aria-invalid": !e.question.multiple && o.value ? "true" : void 0,
        onFocusin: C
      }), [
        (b(!0), v(ne, null, Le(e.question.options, (g, E) => (b(), M(Xu, {
          key: g.value,
          option: g,
          index: E,
          multiple: e.question.multiple,
          selected: e.question.multiple ? r.value.chosen.includes(g.value) : !r.value.useOther && r.value.chosen[0] === g.value,
          note: m(de)(r.value.notes[g.value] || ""),
          editing: r.value.noteOpen === g.value,
          "note-draft": r.value.notes[g.value] || "",
          "key-label": i(E),
          "note-too-long": m(or)(r.value.notes[g.value] || "", m(Gr)),
          disabled: !!e.disabled,
          "described-by": p.value,
          invalid: !!o.value,
          "roving-tabbable": E === k.value,
          onActivate: (I) => e.controller.activate(e.question, E),
          onToggleNote: (I) => e.controller.toggleNote(e.question, g.value),
          "onUpdate:noteDraft": (I) => e.controller.setNote(e.question, g.value, I),
          onSendNote: (I) => e.controller.sendNote(e.question, g.value),
          onEscapeNote: (I) => e.controller.toggleNote(e.question, g.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (b(), v("div", y({ key: 0 }, m(O)("option", "other", l.value && "selected"), { onClick: x }), [
          W(to, {
            kind: "other",
            "model-value": r.value.other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: a.value && !e.disabled && !u.value,
            invalid: w.value,
            "described-by": f.value,
            "data-focus": "other",
            "onUpdate:modelValue": T[0] || (T[0] = (g) => {
              r.value.other = g;
            }),
            onSend: T[1] || (T[1] = (g) => e.controller.sendOther(e.question)),
            onEscape: T[2] || (T[2] = (g) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          s.value ? (b(), v("kbd", y({ key: 0 }, m(O)("option-key"), { "aria-hidden": "true" }), q(s.value), 17)) : (b(), v("span", ed)),
          u.value ? (b(), M(no, {
            key: 2,
            id: d,
            max: m(rr)
          }, null, 8, ["max"])) : j("", !0)
        ], 16)) : j("", !0)
      ], 16, Ju),
      e.question.multiple && !e.question.allow_other ? (b(), v("div", oe(y({ key: 3 }, m(O)("footer"))), [
        W(ro, {
          name: "send",
          label: "Send",
          blocked: e.disabled,
          "nothing-to-send": r.value.chosen.length === 0,
          "described-by": p.value,
          onSend: T[3] || (T[3] = (g) => e.controller.commit(e.question))
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16)) : j("", !0),
      o.value ? (b(), M(Ae, y({
        key: 4,
        id: c
      }, m(O)("error"), {
        severity: "error",
        variant: "simple",
        size: "small",
        role: "alert"
      }), {
        default: ie(() => [
          ae(q(o.value), 1)
        ]),
        _: 1
      }, 16)) : j("", !0),
      L("p", oe(ge(m(O)("keys"))), q(e.controller.keysText(e.question)), 17)
    ], 64));
  }
}), nd = { key: 0 }, oo = /* @__PURE__ */ pe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    return (t, n) => (b(!0), v(ne, null, Le(e.items, (r, o) => (b(), v("span", y({ key: o }, { ref_for: !0 }, m(O)("answer-item")), [
      r.own ? (b(), v(ne, { key: 0 }, [
        L("span", y({ ref_for: !0 }, m(O)("answer-own")), "Own answer: ", 16),
        (b(!0), v(ne, null, Le(m(Eu)(r.label), (i, s) => (b(), v(ne, { key: s }, [
          s > 0 ? (b(), v("br", nd)) : j("", !0),
          ae(q(i), 1)
        ], 64))), 128))
      ], 64)) : (b(), M(je, {
        key: 1,
        text: r.label
      }, null, 8, ["text"])),
      m(de)(r.note || "") ? (b(), v("span", y({
        key: 2,
        ref_for: !0
      }, m(O)("answer-note")), [
        W(m(ke), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        L("span", null, q(m(de)(r.note)), 1)
      ], 16)) : j("", !0)
    ], 16))), 128));
  }
}), rd = ["data-focus", "onClick"], od = { class: "sr-only" }, id = /* @__PURE__ */ pe({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = V(() => t.definition.fields.map((o, i) => {
      const s = t.controller.answerItemsFor(o);
      return { field: o, number: i + 1, key: Qr(i), items: s, missing: !s && o.required };
    })), r = V(() => {
      const o = t.controller.missingRequired.value;
      return o.length === 0 ? "" : o.length === 1 ? `Question ${o[0].index + 1} still needs an answer.` : `Questions ${o.map((i) => i.index + 1).join(" and ")} still need answers.`;
    });
    return (o, i) => (b(), v(ne, null, [
      L("ol", oe(ge(m(O)("review"))), [
        (b(!0), v(ne, null, Le(n.value, (s, l) => (b(), v("li", y({
          key: s.field.id
        }, { ref_for: !0 }, m(O)("review-item", s.missing && "missing")), [
          L("button", y({ ref_for: !0 }, m(O)("review-edit"), {
            type: "button",
            "data-focus": s.key,
            onClick: (a) => e.controller.go(l, "first")
          }), [
            L("span", y({ ref_for: !0 }, m(O)("review-number"), { "aria-hidden": "true" }), q(s.number), 17),
            L("span", od, "Question " + q(s.number) + ": ", 1),
            L("span", y({ ref_for: !0 }, m(O)("review-question")), [
              W(je, {
                text: s.field.label
              }, null, 8, ["text"])
            ], 16),
            L("span", y({ ref_for: !0 }, m(O)("review-answer"), {
              class: s.missing && m(dt)
            }), [
              s.items ? (b(), M(oo, {
                key: 0,
                items: s.items
              }, null, 8, ["items"])) : s.field.required ? (b(), v(ne, { key: 1 }, [
                ae(" Not answered yet ")
              ], 64)) : (b(), v("span", y({
                key: 2,
                ref_for: !0
              }, m(O)("answer-empty")), "Skipped", 16))
            ], 16),
            i[1] || (i[1] = L("span", { class: "sr-only" }, ". Change the answer.", -1))
          ], 16, rd)
        ], 16))), 128))
      ], 16),
      L("div", oe(ge(m(O)("footer"))), [
        r.value ? (b(), v("p", y({ key: 0 }, m(O)("footer-text"), { class: m(dt) }), q(r.value), 17)) : j("", !0),
        W(ro, {
          name: "send-all",
          label: "Send answers",
          blocked: e.disabled,
          "nothing-to-send": e.controller.missingRequired.value.length > 0,
          "described-by": e.cardErrorIds,
          onSend: i[0] || (i[0] = (s) => e.controller.submitAll())
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16),
      L("p", oe(ge(m(O)("keys"))), " Enter sends. Pick a row to change it. ← goes back to the last question. ", 16)
    ], 64));
  }
}), ad = ["aria-busy"], sd = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, ld = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, ud = {
  "aria-live": "polite",
  class: "sr-only"
}, dd = "You are offline. Your choices are kept.", cd = "Sending your answer…", pd = /* @__PURE__ */ pe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "step-change", "collapsed-change"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, i = Pu(r.state.definition, r.state.data, (h) => {
      r.offline || r.submitting || o("submit", h);
    }), s = V(() => !!r.offline || r.submitting), l = `${Rt()}-q`, a = U(null);
    re(i.inReview, (h) => o("step-change", h ? "review" : "active"), { immediate: !0 }), re(i.collapsed, (h) => o("collapsed-change", h), { immediate: !0 });
    const u = U({}), d = U([]);
    re(() => r.submitting, (h) => {
      h && (i.quiet(), u.value = {}, d.value = []);
    });
    function c(h) {
      return u.value[h] ?? "";
    }
    const p = V(() => new Set(r.state.definition.fields.map((h) => h.id))), f = V(() => {
      const h = Object.entries(u.value).filter(([A]) => !p.value.has(A)).map(([, A]) => A);
      return [...d.value, ...h].join(" ");
    }), w = `${l}-general-err`, x = `${l}-banner`, k = V(() => jt(f.value && w, r.banner && x));
    re(
      () => Object.fromEntries(r.state.definition.fields.map((h) => [h.id, JSON.stringify(i.ans(h))])),
      (h, A) => {
        if (!A)
          return;
        const N = new Set(
          r.state.definition.fields.map((B) => B.id).filter((B) => h[B] !== A[B] && u.value[B])
        );
        N.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([B]) => !N.has(B))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(h, A) {
        const N = {};
        for (const [Y, J] of Object.entries(h ?? {}))
          N[Y] = J.map((Q) => Q.message).join(" ");
        u.value = N, d.value = (A ?? []).map((Y) => Y.message);
        const B = r.state.definition.fields.findIndex((Y) => N[Y.id]);
        B >= 0 ? i.go(B, "first") : qe(g);
      },
      retry() {
        o("submit", i.buildAnswers());
      },
      /**
       * True when any question has a chosen answer, a note or Other text that was
       * never sent. `wippy-form.vue` reads it when another client answers first, to
       * tell a card that holds a draft from one nothing was entered into.
       */
      hasUnsentInput() {
        return Object.values(i.answers).some(
          (h) => h.chosen.length > 0 || de(h.other) !== "" || Object.values(h.notes).some((A) => de(A) !== "")
        );
      }
    });
    const C = `${Ie("option-main")}, ${Ie("other-input")}`;
    function $(h) {
      const A = a.value;
      if (!A)
        return;
      let N = null;
      if (h === "card" ? N = A : h === "first" ? N = A.querySelector(`${Ie("option", "selected")} ${Ie("option-main")}`) ?? A.querySelector(C) : N = Array.from(A.querySelectorAll("[data-focus]")).find((B) => B.dataset.focus === h) ?? null, !!N && (N.focus(), N.tagName === "TEXTAREA")) {
        const B = N;
        B.setSelectionRange(B.value.length, B.value.length);
      }
    }
    re(i.focusSeq, () => {
      qe(() => {
        const h = i.focusTarget.value;
        h && $(h);
      });
    });
    function T() {
      const h = a.value?.ownerDocument;
      if (!h)
        return !1;
      const A = h.activeElement;
      return !A || A === h.body || A === h.documentElement;
    }
    function g() {
      T() && i.requestFocus(i.inReview.value ? "send-all" : "first");
    }
    re(() => r.banner, (h) => {
      h && qe(g);
    });
    function E() {
      i.collapsed.value = !i.collapsed.value;
    }
    function I(h) {
      const A = h.composedPath()[0];
      if (A?.tagName === "TEXTAREA" || h.isComposing || h.ctrlKey || h.metaKey || h.altKey || i.collapsed.value || s.value)
        return;
      if (i.inReview.value) {
        h.key === "ArrowLeft" && (h.preventDefault(), i.go(i.n - 1, "first"));
        return;
      }
      const N = i.currentQuestion.value;
      if (!N)
        return;
      const B = i.ans(N), Y = h.shiftKey ? /^Digit([1-9])$/.exec(h.code) : /^([1-9])$/.exec(h.key);
      if (Y) {
        const Q = Number(Y[1]) - 1;
        if (Q >= N.options.length + (N.allow_other ? 1 : 0))
          return;
        h.preventDefault(), h.shiftKey && Q < N.options.length ? i.toggleNote(N, N.options[Q].value, !0) : i.activate(N, Q);
        return;
      }
      const J = Zr(A?.dataset?.focus);
      if (h.key === "ArrowDown" || h.key === "ArrowUp") {
        const Q = Array.from(a.value?.querySelectorAll(C) ?? []);
        if (Q.length === 0)
          return;
        h.preventDefault();
        const ee = Q.indexOf(A), R = h.key === "ArrowDown" ? (ee + 1) % Q.length : ee <= 0 ? Q.length - 1 : ee - 1;
        Q[R]?.focus();
        return;
      }
      if (i.multi && (h.key === "ArrowRight" || h.key === "ArrowLeft")) {
        h.preventDefault(), i.go(i.index.value + (h.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((h.key === "n" || h.key === "N") && J >= 0) {
        h.preventDefault(), i.toggleNote(N, N.options[J].value, !0);
        return;
      }
      if (J >= 0 && (h.key === " " || h.key === "Enter" && !N.multiple)) {
        h.preventDefault(), i.activate(N, J);
        return;
      }
      h.key === "Enter" && N.multiple && !A?.matches?.("button") && (h.preventDefault(), B.chosen.length > 0 || de(B.other) ? i.commit(N) : (i.error.value = "Tick at least one answer, or type your own.", i.requestFocus(J >= 0 ? Ye(J) : "first")));
    }
    return (h, A) => (b(), v("section", y({
      ref_key: "cardRoot",
      ref: a,
      class: "w-form"
    }, m(O)("card"), {
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: I
    }), [
      e.offline ? (b(), v("p", sd, q(dd))) : j("", !0),
      e.submitting ? (b(), v("p", ld, q(cd))) : j("", !0),
      f.value ? (b(), M(Ae, {
        key: 2,
        id: w,
        severity: "error"
      }, {
        default: ie(() => [
          ae(q(f.value), 1)
        ]),
        _: 1
      })) : j("", !0),
      W(Xr, {
        definition: e.state.definition,
        icon: "tabler:messages"
      }, null, 8, ["definition"]),
      W(Iu, {
        multi: m(i).multi,
        index: m(i).index.value,
        n: m(i).n,
        review: m(i).inReview.value,
        "question-text": m(i).currentQuestion.value?.label ?? "",
        collapsed: m(i).collapsed.value,
        qid: l,
        onPrev: A[0] || (A[0] = (N) => m(i).go(m(i).index.value - 1, "first")),
        onNext: A[1] || (A[1] = (N) => m(i).go(m(i).index.value + 1, "first")),
        onToggleCollapse: E
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (b(), M(Ae, {
        key: 3,
        id: x,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        onRetry: A[2] || (A[2] = (N) => o("retry"))
      }, {
        default: ie(() => [
          ae(q(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : j("", !0),
      m(i).collapsed.value ? j("", !0) : (b(), v(ne, { key: 4 }, [
        m(i).inReview.value ? (b(), M(id, {
          key: 0,
          definition: e.state.definition,
          controller: m(i),
          "card-error-ids": k.value,
          disabled: s.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : m(i).currentQuestion.value ? (b(), M(td, {
          key: 1,
          question: m(i).currentQuestion.value,
          controller: m(i),
          qid: l,
          stale: !!e.state.stale,
          "server-error": c(m(i).currentQuestion.value.id),
          "card-error-ids": k.value,
          disabled: s.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : j("", !0)
      ], 64)),
      L("p", ud, q(m(i).liveMessage.value), 1)
    ], 16, ad));
  }
}), fd = ["aria-label"], md = { key: 0 }, bd = { key: 1 }, hd = { key: 2 }, gd = { key: 3 }, vd = { key: 4 }, yd = /* @__PURE__ */ pe({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = V(() => n.state.definition.fields.map((s) => ({
      field: s,
      items: Yr(s, n.state.data?.[s.id])
    }))), o = V(() => {
      const s = n.state.submitted_at, l = s ? new Date(s) : null;
      return l && !Number.isNaN(l.getTime()) ? l.toLocaleString() : null;
    }), i = U(null);
    return t({
      /** Moves focus to the status line after a send, so focus is not lost when the form swaps to this view. */
      focusStatus() {
        i.value?.focus();
      }
    }), (s, l) => (b(), v("section", y({ class: "w-form" }, m(O)("card", "answered"), {
      "aria-label": `${e.state.definition.title}, answered`
    }), [
      W(Xr, {
        definition: e.state.definition,
        icon: "tabler:circle-check"
      }, null, 8, ["definition"]),
      L("dl", oe(ge(m(O)("summary"))), [
        (b(!0), v(ne, null, Le(r.value, (a) => (b(), v("div", y({
          key: a.field.id
        }, { ref_for: !0 }, m(O)("summary-item")), [
          L("dt", y({ ref_for: !0 }, m(O)("summary-question")), [
            W(je, {
              text: a.field.label
            }, null, 8, ["text"])
          ], 16),
          L("dd", y({ ref_for: !0 }, m(O)("summary-answer")), [
            a.items ? (b(), M(oo, {
              key: 0,
              items: a.items
            }, null, 8, ["items"])) : (b(), v("span", y({
              key: 1,
              ref_for: !0
            }, m(O)("answer-empty")), "Skipped", 16))
          ], 16)
        ], 16))), 128))
      ], 16),
      L("div", y({
        ref_key: "statusEl",
        ref: i,
        tabindex: "-1"
      }, m(O)("status")), [
        e.state.late ? (b(), v("p", md, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : j("", !0),
        e.state.delivery === "pending" ? (b(), v("p", bd, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (b(), v("p", hd, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (b(), v("p", gd, " The assistant stopped before answering. Send a message to continue. ")) : j("", !0),
        o.value ? (b(), v("p", vd, " Answered " + q(o.value), 1)) : j("", !0)
      ], 16)
    ], 16, fd));
  }
}), wd = { class: "max-w-full min-w-0" }, xd = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, kd = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, _d = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, $d = "Could not refresh this form. Showing what you last saw.", Sd = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", Cd = "This form was answered. Your answer is in the chat.", sr = 1, Td = /* @__PURE__ */ pe({
  __name: "wippy-form",
  setup(e) {
    const t = `${Ir} If you already answered it, your answer is in the chat.`, n = gs(), r = vs(), o = ms(), i = V(() => n.value.definition), s = V(() => n.value.state), l = V(() => s.value === "idle"), { status: a, state: u, errorMessage: d, reloadError: c, reload: p, refresh: f } = is(o, s);
    rs(u, f);
    const { submitting: w, submit: x } = fs(o), { isOnline: k } = hs(() => p()), C = U(null), $ = U(!1);
    re(o, () => {
      $.value = !1;
    });
    const T = U(null), g = U(null);
    let E = !1;
    re(() => u.value?.status, (ee, R) => {
      if (!(ee !== "idle" || R !== "active")) {
        if (E) {
          E = !1;
          return;
        }
        T.value?.hasUnsentInput() && ($.value = !0);
      }
    });
    const I = V(() => {
      const ee = n.value.formVersion;
      if (ee !== void 0 && ee !== sr)
        return !0;
      const R = u.value?.form_version;
      return R !== void 0 && R !== sr;
    }), h = V(() => a.value === "unsupported" ? l.value ? { severity: "secondary", message: Cd } : { severity: "warn", message: t } : o.value ? null : { severity: "secondary", message: Rr }), A = U("active"), N = U(!1), B = V(() => I.value || a.value === "unsupported" ? "unsupported" : u.value === null ? "loading" : u.value.status === "idle" ? "answered" : A.value), Y = V(() => !I.value && u.value?.status === "active" && N.value);
    bs(B, Y);
    async function J(ee) {
      if (!u.value)
        return;
      C.value = null;
      const R = await x(u.value.form_version, u.value.content_version, ee);
      if (!R.ignored) {
        if (R.ok && R.accepted) {
          const se = R.accepted;
          E = !0, u.value = {
            ...u.value,
            status: "idle",
            stale: !1,
            late: se.late,
            content_version: se.content_version,
            data: ee,
            answer_message_id: se.answer_message_id,
            delivery: se.delivery
          }, qe(() => g.value?.focusStatus()), p();
          return;
        }
        if (R.fieldErrors || R.formErrors) {
          T.value?.setServerErrors(R.fieldErrors, R.formErrors);
          return;
        }
        if (R.code === "already_submitted") {
          $.value = !0, await f(), qe(() => g.value?.focusStatus());
          return;
        }
        R.shouldReload && p(), C.value = { message: R.message ?? Pt, retryable: R.retryable };
      }
    }
    function Q() {
      T.value?.retry();
    }
    return (ee, R) => (b(), v("div", wd, [
      m(r).length > 0 ? (b(), M(Ae, {
        key: 0,
        severity: "error"
      }, {
        default: ie(() => [...R[2] || (R[2] = [
          ae(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : i.value?.fields?.length ? I.value ? (b(), M(Ae, {
        key: 2,
        severity: "warn"
      }, {
        default: ie(() => [...R[4] || (R[4] = [
          ae(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : h.value ? (b(), M(ku, {
        key: 3,
        definition: i.value,
        severity: h.value.severity,
        message: h.value.message
      }, null, 8, ["definition", "severity", "message"])) : m(u) ? (b(), v(ne, { key: 4 }, [
        m(c) ? (b(), v("p", xd, q($d))) : j("", !0),
        m(u).status === "active" ? (b(), M(pd, {
          key: m(u).artifact_id,
          ref_key: "cardRef",
          ref: T,
          state: m(u),
          submitting: m(w),
          banner: C.value,
          offline: !m(k),
          onSubmit: J,
          onRetry: Q,
          onStepChange: R[0] || (R[0] = (se) => {
            A.value = se;
          }),
          onCollapsedChange: R[1] || (R[1] = (se) => {
            N.value = se;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : (b(), v(ne, { key: 2 }, [
          $.value ? (b(), v("p", kd, q(Sd))) : j("", !0),
          (b(), M(yd, {
            key: m(u).artifact_id,
            ref_key: "summaryRef",
            ref: g,
            state: m(u)
          }, null, 8, ["state"]))
        ], 64))
      ], 64)) : m(a) === "loading" || m(a) === "idle" ? (b(), v("wippy-loading", _d)) : m(a) === "error" ? (b(), M(Ae, {
        key: 6,
        severity: "error",
        retry: "",
        onRetry: m(p)
      }, {
        default: ie(() => [
          ae(q(m(d) || m(zr)), 1)
        ]),
        _: 1
      }, 8, ["onRetry"])) : j("", !0) : (b(), M(Ae, {
        key: 1,
        severity: "error"
      }, {
        default: ie(() => [...R[3] || (R[3] = [
          ae(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Pd = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn-700{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-700) calc(100% * var(--tw-text-opacity, 1)),transparent)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, 14px);--_q-size: var(--wippy-form-question-size, 15px);--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, var(--p-content-background));--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_muted-row: var(--wippy-form-text-muted-on-row, var(--p-text-hover-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 40%, var(--p-content-border-color)));--_row-hover: var(--wippy-form-row-hover, color-mix(in srgb, var(--p-content-border-color) 90%, var(--p-text-color)));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-content-border-color)));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, 10px);--_row-py: var(--wippy-form-row-padding-y, 6px);--_row-px: var(--wippy-form-row-padding-x, 10px);--_gap: var(--wippy-form-gap, 4px);--_key: var(--wippy-form-key-size, 20px);display:block;container-type:inline-size}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted-row)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted-row);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted-row);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted-row)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted-row);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:var(--_key);height:var(--_key);padding:0 4px;font-family:var(--_font);font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;color:var(--_muted-row);border:1px solid var(--_key-border);border-radius:5px}@supports (text-box: trim-both cap alphabetic){.w-form__option-key{text-box:trim-both cap alphabetic}}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted-row);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted-row);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted-row);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted-row)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class Od extends Ja {
  static get wippyConfig() {
    return {
      propsSchema: ts.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Pd
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Td,
      plugins: [Ca],
      providers(t, n) {
        t.provide(fn, n);
      }
    };
  }
}
jo(import.meta.url, Od);
//# sourceMappingURL=index.js.map
