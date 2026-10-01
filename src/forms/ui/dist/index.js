import { ref as H, readonly as ro, getCurrentInstance as un, onMounted as Xt, nextTick as qe, watch as ie, reactive as nr, renderSlot as ce, openBlock as m, createBlock as Y, Teleport as rr, createCommentVNode as V, useId as Ot, mergeProps as F, h as oo, createApp as ao, inject as At, onUnmounted as Et, computed as x, watchEffect as io, createElementBlock as w, createElementVNode as R, createTextVNode as se, toDisplayString as W, resolveComponent as Ge, resolveDirective as or, withDirectives as ar, resolveDynamicComponent as _t, withCtx as oe, normalizeClass as T, Transition as so, defineComponent as be, unref as S, Fragment as ae, renderList as je, normalizeProps as lo, guardReactiveProps as uo, createVNode as Q, withModifiers as co } from "vue";
import { addCollection as po, Icon as ve } from "@iconify/vue";
import * as Jt from "@wippy-fe/proxy";
import { config as dn, addIcons as fo, on as De, applyThemeMode as vt, host as mo, hostCss as ho, loadCss as bo, define as vo } from "@wippy-fe/proxy";
import { getActivePinia as go, createPinia as yo, setActivePinia as wo } from "pinia";
var xo = Object.defineProperty, cn = Object.getOwnPropertySymbols, ko = Object.prototype.hasOwnProperty, _o = Object.prototype.propertyIsEnumerable, pn = (e, t, n) => t in e ? xo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, $o = (e, t) => {
  for (var n in t || (t = {})) ko.call(t, n) && pn(e, n, t[n]);
  if (cn) for (var n of cn(t)) _o.call(t, n) && pn(e, n, t[n]);
  return e;
};
function Ve(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Bt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, l, s;
  if (r && o) {
    if (l = e.length, l != t.length) return !1;
    for (a = l; a-- !== 0; ) if (!Bt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, u = t instanceof Date;
  if (i != u) return !1;
  if (i && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (l = p.length, l !== Object.keys(t).length) return !1;
  for (a = l; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[a])) return !1;
  for (a = l; a-- !== 0; ) if (s = p[a], !Bt(e[s], t[s], n)) return !1;
  return !0;
}
function So(e, t) {
  return Bt(e, t);
}
function en(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function te(e) {
  return !Ve(e);
}
function fn(e, t) {
  return null;
}
function tn(e, t, n) {
  return n ? fn() === fn() : So(e, t);
}
function Po(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (tn(e, n)) return !0;
  }
  return !1;
}
function $e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function ir(e = {}, t = {}) {
  let n = $o({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    $e(t[o]) && o in e && $e(e[o]) ? n[o] = ir(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Co(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : ir(t, n), {});
}
function he(e, ...t) {
  return en(e) ? e(...t) : e;
}
function fe(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function _e(e) {
  return fe(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function nn(e, t = "", n = {}) {
  let r = _e(t).split("."), o = r.shift();
  if (o) {
    if ($e(e)) {
      let a = Object.keys(e).find((l) => _e(l) === o) || "";
      return nn(he(e[a], n), r.join("."), n);
    }
    return;
  }
  return he(e, n);
}
function sr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function To(e) {
  return te(e) && !isNaN(e);
}
function Ie(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Oo(...e) {
  return Co(...e);
}
function Ke(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ao(e) {
  return fe(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function lr(e) {
  return fe(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ur() {
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
function Se(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [Se(...r)] : Object.entries(r).map(([l, s]) => s ? l : void 0);
        t = a.length ? t.concat(a.filter((l) => !!l)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Eo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function No(e, t) {
  if (e && t) {
    let n = (r) => {
      Eo(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
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
function mn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function jo(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Lo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Io(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Lo(e));
}
function mt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function $t(e, t = {}) {
  if (mt(e)) {
    let n = (r, o) => {
      var a, l;
      let s = (a = e?.$attrs) != null && a[r] ? [(l = e?.$attrs) == null ? void 0 : l[r]] : [];
      return [o].flat().reduce((i, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") i.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            i = c.length ? i.concat(c.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? $t(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Ro(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return $t(r, t), r.append(...n), r;
  }
}
function zo(e, t) {
  return mt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Vo(e, t) {
  if (mt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function hn(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Bo(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || mn(document.documentElement) || mn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Do(e, t) {
  return e ? e.offsetHeight : 0;
}
function bn(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function dr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Fo(e, t = "", n) {
  mt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var gt = {};
function Mo(e = "pui_id_") {
  return Object.hasOwn(gt, e) || (gt[e] = 0), gt[e]++, `${e}${gt[e]}`;
}
var qo = Object.defineProperty, Uo = Object.defineProperties, Ho = Object.getOwnPropertyDescriptors, St = Object.getOwnPropertySymbols, cr = Object.prototype.hasOwnProperty, pr = Object.prototype.propertyIsEnumerable, vn = (e, t, n) => t in e ? qo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ye = (e, t) => {
  for (var n in t || (t = {})) cr.call(t, n) && vn(e, n, t[n]);
  if (St) for (var n of St(t)) pr.call(t, n) && vn(e, n, t[n]);
  return e;
}, Rt = (e, t) => Uo(e, Ho(t)), Pe = (e, t) => {
  var n = {};
  for (var r in e) cr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && St) for (var r of St(e)) t.indexOf(r) < 0 && pr.call(e, r) && (n[r] = e[r]);
  return n;
}, Wo = ur(), le = Wo, Ye = /{([^}]*)}/g, fr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, mr = /var\([^)]+\)/g;
function gn(e) {
  return fe(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ko(e) {
  return $e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Go(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Dt(e = "", t = "") {
  return Go(`${fe(e, !1) && fe(t, !1) ? `${e}-` : e}${t}`);
}
function hr(e = "", t = "") {
  return `--${Dt(e, t)}`;
}
function Yo(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function br(e, t = "", n = "", r = [], o) {
  if (fe(e)) {
    let a = e.trim();
    if (Yo(a)) return;
    if (Ie(a, Ye)) {
      let l = a.replaceAll(Ye, (s) => {
        let i = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Ie(u, d)));
        return `var(${hr(n, lr(i.join("-")))}${te(o) ? `, ${o}` : ""})`;
      });
      return Ie(l.replace(mr, "0"), fr) ? `calc(${l})` : l;
    }
    return a;
  } else if (To(e)) return e;
}
function Qo(e, t, n) {
  fe(t, !1) && e.push(`${t}:${n};`);
}
function Fe(e, t) {
  return e ? `${e}{${t}}` : "";
}
function vr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(l, s) {
    let i = [], u = 0, d = "", c = null, p = 0;
    for (; u <= l.length; ) {
      let f = l[u];
      if ((f === '"' || f === "'" || f === "`") && l[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === l.length) && p === 0)) {
        let b = d.trim();
        b.startsWith("dt(") ? i.push(vr(b, s)) : i.push(r(b)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
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
var Re = (...e) => Zo(ee.getTheme(), ...e), Zo = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = ee.defaults || {}, { prefix: l, transform: s } = e?.options || a || {}, i = Ie(t, Ye) ? t : `{${t}}`;
    return r === "value" || Ve(r) && s === "strict" ? ee.getTokenValue(t) : br(i, void 0, l, [o.excludedKeyRegex], n);
  }
  return "";
};
function yt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var l;
      return r + o + ((l = he(t[a], { dt: Re })) != null ? l : "");
    }, "");
    return vr(n, Re);
  }
  return he(e, { dt: Re });
}
function Xo(e, t = {}) {
  let n = ee.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, l = [], s = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: d, path: c } = i.pop();
    for (let p in d) {
      let f = d[p], b = Ko(f), k = Ie(p, a) ? Dt(c) : Dt(c, lr(p));
      if ($e(b)) i.push({ node: b, path: k });
      else {
        let v = hr(k), y = br(b, k, r, [a]);
        Qo(s, v, y);
        let O = k;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), l.push(O.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: Fe(o, u) };
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
  return Xo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, l, s, i, u, d, c;
  let { preset: p, options: f } = t, b, k, v, y, O, C, h;
  if (te(p) && f.transform !== "strict") {
    let { primitive: A, semantic: B, extend: Z } = p, z = B || {}, { colorScheme: g } = z, I = Pe(z, ["colorScheme"]), _ = Z || {}, { colorScheme: E } = _, D = Pe(_, ["colorScheme"]), K = g || {}, { dark: j } = K, J = Pe(K, ["dark"]), me = E || {}, { dark: we } = me, Oe = Pe(me, ["dark"]), $ = te(A) ? this._toVariables({ primitive: A }, f) : {}, P = te(I) ? this._toVariables({ semantic: I }, f) : {}, L = te(J) ? this._toVariables({ light: J }, f) : {}, U = te(j) ? this._toVariables({ dark: j }, f) : {}, ne = te(D) ? this._toVariables({ semantic: D }, f) : {}, xe = te(Oe) ? this._toVariables({ light: Oe }, f) : {}, ht = te(we) ? this._toVariables({ dark: we }, f) : {}, [Lt, Ae] = [(a = $.declarations) != null ? a : "", $.tokens], [bt, Mr] = [(l = P.declarations) != null ? l : "", P.tokens || []], [qr, Ur] = [(s = L.declarations) != null ? s : "", L.tokens || []], [Hr, Wr] = [(i = U.declarations) != null ? i : "", U.tokens || []], [Kr, Gr] = [(u = ne.declarations) != null ? u : "", ne.tokens || []], [Yr, Qr] = [(d = xe.declarations) != null ? d : "", xe.tokens || []], [Zr, Xr] = [(c = ht.declarations) != null ? c : "", ht.tokens || []];
    b = this.transformCSS(e, Lt, "light", "variable", f, r, o), k = Ae;
    let Jr = this.transformCSS(e, `${bt}${qr}`, "light", "variable", f, r, o), eo = this.transformCSS(e, `${Hr}`, "dark", "variable", f, r, o);
    v = `${Jr}${eo}`, y = [.../* @__PURE__ */ new Set([...Mr, ...Ur, ...Wr])];
    let to = this.transformCSS(e, `${Kr}${Yr}color-scheme:light`, "light", "variable", f, r, o), no = this.transformCSS(e, `${Zr}color-scheme:dark`, "dark", "variable", f, r, o);
    O = `${to}${no}`, C = [.../* @__PURE__ */ new Set([...Gr, ...Qr, ...Xr])], h = he(p.css, { dt: Re });
  }
  return { primitive: { css: b, tokens: k }, semantic: { css: v, tokens: y }, global: { css: O, tokens: C }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: l }) {
  var s, i, u;
  let d, c, p;
  if (te(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), b = t, { colorScheme: k, extend: v, css: y } = b, O = Pe(b, ["colorScheme", "extend", "css"]), C = v || {}, { colorScheme: h } = C, A = Pe(C, ["colorScheme"]), B = k || {}, { dark: Z } = B, z = Pe(B, ["dark"]), g = h || {}, { dark: I } = g, _ = Pe(g, ["dark"]), E = te(O) ? this._toVariables({ [f]: ye(ye({}, O), A) }, n) : {}, D = te(z) ? this._toVariables({ [f]: ye(ye({}, z), _) }, n) : {}, K = te(Z) ? this._toVariables({ [f]: ye(ye({}, Z), I) }, n) : {}, [j, J] = [(s = E.declarations) != null ? s : "", E.tokens || []], [me, we] = [(i = D.declarations) != null ? i : "", D.tokens || []], [Oe, $] = [(u = K.declarations) != null ? u : "", K.tokens || []], P = this.transformCSS(f, `${j}${me}`, "light", "variable", n, o, a, l), L = this.transformCSS(f, Oe, "dark", "variable", n, o, a, l);
    d = `${P}${L}`, c = [.../* @__PURE__ */ new Set([...J, ...we, ...$])], p = he(y, { dt: Re });
  }
  return { css: d, tokens: c, style: p };
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
  return o ? `@layer ${he(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let l = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), s = Object.entries(r).reduce((i, [u, d]) => i.push(`${u}="${d}"`) && i, []).join(" ");
  return Object.entries(l || {}).reduce((i, [u, d]) => {
    if ($e(d) && Object.hasOwn(d, "css")) {
      let c = Ke(d.css), p = `${u}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${c}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var l;
  let s = { name: e, theme: t, params: n, set: o, defaults: a }, i = (l = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(r).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Ke(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(s, i = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: i, value: void 0 };
    u.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Ye.test(this.value)) {
      let c = this.value.trim().replace(Ye, (p) => {
        var f;
        let b = p.slice(1, -1), k = this.tokens[b];
        if (!k) return console.warn(`Token not found for path: ${b}`), "__UNRESOLVED__";
        let v = k.computed(s, i, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (f = v?.value) != null ? f : "__UNRESOLVED__";
      });
      d = fr.test(c.replace(mr, "0")) ? `calc(${c})` : c;
    }
    return Ve(i.binding) && delete i.binding, u.pop(), { colorScheme: s, path: this.path, paths: i, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (s, i, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let p = Ie(d, t.variable.excludedKeyRegex) ? i : i ? `${i}.${gn(d)}` : gn(d), f = u ? `${u}.${d}` : d;
      $e(c) ? l(c, p, f) : (o[p] || (o[p] = { paths: [], computed: (b, k = {}, v = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, k.binding, v);
        if (b && b !== "none") for (let y = 0; y < o[p].paths.length; y++) {
          let O = o[p].paths[y];
          if (O.scheme === b) return O.computed(b, k.binding, v);
        }
        return o[p].paths.map((y) => y.computed(y.scheme, k[y.scheme], v));
      } }), o[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return l(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((i) => !Ie(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, l = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, i) => {
    let u = i, { colorScheme: d } = u, c = Pe(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Fe(te(t) ? `${e}${t},${e} ${t}` : e, r) : Fe(e, Fe(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, l, s) {
  if (te(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, l);
      t = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (te(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, c, t)), d), "") : Fe(s ?? ":root,:host", t);
    }
    if (i) {
      let u = { name: "primeui" };
      $e(i) && (u.name = he(i.name, { name: e, type: r })), te(u.name) && (t = Fe(`@layer ${u.name}`, t), a?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, ee = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Rt(ye({}, t), { options: ye(ye({}, this.defaults.options), t.options) }), this._tokens = ge.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Rt(ye({}, this.theme), { preset: e }), this._tokens = ge.createTokens(e, this.defaults), this.clearLoadedStyleNames(), le.emit("preset:change", e), le.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Rt(ye({}, this.theme), { options: e }), this.clearLoadedStyleNames(), le.emit("options:change", e), le.emit("theme:change", this.theme);
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
}, Jo = `
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
function yn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function wn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yn(Object(n), !0).forEach(function(r) {
      ea(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ea(e, t, n) {
  return (t = ta(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ta(e) {
  var t = na(e, "string");
  return Qe(t) == "symbol" ? t : t + "";
}
function na(e, t) {
  if (Qe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Qe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ra(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  un() && un().components ? Xt(e) : t ? e() : qe(e);
}
var oa = 0;
function aa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = H(!1), r = H(e), o = H(null), a = dr() ? window.document : void 0, l = t.document, s = l === void 0 ? a : l, i = t.immediate, u = i === void 0 ? !0 : i, d = t.manual, c = d === void 0 ? !1 : d, p = t.name, f = p === void 0 ? "style_".concat(++oa) : p, b = t.id, k = b === void 0 ? void 0 : b, v = t.media, y = v === void 0 ? void 0 : v, O = t.nonce, C = O === void 0 ? void 0 : O, h = t.first, A = h === void 0 ? !1 : h, B = t.onMounted, Z = B === void 0 ? void 0 : B, z = t.onUpdated, g = z === void 0 ? void 0 : z, I = t.onLoad, _ = I === void 0 ? void 0 : I, E = t.props, D = E === void 0 ? {} : E, K = function() {
  }, j = function(we) {
    var Oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var $ = wn(wn({}, D), Oe), P = $.name || f, L = $.id || k, U = $.nonce || C;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(P, '"]')) || s.getElementById(L) || s.createElement("style"), o.value.isConnected || (r.value = we || e, $t(o.value, {
        type: "text/css",
        id: L,
        media: y,
        nonce: U
      }), A ? s.head.prepend(o.value) : s.head.appendChild(o.value), Fo(o.value, "data-primevue-style-id", P), $t(o.value, $), o.value.onload = function(ne) {
        return _?.(ne, {
          name: P
        });
      }, Z?.(P)), !n.value && (K = ie(r, function(ne) {
        o.value.textContent = ne, g?.(P);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, J = function() {
    !s || !n.value || (K(), Io(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !c && ra(j), {
    id: k,
    name: f,
    el: o,
    css: r,
    unload: J,
    load: j,
    isLoaded: ro(n)
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
var xn, kn, _n, $n;
function Sn(e, t) {
  return ua(e) || la(e, t) || sa(e, t) || ia();
}
function ia() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sa(e, t) {
  if (e) {
    if (typeof e == "string") return Pn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pn(e, t) : void 0;
  }
}
function Pn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function la(e, t) {
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
function ua(e) {
  if (Array.isArray(e)) return e;
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
function zt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Cn(Object(n), !0).forEach(function(r) {
      da(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function da(e, t, n) {
  return (t = ca(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ca(e) {
  var t = pa(e, "string");
  return Ze(t) == "symbol" ? t : t + "";
}
function pa(e, t) {
  if (Ze(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ze(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function wt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var fa = function(t) {
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
}, ma = {}, ha = {}, X = {
  name: "base",
  css: fa,
  style: Jo,
  classes: ma,
  inlineStyles: ha,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(yt(xn || (xn = wt(["", ""])), t));
    return te(o) ? aa(Ke(o), zt({
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
      return ee.transformCSS(n.name || t.name, "".concat(o).concat(yt(kn || (kn = wt(["", ""])), r)));
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
      var r = he(this.css, {
        dt: Re
      }) || "", o = Ke(yt(_n || (_n = wt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(l, s) {
        var i = Sn(s, 2), u = i[0], d = i[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
      }, []).join(" ");
      return te(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = yt($n || ($n = wt(["", ""])), he(this.style, {
        dt: Re
      })), l = Ke(ee.transformCSS(o, a)), s = Object.entries(n).reduce(function(i, u) {
        var d = Sn(u, 2), c = d[0], p = d[1];
        return i.push("".concat(c, '="').concat(p, '"')) && i;
      }, []).join(" ");
      te(l) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return zt(zt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ne = ur();
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function Tn(e, t) {
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
    t % 2 ? Tn(Object(n), !0).forEach(function(r) {
      ba(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tn(Object(n)).forEach(function(r) {
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
  return Xe(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ya = {
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
}, wa = Symbol();
function xa(e, t) {
  var n = {
    config: nr(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(wa, n), ka(), _a(e, n), n;
}
var Me = [];
function ka() {
  le.clear(), Me.forEach(function(e) {
    return e?.();
  }), Me = [];
}
function _a(e, t) {
  var n = H(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !ee.isStyleNameLoaded("common")) {
      var d, c, p = ((d = X.getCommonTheme) === null || d === void 0 ? void 0 : d.call(X)) || {}, f = p.primitive, b = p.semantic, k = p.global, v = p.style, y = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      X.load(f?.css, xt({
        name: "primitive-variables"
      }, y)), X.load(b?.css, xt({
        name: "semantic-variables"
      }, y)), X.load(k?.css, xt({
        name: "global-variables"
      }, y)), X.loadStyle(xt({
        name: "global-style"
      }, y), v), ee.setLoadedStyleName("common");
    }
  };
  le.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = ie(t.config, function(i, u) {
    Ne.emit("config:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ie(function() {
    return t.config.ripple;
  }, function(i, u) {
    Ne.emit("config:ripple:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = ie(function() {
    return t.config.theme;
  }, function(i, u) {
    n.value || ee.setTheme(i), t.config.unstyled || r(), n.value = !1, Ne.emit("config:theme:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ie(function() {
    return t.config.unstyled;
  }, function(i, u) {
    !i && t.config.theme && r(), Ne.emit("config:unstyled:change", {
      newValue: i,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Me.push(o), Me.push(a), Me.push(l), Me.push(s);
}
var $a = {
  install: function(t, n) {
    var r = Oo(ya, n);
    xa(t, r);
  }
}, gr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = dr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Sa(e, t, n, r, o, a) {
  return a.inline ? ce(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (m(), Y(rr, {
    key: 1,
    to: n.appendTo
  }, [ce(e.$slots, "default")], 8, ["to"])) : V("", !0);
}
gr.render = Sa;
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
function Pa() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Ot();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var On = X.extend({
  name: "common"
});
function Je(e) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Je(e);
}
function Ca(e) {
  return xr(e) || Ta(e) || wr(e) || yr();
}
function Ta(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function He(e, t) {
  return xr(e) || Oa(e, t) || wr(e, t) || yr();
}
function yr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wr(e, t) {
  if (e) {
    if (typeof e == "string") return Ft(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ft(e, t) : void 0;
  }
}
function Ft(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Oa(e, t) {
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
function xr(e) {
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
function q(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? An(Object(n), !0).forEach(function(r) {
      We(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function We(e, t, n) {
  return (t = Aa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Aa(e) {
  var t = Ea(e, "string");
  return Je(t) == "symbol" ? t : t + "";
}
function Ea(e, t) {
  if (Je(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Je(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ue = {
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
    var t, n, r, o, a, l, s, i, u, d, c, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, b = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = b || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var k = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, v = k ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, y = k ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Pa(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = zo(mt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = q({
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
      return en(t) ? t.apply(void 0, r) : F.apply(void 0, r);
    },
    _load: function() {
      Ee.isStyleNameLoaded("base") || (X.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ee.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ee.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (On.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ee.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      te(t) && X.load(t, q({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!ee.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, l = a.primitive, s = a.semantic, i = a.global, u = a.style;
          X.load(l?.css, q({
            name: "primitive-variables"
          }, this.$styleOptions)), X.load(s?.css, q({
            name: "semantic-variables"
          }, this.$styleOptions)), X.load(i?.css, q({
            name: "global-variables"
          }, this.$styleOptions)), X.loadStyle(q({
            name: "global-style"
          }, this.$styleOptions), u), ee.setLoadedStyleName("common");
        }
        if (!ee.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, b = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, k = b.css, v = b.style;
          (p = this.$style) === null || p === void 0 || p.load(k, q({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(q({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), ee.setLoadedStyleName(this.$style.name);
        }
        if (!ee.isStyleNameLoaded("layer-order")) {
          var y, O, C = (y = this.$style) === null || y === void 0 || (O = y.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(y);
          X.load(C, q({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), ee.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, l = a.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, q({
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
      Ee.clearLoadedStyleNames(), le.on("theme:change", t);
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
      return nn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, p = a ? l ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, f = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, q(q({}, o), {}, {
        global: p || {}
      })), b = this._getPTDatasets(r);
      return u || !u && f ? c ? this._mergeProps(c, p, f, b) : q(q(q({}, p), f), b) : q(q({}, f), b);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return F(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && te((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && q(q({}, r === "root" && q(q(We({}, "".concat(o, "name"), _e(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && We({}, "".concat(o, "extend"), _e(this.$.type.name))), {}, We({}, "".concat(this.$attrSelector), ""))), {}, We({}, "".concat(o, "section"), _e(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return fe(t) || sr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(s) {
        var i, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(s) : s, c = _e(r), p = _e(n.$name);
        return (i = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && i !== void 0 ? i : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(k) {
        return n(k, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var l, s = t._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, i = s.mergeSections, u = i === void 0 ? !0 : i, d = s.mergeProps, c = d === void 0 ? !1 : d, p = a(t.originalValue), f = a(t.value);
        return p === void 0 && f === void 0 ? void 0 : fe(f) ? f : fe(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : q(q({}, p), f) : f;
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
      return this._getPTValue(this.pt, t, q(q({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = F(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, q({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, q(q({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, q(q({}, this.$params), r)), a = this._getOptionValue(On.inlineStyles, t, q(q({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return he(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, q({}, n.$params)) || he(r, q({}, n.$params));
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
      return q(q({
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
        var r = He(n, 2), o = r[0], a = r[1], l = o.split(":"), s = Ca(l), i = Ft(s).slice(1);
        return i?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? a : {}), u[d];
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
}, Na = `
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
`, ja = X.extend({
  name: "baseicon",
  css: Na
});
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
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
function Nn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(r) {
      La(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function La(e, t, n) {
  return (t = Ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ia(e) {
  var t = Ra(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function Ra(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Nt = {
  name: "BaseIcon",
  extends: Ue,
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
  style: ja,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ve(this.label);
      return Nn(Nn({}, !this.isUnstyled && {
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
function jn(e, t) {
  return Da(e) || Ba(e, t) || Va(e, t) || za();
}
function za() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Va(e, t) {
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
function Ba(e, t) {
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
function Da(e) {
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
function G(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? In(Object(n), !0).forEach(function(r) {
      Mt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Mt(e, t, n) {
  return (t = Fa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fa(e) {
  var t = Ma(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function Ma(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var M = {
  _getMeta: function() {
    return [$e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], he($e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: nn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = M._getOptionValue.apply(M, arguments);
      return fe(O) || sr(O) ? {
        class: O
      } : O;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, b = s ? M._useDefaultPT(r, r.defaultPT(), i, a, l) : void 0, k = M._usePT(r, M._getPT(o, r.$name), i, a, G(G({}, l), {}, {
      global: b || {}
    })), v = M._getPTDatasets(r, a);
    return c || !c && k ? f ? M._mergeProps(r, f, b, k, v) : G(G(G({}, b), k), v) : G(G({}, k), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return G(G({}, n === "root" && Mt({}, "".concat(r, "name"), _e(t.$name))), {}, Mt({}, "".concat(r, "section"), _e(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, i = r ? r(l) : l, u = _e(n);
      return (s = i?.[u]) !== null && s !== void 0 ? s : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, l = function(v) {
      return r(v, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, i = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = i.mergeSections, d = u === void 0 ? !0 : u, c = i.mergeProps, p = c === void 0 ? !1 : c, f = l(n.originalValue), b = l(n.value);
      return f === void 0 && b === void 0 ? void 0 : fe(b) ? b : fe(f) ? f : d || !d && b ? p ? M._mergeProps(t, p, f, b) : G(G({}, f), b) : b;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return M._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = M._getConfig(r, o), l = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    M._loadCoreStyles(n, l), M._loadThemeStyles(n, l), M._loadScopedThemeStyles(n, l), M._removeThemeListeners(n), n.$loadStyles = function() {
      return M._loadThemeStyles(n, l);
    }, M._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ee.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      X.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ee.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!ee.isStyleNameLoaded("common")) {
        var l, s, i = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = i.primitive, d = i.semantic, c = i.global, p = i.style;
        X.load(u?.css, G({
          name: "primitive-variables"
        }, a)), X.load(d?.css, G({
          name: "semantic-variables"
        }, a)), X.load(c?.css, G({
          name: "global-variables"
        }, a)), X.loadStyle(G({
          name: "global-style"
        }, a), p), ee.setLoadedStyleName("common");
      }
      if (!ee.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var f, b, k, v, y = ((f = o.$style) === null || f === void 0 || (b = f.getDirectiveTheme) === null || b === void 0 ? void 0 : b.call(f)) || {}, O = y.css, C = y.style;
        (k = o.$style) === null || k === void 0 || k.load(O, G({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (v = o.$style) === null || v === void 0 || v.loadStyle(G({
          name: "".concat(o.$style.name, "-style")
        }, a), C), ee.setLoadedStyleName(o.$style.name);
      }
      if (!ee.isStyleNameLoaded("layer-order")) {
        var h, A, B = (h = o.$style) === null || h === void 0 || (A = h.getLayerOrderThemeCSS) === null || A === void 0 ? void 0 : A.call(h);
        X.load(B, G({
          name: "layer-order",
          first: !0
        }, a)), ee.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, l, s = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = s.css, u = (l = t.$style) === null || l === void 0 ? void 0 : l.load(i, G({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ee.clearLoadedStyleNames(), le.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    le.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, l) {
    var s, i, u = "on".concat(Ao(n)), d = M._getConfig(o, a), c = r?.$instance, p = M._usePT(c, M._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, t), M._getOptionValue, "hooks.".concat(u)), f = M._useDefaultPT(c, d == null || (i = d.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], M._getOptionValue, "hooks.".concat(u)), b = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: l
    };
    p?.(c, b), f?.(c, b);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return en(t) ? t.apply(void 0, r) : F.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, i, u, d, c) {
      var p, f, b, k;
      i._$instances = i._$instances || {};
      var v = M._getConfig(u, d), y = i._$instances[t] || {}, O = Ve(y) ? G(G({}, n), n?.methods) : {};
      i._$instances[t] = G(G({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || i || void 0,
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
        $primevueConfig: v,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return M._getPT(v?.pt, void 0, function(h) {
            var A;
            return h == null || (A = h.directives) === null || A === void 0 ? void 0 : A[t];
          });
        },
        isUnstyled: function() {
          var h, A;
          return ((h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (A = i._$instances[t]) === null || A === void 0 || (A = A.$binding) === null || A === void 0 || (A = A.value) === null || A === void 0 ? void 0 : A.unstyled : v?.unstyled;
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
          var h, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return M._getPTValue(i._$instances[t], (h = i._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, A, G({}, B));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", B = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return M._getPTValue(i._$instances[t], h, A, B, !1);
        },
        cx: function() {
          var h, A, B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", Z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = i._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : M._getOptionValue((A = i._$instances[t]) === null || A === void 0 || (A = A.$style) === null || A === void 0 ? void 0 : A.classes, B, G({}, Z));
        },
        sx: function() {
          var h, A = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, Z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return B ? M._getOptionValue((h = i._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, A, G({}, Z)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (f = (b = i.$instance)[s]) === null || f === void 0 || f.call(b, i, u, d, c), i["$".concat(t)] = i.$instance, M._hook(t, s, i, u, d, c), i.$pd || (i.$pd = {}), i.$pd[t] = G(G({}, (k = i.$pd) === null || k === void 0 ? void 0 : k[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(s) {
      var i, u, d, c = s._$instances[t], p = c?.watch, f = function(v) {
        var y, O = v.newValue, C = v.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(c, O, C);
      }, b = function(v) {
        var y, O = v.newValue, C = v.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, O, C);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": b
      }, p == null || (i = p.config) === null || i === void 0 || i.call(c, c?.$primevueConfig), Ne.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ne.on("config:ripple:change", b);
    }, a = function(s) {
      var i = s._$instances[t].$watchersCallback;
      i && (Ne.off("config:change", i.config), Ne.off("config:ripple:change", i["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, i, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: Mo("pd")
        }, r("created", s, i, u, d);
      },
      beforeMount: function(s, i, u, d) {
        var c;
        M._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("beforeMount", s, i, u, d), o(s);
      },
      mounted: function(s, i, u, d) {
        var c;
        M._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("mounted", s, i, u, d);
      },
      beforeUpdate: function(s, i, u, d) {
        r("beforeUpdate", s, i, u, d);
      },
      updated: function(s, i, u, d) {
        var c;
        M._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, i, u), r("updated", s, i, u, d);
      },
      beforeUnmount: function(s, i, u, d) {
        var c;
        a(s), M._removeThemeListeners((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", s, i, u, d);
      },
      unmounted: function(s, i, u, d) {
        var c;
        (c = s.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", s, i, u, d);
      }
    };
  },
  extend: function() {
    var t = M._getMeta.apply(M, arguments), n = jn(t, 2), r = n[0], o = n[1];
    return G({
      extend: function() {
        var l = M._getMeta.apply(M, arguments), s = jn(l, 2), i = s[0], u = s[1];
        return M.extend(i, G(G(G({}, o), o?.methods), u));
      }
    }, M._extend(r, o));
  }
}, qa = `
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
`, Ua = {
  root: "p-ink"
}, Ha = X.extend({
  name: "ripple-directive",
  style: qa,
  classes: Ua
}), Wa = M.extend({
  style: Ha
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function Ka(e) {
  return Za(e) || Qa(e) || Ya(e) || Ga();
}
function Ga() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ya(e, t) {
  if (e) {
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function Qa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Za(e) {
  if (Array.isArray(e)) return qt(e);
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Rn(e, t, n) {
  return (t = Xa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xa(e) {
  var t = Ja(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Ja(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var kr = Wa.extend("ripple", {
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
      n || (n = Ro("span", Rn(Rn({
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
        if (!this.isUnstyled() && It(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !hn(o) && !bn(o)) {
          var a = Math.max(jo(r), Do(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var l = Bo(r), s = t.pageX - l.left + document.body.scrollTop - bn(o) / 2, i = t.pageY - l.top + document.body.scrollLeft - hn(o) / 2;
        o.style.top = i + "px", o.style.left = s + "px", !this.isUnstyled() && No(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && It(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && It(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ka(t.children).find(function(n) {
        return Vo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const ei = "data-wippy-overlay-layer";
function _r() {
  return typeof window < "u" && typeof window.document < "u";
}
function $r() {
  return _r() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ti() {
  return $r() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const ni = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ri = 0;
const Pt = /* @__PURE__ */ new WeakMap();
function zn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function oi(e, t) {
  if (!ni.test(e.className))
    return;
  const n = e.style.cssText;
  zn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Pt.has(e)) {
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && zn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Pt.set(e, r);
  }
}
function rn(e) {
  const t = Pt.get(e);
  t && (t.disconnect(), Pt.delete(e));
}
function ai(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ut(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ct = /* @__PURE__ */ new Set(), on = /* @__PURE__ */ new WeakMap();
let Vn = !1, Ht = !1;
function ii() {
  Ht = !1;
  for (const e of Ct) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && rn(t);
      Ct.delete(e), on.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ut(e);
  }
}
function Bn() {
  Ht || (Ht = !0, requestAnimationFrame(ii));
}
function si(e) {
  const t = document.createElement("div");
  t.setAttribute(ei, "");
  const n = $r();
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
    for (const l of o) {
      if (a)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && oi(s, a);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && rn(s);
    }
    t.isConnected && t.childElementCount > 0 && Ut(t);
  });
  return r.observe(t, { childList: !0 }), on.set(t, r), Ct.add(t), Vn || (Vn = !0, window.addEventListener("scroll", Bn, { capture: !0, passive: !0 }), window.addEventListener("resize", Bn, { passive: !0 })), t;
}
function Dn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = si(e.hostRoot), ti())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ri}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Fn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && rn(t);
    Ct.delete(e.layer), on.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Mn = !1;
function li() {
  if (Mn)
    return;
  Mn = !0;
  const e = gr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    _r() && (this.hostRoot = ai(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Dn(this), this.$watch("inline", (t) => {
      t ? Fn(this) : Dn(this);
    })));
  }, e.render = function() {
    return this.inline ? ce(this.$slots, "default", { key: 0 }) : this.mounted ? oo(rr, { key: 1, to: this.resolvedTarget || document.body }, [
      ce(this.$slots, "default")
    ]) : V("", !0);
  }, e.unmounted = function() {
    Fn(this);
  };
}
const ui = {
  install: (e) => {
    li(), e.use($a, { theme: "none" });
  }
};
var Wt = "data-wippy-visible";
function qn(e) {
  const t = e.getAttribute(Wt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var di = Object.defineProperty, ci = (e, t, n) => t in e ? di(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, re = (e, t, n) => ci(e, typeof t != "symbol" ? t + "" : t, n), pi = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], fi = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Un(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function mi(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [l, s] of Object.entries(o)) {
            const i = typeof s == "string" ? Un(l) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? Un(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function hi(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${fi} {
${t}
}`;
}
function bi(e, t) {
  const n = hi(t);
  n && Sr(e, n, "@wippy-fe/css-variables-bridge");
}
function vi(e, t) {
  const r = (t ?? pi).map(async (o) => {
    const a = ho[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await bo(a);
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
function gi(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Sr(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function yi(e, t) {
  Sr(e, t, "@wippy-fe/custom-css");
}
function Pr(e) {
  return e.__wippyHost ?? null;
}
function wi(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function xi(e, t, n) {
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
    const l = e.getAttribute(o), s = wi(o);
    if (l === null) {
      a.default !== void 0 && (n[s] = a.default);
      continue;
    }
    const i = xi(o, l, a);
    i.error ? r.push(i.error) : n[s] = i.value;
  }
  return { props: n, errors: r };
}
var ki = class {
  constructor(e, t) {
    re(this, "_props"), re(this, "_errors"), re(this, "_content"), re(this, "_hostVisibility"), re(this, "_propsListeners", /* @__PURE__ */ new Set()), re(this, "_contentListeners", /* @__PURE__ */ new Set()), re(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), re(this, "_disposed", !1), re(this, "_emitToDom"), re(this, "props"), re(this, "events"), re(this, "content"), re(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, _i = class extends HTMLElement {
  constructor() {
    super(), re(this, "_internals"), re(this, "_contentObserver", null), re(this, "_initialized", !1), re(this, "_container", null), re(this, "_reactive", null), re(this, "_lastProps", null), re(this, "_lastErrors", []), re(this, "_lastContent", null), re(this, "_themeUnsub", null), re(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = qn(this);
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
    return Pr(this);
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
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new ki(
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
        this.onInit(n), e.inlineCss && gi(n, e.inlineCss);
        try {
          const u = dn?.theming, d = mi(
            u?.global?.cssVariables,
            u?.children?.cssVariables
          );
          bi(n, d);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const u = dn?.theming, d = [u?.global?.customCSS, u?.children?.customCSS].filter(Boolean).join(`
`);
            d && yi(n, d);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && vi(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, fo(po);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = De("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Vt(this, e.propsSchema);
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
  _applyTheme(e = mo.getThemeMode?.()) {
    vt(e, this), this._container && vt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), vt("auto", this), this._container && vt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Wt) {
      const s = this._hostVisible, i = qn(this);
      if (i === s)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, s), this.onHostVisibilityChanged(i, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Vt(this, r.propsSchema);
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
function $i(e) {
  return e.__wippyHostBus ?? null;
}
function Si(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Pi = Object.defineProperty, Ci = (e, t, n) => t in e ? Pi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Be = (e, t, n) => Ci(e, typeof t != "symbol" ? t + "" : t, n), Ti = /* @__PURE__ */ Symbol("wippy:emit"), Cr = /* @__PURE__ */ Symbol("wippy:props"), Tr = /* @__PURE__ */ Symbol("wippy:props_error"), Oi = /* @__PURE__ */ Symbol("wippy:content"), Ai = /* @__PURE__ */ Symbol("wippy:panel-id"), Ei = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ni = /* @__PURE__ */ Symbol("wippy:host"), ji = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Li() {
  const e = At(Cr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ii() {
  const e = At(Tr);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Ri = class extends _i {
  constructor() {
    super(...arguments), Be(this, "_vueApp", null), Be(this, "_propsRef", H({})), Be(this, "_errorsRef", H([])), Be(this, "_contentRef", H(null)), Be(this, "_hostVisibilityRef", H(null)), Be(this, "_bridgeAbort", null);
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
      const d = go(), c = ao(u.rootComponent);
      this._vueApp = c;
      const p = yo();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (c.use(p), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(Cr, this._propsRef), c.provide(Tr, this._errorsRef), c.provide(Ti, this.emitEvent.bind(this)), c.provide(Oi, this._contentRef), c.provide(ji, this._hostVisibilityRef), c.provide(Ai, Si(this)), c.provide(Ei, $i(this)), c.provide(Ni, Pr(this)), u.providers && u.providers(c, this), c.mount(t), d && wo(d);
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
const zi = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version (currently 1). A value other than 1, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead.' }, definition: { type: "object", default: null, description: 'The questions to ask: `title`, optional `description`, and `fields`, a list of choice questions, each `{ id, type: "choice", label, description?, required, options: [{value, label, description?}], multiple, allow_other }`. Optional `submit_label` and `answered_message` are accepted and not shown. A definition with no fields shows an error message.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' } } } }, Vi = {
  wippy: zi
}, Bi = 2e3;
function Di() {
  const e = Jt.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Fi(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function o() {
    n && clearTimeout(n), n = null;
  }
  ie(() => [e.value?.artifact_id, e.value?.status, e.value?.delivery], () => {
    const a = e.value;
    if (!a || a.status !== "idle" || a.delivery !== "pending" || r.has(a.artifact_id))
      return;
    o();
    const l = a.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const s = await t();
      !s || s.artifact_id !== l || s.delivery !== "pending" || r.has(l) || (r.add(l), Di()?.send({ type: "session_open", session_id: s.session_id }));
    }, Bi);
  }, { immediate: !0 }), Et(o);
}
const Mi = 5e3;
function qi(e, t) {
  const n = H("idle"), r = H(null), o = H(null), a = H(null);
  let l = 0, s = null, i = null, u = null, d = null;
  function c() {
    return Jt.artifactState;
  }
  let p = null, f = !1;
  function b() {
    f || p || (f = !0, p = setTimeout(() => {
      p = null, v();
    }, Mi));
  }
  async function k() {
    const z = c();
    if (typeof z != "function") {
      n.value = "unsupported", o.value = "This form needs a newer Web Host.";
      return;
    }
    const g = e.value;
    if (!g) {
      n.value = "idle", r.value = null, a.value = null;
      return;
    }
    const I = ++l, _ = r.value === null;
    _ && (n.value = "loading");
    try {
      const E = await z(g).get();
      if (I !== l)
        return;
      r.value = E, n.value = "loaded", o.value = null, a.value = null, f = !1;
    } catch (E) {
      if (I !== l)
        return;
      const D = E instanceof Error ? E.message : "Could not load this form.";
      _ ? (n.value = "error", o.value = D) : (a.value = D, b());
    }
  }
  function v() {
    return s ? (i || (i = s.then(() => (i = null, v()))), i) : (s = k().finally(() => {
      s = null;
    }), s);
  }
  function y(z) {
    d !== z && (u?.(), u = null, d = z, z && (u = De(`artifact:${z}`, () => {
      v();
    })));
  }
  ie(e, (z) => {
    l++, r.value = null, a.value = null, y(z), v();
  }, { immediate: !0 }), ie(t, () => {
    v();
  });
  const O = x(() => {
    const z = r.value;
    return z?.session_id && (z.status === "active" && !z.stale || z.status === "idle" && z.delivery && z.delivery !== "complete") ? z.session_id : null;
  });
  let C = null, h = null;
  ie(O, (z) => {
    C?.(), C = null, h?.(), h = null, z && (C = De(`session:${z}:message:*`, (g) => {
      g.data?.type !== "chunk" && v();
    }), h = De(`session:${z}`, () => {
      v();
    }));
  }, { immediate: !0 });
  const A = De("@visibility", (z) => {
    z && v();
  }), B = De("@reconnect", () => {
    v();
  });
  Et(() => {
    l++, p && clearTimeout(p), p = null, u?.(), u = null, C?.(), C = null, h?.(), h = null, A(), B();
  });
  async function Z() {
    return await v(), r.value;
  }
  return { status: n, state: r, errorMessage: o, reloadError: a, reload: () => {
    v();
  }, refresh: Z };
}
function Ui() {
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
const Hi = Symbol.for("wippy.artifactStateError");
function Or(e) {
  return typeof e == "object" && e !== null && e[Hi] === !0;
}
function Wi(e) {
  return Or(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Hn(e) {
  return !Or(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function Wn(e) {
  const t = Wi(e);
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
const Ki = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function Gi(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Yi(e) {
  return JSON.stringify(e);
}
function Qi(e) {
  const t = H(!1), n = H(null), r = H(null);
  let o = 0;
  ie(e, () => {
    o++, l();
  });
  function a(u) {
    const d = Yi(u);
    if (n.value && r.value === d)
      return n.value;
    const c = Ui();
    return n.value = c, r.value = d, c;
  }
  function l() {
    n.value = null, r.value = null;
  }
  function s() {
    return Jt.artifactState;
  }
  async function i(u, d, c) {
    const p = e.value;
    if (!p)
      return { ok: !1, message: "This form cannot be submitted here." };
    const f = s();
    if (typeof f != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const b = o, k = a(c), v = {
      form_version: u,
      request_id: k,
      expected_content_version: d,
      answers: c
    };
    t.value = !0;
    try {
      let y;
      try {
        y = await f(p).submit(v);
      } catch (O) {
        if (b !== o)
          return { ok: !1, ignored: !0 };
        const C = Hn(O);
        if (C)
          return { ok: !1, fieldErrors: C.errors, formErrors: C.formErrors };
        const h = Wn(O);
        if (!h.uncertain)
          return { ok: !1, message: h.message, code: h.code, retryable: h.retryable, shouldReload: h.shouldReload };
        if (await Gi(800), b !== o)
          return { ok: !1, ignored: !0 };
        try {
          y = await f(p).submit(v);
        } catch (A) {
          if (b !== o)
            return { ok: !1, ignored: !0 };
          const B = Hn(A);
          if (B)
            return { ok: !1, fieldErrors: B.errors, formErrors: B.formErrors };
          const Z = Wn(A), z = Z.uncertain ? Ki : Z.message, g = Z.uncertain ? !0 : Z.retryable;
          return { ok: !1, message: z, code: Z.code, retryable: g, shouldReload: Z.shouldReload };
        }
      }
      return b !== o ? { ok: !1, ignored: !0 } : (l(), { ok: !0, accepted: y });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: i, resetIdentity: l };
}
const an = Symbol("wippy-form:element"), kt = "data-wippy-artifact-id";
function Zi() {
  const e = At(an), t = H(e?.getAttribute(kt) ?? null);
  if (e) {
    let n = null;
    Xt(() => {
      t.value = e.getAttribute(kt), n = new MutationObserver(() => {
        t.value = e.getAttribute(kt);
      }), n.observe(e, { attributes: !0, attributeFilter: [kt] });
    }), Et(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Xi(e, t) {
  const n = At(an);
  n && io(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function Ji(e) {
  const t = H(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return Xt(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), Et(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
const es = () => Li(), ts = Ii, ns = "This form needs a newer Web Host.", rs = "This form cannot be submitted here.", os = "Could not submit this form.", as = "Could not load this form.";
var Ar = {
  name: "SpinnerIcon",
  extends: Nt
};
function is(e) {
  return ds(e) || us(e) || ls(e) || ss();
}
function ss() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ls(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function us(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ds(e) {
  if (Array.isArray(e)) return Kt(e);
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function cs(e, t, n, r, o, a) {
  return m(), w("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), is(t[0] || (t[0] = [R("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ar.render = cs;
var ps = `
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
`, fs = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": te(n.value) && String(n.value).length === 1,
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
}, ms = X.extend({
  name: "badge",
  style: ps,
  classes: fs
}), hs = {
  name: "BaseBadge",
  extends: Ue,
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
  style: ms,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
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
function Kn(e, t, n) {
  return (t = bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function bs(e) {
  var t = vs(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function vs(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Er = {
  name: "Badge",
  extends: hs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Se(Kn(Kn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, gs = ["data-p"];
function ys(e, t, n, r, o, a) {
  return m(), w("span", F({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [ce(e.$slots, "default", {}, function() {
    return [se(W(e.value), 1)];
  })], 16, gs);
}
Er.render = ys;
var ws = `
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
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function ke(e, t, n) {
  return (t = xs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xs(e) {
  var t = ks(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function ks(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _s = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", ke(ke(ke(ke(ke(ke(ke(ke(ke({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ke({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, $s = X.extend({
  name: "button",
  style: ws,
  classes: _s
}), Ss = {
  name: "BaseButton",
  extends: Ue,
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
  style: $s,
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
function pe(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Cs(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function Cs(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ce = {
  name: "Button",
  extends: Ss,
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
      return F(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
    SpinnerIcon: Ar,
    Badge: Er
  },
  directives: {
    ripple: kr
  }
}, Ts = ["data-p"], Os = ["data-p"];
function As(e, t, n, r, o, a) {
  var l = Ge("SpinnerIcon"), s = Ge("Badge"), i = or("ripple");
  return e.asChild ? ce(e.$slots, "default", {
    key: 1,
    class: T(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ar((m(), Y(_t(e.as), F({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: oe(function() {
      return [ce(e.$slots, "default", {}, function() {
        return [e.loading ? ce(e.$slots, "loadingicon", F({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (m(), w("span", F({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (m(), Y(l, F({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ce(e.$slots, "icon", F({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (m(), w("span", F({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, Ts)) : V("", !0)];
        }), e.label ? (m(), w("span", F({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), W(e.label), 17, Os)) : V("", !0), e.badge ? (m(), Y(s, {
          key: 3,
          value: e.badge,
          class: T(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : V("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
Ce.render = As;
var Nr = {
  name: "TimesIcon",
  extends: Nt
};
function Es(e) {
  return Is(e) || Ls(e) || js(e) || Ns();
}
function Ns() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function js(e, t) {
  if (e) {
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function Ls(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Is(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Rs(e, t, n, r, o, a) {
  return m(), w("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Es(t[0] || (t[0] = [R("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nr.render = Rs;
var zs = `
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
`, Vs = {
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
}, Bs = X.extend({
  name: "message",
  style: zs,
  classes: Vs
}), Ds = {
  name: "BaseMessage",
  extends: Ue,
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
  style: Bs,
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
function Gn(e, t, n) {
  return (t = Fs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fs(e) {
  var t = Ms(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function Ms(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sn = {
  name: "Message",
  extends: Ds,
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
      return Se(Gn(Gn({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: kr
  },
  components: {
    TimesIcon: Nr
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
function Yn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Qn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Yn(Object(n), !0).forEach(function(r) {
      qs(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function qs(e, t, n) {
  return (t = Us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Us(e) {
  var t = Hs(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function Hs(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ws = ["data-p"], Ks = ["data-p"], Gs = ["data-p"], Ys = ["aria-label", "data-p"], Qs = ["data-p"];
function Zs(e, t, n, r, o, a) {
  var l = Ge("TimesIcon"), s = or("ripple");
  return m(), Y(so, F({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: oe(function() {
      return [o.visible ? (m(), w("div", F({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": a.dataP
      }, e.ptm("root")), [R("div", F({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? ce(e.$slots, "container", {
        key: 0,
        closeCallback: a.close
      }) : (m(), w("div", F({
        key: 1,
        class: e.cx("content"),
        "data-p": a.dataP
      }, e.ptm("content")), [ce(e.$slots, "icon", {
        class: T(e.cx("icon"))
      }, function() {
        return [(m(), Y(_t(e.icon ? "span" : null), F({
          class: [e.cx("icon"), e.icon],
          "data-p": a.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (m(), w("div", F({
        key: 0,
        class: e.cx("text"),
        "data-p": a.dataP
      }, e.ptm("text")), [ce(e.$slots, "default")], 16, Gs)) : V("", !0), e.closable ? ar((m(), w("button", F({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": a.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(i) {
          return a.close(i);
        }),
        "data-p": a.dataP
      }, Qn(Qn({}, e.closeButtonProps), e.ptm("closeButton"))), [ce(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (m(), w("i", F({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, Qs)) : (m(), Y(l, F({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": a.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ys)), [[s]]) : V("", !0)], 16, Ks))], 16)], 16, Ws)) : V("", !0)];
    }),
    _: 3
  }, 16);
}
sn.render = Zs;
const ze = "text-danger-600 dark:text-danger-400", Xs = "text-warn-700 dark:text-warn-400";
function Js(e) {
  return e === "error" ? ze : e === "warn" ? Xs : void 0;
}
const el = { class: "flex items-center gap-2" }, Le = /* @__PURE__ */ be({
  __name: "form-message",
  props: {
    severity: {},
    retry: { type: Boolean }
  },
  emits: ["retry"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (m(), Y(S(sn), {
      severity: e.severity,
      closable: !1
    }, {
      default: oe(() => [
        R("div", el, [
          R("span", {
            class: T(S(Js)(e.severity))
          }, [
            ce(r.$slots, "default")
          ], 2),
          e.retry ? (m(), Y(S(Ce), {
            key: 0,
            type: "button",
            link: "",
            size: "small",
            onClick: o[0] || (o[0] = (a) => n("retry"))
          }, {
            default: oe(() => [...o[1] || (o[1] = [
              se(" Retry ", -1)
            ])]),
            _: 1
          })) : V("", !0)
        ])
      ]),
      _: 3
    }, 8, ["severity"]));
  }
});
var jr = {
  name: "CheckIcon",
  extends: Nt
};
function tl(e) {
  return al(e) || ol(e) || rl(e) || nl();
}
function nl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function rl(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function ol(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function al(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function il(e, t, n, r, o, a) {
  return m(), w("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), tl(t[0] || (t[0] = [R("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jr.render = il;
var Lr = {
  name: "MinusIcon",
  extends: Nt
};
function sl(e) {
  return cl(e) || dl(e) || ul(e) || ll();
}
function ll() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ul(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function dl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cl(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function pl(e, t, n, r, o, a) {
  return m(), w("svg", F({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), sl(t[0] || (t[0] = [R("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Lr.render = pl;
var fl = {
  name: "BaseEditableHolder",
  extends: Ue,
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
      return n.find(te);
    }
  },
  computed: {
    $filled: function() {
      return te(this.d_value);
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
  extends: fl,
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
}, ml = `
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
`, hl = {
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
}, bl = X.extend({
  name: "checkbox",
  style: ml,
  classes: hl
}), vl = {
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
  style: bl,
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
function gl(e, t, n) {
  return (t = yl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function yl(e) {
  var t = wl(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function wl(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function xl(e) {
  return Sl(e) || $l(e) || _l(e) || kl();
}
function kl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _l(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function $l(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Sl(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var ln = {
  name: "Checkbox",
  extends: vl,
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
          return !tn(a, n.value);
        }) : o = r ? [].concat(xl(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(o, t) : this.writeValue(o, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Po(this.value, t);
    },
    dataP: function() {
      return Se(gl({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: jr,
    MinusIcon: Lr
  }
}, Pl = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Cl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Tl = ["data-p"];
function Ol(e, t, n, r, o, a) {
  var l = Ge("CheckIcon"), s = Ge("MinusIcon");
  return m(), w("div", F({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-indeterminate": o.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [R("input", F({
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
  }, a.getPTOptions("input")), null, 16, Cl), R("div", F({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [ce(e.$slots, "icon", {
    checked: a.checked,
    indeterminate: o.d_indeterminate,
    class: T(e.cx("icon")),
    dataP: a.dataP
  }, function() {
    return [a.checked ? (m(), Y(l, F({
      key: 0,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : o.d_indeterminate ? (m(), Y(s, F({
      key: 1,
      class: e.cx("icon")
    }, a.getPTOptions("icon"), {
      "data-p": a.dataP
    }), null, 16, ["class", "data-p"])) : V("", !0)];
  })], 16, Tl)], 16, Pl);
}
ln.render = Ol;
var Al = `
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
`, El = {
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
}, Nl = X.extend({
  name: "inputtext",
  style: Al,
  classes: El
}), jl = {
  name: "BaseInputText",
  extends: jt,
  style: Nl,
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
function Ll(e, t, n) {
  return (t = Il(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Il(e) {
  var t = Rl(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Rl(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ir = {
  name: "InputText",
  extends: jl,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return F(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Se(Ll({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, zl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Vl(e, t, n, r, o, a) {
  return m(), w("input", F({
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
  }, a.attrs), null, 16, zl);
}
Ir.render = Vl;
var Bl = `
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
`, Dl = {
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
}, Fl = X.extend({
  name: "radiobutton",
  style: Bl,
  classes: Dl
}), Ml = {
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
  style: Fl,
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
function ql(e, t, n) {
  return (t = Ul(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ul(e) {
  var t = Hl(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Hl(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rr = {
  name: "RadioButton",
  extends: Ml,
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
      return t != null && (this.binary ? !!t : tn(t, this.value));
    },
    dataP: function() {
      return Se(ql({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Wl = ["data-p-checked", "data-p-disabled", "data-p"], Kl = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], Gl = ["data-p"], Yl = ["data-p"];
function Ql(e, t, n, r, o, a) {
  return m(), w("div", F({
    class: e.cx("root")
  }, a.getPTOptions("root"), {
    "data-p-checked": a.checked,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [R("input", F({
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
  }, a.getPTOptions("input")), null, 16, Kl), R("div", F({
    class: e.cx("box")
  }, a.getPTOptions("box"), {
    "data-p": a.dataP
  }), [R("div", F({
    class: e.cx("icon")
  }, a.getPTOptions("icon"), {
    "data-p": a.dataP
  }), null, 16, Yl)], 16, Gl)], 16, Wl);
}
Rr.render = Ql;
const Zl = ["aria-describedby"], Xl = { class: "text-sm font-medium text-color p-0" }, Jl = ["role"], eu = ["for"], tu = {
  key: 0,
  class: "block text-xs text-muted-color"
}, nu = {
  key: 0,
  class: "flex items-start gap-2"
}, ru = { class: "flex flex-col gap-1 min-w-0 grow" }, ou = /* @__PURE__ */ be({
  __name: "choice-field",
  props: {
    field: {}
  },
  setup(e) {
    const t = e, n = Ot(), r = `${n}-desc`, o = `${n}-other`, a = `${n}-other-text`, l = x(() => t.field.multiple ? ln : Rr);
    function s(u) {
      return `${n}-opt-${u}`;
    }
    function i(u, d) {
      return t.field.multiple ? { inputId: u, binary: !0, modelValue: !1, disabled: !0 } : { inputId: u, name: n, value: d, disabled: !0 };
    }
    return (u, d) => (m(), w("fieldset", {
      class: "flex flex-col gap-2 border-0 p-0 m-0 min-w-0",
      "aria-describedby": e.field.description ? r : void 0
    }, [
      R("legend", Xl, [
        se(W(e.field.label), 1),
        e.field.required ? (m(), w("span", {
          key: 0,
          class: T(S(ze))
        }, " (required)", 2)) : V("", !0)
      ]),
      e.field.description ? (m(), w("p", {
        key: 0,
        id: r,
        class: "text-xs text-muted-color m-0"
      }, W(e.field.description), 1)) : V("", !0),
      R("div", {
        class: "flex flex-col gap-1.5",
        role: e.field.multiple ? "group" : "radiogroup"
      }, [
        (m(!0), w(ae, null, je(e.field.options, (c, p) => (m(), w("div", {
          key: c.value,
          class: "flex items-start gap-2"
        }, [
          (m(), Y(_t(l.value), F({ ref_for: !0 }, i(s(p), c.value)), null, 16)),
          R("label", {
            for: s(p),
            class: "text-sm text-color break-words"
          }, [
            se(W(c.label) + " ", 1),
            c.description ? (m(), w("span", tu, W(c.description), 1)) : V("", !0)
          ], 8, eu)
        ]))), 128)),
        e.field.allow_other ? (m(), w("div", nu, [
          (m(), Y(_t(l.value), lo(uo(i(o, "other"))), null, 16)),
          R("div", ru, [
            R("label", {
              for: o,
              class: "text-sm text-color"
            }, "Other"),
            R("label", {
              for: a,
              class: "sr-only"
            }, "Other answer"),
            Q(S(Ir), {
              id: a,
              disabled: "",
              size: "small",
              class: "w-full"
            })
          ])
        ])) : V("", !0)
      ], 8, Jl)
    ], 8, Zl));
  }
}), au = { class: "w-form gap-4 min-w-0" }, iu = { class: "flex flex-col gap-1" }, su = { class: "text-base font-semibold text-color break-words" }, lu = {
  key: 0,
  class: "text-sm text-muted-color break-words"
}, uu = /* @__PURE__ */ be({
  __name: "form-notice",
  props: {
    definition: {},
    severity: {},
    message: {}
  },
  setup(e) {
    return (t, n) => (m(), w("div", au, [
      R("div", iu, [
        R("h2", su, W(e.definition.title), 1),
        e.definition.description ? (m(), w("p", lu, W(e.definition.description), 1)) : V("", !0)
      ]),
      (m(!0), w(ae, null, je(e.definition.fields, (r) => (m(), Y(ou, {
        key: r.id,
        field: r
      }, null, 8, ["field"]))), 128)),
      Q(Le, { severity: e.severity }, {
        default: oe(() => [
          se(W(e.message), 1)
        ]),
        _: 1
      }, 8, ["severity"])
    ]));
  }
});
function ct(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function pt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function Zn(e) {
  return typeof e == "string" ? e : pt(e) ? e.value : null;
}
function du(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => Zn(n) === t) : Zn(e) === t;
}
function cu(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(ct);
    return t ? t.other : "";
  }
  return ct(e) ? e.other : "";
}
function pu(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(ct) : ct(e);
}
function fu(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((o) => pt(o) && o.value === t);
  return r && pt(r) ? r.note : "";
}
const mu = 2e3, hu = 1e3;
function de(e) {
  return e.trim();
}
function Xn(e, t) {
  return Array.from(de(e)).length > t;
}
function Jn(e, t) {
  const n = de(t);
  return n ? { value: e, note: n } : e;
}
function zr(e, t) {
  if (t === void 0)
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const a of e.options) {
    const l = n.find((s) => typeof s == "string" ? s === a.value : pt(s) && s.value === a.value);
    l && r.push({ label: a.label, note: pt(l) ? l.note : void 0 });
  }
  const o = n.find(ct);
  return o && r.push({ label: o.other, own: !0 }), r.length > 0 ? r : null;
}
const Tt = 9;
function bu(e, t, n) {
  const r = e.fields.length, o = r > 1, a = /* @__PURE__ */ new Set([0]), l = H(0), s = H(!1), i = H(""), u = H(""), d = H(null), c = H(0), p = nr(
    Object.fromEntries(e.fields.map(($) => {
      const P = t?.[$.id], L = $.options.filter((Ae) => du(P, Ae.value)).map((Ae) => Ae.value), U = {};
      for (const Ae of L) {
        const bt = fu(P, Ae);
        bt && (U[Ae] = bt);
      }
      const ne = pu(P), xe = cu(P), ht = L.length > 0 || ne && de(xe) !== "", Lt = { chosen: L, other: xe, useOther: ne, notes: U, noteOpen: null, done: ht };
      return [$.id, Lt];
    }))
  );
  function f($) {
    return p[$.id];
  }
  function b($) {
    const P = f($);
    return $.multiple ? P.chosen.length > 0 || de(P.other) !== "" : P.chosen.length > 0 || P.useOther && de(P.other) !== "";
  }
  function k($) {
    return f($).done && b($);
  }
  const v = x(() => o && l.value === r), y = x(() => v.value ? null : e.fields[l.value] ?? null), O = x(
    () => e.fields.map(($, P) => ({ field: $, index: P })).filter(({ field: $ }) => $.required && !k($))
  );
  let C;
  function h($) {
    clearTimeout(C), u.value = "", C = setTimeout(() => {
      u.value = $;
    }, 30);
  }
  function A() {
    clearTimeout(C), u.value = "";
  }
  function B($) {
    d.value = $, c.value++;
  }
  function Z($) {
    return Math.min($.options.length + ($.allow_other ? 1 : 0), Tt);
  }
  function z($) {
    const P = Z($), L = P > 1 ? `1–${P}` : "1", U = Math.min($.options.length, Tt), ne = U > 1 ? `Shift+1–${U}` : "Shift+1", xe = o ? " ← and → change questions." : "";
    return $.multiple ? `${L} ticks, ${ne} adds a note, Enter sends.${xe}` : `${L} answers, ${ne} adds a note first.${xe}`;
  }
  function g($) {
    const P = f($);
    if ($.multiple) {
      const L = $.options.filter((ne) => P.chosen.includes(ne.value)).map((ne) => Jn(ne.value, P.notes[ne.value] ?? "")), U = de(P.other);
      return U && L.push({ other: U }), L.length > 0 ? L : void 0;
    }
    if (P.useOther)
      return { other: de(P.other) };
    if (P.chosen[0])
      return Jn(P.chosen[0], P.notes[P.chosen[0]] ?? "");
  }
  function I($) {
    return k($) ? zr($, g($)) : null;
  }
  function _() {
    const $ = {};
    for (const P of e.fields) {
      if (!k(P))
        continue;
      const L = g(P);
      L !== void 0 && ($[P.id] = L);
    }
    return $;
  }
  function E($, P = "first") {
    const L = y.value;
    L && L.multiple && !f(L).done && b(L) && (f(L).done = !0);
    const U = o ? r : r - 1;
    if (l.value = Math.max(0, Math.min($, U)), i.value = "", v.value || a.add(l.value), v.value) {
      const ne = O.value[0];
      B(ne ? `review-item-${ne.index}` : "send-all");
    } else
      B(P);
    h(v.value ? "Review your answers" : `Question ${l.value + 1} of ${r}`);
  }
  function D() {
    O.value.length > 0 || n(_());
  }
  function K($) {
    if (f($).done = !0, i.value = "", !o) {
      n(_());
      return;
    }
    const P = e.fields.findIndex((L, U) => U > l.value && !a.has(U));
    E(P === -1 ? r : P);
  }
  function j($, P) {
    const L = f($);
    if (P >= $.options.length) {
      B("other");
      return;
    }
    const U = $.options[P].value;
    if (L.noteOpen === U && !$.multiple) {
      B(`note-${U}`);
      return;
    }
    if ($.multiple) {
      L.chosen = L.chosen.includes(U) ? L.chosen.filter((ne) => ne !== U) : [...L.chosen, U], b($) || (L.done = !1), i.value = "", B(`opt-${P}`), h(L.chosen.includes(U) ? "Ticked" : "Unticked");
      return;
    }
    L.chosen = [U], L.useOther = !1, K($);
  }
  function J($, P, L = !1) {
    const U = f($), ne = $.options.findIndex((xe) => xe.value === P);
    U.noteOpen === P && !L ? (U.noteOpen = null, B(`opt-${ne}`)) : (U.noteOpen = P, B(`note-${P}`));
  }
  function me($, P, L) {
    f($).notes[P] = L;
  }
  function we($, P) {
    const L = f($);
    if (L.noteOpen = null, $.multiple) {
      L.chosen.includes(P) || (L.chosen = [...L.chosen, P]), B(`opt-${$.options.findIndex((U) => U.value === P)}`), h("Note saved");
      return;
    }
    L.chosen = [P], L.useOther = !1, B(`opt-${$.options.findIndex((U) => U.value === P)}`), K($);
  }
  function Oe($) {
    const P = f($), L = de(P.other);
    if ($.multiple) {
      if (!L && P.chosen.length === 0)
        return;
    } else {
      if (!L)
        return;
      P.useOther = !0, P.chosen = [];
    }
    K($);
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
    answers: p,
    inReview: v,
    currentQuestion: y,
    missingRequired: O,
    ans: f,
    hasContent: b,
    answered: k,
    answerItemsFor: I,
    keysText: z,
    activate: j,
    toggleNote: J,
    setNote: me,
    sendNote: we,
    sendOther: Oe,
    commit: K,
    go: E,
    submitAll: D,
    requestFocus: B,
    quiet: A,
    buildAnswers: _
  };
}
function N(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function vu(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, o) => ({ text: r, code: o % 2 === 1 })).filter((r) => r.text !== "");
}
function er(e) {
  return String(e).replaceAll("`", "");
}
function gu(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const yu = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Te = /* @__PURE__ */ be({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, r) => (m(!0), w(ae, null, je(S(vu)(t.text), (o, a) => (m(), w(ae, { key: a }, [
      o.code ? (m(), w("code", yu, W(o.text), 1)) : (m(), w(ae, { key: 1 }, [
        se(W(o.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), wu = ["part"], xu = ["part"], ku = ["part"], _u = { "aria-hidden": "true" }, $u = { class: "w-form__sr" }, Su = ["id", "part"], Pu = ["part"], Cu = /* @__PURE__ */ be({
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
    const n = e, r = t, o = x(() => N("header", !n.multi && "single")), a = x(() => N("nav")), l = x(() => N("prev")), s = x(() => N("counter")), i = x(() => N("next")), u = x(() => N("question")), d = x(() => N("actions")), c = x(() => N("collapse")), p = x(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), f = x(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), b = x(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (k, v) => (m(), w("div", {
      part: o.value.part,
      class: T(o.value.class)
    }, [
      e.multi ? (m(), w("div", {
        key: 0,
        part: a.value.part,
        class: T(a.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        Q(S(Ce), {
          type: "button",
          text: "",
          size: "small",
          part: l.value.part,
          class: T(l.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: v[0] || (v[0] = (y) => r("prev"))
        }, {
          icon: oe(() => [
            Q(S(ve), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        R("span", {
          part: s.value.part,
          class: T(s.value.class)
        }, [
          R("span", _u, W(p.value), 1),
          R("span", $u, W(f.value), 1)
        ], 10, ku),
        Q(S(Ce), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: T(i.value.class),
          "aria-label": b.value,
          title: b.value,
          disabled: e.review,
          onClick: v[1] || (v[1] = (y) => r("next"))
        }, {
          icon: oe(() => [
            Q(S(ve), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, xu)) : V("", !0),
      R("h3", {
        id: e.qid,
        part: u.value.part,
        class: T(u.value.class)
      }, [
        e.review ? (m(), w(ae, { key: 0 }, [
          se(" Check your answers, then send them. ")
        ], 64)) : (m(), Y(Te, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, Su),
      R("div", {
        part: d.value.part,
        class: T(d.value.class)
      }, [
        Q(S(Ce), {
          type: "button",
          text: "",
          size: "small",
          part: c.value.part,
          class: T(c.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: v[2] || (v[2] = (y) => r("toggleCollapse"))
        }, {
          icon: oe(() => [
            Q(S(ve), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, Pu)
    ], 10, wu));
  }
});
var Tu = `
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
`, Ou = {
  root: "p-inputgroup"
}, Au = X.extend({
  name: "inputgroup",
  style: Tu,
  classes: Ou
}), Eu = {
  name: "BaseInputGroup",
  extends: Ue,
  style: Au,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Vr = {
  name: "InputGroup",
  extends: Eu,
  inheritAttrs: !1
};
function Nu(e, t, n, r, o, a) {
  return m(), w("div", F({
    class: e.cx("root")
  }, e.ptmi("root")), [ce(e.$slots, "default")], 16);
}
Vr.render = Nu;
var ju = `
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
`, Lu = {
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
}, Iu = X.extend({
  name: "textarea",
  style: ju,
  classes: Lu
}), Ru = {
  name: "BaseTextarea",
  extends: jt,
  props: {
    autoResize: Boolean
  },
  style: Iu,
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
function zu(e, t, n) {
  return (t = Vu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Vu(e) {
  var t = Bu(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function Bu(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Br = {
  name: "Textarea",
  extends: Ru,
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
      return F(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Se(zu({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Du = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Fu(e, t, n, r, o, a) {
  return m(), w("textarea", F({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": a.dataP,
    onInput: t[0] || (t[0] = function() {
      return a.onInput && a.onInput.apply(a, arguments);
    })
  }, a.attrs), null, 16, Du);
}
Br.render = Fu;
const Dr = /* @__PURE__ */ be({
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
    const n = e, r = t, o = x(() => N("composer", n.kind)), a = x(() => N(`${n.kind}-input`)), l = x(() => N(`${n.kind}-send`));
    function s(i) {
      i.key === "Enter" && !i.shiftKey && !i.isComposing ? (i.preventDefault(), n.enabled && r("send")) : i.key === "Escape" && !i.isComposing && (i.preventDefault(), r("escape"));
    }
    return (i, u) => (m(), Y(S(Vr), {
      part: o.value.part,
      class: T(o.value.class)
    }, {
      default: oe(() => [
        Q(S(Br), {
          "model-value": e.modelValue,
          part: a.value.part,
          class: T(a.value.class),
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
        Q(S(Ce), {
          type: "button",
          text: "",
          rounded: "",
          part: l.value.part,
          class: T(l.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: u[1] || (u[1] = (d) => r("send"))
        }, {
          icon: oe(() => [
            Q(S(ve), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), Mu = ["part"], qu = ["part", "role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], Uu = ["part"], Hu = ["part"], Wu = ["part"], Ku = ["part"], Gu = ["part"], Yu = { key: 1 }, Qu = ["part"], Zu = /* @__PURE__ */ be({
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
    const n = e, r = t, o = x(() => N("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), a = x(() => N("option-main")), l = x(() => N("option-label")), s = x(() => N("option-mark")), i = x(() => N("option-description")), u = x(() => N("option-note")), d = x(() => N("note-toggle", n.note && "has-note", n.editing && "editing")), c = x(() => N("option-key")), p = x(() => N("error")), f = `${Ot()}-note-err`, b = x(() => [
      n.noteTooLong ? f : "",
      n.describedBy ?? ""
    ].filter(Boolean).join(" ") || void 0);
    function k(C) {
      n.disabled || C.target.closest(".w-form__note-toggle, .w-form__composer") || r("activate");
    }
    const v = x(() => `${n.note ? "Edit the note on" : "Add a note to"} ${er(n.option.label)}`), y = x(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), O = x(() => n.multiple ? "Save the note" : "Answer with this note");
    return (C, h) => (m(), w("div", {
      part: o.value.part,
      class: T(o.value.class),
      onClick: k
    }, [
      R("div", {
        part: a.value.part,
        class: T(a.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        R("span", {
          part: l.value.part,
          class: T(l.value.class)
        }, [
          e.multiple ? (m(), Y(S(ln), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: s.value.part,
            class: T(s.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (m(), w("span", {
            key: 1,
            part: s.value.part,
            class: T(s.value.class),
            "aria-hidden": "true"
          }, [
            Q(S(ve), { icon: "tabler:check" })
          ], 10, Hu)) : V("", !0),
          Q(Te, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, Uu),
        e.option.description ? (m(), w("span", {
          key: 0,
          part: i.value.part,
          class: T(i.value.class)
        }, [
          Q(Te, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, Wu)) : V("", !0),
        e.note && !e.editing ? (m(), w("span", {
          key: 1,
          part: u.value.part,
          class: T(u.value.class)
        }, [
          Q(S(ve), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          R("span", null, W(e.note), 1)
        ], 10, Ku)) : V("", !0)
      ], 10, qu),
      Q(S(Ce), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: d.value.part,
        class: T(d.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": v.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: h[0] || (h[0] = co((A) => r("toggle-note"), ["stop"]))
      }, {
        icon: oe(() => [
          Q(S(ve), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (m(), w("kbd", {
        key: 0,
        part: c.value.part,
        class: T(c.value.class),
        "aria-hidden": "true"
      }, W(e.keyLabel), 11, Gu)) : (m(), w("span", Yu)),
      e.editing ? (m(), w(ae, { key: 2 }, [
        Q(Dr, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: y.value,
          label: `Note for ${S(er)(e.option.label)}`,
          "send-label": O.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": b.value,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": h[1] || (h[1] = (A) => r("update:noteDraft", A)),
          onSend: h[2] || (h[2] = (A) => r("send-note")),
          onEscape: h[3] || (h[3] = (A) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (m(), w("p", {
          key: 0,
          id: f,
          part: p.value.part,
          class: T([p.value.class, S(ze)]),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Qu)) : V("", !0)
      ], 64)) : V("", !0)
    ], 10, Mu));
  }
}), Xu = ["part"], Ju = ["part"], ed = ["part"], td = ["part", "role", "aria-labelledby", "aria-invalid"], nd = ["part"], rd = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, od = { key: 1 }, ad = ["part"], id = ["part"], sd = ["part"], ld = /* @__PURE__ */ be({
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
    const t = e, n = x(() => N("notice")), r = x(() => N("description")), o = x(() => N("hint")), a = x(() => N("options")), l = x(() => N("footer")), s = x(() => N("send")), i = x(() => N("error")), u = x(() => N("keys")), d = x(() => {
      const _ = [];
      return t.question.multiple && _.push("Choose any that apply."), t.question.required || _.push("Optional."), _.join(" ");
    }), c = x(() => t.controller.error.value || t.serverError || "");
    function p(_) {
      return _ < Tt ? String(_ + 1) : null;
    }
    const f = x(() => {
      const _ = t.question.options.length + 1;
      return _ <= Tt ? String(_) : null;
    });
    function b() {
      return t.controller.ans(t.question);
    }
    const k = x(() => {
      const _ = b(), E = t.question.multiple ? de(_.other) !== "" : _.useOther && _.done;
      return N("option", "other", E && "selected");
    }), v = x(() => {
      const _ = b();
      return de(_.other) !== "" || t.question.multiple && _.chosen.length > 0;
    }), y = x(() => Xn(b().other, mu)), O = `${t.qid}-other-err`, C = `${t.qid}-err`, h = x(() => [
      c.value ? C : "",
      t.cardErrorIds ?? ""
    ].filter(Boolean).join(" ") || void 0), A = x(() => [
      y.value ? O : "",
      h.value ?? ""
    ].filter(Boolean).join(" ") || void 0), B = x(() => y.value || !!c.value);
    function Z() {
      t.disabled || t.controller.commit(t.question);
    }
    function z(_) {
      _.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    const g = H(0);
    ie(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const _ = b(), E = _.useOther ? -1 : t.question.options.findIndex((D) => D.value === _.chosen[0]);
      g.value = E >= 0 ? E : 0;
    }, { immediate: !0 });
    function I(_) {
      if (t.question.multiple)
        return;
      const E = _.target?.dataset?.focus ?? "";
      E.startsWith("opt-") && (g.value = Number(E.slice(4)));
    }
    return (_, E) => (m(), w(ae, null, [
      e.stale ? (m(), w("p", {
        key: 0,
        part: n.value.part,
        class: T(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Xu)) : V("", !0),
      e.question.description ? (m(), w("p", {
        key: 1,
        part: r.value.part,
        class: T(r.value.class)
      }, [
        Q(Te, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Ju)) : V("", !0),
      d.value ? (m(), w("p", {
        key: 2,
        part: o.value.part,
        class: T(o.value.class)
      }, W(d.value), 11, ed)) : V("", !0),
      R("div", {
        part: a.value.part,
        class: T(a.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": C,
        "aria-invalid": !e.question.multiple && c.value ? "true" : void 0,
        onFocusin: I
      }, [
        (m(!0), w(ae, null, je(e.question.options, (D, K) => (m(), Y(Zu, {
          key: D.value,
          option: D,
          index: K,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(D.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === D.value,
          note: S(de)(e.controller.ans(e.question).notes[D.value] || ""),
          editing: e.controller.ans(e.question).noteOpen === D.value,
          "note-draft": e.controller.ans(e.question).notes[D.value] || "",
          "key-label": p(K),
          "note-too-long": S(Xn)(e.controller.ans(e.question).notes[D.value] || "", S(hu)),
          disabled: !!e.disabled,
          "described-by": h.value,
          invalid: !!c.value,
          "roving-tabbable": K === g.value,
          onActivate: (j) => e.controller.activate(e.question, K),
          onToggleNote: (j) => e.controller.toggleNote(e.question, D.value),
          "onUpdate:noteDraft": (j) => e.controller.setNote(e.question, D.value, j),
          onSendNote: (j) => e.controller.sendNote(e.question, D.value),
          onEscapeNote: (j) => e.controller.toggleNote(e.question, D.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (m(), w("div", {
          key: 0,
          part: k.value.part,
          class: T(k.value.class),
          onClick: z
        }, [
          Q(Dr, {
            kind: "other",
            "model-value": b().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: v.value && !e.disabled && !y.value,
            invalid: B.value,
            "described-by": A.value,
            "data-focus": "other",
            "onUpdate:modelValue": E[0] || (E[0] = (D) => {
              b().other = D;
            }),
            onSend: E[1] || (E[1] = (D) => e.controller.sendOther(e.question)),
            onEscape: E[2] || (E[2] = (D) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          f.value ? (m(), w("kbd", rd, W(f.value), 1)) : (m(), w("span", od)),
          y.value ? (m(), w("p", {
            key: 2,
            id: O,
            part: i.value.part,
            class: T([i.value.class, S(ze)]),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, ad)) : V("", !0)
        ], 10, nd)) : V("", !0)
      ], 42, td),
      e.question.multiple && !e.question.allow_other ? (m(), w("div", {
        key: 3,
        part: l.value.part,
        class: T(l.value.class)
      }, [
        Q(S(Ce), {
          type: "button",
          part: s.value.part,
          class: T([s.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send",
          "aria-describedby": h.value,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: e.controller.ans(e.question).chosen.length === 0,
          onClick: Z
        }, {
          default: oe(() => [
            E[3] || (E[3] = se(" Send ", -1)),
            Q(S(ve), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, id)) : V("", !0),
      c.value ? (m(), Y(S(sn), {
        key: 4,
        id: C,
        severity: "error",
        variant: "simple",
        size: "small",
        part: i.value.part,
        class: T(i.value.class),
        role: "alert"
      }, {
        default: oe(() => [
          R("span", {
            class: T(S(ze))
          }, W(c.value), 3)
        ]),
        _: 1
      }, 8, ["part", "class"])) : (m(), w("p", {
        key: 5,
        id: C,
        class: "hidden"
      })),
      R("p", {
        part: u.value.part,
        class: T(u.value.class)
      }, W(e.controller.keysText(e.question)), 11, sd)
    ], 64));
  }
}), ud = ["part"], dd = ["part"], cd = { key: 0 }, pd = ["part"], Fr = /* @__PURE__ */ be({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = x(() => N("answer-item")), r = x(() => N("answer-note")), o = x(() => N("answer-own"));
    return (a, l) => (m(!0), w(ae, null, je(t.items, (s, i) => (m(), w("span", {
      key: i,
      part: n.value.part,
      class: T(n.value.class)
    }, [
      s.own ? (m(), w(ae, { key: 0 }, [
        R("span", {
          part: o.value.part,
          class: T(o.value.class)
        }, "Own answer: ", 10, dd),
        (m(!0), w(ae, null, je(S(gu)(s.label), (u, d) => (m(), w(ae, { key: d }, [
          d > 0 ? (m(), w("br", cd)) : V("", !0),
          se(W(u), 1)
        ], 64))), 128))
      ], 64)) : (m(), Y(Te, {
        key: 1,
        text: s.label
      }, null, 8, ["text"])),
      S(de)(s.note || "") ? (m(), w("span", {
        key: 2,
        part: r.value.part,
        class: T(r.value.class)
      }, [
        Q(S(ve), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        R("span", null, W(S(de)(s.note)), 1)
      ], 10, pd)) : V("", !0)
    ], 10, ud))), 128));
  }
}), fd = ["part"], md = ["part"], hd = ["part", "aria-label", "data-focus", "onClick"], bd = ["part"], vd = ["part"], gd = ["part"], yd = ["part"], wd = ["part"], xd = ["part"], kd = ["part"], _d = /* @__PURE__ */ be({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = x(() => N("review")), r = x(() => N("footer")), o = x(() => N("footer-text")), a = x(() => N("send-all")), l = x(() => N("keys")), s = x(() => N("review-number")), i = x(() => N("review-question")), u = x(() => N("review-answer")), d = x(() => N("answer-empty"));
    function c(y) {
      return N("review-item", y && "missing");
    }
    function p(y) {
      return !t.controller.answerItemsFor(y) && y.required;
    }
    function f() {
      return N("review-edit");
    }
    function b() {
      t.disabled || t.controller.submitAll();
    }
    const k = x(() => t.controller.missingRequired.value), v = x(() => {
      const y = k.value;
      return y.length === 0 ? "" : y.length === 1 ? `Question ${y[0].index + 1} still needs an answer.` : `Questions ${y.map((O) => O.index + 1).join(" and ")} still need answers.`;
    });
    return (y, O) => (m(), w(ae, null, [
      R("ol", {
        part: n.value.part,
        class: T(n.value.class)
      }, [
        (m(!0), w(ae, null, je(e.definition.fields, (C, h) => (m(), w("li", {
          key: C.id,
          part: c(p(C)).part,
          class: T(c(p(C)).class)
        }, [
          R("button", {
            type: "button",
            part: f().part,
            class: T(f().class),
            "aria-label": `Question ${h + 1}: change the answer`,
            "data-focus": `review-item-${h}`,
            onClick: (A) => e.controller.go(h, "first")
          }, [
            R("span", {
              part: s.value.part,
              class: T(s.value.class),
              "aria-hidden": "true"
            }, W(h + 1), 11, bd),
            R("span", {
              part: i.value.part,
              class: T(i.value.class)
            }, [
              Q(Te, {
                text: C.label
              }, null, 8, ["text"])
            ], 10, vd),
            R("span", {
              part: u.value.part,
              class: T([u.value.class, p(C) && S(ze)])
            }, [
              e.controller.answerItemsFor(C) ? (m(), Y(Fr, {
                key: 0,
                items: e.controller.answerItemsFor(C)
              }, null, 8, ["items"])) : C.required ? (m(), w(ae, { key: 1 }, [
                se(" Not answered yet ")
              ], 64)) : (m(), w("span", {
                key: 2,
                part: d.value.part,
                class: T(d.value.class)
              }, "Skipped", 10, yd))
            ], 10, gd)
          ], 10, hd)
        ], 10, md))), 128))
      ], 10, fd),
      R("div", {
        part: r.value.part,
        class: T(r.value.class)
      }, [
        v.value ? (m(), w("p", {
          key: 0,
          part: o.value.part,
          class: T([o.value.class, S(ze)])
        }, W(v.value), 11, xd)) : V("", !0),
        Q(S(Ce), {
          type: "button",
          part: a.value.part,
          class: T([a.value.class, e.disabled && "p-disabled"]),
          "data-focus": "send-all",
          "aria-describedby": e.cardErrorIds,
          "aria-disabled": e.disabled ? "true" : void 0,
          disabled: k.value.length > 0,
          onClick: b
        }, {
          default: oe(() => [
            O[0] || (O[0] = se(" Send answers ", -1)),
            Q(S(ve), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-describedby", "aria-disabled", "disabled"])
      ], 10, wd),
      R("p", {
        part: l.value.part,
        class: T(l.value.class)
      }, " Enter sends. Pick a row to change it. ← goes back to the last question. ", 10, kd)
    ], 64));
  }
}), $d = ["part", "aria-busy"], Sd = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, Pd = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, Cd = ["part"], Td = ["part"], Od = {
  "aria-live": "polite",
  class: "w-form__sr"
}, Ad = "You are offline. Your choices are kept.", Ed = "Sending your answer…", Nd = /* @__PURE__ */ be({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const r = e, o = n, a = bu(r.state.definition, r.state.data, (g) => {
      r.offline || r.submitting || o("submit", g);
    }), l = x(() => !!r.offline || r.submitting), s = `${Ot()}-q`, i = H(null);
    ie(a.inReview, (g) => o("update:state", g ? "review" : "active"), { immediate: !0 }), ie(a.collapsed, (g) => o("update:collapsed", g), { immediate: !0 }), ie(() => r.submitting, (g) => {
      g && a.quiet();
    });
    const u = H({}), d = H([]);
    function c(g) {
      return u.value[g] ?? "";
    }
    const p = x(() => new Set(r.state.definition.fields.map((g) => g.id))), f = x(() => {
      const g = Object.entries(u.value).filter(([I]) => !p.value.has(I)).map(([, I]) => I);
      return [...d.value, ...g].join(" ");
    }), b = `${s}-general-err`, k = `${s}-banner`, v = x(() => [
      f.value ? b : "",
      r.banner ? k : ""
    ].filter(Boolean).join(" ") || void 0);
    ie(
      () => Object.fromEntries(r.state.definition.fields.map((g) => [g.id, JSON.stringify(a.ans(g))])),
      (g, I) => {
        if (!I)
          return;
        const _ = new Set(
          r.state.definition.fields.map((E) => E.id).filter((E) => g[E] !== I[E] && u.value[E])
        );
        _.size !== 0 && (u.value = Object.fromEntries(
          Object.entries(u.value).filter(([E]) => !_.has(E))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(g, I) {
        const _ = {};
        for (const [D, K] of Object.entries(g ?? {}))
          _[D] = K.map((j) => j.message).join(" ");
        u.value = _, d.value = (I ?? []).map((D) => D.message);
        const E = r.state.definition.fields.findIndex((D) => _[D.id]);
        E >= 0 ? a.go(E, "first") : qe(B);
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
          (g) => g.chosen.length > 0 || de(g.other) !== "" || Object.values(g.notes).some((I) => de(I) !== "")
        );
      }
    });
    const y = x(() => N("card")), O = x(() => N("title")), C = x(() => N("form-description"));
    function h(g) {
      const I = i.value;
      if (!I)
        return;
      let _ = null;
      if (g === "card" ? _ = I : g === "first" ? _ = I.querySelector(".w-form__option--selected .w-form__option-main") ?? I.querySelector(".w-form__option-main, .w-form__other-input") : _ = Array.from(I.querySelectorAll("[data-focus]")).find((E) => E.dataset.focus === g) ?? null, !!_ && (_.focus(), _.tagName === "TEXTAREA")) {
        const E = _;
        E.setSelectionRange(E.value.length, E.value.length);
      }
    }
    ie(a.focusSeq, () => {
      qe(() => {
        const g = a.focusTarget.value;
        g && h(g);
      });
    });
    function A() {
      const g = i.value?.ownerDocument;
      if (!g)
        return !1;
      const I = g.activeElement;
      return !I || I === g.body || I === g.documentElement;
    }
    function B() {
      A() && a.requestFocus(a.inReview.value ? "send-all" : "first");
    }
    ie(() => r.banner, (g) => {
      g && qe(B);
    });
    function Z() {
      a.collapsed.value = !a.collapsed.value, a.requestFocus("card");
    }
    function z(g) {
      const I = g.composedPath()[0];
      if (I?.tagName === "TEXTAREA" || g.isComposing || g.ctrlKey || g.metaKey || g.altKey || a.collapsed.value || l.value)
        return;
      if (a.inReview.value) {
        g.key === "ArrowLeft" && (g.preventDefault(), a.go(a.n - 1, "first"));
        return;
      }
      const _ = a.currentQuestion.value;
      if (!_)
        return;
      const E = a.ans(_), D = g.shiftKey ? /^Digit([1-9])$/.exec(g.code) : /^([1-9])$/.exec(g.key);
      if (D) {
        const J = Number(D[1]) - 1;
        if (J >= _.options.length + (_.allow_other ? 1 : 0))
          return;
        g.preventDefault(), g.shiftKey && J < _.options.length ? a.toggleNote(_, _.options[J].value, !0) : a.activate(_, J);
        return;
      }
      const K = I?.dataset?.focus ?? "", j = K.startsWith("opt-") ? Number(K.slice(4)) : -1;
      if (g.key === "ArrowDown" || g.key === "ArrowUp") {
        const J = Array.from(i.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (J.length === 0)
          return;
        g.preventDefault();
        const me = J.indexOf(I), we = g.key === "ArrowDown" ? (me + 1) % J.length : me <= 0 ? J.length - 1 : me - 1;
        J[we]?.focus();
        return;
      }
      if (a.multi && (g.key === "ArrowRight" || g.key === "ArrowLeft")) {
        g.preventDefault(), a.go(a.index.value + (g.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((g.key === "n" || g.key === "N") && j >= 0) {
        g.preventDefault(), a.toggleNote(_, _.options[j].value, !0);
        return;
      }
      if (j >= 0 && (g.key === " " || g.key === "Enter" && !_.multiple)) {
        g.preventDefault(), a.activate(_, j);
        return;
      }
      g.key === "Enter" && _.multiple && !I?.matches?.("button") && (g.preventDefault(), E.chosen.length > 0 || de(E.other) ? a.commit(_) : (a.error.value = "Tick at least one answer, or type your own.", a.requestFocus(j >= 0 ? K : "first")));
    }
    return (g, I) => (m(), w("section", {
      ref_key: "cardRoot",
      ref: i,
      part: y.value.part,
      class: T(`w-form ${y.value.class}`),
      role: "group",
      "aria-labelledby": s,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: z
    }, [
      e.offline ? (m(), w("p", Sd, W(Ad))) : V("", !0),
      e.submitting ? (m(), w("p", Pd, W(Ed))) : V("", !0),
      f.value ? (m(), Y(Le, {
        key: 2,
        id: b,
        severity: "error"
      }, {
        default: oe(() => [
          se(W(f.value), 1)
        ]),
        _: 1
      })) : V("", !0),
      R("p", {
        part: O.value.part,
        class: T(O.value.class)
      }, [
        Q(S(ve), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        se(" " + W(e.state.definition.title), 1)
      ], 10, Cd),
      e.state.definition.description ? (m(), w("p", {
        key: 3,
        part: C.value.part,
        class: T(C.value.class)
      }, [
        Q(Te, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, Td)) : V("", !0),
      Q(Cu, {
        multi: S(a).multi,
        index: S(a).index.value,
        n: S(a).n,
        review: S(a).inReview.value,
        "question-text": S(a).currentQuestion.value?.label ?? "",
        collapsed: S(a).collapsed.value,
        qid: s,
        onPrev: I[0] || (I[0] = (_) => S(a).go(S(a).index.value - 1, "first")),
        onNext: I[1] || (I[1] = (_) => S(a).go(S(a).index.value + 1, "first")),
        onToggleCollapse: Z
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (m(), Y(Le, {
        key: 4,
        id: k,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        onRetry: I[2] || (I[2] = (_) => o("retry"))
      }, {
        default: oe(() => [
          se(W(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : V("", !0),
      S(a).collapsed.value ? V("", !0) : (m(), w(ae, { key: 5 }, [
        S(a).inReview.value ? (m(), Y(_d, {
          key: 0,
          definition: e.state.definition,
          controller: S(a),
          "card-error-ids": v.value,
          disabled: l.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : S(a).currentQuestion.value ? (m(), Y(ld, {
          key: 1,
          question: S(a).currentQuestion.value,
          controller: S(a),
          qid: s,
          stale: !!e.state.stale,
          "server-error": c(S(a).currentQuestion.value.id),
          "card-error-ids": v.value,
          disabled: l.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : V("", !0)
      ], 64)),
      R("p", Od, W(S(a).liveMessage.value), 1)
    ], 42, $d));
  }
}), jd = ["part", "aria-label"], Ld = ["part"], Id = ["part"], Rd = ["part"], zd = ["part"], Vd = ["part"], Bd = ["part"], Dd = ["part"], Fd = ["part"], Md = { key: 0 }, qd = { key: 1 }, Ud = { key: 2 }, Hd = { key: 3 }, Wd = { key: 4 }, Kd = /* @__PURE__ */ be({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function r(k) {
      if (!k)
        return null;
      const v = new Date(k);
      return Number.isNaN(v.getTime()) ? null : v.toLocaleString();
    }
    const o = x(() => N("card", "answered")), a = x(() => N("title")), l = x(() => N("form-description")), s = x(() => N("summary")), i = x(() => N("summary-item")), u = x(() => N("summary-question")), d = x(() => N("summary-answer")), c = x(() => N("answer-empty")), p = x(() => N("status"));
    function f(k) {
      const v = n.state.definition.fields.find((y) => y.id === k);
      return v ? zr(v, n.state.data ? n.state.data[k] : void 0) : null;
    }
    const b = H(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        b.value?.focus();
      }
    }), (k, v) => (m(), w("section", {
      part: o.value.part,
      class: T(`w-form ${o.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      R("p", {
        part: a.value.part,
        class: T(a.value.class)
      }, [
        Q(S(ve), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        se(" " + W(e.state.definition.title), 1)
      ], 10, Ld),
      e.state.definition.description ? (m(), w("p", {
        key: 0,
        part: l.value.part,
        class: T(l.value.class)
      }, [
        Q(Te, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, Id)) : V("", !0),
      R("dl", {
        part: s.value.part,
        class: T(s.value.class)
      }, [
        (m(!0), w(ae, null, je(e.state.definition.fields, (y) => (m(), w("div", {
          key: y.id,
          part: i.value.part,
          class: T(i.value.class)
        }, [
          R("dt", {
            part: u.value.part,
            class: T(u.value.class)
          }, [
            Q(Te, {
              text: y.label
            }, null, 8, ["text"])
          ], 10, Vd),
          R("dd", {
            part: d.value.part,
            class: T(d.value.class)
          }, [
            f(y.id) ? (m(), Y(Fr, {
              key: 0,
              items: f(y.id)
            }, null, 8, ["items"])) : (m(), w("span", {
              key: 1,
              part: c.value.part,
              class: T(c.value.class)
            }, "Skipped", 10, Dd))
          ], 10, Bd)
        ], 10, zd))), 128))
      ], 10, Rd),
      R("div", {
        ref_key: "statusEl",
        ref: b,
        tabindex: "-1",
        part: p.value.part,
        class: T(p.value.class)
      }, [
        e.state.late ? (m(), w("p", Md, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : V("", !0),
        e.state.delivery === "pending" ? (m(), w("p", qd, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (m(), w("p", Ud, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (m(), w("p", Hd, " The assistant stopped before answering. Send a message to continue. ")) : V("", !0),
        r(e.state.submitted_at) ? (m(), w("p", Wd, " Answered " + W(r(e.state.submitted_at)), 1)) : V("", !0)
      ], 10, Fd)
    ], 10, jd));
  }
}), Gd = { class: "max-w-full min-w-0" }, Yd = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Qd = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Zd = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, Xd = "Could not refresh this form. Showing what you last saw.", Jd = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", ec = "This form was answered. Your answer is in the chat.", tr = 1, tc = /* @__PURE__ */ be({
  __name: "wippy-form",
  setup(e) {
    const t = `${ns} If you already answered it, your answer is in the chat.`, n = es(), r = ts(), o = Zi(), a = x(() => n.value.definition), l = x(() => n.value.state), s = x(() => l.value === "idle"), { status: i, state: u, errorMessage: d, reloadError: c, reload: p, refresh: f } = qi(o, l);
    Fi(u, f);
    const { submitting: b, submit: k } = Qi(o), { isOnline: v } = Ji(() => p()), y = H(null), O = H(!1);
    ie(o, () => {
      O.value = !1;
    });
    const C = H(null), h = H(null);
    let A = !1;
    ie(() => u.value?.status, (K, j) => {
      if (!(K !== "idle" || j !== "active")) {
        if (A) {
          A = !1;
          return;
        }
        C.value?.hasUnsentInput() && (O.value = !0);
      }
    });
    const B = x(() => {
      const K = n.value.formVersion;
      if (K !== void 0 && K !== tr)
        return !0;
      const j = u.value?.form_version;
      return j !== void 0 && j !== tr;
    }), Z = x(() => i.value === "unsupported" ? s.value ? { severity: "secondary", message: ec } : { severity: "warn", message: t } : o.value ? null : { severity: "secondary", message: rs }), z = H("active"), g = H(!1), I = x(() => B.value || i.value === "unsupported" ? "unsupported" : u.value === null ? "loading" : u.value.status === "idle" ? "answered" : z.value), _ = x(() => !B.value && u.value?.status === "active" && g.value);
    Xi(I, _);
    async function E(K) {
      if (!u.value)
        return;
      y.value = null;
      const j = await k(u.value.form_version, u.value.content_version, K);
      if (!j.ignored) {
        if (j.ok && j.accepted) {
          const J = j.accepted;
          A = !0, u.value = {
            ...u.value,
            status: "idle",
            stale: !1,
            late: J.late,
            content_version: J.content_version,
            data: K,
            answer_message_id: J.answer_message_id,
            delivery: J.delivery
          }, qe(() => h.value?.focusStatus()), p();
          return;
        }
        if (j.fieldErrors || j.formErrors) {
          C.value?.setServerErrors(j.fieldErrors, j.formErrors);
          return;
        }
        if (j.code === "already_submitted") {
          O.value = !0, await f(), qe(() => h.value?.focusStatus());
          return;
        }
        j.shouldReload && p(), y.value = { message: j.message ?? os, retryable: j.retryable };
      }
    }
    function D() {
      C.value?.retry();
    }
    return (K, j) => (m(), w("div", Gd, [
      S(r).length > 0 ? (m(), Y(Le, {
        key: 0,
        severity: "error"
      }, {
        default: oe(() => [...j[2] || (j[2] = [
          se(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : a.value?.fields?.length ? B.value ? (m(), Y(Le, {
        key: 2,
        severity: "warn"
      }, {
        default: oe(() => [...j[4] || (j[4] = [
          se(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : Z.value ? (m(), Y(uu, {
        key: 3,
        definition: a.value,
        severity: Z.value.severity,
        message: Z.value.message
      }, null, 8, ["definition", "severity", "message"])) : S(u) ? (m(), w(ae, { key: 4 }, [
        S(c) ? (m(), w("p", Yd, W(Xd))) : V("", !0),
        S(u).status === "active" ? (m(), Y(Nd, {
          key: S(u).artifact_id,
          ref_key: "cardRef",
          ref: C,
          state: S(u),
          submitting: S(b),
          banner: y.value,
          offline: !S(v),
          onSubmit: E,
          onRetry: D,
          "onUpdate:state": j[0] || (j[0] = (J) => {
            z.value = J;
          }),
          "onUpdate:collapsed": j[1] || (j[1] = (J) => {
            g.value = J;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : (m(), w(ae, { key: 2 }, [
          O.value ? (m(), w("p", Qd, W(Jd))) : V("", !0),
          (m(), Y(Kd, {
            key: S(u).artifact_id,
            ref_key: "summaryRef",
            ref: h,
            state: S(u)
          }, null, 8, ["state"]))
        ], 64))
      ], 64)) : S(i) === "loading" || S(i) === "idle" ? (m(), w("wippy-loading", Zd)) : S(i) === "error" ? (m(), Y(Le, {
        key: 6,
        severity: "error",
        retry: "",
        onRetry: S(p)
      }, {
        default: oe(() => [
          se(W(S(d) || S(as)), 1)
        ]),
        _: 1
      }, 8, ["onRetry"])) : V("", !0) : (m(), Y(Le, {
        key: 1,
        severity: "error"
      }, {
        default: oe(() => [...j[3] || (j[3] = [
          se(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), nc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.hidden{display:none}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.grow{flex-grow:1}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-4{gap:1rem}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.border-0{border-width:0px}.p-0{padding:0}.text-base{font-size:1rem;line-height:1.5rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-medium{font-weight:500}.font-semibold{font-weight:600}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn-700{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-700) calc(100% * var(--tw-text-opacity, 1)),transparent)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, 14px);--_q-size: var(--wippy-form-question-size, 15px);--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, var(--p-content-background));--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 40%, var(--p-content-border-color)));--_row-hover: var(--wippy-form-row-hover, color-mix(in srgb, var(--p-content-border-color) 90%, var(--p-text-color)));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-content-border-color)));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, 10px);--_row-py: var(--wippy-form-row-padding-y, 6px);--_row-px: var(--wippy-form-row-padding-x, 10px);--_gap: var(--wippy-form-gap, 4px);--_key: var(--wippy-form-key-size, 20px);display:block;container-type:inline-size}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:var(--_key);height:var(--_key);padding:0 4px;font-family:var(--_font);font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}@supports (text-box: trim-both cap alphabetic){.w-form__option-key{text-box:trim-both cap alphabetic}}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class rc extends Ri {
  static get wippyConfig() {
    return {
      propsSchema: Vi.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: nc
    };
  }
  static get vueConfig() {
    return {
      rootComponent: tc,
      plugins: [ui],
      providers(t, n) {
        t.provide(an, n);
      }
    };
  }
}
vo(import.meta.url, rc);
//# sourceMappingURL=index.js.map
