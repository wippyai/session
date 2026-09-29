import { ref as V, readonly as Vr, getCurrentInstance as bn, onMounted as en, nextTick as tn, watch as Y, reactive as yo, renderSlot as q, openBlock as k, createBlock as M, Teleport as wo, createCommentVNode as N, useId as ko, mergeProps as T, h as It, defineComponent as je, shallowRef as zr, onUnmounted as nn, createApp as Fr, inject as St, createElementBlock as _, createElementVNode as j, resolveComponent as Fe, resolveDirective as xo, Transition as Mr, withCtx as de, normalizeClass as bt, resolveDynamicComponent as So, withDirectives as $o, createTextVNode as fe, toDisplayString as F, computed as ce, Fragment as re, renderList as we, createVNode as le, unref as C, withModifiers as Br } from "vue";
import * as _o from "@wippy-fe/proxy";
import { config as gn, addIcons as Dr, on as Co, applyThemeMode as at, host as Ur, hostCss as Hr, loadCss as Wr, define as qr } from "@wippy-fe/proxy";
import { getActivePinia as Kr, createPinia as Gr, setActivePinia as Yr } from "pinia";
var Qr = Object.defineProperty, vn = Object.getOwnPropertySymbols, Zr = Object.prototype.hasOwnProperty, Jr = Object.prototype.propertyIsEnumerable, yn = (e, t, n) => t in e ? Qr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Xr = (e, t) => {
  for (var n in t || (t = {})) Zr.call(t, n) && yn(e, n, t[n]);
  if (vn) for (var n of vn(t)) Jr.call(t, n) && yn(e, n, t[n]);
  return e;
};
function Se(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Lt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let o = Array.isArray(e), r = Array.isArray(t), i, a, l;
  if (o && r) {
    if (a = e.length, a != t.length) return !1;
    for (i = a; i-- !== 0; ) if (!Lt(e[i], t[i], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let s = e instanceof Date, c = t instanceof Date;
  if (s != c) return !1;
  if (s && c) return e.getTime() == t.getTime();
  let u = e instanceof RegExp, d = t instanceof RegExp;
  if (u != d) return !1;
  if (u && d) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (a = p.length, a !== Object.keys(t).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = p[i], !Lt(e[l], t[l], n)) return !1;
  return !0;
}
function ei(e, t) {
  return Lt(e, t);
}
function on(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function R(e) {
  return !Se(e);
}
function wn(e, t) {
  return null;
}
function rn(e, t, n) {
  return n ? wn() === wn() : ei(e, t);
}
function ti(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (rn(e, n)) return !0;
  }
  return !1;
}
function te(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Po(e = {}, t = {}) {
  let n = Xr({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    te(t[r]) && r in e && te(e[r]) ? n[r] = Po(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function ni(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : Po(t, n), {});
}
function G(e, ...t) {
  return on(e) ? e(...t) : e;
}
function K(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ee(e) {
  return K(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function an(e, t = "", n = {}) {
  let o = ee(t).split("."), r = o.shift();
  if (r) {
    if (te(e)) {
      let i = Object.keys(e).find((a) => ee(a) === r) || "";
      return an(G(e[i], n), o.join("."), n);
    }
    return;
  }
  return G(e, n);
}
function To(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function oi(e) {
  return R(e) && !isNaN(e);
}
function ke(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function ri(...e) {
  return ni(...e);
}
function ze(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function ii(e) {
  return K(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Oo(e) {
  return K(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Ao() {
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
function ie(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let i = Array.isArray(o) ? [ie(...o)] : Object.entries(o).map(([a, l]) => l ? a : void 0);
        t = i.length ? t.concat(i.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function ai(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function si(e, t) {
  if (e && t) {
    let n = (o) => {
      ai(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Pt(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function kn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function li(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function ci(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function ui(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && ci(e));
}
function ot(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function gt(e, t = {}) {
  if (ot(e)) {
    let n = (o, r) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[o] ? [(a = e?.$attrs) == null ? void 0 : a[o]] : [];
      return [r].flat().reduce((s, c) => {
        if (c != null) {
          let u = typeof c;
          if (u === "string" || u === "number") s.push(c);
          else if (u === "object") {
            let d = Array.isArray(c) ? n(o, c) : Object.entries(c).map(([p, f]) => o === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            s = d.length ? s.concat(d.filter((p) => !!p)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let i = o.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? gt(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function di(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return gt(o, t), o.append(...n), o;
  }
}
function pi(e, t) {
  return ot(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function fi(e, t) {
  if (ot(e)) {
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
function hi(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || kn(document.documentElement) || kn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function mi(e, t) {
  return e ? e.offsetHeight : 0;
}
function Sn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Eo() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function bi(e, t = "", n) {
  ot(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var st = {};
function gi(e = "pui_id_") {
  return Object.hasOwn(st, e) || (st[e] = 0), st[e]++, `${e}${st[e]}`;
}
var vi = Object.defineProperty, yi = Object.defineProperties, wi = Object.getOwnPropertyDescriptors, vt = Object.getOwnPropertySymbols, jo = Object.prototype.hasOwnProperty, Io = Object.prototype.propertyIsEnumerable, $n = (e, t, n) => t in e ? vi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Z = (e, t) => {
  for (var n in t || (t = {})) jo.call(t, n) && $n(e, n, t[n]);
  if (vt) for (var n of vt(t)) Io.call(t, n) && $n(e, n, t[n]);
  return e;
}, Tt = (e, t) => yi(e, wi(t)), oe = (e, t) => {
  var n = {};
  for (var o in e) jo.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && vt) for (var o of vt(e)) t.indexOf(o) < 0 && Io.call(e, o) && (n[o] = e[o]);
  return n;
}, ki = Ao(), B = ki, Me = /{([^}]*)}/g, Lo = /(\d+\s+[\+\-\*\/]\s+\d+)/g, No = /var\([^)]+\)/g;
function _n(e) {
  return K(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function xi(e) {
  return te(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Si(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Nt(e = "", t = "") {
  return Si(`${K(e, !1) && K(t, !1) ? `${e}-` : e}${t}`);
}
function Ro(e = "", t = "") {
  return `--${Nt(e, t)}`;
}
function $i(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Vo(e, t = "", n = "", o = [], r) {
  if (K(e)) {
    let i = e.trim();
    if ($i(i)) return;
    if (ke(i, Me)) {
      let a = i.replaceAll(Me, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !o.some((u) => ke(c, u)));
        return `var(${Ro(n, Oo(s.join("-")))}${R(r) ? `, ${r}` : ""})`;
      });
      return ke(a.replace(No, "0"), Lo) ? `calc(${a})` : a;
    }
    return i;
  } else if (oi(e)) return e;
}
function _i(e, t, n) {
  K(t, !1) && e.push(`${t}:${n};`);
}
function Oe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function zo(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let s = [], c = 0, u = "", d = null, p = 0;
    for (; c <= a.length; ) {
      let f = a[c];
      if ((f === '"' || f === "'" || f === "`") && a[c - 1] !== "\\" && (d = d === f ? null : f), !d && (f === "(" && p++, f === ")" && p--, (f === "," || c === a.length) && p === 0)) {
        let m = u.trim();
        m.startsWith("dt(") ? s.push(zo(m, l)) : s.push(o(m)), u = "", c++;
        continue;
      }
      f !== void 0 && (u += f), c++;
    }
    return s;
  }
  function o(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let r = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && r.push([l, a]);
  }
  if (!r.length) return e;
  for (let a = r.length - 1; a >= 0; a--) {
    let [l, s] = r[a], c = e.slice(l + 3, s), u = n(c, t), d = t(...u);
    e = e.slice(0, l) + d + e.slice(s + 1);
  }
  return e;
}
var xe = (...e) => Ci(I.getTheme(), ...e), Ci = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: i } = I.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = ke(t, Me) ? t : `{${t}}`;
    return o === "value" || Se(o) && l === "strict" ? I.getTokenValue(t) : Vo(s, void 0, a, [r.excludedKeyRegex], n);
  }
  return "";
};
function lt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, i) => {
      var a;
      return o + r + ((a = G(t[i], { dt: xe })) != null ? a : "");
    }, "");
    return zo(n, xe);
  }
  return G(e, { dt: xe });
}
function Pi(e, t = {}) {
  let n = I.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: o }];
  for (; s.length; ) {
    let { node: u, path: d } = s.pop();
    for (let p in u) {
      let f = u[p], m = xi(f), b = ke(p, i) ? Nt(d) : Nt(d, Oo(p));
      if (te(m)) s.push({ node: m, path: b });
      else {
        let h = Ro(b), w = Vo(m, b, o, [i]);
        _i(l, h, w);
        let y = b;
        o && y.startsWith(o + "-") && (y = y.slice(o.length + 1)), a.push(y.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: a, declarations: c, css: Oe(r, c) };
}
var Q = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return Pi(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var i, a, l, s, c, u, d;
  let { preset: p, options: f } = t, m, b, h, w, y, $, v;
  if (R(p) && f.transform !== "strict") {
    let { primitive: g, semantic: S, extend: x } = p, O = S || {}, { colorScheme: U } = O, H = oe(O, ["colorScheme"]), ae = x || {}, { colorScheme: he } = ae, me = oe(ae, ["colorScheme"]), se = U || {}, { dark: be } = se, $e = oe(se, ["dark"]), ge = he || {}, { dark: _e } = ge, Ce = oe(ge, ["dark"]), ne = R(g) ? this._toVariables({ primitive: g }, f) : {}, J = R(H) ? this._toVariables({ semantic: H }, f) : {}, ve = R($e) ? this._toVariables({ light: $e }, f) : {}, it = R(be) ? this._toVariables({ dark: be }, f) : {}, Pe = R(me) ? this._toVariables({ semantic: me }, f) : {}, hn = R(Ce) ? this._toVariables({ light: Ce }, f) : {}, mn = R(_e) ? this._toVariables({ dark: _e }, f) : {}, [yr, wr] = [(i = ne.declarations) != null ? i : "", ne.tokens], [kr, xr] = [(a = J.declarations) != null ? a : "", J.tokens || []], [Sr, $r] = [(l = ve.declarations) != null ? l : "", ve.tokens || []], [_r, Cr] = [(s = it.declarations) != null ? s : "", it.tokens || []], [Pr, Tr] = [(c = Pe.declarations) != null ? c : "", Pe.tokens || []], [Or, Ar] = [(u = hn.declarations) != null ? u : "", hn.tokens || []], [Er, jr] = [(d = mn.declarations) != null ? d : "", mn.tokens || []];
    m = this.transformCSS(e, yr, "light", "variable", f, o, r), b = wr;
    let Ir = this.transformCSS(e, `${kr}${Sr}`, "light", "variable", f, o, r), Lr = this.transformCSS(e, `${_r}`, "dark", "variable", f, o, r);
    h = `${Ir}${Lr}`, w = [.../* @__PURE__ */ new Set([...xr, ...$r, ...Cr])];
    let Nr = this.transformCSS(e, `${Pr}${Or}color-scheme:light`, "light", "variable", f, o, r), Rr = this.transformCSS(e, `${Er}color-scheme:dark`, "dark", "variable", f, o, r);
    y = `${Nr}${Rr}`, $ = [.../* @__PURE__ */ new Set([...Tr, ...Ar, ...jr])], v = G(p.css, { dt: xe });
  }
  return { primitive: { css: m, tokens: b }, semantic: { css: h, tokens: w }, global: { css: y, tokens: $ }, style: v };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: i, selector: a }) {
  var l, s, c;
  let u, d, p;
  if (R(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), m = t, { colorScheme: b, extend: h, css: w } = m, y = oe(m, ["colorScheme", "extend", "css"]), $ = h || {}, { colorScheme: v } = $, g = oe($, ["colorScheme"]), S = b || {}, { dark: x } = S, O = oe(S, ["dark"]), U = v || {}, { dark: H } = U, ae = oe(U, ["dark"]), he = R(y) ? this._toVariables({ [f]: Z(Z({}, y), g) }, n) : {}, me = R(O) ? this._toVariables({ [f]: Z(Z({}, O), ae) }, n) : {}, se = R(x) ? this._toVariables({ [f]: Z(Z({}, x), H) }, n) : {}, [be, $e] = [(l = he.declarations) != null ? l : "", he.tokens || []], [ge, _e] = [(s = me.declarations) != null ? s : "", me.tokens || []], [Ce, ne] = [(c = se.declarations) != null ? c : "", se.tokens || []], J = this.transformCSS(f, `${be}${ge}`, "light", "variable", n, r, i, a), ve = this.transformCSS(f, Ce, "dark", "variable", n, r, i, a);
    u = `${J}${ve}`, d = [.../* @__PURE__ */ new Set([...$e, ..._e, ...ne])], p = G(w, { dt: xe });
  }
  return { css: u, tokens: d, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: n, set: o, defaults: r });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: c } = t, u = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: u, options: c, params: n, set: o, defaults: r });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: r } = t;
  return r ? `@layer ${G(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: i }), l = Object.entries(o).reduce((s, [c, u]) => s.push(`${c}="${u}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [c, u]) => {
    if (te(u) && Object.hasOwn(u, "css")) {
      let d = ze(u.css), p = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${d}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: n, set: r, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, c = Object.entries(o).reduce((u, [d, p]) => u.push(`${d}="${p}"`) && u, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${ze(s)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let i = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let u = this.value;
    if (typeof this.value == "string" && Me.test(this.value)) {
      let d = this.value.trim().replace(Me, (p) => {
        var f;
        let m = p.slice(1, -1), b = this.tokens[m];
        if (!b) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let h = b.computed(l, s, c);
        return Array.isArray(h) && h.length === 2 ? `light-dark(${h[0].value},${h[1].value})` : (f = h?.value) != null ? f : "__UNRESOLVED__";
      });
      u = Lo.test(d.replace(No, "0")) ? `calc(${d})` : d;
    }
    return Se(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: u.includes("__UNRESOLVED__") ? void 0 : u };
  }, a = (l, s, c) => {
    Object.entries(l).forEach(([u, d]) => {
      let p = ke(u, t.variable.excludedKeyRegex) ? s : s ? `${s}.${_n(u)}` : _n(u), f = c ? `${c}.${u}` : u;
      te(d) ? a(d, p, f) : (r[p] || (r[p] = { paths: [], computed: (m, b = {}, h = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, b.binding, h);
        if (m && m !== "none") for (let w = 0; w < r[p].paths.length; w++) {
          let y = r[p].paths[w];
          if (y.scheme === m) return y.computed(m, b.binding, h);
        }
        return r[p].paths.map((w) => w.computed(w.scheme, b[w.scheme], h));
      } }), r[p].paths.push({ path: f, value: d, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: r }));
    });
  };
  return a(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((l) => l.split(".").filter((s) => !ke(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = e[r]) == null ? void 0 : o.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let c = s, { colorScheme: u } = c, d = oe(c, ["colorScheme"]);
    return l[u] = d, l;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? Oe(R(t) ? `${e}${t},${e} ${t}` : e, o) : Oe(e, Oe(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, i, a, l) {
  if (R(t)) {
    let { cssLayer: s } = r;
    if (o !== "style") {
      let c = this.getColorSchemeOption(r, a);
      t = n === "dark" ? c.reduce((u, { type: d, selector: p }) => (R(p) && (u += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, l, d, t)), u), "") : Oe(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      te(s) && (c.name = G(s.name, { name: e, type: o })), R(c.name) && (t = Oe(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, I = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Tt(Z({}, t), { options: Z(Z({}, this.defaults.options), t.options) }), this._tokens = Q.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), B.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Tt(Z({}, this.theme), { preset: e }), this._tokens = Q.createTokens(e, this.defaults), this.clearLoadedStyleNames(), B.emit("preset:change", e), B.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Tt(Z({}, this.theme), { options: e }), this.clearLoadedStyleNames(), B.emit("options:change", e), B.emit("theme:change", this.theme);
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
  return Q.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return Q.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Q.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return Q.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return Q.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return Q.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return Q.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), B.emit(`theme:${t}:load`, e), !this._loadingStyles.size && B.emit("theme:load"));
} }, D = {
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
}, Ti = `
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
function Be(e) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Be(e);
}
function Cn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Pn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(o) {
      Oi(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Oi(e, t, n) {
  return (t = Ai(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ai(e) {
  var t = Ei(e, "string");
  return Be(t) == "symbol" ? t : t + "";
}
function Ei(e, t) {
  if (Be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Be(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ji(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  bn() && bn().components ? en(e) : t ? e() : tn(e);
}
var Ii = 0;
function Li(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = V(!1), o = V(e), r = V(null), i = Eo() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, c = s === void 0 ? !0 : s, u = t.manual, d = u === void 0 ? !1 : u, p = t.name, f = p === void 0 ? "style_".concat(++Ii) : p, m = t.id, b = m === void 0 ? void 0 : m, h = t.media, w = h === void 0 ? void 0 : h, y = t.nonce, $ = y === void 0 ? void 0 : y, v = t.first, g = v === void 0 ? !1 : v, S = t.onMounted, x = S === void 0 ? void 0 : S, O = t.onUpdated, U = O === void 0 ? void 0 : O, H = t.onLoad, ae = H === void 0 ? void 0 : H, he = t.props, me = he === void 0 ? {} : he, se = function() {
  }, be = function(_e) {
    var Ce = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var ne = Pn(Pn({}, me), Ce), J = ne.name || f, ve = ne.id || b, it = ne.nonce || $;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(J, '"]')) || l.getElementById(ve) || l.createElement("style"), r.value.isConnected || (o.value = _e || e, gt(r.value, {
        type: "text/css",
        id: ve,
        media: w,
        nonce: it
      }), g ? l.head.prepend(r.value) : l.head.appendChild(r.value), bi(r.value, "data-primevue-style-id", J), gt(r.value, ne), r.value.onload = function(Pe) {
        return ae?.(Pe, {
          name: J
        });
      }, x?.(J)), !n.value && (se = Y(o, function(Pe) {
        r.value.textContent = Pe, U?.(J);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, $e = function() {
    !l || !n.value || (se(), ui(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return c && !d && ji(be), {
    id: b,
    name: f,
    el: r,
    css: o,
    unload: $e,
    load: be,
    isLoaded: Vr(n)
  };
}
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
var Tn, On, An, En;
function jn(e, t) {
  return zi(e) || Vi(e, t) || Ri(e, t) || Ni();
}
function Ni() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ri(e, t) {
  if (e) {
    if (typeof e == "string") return In(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? In(e, t) : void 0;
  }
}
function In(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Vi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (u) {
      c = !0, r = u;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function zi(e) {
  if (Array.isArray(e)) return e;
}
function Ln(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ot(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ln(Object(n), !0).forEach(function(o) {
      Fi(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Fi(e, t, n) {
  return (t = Mi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Mi(e) {
  var t = Bi(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function Bi(e, t) {
  if (De(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (De(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ct(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Di = function(t) {
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
}, Ui = {}, Hi = {}, L = {
  name: "base",
  css: Di,
  style: Ti,
  classes: Ui,
  inlineStyles: Hi,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, r = o(lt(Tn || (Tn = ct(["", ""])), t));
    return R(r) ? Li(ze(r), Ot({
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
      return I.transformCSS(n.name || t.name, "".concat(r).concat(lt(On || (On = ct(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return I.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return I.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return I.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return I.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return I.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = G(this.css, {
        dt: xe
      }) || "", r = ze(lt(An || (An = ct(["", "", ""])), o, t)), i = Object.entries(n).reduce(function(a, l) {
        var s = jn(l, 2), c = s[0], u = s[1];
        return a.push("".concat(c, '="').concat(u, '"')) && a;
      }, []).join(" ");
      return R(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return I.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [I.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = lt(En || (En = ct(["", ""])), G(this.style, {
        dt: xe
      })), a = ze(I.transformCSS(r, i)), l = Object.entries(n).reduce(function(s, c) {
        var u = jn(c, 2), d = u[0], p = u[1];
        return s.push("".concat(d, '="').concat(p, '"')) && s;
      }, []).join(" ");
      R(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Ot(Ot({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, pe = Ao();
function Ue(e) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ue(e);
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
function ut(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(o) {
      Wi(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Wi(e, t, n) {
  return (t = qi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qi(e) {
  var t = Ki(e, "string");
  return Ue(t) == "symbol" ? t : t + "";
}
function Ki(e, t) {
  if (Ue(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Gi = {
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
    text: [D.STARTS_WITH, D.CONTAINS, D.NOT_CONTAINS, D.ENDS_WITH, D.EQUALS, D.NOT_EQUALS],
    numeric: [D.EQUALS, D.NOT_EQUALS, D.LESS_THAN, D.LESS_THAN_OR_EQUAL_TO, D.GREATER_THAN, D.GREATER_THAN_OR_EQUAL_TO],
    date: [D.DATE_IS, D.DATE_IS_NOT, D.DATE_BEFORE, D.DATE_AFTER]
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
}, Yi = Symbol();
function Qi(e, t) {
  var n = {
    config: yo(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Yi, n), Zi(), Ji(e, n), n;
}
var Ae = [];
function Zi() {
  B.clear(), Ae.forEach(function(e) {
    return e?.();
  }), Ae = [];
}
function Ji(e, t) {
  var n = V(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !I.isStyleNameLoaded("common")) {
      var u, d, p = ((u = L.getCommonTheme) === null || u === void 0 ? void 0 : u.call(L)) || {}, f = p.primitive, m = p.semantic, b = p.global, h = p.style, w = {
        nonce: (d = t.config) === null || d === void 0 || (d = d.csp) === null || d === void 0 ? void 0 : d.nonce
      };
      L.load(f?.css, ut({
        name: "primitive-variables"
      }, w)), L.load(m?.css, ut({
        name: "semantic-variables"
      }, w)), L.load(b?.css, ut({
        name: "global-variables"
      }, w)), L.loadStyle(ut({
        name: "global-style"
      }, w), h), I.setLoadedStyleName("common");
    }
  };
  B.on("theme:change", function(s) {
    n.value || (e.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var r = Y(t.config, function(s, c) {
    pe.emit("config:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = Y(function() {
    return t.config.ripple;
  }, function(s, c) {
    pe.emit("config:ripple:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Y(function() {
    return t.config.theme;
  }, function(s, c) {
    n.value || I.setTheme(s), t.config.unstyled || o(), n.value = !1, pe.emit("config:theme:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Y(function() {
    return t.config.unstyled;
  }, function(s, c) {
    !s && t.config.theme && o(), pe.emit("config:unstyled:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ae.push(r), Ae.push(i), Ae.push(a), Ae.push(l);
}
var Xi = {
  install: function(t, n) {
    var o = ri(Gi, n);
    Qi(t, o);
  }
}, Fo = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Eo();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ea(e, t, n, o, r, i) {
  return i.inline ? q(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (k(), M(wo, {
    key: 1,
    to: n.appendTo
  }, [q(e.$slots, "default")], 8, ["to"])) : N("", !0);
}
Fo.render = ea;
var ue = {
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
function ta() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = ko();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Rn = L.extend({
  name: "common"
});
function He(e) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, He(e);
}
function na(e) {
  return Do(e) || oa(e) || Bo(e) || Mo();
}
function oa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ie(e, t) {
  return Do(e) || ra(e, t) || Bo(e, t) || Mo();
}
function Mo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Bo(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(e, t) : void 0;
  }
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ra(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (u) {
      c = !0, r = u;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function Do(e) {
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
function A(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vn(Object(n), !0).forEach(function(o) {
      Ve(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ve(e, t, n) {
  return (t = ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ia(e) {
  var t = aa(e, "string");
  return He(t) == "symbol" ? t : t + "";
}
function aa(e, t) {
  if (He(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (He(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var rt = {
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
        B.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        B.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, o, r, i, a, l, s, c, u, d, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = m || f) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (i = r.onBeforeCreate) === null || i === void 0 || i.call(r);
    var b = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, h = b ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, w = b ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (u = w || h) === null || u === void 0 || (u = u[this.$.type.name]) === null || u === void 0 || (u = u.hooks) === null || u === void 0 || (d = u.onBeforeCreate) === null || d === void 0 || d.call(u), this.$attrSelector = ta(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = pi(ot(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = A({
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
      return on(t) ? t.apply(void 0, o) : T.apply(void 0, o);
    },
    _load: function() {
      ue.isStyleNameLoaded("base") || (L.loadCSS(this.$styleOptions), this._loadGlobalStyles(), ue.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !ue.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Rn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), ue.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      R(t) && L.load(t, A({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!I.isStyleNameLoaded("common")) {
          var o, r, i = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, a = i.primitive, l = i.semantic, s = i.global, c = i.style;
          L.load(a?.css, A({
            name: "primitive-variables"
          }, this.$styleOptions)), L.load(l?.css, A({
            name: "semantic-variables"
          }, this.$styleOptions)), L.load(s?.css, A({
            name: "global-variables"
          }, this.$styleOptions)), L.loadStyle(A({
            name: "global-style"
          }, this.$styleOptions), c), I.setLoadedStyleName("common");
        }
        if (!I.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var u, d, p, f, m = ((u = this.$style) === null || u === void 0 || (d = u.getComponentTheme) === null || d === void 0 ? void 0 : d.call(u)) || {}, b = m.css, h = m.style;
          (p = this.$style) === null || p === void 0 || p.load(b, A({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(A({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), h), I.setLoadedStyleName(this.$style.name);
        }
        if (!I.isStyleNameLoaded("layer-order")) {
          var w, y, $ = (w = this.$style) === null || w === void 0 || (y = w.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(w);
          L.load($, A({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), I.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, i = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(a, A({
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
      ue.clearLoadedStyleNames(), B.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      B.off("theme:change", this._loadCoreStyles), B.off("theme:change", this._load), B.off("theme:change", this._themeScopedListener);
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
      return an(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(o) && !!r[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, c = s === void 0 ? !0 : s, u = l.mergeProps, d = u === void 0 ? !1 : u, p = i ? a ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, A(A({}, r), {}, {
        global: p || {}
      })), m = this._getPTDatasets(o);
      return c || !c && f ? d ? this._mergeProps(d, p, f, m) : A(A(A({}, p), f), m) : A(A({}, f), m);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return T(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", i = o === "root" && R((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && A(A({}, o === "root" && A(A(Ve({}, "".concat(r, "name"), ee(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Ve({}, "".concat(r, "extend"), ee(this.$.type.name))), {}, Ve({}, "".concat(this.$attrSelector), ""))), {}, Ve({}, "".concat(r, "section"), ee(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return K(t) || To(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var s, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, u = r ? r(l) : l, d = ee(o), p = ee(n.$name);
        return (s = c ? d !== p ? u?.[d] : void 0 : u?.[d]) !== null && s !== void 0 ? s : u;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var i = function(b) {
        return n(b, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, c = s === void 0 ? !0 : s, u = l.mergeProps, d = u === void 0 ? !1 : u, p = i(t.originalValue), f = i(t.value);
        return p === void 0 && f === void 0 ? void 0 : K(f) ? f : K(p) ? p : c || !c && f ? d ? this._mergeProps(d, p, f) : A(A({}, p), f) : f;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, A(A({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = T(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, A({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, A(A({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, A(A({}, this.$params), o)), i = this._getOptionValue(Rn.inlineStyles, t, A(A({}, this.$params), o));
        return [i, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return G(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, A({}, n.$params)) || G(o, A({}, n.$params));
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
        var r = Ie(o, 1), i = r[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return A(A({
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
        var n = Ie(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = Ie(n, 2), r = o[0], i = o[1], a = r.split(":"), l = na(a), s = Rt(l).slice(1);
        return s?.reduce(function(c, u, d, p) {
          return !c[u] && (c[u] = d === p.length - 1 ? i : {}), c[u];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ie(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = Ie(n, 2), r = o[0], i = o[1];
        return t[r] = i, t;
      }, {});
    }
  }
}, sa = `
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
`, la = L.extend({
  name: "baseicon",
  css: sa
});
function We(e) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, We(e);
}
function zn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Fn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(o) {
      ca(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function ca(e, t, n) {
  return (t = ua(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ua(e) {
  var t = da(e, "string");
  return We(t) == "symbol" ? t : t + "";
}
function da(e, t) {
  if (We(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (We(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $t = {
  name: "BaseIcon",
  extends: rt,
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
  style: la,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Se(this.label);
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
function qe(e) {
  "@babel/helpers - typeof";
  return qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, qe(e);
}
function Mn(e, t) {
  return ma(e) || ha(e, t) || fa(e, t) || pa();
}
function pa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fa(e, t) {
  if (e) {
    if (typeof e == "string") return Bn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bn(e, t) : void 0;
  }
}
function Bn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ha(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (o = i.call(n)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (u) {
      c = !0, r = u;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw r;
      }
    }
    return l;
  }
}
function ma(e) {
  if (Array.isArray(e)) return e;
}
function Dn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function E(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Dn(Object(n), !0).forEach(function(o) {
      Vt(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Dn(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Vt(e, t, n) {
  return (t = ba(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ba(e) {
  var t = ga(e, "string");
  return qe(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var P = {
  _getMeta: function() {
    return [te(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], G(te(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, i;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: an,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var y = P._getOptionValue.apply(P, arguments);
      return K(y) || To(y) ? {
        class: y
      } : y;
    }, c = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, u = c.mergeSections, d = u === void 0 ? !0 : u, p = c.mergeProps, f = p === void 0 ? !1 : p, m = l ? P._useDefaultPT(o, o.defaultPT(), s, i, a) : void 0, b = P._usePT(o, P._getPT(r, o.$name), s, i, E(E({}, a), {}, {
      global: m || {}
    })), h = P._getPTDatasets(o, i);
    return d || !d && b ? f ? P._mergeProps(o, f, m, b, h) : E(E(E({}, m), b), h) : E(E({}, b), h);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return E(E({}, n === "root" && Vt({}, "".concat(o, "name"), ee(t.$name))), {}, Vt({}, "".concat(o, "section"), ee(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(a) {
      var l, s = o ? o(a) : a, c = ee(n);
      return (l = s?.[c]) !== null && l !== void 0 ? l : s;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, a = function(h) {
      return o(h, r, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, c = s.mergeSections, u = c === void 0 ? !0 : c, d = s.mergeProps, p = d === void 0 ? !1 : d, f = a(n.originalValue), m = a(n.value);
      return f === void 0 && m === void 0 ? void 0 : K(m) ? m : K(f) ? f : u || !u && m ? p ? P._mergeProps(t, p, f, m) : E(E({}, f), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return P._usePT(t, n, o, r, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = P._getConfig(o, r), a = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    P._loadCoreStyles(n, a), P._loadThemeStyles(n, a), P._loadScopedThemeStyles(n, a), P._removeThemeListeners(n), n.$loadStyles = function() {
      return P._loadThemeStyles(n, a);
    }, P._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!ue.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var i;
      L.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), ue.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!I.isStyleNameLoaded("common")) {
        var a, l, s = ((a = r.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, c = s.primitive, u = s.semantic, d = s.global, p = s.style;
        L.load(c?.css, E({
          name: "primitive-variables"
        }, i)), L.load(u?.css, E({
          name: "semantic-variables"
        }, i)), L.load(d?.css, E({
          name: "global-variables"
        }, i)), L.loadStyle(E({
          name: "global-style"
        }, i), p), I.setLoadedStyleName("common");
      }
      if (!I.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var f, m, b, h, w = ((f = r.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, y = w.css, $ = w.style;
        (b = r.$style) === null || b === void 0 || b.load(y, E({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (h = r.$style) === null || h === void 0 || h.loadStyle(E({
          name: "".concat(r.$style.name, "-style")
        }, i), $), I.setLoadedStyleName(r.$style.name);
      }
      if (!I.isStyleNameLoaded("layer-order")) {
        var v, g, S = (v = r.$style) === null || v === void 0 || (g = v.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(v);
        L.load(S, E({
          name: "layer-order",
          first: !0
        }, i)), I.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, i, a, l = ((r = t.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, s = l.css, c = (a = t.$style) === null || a === void 0 ? void 0 : a.load(s, E({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    ue.clearLoadedStyleNames(), B.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    B.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, i, a) {
    var l, s, c = "on".concat(ii(n)), u = P._getConfig(r, i), d = o?.$instance, p = P._usePT(d, P._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, t), P._getOptionValue, "hooks.".concat(c)), f = P._useDefaultPT(d, u == null || (s = u.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[t], P._getOptionValue, "hooks.".concat(c)), m = {
      el: o,
      binding: r,
      vnode: i,
      prevVnode: a
    };
    p?.(d, m), f?.(d, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return on(t) ? t.apply(void 0, o) : T.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(l, s, c, u, d) {
      var p, f, m, b;
      s._$instances = s._$instances || {};
      var h = P._getConfig(c, u), w = s._$instances[t] || {}, y = Se(w) ? E(E({}, n), n?.methods) : {};
      s._$instances[t] = E(E({}, w), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: s,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: w.$el || s || void 0,
        $style: E({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: h,
        $attrSelector: (p = s.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return P._getPT(h?.pt, void 0, function(v) {
            var g;
            return v == null || (g = v.directives) === null || g === void 0 ? void 0 : g[t];
          });
        },
        isUnstyled: function() {
          var v, g;
          return ((v = s._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.unstyled) !== void 0 ? (g = s._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : h?.unstyled;
        },
        theme: function() {
          var v;
          return (v = s._$instances[t]) === null || v === void 0 || (v = v.$primevueConfig) === null || v === void 0 ? void 0 : v.theme;
        },
        preset: function() {
          var v;
          return (v = s._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.dt;
        },
        /* instance's methods */
        ptm: function() {
          var v, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return P._getPTValue(s._$instances[t], (v = s._$instances[t]) === null || v === void 0 || (v = v.$binding) === null || v === void 0 || (v = v.value) === null || v === void 0 ? void 0 : v.pt, g, E({}, S));
        },
        ptmo: function() {
          var v = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", S = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P._getPTValue(s._$instances[t], v, g, S, !1);
        },
        cx: function() {
          var v, g, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (v = s._$instances[t]) !== null && v !== void 0 && v.isUnstyled() ? void 0 : P._getOptionValue((g = s._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, S, E({}, x));
        },
        sx: function() {
          var v, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, x = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S ? P._getOptionValue((v = s._$instances[t]) === null || v === void 0 || (v = v.$style) === null || v === void 0 ? void 0 : v.inlineStyles, g, E({}, x)) : void 0;
        }
      }, y), s.$instance = s._$instances[t], (f = (m = s.$instance)[l]) === null || f === void 0 || f.call(m, s, c, u, d), s["$".concat(t)] = s.$instance, P._hook(t, l, s, c, u, d), s.$pd || (s.$pd = {}), s.$pd[t] = E(E({}, (b = s.$pd) === null || b === void 0 ? void 0 : b[t]), {}, {
        name: t,
        instance: s._$instances[t]
      });
    }, r = function(l) {
      var s, c, u, d = l._$instances[t], p = d?.watch, f = function(h) {
        var w, y = h.newValue, $ = h.oldValue;
        return p == null || (w = p.config) === null || w === void 0 ? void 0 : w.call(d, y, $);
      }, m = function(h) {
        var w, y = h.newValue, $ = h.oldValue;
        return p == null || (w = p["config.ripple"]) === null || w === void 0 ? void 0 : w.call(d, y, $);
      };
      d.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (s = p.config) === null || s === void 0 || s.call(d, d?.$primevueConfig), pe.on("config:change", f), p == null || (c = p["config.ripple"]) === null || c === void 0 || c.call(d, d == null || (u = d.$primevueConfig) === null || u === void 0 ? void 0 : u.ripple), pe.on("config:ripple:change", m);
    }, i = function(l) {
      var s = l._$instances[t].$watchersCallback;
      s && (pe.off("config:change", s.config), pe.off("config:ripple:change", s["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, c, u) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: gi("pd")
        }, o("created", l, s, c, u);
      },
      beforeMount: function(l, s, c, u) {
        var d;
        P._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, s, c), o("beforeMount", l, s, c, u), r(l);
      },
      mounted: function(l, s, c, u) {
        var d;
        P._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, s, c), o("mounted", l, s, c, u);
      },
      beforeUpdate: function(l, s, c, u) {
        o("beforeUpdate", l, s, c, u);
      },
      updated: function(l, s, c, u) {
        var d;
        P._loadStyles((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance, s, c), o("updated", l, s, c, u);
      },
      beforeUnmount: function(l, s, c, u) {
        var d;
        i(l), P._removeThemeListeners((d = l.$pd[t]) === null || d === void 0 ? void 0 : d.instance), o("beforeUnmount", l, s, c, u);
      },
      unmounted: function(l, s, c, u) {
        var d;
        (d = l.$pd[t]) === null || d === void 0 || (d = d.instance) === null || d === void 0 || (d = d.scopedStyleEl) === null || d === void 0 || (d = d.value) === null || d === void 0 || d.remove(), o("unmounted", l, s, c, u);
      }
    };
  },
  extend: function() {
    var t = P._getMeta.apply(P, arguments), n = Mn(t, 2), o = n[0], r = n[1];
    return E({
      extend: function() {
        var a = P._getMeta.apply(P, arguments), l = Mn(a, 2), s = l[0], c = l[1];
        return P.extend(s, E(E(E({}, r), r?.methods), c));
      }
    }, P._extend(o, r));
  }
}, va = `
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
`, ya = {
  root: "p-ink"
}, wa = L.extend({
  name: "ripple-directive",
  style: va,
  classes: ya
}), ka = P.extend({
  style: wa
});
function Ke(e) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ke(e);
}
function xa(e) {
  return Ca(e) || _a(e) || $a(e) || Sa();
}
function Sa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(e, t) {
  if (e) {
    if (typeof e == "string") return zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(e, t) : void 0;
  }
}
function _a(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ca(e) {
  if (Array.isArray(e)) return zt(e);
}
function zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Un(e, t, n) {
  return (t = Pa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Pa(e) {
  var t = Ta(e, "string");
  return Ke(t) == "symbol" ? t : t + "";
}
function Ta(e, t) {
  if (Ke(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Uo = ka.extend("ripple", {
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
      n || (n = di("span", Un(Un({
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
        if (!this.isUnstyled() && Pt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !xn(r) && !Sn(r)) {
          var i = Math.max(li(o), mi(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var a = hi(o), l = t.pageX - a.left + document.body.scrollTop - Sn(r) / 2, s = t.pageY - a.top + document.body.scrollLeft - xn(r) / 2;
        r.style.top = s + "px", r.style.left = l + "px", !this.isUnstyled() && si(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Pt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Pt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? xa(t.children).find(function(n) {
        return fi(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Oa = "data-wippy-overlay-layer";
function Ho() {
  return typeof window < "u" && typeof window.document < "u";
}
function Wo() {
  return Ho() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Aa() {
  return Wo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const Ea = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ja = 0;
const yt = /* @__PURE__ */ new WeakMap();
function Hn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function Ia(e, t) {
  if (!Ea.test(e.className))
    return;
  const n = e.style.cssText;
  Hn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!yt.has(e)) {
    const o = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Hn(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), yt.set(e, o);
  }
}
function sn(e) {
  const t = yt.get(e);
  t && (t.disconnect(), yt.delete(e));
}
function La(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ft(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const wt = /* @__PURE__ */ new Set(), ln = /* @__PURE__ */ new WeakMap();
let Wn = !1, Mt = !1;
function Na() {
  Mt = !1;
  for (const e of wt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && sn(t);
      wt.delete(e), ln.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ft(e);
  }
}
function qn() {
  Mt || (Mt = !0, requestAnimationFrame(Na));
}
function Ra(e) {
  const t = document.createElement("div");
  t.setAttribute(Oa, "");
  const n = Wo();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ft(t);
  const o = new MutationObserver((r) => {
    const i = t.__wippyAnchorName;
    for (const a of r) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Ia(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && sn(l);
    }
    t.isConnected && t.childElementCount > 0 && Ft(t);
  });
  return o.observe(t, { childList: !0 }), ln.set(t, o), wt.add(t), Wn || (Wn = !0, window.addEventListener("scroll", qn, { capture: !0, passive: !0 }), window.addEventListener("resize", qn, { passive: !0 })), t;
}
function Kn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Ra(e.hostRoot), Aa())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ja}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Gn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && sn(t);
    wt.delete(e.layer), ln.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Yn = !1;
function Va() {
  if (Yn)
    return;
  Yn = !0;
  const e = Fo;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ho() && (this.hostRoot = La(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Kn(this), this.$watch("inline", (t) => {
      t ? Gn(this) : Kn(this);
    })));
  }, e.render = function() {
    return this.inline ? q(this.$slots, "default", { key: 0 }) : this.mounted ? It(wo, { key: 1, to: this.resolvedTarget || document.body }, [
      q(this.$slots, "default")
    ]) : N("", !0);
  }, e.unmounted = function() {
    Gn(this);
  };
}
const za = {
  install: (e) => {
    Va(), e.use(Xi, { theme: "none" });
  }
}, qo = /^[a-z0-9]+(-[a-z0-9]+)*$/, _t = (e, t, n, o = "") => {
  const r = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (r.length < 2 || r.length > 3) return null;
    o = r.shift().slice(1);
  }
  if (r.length > 3 || !r.length) return null;
  if (r.length > 1) {
    const l = r.pop(), s = r.pop(), c = {
      provider: r.length > 0 ? r[0] : o,
      prefix: s,
      name: l
    };
    return t && !ft(c) ? null : c;
  }
  const i = r[0], a = i.split("-");
  if (a.length > 1) {
    const l = {
      provider: o,
      prefix: a.shift(),
      name: a.join("-")
    };
    return t && !ft(l) ? null : l;
  }
  if (n && o === "") {
    const l = {
      provider: o,
      prefix: "",
      name: i
    };
    return t && !ft(l, n) ? null : l;
  }
  return null;
}, ft = (e, t) => e ? !!((t && e.prefix === "" || e.prefix) && e.name) : !1;
function Fa(e, t) {
  const n = e.icons, o = e.aliases || /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null);
  function i(a) {
    if (n[a]) return r[a] = [];
    if (!(a in r)) {
      r[a] = null;
      const l = o[a] && o[a].parent, s = l && i(l);
      s && (r[a] = [l].concat(s));
    }
    return r[a];
  }
  return Object.keys(n).concat(Object.keys(o)).forEach(i), r;
}
const Ko = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
}), kt = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), Ct = Object.freeze({
  ...Ko,
  ...kt
}), Bt = Object.freeze({
  ...Ct,
  body: "",
  hidden: !1
});
function Ma(e, t) {
  const n = {};
  !e.hFlip != !t.hFlip && (n.hFlip = !0), !e.vFlip != !t.vFlip && (n.vFlip = !0);
  const o = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return o && (n.rotate = o), n;
}
function Qn(e, t) {
  const n = Ma(e, t);
  for (const o in Bt) o in kt ? o in e && !(o in n) && (n[o] = kt[o]) : o in t ? n[o] = t[o] : o in e && (n[o] = e[o]);
  return n;
}
function Ba(e, t, n) {
  const o = e.icons, r = e.aliases || /* @__PURE__ */ Object.create(null);
  let i = {};
  function a(l) {
    i = Qn(o[l] || r[l], i);
  }
  return a(t), n.forEach(a), Qn(e, i);
}
function Go(e, t) {
  const n = [];
  if (typeof e != "object" || typeof e.icons != "object") return n;
  e.not_found instanceof Array && e.not_found.forEach((r) => {
    t(r, null), n.push(r);
  });
  const o = Fa(e);
  for (const r in o) {
    const i = o[r];
    i && (t(r, Ba(e, r, i)), n.push(r));
  }
  return n;
}
const Da = {
  provider: "",
  aliases: {},
  not_found: {},
  ...Ko
};
function At(e, t) {
  for (const n in t) if (n in e && typeof e[n] != typeof t[n]) return !1;
  return !0;
}
function Yo(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e;
  if (typeof t.prefix != "string" || !e.icons || typeof e.icons != "object" || !At(e, Da)) return null;
  const n = t.icons;
  for (const r in n) {
    const i = n[r];
    if (!r || typeof i.body != "string" || !At(i, Bt)) return null;
  }
  const o = t.aliases || /* @__PURE__ */ Object.create(null);
  for (const r in o) {
    const i = o[r], a = i.parent;
    if (!r || typeof a != "string" || !n[a] && !o[a] || !At(i, Bt)) return null;
  }
  return t;
}
const Zn = /* @__PURE__ */ Object.create(null);
function Ua(e, t) {
  return {
    provider: e,
    prefix: t,
    icons: /* @__PURE__ */ Object.create(null),
    missing: /* @__PURE__ */ new Set()
  };
}
function Ee(e, t) {
  const n = Zn[e] || (Zn[e] = /* @__PURE__ */ Object.create(null));
  return n[t] || (n[t] = Ua(e, t));
}
function Qo(e, t) {
  return Yo(t) ? Go(t, (n, o) => {
    o ? e.icons[n] = o : e.missing.add(n);
  }) : [];
}
function Ha(e, t, n) {
  try {
    if (typeof n.body == "string")
      return e.icons[t] = { ...n }, !0;
  } catch {
  }
  return !1;
}
let Ge = !1;
function Zo(e) {
  return typeof e == "boolean" && (Ge = e), Ge;
}
function Wa(e) {
  const t = typeof e == "string" ? _t(e, !0, Ge) : e;
  if (t) {
    const n = Ee(t.provider, t.prefix), o = t.name;
    return n.icons[o] || (n.missing.has(o) ? null : void 0);
  }
}
function qa(e, t) {
  const n = _t(e, !0, Ge);
  if (!n) return !1;
  const o = Ee(n.provider, n.prefix);
  return t ? Ha(o, n.name, t) : (o.missing.add(n.name), !0);
}
function Jo(e, t) {
  if (typeof e != "object") return !1;
  if (typeof t != "string" && (t = e.provider || ""), Ge && !t && !e.prefix) {
    let r = !1;
    return Yo(e) && (e.prefix = "", Go(e, (i, a) => {
      qa(i, a) && (r = !0);
    })), r;
  }
  const n = e.prefix;
  if (!ft({
    prefix: n,
    name: "a"
  })) return !1;
  const o = Ee(t, n);
  return !!Qo(o, e);
}
const Xo = Object.freeze({
  width: null,
  height: null
}), er = Object.freeze({
  ...Xo,
  ...kt
}), Ka = /(-?[0-9.]*[0-9]+[0-9.]*)/g, Ga = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function Jn(e, t, n) {
  if (t === 1) return e;
  if (n = n || 100, typeof e == "number") return Math.ceil(e * t * n) / n;
  if (typeof e != "string") return e;
  const o = e.split(Ka);
  if (o === null || !o.length) return e;
  const r = [];
  let i = o.shift(), a = Ga.test(i);
  for (; ; ) {
    if (a) {
      const l = parseFloat(i);
      isNaN(l) ? r.push(i) : r.push(Math.ceil(l * t * n) / n);
    } else r.push(i);
    if (i = o.shift(), i === void 0) return r.join("");
    a = !a;
  }
}
function Ya(e, t = "defs") {
  let n = "";
  const o = e.indexOf("<" + t);
  for (; o >= 0; ) {
    const r = e.indexOf(">", o), i = e.indexOf("</" + t);
    if (r === -1 || i === -1) break;
    const a = e.indexOf(">", i);
    if (a === -1) break;
    n += e.slice(r + 1, i).trim(), e = e.slice(0, o).trim() + e.slice(a + 1);
  }
  return {
    defs: n,
    content: e
  };
}
function Qa(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function Za(e, t, n) {
  const o = Ya(e);
  return Qa(o.defs, t + o.content + n);
}
const Ja = (e) => e === "unset" || e === "undefined" || e === "none";
function Xa(e, t) {
  const n = {
    ...Ct,
    ...e
  }, o = {
    ...er,
    ...t
  }, r = {
    left: n.left,
    top: n.top,
    width: n.width,
    height: n.height
  };
  let i = n.body;
  [n, o].forEach((b) => {
    const h = [], w = b.hFlip, y = b.vFlip;
    let $ = b.rotate;
    w ? y ? $ += 2 : (h.push("translate(" + (r.width + r.left).toString() + " " + (0 - r.top).toString() + ")"), h.push("scale(-1 1)"), r.top = r.left = 0) : y && (h.push("translate(" + (0 - r.left).toString() + " " + (r.height + r.top).toString() + ")"), h.push("scale(1 -1)"), r.top = r.left = 0);
    let v;
    switch ($ < 0 && ($ -= Math.floor($ / 4) * 4), $ = $ % 4, $) {
      case 1:
        v = r.height / 2 + r.top, h.unshift("rotate(90 " + v.toString() + " " + v.toString() + ")");
        break;
      case 2:
        h.unshift("rotate(180 " + (r.width / 2 + r.left).toString() + " " + (r.height / 2 + r.top).toString() + ")");
        break;
      case 3:
        v = r.width / 2 + r.left, h.unshift("rotate(-90 " + v.toString() + " " + v.toString() + ")");
    }
    $ % 2 === 1 && (r.left !== r.top && (v = r.left, r.left = r.top, r.top = v), r.width !== r.height && (v = r.width, r.width = r.height, r.height = v)), h.length && (i = Za(i, '<g transform="' + h.join(" ") + '">', "</g>"));
  });
  const a = o.width, l = o.height, s = r.width, c = r.height;
  let u, d;
  a === null ? (d = l === null ? "1em" : l === "auto" ? c : l, u = Jn(d, s / c)) : (u = a === "auto" ? s : a, d = l === null ? Jn(u, c / s) : l === "auto" ? c : l);
  const p = {}, f = (b, h) => {
    Ja(h) || (p[b] = h.toString());
  };
  f("width", u), f("height", d);
  const m = [
    r.left,
    r.top,
    s,
    c
  ];
  return p.viewBox = m.join(" "), {
    attributes: p,
    viewBox: m,
    body: i
  };
}
const es = /\sid="(\S+)"/g, Xn = /* @__PURE__ */ new Map();
function ts(e) {
  e = e.replace(/[0-9]+$/, "") || "a";
  const t = Xn.get(e) || 0;
  return Xn.set(e, t + 1), t ? `${e}${t}` : e;
}
function ns(e) {
  const t = [];
  let n;
  for (; n = es.exec(e); ) t.push(n[1]);
  if (!t.length) return e;
  const o = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return t.forEach((r) => {
    const i = ts(r), a = r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(new RegExp('([#;"])(' + a + ')([")]|\\.[a-z])', "g"), "$1" + i + o + "$3");
  }), e = e.replace(new RegExp(o, "g"), ""), e;
}
const Dt = /* @__PURE__ */ Object.create(null);
function os(e, t) {
  Dt[e] = t;
}
function Ut(e) {
  return Dt[e] || Dt[""];
}
function cn(e) {
  let t;
  if (typeof e.resources == "string") t = [e.resources];
  else if (t = e.resources, !(t instanceof Array) || !t.length) return null;
  return {
    resources: t,
    path: e.path || "/",
    maxURL: e.maxURL || 500,
    rotate: e.rotate || 750,
    timeout: e.timeout || 5e3,
    random: e.random === !0,
    index: e.index || 0,
    dataAfterTimeout: e.dataAfterTimeout !== !1
  };
}
const un = /* @__PURE__ */ Object.create(null), Le = ["https://api.simplesvg.com", "https://api.unisvg.com"], ht = [];
for (; Le.length > 0; ) Le.length === 1 || Math.random() > 0.5 ? ht.push(Le.shift()) : ht.push(Le.pop());
un[""] = cn({ resources: ["https://api.iconify.design"].concat(ht) });
function rs(e, t) {
  const n = cn(t);
  return n === null ? !1 : (un[e] = n, !0);
}
function dn(e) {
  return un[e];
}
const is = () => {
  let e;
  try {
    if (e = fetch, typeof e == "function") return e;
  } catch {
  }
};
let eo = is();
function as(e, t) {
  const n = dn(e);
  if (!n) return 0;
  let o;
  if (!n.maxURL) o = 0;
  else {
    let r = 0;
    n.resources.forEach((a) => {
      r = Math.max(r, a.length);
    });
    const i = t + ".json?icons=";
    o = n.maxURL - r - n.path.length - i.length;
  }
  return o;
}
function ss(e) {
  return e === 404;
}
const ls = (e, t, n) => {
  const o = [], r = as(e, t), i = "icons";
  let a = {
    type: i,
    provider: e,
    prefix: t,
    icons: []
  }, l = 0;
  return n.forEach((s, c) => {
    l += s.length + 1, l >= r && c > 0 && (o.push(a), a = {
      type: i,
      provider: e,
      prefix: t,
      icons: []
    }, l = s.length), a.icons.push(s);
  }), o.push(a), o;
};
function cs(e) {
  if (typeof e == "string") {
    const t = dn(e);
    if (t) return t.path;
  }
  return "/";
}
const us = (e, t, n) => {
  if (!eo) {
    n("abort", 424);
    return;
  }
  let o = cs(t.provider);
  switch (t.type) {
    case "icons": {
      const i = t.prefix, a = t.icons.join(","), l = new URLSearchParams({ icons: a });
      o += i + ".json?" + l.toString();
      break;
    }
    case "custom": {
      const i = t.uri;
      o += i.slice(0, 1) === "/" ? i.slice(1) : i;
      break;
    }
    default:
      n("abort", 400);
      return;
  }
  let r = 503;
  eo(e + o).then((i) => {
    const a = i.status;
    if (a !== 200) {
      setTimeout(() => {
        n(ss(a) ? "abort" : "next", a);
      });
      return;
    }
    return r = 501, i.json();
  }).then((i) => {
    if (typeof i != "object" || i === null) {
      setTimeout(() => {
        i === 404 ? n("abort", i) : n("next", r);
      });
      return;
    }
    setTimeout(() => {
      n("success", i);
    });
  }).catch(() => {
    n("next", r);
  });
}, ds = {
  prepare: ls,
  send: us
};
function tr(e, t) {
  e.forEach((n) => {
    const o = n.loaderCallbacks;
    o && (n.loaderCallbacks = o.filter((r) => r.id !== t));
  });
}
function ps(e) {
  e.pendingCallbacksFlag || (e.pendingCallbacksFlag = !0, setTimeout(() => {
    e.pendingCallbacksFlag = !1;
    const t = e.loaderCallbacks ? e.loaderCallbacks.slice(0) : [];
    if (!t.length) return;
    let n = !1;
    const o = e.provider, r = e.prefix;
    t.forEach((i) => {
      const a = i.icons, l = a.pending.length;
      a.pending = a.pending.filter((s) => {
        if (s.prefix !== r) return !0;
        const c = s.name;
        if (e.icons[c]) a.loaded.push({
          provider: o,
          prefix: r,
          name: c
        });
        else if (e.missing.has(c)) a.missing.push({
          provider: o,
          prefix: r,
          name: c
        });
        else
          return n = !0, !0;
        return !1;
      }), a.pending.length !== l && (n || tr([e], i.id), i.callback(a.loaded.slice(0), a.missing.slice(0), a.pending.slice(0), i.abort));
    });
  }));
}
let fs = 0;
function hs(e, t, n) {
  const o = fs++, r = tr.bind(null, n, o);
  if (!t.pending.length) return r;
  const i = {
    id: o,
    icons: t,
    callback: e,
    abort: r
  };
  return n.forEach((a) => {
    (a.loaderCallbacks || (a.loaderCallbacks = [])).push(i);
  }), r;
}
function ms(e) {
  const t = {
    loaded: [],
    missing: [],
    pending: []
  }, n = /* @__PURE__ */ Object.create(null);
  e.sort((r, i) => r.provider !== i.provider ? r.provider.localeCompare(i.provider) : r.prefix !== i.prefix ? r.prefix.localeCompare(i.prefix) : r.name.localeCompare(i.name));
  let o = {
    provider: "",
    prefix: "",
    name: ""
  };
  return e.forEach((r) => {
    if (o.name === r.name && o.prefix === r.prefix && o.provider === r.provider) return;
    o = r;
    const i = r.provider, a = r.prefix, l = r.name, s = n[i] || (n[i] = /* @__PURE__ */ Object.create(null)), c = s[a] || (s[a] = Ee(i, a));
    let u;
    l in c.icons ? u = t.loaded : a === "" || c.missing.has(l) ? u = t.missing : u = t.pending;
    const d = {
      provider: i,
      prefix: a,
      name: l
    };
    u.push(d);
  }), t;
}
function bs(e, t = !0, n = !1) {
  const o = [];
  return e.forEach((r) => {
    const i = typeof r == "string" ? _t(r, t, n) : r;
    i && o.push(i);
  }), o;
}
const gs = {
  resources: [],
  index: 0,
  timeout: 2e3,
  rotate: 750,
  random: !1,
  dataAfterTimeout: !1
};
function vs(e, t, n, o) {
  const r = e.resources.length, i = e.random ? Math.floor(Math.random() * r) : e.index;
  let a;
  if (e.random) {
    let S = e.resources.slice(0);
    for (a = []; S.length > 1; ) {
      const x = Math.floor(Math.random() * S.length);
      a.push(S[x]), S = S.slice(0, x).concat(S.slice(x + 1));
    }
    a = a.concat(S);
  } else a = e.resources.slice(i).concat(e.resources.slice(0, i));
  const l = Date.now();
  let s = "pending", c = 0, u, d = null, p = [], f = [];
  typeof o == "function" && f.push(o);
  function m() {
    d && (clearTimeout(d), d = null);
  }
  function b() {
    s === "pending" && (s = "aborted"), m(), p.forEach((S) => {
      S.status === "pending" && (S.status = "aborted");
    }), p = [];
  }
  function h(S, x) {
    x && (f = []), typeof S == "function" && f.push(S);
  }
  function w() {
    return {
      startTime: l,
      payload: t,
      status: s,
      queriesSent: c,
      queriesPending: p.length,
      subscribe: h,
      abort: b
    };
  }
  function y() {
    s = "failed", f.forEach((S) => {
      S(void 0, u);
    });
  }
  function $() {
    p.forEach((S) => {
      S.status === "pending" && (S.status = "aborted");
    }), p = [];
  }
  function v(S, x, O) {
    const U = x !== "success";
    switch (p = p.filter((H) => H !== S), s) {
      case "pending":
        break;
      case "failed":
        if (U || !e.dataAfterTimeout) return;
        break;
      default:
        return;
    }
    if (x === "abort") {
      u = O, y();
      return;
    }
    if (U) {
      u = O, p.length || (a.length ? g() : y());
      return;
    }
    if (m(), $(), !e.random) {
      const H = e.resources.indexOf(S.resource);
      H !== -1 && H !== e.index && (e.index = H);
    }
    s = "completed", f.forEach((H) => {
      H(O);
    });
  }
  function g() {
    if (s !== "pending") return;
    m();
    const S = a.shift();
    if (S === void 0) {
      if (p.length) {
        d = setTimeout(() => {
          m(), s === "pending" && ($(), y());
        }, e.timeout);
        return;
      }
      y();
      return;
    }
    const x = {
      status: "pending",
      resource: S,
      callback: (O, U) => {
        v(x, O, U);
      }
    };
    p.push(x), c++, d = setTimeout(g, e.rotate), n(S, t, x.callback);
  }
  return setTimeout(g), w;
}
function nr(e) {
  const t = {
    ...gs,
    ...e
  };
  let n = [];
  function o() {
    n = n.filter((a) => a().status === "pending");
  }
  function r(a, l, s) {
    const c = vs(t, a, l, (u, d) => {
      o(), s && s(u, d);
    });
    return n.push(c), c;
  }
  function i(a) {
    return n.find((l) => a(l)) || null;
  }
  return {
    query: r,
    find: i,
    setIndex: (a) => {
      t.index = a;
    },
    getIndex: () => t.index,
    cleanup: o
  };
}
function to() {
}
const Et = /* @__PURE__ */ Object.create(null);
function ys(e) {
  if (!Et[e]) {
    const t = dn(e);
    if (!t) return;
    const n = {
      config: t,
      redundancy: nr(t)
    };
    Et[e] = n;
  }
  return Et[e];
}
function ws(e, t, n) {
  let o, r;
  if (typeof e == "string") {
    const i = Ut(e);
    if (!i)
      return n(void 0, 424), to;
    r = i.send;
    const a = ys(e);
    a && (o = a.redundancy);
  } else {
    const i = cn(e);
    if (i) {
      o = nr(i);
      const a = e.resources ? e.resources[0] : "", l = Ut(a);
      l && (r = l.send);
    }
  }
  return !o || !r ? (n(void 0, 424), to) : o.query(t, r, n)().abort;
}
function no() {
}
function ks(e) {
  e.iconsLoaderFlag || (e.iconsLoaderFlag = !0, setTimeout(() => {
    e.iconsLoaderFlag = !1, ps(e);
  }));
}
function xs(e) {
  const t = [], n = [];
  return e.forEach((o) => {
    (o.match(qo) ? t : n).push(o);
  }), {
    valid: t,
    invalid: n
  };
}
function Ne(e, t, n) {
  function o() {
    const r = e.pendingIcons;
    t.forEach((i) => {
      r && r.delete(i), e.icons[i] || e.missing.add(i);
    });
  }
  if (n && typeof n == "object") try {
    if (!Qo(e, n).length) {
      o();
      return;
    }
  } catch (r) {
    console.error(r);
  }
  o(), ks(e);
}
function oo(e, t) {
  e instanceof Promise ? e.then((n) => {
    t(n);
  }).catch(() => {
    t(null);
  }) : t(e);
}
function Ss(e, t) {
  e.iconsToLoad ? e.iconsToLoad = e.iconsToLoad.concat(t).sort() : e.iconsToLoad = t, e.iconsQueueFlag || (e.iconsQueueFlag = !0, setTimeout(() => {
    e.iconsQueueFlag = !1;
    const { provider: n, prefix: o } = e, r = e.iconsToLoad;
    if (delete e.iconsToLoad, !r || !r.length) return;
    const i = e.loadIcon;
    if (e.loadIcons && (r.length > 1 || !i)) {
      oo(e.loadIcons(r, o, n), (c) => {
        Ne(e, r, c);
      });
      return;
    }
    if (i) {
      r.forEach((c) => {
        oo(i(c, o, n), (u) => {
          Ne(e, [c], u ? {
            prefix: o,
            icons: { [c]: u }
          } : null);
        });
      });
      return;
    }
    const { valid: a, invalid: l } = xs(r);
    if (l.length && Ne(e, l, null), !a.length) return;
    const s = o.match(qo) ? Ut(n) : null;
    if (!s) {
      Ne(e, a, null);
      return;
    }
    s.prepare(n, o, a).forEach((c) => {
      ws(n, c, (u) => {
        Ne(e, c.icons, u);
      });
    });
  }));
}
const $s = (e, t) => {
  const n = bs(e, !0, Zo()), o = ms(n);
  if (!o.pending.length) {
    let s = !0;
    return t && setTimeout(() => {
      s && t(o.loaded, o.missing, o.pending, no);
    }), () => {
      s = !1;
    };
  }
  const r = /* @__PURE__ */ Object.create(null), i = [];
  let a, l;
  return o.pending.forEach((s) => {
    const { provider: c, prefix: u } = s;
    if (u === l && c === a) return;
    a = c, l = u, i.push(Ee(c, u));
    const d = r[c] || (r[c] = /* @__PURE__ */ Object.create(null));
    d[u] || (d[u] = []);
  }), o.pending.forEach((s) => {
    const { provider: c, prefix: u, name: d } = s, p = Ee(c, u), f = p.pendingIcons || (p.pendingIcons = /* @__PURE__ */ new Set());
    f.has(d) || (f.add(d), r[c][u].push(d));
  }), i.forEach((s) => {
    const c = r[s.provider][s.prefix];
    c.length && Ss(s, c);
  }), t ? hs(t, o, i) : no;
};
function _s(e, t) {
  const n = { ...e };
  for (const o in t) {
    const r = t[o], i = typeof r;
    o in Xo ? (r === null || r && (i === "string" || i === "number")) && (n[o] = r) : i === typeof n[o] && (n[o] = o === "rotate" ? r % 4 : r);
  }
  return n;
}
const Cs = /[\s,]+/;
function Ps(e, t) {
  t.split(Cs).forEach((n) => {
    switch (n.trim()) {
      case "horizontal":
        e.hFlip = !0;
        break;
      case "vertical":
        e.vFlip = !0;
    }
  });
}
function Ts(e, t = 0) {
  const n = e.replace(/^-?[0-9.]*/, "");
  function o(r) {
    for (; r < 0; ) r += 4;
    return r % 4;
  }
  if (n === "") {
    const r = parseInt(e);
    return isNaN(r) ? 0 : o(r);
  } else if (n !== e) {
    let r = 0;
    switch (n) {
      case "%":
        r = 25;
        break;
      case "deg":
        r = 90;
    }
    if (r) {
      let i = parseFloat(e.slice(0, e.length - n.length));
      return isNaN(i) ? 0 : (i = i / r, i % 1 === 0 ? o(i) : 0);
    }
  }
  return t;
}
function Os(e, t) {
  let n = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const o in t) n += " " + o + '="' + t[o] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + n + ">" + e + "</svg>";
}
function As(e) {
  return e.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ").replace(/:/g, "%3A").replace(/\//g, "%2F");
}
function Es(e) {
  return "data:image/svg+xml," + As(e);
}
function js(e) {
  return 'url("' + Es(e) + '")';
}
const ro = {
  ...er,
  inline: !1
}, Is = {
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "aria-hidden": !0,
  role: "img"
}, Ls = {
  display: "inline-block"
}, Ht = {
  backgroundColor: "currentColor"
}, or = {
  backgroundColor: "transparent"
}, io = {
  Image: "var(--svg)",
  Repeat: "no-repeat",
  Size: "100% 100%"
}, ao = {
  webkitMask: Ht,
  mask: Ht,
  background: or
};
for (const e in ao) {
  const t = ao[e];
  for (const n in io)
    t[e + n] = io[n];
}
const mt = {};
["horizontal", "vertical"].forEach((e) => {
  const t = e.slice(0, 1) + "Flip";
  mt[e + "-flip"] = t, mt[e.slice(0, 1) + "-flip"] = t, mt[e + "Flip"] = t;
});
function so(e) {
  return e + (e.match(/^[-0-9.]+$/) ? "px" : "");
}
const lo = (e, t) => {
  const n = _s(ro, t), o = { ...Is }, r = t.mode || "svg", i = {}, a = t.style, l = typeof a == "object" && !(a instanceof Array) ? a : {};
  for (let b in t) {
    const h = t[b];
    if (h !== void 0)
      switch (b) {
        // Properties to ignore
        case "icon":
        case "style":
        case "onLoad":
        case "mode":
        case "ssr":
        case "customise":
          break;
        // Boolean attributes
        case "inline":
        case "hFlip":
        case "vFlip":
          n[b] = h === !0 || h === "true" || h === 1;
          break;
        // Flip as string: 'horizontal,vertical'
        // Handled after this loop, see below.
        case "flip":
          break;
        // Color: override style
        case "color":
          i.color = h;
          break;
        // Rotation as string
        case "rotate":
          typeof h == "string" ? n[b] = Ts(h) : typeof h == "number" && (n[b] = h);
          break;
        // Remove aria-hidden
        case "ariaHidden":
        case "aria-hidden":
          h !== !0 && h !== "true" && delete o["aria-hidden"];
          break;
        default: {
          const w = mt[b];
          w ? (h === !0 || h === "true" || h === 1) && (n[w] = !0) : ro[b] === void 0 && (o[b] = h);
        }
      }
  }
  typeof t.flip == "string" && Ps(n, t.flip);
  const s = Xa(e, n), c = s.attributes;
  if (n.inline && (i.verticalAlign = "-0.125em"), r === "svg")
    return o.style = {
      ...i,
      ...l
    }, Object.assign(o, c), o.innerHTML = ns(s.body), It("svg", o);
  const { body: u, width: d, height: p } = e, f = r === "mask" || (r === "bg" ? !1 : u.indexOf("currentColor") !== -1), m = Os(u, {
    ...c,
    width: d + "",
    height: p + ""
  });
  return o.style = {
    ...i,
    "--svg": js(m),
    width: so(c.width),
    height: so(c.height),
    ...Ls,
    ...f ? Ht : or,
    ...l
  }, It("span", o);
};
Zo(!0);
os("", ds);
if (typeof document < "u" && typeof window < "u") {
  const e = window;
  if (e.IconifyPreload !== void 0) {
    const t = e.IconifyPreload, n = "Invalid IconifyPreload syntax.";
    typeof t == "object" && t !== null && (t instanceof Array ? t : [t]).forEach((o) => {
      try {
        // Check if item is an object and not null/array
        (typeof o != "object" || o === null || o instanceof Array || // Check for 'icons' and 'prefix'
        typeof o.icons != "object" || typeof o.prefix != "string" || // Add icon set
        !Jo(o)) && console.error(n);
      } catch {
        console.error(n);
      }
    });
  }
  if (e.IconifyProviders !== void 0) {
    const t = e.IconifyProviders;
    if (typeof t == "object" && t !== null)
      for (let n in t) {
        const o = "IconifyProviders[" + n + "] is invalid.";
        try {
          const r = t[n];
          if (typeof r != "object" || !r || r.resources === void 0)
            continue;
          rs(n, r) || console.error(o);
        } catch {
          console.error(o);
        }
      }
  }
}
const Ns = {
  ...Ct,
  body: ""
};
je((e, { emit: t }) => {
  const n = V(null);
  function o() {
    n.value && (n.value.abort?.(), n.value = null);
  }
  const r = V(!!e.ssr), i = V(""), a = zr(null);
  function l() {
    const c = e.icon;
    if (typeof c == "object" && c !== null && typeof c.body == "string")
      return i.value = "", {
        data: c
      };
    let u;
    if (typeof c != "string" || (u = _t(c, !1, !0)) === null)
      return null;
    let d = Wa(u);
    if (!d) {
      const m = n.value;
      return (!m || m.name !== c) && (d === null ? n.value = {
        name: c
      } : n.value = {
        name: c,
        abort: $s([u], s)
      }), null;
    }
    o(), i.value !== c && (i.value = c, tn(() => {
      t("load", c);
    }));
    const p = e.customise;
    if (p) {
      d = Object.assign({}, d);
      const m = p(d.body, u.name, u.prefix, u.provider);
      typeof m == "string" && (d.body = m);
    }
    const f = ["iconify"];
    return u.prefix !== "" && f.push("iconify--" + u.prefix), u.provider !== "" && f.push("iconify--" + u.provider), { data: d, classes: f };
  }
  function s() {
    const c = l();
    c ? c.data !== a.value?.data && (a.value = c) : a.value = null;
  }
  return r.value ? s() : en(() => {
    r.value = !0, s();
  }), Y(() => e.icon, s), nn(o), () => {
    const c = a.value;
    if (!c)
      return lo(Ns, e);
    let u = e;
    return c.classes && (u = {
      ...e,
      class: c.classes.join(" ")
    }), lo({
      ...Ct,
      ...c.data
    }, u);
  };
}, {
  props: {
    // Icon and render mode
    icon: { type: [String, Object], required: !0 },
    mode: { type: String },
    ssr: { type: Boolean },
    // Layout and style
    width: { type: [String, Number] },
    height: { type: [String, Number] },
    style: { type: [String, Object] },
    color: { type: String },
    inline: { type: Boolean },
    // Transformations
    rotate: { type: [Number, String] },
    hFlip: { type: Boolean },
    horizontalFlip: { type: Boolean },
    vFlip: { type: Boolean },
    verticalFlip: { type: Boolean },
    flip: { type: String },
    // Misc
    id: { type: String },
    ariaHidden: { type: [Boolean, String], default: void 0 },
    customise: { type: Function },
    title: { type: String }
  },
  emits: ["load"]
});
var Wt = "data-wippy-visible";
function co(e) {
  const t = e.getAttribute(Wt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Rs = Object.defineProperty, Vs = (e, t, n) => t in e ? Rs(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, z = (e, t, n) => Vs(e, typeof t != "symbol" ? t + "" : t, n), zs = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Fs = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function uo(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Ms(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [o, r] of Object.entries(n)) {
        if ((o === "@light" || o === "@dark") && r && typeof r == "object") {
          for (const [a, l] of Object.entries(r)) {
            const s = typeof l == "string" ? uo(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof r == "string" ? uo(o) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Bs(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Fs} {
${t}
}`;
}
function Ds(e, t) {
  const n = Bs(t);
  n && rr(e, n, "@wippy-fe/css-variables-bridge");
}
function Us(e, t) {
  const o = (t ?? zs).map(async (r) => {
    const i = Hr[r];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${r}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Wr(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${r}" (${i}):`, a), null;
    }
  });
  return Promise.all(o).then((r) => {
    for (const i of r) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Hs(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function rr(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const r = new CSSStyleSheet();
    r.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, r];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", n), o.textContent = t, e.appendChild(o);
}
function Ws(e, t) {
  rr(e, t, "@wippy-fe/custom-css");
}
function ir(e) {
  return e.__wippyHost ?? null;
}
function qs(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ks(e, t, n) {
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
function jt(e, t) {
  const n = {}, o = [];
  for (const [r, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(r), l = qs(r);
    if (a === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const s = Ks(r, a, i);
    s.error ? o.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: o };
}
var Gs = class {
  constructor(e, t) {
    z(this, "_props"), z(this, "_errors"), z(this, "_content"), z(this, "_hostVisibility"), z(this, "_propsListeners", /* @__PURE__ */ new Set()), z(this, "_contentListeners", /* @__PURE__ */ new Set()), z(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), z(this, "_disposed", !1), z(this, "_emitToDom"), z(this, "props"), z(this, "events"), z(this, "content"), z(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Ys = class extends HTMLElement {
  constructor() {
    super(), z(this, "_internals"), z(this, "_contentObserver", null), z(this, "_initialized", !1), z(this, "_container", null), z(this, "_reactive", null), z(this, "_lastProps", null), z(this, "_lastErrors", []), z(this, "_lastContent", null), z(this, "_themeUnsub", null), z(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = co(this);
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
    return ir(this);
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
        const i = jt(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, o = i.errors, this._lastProps = n, this._lastErrors = o;
      }
      const r = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = r), this._reactive = new Gs(
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
        this.onInit(n), e.inlineCss && Hs(n, e.inlineCss);
        try {
          const c = gn?.theming, u = Ms(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Ds(n, u);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = gn?.theming, u = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            u && Ws(n, u);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Us(n, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), n.appendChild(o), this._container = o, Dr(Jo);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Co("@theme", (s) => this._applyTheme(s)));
      const { props: r, errors: i } = jt(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(r));
      const a = r;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, o, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ur.getThemeMode?.()) {
    at(e, this), this._container && at(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), at("auto", this), this._container && at("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Wt) {
      const l = this._hostVisible, s = co(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: r, errors: i } = jt(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(r));
    const a = r;
    this._lastProps = a, this._lastErrors = i, this._reactive?.notifyProps(a, i), this.onPropsChanged(a, i);
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
function Qs(e) {
  return e.__wippyHostBus ?? null;
}
function Zs(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Js = Object.defineProperty, Xs = (e, t, n) => t in e ? Js(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Te = (e, t, n) => Xs(e, typeof t != "symbol" ? t + "" : t, n), ar = /* @__PURE__ */ Symbol("wippy:emit"), sr = /* @__PURE__ */ Symbol("wippy:props"), lr = /* @__PURE__ */ Symbol("wippy:props_error"), el = /* @__PURE__ */ Symbol("wippy:content"), tl = /* @__PURE__ */ Symbol("wippy:panel-id"), nl = /* @__PURE__ */ Symbol("wippy:layout-bus"), ol = /* @__PURE__ */ Symbol("wippy:host"), rl = /* @__PURE__ */ Symbol("wippy:host-visibility");
function il() {
  const e = St(sr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function al() {
  const e = St(ar);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function sl() {
  const e = St(lr);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var ll = class extends Ys {
  constructor() {
    super(...arguments), Te(this, "_vueApp", null), Te(this, "_propsRef", V({})), Te(this, "_errorsRef", V([])), Te(this, "_contentRef", V(null)), Te(this, "_hostVisibilityRef", V(null)), Te(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, o, r, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = o, this._contentRef.value = r ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of o)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, u) => {
      this._propsRef.value = c, this._errorsRef.value = [...u];
      for (const d of u)
        this.emitEvent("invalid", { message: d });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const s = (c) => {
      if (l.signal.aborted)
        return;
      const u = Kr(), d = Fr(c.rootComponent);
      this._vueApp = d;
      const p = Gr();
      if (c.piniaPlugins)
        for (const f of c.piniaPlugins)
          p.use(f);
      if (d.use(p), c.plugins)
        for (const f of c.plugins)
          d.use(f);
      d.provide(sr, this._propsRef), d.provide(lr, this._errorsRef), d.provide(ar, this.emitEvent.bind(this)), d.provide(el, this._contentRef), d.provide(rl, this._hostVisibilityRef), d.provide(tl, Zs(this)), d.provide(nl, Qs(this)), d.provide(ol, ir(this)), c.providers && c.providers(d, this), d.mount(t), u && Yr(u);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), a.lazyConfig().then((u) => {
        l.signal.aborted || (c.remove(), s(u));
      }).catch((u) => {
        if (l.signal.aborted)
          return;
        const d = u instanceof Error ? u.message : String(u), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", d), c.replaceWith(p), this.emitEvent("error", { message: d });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const cl = { props: { type: "object", properties: { "form-version": { type: "number", description: "Form definition schema version (currently 1)." }, definition: { type: "object", description: "Immutable form definition: title, optional description, optional submit_label, fields." }, state: { type: "string", description: 'Package-tag lifecycle state mirrored from the artifact: "active" or "idle".' } } } }, ul = {
  wippy: cl
};
var cr = {
  name: "TimesIcon",
  extends: $t
};
function dl(e) {
  return ml(e) || hl(e) || fl(e) || pl();
}
function pl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fl(e, t) {
  if (e) {
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function hl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ml(e) {
  if (Array.isArray(e)) return qt(e);
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function bl(e, t, n, o, r, i) {
  return k(), _("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [j("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
cr.render = bl;
var gl = `
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
`, vl = {
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
}, yl = L.extend({
  name: "message",
  style: gl,
  classes: vl
}), wl = {
  name: "BaseMessage",
  extends: rt,
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
  style: yl,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Ye(e) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ye(e);
}
function po(e, t, n) {
  return (t = kl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function kl(e) {
  var t = xl(e, "string");
  return Ye(t) == "symbol" ? t : t + "";
}
function xl(e, t) {
  if (Ye(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ye(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ye = {
  name: "Message",
  extends: wl,
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
      return ie(po(po({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Uo
  },
  components: {
    TimesIcon: cr
  }
};
function Qe(e) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Qe(e);
}
function fo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ho(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? fo(Object(n), !0).forEach(function(o) {
      Sl(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fo(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Sl(e, t, n) {
  return (t = $l(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $l(e) {
  var t = _l(e, "string");
  return Qe(t) == "symbol" ? t : t + "";
}
function _l(e, t) {
  if (Qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cl = ["data-p"], Pl = ["data-p"], Tl = ["data-p"], Ol = ["aria-label", "data-p"], Al = ["data-p"];
function El(e, t, n, o, r, i) {
  var a = Fe("TimesIcon"), l = xo("ripple");
  return k(), M(Mr, T({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: de(function() {
      return [r.visible ? (k(), _("div", T({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": i.dataP
      }, e.ptm("root")), [j("div", T({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? q(e.$slots, "container", {
        key: 0,
        closeCallback: i.close
      }) : (k(), _("div", T({
        key: 1,
        class: e.cx("content"),
        "data-p": i.dataP
      }, e.ptm("content")), [q(e.$slots, "icon", {
        class: bt(e.cx("icon"))
      }, function() {
        return [(k(), M(So(e.icon ? "span" : null), T({
          class: [e.cx("icon"), e.icon],
          "data-p": i.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (k(), _("div", T({
        key: 0,
        class: e.cx("text"),
        "data-p": i.dataP
      }, e.ptm("text")), [q(e.$slots, "default")], 16, Tl)) : N("", !0), e.closable ? $o((k(), _("button", T({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": i.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(s) {
          return i.close(s);
        }),
        "data-p": i.dataP
      }, ho(ho({}, e.closeButtonProps), e.ptm("closeButton"))), [q(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (k(), _("i", T({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, Al)) : (k(), M(a, T({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": i.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ol)), [[l]]) : N("", !0)], 16, Pl))], 16)], 16, Cl)) : N("", !0)];
    }),
    _: 3
  }, 16);
}
ye.render = El;
const jl = () => il(), Il = () => al(), Ll = sl;
function Nl(e, t) {
  const n = V("idle"), o = V(null), r = V(null);
  let i = 0, a = null, l = null;
  function s() {
    return _o.artifactState;
  }
  async function c() {
    const d = e.value;
    if (!d) {
      n.value = "idle", o.value = null;
      return;
    }
    const p = s();
    if (typeof p != "function") {
      n.value = "unsupported", r.value = "This form needs a newer Web Host.";
      return;
    }
    const f = ++i;
    n.value = "loading";
    try {
      const m = await p(d).get();
      if (f !== i)
        return;
      o.value = m, n.value = "loaded", r.value = null;
    } catch (m) {
      if (f !== i)
        return;
      n.value = "error", r.value = m instanceof Error ? m.message : "Could not load this form.";
    }
  }
  function u(d) {
    l !== d && (a?.(), a = null, l = d, d && (a = Co(`artifact:${d}`, () => {
      c();
    })));
  }
  return Y(e, (d) => {
    u(d), c();
  }, { immediate: !0 }), Y(t, () => {
    c();
  }), nn(() => {
    i++, a?.(), a = null;
  }), { status: n, state: o, errorMessage: r, reload: () => {
    c();
  } };
}
function Rl() {
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
function Vl(e) {
  return !!e && typeof e == "object" && ("response" in e || "request" in e);
}
function ur(e) {
  return e instanceof Error && (e.name === "ArtifactStateError" || "status" in e || "formErrors" in e);
}
function zl(e) {
  if (ur(e))
    return { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" };
  if (Vl(e)) {
    const t = e.response === void 0 && e.request !== void 0;
    return { status: e.response?.status, code: e.response?.data?.code, message: e.response?.data?.message ?? e.message, known: !0, noResponse: t };
  }
  return { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Fl(e) {
  return !ur(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function mo(e) {
  const t = zl(e);
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
function Ml(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Bl(e) {
  return JSON.stringify(e);
}
function Dl(e) {
  const t = V(!1), n = V(null), o = V(null);
  function r(s) {
    const c = Bl(s);
    if (n.value && o.value === c)
      return n.value;
    const u = Rl();
    return n.value = u, o.value = c, u;
  }
  function i() {
    n.value = null, o.value = null;
  }
  function a() {
    return _o.artifactState;
  }
  async function l(s, c, u) {
    const d = e.value;
    if (!d)
      return { ok: !1, message: "This form cannot be submitted here." };
    const p = a();
    if (typeof p != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const f = r(u), m = {
      form_version: s,
      request_id: f,
      expected_content_version: c,
      answers: u
    };
    t.value = !0;
    try {
      let b;
      try {
        b = await p(d).submit(m);
      } catch (h) {
        const w = Fl(h);
        if (w)
          return { ok: !1, fieldErrors: w.errors, formErrors: w.formErrors };
        const y = mo(h);
        if (!y.uncertain)
          return { ok: !1, message: y.message, code: y.code, retryable: y.retryable, shouldReload: y.shouldReload };
        await Ml(800);
        try {
          b = await p(d).submit(m);
        } catch ($) {
          const v = mo($);
          return { ok: !1, message: v.message, code: v.code, retryable: !0, shouldReload: v.shouldReload };
        }
      }
      return i(), { ok: !0, accepted: b };
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: l, resetIdentity: i };
}
const dr = Symbol("wippy-form:element"), dt = "data-wippy-artifact-id";
function Ul() {
  const e = St(dr), t = V(e?.getAttribute(dt) ?? null);
  if (e) {
    let n = null;
    en(() => {
      t.value = e.getAttribute(dt), n = new MutationObserver(() => {
        t.value = e.getAttribute(dt);
      }), n.observe(e, { attributes: !0, attributeFilter: [dt] });
    }), nn(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
var pr = {
  name: "SpinnerIcon",
  extends: $t
};
function Hl(e) {
  return Gl(e) || Kl(e) || ql(e) || Wl();
}
function Wl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ql(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function Kl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gl(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Yl(e, t, n, o, r, i) {
  return k(), _("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Hl(t[0] || (t[0] = [j("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
pr.render = Yl;
var Ql = `
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
`, Zl = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": R(n.value) && String(n.value).length === 1,
      "p-badge-dot": Se(n.value) && !o.$slots.default,
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
}, Jl = L.extend({
  name: "badge",
  style: Ql,
  classes: Zl
}), Xl = {
  name: "BaseBadge",
  extends: rt,
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
  style: Jl,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Ze(e) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ze(e);
}
function bo(e, t, n) {
  return (t = ec(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ec(e) {
  var t = tc(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function tc(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var fr = {
  name: "Badge",
  extends: Xl,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ie(bo(bo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, nc = ["data-p"];
function oc(e, t, n, o, r, i) {
  return k(), _("span", T({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [q(e.$slots, "default", {}, function() {
    return [fe(F(e.value), 1)];
  })], 16, nc);
}
fr.render = oc;
var rc = `
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
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function X(e, t, n) {
  return (t = ic(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ic(e) {
  var t = ac(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function ac(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sc = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", X(X(X(X(X(X(X(X(X({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", X({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, lc = L.extend({
  name: "button",
  style: rc,
  classes: sc
}), cc = {
  name: "BaseButton",
  extends: rt,
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
  style: lc,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function W(e, t, n) {
  return (t = uc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function uc(e) {
  var t = dc(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function dc(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var hr = {
  name: "Button",
  extends: cc,
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
      return T(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Se(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ie(W(W(W(W(W(W(W(W(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ie(W(W({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ie(W(W({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: pr,
    Badge: fr
  },
  directives: {
    ripple: Uo
  }
}, pc = ["data-p"], fc = ["data-p"];
function hc(e, t, n, o, r, i) {
  var a = Fe("SpinnerIcon"), l = Fe("Badge"), s = xo("ripple");
  return e.asChild ? q(e.$slots, "default", {
    key: 1,
    class: bt(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : $o((k(), M(So(e.as), T({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: de(function() {
      return [q(e.$slots, "default", {}, function() {
        return [e.loading ? q(e.$slots, "loadingicon", T({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (k(), _("span", T({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (k(), M(a, T({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : q(e.$slots, "icon", T({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (k(), _("span", T({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, pc)) : N("", !0)];
        }), e.label ? (k(), _("span", T({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), F(e.label), 17, fc)) : N("", !0), e.badge ? (k(), M(l, {
          key: 3,
          value: e.badge,
          class: bt(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : N("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
hr.render = hc;
const mc = 2e3;
function go(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function vo(e) {
  return e.trim().slice(0, mc);
}
function mr(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], o = e.options.map((l) => l.value), r = /* @__PURE__ */ new Set();
    for (const l of n)
      typeof l == "string" && o.includes(l) && r.add(l);
    const i = o.filter((l) => r.has(l)), a = n.find(go);
    if (a) {
      const l = vo(a.other);
      l.length > 0 && i.push({ other: l });
    }
    return i.length > 0 ? i : void 0;
  }
  if (t !== void 0) {
    if (go(t)) {
      const n = vo(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function bc(e, t) {
  const n = {};
  for (const o of e.fields) {
    const r = mr(o, t[o.id]);
    r !== void 0 && (n[o.id] = r);
  }
  return n;
}
function gc(e, t) {
  const n = [];
  for (const o of e.fields)
    o.required && mr(o, t[o.id]) === void 0 && n.push(o.id);
  return n;
}
function vc(e, t) {
  const n = {};
  if (!t)
    return n;
  for (const o of e.fields) {
    const r = t[o.id];
    r !== void 0 && (n[o.id] = o.multiple ? Array.isArray(r) ? [...r] : [r] : r);
  }
  return n;
}
var br = {
  name: "CheckIcon",
  extends: $t
};
function yc(e) {
  return Sc(e) || xc(e) || kc(e) || wc();
}
function wc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function kc(e, t) {
  if (e) {
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function xc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Sc(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function $c(e, t, n, o, r, i) {
  return k(), _("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), yc(t[0] || (t[0] = [j("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
br.render = $c;
var gr = {
  name: "MinusIcon",
  extends: $t
};
function _c(e) {
  return Oc(e) || Tc(e) || Pc(e) || Cc();
}
function Cc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pc(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function Tc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Oc(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ac(e, t, n, o, r, i) {
  return k(), _("svg", T({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), _c(t[0] || (t[0] = [j("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gr.render = Ac;
var Ec = {
  name: "BaseEditableHolder",
  extends: rt,
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
      return n.find(R);
    }
  },
  computed: {
    $filled: function() {
      return R(this.d_value);
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
}, pn = {
  name: "BaseInput",
  extends: Ec,
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
}, jc = `
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
`, Ic = {
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
}, Lc = L.extend({
  name: "checkbox",
  style: jc,
  classes: Ic
}), Nc = {
  name: "BaseCheckbox",
  extends: pn,
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
  style: Lc,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function Rc(e, t, n) {
  return (t = Vc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Vc(e) {
  var t = zc(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function zc(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Fc(e) {
  return Uc(e) || Dc(e) || Bc(e) || Mc();
}
function Mc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Bc(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function Dc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Uc(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
var Zt = {
  name: "Checkbox",
  extends: Nc,
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
        this.binary ? r = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? r = o.filter(function(i) {
          return !rn(i, n.value);
        }) : r = o ? [].concat(Fc(o), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(r, t) : this.writeValue(r, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : ti(this.value, t);
    },
    dataP: function() {
      return ie(Rc({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: br,
    MinusIcon: gr
  }
}, Hc = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Wc = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], qc = ["data-p"];
function Kc(e, t, n, o, r, i) {
  var a = Fe("CheckIcon"), l = Fe("MinusIcon");
  return k(), _("div", T({
    class: e.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-indeterminate": r.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [j("input", T({
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
  }, i.getPTOptions("input")), null, 16, Wc), j("div", T({
    class: e.cx("box")
  }, i.getPTOptions("box"), {
    "data-p": i.dataP
  }), [q(e.$slots, "icon", {
    checked: i.checked,
    indeterminate: r.d_indeterminate,
    class: bt(e.cx("icon")),
    dataP: i.dataP
  }, function() {
    return [i.checked ? (k(), M(a, T({
      key: 0,
      class: e.cx("icon")
    }, i.getPTOptions("icon"), {
      "data-p": i.dataP
    }), null, 16, ["class", "data-p"])) : r.d_indeterminate ? (k(), M(l, T({
      key: 1,
      class: e.cx("icon")
    }, i.getPTOptions("icon"), {
      "data-p": i.dataP
    }), null, 16, ["class", "data-p"])) : N("", !0)];
  })], 16, qc)], 16, Hc);
}
Zt.render = Kc;
var Gc = `
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
`, Yc = {
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
}, Qc = L.extend({
  name: "inputtext",
  style: Gc,
  classes: Yc
}), Zc = {
  name: "BaseInputText",
  extends: pn,
  style: Qc,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
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
function Jc(e, t, n) {
  return (t = Xc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xc(e) {
  var t = eu(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function eu(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = {
  name: "InputText",
  extends: Zc,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return T(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ie(Jc({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, tu = ["value", "name", "disabled", "aria-invalid", "data-p"];
function nu(e, t, n, o, r, i) {
  return k(), _("input", T({
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
  }, i.attrs), null, 16, tu);
}
Jt.render = nu;
var ou = `
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
`, ru = {
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
}, iu = L.extend({
  name: "radiobutton",
  style: ou,
  classes: ru
}), au = {
  name: "BaseRadioButton",
  extends: pn,
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
  style: iu,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
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
function su(e, t, n) {
  return (t = lu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function lu(e) {
  var t = cu(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function cu(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xt = {
  name: "RadioButton",
  extends: au,
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
      return t != null && (this.binary ? !!t : rn(t, this.value));
    },
    dataP: function() {
      return ie(su({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, uu = ["data-p-checked", "data-p-disabled", "data-p"], du = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], pu = ["data-p"], fu = ["data-p"];
function hu(e, t, n, o, r, i) {
  return k(), _("div", T({
    class: e.cx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [j("input", T({
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
  }, i.getPTOptions("input")), null, 16, du), j("div", T({
    class: e.cx("box")
  }, i.getPTOptions("box"), {
    "data-p": i.dataP
  }), [j("div", T({
    class: e.cx("icon")
  }, i.getPTOptions("icon"), {
    "data-p": i.dataP
  }), null, 16, fu)], 16, pu)], 16, uu);
}
Xt.render = hu;
function xt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function pt(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(xt);
    return t ? t.other : "";
  }
  return xt(e) ? e.other : "";
}
function mu(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(xt) : xt(e);
}
const bu = { class: "text-sm font-medium text-surface-900 dark:text-surface-0 p-0" }, gu = {
  key: 0,
  class: "text-red-600 dark:text-red-400"
}, vu = {
  key: 1,
  class: "text-sm text-surface-900 dark:text-surface-0 break-words"
}, yu = ["aria-describedby"], wu = ["for"], ku = {
  key: 0,
  class: "block text-xs text-muted-color"
}, xu = {
  key: 0,
  class: "flex items-start gap-2"
}, Su = { class: "flex flex-col gap-1 min-w-0 grow" }, $u = ["for"], _u = ["for"], Cu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, Pu = {
  key: 0,
  class: "flex items-start gap-2"
}, Tu = { class: "flex flex-col gap-1 min-w-0 grow" }, Ou = ["for"], Re = "__wippy_form_other__", fn = /* @__PURE__ */ je({
  __name: "ChoiceField",
  props: {
    field: {},
    modelValue: {},
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, i = ko(), a = `${i}-desc`, l = `${i}-err`, s = `${i}-other-label`, c = V(null), u = ce(() => {
      const g = [];
      return o.field.description && g.push(a), o.errors.length > 0 && g.push(l), g.length > 0 ? g.join(" ") : void 0;
    }), d = ce({
      get() {
        const g = o.modelValue;
        return typeof g == "string" ? g : $(g) ? Re : "";
      },
      set(g) {
        g === Re ? r("update:modelValue", { other: p.value }) : g === "" ? r("update:modelValue", void 0) : r("update:modelValue", g);
      }
    }), p = V(pt(o.modelValue));
    Y(() => o.modelValue, (g) => {
      o.field.multiple || (p.value = pt(g));
    }), Y(p, (g) => {
      !o.field.multiple && d.value === Re && r("update:modelValue", { other: g });
    });
    const f = ce(() => {
      const g = o.modelValue;
      return Array.isArray(g) ? g.filter((S) => typeof S == "string") : [];
    }), m = ce(() => o.field.multiple && mu(o.modelValue)), b = V(pt(o.modelValue));
    Y(() => o.modelValue, (g) => {
      o.field.multiple && (b.value = pt(g));
    });
    function h(g, S, x) {
      const O = [...g];
      S && O.push({ other: x }), r("update:modelValue", O.length > 0 ? O : void 0);
    }
    function w(g, S) {
      const x = new Set(f.value);
      S ? x.add(g) : x.delete(g), h(o.field.options.filter((O) => x.has(O.value)).map((O) => O.value), m.value, b.value);
    }
    function y(g) {
      h(f.value, g, b.value);
    }
    Y(b, (g) => {
      m.value && h(f.value, !0, g);
    });
    function $(g) {
      return !!g && typeof g == "object" && !Array.isArray(g) && typeof g.other == "string";
    }
    const v = ce(() => {
      const g = o.modelValue;
      if (g === void 0)
        return "—";
      const S = (O) => o.field.options.find((U) => U.value === O)?.label ?? O, x = [];
      if (Array.isArray(g))
        for (const O of g)
          typeof O == "string" ? x.push(S(O)) : $(O) && x.push(`Other: ${O.other}`);
      else typeof g == "string" ? x.push(S(g)) : $(g) && x.push(`Other: ${g.other}`);
      return x.length > 0 ? x.join(", ") : "—";
    });
    return t({
      focusFirstControl() {
        c.value?.querySelector("input, textarea")?.focus();
      }
    }), (g, S) => (k(), _("fieldset", {
      ref_key: "fieldsetEl",
      ref: c,
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0"
    }, [
      j("legend", bu, [
        fe(F(e.field.label), 1),
        e.field.required ? (k(), _("span", gu, " (required)")) : N("", !0)
      ]),
      e.field.description ? (k(), _("p", {
        key: 0,
        id: a,
        class: "text-xs text-muted-color m-0"
      }, F(e.field.description), 1)) : N("", !0),
      e.readonly ? (k(), _("p", vu, F(v.value), 1)) : (k(), _("div", {
        key: 2,
        class: "flex flex-col gap-1.5",
        "aria-describedby": u.value
      }, [
        e.field.multiple ? (k(), _(re, { key: 1 }, [
          (k(!0), _(re, null, we(e.field.options, (x) => (k(), _("div", {
            key: x.value,
            class: "flex items-start gap-2"
          }, [
            le(C(Zt), {
              "model-value": f.value.includes(x.value),
              binary: "",
              "input-id": `${C(i)}-${x.value}`,
              disabled: e.disabled,
              "onUpdate:modelValue": (O) => w(x.value, !!O)
            }, null, 8, ["model-value", "input-id", "disabled", "onUpdate:modelValue"]),
            j("label", {
              for: `${C(i)}-${x.value}`,
              class: "text-sm text-surface-900 dark:text-surface-0 break-words"
            }, [
              fe(F(x.label) + " ", 1),
              x.description ? (k(), _("span", Cu, F(x.description), 1)) : N("", !0)
            ], 8, _u)
          ]))), 128)),
          e.field.allow_other ? (k(), _("div", Pu, [
            le(C(Zt), {
              "model-value": m.value,
              binary: "",
              "input-id": `${C(i)}-other`,
              disabled: e.disabled,
              "onUpdate:modelValue": S[3] || (S[3] = (x) => y(!!x))
            }, null, 8, ["model-value", "input-id", "disabled"]),
            j("div", Tu, [
              j("label", {
                id: s,
                for: `${C(i)}-other-text`,
                class: "text-sm text-surface-900 dark:text-surface-0"
              }, "Other", 8, Ou),
              le(C(Jt), {
                id: `${C(i)}-other-text`,
                modelValue: b.value,
                "onUpdate:modelValue": S[4] || (S[4] = (x) => b.value = x),
                "aria-labelledby": s,
                disabled: e.disabled || !m.value,
                size: "small",
                maxlength: "2000",
                class: "w-full"
              }, null, 8, ["id", "modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64)) : (k(), _(re, { key: 0 }, [
          (k(!0), _(re, null, we(e.field.options, (x) => (k(), _("div", {
            key: x.value,
            class: "flex items-start gap-2"
          }, [
            le(C(Xt), {
              modelValue: d.value,
              "onUpdate:modelValue": S[0] || (S[0] = (O) => d.value = O),
              "input-id": `${C(i)}-${x.value}`,
              name: C(i),
              value: x.value,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "value", "disabled"]),
            j("label", {
              for: `${C(i)}-${x.value}`,
              class: "text-sm text-surface-900 dark:text-surface-0 break-words"
            }, [
              fe(F(x.label) + " ", 1),
              x.description ? (k(), _("span", ku, F(x.description), 1)) : N("", !0)
            ], 8, wu)
          ]))), 128)),
          e.field.allow_other ? (k(), _("div", xu, [
            le(C(Xt), {
              modelValue: d.value,
              "onUpdate:modelValue": S[1] || (S[1] = (x) => d.value = x),
              "input-id": `${C(i)}-other`,
              name: C(i),
              value: Re,
              disabled: e.disabled
            }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
            j("div", Su, [
              j("label", {
                id: s,
                for: `${C(i)}-other-text`,
                class: "text-sm text-surface-900 dark:text-surface-0"
              }, "Other", 8, $u),
              le(C(Jt), {
                id: `${C(i)}-other-text`,
                modelValue: p.value,
                "onUpdate:modelValue": S[2] || (S[2] = (x) => p.value = x),
                "aria-labelledby": s,
                disabled: e.disabled || d.value !== Re,
                size: "small",
                maxlength: "2000",
                class: "w-full"
              }, null, 8, ["id", "modelValue", "disabled"])
            ])
          ])) : N("", !0)
        ], 64))
      ], 8, yu)),
      !e.readonly && e.errors.length > 0 ? (k(), _("ul", {
        key: 3,
        id: l,
        class: "text-xs text-red-600 dark:text-red-400 list-none p-0 m-0 flex flex-col gap-0.5",
        role: "alert"
      }, [
        (k(!0), _(re, null, we(e.errors, (x, O) => (k(), _("li", { key: O }, F(x.message), 1))), 128))
      ])) : N("", !0)
    ], 512));
  }
}), Au = { class: "flex flex-col gap-1" }, Eu = { class: "text-base font-semibold text-surface-900 dark:text-surface-0 break-words" }, ju = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Iu = {
  key: 1,
  class: "text-xs italic text-muted-color"
}, Lu = {
  key: 0,
  class: "text-xs text-red-600 dark:text-red-400 list-none p-0 m-0",
  role: "alert"
}, Nu = { class: "flex items-center gap-2" }, Ru = /* @__PURE__ */ je({
  __name: "ActiveForm",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {}
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const o = e, r = n, i = yo(
      vc(o.state.definition, o.state.data)
    ), a = V({}), l = V([]), s = {};
    function c(b, h) {
      s[b] = h;
    }
    const u = ce(() => !o.submitting);
    function d(b) {
      const h = o.state.definition.fields.find((w) => b.includes(w.id))?.id;
      h && tn(() => s[h]?.focusFirstControl());
    }
    function p(b, h) {
      a.value = b ?? {}, l.value = h ?? [], d(Object.keys(a.value));
    }
    function f() {
      return bc(o.state.definition, i);
    }
    function m() {
      const b = gc(o.state.definition, i);
      if (b.length > 0) {
        a.value = Object.fromEntries(
          b.map((h) => [h, [{ code: "required", message: "This question is required." }]])
        ), l.value = [], d(b);
        return;
      }
      a.value = {}, l.value = [], r("submit", f());
    }
    return t({ setServerErrors: p, retry: () => r("submit", f()) }), (b, h) => (k(), _("form", {
      class: "flex flex-col gap-4 min-w-0",
      onSubmit: Br(m, ["prevent"])
    }, [
      j("div", Au, [
        j("h2", Eu, F(e.state.definition.title), 1),
        e.state.definition.description ? (k(), _("p", ju, F(e.state.definition.description), 1)) : N("", !0),
        e.state.stale ? (k(), _("p", Iu, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ")) : N("", !0)
      ]),
      (k(!0), _(re, null, we(e.state.definition.fields, (w) => (k(), M(fn, {
        key: w.id,
        ref_for: !0,
        ref: (y) => c(w.id, y),
        field: w,
        "model-value": i[w.id],
        errors: a.value[w.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (y) => {
          i[w.id] = y;
        }
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      l.value.length > 0 ? (k(), _("ul", Lu, [
        (k(!0), _(re, null, we(l.value, (w, y) => (k(), _("li", { key: y }, F(w.message), 1))), 128))
      ])) : N("", !0),
      e.banner ? (k(), M(C(ye), {
        key: 1,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: de(() => [
          j("div", Nu, [
            j("span", null, F(e.banner.message), 1),
            e.banner.retryable ? (k(), _("button", {
              key: 0,
              type: "button",
              class: "underline text-sm",
              onClick: h[0] || (h[0] = (w) => r("retry"))
            }, " Retry ")) : N("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : N("", !0),
      j("div", null, [
        le(C(hr), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !u.value
        }, null, 8, ["label", "loading", "disabled"])
      ])
    ], 32));
  }
}), Vu = { class: "flex flex-col gap-4 min-w-0" }, zu = { class: "flex flex-col gap-1" }, Fu = { class: "text-base font-semibold text-surface-900 dark:text-surface-0 break-words" }, Mu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Bu = { class: "text-xs text-muted-color flex flex-col gap-0.5" }, Du = { key: 0 }, Uu = { key: 1 }, Hu = { key: 2 }, Wu = /* @__PURE__ */ je({
  __name: "IdleForm",
  props: {
    state: {}
  },
  setup(e) {
    function t(n) {
      if (!n)
        return null;
      const o = new Date(n);
      return Number.isNaN(o.getTime()) ? null : o.toLocaleString();
    }
    return (n, o) => (k(), _("div", Vu, [
      j("div", zu, [
        j("h2", Fu, F(e.state.definition.title), 1),
        e.state.definition.description ? (k(), _("p", Mu, F(e.state.definition.description), 1)) : N("", !0)
      ]),
      (k(!0), _(re, null, we(e.state.definition.fields, (r) => (k(), M(fn, {
        key: r.id,
        field: r,
        "model-value": e.state.data ? e.state.data[r.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      j("div", Bu, [
        e.state.late ? (k(), _("p", Du, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : N("", !0),
        e.state.delivery === "pending" ? (k(), _("p", Uu, " Submitted. Waiting for the assistant. ")) : N("", !0),
        t(e.state.submitted_at) ? (k(), _("p", Hu, " Answered " + F(t(e.state.submitted_at)), 1)) : N("", !0)
      ])
    ]));
  }
}), qu = { class: "flex flex-col gap-4 min-w-0" }, Ku = { class: "flex flex-col gap-1" }, Gu = { class: "text-base font-semibold text-surface-900 dark:text-surface-0 break-words" }, Yu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, Qu = /* @__PURE__ */ je({
  __name: "NoArtifactNotice",
  props: {
    definition: {}
  },
  setup(e) {
    return (t, n) => (k(), _("div", qu, [
      j("div", Ku, [
        j("h2", Gu, F(e.definition.title), 1),
        e.definition.description ? (k(), _("p", Yu, F(e.definition.description), 1)) : N("", !0)
      ]),
      (k(!0), _(re, null, we(e.definition.fields, (o) => (k(), M(fn, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field"]))), 128)),
      le(C(ye), {
        severity: "secondary",
        closable: !1
      }, {
        default: de(() => [...n[0] || (n[0] = [
          fe(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ]));
  }
}), Zu = { class: "p-3 max-w-full min-w-0" }, Ju = {
  key: 3,
  "no-bg": "",
  title: "Loading form…"
}, Xu = { class: "flex items-center gap-2" }, ed = /* @__PURE__ */ je({
  __name: "WippyForm",
  setup(e) {
    const t = jl(), n = Ll(), o = Il(), r = Ul(), i = ce(() => t.value.definition), a = ce(() => t.value.state), { status: l, state: s, errorMessage: c, reload: u } = Nl(r, a), { submitting: d, submit: p } = Dl(r), f = V(null), m = V(null);
    async function b(w) {
      if (!s.value)
        return;
      f.value = null;
      const y = await p(s.value.form_version, s.value.content_version, w);
      if (y.ok && y.accepted) {
        const $ = y.accepted;
        s.value = {
          ...s.value,
          status: "idle",
          stale: !1,
          late: $.late,
          content_version: $.content_version,
          data: w,
          answer_message_id: $.answer_message_id,
          delivery: $.delivery
        }, o("answer-submitted", { requestId: $.request_id, answerMessageId: $.answer_message_id, late: $.late }), u();
        return;
      }
      if (y.fieldErrors || y.formErrors) {
        m.value?.setServerErrors(y.fieldErrors, y.formErrors);
        return;
      }
      y.shouldReload && u(), f.value = { message: y.message ?? "Could not submit this form.", retryable: y.retryable };
    }
    function h() {
      m.value?.retry();
    }
    return (w, y) => (k(), _("div", Zu, [
      C(n).length > 0 ? (k(), M(C(ye), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: de(() => [...y[1] || (y[1] = [
          fe(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : !C(r) && i.value ? (k(), M(Qu, {
        key: 1,
        definition: i.value
      }, null, 8, ["definition"])) : i.value ? C(l) === "loading" || C(l) === "idle" ? (k(), _("wippy-loading", Ju)) : C(l) === "unsupported" ? (k(), M(C(ye), {
        key: 4,
        severity: "warn",
        closable: !1
      }, {
        default: de(() => [...y[3] || (y[3] = [
          fe(" This form needs a newer Web Host. ", -1)
        ])]),
        _: 1
      })) : C(l) === "error" ? (k(), M(C(ye), {
        key: 5,
        severity: "error",
        closable: !1
      }, {
        default: de(() => [
          j("div", Xu, [
            j("span", null, F(C(c) || "Could not load this form."), 1),
            j("button", {
              type: "button",
              class: "underline text-sm",
              onClick: y[0] || (y[0] = //@ts-ignore
              (...$) => C(u) && C(u)(...$))
            }, " Retry ")
          ])
        ]),
        _: 1
      })) : C(s) && C(s).status === "active" ? (k(), M(Ru, {
        key: 6,
        ref_key: "activeFormRef",
        ref: m,
        state: C(s),
        submitting: C(d),
        banner: f.value,
        onSubmit: b,
        onRetry: h
      }, null, 8, ["state", "submitting", "banner"])) : C(s) && C(s).status === "idle" ? (k(), M(Wu, {
        key: 7,
        state: C(s)
      }, null, 8, ["state"])) : N("", !0) : (k(), M(C(ye), {
        key: 2,
        severity: "error",
        closable: !1
      }, {
        default: de(() => [...y[2] || (y[2] = [
          fe(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), td = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.static{position:static}.m-0{margin:0}.block{display:block}.inline{display:inline}.flex{display:flex}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.list-none{list-style-type:none}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.border-0{border-width:0px}.p-0{padding:0}.p-3{padding:.75rem}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.italic{font-style:italic}.text-red-600{--tw-text-opacity: 1;color:rgb(220 38 38 / var(--tw-text-opacity, 1))}.text-surface-900{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-surface-900) calc(100% * var(--tw-text-opacity, 1)),transparent)}.underline{text-decoration-line:underline}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}@media(prefers-color-scheme:dark){.dark\\:text-red-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:rgb(248 113 113 / var(--tw-text-opacity, 1))}.dark\\:text-surface-0:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-surface-0) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-red-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:rgb(248 113 113 / var(--tw-text-opacity, 1))}.dark\\:text-surface-0:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-surface-0) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class vr extends ll {
  static get wippyConfig() {
    return {
      propsSchema: ul.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: td
    };
  }
  static get vueConfig() {
    return {
      rootComponent: ed,
      plugins: [za],
      providers(t, n) {
        t.provide(dr, n);
      }
    };
  }
}
async function id() {
  return vr;
}
qr(import.meta.url, vr);
export {
  id as webComponent
};
//# sourceMappingURL=index.js.map
