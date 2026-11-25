import { ref as z, readonly as Gi, getCurrentInstance as xr, onMounted as Nt, nextTick as Ve, watch as ce, reactive as Jn, renderSlot as F, openBlock as f, createBlock as L, Teleport as xo, createCommentVNode as D, useId as Bt, mergeProps as b, h as Zi, createApp as Qi, inject as ln, onUnmounted as un, computed as B, watchEffect as Xi, createElementBlock as y, createElementVNode as I, resolveComponent as Fe, normalizeClass as ie, defineComponent as de, Fragment as J, renderList as be, unref as h, toDisplayString as N, createTextVNode as fe, createVNode as j, resolveDynamicComponent as ve, withCtx as G, normalizeProps as he, guardReactiveProps as Pe, resolveDirective as er, withDirectives as Qe, normalizeStyle as Ji, Transition as $o, vShow as $r, withKeys as pe, shallowRef as ea, onBeforeUnmount as ta, withModifiers as Co } from "vue";
import { addCollection as na, Icon as Le } from "@iconify/vue";
import * as ra from "@wippy-fe/proxy";
import { config as Cr, addIcons as oa, on as rt, applyThemeMode as Ht, host as ia, hostCss as aa, loadCss as sa, define as la } from "@wippy-fe/proxy";
import { getActivePinia as ua, createPinia as da, setActivePinia as ca } from "pinia";
var pa = Object.defineProperty, Tr = Object.getOwnPropertySymbols, fa = Object.prototype.hasOwnProperty, ma = Object.prototype.propertyIsEnumerable, Pr = (e, t, n) => t in e ? pa(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ha = (e, t) => {
  for (var n in t || (t = {})) fa.call(t, n) && Pr(e, n, t[n]);
  if (Tr) for (var n of Tr(t)) ma.call(t, n) && Pr(e, n, t[n]);
  return e;
};
function Ne(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function En(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), i = Array.isArray(t), o, a, s;
  if (r && i) {
    if (a = e.length, a != t.length) return !1;
    for (o = a; o-- !== 0; ) if (!En(e[o], t[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let l = e instanceof Date, d = t instanceof Date;
  if (l != d) return !1;
  if (l && d) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, u = t instanceof RegExp;
  if (c != u) return !1;
  if (c && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (a = p.length, a !== Object.keys(t).length) return !1;
  for (o = a; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[o])) return !1;
  for (o = a; o-- !== 0; ) if (s = p[o], !En(e[s], t[s], n)) return !1;
  return !0;
}
function ba(e, t) {
  return En(e, t);
}
function tr(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function le(e) {
  return !Ne(e);
}
function Er(e, t) {
  return null;
}
function nr(e, t, n) {
  return n ? Er() === Er() : ba(e, t);
}
function va(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (nr(e, n)) return !0;
  }
  return !1;
}
function Be(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function To(e = {}, t = {}) {
  let n = ha({}, e);
  return Object.keys(t).forEach((r) => {
    let i = r;
    Be(t[i]) && i in e && Be(e[i]) ? n[i] = To(e[i], t[i]) : n[i] = t[i];
  }), n;
}
function ga(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : To(t, n), {});
}
function Ce(e, ...t) {
  return tr(e) ? e(...t) : e;
}
function $e(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ie(e) {
  return $e(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function rr(e, t = "", n = {}) {
  let r = Ie(t).split("."), i = r.shift();
  if (i) {
    if (Be(e)) {
      let o = Object.keys(e).find((a) => Ie(a) === i) || "";
      return rr(Ce(e[o], n), r.join("."), n);
    }
    return;
  }
  return Ce(e, n);
}
function Po(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ya(e) {
  return e instanceof Date;
}
function wa(e) {
  return le(e) && !isNaN(e);
}
function ka() {
  return new Intl.Collator(void 0, { numeric: !0 }).compare;
}
function Je(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Sa(...e) {
  return ga(...e);
}
function mt(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function xa(e) {
  return $e(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function Eo(e) {
  return $e(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function or() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((i) => {
      i(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ke(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let i = typeof r;
      if (i === "string" || i === "number") t.push(r);
      else if (i === "object") {
        let o = Array.isArray(r) ? [ke(...r)] : Object.entries(r).map(([a, s]) => s ? a : void 0);
        t = o.length ? t.concat(o.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function $a(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ca(e, t) {
  if (e && t) {
    let n = (r) => {
      $a(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function vn(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function On(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Oo(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], i = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = i.width || e.offsetWidth, t.height = i.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function Mo() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], i = e.innerWidth || n.clientWidth || r.clientWidth, o = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function Mn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Ta() {
  let e = document.documentElement;
  return (window.pageXOffset || Mn(e)) - (e.clientLeft || 0);
}
function Pa() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function Ea(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Oa(e, t, n = !0) {
  var r, i, o, a;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Oo(e), l = s.height, d = s.width, c = t.offsetHeight, u = t.offsetWidth, p = t.getBoundingClientRect(), m = Pa(), g = Ta(), S = Mo(), x, T, A = "top";
    p.top + c + l > S.height ? (x = p.top + m - l, A = "bottom", x < 0 && (x = m)) : x = c + p.top + m, p.left + d > S.width ? T = Math.max(0, p.left + g + u - d) : T = p.left + g, Ea(e) ? e.style.insetInlineEnd = T + "px" : e.style.insetInlineStart = T + "px", e.style.top = x + "px", e.style.transformOrigin = A, n && (e.style.marginTop = A === "bottom" ? `calc(${(i = (r = On(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (a = (o = On(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? a : "");
  }
}
function Ma(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Xt(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Da(e, t, n = !0, r = void 0) {
  var i;
  if (e) {
    let o = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Oo(e), a = t.offsetHeight, s = t.getBoundingClientRect(), l = Mo(), d, c, u = r ?? "top";
    if (!r && s.top + a + o.height > l.height ? (d = -1 * o.height, u = "bottom", s.top + d < 0 && (d = -1 * s.top)) : d = a, o.width > l.width ? c = s.left * -1 : s.left + o.width > l.width ? c = (s.left + o.width - l.width) * -1 : c = 0, e.style.top = d + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = u, n) {
      let p = (i = On(/-anchor-gutter$/)) == null ? void 0 : i.value;
      e.style.marginTop = u === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function ir(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Aa(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && ir(e));
}
function ut(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function en(e, t = {}) {
  if (ut(e)) {
    let n = (r, i) => {
      var o, a;
      let s = (o = e?.$attrs) != null && o[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
      return [i].flat().reduce((l, d) => {
        if (d != null) {
          let c = typeof d;
          if (c === "string" || c === "number") l.push(d);
          else if (c === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            l = u.length ? l.concat(u.filter((p) => !!p)) : l;
          }
        }
        return l;
      }, s);
    };
    Object.entries(t).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? e.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? en(e, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = i), e.setAttribute(r, i));
      }
    });
  }
}
function _a(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return en(r, t), r.append(...n), r;
  }
}
function Ke(e, t) {
  return ut(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Me(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ze(e, t) {
  if (ut(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Or(e, t = "") {
  let n = Ke(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let i of n) getComputedStyle(i).display != "none" && getComputedStyle(i).visibility != "hidden" && r.push(i);
  return r;
}
function Mr(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function ct(e) {
  var t;
  if (e) {
    let n = (t = ir(e)) == null ? void 0 : t.childNodes, r = 0;
    if (n) for (let i = 0; i < n.length; i++) {
      if (n[i] === e) return r;
      n[i].nodeType === 1 && r++;
    }
  }
  return -1;
}
function Ia(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Mn(document.documentElement) || Mn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Va(e, t) {
  return e ? e.offsetHeight : 0;
}
function Do(e, t = []) {
  let n = ir(e);
  return n === null ? t : Do(n, t.concat([n]));
}
function La(e) {
  let t = [];
  if (e) {
    let n = Do(e), r = /(auto|scroll)/, i = (o) => {
      try {
        let a = window.getComputedStyle(o, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let a = o.nodeType === 1 && o.dataset.scrollselectors;
      if (a) {
        let s = a.split(",");
        for (let l of s) {
          let d = Me(o, l);
          d && i(d) && t.push(d);
        }
      }
      o.nodeType !== 9 && i(o) && t.push(o);
    }
  }
  return t;
}
function Dr(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Ao() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Na() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function _o(e, t = "", n) {
  ut(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ut = {};
function Ba(e = "pui_id_") {
  return Object.hasOwn(Ut, e) || (Ut[e] = 0), Ut[e]++, `${e}${Ut[e]}`;
}
function Ra() {
  let e = [], t = (a, s, l = 999) => {
    let d = i(a, s, l), c = d.value + (d.key === a ? 0 : l) + 1;
    return e.push({ key: a, value: c }), c;
  }, n = (a) => {
    e = e.filter((s) => s.value !== a);
  }, r = (a, s) => i(a).value, i = (a, s, l = 0) => [...e].reverse().find((d) => !0) || { key: a, value: l }, o = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: o, set: (a, s, l) => {
    s && (s.style.zIndex = String(t(a, !0, l)));
  }, clear: (a) => {
    a && (n(o(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var gn = Ra(), ja = Object.defineProperty, Fa = Object.defineProperties, za = Object.getOwnPropertyDescriptors, tn = Object.getOwnPropertySymbols, Io = Object.prototype.hasOwnProperty, Vo = Object.prototype.propertyIsEnumerable, Ar = (e, t, n) => t in e ? ja(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, De = (e, t) => {
  for (var n in t || (t = {})) Io.call(t, n) && Ar(e, n, t[n]);
  if (tn) for (var n of tn(t)) Vo.call(t, n) && Ar(e, n, t[n]);
  return e;
}, yn = (e, t) => Fa(e, za(t)), Re = (e, t) => {
  var n = {};
  for (var r in e) Io.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && tn) for (var r of tn(e)) t.indexOf(r) < 0 && Vo.call(e, r) && (n[r] = e[r]);
  return n;
}, Ha = or(), ye = Ha, bt = /{([^}]*)}/g, Lo = /(\d+\s+[\+\-\*\/]\s+\d+)/g, No = /var\([^)]+\)/g;
function _r(e) {
  return $e(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ua(e) {
  return Be(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Ya(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Dn(e = "", t = "") {
  return Ya(`${$e(e, !1) && $e(t, !1) ? `${e}-` : e}${t}`);
}
function Bo(e = "", t = "") {
  return `--${Dn(e, t)}`;
}
function qa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Ro(e, t = "", n = "", r = [], i) {
  if ($e(e)) {
    let o = e.trim();
    if (qa(o)) return;
    if (Je(o, bt)) {
      let a = o.replaceAll(bt, (s) => {
        let l = s.replace(/{|}/g, "").split(".").filter((d) => !r.some((c) => Je(d, c)));
        return `var(${Bo(n, Eo(l.join("-")))}${le(i) ? `, ${i}` : ""})`;
      });
      return Je(a.replace(No, "0"), Lo) ? `calc(${a})` : a;
    }
    return o;
  } else if (wa(e)) return e;
}
function Ka(e, t, n) {
  $e(t, !1) && e.push(`${t}:${n};`);
}
function ot(e, t) {
  return e ? `${e}{${t}}` : "";
}
function jo(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, s) {
    let l = [], d = 0, c = "", u = null, p = 0;
    for (; d <= a.length; ) {
      let m = a[d];
      if ((m === '"' || m === "'" || m === "`") && a[d - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || d === a.length) && p === 0)) {
        let g = c.trim();
        g.startsWith("dt(") ? l.push(jo(g, s)) : l.push(r(g)), c = "", d++;
        continue;
      }
      m !== void 0 && (c += m), d++;
    }
    return l;
  }
  function r(a) {
    let s = a[0];
    if ((s === '"' || s === "'" || s === "`") && a[a.length - 1] === s) return a.slice(1, -1);
    let l = Number(a);
    return isNaN(l) ? a : l;
  }
  let i = [], o = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") o.push(a), a += 2;
  else if (e[a] === ")" && o.length > 0) {
    let s = o.pop();
    o.length === 0 && i.push([s, a]);
  }
  if (!i.length) return e;
  for (let a = i.length - 1; a >= 0; a--) {
    let [s, l] = i[a], d = e.slice(s + 3, l), c = n(d, t), u = t(...c);
    e = e.slice(0, s) + u + e.slice(l + 1);
  }
  return e;
}
var et = (...e) => Wa(se.getTheme(), ...e), Wa = (e = {}, t, n, r) => {
  if (t) {
    let { variable: i, options: o } = se.defaults || {}, { prefix: a, transform: s } = e?.options || o || {}, l = Je(t, bt) ? t : `{${t}}`;
    return r === "value" || Ne(r) && s === "strict" ? se.getTokenValue(t) : Ro(l, void 0, a, [i.excludedKeyRegex], n);
  }
  return "";
};
function Yt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, i, o) => {
      var a;
      return r + i + ((a = Ce(t[o], { dt: et })) != null ? a : "");
    }, "");
    return jo(n, et);
  }
  return Ce(e, { dt: et });
}
function Ga(e, t = {}) {
  let n = se.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = t, a = [], s = [], l = [{ node: e, path: r }];
  for (; l.length; ) {
    let { node: c, path: u } = l.pop();
    for (let p in c) {
      let m = c[p], g = Ua(m), S = Je(p, o) ? Dn(u) : Dn(u, Eo(p));
      if (Be(g)) l.push({ node: g, path: S });
      else {
        let x = Bo(S), T = Ro(g, S, r, [o]);
        Ka(s, x, T);
        let A = S;
        r && A.startsWith(r + "-") && (A = A.slice(r.length + 1)), a.push(A.replace(/-/g, "."));
      }
    }
  }
  let d = s.join("");
  return { value: s, tokens: a, declarations: d, css: ot(i, d) };
}
var Oe = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    return (r = t.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return Ga(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a, s, l, d, c, u;
  let { preset: p, options: m } = t, g, S, x, T, A, _, k;
  if (le(p) && m.transform !== "strict") {
    let { primitive: E, semantic: w, extend: O } = p, $ = w || {}, { colorScheme: V } = $, Z = Re($, ["colorScheme"]), K = O || {}, { colorScheme: U } = K, Y = Re(K, ["colorScheme"]), te = V || {}, { dark: re } = te, ae = Re(te, ["dark"]), Q = U || {}, { dark: P } = Q, q = Re(Q, ["dark"]), X = le(E) ? this._toVariables({ primitive: E }, m) : {}, v = le(Z) ? this._toVariables({ semantic: Z }, m) : {}, C = le(ae) ? this._toVariables({ light: ae }, m) : {}, R = le(re) ? this._toVariables({ dark: re }, m) : {}, H = le(Y) ? this._toVariables({ semantic: Y }, m) : {}, ue = le(q) ? this._toVariables({ light: q }, m) : {}, Ee = le(P) ? this._toVariables({ dark: P }, m) : {}, [hn, bn] = [(o = X.declarations) != null ? o : "", X.tokens], [qe, zt] = [(a = v.declarations) != null ? a : "", v.tokens || []], [Vi, Li] = [(s = C.declarations) != null ? s : "", C.tokens || []], [Ni, Bi] = [(l = R.declarations) != null ? l : "", R.tokens || []], [Ri, ji] = [(d = H.declarations) != null ? d : "", H.tokens || []], [Fi, zi] = [(c = ue.declarations) != null ? c : "", ue.tokens || []], [Hi, Ui] = [(u = Ee.declarations) != null ? u : "", Ee.tokens || []];
    g = this.transformCSS(e, hn, "light", "variable", m, r, i), S = bn;
    let Yi = this.transformCSS(e, `${qe}${Vi}`, "light", "variable", m, r, i), qi = this.transformCSS(e, `${Ni}`, "dark", "variable", m, r, i);
    x = `${Yi}${qi}`, T = [.../* @__PURE__ */ new Set([...zt, ...Li, ...Bi])];
    let Ki = this.transformCSS(e, `${Ri}${Fi}color-scheme:light`, "light", "variable", m, r, i), Wi = this.transformCSS(e, `${Hi}color-scheme:dark`, "dark", "variable", m, r, i);
    A = `${Ki}${Wi}`, _ = [.../* @__PURE__ */ new Set([...ji, ...zi, ...Ui])], k = Ce(p.css, { dt: et });
  }
  return { primitive: { css: g, tokens: S }, semantic: { css: x, tokens: T }, global: { css: A, tokens: _ }, style: k };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: i, defaults: o, selector: a }) {
  var s, l, d;
  let c, u, p;
  if (le(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), g = t, { colorScheme: S, extend: x, css: T } = g, A = Re(g, ["colorScheme", "extend", "css"]), _ = x || {}, { colorScheme: k } = _, E = Re(_, ["colorScheme"]), w = S || {}, { dark: O } = w, $ = Re(w, ["dark"]), V = k || {}, { dark: Z } = V, K = Re(V, ["dark"]), U = le(A) ? this._toVariables({ [m]: De(De({}, A), E) }, n) : {}, Y = le($) ? this._toVariables({ [m]: De(De({}, $), K) }, n) : {}, te = le(O) ? this._toVariables({ [m]: De(De({}, O), Z) }, n) : {}, [re, ae] = [(s = U.declarations) != null ? s : "", U.tokens || []], [Q, P] = [(l = Y.declarations) != null ? l : "", Y.tokens || []], [q, X] = [(d = te.declarations) != null ? d : "", te.tokens || []], v = this.transformCSS(m, `${re}${Q}`, "light", "variable", n, i, o, a), C = this.transformCSS(m, q, "dark", "variable", n, i, o, a);
    c = `${v}${C}`, u = [.../* @__PURE__ */ new Set([...ae, ...P, ...X])], p = Ce(T, { dt: et });
  }
  return { css: c, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: a, options: s } = t, l = (o = a?.components) == null ? void 0 : o[e];
  return this.getPreset({ name: e, preset: l, options: s, params: n, set: r, defaults: i });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a;
  let s = e.replace("-directive", ""), { preset: l, options: d } = t, c = ((o = l?.components) == null ? void 0 : o[s]) || ((a = l?.directives) == null ? void 0 : a[s]);
  return this.getPreset({ name: s, preset: c, options: d, params: n, set: r, defaults: i });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: i } = t;
  return i ? `@layer ${Ce(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: i, defaults: o }), s = Object.entries(r).reduce((l, [d, c]) => l.push(`${d}="${c}"`) && l, []).join(" ");
  return Object.entries(a || {}).reduce((l, [d, c]) => {
    if (Be(c) && Object.hasOwn(c, "css")) {
      let u = mt(c.css), p = `${d}-variables`;
      l.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${u}</style>`);
    }
    return l;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var a;
  let s = { name: e, theme: t, params: n, set: i, defaults: o }, l = (a = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : a.css, d = Object.entries(r).reduce((c, [u, p]) => c.push(`${u}="${p}"`) && c, []).join(" ");
  return l ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${mt(l)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", i = {}) {
  let o = function(s, l = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: l, value: void 0 };
    d.push(this.path), l.name = this.path, l.binding || (l.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && bt.test(this.value)) {
      let u = this.value.trim().replace(bt, (p) => {
        var m;
        let g = p.slice(1, -1), S = this.tokens[g];
        if (!S) return console.warn(`Token not found for path: ${g}`), "__UNRESOLVED__";
        let x = S.computed(s, l, d);
        return Array.isArray(x) && x.length === 2 ? `light-dark(${x[0].value},${x[1].value})` : (m = x?.value) != null ? m : "__UNRESOLVED__";
      });
      c = Lo.test(u.replace(No, "0")) ? `calc(${u})` : u;
    }
    return Ne(l.binding) && delete l.binding, d.pop(), { colorScheme: s, path: this.path, paths: l, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (s, l, d) => {
    Object.entries(s).forEach(([c, u]) => {
      let p = Je(c, t.variable.excludedKeyRegex) ? l : l ? `${l}.${_r(c)}` : _r(c), m = d ? `${d}.${c}` : c;
      Be(u) ? a(u, p, m) : (i[p] || (i[p] = { paths: [], computed: (g, S = {}, x = []) => {
        if (i[p].paths.length === 1) return i[p].paths[0].computed(i[p].paths[0].scheme, S.binding, x);
        if (g && g !== "none") for (let T = 0; T < i[p].paths.length; T++) {
          let A = i[p].paths[T];
          if (A.scheme === g) return A.computed(g, S.binding, x);
        }
        return i[p].paths.map((T) => T.computed(T.scheme, S[T.scheme], x));
      } }), i[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: i }));
    });
  };
  return a(e, n, r), i;
}, getTokenValue(e, t, n) {
  var r;
  let i = ((s) => s.split(".").filter((l) => !Je(l.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), o = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[i]) == null ? void 0 : r.computed(o)].flat().filter((s) => s);
  return a.length === 1 ? a[0].value : a.reduce((s = {}, l) => {
    let d = l, { colorScheme: c } = d, u = Re(d, ["colorScheme"]);
    return s[c] = u, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? ot(le(t) ? `${e}${t},${e} ${t}` : e, r) : ot(e, ot(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, i = {}, o, a, s) {
  if (le(t)) {
    let { cssLayer: l } = i;
    if (r !== "style") {
      let d = this.getColorSchemeOption(i, a);
      t = n === "dark" ? d.reduce((c, { type: u, selector: p }) => (le(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, u, t)), c), "") : ot(s ?? ":root,:host", t);
    }
    if (l) {
      let d = { name: "primeui" };
      Be(l) && (d.name = Ce(l.name, { name: e, type: r })), le(d.name) && (t = ot(`@layer ${d.name}`, t), o?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, se = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = yn(De({}, t), { options: De(De({}, this.defaults.options), t.options) }), this._tokens = Oe.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ye.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = yn(De({}, this.theme), { preset: e }), this._tokens = Oe.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ye.emit("preset:change", e), ye.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = yn(De({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ye.emit("options:change", e), ye.emit("theme:change", this.theme);
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
  return Oe.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return Oe.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Oe.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Oe.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let i = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Oe.getPreset(i);
}, getLayerOrderCSS(e = "") {
  return Oe.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return Oe.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return Oe.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return Oe.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ye.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ye.emit("theme:load"));
} }, we = {
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
}, Za = `
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
function vt(e) {
  "@babel/helpers - typeof";
  return vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vt(e);
}
function Ir(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Vr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ir(Object(n), !0).forEach(function(r) {
      Qa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ir(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Qa(e, t, n) {
  return (t = Xa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xa(e) {
  var t = Ja(e, "string");
  return vt(t) == "symbol" ? t : t + "";
}
function Ja(e, t) {
  if (vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function es(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  xr() && xr().components ? Nt(e) : t ? e() : Ve(e);
}
var ts = 0;
function ns(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = z(!1), r = z(e), i = z(null), o = Ao() ? window.document : void 0, a = t.document, s = a === void 0 ? o : a, l = t.immediate, d = l === void 0 ? !0 : l, c = t.manual, u = c === void 0 ? !1 : c, p = t.name, m = p === void 0 ? "style_".concat(++ts) : p, g = t.id, S = g === void 0 ? void 0 : g, x = t.media, T = x === void 0 ? void 0 : x, A = t.nonce, _ = A === void 0 ? void 0 : A, k = t.first, E = k === void 0 ? !1 : k, w = t.onMounted, O = w === void 0 ? void 0 : w, $ = t.onUpdated, V = $ === void 0 ? void 0 : $, Z = t.onLoad, K = Z === void 0 ? void 0 : Z, U = t.props, Y = U === void 0 ? {} : U, te = function() {
  }, re = function(P) {
    var q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var X = Vr(Vr({}, Y), q), v = X.name || m, C = X.id || S, R = X.nonce || _;
      i.value = s.querySelector('style[data-primevue-style-id="'.concat(v, '"]')) || s.getElementById(C) || s.createElement("style"), i.value.isConnected || (r.value = P || e, en(i.value, {
        type: "text/css",
        id: C,
        media: T,
        nonce: R
      }), E ? s.head.prepend(i.value) : s.head.appendChild(i.value), _o(i.value, "data-primevue-style-id", v), en(i.value, X), i.value.onload = function(H) {
        return K?.(H, {
          name: v
        });
      }, O?.(v)), !n.value && (te = ce(r, function(H) {
        i.value.textContent = H, V?.(v);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ae = function() {
    !s || !n.value || (te(), Aa(i.value) && s.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return d && !u && es(re), {
    id: S,
    name: m,
    el: i,
    css: r,
    unload: ae,
    load: re,
    isLoaded: Gi(n)
  };
}
function gt(e) {
  "@babel/helpers - typeof";
  return gt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gt(e);
}
var Lr, Nr, Br, Rr;
function jr(e, t) {
  return as(e) || is(e, t) || os(e, t) || rs();
}
function rs() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function os(e, t) {
  if (e) {
    if (typeof e == "string") return Fr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fr(e, t) : void 0;
  }
}
function Fr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function is(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return s;
  }
}
function as(e) {
  if (Array.isArray(e)) return e;
}
function zr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function wn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zr(Object(n), !0).forEach(function(r) {
      ss(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ss(e, t, n) {
  return (t = ls(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ls(e) {
  var t = us(e, "string");
  return gt(t) == "symbol" ? t : t + "";
}
function us(e, t) {
  if (gt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (gt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function qt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ds = function(t) {
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
}, cs = {}, ps = {}, oe = {
  name: "base",
  css: ds,
  style: Za,
  classes: cs,
  inlineStyles: ps,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(Yt(Lr || (Lr = qt(["", ""])), t));
    return le(i) ? ns(mt(i), wn({
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
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return se.transformCSS(n.name || t.name, "".concat(i).concat(Yt(Nr || (Nr = qt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return se.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return se.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return se.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return se.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return se.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = Ce(this.css, {
        dt: et
      }) || "", i = mt(Yt(Br || (Br = qt(["", "", ""])), r, t)), o = Object.entries(n).reduce(function(a, s) {
        var l = jr(s, 2), d = l[0], c = l[1];
        return a.push("".concat(d, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return le(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return se.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [se.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Yt(Rr || (Rr = qt(["", ""])), Ce(this.style, {
        dt: et
      })), a = mt(se.transformCSS(i, o)), s = Object.entries(n).reduce(function(l, d) {
        var c = jr(d, 2), u = c[0], p = c[1];
        return l.push("".concat(u, '="').concat(p, '"')) && l;
      }, []).join(" ");
      le(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(s, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return wn(wn({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ge = or();
function yt(e) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yt(e);
}
function Hr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Hr(Object(n), !0).forEach(function(r) {
      fs(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Hr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fs(e, t, n) {
  return (t = ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ms(e) {
  var t = hs(e, "string");
  return yt(t) == "symbol" ? t : t + "";
}
function hs(e, t) {
  if (yt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bs = {
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
    text: [we.STARTS_WITH, we.CONTAINS, we.NOT_CONTAINS, we.ENDS_WITH, we.EQUALS, we.NOT_EQUALS],
    numeric: [we.EQUALS, we.NOT_EQUALS, we.LESS_THAN, we.LESS_THAN_OR_EQUAL_TO, we.GREATER_THAN, we.GREATER_THAN_OR_EQUAL_TO],
    date: [we.DATE_IS, we.DATE_IS_NOT, we.DATE_BEFORE, we.DATE_AFTER]
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
}, vs = Symbol();
function gs(e, t) {
  var n = {
    config: Jn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(vs, n), ys(), ws(e, n), n;
}
var it = [];
function ys() {
  ye.clear(), it.forEach(function(e) {
    return e?.();
  }), it = [];
}
function ws(e, t) {
  var n = z(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !se.isStyleNameLoaded("common")) {
      var c, u, p = ((c = oe.getCommonTheme) === null || c === void 0 ? void 0 : c.call(oe)) || {}, m = p.primitive, g = p.semantic, S = p.global, x = p.style, T = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      oe.load(m?.css, Kt({
        name: "primitive-variables"
      }, T)), oe.load(g?.css, Kt({
        name: "semantic-variables"
      }, T)), oe.load(S?.css, Kt({
        name: "global-variables"
      }, T)), oe.loadStyle(Kt({
        name: "global-style"
      }, T), x), se.setLoadedStyleName("common");
    }
  };
  ye.on("theme:change", function(l) {
    n.value || (e.config.globalProperties.$primevue.config.theme = l, n.value = !0);
  });
  var i = ce(t.config, function(l, d) {
    Ge.emit("config:change", {
      newValue: l,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = ce(function() {
    return t.config.ripple;
  }, function(l, d) {
    Ge.emit("config:ripple:change", {
      newValue: l,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ce(function() {
    return t.config.theme;
  }, function(l, d) {
    n.value || se.setTheme(l), t.config.unstyled || r(), n.value = !1, Ge.emit("config:theme:change", {
      newValue: l,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ce(function() {
    return t.config.unstyled;
  }, function(l, d) {
    !l && t.config.theme && r(), Ge.emit("config:unstyled:change", {
      newValue: l,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  it.push(i), it.push(o), it.push(a), it.push(s);
}
var ks = {
  install: function(t, n) {
    var r = Sa(bs, n);
    gs(t, r);
  }
}, ar = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = Ao();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Ss(e, t, n, r, i, o) {
  return o.inline ? F(e.$slots, "default", {
    key: 0
  }) : i.mounted ? (f(), L(xo, {
    key: 1,
    to: n.appendTo
  }, [F(e.$slots, "default")], 8, ["to"])) : D("", !0);
}
ar.render = Ss;
var We = {
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
function xs() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Bt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ur = oe.extend({
  name: "common"
});
function wt(e) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wt(e);
}
function $s(e) {
  return Ho(e) || Cs(e) || zo(e) || Fo();
}
function Cs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pt(e, t) {
  return Ho(e) || Ts(e, t) || zo(e, t) || Fo();
}
function Fo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zo(e, t) {
  if (e) {
    if (typeof e == "string") return An(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? An(e, t) : void 0;
  }
}
function An(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ts(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        l = !1;
      } else for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return s;
  }
}
function Ho(e) {
  if (Array.isArray(e)) return e;
}
function Yr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Yr(Object(n), !0).forEach(function(r) {
      ft(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ft(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Es(e, "string");
  return wt(t) == "symbol" ? t : t + "";
}
function Es(e, t) {
  if (wt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (wt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var dt = {
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
        ye.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ye.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, i, o, a, s, l, d, c, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, g = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = g || m) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var S = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, x = S ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, T = S ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (c = T || x) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (u = c.onBeforeCreate) === null || u === void 0 || u.call(c), this.$attrSelector = xs(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Me(ut(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = ee({
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
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return tr(t) ? t.apply(void 0, r) : b.apply(void 0, r);
    },
    _load: function() {
      We.isStyleNameLoaded("base") || (oe.loadCSS(this.$styleOptions), this._loadGlobalStyles(), We.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !We.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ur.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), We.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      le(t) && oe.load(t, ee({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!se.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, a = o.primitive, s = o.semantic, l = o.global, d = o.style;
          oe.load(a?.css, ee({
            name: "primitive-variables"
          }, this.$styleOptions)), oe.load(s?.css, ee({
            name: "semantic-variables"
          }, this.$styleOptions)), oe.load(l?.css, ee({
            name: "global-variables"
          }, this.$styleOptions)), oe.loadStyle(ee({
            name: "global-style"
          }, this.$styleOptions), d), se.setLoadedStyleName("common");
        }
        if (!se.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, u, p, m, g = ((c = this.$style) === null || c === void 0 || (u = c.getComponentTheme) === null || u === void 0 ? void 0 : u.call(c)) || {}, S = g.css, x = g.style;
          (p = this.$style) === null || p === void 0 || p.load(S, ee({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(ee({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), x), se.setLoadedStyleName(this.$style.name);
        }
        if (!se.isStyleNameLoaded("layer-order")) {
          var T, A, _ = (T = this.$style) === null || T === void 0 || (A = T.getLayerOrderThemeCSS) === null || A === void 0 ? void 0 : A.call(T);
          oe.load(_, ee({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), se.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = o.css, s = (i = this.$style) === null || i === void 0 ? void 0 : i.load(a, ee({
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
      We.clearLoadedStyleNames(), ye.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ye.off("theme:change", this._loadCoreStyles), ye.off("theme:change", this._load), ye.off("theme:change", this._themeScopedListener);
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
      return rr(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!i[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, l = s.mergeSections, d = l === void 0 ? !0 : l, c = s.mergeProps, u = c === void 0 ? !1 : c, p = o ? a ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, m = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, ee(ee({}, i), {}, {
        global: p || {}
      })), g = this._getPTDatasets(r);
      return d || !d && m ? u ? this._mergeProps(u, p, m, g) : ee(ee(ee({}, p), m), g) : ee(ee({}, m), g);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return b(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && le((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && ee(ee({}, r === "root" && ee(ee(ft({}, "".concat(i, "name"), Ie(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && ft({}, "".concat(i, "extend"), Ie(this.$.type.name))), {}, ft({}, "".concat(this.$attrSelector), ""))), {}, ft({}, "".concat(i, "section"), Ie(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return $e(t) || Po(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
        var l, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = i ? i(s) : s, u = Ie(r), p = Ie(n.$name);
        return (l = d ? u !== p ? c?.[u] : void 0 : c?.[u]) !== null && l !== void 0 ? l : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: o(t.originalValue),
        value: o(t.value)
      } : o(t, !0);
    },
    _usePT: function(t, n, r, i) {
      var o = function(S) {
        return n(S, r, i);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, s = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, l = s.mergeSections, d = l === void 0 ? !0 : l, c = s.mergeProps, u = c === void 0 ? !1 : c, p = o(t.originalValue), m = o(t.value);
        return p === void 0 && m === void 0 ? void 0 : $e(m) ? m : $e(p) ? p : d || !d && m ? u ? this._mergeProps(u, p, m) : ee(ee({}, p), m) : m;
      }
      return o(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, ee(ee({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = b(this.$_attrsWithoutPT, this.ptm(n, r));
      return i?.hasOwnProperty("id") && ((t = i.id) !== null && t !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, ee({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, ee(ee({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, t, ee(ee({}, this.$params), r)), o = this._getOptionValue(Ur.inlineStyles, t, ee(ee({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return Ce(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, ee({}, n.$params)) || Ce(r, ee({}, n.$params));
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
        var i = pt(r, 1), o = i[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return ee(ee({
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
        var n = pt(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = pt(n, 2), i = r[0], o = r[1], a = i.split(":"), s = $s(a), l = An(s).slice(1);
        return l?.reduce(function(d, c, u, p) {
          return !d[c] && (d[c] = u === p.length - 1 ? o : {}), d[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = pt(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = pt(n, 2), i = r[0], o = r[1];
        return t[i] = o, t;
      }, {});
    }
  }
}, Os = `
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
`, Ms = oe.extend({
  name: "baseicon",
  css: Os
});
function kt(e) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kt(e);
}
function qr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Kr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? qr(Object(n), !0).forEach(function(r) {
      Ds(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ds(e, t, n) {
  return (t = As(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function As(e) {
  var t = _s(e, "string");
  return kt(t) == "symbol" ? t : t + "";
}
function _s(e, t) {
  if (kt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (kt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ye = {
  name: "BaseIcon",
  extends: dt,
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
  style: Ms,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ne(this.label);
      return Kr(Kr({}, !this.isUnstyled && {
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
function St(e) {
  "@babel/helpers - typeof";
  return St = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, St(e);
}
function Wr(e, t) {
  return Ns(e) || Ls(e, t) || Vs(e, t) || Is();
}
function Is() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vs(e, t) {
  if (e) {
    if (typeof e == "string") return Gr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gr(e, t) : void 0;
  }
}
function Gr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ls(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return s;
  }
}
function Ns(e) {
  if (Array.isArray(e)) return e;
}
function Zr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Zr(Object(n), !0).forEach(function(r) {
      _n(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Zr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function _n(e, t, n) {
  return (t = Bs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bs(e) {
  var t = Rs(e, "string");
  return St(t) == "symbol" ? t : t + "";
}
function Rs(e, t) {
  if (St(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (St(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var W = {
  _getMeta: function() {
    return [Be(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Ce(Be(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, i, o;
    return (r = (t == null || (i = t.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: rr,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, l = function() {
      var A = W._getOptionValue.apply(W, arguments);
      return $e(A) || Po(A) ? {
        class: A
      } : A;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = d.mergeSections, u = c === void 0 ? !0 : c, p = d.mergeProps, m = p === void 0 ? !1 : p, g = s ? W._useDefaultPT(r, r.defaultPT(), l, o, a) : void 0, S = W._usePT(r, W._getPT(i, r.$name), l, o, ne(ne({}, a), {}, {
      global: g || {}
    })), x = W._getPTDatasets(r, o);
    return u || !u && S ? m ? W._mergeProps(r, m, g, S, x) : ne(ne(ne({}, g), S), x) : ne(ne({}, S), x);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return ne(ne({}, n === "root" && _n({}, "".concat(r, "name"), Ie(t.$name))), {}, _n({}, "".concat(r, "section"), Ie(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(a) {
      var s, l = r ? r(a) : a, d = Ie(n);
      return (s = l?.[d]) !== null && s !== void 0 ? s : l;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: i(t.originalValue),
      value: i(t.value)
    } : i(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, a = function(x) {
      return r(x, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, l = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, d = l.mergeSections, c = d === void 0 ? !0 : d, u = l.mergeProps, p = u === void 0 ? !1 : u, m = a(n.originalValue), g = a(n.value);
      return m === void 0 && g === void 0 ? void 0 : $e(g) ? g : $e(m) ? m : c || !c && g ? p ? W._mergeProps(t, p, m, g) : ne(ne({}, m), g) : g;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return W._usePT(t, n, r, i, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = W._getConfig(r, i), a = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    W._loadCoreStyles(n, a), W._loadThemeStyles(n, a), W._loadScopedThemeStyles(n, a), W._removeThemeListeners(n), n.$loadStyles = function() {
      return W._loadThemeStyles(n, a);
    }, W._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!We.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      oe.loadCSS(i), (o = r.$style) === null || o === void 0 || o.loadCSS(i), We.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (t = i.theme) === null || t === void 0 ? void 0 : t.call(i)) === "none")) {
      if (!se.isStyleNameLoaded("common")) {
        var a, s, l = ((a = i.$style) === null || a === void 0 || (s = a.getCommonTheme) === null || s === void 0 ? void 0 : s.call(a)) || {}, d = l.primitive, c = l.semantic, u = l.global, p = l.style;
        oe.load(d?.css, ne({
          name: "primitive-variables"
        }, o)), oe.load(c?.css, ne({
          name: "semantic-variables"
        }, o)), oe.load(u?.css, ne({
          name: "global-variables"
        }, o)), oe.loadStyle(ne({
          name: "global-style"
        }, o), p), se.setLoadedStyleName("common");
      }
      if (!se.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var m, g, S, x, T = ((m = i.$style) === null || m === void 0 || (g = m.getDirectiveTheme) === null || g === void 0 ? void 0 : g.call(m)) || {}, A = T.css, _ = T.style;
        (S = i.$style) === null || S === void 0 || S.load(A, ne({
          name: "".concat(i.$style.name, "-variables")
        }, o)), (x = i.$style) === null || x === void 0 || x.loadStyle(ne({
          name: "".concat(i.$style.name, "-style")
        }, o), _), se.setLoadedStyleName(i.$style.name);
      }
      if (!se.isStyleNameLoaded("layer-order")) {
        var k, E, w = (k = i.$style) === null || k === void 0 || (E = k.getLayerOrderThemeCSS) === null || E === void 0 ? void 0 : E.call(k);
        oe.load(w, ne({
          name: "layer-order",
          first: !0
        }, o)), se.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var i, o, a, s = ((i = t.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(t.$attrSelector, "]"))) || {}, l = s.css, d = (a = t.$style) === null || a === void 0 ? void 0 : a.load(l, ne({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    We.clearLoadedStyleNames(), ye.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ye.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, i, o, a) {
    var s, l, d = "on".concat(xa(n)), c = W._getConfig(i, o), u = r?.$instance, p = W._usePT(u, W._getPT(i == null || (s = i.value) === null || s === void 0 ? void 0 : s.pt, t), W._getOptionValue, "hooks.".concat(d)), m = W._useDefaultPT(u, c == null || (l = c.pt) === null || l === void 0 || (l = l.directives) === null || l === void 0 ? void 0 : l[t], W._getOptionValue, "hooks.".concat(d)), g = {
      el: r,
      binding: i,
      vnode: o,
      prevVnode: a
    };
    p?.(u, g), m?.(u, g);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return tr(t) ? t.apply(void 0, r) : b.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, l, d, c, u) {
      var p, m, g, S;
      l._$instances = l._$instances || {};
      var x = W._getConfig(d, c), T = l._$instances[t] || {}, A = Ne(T) ? ne(ne({}, n), n?.methods) : {};
      l._$instances[t] = ne(ne({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: l,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: T.$el || l || void 0,
        $style: ne({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: x,
        $attrSelector: (p = l.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return W._getPT(x?.pt, void 0, function(k) {
            var E;
            return k == null || (E = k.directives) === null || E === void 0 ? void 0 : E[t];
          });
        },
        isUnstyled: function() {
          var k, E;
          return ((k = l._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.unstyled) !== void 0 ? (E = l._$instances[t]) === null || E === void 0 || (E = E.$binding) === null || E === void 0 || (E = E.value) === null || E === void 0 ? void 0 : E.unstyled : x?.unstyled;
        },
        theme: function() {
          var k;
          return (k = l._$instances[t]) === null || k === void 0 || (k = k.$primevueConfig) === null || k === void 0 ? void 0 : k.theme;
        },
        preset: function() {
          var k;
          return (k = l._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.dt;
        },
        /* instance's methods */
        ptm: function() {
          var k, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return W._getPTValue(l._$instances[t], (k = l._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.pt, E, ne({}, w));
        },
        ptmo: function() {
          var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return W._getPTValue(l._$instances[t], k, E, w, !1);
        },
        cx: function() {
          var k, E, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (k = l._$instances[t]) !== null && k !== void 0 && k.isUnstyled() ? void 0 : W._getOptionValue((E = l._$instances[t]) === null || E === void 0 || (E = E.$style) === null || E === void 0 ? void 0 : E.classes, w, ne({}, O));
        },
        sx: function() {
          var k, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, O = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return w ? W._getOptionValue((k = l._$instances[t]) === null || k === void 0 || (k = k.$style) === null || k === void 0 ? void 0 : k.inlineStyles, E, ne({}, O)) : void 0;
        }
      }, A), l.$instance = l._$instances[t], (m = (g = l.$instance)[s]) === null || m === void 0 || m.call(g, l, d, c, u), l["$".concat(t)] = l.$instance, W._hook(t, s, l, d, c, u), l.$pd || (l.$pd = {}), l.$pd[t] = ne(ne({}, (S = l.$pd) === null || S === void 0 ? void 0 : S[t]), {}, {
        name: t,
        instance: l._$instances[t]
      });
    }, i = function(s) {
      var l, d, c, u = s._$instances[t], p = u?.watch, m = function(x) {
        var T, A = x.newValue, _ = x.oldValue;
        return p == null || (T = p.config) === null || T === void 0 ? void 0 : T.call(u, A, _);
      }, g = function(x) {
        var T, A = x.newValue, _ = x.oldValue;
        return p == null || (T = p["config.ripple"]) === null || T === void 0 ? void 0 : T.call(u, A, _);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": g
      }, p == null || (l = p.config) === null || l === void 0 || l.call(u, u?.$primevueConfig), Ge.on("config:change", m), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (c = u.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), Ge.on("config:ripple:change", g);
    }, o = function(s) {
      var l = s._$instances[t].$watchersCallback;
      l && (Ge.off("config:change", l.config), Ge.off("config:ripple:change", l["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, l, d, c) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: Ba("pd")
        }, r("created", s, l, d, c);
      },
      beforeMount: function(s, l, d, c) {
        var u;
        W._loadStyles((u = s.$pd[t]) === null || u === void 0 ? void 0 : u.instance, l, d), r("beforeMount", s, l, d, c), i(s);
      },
      mounted: function(s, l, d, c) {
        var u;
        W._loadStyles((u = s.$pd[t]) === null || u === void 0 ? void 0 : u.instance, l, d), r("mounted", s, l, d, c);
      },
      beforeUpdate: function(s, l, d, c) {
        r("beforeUpdate", s, l, d, c);
      },
      updated: function(s, l, d, c) {
        var u;
        W._loadStyles((u = s.$pd[t]) === null || u === void 0 ? void 0 : u.instance, l, d), r("updated", s, l, d, c);
      },
      beforeUnmount: function(s, l, d, c) {
        var u;
        o(s), W._removeThemeListeners((u = s.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", s, l, d, c);
      },
      unmounted: function(s, l, d, c) {
        var u;
        (u = s.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", s, l, d, c);
      }
    };
  },
  extend: function() {
    var t = W._getMeta.apply(W, arguments), n = Wr(t, 2), r = n[0], i = n[1];
    return ne({
      extend: function() {
        var a = W._getMeta.apply(W, arguments), s = Wr(a, 2), l = s[0], d = s[1];
        return W.extend(l, ne(ne(ne({}, i), i?.methods), d));
      }
    }, W._extend(r, i));
  }
}, js = `
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
`, Fs = {
  root: "p-ink"
}, zs = oe.extend({
  name: "ripple-directive",
  style: js,
  classes: Fs
}), Hs = W.extend({
  style: zs
});
function xt(e) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xt(e);
}
function Us(e) {
  return Ws(e) || Ks(e) || qs(e) || Ys();
}
function Ys() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qs(e, t) {
  if (e) {
    if (typeof e == "string") return In(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? In(e, t) : void 0;
  }
}
function Ks(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ws(e) {
  if (Array.isArray(e)) return In(e);
}
function In(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Qr(e, t, n) {
  return (t = Gs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gs(e) {
  var t = Zs(e, "string");
  return xt(t) == "symbol" ? t : t + "";
}
function Zs(e, t) {
  if (xt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (xt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sr = Hs.extend("ripple", {
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
      n || (n = _a("span", Qr(Qr({
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
      var n = this, r = t.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && vn(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Mr(i) && !Dr(i)) {
          var o = Math.max(Xt(r), Va(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var a = Ia(r), s = t.pageX - a.left + document.body.scrollTop - Dr(i) / 2, l = t.pageY - a.top + document.body.scrollLeft - Mr(i) / 2;
        i.style.top = l + "px", i.style.left = s + "px", !this.isUnstyled() && Ca(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && vn(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && vn(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Us(t.children).find(function(n) {
        return Ze(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function $t(e) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $t(e);
}
function Qs(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Xs(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, el(r.key), r);
  }
}
function Js(e, t, n) {
  return t && Xs(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function el(e) {
  var t = tl(e, "string");
  return $t(t) == "symbol" ? t : t + "";
}
function tl(e, t) {
  if ($t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var nl = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Qs(this, e), this.element = t, this.listener = n;
  }
  return Js(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = La(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), rl = or();
const ol = "data-wippy-overlay-layer";
function Uo() {
  return typeof window < "u" && typeof window.document < "u";
}
function Yo() {
  return Uo() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function il() {
  return Yo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const al = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let sl = 0;
const nn = /* @__PURE__ */ new WeakMap();
function Xr(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ll(e, t) {
  if (!al.test(e.className))
    return;
  const n = e.style.cssText;
  Xr(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!nn.has(e)) {
    const r = new MutationObserver(() => {
      const i = e.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && Xr(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), nn.set(e, r);
  }
}
function lr(e) {
  const t = nn.get(e);
  t && (t.disconnect(), nn.delete(e));
}
function ul(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Vn(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const rn = /* @__PURE__ */ new Set(), ur = /* @__PURE__ */ new WeakMap();
let Jr = !1, Ln = !1;
const eo = ["w-theme-dark", "w-theme-light"], Wt = "data-wippy-theme-root", Nn = /* @__PURE__ */ new WeakMap();
function dl(e) {
  const t = [];
  let n = e ? e.parentNode : null;
  for (; n && n.nodeType === 1; )
    t.push(n), n = n.parentNode;
  return t;
}
function cl(e, t, n) {
  const r = [...dl(t), n.host], i = () => {
    let a;
    for (const s of r) {
      if (eo.some((l) => s.classList.contains(l))) {
        a = s;
        break;
      }
      if (s.hasAttribute(Wt))
        break;
    }
    for (const s of eo)
      e.classList.toggle(s, !!(a && a.classList.contains(s)));
    a ? e.setAttribute(Wt, "") : e.removeAttribute(Wt);
  };
  i();
  const o = new MutationObserver(i);
  for (const a of r)
    o.observe(a, { attributes: !0, attributeFilter: ["class", Wt] });
  Nn.set(e, o);
}
function qo(e) {
  Nn.get(e)?.disconnect(), Nn.delete(e);
}
function pl() {
  Ln = !1;
  for (const e of rn) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && lr(t);
      rn.delete(e), ur.get(e)?.disconnect(), qo(e);
      continue;
    }
    e.childElementCount > 0 && Vn(e);
  }
}
function to() {
  Ln || (Ln = !0, requestAnimationFrame(pl));
}
function fl(e) {
  const t = document.createElement("div");
  t.setAttribute(ol, "");
  const n = Yo();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Vn(t);
  const r = new MutationObserver((i) => {
    const o = t.__wippyAnchorName;
    for (const a of i) {
      if (o)
        for (const s of Array.from(a.addedNodes))
          s instanceof HTMLElement && ll(s, o);
      for (const s of Array.from(a.removedNodes))
        s instanceof HTMLElement && lr(s);
    }
    t.isConnected && t.childElementCount > 0 && Vn(t);
  });
  return r.observe(t, { childList: !0 }), ur.set(t, r), rn.add(t), Jr || (Jr = !0, window.addEventListener("scroll", to, { capture: !0, passive: !0 }), window.addEventListener("resize", to, { passive: !0 })), t;
}
function no(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = fl(e.hostRoot), cl(e.layer, e.$el, e.hostRoot), il())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++sl}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function ro(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && lr(t);
    rn.delete(e.layer), ur.get(e.layer)?.disconnect(), qo(e.layer), e.layer.remove(), e.layer = null;
  }
}
let oo = !1;
function ml() {
  if (oo)
    return;
  oo = !0;
  const e = ar;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Uo() && (this.hostRoot = ul(this.$el), this.mounted = !0, this.hostRoot && (this.inline || no(this), this.$watch("inline", (t) => {
      t ? ro(this) : no(this);
    })));
  }, e.render = function() {
    return this.inline ? F(this.$slots, "default", { key: 0 }) : this.mounted ? Zi(xo, { key: 1, to: this.resolvedTarget || document.body }, [
      F(this.$slots, "default")
    ]) : D("", !0);
  }, e.unmounted = function() {
    ro(this);
  };
}
const hl = {
  install: (e) => {
    ml(), e.use(ks, { theme: "none" });
  }
};
var Bn = "data-wippy-visible";
function io(e) {
  const t = e.getAttribute(Bn);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var bl = Object.defineProperty, vl = (e, t, n) => t in e ? bl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, me = (e, t, n) => vl(e, typeof t != "symbol" ? t + "" : t, n), gl = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], yl = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function ao(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function wl(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, i] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && i && typeof i == "object") {
          for (const [a, s] of Object.entries(i)) {
            const l = typeof s == "string" ? ao(a) : null;
            l && t.add(l);
          }
          continue;
        }
        const o = typeof i == "string" ? ao(r) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function kl(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${yl} {
${t}
}`;
}
function Sl(e, t) {
  const n = kl(t);
  n && Ko(e, n, "@wippy-fe/css-variables-bridge");
}
function xl(e, t) {
  const r = (t ?? gl).map(async (i) => {
    const o = aa[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await sa(o);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${i}" (${o}):`, a), null;
    }
  });
  return Promise.all(r).then((i) => {
    for (const o of i) {
      if (!o)
        continue;
      const a = document.createElement("style");
      a.textContent = o, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function $l(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Ko(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, i];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Cl(e, t) {
  Ko(e, t, "@wippy-fe/custom-css");
}
function Wo(e) {
  return e.__wippyHost ?? null;
}
function Tl(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Pl(e, t, n) {
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
function kn(e, t) {
  const n = {}, r = [];
  for (const [i, o] of Object.entries(t.properties)) {
    const a = e.getAttribute(i), s = Tl(i);
    if (a === null) {
      o.default !== void 0 && (n[s] = o.default);
      continue;
    }
    const l = Pl(i, a, o);
    l.error ? r.push(l.error) : n[s] = l.value;
  }
  return { props: n, errors: r };
}
var El = class {
  constructor(e, t) {
    me(this, "_props"), me(this, "_errors"), me(this, "_content"), me(this, "_hostVisibility"), me(this, "_propsListeners", /* @__PURE__ */ new Set()), me(this, "_contentListeners", /* @__PURE__ */ new Set()), me(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), me(this, "_disposed", !1), me(this, "_emitToDom"), me(this, "props"), me(this, "events"), me(this, "content"), me(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, i) {
        return n._subscribeProps(r, i);
      }
    }, this.events = {
      emit(r, i) {
        n._disposed || n._emitToDom(r, i);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, i) {
        return n._subscribeContent(r, i);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, i) {
        return n._subscribeHostVisibility(r, i);
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
}, Ol = class extends HTMLElement {
  constructor() {
    super(), me(this, "_internals"), me(this, "_contentObserver", null), me(this, "_initialized", !1), me(this, "_container", null), me(this, "_reactive", null), me(this, "_lastProps", null), me(this, "_lastErrors", []), me(this, "_lastContent", null), me(this, "_themeUnsub", null), me(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = io(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Bn])];
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
    return Wo(this);
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
        const o = kn(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, r = o.errors, this._lastProps = n, this._lastErrors = r;
      }
      const i = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = i), this._reactive = new El(
        { props: n, errors: r, content: i, hasContent: t, hostVisibility: this._hostVisible },
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
        this.onInit(n), e.inlineCss && $l(n, e.inlineCss);
        try {
          const d = Cr?.theming, c = wl(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          Sl(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = Cr?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            c && Cl(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && xl(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const l = e.containerClasses ?? [];
        l.length > 0 && r.classList.add(...l), n.appendChild(r), this._container = r, oa(na);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = rt("@theme", (l) => this._applyTheme(l)));
      const { props: i, errors: o } = kn(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(i));
      const a = i;
      this._lastProps = a, this._lastErrors = o;
      let s = null;
      e.contentTemplate && (s = this._extractContent(e.contentTemplate), this._lastContent = s, this._contentObserver = new MutationObserver(() => {
        const l = this._extractContent(e.contentTemplate);
        this._lastContent = l, this._reactive?.notifyContent(l), this.onContentChanged(l);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, a, o, s, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ia.getThemeMode?.()) {
    Ht(e, this), this._container && Ht(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Ht("auto", this), this._container && Ht("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Bn) {
      const s = this._hostVisible, l = io(this);
      if (l === s)
        return;
      this._hostVisible = l, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(l, s), this.onHostVisibilityChanged(l, s));
      return;
    }
    const r = this.constructor.wippyConfig, { props: i, errors: o } = kn(this, r.propsSchema);
    r.validateProps && o.push(...r.validateProps(i));
    const a = i;
    this._lastProps = a, this._lastErrors = o, this._reactive?.notifyProps(a, o), this.onPropsChanged(a, o);
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
   *
   * A template keeps its children in one of two places. Parsed HTML (page
   * markup, `innerHTML`) puts them in `template.content`, a DocumentFragment.
   * DOM APIs add them as the template element's own child nodes and leave
   * `template.content` empty: that is how a Vue SFC sets
   * `<template data-type="...">{{ text }}</template>`. The content fragment is
   * read first, then the element's own children. Only text is returned, never
   * markup, in both cases.
   */
  _extractContent(e) {
    const t = this.querySelector(`template[data-type="${e}"]`);
    return t ? t.content.textContent?.trim() || t.textContent?.trim() || "" : null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function Ml(e) {
  return e.__wippyHostBus ?? null;
}
function Dl(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Al = Object.defineProperty, _l = (e, t, n) => t in e ? Al(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, nt = (e, t, n) => _l(e, typeof t != "symbol" ? t + "" : t, n), Il = /* @__PURE__ */ Symbol("wippy:emit"), Go = /* @__PURE__ */ Symbol("wippy:props"), Zo = /* @__PURE__ */ Symbol("wippy:props_error"), Vl = /* @__PURE__ */ Symbol("wippy:content"), Ll = /* @__PURE__ */ Symbol("wippy:panel-id"), Nl = /* @__PURE__ */ Symbol("wippy:layout-bus"), Bl = /* @__PURE__ */ Symbol("wippy:host"), Rl = /* @__PURE__ */ Symbol("wippy:host-visibility");
function jl() {
  const e = ln(Go);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Fl() {
  const e = ln(Zo);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var zl = class extends Ol {
  constructor() {
    super(...arguments), nt(this, "_vueApp", null), nt(this, "_propsRef", z({})), nt(this, "_errorsRef", z([])), nt(this, "_contentRef", z(null)), nt(this, "_hostVisibilityRef", z(null)), nt(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, i, o) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      this.emitEvent("invalid", { message: d });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((d, c) => {
      this._propsRef.value = d, this._errorsRef.value = [...c];
      for (const u of c)
        this.emitEvent("invalid", { message: u });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: s.signal });
    const l = (d) => {
      if (s.signal.aborted)
        return;
      const c = ua(), u = Qi(d.rootComponent);
      this._vueApp = u;
      const p = da();
      if (d.piniaPlugins)
        for (const m of d.piniaPlugins)
          p.use(m);
      if (u.use(p), d.plugins)
        for (const m of d.plugins)
          u.use(m);
      u.provide(Go, this._propsRef), u.provide(Zo, this._errorsRef), u.provide(Il, this.emitEvent.bind(this)), u.provide(Vl, this._contentRef), u.provide(Rl, this._hostVisibilityRef), u.provide(Ll, Dl(this)), u.provide(Nl, Ml(this)), u.provide(Bl, Wo(this)), d.providers && d.providers(u, this), u.mount(t), c && ca(c);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), a.lazyConfig().then((c) => {
        s.signal.aborted || (d.remove(), l(c));
      }).catch((c) => {
        if (s.signal.aborted)
          return;
        const u = c instanceof Error ? c.message : String(c), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), d.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const Hl = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version: 1 is a choice-only form, 2 is a form with at least one standard field (`text`, `textarea`, `number`, `email`, `date`, `checkbox`). A higher value, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead, and so does a field whose type this version does not know.' }, definition: { type: "object", default: null, description: "The questions to ask: `title`, optional `description`, and `fields`. Every field is `{ id, type, label, description?, required }` plus the keys of its type: `choice` adds `options: [{value, label, description?}]`, `multiple` and `allow_other`; `text` and `textarea` add `min_length`, `max_length`, `placeholder` and `default` (`text` also `pattern`, a full-match expression that only the server checks, answering a mismatch with a 422 `pattern_mismatch` on the field); `number` adds `min`, `max`, `step`, `integer` and `default`; `email` adds `default`; `date` adds `min`, `max` (`YYYY-MM-DD`) and `default`; `checkbox` adds `default` (only `false`). Optional `submit_label` is the fields form's Submit button text (the question card does not show it), and optional `answered_message` is accepted and not shown. When every field is a choice the question card renders, otherwise the fields form. A definition with no fields shows an error message." }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' } } } }, Ul = {
  wippy: Hl
};
function dr(e) {
  return ra[e];
}
const Yl = 2e3;
function ql(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function i() {
    n && clearTimeout(n), n = null;
  }
  ce([() => e.value?.artifact_id, () => e.value?.status, () => e.value?.delivery], () => {
    const o = e.value;
    if (!o || o.status !== "idle" || o.delivery !== "pending" || r.has(o.artifact_id))
      return;
    i();
    const a = o.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const s = await t();
      !s || s.artifact_id !== a || s.delivery !== "pending" || r.has(a) || (r.add(a), dr("ws")?.send({ type: "session_open", session_id: s.session_id }));
    }, Yl);
  }, { immediate: !0 }), un(i);
}
const Kl = /* @__PURE__ */ new Set([1, 2]);
function so(e) {
  return Kl.has(e);
}
const Wl = {
  choice: !0,
  text: !0,
  textarea: !0,
  number: !0,
  email: !0,
  date: !0,
  checkbox: !0
};
function Gl(e) {
  return Object.hasOwn(Wl, e);
}
function dn(e) {
  return e.type === "choice";
}
function Zl(e) {
  return e.definition.fields.length > 0 && e.definition.fields.every(dn);
}
function st(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ct(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function lo(e) {
  return typeof e == "string" ? e : Ct(e) ? e.value : null;
}
function cr(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => lo(n) === t) : lo(e) === t;
}
function Tt(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(st);
    return t ? t.other : "";
  }
  return st(e) ? e.other : "";
}
function pr(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(st) : st(e);
}
function fr(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((i) => Ct(i) && i.value === t);
  return r && Ct(r) ? r.note : "";
}
const Qo = "This form needs a newer Web Host.", Xo = "This form cannot be submitted here.", Jt = "Could not submit this form.", Jo = "Could not load this form.", ei = "Tick at least one answer, or type your own.", mr = "This question is required.", ti = "You are offline. Your choices are kept.", Rn = "Sending your answer…", ni = "Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request.";
function Te(e, t) {
  if (e == null)
    return;
  const n = e[t];
  return Object.hasOwn(e, t) ? n : void 0;
}
const Ql = 1e12, Xl = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
function Jl(e) {
  const t = e.startsWith("-"), [n, r = ""] = (t ? e.slice(1) : e).split("."), i = n.replace(/^0+/, "") || "0", o = r.replace(/0+$/, ""), a = o ? `${i}.${o}` : i;
  return t && a !== "0" ? `-${a}` : a;
}
function eu(e) {
  const t = e.trim();
  if (t === "")
    return { kind: "empty" };
  if (!Xl.test(t))
    return { kind: "invalid" };
  const n = Number(t);
  if (!Number.isFinite(n))
    return { kind: "invalid" };
  const r = n === 0 ? 0 : n;
  return Ae(r) !== Jl(t) ? { kind: "invalid" } : { kind: "number", value: r };
}
function Ae(e) {
  const t = String(e), n = t.indexOf("e");
  if (n === -1)
    return t;
  const r = t.startsWith("-"), i = t.slice(r ? 1 : 0, n), o = Number(t.slice(n + 1)), a = i.indexOf("."), s = i.replace(".", ""), l = (a === -1 ? i.length : a) + o;
  let d;
  return l <= 0 ? d = `0.${"0".repeat(-l)}${s}` : l >= s.length ? d = s + "0".repeat(l - s.length) : d = `${s.slice(0, l)}.${s.slice(l)}`, r ? `-${d}` : d;
}
function Sn(e) {
  const t = e.indexOf(".");
  return t === -1 ? 0 : e.length - t - 1;
}
function xn(e, t) {
  const n = e.startsWith("-"), r = n ? e.slice(1) : e, i = r.indexOf("."), o = i === -1 ? r : r.slice(0, i), a = i === -1 ? "" : r.slice(i + 1), s = BigInt(`${o}${a.padEnd(t, "0")}`);
  return n ? -s : s;
}
function tu(e, t, n) {
  const r = Ae(e), i = Ae(t), o = Ae(n), a = Math.max(Sn(r), Sn(i), Sn(o)), s = xn(o, a);
  return s === 0n ? !1 : (xn(r, a) - xn(i, a)) % s === 0n;
}
function ge(e) {
  return e.trim();
}
function ri(e) {
  return Array.from(e).length;
}
function cn(e) {
  return `Use at most ${e.toLocaleString("en-US")} characters.`;
}
function hr(e) {
  return ge(e) === "";
}
function nu(e) {
  return e.replace(/\r\n?/g, `
`);
}
function ru(e, t) {
  for (const n of e) {
    const r = n.codePointAt(0);
    if (r < 128) {
      if ((r < 32 || r === 127) && !(t && (r === 9 || r === 10)))
        return !0;
    } else if (r >= 128 && r <= 159 || r >= 8234 && r <= 8238 || r >= 8294 && r <= 8297 || r === 8232 || r === 8233 || r >= 55296 && r <= 57343)
      return !0;
  }
  return !1;
}
const ou = 254, iu = 64, au = { answer: void 0, errors: [] };
function xe(e, t) {
  return { answer: void 0, errors: [{ code: e, message: t }] };
}
function pn(e) {
  return e.required ? xe("required", mr) : au;
}
function su(e, t) {
  const n = e.type === "textarea", r = typeof t == "string" ? t : "", i = n ? nu(r) : r;
  if (ru(i, n))
    return xe("invalid_text", "Remove control characters from this answer.");
  if (hr(i))
    return pn(e);
  const o = ri(i);
  return o < e.min_length ? xe("too_short", `Use at least ${e.min_length} characters.`) : o > e.max_length ? xe("too_long", cn(e.max_length)) : { answer: i, errors: [] };
}
const lu = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*$/, uu = /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;
function du(e) {
  if (e.length > ou)
    return !1;
  const t = e.split("@");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (n.length === 0 || n.length > iu || !lu.test(n))
    return !1;
  const i = r.split(".");
  return i.length >= 2 && i.every((o) => uu.test(o));
}
function cu(e, t) {
  const n = ge(typeof t == "string" ? t : "");
  return n === "" ? pn(e) : du(n) ? { answer: n, errors: [] } : xe("invalid_email", "Enter a valid email address.");
}
function pu(e, t) {
  const n = eu(typeof t == "string" ? t : "");
  if (n.kind === "empty")
    return pn(e);
  if (n.kind === "invalid" || Math.abs(n.value) > Ql)
    return xe("invalid_number", "Enter a number, using a dot for decimals (for example 12 or -3.5).");
  const { value: r } = n;
  if (e.integer && !Number.isInteger(r))
    return xe("not_integer", "Enter a whole number.");
  if (e.min !== void 0 && r < e.min)
    return xe("below_min", `Enter ${Ae(e.min)} or more.`);
  if (e.max !== void 0 && r > e.max)
    return xe("above_max", `Enter ${Ae(e.max)} or less.`);
  if (e.step !== void 0 && !tu(r, e.min ?? 0, e.step)) {
    const i = e.min !== void 0 ? ` starting at ${Ae(e.min)}` : "";
    return xe("not_on_step", `Enter a value in steps of ${Ae(e.step)}${i}.`);
  }
  return { answer: r, errors: [] };
}
const fu = /^(\d{4})-(\d{2})-(\d{2})$/;
function mu(e, t) {
  return t === 2 ? e % 4 === 0 && e % 100 !== 0 || e % 400 === 0 ? 29 : 28 : [4, 6, 9, 11].includes(t) ? 30 : 31;
}
function je(e) {
  const t = fu.exec(e);
  if (!t)
    return !1;
  const n = Number(t[1]), r = Number(t[2]), i = Number(t[3]);
  return n >= 1 && r >= 1 && r <= 12 && i >= 1 && i <= mu(n, r);
}
function hu(e, t) {
  const n = typeof t == "string" ? t : "";
  return hr(n) ? pn(e) : je(n) ? e.min && n < e.min ? xe("below_min", `Choose ${e.min} or later.`) : e.max && n > e.max ? xe("above_max", `Choose ${e.max} or earlier.`) : { answer: n, errors: [] } : xe("invalid_date", "Enter a valid date as YYYY-MM-DD.");
}
function bu(e, t) {
  const n = t === !0;
  return e.required && !n ? xe("required", mr) : { answer: n, errors: [] };
}
function vu(e, t) {
  switch (e.type) {
    case "text":
    case "textarea":
      return su(e, t);
    case "email":
      return cu(e, t);
    case "number":
      return pu(e, t);
    case "date":
      return hu(e, t);
    case "checkbox":
      return bu(e, t);
  }
}
function gu(e, t) {
  switch (e.type) {
    // The draft of a number field is the typed text, so the strict parser sees what the user wrote.
    case "number":
      return typeof t == "number" ? Ae(t) : typeof e.default == "number" ? Ae(e.default) : void 0;
    // Only `false` can be a default, so an unchecked start is always right.
    case "checkbox":
      return typeof t == "boolean" ? t : !1;
    default:
      return typeof t == "string" ? t : typeof e.default == "string" ? e.default : void 0;
  }
}
function yu(e, t) {
  switch (e.type) {
    case "number":
      return typeof t == "number" ? Ae(t) : null;
    case "checkbox":
      return typeof t == "boolean" ? t ? "Yes" : "No" : null;
    default:
      return typeof t == "string" && !hr(t) ? t : null;
  }
}
const on = 2e3, an = 1e3, wu = "Enter the other answer.";
function sn(e, t) {
  return ri(ge(e)) > t;
}
function ku(e) {
  return ge(e) === "" ? { code: "blank", message: wu } : sn(e, on) ? { code: "too_long", message: cn(on) } : null;
}
function oi(e) {
  return e.code === "blank" || e.code === "too_long";
}
function ii(e, t) {
  const n = ge(t);
  return n ? { value: e, note: n } : e;
}
function Su(e, t) {
  if (!(typeof t == "number" || typeof t == "boolean" || Array.isArray(t) !== !!e.multiple))
    return t;
}
function xu(e, t) {
  const n = e.options.filter((i) => cr(t, i.value)).map((i) => ii(i.value, fr(t, i.value))), r = ge(Tt(t));
  return r && n.push({ other: r }), e.multiple ? n.length > 0 ? n : void 0 : n[0];
}
function $u(e, t) {
  const n = Su(e, t), r = xu(e, n), i = pr(n) ? ku(Tt(n)) : null;
  return i ? { answer: r, errors: [i] } : e.options.some((o) => sn(fr(r, o.value), an)) ? { answer: r, errors: [{ code: "too_long", message: cn(an) }] } : r === void 0 && e.required ? { answer: r, errors: [{ code: "required", message: mr }] } : { answer: r, errors: [] };
}
function Cu(e, t) {
  if (t !== void 0)
    return e.multiple ? Array.isArray(t) ? [...t] : [t] : t;
}
function ai(e, t) {
  return dn(e) ? $u(e, t) : vu(e, t);
}
function si(e, t) {
  return ai(e, t).answer;
}
function li(e, t) {
  const n = {};
  for (const r of e.fields) {
    const i = si(r, Te(t, r.id));
    i !== void 0 && (n[r.id] = i);
  }
  return n;
}
function Tu(e, t) {
  const n = {};
  for (const r of e.fields) {
    const { errors: i } = ai(r, Te(t, r.id));
    i.length > 0 && (n[r.id] = i);
  }
  return n;
}
function uo(e, t) {
  return JSON.stringify(e.fields.map((n) => {
    const r = Te(t, n.id), i = r === void 0 || r === "" || Array.isArray(r) && r.length === 0;
    return [n.id, i ? null : r];
  }));
}
function co(e) {
  return typeof e == "string" ? e : st(e) ? { other: e.other } : typeof e == "object" && e !== null && typeof e.value == "string" ? ii(e.value, typeof e.note == "string" ? e.note : "") : null;
}
function Pu(e) {
  if (e === null)
    return null;
  const t = {};
  for (const [n, r] of Object.entries(e)) {
    if (typeof r == "number" || typeof r == "boolean") {
      t[n] = r;
      continue;
    }
    if (Array.isArray(r)) {
      const o = [];
      for (const a of r) {
        const s = co(a);
        s !== null && o.push(s);
      }
      t[n] = o;
      continue;
    }
    const i = co(r);
    i !== null && (t[n] = i);
  }
  return t;
}
function br(e, t) {
  if (t === void 0 || typeof t == "number" || typeof t == "boolean")
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const o of e.options) {
    const a = n.find((s) => typeof s == "string" ? s === o.value : Ct(s) && s.value === o.value);
    a && r.push({ label: o.label, note: Ct(a) ? a.note : void 0 });
  }
  const i = n.find(st);
  return i && r.push({ label: i.other, own: !0 }), r.length > 0 ? r : null;
}
function Eu(e, t) {
  if (dn(e)) {
    const r = br(e, t);
    return r ? { kind: "choice", items: r } : { kind: "empty" };
  }
  const n = yu(e, t);
  return n === null ? { kind: "empty" } : { kind: "text", text: n };
}
function ui(e, t) {
  const n = {};
  for (const r of e.fields) {
    const i = Te(t, r.id), o = dn(r) ? Cu(r, i) : gu(r, i);
    o !== void 0 && (n[r.id] = o);
  }
  return n;
}
const Ou = Symbol.for("wippy.artifactStateError");
function di(e) {
  return typeof e == "object" && e !== null && e[Ou] === !0;
}
function ci(e) {
  return di(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Mu(e) {
  return ci(e).status;
}
function Du(e) {
  return !di(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function pi(e) {
  const t = ci(e);
  if (t.known) {
    const n = t.status;
    return n === void 0 ? t.noResponse ? { code: "network_error", message: "Network problem. Retrying…", retryable: !0, uncertain: !0, shouldReload: !1 } : { code: "unknown", message: t.message ?? Jt, retryable: !0, uncertain: !1, shouldReload: !1 } : n === 401 ? { code: "auth", message: "You are signed out. Sign in again, then retry.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 404 ? { code: "not_found", message: "This form is no longer available.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 409 ? t.code === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : t.code === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 } : n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? Jt, retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? Jt, retryable: !0, uncertain: !1, shouldReload: !1 };
}
const $n = 5e3, Au = 6e4, _u = [401, 403, 404];
function Iu(e, t) {
  const n = z("idle"), r = z(null), i = z(null), o = z(null);
  let a = 0, s = null, l = null, d = null, c = null, u = null, p = $n;
  function m() {
    u && clearTimeout(u), u = null;
  }
  function g($) {
    const V = Mu($);
    if (V !== void 0 && _u.includes(V)) {
      m();
      return;
    }
    u || (u = setTimeout(() => {
      u = null, x();
    }, p), p = Math.min(p * 2, Au));
  }
  async function S() {
    const $ = dr("artifactState");
    if (typeof $ != "function") {
      n.value = "unsupported";
      return;
    }
    const V = e.value;
    if (!V) {
      n.value = "idle", r.value = null, o.value = null;
      return;
    }
    const Z = ++a, K = r.value === null;
    K && (n.value = "loading");
    try {
      const U = await $(V).get();
      if (Z !== a)
        return;
      r.value = { ...U, data: Pu(U.data) }, n.value = "loaded", i.value = null, o.value = null, m(), p = $n;
    } catch (U) {
      if (Z !== a)
        return;
      const Y = U instanceof Error ? U.message : Jo;
      K ? (n.value = "error", i.value = Y) : (o.value = Y, g(U));
    }
  }
  function x() {
    return s ? (l || (l = s.then(() => (l = null, x()))), l) : (s = S().finally(() => {
      s = null;
    }), s);
  }
  function T($) {
    c !== $ && (d?.(), d = null, c = $, $ && (d = rt(`artifact:${$}`, () => {
      x();
    })));
  }
  ce(t, () => {
    x();
  });
  const A = B(() => {
    const $ = r.value;
    return $?.session_id && ($.status === "active" && !$.stale || $.status === "idle" && $.delivery && $.delivery !== "complete") ? $.session_id : null;
  });
  let _ = null, k = null, E = null, w = null;
  Nt(() => {
    ce(e, ($) => {
      a++, m(), p = $n, r.value = null, o.value = null, T($), x();
    }, { immediate: !0 }), ce(A, ($) => {
      _?.(), _ = null, k?.(), k = null, $ && (_ = rt(`session:${$}:message:*`, (V) => {
        V.data?.type !== "chunk" && x();
      }), k = rt(`session:${$}`, () => {
        x();
      }));
    }, { immediate: !0 }), E = rt("@visibility", ($) => {
      $ && x();
    }), w = rt("@reconnect", () => {
      x();
    });
  }), un(() => {
    a++, m(), d?.(), _?.(), k?.(), E?.(), w?.();
  });
  async function O() {
    return await x(), r.value;
  }
  return { status: n, state: r, errorMessage: i, reloadError: o, reload: () => {
    x();
  }, refresh: O };
}
function Vu() {
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
const Lu = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.", Nu = 800, Gt = { ok: !1, ignored: !0 };
function Bu(e) {
  return new Promise((t) => setTimeout(t, e));
}
function po(e, { exhausted: t }) {
  const n = Du(e);
  if (n)
    return { ok: !1, fieldErrors: n.errors, formErrors: n.formErrors };
  const r = pi(e);
  return {
    ok: !1,
    message: t && r.uncertain ? Lu : r.message,
    code: r.code,
    retryable: r.retryable,
    shouldReload: r.shouldReload
  };
}
function Ru(e) {
  const t = z(!1), n = z(null), r = z(null);
  let i = 0;
  ce(e, () => {
    i++, a();
  });
  function o(l) {
    const d = JSON.stringify(l);
    if (n.value && r.value === d)
      return n.value;
    const c = Vu();
    return n.value = c, r.value = d, c;
  }
  function a() {
    n.value = null, r.value = null;
  }
  async function s(l, d, c) {
    const u = e.value;
    if (!u)
      return { ok: !1, message: Xo };
    const p = dr("artifactState");
    if (typeof p != "function")
      return { ok: !1, message: Qo };
    const m = i, g = () => m !== i, S = {
      form_version: l,
      request_id: o(c),
      expected_content_version: d,
      answers: c
    }, x = () => p(u).submit(S);
    t.value = !0;
    try {
      let T;
      try {
        T = await x();
      } catch (A) {
        if (g())
          return Gt;
        if (!pi(A).uncertain)
          return po(A, { exhausted: !1 });
        if (await Bu(Nu), g())
          return Gt;
        try {
          T = await x();
        } catch (_) {
          return g() ? Gt : po(_, { exhausted: !0 });
        }
      }
      return g() ? Gt : (a(), { ok: !0, accepted: T });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: s };
}
const vr = Symbol("wippy-form:element"), Zt = "data-wippy-artifact-id";
function ju() {
  const e = ln(vr), t = z(e?.getAttribute(Zt) ?? null);
  if (e) {
    let n = null;
    Nt(() => {
      t.value = e.getAttribute(Zt), n = new MutationObserver(() => {
        t.value = e.getAttribute(Zt);
      }), n.observe(e, { attributes: !0, attributeFilter: [Zt] });
    }), un(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function Fu(e, t) {
  const n = ln(vr);
  n && Xi(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function zu(e) {
  const t = z(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return Nt(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), un(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
const Hu = () => jl(), Uu = Fl, tt = "text-danger-600 dark:text-danger-400", Yu = "text-warn-700 dark:text-warn-400";
function qu(e) {
  return e === "error" ? tt : e === "warn" ? Yu : void 0;
}
function fi(e) {
  const t = e.ownerDocument, n = t.activeElement;
  return !n || n === t.body || n === t.documentElement;
}
function M(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function Xe(e, t) {
  return t ? `.w-form__${e}--${t}` : `.w-form__${e}`;
}
const Ku = "Sending…", Wu = 2e3;
var mi = {
  name: "CheckIcon",
  extends: Ye
};
function Gu(e) {
  return Ju(e) || Xu(e) || Qu(e) || Zu();
}
function Zu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qu(e, t) {
  if (e) {
    if (typeof e == "string") return jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jn(e, t) : void 0;
  }
}
function Xu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ju(e) {
  if (Array.isArray(e)) return jn(e);
}
function jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ed(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Gu(t[0] || (t[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
mi.render = ed;
var hi = {
  name: "MinusIcon",
  extends: Ye
};
function td(e) {
  return id(e) || od(e) || rd(e) || nd();
}
function nd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function rd(e, t) {
  if (e) {
    if (typeof e == "string") return Fn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fn(e, t) : void 0;
  }
}
function od(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function id(e) {
  if (Array.isArray(e)) return Fn(e);
}
function Fn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ad(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), td(t[0] || (t[0] = [I("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hi.render = ad;
var sd = {
  name: "BaseEditableHolder",
  extends: dt,
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
      var r, i;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (i = this.formField).onChange) === null || r === void 0 || r.call(i, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(le);
    }
  },
  computed: {
    $filled: function() {
      return le(this.d_value);
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
}, Rt = {
  name: "BaseInput",
  extends: sd,
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
}, ld = `
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
`, ud = {
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
}, dd = oe.extend({
  name: "checkbox",
  style: ld,
  classes: ud
}), cd = {
  name: "BaseCheckbox",
  extends: Rt,
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
  style: dd,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function Pt(e) {
  "@babel/helpers - typeof";
  return Pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pt(e);
}
function pd(e, t, n) {
  return (t = fd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function fd(e) {
  var t = md(e, "string");
  return Pt(t) == "symbol" ? t : t + "";
}
function md(e, t) {
  if (Pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function hd(e) {
  return yd(e) || gd(e) || vd(e) || bd();
}
function bd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vd(e, t) {
  if (e) {
    if (typeof e == "string") return zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zn(e, t) : void 0;
  }
}
function gd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function yd(e) {
  if (Array.isArray(e)) return zn(e);
}
function zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var fn = {
  name: "Checkbox",
  extends: cd,
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
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, i;
        this.binary ? i = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? i = r.filter(function(o) {
          return !nr(o, n.value);
        }) : i = r ? [].concat(hd(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(i, t) : this.writeValue(i, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : va(this.value, t);
    },
    dataP: function() {
      return ke(pd({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: mi,
    MinusIcon: hi
  }
}, wd = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], kd = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Sd = ["data-p"];
function xd(e, t, n, r, i, o) {
  var a = Fe("CheckIcon"), s = Fe("MinusIcon");
  return f(), y("div", b({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": i.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [I("input", b({
    ref: "input",
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, kd), I("div", b({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [F(e.$slots, "icon", {
    checked: o.checked,
    indeterminate: i.d_indeterminate,
    class: ie(e.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (f(), L(a, b({
      key: 0,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : i.d_indeterminate ? (f(), L(s, b({
      key: 1,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : D("", !0)];
  })], 16, Sd)], 16, wd);
}
fn.render = xd;
function Et(...e) {
  return e.filter(Boolean).join(" ") || void 0;
}
function $d(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, i) => ({ text: r, code: i % 2 === 1 })).filter((r) => r.text !== "");
}
function fo(e) {
  return String(e).replaceAll("`", "");
}
function bi(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const Cd = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Ue = /* @__PURE__ */ de({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    return (t, n) => (f(!0), y(J, null, be(h($d)(e.text), (r, i) => (f(), y(J, { key: i }, [
      r.code ? (f(), y("code", Cd, N(r.text), 1)) : (f(), y(J, { key: 1 }, [
        fe(N(r.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), Td = { key: 0 }, gr = /* @__PURE__ */ de({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    return (t, n) => (f(!0), y(J, null, be(e.items, (r, i) => (f(), y("span", b({ key: i }, { ref_for: !0 }, h(M)("answer-item")), [
      r.own ? (f(), y(J, { key: 0 }, [
        I("span", b({ ref_for: !0 }, h(M)("answer-own")), "Own answer: ", 16),
        (f(!0), y(J, null, be(h(bi)(r.label), (o, a) => (f(), y(J, { key: a }, [
          a > 0 ? (f(), y("br", Td)) : D("", !0),
          fe(N(o), 1)
        ], 64))), 128))
      ], 64)) : (f(), L(Ue, {
        key: 1,
        text: r.label
      }, null, 8, ["text"])),
      h(ge)(r.note || "") ? (f(), y("span", b({
        key: 2,
        ref_for: !0
      }, h(M)("answer-note")), [
        j(h(Le), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        I("span", null, N(h(ge)(r.note)), 1)
      ], 16)) : D("", !0)
    ], 16))), 128));
  }
}), Pd = ["part"], mo = /* @__PURE__ */ de({
  __name: "field-label",
  props: {
    tag: {},
    controlId: {},
    labelId: {},
    label: {},
    required: { type: Boolean }
  },
  setup(e) {
    const t = M("field-label"), n = M("field-marker");
    return (r, i) => (f(), L(ve(e.tag), {
      id: e.labelId,
      for: e.tag === "label" ? e.controlId : void 0,
      part: h(t).part,
      class: ie(h(t).class)
    }, {
      default: G(() => [
        fe(N(e.label), 1),
        e.required ? (f(), y("span", {
          key: 0,
          part: h(n).part,
          class: ie(`${h(n).class} ${h(tt)}`)
        }, " (required)", 10, Pd)) : D("", !0)
      ]),
      _: 1
    }, 8, ["id", "for", "part", "class"]));
  }
}), Ed = ["part"], Od = ["part"], Md = ["part"], Dd = ["part"], Ad = ["part"], _d = { key: 0 }, Id = ["part"], Vd = ["part"], Ld = ["part"], jt = /* @__PURE__ */ de({
  __name: "field-shell",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean },
    layout: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = Bt(), i = `${r}-control`, o = B(() => n.layout === "group" ? `${r}-label` : void 0), a = `${r}-desc`, s = `${r}-err`, l = z(null), d = B(() => !n.readonly && n.errors.length > 0), c = B(() => Et(!!n.field.description && a, d.value && s)), u = B(() => n.layout === "group" ? "fieldset" : "div"), p = B(() => n.layout === "group" ? "legend" : n.readonly ? "span" : "label"), m = B(() => n.layout === "inline" && !n.readonly), g = B(() => M(
      "field",
      n.layout !== "stacked" && n.layout,
      !!n.field.required && "required",
      d.value && "invalid",
      n.readonly && "readonly",
      n.disabled && "disabled"
    )), S = M("field-description"), x = M("field-control"), T = M("field-error"), A = M("field-row"), _ = B(() => !!n.field.required && !n.readonly), k = B(() => Eu(n.field, n.modelValue)), E = B(() => M("field-value", k.value.kind === "empty" && "empty"));
    return t({
      /** Focuses the first focusable control, e.g. the first invalid field after a failed submit. */
      focusFirstControl() {
        l.value?.querySelector("input, textarea")?.focus();
      }
    }), (w, O) => (f(), L(ve(u.value), {
      ref_key: "rootEl",
      ref: l,
      part: g.value.part,
      class: ie(g.value.class),
      "aria-describedby": e.layout === "group" ? c.value : void 0
    }, {
      default: G(() => [
        m.value ? (f(), y("div", {
          key: 0,
          part: h(A).part,
          class: ie(h(A).class)
        }, [
          I("div", {
            part: h(x).part,
            class: ie(h(x).class)
          }, [
            F(w.$slots, "default", {
              id: i,
              describedBy: c.value,
              invalid: d.value,
              labelId: o.value
            })
          ], 10, Od),
          j(mo, {
            tag: "label",
            "control-id": i,
            label: e.field.label,
            required: _.value
          }, null, 8, ["label", "required"])
        ], 10, Ed)) : (f(), L(mo, {
          key: 1,
          tag: p.value,
          "control-id": i,
          "label-id": o.value,
          label: e.field.label,
          required: _.value
        }, null, 8, ["tag", "label-id", "label", "required"])),
        e.field.description ? (f(), y("p", {
          key: 2,
          id: a,
          part: h(S).part,
          class: ie(h(S).class)
        }, N(e.field.description), 11, Md)) : D("", !0),
        e.readonly ? (f(), y(J, { key: 3 }, [
          k.value.kind === "empty" ? (f(), y("p", {
            key: 0,
            part: E.value.part,
            class: ie(E.value.class)
          }, "Skipped", 10, Dd)) : k.value.kind === "text" ? (f(), y("p", {
            key: 1,
            part: E.value.part,
            class: ie(E.value.class)
          }, [
            (f(!0), y(J, null, be(h(bi)(k.value.text), ($, V) => (f(), y(J, { key: V }, [
              V > 0 ? (f(), y("br", _d)) : D("", !0),
              fe(N($), 1)
            ], 64))), 128))
          ], 10, Ad)) : (f(), y("div", {
            key: 2,
            part: E.value.part,
            class: ie(E.value.class)
          }, [
            j(gr, {
              items: k.value.items
            }, null, 8, ["items"])
          ], 10, Id))
        ], 64)) : m.value ? D("", !0) : (f(), y("div", {
          key: 4,
          part: h(x).part,
          class: ie(h(x).class)
        }, [
          F(w.$slots, "default", {
            id: i,
            describedBy: c.value,
            invalid: d.value,
            labelId: o.value
          })
        ], 10, Vd)),
        d.value ? (f(), y("ul", {
          key: 5,
          id: s,
          part: h(T).part,
          class: ie(`${h(T).class} ${h(tt)}`)
        }, [
          (f(!0), y(J, null, be(e.errors, ($, V) => (f(), y("li", { key: V }, N($.message), 1))), 128))
        ], 10, Ld)) : D("", !0)
      ]),
      _: 3
    }, 8, ["part", "class", "aria-describedby"]));
  }
}), Nd = /* @__PURE__ */ de({
  __name: "checkbox-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = B(() => r.modelValue === !0), a = M("field-input");
    function s(d) {
      return {
        input: {
          "aria-describedby": d,
          "aria-required": r.field.required ? "true" : void 0
        }
      };
    }
    const l = z(null);
    return t({ focusFirstControl: () => l.value?.focusFirstControl() }), (d, c) => (f(), L(jt, {
      ref_key: "shell",
      ref: l,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "inline"
    }, {
      default: G(({ id: u, describedBy: p, invalid: m }) => [
        j(h(fn), {
          "model-value": o.value,
          binary: "",
          "input-id": u,
          disabled: e.disabled,
          invalid: m,
          pt: s(p),
          part: h(a).part,
          class: ie(h(a).class),
          "onUpdate:modelValue": c[0] || (c[0] = (g) => i("update:modelValue", !!g))
        }, null, 8, ["model-value", "input-id", "disabled", "invalid", "pt", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var Bd = `
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
`, Rd = {
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
}, jd = oe.extend({
  name: "inputtext",
  style: Bd,
  classes: Rd
}), Fd = {
  name: "BaseInputText",
  extends: Rt,
  style: jd,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Ot(e) {
  "@babel/helpers - typeof";
  return Ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ot(e);
}
function zd(e, t, n) {
  return (t = Hd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Hd(e) {
  var t = Ud(e, "string");
  return Ot(t) == "symbol" ? t : t + "";
}
function Ud(e, t) {
  if (Ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var mn = {
  name: "InputText",
  extends: Fd,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return b(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ke(zd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Yd = ["value", "name", "disabled", "aria-invalid", "data-p"];
function qd(e, t, n, r, i, o) {
  return f(), y("input", b({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Yd);
}
mn.render = qd;
var Kd = `
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
`, Wd = {
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
}, Gd = oe.extend({
  name: "radiobutton",
  style: Kd,
  classes: Wd
}), Zd = {
  name: "BaseRadioButton",
  extends: Rt,
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
  style: Gd,
  provide: function() {
    return {
      $pcRadioButton: this,
      $parentInstance: this
    };
  }
};
function Mt(e) {
  "@babel/helpers - typeof";
  return Mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Mt(e);
}
function Qd(e, t, n) {
  return (t = Xd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xd(e) {
  var t = Jd(e, "string");
  return Mt(t) == "symbol" ? t : t + "";
}
function Jd(e, t) {
  if (Mt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var vi = {
  name: "RadioButton",
  extends: Zd,
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
      return t != null && (this.binary ? !!t : nr(t, this.value));
    },
    dataP: function() {
      return ke(Qd({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ec = ["data-p-checked", "data-p-disabled", "data-p"], tc = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], nc = ["data-p"], rc = ["data-p"];
function oc(e, t, n, r, i, o) {
  return f(), y("div", b({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [I("input", b({
    id: e.inputId,
    type: "radio",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, tc), I("div", b({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [I("div", b({
    class: e.cx("icon")
  }, o.getPTOptions("icon"), {
    "data-p": o.dataP
  }), null, 16, rc)], 16, nc)], 16, ec);
}
vi.render = oc;
const ic = ["role", "aria-labelledby", "aria-required"], ac = ["for"], sc = /* @__PURE__ */ de({
  __name: "choice-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = Bt(), a = `${o}-other`, s = `${o}-other-text`;
    function l(Y) {
      return `${o}-opt-${Y}`;
    }
    const d = z(null), c = z(null);
    function u(Y) {
      return { input: { "aria-describedby": Y } };
    }
    const p = M("field-options"), m = M("field-option"), g = M("field-option", "other"), S = M("field-option-input"), x = M("field-option-label"), T = M("field-option-description"), A = M("field-other"), _ = M("field-other-input"), k = B(() => r.field.multiple ? fn : vi), E = B(() => r.modelValue), w = B(() => r.errors.some(oi)), O = B(() => pr(E.value)), $ = z(Tt(E.value));
    ce(E, (Y) => {
      $.value = Tt(Y);
    });
    function V(Y) {
      return cr(E.value, Y);
    }
    function Z(Y, te) {
      const re = r.field.options.map((ae) => ae.value).filter(Y);
      te && re.push({ other: $.value }), i("update:modelValue", re.length > 0 ? re : void 0);
    }
    function K(Y, te) {
      r.field.multiple ? Z((re) => re === Y ? te : V(re), O.value) : i("update:modelValue", Y);
    }
    function U(Y) {
      r.field.multiple ? Z(V, Y) : i("update:modelValue", { other: $.value });
    }
    return ce($, () => {
      O.value && U(!0);
    }), t({
      focusFirstControl() {
        d.value?.focusFirstControl();
      },
      // For an error about the Other text the text box is what needs fixing.
      focusOtherText() {
        const Y = c.value?.querySelector(`[id="${s}"]`);
        Y ? Y.focus() : d.value?.focusFirstControl();
      }
    }), (Y, te) => (f(), L(jt, {
      ref_key: "shell",
      ref: d,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "group"
    }, {
      default: G(({ invalid: re, describedBy: ae, labelId: Q }) => [
        I("div", b({
          ref_key: "bodyEl",
          ref: c
        }, h(p), {
          role: e.field.multiple ? void 0 : "radiogroup",
          "aria-labelledby": e.field.multiple ? void 0 : Q,
          "aria-required": !e.field.multiple && e.field.required ? "true" : void 0
        }), [
          (f(!0), y(J, null, be(e.field.options, (P, q) => (f(), y("div", b({
            key: P.value
          }, { ref_for: !0 }, h(m)), [
            (f(), L(ve(k.value), b({
              "model-value": V(P.value),
              binary: "",
              "input-id": l(q),
              name: e.field.multiple ? void 0 : h(o),
              disabled: e.disabled,
              invalid: re,
              pt: u(ae)
            }, { ref_for: !0 }, h(S), {
              "onUpdate:modelValue": (X) => K(P.value, !!X)
            }), null, 16, ["model-value", "input-id", "name", "disabled", "invalid", "pt", "onUpdate:modelValue"])),
            I("label", b({
              for: l(q)
            }, { ref_for: !0 }, h(x)), [
              j(Ue, {
                text: P.label
              }, null, 8, ["text"]),
              P.description ? (f(), y("span", b({
                key: 0,
                ref_for: !0
              }, h(T)), N(P.description), 17)) : D("", !0)
            ], 16, ac)
          ], 16))), 128)),
          e.field.allow_other ? (f(), y("div", he(b({ key: 0 }, h(g))), [
            (f(), L(ve(k.value), b({
              "model-value": O.value,
              binary: "",
              "input-id": a,
              name: e.field.multiple ? void 0 : h(o),
              disabled: e.disabled,
              invalid: re,
              pt: u(ae)
            }, h(S), {
              "onUpdate:modelValue": te[0] || (te[0] = (P) => U(!!P))
            }), null, 16, ["model-value", "name", "disabled", "invalid", "pt"])),
            I("div", he(Pe(h(A))), [
              I("label", b({ for: a }, h(x)), "Other", 16),
              I("label", {
                for: s,
                class: "sr-only"
              }, "Other answer"),
              j(h(mn), b({
                id: s,
                modelValue: $.value,
                "onUpdate:modelValue": te[1] || (te[1] = (P) => $.value = P),
                disabled: e.disabled || !O.value,
                "aria-describedby": ae,
                invalid: re && w.value
              }, h(_), {
                size: "small",
                fluid: ""
              }), null, 16, ["modelValue", "disabled", "aria-describedby", "invalid"])
            ], 16)
          ], 16)) : D("", !0)
        ], 16, ic)
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var gi = {
  name: "CalendarIcon",
  extends: Ye
};
function lc(e) {
  return pc(e) || cc(e) || dc(e) || uc();
}
function uc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dc(e, t) {
  if (e) {
    if (typeof e == "string") return Hn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Hn(e, t) : void 0;
  }
}
function cc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pc(e) {
  if (Array.isArray(e)) return Hn(e);
}
function Hn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function fc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), lc(t[0] || (t[0] = [I("path", {
    d: "M10.7838 1.51351H9.83783V0.567568C9.83783 0.417039 9.77804 0.272676 9.6716 0.166237C9.56516 0.0597971 9.42079 0 9.27027 0C9.11974 0 8.97538 0.0597971 8.86894 0.166237C8.7625 0.272676 8.7027 0.417039 8.7027 0.567568V1.51351H5.29729V0.567568C5.29729 0.417039 5.2375 0.272676 5.13106 0.166237C5.02462 0.0597971 4.88025 0 4.72973 0C4.5792 0 4.43484 0.0597971 4.3284 0.166237C4.22196 0.272676 4.16216 0.417039 4.16216 0.567568V1.51351H3.21621C2.66428 1.51351 2.13494 1.73277 1.74467 2.12305C1.35439 2.51333 1.13513 3.04266 1.13513 3.59459V11.9189C1.13513 12.4709 1.35439 13.0002 1.74467 13.3905C2.13494 13.7807 2.66428 14 3.21621 14H10.7838C11.3357 14 11.865 13.7807 12.2553 13.3905C12.6456 13.0002 12.8649 12.4709 12.8649 11.9189V3.59459C12.8649 3.04266 12.6456 2.51333 12.2553 2.12305C11.865 1.73277 11.3357 1.51351 10.7838 1.51351ZM3.21621 2.64865H4.16216V3.59459C4.16216 3.74512 4.22196 3.88949 4.3284 3.99593C4.43484 4.10237 4.5792 4.16216 4.72973 4.16216C4.88025 4.16216 5.02462 4.10237 5.13106 3.99593C5.2375 3.88949 5.29729 3.74512 5.29729 3.59459V2.64865H8.7027V3.59459C8.7027 3.74512 8.7625 3.88949 8.86894 3.99593C8.97538 4.10237 9.11974 4.16216 9.27027 4.16216C9.42079 4.16216 9.56516 4.10237 9.6716 3.99593C9.77804 3.88949 9.83783 3.74512 9.83783 3.59459V2.64865H10.7838C11.0347 2.64865 11.2753 2.74831 11.4527 2.92571C11.6301 3.10311 11.7297 3.34371 11.7297 3.59459V5.67568H2.27027V3.59459C2.27027 3.34371 2.36993 3.10311 2.54733 2.92571C2.72473 2.74831 2.96533 2.64865 3.21621 2.64865ZM10.7838 12.8649H3.21621C2.96533 12.8649 2.72473 12.7652 2.54733 12.5878C2.36993 12.4104 2.27027 12.1698 2.27027 11.9189V6.81081H11.7297V11.9189C11.7297 12.1698 11.6301 12.4104 11.4527 12.5878C11.2753 12.7652 11.0347 12.8649 10.7838 12.8649Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
gi.render = fc;
var yi = {
  name: "ChevronDownIcon",
  extends: Ye
};
function mc(e) {
  return gc(e) || vc(e) || bc(e) || hc();
}
function hc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bc(e, t) {
  if (e) {
    if (typeof e == "string") return Un(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Un(e, t) : void 0;
  }
}
function vc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gc(e) {
  if (Array.isArray(e)) return Un(e);
}
function Un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function yc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), mc(t[0] || (t[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
yi.render = yc;
var wi = {
  name: "ChevronLeftIcon",
  extends: Ye
};
function wc(e) {
  return $c(e) || xc(e) || Sc(e) || kc();
}
function kc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sc(e, t) {
  if (e) {
    if (typeof e == "string") return Yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yn(e, t) : void 0;
  }
}
function xc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $c(e) {
  if (Array.isArray(e)) return Yn(e);
}
function Yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Cc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wc(t[0] || (t[0] = [I("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wi.render = Cc;
var ki = {
  name: "ChevronRightIcon",
  extends: Ye
};
function Tc(e) {
  return Mc(e) || Oc(e) || Ec(e) || Pc();
}
function Pc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ec(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function Oc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Mc(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Dc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Tc(t[0] || (t[0] = [I("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ki.render = Dc;
var Si = {
  name: "ChevronUpIcon",
  extends: Ye
};
function Ac(e) {
  return Lc(e) || Vc(e) || Ic(e) || _c();
}
function _c() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ic(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function Vc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Lc(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Nc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ac(t[0] || (t[0] = [I("path", {
    d: "M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Si.render = Nc;
var yr = {
  name: "TimesIcon",
  extends: Ye
};
function Bc(e) {
  return zc(e) || Fc(e) || jc(e) || Rc();
}
function Rc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jc(e, t) {
  if (e) {
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function Fc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zc(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Hc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Bc(t[0] || (t[0] = [I("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
yr.render = Hc;
var xi = {
  name: "SpinnerIcon",
  extends: Ye
};
function Uc(e) {
  return Wc(e) || Kc(e) || qc(e) || Yc();
}
function Yc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qc(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function Kc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Wc(e) {
  if (Array.isArray(e)) return Gn(e);
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Gc(e, t, n, r, i, o) {
  return f(), y("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Uc(t[0] || (t[0] = [I("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
xi.render = Gc;
var Zc = `
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
`, Qc = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": le(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ne(n.value) && !r.$slots.default,
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
}, Xc = oe.extend({
  name: "badge",
  style: Zc,
  classes: Qc
}), Jc = {
  name: "BaseBadge",
  extends: dt,
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
  style: Xc,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Dt(e) {
  "@babel/helpers - typeof";
  return Dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Dt(e);
}
function ho(e, t, n) {
  return (t = ep(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ep(e) {
  var t = tp(e, "string");
  return Dt(t) == "symbol" ? t : t + "";
}
function tp(e, t) {
  if (Dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $i = {
  name: "Badge",
  extends: Jc,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ke(ho(ho({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, np = ["data-p"];
function rp(e, t, n, r, i, o) {
  return f(), y("span", b({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [F(e.$slots, "default", {}, function() {
    return [fe(N(e.value), 1)];
  })], 16, np);
}
$i.render = rp;
var op = `
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
function At(e) {
  "@babel/helpers - typeof";
  return At = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, At(e);
}
function _e(e, t, n) {
  return (t = ip(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ip(e) {
  var t = ap(e, "string");
  return At(t) == "symbol" ? t : t + "";
}
function ap(e, t) {
  if (At(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (At(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sp = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", _e(_e(_e(_e(_e(_e(_e(_e(_e({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", _e({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, lp = oe.extend({
  name: "button",
  style: op,
  classes: sp
}), up = {
  name: "BaseButton",
  extends: dt,
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
  style: lp,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function _t(e) {
  "@babel/helpers - typeof";
  return _t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _t(e);
}
function Se(e, t, n) {
  return (t = dp(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function dp(e) {
  var t = cp(e, "string");
  return _t(t) == "symbol" ? t : t + "";
}
function cp(e, t) {
  if (_t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var He = {
  name: "Button",
  extends: up,
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
      return b(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ne(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ke(Se(Se(Se(Se(Se(Se(Se(Se(Se(Se({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ke(Se(Se({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ke(Se(Se({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: xi,
    Badge: $i
  },
  directives: {
    ripple: sr
  }
}, pp = ["data-p"], fp = ["data-p"];
function mp(e, t, n, r, i, o) {
  var a = Fe("SpinnerIcon"), s = Fe("Badge"), l = er("ripple");
  return e.asChild ? F(e.$slots, "default", {
    key: 1,
    class: ie(e.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : Qe((f(), L(ve(e.as), b({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: G(function() {
      return [F(e.$slots, "default", {}, function() {
        return [e.loading ? F(e.$slots, "loadingicon", b({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), y("span", b({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), L(a, b({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : F(e.$slots, "icon", b({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), y("span", b({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": o.dataIconP
          }, e.ptm("icon")), null, 16, pp)) : D("", !0)];
        }), e.label ? (f(), y("span", b({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": o.dataLabelP
        }), N(e.label), 17, fp)) : D("", !0), e.badge ? (f(), L(s, {
          key: 3,
          value: e.badge,
          class: ie(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : D("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[l]]);
}
He.render = mp;
var hp = `
    .p-datepicker {
        display: inline-flex;
        max-width: 100%;
    }

    .p-datepicker:has(.p-datepicker-dropdown) .p-datepicker-input {
        border-start-end-radius: 0;
        border-end-end-radius: 0;
    }

    .p-datepicker-input {
        flex: 1 1 auto;
        width: 1%;
    }

    .p-datepicker-dropdown {
        cursor: pointer;
        display: inline-flex;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        width: dt('datepicker.dropdown.width');
        border-start-end-radius: dt('datepicker.dropdown.border.radius');
        border-end-end-radius: dt('datepicker.dropdown.border.radius');
        background: dt('datepicker.dropdown.background');
        border: 1px solid dt('datepicker.dropdown.border.color');
        border-inline-start: 0 none;
        color: dt('datepicker.dropdown.color');
        transition:
            background dt('datepicker.transition.duration'),
            color dt('datepicker.transition.duration'),
            border-color dt('datepicker.transition.duration'),
            outline-color dt('datepicker.transition.duration');
        outline-color: transparent;
    }

    .p-datepicker-dropdown:not(:disabled):hover {
        background: dt('datepicker.dropdown.hover.background');
        border-color: dt('datepicker.dropdown.hover.border.color');
        color: dt('datepicker.dropdown.hover.color');
    }

    .p-datepicker-dropdown:not(:disabled):active {
        background: dt('datepicker.dropdown.active.background');
        border-color: dt('datepicker.dropdown.active.border.color');
        color: dt('datepicker.dropdown.active.color');
    }

    .p-datepicker-dropdown:focus-visible {
        box-shadow: dt('datepicker.dropdown.focus.ring.shadow');
        outline: dt('datepicker.dropdown.focus.ring.width') dt('datepicker.dropdown.focus.ring.style') dt('datepicker.dropdown.focus.ring.color');
        outline-offset: dt('datepicker.dropdown.focus.ring.offset');
    }

    .p-datepicker:has(.p-datepicker-input-icon-container) {
        position: relative;
    }

    .p-datepicker:has(.p-datepicker-input-icon-container) .p-datepicker-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-datepicker-input-icon-container {
        cursor: pointer;
        position: absolute;
        top: 50%;
        inset-inline-end: dt('form.field.padding.x');
        margin-block-start: calc(-1 * (dt('icon.size') / 2));
        color: dt('datepicker.input.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-datepicker:has(.p-datepicker-input:disabled) .p-datepicker-input-icon-container {
        cursor: default;
    }

    .p-datepicker-fluid {
        display: flex;
    }

    .p-datepicker .p-datepicker-panel {
        min-width: 100%;
    }

    .p-datepicker-panel {
        width: auto;
        padding: dt('datepicker.panel.padding');
        background: dt('datepicker.panel.background');
        color: dt('datepicker.panel.color');
        border: 1px solid dt('datepicker.panel.border.color');
        border-radius: dt('datepicker.panel.border.radius');
        box-shadow: dt('datepicker.panel.shadow');
    }

    .p-datepicker-panel-inline {
        display: inline-block;
        overflow-x: auto;
        box-shadow: none;
    }

    .p-datepicker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: dt('datepicker.header.padding');
        background: dt('datepicker.header.background');
        color: dt('datepicker.header.color');
        border-block-end: 1px solid dt('datepicker.header.border.color');
    }

    .p-datepicker-next-button:dir(rtl) {
        order: -1;
    }

    .p-datepicker-prev-button:dir(rtl) {
        order: 1;
    }

    .p-datepicker-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: dt('datepicker.title.gap');
        font-weight: dt('datepicker.title.font.weight');
    }

    .p-datepicker-select-year,
    .p-datepicker-select-month {
        border: none;
        background: transparent;
        margin: 0;
        cursor: pointer;
        font-weight: inherit;
        transition:
            background dt('datepicker.transition.duration'),
            color dt('datepicker.transition.duration'),
            border-color dt('datepicker.transition.duration'),
            outline-color dt('datepicker.transition.duration'),
            box-shadow dt('datepicker.transition.duration');
    }

    .p-datepicker-select-month {
        padding: dt('datepicker.select.month.padding');
        color: dt('datepicker.select.month.color');
        border-radius: dt('datepicker.select.month.border.radius');
    }

    .p-datepicker-select-year {
        padding: dt('datepicker.select.year.padding');
        color: dt('datepicker.select.year.color');
        border-radius: dt('datepicker.select.year.border.radius');
    }

    .p-datepicker-select-month:enabled:hover {
        background: dt('datepicker.select.month.hover.background');
        color: dt('datepicker.select.month.hover.color');
    }

    .p-datepicker-select-year:enabled:hover {
        background: dt('datepicker.select.year.hover.background');
        color: dt('datepicker.select.year.hover.color');
    }

    .p-datepicker-select-month:focus-visible,
    .p-datepicker-select-year:focus-visible {
        box-shadow: dt('datepicker.date.focus.ring.shadow');
        outline: dt('datepicker.date.focus.ring.width') dt('datepicker.date.focus.ring.style') dt('datepicker.date.focus.ring.color');
        outline-offset: dt('datepicker.date.focus.ring.offset');
    }

    .p-datepicker-calendar-container {
        display: flex;
    }

    .p-datepicker-calendar-container .p-datepicker-calendar {
        flex: 1 1 auto;
        border-inline-start: 1px solid dt('datepicker.group.border.color');
        padding-inline-end: dt('datepicker.group.gap');
        padding-inline-start: dt('datepicker.group.gap');
    }

    .p-datepicker-calendar-container .p-datepicker-calendar:first-child {
        padding-inline-start: 0;
        border-inline-start: 0 none;
    }

    .p-datepicker-calendar-container .p-datepicker-calendar:last-child {
        padding-inline-end: 0;
    }

    .p-datepicker-day-view {
        width: 100%;
        border-collapse: collapse;
        font-size: 1rem;
        margin: dt('datepicker.day.view.margin');
    }

    .p-datepicker-weekday-cell {
        padding: dt('datepicker.week.day.padding');
    }

    .p-datepicker-weekday {
        font-weight: dt('datepicker.week.day.font.weight');
        color: dt('datepicker.week.day.color');
    }

    .p-datepicker-day-cell {
        padding: dt('datepicker.date.padding');
    }

    .p-datepicker-day {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        margin: 0 auto;
        overflow: hidden;
        position: relative;
        width: dt('datepicker.date.width');
        height: dt('datepicker.date.height');
        border-radius: dt('datepicker.date.border.radius');
        transition:
            background dt('datepicker.transition.duration'),
            color dt('datepicker.transition.duration'),
            border-color dt('datepicker.transition.duration'),
            box-shadow dt('datepicker.transition.duration'),
            outline-color dt('datepicker.transition.duration');
        border: 1px solid transparent;
        outline-color: transparent;
        color: dt('datepicker.date.color');
    }

    .p-datepicker-day:not(.p-datepicker-day-selected):not(.p-disabled):hover {
        background: dt('datepicker.date.hover.background');
        color: dt('datepicker.date.hover.color');
    }

    .p-datepicker-day:focus-visible {
        box-shadow: dt('datepicker.date.focus.ring.shadow');
        outline: dt('datepicker.date.focus.ring.width') dt('datepicker.date.focus.ring.style') dt('datepicker.date.focus.ring.color');
        outline-offset: dt('datepicker.date.focus.ring.offset');
    }

    .p-datepicker-day-selected {
        background: dt('datepicker.date.selected.background');
        color: dt('datepicker.date.selected.color');
    }

    .p-datepicker-day-selected-range {
        background: dt('datepicker.date.range.selected.background');
        color: dt('datepicker.date.range.selected.color');
    }

    .p-datepicker-today > .p-datepicker-day {
        background: dt('datepicker.today.background');
        color: dt('datepicker.today.color');
    }

    .p-datepicker-today > .p-datepicker-day-selected {
        background: dt('datepicker.date.selected.background');
        color: dt('datepicker.date.selected.color');
    }

    .p-datepicker-today > .p-datepicker-day-selected-range {
        background: dt('datepicker.date.range.selected.background');
        color: dt('datepicker.date.range.selected.color');
    }

    .p-datepicker-weeknumber {
        text-align: center;
    }

    .p-datepicker-month-view {
        margin: dt('datepicker.month.view.margin');
    }

    .p-datepicker-month {
        width: 33.3%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        padding: dt('datepicker.month.padding');
        transition:
            background dt('datepicker.transition.duration'),
            color dt('datepicker.transition.duration'),
            border-color dt('datepicker.transition.duration'),
            box-shadow dt('datepicker.transition.duration'),
            outline-color dt('datepicker.transition.duration');
        border-radius: dt('datepicker.month.border.radius');
        outline-color: transparent;
        color: dt('datepicker.date.color');
    }

    .p-datepicker-month:not(.p-disabled):not(.p-datepicker-month-selected):hover {
        color: dt('datepicker.date.hover.color');
        background: dt('datepicker.date.hover.background');
    }

    .p-datepicker-month-selected {
        color: dt('datepicker.date.selected.color');
        background: dt('datepicker.date.selected.background');
    }

    .p-datepicker-month:not(.p-disabled):focus-visible {
        box-shadow: dt('datepicker.date.focus.ring.shadow');
        outline: dt('datepicker.date.focus.ring.width') dt('datepicker.date.focus.ring.style') dt('datepicker.date.focus.ring.color');
        outline-offset: dt('datepicker.date.focus.ring.offset');
    }

    .p-datepicker-year-view {
        margin: dt('datepicker.year.view.margin');
    }

    .p-datepicker-year {
        width: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        padding: dt('datepicker.year.padding');
        transition:
            background dt('datepicker.transition.duration'),
            color dt('datepicker.transition.duration'),
            border-color dt('datepicker.transition.duration'),
            box-shadow dt('datepicker.transition.duration'),
            outline-color dt('datepicker.transition.duration');
        border-radius: dt('datepicker.year.border.radius');
        outline-color: transparent;
        color: dt('datepicker.date.color');
    }

    .p-datepicker-year:not(.p-disabled):not(.p-datepicker-year-selected):hover {
        color: dt('datepicker.date.hover.color');
        background: dt('datepicker.date.hover.background');
    }

    .p-datepicker-year-selected {
        color: dt('datepicker.date.selected.color');
        background: dt('datepicker.date.selected.background');
    }

    .p-datepicker-year:not(.p-disabled):focus-visible {
        box-shadow: dt('datepicker.date.focus.ring.shadow');
        outline: dt('datepicker.date.focus.ring.width') dt('datepicker.date.focus.ring.style') dt('datepicker.date.focus.ring.color');
        outline-offset: dt('datepicker.date.focus.ring.offset');
    }

    .p-datepicker-buttonbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('datepicker.buttonbar.padding');
        border-block-start: 1px solid dt('datepicker.buttonbar.border.color');
    }

    .p-datepicker-buttonbar .p-button {
        width: auto;
    }

    .p-datepicker-time-picker {
        display: flex;
        justify-content: center;
        align-items: center;
        border-block-start: 1px solid dt('datepicker.time.picker.border.color');
        padding: 0;
        gap: dt('datepicker.time.picker.gap');
    }

    .p-datepicker-calendar-container + .p-datepicker-time-picker {
        padding: dt('datepicker.time.picker.padding');
    }

    .p-datepicker-time-picker > div {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: dt('datepicker.time.picker.button.gap');
    }

    .p-datepicker-time-picker span {
        font-size: 1rem;
    }

    .p-datepicker-timeonly .p-datepicker-time-picker {
        border-block-start: 0 none;
    }

    .p-datepicker-time-picker:dir(rtl) {
        flex-direction: row-reverse;
    }

    .p-datepicker:has(.p-inputtext-sm) .p-datepicker-dropdown {
        width: dt('datepicker.dropdown.sm.width');
    }

    .p-datepicker:has(.p-inputtext-sm) .p-datepicker-dropdown .p-icon,
    .p-datepicker:has(.p-inputtext-sm) .p-datepicker-input-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-datepicker:has(.p-inputtext-lg) .p-datepicker-dropdown {
        width: dt('datepicker.dropdown.lg.width');
    }

    .p-datepicker:has(.p-inputtext-lg) .p-datepicker-dropdown .p-icon,
    .p-datepicker:has(.p-inputtext-lg) .p-datepicker-input-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-datepicker-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        color: dt('form.field.icon.color');
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-datepicker:has(.p-datepicker-dropdown) .p-datepicker-clear-icon {
        inset-inline-end: calc(dt('datepicker.dropdown.width') + dt('form.field.padding.x'));
    }

    .p-datepicker:has(.p-datepicker-input-icon-container) .p-datepicker-clear-icon {
        inset-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-datepicker:has(.p-datepicker-clear-icon) .p-datepicker-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-datepicker:has(.p-datepicker-input-icon-container):has(.p-datepicker-clear-icon) .p-datepicker-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 3) + calc(dt('icon.size') * 2));
    }

    .p-inputgroup .p-datepicker-dropdown {
        border-radius: 0;
    }

    .p-inputgroup > .p-datepicker:last-child:has(.p-datepicker-dropdown) > .p-datepicker-input {
        border-start-end-radius: 0;
        border-end-end-radius: 0;
    }

    .p-inputgroup > .p-datepicker:last-child .p-datepicker-dropdown {
        border-start-end-radius: dt('datepicker.dropdown.border.radius');
        border-end-end-radius: dt('datepicker.dropdown.border.radius');
    }
`, bp = {
  root: function(t) {
    var n = t.props;
    return {
      position: n.appendTo === "self" || n.showClear ? "relative" : void 0
    };
  }
}, vp = {
  root: function(t) {
    var n = t.instance, r = t.state;
    return ["p-datepicker p-component p-inputwrapper", {
      "p-invalid": n.$invalid,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-focus": r.focused || r.overlayVisible,
      "p-datepicker-fluid": n.$fluid
    }];
  },
  pcInputText: "p-datepicker-input",
  clearIcon: "p-datepicker-clear-icon",
  dropdown: "p-datepicker-dropdown",
  inputIconContainer: "p-datepicker-input-icon-container",
  inputIcon: "p-datepicker-input-icon",
  panel: function(t) {
    var n = t.props;
    return ["p-datepicker-panel p-component", {
      "p-datepicker-panel-inline": n.inline,
      "p-disabled": n.disabled,
      "p-datepicker-timeonly": n.timeOnly
    }];
  },
  calendarContainer: "p-datepicker-calendar-container",
  calendar: "p-datepicker-calendar",
  header: "p-datepicker-header",
  pcPrevButton: "p-datepicker-prev-button",
  title: "p-datepicker-title",
  selectMonth: "p-datepicker-select-month",
  selectYear: "p-datepicker-select-year",
  decade: "p-datepicker-decade",
  pcNextButton: "p-datepicker-next-button",
  dayView: "p-datepicker-day-view",
  weekHeader: "p-datepicker-weekheader p-disabled",
  weekNumber: "p-datepicker-weeknumber",
  weekLabelContainer: "p-datepicker-weeklabel-container p-disabled",
  weekDayCell: "p-datepicker-weekday-cell",
  weekDay: "p-datepicker-weekday",
  dayCell: function(t) {
    var n = t.date;
    return ["p-datepicker-day-cell", {
      "p-datepicker-other-month": n.otherMonth,
      "p-datepicker-today": n.today
    }];
  },
  day: function(t) {
    var n = t.instance, r = t.props, i = t.state, o = t.date, a = "";
    if (n.isRangeSelection() && n.isSelected(o) && o.selectable) {
      var s = typeof i.rawValue[0] == "string" ? n.parseValue(i.rawValue[0])[0] : i.rawValue[0], l = typeof i.rawValue[1] == "string" ? n.parseValue(i.rawValue[1])[0] : i.rawValue[1];
      a = n.isDateEquals(s, o) || n.isDateEquals(l, o) ? "p-datepicker-day-selected" : "p-datepicker-day-selected-range";
    }
    return ["p-datepicker-day", {
      "p-datepicker-day-selected": !n.isRangeSelection() && n.isSelected(o) && o.selectable,
      "p-disabled": r.disabled || !o.selectable
    }, a];
  },
  monthView: "p-datepicker-month-view",
  month: function(t) {
    var n = t.instance, r = t.props, i = t.month, o = t.index;
    return ["p-datepicker-month", {
      "p-datepicker-month-selected": n.isMonthSelected(o),
      "p-disabled": r.disabled || !i.selectable
    }];
  },
  yearView: "p-datepicker-year-view",
  year: function(t) {
    var n = t.instance, r = t.props, i = t.year;
    return ["p-datepicker-year", {
      "p-datepicker-year-selected": n.isYearSelected(i.value),
      "p-disabled": r.disabled || !i.selectable
    }];
  },
  timePicker: "p-datepicker-time-picker",
  hourPicker: "p-datepicker-hour-picker",
  pcIncrementButton: "p-datepicker-increment-button",
  pcDecrementButton: "p-datepicker-decrement-button",
  separator: "p-datepicker-separator",
  minutePicker: "p-datepicker-minute-picker",
  secondPicker: "p-datepicker-second-picker",
  ampmPicker: "p-datepicker-ampm-picker",
  buttonbar: "p-datepicker-buttonbar",
  pcTodayButton: "p-datepicker-today-button",
  pcClearButton: "p-datepicker-clear-button"
}, gp = oe.extend({
  name: "datepicker",
  style: hp,
  classes: vp,
  inlineStyles: bp
}), yp = {
  name: "BaseDatePicker",
  extends: Rt,
  props: {
    selectionMode: {
      type: String,
      default: "single"
    },
    dateFormat: {
      type: String,
      default: null
    },
    updateModelType: {
      type: String,
      default: "date"
    },
    inline: {
      type: Boolean,
      default: !1
    },
    showOtherMonths: {
      type: Boolean,
      default: !0
    },
    selectOtherMonths: {
      type: Boolean,
      default: !1
    },
    showIcon: {
      type: Boolean,
      default: !1
    },
    iconDisplay: {
      type: String,
      default: "button"
    },
    icon: {
      type: String,
      default: void 0
    },
    prevIcon: {
      type: String,
      default: void 0
    },
    nextIcon: {
      type: String,
      default: void 0
    },
    incrementIcon: {
      type: String,
      default: void 0
    },
    decrementIcon: {
      type: String,
      default: void 0
    },
    numberOfMonths: {
      type: Number,
      default: 1
    },
    responsiveOptions: Array,
    breakpoint: {
      type: String,
      default: "769px"
    },
    view: {
      type: String,
      default: "date"
    },
    minDate: {
      type: Date,
      value: null
    },
    maxDate: {
      type: Date,
      value: null
    },
    disabledDates: {
      type: Array,
      value: null
    },
    disabledDays: {
      type: Array,
      value: null
    },
    maxDateCount: {
      type: Number,
      value: null
    },
    showOnFocus: {
      type: Boolean,
      default: !0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    showButtonBar: {
      type: Boolean,
      default: !1
    },
    shortYearCutoff: {
      type: String,
      default: "+10"
    },
    showTime: {
      type: Boolean,
      default: !1
    },
    timeOnly: {
      type: Boolean,
      default: !1
    },
    hourFormat: {
      type: String,
      default: "24"
    },
    stepHour: {
      type: Number,
      default: 1
    },
    stepMinute: {
      type: Number,
      default: 1
    },
    stepSecond: {
      type: Number,
      default: 1
    },
    showSeconds: {
      type: Boolean,
      default: !1
    },
    hideOnDateTimeSelect: {
      type: Boolean,
      default: !1
    },
    hideOnRangeSelection: {
      type: Boolean,
      default: !1
    },
    timeSeparator: {
      type: String,
      default: ":"
    },
    showWeek: {
      type: Boolean,
      default: !1
    },
    manualInput: {
      type: Boolean,
      default: !0
    },
    showClear: {
      type: Boolean,
      default: !1
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    placeholder: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
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
    panelClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    todayButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          size: "small"
        };
      }
    },
    clearButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          size: "small"
        };
      }
    },
    navigatorButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    timepickerButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
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
  style: gp,
  provide: function() {
    return {
      $pcDatePicker: this,
      $parentInstance: this
    };
  }
};
function bo(e, t, n) {
  return (t = wp(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wp(e) {
  var t = kp(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function kp(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function Cn(e) {
  return $p(e) || xp(e) || Ci(e) || Sp();
}
function Sp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xp(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $p(e) {
  if (Array.isArray(e)) return Zn(e);
}
function Tn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Ci(e)) || t) {
      n && (e = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(d) {
        throw d;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, a = !0, s = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return a = d.done, d;
  }, e: function(d) {
    s = !0, o = d;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (s) throw o;
    }
  } };
}
function Ci(e, t) {
  if (e) {
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ti = {
  name: "DatePicker",
  extends: yp,
  inheritAttrs: !1,
  emits: ["show", "hide", "input", "month-change", "year-change", "date-select", "today-click", "clear-click", "focus", "blur", "keydown"],
  inject: {
    $pcFluid: {
      default: null
    }
  },
  navigationState: null,
  timePickerChange: !1,
  scrollHandler: null,
  outsideClickListener: null,
  resizeListener: null,
  matchMediaListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  input: null,
  previousButton: null,
  nextButton: null,
  timePickerTimer: null,
  preventFocus: !1,
  typeUpdate: !1,
  data: function() {
    return {
      currentMonth: null,
      currentYear: null,
      currentHour: null,
      currentMinute: null,
      currentSecond: null,
      pm: null,
      focused: !1,
      overlayVisible: !1,
      currentView: this.view,
      query: null,
      queryMatches: !1,
      queryOrientation: null,
      focusedDateIndex: 0,
      rawValue: null
    };
  },
  watch: {
    modelValue: {
      immediate: !0,
      handler: function(t) {
        var n;
        this.rawValue = typeof t == "string" ? this.safeParse(t) : t, this.updateCurrentMetaData(), !this.typeUpdate && !this.inline && this.input && (this.input.value = this.formatValue(this.rawValue)), this.typeUpdate = !1, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Ne(t) ? "none" : "block");
      }
    },
    showTime: function() {
      this.updateCurrentMetaData();
    },
    minDate: function() {
      this.updateCurrentMetaData();
    },
    maxDate: function() {
      this.updateCurrentMetaData();
    },
    months: function() {
      this.overlay && (this.focused || (this.inline && (this.preventFocus = !0), setTimeout(this.updateFocus, 0)));
    },
    numberOfMonths: function() {
      this.destroyResponsiveStyleElement(), this.createResponsiveStyle();
    },
    responsiveOptions: function() {
      this.destroyResponsiveStyleElement(), this.createResponsiveStyle();
    },
    currentView: function() {
      var t = this;
      Promise.resolve(null).then(function() {
        return t.alignOverlay();
      });
    },
    view: function(t) {
      this.currentView = t;
    }
  },
  created: function() {
    this.updateCurrentMetaData();
  },
  mounted: function() {
    if (this.createResponsiveStyle(), this.bindMatchMediaListener(), this.bindMatchMediaOrientationListener(), this.inline)
      this.disabled || (this.preventFocus = !0, this.initFocusableCell());
    else {
      var t;
      this.input.value = this.inputFieldValue, (t = this.$refs.clearIcon) !== null && t !== void 0 && (t = t.$el) !== null && t !== void 0 && t.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
    }
  },
  updated: function() {
    this.overlay && (this.preventFocus = !0, setTimeout(this.updateFocus, 0)), this.input && this.selectionStart != null && this.selectionEnd != null && (this.input.selectionStart = this.selectionStart, this.input.selectionEnd = this.selectionEnd, this.selectionStart = null, this.selectionEnd = null);
  },
  beforeUnmount: function() {
    this.timePickerTimer && clearTimeout(this.timePickerTimer), this.destroyResponsiveStyleElement(), this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindMatchMediaListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && this.autoZIndex && gn.clear(this.overlay), this.overlay = null;
  },
  methods: {
    isSelected: function(t) {
      if (this.rawValue) {
        if (this.isSingleSelection())
          return this.isDateEquals(this.parseValueForComparison(this.rawValue), t);
        if (this.isMultipleSelection()) {
          var n = !1, r = Tn(this.rawValue), i;
          try {
            for (r.s(); !(i = r.n()).done; ) {
              var o = i.value;
              if (n = this.isDateEquals(this.parseValueForComparison(o), t), n)
                break;
            }
          } catch (l) {
            r.e(l);
          } finally {
            r.f();
          }
          return n;
        } else if (this.isRangeSelection()) {
          var a = this.parseValueForComparison(this.rawValue[0]);
          if (this.rawValue[1]) {
            var s = this.parseValueForComparison(this.rawValue[1]);
            return this.isDateEquals(a, t) || this.isDateEquals(s, t) || this.isDateBetween(a, s, t);
          } else
            return this.isDateEquals(a, t);
        }
      }
      return !1;
    },
    isMonthSelected: function(t) {
      var n = this;
      if (this.isMultipleSelection()) {
        var r;
        return (r = this.rawValue) === null || r === void 0 ? void 0 : r.some(function(m) {
          var g = n.parseValueForComparison(m);
          return g.getMonth() === t && g.getFullYear() === n.currentYear;
        });
      } else if (this.isRangeSelection()) {
        var i, o, a = (i = this.rawValue) !== null && i !== void 0 && i[0] ? this.parseValueForComparison(this.rawValue[0]) : null, s = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null;
        if (s) {
          var l = new Date(this.currentYear, t, 1), d = new Date(a.getFullYear(), a.getMonth(), 1), c = new Date(s.getFullYear(), s.getMonth(), 1);
          return l >= d && l <= c;
        } else
          return a?.getFullYear() === this.currentYear && a?.getMonth() === t;
      } else {
        var u, p;
        return ((u = this.rawValue) === null || u === void 0 ? void 0 : u.getMonth()) === t && ((p = this.rawValue) === null || p === void 0 ? void 0 : p.getFullYear()) === this.currentYear;
      }
    },
    isYearSelected: function(t) {
      var n = this;
      if (this.isMultipleSelection()) {
        var r;
        return (r = this.rawValue) === null || r === void 0 ? void 0 : r.some(function(u) {
          var p = n.parseValueForComparison(u);
          return p.getFullYear() === t;
        });
      } else if (this.isRangeSelection()) {
        var i, o, a = (i = this.rawValue) !== null && i !== void 0 && i[0] ? this.parseValueForComparison(this.rawValue[0]) : null, s = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null, l = a ? a.getFullYear() : null, d = s ? s.getFullYear() : null;
        return l === t || d === t || l < t && d > t;
      } else {
        var c;
        return ((c = this.rawValue) === null || c === void 0 ? void 0 : c.getFullYear()) === t;
      }
    },
    isDateEquals: function(t, n) {
      return t ? t.getDate() === n.day && t.getMonth() === n.month && t.getFullYear() === n.year : !1;
    },
    isDateBetween: function(t, n, r) {
      var i = !1, o = this.parseValueForComparison(t), a = this.parseValueForComparison(n);
      if (o && a) {
        var s = new Date(r.year, r.month, r.day);
        return o.getTime() <= s.getTime() && a.getTime() >= s.getTime();
      }
      return i;
    },
    getFirstDayOfMonthIndex: function(t, n) {
      var r = /* @__PURE__ */ new Date();
      r.setDate(1), r.setMonth(t), r.setFullYear(n);
      var i = r.getDay() + this.sundayIndex;
      return i >= 7 ? i - 7 : i;
    },
    getDaysCountInMonth: function(t, n) {
      return 32 - this.daylightSavingAdjust(new Date(n, t, 32)).getDate();
    },
    getDaysCountInPrevMonth: function(t, n) {
      var r = this.getPreviousMonthAndYear(t, n);
      return this.getDaysCountInMonth(r.month, r.year);
    },
    getPreviousMonthAndYear: function(t, n) {
      var r, i;
      return t === 0 ? (r = 11, i = n - 1) : (r = t - 1, i = n), {
        month: r,
        year: i
      };
    },
    getNextMonthAndYear: function(t, n) {
      var r, i;
      return t === 11 ? (r = 0, i = n + 1) : (r = t + 1, i = n), {
        month: r,
        year: i
      };
    },
    daylightSavingAdjust: function(t) {
      return t ? (t.setHours(t.getHours() > 12 ? t.getHours() + 2 : 0), t) : null;
    },
    isToday: function(t, n, r, i) {
      return t.getDate() === n && t.getMonth() === r && t.getFullYear() === i;
    },
    isSelectable: function(t, n, r, i) {
      var o = !0, a = !0, s = !0, l = !0;
      return i && !this.selectOtherMonths ? !1 : (this.minDate && (this.minDate.getFullYear() > r || this.minDate.getFullYear() === r && (this.minDate.getMonth() > n || this.minDate.getMonth() === n && this.minDate.getDate() > t)) && (o = !1), this.maxDate && (this.maxDate.getFullYear() < r || this.maxDate.getFullYear() === r && (this.maxDate.getMonth() < n || this.maxDate.getMonth() === n && this.maxDate.getDate() < t)) && (a = !1), this.disabledDates && (s = !this.isDateDisabled(t, n, r)), this.disabledDays && (l = !this.isDayDisabled(t, n, r)), o && a && s && l);
    },
    onOverlayEnter: function(t) {
      var n = this.inline ? void 0 : {
        position: "absolute",
        top: "0"
      };
      Ma(t, n), this.autoZIndex && gn.set("overlay", t, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), this.alignOverlay(), this.$emit("show");
    },
    onOverlayEnterComplete: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener();
    },
    onOverlayAfterLeave: function(t) {
      this.autoZIndex && gn.clear(t);
    },
    onOverlayLeave: function() {
      this.currentView = this.view, this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.$emit("hide"), this.overlay = null;
    },
    onPrevButtonClick: function(t) {
      this.navigationState = {
        backward: !0,
        button: !0
      }, this.navBackward(t);
    },
    onNextButtonClick: function(t) {
      this.navigationState = {
        backward: !1,
        button: !0
      }, this.navForward(t);
    },
    navBackward: function(t) {
      t.preventDefault(), this.isEnabled() && (this.currentView === "month" ? (this.decrementYear(), this.$emit("year-change", {
        month: this.currentMonth,
        year: this.currentYear
      })) : this.currentView === "year" ? this.decrementDecade() : t.shiftKey ? this.decrementYear() : (this.currentMonth === 0 ? (this.currentMonth = 11, this.decrementYear()) : this.currentMonth--, this.$emit("month-change", {
        month: this.currentMonth + 1,
        year: this.currentYear
      })));
    },
    navForward: function(t) {
      t.preventDefault(), this.isEnabled() && (this.currentView === "month" ? (this.incrementYear(), this.$emit("year-change", {
        month: this.currentMonth,
        year: this.currentYear
      })) : this.currentView === "year" ? this.incrementDecade() : t.shiftKey ? this.incrementYear() : (this.currentMonth === 11 ? (this.currentMonth = 0, this.incrementYear()) : this.currentMonth++, this.$emit("month-change", {
        month: this.currentMonth + 1,
        year: this.currentYear
      })));
    },
    decrementYear: function() {
      this.currentYear--;
    },
    decrementDecade: function() {
      this.currentYear = this.currentYear - 10;
    },
    incrementYear: function() {
      this.currentYear++;
    },
    incrementDecade: function() {
      this.currentYear = this.currentYear + 10;
    },
    switchToMonthView: function(t) {
      this.currentView = "month", setTimeout(this.updateFocus, 0), t.preventDefault();
    },
    switchToYearView: function(t) {
      this.currentView = "year", setTimeout(this.updateFocus, 0), t.preventDefault();
    },
    isEnabled: function() {
      return !this.disabled && !this.readonly;
    },
    updateCurrentTimeMeta: function(t) {
      var n = t.getHours();
      this.hourFormat === "12" && (this.pm = n > 11, n >= 12 && (n = n == 12 ? 12 : n - 12)), this.currentHour = Math.floor(n / this.stepHour) * this.stepHour, this.currentMinute = Math.floor(t.getMinutes() / this.stepMinute) * this.stepMinute, this.currentSecond = Math.floor(t.getSeconds() / this.stepSecond) * this.stepSecond;
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        t.overlayVisible && t.isOutsideClicked(n) && (t.overlayVisible = !1);
      }, document.addEventListener("mousedown", this.outsideClickListener));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("mousedown", this.outsideClickListener), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new nl(this.$refs.container, function() {
        t.overlayVisible && (t.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Na() && (t.overlayVisible = !1);
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindMatchMediaListener: function() {
      var t = this;
      if (!this.matchMediaListener) {
        var n = matchMedia("(max-width: ".concat(this.breakpoint, ")"));
        this.query = n, this.queryMatches = n.matches, this.matchMediaListener = function() {
          t.queryMatches = n.matches, t.mobileActive = !1;
        }, this.query.addEventListener("change", this.matchMediaListener);
      }
    },
    unbindMatchMediaListener: function() {
      this.matchMediaListener && (this.query.removeEventListener("change", this.matchMediaListener), this.matchMediaListener = null);
    },
    bindMatchMediaOrientationListener: function() {
      var t = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          t.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    isOutsideClicked: function(t) {
      var n = t.composedPath();
      return !(this.$el.isSameNode(t.target) || this.isNavIconClicked(t) || n.includes(this.$el) || n.includes(this.overlay));
    },
    isNavIconClicked: function(t) {
      return this.previousButton && (this.previousButton.isSameNode(t.target) || this.previousButton.contains(t.target)) || this.nextButton && (this.nextButton.isSameNode(t.target) || this.nextButton.contains(t.target));
    },
    alignOverlay: function() {
      this.overlay && (this.appendTo === "self" || this.inline ? Da(this.overlay, this.$el) : (this.view === "date" ? (this.overlay.style.width = Xt(this.overlay) + "px", this.overlay.style.minWidth = Xt(this.$el) + "px") : this.overlay.style.width = Xt(this.$el) + "px", Oa(this.overlay, this.$el)));
    },
    onButtonClick: function() {
      this.isEnabled() && (this.overlayVisible ? this.overlayVisible = !1 : (this.input.focus(), this.overlayVisible = !0));
    },
    isDateDisabled: function(t, n, r) {
      if (this.disabledDates) {
        var i = Tn(this.disabledDates), o;
        try {
          for (i.s(); !(o = i.n()).done; ) {
            var a = o.value;
            if (a.getFullYear() === r && a.getMonth() === n && a.getDate() === t)
              return !0;
          }
        } catch (s) {
          i.e(s);
        } finally {
          i.f();
        }
      }
      return !1;
    },
    isDayDisabled: function(t, n, r) {
      if (this.disabledDays) {
        var i = new Date(r, n, t), o = i.getDay();
        return this.disabledDays.indexOf(o) !== -1;
      }
      return !1;
    },
    onMonthDropdownChange: function(t) {
      this.currentMonth = parseInt(t), this.$emit("month-change", {
        month: this.currentMonth + 1,
        year: this.currentYear
      });
    },
    onYearDropdownChange: function(t) {
      this.currentYear = parseInt(t), this.$emit("year-change", {
        month: this.currentMonth,
        year: this.currentYear
      });
    },
    onDateSelect: function(t, n) {
      var r = this;
      if (!(this.disabled || !n.selectable)) {
        if (Ke(this.overlay, 'table td span:not([data-p-disabled="true"])').forEach(function(o) {
          return o.tabIndex = -1;
        }), t && t.currentTarget.focus(), this.isMultipleSelection() && this.isSelected(n)) {
          var i = this.rawValue.filter(function(o) {
            return !r.isDateEquals(r.parseValueForComparison(o), n);
          });
          this.updateModel(i);
        } else
          this.shouldSelectDate(n) && (n.otherMonth ? (this.currentMonth = n.month, this.currentYear = n.year, this.selectDate(n)) : this.selectDate(n));
        this.isSingleSelection() && (!this.showTime || this.hideOnDateTimeSelect) && (this.input && this.input.focus(), setTimeout(function() {
          r.overlayVisible = !1;
        }, 150));
      }
    },
    selectDate: function(t) {
      var n = this, r = new Date(t.year, t.month, t.day);
      this.showTime && (this.hourFormat === "12" && this.currentHour !== 12 && this.pm ? r.setHours(this.currentHour + 12) : r.setHours(this.currentHour), r.setMinutes(this.currentMinute), r.setSeconds(this.showSeconds ? this.currentSecond : 0)), this.minDate && this.minDate > r && (r = this.minDate, this.currentHour = r.getHours(), this.currentMinute = r.getMinutes(), this.currentSecond = r.getSeconds()), this.maxDate && this.maxDate < r && (r = this.maxDate, this.currentHour = r.getHours(), this.currentMinute = r.getMinutes(), this.currentSecond = r.getSeconds());
      var i = null;
      if (this.isSingleSelection())
        i = r;
      else if (this.isMultipleSelection())
        i = this.rawValue ? [].concat(Cn(this.rawValue), [r]) : [r];
      else if (this.isRangeSelection())
        if (this.rawValue && this.rawValue.length) {
          var o = this.parseValueForComparison(this.rawValue[0]), a = this.rawValue[1];
          !a && r.getTime() >= o.getTime() ? (a = r, this.focusedDateIndex = 1) : (o = r, a = null, this.focusedDateIndex = 0), i = [o, a];
        } else
          i = [r, null], this.focusedDateIndex = 0;
      i !== null && this.updateModel(i), this.isRangeSelection() && this.hideOnRangeSelection && i[1] !== null && setTimeout(function() {
        n.overlayVisible = !1;
      }, 150), this.$emit("date-select", r);
    },
    updateModel: function(t) {
      var n = this;
      if (this.rawValue = t, this.updateModelType === "date")
        if (this.isSingleSelection())
          this.writeValue(t);
        else {
          var r = null;
          Array.isArray(t) && (r = t.map(function(a) {
            return n.parseValueForComparison(a);
          })), this.writeValue(r);
        }
      else if (this.updateModelType == "string") {
        if (this.isSingleSelection())
          this.writeValue(this.formatDateTime(t));
        else if (this.isMultipleSelection()) {
          var i = null;
          Array.isArray(t) && (i = t.map(function(a) {
            return n.formatDateTime(a);
          })), this.writeValue(i);
        } else if (this.isRangeSelection()) {
          var o = null;
          Array.isArray(t) && (o = t.map(function(a) {
            return a == null ? null : typeof a == "string" ? a : n.formatDateTime(a);
          })), this.writeValue(o);
        }
      }
    },
    shouldSelectDate: function() {
      return this.isMultipleSelection() && this.maxDateCount != null ? this.maxDateCount > (this.rawValue ? this.rawValue.length : 0) : !0;
    },
    isSingleSelection: function() {
      return this.selectionMode === "single";
    },
    isRangeSelection: function() {
      return this.selectionMode === "range";
    },
    isMultipleSelection: function() {
      return this.selectionMode === "multiple";
    },
    formatValue: function(t) {
      if (typeof t == "string")
        return this.dateFormat ? isNaN(new Date(t)) ? t : this.formatDate(new Date(t), this.dateFormat) : t;
      var n = "";
      if (t)
        try {
          if (this.isSingleSelection())
            n = this.formatDateTime(t);
          else if (this.isMultipleSelection())
            for (var r = 0; r < t.length; r++) {
              var i = typeof t[r] == "string" ? this.formatDateTime(this.parseValueForComparison(t[r])) : this.formatDateTime(t[r]);
              n += i, r !== t.length - 1 && (n += ", ");
            }
          else if (this.isRangeSelection() && t && t.length) {
            var o = this.parseValueForComparison(t[0]), a = this.parseValueForComparison(t[1]);
            n = this.formatDateTime(o), a && (n += " - " + this.formatDateTime(a));
          }
        } catch {
          n = t;
        }
      return n;
    },
    formatDateTime: function(t) {
      var n = null;
      return ya(t) && le(t) ? this.timeOnly ? n = this.formatTime(t) : (n = this.formatDate(t, this.datePattern), this.showTime && (n += " " + this.formatTime(t))) : this.updateModelType === "string" && (n = t), n;
    },
    formatDate: function(t, n) {
      if (!t)
        return "";
      var r, i = function(c) {
        var u = r + 1 < n.length && n.charAt(r + 1) === c;
        return u && r++, u;
      }, o = function(c, u, p) {
        var m = "" + u;
        if (i(c))
          for (; m.length < p; )
            m = "0" + m;
        return m;
      }, a = function(c, u, p, m) {
        return i(c) ? m[u] : p[u];
      }, s = "", l = !1;
      if (t)
        for (r = 0; r < n.length; r++)
          if (l)
            n.charAt(r) === "'" && !i("'") ? l = !1 : s += n.charAt(r);
          else
            switch (n.charAt(r)) {
              case "d":
                s += o("d", t.getDate(), 2);
                break;
              case "D":
                s += a("D", t.getDay(), this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
                break;
              case "o":
                s += o("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3);
                break;
              case "m":
                s += o("m", t.getMonth() + 1, 2);
                break;
              case "M":
                s += a("M", t.getMonth(), this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
                break;
              case "y":
                s += i("y") ? t.getFullYear() : (t.getFullYear() % 100 < 10 ? "0" : "") + t.getFullYear() % 100;
                break;
              case "@":
                s += t.getTime();
                break;
              case "!":
                s += t.getTime() * 1e4 + this.ticksTo1970;
                break;
              case "'":
                i("'") ? s += "'" : l = !0;
                break;
              default:
                s += n.charAt(r);
            }
      return s;
    },
    formatTime: function(t) {
      if (!t)
        return "";
      var n = "", r = t.getHours(), i = t.getMinutes(), o = t.getSeconds();
      return this.hourFormat === "12" && r > 11 && r !== 12 && (r -= 12), this.hourFormat === "12" ? n += r === 0 ? 12 : r < 10 ? "0" + r : r : n += r < 10 ? "0" + r : r, n += ":", n += i < 10 ? "0" + i : i, this.showSeconds && (n += ":", n += o < 10 ? "0" + o : o), this.hourFormat === "12" && (n += t.getHours() > 11 ? " ".concat(this.$primevue.config.locale.pm) : " ".concat(this.$primevue.config.locale.am)), n;
    },
    onTodayButtonClick: function(t) {
      var n = /* @__PURE__ */ new Date(), r = {
        day: n.getDate(),
        month: n.getMonth(),
        year: n.getFullYear(),
        otherMonth: n.getMonth() !== this.currentMonth || n.getFullYear() !== this.currentYear,
        today: !0,
        selectable: !0
      };
      this.onDateSelect(null, r), this.$emit("today-click", n), t.preventDefault();
    },
    onClearButtonClick: function(t) {
      this.updateModel(null), this.overlayVisible = !1, this.$emit("clear-click", t), t.preventDefault();
    },
    onTimePickerElementMouseDown: function(t, n, r) {
      this.isEnabled() && (this.repeat(t, null, n, r), t.preventDefault());
    },
    onTimePickerElementMouseUp: function(t) {
      this.isEnabled() && (this.clearTimePickerTimer(), this.updateModelTime(), t.preventDefault());
    },
    onTimePickerElementMouseLeave: function() {
      this.clearTimePickerTimer();
    },
    onTimePickerElementKeyDown: function(t, n, r) {
      switch (t.code) {
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.isEnabled() && (this.repeat(t, null, n, r), t.preventDefault());
          break;
      }
    },
    onTimePickerElementKeyUp: function(t) {
      switch (t.code) {
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.isEnabled() && (this.clearTimePickerTimer(), this.updateModelTime(), t.preventDefault());
          break;
      }
    },
    repeat: function(t, n, r, i) {
      var o = this, a = n || 500;
      switch (this.clearTimePickerTimer(), this.timePickerTimer = setTimeout(function() {
        o.repeat(t, 100, r, i);
      }, a), r) {
        case 0:
          i === 1 ? this.incrementHour(t) : this.decrementHour(t);
          break;
        case 1:
          i === 1 ? this.incrementMinute(t) : this.decrementMinute(t);
          break;
        case 2:
          i === 1 ? this.incrementSecond(t) : this.decrementSecond(t);
          break;
      }
    },
    convertTo24Hour: function(t, n) {
      return this.hourFormat == "12" ? t === 12 ? n ? 12 : 0 : n ? t + 12 : t : t;
    },
    validateTime: function(t, n, r, i) {
      var o = this.viewDate, a = this.convertTo24Hour(t, i);
      this.isRangeSelection() && (o = this.rawValue ? this.rawValue[1] || this.rawValue[0] : o), this.isMultipleSelection() && (o = this.rawValue ? this.rawValue[this.rawValue.length - 1] : o);
      var s = o ? o.toDateString() : null;
      return !(this.minDate && s && this.minDate.toDateString() === s && (this.minDate.getHours() > a || this.minDate.getHours() === a && (this.minDate.getMinutes() > n || this.minDate.getMinutes() === n && this.minDate.getSeconds() > r)) || this.maxDate && s && this.maxDate.toDateString() === s && (this.maxDate.getHours() < a || this.maxDate.getHours() === a && (this.maxDate.getMinutes() < n || this.maxDate.getMinutes() === n && this.maxDate.getSeconds() < r)));
    },
    incrementHour: function(t) {
      var n = this.currentHour, r = this.currentHour + Number(this.stepHour), i = this.pm;
      this.hourFormat == "24" ? r = r >= 24 ? r - 24 : r : this.hourFormat == "12" && (n < 12 && r > 11 && (i = !this.pm), r = r >= 13 ? r - 12 : r), this.validateTime(r, this.currentMinute, this.currentSecond, i) && (this.currentHour = r, this.pm = i), t.preventDefault();
    },
    decrementHour: function(t) {
      var n = this.currentHour - this.stepHour, r = this.pm;
      this.hourFormat == "24" ? n = n < 0 ? 24 + n : n : this.hourFormat == "12" && (this.currentHour === 12 && (r = !this.pm), n = n <= 0 ? 12 + n : n), this.validateTime(n, this.currentMinute, this.currentSecond, r) && (this.currentHour = n, this.pm = r), t.preventDefault();
    },
    incrementMinute: function(t) {
      var n = this.currentMinute + Number(this.stepMinute);
      this.validateTime(this.currentHour, n, this.currentSecond, this.pm) && (this.currentMinute = n > 59 ? n - 60 : n), t.preventDefault();
    },
    decrementMinute: function(t) {
      var n = this.currentMinute - this.stepMinute;
      n = n < 0 ? 60 + n : n, this.validateTime(this.currentHour, n, this.currentSecond, this.pm) && (this.currentMinute = n), t.preventDefault();
    },
    incrementSecond: function(t) {
      var n = this.currentSecond + Number(this.stepSecond);
      this.validateTime(this.currentHour, this.currentMinute, n, this.pm) && (this.currentSecond = n > 59 ? n - 60 : n), t.preventDefault();
    },
    decrementSecond: function(t) {
      var n = this.currentSecond - this.stepSecond;
      n = n < 0 ? 60 + n : n, this.validateTime(this.currentHour, this.currentMinute, n, this.pm) && (this.currentSecond = n), t.preventDefault();
    },
    updateModelTime: function() {
      var t = this;
      this.timePickerChange = !0;
      var n = this.viewDate;
      this.isRangeSelection() && (n = this.rawValue ? this.rawValue[this.focusedDateIndex] || this.rawValue[0] : n), this.isMultipleSelection() && (n = this.rawValue ? this.rawValue[this.rawValue.length - 1] : n), n = n ? new Date(n.getTime()) : /* @__PURE__ */ new Date(), this.hourFormat == "12" ? this.currentHour === 12 ? n.setHours(this.pm ? 12 : 0) : n.setHours(this.pm ? this.currentHour + 12 : this.currentHour) : n.setHours(this.currentHour), n.setMinutes(this.currentMinute), n.setSeconds(this.currentSecond), this.isRangeSelection() && (this.rawValue && this.focusedDateIndex === 1 && this.rawValue[1] ? n = [this.rawValue[0], n] : this.rawValue && this.focusedDateIndex === 0 ? n = [n, this.rawValue[1]] : n = [n, null]), this.isMultipleSelection() && (n = this.rawValue ? [].concat(Cn(this.rawValue.slice(0, -1)), [n]) : [n]), this.updateModel(n), this.$emit("date-select", n), setTimeout(function() {
        return t.timePickerChange = !1;
      }, 0);
    },
    toggleAMPM: function(t) {
      var n = this.validateTime(this.currentHour, this.currentMinute, this.currentSecond, !this.pm);
      !n && (this.maxDate || this.minDate) || (this.pm = !this.pm, this.updateModelTime(), t.preventDefault());
    },
    clearTimePickerTimer: function() {
      this.timePickerTimer && clearInterval(this.timePickerTimer);
    },
    onMonthSelect: function(t, n) {
      n.month;
      var r = n.index;
      this.view === "month" ? this.onDateSelect(t, {
        year: this.currentYear,
        month: r,
        day: 1,
        selectable: !0
      }) : (this.currentMonth = r, this.currentView = "date", this.$emit("month-change", {
        month: this.currentMonth + 1,
        year: this.currentYear
      })), setTimeout(this.updateFocus, 0);
    },
    onYearSelect: function(t, n) {
      this.view === "year" ? this.onDateSelect(t, {
        year: n.value,
        month: 0,
        day: 1,
        selectable: !0
      }) : (this.currentYear = n.value, this.currentView = "month", this.$emit("year-change", {
        month: this.currentMonth,
        year: this.currentYear
      })), setTimeout(this.updateFocus, 0);
    },
    updateCurrentMetaData: function() {
      var t = this.viewDate;
      if (this.currentMonth = t.getMonth(), this.currentYear = t.getFullYear(), this.showTime || this.timeOnly) {
        var n = t;
        this.isRangeSelection() && this.rawValue && this.rawValue[this.focusedDateIndex] && (n = this.rawValue[this.focusedDateIndex]), this.updateCurrentTimeMeta(n);
      }
    },
    isValidSelection: function(t) {
      var n = this;
      if (t == null)
        return !0;
      var r = !0;
      return this.isSingleSelection() ? this.isSelectable(t.getDate(), t.getMonth(), t.getFullYear(), !1) || (r = !1) : t.every(function(i) {
        return n.isSelectable(i.getDate(), i.getMonth(), i.getFullYear(), !1);
      }) && this.isRangeSelection() && (r = t.length > 1 && t[1] >= t[0]), r;
    },
    parseValue: function(t) {
      if (!t || t.trim().length === 0)
        return null;
      var n;
      if (this.isSingleSelection())
        n = this.parseDateTime(t);
      else if (this.isMultipleSelection()) {
        var r = t.split(",");
        n = [];
        var i = Tn(r), o;
        try {
          for (i.s(); !(o = i.n()).done; ) {
            var a = o.value;
            n.push(this.parseDateTime(a.trim()));
          }
        } catch (d) {
          i.e(d);
        } finally {
          i.f();
        }
      } else if (this.isRangeSelection()) {
        var s = t.split(" - ");
        n = [];
        for (var l = 0; l < s.length; l++)
          n[l] = this.parseDateTime(s[l].trim());
      }
      return n;
    },
    safeParse: function(t) {
      try {
        return this.parseValue(t);
      } catch {
        var n = new Date(t);
        return isNaN(n.getTime()) ? null : this.isSingleSelection() ? n : [n];
      }
    },
    parseValueForComparison: function(t) {
      if (typeof t == "string") {
        var n = this.parseValue(t);
        return this.isSingleSelection() ? n : n[0];
      }
      return t;
    },
    parseDateTime: function(t) {
      var n, r = this.$primevue.config.locale.am, i = this.$primevue.config.locale.pm, o = "".concat(r, "|").concat(i, "|am|pm"), a = t.match(new RegExp("(?:(.+?) )?(\\d{2}:\\d{2}(?::\\d{2})?)(?:\\s+(".concat(o, "))?"), "i"));
      if (this.timeOnly)
        n = /* @__PURE__ */ new Date(), this.populateTime(n, a[2], a[3]);
      else {
        var s = this.datePattern;
        this.showTime ? (n = this.parseDate(a[1], s), this.populateTime(n, a[2], a[3])) : n = this.parseDate(t, s);
      }
      return n;
    },
    populateTime: function(t, n, r) {
      if (this.hourFormat == "12" && !r)
        throw "Invalid Time";
      this.pm = r.toLowerCase() === this.$primevue.config.locale.pm.toLowerCase() || r.toLowerCase() === "pm";
      var i = this.parseTime(n);
      t.setHours(i.hour), t.setMinutes(i.minute), t.setSeconds(i.second);
    },
    parseTime: function(t) {
      var n = t.split(":"), r = this.showSeconds ? 3 : 2, i = /^[0-9][0-9]$/;
      if (n.length !== r || !n[0].match(i) || !n[1].match(i) || this.showSeconds && !n[2].match(i))
        throw "Invalid time";
      var o = parseInt(n[0]), a = parseInt(n[1]), s = this.showSeconds ? parseInt(n[2]) : null;
      if (isNaN(o) || isNaN(a) || o > 23 || a > 59 || this.hourFormat == "12" && o > 12 || this.showSeconds && (isNaN(s) || s > 59))
        throw "Invalid time";
      return this.hourFormat == "12" && o !== 12 && this.pm ? o += 12 : this.hourFormat == "12" && o == 12 && !this.pm && (o = 0), {
        hour: o,
        minute: a,
        second: s
      };
    },
    parseDate: function(t, n) {
      if (n == null || t == null)
        throw "Invalid arguments";
      if (t = lt(t) === "object" ? t.toString() : t + "", t === "")
        return null;
      var r, i, o, a = 0, s = typeof this.shortYearCutoff != "string" ? this.shortYearCutoff : (/* @__PURE__ */ new Date()).getFullYear() % 100 + parseInt(this.shortYearCutoff, 10), l = -1, d = -1, c = -1, u = -1, p = !1, m, g = function(_) {
        var k = r + 1 < n.length && n.charAt(r + 1) === _;
        return k && r++, k;
      }, S = function(_) {
        var k = g(_), E = _ === "@" ? 14 : _ === "!" ? 20 : _ === "y" && k ? 4 : _ === "o" ? 3 : 2, w = _ === "y" ? E : 1, O = new RegExp("^\\d{" + w + "," + E + "}"), $ = t.substring(a).match(O);
        if (!$)
          throw "Missing number at position " + a;
        return a += $[0].length, parseInt($[0], 10);
      }, x = function(_, k, E) {
        for (var w = -1, O = g(_) ? E : k, $ = [], V = 0; V < O.length; V++)
          $.push([V, O[V]]);
        $.sort(function(U, Y) {
          return -(U[1].length - Y[1].length);
        });
        for (var Z = 0; Z < $.length; Z++) {
          var K = $[Z][1];
          if (t.substr(a, K.length).toLowerCase() === K.toLowerCase()) {
            w = $[Z][0], a += K.length;
            break;
          }
        }
        if (w !== -1)
          return w + 1;
        throw "Unknown name at position " + a;
      }, T = function() {
        if (t.charAt(a) !== n.charAt(r))
          throw "Unexpected literal at position " + a;
        a++;
      };
      for (this.currentView === "month" && (c = 1), this.currentView === "year" && (c = 1, d = 1), r = 0; r < n.length; r++)
        if (p)
          n.charAt(r) === "'" && !g("'") ? p = !1 : T();
        else
          switch (n.charAt(r)) {
            case "d":
              c = S("d");
              break;
            case "D":
              x("D", this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
              break;
            case "o":
              u = S("o");
              break;
            case "m":
              d = S("m");
              break;
            case "M":
              d = x("M", this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
              break;
            case "y":
              l = S("y");
              break;
            case "@":
              m = new Date(S("@")), l = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "!":
              m = new Date((S("!") - this.ticksTo1970) / 1e4), l = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "'":
              g("'") ? T() : p = !0;
              break;
            default:
              T();
          }
      if (a < t.length && (o = t.substr(a), !/^\s+/.test(o)))
        throw "Extra/unparsed characters found in date: " + o;
      if (l === -1 ? l = (/* @__PURE__ */ new Date()).getFullYear() : l < 100 && (l += (/* @__PURE__ */ new Date()).getFullYear() - (/* @__PURE__ */ new Date()).getFullYear() % 100 + (l <= s ? 0 : -100)), u > -1) {
        d = 1, c = u;
        do {
          if (i = this.getDaysCountInMonth(d - 1, l), c <= i)
            break;
          d++, c -= i;
        } while (!0);
      }
      if (m = this.daylightSavingAdjust(new Date(l, d - 1, c)), m.getFullYear() !== l || m.getMonth() + 1 !== d || m.getDate() !== c)
        throw "Invalid date";
      return m;
    },
    getWeekNumber: function(t) {
      var n = new Date(t.getTime());
      n.setDate(n.getDate() + 4 - (n.getDay() || 7));
      var r = n.getTime();
      return n.setMonth(0), n.setDate(1), Math.floor(Math.round((r - n.getTime()) / 864e5) / 7) + 1;
    },
    onDateCellKeydown: function(t, n, r) {
      t.preventDefault();
      var i = t.currentTarget, o = i.parentElement, a = ct(o);
      switch (t.code) {
        case "ArrowDown": {
          i.tabIndex = "-1";
          var s = o.parentElement.nextElementSibling;
          if (s) {
            var l = ct(o.parentElement), d = Array.from(o.parentElement.parentElement.children), c = d.slice(l + 1), u = c.find(function(Q) {
              var P = Q.children[a].children[0];
              return !Ze(P, "data-p-disabled");
            });
            if (u) {
              var p = u.children[a].children[0];
              p.tabIndex = "0", p.focus();
            } else
              this.navigationState = {
                backward: !1
              }, this.navForward(t);
          } else
            this.navigationState = {
              backward: !1
            }, this.navForward(t);
          t.preventDefault();
          break;
        }
        case "ArrowUp": {
          if (i.tabIndex = "-1", t.altKey)
            this.overlayVisible = !1, this.focused = !0;
          else {
            var m = o.parentElement.previousElementSibling;
            if (m) {
              var g = ct(o.parentElement), S = Array.from(o.parentElement.parentElement.children), x = S.slice(0, g).reverse(), T = x.find(function(Q) {
                var P = Q.children[a].children[0];
                return !Ze(P, "data-p-disabled");
              });
              if (T) {
                var A = T.children[a].children[0];
                A.tabIndex = "0", A.focus();
              } else
                this.navigationState = {
                  backward: !0
                }, this.navBackward(t);
            } else
              this.navigationState = {
                backward: !0
              }, this.navBackward(t);
          }
          t.preventDefault();
          break;
        }
        case "ArrowLeft": {
          i.tabIndex = "-1";
          var _ = o.previousElementSibling;
          if (_) {
            var k = Array.from(o.parentElement.children), E = k.slice(0, a).reverse(), w = E.find(function(Q) {
              var P = Q.children[0];
              return !Ze(P, "data-p-disabled");
            });
            if (w) {
              var O = w.children[0];
              O.tabIndex = "0", O.focus();
            } else
              this.navigateToMonth(t, !0, r);
          } else
            this.navigateToMonth(t, !0, r);
          t.preventDefault();
          break;
        }
        case "ArrowRight": {
          i.tabIndex = "-1";
          var $ = o.nextElementSibling;
          if ($) {
            var V = Array.from(o.parentElement.children), Z = V.slice(a + 1), K = Z.find(function(Q) {
              var P = Q.children[0];
              return !Ze(P, "data-p-disabled");
            });
            if (K) {
              var U = K.children[0];
              U.tabIndex = "0", U.focus();
            } else
              this.navigateToMonth(t, !1, r);
          } else
            this.navigateToMonth(t, !1, r);
          t.preventDefault();
          break;
        }
        case "Enter":
        case "NumpadEnter":
        case "Space": {
          this.onDateSelect(t, n), t.preventDefault();
          break;
        }
        case "Escape": {
          this.overlayVisible = !1, t.preventDefault();
          break;
        }
        case "Tab": {
          this.inline || this.trapFocus(t);
          break;
        }
        case "Home": {
          i.tabIndex = "-1";
          var Y = o.parentElement, te = Y.children[0].children[0];
          Ze(te, "data-p-disabled") ? this.navigateToMonth(t, !0, r) : (te.tabIndex = "0", te.focus()), t.preventDefault();
          break;
        }
        case "End": {
          i.tabIndex = "-1";
          var re = o.parentElement, ae = re.children[re.children.length - 1].children[0];
          Ze(ae, "data-p-disabled") ? this.navigateToMonth(t, !1, r) : (ae.tabIndex = "0", ae.focus()), t.preventDefault();
          break;
        }
        case "PageUp": {
          i.tabIndex = "-1", t.shiftKey ? (this.navigationState = {
            backward: !0
          }, this.navBackward(t)) : this.navigateToMonth(t, !0, r), t.preventDefault();
          break;
        }
        case "PageDown": {
          i.tabIndex = "-1", t.shiftKey ? (this.navigationState = {
            backward: !1
          }, this.navForward(t)) : this.navigateToMonth(t, !1, r), t.preventDefault();
          break;
        }
      }
    },
    navigateToMonth: function(t, n, r) {
      if (n)
        if (this.numberOfMonths === 1 || r === 0)
          this.navigationState = {
            backward: !0
          }, this.navBackward(t);
        else {
          var i = this.overlay.children[r - 1], o = Ke(i, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])'), a = o[o.length - 1];
          a.tabIndex = "0", a.focus();
        }
      else if (this.numberOfMonths === 1 || r === this.numberOfMonths - 1)
        this.navigationState = {
          backward: !1
        }, this.navForward(t);
      else {
        var s = this.overlay.children[r + 1], l = Me(s, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        l.tabIndex = "0", l.focus();
      }
    },
    onMonthCellKeydown: function(t, n) {
      var r = t.currentTarget;
      switch (t.code) {
        case "ArrowUp":
        case "ArrowDown": {
          r.tabIndex = "-1";
          var i = r.parentElement.children, o = ct(r), a = i[t.code === "ArrowDown" ? o + 3 : o - 3];
          a && (a.tabIndex = "0", a.focus()), t.preventDefault();
          break;
        }
        case "ArrowLeft": {
          r.tabIndex = "-1";
          var s = r.previousElementSibling;
          s ? (s.tabIndex = "0", s.focus()) : (this.navigationState = {
            backward: !0
          }, this.navBackward(t)), t.preventDefault();
          break;
        }
        case "ArrowRight": {
          r.tabIndex = "-1";
          var l = r.nextElementSibling;
          l ? (l.tabIndex = "0", l.focus()) : (this.navigationState = {
            backward: !1
          }, this.navForward(t)), t.preventDefault();
          break;
        }
        case "PageUp": {
          if (t.shiftKey) return;
          this.navigationState = {
            backward: !0
          }, this.navBackward(t);
          break;
        }
        case "PageDown": {
          if (t.shiftKey) return;
          this.navigationState = {
            backward: !1
          }, this.navForward(t);
          break;
        }
        case "Enter":
        case "NumpadEnter":
        case "Space": {
          this.onMonthSelect(t, n), t.preventDefault();
          break;
        }
        case "Escape": {
          this.overlayVisible = !1, t.preventDefault();
          break;
        }
        case "Tab": {
          this.trapFocus(t);
          break;
        }
      }
    },
    onYearCellKeydown: function(t, n) {
      var r = t.currentTarget;
      switch (t.code) {
        case "ArrowUp":
        case "ArrowDown": {
          r.tabIndex = "-1";
          var i = r.parentElement.children, o = ct(r), a = i[t.code === "ArrowDown" ? o + 2 : o - 2];
          a && (a.tabIndex = "0", a.focus()), t.preventDefault();
          break;
        }
        case "ArrowLeft": {
          r.tabIndex = "-1";
          var s = r.previousElementSibling;
          s ? (s.tabIndex = "0", s.focus()) : (this.navigationState = {
            backward: !0
          }, this.navBackward(t)), t.preventDefault();
          break;
        }
        case "ArrowRight": {
          r.tabIndex = "-1";
          var l = r.nextElementSibling;
          l ? (l.tabIndex = "0", l.focus()) : (this.navigationState = {
            backward: !1
          }, this.navForward(t)), t.preventDefault();
          break;
        }
        case "PageUp": {
          if (t.shiftKey) return;
          this.navigationState = {
            backward: !0
          }, this.navBackward(t);
          break;
        }
        case "PageDown": {
          if (t.shiftKey) return;
          this.navigationState = {
            backward: !1
          }, this.navForward(t);
          break;
        }
        case "Enter":
        case "NumpadEnter":
        case "Space": {
          this.onYearSelect(t, n), t.preventDefault();
          break;
        }
        case "Escape": {
          this.overlayVisible = !1, t.preventDefault();
          break;
        }
        case "Tab": {
          this.trapFocus(t);
          break;
        }
      }
    },
    updateFocus: function() {
      var t;
      if (this.navigationState) {
        if (this.navigationState.button)
          this.initFocusableCell(), this.navigationState.backward ? this.previousButton && this.previousButton.focus() : this.nextButton && this.nextButton.focus();
        else {
          if (this.navigationState.backward) {
            var n;
            this.currentView === "month" ? n = Ke(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]:not([data-p-disabled="true"])') : this.currentView === "year" ? n = Ke(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]:not([data-p-disabled="true"])') : n = Ke(this.overlay, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])'), n && n.length > 0 && (t = n[n.length - 1]);
          } else
            this.currentView === "month" ? t = Me(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]:not([data-p-disabled="true"])') : this.currentView === "year" ? t = Me(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]:not([data-p-disabled="true"])') : t = Me(this.overlay, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
          t && (t.tabIndex = "0", t.focus());
        }
        this.navigationState = null;
      } else
        this.initFocusableCell();
    },
    initFocusableCell: function() {
      var t;
      if (this.currentView === "month") {
        var n = Ke(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]'), r = Me(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"][data-p-selected="true"]');
        n.forEach(function(s) {
          return s.tabIndex = -1;
        }), t = r || n[0];
      } else if (this.currentView === "year") {
        var i = Ke(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]'), o = Me(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"][data-p-selected="true"]');
        i.forEach(function(s) {
          return s.tabIndex = -1;
        }), t = o || i[0];
      } else if (t = Me(this.overlay, 'span[data-p-selected="true"]'), !t) {
        var a = Me(this.overlay, 'td[data-p-today="true"] span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        a ? t = a : t = Me(this.overlay, '.p-datepicker-calendar td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
      }
      t && (t.tabIndex = "0", !this.preventFocus && this.overlay && !this.overlay.contains(document.activeElement) && t.focus(), this.preventFocus = !1);
    },
    trapFocus: function(t) {
      t.preventDefault();
      var n = Or(this.overlay);
      if (n && n.length > 0)
        if (!document.activeElement)
          n[0].focus();
        else {
          var r = n.indexOf(document.activeElement);
          if (t.shiftKey)
            r === -1 || r === 0 ? n[n.length - 1].focus() : n[r - 1].focus();
          else if (r === -1)
            if (this.timeOnly)
              n[0].focus();
            else {
              var i = n.findIndex(function(o) {
                return o.tagName === "SPAN";
              });
              i === -1 && (i = n.findIndex(function(o) {
                return o.tagName === "BUTTON";
              })), i !== -1 ? n[i].focus() : n[0].focus();
            }
          else r === n.length - 1 ? n[0].focus() : n[r + 1].focus();
        }
    },
    onContainerButtonKeydown: function(t) {
      switch (t.code) {
        case "Tab":
          this.trapFocus(t);
          break;
        case "Escape":
          this.overlayVisible = !1, t.preventDefault();
          break;
      }
      this.$emit("keydown", t);
    },
    onInput: function(t) {
      try {
        var n;
        this.selectionStart = this.input.selectionStart, this.selectionEnd = this.input.selectionEnd, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Ne(t.target.value) ? "none" : "block");
        var r = this.parseValue(t.target.value);
        this.isValidSelection(r) && (this.typeUpdate = !0, this.updateModel(this.updateModelType === "string" ? this.formatValue(r) : r), this.updateCurrentMetaData());
      } catch {
      }
      this.$emit("input", t);
    },
    onInputClick: function() {
      this.showOnFocus && this.isEnabled() && !this.overlayVisible && (this.overlayVisible = !0);
    },
    onFocus: function(t) {
      this.showOnFocus && this.isEnabled() && (this.overlayVisible = !0), this.focused = !0, this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r, i;
      this.$emit("blur", {
        originalEvent: t,
        value: t.target.value
      }), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r), this.focused = !1, t.target.value = this.formatValue(this.rawValue), (i = this.$refs.clearIcon) !== null && i !== void 0 && (i = i.$el) !== null && i !== void 0 && i.style && (this.$refs.clearIcon.$el.style.display = Ne(t.target.value) ? "none" : "block");
    },
    onKeyDown: function(t) {
      if (t.code === "ArrowDown" && this.overlay)
        this.trapFocus(t);
      else if (t.code === "ArrowDown" && !this.overlay)
        this.overlayVisible = !0;
      else if (t.code === "Escape")
        this.overlayVisible && (this.overlayVisible = !1, t.preventDefault(), t.stopPropagation());
      else if (t.code === "Tab")
        this.overlay && Or(this.overlay).forEach(function(i) {
          return i.tabIndex = "-1";
        }), this.overlayVisible && (this.overlayVisible = !1);
      else if (t.code === "Enter") {
        var n;
        if (this.manualInput && t.target.value !== null && ((n = t.target.value) === null || n === void 0 ? void 0 : n.trim()) !== "")
          try {
            var r = this.parseValue(t.target.value);
            this.isValidSelection(r) && (this.overlayVisible = !1);
          } catch {
          }
        this.$emit("keydown", t);
      }
    },
    overlayRef: function(t) {
      this.overlay = t;
    },
    inputRef: function(t) {
      this.input = t ? t.$el : void 0;
    },
    previousButtonRef: function(t) {
      this.previousButton = t ? t.$el : void 0;
    },
    nextButtonRef: function(t) {
      this.nextButton = t ? t.$el : void 0;
    },
    getMonthName: function(t) {
      return this.$primevue.config.locale.monthNames[t];
    },
    getYear: function(t) {
      return this.currentView === "month" ? this.currentYear : t.year;
    },
    onClearClick: function() {
      this.updateModel(null), this.overlayVisible = !1;
    },
    onOverlayClick: function(t) {
      t.stopPropagation(), this.inline || rl.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(t) {
      switch (t.code) {
        case "Escape":
          this.inline || (this.input.focus(), this.overlayVisible = !1, t.stopPropagation());
          break;
      }
    },
    onOverlayMouseUp: function(t) {
      this.onOverlayClick(t);
    },
    createResponsiveStyle: function() {
      if (this.numberOfMonths > 1 && this.responsiveOptions && !this.isUnstyled) {
        if (!this.responsiveStyleElement) {
          var t;
          this.responsiveStyleElement = document.createElement("style"), this.responsiveStyleElement.type = "text/css", _o(this.responsiveStyleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.body.appendChild(this.responsiveStyleElement);
        }
        var n = "";
        if (this.responsiveOptions)
          for (var r = ka(), i = Cn(this.responsiveOptions).filter(function(u) {
            return !!(u.breakpoint && u.numMonths);
          }).sort(function(u, p) {
            return -1 * r(u.breakpoint, p.breakpoint);
          }), o = 0; o < i.length; o++) {
            for (var a = i[o], s = a.breakpoint, l = a.numMonths, d = `
                            .p-datepicker-panel[`.concat(this.$attrSelector, "] .p-datepicker-calendar:nth-child(").concat(l, `) .p-datepicker-next-button {
                                display: inline-flex;
                            }
                        `), c = l; c < this.numberOfMonths; c++)
              d += `
                                .p-datepicker-panel[`.concat(this.$attrSelector, "] .p-datepicker-calendar:nth-child(").concat(c + 1, `) {
                                    display: none;
                                }
                            `);
            n += `
                            @media screen and (max-width: `.concat(s, `) {
                                `).concat(d, `
                            }
                        `);
          }
        this.responsiveStyleElement.innerHTML = n;
      }
    },
    destroyResponsiveStyleElement: function() {
      this.responsiveStyleElement && (this.responsiveStyleElement.remove(), this.responsiveStyleElement = null);
    },
    dayDataP: function(t) {
      return ke({
        today: t.today,
        "other-month": t.otherMonth,
        selected: this.isSelected(t),
        disabled: !t.selectable
      });
    }
  },
  computed: {
    viewDate: function() {
      var t = this.rawValue;
      if (t && Array.isArray(t))
        if (this.isRangeSelection())
          if (t.length === 0)
            t = null;
          else if (t.length === 1)
            t = t[0];
          else {
            var n = this.parseValueForComparison(t[0]), r = new Date(n.getFullYear(), n.getMonth() + this.numberOfMonths, 1);
            if (!t[1] || t[1] < r)
              t = t[0];
            else {
              var i = this.parseValueForComparison(t[1]);
              t = new Date(i.getFullYear(), i.getMonth() - this.numberOfMonths + 1, 1);
            }
          }
        else this.isMultipleSelection() && (t = t[t.length - 1]);
      if (t && typeof t != "string")
        return t;
      var o = /* @__PURE__ */ new Date();
      return this.maxDate && this.maxDate < o ? this.maxDate : this.minDate && this.minDate > o ? this.minDate : o;
    },
    inputFieldValue: function() {
      return this.formatValue(this.rawValue);
    },
    months: function() {
      for (var t = [], n = 0; n < this.numberOfMonths; n++) {
        var r = this.currentMonth + n, i = this.currentYear;
        r > 11 && (r = r % 11 - 1, i = i + 1);
        for (var o = [], a = this.getFirstDayOfMonthIndex(r, i), s = this.getDaysCountInMonth(r, i), l = this.getDaysCountInPrevMonth(r, i), d = 1, c = /* @__PURE__ */ new Date(), u = [], p = Math.ceil((s + a) / 7), m = 0; m < p; m++) {
          var g = [];
          if (m == 0) {
            for (var S = l - a + 1; S <= l; S++) {
              var x = this.getPreviousMonthAndYear(r, i);
              g.push({
                day: S,
                month: x.month,
                year: x.year,
                otherMonth: !0,
                today: this.isToday(c, S, x.month, x.year),
                selectable: this.isSelectable(S, x.month, x.year, !0)
              });
            }
            for (var T = 7 - g.length, A = 0; A < T; A++)
              g.push({
                day: d,
                month: r,
                year: i,
                today: this.isToday(c, d, r, i),
                selectable: this.isSelectable(d, r, i, !1)
              }), d++;
          } else
            for (var _ = 0; _ < 7; _++) {
              if (d > s) {
                var k = this.getNextMonthAndYear(r, i);
                g.push({
                  day: d - s,
                  month: k.month,
                  year: k.year,
                  otherMonth: !0,
                  today: this.isToday(c, d - s, k.month, k.year),
                  selectable: this.isSelectable(d - s, k.month, k.year, !0)
                });
              } else
                g.push({
                  day: d,
                  month: r,
                  year: i,
                  today: this.isToday(c, d, r, i),
                  selectable: this.isSelectable(d, r, i, !1)
                });
              d++;
            }
          this.showWeek && u.push(this.getWeekNumber(new Date(g[0].year, g[0].month, g[0].day))), o.push(g);
        }
        t.push({
          month: r,
          year: i,
          dates: o,
          weekNumbers: u
        });
      }
      return t;
    },
    weekDays: function() {
      for (var t = [], n = this.$primevue.config.locale.firstDayOfWeek, r = 0; r < 7; r++)
        t.push(this.$primevue.config.locale.dayNamesMin[n]), n = n == 6 ? 0 : ++n;
      return t;
    },
    ticksTo1970: function() {
      return (1969 * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 1e7;
    },
    sundayIndex: function() {
      return this.$primevue.config.locale.firstDayOfWeek > 0 ? 7 - this.$primevue.config.locale.firstDayOfWeek : 0;
    },
    datePattern: function() {
      return this.dateFormat || this.$primevue.config.locale.dateFormat;
    },
    monthPickerValues: function() {
      for (var t = this, n = [], r = function(a) {
        if (t.minDate) {
          var s = t.minDate.getMonth(), l = t.minDate.getFullYear();
          if (t.currentYear < l || t.currentYear === l && a < s)
            return !1;
        }
        if (t.maxDate) {
          var d = t.maxDate.getMonth(), c = t.maxDate.getFullYear();
          if (t.currentYear > c || t.currentYear === c && a > d)
            return !1;
        }
        return !0;
      }, i = 0; i <= 11; i++)
        n.push({
          value: this.$primevue.config.locale.monthNamesShort[i],
          selectable: r(i)
        });
      return n;
    },
    yearPickerValues: function() {
      for (var t = this, n = [], r = this.currentYear - this.currentYear % 10, i = function(s) {
        return !(t.minDate && t.minDate.getFullYear() > s || t.maxDate && t.maxDate.getFullYear() < s);
      }, o = 0; o < 10; o++)
        n.push({
          value: r + o,
          selectable: i(r + o)
        });
      return n;
    },
    formattedCurrentHour: function() {
      return this.currentHour == 0 && this.hourFormat == "12" ? this.currentHour + 12 : this.currentHour < 10 ? "0" + this.currentHour : this.currentHour;
    },
    formattedCurrentMinute: function() {
      return this.currentMinute < 10 ? "0" + this.currentMinute : this.currentMinute;
    },
    formattedCurrentSecond: function() {
      return this.currentSecond < 10 ? "0" + this.currentSecond : this.currentSecond;
    },
    todayLabel: function() {
      return this.$primevue.config.locale.today;
    },
    clearLabel: function() {
      return this.$primevue.config.locale.clear;
    },
    weekHeaderLabel: function() {
      return this.$primevue.config.locale.weekHeader;
    },
    monthNames: function() {
      return this.$primevue.config.locale.monthNames;
    },
    switchViewButtonDisabled: function() {
      return this.numberOfMonths > 1 || this.disabled;
    },
    isClearIconVisible: function() {
      return this.showClear && this.rawValue != null && !this.disabled;
    },
    panelId: function() {
      return this.$id + "_panel";
    },
    containerDataP: function() {
      return ke({
        fluid: this.$fluid
      });
    },
    panelDataP: function() {
      return ke(bo({
        inline: this.inline
      }, "portal-" + this.appendTo, "portal-" + this.appendTo));
    },
    inputIconDataP: function() {
      return ke(bo({}, this.size, this.size));
    },
    timePickerDataP: function() {
      return ke({
        "time-only": this.timeOnly
      });
    },
    hourIncrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 0, 1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 0, 1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    },
    hourDecrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 0, -1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 0, -1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    },
    minuteIncrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 1, 1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 1, 1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    },
    minuteDecrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 1, -1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 1, -1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    },
    secondIncrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 2, 1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 2, 1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    },
    secondDecrementCallbacks: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onTimePickerElementMouseDown(r, 2, -1);
        },
        mouseup: function(r) {
          return t.onTimePickerElementMouseUp(r);
        },
        mouseleave: function() {
          return t.onTimePickerElementMouseLeave();
        },
        keydown: function(r) {
          return t.onTimePickerElementKeyDown(r, 2, -1);
        },
        keyup: function(r) {
          return t.onTimePickerElementKeyUp(r);
        }
      };
    }
  },
  components: {
    InputText: mn,
    Button: He,
    Portal: ar,
    CalendarIcon: gi,
    ChevronLeftIcon: wi,
    ChevronRightIcon: ki,
    ChevronUpIcon: Si,
    ChevronDownIcon: yi,
    TimesIcon: yr
  },
  directives: {
    ripple: sr
  }
}, Cp = ["id", "data-p"], Tp = ["disabled", "aria-label", "aria-expanded", "aria-controls"], Pp = ["data-p"], Ep = ["id", "role", "aria-modal", "aria-label", "data-p"], Op = ["disabled", "aria-label"], Mp = ["disabled", "aria-label"], Dp = ["disabled", "aria-label"], Ap = ["disabled", "aria-label"], _p = ["data-p-disabled"], Ip = ["abbr"], Vp = ["data-p-disabled"], Lp = ["aria-label", "data-p-today", "data-p-other-month"], Np = ["onClick", "onKeydown", "aria-selected", "aria-disabled", "data-p"], Bp = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], Rp = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], jp = ["data-p"];
function Fp(e, t, n, r, i, o) {
  var a = Fe("InputText"), s = Fe("TimesIcon"), l = Fe("Button"), d = Fe("Portal"), c = er("ripple");
  return f(), y("span", b({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    style: e.sx("root"),
    "data-p": o.containerDataP
  }, e.ptmi("root")), [e.inline ? D("", !0) : (f(), L(a, {
    key: 0,
    ref: o.inputRef,
    id: e.inputId,
    role: "combobox",
    class: ie([e.inputClass, e.cx("pcInputText")]),
    style: Ji(e.inputStyle),
    defaultValue: o.inputFieldValue,
    placeholder: e.placeholder,
    name: e.name,
    size: e.size,
    invalid: e.invalid,
    variant: e.variant,
    fluid: e.fluid,
    required: e.required,
    unstyled: e.unstyled,
    autocomplete: "off",
    "aria-autocomplete": "none",
    "aria-haspopup": "dialog",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? o.panelId : void 0,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    inputmode: "none",
    disabled: e.disabled,
    readonly: !e.manualInput || e.readonly,
    tabindex: 0,
    onInput: o.onInput,
    onClick: o.onInputClick,
    onFocus: o.onFocus,
    onBlur: o.onBlur,
    onKeydown: o.onKeyDown,
    "data-p-has-dropdown": e.showIcon && e.iconDisplay === "button" && !e.inline,
    "data-p-has-e-icon": e.showIcon && e.iconDisplay === "input" && !e.inline,
    pt: e.ptm("pcInputText")
  }, null, 8, ["id", "class", "style", "defaultValue", "placeholder", "name", "size", "invalid", "variant", "fluid", "required", "unstyled", "aria-expanded", "aria-controls", "aria-labelledby", "aria-label", "disabled", "readonly", "onInput", "onClick", "onFocus", "onBlur", "onKeydown", "data-p-has-dropdown", "data-p-has-e-icon", "pt"])), e.showClear && !e.inline ? F(e.$slots, "clearicon", {
    key: 1,
    class: ie(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [j(s, b({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: o.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : D("", !0), e.showIcon && e.iconDisplay === "button" && !e.inline ? F(e.$slots, "dropdownbutton", {
    key: 2,
    toggleCallback: o.onButtonClick
  }, function() {
    return [I("button", b({
      class: e.cx("dropdown"),
      disabled: e.disabled,
      onClick: t[0] || (t[0] = function() {
        return o.onButtonClick && o.onButtonClick.apply(o, arguments);
      }),
      type: "button",
      "aria-label": e.$primevue.config.locale.chooseDate,
      "aria-haspopup": "dialog",
      "aria-expanded": i.overlayVisible,
      "aria-controls": o.panelId
    }, e.ptm("dropdown")), [F(e.$slots, "dropdownicon", {
      class: ie(e.icon)
    }, function() {
      return [(f(), L(ve(e.icon ? "span" : "CalendarIcon"), b({
        class: e.icon
      }, e.ptm("dropdownIcon")), null, 16, ["class"]))];
    })], 16, Tp)];
  }) : e.showIcon && e.iconDisplay === "input" && !e.inline ? (f(), y(J, {
    key: 3
  }, [e.$slots.inputicon || e.showIcon ? (f(), y("span", b({
    key: 0,
    class: e.cx("inputIconContainer"),
    "data-p": o.inputIconDataP
  }, e.ptm("inputIconContainer")), [F(e.$slots, "inputicon", {
    class: ie(e.cx("inputIcon")),
    clickCallback: o.onButtonClick
  }, function() {
    return [(f(), L(ve(e.icon ? "i" : "CalendarIcon"), b({
      class: [e.icon, e.cx("inputIcon")],
      onClick: o.onButtonClick
    }, e.ptm("inputicon")), null, 16, ["class", "onClick"]))];
  })], 16, Pp)) : D("", !0)], 64)) : D("", !0), j(d, {
    appendTo: e.appendTo,
    disabled: e.inline
  }, {
    default: G(function() {
      return [j($o, b({
        name: "p-anchored-overlay",
        onEnter: t[58] || (t[58] = function(u) {
          return o.onOverlayEnter(u);
        }),
        onAfterEnter: o.onOverlayEnterComplete,
        onAfterLeave: o.onOverlayAfterLeave,
        onLeave: o.onOverlayLeave
      }, e.ptm("transition")), {
        default: G(function() {
          return [e.inline || i.overlayVisible ? (f(), y("div", b({
            key: 0,
            ref: o.overlayRef,
            id: o.panelId,
            class: [e.cx("panel"), e.panelClass],
            style: e.panelStyle,
            role: e.inline ? null : "dialog",
            "aria-modal": e.inline ? null : "true",
            "aria-label": e.$primevue.config.locale.chooseDate,
            onClick: t[55] || (t[55] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: t[56] || (t[56] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            onMouseup: t[57] || (t[57] = function() {
              return o.onOverlayMouseUp && o.onOverlayMouseUp.apply(o, arguments);
            }),
            "data-p": o.panelDataP
          }, e.ptm("panel")), [e.timeOnly ? D("", !0) : (f(), y(J, {
            key: 0
          }, [I("div", b({
            class: e.cx("calendarContainer")
          }, e.ptm("calendarContainer")), [(f(!0), y(J, null, be(o.months, function(u, p) {
            return f(), y("div", b({
              key: u.month + u.year,
              class: e.cx("calendar")
            }, {
              ref_for: !0
            }, e.ptm("calendar")), [I("div", b({
              class: e.cx("header")
            }, {
              ref_for: !0
            }, e.ptm("header")), [F(e.$slots, "header"), F(e.$slots, "prevbutton", {
              actionCallback: function(g) {
                return o.onPrevButtonClick(g);
              },
              keydownCallback: function(g) {
                return o.onContainerButtonKeydown(g);
              }
            }, function() {
              return [Qe(j(l, b({
                ref_for: !0,
                ref: o.previousButtonRef,
                class: e.cx("pcPrevButton"),
                disabled: e.disabled,
                "aria-label": i.currentView === "year" ? e.$primevue.config.locale.prevDecade : i.currentView === "month" ? e.$primevue.config.locale.prevYear : e.$primevue.config.locale.prevMonth,
                unstyled: e.unstyled,
                onClick: o.onPrevButtonClick,
                onKeydown: o.onContainerButtonKeydown
              }, {
                ref_for: !0
              }, e.navigatorButtonProps, {
                pt: e.ptm("pcPrevButton"),
                "data-pc-group-section": "navigator"
              }), {
                icon: G(function(m) {
                  return [F(e.$slots, "previcon", {}, function() {
                    return [(f(), L(ve(e.prevIcon ? "span" : "ChevronLeftIcon"), b({
                      class: [e.prevIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcPrevButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[$r, p === 0]])];
            }), I("div", b({
              class: e.cx("title")
            }, {
              ref_for: !0
            }, e.ptm("title")), [e.$primevue.config.locale.showMonthAfterYear ? (f(), y(J, {
              key: 0
            }, [i.currentView !== "year" ? (f(), y("button", b({
              key: 0,
              type: "button",
              onClick: t[1] || (t[1] = function() {
                return o.switchToYearView && o.switchToYearView.apply(o, arguments);
              }),
              onKeydown: t[2] || (t[2] = function() {
                return o.onContainerButtonKeydown && o.onContainerButtonKeydown.apply(o, arguments);
              }),
              class: e.cx("selectYear"),
              disabled: o.switchViewButtonDisabled,
              "aria-label": e.$primevue.config.locale.chooseYear
            }, {
              ref_for: !0
            }, e.ptm("selectYear"), {
              "data-pc-group-section": "view"
            }), N(o.getYear(u)), 17, Op)) : D("", !0), i.currentView === "date" ? (f(), y("button", b({
              key: 1,
              type: "button",
              onClick: t[3] || (t[3] = function() {
                return o.switchToMonthView && o.switchToMonthView.apply(o, arguments);
              }),
              onKeydown: t[4] || (t[4] = function() {
                return o.onContainerButtonKeydown && o.onContainerButtonKeydown.apply(o, arguments);
              }),
              class: e.cx("selectMonth"),
              disabled: o.switchViewButtonDisabled,
              "aria-label": e.$primevue.config.locale.chooseMonth
            }, {
              ref_for: !0
            }, e.ptm("selectMonth"), {
              "data-pc-group-section": "view"
            }), N(o.getMonthName(u.month)), 17, Mp)) : D("", !0)], 64)) : (f(), y(J, {
              key: 1
            }, [i.currentView === "date" ? (f(), y("button", b({
              key: 0,
              type: "button",
              onClick: t[5] || (t[5] = function() {
                return o.switchToMonthView && o.switchToMonthView.apply(o, arguments);
              }),
              onKeydown: t[6] || (t[6] = function() {
                return o.onContainerButtonKeydown && o.onContainerButtonKeydown.apply(o, arguments);
              }),
              class: e.cx("selectMonth"),
              disabled: o.switchViewButtonDisabled,
              "aria-label": e.$primevue.config.locale.chooseMonth
            }, {
              ref_for: !0
            }, e.ptm("selectMonth"), {
              "data-pc-group-section": "view"
            }), N(o.getMonthName(u.month)), 17, Dp)) : D("", !0), i.currentView !== "year" ? (f(), y("button", b({
              key: 1,
              type: "button",
              onClick: t[7] || (t[7] = function() {
                return o.switchToYearView && o.switchToYearView.apply(o, arguments);
              }),
              onKeydown: t[8] || (t[8] = function() {
                return o.onContainerButtonKeydown && o.onContainerButtonKeydown.apply(o, arguments);
              }),
              class: e.cx("selectYear"),
              disabled: o.switchViewButtonDisabled,
              "aria-label": e.$primevue.config.locale.chooseYear
            }, {
              ref_for: !0
            }, e.ptm("selectYear"), {
              "data-pc-group-section": "view"
            }), N(o.getYear(u)), 17, Ap)) : D("", !0)], 64)), i.currentView === "year" ? (f(), y("span", b({
              key: 2,
              class: e.cx("decade")
            }, {
              ref_for: !0
            }, e.ptm("decade")), [F(e.$slots, "decade", {
              years: o.yearPickerValues
            }, function() {
              return [fe(N(o.yearPickerValues[0].value) + " - " + N(o.yearPickerValues[o.yearPickerValues.length - 1].value), 1)];
            })], 16)) : D("", !0)], 16), F(e.$slots, "nextbutton", {
              actionCallback: function(g) {
                return o.onNextButtonClick(g);
              },
              keydownCallback: function(g) {
                return o.onContainerButtonKeydown(g);
              }
            }, function() {
              return [Qe(j(l, b({
                ref_for: !0,
                ref: o.nextButtonRef,
                class: e.cx("pcNextButton"),
                disabled: e.disabled,
                "aria-label": i.currentView === "year" ? e.$primevue.config.locale.nextDecade : i.currentView === "month" ? e.$primevue.config.locale.nextYear : e.$primevue.config.locale.nextMonth,
                unstyled: e.unstyled,
                onClick: o.onNextButtonClick,
                onKeydown: o.onContainerButtonKeydown
              }, {
                ref_for: !0
              }, e.navigatorButtonProps, {
                pt: e.ptm("pcNextButton"),
                "data-pc-group-section": "navigator"
              }), {
                icon: G(function(m) {
                  return [F(e.$slots, "nexticon", {}, function() {
                    return [(f(), L(ve(e.nextIcon ? "span" : "ChevronRightIcon"), b({
                      class: [e.nextIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcNextButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[$r, e.numberOfMonths === 1 ? !0 : p === e.numberOfMonths - 1]])];
            })], 16), i.currentView === "date" ? (f(), y("table", b({
              key: 0,
              class: e.cx("dayView"),
              role: "grid"
            }, {
              ref_for: !0
            }, e.ptm("dayView")), [I("thead", b({
              ref_for: !0
            }, e.ptm("tableHeader")), [I("tr", b({
              ref_for: !0
            }, e.ptm("tableHeaderRow")), [e.showWeek ? (f(), y("th", b({
              key: 0,
              scope: "col",
              class: e.cx("weekHeader")
            }, {
              ref_for: !0
            }, e.ptm("weekHeader", {
              context: {
                disabled: e.showWeek
              }
            }), {
              "data-p-disabled": e.showWeek,
              "data-pc-group-section": "tableheadercell"
            }), [F(e.$slots, "weekheaderlabel", {}, function() {
              return [I("span", b({
                ref_for: !0
              }, e.ptm("weekHeaderLabel", {
                context: {
                  disabled: e.showWeek
                }
              }), {
                "data-pc-group-section": "tableheadercelllabel"
              }), N(o.weekHeaderLabel), 17)];
            })], 16, _p)) : D("", !0), (f(!0), y(J, null, be(o.weekDays, function(m) {
              return f(), y("th", b({
                key: m,
                scope: "col",
                abbr: m
              }, {
                ref_for: !0
              }, e.ptm("tableHeaderCell"), {
                "data-pc-group-section": "tableheadercell",
                class: e.cx("weekDayCell")
              }), [I("span", b({
                class: e.cx("weekDay")
              }, {
                ref_for: !0
              }, e.ptm("weekDay"), {
                "data-pc-group-section": "tableheadercelllabel"
              }), N(m), 17)], 16, Ip);
            }), 128))], 16)], 16), I("tbody", b({
              ref_for: !0
            }, e.ptm("tableBody")), [(f(!0), y(J, null, be(u.dates, function(m, g) {
              return f(), y("tr", b({
                key: m[0].day + "" + m[0].month
              }, {
                ref_for: !0
              }, e.ptm("tableBodyRow")), [e.showWeek ? (f(), y("td", b({
                key: 0,
                class: e.cx("weekNumber")
              }, {
                ref_for: !0
              }, e.ptm("weekNumber"), {
                "data-pc-group-section": "tablebodycell"
              }), [I("span", b({
                class: e.cx("weekLabelContainer")
              }, {
                ref_for: !0
              }, e.ptm("weekLabelContainer", {
                context: {
                  disabled: e.showWeek
                }
              }), {
                "data-p-disabled": e.showWeek,
                "data-pc-group-section": "tablebodycelllabel"
              }), [F(e.$slots, "weeklabel", {
                weekNumber: u.weekNumbers[g]
              }, function() {
                return [u.weekNumbers[g] < 10 ? (f(), y("span", b({
                  key: 0,
                  style: {
                    visibility: "hidden"
                  }
                }, {
                  ref_for: !0
                }, e.ptm("weekLabel")), "0", 16)) : D("", !0), fe(" " + N(u.weekNumbers[g]), 1)];
              })], 16, Vp)], 16)) : D("", !0), (f(!0), y(J, null, be(m, function(S) {
                return f(), y("td", b({
                  key: S.day + "" + S.month,
                  "aria-label": S.day,
                  class: e.cx("dayCell", {
                    date: S
                  })
                }, {
                  ref_for: !0
                }, e.ptm("dayCell", {
                  context: {
                    date: S,
                    today: S.today,
                    otherMonth: S.otherMonth,
                    selected: o.isSelected(S),
                    disabled: !S.selectable
                  }
                }), {
                  "data-p-today": S.today,
                  "data-p-other-month": S.otherMonth,
                  "data-pc-group-section": "tablebodycell"
                }), [e.showOtherMonths || !S.otherMonth ? Qe((f(), y("span", b({
                  key: 0,
                  class: e.cx("day", {
                    date: S
                  }),
                  onClick: function(T) {
                    return o.onDateSelect(T, S);
                  },
                  draggable: "false",
                  onKeydown: function(T) {
                    return o.onDateCellKeydown(T, S, p);
                  },
                  "aria-selected": o.isSelected(S),
                  "aria-disabled": !S.selectable
                }, {
                  ref_for: !0
                }, e.ptm("day", {
                  context: {
                    date: S,
                    today: S.today,
                    otherMonth: S.otherMonth,
                    selected: o.isSelected(S),
                    disabled: !S.selectable
                  }
                }), {
                  "data-p": o.dayDataP(S),
                  "data-pc-group-section": "tablebodycelllabel"
                }), [F(e.$slots, "date", {
                  date: S
                }, function() {
                  return [fe(N(S.day), 1)];
                })], 16, Np)), [[c]]) : D("", !0), o.isSelected(S) ? (f(), y("div", b({
                  key: 1,
                  class: "p-hidden-accessible",
                  "aria-live": "polite"
                }, {
                  ref_for: !0
                }, e.ptm("hiddenSelectedDay"), {
                  "data-p-hidden-accessible": !0
                }), N(S.day), 17)) : D("", !0)], 16, Lp);
              }), 128))], 16);
            }), 128))], 16)], 16)) : D("", !0)], 16);
          }), 128))], 16), i.currentView === "month" ? (f(), y("div", b({
            key: 0,
            class: e.cx("monthView")
          }, e.ptm("monthView")), [(f(!0), y(J, null, be(o.monthPickerValues, function(u, p) {
            return Qe((f(), y("span", b({
              key: u,
              onClick: function(g) {
                return o.onMonthSelect(g, {
                  month: u,
                  index: p
                });
              },
              onKeydown: function(g) {
                return o.onMonthCellKeydown(g, {
                  month: u,
                  index: p
                });
              },
              class: e.cx("month", {
                month: u,
                index: p
              })
            }, {
              ref_for: !0
            }, e.ptm("month", {
              context: {
                month: u,
                monthIndex: p,
                selected: o.isMonthSelected(p),
                disabled: !u.selectable
              }
            }), {
              "data-p-disabled": !u.selectable,
              "data-p-selected": o.isMonthSelected(p)
            }), [fe(N(u.value) + " ", 1), o.isMonthSelected(p) ? (f(), y("div", b({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenMonth"), {
              "data-p-hidden-accessible": !0
            }), N(u.value), 17)) : D("", !0)], 16, Bp)), [[c]]);
          }), 128))], 16)) : D("", !0), i.currentView === "year" ? (f(), y("div", b({
            key: 1,
            class: e.cx("yearView")
          }, e.ptm("yearView")), [(f(!0), y(J, null, be(o.yearPickerValues, function(u) {
            return Qe((f(), y("span", b({
              key: u.value,
              onClick: function(m) {
                return o.onYearSelect(m, u);
              },
              onKeydown: function(m) {
                return o.onYearCellKeydown(m, u);
              },
              class: e.cx("year", {
                year: u
              })
            }, {
              ref_for: !0
            }, e.ptm("year", {
              context: {
                year: u,
                selected: o.isYearSelected(u.value),
                disabled: !u.selectable
              }
            }), {
              "data-p-disabled": !u.selectable,
              "data-p-selected": o.isYearSelected(u.value)
            }), [fe(N(u.value) + " ", 1), o.isYearSelected(u.value) ? (f(), y("div", b({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenYear"), {
              "data-p-hidden-accessible": !0
            }), N(u.value), 17)) : D("", !0)], 16, Rp)), [[c]]);
          }), 128))], 16)) : D("", !0)], 64)), (e.showTime || e.timeOnly) && i.currentView === "date" ? (f(), y("div", b({
            key: 1,
            class: e.cx("timePicker"),
            "data-p": o.timePickerDataP
          }, e.ptm("timePicker")), [I("div", b({
            class: e.cx("hourPicker")
          }, e.ptm("hourPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [F(e.$slots, "hourincrementbutton", {
            callbacks: o.hourIncrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.nextHour,
              unstyled: e.unstyled,
              onMousedown: t[9] || (t[9] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }),
              onMouseup: t[10] || (t[10] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[12] || (t[12] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["enter"])), t[13] || (t[13] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["space"]))],
              onMouseleave: t[11] || (t[11] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[14] || (t[14] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[15] || (t[15] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "incrementicon", {}, function() {
                  return [(f(), L(ve(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onKeydown", "pt"])];
          }), I("span", b(e.ptm("hour"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentHour), 17), F(e.$slots, "hourdecrementbutton", {
            callbacks: o.hourDecrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.prevHour,
              unstyled: e.unstyled,
              onMousedown: t[16] || (t[16] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }),
              onMouseup: t[17] || (t[17] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[19] || (t[19] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["enter"])), t[20] || (t[20] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["space"]))],
              onMouseleave: t[18] || (t[18] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[21] || (t[21] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[22] || (t[22] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "decrementicon", {}, function() {
                  return [(f(), L(ve(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onKeydown", "pt"])];
          })], 16), I("div", b(e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", b(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16), I("div", b({
            class: e.cx("minutePicker")
          }, e.ptm("minutePicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [F(e.$slots, "minuteincrementbutton", {
            callbacks: o.minuteIncrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.nextMinute,
              disabled: e.disabled,
              unstyled: e.unstyled,
              onMousedown: t[23] || (t[23] = function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }),
              onMouseup: t[24] || (t[24] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[26] || (t[26] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["enter"])), t[27] || (t[27] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["space"]))],
              onMouseleave: t[25] || (t[25] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[28] || (t[28] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[29] || (t[29] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "incrementicon", {}, function() {
                  return [(f(), L(ve(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", b(e.ptm("minute"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentMinute), 17), F(e.$slots, "minutedecrementbutton", {
            callbacks: o.minuteDecrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.prevMinute,
              disabled: e.disabled,
              unstyled: e.unstyled,
              onMousedown: t[30] || (t[30] = function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }),
              onMouseup: t[31] || (t[31] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[33] || (t[33] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["enter"])), t[34] || (t[34] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["space"]))],
              onMouseleave: t[32] || (t[32] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[35] || (t[35] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[36] || (t[36] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "decrementicon", {}, function() {
                  return [(f(), L(ve(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16), e.showSeconds ? (f(), y("div", b({
            key: 0,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", b(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16)) : D("", !0), e.showSeconds ? (f(), y("div", b({
            key: 1,
            class: e.cx("secondPicker")
          }, e.ptm("secondPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [F(e.$slots, "secondincrementbutton", {
            callbacks: o.secondIncrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.nextSecond,
              disabled: e.disabled,
              unstyled: e.unstyled,
              onMousedown: t[37] || (t[37] = function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }),
              onMouseup: t[38] || (t[38] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[40] || (t[40] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["enter"])), t[41] || (t[41] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["space"]))],
              onMouseleave: t[39] || (t[39] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[42] || (t[42] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[43] || (t[43] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "incrementicon", {}, function() {
                  return [(f(), L(ve(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", b(e.ptm("second"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentSecond), 17), F(e.$slots, "seconddecrementbutton", {
            callbacks: o.secondDecrementCallbacks
          }, function() {
            return [j(l, b({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.prevSecond,
              disabled: e.disabled,
              unstyled: e.unstyled,
              onMousedown: t[44] || (t[44] = function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }),
              onMouseup: t[45] || (t[45] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[47] || (t[47] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["enter"])), t[48] || (t[48] = pe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["space"]))],
              onMouseleave: t[46] || (t[46] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[49] || (t[49] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[50] || (t[50] = pe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "decrementicon", {}, function() {
                  return [(f(), L(ve(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16)) : D("", !0), e.hourFormat == "12" ? (f(), y("div", b({
            key: 2,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", b(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16)) : D("", !0), e.hourFormat == "12" ? (f(), y("div", b({
            key: 3,
            class: e.cx("ampmPicker")
          }, e.ptm("ampmPicker")), [F(e.$slots, "ampmincrementbutton", {
            toggleCallback: function(p) {
              return o.toggleAMPM(p);
            },
            keydownCallback: function(p) {
              return o.onContainerButtonKeydown(p);
            }
          }, function() {
            return [j(l, b({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.am,
              disabled: e.disabled,
              unstyled: e.unstyled,
              onClick: t[51] || (t[51] = function(u) {
                return o.toggleAMPM(u);
              }),
              onKeydown: o.onContainerButtonKeydown
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "incrementicon", {
                  class: ie(e.cx("incrementIcon"))
                }, function() {
                  return [(f(), L(ve(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
                    class: [e.cx("incrementIcon"), u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", b(e.ptm("ampm"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(i.pm ? e.$primevue.config.locale.pm : e.$primevue.config.locale.am), 17), F(e.$slots, "ampmdecrementbutton", {
            toggleCallback: function(p) {
              return o.toggleAMPM(p);
            },
            keydownCallback: function(p) {
              return o.onContainerButtonKeydown(p);
            }
          }, function() {
            return [j(l, b({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.pm,
              disabled: e.disabled,
              onClick: t[52] || (t[52] = function(u) {
                return o.toggleAMPM(u);
              }),
              onKeydown: o.onContainerButtonKeydown
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: G(function(u) {
                return [F(e.$slots, "decrementicon", {
                  class: ie(e.cx("decrementIcon"))
                }, function() {
                  return [(f(), L(ve(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.cx("decrementIcon"), u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "onKeydown", "pt"])];
          })], 16)) : D("", !0)], 16, jp)) : D("", !0), e.showButtonBar ? (f(), y("div", b({
            key: 2,
            class: e.cx("buttonbar")
          }, e.ptm("buttonbar")), [F(e.$slots, "buttonbar", {
            todayCallback: function(p) {
              return o.onTodayButtonClick(p);
            },
            clearCallback: function(p) {
              return o.onClearButtonClick(p);
            }
          }, function() {
            return [F(e.$slots, "todaybutton", {
              actionCallback: function(p) {
                return o.onTodayButtonClick(p);
              },
              keydownCallback: function(p) {
                return o.onContainerButtonKeydown(p);
              }
            }, function() {
              return [j(l, b({
                label: o.todayLabel,
                onClick: t[53] || (t[53] = function(u) {
                  return o.onTodayButtonClick(u);
                }),
                class: e.cx("pcTodayButton"),
                unstyled: e.unstyled,
                onKeydown: o.onContainerButtonKeydown
              }, e.todayButtonProps, {
                pt: e.ptm("pcTodayButton"),
                "data-pc-group-section": "button"
              }), null, 16, ["label", "class", "unstyled", "onKeydown", "pt"])];
            }), F(e.$slots, "clearbutton", {
              actionCallback: function(p) {
                return o.onClearButtonClick(p);
              },
              keydownCallback: function(p) {
                return o.onContainerButtonKeydown(p);
              }
            }, function() {
              return [j(l, b({
                label: o.clearLabel,
                onClick: t[54] || (t[54] = function(u) {
                  return o.onClearButtonClick(u);
                }),
                class: e.cx("pcClearButton"),
                unstyled: e.unstyled,
                onKeydown: o.onContainerButtonKeydown
              }, e.clearButtonProps, {
                pt: e.ptm("pcClearButton"),
                "data-pc-group-section": "button"
              }), null, 16, ["label", "class", "unstyled", "onKeydown", "pt"])];
            })];
          })], 16)) : D("", !0), F(e.$slots, "footer")], 16, Ep)) : D("", !0)];
        }),
        _: 3
      }, 16, ["onAfterEnter", "onAfterLeave", "onLeave"])];
    }),
    _: 3
  }, 8, ["appendTo", "disabled"])], 16, Cp);
}
Ti.render = Fp;
const Qt = "0100-01-01", vo = "9999-12-31", zp = 'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]', Hp = /* @__PURE__ */ de({
  __name: "date-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n;
    function o(v) {
      return typeof v == "string" ? v : "";
    }
    const a = z(o(r.modelValue));
    function s(v) {
      if (!v || !je(v))
        return;
      const [C, R, H] = v.split("-").map(Number), ue = new Date(2e3, R - 1, H);
      return ue.setFullYear(C), ue;
    }
    function l(v) {
      return v === null || v < Qt ? null : s(v) ?? null;
    }
    let d = je(a.value) ? a.value : null;
    const c = ea(l(d));
    function u(v, C = !1) {
      const R = (l(v)?.getTime() ?? null) !== (l(d)?.getTime() ?? null);
      d = v, !(!R && !C) && (c.value = l(v) ?? (c.value === null ? void 0 : null), T());
    }
    let p = a.value;
    function m(v) {
      p = v, i("update:modelValue", v);
    }
    const g = z(null);
    function S() {
      return g.value?.$el?.querySelector("input") ?? null;
    }
    function x() {
      const v = S();
      v && v.value !== a.value && (v.value = a.value);
    }
    function T() {
      Ve(x);
    }
    Nt(x), ce(() => r.modelValue, (v) => {
      const C = o(v);
      C !== p && (p = C, a.value = C, u(je(C) ? C : null, !0));
    });
    const A = B(() => {
      const v = r.field.min;
      return v && je(v) && v > Qt ? v : Qt;
    }), _ = B(() => {
      const v = r.field.max;
      return v && je(v) && v < vo ? v : vo;
    }), k = B(() => s(A.value)), E = B(() => s(_.value));
    let w = !1;
    function O() {
      w = !0, queueMicrotask(() => {
        w = !1;
      });
    }
    const $ = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/;
    function V(v) {
      const C = $.exec(v);
      if (!C)
        return v;
      const R = `${C[1].padStart(4, "0")}-${C[2].padStart(2, "0")}-${C[3].padStart(2, "0")}`;
      return je(R) ? R : v;
    }
    function Z(v) {
      a.value = v.target.value;
      const C = V(a.value);
      je(C) ? u(C, w) : C.trim() === "" ? u(null, w) : w && u(d, !0), m(C);
    }
    function K(v) {
      const C = (R, H) => String(R).padStart(H, "0");
      return `${C(v.getFullYear(), 4)}-${C(v.getMonth() + 1, 2)}-${C(v.getDate(), 2)}`;
    }
    function U(v) {
      const C = K(v);
      !je(C) || C < Qt || (a.value = C, u(C, !0), m(C));
    }
    function Y(v) {
      const C = v.target;
      !(C instanceof HTMLInputElement) || r.disabled || C.getAttribute("aria-expanded") === "true" || !window.matchMedia("(pointer: coarse)").matches || v.currentTarget.querySelector('button[aria-haspopup="dialog"]')?.click();
    }
    function te() {
      a.value = V(a.value), T();
    }
    const re = M("field-input", "date"), ae = M("field-calendar");
    function Q() {
      const v = S();
      if (!v)
        return;
      v.getRootNode().activeElement?.closest(`.${ae.class}`) && v.focus({ preventScroll: !0 });
    }
    function P(v) {
      const C = v.currentTarget, R = C.getRootNode();
      if (v.code !== "Tab" || !(R instanceof ShadowRoot))
        return;
      const H = Array.from(C.querySelectorAll(zp)), ue = H.indexOf(R.activeElement), Ee = H[(ue + (v.shiftKey ? -1 : 1) + H.length) % H.length];
      Ee && (v.preventDefault(), v.stopPropagation(), Ee.focus());
    }
    const q = z(null);
    function X(v) {
      return {
        pcInputText: {
          root: {
            value: a.value,
            "aria-describedby": v,
            "aria-required": r.field.required ? "true" : void 0
          }
        },
        panel: {
          part: ae.part,
          class: ae.class,
          onKeydownCapture: P
        }
      };
    }
    return t({ focusFirstControl: () => q.value?.focusFirstControl() }), (v, C) => (f(), L(jt, {
      ref_key: "shell",
      ref: q,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: G(({ id: R, describedBy: H, invalid: ue }) => [
        j(h(Ti), b({
          ref_key: "picker",
          ref: g,
          "model-value": c.value,
          "input-id": R,
          "update-model-type": "string",
          "date-format": "yy-mm-dd",
          placeholder: "YYYY-MM-DD",
          "min-date": k.value,
          "max-date": E.value,
          disabled: e.disabled,
          invalid: ue,
          pt: X(H)
        }, h(re), {
          "show-on-focus": !1,
          "show-icon": "",
          size: "small",
          fluid: "",
          "onUpdate:modelValue": O,
          onDateSelect: U,
          onClick: Y,
          onInput: Z,
          onBlur: te,
          onHide: Q
        }), null, 16, ["model-value", "input-id", "min-date", "max-date", "disabled", "invalid", "pt"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), Up = /* @__PURE__ */ de({
  __name: "input-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n;
    function o() {
      return new Intl.NumberFormat(void 0).formatToParts(1.1).find((p) => p.type === "decimal")?.value === ".";
    }
    function a(p) {
      return p.min !== void 0 && p.min >= 0 ? p.integer ? "numeric" : o() ? "decimal" : "text" : "text";
    }
    const s = B(() => {
      switch (r.field.type) {
        case "email":
          return { type: "email", inputmode: "email", autocomplete: "off", autocapitalize: "off", spellcheck: "false" };
        case "number":
          return { type: "text", inputmode: a(r.field), autocomplete: "off", spellcheck: "false" };
        default:
          return { type: "text" };
      }
    }), l = B(() => r.field.type === "text" ? r.field.placeholder : void 0), d = B(() => typeof r.modelValue == "string" ? r.modelValue : ""), c = M("field-input"), u = z(null);
    return t({ focusFirstControl: () => u.value?.focusFirstControl() }), (p, m) => (f(), L(jt, {
      ref_key: "shell",
      ref: u,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: G(({ id: g, describedBy: S, invalid: x }) => [
        j(h(mn), b(s.value, {
          id: g,
          "model-value": d.value,
          placeholder: l.value,
          disabled: e.disabled,
          invalid: x,
          "aria-describedby": S,
          "aria-required": e.field.required ? "true" : void 0,
          part: h(c).part,
          class: h(c).class,
          size: "small",
          fluid: "",
          "onUpdate:modelValue": m[0] || (m[0] = (T) => i("update:modelValue", String(T ?? "")))
        }), null, 16, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var Yp = `
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
`, qp = {
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
}, Kp = oe.extend({
  name: "textarea",
  style: Yp,
  classes: qp
}), Wp = {
  name: "BaseTextarea",
  extends: Rt,
  props: {
    autoResize: Boolean
  },
  style: Kp,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function It(e) {
  "@babel/helpers - typeof";
  return It = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, It(e);
}
function Gp(e, t, n) {
  return (t = Zp(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zp(e) {
  var t = Qp(e, "string");
  return It(t) == "symbol" ? t : t + "";
}
function Qp(e, t) {
  if (It(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (It(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wr = {
  name: "Textarea",
  extends: Wp,
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
        var t = this.$el.style.height, n = parseInt(t) || 0, r = this.$el.scrollHeight, i = !n || r > n, o = n && r < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : i && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return b(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ke(Gp({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Xp = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Jp(e, t, n, r, i, o) {
  return f(), y("textarea", b({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Xp);
}
wr.render = Jp;
const ef = /* @__PURE__ */ de({
  __name: "textarea-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = B(() => typeof r.modelValue == "string" ? r.modelValue : ""), a = M("field-input"), s = z(null);
    return t({ focusFirstControl: () => s.value?.focusFirstControl() }), (l, d) => (f(), L(jt, {
      ref_key: "shell",
      ref: s,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: G(({ id: c, describedBy: u, invalid: p }) => [
        j(h(wr), {
          id: c,
          "model-value": o.value,
          placeholder: e.field.placeholder,
          disabled: e.disabled,
          invalid: p,
          "aria-describedby": u,
          "aria-required": e.field.required ? "true" : void 0,
          part: h(a).part,
          class: ie(h(a).class),
          rows: "3",
          "auto-resize": "",
          fluid: "",
          "onUpdate:modelValue": d[0] || (d[0] = (m) => i("update:modelValue", String(m ?? "")))
        }, null, 8, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), kr = /* @__PURE__ */ de({
  __name: "form-field",
  props: {
    field: {},
    modelValue: { type: [String, Object, Array, Number, Boolean] },
    errors: {},
    disabled: { type: Boolean },
    readonly: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { expose: t, emit: n }) {
    const r = n, i = z(null);
    return t({
      focusFirstControl: () => i.value?.focusFirstControl(),
      // Only a choice field has an Other box; any other type falls back to its control.
      focusOtherText() {
        i.value?.focusOtherText ? i.value.focusOtherText() : i.value?.focusFirstControl();
      }
    }), (o, a) => e.field.type === "choice" ? (f(), L(sc, {
      key: 0,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[0] || (a[0] = (s) => r("update:modelValue", s))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "text" || e.field.type === "email" || e.field.type === "number" ? (f(), L(Up, {
      key: 1,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[1] || (a[1] = (s) => r("update:modelValue", s))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "textarea" ? (f(), L(ef, {
      key: 2,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[2] || (a[2] = (s) => r("update:modelValue", s))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "date" ? (f(), L(Hp, {
      key: 3,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[3] || (a[3] = (s) => r("update:modelValue", s))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "checkbox" ? (f(), L(Nd, {
      key: 4,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[4] || (a[4] = (s) => r("update:modelValue", s))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : D("", !0);
  }
});
var tf = `
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
`, nf = {
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
}, rf = oe.extend({
  name: "message",
  style: tf,
  classes: nf
}), of = {
  name: "BaseMessage",
  extends: dt,
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
  style: rf,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Vt(e) {
  "@babel/helpers - typeof";
  return Vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Vt(e);
}
function go(e, t, n) {
  return (t = af(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function af(e) {
  var t = sf(e, "string");
  return Vt(t) == "symbol" ? t : t + "";
}
function sf(e, t) {
  if (Vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pi = {
  name: "Message",
  extends: of,
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
      return ke(go(go({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: sr
  },
  components: {
    TimesIcon: yr
  }
};
function Lt(e) {
  "@babel/helpers - typeof";
  return Lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Lt(e);
}
function yo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function wo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? yo(Object(n), !0).forEach(function(r) {
      lf(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : yo(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function lf(e, t, n) {
  return (t = uf(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function uf(e) {
  var t = df(e, "string");
  return Lt(t) == "symbol" ? t : t + "";
}
function df(e, t) {
  if (Lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var cf = ["data-p"], pf = ["data-p"], ff = ["data-p"], mf = ["aria-label", "data-p"], hf = ["data-p"];
function bf(e, t, n, r, i, o) {
  var a = Fe("TimesIcon"), s = er("ripple");
  return f(), L($o, b({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: G(function() {
      return [i.visible ? (f(), y("div", b({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, e.ptm("root")), [I("div", b({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? F(e.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (f(), y("div", b({
        key: 1,
        class: e.cx("content"),
        "data-p": o.dataP
      }, e.ptm("content")), [F(e.$slots, "icon", {
        class: ie(e.cx("icon"))
      }, function() {
        return [(f(), L(ve(e.icon ? "span" : null), b({
          class: [e.cx("icon"), e.icon],
          "data-p": o.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (f(), y("div", b({
        key: 0,
        class: e.cx("text"),
        "data-p": o.dataP
      }, e.ptm("text")), [F(e.$slots, "default")], 16, ff)) : D("", !0), e.closable ? Qe((f(), y("button", b({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(l) {
          return o.close(l);
        }),
        "data-p": o.dataP
      }, wo(wo({}, e.closeButtonProps), e.ptm("closeButton"))), [F(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (f(), y("i", b({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, hf)) : (f(), L(a, b({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, mf)), [[s]]) : D("", !0)], 16, pf))], 16)], 16, cf)) : D("", !0)];
    }),
    _: 3
  }, 16);
}
Pi.render = bf;
const vf = { class: "flex items-center gap-2" }, ze = /* @__PURE__ */ de({
  __name: "form-message",
  props: {
    severity: {},
    retry: { type: Boolean }
  },
  emits: ["retry"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, i) => (f(), L(h(Pi), {
      severity: e.severity,
      closable: !1
    }, {
      default: G(() => [
        I("div", vf, [
          I("span", {
            class: ie(h(qu)(e.severity))
          }, [
            F(r.$slots, "default")
          ], 2),
          e.retry ? (f(), L(h(He), {
            key: 0,
            type: "button",
            link: "",
            size: "small",
            onClick: i[0] || (i[0] = (o) => n("retry"))
          }, {
            default: G(() => [...i[1] || (i[1] = [
              fe(" Retry ", -1)
            ])]),
            _: 1
          })) : D("", !0)
        ])
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Ft = /* @__PURE__ */ de({
  __name: "question-card-heading",
  props: {
    definition: {},
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), y("div", null, [
      I("h2", he(Pe(h(M)("title"))), [
        j(h(Le), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        fe(" " + N(e.definition.title), 1)
      ], 16),
      e.definition.description ? (f(), y("p", he(b({ key: 0 }, h(M)("form-description"))), [
        j(Ue, {
          text: e.definition.description
        }, null, 8, ["text"])
      ], 16)) : D("", !0),
      F(t.$slots, "default")
    ]));
  }
}), Sr = /* @__PURE__ */ de({
  __name: "question-card-send-button",
  props: {
    name: {},
    label: {},
    blocked: { type: Boolean },
    nothingToSend: { type: Boolean },
    describedBy: {},
    type: {},
    sending: { type: Boolean }
  },
  emits: ["send"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function i() {
      n.blocked || r("send");
    }
    return (o, a) => (f(), L(h(He), b({
      type: e.type ?? "button"
    }, h(M)(e.name, e.sending && "sending"), {
      class: e.blocked && "p-disabled",
      "data-focus": e.name,
      "aria-describedby": e.describedBy,
      "aria-disabled": e.blocked ? "true" : void 0,
      disabled: e.nothingToSend,
      onClick: i
    }), {
      default: G(() => [
        fe(N(e.label) + " ", 1),
        j(h(Le), {
          icon: e.sending ? "tabler:loader-2" : "tabler:send-2",
          "aria-hidden": "true",
          class: ie(e.sending && "animate-spin motion-reduce:animate-none")
        }, null, 8, ["icon", "class"])
      ]),
      _: 1
    }, 16, ["type", "class", "data-focus", "aria-describedby", "aria-disabled", "disabled"]));
  }
}), gf = ["part", "aria-busy"], yf = {
  role: "status",
  class: "sr-only"
}, wf = ["part"], kf = ["part"], Sf = /* @__PURE__ */ de({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = [], a = { root: { role: void 0, "aria-live": void 0, "aria-atomic": void 0 } }, s = Jn(
      ui(r.state.definition, r.state.data)
    ), l = uo(r.state.definition, s), d = z({}), c = z([]), u = {}, p = z(null), m = z(null), g = z("");
    let S = !1;
    function x(P, q) {
      u[P] = q;
    }
    const T = B(() => r.submitting || !!r.offline);
    function A(P, q = []) {
      const X = r.state.definition.fields.find((v) => P.includes(v.id))?.id;
      X && Ve(() => {
        const v = u[X];
        q.includes(X) ? v?.focusOtherText() : v?.focusFirstControl();
      });
    }
    function _(P) {
      return P === 1 ? "1 question needs attention." : `${P} questions need attention.`;
    }
    const k = B(() => {
      const P = [], q = Object.keys(d.value).length;
      q > 0 && P.push(_(q));
      for (const X of c.value)
        P.push(X.message);
      return P.join(" ");
    });
    function E() {
      S = !0, g.value = k.value;
    }
    ce(k, (P) => {
      S && (g.value = P, P === "" && (S = !1));
    });
    function w() {
      p.value && fi(p.value) && m.value?.$el?.focus();
    }
    function O(P, q) {
      const X = {}, v = [];
      for (const [R, H] of Object.entries(P ?? {}))
        r.state.definition.fields.some((ue) => ue.id === R) ? X[R] = H : v.push(...H);
      d.value = X, c.value = [...q ?? [], ...v];
      const C = Object.keys(d.value);
      A(C), C.length === 0 && Ve(w), k.value !== "" && E();
    }
    let $ = null;
    function V() {
      $ && clearTimeout($), $ = null;
    }
    ta(V), ce(() => r.submitting, (P) => {
      if (V(), !P) {
        g.value === Rn && (g.value = "");
        return;
      }
      d.value = {}, c.value = [], S = !1, g.value = "", $ = setTimeout(() => {
        $ = null, g.value = Rn;
      }, Wu);
    });
    function Z(P, q) {
      if (s[P] = q, Te(d.value, P)) {
        const { [P]: X, ...v } = d.value;
        d.value = v;
      }
    }
    function K() {
      return li(r.state.definition, s);
    }
    function U() {
      if (T.value)
        return;
      const P = Tu(r.state.definition, s), q = Object.keys(P);
      if (q.length > 0) {
        d.value = P, c.value = [];
        const X = q.filter((v) => P[v].some(oi));
        A(q, X), E();
        return;
      }
      d.value = {}, c.value = [], i("submit", K());
    }
    ce(() => r.banner, (P) => {
      P && (S = !1, g.value = P.message, Ve(w));
    });
    const Y = M("card"), te = M("fields"), re = M("notice"), ae = M("fields-error"), Q = B(() => r.submitting ? Ku : r.state.definition.submit_label || "Submit");
    return t({
      setServerErrors: O,
      retry: U,
      // See QuestionCardActive's own `hasUnsentInput` — a form the user changed
      // counts as unsent input a background "answered elsewhere" swap would
      // otherwise silently discard without explanation. An untouched form does
      // not, even one whose controls start filled from defaults or a checkbox.
      hasUnsentInput: () => uo(r.state.definition, s) !== l
    }), (P, q) => (f(), y("form", {
      ref_key: "formEl",
      ref: p,
      part: `${h(Y).part} ${h(te).part}`,
      class: ie(`w-form ${h(Y).class} ${h(te).class}`),
      "aria-busy": e.submitting ? "true" : void 0,
      novalidate: "",
      onSubmit: Co(U, ["prevent"])
    }, [
      I("div", yf, N(g.value), 1),
      e.offline ? (f(), y("p", {
        key: 0,
        role: "status",
        part: h(re).part,
        class: ie(h(re).class)
      }, N(h(ti)), 11, wf)) : D("", !0),
      j(Ft, {
        definition: e.state.definition,
        icon: "tabler:messages"
      }, {
        default: G(() => [
          e.state.stale ? (f(), y("p", he(b({ key: 0 }, h(re))), N(h(ni)), 17)) : D("", !0)
        ]),
        _: 1
      }, 8, ["definition"]),
      (f(!0), y(J, null, be(e.state.definition.fields, (X) => (f(), L(kr, {
        key: X.id,
        ref_for: !0,
        ref: (v) => x(X.id, v),
        field: X,
        "model-value": h(Te)(s, X.id),
        errors: h(Te)(d.value, X.id) ?? o,
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (v) => Z(X.id, v)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      c.value.length > 0 ? (f(), y("ul", {
        key: 1,
        part: h(ae).part,
        class: ie(`${h(ae).class} ${h(tt)}`)
      }, [
        (f(!0), y(J, null, be(c.value, (X, v) => (f(), y("li", { key: v }, N(X.message), 1))), 128))
      ], 10, kf)) : D("", !0),
      e.banner ? (f(), L(ze, {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        pt: a,
        onRetry: q[0] || (q[0] = (X) => i("retry"))
      }, {
        default: G(() => [
          fe(N(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : D("", !0),
      I("div", null, [
        j(Sr, {
          ref_key: "submitButton",
          ref: m,
          name: "send",
          type: "submit",
          label: Q.value,
          blocked: T.value,
          sending: e.submitting
        }, null, 8, ["label", "blocked", "sending"])
      ])
    ], 42, gf));
  }
}), xf = ["part"], $f = /* @__PURE__ */ de({
  __name: "form-notice",
  props: {
    definition: {},
    severity: {},
    message: {}
  },
  setup(e) {
    const t = M("card", "unsupported"), n = M("fields");
    return (r, i) => (f(), y("div", {
      part: `${h(t).part} ${h(n).part}`,
      class: ie(`w-form ${h(t).class} ${h(n).class}`)
    }, [
      j(Ft, {
        definition: e.definition,
        icon: "tabler:messages"
      }, null, 8, ["definition"]),
      (f(!0), y(J, null, be(e.definition.fields, (o) => (f(), L(kr, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      j(ze, { severity: e.severity }, {
        default: G(() => [
          fe(N(e.message), 1)
        ]),
        _: 1
      }, 8, ["severity"])
    ], 10, xf));
  }
}), Cf = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], Tf = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,30}))?)?([zZ]|[+-]\d{2}(?::?\d{2})?)?)?$/, Pf = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, at = 60 * 1e3, Ef = 1440 * at;
function Of(e) {
  if (/^z$/i.test(e))
    return 0;
  const t = e.slice(1).replace(":", ""), n = Number(t.slice(0, 2)), r = Number(t.slice(2, 4) || 0);
  if (n > 23 || r > 59)
    return null;
  const i = n * 60 + r;
  return e.startsWith("-") ? -i : i;
}
function Ei(e, t) {
  const n = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: t
  }).formatToParts(e), r = (i) => Number(n.find((o) => o.type === i)?.value);
  return { year: r("year"), month: r("month"), day: r("day"), hour: r("hour"), minute: r("minute"), second: r("second") };
}
function Pn(e, t) {
  const n = Ei(e, t), r = Date.UTC(n.year, n.month - 1, n.day, n.hour, n.minute, n.second);
  return Math.round((r - Math.floor(e / 1e3) * 1e3) / at);
}
function ko(e, t) {
  const n = Pn(e, t);
  let r = e - n * at;
  const i = Pn(r, t);
  if (n === i)
    return r;
  r -= (i - n) * at;
  const o = Pn(r, t);
  return i === o ? r : e - Math.min(i, o) * at;
}
function So(e, t, n) {
  const [r, i, o, a, s, l] = e.map((p) => Number(p ?? 0)), d = t && a === 24 && s === 0 && l === 0 && !/[1-9]/.test(n ?? ""), c = Date.UTC(r, i - 1, o, d ? 0 : a, s, l), u = new Date(c);
  return u.getUTCFullYear() !== r || u.getUTCMonth() !== i - 1 || u.getUTCDate() !== o || u.getUTCHours() !== (d ? 0 : a) || u.getUTCMinutes() !== s || u.getUTCSeconds() !== l ? null : d ? c + Ef : c;
}
function Mf(e, t) {
  if (!e)
    return null;
  let n;
  const r = Tf.exec(e), i = r ? null : Pf.exec(e);
  if (r) {
    const s = So(r.slice(1, 7), !0, r[7]);
    if (s === null)
      return null;
    const l = r[8] ? Of(r[8]) : void 0;
    if (l === null)
      return null;
    n = l === void 0 ? ko(s, t) : s - l * at;
  } else if (i) {
    const s = So(i.slice(1, 7), !1, void 0);
    if (s === null)
      return null;
    n = ko(s, t);
  } else
    return null;
  const o = Ei(n, t), a = (s) => String(s).padStart(2, "0");
  return `${Cf[o.month - 1]} ${o.day}, ${o.year} ${a(o.hour)}:${a(o.minute)}`;
}
const Df = { key: 0 }, Af = { key: 1 }, _f = { key: 2 }, If = { key: 3 }, Vf = { key: 4 }, Oi = /* @__PURE__ */ de({
  __name: "form-answered-status",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = B(() => Mf(n.state.submitted_at)), i = z(null);
    return t({
      /** Moves focus to the status line after a send, so focus is not lost when the form swaps to its answered view. */
      focus() {
        i.value?.focus();
      }
    }), (o, a) => (f(), y("div", b({
      ref_key: "statusEl",
      ref: i,
      tabindex: "-1"
    }, h(M)("status")), [
      e.state.late ? (f(), y("p", Df, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : D("", !0),
      e.state.delivery === "pending" ? (f(), y("p", Af, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (f(), y("p", _f, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (f(), y("p", If, " The assistant stopped before answering. Send a message to continue. ")) : D("", !0),
      r.value ? (f(), y("p", Vf, " Answered " + N(r.value), 1)) : D("", !0)
    ], 16));
  }
}), Lf = ["part"], Nf = /* @__PURE__ */ de({
  __name: "idle-form",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = z(null), r = M("card", "answered"), i = M("fields");
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        n.value?.focus();
      }
    }), (o, a) => (f(), y("div", {
      part: `${h(r).part} ${h(i).part}`,
      class: ie(`w-form ${h(r).class} ${h(i).class}`)
    }, [
      j(Ft, {
        definition: e.state.definition,
        icon: "tabler:circle-check"
      }, null, 8, ["definition"]),
      (f(!0), y(J, null, be(e.state.definition.fields, (s) => (f(), L(kr, {
        key: s.id,
        field: s,
        "model-value": h(Te)(e.state.data, s.id),
        errors: [],
        disabled: !1,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      j(Oi, {
        ref_key: "statusRef",
        ref: n,
        state: e.state
      }, null, 8, ["state"])
    ], 10, Lf));
  }
});
function ht(e) {
  return `opt-${e}`;
}
function Qn(e) {
  return `note-${e}`;
}
function Mi(e) {
  return `review-item-${e}`;
}
function Di(e) {
  return e?.startsWith("opt-") ? Number(e.slice(4)) : -1;
}
const Xn = 9;
function Bf(e, t, n) {
  const r = e.fields.length, i = r > 1, o = /* @__PURE__ */ new Set([0]), a = z(0), s = z(!1), l = z(""), d = z(""), c = z(null), u = z(0), p = ui(e, t), m = Jn(
    Object.fromEntries(e.fields.map((v) => {
      const C = Te(p, v.id), R = v.options.filter((qe) => cr(C, qe.value)).map((qe) => qe.value), H = /* @__PURE__ */ new Map();
      for (const qe of R) {
        const zt = fr(C, qe);
        zt && H.set(qe, zt);
      }
      const ue = pr(C), Ee = Tt(C), hn = R.length > 0 || ue && ge(Ee) !== "", bn = { chosen: R, other: Ee, useOther: ue, notes: H, noteOpen: null, done: hn };
      return [v.id, bn];
    }))
  );
  function g(v) {
    return m[v.id];
  }
  function S(v) {
    const C = g(v);
    return v.multiple ? C.chosen.length > 0 || ge(C.other) !== "" : C.chosen.length > 0 || C.useOther && ge(C.other) !== "";
  }
  function x(v) {
    return g(v).done && S(v);
  }
  const T = B(() => i && a.value === r), A = B(() => T.value ? null : e.fields[a.value] ?? null), _ = B(
    () => e.fields.map((v, C) => ({ field: v, index: C })).filter(({ field: v }) => v.required && !x(v))
  );
  let k;
  function E(v) {
    clearTimeout(k), d.value = "", k = setTimeout(() => {
      d.value = v;
    }, 30);
  }
  function w() {
    clearTimeout(k), d.value = "";
  }
  function O(v) {
    c.value = v, u.value++;
  }
  function $(v) {
    const C = Math.min(v.options.length + (v.allow_other ? 1 : 0), Xn), R = C > 1 ? `1–${C}` : "1", H = Math.min(v.options.length, Xn), ue = H > 1 ? `Shift+1–${H}` : "Shift+1", Ee = i ? " ← and → change questions." : "";
    return v.multiple ? `${R} ticks, ${ue} adds a note, Enter sends.${Ee}` : `${R} answers, ${ue} adds a note first.${Ee}`;
  }
  function V(v) {
    const C = g(v), R = (H) => ({ value: H, note: C.notes.get(H) ?? "" });
    return v.multiple ? [...C.chosen.map(R), { other: C.other }] : C.useOther ? { other: C.other } : C.chosen[0] ? R(C.chosen[0]) : void 0;
  }
  function Z(v) {
    return x(v) ? br(v, si(v, V(v))) : null;
  }
  function K() {
    const v = {};
    for (const C of e.fields)
      x(C) && (v[C.id] = V(C));
    return li(e, v);
  }
  function U(v, C = "first") {
    const R = A.value;
    R && R.multiple && !g(R).done && S(R) && (g(R).done = !0);
    const H = i ? r : r - 1;
    if (a.value = Math.max(0, Math.min(v, H)), l.value = "", T.value || o.add(a.value), T.value) {
      const ue = _.value[0];
      O(ue ? Mi(ue.index) : "send-all");
    } else
      O(C);
    E(T.value ? "Review your answers" : `Question ${a.value + 1} of ${r}`);
  }
  function Y() {
    _.value.length > 0 || n(K());
  }
  function te(v) {
    if (g(v).done = !0, l.value = "", !i) {
      n(K());
      return;
    }
    const C = e.fields.findIndex((R, H) => H > a.value && !o.has(H));
    U(C === -1 ? r : C);
  }
  function re(v, C) {
    const R = g(v);
    if (C >= v.options.length) {
      O("other");
      return;
    }
    const H = v.options[C].value;
    if (R.noteOpen === H && !v.multiple) {
      O(Qn(H));
      return;
    }
    if (v.multiple) {
      R.chosen = R.chosen.includes(H) ? R.chosen.filter((ue) => ue !== H) : [...R.chosen, H], S(v) || (R.done = !1), l.value = "", O(ht(C)), E(R.chosen.includes(H) ? "Ticked" : "Unticked");
      return;
    }
    R.chosen = [H], R.useOther = !1, te(v);
  }
  function ae(v, C, R = !1) {
    const H = g(v);
    H.noteOpen === C && !R ? (H.noteOpen = null, O(ht(v.options.findIndex((ue) => ue.value === C)))) : (H.noteOpen = C, O(Qn(C)));
  }
  function Q(v, C, R) {
    g(v).notes.set(C, R);
  }
  function P(v, C) {
    const R = g(v);
    R.noteOpen = null;
    const H = ht(v.options.findIndex((ue) => ue.value === C));
    if (v.multiple) {
      R.chosen.includes(C) || (R.chosen = [...R.chosen, C]), O(H), E("Note saved");
      return;
    }
    R.chosen = [C], R.useOther = !1, O(H), te(v);
  }
  function q(v, C) {
    g(v).other = C, l.value = "";
  }
  function X(v) {
    const C = g(v), R = ge(C.other);
    if (v.multiple) {
      if (!R && C.chosen.length === 0) {
        v.required && (l.value = ei);
        return;
      }
    } else {
      if (!R) {
        v.required && (l.value = "Type your answer, or choose another option.");
        return;
      }
      C.useOther = !0, C.chosen = [];
    }
    te(v);
  }
  return {
    n: r,
    multi: i,
    index: a,
    collapsed: s,
    error: l,
    liveMessage: d,
    focusTarget: c,
    focusSeq: u,
    answers: m,
    inReview: T,
    currentQuestion: A,
    missingRequired: _,
    ans: g,
    answerItemsFor: Z,
    keysText: $,
    activate: re,
    toggleNote: ae,
    setNote: Q,
    sendNote: P,
    setOther: q,
    sendOther: X,
    commit: te,
    go: U,
    submitAll: Y,
    requestFocus: O,
    quiet: w,
    buildAnswers: K
  };
}
const Rf = { "aria-hidden": "true" }, jf = { class: "sr-only" }, Ff = ["id"], zf = /* @__PURE__ */ de({
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
    const n = e, r = t, i = B(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), o = B(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), a = B(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (s, l) => (f(), y("div", he(Pe(h(M)("header", !e.multi && "single"))), [
      e.multi ? (f(), y("div", b({ key: 0 }, h(M)("nav"), {
        role: "group",
        "aria-label": "Questions"
      }), [
        j(h(He), b(h(M)("prev"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: l[0] || (l[0] = (d) => r("prev"))
        }), {
          icon: G(() => [
            j(h(Le), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 16, ["disabled"]),
        I("span", he(Pe(h(M)("counter"))), [
          I("span", Rf, N(i.value), 1),
          I("span", jf, N(o.value), 1)
        ], 16),
        j(h(He), b(h(M)("next"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": a.value,
          title: a.value,
          disabled: e.review,
          onClick: l[1] || (l[1] = (d) => r("next"))
        }), {
          icon: G(() => [
            j(h(Le), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 16, ["aria-label", "title", "disabled"])
      ], 16)) : D("", !0),
      I("h3", b(h(M)("question"), { id: e.qid }), [
        e.review ? (f(), y(J, { key: 0 }, [
          fe(" Check your answers, then send them. ")
        ], 64)) : (f(), L(Ue, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 16, Ff),
      I("div", he(Pe(h(M)("actions"))), [
        j(h(He), b(h(M)("collapse"), {
          type: "button",
          text: "",
          size: "small",
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: l[2] || (l[2] = (d) => r("toggle-collapse"))
        }), {
          icon: G(() => [
            j(h(Le), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 16, ["aria-expanded", "aria-label", "title"])
      ], 16)
    ], 16));
  }
});
var Hf = `
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
`, Uf = {
  root: "p-inputgroup"
}, Yf = oe.extend({
  name: "inputgroup",
  style: Hf,
  classes: Uf
}), qf = {
  name: "BaseInputGroup",
  extends: dt,
  style: Yf,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Ai = {
  name: "InputGroup",
  extends: qf,
  inheritAttrs: !1
};
function Kf(e, t, n, r, i, o) {
  return f(), y("div", b({
    class: e.cx("root")
  }, e.ptmi("root")), [F(e.$slots, "default")], 16);
}
Ai.render = Kf;
const _i = /* @__PURE__ */ de({
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
  emits: ["update:modelValue", "send", "blocked", "escape"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function i(o) {
      o.key === "Enter" && !o.shiftKey && !o.isComposing ? (o.preventDefault(), n.enabled ? r("send") : r("blocked")) : o.key === "Escape" && !o.isComposing && (o.preventDefault(), r("escape"));
    }
    return (o, a) => (f(), L(h(Ai), he(Pe(h(M)("composer", e.kind))), {
      default: G(() => [
        j(h(wr), b(h(M)(`${e.kind}-input`), {
          "model-value": e.modelValue,
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": a[0] || (a[0] = (s) => r("update:modelValue", String(s ?? ""))),
          onKeydown: i
        }), null, 16, ["model-value", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        j(h(He), b(h(M)(`${e.kind}-send`), {
          type: "button",
          text: "",
          rounded: "",
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: a[1] || (a[1] = (s) => r("send"))
        }), {
          icon: G(() => [
            j(h(Le), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 16, ["disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 16));
  }
}), Ii = /* @__PURE__ */ de({
  __name: "question-card-length-alert",
  props: {
    max: {}
  },
  setup(e) {
    return (t, n) => (f(), y("p", b(h(M)("error"), {
      class: h(tt),
      role: "alert"
    }), N(h(cn)(e.max)), 17));
  }
}), Wf = ["role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], Gf = { key: 1 }, Zf = /* @__PURE__ */ de({
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
    const n = e, r = t, i = `${Bt()}-note-err`, o = B(() => Et(n.noteTooLong && i, n.describedBy)), a = `${Xe("note-toggle")}, ${Xe("composer")}`;
    function s(u) {
      n.disabled || u.target.closest(a) || r("activate");
    }
    const l = B(() => `${n.note ? "Edit the note on" : "Add a note to"} ${fo(n.option.label)}`), d = B(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), c = B(() => n.multiple ? "Save the note" : "Answer with this note");
    return (u, p) => (f(), y("div", b(h(M)("option", e.selected && "selected", e.note && "has-note", e.editing && "editing"), { onClick: s }), [
      I("div", b(h(M)("option-main"), {
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": h(ht)(e.index),
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }), [
        I("span", he(Pe(h(M)("option-label"))), [
          e.multiple ? (f(), L(h(fn), b({ key: 0 }, h(M)("option-mark"), {
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true"
          }), null, 16, ["model-value"])) : e.selected ? (f(), y("span", b({ key: 1 }, h(M)("option-mark"), { "aria-hidden": "true" }), [
            j(h(Le), { icon: "tabler:check" })
          ], 16)) : D("", !0),
          j(Ue, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 16),
        e.option.description ? (f(), y("span", he(b({ key: 0 }, h(M)("option-description"))), [
          j(Ue, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 16)) : D("", !0),
        e.note && !e.editing ? (f(), y("span", he(b({ key: 1 }, h(M)("option-note"))), [
          j(h(Le), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          I("span", null, N(e.note), 1)
        ], 16)) : D("", !0)
      ], 16, Wf),
      j(h(He), b(h(M)("note-toggle", e.note && "has-note", e.editing && "editing"), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": l.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: p[0] || (p[0] = Co((m) => r("toggle-note"), ["stop"]))
      }), {
        icon: G(() => [
          j(h(Le), { icon: "tabler:note" })
        ]),
        _: 1
      }, 16, ["disabled", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (f(), y("kbd", b({ key: 0 }, h(M)("option-key"), { "aria-hidden": "true" }), N(e.keyLabel), 17)) : (f(), y("span", Gf)),
      e.editing ? (f(), y(J, { key: 2 }, [
        j(_i, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: d.value,
          label: `Note for ${h(fo)(e.option.label)}`,
          "send-label": c.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": o.value,
          "data-focus": h(Qn)(e.option.value),
          "onUpdate:modelValue": p[1] || (p[1] = (m) => r("update:noteDraft", m)),
          onSend: p[2] || (p[2] = (m) => r("send-note")),
          onEscape: p[3] || (p[3] = (m) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (f(), L(Ii, {
          key: 0,
          id: i,
          max: h(an)
        }, null, 8, ["max"])) : D("", !0)
      ], 64)) : D("", !0)
    ], 16));
  }
}), Qf = ["role", "aria-labelledby", "aria-describedby", "aria-invalid"], Xf = { key: 1 }, Jf = /* @__PURE__ */ de({
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
    const t = e, n = B(() => {
      const k = [];
      return t.question.multiple && k.push("Choose any that apply."), t.question.required || k.push("Optional."), k.join(" ");
    }), r = B(() => t.controller.ans(t.question)), i = B(() => t.controller.error.value || t.serverError || "");
    function o(k) {
      return k < Xn ? String(k + 1) : null;
    }
    const a = B(() => o(t.question.options.length));
    function s(k) {
      return r.value.notes.get(k) ?? "";
    }
    const l = B(() => t.question.multiple ? ge(r.value.other) !== "" : r.value.useOther && r.value.done), d = B(() => ge(r.value.other) !== "" || t.question.multiple && r.value.chosen.length > 0), c = B(() => sn(r.value.other, on)), u = `${t.qid}-other-err`, p = `${t.qid}-err`, m = B(() => Et(i.value && p, t.cardErrorIds)), g = B(() => Et(c.value && u, m.value)), S = B(() => c.value || !!i.value);
    function x() {
      !t.disabled && !c.value && t.controller.sendOther(t.question);
    }
    function T(k) {
      k.target.closest(Xe("composer")) || t.controller.requestFocus("other");
    }
    const A = z(0);
    ce(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const k = r.value, E = k.useOther ? -1 : t.question.options.findIndex((w) => w.value === k.chosen[0]);
      A.value = E >= 0 ? E : 0;
    }, { immediate: !0 });
    function _(k) {
      if (t.question.multiple)
        return;
      const E = Di(k.target?.dataset?.focus);
      E >= 0 && (A.value = E);
    }
    return (k, E) => (f(), y(J, null, [
      e.stale ? (f(), y("p", he(b({ key: 0 }, h(M)("notice"))), N(h(ni)), 17)) : D("", !0),
      e.question.description ? (f(), y("p", he(b({ key: 1 }, h(M)("description"))), [
        j(Ue, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 16)) : D("", !0),
      n.value ? (f(), y("p", he(b({ key: 2 }, h(M)("hint"))), N(n.value), 17)) : D("", !0),
      I("div", b(h(M)("options"), {
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": i.value ? p : void 0,
        "aria-invalid": !e.question.multiple && i.value ? "true" : void 0,
        onFocusin: _
      }), [
        (f(!0), y(J, null, be(e.question.options, (w, O) => (f(), L(Zf, {
          key: w.value,
          option: w,
          index: O,
          multiple: e.question.multiple,
          selected: e.question.multiple ? r.value.chosen.includes(w.value) : !r.value.useOther && r.value.chosen[0] === w.value,
          note: h(ge)(s(w.value)),
          editing: r.value.noteOpen === w.value,
          "note-draft": s(w.value),
          "key-label": o(O),
          "note-too-long": h(sn)(s(w.value), h(an)),
          disabled: !!e.disabled,
          "described-by": m.value,
          invalid: !!i.value,
          "roving-tabbable": O === A.value,
          onActivate: ($) => e.controller.activate(e.question, O),
          onToggleNote: ($) => e.controller.toggleNote(e.question, w.value),
          "onUpdate:noteDraft": ($) => e.controller.setNote(e.question, w.value, $),
          onSendNote: ($) => e.controller.sendNote(e.question, w.value),
          onEscapeNote: ($) => e.controller.toggleNote(e.question, w.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (f(), y("div", b({ key: 0 }, h(M)("option", "other", l.value && "selected"), { onClick: T }), [
          j(_i, {
            kind: "other",
            "model-value": r.value.other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: d.value && !e.disabled && !c.value,
            invalid: S.value,
            "described-by": g.value,
            "data-focus": "other",
            "onUpdate:modelValue": E[0] || (E[0] = (w) => e.controller.setOther(e.question, w)),
            onSend: E[1] || (E[1] = (w) => e.controller.sendOther(e.question)),
            onBlocked: x,
            onEscape: E[2] || (E[2] = (w) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          a.value ? (f(), y("kbd", b({ key: 0 }, h(M)("option-key"), { "aria-hidden": "true" }), N(a.value), 17)) : (f(), y("span", Xf)),
          c.value ? (f(), L(Ii, {
            key: 2,
            id: u,
            max: h(on)
          }, null, 8, ["max"])) : D("", !0)
        ], 16)) : D("", !0)
      ], 16, Qf),
      e.question.multiple && !e.question.allow_other ? (f(), y("div", he(b({ key: 3 }, h(M)("footer"))), [
        j(Sr, {
          name: "send",
          label: "Send",
          blocked: e.disabled,
          "nothing-to-send": r.value.chosen.length === 0,
          "described-by": m.value,
          onSend: E[3] || (E[3] = (w) => e.controller.commit(e.question))
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16)) : D("", !0),
      i.value ? (f(), L(ze, b({
        key: 4,
        id: p
      }, h(M)("error"), {
        severity: "error",
        variant: "simple",
        size: "small",
        role: "alert"
      }), {
        default: G(() => [
          fe(N(i.value), 1)
        ]),
        _: 1
      }, 16)) : D("", !0),
      I("p", he(Pe(h(M)("keys"))), N(e.controller.keysText(e.question)), 17)
    ], 64));
  }
}), em = ["data-focus", "onClick"], tm = { class: "sr-only" }, nm = /* @__PURE__ */ de({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = B(() => t.definition.fields.map((i, o) => {
      const a = t.controller.answerItemsFor(i);
      return { field: i, number: o + 1, key: Mi(o), items: a, missing: !a && i.required };
    })), r = B(() => {
      const i = t.controller.missingRequired.value;
      return i.length === 0 ? "" : i.length === 1 ? `Question ${i[0].index + 1} still needs an answer.` : `Questions ${i.map((o) => o.index + 1).join(" and ")} still need answers.`;
    });
    return (i, o) => (f(), y(J, null, [
      I("ol", he(Pe(h(M)("review"))), [
        (f(!0), y(J, null, be(n.value, (a, s) => (f(), y("li", b({
          key: a.field.id
        }, { ref_for: !0 }, h(M)("review-item", a.missing && "missing")), [
          I("button", b({ ref_for: !0 }, h(M)("review-edit"), {
            type: "button",
            "data-focus": a.key,
            onClick: (l) => e.controller.go(s, "first")
          }), [
            I("span", b({ ref_for: !0 }, h(M)("review-number"), { "aria-hidden": "true" }), N(a.number), 17),
            I("span", tm, "Question " + N(a.number) + ": ", 1),
            I("span", b({ ref_for: !0 }, h(M)("review-question")), [
              j(Ue, {
                text: a.field.label
              }, null, 8, ["text"])
            ], 16),
            I("span", b({ ref_for: !0 }, h(M)("review-answer"), {
              class: a.missing && h(tt)
            }), [
              a.items ? (f(), L(gr, {
                key: 0,
                items: a.items
              }, null, 8, ["items"])) : a.field.required ? (f(), y(J, { key: 1 }, [
                fe(" Not answered yet ")
              ], 64)) : (f(), y("span", b({
                key: 2,
                ref_for: !0
              }, h(M)("answer-empty")), "Skipped", 16))
            ], 16),
            o[1] || (o[1] = I("span", { class: "sr-only" }, ". Change the answer.", -1))
          ], 16, em)
        ], 16))), 128))
      ], 16),
      I("div", he(Pe(h(M)("footer"))), [
        r.value ? (f(), y("p", b({ key: 0 }, h(M)("footer-text"), { class: h(tt) }), N(r.value), 17)) : D("", !0),
        j(Sr, {
          name: "send-all",
          label: "Send answers",
          blocked: e.disabled,
          "nothing-to-send": e.controller.missingRequired.value.length > 0,
          "described-by": e.cardErrorIds,
          onSend: o[0] || (o[0] = (a) => e.controller.submitAll())
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16),
      I("p", he(Pe(h(M)("keys"))), " Enter sends. Pick a row to change it. ← goes back to the last question. ", 16)
    ], 64));
  }
}), rm = ["aria-busy"], om = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, im = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, am = {
  "aria-live": "polite",
  class: "sr-only"
}, sm = /* @__PURE__ */ de({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "step-change", "collapsed-change"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = Bf(r.state.definition, r.state.data, (w) => {
      r.offline || r.submitting || i("submit", w);
    }), a = B(() => !!r.offline || r.submitting), s = `${Bt()}-q`, l = z(null);
    ce(o.inReview, (w) => i("step-change", w ? "review" : "active"), { immediate: !0 }), ce(o.collapsed, (w) => i("collapsed-change", w), { immediate: !0 });
    const d = z({}), c = z([]);
    ce(() => r.submitting, (w) => {
      w && (o.quiet(), d.value = {}, c.value = []);
    });
    function u(w) {
      return Te(d.value, w) ?? "";
    }
    const p = B(() => new Set(r.state.definition.fields.map((w) => w.id))), m = B(() => {
      const w = Object.entries(d.value).filter(([O]) => !p.value.has(O)).map(([, O]) => O);
      return [...c.value, ...w].join(" ");
    }), g = `${s}-general-err`, S = `${s}-banner`, x = B(() => Et(m.value && g, r.banner && S));
    ce(
      () => Object.fromEntries(r.state.definition.fields.map((w) => {
        const O = o.ans(w);
        return [w.id, JSON.stringify({ ...O, notes: [...O.notes] })];
      })),
      (w, O) => {
        if (!O)
          return;
        const $ = new Set(
          r.state.definition.fields.map((V) => V.id).filter((V) => w[V] !== O[V] && Te(d.value, V))
        );
        $.size !== 0 && (d.value = Object.fromEntries(
          Object.entries(d.value).filter(([V]) => !$.has(V))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(w, O) {
        const $ = {};
        for (const [Z, K] of Object.entries(w ?? {}))
          $[Z] = K.map((U) => U.message).join(" ");
        d.value = $, c.value = (O ?? []).map((Z) => Z.message);
        const V = r.state.definition.fields.findIndex((Z) => Te($, Z.id));
        V >= 0 ? o.go(V, "first") : Ve(_);
      },
      retry() {
        i("submit", o.buildAnswers());
      },
      /**
       * True when any question has a chosen answer, a note or Other text that was
       * never sent. `wippy-form.vue` reads it when another client answers first, to
       * tell a card that holds a draft from one nothing was entered into.
       */
      hasUnsentInput() {
        return Object.values(o.answers).some(
          (w) => w.chosen.length > 0 || ge(w.other) !== "" || [...w.notes.values()].some((O) => ge(O) !== "")
        );
      }
    });
    const T = `${Xe("option-main")}, ${Xe("other-input")}`;
    function A(w) {
      const O = l.value;
      if (!O)
        return;
      let $ = null;
      if (w === "card" ? $ = O : w === "first" ? $ = O.querySelector(`${Xe("option", "selected")} ${Xe("option-main")}`) ?? O.querySelector(T) : $ = Array.from(O.querySelectorAll("[data-focus]")).find((V) => V.dataset.focus === w) ?? null, !!$ && ($.focus(), $.tagName === "TEXTAREA")) {
        const V = $;
        V.setSelectionRange(V.value.length, V.value.length);
      }
    }
    ce(o.focusSeq, () => {
      Ve(() => {
        const w = o.focusTarget.value;
        w && A(w);
      });
    });
    function _() {
      !l.value || !fi(l.value) || o.requestFocus(o.inReview.value ? "send-all" : "first");
    }
    ce(() => r.banner, (w) => {
      w && Ve(_);
    });
    function k() {
      o.collapsed.value = !o.collapsed.value;
    }
    function E(w) {
      const O = w.composedPath()[0];
      if (O?.tagName === "TEXTAREA" || w.isComposing || w.ctrlKey || w.metaKey || w.altKey || o.collapsed.value || a.value)
        return;
      if (o.inReview.value) {
        w.key === "ArrowLeft" && (w.preventDefault(), o.go(o.n - 1, "first"));
        return;
      }
      const $ = o.currentQuestion.value;
      if (!$)
        return;
      const V = o.ans($), Z = w.shiftKey ? /^Digit([1-9])$/.exec(w.code) : /^([1-9])$/.exec(w.key);
      if (Z) {
        const U = Number(Z[1]) - 1;
        if (U >= $.options.length + ($.allow_other ? 1 : 0))
          return;
        w.preventDefault(), w.shiftKey && U < $.options.length ? o.toggleNote($, $.options[U].value, !0) : o.activate($, U);
        return;
      }
      const K = Di(O?.dataset?.focus);
      if (w.key === "ArrowDown" || w.key === "ArrowUp") {
        const U = Array.from(l.value?.querySelectorAll(T) ?? []);
        if (U.length === 0)
          return;
        w.preventDefault();
        const Y = U.indexOf(O), te = w.key === "ArrowDown" ? (Y + 1) % U.length : Y <= 0 ? U.length - 1 : Y - 1;
        U[te]?.focus();
        return;
      }
      if (o.multi && (w.key === "ArrowRight" || w.key === "ArrowLeft")) {
        w.preventDefault(), o.go(o.index.value + (w.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((w.key === "n" || w.key === "N") && K >= 0) {
        w.preventDefault(), o.toggleNote($, $.options[K].value, !0);
        return;
      }
      if (K >= 0 && (w.key === " " || w.key === "Enter" && !$.multiple)) {
        w.preventDefault(), o.activate($, K);
        return;
      }
      w.key === "Enter" && $.multiple && !O?.matches?.("button") && (w.preventDefault(), V.chosen.length > 0 || ge(V.other) ? o.commit($) : $.required && (o.error.value = ei, o.requestFocus(K >= 0 ? ht(K) : "first")));
    }
    return (w, O) => (f(), y("section", b({
      ref_key: "cardRoot",
      ref: l,
      class: "w-form"
    }, h(M)("card"), {
      role: "group",
      "aria-labelledby": s,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: E
    }), [
      e.offline ? (f(), y("p", om, N(h(ti)), 1)) : D("", !0),
      e.submitting ? (f(), y("p", im, N(h(Rn)), 1)) : D("", !0),
      m.value ? (f(), L(ze, {
        key: 2,
        id: g,
        severity: "error"
      }, {
        default: G(() => [
          fe(N(m.value), 1)
        ]),
        _: 1
      })) : D("", !0),
      j(Ft, {
        definition: e.state.definition,
        icon: "tabler:messages"
      }, null, 8, ["definition"]),
      j(zf, {
        multi: h(o).multi,
        index: h(o).index.value,
        n: h(o).n,
        review: h(o).inReview.value,
        "question-text": h(o).currentQuestion.value?.label ?? "",
        collapsed: h(o).collapsed.value,
        qid: s,
        onPrev: O[0] || (O[0] = ($) => h(o).go(h(o).index.value - 1, "first")),
        onNext: O[1] || (O[1] = ($) => h(o).go(h(o).index.value + 1, "first")),
        onToggleCollapse: k
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (f(), L(ze, {
        key: 3,
        id: S,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        onRetry: O[2] || (O[2] = ($) => i("retry"))
      }, {
        default: G(() => [
          fe(N(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : D("", !0),
      h(o).collapsed.value ? D("", !0) : (f(), y(J, { key: 4 }, [
        h(o).inReview.value ? (f(), L(nm, {
          key: 0,
          definition: e.state.definition,
          controller: h(o),
          "card-error-ids": x.value,
          disabled: a.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : h(o).currentQuestion.value ? (f(), L(Jf, {
          key: 1,
          question: h(o).currentQuestion.value,
          controller: h(o),
          qid: s,
          stale: !!e.state.stale,
          "server-error": u(h(o).currentQuestion.value.id),
          "card-error-ids": x.value,
          disabled: a.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : D("", !0)
      ], 64)),
      I("p", am, N(h(o).liveMessage.value), 1)
    ], 16, rm));
  }
}), lm = ["aria-label"], um = /* @__PURE__ */ de({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = B(() => n.state.definition.fields.map((o) => ({
      field: o,
      items: br(o, Te(n.state.data, o.id))
    }))), i = z(null);
    return t({
      /** Moves focus to the status line after a send, so focus is not lost when the form swaps to this view. */
      focusStatus() {
        i.value?.focus();
      }
    }), (o, a) => (f(), y("section", b({ class: "w-form" }, h(M)("card", "answered"), {
      "aria-label": `${e.state.definition.title}, answered`
    }), [
      j(Ft, {
        definition: e.state.definition,
        icon: "tabler:circle-check"
      }, null, 8, ["definition"]),
      I("dl", he(Pe(h(M)("summary"))), [
        (f(!0), y(J, null, be(r.value, (s) => (f(), y("div", b({
          key: s.field.id
        }, { ref_for: !0 }, h(M)("summary-item")), [
          I("dt", b({ ref_for: !0 }, h(M)("summary-question")), [
            j(Ue, {
              text: s.field.label
            }, null, 8, ["text"])
          ], 16),
          I("dd", b({ ref_for: !0 }, h(M)("summary-answer")), [
            s.items ? (f(), L(gr, {
              key: 0,
              items: s.items
            }, null, 8, ["items"])) : (f(), y("span", b({
              key: 1,
              ref_for: !0
            }, h(M)("answer-empty")), "Skipped", 16))
          ], 16)
        ], 16))), 128))
      ], 16),
      j(Oi, {
        ref_key: "statusRef",
        ref: i,
        state: e.state
      }, null, 8, ["state"])
    ], 16, lm));
  }
}), dm = { class: "max-w-full min-w-0" }, cm = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, pm = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, fm = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, mm = "Could not refresh this form. Showing what you last saw.", hm = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", bm = "This form was answered. Your answer is in the chat.", vm = /* @__PURE__ */ de({
  __name: "wippy-form",
  setup(e) {
    const t = `${Qo} If you already answered it, your answer is in the chat.`, n = Hu(), r = Uu(), i = ju(), o = B(() => n.value.definition), a = B(() => n.value.state), s = B(() => a.value === "idle"), { status: l, state: d, errorMessage: c, reloadError: u, reload: p, refresh: m } = Iu(i, a);
    ql(d, m);
    const { submitting: g, submit: S } = Ru(i), { isOnline: x } = zu(() => p()), T = z(null), A = z(!1);
    let _ = !1;
    ce(i, () => {
      A.value = !1, T.value = null, _ = !1;
    });
    const k = z(null), E = z(null);
    let w = !1;
    ce(() => d.value?.status, (Q, P) => {
      if (!(Q !== "idle" || P !== "active") && !(g.value || _)) {
        if (w) {
          w = !1;
          return;
        }
        k.value?.hasUnsentInput() && (A.value = !0);
      }
    });
    function O(Q) {
      return !!Q?.fields?.some((P) => !Gl(P.type));
    }
    const $ = B(() => {
      const Q = n.value.formVersion;
      if (Q !== void 0 && !so(Q))
        return !0;
      const P = d.value?.form_version;
      return P !== void 0 && !so(P) ? !0 : O(o.value) || O(d.value?.definition);
    }), V = B(() => {
      const Q = d.value;
      return Q && Zl(Q) ? Q : null;
    }), Z = B(() => l.value === "unsupported" ? s.value ? { severity: "secondary", message: bm } : { severity: "warn", message: t } : i.value ? null : { severity: "secondary", message: Xo }), K = z("active"), U = z(!1), Y = B(() => $.value || l.value === "unsupported" ? "unsupported" : d.value === null ? "loading" : d.value.status === "idle" ? "answered" : V.value ? K.value : "active"), te = B(() => !$.value && V.value !== null && d.value?.status === "active" && U.value);
    Fu(Y, te);
    async function re(Q) {
      if (!d.value)
        return;
      T.value = null;
      const P = await S(d.value.form_version, d.value.content_version, Q);
      if (!P.ignored) {
        if (P.ok && P.accepted) {
          const q = P.accepted;
          w = d.value.status !== "idle", d.value = {
            ...d.value,
            status: "idle",
            stale: !1,
            late: q.late,
            content_version: q.content_version,
            data: Q,
            answer_message_id: q.answer_message_id,
            delivery: q.delivery
          }, Ve(() => E.value?.focusStatus()), p();
          return;
        }
        if (P.fieldErrors || P.formErrors) {
          k.value?.setServerErrors(P.fieldErrors, P.formErrors);
          return;
        }
        if (P.code === "network_error" && (_ = !0), P.code === "already_submitted") {
          _ || (A.value = !0), await m(), Ve(() => E.value?.focusStatus());
          return;
        }
        P.shouldReload && p(), T.value = { message: P.message ?? Jt, retryable: P.retryable };
      }
    }
    function ae() {
      k.value?.retry();
    }
    return (Q, P) => (f(), y("div", dm, [
      h(r).length > 0 ? (f(), L(ze, {
        key: 0,
        severity: "error"
      }, {
        default: G(() => [...P[2] || (P[2] = [
          fe(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : o.value?.fields?.length ? $.value ? (f(), L(ze, {
        key: 2,
        severity: "warn"
      }, {
        default: G(() => [...P[4] || (P[4] = [
          fe(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : Z.value ? (f(), L($f, {
        key: 3,
        definition: o.value,
        severity: Z.value.severity,
        message: Z.value.message
      }, null, 8, ["definition", "severity", "message"])) : h(d) ? (f(), y(J, { key: 4 }, [
        h(u) ? (f(), y("p", cm, N(mm))) : D("", !0),
        h(d).status === "active" && V.value ? (f(), L(sm, {
          key: h(d).artifact_id,
          ref_key: "activeRef",
          ref: k,
          state: V.value,
          submitting: h(g),
          banner: T.value,
          offline: !h(x),
          onSubmit: re,
          onRetry: ae,
          onStepChange: P[0] || (P[0] = (q) => {
            K.value = q;
          }),
          onCollapsedChange: P[1] || (P[1] = (q) => {
            U.value = q;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : h(d).status === "active" ? (f(), L(Sf, {
          key: h(d).artifact_id,
          ref_key: "activeRef",
          ref: k,
          state: h(d),
          submitting: h(g),
          banner: T.value,
          offline: !h(x),
          onSubmit: re,
          onRetry: ae
        }, null, 8, ["state", "submitting", "banner", "offline"])) : (f(), y(J, { key: 3 }, [
          A.value ? (f(), y("p", pm, N(hm))) : D("", !0),
          V.value ? (f(), L(um, {
            key: h(d).artifact_id,
            ref_key: "summaryRef",
            ref: E,
            state: V.value
          }, null, 8, ["state"])) : (f(), L(Nf, {
            key: h(d).artifact_id,
            ref_key: "summaryRef",
            ref: E,
            state: h(d)
          }, null, 8, ["state"]))
        ], 64))
      ], 64)) : h(l) === "loading" || h(l) === "idle" ? (f(), y("wippy-loading", fm)) : h(l) === "error" ? (f(), L(ze, {
        key: 6,
        severity: "error",
        retry: "",
        onRetry: h(p)
      }, {
        default: G(() => [
          fe(N(h(c) || h(Jo)), 1)
        ]),
        _: 1
      }, 8, ["onRetry"])) : D("", !0) : (f(), L(ze, {
        key: 1,
        severity: "error"
      }, {
        default: G(() => [...P[3] || (P[3] = [
          fe(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), gm = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.isolate{isolation:isolate}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.inline{display:inline}.flex{display:flex}.min-w-0{min-width:0px}.max-w-full{max-width:100%}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.items-center{align-items:center}.gap-2{gap:.5rem}.rounded{border-radius:.25rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn-700{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-700) calc(100% * var(--tw-text-opacity, 1)),transparent)}.shadow{--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, 14px);--_q-size: var(--wippy-form-question-size, 15px);--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, var(--p-content-background));--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_muted-row: var(--wippy-form-text-muted-on-row, var(--p-text-hover-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 40%, var(--p-content-border-color)));--_row-hover: var(--wippy-form-row-hover, color-mix(in srgb, var(--p-content-border-color) 90%, var(--p-text-color)));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-content-border-color)));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, 10px);--_row-py: var(--wippy-form-row-padding-y, 6px);--_row-px: var(--wippy-form-row-padding-x, 10px);--_gap: var(--wippy-form-gap, 4px);--_key: var(--wippy-form-key-size, 20px);--_field-gap: var(--wippy-form-field-gap, 16px);--_label-weight: var(--wippy-form-label-weight, 500);--_date-width: var(--wippy-form-date-width, 20rem);display:block;container-type:inline-size}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted-row)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted-row);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted-row);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted-row)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted-row);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:var(--_key);height:var(--_key);padding:0 4px;font-family:var(--_font);font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;color:var(--_muted-row);border:1px solid var(--_key-border);border-radius:5px}@supports (text-box: trim-both cap alphabetic){.w-form__option-key{text-box:trim-both cap alphabetic}}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form .w-form__send--sending{pointer-events:auto;cursor:progress}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted-row);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted-row);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted-row);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted-row)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}.w-form__fields{gap:var(--_field-gap)}.w-form__fields-error,.w-form__field-error{list-style:none;margin:0;padding:0;font-size:var(--_small)}.w-form__field{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0;padding:0;border:0}.w-form__field-label{padding:0;font-weight:var(--_label-weight);overflow-wrap:anywhere}.w-form__field--group>.w-form__field-label{margin-bottom:6px}.w-form__field-row,.w-form__field-option{display:flex;align-items:flex-start;gap:8px}.w-form__field--inline .w-form__field-control{flex:none}.w-form__field-description{margin:0;font-size:var(--_small);color:var(--_muted)}.w-form__field-control{min-width:0}.w-form__field-value{margin:0;overflow-wrap:anywhere;white-space:pre-wrap}.w-form__field-value--empty{color:var(--_muted)}.w-form__field-error{display:flex;flex-direction:column;gap:2px}.w-form__field-options{display:flex;flex-direction:column;gap:6px}.w-form__field-option-label{overflow-wrap:anywhere}.w-form__field-option-description{display:block;font-size:var(--_small);color:var(--_muted)}.w-form__field-other{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}.w-form__field-input--date{width:min(100%,var(--_date-width));max-width:100%}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}.motion-reduce\\:animate-none{animation:none}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class ym extends zl {
  static get wippyConfig() {
    return {
      propsSchema: Ul.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: gm
    };
  }
  static get vueConfig() {
    return {
      rootComponent: vm,
      plugins: [hl],
      providers(t, n) {
        t.provide(vr, n);
      }
    };
  }
}
la(import.meta.url, ym);
//# sourceMappingURL=index.js.map
