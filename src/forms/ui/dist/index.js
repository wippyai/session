import { ref as M, readonly as mo, getCurrentInstance as vn, onMounted as ln, nextTick as ze, watch as oe, reactive as un, renderSlot as pe, openBlock as p, createBlock as H, Teleport as lr, createCommentVNode as z, useId as Nt, mergeProps as K, h as ho, createApp as bo, inject as bt, createElementBlock as b, createElementVNode as j, createTextVNode as de, toDisplayString as D, resolveComponent as Xe, resolveDirective as ur, withDirectives as dr, resolveDynamicComponent as cr, withCtx as ae, normalizeClass as E, Transition as vo, onUnmounted as It, computed as S, watchEffect as go, defineComponent as fe, Fragment as te, renderList as he, createVNode as G, unref as y, withModifiers as pr } from "vue";
import { addCollection as yo, Icon as we } from "@iconify/vue";
import * as dn from "@wippy-fe/proxy";
import { config as gn, addIcons as wo, on as qe, applyThemeMode as wt, host as xo, hostCss as ko, loadCss as _o, define as $o } from "@wippy-fe/proxy";
import { getActivePinia as So, createPinia as Po, setActivePinia as Co } from "pinia";
var To = Object.defineProperty, yn = Object.getOwnPropertySymbols, Oo = Object.prototype.hasOwnProperty, Ao = Object.prototype.propertyIsEnumerable, wn = (e, t, n) => t in e ? To(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Eo = (e, t) => {
  for (var n in t || (t = {})) Oo.call(t, n) && wn(e, n, t[n]);
  if (yn) for (var n of yn(t)) Ao.call(t, n) && wn(e, n, t[n]);
  return e;
};
function De(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Wt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, l, s;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (a = l; a-- !== 0; ) if (!Wt(e[a], t[a], n)) return !1;
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
  if (l = f.length, l !== Object.keys(t).length) return !1;
  for (a = l; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, f[a])) return !1;
  for (a = l; a-- !== 0; ) if (s = f[a], !Wt(e[s], t[s], n)) return !1;
  return !0;
}
function jo(e, t) {
  return Wt(e, t);
}
function cn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function ne(e) {
  return !De(e);
}
function xn(e, t) {
  return null;
}
function pn(e, t, n) {
  return n ? xn() === xn() : jo(e, t);
}
function Lo(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (pn(e, n)) return !0;
  }
  return !1;
}
function Oe(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function fr(e = {}, t = {}) {
  let n = Eo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    Oe(t[o]) && o in e && Oe(e[o]) ? n[o] = fr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function No(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : fr(t, n), {});
}
function ve(e, ...t) {
  return cn(e) ? e(...t) : e;
}
function be(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Te(e) {
  return be(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function fn(e, t = "", n = {}) {
  let r = Te(t).split("."), o = r.shift();
  if (o) {
    if (Oe(e)) {
      let a = Object.keys(e).find((l) => Te(l) === o) || "";
      return fn(ve(e[a], n), r.join("."), n);
    }
    return;
  }
  return ve(e, n);
}
function mr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Io(e) {
  return ne(e) && !isNaN(e);
}
function Re(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function zo(...e) {
  return No(...e);
}
function Ze(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ro(e) {
  return be(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function hr(e) {
  return be(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
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
function Ae(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Ae(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        t = a.length ? t.concat(a.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Vo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Bo(e, t) {
  if (e && t) {
    let n = (r) => {
      Vo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Dt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function kn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Fo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Do(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Mo(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Do(e));
}
function vt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Pt(e, t = {}) {
  if (vt(e)) {
    let n = (r, o) => {
      var a, l;
      let s = (a = e?.$attrs) != null && a[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
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
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? Pt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function qo(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Pt(r, t), r.append(...n), r;
  }
}
function Uo(e, t) {
  return vt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Wo(e, t) {
  if (vt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function _n(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Ho(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || kn(document.documentElement) || kn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ko(e, t) {
  return e ? e.offsetHeight : 0;
}
function $n(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function vr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Go(e, t = "", n) {
  vt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var xt = {};
function Yo(e = "pui_id_") {
  return Object.hasOwn(xt, e) || (xt[e] = 0), xt[e]++, `${e}${xt[e]}`;
}
var Qo = Object.defineProperty, Zo = Object.defineProperties, Xo = Object.getOwnPropertyDescriptors, Ct = Object.getOwnPropertySymbols, gr = Object.prototype.hasOwnProperty, yr = Object.prototype.propertyIsEnumerable, Sn = (e, t, n) => t in e ? Qo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, _e = (e, t) => {
  for (var n in t || (t = {})) gr.call(t, n) && Sn(e, n, t[n]);
  if (Ct) for (var n of Ct(t)) yr.call(t, n) && Sn(e, n, t[n]);
  return e;
}, Mt = (e, t) => Zo(e, Xo(t)), Ee = (e, t) => {
  var n = {};
  for (var r in e) gr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Ct) for (var r of Ct(e)) t.indexOf(r) < 0 && yr.call(e, r) && (n[r] = e[r]);
  return n;
}, Jo = br(), ue = Jo, Je = /{([^}]*)}/g, wr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, xr = /var\([^)]+\)/g;
function Pn(e) {
  return be(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ea(e) {
  return Oe(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ta(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ht(e = "", t = "") {
  return ta(`${be(e, !1) && be(t, !1) ? `${e}-` : e}${t}`);
}
function kr(e = "", t = "") {
  return `--${Ht(e, t)}`;
}
function na(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function _r(e, t = "", n = "", r = [], o) {
  if (be(e)) {
    let a = e.trim();
    if (na(a)) return;
    if (Re(a, Je)) {
      let l = a.replaceAll(Je, (s) => {
        let i = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Re(u, d)));
        return `var(${kr(n, hr(i.join("-")))}${ne(o) ? `, ${o}` : ""})`;
      });
      return Re(l.replace(xr, "0"), wr) ? `calc(${l})` : l;
    }
    return a;
  } else if (Io(e)) return e;
}
function ra(e, t, n) {
  be(t, !1) && e.push(`${t}:${n};`);
}
function Ue(e, t) {
  return e ? `${e}{${t}}` : "";
}
function $r(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, s) {
    let i = [], u = 0, d = "", c = null, f = 0;
    for (; u <= l.length; ) {
      let m = l[u];
      if ((m === '"' || m === "'" || m === "`") && l[u - 1] !== "\\" && (c = c === m ? null : m), !c && (m === "(" && f++, m === ")" && f--, (m === "," || u === l.length) && f === 0)) {
        let x = d.trim();
        x.startsWith("dt(") ? i.push($r(x, s)) : i.push(r(x)), d = "", u++;
        continue;
      }
      m !== void 0 && (d += m), u++;
    }
    return i;
  }
  function r(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let i = Number(l);
    return isNaN(i) ? l : i;
  }
  let o = [], a = [];
  for (let l = 0; l < e.length; l++) if (e[l] === "d" && e.slice(l, l + 3) === "dt(") a.push(l), l += 2;
  else if (e[l] === ")" && a.length > 0) {
    let s = a.pop();
    a.length === 0 && o.push([s, l]);
  }
  if (!o.length) return e;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, i] = o[l], u = e.slice(s + 3, i), d = n(u, t), c = t(...d);
    e = e.slice(0, s) + c + e.slice(i + 1);
  }
  return e;
}
var Ve = (...e) => oa(ee.getTheme(), ...e), oa = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = ee.defaults || {}, { prefix: l, transform: s } = e?.options || a || {}, i = Re(t, Je) ? t : `{${t}}`;
    return r === "value" || De(r) && s === "strict" ? ee.getTokenValue(t) : _r(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function kt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var l;
      return r + o + ((l = ve(t[a], { dt: Ve })) != null ? l : "");
    }, "");
    return $r(n, Ve);
  }
  return ve(e, { dt: Ve });
}
function aa(e, t = {}) {
  let n = ee.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, l = [], s = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let f in d) {
      let m = d[f], x = ea(m), P = Re(f, a) ? Ht(c) : Ht(c, hr(f));
      if (Oe(x)) i.push({ node: x, path: P });
      else {
        let g = kr(P), k = _r(x, P, r, [a]);
        ra(s, g, k);
        let L = P;
        r && L.startsWith(r + "-") && (L = L.slice(r.length + 1)), l.push(L.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: Ue(o, u) };
}
var ke = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return aa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l, s, i, u, d, c;
  let { preset: f, options: m } = t, x, P, g, k, L, _, h;
  if (ne(f) && m.transform !== "strict") {
    let { primitive: C, semantic: A, extend: q } = f, R = A || {}, { colorScheme: T } = R, w = Ee(R, ["colorScheme"]), v = q || {}, { colorScheme: $ } = v, I = Ee(v, ["colorScheme"]), U = T || {}, { dark: F } = U, J = Ee(U, ["dark"]), se = $ || {}, { dark: ge } = se, Se = Ee(se, ["dark"]), O = ne(C) ? this._toVariables({ primitive: C }, m) : {}, N = ne(w) ? this._toVariables({ semantic: w }, m) : {}, B = ne(J) ? this._toVariables({ light: J }, m) : {}, Q = ne(F) ? this._toVariables({ dark: F }, m) : {}, re = ne(I) ? this._toVariables({ semantic: I }, m) : {}, Pe = ne(Se) ? this._toVariables({ light: Se }, m) : {}, gt = ne(ge) ? this._toVariables({ dark: ge }, m) : {}, [Ft, Le] = [(a = O.declarations) != null ? a : "", O.tokens], [yt, Xr] = [(l = N.declarations) != null ? l : "", N.tokens || []], [Jr, eo] = [(s = B.declarations) != null ? s : "", B.tokens || []], [to, no] = [(i = Q.declarations) != null ? i : "", Q.tokens || []], [ro, oo] = [(u = re.declarations) != null ? u : "", re.tokens || []], [ao, io] = [(d = Pe.declarations) != null ? d : "", Pe.tokens || []], [so, lo] = [(c = gt.declarations) != null ? c : "", gt.tokens || []];
    x = this.transformCSS(e, Ft, "light", "variable", m, r, o), P = Le;
    let uo = this.transformCSS(e, `${yt}${Jr}`, "light", "variable", m, r, o), co = this.transformCSS(e, `${to}`, "dark", "variable", m, r, o);
    g = `${uo}${co}`, k = [.../* @__PURE__ */ new Set([...Xr, ...eo, ...no])];
    let po = this.transformCSS(e, `${ro}${ao}color-scheme:light`, "light", "variable", m, r, o), fo = this.transformCSS(e, `${so}color-scheme:dark`, "dark", "variable", m, r, o);
    L = `${po}${fo}`, _ = [.../* @__PURE__ */ new Set([...oo, ...io, ...lo])], h = ve(f.css, { dt: Ve });
  }
  return { primitive: { css: x, tokens: P }, semantic: { css: g, tokens: k }, global: { css: L, tokens: _ }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: l }) {
  var s, i, u;
  let d, c, f;
  if (ne(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), x = t, { colorScheme: P, extend: g, css: k } = x, L = Ee(x, ["colorScheme", "extend", "css"]), _ = g || {}, { colorScheme: h } = _, C = Ee(_, ["colorScheme"]), A = P || {}, { dark: q } = A, R = Ee(A, ["dark"]), T = h || {}, { dark: w } = T, v = Ee(T, ["dark"]), $ = ne(L) ? this._toVariables({ [m]: _e(_e({}, L), C) }, n) : {}, I = ne(R) ? this._toVariables({ [m]: _e(_e({}, R), v) }, n) : {}, U = ne(q) ? this._toVariables({ [m]: _e(_e({}, q), w) }, n) : {}, [F, J] = [(s = $.declarations) != null ? s : "", $.tokens || []], [se, ge] = [(i = I.declarations) != null ? i : "", I.tokens || []], [Se, O] = [(u = U.declarations) != null ? u : "", U.tokens || []], N = this.transformCSS(m, `${F}${se}`, "light", "variable", n, o, a, l), B = this.transformCSS(m, Se, "dark", "variable", n, o, a, l);
    d = `${N}${B}`, c = [.../* @__PURE__ */ new Set([...J, ...ge, ...O])], f = ve(k, { dt: Ve });
  }
  return { css: d, tokens: c, style: f };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: l, options: s } = t, i = (a = l?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l;
  let s = e.replace("-directive", ""), { preset: i, options: u } = t, d = ((a = i?.components) == null ? void 0 : a[s]) || ((l = i?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${ve(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), s = Object.entries(r).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [u, d]) => {
    if (Oe(d) && Object.hasOwn(d, "css")) {
      let c = Ze(d.css), f = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${f}" ${s}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var l;
  let s = { name: e, theme: t, params: n, set: o, defaults: a }, i = (l = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(r).reduce((d, [c, f]) => d.push(`${c}="${f}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Ze(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(s, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Je.test(this.value)) {
      let c = this.value.trim().replace(Je, (f) => {
        var m;
        let x = f.slice(1, -1), P = this.tokens[x];
        if (!P) return console.warn(`Token not found for path: ${x}`), "__UNRESOLVED__";
        let g = P.computed(s, i, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (m = g?.value) != null ? m : "__UNRESOLVED__";
      });
      d = wr.test(c.replace(xr, "0")) ? `calc(${c})` : c;
    }
    return De(i.binding) && delete i.binding, u.pop(), { colorScheme: s, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (s, i, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let f = Re(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${Pn(d)}` : Pn(d), m = u ? `${u}.${d}` : d;
      Oe(c) ? l(c, f, m) : (o[f] || (o[f] = { paths: [], computed: (x, P = {}, g = []) => {
        if (o[f].paths.length === 1) return o[f].paths[0].computed(o[f].paths[0].scheme, P.binding, g);
        if (x && x !== "none") for (let k = 0; k < o[f].paths.length; k++) {
          let L = o[f].paths[k];
          if (L.scheme === x) return L.computed(x, P.binding, g);
        }
        return o[f].paths.map((k) => k.computed(k.scheme, P[k.scheme], g));
      } }), o[f].paths.push({ path: m, value: c, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((i) => !Re(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Ee(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ue(ne(t) ? `${e}${t},${e} ${t}` : e, r) : Ue(e, Ue(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, l, s) {
  if (ne(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, l);
      t = n === "dark" ? u.reduce((d, { type: c, selector: f }) => (ne(f) && (d += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, s, c, t)), d), "") : Ue(s ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      Oe(i) && (u.name = ve(i.name, { name: e, type: r })), ne(u.name) && (t = Ue(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, ee = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Mt(_e({}, t), { options: _e(_e({}, this.defaults.options), t.options) }), this._tokens = ke.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Mt(_e({}, this.theme), { preset: e }), this._tokens = ke.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ue.emit("preset:change", e), ue.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Mt(_e({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ue.emit("options:change", e), ue.emit("theme:change", this.theme);
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
  return ke.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ke.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ke.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ke.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ke.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ke.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ke.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ke.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ke.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ue.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ue.emit("theme:load"));
} }, ce = {
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
}, ia = `
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
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function Cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Tn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(r) {
      sa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function sa(e, t, n) {
  return (t = la(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function la(e) {
  var t = ua(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function ua(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function da(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  vn() && vn().components ? ln(e) : t ? e() : ze(e);
}
var ca = 0;
function pa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = M(!1), r = M(e), o = M(null), a = vr() ? window.document : void 0, l = t.document, s = l === void 0 ? a : l, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, f = t.name, m = f === void 0 ? "style_".concat(++ca) : f, x = t.id, P = x === void 0 ? void 0 : x, g = t.media, k = g === void 0 ? void 0 : g, L = t.nonce, _ = L === void 0 ? void 0 : L, h = t.first, C = h === void 0 ? !1 : h, A = t.onMounted, q = A === void 0 ? void 0 : A, R = t.onUpdated, T = R === void 0 ? void 0 : R, w = t.onLoad, v = w === void 0 ? void 0 : w, $ = t.props, I = $ === void 0 ? {} : $, U = function() {
  }, F = function(ge) {
    var Se = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var O = Tn(Tn({}, I), Se), N = O.name || m, B = O.id || P, Q = O.nonce || _;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(N, '"]')) || s.getElementById(B) || s.createElement("style"), o.value.isConnected || (r.value = ge || e, Pt(o.value, {
        type: "text/css",
        id: B,
        media: k,
        nonce: Q
      }), C ? s.head.prepend(o.value) : s.head.appendChild(o.value), Go(o.value, "data-primevue-style-id", N), Pt(o.value, O), o.value.onload = function(re) {
        return v?.(re, {
          name: N
        });
      }, q?.(N)), !n.value && (U = oe(r, function(re) {
        o.value.textContent = re, T?.(N);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, J = function() {
    !s || !n.value || (U(), Mo(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && da(F), {
    id: P,
    name: m,
    el: o,
    css: r,
    unload: J,
    load: F,
    isLoaded: mo(n)
  };
}
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
var On, An, En, jn;
function Ln(e, t) {
  return ba(e) || ha(e, t) || ma(e, t) || fa();
}
function fa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ma(e, t) {
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
function ha(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function ba(e) {
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
function qt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? In(Object(n), !0).forEach(function(r) {
      va(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function va(e, t, n) {
  return (t = ga(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ga(e) {
  var t = ya(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function ya(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function _t(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var wa = function(t) {
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
}, xa = {}, ka = {}, X = {
  name: "base",
  css: wa,
  style: ia,
  classes: xa,
  inlineStyles: ka,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(kt(On || (On = _t(["", ""])), t));
    return ne(o) ? pa(Ze(o), qt({
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
      return ee.transformCSS(n.name || t.name, "".concat(o).concat(kt(An || (An = _t(["", ""])), r)));
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
        dt: Ve
      }) || "", o = Ze(kt(En || (En = _t(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(l, s) {
        var i = Ln(s, 2), u = i[0], d = i[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = kt(jn || (jn = _t(["", ""])), ve(this.style, {
        dt: Ve
      })), l = Ze(ee.transformCSS(o, a)), s = Object.entries(n).reduce(function(i, u) {
        var d = Ln(u, 2), c = d[0], f = d[1];
        return i.push("".concat(c, '="').concat(f, '"')) && i;
      }, []).join(" ");
      ne(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return qt(qt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ie = br();
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
function $t(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(r) {
      _a(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function _a(e, t, n) {
  return (t = $a(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $a(e) {
  var t = Sa(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Sa(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pa = {
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
    text: [ce.STARTS_WITH, ce.CONTAINS, ce.NOT_CONTAINS, ce.ENDS_WITH, ce.EQUALS, ce.NOT_EQUALS],
    numeric: [ce.EQUALS, ce.NOT_EQUALS, ce.LESS_THAN, ce.LESS_THAN_OR_EQUAL_TO, ce.GREATER_THAN, ce.GREATER_THAN_OR_EQUAL_TO],
    date: [ce.DATE_IS, ce.DATE_IS_NOT, ce.DATE_BEFORE, ce.DATE_AFTER]
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
}, Ca = Symbol();
function Ta(e, t) {
  var n = {
    config: un(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Ca, n), Oa(), Aa(e, n), n;
}
var We = [];
function Oa() {
  ue.clear(), We.forEach(function(e) {
    return e?.();
  }), We = [];
}
function Aa(e, t) {
  var n = M(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !ee.isStyleNameLoaded("common")) {
      var d, c, f = ((d = X.getCommonTheme) === null || d === void 0 ? void 0 : d.call(X)) || {}, m = f.primitive, x = f.semantic, P = f.global, g = f.style, k = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      X.load(m?.css, $t({
        name: "primitive-variables"
      }, k)), X.load(x?.css, $t({
        name: "semantic-variables"
      }, k)), X.load(P?.css, $t({
        name: "global-variables"
      }, k)), X.loadStyle($t({
        name: "global-style"
      }, k), g), ee.setLoadedStyleName("common");
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
  }), l = oe(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || ee.setTheme(i), t.config.unstyled || r(), n.value = !1, Ie.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = oe(function() {
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
  We.push(o), We.push(a), We.push(l), We.push(s);
}
var Ea = {
  install: function(t, n) {
    var r = zo(Pa, n);
    Ta(t, r);
  }
}, Sr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = vr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ja(e, t, n, r, o, a) {
  return a.inline ? pe(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (p(), H(lr, {
    key: 1,
    to: n.appendTo
  }, [pe(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
Sr.render = ja;
var Ne = {
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
function La() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Nt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Rn = X.extend({
  name: "common"
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Na(e) {
  return Tr(e) || Ia(e) || Cr(e) || Pr();
}
function Ia(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ke(e, t) {
  return Tr(e) || za(e, t) || Cr(e, t) || Pr();
}
function Pr() {
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
function za(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function Tr(e) {
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
      Ye(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ye(e, t, n) {
  return (t = Ra(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ra(e) {
  var t = Va(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Va(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
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
    var t, n, r, o, a, l, s, i, u, d, c, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, x = f ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = x || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var P = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, g = P ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, k = P ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = k || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = La(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Uo(vt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = Y({
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
      return cn(t) ? t.apply(void 0, r) : K.apply(void 0, r);
    },
    _load: function() {
      Ne.isStyleNameLoaded("base") || (X.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ne.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ne.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Rn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ne.setLoadedStyleName(this.$style.name));
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
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = a.primitive, s = a.semantic, i = a.global, u = a.style;
          X.load(l?.css, Y({
            name: "primitive-variables"
          }, this.$styleOptions)), X.load(s?.css, Y({
            name: "semantic-variables"
          }, this.$styleOptions)), X.load(i?.css, Y({
            name: "global-variables"
          }, this.$styleOptions)), X.loadStyle(Y({
            name: "global-style"
          }, this.$styleOptions), u), ee.setLoadedStyleName("common");
        }
        if (!ee.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, f, m, x = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, P = x.css, g = x.style;
          (f = this.$style) === null || f === void 0 || f.load(P, Y({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(Y({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), ee.setLoadedStyleName(this.$style.name);
        }
        if (!ee.isStyleNameLoaded("layer-order")) {
          var k, L, _ = (k = this.$style) === null || k === void 0 || (L = k.getLayerOrderThemeCSS) === null || L === void 0 ? void 0 : L.call(k);
          X.load(_, Y({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), ee.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, Y({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Ne.clearLoadedStyleNames(), ue.on("theme:change", t);
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
      return fn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, f = a ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, Y(Y({}, o), {}, {
        global: f || {}
      })), x = this._getPTDatasets(r);
      return u || !u && m ? c ? this._mergeProps(c, f, m, x) : Y(Y(Y({}, f), m), x) : Y(Y({}, m), x);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return K(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && ne((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && Y(Y({}, r === "root" && Y(Y(Ye({}, "".concat(o, "name"), Te(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ye({}, "".concat(o, "extend"), Te(this.$.type.name))), {}, Ye({}, "".concat(this.$attrSelector), ""))), {}, Ye({}, "".concat(o, "section"), Te(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return be(t) || mr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(s) : s, c = Te(r), f = Te(n.$name);
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
        var l, s = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, f = a(t.originalValue), m = a(t.value);
        return f === void 0 && m === void 0 ? void 0 : be(m) ? m : be(f) ? f : u || !u && m ? c ? this._mergeProps(c, f, m) : Y(Y({}, f), m) : m;
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
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = K(this.$_attrsWithoutPT, this.ptm(n, r));
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
        var o = this._getOptionValue(this.$style.inlineStyles, t, Y(Y({}, this.$params), r)), a = this._getOptionValue(Rn.inlineStyles, t, Y(Y({}, this.$params), r));
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
        var o = Ke(r, 1), a = o[0];
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
        var n = Ke(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Ke(n, 2), o = r[0], a = r[1], l = o.split(":"), s = Na(l), i = Kt(s).slice(1);
        return i?.reduce(function(u, d, c, f) {
          return !u[d] && (u[d] = c === f.length - 1 ? a : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ke(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Ke(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Ba = `
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
`, Fa = X.extend({
  name: "baseicon",
  css: Ba
});
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Bn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Fn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Bn(Object(n), !0).forEach(function(r) {
      Da(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Da(e, t, n) {
  return (t = Ma(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ma(e) {
  var t = qa(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function qa(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zt = {
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
  style: Fa,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = De(this.label);
      return Fn(Fn({}, !this.isUnstyled && {
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
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Dn(e, t) {
  return Ka(e) || Ha(e, t) || Wa(e, t) || Ua();
}
function Ua() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wa(e, t) {
  if (e) {
    if (typeof e == "string") return Mn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mn(e, t) : void 0;
  }
}
function Mn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ha(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, l, s = [], i = !0, u = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); i = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!i && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function Ka(e) {
  if (Array.isArray(e)) return e;
}
function qn(e, t) {
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
    t % 2 ? qn(Object(n), !0).forEach(function(r) {
      Gt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Gt(e, t, n) {
  return (t = Ga(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ga(e) {
  var t = Ya(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function Ya(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var W = {
  _getMeta: function() {
    return [Oe(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ve(Oe(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: fn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var L = W._getOptionValue.apply(W, arguments);
      return be(L) || mr(L) ? {
        class: L
      } : L;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, f = u.mergeProps, m = f === void 0 ? !1 : f, x = s ? W._useDefaultPT(r, r.defaultPT(), i, a, l) : void 0, P = W._usePT(r, W._getPT(o, r.$name), i, a, Z(Z({}, l), {}, {
      global: x || {}
    })), g = W._getPTDatasets(r, a);
    return c || !c && P ? m ? W._mergeProps(r, m, x, P, g) : Z(Z(Z({}, x), P), g) : Z(Z({}, P), g);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return Z(Z({}, n === "root" && Gt({}, "".concat(r, "name"), Te(t.$name))), {}, Gt({}, "".concat(r, "section"), Te(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, i = r ? r(l) : l, u = Te(n);
      return (s = i?.[u]) !== null && s !== void 0 ? s : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(g) {
      return r(g, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, i = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, f = c === void 0 ? !1 : c, m = l(n.originalValue), x = l(n.value);
      return m === void 0 && x === void 0 ? void 0 : be(x) ? x : be(m) ? m : d || !d && x ? f ? W._mergeProps(t, f, m, x) : Z(Z({}, m), x) : x;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return W._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = W._getConfig(r, o), l = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    W._loadCoreStyles(n, l), W._loadThemeStyles(n, l), W._loadScopedThemeStyles(n, l), W._removeThemeListeners(n), n.$loadStyles = function() {
      return W._loadThemeStyles(n, l);
    }, W._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ne.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      X.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ne.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!ee.isStyleNameLoaded("common")) {
        var l, s, i = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = i.primitive, d = i.semantic, c = i.global, f = i.style;
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
        var m, x, P, g, k = ((m = o.$style) === null || m === void 0 || (x = m.getDirectiveTheme) === null || x === void 0 ? void 0 : x.call(m)) || {}, L = k.css, _ = k.style;
        (P = o.$style) === null || P === void 0 || P.load(L, Z({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (g = o.$style) === null || g === void 0 || g.loadStyle(Z({
          name: "".concat(o.$style.name, "-style")
        }, a), _), ee.setLoadedStyleName(o.$style.name);
      }
      if (!ee.isStyleNameLoaded("layer-order")) {
        var h, C, A = (h = o.$style) === null || h === void 0 || (C = h.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(h);
        X.load(A, Z({
          name: "layer-order",
          first: !0
        }, a)), ee.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, l, s = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = s.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, Z({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ne.clearLoadedStyleNames(), ue.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ue.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, l) {
    var s, i, u = "on".concat(Ro(n)), d = W._getConfig(o, a), c = r?.$instance, f = W._usePT(c, W._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, t), W._getOptionValue, "hooks.".concat(u)), m = W._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], W._getOptionValue, "hooks.".concat(u)), x = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: l
    };
    f?.(c, x), m?.(c, x);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return cn(t) ? t.apply(void 0, r) : K.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, i, u, d, c) {
      var f, m, x, P;
      i._$instances = i._$instances || {};
      var g = W._getConfig(u, d), k = i._$instances[t] || {}, L = De(k) ? Z(Z({}, n), n?.methods) : {};
      i._$instances[t] = Z(Z({}, k), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: k.$el || i || void 0,
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
          return W._getPT(g?.pt, void 0, function(h) {
            var C;
            return h == null || (C = h.directives) === null || C === void 0 ? void 0 : C[t];
          });
        },
        isUnstyled: function() {
          var h, C;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (C = i._$instances[t]) === null || C === void 0 || (C = C.$binding) === null || C === void 0 || (C = C.value) === null || C === void 0 ? void 0 : C.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return W._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, C, Z({}, A));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", A = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return W._getPTValue(i._$instances[t], h, C, A, !1);
        },
        cx: function() {
          var h, C, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : W._getOptionValue((C = i._$instances[t]) === null || C === void 0 || (C = C.$style) === null || C === void 0 ? void 0 : C.classes, A, Z({}, q));
        },
        sx: function() {
          var h, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, q = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return A ? W._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, C, Z({}, q)) : void 0;
        }
      }, L), i.$instance = i._$instances[t], (m = (x = i.$instance)[s]) === null || m === void 0 || m.call(x, i, u, d, c), i["$".concat(t)] = i.$instance, W._hook(t, s, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = Z(Z({}, (P = i.$pd) === null || P === void 0 ? void 0 : P[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(s) {
      var i, u, d, c = s._$instances[t], f = c?.watch, m = function(g) {
        var k, L = g.newValue, _ = g.oldValue;
        return f == null || (k = f.config) === null || k === void 0 ? void 0 : k.call(c, L, _);
      }, x = function(g) {
        var k, L = g.newValue, _ = g.oldValue;
        return f == null || (k = f["config.ripple"]) === null || k === void 0 ? void 0 : k.call(c, L, _);
      };
      c.$watchersCallback = {
        config: m,
        "config.ripple": x
      }, f == null || (i = f.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Ie.on("config:change", m), f == null || (u = f["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ie.on("config:ripple:change", x);
    }, a = function(s) {
      var i = s._$instances[t].$watchersCallback;
      i && (Ie.off("config:change", i.config), Ie.off("config:ripple:change", i["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, i, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: Yo("pd")
        }, r("created", s, i, u, d);
      },
      beforeMount: function(s, i, u, d) {
        var c;
        W._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", s, i, u, d), o(s);
      },
      mounted: function(s, i, u, d) {
        var c;
        W._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", s, i, u, d);
      },
      beforeUpdate: function(s, i, u, d) {
        r("beforeUpdate", s, i, u, d);
      },
      updated: function(s, i, u, d) {
        var c;
        W._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", s, i, u, d);
      },
      beforeUnmount: function(s, i, u, d) {
        var c;
        a(s), W._removeThemeListeners((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", s, i, u, d);
      },
      unmounted: function(s, i, u, d) {
        var c;
        (c = s.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", s, i, u, d);
      }
    };
  },
  extend: function() {
    var t = W._getMeta.apply(W, arguments), n = Dn(t, 2), r = n[0], o = n[1];
    return Z({
      extend: function() {
        var l = W._getMeta.apply(W, arguments), s = Dn(l, 2), i = s[0], u = s[1];
        return W.extend(i, Z(Z(Z({}, o), o?.methods), u));
      }
    }, W._extend(r, o));
  }
}, Qa = `
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
`, Za = {
  root: "p-ink"
}, Xa = X.extend({
  name: "ripple-directive",
  style: Qa,
  classes: Za
}), Ja = W.extend({
  style: Xa
});
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function ei(e) {
  return oi(e) || ri(e) || ni(e) || ti();
}
function ti() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ni(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function ri(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function oi(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Un(e, t, n) {
  return (t = ai(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ai(e) {
  var t = ii(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function ii(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Or = Ja.extend("ripple", {
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
      n || (n = qo("span", Un(Un({
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
        if (!this.isUnstyled() && Dt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !_n(o) && !$n(o)) {
          var a = Math.max(Fo(r), Ko(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var l = Ho(r), s = t.pageX - l.left + document.body.scrollTop - $n(o) / 2, i = t.pageY - l.top + document.body.scrollLeft - _n(o) / 2;
        o.style.top = i + "px", o.style.left = s + "px", !this.isUnstyled() && Bo(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Dt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Dt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? ei(t.children).find(function(n) {
        return Wo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const si = "data-wippy-overlay-layer";
function Ar() {
  return typeof window < "u" && typeof window.document < "u";
}
function Er() {
  return Ar() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function li() {
  return Er() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const ui = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let di = 0;
const Tt = /* @__PURE__ */ new WeakMap();
function Wn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function ci(e, t) {
  if (!ui.test(e.className))
    return;
  const n = e.style.cssText;
  Wn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Tt.has(e)) {
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Wn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Tt.set(e, r);
  }
}
function mn(e) {
  const t = Tt.get(e);
  t && (t.disconnect(), Tt.delete(e));
}
function pi(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Qt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ot = /* @__PURE__ */ new Set(), hn = /* @__PURE__ */ new WeakMap();
let Hn = !1, Zt = !1;
function fi() {
  Zt = !1;
  for (const e of Ot) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && mn(t);
      Ot.delete(e), hn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Qt(e);
  }
}
function Kn() {
  Zt || (Zt = !0, requestAnimationFrame(fi));
}
function mi(e) {
  const t = document.createElement("div");
  t.setAttribute(si, "");
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
    const a = t.__wippyAnchorName;
    for (const l of o) {
      if (a)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && ci(s, a);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && mn(s);
    }
    t.isConnected && t.childElementCount > 0 && Qt(t);
  });
  return r.observe(t, { childList: !0 }), hn.set(t, r), Ot.add(t), Hn || (Hn = !0, window.addEventListener("scroll", Kn, { capture: !0, passive: !0 }), window.addEventListener("resize", Kn, { passive: !0 })), t;
}
function Gn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = mi(e.hostRoot), li())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++di}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Yn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && mn(t);
    Ot.delete(e.layer), hn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Qn = !1;
function hi() {
  if (Qn)
    return;
  Qn = !0;
  const e = Sr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ar() && (this.hostRoot = pi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Gn(this), this.$watch("inline", (t) => {
      t ? Yn(this) : Gn(this);
    })));
  }, e.render = function() {
    return this.inline ? pe(this.$slots, "default", { key: 0 }) : this.mounted ? ho(lr, { key: 1, to: this.resolvedTarget || document.body }, [
      pe(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    Yn(this);
  };
}
const bi = {
  install: (e) => {
    hi(), e.use(Ea, { theme: "none" });
  }
};
var Xt = "data-wippy-visible";
function Zn(e) {
  const t = e.getAttribute(Xt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var vi = Object.defineProperty, gi = (e, t, n) => t in e ? vi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ie = (e, t, n) => gi(e, typeof t != "symbol" ? t + "" : t, n), yi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], wi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Xn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function xi(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, s] of Object.entries(o)) {
            const i = typeof s == "string" ? Xn(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? Xn(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function ki(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${wi} {
${t}
}`;
}
function _i(e, t) {
  const n = ki(t);
  n && jr(e, n, "@wippy-fe/css-variables-bridge");
}
function $i(e, t) {
  const r = (t ?? yi).map(async (o) => {
    const a = ko[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await _o(a);
    } catch (l) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, l), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const l = document.createElement("style");
      l.textContent = a, l.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(l);
    }
  });
}
function Si(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function jr(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Pi(e, t) {
  jr(e, t, "@wippy-fe/custom-css");
}
function Lr(e) {
  return e.__wippyHost ?? null;
}
function Ci(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ti(e, t, n) {
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
  for (const [o, a] of Object.entries(t.properties)) {
    const l = e.getAttribute(o), s = Ci(o);
    if (l === null) {
      a.default !== void 0 && (n[s] = a.default);
      continue;
    }
    const i = Ti(o, l, a);
    i.error ? r.push(i.error) : n[s] = i.value;
  }
  return { props: n, errors: r };
}
var Oi = class {
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
}, Ai = class extends HTMLElement {
  constructor() {
    super(), ie(this, "_internals"), ie(this, "_contentObserver", null), ie(this, "_initialized", !1), ie(this, "_container", null), ie(this, "_reactive", null), ie(this, "_lastProps", null), ie(this, "_lastErrors", []), ie(this, "_lastContent", null), ie(this, "_themeUnsub", null), ie(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Zn(this);
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
    return Lr(this);
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
        const a = Ut(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Oi(
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
        this.onInit(n), e.inlineCss && Si(n, e.inlineCss);
        try {
          const u = gn?.theming, d = xi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          _i(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = gn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && Pi(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && $i(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, wo(yo);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = qe("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Ut(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const l = o;
      this._lastProps = l, this._lastErrors = a;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, l, a, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = xo.getThemeMode?.()) {
    wt(e, this), this._container && wt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), wt("auto", this), this._container && wt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Xt) {
      const s = this._hostVisible, i = Zn(this);
      if (i === s)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, s), this.onHostVisibilityChanged(i, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Ut(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const l = o;
    this._lastProps = l, this._lastErrors = a, this._reactive?.notifyProps(l, a), this.onPropsChanged(l, a);
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
function Ei(e) {
  return e.__wippyHostBus ?? null;
}
function ji(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Li = Object.defineProperty, Ni = (e, t, n) => t in e ? Li(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Me = (e, t, n) => Ni(e, typeof t != "symbol" ? t + "" : t, n), Nr = /* @__PURE__ */ Symbol("wippy:emit"), Ir = /* @__PURE__ */ Symbol("wippy:props"), zr = /* @__PURE__ */ Symbol("wippy:props_error"), Ii = /* @__PURE__ */ Symbol("wippy:content"), zi = /* @__PURE__ */ Symbol("wippy:panel-id"), Ri = /* @__PURE__ */ Symbol("wippy:layout-bus"), Vi = /* @__PURE__ */ Symbol("wippy:host"), Bi = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Fi() {
  const e = bt(Ir);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Di() {
  const e = bt(Nr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Mi() {
  const e = bt(zr);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var qi = class extends Ai {
  constructor() {
    super(...arguments), Me(this, "_vueApp", null), Me(this, "_propsRef", M({})), Me(this, "_errorsRef", M([])), Me(this, "_contentRef", M(null)), Me(this, "_hostVisibilityRef", M(null)), Me(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, a) {
    const l = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: s.signal });
    const i = (u) => {
      if (s.signal.aborted)
        return;
      const d = So(), c = bo(u.rootComponent);
      this._vueApp = c;
      const f = Po();
      if (u.piniaPlugins)
        for (const m of u.piniaPlugins)
          f.use(m);
      if (c.use(f), u.plugins)
        for (const m of u.plugins)
          c.use(m);
      c.provide(Ir, this._propsRef), c.provide(zr, this._errorsRef), c.provide(Nr, this.emitEvent.bind(this)), c.provide(Ii, this._contentRef), c.provide(Bi, this._hostVisibilityRef), c.provide(zi, ji(this)), c.provide(Ri, Ei(this)), c.provide(Vi, Lr(this)), u.providers && u.providers(c, this), c.mount(t), d && Co(d);
    };
    if (l.rootComponent)
      i(l);
    else if (l.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), l.lazyConfig().then((d) => {
        s.signal.aborted || (u.remove(), i(d));
      }).catch((d) => {
        if (s.signal.aborted)
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
const Ui = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead.' }, definition: { type: "object", default: null, description: 'Immutable form definition: `title`, optional `description`, optional `submit_label`, optional `answered_message` (not displayed), and `fields` (each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`). When every field is `type: "choice"` the question-card UI renders; otherwise the radio/checkbox fields form renders.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' }, density: { type: "string", default: "compact", description: 'Question-card sizing: "compact" (default) or "comfortable", a larger size/spacing scale. Read purely through the `:host([density="comfortable"])` CSS selector — no JS reads it — but must be a declared prop so the package-tag mount path can set it as an attribute.' } } } }, Wi = {
  wippy: Ui
};
var Rr = {
  name: "SpinnerIcon",
  extends: zt
};
function Hi(e) {
  return Qi(e) || Yi(e) || Gi(e) || Ki();
}
function Ki() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gi(e, t) {
  if (e) {
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function Yi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Qi(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Zi(e, t, n, r, o, a) {
  return p(), b("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Hi(t[0] || (t[0] = [j("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rr.render = Zi;
var Xi = `
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
      "p-badge-dot": De(n.value) && !r.$slots.default,
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
}, es = X.extend({
  name: "badge",
  style: Xi,
  classes: Ji
}), ts = {
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
  style: es,
  provide: function() {
    return {
      $pcBadge: this,
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
function Jn(e, t, n) {
  return (t = ns(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ns(e) {
  var t = rs(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function rs(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Vr = {
  name: "Badge",
  extends: ts,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Ae(Jn(Jn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, os = ["data-p"];
function as(e, t, n, r, o, a) {
  return p(), b("span", K({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [pe(e.$slots, "default", {}, function() {
    return [de(D(e.value), 1)];
  })], 16, os);
}
Vr.render = as;
var is = `
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
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function Ce(e, t, n) {
  return (t = ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ss(e) {
  var t = ls(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function ls(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var us = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", Ce(Ce(Ce(Ce(Ce(Ce(Ce(Ce(Ce({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", Ce({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ds = X.extend({
  name: "button",
  style: is,
  classes: us
}), cs = {
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
  style: ds,
  provide: function() {
    return {
      $pcButton: this,
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
function me(e, t, n) {
  return (t = ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ps(e) {
  var t = fs(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function fs(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var xe = {
  name: "Button",
  extends: cs,
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
      return K(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return De(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Ae(me(me(me(me(me(me(me(me(me(me({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Ae(me(me({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Ae(me(me({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Rr,
    Badge: Vr
  },
  directives: {
    ripple: Or
  }
}, ms = ["data-p"], hs = ["data-p"];
function bs(e, t, n, r, o, a) {
  var l = Xe("SpinnerIcon"), s = Xe("Badge"), i = ur("ripple");
  return e.asChild ? pe(e.$slots, "default", {
    key: 1,
    class: E(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : dr((p(), H(cr(e.as), K({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: ae(function() {
      return [pe(e.$slots, "default", {}, function() {
        return [e.loading ? pe(e.$slots, "loadingicon", K({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (p(), b("span", K({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (p(), H(l, K({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : pe(e.$slots, "icon", K({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (p(), b("span", K({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, ms)) : z("", !0)];
        }), e.label ? (p(), b("span", K({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), D(e.label), 17, hs)) : z("", !0), e.badge ? (p(), H(s, {
          key: 3,
          value: e.badge,
          class: E(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : z("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
xe.render = bs;
var Br = {
  name: "TimesIcon",
  extends: zt
};
function vs(e) {
  return xs(e) || ws(e) || ys(e) || gs();
}
function gs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ys(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function ws(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function xs(e) {
  if (Array.isArray(e)) return en(e);
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ks(e, t, n, r, o, a) {
  return p(), b("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), vs(t[0] || (t[0] = [j("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Br.render = ks;
var _s = `
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
`, $s = {
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
}, Ss = X.extend({
  name: "message",
  style: _s,
  classes: $s
}), Ps = {
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
  style: Ss,
  provide: function() {
    return {
      $pcMessage: this,
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
function er(e, t, n) {
  return (t = Cs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Cs(e) {
  var t = Ts(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Ts(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ye = {
  name: "Message",
  extends: Ps,
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
      return Ae(er(er({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Or
  },
  components: {
    TimesIcon: Br
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
function tr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function nr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tr(Object(n), !0).forEach(function(r) {
      Os(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Os(e, t, n) {
  return (t = As(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function As(e) {
  var t = Es(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Es(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var js = ["data-p"], Ls = ["data-p"], Ns = ["data-p"], Is = ["aria-label", "data-p"], zs = ["data-p"];
function Rs(e, t, n, r, o, a) {
  var l = Xe("TimesIcon"), s = ur("ripple");
  return p(), H(vo, K({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ae(function() {
      return [o.visible ? (p(), b("div", K({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [j("div", K({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? pe(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (p(), b("div", K({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [pe(e.$slots, "icon", {
        class: E(e.cx("icon"))
      }, function() {
        return [(p(), H(cr(e.icon ? "span" : null), K({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (p(), b("div", K({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [pe(e.$slots, "default")], 16, Ns)) : z("", !0), e.closable ? dr((p(), b("button", K({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, nr(nr({}, e.closeButtonProps), e.ptm("closeButton"))), [pe(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (p(), b("i", K({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, zs)) : (p(), H(l, K({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Is)), [[s]]) : z("", !0)], 16, Ls))], 16)], 16, js)) : z("", !0)];
    }),
    _: 3
  }, 16);
}
ye.render = Rs;
const Vs = () => Fi(), Bs = () => Di(), Fs = Mi, Ds = 2e3;
function Ms() {
  const e = dn.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function qs(e, t) {
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
    const l = a.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const s = await t();
      !s || s.artifact_id !== l || s.delivery !== "pending" || r.has(l) || (r.add(l), Ms()?.send({ type: "session_open", session_id: s.session_id }));
    }, Ds);
  }, { immediate: !0 }), It(o);
}
const Us = 5e3;
function Ws(e, t) {
  const n = M("idle"), r = M(null), o = M(null), a = M(null);
  let l = 0, s = null, i = null, u = null, d = null;
  function c() {
    return dn.artifactState;
  }
  let f = null, m = !1;
  function x() {
    m || f || (m = !0, f = setTimeout(() => {
      f = null, g();
    }, Us));
  }
  async function P() {
    const R = c();
    if (typeof R != "function") {
      n.value = "unsupported", o.value = "This form needs a newer Web Host.";
      return;
    }
    const T = e.value;
    if (!T) {
      n.value = "idle", r.value = null, a.value = null;
      return;
    }
    const w = ++l, v = r.value === null;
    v && (n.value = "loading");
    try {
      const $ = await R(T).get();
      if (w !== l)
        return;
      r.value = $, n.value = "loaded", o.value = null, a.value = null, m = !1;
    } catch ($) {
      if (w !== l)
        return;
      const I = $ instanceof Error ? $.message : "Could not load this form.";
      v ? (n.value = "error", o.value = I) : (a.value = I, x());
    }
  }
  function g() {
    return s ? (i || (i = s.then(() => (i = null, g()))), i) : (s = P().finally(() => {
      s = null;
    }), s);
  }
  function k(R) {
    d !== R && (u?.(), u = null, d = R, R && (u = qe(`artifact:${R}`, () => {
      g();
    })));
  }
  oe(e, (R) => {
    l++, r.value = null, a.value = null, k(R), g();
  }, { immediate: !0 }), oe(t, () => {
    g();
  });
  const L = S(() => {
    const R = r.value;
    return R?.session_id && (R.status === "active" && !R.stale || R.status === "idle" && R.delivery && R.delivery !== "complete") ? R.session_id : null;
  });
  let _ = null, h = null;
  oe(L, (R) => {
    _?.(), _ = null, h?.(), h = null, R && (_ = qe(`session:${R}:message:*`, (T) => {
      T.data?.type !== "chunk" && g();
    }), h = qe(`session:${R}`, () => {
      g();
    }));
  }, { immediate: !0 });
  const C = qe("@visibility", (R) => {
    R && g();
  }), A = qe("@reconnect", () => {
    g();
  });
  It(() => {
    l++, f && clearTimeout(f), f = null, u?.(), u = null, _?.(), _ = null, h?.(), h = null, C(), A();
  });
  async function q() {
    return await g(), r.value;
  }
  return { status: n, state: r, errorMessage: o, reloadError: a, reload: () => {
    g();
  }, refresh: q };
}
function Hs() {
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
const Ks = Symbol.for("wippy.artifactStateError");
function Fr(e) {
  return typeof e == "object" && e !== null && e[Ks] === !0;
}
function Gs(e) {
  return Fr(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function rr(e) {
  return !Fr(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function or(e) {
  const t = Gs(e);
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
const Ys = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function Qs(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Zs(e) {
  return JSON.stringify(e);
}
function Xs(e) {
  const t = M(!1), n = M(null), r = M(null);
  let o = 0;
  oe(e, () => {
    o++, l();
  });
  function a(u) {
    const d = Zs(u);
    if (n.value && r.value === d)
      return n.value;
    const c = Hs();
    return n.value = c, r.value = d, c;
  }
  function l() {
    n.value = null, r.value = null;
  }
  function s() {
    return dn.artifactState;
  }
  async function i(u, d, c) {
    const f = e.value;
    if (!f)
      return { ok: !1, message: "This form cannot be submitted here." };
    const m = s();
    if (typeof m != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const x = o, P = a(c), g = {
      form_version: u,
      request_id: P,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let k;
      try {
        k = await m(f).submit(g);
      } catch (L) {
        if (x !== o)
          return { ok: !1, ignored: !0 };
        const _ = rr(L);
        if (_)
          return { ok: !1, fieldErrors: _.errors, formErrors: _.formErrors };
        const h = or(L);
        if (!h.uncertain)
          return { ok: !1, message: h.message, code: h.code, retryable: h.retryable, shouldReload: h.shouldReload };
        if (await Qs(800), x !== o)
          return { ok: !1, ignored: !0 };
        try {
          k = await m(f).submit(g);
        } catch (C) {
          if (x !== o)
            return { ok: !1, ignored: !0 };
          const A = rr(C);
          if (A)
            return { ok: !1, fieldErrors: A.errors, formErrors: A.formErrors };
          const q = or(C), R = q.uncertain ? Ys : q.message, T = q.uncertain ? !0 : q.retryable;
          return { ok: !1, message: R, code: q.code, retryable: T, shouldReload: q.shouldReload };
        }
      }
      return x !== o ? { ok: !1, ignored: !0 } : (l(), { ok: !0, accepted: k });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: l };
}
const bn = Symbol("wippy-form:element"), St = "data-wippy-artifact-id";
function Js() {
  const e = bt(bn), t = M(e?.getAttribute(St) ?? null);
  if (e) {
    let n = null;
    ln(() => {
      t.value = e.getAttribute(St), n = new MutationObserver(() => {
        t.value = e.getAttribute(St);
      }), n.observe(e, { attributes: !0, attributeFilter: [St] });
    }), It(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function el(e, t) {
  const n = bt(bn);
  n && go(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function tl(e) {
  const t = M(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return ln(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), It(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
const $e = "text-danger-600 dark:text-danger-400", Rt = "text-warn-700 dark:text-warn-400";
function At(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Be(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function ar(e) {
  return typeof e == "string" ? e : Be(e) ? e.value : null;
}
function nl(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => ar(n) === t) : ar(e) === t;
}
function Qe(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(At);
    return t ? t.other : "";
  }
  return At(e) ? e.other : "";
}
function Dr(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(At) : At(e);
}
function rl(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((o) => Be(o) && o.value === t);
  return r && Be(r) ? r.note : "";
}
const ol = 2e3, al = 1e3;
function Fe(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Mr(e) {
  return Array.from(e).length;
}
function qr(e) {
  return Mr(le(e)) > ol;
}
function il(e) {
  return Mr(le(e)) > al;
}
function le(e) {
  return e.trim();
}
function tn(e) {
  return le(e);
}
function sl(e) {
  return le(e);
}
function Et(e, t) {
  const n = sl(t);
  return n ? { value: e, note: n } : e;
}
function Ur(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], r = e.options.map((i) => i.value), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
    for (const i of n)
      typeof i == "string" && r.includes(i) ? a.add(i) : Be(i) && r.includes(i.value) && (a.add(i.value), o.set(i.value, i));
    const l = r.filter((i) => a.has(i)).map((i) => {
      const u = o.get(i);
      return u ? Et(i, u.note) : i;
    }), s = n.find(Fe);
    if (s) {
      const i = tn(s.other);
      i.length > 0 && l.push({ other: i });
    }
    return l.length > 0 ? l : void 0;
  }
  if (t !== void 0) {
    if (Fe(t)) {
      const n = tn(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Be(t) && e.options.some((n) => n.value === t.value))
      return Et(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function ll(e, t) {
  const n = {};
  for (const r of e.fields) {
    const o = Ur(r, t[r.id]);
    o !== void 0 && (n[r.id] = o);
  }
  return n;
}
function ul(e, t) {
  const n = [];
  for (const r of e.fields)
    r.required && Ur(r, t[r.id]) === void 0 && n.push(r.id);
  return n;
}
function dl(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(Fe) : void 0 : Fe(t) ? t : void 0;
}
function cl(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = dl(r, t[r.id]);
    o && tn(o.other).length === 0 && n.push(r.id);
  }
  return n;
}
function pl(e, t) {
  const n = [];
  for (const r of e.fields) {
    const o = t[r.id];
    let a;
    if (r.multiple) {
      if (Array.isArray(o)) {
        const l = o.find(Fe);
        l && (a = l.other);
      }
    } else Fe(o) && (a = o.other);
    a !== void 0 && qr(a) && n.push(r.id);
  }
  return n;
}
function Wr(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const a of e.options) {
    const l = n.find((s) => typeof s == "string" ? s === a.value : Be(s) && s.value === a.value);
    l && r.push({ label: a.label, note: Be(l) ? l.note : void 0 });
  }
  const o = n.find(Fe);
  return o && r.push({ label: o.other, own: !0 }), r.length > 0 ? r : null;
}
function fl(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const r of e.fields) {
    const o = t[r.id];
    o !== void 0 && (n[r.id] = r.multiple ? Array.isArray(o) ? [...o] : [o] : o);
  }
  return n;
}
var Hr = {
  name: "CheckIcon",
  extends: zt
};
function ml(e) {
  return gl(e) || vl(e) || bl(e) || hl();
}
function hl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bl(e, t) {
  if (e) {
    if (typeof e == "string") return nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(e, t) : void 0;
  }
}
function vl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gl(e) {
  if (Array.isArray(e)) return nn(e);
}
function nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function yl(e, t, n, r, o, a) {
  return p(), b("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ml(t[0] || (t[0] = [j("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Hr.render = yl;
var Kr = {
  name: "MinusIcon",
  extends: zt
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
    if (typeof e == "string") return rn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rn(e, t) : void 0;
  }
}
function _l(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $l(e) {
  if (Array.isArray(e)) return rn(e);
}
function rn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Sl(e, t, n, r, o, a) {
  return p(), b("svg", K({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wl(t[0] || (t[0] = [j("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Kr.render = Sl;
var Pl = {
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
}, Vt = {
  name: "BaseInput",
  extends: Pl,
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
}, Cl = `
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
`, Tl = {
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
}, Ol = X.extend({
  name: "checkbox",
  style: Cl,
  classes: Tl
}), Al = {
  name: "BaseCheckbox",
  extends: Vt,
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
function pt(e) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pt(e);
}
function El(e, t, n) {
  return (t = jl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function jl(e) {
  var t = Ll(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Ll(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Nl(e) {
  return Vl(e) || Rl(e) || zl(e) || Il();
}
function Il() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zl(e, t) {
  if (e) {
    if (typeof e == "string") return on(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? on(e, t) : void 0;
  }
}
function Rl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vl(e) {
  if (Array.isArray(e)) return on(e);
}
function on(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var jt = {
  name: "Checkbox",
  extends: Al,
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
          return !pn(a, n.value);
        }) : o = r ? [].concat(Nl(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(o, t) : this.writeValue(o, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Lo(this.value, t);
    },
    dataP: function() {
      return Ae(El({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Hr,
    MinusIcon: Kr
  }
}, Bl = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Fl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Dl = ["data-p"];
function Ml(e, t, n, r, o, a) {
  var l = Xe("CheckIcon"), s = Xe("MinusIcon");
  return p(), b("div", K({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": o.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [j("input", K({
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
  }, a.getPTOptions("input")), null, 16, Fl), j("div", K({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [pe(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: o.d_indeterminate,
    class: E(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (p(), H(l, K({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : o.d_indeterminate ? (p(), H(s, K({
      key: 1,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : z("", !0)];
  })], 16, Dl)], 16, Bl);
}
jt.render = Ml;
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
}, Wl = X.extend({
  name: "inputtext",
  style: ql,
  classes: Ul
}), Hl = {
  name: "BaseInputText",
  extends: Vt,
  style: Wl,
  provide: function() {
    return {
      $pcInputText: this,
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
function Kl(e, t, n) {
  return (t = Gl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gl(e) {
  var t = Yl(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function Yl(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var an = {
  name: "InputText",
  extends: Hl,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return K(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Ae(Kl({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ql = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Zl(e, t, n, r, o, a) {
  return p(), b("input", K({
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
  }, a.attrs), null, 16, Ql);
}
an.render = Zl;
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
}, eu = X.extend({
  name: "radiobutton",
  style: Xl,
  classes: Jl
}), tu = {
  name: "BaseRadioButton",
  extends: Vt,
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
function mt(e) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, mt(e);
}
function nu(e, t, n) {
  return (t = ru(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ru(e) {
  var t = ou(e, "string");
  return mt(t) == "symbol" ? t : t + "";
}
function ou(e, t) {
  if (mt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sn = {
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
      return t != null && (this.binary ? !!t : pn(t, this.value));
    },
    dataP: function() {
      return Ae(nu({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, au = ["data-p-checked", "data-p-disabled", "data-p"], iu = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], su = ["data-p"], lu = ["data-p"];
function uu(e, t, n, r, o, a) {
  return p(), b("div", K({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [j("input", K({
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
  }, a.getPTOptions("input")), null, 16, iu), j("div", K({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [j("div", K({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, lu)], 16, su)], 16, au);
}
sn.render = uu;
const du = ["aria-describedby"], cu = { class: "text-sm font-medium text-color p-0" }, pu = {
  key: 0,
  class: "text-danger-600 dark:text-danger-400"
}, fu = {
  key: 1,
  class: "text-sm text-color break-words"
}, mu = ["role", "aria-required"], hu = ["for"], bu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, vu = {
  key: 0,
  class: "flex items-start gap-2"
}, gu = { class: "flex flex-col gap-1 min-w-0 grow" }, yu = ["for"], wu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, xu = {
  key: 0,
  class: "flex items-start gap-2"
}, ku = { class: "flex flex-col gap-1 min-w-0 grow" }, Ge = "choice-field-other-sentinel", Bt = /* @__PURE__ */ fe({
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
    const r = e, o = n, a = Nt(), l = `${a}-desc`, s = `${a}-err`, i = `${a}-other`, u = `${i}-label`, d = `${a}-other-text`, c = `${d}-label`;
    function f(T) {
      return `${a}-opt-${T}`;
    }
    const m = M(null), x = S(() => {
      const T = [];
      return r.field.description && T.push(l), !r.readonly && r.errors.length > 0 && T.push(s), T.length > 0 ? T.join(" ") : void 0;
    }), P = S({
      get() {
        const T = r.modelValue;
        return typeof T == "string" ? T : q(T) ? Ge : "";
      },
      set(T) {
        T === Ge ? o("update:modelValue", { other: g.value }) : T === "" ? o("update:modelValue", void 0) : o("update:modelValue", T);
      }
    }), g = M(Qe(r.modelValue));
    oe(() => r.modelValue, (T) => {
      r.field.multiple || (g.value = Qe(T));
    }), oe(g, (T) => {
      !r.field.multiple && P.value === Ge && o("update:modelValue", { other: T });
    });
    const k = S(() => {
      const T = r.modelValue;
      return Array.isArray(T) ? T.filter((w) => typeof w == "string") : [];
    }), L = S(() => r.field.multiple && Dr(r.modelValue)), _ = M(Qe(r.modelValue));
    oe(() => r.modelValue, (T) => {
      r.field.multiple && (_.value = Qe(T));
    });
    function h(T, w, v) {
      const $ = [...T];
      w && $.push({ other: v }), o("update:modelValue", $.length > 0 ? $ : void 0);
    }
    function C(T, w) {
      const v = new Set(k.value);
      w ? v.add(T) : v.delete(T), h(r.field.options.filter(($) => v.has($.value)).map(($) => $.value), L.value, _.value);
    }
    function A(T) {
      h(k.value, T, _.value);
    }
    oe(_, (T) => {
      L.value && h(k.value, !0, T);
    });
    function q(T) {
      return !!T && typeof T == "object" && !Array.isArray(T) && typeof T.other == "string";
    }
    const R = S(() => {
      const T = r.modelValue;
      if (T === void 0)
        return "—";
      const w = ($) => r.field.options.find((I) => I.value === $)?.label ?? $, v = [];
      if (Array.isArray(T))
        for (const $ of T)
          typeof $ == "string" ? v.push(w($)) : q($) && v.push(`Other: ${$.other}`);
      else typeof T == "string" ? v.push(w(T)) : q(T) && v.push(`Other: ${T.other}`);
      return v.length > 0 ? v.join(", ") : "—";
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
    }), (T, w) => (p(), b("fieldset", {
      ref_key: "fieldsetEl",
      ref: m,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": x.value
    }, [
      j("legend", cu, [
        de(D(e.field.label), 1),
        !e.readonly && e.field.required ? (p(), b("span", pu, " (required)")) : z("", !0)
      ]),
      e.field.description ? (p(), b("p", {
        key: 0,
        id: l,
        class: "text-xs text-muted-color m-0"
      }, D(e.field.description), 1)) : z("", !0),
      e.readonly ? (p(), b("p", fu, D(R.value), 1)) : (p(), b("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup",
        "aria-required": e.field.required ? "true" : void 0
      }, [
        e.field.multiple ? (p(), b(te, { key: 1 }, [
          (p(!0), b(te, null, he(e.field.options, (v, $) => (p(), b("div", {
            key: v.value,
            class: "flex items-start gap-2"
          }, [
            G(y(jt), {
              "model-value": k.value.includes(v.value),
              binary: "",
              "input-id": f($),
              disabled: e.disabled,
              "onUpdate:modelValue": (I) => C(v.value, !!I)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            j("label", {
              for: f($),
              class: "text-sm text-color break-words"
            }, [
              de(D(v.label) + " ", 1),
              v.description ? (p(), b("span", wu, D(v.description), 1)) : z("", !0)
            ], 8, yu)
          ]))), 128)),
          e.field.allow_other ? (p(), b("div", xu, [
            G(y(jt), {
              "model-value": L.value,
              binary: "",
              "input-id": i,
              disabled: e.disabled,
              "onUpdate:modelValue": w[3] || (w[3] = (v) => A(!!v))
            }, null, 8, ["model-value", "disabled"]),
            j("div", ku, [
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
              G(y(an), {
                id: d,
                modelValue: _.value,
                "onUpdate:modelValue": w[4] || (w[4] = (v) => _.value = v),
                disabled: e.disabled || !L.value,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : z("", !0)
        ], 64)) : (p(), b(te, { key: 0 }, [
          (p(!0), b(te, null, he(e.field.options, (v, $) => (p(), b("div", {
            key: v.value,
            class: "flex items-start gap-2"
          }, [
            G(y(sn), {
              modelValue: P.value,
              "onUpdate:modelValue": w[0] || (w[0] = (I) => P.value = I),
              "input-id": f($),
              name: y(a),
              value: v.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            j("label", {
              for: f($),
              class: "text-sm text-color break-words"
            }, [
              de(D(v.label) + " ", 1),
              v.description ? (p(), b("span", bu, D(v.description), 1)) : z("", !0)
            ], 8, hu)
          ]))), 128)),
          e.field.allow_other ? (p(), b("div", vu, [
            G(y(sn), {
              modelValue: P.value,
              "onUpdate:modelValue": w[1] || (w[1] = (v) => P.value = v),
              "input-id": i,
              name: y(a),
              value: Ge,
              disabled: e.disabled
            }, null, 8, ["modelValue", "name", "disabled"]),
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
              G(y(an), {
                id: d,
                modelValue: g.value,
                "onUpdate:modelValue": w[2] || (w[2] = (v) => g.value = v),
                disabled: e.disabled || P.value !== Ge,
                size: "small",
                class: "w-full"
              }, null, 8, ["modelValue", "disabled"])
            ])
          ])) : z("", !0)
        ], 64))
      ], 8, mu)),
      !e.readonly && e.errors.length > 0 ? (p(), b("ul", {
        key: 3,
        id: s,
        class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0 flex flex-col gap-0.5"
      }, [
        (p(!0), b(te, null, he(e.errors, (v, $) => (p(), b("li", { key: $ }, D(v.message), 1))), 128))
      ])) : z("", !0)
    ], 8, du));
  }
}), _u = {
  role: "status",
  class: "sr-only"
}, $u = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color"
}, Su = { class: "flex flex-col gap-1" }, Pu = { class: "text-base font-semibold text-color break-words" }, Cu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Tu = {
  key: 1,
  class: "text-xs italic text-muted-color"
}, Ou = {
  key: 1,
  class: "text-xs text-danger-600 dark:text-danger-400 list-none p-0 m-0"
}, Au = { class: "flex items-center gap-2" }, Eu = "Use at most 2,000 characters.", ju = "Enter the other answer.", Lu = "You are offline. Your choices are kept.", Nu = /* @__PURE__ */ fe({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = S(() => r.banner?.retryable ? Rt : $e), l = un(
      fl(r.state.definition, r.state.data)
    ), s = M({}), i = M([]), u = {}, d = M("");
    function c(_, h) {
      u[_] = h;
    }
    const f = S(() => !r.submitting && !r.offline);
    function m(_, h = []) {
      const C = r.state.definition.fields.find((A) => _.includes(A.id))?.id;
      C && ze(() => {
        const A = u[C];
        h.includes(C) ? A?.focusOtherText() : A?.focusFirstControl();
      });
    }
    function x(_) {
      d.value = _ === 1 ? "1 question needs an answer." : `${_} questions need an answer.`;
    }
    function P(_, h) {
      s.value = _ ?? {}, i.value = h ?? [];
      const C = Object.keys(s.value);
      m(C);
      const A = C.length + (i.value.length > 0 ? 1 : 0);
      A > 0 && x(A);
    }
    function g(_, h) {
      if (l[_] = h, s.value[_]) {
        const { [_]: C, ...A } = s.value;
        s.value = A;
      }
    }
    function k() {
      return ll(r.state.definition, l);
    }
    function L() {
      const _ = cl(r.state.definition, l), h = ul(r.state.definition, l).filter((A) => !_.includes(A)), C = pl(r.state.definition, l);
      if (h.length > 0 || C.length > 0 || _.length > 0) {
        const A = {};
        for (const R of h)
          A[R] = [...A[R] ?? [], { code: "required", message: "This question is required." }];
        for (const R of _)
          A[R] = [...A[R] ?? [], { code: "blank", message: ju }];
        for (const R of C)
          A[R] = [...A[R] ?? [], { code: "too_long", message: Eu }];
        s.value = A, i.value = [];
        const q = [...h, ..._, ...C];
        m(q, _), x(new Set(q).size);
        return;
      }
      s.value = {}, i.value = [], o("submit", k());
    }
    return oe(() => r.banner, (_) => {
      _ && (d.value = _.message);
    }), t({
      setServerErrors: P,
      retry: () => o("submit", k()),
      // See QuestionCardActive's own `hasUnsentInput` — a field whose current
      // draft would actually serialize to something counts as unsent input a
      // background "answered elsewhere" swap would otherwise silently discard
      // without explanation.
      hasUnsentInput: () => Object.keys(k()).length > 0
    }), (_, h) => (p(), b("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: pr(L, ["prevent"])
    }, [
      j("div", _u, D(d.value), 1),
      e.offline ? (p(), b("p", $u, D(Lu))) : z("", !0),
      j("div", Su, [
        j("h2", Pu, D(e.state.definition.title), 1),
        e.state.definition.description ? (p(), b("p", Cu, D(e.state.definition.description), 1)) : z("", !0),
        e.state.stale ? (p(), b("p", Tu, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : z("", !0)
      ]),
      (p(!0), b(te, null, he(e.state.definition.fields, (C) => (p(), H(Bt, {
        key: C.id,
        ref_for: !0,
        ref: (A) => c(C.id, A),
        field: C,
        "model-value": l[C.id],
        errors: s.value[C.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (A) => g(C.id, A)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      i.value.length > 0 ? (p(), b("ul", Ou, [
        (p(!0), b(te, null, he(i.value, (C, A) => (p(), b("li", { key: A }, D(C.message), 1))), 128))
      ])) : z("", !0),
      e.banner ? (p(), H(y(ye), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ae(() => [
          j("div", Au, [
            j("span", {
              class: E(a.value)
            }, D(e.banner.message), 3),
            e.banner.retryable ? (p(), H(y(xe), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: h[0] || (h[0] = (C) => o("retry"))
            }, {
              default: ae(() => [...h[1] || (h[1] = [
                de(" Retry ", -1)
              ])]),
              _: 1
            })) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : z("", !0),
      j("div", null, [
        G(y(xe), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !f.value
        }, null, 8, ["label", "loading", "disabled"])
      ])
    ], 32));
  }
}), Iu = { class: "flex flex-col gap-4 min-w-0" }, zu = { class: "flex flex-col gap-1" }, Ru = { class: "text-base font-semibold text-color break-words" }, Vu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Bu = { key: 0 }, Fu = { key: 1 }, Du = { key: 2 }, Mu = { key: 3 }, qu = { key: 4 }, Uu = /* @__PURE__ */ fe({
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
    const r = M(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        r.value?.focus();
      }
    }), (o, a) => (p(), b("div", Iu, [
      j("div", zu, [
        j("h2", Ru, D(e.state.definition.title), 1),
        e.state.definition.description ? (p(), b("p", Vu, D(e.state.definition.description), 1)) : z("", !0)
      ]),
      (p(!0), b(te, null, he(e.state.definition.fields, (l) => (p(), H(Bt, {
        key: l.id,
        field: l,
        "model-value": e.state.data ? e.state.data[l.id] : void 0,
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
        e.state.late ? (p(), b("p", Bu, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : z("", !0),
        e.state.delivery === "pending" ? (p(), b("p", Fu, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), b("p", Du, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), b("p", Mu, " The assistant stopped before answering. Send a message to continue. ")) : z("", !0),
        n(e.state.submitted_at) ? (p(), b("p", qu, " Answered " + D(n(e.state.submitted_at)), 1)) : z("", !0)
      ], 512)
    ]));
  }
}), Wu = { class: "flex flex-col gap-4 min-w-0" }, Hu = { class: "flex flex-col gap-1" }, Ku = { class: "text-base font-semibold text-color break-words" }, Gu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Yu = /* @__PURE__ */ fe({
  __name: "needs-newer-host-notice",
  props: {
    definition: {},
    answered: { type: Boolean }
  },
  setup(e) {
    return (t, n) => (p(), b("div", Wu, [
      j("div", Hu, [
        j("h2", Ku, D(e.definition.title), 1),
        e.definition.description ? (p(), b("p", Gu, D(e.definition.description), 1)) : z("", !0)
      ]),
      (p(!0), b(te, null, he(e.definition.fields, (r) => (p(), H(Bt, {
        key: r.id,
        field: r,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      e.answered ? (p(), H(y(ye), {
        key: 0,
        severity: "secondary",
        closable: !1
      }, {
        default: ae(() => [...n[0] || (n[0] = [
          de(" This form was answered. Your answer is in the chat. ", -1)
        ])]),
        _: 1
      })) : (p(), H(y(ye), {
        key: 1,
        severity: "warn",
        closable: !1
      }, {
        default: ae(() => [
          j("span", {
            class: E(y(Rt))
          }, "This form needs a newer Web Host. If you already answered it, your answer is in the chat.", 2)
        ]),
        _: 1
      }))
    ]));
  }
}), Qu = { class: "flex flex-col gap-4 min-w-0" }, Zu = { class: "flex flex-col gap-1" }, Xu = { class: "text-base font-semibold text-color break-words" }, Ju = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, ed = /* @__PURE__ */ fe({
  __name: "no-artifact-notice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (p(), b("div", Qu, [
      j("div", Zu, [
        j("h2", Xu, D(e.definition.title), 1),
        e.definition.description ? (p(), b("p", Ju, D(e.definition.description), 1)) : z("", !0)
      ]),
      (p(!0), b(te, null, he(e.definition.fields, (r) => (p(), H(Bt, {
        key: r.id,
        field: r,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      G(y(ye), {
        severity: "secondary",
        closable: !1
      }, {
        default: ae(() => [...n[0] || (n[0] = [
          de(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), Lt = 9;
function td(e, t, n) {
  const r = e.fields.length, o = r > 1, a = /* @__PURE__ */ new Set([0]), l = M(0), s = M(!1), i = M(""), u = M(""), d = M(null), c = M(0), f = un(
    Object.fromEntries(e.fields.map((O) => {
      const N = t?.[O.id], B = O.options.filter((Le) => nl(N, Le.value)).map((Le) => Le.value), Q = {};
      for (const Le of B) {
        const yt = rl(N, Le);
        yt && (Q[Le] = yt);
      }
      const re = Dr(N), Pe = Qe(N), gt = B.length > 0 || re && le(Pe) !== "", Ft = { chosen: B, other: Pe, useOther: re, notes: Q, noteOpen: null, done: gt };
      return [O.id, Ft];
    }))
  );
  function m(O) {
    return f[O.id];
  }
  function x(O) {
    const N = m(O);
    return O.multiple ? N.chosen.length > 0 || le(N.other) !== "" : N.chosen.length > 0 || N.useOther && le(N.other) !== "";
  }
  function P(O) {
    return m(O).done && x(O);
  }
  const g = S(() => o && l.value === r), k = S(() => g.value ? null : e.fields[l.value] ?? null), L = S(
    () => e.fields.map((O, N) => ({ field: O, index: N })).filter(({ field: O }) => O.required && !P(O))
  );
  let _;
  function h(O) {
    clearTimeout(_), u.value = "", _ = setTimeout(() => {
      u.value = O;
    }, 30);
  }
  function C() {
    clearTimeout(_), u.value = "";
  }
  function A(O) {
    d.value = O, c.value++;
  }
  function q(O) {
    return Math.min(O.options.length + (O.allow_other ? 1 : 0), Lt);
  }
  function R(O) {
    const N = q(O), B = N > 1 ? `1–${N}` : "1", Q = Math.min(O.options.length, Lt), re = Q > 1 ? `Shift+1–${Q}` : "Shift+1", Pe = o ? " ← and → change questions." : "";
    return O.multiple ? `${B} ticks, ${re} adds a note, Enter sends.${Pe}` : `${B} answers, ${re} adds a note first.${Pe}`;
  }
  function T(O) {
    const N = m(O);
    if (O.multiple) {
      const B = O.options.filter((re) => N.chosen.includes(re.value)).map((re) => Et(re.value, N.notes[re.value] ?? "")), Q = le(N.other);
      return Q && B.push({ other: Q }), B.length > 0 ? B : void 0;
    }
    if (N.useOther)
      return { other: le(N.other) };
    if (N.chosen[0])
      return Et(N.chosen[0], N.notes[N.chosen[0]] ?? "");
  }
  function w(O) {
    return P(O) ? Wr(O, T(O)) : null;
  }
  function v() {
    const O = {};
    for (const N of e.fields) {
      if (!P(N))
        continue;
      const B = T(N);
      B !== void 0 && (O[N.id] = B);
    }
    return O;
  }
  function $(O, N = "first") {
    const B = k.value;
    B && B.multiple && !m(B).done && x(B) && (m(B).done = !0);
    const Q = o ? r : r - 1;
    if (l.value = Math.max(0, Math.min(O, Q)), i.value = "", g.value || a.add(l.value), g.value) {
      const re = L.value[0];
      A(re ? `review-item-${re.index}` : "send-all");
    } else
      A(N);
    h(g.value ? "Review your answers" : `Question ${l.value + 1} of ${r}`);
  }
  function I() {
    L.value.length > 0 || n(v());
  }
  function U(O) {
    if (m(O).done = !0, i.value = "", !o) {
      n(v());
      return;
    }
    const N = e.fields.findIndex((B, Q) => Q > l.value && !a.has(Q));
    $(N === -1 ? r : N);
  }
  function F(O, N) {
    const B = m(O);
    if (N >= O.options.length) {
      A("other");
      return;
    }
    const Q = O.options[N].value;
    if (B.noteOpen === Q && !O.multiple) {
      A(`note-${Q}`);
      return;
    }
    if (O.multiple) {
      B.chosen = B.chosen.includes(Q) ? B.chosen.filter((re) => re !== Q) : [...B.chosen, Q], x(O) || (B.done = !1), i.value = "", A(`opt-${N}`), h(B.chosen.includes(Q) ? "Ticked" : "Unticked");
      return;
    }
    B.chosen = [Q], B.useOther = !1, U(O);
  }
  function J(O, N, B = !1) {
    const Q = m(O), re = O.options.findIndex((Pe) => Pe.value === N);
    Q.noteOpen === N && !B ? (Q.noteOpen = null, A(`opt-${re}`)) : (Q.noteOpen = N, A(`note-${N}`));
  }
  function se(O, N, B) {
    m(O).notes[N] = B;
  }
  function ge(O, N) {
    const B = m(O);
    if (B.noteOpen = null, O.multiple) {
      B.chosen.includes(N) || (B.chosen = [...B.chosen, N]), A(`opt-${O.options.findIndex((Q) => Q.value === N)}`), h("Note saved");
      return;
    }
    B.chosen = [N], B.useOther = !1, A(`opt-${O.options.findIndex((Q) => Q.value === N)}`), U(O);
  }
  function Se(O) {
    const N = m(O), B = le(N.other);
    if (O.multiple) {
      if (!B && N.chosen.length === 0)
        return;
    } else {
      if (!B)
        return;
      N.useOther = !0, N.chosen = [];
    }
    U(O);
  }
  return {
    n: r,
    multi: o,
    index: l,
    collapsed: s,
    error: i,
    liveMessage: u,
    focusTarget: d,
    focusSeq: c,
    answers: f,
    inReview: g,
    currentQuestion: k,
    missingRequired: L,
    ans: m,
    hasContent: x,
    answered: P,
    answerItemsFor: w,
    keysText: R,
    activate: F,
    toggleNote: J,
    setNote: se,
    sendNote: ge,
    sendOther: Se,
    commit: U,
    go: $,
    submitAll: I,
    requestFocus: A,
    quiet: C,
    buildAnswers: v
  };
}
function V(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function nd(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, o) => ({ text: r, code: o % 2 === 1 })).filter((r) => r.text !== "");
}
function ir(e) {
  return String(e).replaceAll("`", "");
}
function rd(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const od = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, je = /* @__PURE__ */ fe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, r) => (p(!0), b(te, null, he(y(nd)(t.text), (o, a) => (p(), b(te, { key: a }, [
      o.code ? (p(), b("code", od, D(o.text), 1)) : (p(), b(te, { key: 1 }, [
        de(D(o.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), ad = ["part"], id = ["part"], sd = ["part"], ld = { "aria-hidden": "true" }, ud = { class: "w-form__sr" }, dd = ["id", "part"], cd = ["part"], pd = /* @__PURE__ */ fe({
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
    const n = e, r = t, o = S(() => V("header", !n.multi && "single")), a = S(() => V("nav")), l = S(() => V("prev")), s = S(() => V("counter")), i = S(() => V("next")), u = S(() => V("question")), d = S(() => V("actions")), c = S(() => V("collapse")), f = S(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), m = S(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), x = S(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (P, g) => (p(), b("div", {
      part: o.value.part,
      class: E(o.value.class)
    }, [
      e.multi ? (p(), b("div", {
        key: 0,
        part: a.value.part,
        class: E(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        G(y(xe), {
          type: "button",
          text: "",
          size: "small",
          part: l.value.part,
          class: E(l.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: g[0] || (g[0] = (k) => r("prev"))
        }, {
          icon: ae(() => [
            G(y(we), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        j("span", {
          part: s.value.part,
          class: E(s.value.class)
        }, [
          j("span", ld, D(f.value), 1),
          j("span", ud, D(m.value), 1)
        ], 10, sd),
        G(y(xe), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: E(i.value.class),
          "aria-label": x.value,
          title: x.value,
          disabled: e.review,
          onClick: g[1] || (g[1] = (k) => r("next"))
        }, {
          icon: ae(() => [
            G(y(we), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, id)) : z("", !0),
      j("h3", {
        id: e.qid,
        part: u.value.part,
        class: E(u.value.class)
      }, [
        e.review ? (p(), b(te, { key: 0 }, [
          de(" Check your answers, then send them. ")
        ], 64)) : (p(), H(je, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, dd),
      j("div", {
        part: d.value.part,
        class: E(d.value.class)
      }, [
        G(y(xe), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: E(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: g[2] || (g[2] = (k) => r("toggleCollapse"))
        }, {
          icon: ae(() => [
            G(y(we), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, cd)
    ], 10, ad));
  }
});
var fd = `
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
`, md = {
  root: "p-inputgroup"
}, hd = X.extend({
  name: "inputgroup",
  style: fd,
  classes: md
}), bd = {
  name: "BaseInputGroup",
  extends: He,
  style: hd,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Gr = {
  name: "InputGroup",
  extends: bd,
  inheritAttrs: !1
};
function vd(e, t, n, r, o, a) {
  return p(), b("div", K({
    class: e.cx("root")
  }, e.ptmi("root")), [pe(e.$slots, "default")], 16);
}
Gr.render = vd;
var gd = `
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
`, yd = {
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
}, wd = X.extend({
  name: "textarea",
  style: gd,
  classes: yd
}), xd = {
  name: "BaseTextarea",
  extends: Vt,
  props: {
    autoResize: Boolean
  },
  style: wd,
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
function kd(e, t, n) {
  return (t = _d(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function _d(e) {
  var t = $d(e, "string");
  return ht(t) == "symbol" ? t : t + "";
}
function $d(e, t) {
  if (ht(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Yr = {
  name: "Textarea",
  extends: xd,
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
      return K(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Ae(kd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Sd = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Pd(e, t, n, r, o, a) {
  return p(), b("textarea", K({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, Sd);
}
Yr.render = Pd;
const Qr = /* @__PURE__ */ fe({
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
    const n = e, r = t, o = S(() => V("composer", n.kind)), a = S(() => V(`${n.kind}-input`)), l = S(() => V(`${n.kind}-send`));
    function s(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && r("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), r("escape"));
    }
    return (i, u) => (p(), H(y(Gr), {
      part: o.value.part,
      class: E(o.value.class)
    }, {
      default: ae(() => [
        G(y(Yr), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: E(a.value.class),
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": u[0] || (u[0] = (d) => r("update:modelValue", String(d ?? ""))),
          onKeydown: s
        }, null, 8, ["model-value", "part", "class", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        G(y(xe), {
          type: "button",
          text: "",
          rounded: "",
          part: l.value.part,
          class: E(l.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => r("send"))
        }, {
          icon: ae(() => [
            G(y(we), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), Cd = ["part"], Td = ["part", "role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], Od = ["part"], Ad = ["part"], Ed = ["part"], jd = ["part"], Ld = ["part"], Nd = { key: 1 }, Id = ["part"], zd = /* @__PURE__ */ fe({
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
    const n = e, r = t, o = S(() => V("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = S(() => V("option-main")), l = S(() => V("option-label")), s = S(() => V("option-mark")), i = S(() => V("option-description")), u = S(() => V("option-note")), d = S(() => V("note-toggle", n.note && "has-note", n.editing && "editing")), c = S(() => V("option-key")), f = S(() => V("error")), m = `${Nt()}-note-err`, x = S(() => [
      n.noteTooLong ? m : "",
      n.describedBy ?? ""
    ].filter(Boolean).join(" ") || void 0);
    function P(_) {
      n.disabled || _.target.closest(".w-form__note-toggle, .w-form__composer") || r("activate");
    }
    const g = S(() => `${n.note ? "Edit the note on" : "Add a note to"} ${ir(n.option.label)}`), k = S(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), L = S(() => n.multiple ? "Save the note" : "Answer with this note");
    return (_, h) => (p(), b("div", {
      part: o.value.part,
      class: E(o.value.class),
      onClick: P
    }, [
      j("div", {
        part: a.value.part,
        class: E(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        j("span", {
          part: l.value.part,
          class: E(l.value.class)
        }, [
          e.multiple ? (p(), H(y(jt), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: s.value.part,
            class: E(s.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (p(), b("span", {
            key: 1,
            part: s.value.part,
            class: E(s.value.class),
            "aria-hidden": "true"
          }, [
            G(y(we), { icon: "tabler:check" })
          ], 10, Ad)) : z("", !0),
          G(je, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, Od),
        e.option.description ? (p(), b("span", {
          key: 0,
          part: i.value.part,
          class: E(i.value.class)
        }, [
          G(je, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, Ed)) : z("", !0),
        e.note && !e.editing ? (p(), b("span", {
          key: 1,
          part: u.value.part,
          class: E(u.value.class)
        }, [
          G(y(we), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          j("span", null, D(e.note), 1)
        ], 10, jd)) : z("", !0)
      ], 10, Td),
      G(y(xe), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: E(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": g.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: h[0] || (h[0] = pr((C) => r("toggle-note"), ["stop"]))
      }, {
        icon: ae(() => [
          G(y(we), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (p(), b("kbd", {
        key: 0,
        part: c.value.part,
        class: E(c.value.class),
        "aria-hidden": "true"
      }, D(e.keyLabel), 11, Ld)) : (p(), b("span", Nd)),
      e.editing ? (p(), b(te, { key: 2 }, [
        G(Qr, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: k.value,
          label: `Note for ${y(ir)(e.option.label)}`,
          "send-label": L.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": x.value,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": h[1] || (h[1] = (C) => r("update:noteDraft", C)),
          onSend: h[2] || (h[2] = (C) => r("send-note")),
          onEscape: h[3] || (h[3] = (C) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (p(), b("p", {
          key: 0,
          id: m,
          part: f.value.part,
          class: E([f.value.class, y($e)]),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Id)) : z("", !0)
      ], 64)) : z("", !0)
    ], 10, Cd));
  }
}), Rd = ["part"], Vd = ["part"], Bd = ["part"], Fd = ["part", "role", "aria-labelledby", "aria-invalid"], Dd = ["part"], Md = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, qd = { key: 1 }, Ud = ["part"], Wd = ["part"], Hd = ["part"], Kd = /* @__PURE__ */ fe({
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
    const t = e, n = S(() => V("notice")), r = S(() => V("description")), o = S(() => V("hint")), a = S(() => V("options")), l = S(() => V("footer")), s = S(() => V("send")), i = S(() => V("error")), u = S(() => V("keys")), d = S(() => {
      const v = [];
      return t.question.multiple && v.push("Choose any that apply."), t.question.required || v.push("Optional."), v.join(" ");
    }), c = S(() => t.controller.error.value || t.serverError || "");
    function f(v) {
      return v < Lt ? String(v + 1) : null;
    }
    const m = S(() => {
      const v = t.question.options.length + 1;
      return v <= Lt ? String(v) : null;
    });
    function x() {
      return t.controller.ans(t.question);
    }
    const P = S(() => {
      const v = x(), $ = t.question.multiple ? le(v.other) !== "" : v.useOther && v.done;
      return V("option", "other", $ && "selected");
    }), g = S(() => {
      const v = x();
      return le(v.other) !== "" || t.question.multiple && v.chosen.length > 0;
    }), k = S(() => qr(x().other)), L = `${t.qid}-other-err`, _ = `${t.qid}-err`, h = S(() => [
      c.value ? _ : "",
      t.cardErrorIds ?? ""
    ].filter(Boolean).join(" ") || void 0), C = S(() => [
      k.value ? L : "",
      h.value ?? ""
    ].filter(Boolean).join(" ") || void 0), A = S(() => k.value || !!c.value);
    function q() {
      t.disabled || t.controller.commit(t.question);
    }
    function R(v) {
      v.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    const T = M(0);
    oe(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const v = x(), $ = v.useOther ? -1 : t.question.options.findIndex((I) => I.value === v.chosen[0]);
      T.value = $ >= 0 ? $ : 0;
    }, { immediate: !0 });
    function w(v) {
      if (t.question.multiple)
        return;
      const $ = v.target?.dataset?.focus ?? "";
      $.startsWith("opt-") && (T.value = Number($.slice(4)));
    }
    return (v, $) => (p(), b(te, null, [
      e.stale ? (p(), b("p", {
        key: 0,
        part: n.value.part,
        class: E(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Rd)) : z("", !0),
      e.question.description ? (p(), b("p", {
        key: 1,
        part: r.value.part,
        class: E(r.value.class)
      }, [
        G(je, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Vd)) : z("", !0),
      d.value ? (p(), b("p", {
        key: 2,
        part: o.value.part,
        class: E(o.value.class)
      }, D(d.value), 11, Bd)) : z("", !0),
      j("div", {
        part: a.value.part,
        class: E(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": _,
        "aria-invalid": !e.question.multiple && c.value ? "true" : void 0,
        onFocusin: w
      }, [
        (p(!0), b(te, null, he(e.question.options, (I, U) => (p(), H(zd, {
          key: I.value,
          option: I,
          index: U,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(I.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === I.value,
          note: y(le)(e.controller.ans(e.question).notes[I.value] || ""),
          editing: e.controller.ans(e.question).noteOpen === I.value,
          "note-draft": e.controller.ans(e.question).notes[I.value] || "",
          "key-label": f(U),
          "note-too-long": y(il)(e.controller.ans(e.question).notes[I.value] || ""),
          disabled: !!e.disabled,
          "described-by": h.value,
          invalid: !!c.value,
          "roving-tabbable": U === T.value,
          onActivate: (F) => e.controller.activate(e.question, U),
          onToggleNote: (F) => e.controller.toggleNote(e.question, I.value),
          "onUpdate:noteDraft": (F) => e.controller.setNote(e.question, I.value, F),
          onSendNote: (F) => e.controller.sendNote(e.question, I.value),
          onEscapeNote: (F) => e.controller.toggleNote(e.question, I.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (p(), b("div", {
          key: 0,
          part: P.value.part,
          class: E(P.value.class),
          onClick: R
        }, [
          G(Qr, {
            kind: "other",
            "model-value": x().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: g.value && !e.disabled && !k.value,
            invalid: A.value,
            "described-by": C.value,
            "data-focus": "other",
            "onUpdate:modelValue": $[0] || ($[0] = (I) => {
              x().other = I;
            }),
            onSend: $[1] || ($[1] = (I) => e.controller.sendOther(e.question)),
            onEscape: $[2] || ($[2] = (I) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          m.value ? (p(), b("kbd", Md, D(m.value), 1)) : (p(), b("span", qd)),
          k.value ? (p(), b("p", {
            key: 2,
            id: L,
            part: i.value.part,
            class: E([i.value.class, y($e)]),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, Ud)) : z("", !0)
        ], 10, Dd)) : z("", !0)
      ], 42, Fd),
      e.question.multiple && !e.question.allow_other ? (p(), b("div", {
        key: 3,
        part: l.value.part,
        class: E(l.value.class)
      }, [
        G(y(xe), {
          type: "button",
          part: s.value.part,
          class: E([s.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send",
          "aria-describedby": h.value,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: e.controller.ans(e.question).chosen.length === 0,
          onClick: q
        }, {
          default: ae(() => [
            $[3] || ($[3] = de(" Send ", -1)),
            G(y(we), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, Wd)) : z("", !0),
      c.value ? (p(), H(y(ye), {
        key: 4,
        id: _,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: E(i.value.class),
        role: "alert"
      }, {
        default: ae(() => [
          j("span", {
            class: E(y($e))
          }, D(c.value), 3)
        ]),
        _: 1
      }, 8, ["part", "class"])) : (p(), b("p", {
        key: 5,
        id: _,
        class: "hidden"
      })),
      j("p", {
        part: u.value.part,
        class: E(u.value.class)
      }, D(e.controller.keysText(e.question)), 11, Hd)
    ], 64));
  }
}), Gd = ["part"], Yd = ["part"], Qd = { key: 0 }, Zd = ["part"], Zr = /* @__PURE__ */ fe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = S(() => V("answer-item")), r = S(() => V("answer-note")), o = S(() => V("answer-own"));
    return (a, l) => (p(!0), b(te, null, he(t.items, (s, i) => (p(), b("span", {
      key: i,
      part: n.value.part,
      class: E(n.value.class)
    }, [
      s.own ? (p(), b(te, { key: 0 }, [
        j("span", {
          part: o.value.part,
          class: E(o.value.class)
        }, "Own answer: ", 10, Yd),
        (p(!0), b(te, null, he(y(rd)(s.label), (u, d) => (p(), b(te, { key: d }, [
          d > 0 ? (p(), b("br", Qd)) : z("", !0),
          de(D(u), 1)
        ], 64))), 128))
      ], 64)) : (p(), H(je, {
        key: 1,
        text: s.label
      }, null, 8, ["text"])),
      y(le)(s.note || "") ? (p(), b("span", {
        key: 2,
        part: r.value.part,
        class: E(r.value.class)
      }, [
        G(y(we), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        j("span", null, D(y(le)(s.note)), 1)
      ], 10, Zd)) : z("", !0)
    ], 10, Gd))), 128));
  }
}), Xd = ["part"], Jd = ["part"], ec = ["part", "aria-label", "data-focus", "onClick"], tc = ["part"], nc = ["part"], rc = ["part"], oc = ["part"], ac = ["part"], ic = ["part"], sc = ["part"], lc = /* @__PURE__ */ fe({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = S(() => V("review")), r = S(() => V("footer")), o = S(() => V("footer-text")), a = S(() => V("send-all")), l = S(() => V("keys")), s = S(() => V("review-number")), i = S(() => V("review-question")), u = S(() => V("review-answer")), d = S(() => V("answer-empty"));
    function c(k) {
      return V("review-item", k && "missing");
    }
    function f(k) {
      return !t.controller.answerItemsFor(k) && k.required;
    }
    function m() {
      return V("review-edit");
    }
    function x() {
      t.disabled || t.controller.submitAll();
    }
    const P = S(() => t.controller.missingRequired.value), g = S(() => {
      const k = P.value;
      return k.length === 0 ? "" : k.length === 1 ? `Question ${k[0].index + 1} still needs an answer.` : `Questions ${k.map((L) => L.index + 1).join(" and ")} still need answers.`;
    });
    return (k, L) => (p(), b(te, null, [
      j("ol", {
        part: n.value.part,
        class: E(n.value.class)
      }, [
        (p(!0), b(te, null, he(e.definition.fields, (_, h) => (p(), b("li", {
          key: _.id,
          part: c(f(_)).part,
          class: E(c(f(_)).class)
        }, [
          j("button", {
            type: "button",
            part: m().part,
            class: E(m().class),
            "aria-label": `Question ${h + 1}: change the answer`,
            "data-focus": `review-item-${h}`,
            onClick: (C) => e.controller.go(h, "first")
          }, [
            j("span", {
              part: s.value.part,
              class: E(s.value.class),
              "aria-hidden": "true"
            }, D(h + 1), 11, tc),
            j("span", {
              part: i.value.part,
              class: E(i.value.class)
            }, [
              G(je, {
                text: _.label
              }, null, 8, ["text"])
            ], 10, nc),
            j("span", {
              part: u.value.part,
              class: E([u.value.class, f(_) && y($e)])
            }, [
              e.controller.answerItemsFor(_) ? (p(), H(Zr, {
                key: 0,
                items: e.controller.answerItemsFor(_)
              }, null, 8, ["items"])) : _.required ? (p(), b(te, { key: 1 }, [
                de(" Not answered yet ")
              ], 64)) : (p(), b("span", {
                key: 2,
                part: d.value.part,
                class: E(d.value.class)
              }, "Skipped", 10, oc))
            ], 10, rc)
          ], 10, ec)
        ], 10, Jd))), 128))
      ], 10, Xd),
      j("div", {
        part: r.value.part,
        class: E(r.value.class)
      }, [
        g.value ? (p(), b("p", {
          key: 0,
          part: o.value.part,
          class: E([o.value.class, y($e)])
        }, D(g.value), 11, ic)) : z("", !0),
        G(y(xe), {
          type: "button",
          part: a.value.part,
          class: E([a.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send-all",
          "aria-describedby": e.cardErrorIds,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: P.value.length > 0,
          onClick: x
        }, {
          default: ae(() => [
            L[0] || (L[0] = de(" Send answers ", -1)),
            G(y(we), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, ac),
      j("p", {
        part: l.value.part,
        class: E(l.value.class)
      }, " Enter sends. Pick a row to change it. ← goes back to the last question. ", 10, sc)
    ], 64));
  }
}), uc = ["part", "aria-busy"], dc = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, cc = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, pc = ["part"], fc = ["part"], mc = { class: "flex items-center gap-2" }, hc = {
  "aria-live": "polite",
  class: "w-form__sr"
}, bc = "You are offline. Your choices are kept.", vc = "Sending your answer…", gc = /* @__PURE__ */ fe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = td(r.state.definition, r.state.data, (w) => {
      r.offline || r.submitting || o("submit", w);
    }), l = S(() => !!r.offline || r.submitting), s = `${Nt()}-q`, i = M(null);
    oe(a.inReview, (w) => o("update:state", w ? "review" : "active"), { immediate: !0 }), oe(a.collapsed, (w) => o("update:collapsed", w), { immediate: !0 }), oe(() => r.submitting, (w) => {
      w && a.quiet();
    });
    const u = M({}), d = M([]);
    function c(w) {
      return u.value[w] ?? "";
    }
    const f = S(() => new Set(r.state.definition.fields.map((w) => w.id))), m = S(() => {
      const w = Object.entries(u.value).filter(([v]) => !f.value.has(v)).map(([, v]) => v);
      return [...d.value, ...w].join(" ");
    }), x = `${s}-general-err`, P = `${s}-banner`, g = S(() => [
      m.value ? x : "",
      r.banner ? P : ""
    ].filter(Boolean).join(" ") || void 0), k = S(() => r.banner?.retryable ? Rt : $e);
    oe(
      () => Object.fromEntries(r.state.definition.fields.map((w) => [w.id, JSON.stringify(a.ans(w))])),
      (w, v) => {
        if (!v)
          return;
        const $ = new Set(
          r.state.definition.fields.map((I) => I.id).filter((I) => w[I] !== v[I] && u.value[I])
        );
        $.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([I]) => !$.has(I))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(w, v) {
        const $ = {};
        for (const [U, F] of Object.entries(w ?? {}))
          $[U] = F.map((J) => J.message).join(" ");
        u.value = $, d.value = (v ?? []).map((U) => U.message);
        const I = r.state.definition.fields.findIndex((U) => $[U.id]);
        I >= 0 ? a.go(I, "first") : ze(q);
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
          (w) => w.chosen.length > 0 || le(w.other) !== "" || Object.values(w.notes).some((v) => le(v) !== "")
        );
      }
    });
    const L = S(() => V("card")), _ = S(() => V("title")), h = S(() => V("form-description"));
    function C(w) {
      const v = i.value;
      if (!v)
        return;
      let $ = null;
      if (w === "card" ? $ = v : w === "first" ? $ = v.querySelector(".w-form__option--selected .w-form__option-main") ?? v.querySelector(".w-form__option-main, .w-form__other-input") : $ = Array.from(v.querySelectorAll("[data-focus]")).find((I) => I.dataset.focus === w) ?? null, !!$ && ($.focus(), $.tagName === "TEXTAREA")) {
        const I = $;
        I.setSelectionRange(I.value.length, I.value.length);
      }
    }
    oe(a.focusSeq, () => {
      ze(() => {
        const w = a.focusTarget.value;
        w && C(w);
      });
    });
    function A() {
      const w = i.value?.ownerDocument;
      if (!w)
        return !1;
      const v = w.activeElement;
      return !v || v === w.body || v === w.documentElement;
    }
    function q() {
      A() && a.requestFocus(a.inReview.value ? "send-all" : "first");
    }
    oe(() => r.banner, (w) => {
      w && ze(q);
    });
    function R() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function T(w) {
      const v = w.composedPath()[0];
      if (v?.tagName === "TEXTAREA" || w.isComposing || w.ctrlKey || w.metaKey || w.altKey || a.collapsed.value || l.value)
        return;
      if (a.inReview.value) {
        w.key === "ArrowLeft" && (w.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const $ = a.currentQuestion.value;
      if (!$)
        return;
      const I = a.ans($), U = w.shiftKey ? /^Digit([1-9])$/.exec(w.code) : /^([1-9])$/.exec(w.key);
      if (U) {
        const se = Number(U[1]) - 1;
        if (se >= $.options.length + ($.allow_other ? 1 : 0))
          return;
        w.preventDefault(), w.shiftKey && se < $.options.length ? a.toggleNote($, $.options[se].value, !0) : a.activate($, se);
        return;
      }
      const F = v?.dataset?.focus ?? "", J = F.startsWith("opt-") ? Number(F.slice(4)) : -1;
      if (w.key === "ArrowDown" || w.key === "ArrowUp") {
        const se = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (se.length === 0)
          return;
        w.preventDefault();
        const ge = se.indexOf(v), Se = w.key === "ArrowDown" ? (ge + 1) % se.length : ge <= 0 ? se.length - 1 : ge - 1;
        se[Se]?.focus();
        return;
      }
      if (a.multi && (w.key === "ArrowRight" || w.key === "ArrowLeft")) {
        w.preventDefault(), a.go(a.index.value + (w.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((w.key === "n" || w.key === "N") && J >= 0) {
        w.preventDefault(), a.toggleNote($, $.options[J].value, !0);
        return;
      }
      if (J >= 0 && (w.key === " " || w.key === "Enter" && !$.multiple)) {
        w.preventDefault(), a.activate($, J);
        return;
      }
      w.key === "Enter" && $.multiple && !v?.matches?.("button") && (w.preventDefault(), I.chosen.length > 0 || le(I.other) ? a.commit($) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(J >= 0 ? F : "first")));
    }
    return (w, v) => (p(), b("section", {
      ref_key: "cardRoot",
      ref: i,
      part: L.value.part,
      class: E(`w-form ${L.value.class}`),
      role: "group",
      "aria-labelledby": s,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: T
    }, [
      e.offline ? (p(), b("p", dc, D(bc))) : z("", !0),
      e.submitting ? (p(), b("p", cc, D(vc))) : z("", !0),
      m.value ? (p(), H(y(ye), {
        key: 2,
        id: x,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          j("span", {
            class: E(y($e))
          }, D(m.value), 3)
        ]),
        _: 1
      })) : z("", !0),
      j("p", {
        part: _.value.part,
        class: E(_.value.class)
      }, [
        G(y(we), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        de(" " + D(e.state.definition.title), 1)
      ], 10, pc),
      e.state.definition.description ? (p(), b("p", {
        key: 3,
        part: h.value.part,
        class: E(h.value.class)
      }, [
        G(je, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, fc)) : z("", !0),
      G(pd, {
        multi: y(a).multi,
        index: y(a).index.value,
        n: y(a).n,
        review: y(a).inReview.value,
        "question-text": y(a).currentQuestion.value?.label ?? "",
        collapsed: y(a).collapsed.value,
        qid: s,
        onPrev: v[0] || (v[0] = ($) => y(a).go(y(a).index.value - 1, "first")),
        onNext: v[1] || (v[1] = ($) => y(a).go(y(a).index.value + 1, "first")),
        onToggleCollapse: R
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (p(), H(y(ye), {
        key: 4,
        id: P,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: ae(() => [
          j("div", mc, [
            j("span", {
              class: E(k.value)
            }, D(e.banner.message), 3),
            e.banner.retryable ? (p(), H(y(xe), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: v[2] || (v[2] = ($) => o("retry"))
            }, {
              default: ae(() => [...v[3] || (v[3] = [
                de(" Retry ", -1)
              ])]),
              _: 1
            })) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : z("", !0),
      y(a).collapsed.value ? z("", !0) : (p(), b(te, { key: 5 }, [
        y(a).inReview.value ? (p(), H(lc, {
          key: 0,
          definition: e.state.definition,
          controller: y(a),
          "card-error-ids": g.value,
          disabled: l.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : y(a).currentQuestion.value ? (p(), H(Kd, {
          key: 1,
          question: y(a).currentQuestion.value,
          controller: y(a),
          qid: s,
          stale: !!e.state.stale,
          "server-error": c(y(a).currentQuestion.value.id),
          "card-error-ids": g.value,
          disabled: l.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : z("", !0)
      ], 64)),
      j("p", hc, D(y(a).liveMessage.value), 1)
    ], 42, uc));
  }
}), yc = ["part", "aria-label"], wc = ["part"], xc = ["part"], kc = ["part"], _c = ["part"], $c = ["part"], Sc = ["part"], Pc = ["part"], Cc = ["part"], Tc = { key: 0 }, Oc = { key: 1 }, Ac = { key: 2 }, Ec = { key: 3 }, jc = { key: 4 }, Lc = /* @__PURE__ */ fe({
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
    const o = S(() => V("card", "answered")), a = S(() => V("title")), l = S(() => V("form-description")), s = S(() => V("summary")), i = S(() => V("summary-item")), u = S(() => V("summary-question")), d = S(() => V("summary-answer")), c = S(() => V("answer-empty")), f = S(() => V("status"));
    function m(P) {
      const g = n.state.definition.fields.find((k) => k.id === P);
      return g ? Wr(g, n.state.data ? n.state.data[P] : void 0) : null;
    }
    const x = M(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        x.value?.focus();
      }
    }), (P, g) => (p(), b("section", {
      part: o.value.part,
      class: E(`w-form ${o.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      j("p", {
        part: a.value.part,
        class: E(a.value.class)
      }, [
        G(y(we), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        de(" " + D(e.state.definition.title), 1)
      ], 10, wc),
      e.state.definition.description ? (p(), b("p", {
        key: 0,
        part: l.value.part,
        class: E(l.value.class)
      }, [
        G(je, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, xc)) : z("", !0),
      j("dl", {
        part: s.value.part,
        class: E(s.value.class)
      }, [
        (p(!0), b(te, null, he(e.state.definition.fields, (k) => (p(), b("div", {
          key: k.id,
          part: i.value.part,
          class: E(i.value.class)
        }, [
          j("dt", {
            part: u.value.part,
            class: E(u.value.class)
          }, [
            G(je, {
              text: k.label
            }, null, 8, ["text"])
          ], 10, $c),
          j("dd", {
            part: d.value.part,
            class: E(d.value.class)
          }, [
            m(k.id) ? (p(), H(Zr, {
              key: 0,
              items: m(k.id)
            }, null, 8, ["items"])) : (p(), b("span", {
              key: 1,
              part: c.value.part,
              class: E(c.value.class)
            }, "Skipped", 10, Pc))
          ], 10, Sc)
        ], 10, _c))), 128))
      ], 10, kc),
      j("div", {
        ref_key: "statusEl",
        ref: x,
        tabindex: "-1",
        part: f.value.part,
        class: E(f.value.class)
      }, [
        e.state.late ? (p(), b("p", Tc, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : z("", !0),
        e.state.delivery === "pending" ? (p(), b("p", Oc, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), b("p", Ac, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), b("p", Ec, " The assistant stopped before answering. Send a message to continue. ")) : z("", !0),
        r(e.state.submitted_at) ? (p(), b("p", jc, " Answered " + D(r(e.state.submitted_at)), 1)) : z("", !0)
      ], 10, Cc)
    ], 10, yc));
  }
}), Nc = { class: "p-3 max-w-full min-w-0" }, Ic = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, zc = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Rc = {
  key: 6,
  "no-bg": "",
  title: "Loading form…"
}, Vc = { class: "flex items-center gap-2" }, Bc = "Could not refresh this form. Showing what you last saw.", Fc = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", sr = 1, Dc = /* @__PURE__ */ fe({
  __name: "wippy-form",
  setup(e) {
    const t = Vs(), n = Fs(), r = Bs(), o = Js(), a = S(() => t.value.definition), l = S(() => t.value.state), s = S(() => l.value === "idle"), { status: i, state: u, errorMessage: d, reloadError: c, reload: f, refresh: m } = Ws(o, l);
    qs(u, m);
    const { submitting: x, submit: P } = Xs(o), { isOnline: g } = tl(() => f()), k = M(null), L = M(!1);
    oe(o, () => {
      L.value = !1;
    });
    const _ = M(null), h = M(null);
    let C = !1;
    oe(() => u.value?.status, (U, F) => {
      if (U !== "idle" || F !== "active")
        return;
      if (C) {
        C = !1;
        return;
      }
      (_.value?.hasUnsentInput?.() ?? !0) && (L.value = !0);
    });
    const A = S(() => {
      const U = t.value.formVersion;
      if (U !== void 0 && U !== sr)
        return !0;
      const F = u.value?.form_version;
      return F !== void 0 && F !== sr;
    }), q = S(() => {
      const U = a.value?.fields;
      return !!U && U.length > 0 && U.every((F) => F.type === "choice");
    }), R = M("active"), T = M(!1), w = S(() => A.value || i.value === "unsupported" ? "unsupported" : u.value === null ? "loading" : u.value.status === "idle" ? "answered" : q.value ? R.value : "active"), v = S(() => !A.value && q.value && u.value?.status === "active" && T.value);
    el(w, v);
    async function $(U) {
      if (!u.value)
        return;
      k.value = null;
      const F = await P(u.value.form_version, u.value.content_version, U);
      if (!F.ignored) {
        if (F.ok && F.accepted) {
          const J = F.accepted;
          C = !0, u.value = {
            ...u.value,
            status: "idle",
            stale: !1,
            late: J.late,
            content_version: J.content_version,
            data: U,
            answer_message_id: J.answer_message_id,
            delivery: J.delivery
          }, r("answer-submitted", { requestId: J.request_id, answerMessageId: J.answer_message_id, late: J.late }), ze(() => h.value?.focusStatus()), f();
          return;
        }
        if (F.fieldErrors || F.formErrors) {
          _.value?.setServerErrors(F.fieldErrors, F.formErrors);
          return;
        }
        if (F.code === "already_submitted") {
          L.value = !0, await m(), ze(() => h.value?.focusStatus());
          return;
        }
        F.shouldReload && f(), k.value = { message: F.message ?? "Could not submit this form.", retryable: F.retryable };
      }
    }
    function I() {
      _.value?.retry();
    }
    return (U, F) => (p(), b("div", Nc, [
      y(n).length > 0 ? (p(), H(y(ye), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          j("span", {
            class: E(y($e))
          }, "Invalid form configuration.", 2)
        ]),
        _: 1
      })) : a.value ? A.value ? (p(), H(y(ye), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: ae(() => [
          j("span", {
            class: E(y(Rt))
          }, "This form needs a newer version of the app.", 2)
        ]),
        _: 1
      })) : y(i) === "unsupported" ? (p(), H(Yu, {
        key: 3,
        definition: a.value,
        answered: s.value
      }, null, 8, ["definition", "answered"])) : y(o) ? y(u) ? (p(), b(te, { key: 5 }, [
        y(c) ? (p(), b("p", Ic, D(Bc))) : z("", !0),
        y(u).status === "active" && q.value ? (p(), H(gc, {
          key: y(o),
          ref_key: "activeFormRef",
          ref: _,
          state: y(u),
          submitting: y(x),
          banner: k.value,
          offline: !y(g),
          onSubmit: $,
          onRetry: I,
          "onUpdate:state": F[0] || (F[0] = (J) => {
            R.value = J;
          }),
          "onUpdate:collapsed": F[1] || (F[1] = (J) => {
            T.value = J;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : y(u).status === "active" ? (p(), H(Nu, {
          key: y(o),
          ref_key: "activeFormRef",
          ref: _,
          state: y(u),
          submitting: y(x),
          banner: k.value,
          offline: !y(g),
          onSubmit: $,
          onRetry: I
        }, null, 8, ["state", "submitting", "banner", "offline"])) : y(u).status === "idle" ? (p(), b(te, { key: 3 }, [
          L.value ? (p(), b("p", zc, D(Fc))) : z("", !0),
          q.value ? (p(), H(Lc, {
            key: y(o),
            ref_key: "idleFormRef",
            ref: h,
            state: y(u)
          }, null, 8, ["state"])) : (p(), H(Uu, {
            key: y(o),
            ref_key: "idleFormRef",
            ref: h,
            state: y(u)
          }, null, 8, ["state"]))
        ], 64)) : z("", !0)
      ], 64)) : y(i) === "loading" || y(i) === "idle" ? (p(), b("wippy-loading", Rc)) : y(i) === "error" ? (p(), H(y(ye), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          j("div", Vc, [
            j("span", {
              class: E(y($e))
            }, D(y(d) || "Could not load this form."), 3),
            G(y(xe), {
              type: "button",
              link: "",
              size: "small",
              onClick: y(f)
            }, {
              default: ae(() => [...F[2] || (F[2] = [
                de(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : z("", !0) : (p(), H(ed, {
        key: 4,
        definition: a.value
      }, null, 8, ["definition"])) : (p(), H(y(ye), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: ae(() => [
          j("span", {
            class: E(y($e))
          }, "This form has no definition to render.", 2)
        ]),
        _: 1
      }))
    ]));
  }
}), Mc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.container{width:100%}@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1280px}}@media(min-width:1536px){.container{max-width:1536px}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.relative{position:relative}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.table{display:table}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border{border-width:1px}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-danger{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-500) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-500) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn-700{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-700) calc(100% * var(--tw-text-opacity, 1)),transparent)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.blur{--tw-blur: blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class qc extends qi {
  static get wippyConfig() {
    return {
      propsSchema: Wi.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Mc
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Dc,
      plugins: [bi],
      providers(t, n) {
        t.provide(bn, n);
      }
    };
  }
}
$o(import.meta.url, qc);
//# sourceMappingURL=index.js.map
