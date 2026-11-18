import { ref as U, readonly as Ui, getCurrentInstance as yr, onMounted as Nt, nextTick as Ne, watch as le, reactive as Xn, renderSlot as q, openBlock as f, createBlock as N, Teleport as vo, createCommentVNode as A, useId as Bt, mergeProps as b, h as qi, createApp as Yi, inject as ln, onUnmounted as un, computed as P, watchEffect as Ki, createElementBlock as v, createElementVNode as I, createTextVNode as de, toDisplayString as L, resolveComponent as He, resolveDirective as Jn, withDirectives as Je, resolveDynamicComponent as we, withCtx as Q, normalizeClass as z, defineComponent as ce, unref as y, createVNode as F, Fragment as Z, renderList as he, normalizeStyle as Wi, Transition as go, vShow as wr, withKeys as fe, shallowRef as Gi, onBeforeUnmount as Zi, withModifiers as yo, normalizeProps as ve, guardReactiveProps as Ae } from "vue";
import { addCollection as Qi, Icon as Me } from "@iconify/vue";
import * as Xi from "@wippy-fe/proxy";
import { config as kr, addIcons as Ji, on as it, applyThemeMode as zt, host as ea, hostCss as ta, loadCss as na, define as ra } from "@wippy-fe/proxy";
import { getActivePinia as oa, createPinia as ia, setActivePinia as aa } from "pinia";
var sa = Object.defineProperty, Sr = Object.getOwnPropertySymbols, la = Object.prototype.hasOwnProperty, ua = Object.prototype.propertyIsEnumerable, xr = (e, t, n) => t in e ? sa(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, da = (e, t) => {
  for (var n in t || (t = {})) la.call(t, n) && xr(e, n, t[n]);
  if (Sr) for (var n of Sr(t)) ua.call(t, n) && xr(e, n, t[n]);
  return e;
};
function Be(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Tn(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), i = Array.isArray(t), o, a, l;
  if (r && i) {
    if (a = e.length, a != t.length) return !1;
    for (o = a; o-- !== 0; ) if (!Tn(e[o], t[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let s = e instanceof Date, d = t instanceof Date;
  if (s != d) return !1;
  if (s && d) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, u = t instanceof RegExp;
  if (c != u) return !1;
  if (c && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (a = p.length, a !== Object.keys(t).length) return !1;
  for (o = a; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[o])) return !1;
  for (o = a; o-- !== 0; ) if (l = p[o], !Tn(e[l], t[l], n)) return !1;
  return !0;
}
function ca(e, t) {
  return Tn(e, t);
}
function er(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function ue(e) {
  return !Be(e);
}
function $r(e, t) {
  return null;
}
function tr(e, t, n) {
  return n ? $r() === $r() : ca(e, t);
}
function pa(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (tr(e, n)) return !0;
  }
  return !1;
}
function Re(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function wo(e = {}, t = {}) {
  let n = da({}, e);
  return Object.keys(t).forEach((r) => {
    let i = r;
    Re(t[i]) && i in e && Re(e[i]) ? n[i] = wo(e[i], t[i]) : n[i] = t[i];
  }), n;
}
function fa(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : wo(t, n), {});
}
function Te(e, ...t) {
  return er(e) ? e(...t) : e;
}
function $e(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Le(e) {
  return $e(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function nr(e, t = "", n = {}) {
  let r = Le(t).split("."), i = r.shift();
  if (i) {
    if (Re(e)) {
      let o = Object.keys(e).find((a) => Le(a) === i) || "";
      return nr(Te(e[o], n), r.join("."), n);
    }
    return;
  }
  return Te(e, n);
}
function ko(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ma(e) {
  return e instanceof Date;
}
function ha(e) {
  return ue(e) && !isNaN(e);
}
function ba() {
  return new Intl.Collator(void 0, { numeric: !0 }).compare;
}
function tt(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function va(...e) {
  return fa(...e);
}
function ht(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function ga(e) {
  return $e(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function So(e) {
  return $e(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function rr() {
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
        let o = Array.isArray(r) ? [ke(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        t = o.length ? t.concat(o.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function ya(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function wa(e, t) {
  if (e && t) {
    let n = (r) => {
      ya(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function hn(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Pn(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function xo(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], i = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = i.width || e.offsetWidth, t.height = i.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function $o() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], i = e.innerWidth || n.clientWidth || r.clientWidth, o = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function En(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function ka() {
  let e = document.documentElement;
  return (window.pageXOffset || En(e)) - (e.clientLeft || 0);
}
function Sa() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function xa(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function $a(e, t, n = !0) {
  var r, i, o, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : xo(e), s = l.height, d = l.width, c = t.offsetHeight, u = t.offsetWidth, p = t.getBoundingClientRect(), m = Sa(), g = ka(), x = $o(), $, T, _ = "top";
    p.top + c + s > x.height ? ($ = p.top + m - s, _ = "bottom", $ < 0 && ($ = m)) : $ = c + p.top + m, p.left + d > x.width ? T = Math.max(0, p.left + g + u - d) : T = p.left + g, xa(e) ? e.style.insetInlineEnd = T + "px" : e.style.insetInlineStart = T + "px", e.style.top = $ + "px", e.style.transformOrigin = _, n && (e.style.marginTop = _ === "bottom" ? `calc(${(i = (r = Pn(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (a = (o = Pn(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? a : "");
  }
}
function Ca(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Zt(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ta(e, t, n = !0, r = void 0) {
  var i;
  if (e) {
    let o = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : xo(e), a = t.offsetHeight, l = t.getBoundingClientRect(), s = $o(), d, c, u = r ?? "top";
    if (!r && l.top + a + o.height > s.height ? (d = -1 * o.height, u = "bottom", l.top + d < 0 && (d = -1 * l.top)) : d = a, o.width > s.width ? c = l.left * -1 : l.left + o.width > s.width ? c = (l.left + o.width - s.width) * -1 : c = 0, e.style.top = d + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = u, n) {
      let p = (i = Pn(/-anchor-gutter$/)) == null ? void 0 : i.value;
      e.style.marginTop = u === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function or(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Pa(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && or(e));
}
function ut(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Xt(e, t = {}) {
  if (ut(e)) {
    let n = (r, i) => {
      var o, a;
      let l = (o = e?.$attrs) != null && o[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
      return [i].flat().reduce((s, d) => {
        if (d != null) {
          let c = typeof d;
          if (c === "string" || c === "number") s.push(d);
          else if (c === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            s = u.length ? s.concat(u.filter((p) => !!p)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? e.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? Xt(e, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = i), e.setAttribute(r, i));
      }
    });
  }
}
function Ea(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Xt(r, t), r.append(...n), r;
  }
}
function Ke(e, t) {
  return ut(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Oe(e, t) {
  return ut(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Xe(e, t) {
  if (ut(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Cr(e, t = "") {
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
function Tr(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function ct(e) {
  var t;
  if (e) {
    let n = (t = or(e)) == null ? void 0 : t.childNodes, r = 0;
    if (n) for (let i = 0; i < n.length; i++) {
      if (n[i] === e) return r;
      n[i].nodeType === 1 && r++;
    }
  }
  return -1;
}
function Oa(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || En(document.documentElement) || En(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function _a(e, t) {
  return e ? e.offsetHeight : 0;
}
function Co(e, t = []) {
  let n = or(e);
  return n === null ? t : Co(n, t.concat([n]));
}
function Da(e) {
  let t = [];
  if (e) {
    let n = Co(e), r = /(auto|scroll)/, i = (o) => {
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
        let l = a.split(",");
        for (let s of l) {
          let d = Oe(o, s);
          d && i(d) && t.push(d);
        }
      }
      o.nodeType !== 9 && i(o) && t.push(o);
    }
  }
  return t;
}
function Pr(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function To() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Aa() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Po(e, t = "", n) {
  ut(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Ht = {};
function Ma(e = "pui_id_") {
  return Object.hasOwn(Ht, e) || (Ht[e] = 0), Ht[e]++, `${e}${Ht[e]}`;
}
function Ia() {
  let e = [], t = (a, l, s = 999) => {
    let d = i(a, l, s), c = d.value + (d.key === a ? 0 : s) + 1;
    return e.push({ key: a, value: c }), c;
  }, n = (a) => {
    e = e.filter((l) => l.value !== a);
  }, r = (a, l) => i(a).value, i = (a, l, s = 0) => [...e].reverse().find((d) => !0) || { key: a, value: s }, o = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: o, set: (a, l, s) => {
    l && (l.style.zIndex = String(t(a, !0, s)));
  }, clear: (a) => {
    a && (n(o(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var bn = Ia(), Va = Object.defineProperty, La = Object.defineProperties, Na = Object.getOwnPropertyDescriptors, Jt = Object.getOwnPropertySymbols, Eo = Object.prototype.hasOwnProperty, Oo = Object.prototype.propertyIsEnumerable, Er = (e, t, n) => t in e ? Va(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, _e = (e, t) => {
  for (var n in t || (t = {})) Eo.call(t, n) && Er(e, n, t[n]);
  if (Jt) for (var n of Jt(t)) Oo.call(t, n) && Er(e, n, t[n]);
  return e;
}, vn = (e, t) => La(e, Na(t)), Fe = (e, t) => {
  var n = {};
  for (var r in e) Eo.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Jt) for (var r of Jt(e)) t.indexOf(r) < 0 && Oo.call(e, r) && (n[r] = e[r]);
  return n;
}, Ba = rr(), ge = Ba, vt = /{([^}]*)}/g, _o = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Do = /var\([^)]+\)/g;
function Or(e) {
  return $e(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ra(e) {
  return Re(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ja(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function On(e = "", t = "") {
  return ja(`${$e(e, !1) && $e(t, !1) ? `${e}-` : e}${t}`);
}
function Ao(e = "", t = "") {
  return `--${On(e, t)}`;
}
function Fa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Mo(e, t = "", n = "", r = [], i) {
  if ($e(e)) {
    let o = e.trim();
    if (Fa(o)) return;
    if (tt(o, vt)) {
      let a = o.replaceAll(vt, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((d) => !r.some((c) => tt(d, c)));
        return `var(${Ao(n, So(s.join("-")))}${ue(i) ? `, ${i}` : ""})`;
      });
      return tt(a.replace(Do, "0"), _o) ? `calc(${a})` : a;
    }
    return o;
  } else if (ha(e)) return e;
}
function za(e, t, n) {
  $e(t, !1) && e.push(`${t}:${n};`);
}
function at(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Io(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let s = [], d = 0, c = "", u = null, p = 0;
    for (; d <= a.length; ) {
      let m = a[d];
      if ((m === '"' || m === "'" || m === "`") && a[d - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || d === a.length) && p === 0)) {
        let g = c.trim();
        g.startsWith("dt(") ? s.push(Io(g, l)) : s.push(r(g)), c = "", d++;
        continue;
      }
      m !== void 0 && (c += m), d++;
    }
    return s;
  }
  function r(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let i = [], o = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") o.push(a), a += 2;
  else if (e[a] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && i.push([l, a]);
  }
  if (!i.length) return e;
  for (let a = i.length - 1; a >= 0; a--) {
    let [l, s] = i[a], d = e.slice(l + 3, s), c = n(d, t), u = t(...c);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var nt = (...e) => Ha(se.getTheme(), ...e), Ha = (e = {}, t, n, r) => {
  if (t) {
    let { variable: i, options: o } = se.defaults || {}, { prefix: a, transform: l } = e?.options || o || {}, s = tt(t, vt) ? t : `{${t}}`;
    return r === "value" || Be(r) && l === "strict" ? se.getTokenValue(t) : Mo(s, void 0, a, [i.excludedKeyRegex], n);
  }
  return "";
};
function Ut(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, i, o) => {
      var a;
      return r + i + ((a = Te(t[o], { dt: nt })) != null ? a : "");
    }, "");
    return Io(n, nt);
  }
  return Te(e, { dt: nt });
}
function Ua(e, t = {}) {
  let n = se.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: r }];
  for (; s.length; ) {
    let { node: c, path: u } = s.pop();
    for (let p in c) {
      let m = c[p], g = Ra(m), x = tt(p, o) ? On(u) : On(u, So(p));
      if (Re(g)) s.push({ node: g, path: x });
      else {
        let $ = Ao(x), T = Mo(g, x, r, [o]);
        za(l, $, T);
        let _ = x;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let d = l.join("");
  return { value: l, tokens: a, declarations: d, css: at(i, d) };
}
var Ee = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return Ua(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a, l, s, d, c, u;
  let { preset: p, options: m } = t, g, x, $, T, _, V, k;
  if (ue(p) && m.transform !== "strict") {
    let { primitive: E, semantic: w, extend: D } = p, C = w || {}, { colorScheme: R } = C, K = Fe(C, ["colorScheme"]), W = D || {}, { colorScheme: Y } = W, ne = Fe(W, ["colorScheme"]), re = R || {}, { dark: ie } = re, pe = Fe(re, ["dark"]), J = Y || {}, { dark: H } = J, M = Fe(J, ["dark"]), G = ue(E) ? this._toVariables({ primitive: E }, m) : {}, h = ue(K) ? this._toVariables({ semantic: K }, m) : {}, S = ue(pe) ? this._toVariables({ light: pe }, m) : {}, j = ue(ie) ? this._toVariables({ dark: ie }, m) : {}, B = ue(ne) ? this._toVariables({ semantic: ne }, m) : {}, ae = ue(M) ? this._toVariables({ light: M }, m) : {}, Ce = ue(H) ? this._toVariables({ dark: H }, m) : {}, [fn, mn] = [(o = G.declarations) != null ? o : "", G.tokens], [Ye, Ft] = [(a = h.declarations) != null ? a : "", h.tokens || []], [_i, Di] = [(l = S.declarations) != null ? l : "", S.tokens || []], [Ai, Mi] = [(s = j.declarations) != null ? s : "", j.tokens || []], [Ii, Vi] = [(d = B.declarations) != null ? d : "", B.tokens || []], [Li, Ni] = [(c = ae.declarations) != null ? c : "", ae.tokens || []], [Bi, Ri] = [(u = Ce.declarations) != null ? u : "", Ce.tokens || []];
    g = this.transformCSS(e, fn, "light", "variable", m, r, i), x = mn;
    let ji = this.transformCSS(e, `${Ye}${_i}`, "light", "variable", m, r, i), Fi = this.transformCSS(e, `${Ai}`, "dark", "variable", m, r, i);
    $ = `${ji}${Fi}`, T = [.../* @__PURE__ */ new Set([...Ft, ...Di, ...Mi])];
    let zi = this.transformCSS(e, `${Ii}${Li}color-scheme:light`, "light", "variable", m, r, i), Hi = this.transformCSS(e, `${Bi}color-scheme:dark`, "dark", "variable", m, r, i);
    _ = `${zi}${Hi}`, V = [.../* @__PURE__ */ new Set([...Vi, ...Ni, ...Ri])], k = Te(p.css, { dt: nt });
  }
  return { primitive: { css: g, tokens: x }, semantic: { css: $, tokens: T }, global: { css: _, tokens: V }, style: k };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: i, defaults: o, selector: a }) {
  var l, s, d;
  let c, u, p;
  if (ue(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), g = t, { colorScheme: x, extend: $, css: T } = g, _ = Fe(g, ["colorScheme", "extend", "css"]), V = $ || {}, { colorScheme: k } = V, E = Fe(V, ["colorScheme"]), w = x || {}, { dark: D } = w, C = Fe(w, ["dark"]), R = k || {}, { dark: K } = R, W = Fe(R, ["dark"]), Y = ue(_) ? this._toVariables({ [m]: _e(_e({}, _), E) }, n) : {}, ne = ue(C) ? this._toVariables({ [m]: _e(_e({}, C), W) }, n) : {}, re = ue(D) ? this._toVariables({ [m]: _e(_e({}, D), K) }, n) : {}, [ie, pe] = [(l = Y.declarations) != null ? l : "", Y.tokens || []], [J, H] = [(s = ne.declarations) != null ? s : "", ne.tokens || []], [M, G] = [(d = re.declarations) != null ? d : "", re.tokens || []], h = this.transformCSS(m, `${ie}${J}`, "light", "variable", n, i, o, a), S = this.transformCSS(m, M, "dark", "variable", n, i, o, a);
    c = `${h}${S}`, u = [.../* @__PURE__ */ new Set([...pe, ...H, ...G])], p = Te(T, { dt: nt });
  }
  return { css: c, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: a, options: l } = t, s = (o = a?.components) == null ? void 0 : o[e];
  return this.getPreset({ name: e, preset: s, options: l, params: n, set: r, defaults: i });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a;
  let l = e.replace("-directive", ""), { preset: s, options: d } = t, c = ((o = s?.components) == null ? void 0 : o[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: d, params: n, set: r, defaults: i });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: i } = t;
  return i ? `@layer ${Te(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: i, defaults: o }), l = Object.entries(r).reduce((s, [d, c]) => s.push(`${d}="${c}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [d, c]) => {
    if (Re(c) && Object.hasOwn(c, "css")) {
      let u = ht(c.css), p = `${d}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var a;
  let l = { name: e, theme: t, params: n, set: i, defaults: o }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, d = Object.entries(r).reduce((c, [u, p]) => c.push(`${u}="${p}"`) && c, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${ht(s)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", i = {}) {
  let o = function(l, s = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    d.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && vt.test(this.value)) {
      let u = this.value.trim().replace(vt, (p) => {
        var m;
        let g = p.slice(1, -1), x = this.tokens[g];
        if (!x) return console.warn(`Token not found for path: ${g}`), "__UNRESOLVED__";
        let $ = x.computed(l, s, d);
        return Array.isArray($) && $.length === 2 ? `light-dark(${$[0].value},${$[1].value})` : (m = $?.value) != null ? m : "__UNRESOLVED__";
      });
      c = _o.test(u.replace(Do, "0")) ? `calc(${u})` : u;
    }
    return Be(s.binding) && delete s.binding, d.pop(), { colorScheme: l, path: this.path, paths: s, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, s, d) => {
    Object.entries(l).forEach(([c, u]) => {
      let p = tt(c, t.variable.excludedKeyRegex) ? s : s ? `${s}.${Or(c)}` : Or(c), m = d ? `${d}.${c}` : c;
      Re(u) ? a(u, p, m) : (i[p] || (i[p] = { paths: [], computed: (g, x = {}, $ = []) => {
        if (i[p].paths.length === 1) return i[p].paths[0].computed(i[p].paths[0].scheme, x.binding, $);
        if (g && g !== "none") for (let T = 0; T < i[p].paths.length; T++) {
          let _ = i[p].paths[T];
          if (_.scheme === g) return _.computed(g, x.binding, $);
        }
        return i[p].paths.map((T) => T.computed(T.scheme, x[T.scheme], $));
      } }), i[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: i }));
    });
  };
  return a(e, n, r), i;
}, getTokenValue(e, t, n) {
  var r;
  let i = ((l) => l.split(".").filter((s) => !tt(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), o = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[i]) == null ? void 0 : r.computed(o)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let d = s, { colorScheme: c } = d, u = Fe(d, ["colorScheme"]);
    return l[c] = u, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? at(ue(t) ? `${e}${t},${e} ${t}` : e, r) : at(e, at(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, i = {}, o, a, l) {
  if (ue(t)) {
    let { cssLayer: s } = i;
    if (r !== "style") {
      let d = this.getColorSchemeOption(i, a);
      t = n === "dark" ? d.reduce((c, { type: u, selector: p }) => (ue(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, l, u, t)), c), "") : at(l ?? ":root,:host", t);
    }
    if (s) {
      let d = { name: "primeui" };
      Re(s) && (d.name = Te(s.name, { name: e, type: r })), ue(d.name) && (t = at(`@layer ${d.name}`, t), o?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, se = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = vn(_e({}, t), { options: _e(_e({}, this.defaults.options), t.options) }), this._tokens = Ee.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ge.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = vn(_e({}, this.theme), { preset: e }), this._tokens = Ee.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ge.emit("preset:change", e), ge.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = vn(_e({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ge.emit("options:change", e), ge.emit("theme:change", this.theme);
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
  return Ee.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return Ee.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Ee.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Ee.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let i = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Ee.getPreset(i);
}, getLayerOrderCSS(e = "") {
  return Ee.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return Ee.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return Ee.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return Ee.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ge.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ge.emit("theme:load"));
} }, ye = {
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
}, qa = `
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
function gt(e) {
  "@babel/helpers - typeof";
  return gt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gt(e);
}
function _r(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Dr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _r(Object(n), !0).forEach(function(r) {
      Ya(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _r(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ya(e, t, n) {
  return (t = Ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ka(e) {
  var t = Wa(e, "string");
  return gt(t) == "symbol" ? t : t + "";
}
function Wa(e, t) {
  if (gt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (gt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ga(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  yr() && yr().components ? Nt(e) : t ? e() : Ne(e);
}
var Za = 0;
function Qa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), r = U(e), i = U(null), o = To() ? window.document : void 0, a = t.document, l = a === void 0 ? o : a, s = t.immediate, d = s === void 0 ? !0 : s, c = t.manual, u = c === void 0 ? !1 : c, p = t.name, m = p === void 0 ? "style_".concat(++Za) : p, g = t.id, x = g === void 0 ? void 0 : g, $ = t.media, T = $ === void 0 ? void 0 : $, _ = t.nonce, V = _ === void 0 ? void 0 : _, k = t.first, E = k === void 0 ? !1 : k, w = t.onMounted, D = w === void 0 ? void 0 : w, C = t.onUpdated, R = C === void 0 ? void 0 : C, K = t.onLoad, W = K === void 0 ? void 0 : K, Y = t.props, ne = Y === void 0 ? {} : Y, re = function() {
  }, ie = function(H) {
    var M = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var G = Dr(Dr({}, ne), M), h = G.name || m, S = G.id || x, j = G.nonce || V;
      i.value = l.querySelector('style[data-primevue-style-id="'.concat(h, '"]')) || l.getElementById(S) || l.createElement("style"), i.value.isConnected || (r.value = H || e, Xt(i.value, {
        type: "text/css",
        id: S,
        media: T,
        nonce: j
      }), E ? l.head.prepend(i.value) : l.head.appendChild(i.value), Po(i.value, "data-primevue-style-id", h), Xt(i.value, G), i.value.onload = function(B) {
        return W?.(B, {
          name: h
        });
      }, D?.(h)), !n.value && (re = le(r, function(B) {
        i.value.textContent = B, R?.(h);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, pe = function() {
    !l || !n.value || (re(), Pa(i.value) && l.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return d && !u && Ga(ie), {
    id: x,
    name: m,
    el: i,
    css: r,
    unload: pe,
    load: ie,
    isLoaded: Ui(n)
  };
}
function yt(e) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yt(e);
}
var Ar, Mr, Ir, Vr;
function Lr(e, t) {
  return ts(e) || es(e, t) || Ja(e, t) || Xa();
}
function Xa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ja(e, t) {
  if (e) {
    if (typeof e == "string") return Nr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nr(e, t) : void 0;
  }
}
function Nr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function es(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return l;
  }
}
function ts(e) {
  if (Array.isArray(e)) return e;
}
function Br(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function gn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Br(Object(n), !0).forEach(function(r) {
      ns(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Br(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ns(e, t, n) {
  return (t = rs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rs(e) {
  var t = os(e, "string");
  return yt(t) == "symbol" ? t : t + "";
}
function os(e, t) {
  if (yt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function qt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var is = function(t) {
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
}, as = {}, ss = {}, oe = {
  name: "base",
  css: is,
  style: qa,
  classes: as,
  inlineStyles: ss,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(Ut(Ar || (Ar = qt(["", ""])), t));
    return ue(i) ? Qa(ht(i), gn({
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
      return se.transformCSS(n.name || t.name, "".concat(i).concat(Ut(Mr || (Mr = qt(["", ""])), r)));
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
      var r = Te(this.css, {
        dt: nt
      }) || "", i = ht(Ut(Ir || (Ir = qt(["", "", ""])), r, t)), o = Object.entries(n).reduce(function(a, l) {
        var s = Lr(l, 2), d = s[0], c = s[1];
        return a.push("".concat(d, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return ue(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
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
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Ut(Vr || (Vr = qt(["", ""])), Te(this.style, {
        dt: nt
      })), a = ht(se.transformCSS(i, o)), l = Object.entries(n).reduce(function(s, d) {
        var c = Lr(d, 2), u = c[0], p = c[1];
        return s.push("".concat(u, '="').concat(p, '"')) && s;
      }, []).join(" ");
      ue(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return gn(gn({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ge = rr();
function wt(e) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wt(e);
}
function Rr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Yt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rr(Object(n), !0).forEach(function(r) {
      ls(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ls(e, t, n) {
  return (t = us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function us(e) {
  var t = ds(e, "string");
  return wt(t) == "symbol" ? t : t + "";
}
function ds(e, t) {
  if (wt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (wt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var cs = {
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
    text: [ye.STARTS_WITH, ye.CONTAINS, ye.NOT_CONTAINS, ye.ENDS_WITH, ye.EQUALS, ye.NOT_EQUALS],
    numeric: [ye.EQUALS, ye.NOT_EQUALS, ye.LESS_THAN, ye.LESS_THAN_OR_EQUAL_TO, ye.GREATER_THAN, ye.GREATER_THAN_OR_EQUAL_TO],
    date: [ye.DATE_IS, ye.DATE_IS_NOT, ye.DATE_BEFORE, ye.DATE_AFTER]
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
}, ps = Symbol();
function fs(e, t) {
  var n = {
    config: Xn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ps, n), ms(), hs(e, n), n;
}
var st = [];
function ms() {
  ge.clear(), st.forEach(function(e) {
    return e?.();
  }), st = [];
}
function hs(e, t) {
  var n = U(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !se.isStyleNameLoaded("common")) {
      var c, u, p = ((c = oe.getCommonTheme) === null || c === void 0 ? void 0 : c.call(oe)) || {}, m = p.primitive, g = p.semantic, x = p.global, $ = p.style, T = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      oe.load(m?.css, Yt({
        name: "primitive-variables"
      }, T)), oe.load(g?.css, Yt({
        name: "semantic-variables"
      }, T)), oe.load(x?.css, Yt({
        name: "global-variables"
      }, T)), oe.loadStyle(Yt({
        name: "global-style"
      }, T), $), se.setLoadedStyleName("common");
    }
  };
  ge.on("theme:change", function(s) {
    n.value || (e.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var i = le(t.config, function(s, d) {
    Ge.emit("config:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = le(function() {
    return t.config.ripple;
  }, function(s, d) {
    Ge.emit("config:ripple:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = le(function() {
    return t.config.theme;
  }, function(s, d) {
    n.value || se.setTheme(s), t.config.unstyled || r(), n.value = !1, Ge.emit("config:theme:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = le(function() {
    return t.config.unstyled;
  }, function(s, d) {
    !s && t.config.theme && r(), Ge.emit("config:unstyled:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  st.push(i), st.push(o), st.push(a), st.push(l);
}
var bs = {
  install: function(t, n) {
    var r = va(cs, n);
    fs(t, r);
  }
}, ir = {
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
    this.mounted = To();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function vs(e, t, n, r, i, o) {
  return o.inline ? q(e.$slots, "default", {
    key: 0
  }) : i.mounted ? (f(), N(vo, {
    key: 1,
    to: n.appendTo
  }, [q(e.$slots, "default")], 8, ["to"])) : A("", !0);
}
ir.render = vs;
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
function gs() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Bt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var jr = oe.extend({
  name: "common"
});
function kt(e) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kt(e);
}
function ys(e) {
  return No(e) || ws(e) || Lo(e) || Vo();
}
function ws(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pt(e, t) {
  return No(e) || ks(e, t) || Lo(e, t) || Vo();
}
function Vo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Lo(e, t) {
  if (e) {
    if (typeof e == "string") return _n(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _n(e, t) : void 0;
  }
}
function _n(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ks(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return l;
  }
}
function No(e) {
  if (Array.isArray(e)) return e;
}
function Fr(e, t) {
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
    t % 2 ? Fr(Object(n), !0).forEach(function(r) {
      ft(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ft(e, t, n) {
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = xs(e, "string");
  return kt(t) == "symbol" ? t : t + "";
}
function xs(e, t) {
  if (kt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (kt(r) != "object") return r;
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
        ge.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ge.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, i, o, a, l, s, d, c, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, g = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = g || m) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var x = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, $ = x ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, T = x ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (c = T || $) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (u = c.onBeforeCreate) === null || u === void 0 || u.call(c), this.$attrSelector = gs(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Oe(ut(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = ee({
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
      return er(t) ? t.apply(void 0, r) : b.apply(void 0, r);
    },
    _load: function() {
      We.isStyleNameLoaded("base") || (oe.loadCSS(this.$styleOptions), this._loadGlobalStyles(), We.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !We.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (jr.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), We.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      ue(t) && oe.load(t, ee({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!se.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, a = o.primitive, l = o.semantic, s = o.global, d = o.style;
          oe.load(a?.css, ee({
            name: "primitive-variables"
          }, this.$styleOptions)), oe.load(l?.css, ee({
            name: "semantic-variables"
          }, this.$styleOptions)), oe.load(s?.css, ee({
            name: "global-variables"
          }, this.$styleOptions)), oe.loadStyle(ee({
            name: "global-style"
          }, this.$styleOptions), d), se.setLoadedStyleName("common");
        }
        if (!se.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, u, p, m, g = ((c = this.$style) === null || c === void 0 || (u = c.getComponentTheme) === null || u === void 0 ? void 0 : u.call(c)) || {}, x = g.css, $ = g.style;
          (p = this.$style) === null || p === void 0 || p.load(x, ee({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(ee({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), $), se.setLoadedStyleName(this.$style.name);
        }
        if (!se.isStyleNameLoaded("layer-order")) {
          var T, _, V = (T = this.$style) === null || T === void 0 || (_ = T.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(T);
          oe.load(V, ee({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), se.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = o.css, l = (i = this.$style) === null || i === void 0 ? void 0 : i.load(a, ee({
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
      We.clearLoadedStyleNames(), ge.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ge.off("theme:change", this._loadCoreStyles), ge.off("theme:change", this._load), ge.off("theme:change", this._themeScopedListener);
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
      return nr(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!i[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, p = o ? a ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, m = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, ee(ee({}, i), {}, {
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
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && ue((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && ee(ee({}, r === "root" && ee(ee(ft({}, "".concat(i, "name"), Le(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && ft({}, "".concat(i, "extend"), Le(this.$.type.name))), {}, ft({}, "".concat(this.$attrSelector), ""))), {}, ft({}, "".concat(i, "section"), Le(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return $e(t) || ko(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var s, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = i ? i(l) : l, u = Le(r), p = Le(n.$name);
        return (s = d ? u !== p ? c?.[u] : void 0 : c?.[u]) !== null && s !== void 0 ? s : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: o(t.originalValue),
        value: o(t.value)
      } : o(t, !0);
    },
    _usePT: function(t, n, r, i) {
      var o = function(x) {
        return n(x, r, i);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, p = o(t.originalValue), m = o(t.value);
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
        var i = this._getOptionValue(this.$style.inlineStyles, t, ee(ee({}, this.$params), r)), o = this._getOptionValue(jr.inlineStyles, t, ee(ee({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return Te(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, ee({}, n.$params)) || Te(r, ee({}, n.$params));
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
        var r = pt(n, 2), i = r[0], o = r[1], a = i.split(":"), l = ys(a), s = _n(l).slice(1);
        return s?.reduce(function(d, c, u, p) {
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
}, $s = `
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
`, Cs = oe.extend({
  name: "baseicon",
  css: $s
});
function St(e) {
  "@babel/helpers - typeof";
  return St = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, St(e);
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
function Hr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zr(Object(n), !0).forEach(function(r) {
      Ts(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ts(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Es(e, "string");
  return St(t) == "symbol" ? t : t + "";
}
function Es(e, t) {
  if (St(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (St(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qe = {
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
  style: Cs,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Be(this.label);
      return Hr(Hr({}, !this.isUnstyled && {
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
function xt(e) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xt(e);
}
function Ur(e, t) {
  return As(e) || Ds(e, t) || _s(e, t) || Os();
}
function Os() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _s(e, t) {
  if (e) {
    if (typeof e == "string") return qr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qr(e, t) : void 0;
  }
}
function qr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ds(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, i = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw i;
      }
    }
    return l;
  }
}
function As(e) {
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
function te(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Yr(Object(n), !0).forEach(function(r) {
      Dn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Dn(e, t, n) {
  return (t = Ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ms(e) {
  var t = Is(e, "string");
  return xt(t) == "symbol" ? t : t + "";
}
function Is(e, t) {
  if (xt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (xt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var X = {
  _getMeta: function() {
    return [Re(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Te(Re(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, i, o;
    return (r = (t == null || (i = t.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: nr,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var _ = X._getOptionValue.apply(X, arguments);
      return $e(_) || ko(_) ? {
        class: _
      } : _;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = d.mergeSections, u = c === void 0 ? !0 : c, p = d.mergeProps, m = p === void 0 ? !1 : p, g = l ? X._useDefaultPT(r, r.defaultPT(), s, o, a) : void 0, x = X._usePT(r, X._getPT(i, r.$name), s, o, te(te({}, a), {}, {
      global: g || {}
    })), $ = X._getPTDatasets(r, o);
    return u || !u && x ? m ? X._mergeProps(r, m, g, x, $) : te(te(te({}, g), x), $) : te(te({}, x), $);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return te(te({}, n === "root" && Dn({}, "".concat(r, "name"), Le(t.$name))), {}, Dn({}, "".concat(r, "section"), Le(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(a) {
      var l, s = r ? r(a) : a, d = Le(n);
      return (l = s?.[d]) !== null && l !== void 0 ? l : s;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: i(t.originalValue),
      value: i(t.value)
    } : i(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, a = function($) {
      return r($, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, d = s.mergeSections, c = d === void 0 ? !0 : d, u = s.mergeProps, p = u === void 0 ? !1 : u, m = a(n.originalValue), g = a(n.value);
      return m === void 0 && g === void 0 ? void 0 : $e(g) ? g : $e(m) ? m : c || !c && g ? p ? X._mergeProps(t, p, m, g) : te(te({}, m), g) : g;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return X._usePT(t, n, r, i, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = X._getConfig(r, i), a = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    X._loadCoreStyles(n, a), X._loadThemeStyles(n, a), X._loadScopedThemeStyles(n, a), X._removeThemeListeners(n), n.$loadStyles = function() {
      return X._loadThemeStyles(n, a);
    }, X._themeChangeListener(n.$loadStyles);
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
        var a, l, s = ((a = i.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, d = s.primitive, c = s.semantic, u = s.global, p = s.style;
        oe.load(d?.css, te({
          name: "primitive-variables"
        }, o)), oe.load(c?.css, te({
          name: "semantic-variables"
        }, o)), oe.load(u?.css, te({
          name: "global-variables"
        }, o)), oe.loadStyle(te({
          name: "global-style"
        }, o), p), se.setLoadedStyleName("common");
      }
      if (!se.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var m, g, x, $, T = ((m = i.$style) === null || m === void 0 || (g = m.getDirectiveTheme) === null || g === void 0 ? void 0 : g.call(m)) || {}, _ = T.css, V = T.style;
        (x = i.$style) === null || x === void 0 || x.load(_, te({
          name: "".concat(i.$style.name, "-variables")
        }, o)), ($ = i.$style) === null || $ === void 0 || $.loadStyle(te({
          name: "".concat(i.$style.name, "-style")
        }, o), V), se.setLoadedStyleName(i.$style.name);
      }
      if (!se.isStyleNameLoaded("layer-order")) {
        var k, E, w = (k = i.$style) === null || k === void 0 || (E = k.getLayerOrderThemeCSS) === null || E === void 0 ? void 0 : E.call(k);
        oe.load(w, te({
          name: "layer-order",
          first: !0
        }, o)), se.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var i, o, a, l = ((i = t.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(t.$attrSelector, "]"))) || {}, s = l.css, d = (a = t.$style) === null || a === void 0 ? void 0 : a.load(s, te({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    We.clearLoadedStyleNames(), ge.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ge.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, i, o, a) {
    var l, s, d = "on".concat(ga(n)), c = X._getConfig(i, o), u = r?.$instance, p = X._usePT(u, X._getPT(i == null || (l = i.value) === null || l === void 0 ? void 0 : l.pt, t), X._getOptionValue, "hooks.".concat(d)), m = X._useDefaultPT(u, c == null || (s = c.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[t], X._getOptionValue, "hooks.".concat(d)), g = {
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
    return er(t) ? t.apply(void 0, r) : b.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, s, d, c, u) {
      var p, m, g, x;
      s._$instances = s._$instances || {};
      var $ = X._getConfig(d, c), T = s._$instances[t] || {}, _ = Be(T) ? te(te({}, n), n?.methods) : {};
      s._$instances[t] = te(te({}, T), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: s,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: T.$el || s || void 0,
        $style: te({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: $,
        $attrSelector: (p = s.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return X._getPT($?.pt, void 0, function(k) {
            var E;
            return k == null || (E = k.directives) === null || E === void 0 ? void 0 : E[t];
          });
        },
        isUnstyled: function() {
          var k, E;
          return ((k = s._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.unstyled) !== void 0 ? (E = s._$instances[t]) === null || E === void 0 || (E = E.$binding) === null || E === void 0 || (E = E.value) === null || E === void 0 ? void 0 : E.unstyled : $?.unstyled;
        },
        theme: function() {
          var k;
          return (k = s._$instances[t]) === null || k === void 0 || (k = k.$primevueConfig) === null || k === void 0 ? void 0 : k.theme;
        },
        preset: function() {
          var k;
          return (k = s._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.dt;
        },
        /* instance's methods */
        ptm: function() {
          var k, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return X._getPTValue(s._$instances[t], (k = s._$instances[t]) === null || k === void 0 || (k = k.$binding) === null || k === void 0 || (k = k.value) === null || k === void 0 ? void 0 : k.pt, E, te({}, w));
        },
        ptmo: function() {
          var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return X._getPTValue(s._$instances[t], k, E, w, !1);
        },
        cx: function() {
          var k, E, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (k = s._$instances[t]) !== null && k !== void 0 && k.isUnstyled() ? void 0 : X._getOptionValue((E = s._$instances[t]) === null || E === void 0 || (E = E.$style) === null || E === void 0 ? void 0 : E.classes, w, te({}, D));
        },
        sx: function() {
          var k, E = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, D = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return w ? X._getOptionValue((k = s._$instances[t]) === null || k === void 0 || (k = k.$style) === null || k === void 0 ? void 0 : k.inlineStyles, E, te({}, D)) : void 0;
        }
      }, _), s.$instance = s._$instances[t], (m = (g = s.$instance)[l]) === null || m === void 0 || m.call(g, s, d, c, u), s["$".concat(t)] = s.$instance, X._hook(t, l, s, d, c, u), s.$pd || (s.$pd = {}), s.$pd[t] = te(te({}, (x = s.$pd) === null || x === void 0 ? void 0 : x[t]), {}, {
        name: t,
        instance: s._$instances[t]
      });
    }, i = function(l) {
      var s, d, c, u = l._$instances[t], p = u?.watch, m = function($) {
        var T, _ = $.newValue, V = $.oldValue;
        return p == null || (T = p.config) === null || T === void 0 ? void 0 : T.call(u, _, V);
      }, g = function($) {
        var T, _ = $.newValue, V = $.oldValue;
        return p == null || (T = p["config.ripple"]) === null || T === void 0 ? void 0 : T.call(u, _, V);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": g
      }, p == null || (s = p.config) === null || s === void 0 || s.call(u, u?.$primevueConfig), Ge.on("config:change", m), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (c = u.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), Ge.on("config:ripple:change", g);
    }, o = function(l) {
      var s = l._$instances[t].$watchersCallback;
      s && (Ge.off("config:change", s.config), Ge.off("config:ripple:change", s["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, d, c) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Ma("pd")
        }, r("created", l, s, d, c);
      },
      beforeMount: function(l, s, d, c) {
        var u;
        X._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("beforeMount", l, s, d, c), i(l);
      },
      mounted: function(l, s, d, c) {
        var u;
        X._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("mounted", l, s, d, c);
      },
      beforeUpdate: function(l, s, d, c) {
        r("beforeUpdate", l, s, d, c);
      },
      updated: function(l, s, d, c) {
        var u;
        X._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("updated", l, s, d, c);
      },
      beforeUnmount: function(l, s, d, c) {
        var u;
        o(l), X._removeThemeListeners((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", l, s, d, c);
      },
      unmounted: function(l, s, d, c) {
        var u;
        (u = l.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", l, s, d, c);
      }
    };
  },
  extend: function() {
    var t = X._getMeta.apply(X, arguments), n = Ur(t, 2), r = n[0], i = n[1];
    return te({
      extend: function() {
        var a = X._getMeta.apply(X, arguments), l = Ur(a, 2), s = l[0], d = l[1];
        return X.extend(s, te(te(te({}, i), i?.methods), d));
      }
    }, X._extend(r, i));
  }
}, Vs = `
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
`, Ls = {
  root: "p-ink"
}, Ns = oe.extend({
  name: "ripple-directive",
  style: Vs,
  classes: Ls
}), Bs = X.extend({
  style: Ns
});
function $t(e) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $t(e);
}
function Rs(e) {
  return Hs(e) || zs(e) || Fs(e) || js();
}
function js() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Fs(e, t) {
  if (e) {
    if (typeof e == "string") return An(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? An(e, t) : void 0;
  }
}
function zs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hs(e) {
  if (Array.isArray(e)) return An(e);
}
function An(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Kr(e, t, n) {
  return (t = Us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Us(e) {
  var t = qs(e, "string");
  return $t(t) == "symbol" ? t : t + "";
}
function qs(e, t) {
  if ($t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ar = Bs.extend("ripple", {
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
      n || (n = Ea("span", Kr(Kr({
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
        if (!this.isUnstyled() && hn(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Tr(i) && !Pr(i)) {
          var o = Math.max(Zt(r), _a(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var a = Oa(r), l = t.pageX - a.left + document.body.scrollTop - Pr(i) / 2, s = t.pageY - a.top + document.body.scrollLeft - Tr(i) / 2;
        i.style.top = s + "px", i.style.left = l + "px", !this.isUnstyled() && wa(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && hn(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && hn(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Rs(t.children).find(function(n) {
        return Xe(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ct(e) {
  "@babel/helpers - typeof";
  return Ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ct(e);
}
function Ys(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Ks(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, Gs(r.key), r);
  }
}
function Ws(e, t, n) {
  return t && Ks(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function Gs(e) {
  var t = Zs(e, "string");
  return Ct(t) == "symbol" ? t : t + "";
}
function Zs(e, t) {
  if (Ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var Qs = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ys(this, e), this.element = t, this.listener = n;
  }
  return Ws(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Da(this.element);
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
})(), Xs = rr();
const Js = "data-wippy-overlay-layer";
function Bo() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ro() {
  return Bo() && typeof HTMLElement < "u" && "popover" in HTMLElement.prototype;
}
function el() {
  return Ro() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const tl = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let nl = 0;
const en = /* @__PURE__ */ new WeakMap();
function Wr(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function rl(e, t) {
  if (!tl.test(e.className))
    return;
  const n = e.style.cssText;
  Wr(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!en.has(e)) {
    const r = new MutationObserver(() => {
      const i = e.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && Wr(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), en.set(e, r);
  }
}
function sr(e) {
  const t = en.get(e);
  t && (t.disconnect(), en.delete(e));
}
function ol(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Mn(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const tn = /* @__PURE__ */ new Set(), lr = /* @__PURE__ */ new WeakMap();
let Gr = !1, In = !1;
const Zr = ["w-theme-dark", "w-theme-light"], Kt = "data-wippy-theme-root", Vn = /* @__PURE__ */ new WeakMap();
function il(e) {
  const t = [];
  let n = e ? e.parentNode : null;
  for (; n && n.nodeType === 1; )
    t.push(n), n = n.parentNode;
  return t;
}
function al(e, t, n) {
  const r = [...il(t), n.host], i = () => {
    let a;
    for (const l of r) {
      if (Zr.some((s) => l.classList.contains(s))) {
        a = l;
        break;
      }
      if (l.hasAttribute(Kt))
        break;
    }
    for (const l of Zr)
      e.classList.toggle(l, !!(a && a.classList.contains(l)));
    a ? e.setAttribute(Kt, "") : e.removeAttribute(Kt);
  };
  i();
  const o = new MutationObserver(i);
  for (const a of r)
    o.observe(a, { attributes: !0, attributeFilter: ["class", Kt] });
  Vn.set(e, o);
}
function jo(e) {
  Vn.get(e)?.disconnect(), Vn.delete(e);
}
function sl() {
  In = !1;
  for (const e of tn) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && sr(t);
      tn.delete(e), lr.get(e)?.disconnect(), jo(e);
      continue;
    }
    e.childElementCount > 0 && Mn(e);
  }
}
function Qr() {
  In || (In = !0, requestAnimationFrame(sl));
}
function ll(e) {
  const t = document.createElement("div");
  t.setAttribute(Js, "");
  const n = Ro();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Mn(t);
  const r = new MutationObserver((i) => {
    const o = t.__wippyAnchorName;
    for (const a of i) {
      if (o)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && rl(l, o);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && sr(l);
    }
    t.isConnected && t.childElementCount > 0 && Mn(t);
  });
  return r.observe(t, { childList: !0 }), lr.set(t, r), tn.add(t), Gr || (Gr = !0, window.addEventListener("scroll", Qr, { capture: !0, passive: !0 }), window.addEventListener("resize", Qr, { passive: !0 })), t;
}
function Xr(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ll(e.hostRoot), al(e.layer, e.$el, e.hostRoot), el())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++nl}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Jr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && sr(t);
    tn.delete(e.layer), lr.get(e.layer)?.disconnect(), jo(e.layer), e.layer.remove(), e.layer = null;
  }
}
let eo = !1;
function ul() {
  if (eo)
    return;
  eo = !0;
  const e = ir;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Bo() && (this.hostRoot = ol(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Xr(this), this.$watch("inline", (t) => {
      t ? Jr(this) : Xr(this);
    })));
  }, e.render = function() {
    return this.inline ? q(this.$slots, "default", { key: 0 }) : this.mounted ? qi(vo, { key: 1, to: this.resolvedTarget || document.body }, [
      q(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    Jr(this);
  };
}
const dl = {
  install: (e) => {
    ul(), e.use(bs, { theme: "none" });
  }
};
var Ln = "data-wippy-visible";
function to(e) {
  const t = e.getAttribute(Ln);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var cl = Object.defineProperty, pl = (e, t, n) => t in e ? cl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, me = (e, t, n) => pl(e, typeof t != "symbol" ? t + "" : t, n), fl = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], ml = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function no(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function hl(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, i] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && i && typeof i == "object") {
          for (const [a, l] of Object.entries(i)) {
            const s = typeof l == "string" ? no(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const o = typeof i == "string" ? no(r) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function bl(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${ml} {
${t}
}`;
}
function vl(e, t) {
  const n = bl(t);
  n && Fo(e, n, "@wippy-fe/css-variables-bridge");
}
function gl(e, t) {
  const r = (t ?? fl).map(async (i) => {
    const o = ta[i];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${i}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await na(o);
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
function yl(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Fo(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const i = new CSSStyleSheet();
    i.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, i];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function wl(e, t) {
  Fo(e, t, "@wippy-fe/custom-css");
}
function zo(e) {
  return e.__wippyHost ?? null;
}
function kl(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Sl(e, t, n) {
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
function yn(e, t) {
  const n = {}, r = [];
  for (const [i, o] of Object.entries(t.properties)) {
    const a = e.getAttribute(i), l = kl(i);
    if (a === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const s = Sl(i, a, o);
    s.error ? r.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: r };
}
var xl = class {
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
}, $l = class extends HTMLElement {
  constructor() {
    super(), me(this, "_internals"), me(this, "_contentObserver", null), me(this, "_initialized", !1), me(this, "_container", null), me(this, "_reactive", null), me(this, "_lastProps", null), me(this, "_lastErrors", []), me(this, "_lastContent", null), me(this, "_themeUnsub", null), me(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = to(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Ln])];
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
    return zo(this);
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
        const o = yn(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, r = o.errors, this._lastProps = n, this._lastErrors = r;
      }
      const i = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = i), this._reactive = new xl(
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
        this.onInit(n), e.inlineCss && yl(n, e.inlineCss);
        try {
          const d = kr?.theming, c = hl(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          vl(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = kr?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            c && wl(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && gl(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && r.classList.add(...s), n.appendChild(r), this._container = r, Ji(Qi);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = it("@theme", (s) => this._applyTheme(s)));
      const { props: i, errors: o } = yn(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(i));
      const a = i;
      this._lastProps = a, this._lastErrors = o;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, a, o, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ea.getThemeMode?.()) {
    zt(e, this), this._container && zt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), zt("auto", this), this._container && zt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Ln) {
      const l = this._hostVisible, s = to(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: i, errors: o } = yn(this, r.propsSchema);
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
function Cl(e) {
  return e.__wippyHostBus ?? null;
}
function Tl(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Pl = Object.defineProperty, El = (e, t, n) => t in e ? Pl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ot = (e, t, n) => El(e, typeof t != "symbol" ? t + "" : t, n), Ol = /* @__PURE__ */ Symbol("wippy:emit"), Ho = /* @__PURE__ */ Symbol("wippy:props"), Uo = /* @__PURE__ */ Symbol("wippy:props_error"), _l = /* @__PURE__ */ Symbol("wippy:content"), Dl = /* @__PURE__ */ Symbol("wippy:panel-id"), Al = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ml = /* @__PURE__ */ Symbol("wippy:host"), Il = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Vl() {
  const e = ln(Ho);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ll() {
  const e = ln(Uo);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Nl = class extends $l {
  constructor() {
    super(...arguments), ot(this, "_vueApp", null), ot(this, "_propsRef", U({})), ot(this, "_errorsRef", U([])), ot(this, "_contentRef", U(null)), ot(this, "_hostVisibilityRef", U(null)), ot(this, "_bridgeAbort", null);
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
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((d, c) => {
      this._propsRef.value = d, this._errorsRef.value = [...c];
      for (const u of c)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: l.signal });
    const s = (d) => {
      if (l.signal.aborted)
        return;
      const c = oa(), u = Yi(d.rootComponent);
      this._vueApp = u;
      const p = ia();
      if (d.piniaPlugins)
        for (const m of d.piniaPlugins)
          p.use(m);
      if (u.use(p), d.plugins)
        for (const m of d.plugins)
          u.use(m);
      u.provide(Ho, this._propsRef), u.provide(Uo, this._errorsRef), u.provide(Ol, this.emitEvent.bind(this)), u.provide(_l, this._contentRef), u.provide(Il, this._hostVisibilityRef), u.provide(Dl, Tl(this)), u.provide(Al, Cl(this)), u.provide(Ml, zo(this)), d.providers && d.providers(u, this), u.mount(t), c && aa(c);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), a.lazyConfig().then((c) => {
        l.signal.aborted || (d.remove(), s(c));
      }).catch((c) => {
        if (l.signal.aborted)
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
const Bl = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version: 1 is a choice-only form, 2 is a form with at least one standard field (`text`, `textarea`, `number`, `email`, `date`, `checkbox`). A higher value, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead, and so does a field whose type this version does not know.' }, definition: { type: "object", default: null, description: "The questions to ask: `title`, optional `description`, and `fields`. Every field is `{ id, type, label, description?, required }` plus the keys of its type: `choice` adds `options: [{value, label, description?}]`, `multiple` and `allow_other`; `text` and `textarea` add `min_length`, `max_length`, `placeholder` and `default` (`text` also `pattern`, a full-match expression that only the server checks, answering a mismatch with a 422 `pattern_mismatch` on the field); `number` adds `min`, `max`, `step`, `integer` and `default`; `email` adds `default`; `date` adds `min`, `max` (`YYYY-MM-DD`) and `default`; `checkbox` adds `default` (only `false`). Optional `submit_label` is the fields form's Submit button text (the question card does not show it), and optional `answered_message` is accepted and not shown. When every field is a choice the question card renders, otherwise the fields form. A definition with no fields shows an error message." }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' } } } }, Rl = {
  wippy: Bl
};
function ur(e) {
  return Xi[e];
}
const jl = 2e3;
function Fl(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function i() {
    n && clearTimeout(n), n = null;
  }
  le([() => e.value?.artifact_id, () => e.value?.status, () => e.value?.delivery], () => {
    const o = e.value;
    if (!o || o.status !== "idle" || o.delivery !== "pending" || r.has(o.artifact_id))
      return;
    i();
    const a = o.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== a || l.delivery !== "pending" || r.has(a) || (r.add(a), ur("ws")?.send({ type: "session_open", session_id: l.session_id }));
    }, jl);
  }, { immediate: !0 }), un(i);
}
const zl = /* @__PURE__ */ new Set([1, 2]);
function ro(e) {
  return zl.has(e);
}
const Hl = /* @__PURE__ */ new Set(["choice", "text", "textarea", "number", "email", "date", "checkbox"]);
function Ul(e) {
  return Hl.has(e);
}
function dr(e) {
  return e.type === "choice";
}
function ql(e) {
  return e.fields.length > 0 && e.fields.every(dr);
}
function Yl(e) {
  return ql(e.definition);
}
function Ie(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ze(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function oo(e) {
  return typeof e == "string" ? e : Ze(e) ? e.value : null;
}
function Kl(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => oo(n) === t) : oo(e) === t;
}
function mt(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Ie);
    return t ? t.other : "";
  }
  return Ie(e) ? e.other : "";
}
function qo(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Ie) : Ie(e);
}
function Wl(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((i) => Ze(i) && i.value === t);
  return r && Ze(r) ? r.note : "";
}
function Pe(e, t) {
  if (e == null)
    return;
  const n = e[t];
  return Object.hasOwn(e, t) ? n : void 0;
}
const Gl = 1e12, Zl = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
function Ql(e) {
  const t = e.startsWith("-"), [n, r = ""] = (t ? e.slice(1) : e).split("."), i = n.replace(/^0+/, "") || "0", o = r.replace(/0+$/, ""), a = o ? `${i}.${o}` : i;
  return t && a !== "0" ? `-${a}` : a;
}
function Xl(e) {
  const t = e.trim();
  if (t === "")
    return { kind: "empty" };
  if (!Zl.test(t))
    return { kind: "invalid" };
  const n = Number(t);
  if (!Number.isFinite(n))
    return { kind: "invalid" };
  const r = n === 0 ? 0 : n;
  return De(r) !== Ql(t) ? { kind: "invalid" } : { kind: "number", value: r };
}
function De(e) {
  const t = String(e), n = t.indexOf("e");
  if (n === -1)
    return t;
  const r = t.startsWith("-"), i = t.slice(r ? 1 : 0, n), o = Number(t.slice(n + 1)), a = i.indexOf("."), l = i.replace(".", ""), s = (a === -1 ? i.length : a) + o;
  let d;
  return s <= 0 ? d = `0.${"0".repeat(-s)}${l}` : s >= l.length ? d = l + "0".repeat(s - l.length) : d = `${l.slice(0, s)}.${l.slice(s)}`, r ? `-${d}` : d;
}
function wn(e) {
  const t = e.indexOf(".");
  return t === -1 ? 0 : e.length - t - 1;
}
function kn(e, t) {
  const n = e.startsWith("-"), r = n ? e.slice(1) : e, i = r.indexOf("."), o = i === -1 ? r : r.slice(0, i), a = i === -1 ? "" : r.slice(i + 1), l = BigInt(`${o}${a.padEnd(t, "0")}`);
  return n ? -l : l;
}
function Jl(e, t, n) {
  const r = De(e), i = De(t), o = De(n), a = Math.max(wn(r), wn(i), wn(o)), l = kn(o, a);
  return l === 0n ? !1 : (kn(r, a) - kn(i, a)) % l === 0n;
}
function be(e) {
  return e.trim();
}
function Yo(e) {
  return Array.from(e).length;
}
function nn(e) {
  return `Use at most ${e.toLocaleString("en-US")} characters.`;
}
function cr(e) {
  return be(e) === "";
}
function eu(e) {
  return e.replace(/\r\n?/g, `
`);
}
function tu(e, t) {
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
const nu = 254, ru = 64, pr = "This question is required.", ou = { answer: void 0, errors: [] };
function xe(e, t) {
  return { answer: void 0, errors: [{ code: e, message: t }] };
}
function dn(e) {
  return e.required ? xe("required", pr) : ou;
}
function Ko(e, t) {
  const n = e.type === "textarea", r = typeof t == "string" ? t : "", i = n ? eu(r) : r;
  if (tu(i, n))
    return xe("invalid_text", "Remove control characters from this answer.");
  if (cr(i))
    return dn(e);
  const o = Yo(i);
  return o < e.min_length ? xe("too_short", `Use at least ${e.min_length} characters.`) : o > e.max_length ? xe("too_long", nn(e.max_length)) : { answer: i, errors: [] };
}
const iu = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*$/, au = /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;
function su(e) {
  if (e.length > nu)
    return !1;
  const t = e.split("@");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (n.length === 0 || n.length > ru || !iu.test(n))
    return !1;
  const i = r.split(".");
  return i.length >= 2 && i.every((o) => au.test(o));
}
function lu(e, t) {
  const n = be(typeof t == "string" ? t : "");
  return n === "" ? dn(e) : su(n) ? { answer: n, errors: [] } : xe("invalid_email", "Enter a valid email address.");
}
function uu(e, t) {
  const n = Xl(typeof t == "string" ? t : "");
  if (n.kind === "empty")
    return dn(e);
  if (n.kind === "invalid" || Math.abs(n.value) > Gl)
    return xe("invalid_number", "Enter a number, using a dot for decimals (for example 12 or -3.5).");
  const { value: r } = n;
  if (e.integer && !Number.isInteger(r))
    return xe("not_integer", "Enter a whole number.");
  if (e.min !== void 0 && r < e.min)
    return xe("below_min", `Enter ${De(e.min)} or more.`);
  if (e.max !== void 0 && r > e.max)
    return xe("above_max", `Enter ${De(e.max)} or less.`);
  if (e.step !== void 0 && e.step > 0 && !Jl(r, e.min ?? 0, e.step)) {
    const i = e.min !== void 0 ? ` starting at ${De(e.min)}` : "";
    return xe("not_on_step", `Enter a value in steps of ${De(e.step)}${i}.`);
  }
  return { answer: r, errors: [] };
}
const du = /^(\d{4})-(\d{2})-(\d{2})$/;
function cu(e, t) {
  return t === 2 ? e % 4 === 0 && e % 100 !== 0 || e % 400 === 0 ? 29 : 28 : [4, 6, 9, 11].includes(t) ? 30 : 31;
}
function ze(e) {
  const t = du.exec(e);
  if (!t)
    return !1;
  const n = Number(t[1]), r = Number(t[2]), i = Number(t[3]);
  return n >= 1 && r >= 1 && r <= 12 && i >= 1 && i <= cu(n, r);
}
function pu(e, t) {
  const n = typeof t == "string" ? t : "";
  return cr(n) ? dn(e) : ze(n) ? e.min && ze(e.min) && n < e.min ? xe("below_min", `Choose ${e.min} or later.`) : e.max && ze(e.max) && n > e.max ? xe("above_max", `Choose ${e.max} or earlier.`) : { answer: n, errors: [] } : xe("invalid_date", "Enter a valid date as YYYY-MM-DD.");
}
function fu(e, t) {
  const n = t === !0;
  return e.required && !n ? xe("required", pr) : { answer: n, errors: [] };
}
function cn(e, t) {
  return typeof t == "string" ? t : typeof e.default == "string" ? e.default : void 0;
}
function pn(e, t) {
  return typeof t == "string" && !cr(t) ? t : null;
}
const mu = { evaluate: Ko, initialDraft: cn, display: pn }, hu = { evaluate: Ko, initialDraft: cn, display: pn }, bu = { evaluate: lu, initialDraft: cn, display: pn }, vu = { evaluate: pu, initialDraft: cn, display: pn }, gu = {
  evaluate: uu,
  // The draft of a number field is the typed text, so the strict parser sees what the user wrote.
  initialDraft: (e, t) => typeof t == "number" ? De(t) : typeof e.default == "number" ? De(e.default) : void 0,
  display: (e, t) => typeof t == "number" ? De(t) : null
}, yu = {
  evaluate: fu,
  // Only `false` can be a default, so an unchecked start is always right.
  initialDraft: (e, t) => typeof t == "boolean" ? t : !1,
  display: (e, t) => typeof t == "boolean" ? t ? "Yes" : "No" : null
}, Wo = {
  text: mu,
  textarea: hu,
  email: bu,
  number: gu,
  date: vu,
  checkbox: yu
}, rn = 2e3, on = 1e3, wu = "Enter the other answer.";
function an(e, t) {
  return Yo(be(e)) > t;
}
function Nn(e, t) {
  const n = be(t);
  return n ? { value: e, note: n } : e;
}
function ku(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], r = e.options.map((s) => s.value), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
    for (const s of n)
      typeof s == "string" && r.includes(s) ? o.add(s) : Ze(s) && r.includes(s.value) && (o.add(s.value), i.set(s.value, s));
    const a = r.filter((s) => o.has(s)).map((s) => {
      const d = i.get(s);
      return d ? Nn(s, d.note) : s;
    }), l = n.find(Ie);
    if (l) {
      const s = be(l.other);
      s.length > 0 && a.push({ other: s });
    }
    return a.length > 0 ? a : void 0;
  }
  if (!(t === void 0 || typeof t == "number" || typeof t == "boolean" || Array.isArray(t))) {
    if (Ie(t)) {
      const n = be(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Ze(t) && e.options.some((n) => n.value === t.value))
      return Nn(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function Su(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(Ie) : void 0 : Ie(t) ? t : void 0;
}
function xu(e) {
  return e === void 0 ? [] : (Array.isArray(e) ? e : [e]).filter(Ze);
}
function $u(e, t) {
  const n = ku(e, t), r = Su(e, t);
  return r && be(r.other).length === 0 ? { answer: n, errors: [{ code: "blank", message: wu }] } : r && an(r.other, rn) ? { answer: n, errors: [{ code: "too_long", message: nn(rn) }] } : xu(n).some((i) => an(i.note, on)) ? { answer: n, errors: [{ code: "too_long", message: nn(on) }] } : n === void 0 && e.required ? { answer: n, errors: [{ code: "required", message: pr }] } : { answer: n, errors: [] };
}
function Cu(e, t) {
  if (t !== void 0)
    return e.multiple ? Array.isArray(t) ? [...t] : [t] : t;
}
const Tu = {
  choice: { evaluate: $u, initialDraft: Cu },
  ...Wo
};
function Go(e) {
  return Tu[e.type];
}
function Zo(e, t) {
  return Go(e)?.evaluate(e, t) ?? { answer: void 0, errors: [] };
}
function Qo(e, t) {
  return Zo(e, t).answer;
}
function Xo(e, t) {
  const n = {};
  for (const r of e.fields) {
    const i = Qo(r, Pe(t, r.id));
    i !== void 0 && (n[r.id] = i);
  }
  return n;
}
function Pu(e, t) {
  const n = {};
  for (const r of e.fields) {
    const { errors: i } = Zo(r, Pe(t, r.id));
    i.length > 0 && (n[r.id] = i);
  }
  return n;
}
function io(e, t) {
  return JSON.stringify(e.fields.map((n) => {
    const r = Pe(t, n.id), i = r === void 0 || r === "" || Array.isArray(r) && r.length === 0;
    return [n.id, i ? null : r];
  }));
}
function ao(e) {
  return typeof e == "string" ? e : Ie(e) ? { other: e.other } : typeof e == "object" && e !== null && typeof e.value == "string" ? Nn(e.value, typeof e.note == "string" ? e.note : "") : null;
}
function Eu(e) {
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
        const l = ao(a);
        l !== null && o.push(l);
      }
      t[n] = o;
      continue;
    }
    const i = ao(r);
    i !== null && (t[n] = i);
  }
  return t;
}
function fr(e, t) {
  if (t === void 0 || !dr(e) || typeof t == "number" || typeof t == "boolean")
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const o of e.options) {
    const a = n.find((l) => typeof l == "string" ? l === o.value : Ze(l) && l.value === o.value);
    a && r.push({ label: o.label, note: Ze(a) ? a.note : void 0 });
  }
  const i = n.find(Ie);
  return i && r.push({ label: i.other, own: !0 }), r.length > 0 ? r : null;
}
function Ou(e, t) {
  if (dr(e)) {
    const r = fr(e, t);
    return r ? { kind: "choice", items: r } : { kind: "empty" };
  }
  const n = Wo[e.type].display(e, t);
  return n === null ? { kind: "empty" } : { kind: "text", text: n };
}
function Jo(e, t) {
  const n = {};
  for (const r of e.fields) {
    const i = Go(r)?.initialDraft(r, Pe(t, r.id));
    i !== void 0 && (n[r.id] = i);
  }
  return n;
}
const ei = "This form needs a newer Web Host.", ti = "This form cannot be submitted here.", Qt = "Could not submit this form.", ni = "Could not load this form.", ri = "Tick at least one answer, or type your own.", _u = Symbol.for("wippy.artifactStateError");
function oi(e) {
  return typeof e == "object" && e !== null && e[_u] === !0;
}
function ii(e) {
  return oi(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function Du(e) {
  return ii(e).status;
}
function Au(e) {
  return !oi(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function ai(e) {
  const t = ii(e);
  if (t.known) {
    const n = t.status;
    return n === void 0 ? t.noResponse ? { code: "network_error", message: "Network problem. Retrying…", retryable: !0, uncertain: !0, shouldReload: !1 } : { code: "unknown", message: t.message ?? Qt, retryable: !0, uncertain: !1, shouldReload: !1 } : n === 401 ? { code: "auth", message: "You are signed out. Sign in again, then retry.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 404 ? { code: "not_found", message: "This form is no longer available.", retryable: !1, uncertain: !1, shouldReload: !1 } : n === 409 ? t.code === "already_submitted" ? { code: "already_submitted", message: "This form was already answered.", retryable: !1, uncertain: !1, shouldReload: !0 } : t.code === "version_conflict" ? { code: "version_conflict", message: "This form changed. Reloading the latest version.", retryable: !1, uncertain: !1, shouldReload: !0 } : { code: "request_conflict", message: "That answer no longer matches this attempt. Change something and try again.", retryable: !1, uncertain: !1, shouldReload: !1 } : n >= 500 ? { code: "server_error", message: "The server could not save this. Try again.", retryable: !0, uncertain: !1, shouldReload: !1 } : { code: "unknown", message: t.message ?? Qt, retryable: !1, uncertain: !1, shouldReload: !1 };
  }
  return { code: "unknown", message: t.message ?? Qt, retryable: !0, uncertain: !1, shouldReload: !1 };
}
const Sn = 5e3, Mu = 6e4, Iu = [401, 403, 404];
function Vu(e, t) {
  const n = U("idle"), r = U(null), i = U(null), o = U(null);
  let a = 0, l = null, s = null, d = null, c = null, u = null, p = Sn;
  function m() {
    u && clearTimeout(u), u = null;
  }
  function g(C) {
    const R = Du(C);
    if (R !== void 0 && Iu.includes(R)) {
      m();
      return;
    }
    u || (u = setTimeout(() => {
      u = null, $();
    }, p), p = Math.min(p * 2, Mu));
  }
  async function x() {
    const C = ur("artifactState");
    if (typeof C != "function") {
      n.value = "unsupported";
      return;
    }
    const R = e.value;
    if (!R) {
      n.value = "idle", r.value = null, o.value = null;
      return;
    }
    const K = ++a, W = r.value === null;
    W && (n.value = "loading");
    try {
      const Y = await C(R).get();
      if (K !== a)
        return;
      r.value = { ...Y, data: Eu(Y.data) }, n.value = "loaded", i.value = null, o.value = null, m(), p = Sn;
    } catch (Y) {
      if (K !== a)
        return;
      const ne = Y instanceof Error ? Y.message : ni;
      W ? (n.value = "error", i.value = ne) : (o.value = ne, g(Y));
    }
  }
  function $() {
    return l ? (s || (s = l.then(() => (s = null, $()))), s) : (l = x().finally(() => {
      l = null;
    }), l);
  }
  function T(C) {
    c !== C && (d?.(), d = null, c = C, C && (d = it(`artifact:${C}`, () => {
      $();
    })));
  }
  le(t, () => {
    $();
  });
  const _ = P(() => {
    const C = r.value;
    return C?.session_id && (C.status === "active" && !C.stale || C.status === "idle" && C.delivery && C.delivery !== "complete") ? C.session_id : null;
  });
  let V = null, k = null, E = null, w = null;
  Nt(() => {
    le(e, (C) => {
      a++, m(), p = Sn, r.value = null, o.value = null, T(C), $();
    }, { immediate: !0 }), le(_, (C) => {
      V?.(), V = null, k?.(), k = null, C && (V = it(`session:${C}:message:*`, (R) => {
        R.data?.type !== "chunk" && $();
      }), k = it(`session:${C}`, () => {
        $();
      }));
    }, { immediate: !0 }), E = it("@visibility", (C) => {
      C && $();
    }), w = it("@reconnect", () => {
      $();
    });
  }), un(() => {
    a++, m(), d?.(), V?.(), k?.(), E?.(), w?.();
  });
  async function D() {
    return await $(), r.value;
  }
  return { status: n, state: r, errorMessage: i, reloadError: o, reload: () => {
    $();
  }, refresh: D };
}
function Lu() {
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
const Nu = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.", Bu = 800, Wt = { ok: !1, ignored: !0 };
function Ru(e) {
  return new Promise((t) => setTimeout(t, e));
}
function so(e, { exhausted: t }) {
  const n = Au(e);
  if (n)
    return { ok: !1, fieldErrors: n.errors, formErrors: n.formErrors };
  const r = ai(e);
  return {
    ok: !1,
    message: t && r.uncertain ? Nu : r.message,
    code: r.code,
    retryable: r.retryable,
    shouldReload: r.shouldReload
  };
}
function ju(e) {
  const t = U(!1), n = U(null), r = U(null);
  let i = 0;
  le(e, () => {
    i++, a();
  });
  function o(s) {
    const d = JSON.stringify(s);
    if (n.value && r.value === d)
      return n.value;
    const c = Lu();
    return n.value = c, r.value = d, c;
  }
  function a() {
    n.value = null, r.value = null;
  }
  async function l(s, d, c) {
    const u = e.value;
    if (!u)
      return { ok: !1, message: ti };
    const p = ur("artifactState");
    if (typeof p != "function")
      return { ok: !1, message: ei };
    const m = i, g = () => m !== i, x = {
      form_version: s,
      request_id: o(c),
      expected_content_version: d,
      answers: c
    }, $ = () => p(u).submit(x);
    t.value = !0;
    try {
      let T;
      try {
        T = await $();
      } catch (_) {
        if (g())
          return Wt;
        if (!ai(_).uncertain)
          return so(_, { exhausted: !1 });
        if (await Ru(Bu), g())
          return Wt;
        try {
          T = await $();
        } catch (V) {
          return g() ? Wt : so(V, { exhausted: !0 });
        }
      }
      return g() ? Wt : (a(), { ok: !0, accepted: T });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: l };
}
const mr = Symbol("wippy-form:element"), Gt = "data-wippy-artifact-id";
function Fu() {
  const e = ln(mr), t = U(e?.getAttribute(Gt) ?? null);
  if (e) {
    let n = null;
    Nt(() => {
      t.value = e.getAttribute(Gt), n = new MutationObserver(() => {
        t.value = e.getAttribute(Gt);
      }), n.observe(e, { attributes: !0, attributeFilter: [Gt] });
    }), un(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function zu(e, t) {
  const n = ln(mr);
  n && Ki(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function Hu(e) {
  const t = U(typeof navigator > "u" ? !0 : navigator.onLine);
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
const Uu = () => Vl(), qu = Ll;
var si = {
  name: "SpinnerIcon",
  extends: qe
};
function Yu(e) {
  return Zu(e) || Gu(e) || Wu(e) || Ku();
}
function Ku() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wu(e, t) {
  if (e) {
    if (typeof e == "string") return Bn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Bn(e, t) : void 0;
  }
}
function Gu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Zu(e) {
  if (Array.isArray(e)) return Bn(e);
}
function Bn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Qu(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Yu(t[0] || (t[0] = [I("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
si.render = Qu;
var Xu = `
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
`, Ju = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ue(n.value) && String(n.value).length === 1,
      "p-badge-dot": Be(n.value) && !r.$slots.default,
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
}, ed = oe.extend({
  name: "badge",
  style: Xu,
  classes: Ju
}), td = {
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
  style: ed,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Tt(e) {
  "@babel/helpers - typeof";
  return Tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Tt(e);
}
function lo(e, t, n) {
  return (t = nd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function nd(e) {
  var t = rd(e, "string");
  return Tt(t) == "symbol" ? t : t + "";
}
function rd(e, t) {
  if (Tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var li = {
  name: "Badge",
  extends: td,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ke(lo(lo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, od = ["data-p"];
function id(e, t, n, r, i, o) {
  return f(), v("span", b({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [q(e.$slots, "default", {}, function() {
    return [de(L(e.value), 1)];
  })], 16, od);
}
li.render = id;
var ad = `
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
function Pt(e) {
  "@babel/helpers - typeof";
  return Pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pt(e);
}
function Ve(e, t, n) {
  return (t = sd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sd(e) {
  var t = ld(e, "string");
  return Pt(t) == "symbol" ? t : t + "";
}
function ld(e, t) {
  if (Pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ud = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", Ve(Ve(Ve(Ve(Ve(Ve(Ve(Ve(Ve({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", Ve({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, dd = oe.extend({
  name: "button",
  style: ad,
  classes: ud
}), cd = {
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
  style: dd,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Et(e) {
  "@babel/helpers - typeof";
  return Et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Et(e);
}
function Se(e, t, n) {
  return (t = pd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pd(e) {
  var t = fd(e, "string");
  return Et(t) == "symbol" ? t : t + "";
}
function fd(e, t) {
  if (Et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var je = {
  name: "Button",
  extends: cd,
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
      return Be(this.fluid) ? !!this.$pcFluid : this.fluid;
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
    SpinnerIcon: si,
    Badge: li
  },
  directives: {
    ripple: ar
  }
}, md = ["data-p"], hd = ["data-p"];
function bd(e, t, n, r, i, o) {
  var a = He("SpinnerIcon"), l = He("Badge"), s = Jn("ripple");
  return e.asChild ? q(e.$slots, "default", {
    key: 1,
    class: z(e.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : Je((f(), N(we(e.as), b({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: Q(function() {
      return [q(e.$slots, "default", {}, function() {
        return [e.loading ? q(e.$slots, "loadingicon", b({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), v("span", b({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), N(a, b({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : q(e.$slots, "icon", b({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), v("span", b({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": o.dataIconP
          }, e.ptm("icon")), null, 16, md)) : A("", !0)];
        }), e.label ? (f(), v("span", b({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": o.dataLabelP
        }), L(e.label), 17, hd)) : A("", !0), e.badge ? (f(), N(l, {
          key: 3,
          value: e.badge,
          class: z(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
je.render = bd;
const rt = "text-danger-600 dark:text-danger-400", vd = "text-warn-700 dark:text-warn-400";
function gd(e) {
  return e === "error" ? rt : e === "warn" ? vd : void 0;
}
function ui(e) {
  const t = e.ownerDocument, n = t.activeElement;
  return !n || n === t.body || n === t.documentElement;
}
function O(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
function et(e, t) {
  return t ? `.w-form__${e}--${t}` : `.w-form__${e}`;
}
const yd = "Sending…", uo = "Sending your answers.", wd = 2e3;
var di = {
  name: "CheckIcon",
  extends: qe
};
function kd(e) {
  return Cd(e) || $d(e) || xd(e) || Sd();
}
function Sd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xd(e, t) {
  if (e) {
    if (typeof e == "string") return Rn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rn(e, t) : void 0;
  }
}
function $d(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Cd(e) {
  if (Array.isArray(e)) return Rn(e);
}
function Rn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Td(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), kd(t[0] || (t[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
di.render = Td;
var ci = {
  name: "MinusIcon",
  extends: qe
};
function Pd(e) {
  return Dd(e) || _d(e) || Od(e) || Ed();
}
function Ed() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Od(e, t) {
  if (e) {
    if (typeof e == "string") return jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jn(e, t) : void 0;
  }
}
function _d(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Dd(e) {
  if (Array.isArray(e)) return jn(e);
}
function jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ad(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Pd(t[0] || (t[0] = [I("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ci.render = Ad;
var Md = {
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
      return n.find(ue);
    }
  },
  computed: {
    $filled: function() {
      return ue(this.d_value);
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
  extends: Md,
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
}, Id = `
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
`, Vd = {
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
}, Ld = oe.extend({
  name: "checkbox",
  style: Id,
  classes: Vd
}), Nd = {
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
  style: Ld,
  provide: function() {
    return {
      $pcCheckbox: this,
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
function Bd(e, t, n) {
  return (t = Rd(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rd(e) {
  var t = jd(e, "string");
  return Ot(t) == "symbol" ? t : t + "";
}
function jd(e, t) {
  if (Ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Fd(e) {
  return qd(e) || Ud(e) || Hd(e) || zd();
}
function zd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hd(e, t) {
  if (e) {
    if (typeof e == "string") return Fn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fn(e, t) : void 0;
  }
}
function Ud(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function qd(e) {
  if (Array.isArray(e)) return Fn(e);
}
function Fn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var _t = {
  name: "Checkbox",
  extends: Nd,
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
          return !tr(o, n.value);
        }) : i = r ? [].concat(Fd(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(i, t) : this.writeValue(i, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : pa(this.value, t);
    },
    dataP: function() {
      return ke(Bd({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: di,
    MinusIcon: ci
  }
}, Yd = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Kd = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Wd = ["data-p"];
function Gd(e, t, n, r, i, o) {
  var a = He("CheckIcon"), l = He("MinusIcon");
  return f(), v("div", b({
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
  }, o.getPTOptions("input")), null, 16, Kd), I("div", b({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [q(e.$slots, "icon", {
    checked: o.checked,
    indeterminate: i.d_indeterminate,
    class: z(e.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (f(), N(a, b({
      key: 0,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : i.d_indeterminate ? (f(), N(l, b({
      key: 1,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : A("", !0)];
  })], 16, Wd)], 16, Yd);
}
_t.render = Gd;
function Zd(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, i) => ({ text: r, code: i % 2 === 1 })).filter((r) => r.text !== "");
}
function co(e) {
  return String(e).replaceAll("`", "");
}
function pi(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const Qd = ["part"], po = /* @__PURE__ */ ce({
  __name: "field-label",
  props: {
    tag: {},
    controlId: {},
    labelId: {},
    label: {},
    required: { type: Boolean }
  },
  setup(e) {
    const t = P(() => O("field-label")), n = P(() => O("field-marker"));
    return (r, i) => (f(), N(we(e.tag), {
      id: e.labelId,
      for: e.tag === "label" ? e.controlId : void 0,
      part: t.value.part,
      class: z(t.value.class)
    }, {
      default: Q(() => [
        de(L(e.label), 1),
        e.required ? (f(), v("span", {
          key: 0,
          part: n.value.part,
          class: z(`${n.value.class} ${y(rt)}`)
        }, " (required)", 10, Qd)) : A("", !0)
      ]),
      _: 1
    }, 8, ["id", "for", "part", "class"]));
  }
}), Xd = ["part"], Jd = ["part"], ec = ["part"], tc = ["part"], nc = ["part"], rc = { key: 0 }, oc = ["part"], ic = ["part"], ac = ["part"], sc = ["part"], lc = ["part"], jt = /* @__PURE__ */ ce({
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
    const n = e, r = Bt(), i = `${r}-control`, o = P(() => n.layout === "group" ? `${r}-label` : void 0), a = `${r}-desc`, l = `${r}-err`, s = U(null), d = P(() => !n.readonly && n.errors.length > 0), c = P(() => {
      const C = [];
      return n.field.description && C.push(a), d.value && C.push(l), C.length > 0 ? C.join(" ") : void 0;
    }), u = P(() => n.layout === "group" ? "fieldset" : "div"), p = P(() => n.layout === "group" ? "legend" : n.readonly ? "span" : "label"), m = P(() => n.layout === "inline" && !n.readonly), g = P(() => O(
      "field",
      n.layout !== "stacked" && n.layout,
      !!n.field.required && "required",
      d.value && "invalid",
      n.readonly && "readonly",
      n.disabled && "disabled"
    )), x = P(() => O("field-description")), $ = P(() => O("field-control")), T = P(() => O("field-error")), _ = P(() => O("field-row")), V = P(() => O("field-item")), k = P(() => !!n.field.required && !n.readonly), E = P(() => Ou(n.field, n.modelValue)), w = P(() => O("field-value", E.value.kind === "empty" && "empty")), D = P(() => O("field-note"));
    return t({
      /** Focuses the first focusable control, e.g. the first invalid field after a failed submit. */
      focusFirstControl() {
        s.value?.querySelector("input, textarea")?.focus();
      }
    }), (C, R) => (f(), N(we(u.value), {
      ref_key: "rootEl",
      ref: s,
      part: g.value.part,
      class: z(g.value.class),
      "aria-describedby": e.layout === "group" ? c.value : void 0
    }, {
      default: Q(() => [
        m.value ? (f(), v("div", {
          key: 0,
          part: _.value.part,
          class: z(_.value.class)
        }, [
          I("div", {
            part: $.value.part,
            class: z($.value.class)
          }, [
            q(C.$slots, "default", {
              id: i,
              describedBy: c.value,
              invalid: d.value,
              labelId: o.value
            })
          ], 10, Jd),
          F(po, {
            tag: "label",
            "control-id": i,
            label: e.field.label,
            required: k.value
          }, null, 8, ["label", "required"])
        ], 10, Xd)) : (f(), N(po, {
          key: 1,
          tag: p.value,
          "control-id": i,
          "label-id": o.value,
          label: e.field.label,
          required: k.value
        }, null, 8, ["tag", "label-id", "label", "required"])),
        e.field.description ? (f(), v("p", {
          key: 2,
          id: a,
          part: x.value.part,
          class: z(x.value.class)
        }, L(e.field.description), 11, ec)) : A("", !0),
        e.readonly ? (f(), v(Z, { key: 3 }, [
          E.value.kind === "empty" ? (f(), v("p", {
            key: 0,
            part: w.value.part,
            class: z(w.value.class)
          }, " Skipped ", 10, tc)) : E.value.kind === "text" ? (f(), v("p", {
            key: 1,
            part: w.value.part,
            class: z(w.value.class)
          }, [
            (f(!0), v(Z, null, he(y(pi)(E.value.text), (K, W) => (f(), v(Z, { key: W }, [
              W > 0 ? (f(), v("br", rc)) : A("", !0),
              de(L(K), 1)
            ], 64))), 128))
          ], 10, nc)) : (f(), v("div", {
            key: 2,
            part: w.value.part,
            class: z(w.value.class)
          }, [
            (f(!0), v(Z, null, he(E.value.items, (K, W) => (f(), v("p", {
              key: W,
              part: V.value.part,
              class: z(V.value.class)
            }, [
              de(L(K.own ? `Other: ${K.label}` : K.label) + " ", 1),
              K.note ? (f(), v("span", {
                key: 0,
                part: D.value.part,
                class: z(D.value.class)
              }, L(K.note), 11, ac)) : A("", !0)
            ], 10, ic))), 128))
          ], 10, oc))
        ], 64)) : m.value ? A("", !0) : (f(), v("div", {
          key: 4,
          part: $.value.part,
          class: z($.value.class)
        }, [
          q(C.$slots, "default", {
            id: i,
            describedBy: c.value,
            invalid: d.value,
            labelId: o.value
          })
        ], 10, sc)),
        d.value ? (f(), v("ul", {
          key: 5,
          id: l,
          part: T.value.part,
          class: z(`${T.value.class} ${y(rt)}`)
        }, [
          (f(!0), v(Z, null, he(e.errors, (K, W) => (f(), v("li", { key: W }, L(K.message), 1))), 128))
        ], 10, lc)) : A("", !0)
      ]),
      _: 3
    }, 8, ["part", "class", "aria-describedby"]));
  }
}), uc = /* @__PURE__ */ ce({
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
    const r = e, i = n, o = P(() => r.modelValue === !0), a = P(() => O("field-input"));
    function l(d) {
      return {
        input: {
          "aria-describedby": d,
          "aria-required": r.field.required ? "true" : void 0
        }
      };
    }
    const s = U(null);
    return t({ focusFirstControl: () => s.value?.focusFirstControl() }), (d, c) => (f(), N(jt, {
      ref_key: "shell",
      ref: s,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "inline"
    }, {
      default: Q(({ id: u, describedBy: p, invalid: m }) => [
        F(y(_t), {
          "model-value": o.value,
          binary: "",
          "input-id": u,
          disabled: e.disabled,
          invalid: m,
          pt: l(p),
          part: a.value.part,
          class: z(a.value.class),
          "onUpdate:modelValue": c[0] || (c[0] = (g) => i("update:modelValue", !!g))
        }, null, 8, ["model-value", "input-id", "disabled", "invalid", "pt", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var dc = `
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
`, cc = {
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
}, pc = oe.extend({
  name: "inputtext",
  style: dc,
  classes: cc
}), fc = {
  name: "BaseInputText",
  extends: Rt,
  style: pc,
  provide: function() {
    return {
      $pcInputText: this,
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
function mc(e, t, n) {
  return (t = hc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function hc(e) {
  var t = bc(e, "string");
  return Dt(t) == "symbol" ? t : t + "";
}
function bc(e, t) {
  if (Dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var At = {
  name: "InputText",
  extends: fc,
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
      return ke(mc({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, vc = ["value", "name", "disabled", "aria-invalid", "data-p"];
function gc(e, t, n, r, i, o) {
  return f(), v("input", b({
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
  }, o.attrs), null, 16, vc);
}
At.render = gc;
var yc = `
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
`, wc = {
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
}, kc = oe.extend({
  name: "radiobutton",
  style: yc,
  classes: wc
}), Sc = {
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
  style: kc,
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
function xc(e, t, n) {
  return (t = $c(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $c(e) {
  var t = Cc(e, "string");
  return Mt(t) == "symbol" ? t : t + "";
}
function Cc(e, t) {
  if (Mt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zn = {
  name: "RadioButton",
  extends: Sc,
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
      return t != null && (this.binary ? !!t : tr(t, this.value));
    },
    dataP: function() {
      return ke(xc({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Tc = ["data-p-checked", "data-p-disabled", "data-p"], Pc = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], Ec = ["data-p"], Oc = ["data-p"];
function _c(e, t, n, r, i, o) {
  return f(), v("div", b({
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
  }, o.getPTOptions("input")), null, 16, Pc), I("div", b({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [I("div", b({
    class: e.cx("icon")
  }, o.getPTOptions("icon"), {
    "data-p": o.dataP
  }), null, 16, Oc)], 16, Ec)], 16, Tc);
}
zn.render = _c;
const Dc = ["part", "role", "aria-labelledby", "aria-required"], Ac = ["part"], Mc = ["for", "part"], Ic = ["part"], Vc = ["part"], Lc = ["part"], Nc = ["part"], Bc = ["part"], Rc = ["for", "part"], jc = ["part"], Fc = ["part"], zc = ["part"], Hc = ["part"], Uc = /* @__PURE__ */ ce({
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
    const r = e, i = n, o = Bt(), a = `${o}-other`, l = `${a}-label`, s = `${o}-other-text`, d = `${s}-label`;
    function c(M) {
      return `${o}-opt-${M}`;
    }
    const u = U(null), p = U(null);
    function m(M) {
      return { input: { "aria-describedby": M } };
    }
    const g = P(() => O("field-options")), x = P(() => O("field-option")), $ = P(() => O("field-option", "other")), T = P(() => O("field-option-input")), _ = P(() => O("field-option-label")), V = P(() => O("field-option-description")), k = P(() => O("field-other")), E = P(() => O("field-other-input")), w = P(() => r.modelValue), D = P(() => r.errors.some((M) => M.code === "blank")), C = P(() => typeof w.value == "string" ? w.value : null), R = P(() => Ie(w.value));
    function K(M) {
      typeof M == "string" && i("update:modelValue", M);
    }
    function W() {
      i("update:modelValue", { other: Y.value });
    }
    const Y = U(mt(w.value));
    le(w, (M) => {
      r.field.multiple || (Y.value = mt(M));
    }), le(Y, (M) => {
      !r.field.multiple && R.value && i("update:modelValue", { other: M });
    });
    const ne = P(() => {
      const M = w.value;
      return Array.isArray(M) ? M.filter((G) => typeof G == "string") : [];
    }), re = P(() => r.field.multiple && qo(w.value)), ie = U(mt(w.value));
    le(w, (M) => {
      r.field.multiple && (ie.value = mt(M));
    });
    function pe(M, G, h) {
      const S = [...M];
      G && S.push({ other: h }), i("update:modelValue", S.length > 0 ? S : void 0);
    }
    function J(M, G) {
      const h = new Set(ne.value);
      G ? h.add(M) : h.delete(M), pe(r.field.options.filter((S) => h.has(S.value)).map((S) => S.value), re.value, ie.value);
    }
    function H(M) {
      pe(ne.value, M, ie.value);
    }
    return le(ie, (M) => {
      re.value && pe(ne.value, !0, M);
    }), t({
      focusFirstControl() {
        u.value?.focusFirstControl();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const M = p.value?.querySelector(`[id="${s}"]`);
        M ? M.focus() : u.value?.focusFirstControl();
      }
    }), (M, G) => (f(), N(jt, {
      ref_key: "shell",
      ref: u,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "group"
    }, {
      default: Q(({ invalid: h, describedBy: S, labelId: j }) => [
        I("div", {
          ref_key: "bodyEl",
          ref: p,
          part: g.value.part,
          class: z(g.value.class),
          role: e.field.multiple ? void 0 : "radiogroup",
          "aria-labelledby": e.field.multiple ? void 0 : j,
          "aria-required": !e.field.multiple && e.field.required ? "true" : void 0
        }, [
          e.field.multiple ? (f(), v(Z, { key: 1 }, [
            (f(!0), v(Z, null, he(e.field.options, (B, ae) => (f(), v("div", {
              key: B.value,
              part: x.value.part,
              class: z(x.value.class)
            }, [
              F(y(_t), {
                "model-value": ne.value.includes(B.value),
                binary: "",
                "input-id": c(ae),
                disabled: e.disabled,
                invalid: h,
                pt: m(S),
                part: T.value.part,
                class: z(T.value.class),
                "onUpdate:modelValue": (Ce) => J(B.value, !!Ce)
              }, null, 8, ["model-value", "input-id", "disabled", "invalid", "pt", "part", "class", "onUpdate:modelValue"]),
              I("label", {
                for: c(ae),
                part: _.value.part,
                class: z(_.value.class)
              }, [
                de(L(B.label) + " ", 1),
                B.description ? (f(), v("span", {
                  key: 0,
                  part: V.value.part,
                  class: z(V.value.class)
                }, L(B.description), 11, jc)) : A("", !0)
              ], 10, Rc)
            ], 10, Bc))), 128)),
            e.field.allow_other ? (f(), v("div", {
              key: 0,
              part: $.value.part,
              class: z($.value.class)
            }, [
              F(y(_t), {
                "model-value": re.value,
                binary: "",
                "input-id": a,
                disabled: e.disabled,
                invalid: h,
                pt: m(S),
                part: T.value.part,
                class: z(T.value.class),
                "onUpdate:modelValue": G[1] || (G[1] = (B) => H(!!B))
              }, null, 8, ["model-value", "disabled", "invalid", "pt", "part", "class"]),
              I("div", {
                part: k.value.part,
                class: z(k.value.class)
              }, [
                I("label", {
                  id: l,
                  for: a,
                  part: _.value.part,
                  class: z(_.value.class)
                }, "Other", 10, Hc),
                I("label", {
                  id: d,
                  for: s,
                  class: "sr-only"
                }, "Other answer"),
                F(y(At), {
                  id: s,
                  modelValue: ie.value,
                  "onUpdate:modelValue": G[2] || (G[2] = (B) => ie.value = B),
                  disabled: e.disabled || !re.value,
                  "aria-describedby": S,
                  invalid: h && D.value,
                  part: E.value.part,
                  class: z(E.value.class),
                  size: "small",
                  fluid: ""
                }, null, 8, ["modelValue", "disabled", "aria-describedby", "invalid", "part", "class"])
              ], 10, zc)
            ], 10, Fc)) : A("", !0)
          ], 64)) : (f(), v(Z, { key: 0 }, [
            (f(!0), v(Z, null, he(e.field.options, (B, ae) => (f(), v("div", {
              key: B.value,
              part: x.value.part,
              class: z(x.value.class)
            }, [
              F(y(zn), {
                "model-value": C.value,
                "input-id": c(ae),
                name: y(o),
                value: B.value,
                disabled: e.disabled,
                invalid: h,
                pt: m(S),
                part: T.value.part,
                class: z(T.value.class),
                "onUpdate:modelValue": K
              }, null, 8, ["model-value", "input-id", "name", "value", "disabled", "invalid", "pt", "part", "class"]),
              I("label", {
                for: c(ae),
                part: _.value.part,
                class: z(_.value.class)
              }, [
                de(L(B.label) + " ", 1),
                B.description ? (f(), v("span", {
                  key: 0,
                  part: V.value.part,
                  class: z(V.value.class)
                }, L(B.description), 11, Ic)) : A("", !0)
              ], 10, Mc)
            ], 10, Ac))), 128)),
            e.field.allow_other ? (f(), v("div", {
              key: 0,
              part: $.value.part,
              class: z($.value.class)
            }, [
              F(y(zn), {
                "model-value": R.value,
                binary: "",
                "input-id": a,
                name: y(o),
                disabled: e.disabled,
                invalid: h,
                pt: m(S),
                part: T.value.part,
                class: z(T.value.class),
                "onUpdate:modelValue": W
              }, null, 8, ["model-value", "name", "disabled", "invalid", "pt", "part", "class"]),
              I("div", {
                part: k.value.part,
                class: z(k.value.class)
              }, [
                I("label", {
                  id: l,
                  for: a,
                  part: _.value.part,
                  class: z(_.value.class)
                }, "Other", 10, Nc),
                I("label", {
                  id: d,
                  for: s,
                  class: "sr-only"
                }, "Other answer"),
                F(y(At), {
                  id: s,
                  modelValue: Y.value,
                  "onUpdate:modelValue": G[0] || (G[0] = (B) => Y.value = B),
                  disabled: e.disabled || !R.value,
                  "aria-describedby": S,
                  invalid: h && D.value,
                  part: E.value.part,
                  class: z(E.value.class),
                  size: "small",
                  fluid: ""
                }, null, 8, ["modelValue", "disabled", "aria-describedby", "invalid", "part", "class"])
              ], 10, Lc)
            ], 10, Vc)) : A("", !0)
          ], 64))
        ], 10, Dc)
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var fi = {
  name: "CalendarIcon",
  extends: qe
};
function qc(e) {
  return Gc(e) || Wc(e) || Kc(e) || Yc();
}
function Yc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kc(e, t) {
  if (e) {
    if (typeof e == "string") return Hn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Hn(e, t) : void 0;
  }
}
function Wc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gc(e) {
  if (Array.isArray(e)) return Hn(e);
}
function Hn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Zc(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), qc(t[0] || (t[0] = [I("path", {
    d: "M10.7838 1.51351H9.83783V0.567568C9.83783 0.417039 9.77804 0.272676 9.6716 0.166237C9.56516 0.0597971 9.42079 0 9.27027 0C9.11974 0 8.97538 0.0597971 8.86894 0.166237C8.7625 0.272676 8.7027 0.417039 8.7027 0.567568V1.51351H5.29729V0.567568C5.29729 0.417039 5.2375 0.272676 5.13106 0.166237C5.02462 0.0597971 4.88025 0 4.72973 0C4.5792 0 4.43484 0.0597971 4.3284 0.166237C4.22196 0.272676 4.16216 0.417039 4.16216 0.567568V1.51351H3.21621C2.66428 1.51351 2.13494 1.73277 1.74467 2.12305C1.35439 2.51333 1.13513 3.04266 1.13513 3.59459V11.9189C1.13513 12.4709 1.35439 13.0002 1.74467 13.3905C2.13494 13.7807 2.66428 14 3.21621 14H10.7838C11.3357 14 11.865 13.7807 12.2553 13.3905C12.6456 13.0002 12.8649 12.4709 12.8649 11.9189V3.59459C12.8649 3.04266 12.6456 2.51333 12.2553 2.12305C11.865 1.73277 11.3357 1.51351 10.7838 1.51351ZM3.21621 2.64865H4.16216V3.59459C4.16216 3.74512 4.22196 3.88949 4.3284 3.99593C4.43484 4.10237 4.5792 4.16216 4.72973 4.16216C4.88025 4.16216 5.02462 4.10237 5.13106 3.99593C5.2375 3.88949 5.29729 3.74512 5.29729 3.59459V2.64865H8.7027V3.59459C8.7027 3.74512 8.7625 3.88949 8.86894 3.99593C8.97538 4.10237 9.11974 4.16216 9.27027 4.16216C9.42079 4.16216 9.56516 4.10237 9.6716 3.99593C9.77804 3.88949 9.83783 3.74512 9.83783 3.59459V2.64865H10.7838C11.0347 2.64865 11.2753 2.74831 11.4527 2.92571C11.6301 3.10311 11.7297 3.34371 11.7297 3.59459V5.67568H2.27027V3.59459C2.27027 3.34371 2.36993 3.10311 2.54733 2.92571C2.72473 2.74831 2.96533 2.64865 3.21621 2.64865ZM10.7838 12.8649H3.21621C2.96533 12.8649 2.72473 12.7652 2.54733 12.5878C2.36993 12.4104 2.27027 12.1698 2.27027 11.9189V6.81081H11.7297V11.9189C11.7297 12.1698 11.6301 12.4104 11.4527 12.5878C11.2753 12.7652 11.0347 12.8649 10.7838 12.8649Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
fi.render = Zc;
var mi = {
  name: "ChevronDownIcon",
  extends: qe
};
function Qc(e) {
  return tp(e) || ep(e) || Jc(e) || Xc();
}
function Xc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jc(e, t) {
  if (e) {
    if (typeof e == "string") return Un(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Un(e, t) : void 0;
  }
}
function ep(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function tp(e) {
  if (Array.isArray(e)) return Un(e);
}
function Un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function np(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Qc(t[0] || (t[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
mi.render = np;
var hi = {
  name: "ChevronLeftIcon",
  extends: qe
};
function rp(e) {
  return sp(e) || ap(e) || ip(e) || op();
}
function op() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ip(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function ap(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function sp(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function lp(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), rp(t[0] || (t[0] = [I("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hi.render = lp;
var bi = {
  name: "ChevronRightIcon",
  extends: qe
};
function up(e) {
  return fp(e) || pp(e) || cp(e) || dp();
}
function dp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cp(e, t) {
  if (e) {
    if (typeof e == "string") return Yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yn(e, t) : void 0;
  }
}
function pp(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fp(e) {
  if (Array.isArray(e)) return Yn(e);
}
function Yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function mp(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), up(t[0] || (t[0] = [I("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
bi.render = mp;
var vi = {
  name: "ChevronUpIcon",
  extends: qe
};
function hp(e) {
  return yp(e) || gp(e) || vp(e) || bp();
}
function bp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vp(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function gp(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function yp(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function wp(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), hp(t[0] || (t[0] = [I("path", {
    d: "M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
vi.render = wp;
var hr = {
  name: "TimesIcon",
  extends: qe
};
function kp(e) {
  return Cp(e) || $p(e) || xp(e) || Sp();
}
function Sp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xp(e, t) {
  if (e) {
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function $p(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Cp(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Tp(e, t, n, r, i, o) {
  return f(), v("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), kp(t[0] || (t[0] = [I("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
hr.render = Tp;
var Pp = `
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
`, Ep = {
  root: function(t) {
    var n = t.props;
    return {
      position: n.appendTo === "self" || n.showClear ? "relative" : void 0
    };
  }
}, Op = {
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
      var l = typeof i.rawValue[0] == "string" ? n.parseValue(i.rawValue[0])[0] : i.rawValue[0], s = typeof i.rawValue[1] == "string" ? n.parseValue(i.rawValue[1])[0] : i.rawValue[1];
      a = n.isDateEquals(l, o) || n.isDateEquals(s, o) ? "p-datepicker-day-selected" : "p-datepicker-day-selected-range";
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
}, _p = oe.extend({
  name: "datepicker",
  style: Pp,
  classes: Op,
  inlineStyles: Ep
}), Dp = {
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
  style: _p,
  provide: function() {
    return {
      $pcDatePicker: this,
      $parentInstance: this
    };
  }
};
function fo(e, t, n) {
  return (t = Ap(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ap(e) {
  var t = Mp(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Mp(e, t) {
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
function xn(e) {
  return Lp(e) || Vp(e) || gi(e) || Ip();
}
function Ip() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vp(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Lp(e) {
  if (Array.isArray(e)) return Gn(e);
}
function $n(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = gi(e)) || t) {
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
  var o, a = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return a = d.done, d;
  }, e: function(d) {
    l = !0, o = d;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function gi(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var yi = {
  name: "DatePicker",
  extends: Dp,
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
        this.rawValue = typeof t == "string" ? this.safeParse(t) : t, this.updateCurrentMetaData(), !this.typeUpdate && !this.inline && this.input && (this.input.value = this.formatValue(this.rawValue)), this.typeUpdate = !1, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Be(t) ? "none" : "block");
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
    this.timePickerTimer && clearTimeout(this.timePickerTimer), this.destroyResponsiveStyleElement(), this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindMatchMediaListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && this.autoZIndex && bn.clear(this.overlay), this.overlay = null;
  },
  methods: {
    isSelected: function(t) {
      if (this.rawValue) {
        if (this.isSingleSelection())
          return this.isDateEquals(this.parseValueForComparison(this.rawValue), t);
        if (this.isMultipleSelection()) {
          var n = !1, r = $n(this.rawValue), i;
          try {
            for (r.s(); !(i = r.n()).done; ) {
              var o = i.value;
              if (n = this.isDateEquals(this.parseValueForComparison(o), t), n)
                break;
            }
          } catch (s) {
            r.e(s);
          } finally {
            r.f();
          }
          return n;
        } else if (this.isRangeSelection()) {
          var a = this.parseValueForComparison(this.rawValue[0]);
          if (this.rawValue[1]) {
            var l = this.parseValueForComparison(this.rawValue[1]);
            return this.isDateEquals(a, t) || this.isDateEquals(l, t) || this.isDateBetween(a, l, t);
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
        var i, o, a = (i = this.rawValue) !== null && i !== void 0 && i[0] ? this.parseValueForComparison(this.rawValue[0]) : null, l = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null;
        if (l) {
          var s = new Date(this.currentYear, t, 1), d = new Date(a.getFullYear(), a.getMonth(), 1), c = new Date(l.getFullYear(), l.getMonth(), 1);
          return s >= d && s <= c;
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
        var i, o, a = (i = this.rawValue) !== null && i !== void 0 && i[0] ? this.parseValueForComparison(this.rawValue[0]) : null, l = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null, s = a ? a.getFullYear() : null, d = l ? l.getFullYear() : null;
        return s === t || d === t || s < t && d > t;
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
        var l = new Date(r.year, r.month, r.day);
        return o.getTime() <= l.getTime() && a.getTime() >= l.getTime();
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
      var o = !0, a = !0, l = !0, s = !0;
      return i && !this.selectOtherMonths ? !1 : (this.minDate && (this.minDate.getFullYear() > r || this.minDate.getFullYear() === r && (this.minDate.getMonth() > n || this.minDate.getMonth() === n && this.minDate.getDate() > t)) && (o = !1), this.maxDate && (this.maxDate.getFullYear() < r || this.maxDate.getFullYear() === r && (this.maxDate.getMonth() < n || this.maxDate.getMonth() === n && this.maxDate.getDate() < t)) && (a = !1), this.disabledDates && (l = !this.isDateDisabled(t, n, r)), this.disabledDays && (s = !this.isDayDisabled(t, n, r)), o && a && l && s);
    },
    onOverlayEnter: function(t) {
      var n = this.inline ? void 0 : {
        position: "absolute",
        top: "0"
      };
      Ca(t, n), this.autoZIndex && bn.set("overlay", t, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), this.alignOverlay(), this.$emit("show");
    },
    onOverlayEnterComplete: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener();
    },
    onOverlayAfterLeave: function(t) {
      this.autoZIndex && bn.clear(t);
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
      this.scrollHandler || (this.scrollHandler = new Qs(this.$refs.container, function() {
        t.overlayVisible && (t.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Aa() && (t.overlayVisible = !1);
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
      this.overlay && (this.appendTo === "self" || this.inline ? Ta(this.overlay, this.$el) : (this.view === "date" ? (this.overlay.style.width = Zt(this.overlay) + "px", this.overlay.style.minWidth = Zt(this.$el) + "px") : this.overlay.style.width = Zt(this.$el) + "px", $a(this.overlay, this.$el)));
    },
    onButtonClick: function() {
      this.isEnabled() && (this.overlayVisible ? this.overlayVisible = !1 : (this.input.focus(), this.overlayVisible = !0));
    },
    isDateDisabled: function(t, n, r) {
      if (this.disabledDates) {
        var i = $n(this.disabledDates), o;
        try {
          for (i.s(); !(o = i.n()).done; ) {
            var a = o.value;
            if (a.getFullYear() === r && a.getMonth() === n && a.getDate() === t)
              return !0;
          }
        } catch (l) {
          i.e(l);
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
        i = this.rawValue ? [].concat(xn(this.rawValue), [r]) : [r];
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
      return ma(t) && ue(t) ? this.timeOnly ? n = this.formatTime(t) : (n = this.formatDate(t, this.datePattern), this.showTime && (n += " " + this.formatTime(t))) : this.updateModelType === "string" && (n = t), n;
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
      }, l = "", s = !1;
      if (t)
        for (r = 0; r < n.length; r++)
          if (s)
            n.charAt(r) === "'" && !i("'") ? s = !1 : l += n.charAt(r);
          else
            switch (n.charAt(r)) {
              case "d":
                l += o("d", t.getDate(), 2);
                break;
              case "D":
                l += a("D", t.getDay(), this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
                break;
              case "o":
                l += o("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3);
                break;
              case "m":
                l += o("m", t.getMonth() + 1, 2);
                break;
              case "M":
                l += a("M", t.getMonth(), this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
                break;
              case "y":
                l += i("y") ? t.getFullYear() : (t.getFullYear() % 100 < 10 ? "0" : "") + t.getFullYear() % 100;
                break;
              case "@":
                l += t.getTime();
                break;
              case "!":
                l += t.getTime() * 1e4 + this.ticksTo1970;
                break;
              case "'":
                i("'") ? l += "'" : s = !0;
                break;
              default:
                l += n.charAt(r);
            }
      return l;
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
      var l = o ? o.toDateString() : null;
      return !(this.minDate && l && this.minDate.toDateString() === l && (this.minDate.getHours() > a || this.minDate.getHours() === a && (this.minDate.getMinutes() > n || this.minDate.getMinutes() === n && this.minDate.getSeconds() > r)) || this.maxDate && l && this.maxDate.toDateString() === l && (this.maxDate.getHours() < a || this.maxDate.getHours() === a && (this.maxDate.getMinutes() < n || this.maxDate.getMinutes() === n && this.maxDate.getSeconds() < r)));
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
      this.isRangeSelection() && (n = this.rawValue ? this.rawValue[this.focusedDateIndex] || this.rawValue[0] : n), this.isMultipleSelection() && (n = this.rawValue ? this.rawValue[this.rawValue.length - 1] : n), n = n ? new Date(n.getTime()) : /* @__PURE__ */ new Date(), this.hourFormat == "12" ? this.currentHour === 12 ? n.setHours(this.pm ? 12 : 0) : n.setHours(this.pm ? this.currentHour + 12 : this.currentHour) : n.setHours(this.currentHour), n.setMinutes(this.currentMinute), n.setSeconds(this.currentSecond), this.isRangeSelection() && (this.rawValue && this.focusedDateIndex === 1 && this.rawValue[1] ? n = [this.rawValue[0], n] : this.rawValue && this.focusedDateIndex === 0 ? n = [n, this.rawValue[1]] : n = [n, null]), this.isMultipleSelection() && (n = this.rawValue ? [].concat(xn(this.rawValue.slice(0, -1)), [n]) : [n]), this.updateModel(n), this.$emit("date-select", n), setTimeout(function() {
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
        var i = $n(r), o;
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
        var l = t.split(" - ");
        n = [];
        for (var s = 0; s < l.length; s++)
          n[s] = this.parseDateTime(l[s].trim());
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
        var l = this.datePattern;
        this.showTime ? (n = this.parseDate(a[1], l), this.populateTime(n, a[2], a[3])) : n = this.parseDate(t, l);
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
      var o = parseInt(n[0]), a = parseInt(n[1]), l = this.showSeconds ? parseInt(n[2]) : null;
      if (isNaN(o) || isNaN(a) || o > 23 || a > 59 || this.hourFormat == "12" && o > 12 || this.showSeconds && (isNaN(l) || l > 59))
        throw "Invalid time";
      return this.hourFormat == "12" && o !== 12 && this.pm ? o += 12 : this.hourFormat == "12" && o == 12 && !this.pm && (o = 0), {
        hour: o,
        minute: a,
        second: l
      };
    },
    parseDate: function(t, n) {
      if (n == null || t == null)
        throw "Invalid arguments";
      if (t = lt(t) === "object" ? t.toString() : t + "", t === "")
        return null;
      var r, i, o, a = 0, l = typeof this.shortYearCutoff != "string" ? this.shortYearCutoff : (/* @__PURE__ */ new Date()).getFullYear() % 100 + parseInt(this.shortYearCutoff, 10), s = -1, d = -1, c = -1, u = -1, p = !1, m, g = function(V) {
        var k = r + 1 < n.length && n.charAt(r + 1) === V;
        return k && r++, k;
      }, x = function(V) {
        var k = g(V), E = V === "@" ? 14 : V === "!" ? 20 : V === "y" && k ? 4 : V === "o" ? 3 : 2, w = V === "y" ? E : 1, D = new RegExp("^\\d{" + w + "," + E + "}"), C = t.substring(a).match(D);
        if (!C)
          throw "Missing number at position " + a;
        return a += C[0].length, parseInt(C[0], 10);
      }, $ = function(V, k, E) {
        for (var w = -1, D = g(V) ? E : k, C = [], R = 0; R < D.length; R++)
          C.push([R, D[R]]);
        C.sort(function(Y, ne) {
          return -(Y[1].length - ne[1].length);
        });
        for (var K = 0; K < C.length; K++) {
          var W = C[K][1];
          if (t.substr(a, W.length).toLowerCase() === W.toLowerCase()) {
            w = C[K][0], a += W.length;
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
              c = x("d");
              break;
            case "D":
              $("D", this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
              break;
            case "o":
              u = x("o");
              break;
            case "m":
              d = x("m");
              break;
            case "M":
              d = $("M", this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
              break;
            case "y":
              s = x("y");
              break;
            case "@":
              m = new Date(x("@")), s = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "!":
              m = new Date((x("!") - this.ticksTo1970) / 1e4), s = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "'":
              g("'") ? T() : p = !0;
              break;
            default:
              T();
          }
      if (a < t.length && (o = t.substr(a), !/^\s+/.test(o)))
        throw "Extra/unparsed characters found in date: " + o;
      if (s === -1 ? s = (/* @__PURE__ */ new Date()).getFullYear() : s < 100 && (s += (/* @__PURE__ */ new Date()).getFullYear() - (/* @__PURE__ */ new Date()).getFullYear() % 100 + (s <= l ? 0 : -100)), u > -1) {
        d = 1, c = u;
        do {
          if (i = this.getDaysCountInMonth(d - 1, s), c <= i)
            break;
          d++, c -= i;
        } while (!0);
      }
      if (m = this.daylightSavingAdjust(new Date(s, d - 1, c)), m.getFullYear() !== s || m.getMonth() + 1 !== d || m.getDate() !== c)
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
          var l = o.parentElement.nextElementSibling;
          if (l) {
            var s = ct(o.parentElement), d = Array.from(o.parentElement.parentElement.children), c = d.slice(s + 1), u = c.find(function(J) {
              var H = J.children[a].children[0];
              return !Xe(H, "data-p-disabled");
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
              var g = ct(o.parentElement), x = Array.from(o.parentElement.parentElement.children), $ = x.slice(0, g).reverse(), T = $.find(function(J) {
                var H = J.children[a].children[0];
                return !Xe(H, "data-p-disabled");
              });
              if (T) {
                var _ = T.children[a].children[0];
                _.tabIndex = "0", _.focus();
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
          var V = o.previousElementSibling;
          if (V) {
            var k = Array.from(o.parentElement.children), E = k.slice(0, a).reverse(), w = E.find(function(J) {
              var H = J.children[0];
              return !Xe(H, "data-p-disabled");
            });
            if (w) {
              var D = w.children[0];
              D.tabIndex = "0", D.focus();
            } else
              this.navigateToMonth(t, !0, r);
          } else
            this.navigateToMonth(t, !0, r);
          t.preventDefault();
          break;
        }
        case "ArrowRight": {
          i.tabIndex = "-1";
          var C = o.nextElementSibling;
          if (C) {
            var R = Array.from(o.parentElement.children), K = R.slice(a + 1), W = K.find(function(J) {
              var H = J.children[0];
              return !Xe(H, "data-p-disabled");
            });
            if (W) {
              var Y = W.children[0];
              Y.tabIndex = "0", Y.focus();
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
          var ne = o.parentElement, re = ne.children[0].children[0];
          Xe(re, "data-p-disabled") ? this.navigateToMonth(t, !0, r) : (re.tabIndex = "0", re.focus()), t.preventDefault();
          break;
        }
        case "End": {
          i.tabIndex = "-1";
          var ie = o.parentElement, pe = ie.children[ie.children.length - 1].children[0];
          Xe(pe, "data-p-disabled") ? this.navigateToMonth(t, !1, r) : (pe.tabIndex = "0", pe.focus()), t.preventDefault();
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
        var l = this.overlay.children[r + 1], s = Oe(l, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        s.tabIndex = "0", s.focus();
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
          var l = r.previousElementSibling;
          l ? (l.tabIndex = "0", l.focus()) : (this.navigationState = {
            backward: !0
          }, this.navBackward(t)), t.preventDefault();
          break;
        }
        case "ArrowRight": {
          r.tabIndex = "-1";
          var s = r.nextElementSibling;
          s ? (s.tabIndex = "0", s.focus()) : (this.navigationState = {
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
          var l = r.previousElementSibling;
          l ? (l.tabIndex = "0", l.focus()) : (this.navigationState = {
            backward: !0
          }, this.navBackward(t)), t.preventDefault();
          break;
        }
        case "ArrowRight": {
          r.tabIndex = "-1";
          var s = r.nextElementSibling;
          s ? (s.tabIndex = "0", s.focus()) : (this.navigationState = {
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
            this.currentView === "month" ? t = Oe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]:not([data-p-disabled="true"])') : this.currentView === "year" ? t = Oe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]:not([data-p-disabled="true"])') : t = Oe(this.overlay, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
          t && (t.tabIndex = "0", t.focus());
        }
        this.navigationState = null;
      } else
        this.initFocusableCell();
    },
    initFocusableCell: function() {
      var t;
      if (this.currentView === "month") {
        var n = Ke(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]'), r = Oe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"][data-p-selected="true"]');
        n.forEach(function(l) {
          return l.tabIndex = -1;
        }), t = r || n[0];
      } else if (this.currentView === "year") {
        var i = Ke(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]'), o = Oe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"][data-p-selected="true"]');
        i.forEach(function(l) {
          return l.tabIndex = -1;
        }), t = o || i[0];
      } else if (t = Oe(this.overlay, 'span[data-p-selected="true"]'), !t) {
        var a = Oe(this.overlay, 'td[data-p-today="true"] span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        a ? t = a : t = Oe(this.overlay, '.p-datepicker-calendar td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
      }
      t && (t.tabIndex = "0", !this.preventFocus && this.overlay && !this.overlay.contains(document.activeElement) && t.focus(), this.preventFocus = !1);
    },
    trapFocus: function(t) {
      t.preventDefault();
      var n = Cr(this.overlay);
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
        this.selectionStart = this.input.selectionStart, this.selectionEnd = this.input.selectionEnd, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Be(t.target.value) ? "none" : "block");
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
      }), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r), this.focused = !1, t.target.value = this.formatValue(this.rawValue), (i = this.$refs.clearIcon) !== null && i !== void 0 && (i = i.$el) !== null && i !== void 0 && i.style && (this.$refs.clearIcon.$el.style.display = Be(t.target.value) ? "none" : "block");
    },
    onKeyDown: function(t) {
      if (t.code === "ArrowDown" && this.overlay)
        this.trapFocus(t);
      else if (t.code === "ArrowDown" && !this.overlay)
        this.overlayVisible = !0;
      else if (t.code === "Escape")
        this.overlayVisible && (this.overlayVisible = !1, t.preventDefault(), t.stopPropagation());
      else if (t.code === "Tab")
        this.overlay && Cr(this.overlay).forEach(function(i) {
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
      t.stopPropagation(), this.inline || Xs.emit("overlay-click", {
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
          this.responsiveStyleElement = document.createElement("style"), this.responsiveStyleElement.type = "text/css", Po(this.responsiveStyleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.body.appendChild(this.responsiveStyleElement);
        }
        var n = "";
        if (this.responsiveOptions)
          for (var r = ba(), i = xn(this.responsiveOptions).filter(function(u) {
            return !!(u.breakpoint && u.numMonths);
          }).sort(function(u, p) {
            return -1 * r(u.breakpoint, p.breakpoint);
          }), o = 0; o < i.length; o++) {
            for (var a = i[o], l = a.breakpoint, s = a.numMonths, d = `
                            .p-datepicker-panel[`.concat(this.$attrSelector, "] .p-datepicker-calendar:nth-child(").concat(s, `) .p-datepicker-next-button {
                                display: inline-flex;
                            }
                        `), c = s; c < this.numberOfMonths; c++)
              d += `
                                .p-datepicker-panel[`.concat(this.$attrSelector, "] .p-datepicker-calendar:nth-child(").concat(c + 1, `) {
                                    display: none;
                                }
                            `);
            n += `
                            @media screen and (max-width: `.concat(l, `) {
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
        for (var o = [], a = this.getFirstDayOfMonthIndex(r, i), l = this.getDaysCountInMonth(r, i), s = this.getDaysCountInPrevMonth(r, i), d = 1, c = /* @__PURE__ */ new Date(), u = [], p = Math.ceil((l + a) / 7), m = 0; m < p; m++) {
          var g = [];
          if (m == 0) {
            for (var x = s - a + 1; x <= s; x++) {
              var $ = this.getPreviousMonthAndYear(r, i);
              g.push({
                day: x,
                month: $.month,
                year: $.year,
                otherMonth: !0,
                today: this.isToday(c, x, $.month, $.year),
                selectable: this.isSelectable(x, $.month, $.year, !0)
              });
            }
            for (var T = 7 - g.length, _ = 0; _ < T; _++)
              g.push({
                day: d,
                month: r,
                year: i,
                today: this.isToday(c, d, r, i),
                selectable: this.isSelectable(d, r, i, !1)
              }), d++;
          } else
            for (var V = 0; V < 7; V++) {
              if (d > l) {
                var k = this.getNextMonthAndYear(r, i);
                g.push({
                  day: d - l,
                  month: k.month,
                  year: k.year,
                  otherMonth: !0,
                  today: this.isToday(c, d - l, k.month, k.year),
                  selectable: this.isSelectable(d - l, k.month, k.year, !0)
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
          var l = t.minDate.getMonth(), s = t.minDate.getFullYear();
          if (t.currentYear < s || t.currentYear === s && a < l)
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
      for (var t = this, n = [], r = this.currentYear - this.currentYear % 10, i = function(l) {
        return !(t.minDate && t.minDate.getFullYear() > l || t.maxDate && t.maxDate.getFullYear() < l);
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
      return ke(fo({
        inline: this.inline
      }, "portal-" + this.appendTo, "portal-" + this.appendTo));
    },
    inputIconDataP: function() {
      return ke(fo({}, this.size, this.size));
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
    InputText: At,
    Button: je,
    Portal: ir,
    CalendarIcon: fi,
    ChevronLeftIcon: hi,
    ChevronRightIcon: bi,
    ChevronUpIcon: vi,
    ChevronDownIcon: mi,
    TimesIcon: hr
  },
  directives: {
    ripple: ar
  }
}, Np = ["id", "data-p"], Bp = ["disabled", "aria-label", "aria-expanded", "aria-controls"], Rp = ["data-p"], jp = ["id", "role", "aria-modal", "aria-label", "data-p"], Fp = ["disabled", "aria-label"], zp = ["disabled", "aria-label"], Hp = ["disabled", "aria-label"], Up = ["disabled", "aria-label"], qp = ["data-p-disabled"], Yp = ["abbr"], Kp = ["data-p-disabled"], Wp = ["aria-label", "data-p-today", "data-p-other-month"], Gp = ["onClick", "onKeydown", "aria-selected", "aria-disabled", "data-p"], Zp = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], Qp = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], Xp = ["data-p"];
function Jp(e, t, n, r, i, o) {
  var a = He("InputText"), l = He("TimesIcon"), s = He("Button"), d = He("Portal"), c = Jn("ripple");
  return f(), v("span", b({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    style: e.sx("root"),
    "data-p": o.containerDataP
  }, e.ptmi("root")), [e.inline ? A("", !0) : (f(), N(a, {
    key: 0,
    ref: o.inputRef,
    id: e.inputId,
    role: "combobox",
    class: z([e.inputClass, e.cx("pcInputText")]),
    style: Wi(e.inputStyle),
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
  }, null, 8, ["id", "class", "style", "defaultValue", "placeholder", "name", "size", "invalid", "variant", "fluid", "required", "unstyled", "aria-expanded", "aria-controls", "aria-labelledby", "aria-label", "disabled", "readonly", "onInput", "onClick", "onFocus", "onBlur", "onKeydown", "data-p-has-dropdown", "data-p-has-e-icon", "pt"])), e.showClear && !e.inline ? q(e.$slots, "clearicon", {
    key: 1,
    class: z(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [F(l, b({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: o.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : A("", !0), e.showIcon && e.iconDisplay === "button" && !e.inline ? q(e.$slots, "dropdownbutton", {
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
    }, e.ptm("dropdown")), [q(e.$slots, "dropdownicon", {
      class: z(e.icon)
    }, function() {
      return [(f(), N(we(e.icon ? "span" : "CalendarIcon"), b({
        class: e.icon
      }, e.ptm("dropdownIcon")), null, 16, ["class"]))];
    })], 16, Bp)];
  }) : e.showIcon && e.iconDisplay === "input" && !e.inline ? (f(), v(Z, {
    key: 3
  }, [e.$slots.inputicon || e.showIcon ? (f(), v("span", b({
    key: 0,
    class: e.cx("inputIconContainer"),
    "data-p": o.inputIconDataP
  }, e.ptm("inputIconContainer")), [q(e.$slots, "inputicon", {
    class: z(e.cx("inputIcon")),
    clickCallback: o.onButtonClick
  }, function() {
    return [(f(), N(we(e.icon ? "i" : "CalendarIcon"), b({
      class: [e.icon, e.cx("inputIcon")],
      onClick: o.onButtonClick
    }, e.ptm("inputicon")), null, 16, ["class", "onClick"]))];
  })], 16, Rp)) : A("", !0)], 64)) : A("", !0), F(d, {
    appendTo: e.appendTo,
    disabled: e.inline
  }, {
    default: Q(function() {
      return [F(go, b({
        name: "p-anchored-overlay",
        onEnter: t[58] || (t[58] = function(u) {
          return o.onOverlayEnter(u);
        }),
        onAfterEnter: o.onOverlayEnterComplete,
        onAfterLeave: o.onOverlayAfterLeave,
        onLeave: o.onOverlayLeave
      }, e.ptm("transition")), {
        default: Q(function() {
          return [e.inline || i.overlayVisible ? (f(), v("div", b({
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
          }, e.ptm("panel")), [e.timeOnly ? A("", !0) : (f(), v(Z, {
            key: 0
          }, [I("div", b({
            class: e.cx("calendarContainer")
          }, e.ptm("calendarContainer")), [(f(!0), v(Z, null, he(o.months, function(u, p) {
            return f(), v("div", b({
              key: u.month + u.year,
              class: e.cx("calendar")
            }, {
              ref_for: !0
            }, e.ptm("calendar")), [I("div", b({
              class: e.cx("header")
            }, {
              ref_for: !0
            }, e.ptm("header")), [q(e.$slots, "header"), q(e.$slots, "prevbutton", {
              actionCallback: function(g) {
                return o.onPrevButtonClick(g);
              },
              keydownCallback: function(g) {
                return o.onContainerButtonKeydown(g);
              }
            }, function() {
              return [Je(F(s, b({
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
                icon: Q(function(m) {
                  return [q(e.$slots, "previcon", {}, function() {
                    return [(f(), N(we(e.prevIcon ? "span" : "ChevronLeftIcon"), b({
                      class: [e.prevIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcPrevButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[wr, p === 0]])];
            }), I("div", b({
              class: e.cx("title")
            }, {
              ref_for: !0
            }, e.ptm("title")), [e.$primevue.config.locale.showMonthAfterYear ? (f(), v(Z, {
              key: 0
            }, [i.currentView !== "year" ? (f(), v("button", b({
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
            }), L(o.getYear(u)), 17, Fp)) : A("", !0), i.currentView === "date" ? (f(), v("button", b({
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
            }), L(o.getMonthName(u.month)), 17, zp)) : A("", !0)], 64)) : (f(), v(Z, {
              key: 1
            }, [i.currentView === "date" ? (f(), v("button", b({
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
            }), L(o.getMonthName(u.month)), 17, Hp)) : A("", !0), i.currentView !== "year" ? (f(), v("button", b({
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
            }), L(o.getYear(u)), 17, Up)) : A("", !0)], 64)), i.currentView === "year" ? (f(), v("span", b({
              key: 2,
              class: e.cx("decade")
            }, {
              ref_for: !0
            }, e.ptm("decade")), [q(e.$slots, "decade", {
              years: o.yearPickerValues
            }, function() {
              return [de(L(o.yearPickerValues[0].value) + " - " + L(o.yearPickerValues[o.yearPickerValues.length - 1].value), 1)];
            })], 16)) : A("", !0)], 16), q(e.$slots, "nextbutton", {
              actionCallback: function(g) {
                return o.onNextButtonClick(g);
              },
              keydownCallback: function(g) {
                return o.onContainerButtonKeydown(g);
              }
            }, function() {
              return [Je(F(s, b({
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
                icon: Q(function(m) {
                  return [q(e.$slots, "nexticon", {}, function() {
                    return [(f(), N(we(e.nextIcon ? "span" : "ChevronRightIcon"), b({
                      class: [e.nextIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcNextButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[wr, e.numberOfMonths === 1 ? !0 : p === e.numberOfMonths - 1]])];
            })], 16), i.currentView === "date" ? (f(), v("table", b({
              key: 0,
              class: e.cx("dayView"),
              role: "grid"
            }, {
              ref_for: !0
            }, e.ptm("dayView")), [I("thead", b({
              ref_for: !0
            }, e.ptm("tableHeader")), [I("tr", b({
              ref_for: !0
            }, e.ptm("tableHeaderRow")), [e.showWeek ? (f(), v("th", b({
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
            }), [q(e.$slots, "weekheaderlabel", {}, function() {
              return [I("span", b({
                ref_for: !0
              }, e.ptm("weekHeaderLabel", {
                context: {
                  disabled: e.showWeek
                }
              }), {
                "data-pc-group-section": "tableheadercelllabel"
              }), L(o.weekHeaderLabel), 17)];
            })], 16, qp)) : A("", !0), (f(!0), v(Z, null, he(o.weekDays, function(m) {
              return f(), v("th", b({
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
              }), L(m), 17)], 16, Yp);
            }), 128))], 16)], 16), I("tbody", b({
              ref_for: !0
            }, e.ptm("tableBody")), [(f(!0), v(Z, null, he(u.dates, function(m, g) {
              return f(), v("tr", b({
                key: m[0].day + "" + m[0].month
              }, {
                ref_for: !0
              }, e.ptm("tableBodyRow")), [e.showWeek ? (f(), v("td", b({
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
              }), [q(e.$slots, "weeklabel", {
                weekNumber: u.weekNumbers[g]
              }, function() {
                return [u.weekNumbers[g] < 10 ? (f(), v("span", b({
                  key: 0,
                  style: {
                    visibility: "hidden"
                  }
                }, {
                  ref_for: !0
                }, e.ptm("weekLabel")), "0", 16)) : A("", !0), de(" " + L(u.weekNumbers[g]), 1)];
              })], 16, Kp)], 16)) : A("", !0), (f(!0), v(Z, null, he(m, function(x) {
                return f(), v("td", b({
                  key: x.day + "" + x.month,
                  "aria-label": x.day,
                  class: e.cx("dayCell", {
                    date: x
                  })
                }, {
                  ref_for: !0
                }, e.ptm("dayCell", {
                  context: {
                    date: x,
                    today: x.today,
                    otherMonth: x.otherMonth,
                    selected: o.isSelected(x),
                    disabled: !x.selectable
                  }
                }), {
                  "data-p-today": x.today,
                  "data-p-other-month": x.otherMonth,
                  "data-pc-group-section": "tablebodycell"
                }), [e.showOtherMonths || !x.otherMonth ? Je((f(), v("span", b({
                  key: 0,
                  class: e.cx("day", {
                    date: x
                  }),
                  onClick: function(T) {
                    return o.onDateSelect(T, x);
                  },
                  draggable: "false",
                  onKeydown: function(T) {
                    return o.onDateCellKeydown(T, x, p);
                  },
                  "aria-selected": o.isSelected(x),
                  "aria-disabled": !x.selectable
                }, {
                  ref_for: !0
                }, e.ptm("day", {
                  context: {
                    date: x,
                    today: x.today,
                    otherMonth: x.otherMonth,
                    selected: o.isSelected(x),
                    disabled: !x.selectable
                  }
                }), {
                  "data-p": o.dayDataP(x),
                  "data-pc-group-section": "tablebodycelllabel"
                }), [q(e.$slots, "date", {
                  date: x
                }, function() {
                  return [de(L(x.day), 1)];
                })], 16, Gp)), [[c]]) : A("", !0), o.isSelected(x) ? (f(), v("div", b({
                  key: 1,
                  class: "p-hidden-accessible",
                  "aria-live": "polite"
                }, {
                  ref_for: !0
                }, e.ptm("hiddenSelectedDay"), {
                  "data-p-hidden-accessible": !0
                }), L(x.day), 17)) : A("", !0)], 16, Wp);
              }), 128))], 16);
            }), 128))], 16)], 16)) : A("", !0)], 16);
          }), 128))], 16), i.currentView === "month" ? (f(), v("div", b({
            key: 0,
            class: e.cx("monthView")
          }, e.ptm("monthView")), [(f(!0), v(Z, null, he(o.monthPickerValues, function(u, p) {
            return Je((f(), v("span", b({
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
            }), [de(L(u.value) + " ", 1), o.isMonthSelected(p) ? (f(), v("div", b({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenMonth"), {
              "data-p-hidden-accessible": !0
            }), L(u.value), 17)) : A("", !0)], 16, Zp)), [[c]]);
          }), 128))], 16)) : A("", !0), i.currentView === "year" ? (f(), v("div", b({
            key: 1,
            class: e.cx("yearView")
          }, e.ptm("yearView")), [(f(!0), v(Z, null, he(o.yearPickerValues, function(u) {
            return Je((f(), v("span", b({
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
            }), [de(L(u.value) + " ", 1), o.isYearSelected(u.value) ? (f(), v("div", b({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenYear"), {
              "data-p-hidden-accessible": !0
            }), L(u.value), 17)) : A("", !0)], 16, Qp)), [[c]]);
          }), 128))], 16)) : A("", !0)], 64)), (e.showTime || e.timeOnly) && i.currentView === "date" ? (f(), v("div", b({
            key: 1,
            class: e.cx("timePicker"),
            "data-p": o.timePickerDataP
          }, e.ptm("timePicker")), [I("div", b({
            class: e.cx("hourPicker")
          }, e.ptm("hourPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [q(e.$slots, "hourincrementbutton", {
            callbacks: o.hourIncrementCallbacks
          }, function() {
            return [F(s, b({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.nextHour,
              unstyled: e.unstyled,
              onMousedown: t[9] || (t[9] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }),
              onMouseup: t[10] || (t[10] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[12] || (t[12] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["enter"])), t[13] || (t[13] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["space"]))],
              onMouseleave: t[11] || (t[11] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[14] || (t[14] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[15] || (t[15] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "incrementicon", {}, function() {
                  return [(f(), N(we(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
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
          }), L(o.formattedCurrentHour), 17), q(e.$slots, "hourdecrementbutton", {
            callbacks: o.hourDecrementCallbacks
          }, function() {
            return [F(s, b({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.prevHour,
              unstyled: e.unstyled,
              onMousedown: t[16] || (t[16] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }),
              onMouseup: t[17] || (t[17] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[19] || (t[19] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["enter"])), t[20] || (t[20] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["space"]))],
              onMouseleave: t[18] || (t[18] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[21] || (t[21] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[22] || (t[22] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "decrementicon", {}, function() {
                  return [(f(), N(we(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
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
          }), L(e.timeSeparator), 17)], 16), I("div", b({
            class: e.cx("minutePicker")
          }, e.ptm("minutePicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [q(e.$slots, "minuteincrementbutton", {
            callbacks: o.minuteIncrementCallbacks
          }, function() {
            return [F(s, b({
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
              onKeydown: [o.onContainerButtonKeydown, t[26] || (t[26] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["enter"])), t[27] || (t[27] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["space"]))],
              onMouseleave: t[25] || (t[25] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[28] || (t[28] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[29] || (t[29] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "incrementicon", {}, function() {
                  return [(f(), N(we(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
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
          }), L(o.formattedCurrentMinute), 17), q(e.$slots, "minutedecrementbutton", {
            callbacks: o.minuteDecrementCallbacks
          }, function() {
            return [F(s, b({
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
              onKeydown: [o.onContainerButtonKeydown, t[33] || (t[33] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["enter"])), t[34] || (t[34] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["space"]))],
              onMouseleave: t[32] || (t[32] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[35] || (t[35] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[36] || (t[36] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "decrementicon", {}, function() {
                  return [(f(), N(we(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16), e.showSeconds ? (f(), v("div", b({
            key: 0,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", b(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), L(e.timeSeparator), 17)], 16)) : A("", !0), e.showSeconds ? (f(), v("div", b({
            key: 1,
            class: e.cx("secondPicker")
          }, e.ptm("secondPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [q(e.$slots, "secondincrementbutton", {
            callbacks: o.secondIncrementCallbacks
          }, function() {
            return [F(s, b({
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
              onKeydown: [o.onContainerButtonKeydown, t[40] || (t[40] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["enter"])), t[41] || (t[41] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["space"]))],
              onMouseleave: t[39] || (t[39] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[42] || (t[42] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[43] || (t[43] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "incrementicon", {}, function() {
                  return [(f(), N(we(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
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
          }), L(o.formattedCurrentSecond), 17), q(e.$slots, "seconddecrementbutton", {
            callbacks: o.secondDecrementCallbacks
          }, function() {
            return [F(s, b({
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
              onKeydown: [o.onContainerButtonKeydown, t[47] || (t[47] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["enter"])), t[48] || (t[48] = fe(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["space"]))],
              onMouseleave: t[46] || (t[46] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[49] || (t[49] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[50] || (t[50] = fe(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Q(function(u) {
                return [q(e.$slots, "decrementicon", {}, function() {
                  return [(f(), N(we(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16)) : A("", !0), e.hourFormat == "12" ? (f(), v("div", b({
            key: 2,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", b(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), L(e.timeSeparator), 17)], 16)) : A("", !0), e.hourFormat == "12" ? (f(), v("div", b({
            key: 3,
            class: e.cx("ampmPicker")
          }, e.ptm("ampmPicker")), [q(e.$slots, "ampmincrementbutton", {
            toggleCallback: function(p) {
              return o.toggleAMPM(p);
            },
            keydownCallback: function(p) {
              return o.onContainerButtonKeydown(p);
            }
          }, function() {
            return [F(s, b({
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
              icon: Q(function(u) {
                return [q(e.$slots, "incrementicon", {
                  class: z(e.cx("incrementIcon"))
                }, function() {
                  return [(f(), N(we(e.incrementIcon ? "span" : "ChevronUpIcon"), b({
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
          }), L(i.pm ? e.$primevue.config.locale.pm : e.$primevue.config.locale.am), 17), q(e.$slots, "ampmdecrementbutton", {
            toggleCallback: function(p) {
              return o.toggleAMPM(p);
            },
            keydownCallback: function(p) {
              return o.onContainerButtonKeydown(p);
            }
          }, function() {
            return [F(s, b({
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
              icon: Q(function(u) {
                return [q(e.$slots, "decrementicon", {
                  class: z(e.cx("decrementIcon"))
                }, function() {
                  return [(f(), N(we(e.decrementIcon ? "span" : "ChevronDownIcon"), b({
                    class: [e.cx("decrementIcon"), u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "onKeydown", "pt"])];
          })], 16)) : A("", !0)], 16, Xp)) : A("", !0), e.showButtonBar ? (f(), v("div", b({
            key: 2,
            class: e.cx("buttonbar")
          }, e.ptm("buttonbar")), [q(e.$slots, "buttonbar", {
            todayCallback: function(p) {
              return o.onTodayButtonClick(p);
            },
            clearCallback: function(p) {
              return o.onClearButtonClick(p);
            }
          }, function() {
            return [q(e.$slots, "todaybutton", {
              actionCallback: function(p) {
                return o.onTodayButtonClick(p);
              },
              keydownCallback: function(p) {
                return o.onContainerButtonKeydown(p);
              }
            }, function() {
              return [F(s, b({
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
            }), q(e.$slots, "clearbutton", {
              actionCallback: function(p) {
                return o.onClearButtonClick(p);
              },
              keydownCallback: function(p) {
                return o.onContainerButtonKeydown(p);
              }
            }, function() {
              return [F(s, b({
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
          })], 16)) : A("", !0), q(e.$slots, "footer")], 16, jp)) : A("", !0)];
        }),
        _: 3
      }, 16, ["onAfterEnter", "onAfterLeave", "onLeave"])];
    }),
    _: 3
  }, 8, ["appendTo", "disabled"])], 16, Np);
}
yi.render = Jp;
const Cn = "0100-01-01", ef = 'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]', tf = /* @__PURE__ */ ce({
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
    function o(h) {
      return typeof h == "string" ? h : "";
    }
    const a = U(o(r.modelValue));
    function l(h) {
      if (!h || !ze(h))
        return;
      const [S, j, B] = h.split("-").map(Number), ae = new Date(2e3, j - 1, B);
      return ae.setFullYear(S), ae;
    }
    function s(h) {
      return h === null || h < Cn ? null : l(h) ?? null;
    }
    let d = ze(a.value) ? a.value : null;
    const c = Gi(s(d));
    function u(h, S = !1) {
      const j = (s(h)?.getTime() ?? null) !== (s(d)?.getTime() ?? null);
      d = h, !(!j && !S) && (c.value = s(h) ?? (c.value === null ? void 0 : null), T());
    }
    let p = a.value;
    function m(h) {
      p = h, i("update:modelValue", h);
    }
    const g = U(null);
    function x() {
      return g.value?.$el?.querySelector("input") ?? null;
    }
    function $() {
      const h = x();
      h && h.value !== a.value && (h.value = a.value);
    }
    function T() {
      Ne($);
    }
    Nt($), le(g, (h) => {
      h && T();
    }), le(() => r.modelValue, (h) => {
      const S = o(h);
      S !== p && (p = S, a.value = S, u(ze(S) ? S : null, !0));
    });
    const _ = P(() => {
      const h = r.field.min;
      return h && ze(h) && h > Cn ? h : Cn;
    }), V = P(() => r.field.max), k = P(() => l(_.value)), E = P(() => l(V.value));
    let w = !1;
    function D() {
      w = !0, queueMicrotask(() => {
        w = !1;
      });
    }
    const C = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/;
    function R(h) {
      const S = C.exec(h);
      if (!S)
        return h;
      const j = `${S[1].padStart(4, "0")}-${S[2].padStart(2, "0")}-${S[3].padStart(2, "0")}`;
      return ze(j) ? j : h;
    }
    function K(h) {
      a.value = h.target.value;
      const S = R(a.value);
      ze(S) ? u(S, w) : S.trim() === "" ? u(null, w) : w && u(d, !0), m(S);
    }
    function W(h) {
      const S = (j, B) => String(j).padStart(B, "0");
      return `${S(h.getFullYear(), 4)}-${S(h.getMonth() + 1, 2)}-${S(h.getDate(), 2)}`;
    }
    function Y(h) {
      const S = W(h);
      a.value = S, u(S, !0), m(S), T();
    }
    function ne(h) {
      const S = h.target;
      !(S instanceof HTMLInputElement) || r.disabled || r.readonly || S.getAttribute("aria-expanded") === "true" || !window.matchMedia("(pointer: coarse)").matches || h.currentTarget.querySelector('button[aria-haspopup="dialog"]')?.click();
    }
    function re() {
      a.value = R(a.value), T();
    }
    const ie = P(() => O("field-input", "date")), pe = P(() => O("field-calendar"));
    function J() {
      const h = g.value?.$el?.querySelector("input");
      if (!h)
        return;
      h.getRootNode().activeElement?.closest(`.${pe.value.class}`) && h.focus({ preventScroll: !0 });
    }
    function H(h) {
      const S = h.currentTarget, j = S.getRootNode();
      if (h.code !== "Tab" || !(j instanceof ShadowRoot))
        return;
      const B = Array.from(S.querySelectorAll(ef)), ae = B.indexOf(j.activeElement), Ce = B[(ae + (h.shiftKey ? -1 : 1) + B.length) % B.length];
      Ce && (h.preventDefault(), h.stopPropagation(), Ce.focus());
    }
    const M = U(null);
    function G(h) {
      return {
        pcInputText: {
          root: {
            value: a.value,
            "aria-describedby": h,
            "aria-required": r.field.required ? "true" : void 0
          }
        },
        panel: {
          part: pe.value.part,
          class: pe.value.class,
          onKeydownCapture: H
        }
      };
    }
    return t({ focusFirstControl: () => M.value?.focusFirstControl() }), (h, S) => (f(), N(jt, {
      ref_key: "shell",
      ref: M,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Q(({ id: j, describedBy: B, invalid: ae }) => [
        F(y(yi), {
          ref_key: "picker",
          ref: g,
          "model-value": c.value,
          "input-id": j,
          "update-model-type": "string",
          "date-format": "yy-mm-dd",
          placeholder: "YYYY-MM-DD",
          "min-date": k.value,
          "max-date": E.value,
          disabled: e.disabled,
          invalid: ae,
          pt: G(B),
          part: ie.value.part,
          class: z(ie.value.class),
          "show-on-focus": !1,
          "show-icon": "",
          size: "small",
          fluid: "",
          "onUpdate:modelValue": D,
          onDateSelect: Y,
          onClick: ne,
          onInput: K,
          onBlur: re,
          onHide: J
        }, null, 8, ["model-value", "input-id", "min-date", "max-date", "disabled", "invalid", "pt", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), nf = /* @__PURE__ */ ce({
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
    const l = P(() => {
      switch (r.field.type) {
        case "email":
          return { type: "email", inputmode: "email", autocomplete: "off", autocapitalize: "off", spellcheck: "false" };
        case "number":
          return { type: "text", inputmode: a(r.field), autocomplete: "off", spellcheck: "false" };
        default:
          return { type: "text" };
      }
    }), s = P(() => r.field.type === "text" ? r.field.placeholder : void 0), d = P(() => typeof r.modelValue == "string" ? r.modelValue : ""), c = P(() => O("field-input")), u = U(null);
    return t({ focusFirstControl: () => u.value?.focusFirstControl() }), (p, m) => (f(), N(jt, {
      ref_key: "shell",
      ref: u,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Q(({ id: g, describedBy: x, invalid: $ }) => [
        F(y(At), b(l.value, {
          id: g,
          "model-value": d.value,
          placeholder: s.value,
          disabled: e.disabled,
          invalid: $,
          "aria-describedby": x,
          "aria-required": e.field.required ? "true" : void 0,
          part: c.value.part,
          class: c.value.class,
          size: "small",
          fluid: "",
          "onUpdate:modelValue": m[0] || (m[0] = (T) => i("update:modelValue", String(T ?? "")))
        }), null, 16, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var rf = `
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
`, of = {
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
}, af = oe.extend({
  name: "textarea",
  style: rf,
  classes: of
}), sf = {
  name: "BaseTextarea",
  extends: Rt,
  props: {
    autoResize: Boolean
  },
  style: af,
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
function lf(e, t, n) {
  return (t = uf(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function uf(e) {
  var t = df(e, "string");
  return It(t) == "symbol" ? t : t + "";
}
function df(e, t) {
  if (It(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (It(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var br = {
  name: "Textarea",
  extends: sf,
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
      return ke(lf({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, cf = ["value", "name", "disabled", "aria-invalid", "data-p"];
function pf(e, t, n, r, i, o) {
  return f(), v("textarea", b({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, cf);
}
br.render = pf;
const ff = /* @__PURE__ */ ce({
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
    const r = e, i = n, o = P(() => typeof r.modelValue == "string" ? r.modelValue : ""), a = P(() => O("field-input")), l = U(null);
    return t({ focusFirstControl: () => l.value?.focusFirstControl() }), (s, d) => (f(), N(jt, {
      ref_key: "shell",
      ref: l,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Q(({ id: c, describedBy: u, invalid: p }) => [
        F(y(br), {
          id: c,
          "model-value": o.value,
          placeholder: e.field.placeholder,
          disabled: e.disabled,
          invalid: p,
          "aria-describedby": u,
          "aria-required": e.field.required ? "true" : void 0,
          part: a.value.part,
          class: z(a.value.class),
          rows: "3",
          "auto-resize": "",
          fluid: "",
          "onUpdate:modelValue": d[0] || (d[0] = (m) => i("update:modelValue", String(m ?? "")))
        }, null, 8, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), vr = /* @__PURE__ */ ce({
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
    const r = n, i = U(null);
    return t({
      focusFirstControl: () => i.value?.focusFirstControl(),
      // Only a choice field has an Other box; any other type falls back to its control.
      focusOtherText() {
        i.value?.focusOtherText ? i.value.focusOtherText() : i.value?.focusFirstControl();
      }
    }), (o, a) => e.field.type === "choice" ? (f(), N(Uc, {
      key: 0,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[0] || (a[0] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "text" || e.field.type === "email" || e.field.type === "number" ? (f(), N(nf, {
      key: 1,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[1] || (a[1] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "textarea" ? (f(), N(ff, {
      key: 2,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[2] || (a[2] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "date" ? (f(), N(tf, {
      key: 3,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[3] || (a[3] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "checkbox" ? (f(), N(uc, {
      key: 4,
      ref_key: "control",
      ref: i,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": a[4] || (a[4] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : A("", !0);
  }
}), mf = ["part"], hf = ["part"], gr = /* @__PURE__ */ ce({
  __name: "form-header",
  props: {
    title: {},
    description: {}
  },
  setup(e) {
    const t = P(() => O("fields-title")), n = P(() => O("form-description"));
    return (r, i) => (f(), v("div", null, [
      I("h2", {
        part: t.value.part,
        class: z(t.value.class)
      }, L(e.title), 11, mf),
      e.description ? (f(), v("p", {
        key: 0,
        part: n.value.part,
        class: z(n.value.class)
      }, L(e.description), 11, hf)) : A("", !0),
      q(r.$slots, "default")
    ]));
  }
});
var bf = `
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
`, vf = {
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
}, gf = oe.extend({
  name: "message",
  style: bf,
  classes: vf
}), yf = {
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
  style: gf,
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
function mo(e, t, n) {
  return (t = wf(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wf(e) {
  var t = kf(e, "string");
  return Vt(t) == "symbol" ? t : t + "";
}
function kf(e, t) {
  if (Vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wi = {
  name: "Message",
  extends: yf,
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
      return ke(mo(mo({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: ar
  },
  components: {
    TimesIcon: hr
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
function ho(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function bo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ho(Object(n), !0).forEach(function(r) {
      Sf(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ho(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Sf(e, t, n) {
  return (t = xf(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xf(e) {
  var t = $f(e, "string");
  return Lt(t) == "symbol" ? t : t + "";
}
function $f(e, t) {
  if (Lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cf = ["data-p"], Tf = ["data-p"], Pf = ["data-p"], Ef = ["aria-label", "data-p"], Of = ["data-p"];
function _f(e, t, n, r, i, o) {
  var a = He("TimesIcon"), l = Jn("ripple");
  return f(), N(go, b({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: Q(function() {
      return [i.visible ? (f(), v("div", b({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, e.ptm("root")), [I("div", b({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? q(e.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (f(), v("div", b({
        key: 1,
        class: e.cx("content"),
        "data-p": o.dataP
      }, e.ptm("content")), [q(e.$slots, "icon", {
        class: z(e.cx("icon"))
      }, function() {
        return [(f(), N(we(e.icon ? "span" : null), b({
          class: [e.cx("icon"), e.icon],
          "data-p": o.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (f(), v("div", b({
        key: 0,
        class: e.cx("text"),
        "data-p": o.dataP
      }, e.ptm("text")), [q(e.$slots, "default")], 16, Pf)) : A("", !0), e.closable ? Je((f(), v("button", b({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(s) {
          return o.close(s);
        }),
        "data-p": o.dataP
      }, bo(bo({}, e.closeButtonProps), e.ptm("closeButton"))), [q(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (f(), v("i", b({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, Of)) : (f(), N(a, b({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ef)), [[l]]) : A("", !0)], 16, Tf))], 16)], 16, Cf)) : A("", !0)];
    }),
    _: 3
  }, 16);
}
wi.render = _f;
const Df = { class: "flex items-center gap-2" }, Ue = /* @__PURE__ */ ce({
  __name: "form-message",
  props: {
    severity: {},
    retry: { type: Boolean }
  },
  emits: ["retry"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, i) => (f(), N(y(wi), {
      severity: e.severity,
      closable: !1
    }, {
      default: Q(() => [
        I("div", Df, [
          I("span", {
            class: z(y(gd)(e.severity))
          }, [
            q(r.$slots, "default")
          ], 2),
          e.retry ? (f(), N(y(je), {
            key: 0,
            type: "button",
            link: "",
            size: "small",
            onClick: i[0] || (i[0] = (o) => n("retry"))
          }, {
            default: Q(() => [...i[1] || (i[1] = [
              de(" Retry ", -1)
            ])]),
            _: 1
          })) : A("", !0)
        ])
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), Af = ["part", "aria-busy"], Mf = {
  role: "status",
  class: "sr-only"
}, If = ["part"], Vf = ["part"], Lf = ["part"], Nf = "You are offline. Your choices are kept.", Bf = /* @__PURE__ */ ce({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = [], a = { root: { role: void 0, "aria-live": void 0, "aria-atomic": void 0 } }, l = Xn(
      Jo(r.state.definition, r.state.data)
    ), s = io(r.state.definition, l), d = U({}), c = U([]), u = {}, p = U(null), m = U(null), g = U("");
    let x = !1;
    function $(M, G) {
      u[M] = G;
    }
    const T = P(() => r.submitting || !!r.offline);
    function _(M, G = []) {
      const h = r.state.definition.fields.find((S) => M.includes(S.id))?.id;
      h && Ne(() => {
        const S = u[h];
        G.includes(h) ? S?.focusOtherText() : S?.focusFirstControl();
      });
    }
    function V(M) {
      return M === 1 ? "1 question needs attention." : `${M} questions need attention.`;
    }
    const k = P(() => {
      const M = [], G = Object.keys(d.value).length;
      G > 0 && M.push(V(G));
      for (const h of c.value)
        M.push(h.message);
      return M.join(" ");
    });
    function E() {
      x = !0, g.value = k.value;
    }
    le(k, (M) => {
      x && (g.value = M, M === "" && (x = !1));
    });
    function w() {
      p.value && ui(p.value) && m.value?.$el?.focus();
    }
    function D(M, G) {
      d.value = M ?? {}, c.value = G ?? [];
      const h = Object.keys(d.value);
      _(h), h.length === 0 && Ne(w), k.value !== "" && E();
    }
    let C = null;
    function R() {
      C && clearTimeout(C), C = null;
    }
    Zi(R), le(() => r.submitting, (M) => {
      if (R(), !M) {
        g.value === uo && (g.value = "");
        return;
      }
      d.value = {}, c.value = [], x = !1, g.value = "", C = setTimeout(() => {
        C = null, g.value = uo;
      }, wd);
    });
    function K(M, G) {
      if (l[M] = G, Pe(d.value, M)) {
        const { [M]: h, ...S } = d.value;
        d.value = S;
      }
    }
    function W() {
      return Xo(r.state.definition, l);
    }
    function Y() {
      if (T.value)
        return;
      const M = Pu(r.state.definition, l), G = Object.keys(M);
      if (G.length > 0) {
        d.value = M, c.value = [];
        const h = G.filter((S) => M[S].some((j) => j.code === "blank"));
        _(G, h), E();
        return;
      }
      d.value = {}, c.value = [], i("submit", W());
    }
    le(() => r.banner, (M) => {
      M && (x = !1, g.value = M.message, Ne(w));
    });
    const ne = P(() => O("card")), re = P(() => O("fields")), ie = P(() => O("notice")), pe = P(() => O("fields-error")), J = P(() => O("send", r.submitting && "sending")), H = P(() => r.submitting ? yd : r.state.definition.submit_label || "Submit");
    return t({
      setServerErrors: D,
      retry: Y,
      // See QuestionCardActive's own `hasUnsentInput` — a form the user changed
      // counts as unsent input a background "answered elsewhere" swap would
      // otherwise silently discard without explanation. An untouched form does
      // not, even one whose controls start filled from defaults or a checkbox.
      hasUnsentInput: () => io(r.state.definition, l) !== s
    }), (M, G) => (f(), v("form", {
      ref_key: "formEl",
      ref: p,
      part: `${ne.value.part} ${re.value.part}`,
      class: z(`w-form ${ne.value.class} ${re.value.class}`),
      "aria-busy": e.submitting ? "true" : void 0,
      novalidate: "",
      onSubmit: yo(Y, ["prevent"])
    }, [
      I("div", Mf, L(g.value), 1),
      e.offline ? (f(), v("p", {
        key: 0,
        role: "status",
        part: ie.value.part,
        class: z(ie.value.class)
      }, L(Nf), 10, If)) : A("", !0),
      F(gr, {
        title: e.state.definition.title,
        description: e.state.definition.description
      }, {
        default: Q(() => [
          e.state.stale ? (f(), v("p", {
            key: 0,
            part: ie.value.part,
            class: z(ie.value.class)
          }, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ", 10, Vf)) : A("", !0)
        ]),
        _: 1
      }, 8, ["title", "description"]),
      (f(!0), v(Z, null, he(e.state.definition.fields, (h) => (f(), N(vr, {
        key: h.id,
        ref_for: !0,
        ref: (S) => $(h.id, S),
        field: h,
        "model-value": y(Pe)(l, h.id),
        errors: y(Pe)(d.value, h.id) ?? o,
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (S) => K(h.id, S)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      c.value.length > 0 ? (f(), v("ul", {
        key: 1,
        part: pe.value.part,
        class: z(`${pe.value.class} ${y(rt)}`)
      }, [
        (f(!0), v(Z, null, he(c.value, (h, S) => (f(), v("li", { key: S }, L(h.message), 1))), 128))
      ], 10, Lf)) : A("", !0),
      e.banner ? (f(), N(Ue, {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        pt: a,
        onRetry: G[0] || (G[0] = (h) => i("retry"))
      }, {
        default: Q(() => [
          de(L(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : A("", !0),
      I("div", null, [
        F(y(je), {
          ref_key: "submitButton",
          ref: m,
          type: "submit",
          label: H.value,
          "aria-disabled": T.value ? "true" : void 0,
          part: J.value.part,
          class: z([J.value.class, T.value && "p-disabled"])
        }, {
          icon: Q((h) => [
            e.submitting ? (f(), N(y(Me), {
              key: 0,
              icon: "tabler:loader-2",
              "aria-hidden": "true",
              class: z([h.class, "animate-spin motion-reduce:animate-none"])
            }, null, 8, ["class"])) : A("", !0)
          ]),
          _: 1
        }, 8, ["label", "aria-disabled", "part", "class"])
      ])
    ], 42, Af));
  }
}), Rf = ["part"], jf = /* @__PURE__ */ ce({
  __name: "form-notice",
  props: {
    definition: {},
    severity: {},
    message: {}
  },
  setup(e) {
    const t = O("card", "unsupported"), n = O("fields");
    return (r, i) => (f(), v("div", {
      part: `${y(t).part} ${y(n).part}`,
      class: z(`w-form ${y(t).class} ${y(n).class}`)
    }, [
      F(gr, {
        title: e.definition.title,
        description: e.definition.description
      }, null, 8, ["title", "description"]),
      (f(!0), v(Z, null, he(e.definition.fields, (o) => (f(), N(vr, {
        key: o.id,
        field: o,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      F(Ue, { severity: e.severity }, {
        default: Q(() => [
          de(L(e.message), 1)
        ]),
        _: 1
      }, 8, ["severity"])
    ], 10, Rf));
  }
}), Ff = { key: 0 }, zf = { key: 1 }, Hf = { key: 2 }, Uf = { key: 3 }, qf = { key: 4 }, ki = /* @__PURE__ */ ce({
  __name: "form-answered-status",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = P(() => {
      const o = n.state.submitted_at, a = o ? new Date(o) : null;
      return a && !Number.isNaN(a.getTime()) ? a.toLocaleString() : null;
    }), i = U(null);
    return t({
      /** Moves focus to the status line after a send, so focus is not lost when the form swaps to its answered view. */
      focus() {
        i.value?.focus();
      }
    }), (o, a) => (f(), v("div", b({
      ref_key: "statusEl",
      ref: i,
      tabindex: "-1"
    }, y(O)("status")), [
      e.state.late ? (f(), v("p", Ff, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : A("", !0),
      e.state.delivery === "pending" ? (f(), v("p", zf, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (f(), v("p", Hf, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (f(), v("p", Uf, " The assistant stopped before answering. Send a message to continue. ")) : A("", !0),
      r.value ? (f(), v("p", qf, " Answered " + L(r.value), 1)) : A("", !0)
    ], 16));
  }
}), Yf = ["part"], Kf = /* @__PURE__ */ ce({
  __name: "idle-form",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = U(null), r = P(() => O("card", "answered")), i = P(() => O("fields"));
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        n.value?.focus();
      }
    }), (o, a) => (f(), v("div", {
      part: `${r.value.part} ${i.value.part}`,
      class: z(`w-form ${r.value.class} ${i.value.class}`)
    }, [
      F(gr, {
        title: e.state.definition.title,
        description: e.state.definition.description
      }, null, 8, ["title", "description"]),
      (f(!0), v(Z, null, he(e.state.definition.fields, (l) => (f(), N(vr, {
        key: l.id,
        field: l,
        "model-value": y(Pe)(e.state.data, l.id),
        errors: [],
        disabled: !1,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      F(ki, {
        ref_key: "statusRef",
        ref: n,
        state: e.state
      }, null, 8, ["state"])
    ], 10, Yf));
  }
});
function bt(e) {
  return `opt-${e}`;
}
function Zn(e) {
  return `note-${e}`;
}
function Si(e) {
  return `review-item-${e}`;
}
function xi(e) {
  return e?.startsWith("opt-") ? Number(e.slice(4)) : -1;
}
const Qn = 9;
function Wf(e, t, n) {
  const r = e.fields.length, i = r > 1, o = /* @__PURE__ */ new Set([0]), a = U(0), l = U(!1), s = U(""), d = U(""), c = U(null), u = U(0), p = Jo(e, t), m = Xn(
    Object.fromEntries(e.fields.map((h) => {
      const S = Pe(p, h.id), j = h.options.filter((Ye) => Kl(S, Ye.value)).map((Ye) => Ye.value), B = /* @__PURE__ */ new Map();
      for (const Ye of j) {
        const Ft = Wl(S, Ye);
        Ft && B.set(Ye, Ft);
      }
      const ae = qo(S), Ce = mt(S), fn = j.length > 0 || ae && be(Ce) !== "", mn = { chosen: j, other: Ce, useOther: ae, notes: B, noteOpen: null, done: fn };
      return [h.id, mn];
    }))
  );
  function g(h) {
    return m[h.id];
  }
  function x(h) {
    const S = g(h);
    return h.multiple ? S.chosen.length > 0 || be(S.other) !== "" : S.chosen.length > 0 || S.useOther && be(S.other) !== "";
  }
  function $(h) {
    return g(h).done && x(h);
  }
  const T = P(() => i && a.value === r), _ = P(() => T.value ? null : e.fields[a.value] ?? null), V = P(
    () => e.fields.map((h, S) => ({ field: h, index: S })).filter(({ field: h }) => h.required && !$(h))
  );
  let k;
  function E(h) {
    clearTimeout(k), d.value = "", k = setTimeout(() => {
      d.value = h;
    }, 30);
  }
  function w() {
    clearTimeout(k), d.value = "";
  }
  function D(h) {
    c.value = h, u.value++;
  }
  function C(h) {
    const S = Math.min(h.options.length + (h.allow_other ? 1 : 0), Qn), j = S > 1 ? `1–${S}` : "1", B = Math.min(h.options.length, Qn), ae = B > 1 ? `Shift+1–${B}` : "Shift+1", Ce = i ? " ← and → change questions." : "";
    return h.multiple ? `${j} ticks, ${ae} adds a note, Enter sends.${Ce}` : `${j} answers, ${ae} adds a note first.${Ce}`;
  }
  function R(h) {
    const S = g(h), j = (B) => ({ value: B, note: S.notes.get(B) ?? "" });
    return h.multiple ? [...S.chosen.map(j), { other: S.other }] : S.useOther ? { other: S.other } : S.chosen[0] ? j(S.chosen[0]) : void 0;
  }
  function K(h) {
    return $(h) ? fr(h, Qo(h, R(h))) : null;
  }
  function W() {
    const h = {};
    for (const S of e.fields)
      $(S) && (h[S.id] = R(S));
    return Xo(e, h);
  }
  function Y(h, S = "first") {
    const j = _.value;
    j && j.multiple && !g(j).done && x(j) && (g(j).done = !0);
    const B = i ? r : r - 1;
    if (a.value = Math.max(0, Math.min(h, B)), s.value = "", T.value || o.add(a.value), T.value) {
      const ae = V.value[0];
      D(ae ? Si(ae.index) : "send-all");
    } else
      D(S);
    E(T.value ? "Review your answers" : `Question ${a.value + 1} of ${r}`);
  }
  function ne() {
    V.value.length > 0 || n(W());
  }
  function re(h) {
    if (g(h).done = !0, s.value = "", !i) {
      n(W());
      return;
    }
    const S = e.fields.findIndex((j, B) => B > a.value && !o.has(B));
    Y(S === -1 ? r : S);
  }
  function ie(h, S) {
    const j = g(h);
    if (S >= h.options.length) {
      D("other");
      return;
    }
    const B = h.options[S].value;
    if (j.noteOpen === B && !h.multiple) {
      D(Zn(B));
      return;
    }
    if (h.multiple) {
      j.chosen = j.chosen.includes(B) ? j.chosen.filter((ae) => ae !== B) : [...j.chosen, B], x(h) || (j.done = !1), s.value = "", D(bt(S)), E(j.chosen.includes(B) ? "Ticked" : "Unticked");
      return;
    }
    j.chosen = [B], j.useOther = !1, re(h);
  }
  function pe(h, S, j = !1) {
    const B = g(h);
    B.noteOpen === S && !j ? (B.noteOpen = null, D(bt(h.options.findIndex((ae) => ae.value === S)))) : (B.noteOpen = S, D(Zn(S)));
  }
  function J(h, S, j) {
    g(h).notes.set(S, j);
  }
  function H(h, S) {
    const j = g(h);
    j.noteOpen = null;
    const B = bt(h.options.findIndex((ae) => ae.value === S));
    if (h.multiple) {
      j.chosen.includes(S) || (j.chosen = [...j.chosen, S]), D(B), E("Note saved");
      return;
    }
    j.chosen = [S], j.useOther = !1, D(B), re(h);
  }
  function M(h, S) {
    g(h).other = S, s.value = "";
  }
  function G(h) {
    const S = g(h), j = be(S.other);
    if (h.multiple) {
      if (!j && S.chosen.length === 0) {
        h.required && (s.value = ri);
        return;
      }
    } else {
      if (!j) {
        h.required && (s.value = "Type your answer, or choose another option.");
        return;
      }
      S.useOther = !0, S.chosen = [];
    }
    re(h);
  }
  return {
    n: r,
    multi: i,
    index: a,
    collapsed: l,
    error: s,
    liveMessage: d,
    focusTarget: c,
    focusSeq: u,
    answers: m,
    inReview: T,
    currentQuestion: _,
    missingRequired: V,
    ans: g,
    answerItemsFor: K,
    keysText: C,
    activate: ie,
    toggleNote: pe,
    setNote: J,
    sendNote: H,
    setOther: M,
    sendOther: G,
    commit: re,
    go: Y,
    submitAll: ne,
    requestFocus: D,
    quiet: w,
    buildAnswers: W
  };
}
function sn(...e) {
  return e.filter(Boolean).join(" ") || void 0;
}
const Gf = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Qe = /* @__PURE__ */ ce({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    return (t, n) => (f(!0), v(Z, null, he(y(Zd)(e.text), (r, i) => (f(), v(Z, { key: i }, [
      r.code ? (f(), v("code", Gf, L(r.text), 1)) : (f(), v(Z, { key: 1 }, [
        de(L(r.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), Zf = { "aria-hidden": "true" }, Qf = { class: "sr-only" }, Xf = ["id"], Jf = /* @__PURE__ */ ce({
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
    const n = e, r = t, i = P(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), o = P(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), a = P(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (l, s) => (f(), v("div", ve(Ae(y(O)("header", !e.multi && "single"))), [
      e.multi ? (f(), v("div", b({ key: 0 }, y(O)("nav"), {
        role: "group",
        "aria-label": "Questions"
      }), [
        F(y(je), b(y(O)("prev"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: s[0] || (s[0] = (d) => r("prev"))
        }), {
          icon: Q(() => [
            F(y(Me), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 16, ["disabled"]),
        I("span", ve(Ae(y(O)("counter"))), [
          I("span", Zf, L(i.value), 1),
          I("span", Qf, L(o.value), 1)
        ], 16),
        F(y(je), b(y(O)("next"), {
          type: "button",
          text: "",
          size: "small",
          "aria-label": a.value,
          title: a.value,
          disabled: e.review,
          onClick: s[1] || (s[1] = (d) => r("next"))
        }), {
          icon: Q(() => [
            F(y(Me), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 16, ["aria-label", "title", "disabled"])
      ], 16)) : A("", !0),
      I("h3", b(y(O)("question"), { id: e.qid }), [
        e.review ? (f(), v(Z, { key: 0 }, [
          de(" Check your answers, then send them. ")
        ], 64)) : (f(), N(Qe, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 16, Xf),
      I("div", ve(Ae(y(O)("actions"))), [
        F(y(je), b(y(O)("collapse"), {
          type: "button",
          text: "",
          size: "small",
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: s[2] || (s[2] = (d) => r("toggle-collapse"))
        }), {
          icon: Q(() => [
            F(y(Me), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 16, ["aria-expanded", "aria-label", "title"])
      ], 16)
    ], 16));
  }
}), $i = /* @__PURE__ */ ce({
  __name: "question-card-heading",
  props: {
    definition: {},
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), v(Z, null, [
      I("p", ve(Ae(y(O)("title"))), [
        F(y(Me), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        de(" " + L(e.definition.title), 1)
      ], 16),
      e.definition.description ? (f(), v("p", ve(b({ key: 0 }, y(O)("form-description"))), [
        F(Qe, {
          text: e.definition.description
        }, null, 8, ["text"])
      ], 16)) : A("", !0)
    ], 64));
  }
});
var em = `
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
`, tm = {
  root: "p-inputgroup"
}, nm = oe.extend({
  name: "inputgroup",
  style: em,
  classes: tm
}), rm = {
  name: "BaseInputGroup",
  extends: dt,
  style: nm,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Ci = {
  name: "InputGroup",
  extends: rm,
  inheritAttrs: !1
};
function om(e, t, n, r, i, o) {
  return f(), v("div", b({
    class: e.cx("root")
  }, e.ptmi("root")), [q(e.$slots, "default")], 16);
}
Ci.render = om;
const Ti = /* @__PURE__ */ ce({
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
    return (o, a) => (f(), N(y(Ci), ve(Ae(y(O)("composer", e.kind))), {
      default: Q(() => [
        F(y(br), b(y(O)(`${e.kind}-input`), {
          "model-value": e.modelValue,
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => r("update:modelValue", String(l ?? ""))),
          onKeydown: i
        }), null, 16, ["model-value", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        F(y(je), b(y(O)(`${e.kind}-send`), {
          type: "button",
          text: "",
          rounded: "",
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: a[1] || (a[1] = (l) => r("send"))
        }), {
          icon: Q(() => [
            F(y(Me), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 16, ["disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 16));
  }
}), Pi = /* @__PURE__ */ ce({
  __name: "question-card-length-alert",
  props: {
    max: {}
  },
  setup(e) {
    return (t, n) => (f(), v("p", b(y(O)("error"), {
      class: y(rt),
      role: "alert"
    }), L(y(nn)(e.max)), 17));
  }
}), im = ["role", "aria-checked", "aria-disabled", "aria-describedby", "aria-invalid", "tabindex", "data-focus", "aria-keyshortcuts"], am = { key: 1 }, sm = /* @__PURE__ */ ce({
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
    const n = e, r = t, i = `${Bt()}-note-err`, o = P(() => sn(n.noteTooLong && i, n.describedBy)), a = `${et("note-toggle")}, ${et("composer")}`;
    function l(u) {
      n.disabled || u.target.closest(a) || r("activate");
    }
    const s = P(() => `${n.note ? "Edit the note on" : "Add a note to"} ${co(n.option.label)}`), d = P(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), c = P(() => n.multiple ? "Save the note" : "Answer with this note");
    return (u, p) => (f(), v("div", b(y(O)("option", e.selected && "selected", e.note && "has-note", e.editing && "editing"), { onClick: l }), [
      I("div", b(y(O)("option-main"), {
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        "aria-describedby": e.describedBy,
        "aria-invalid": e.multiple && e.invalid ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": y(bt)(e.index),
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }), [
        I("span", ve(Ae(y(O)("option-label"))), [
          e.multiple ? (f(), N(y(_t), b({ key: 0 }, y(O)("option-mark"), {
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true"
          }), null, 16, ["model-value"])) : e.selected ? (f(), v("span", b({ key: 1 }, y(O)("option-mark"), { "aria-hidden": "true" }), [
            F(y(Me), { icon: "tabler:check" })
          ], 16)) : A("", !0),
          F(Qe, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 16),
        e.option.description ? (f(), v("span", ve(b({ key: 0 }, y(O)("option-description"))), [
          F(Qe, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 16)) : A("", !0),
        e.note && !e.editing ? (f(), v("span", ve(b({ key: 1 }, y(O)("option-note"))), [
          F(y(Me), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          I("span", null, L(e.note), 1)
        ], 16)) : A("", !0)
      ], 16, im),
      F(y(je), b(y(O)("note-toggle", e.note && "has-note", e.editing && "editing"), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": s.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: p[0] || (p[0] = yo((m) => r("toggle-note"), ["stop"]))
      }), {
        icon: Q(() => [
          F(y(Me), { icon: "tabler:note" })
        ]),
        _: 1
      }, 16, ["disabled", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (f(), v("kbd", b({ key: 0 }, y(O)("option-key"), { "aria-hidden": "true" }), L(e.keyLabel), 17)) : (f(), v("span", am)),
      e.editing ? (f(), v(Z, { key: 2 }, [
        F(Ti, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: d.value,
          label: `Note for ${y(co)(e.option.label)}`,
          "send-label": c.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": o.value,
          "data-focus": y(Zn)(e.option.value),
          "onUpdate:modelValue": p[1] || (p[1] = (m) => r("update:noteDraft", m)),
          onSend: p[2] || (p[2] = (m) => r("send-note")),
          onEscape: p[3] || (p[3] = (m) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (f(), N(Pi, {
          key: 0,
          id: i,
          max: y(on)
        }, null, 8, ["max"])) : A("", !0)
      ], 64)) : A("", !0)
    ], 16));
  }
}), Ei = /* @__PURE__ */ ce({
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
    function i() {
      n.blocked || r("send");
    }
    return (o, a) => (f(), N(y(je), b({ type: "button" }, y(O)(e.name), {
      class: e.blocked && "p-disabled",
      "data-focus": e.name,
      "aria-describedby": e.describedBy,
      "aria-disabled": e.blocked ? "true" : void 0,
      disabled: e.nothingToSend,
      onClick: i
    }), {
      default: Q(() => [
        de(L(e.label) + " ", 1),
        F(y(Me), {
          icon: "tabler:send-2",
          "aria-hidden": "true"
        })
      ]),
      _: 1
    }, 16, ["class", "data-focus", "aria-describedby", "aria-disabled", "disabled"]));
  }
}), lm = ["role", "aria-labelledby", "aria-describedby", "aria-invalid"], um = { key: 1 }, dm = /* @__PURE__ */ ce({
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
    const t = e, n = P(() => {
      const k = [];
      return t.question.multiple && k.push("Choose any that apply."), t.question.required || k.push("Optional."), k.join(" ");
    }), r = P(() => t.controller.ans(t.question)), i = P(() => t.controller.error.value || t.serverError || "");
    function o(k) {
      return k < Qn ? String(k + 1) : null;
    }
    const a = P(() => o(t.question.options.length));
    function l(k) {
      return r.value.notes.get(k) ?? "";
    }
    const s = P(() => t.question.multiple ? be(r.value.other) !== "" : r.value.useOther && r.value.done), d = P(() => be(r.value.other) !== "" || t.question.multiple && r.value.chosen.length > 0), c = P(() => an(r.value.other, rn)), u = `${t.qid}-other-err`, p = `${t.qid}-err`, m = P(() => sn(i.value && p, t.cardErrorIds)), g = P(() => sn(c.value && u, m.value)), x = P(() => c.value || !!i.value);
    function $() {
      !t.disabled && !c.value && t.controller.sendOther(t.question);
    }
    function T(k) {
      k.target.closest(et("composer")) || t.controller.requestFocus("other");
    }
    const _ = U(0);
    le(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const k = r.value, E = k.useOther ? -1 : t.question.options.findIndex((w) => w.value === k.chosen[0]);
      _.value = E >= 0 ? E : 0;
    }, { immediate: !0 });
    function V(k) {
      if (t.question.multiple)
        return;
      const E = xi(k.target?.dataset?.focus);
      E >= 0 && (_.value = E);
    }
    return (k, E) => (f(), v(Z, null, [
      e.stale ? (f(), v("p", ve(b({ key: 0 }, y(O)("notice"))), " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 16)) : A("", !0),
      e.question.description ? (f(), v("p", ve(b({ key: 1 }, y(O)("description"))), [
        F(Qe, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 16)) : A("", !0),
      n.value ? (f(), v("p", ve(b({ key: 2 }, y(O)("hint"))), L(n.value), 17)) : A("", !0),
      I("div", b(y(O)("options"), {
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": i.value ? p : void 0,
        "aria-invalid": !e.question.multiple && i.value ? "true" : void 0,
        onFocusin: V
      }), [
        (f(!0), v(Z, null, he(e.question.options, (w, D) => (f(), N(sm, {
          key: w.value,
          option: w,
          index: D,
          multiple: e.question.multiple,
          selected: e.question.multiple ? r.value.chosen.includes(w.value) : !r.value.useOther && r.value.chosen[0] === w.value,
          note: y(be)(l(w.value)),
          editing: r.value.noteOpen === w.value,
          "note-draft": l(w.value),
          "key-label": o(D),
          "note-too-long": y(an)(l(w.value), y(on)),
          disabled: !!e.disabled,
          "described-by": m.value,
          invalid: !!i.value,
          "roving-tabbable": D === _.value,
          onActivate: (C) => e.controller.activate(e.question, D),
          onToggleNote: (C) => e.controller.toggleNote(e.question, w.value),
          "onUpdate:noteDraft": (C) => e.controller.setNote(e.question, w.value, C),
          onSendNote: (C) => e.controller.sendNote(e.question, w.value),
          onEscapeNote: (C) => e.controller.toggleNote(e.question, w.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "described-by", "invalid", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (f(), v("div", b({ key: 0 }, y(O)("option", "other", s.value && "selected"), { onClick: T }), [
          F(Ti, {
            kind: "other",
            "model-value": r.value.other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: d.value && !e.disabled && !c.value,
            invalid: x.value,
            "described-by": g.value,
            "data-focus": "other",
            "onUpdate:modelValue": E[0] || (E[0] = (w) => e.controller.setOther(e.question, w)),
            onSend: E[1] || (E[1] = (w) => e.controller.sendOther(e.question)),
            onBlocked: $,
            onEscape: E[2] || (E[2] = (w) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          a.value ? (f(), v("kbd", b({ key: 0 }, y(O)("option-key"), { "aria-hidden": "true" }), L(a.value), 17)) : (f(), v("span", um)),
          c.value ? (f(), N(Pi, {
            key: 2,
            id: u,
            max: y(rn)
          }, null, 8, ["max"])) : A("", !0)
        ], 16)) : A("", !0)
      ], 16, lm),
      e.question.multiple && !e.question.allow_other ? (f(), v("div", ve(b({ key: 3 }, y(O)("footer"))), [
        F(Ei, {
          name: "send",
          label: "Send",
          blocked: e.disabled,
          "nothing-to-send": r.value.chosen.length === 0,
          "described-by": m.value,
          onSend: E[3] || (E[3] = (w) => e.controller.commit(e.question))
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16)) : A("", !0),
      i.value ? (f(), N(Ue, b({
        key: 4,
        id: p
      }, y(O)("error"), {
        severity: "error",
        variant: "simple",
        size: "small",
        role: "alert"
      }), {
        default: Q(() => [
          de(L(i.value), 1)
        ]),
        _: 1
      }, 16)) : A("", !0),
      I("p", ve(Ae(y(O)("keys"))), L(e.controller.keysText(e.question)), 17)
    ], 64));
  }
}), cm = { key: 0 }, Oi = /* @__PURE__ */ ce({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    return (t, n) => (f(!0), v(Z, null, he(e.items, (r, i) => (f(), v("span", b({ key: i }, { ref_for: !0 }, y(O)("answer-item")), [
      r.own ? (f(), v(Z, { key: 0 }, [
        I("span", b({ ref_for: !0 }, y(O)("answer-own")), "Own answer: ", 16),
        (f(!0), v(Z, null, he(y(pi)(r.label), (o, a) => (f(), v(Z, { key: a }, [
          a > 0 ? (f(), v("br", cm)) : A("", !0),
          de(L(o), 1)
        ], 64))), 128))
      ], 64)) : (f(), N(Qe, {
        key: 1,
        text: r.label
      }, null, 8, ["text"])),
      y(be)(r.note || "") ? (f(), v("span", b({
        key: 2,
        ref_for: !0
      }, y(O)("answer-note")), [
        F(y(Me), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        I("span", null, L(y(be)(r.note)), 1)
      ], 16)) : A("", !0)
    ], 16))), 128));
  }
}), pm = ["data-focus", "onClick"], fm = { class: "sr-only" }, mm = /* @__PURE__ */ ce({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean },
    cardErrorIds: {}
  },
  setup(e) {
    const t = e, n = P(() => t.definition.fields.map((i, o) => {
      const a = t.controller.answerItemsFor(i);
      return { field: i, number: o + 1, key: Si(o), items: a, missing: !a && i.required };
    })), r = P(() => {
      const i = t.controller.missingRequired.value;
      return i.length === 0 ? "" : i.length === 1 ? `Question ${i[0].index + 1} still needs an answer.` : `Questions ${i.map((o) => o.index + 1).join(" and ")} still need answers.`;
    });
    return (i, o) => (f(), v(Z, null, [
      I("ol", ve(Ae(y(O)("review"))), [
        (f(!0), v(Z, null, he(n.value, (a, l) => (f(), v("li", b({
          key: a.field.id
        }, { ref_for: !0 }, y(O)("review-item", a.missing && "missing")), [
          I("button", b({ ref_for: !0 }, y(O)("review-edit"), {
            type: "button",
            "data-focus": a.key,
            onClick: (s) => e.controller.go(l, "first")
          }), [
            I("span", b({ ref_for: !0 }, y(O)("review-number"), { "aria-hidden": "true" }), L(a.number), 17),
            I("span", fm, "Question " + L(a.number) + ": ", 1),
            I("span", b({ ref_for: !0 }, y(O)("review-question")), [
              F(Qe, {
                text: a.field.label
              }, null, 8, ["text"])
            ], 16),
            I("span", b({ ref_for: !0 }, y(O)("review-answer"), {
              class: a.missing && y(rt)
            }), [
              a.items ? (f(), N(Oi, {
                key: 0,
                items: a.items
              }, null, 8, ["items"])) : a.field.required ? (f(), v(Z, { key: 1 }, [
                de(" Not answered yet ")
              ], 64)) : (f(), v("span", b({
                key: 2,
                ref_for: !0
              }, y(O)("answer-empty")), "Skipped", 16))
            ], 16),
            o[1] || (o[1] = I("span", { class: "sr-only" }, ". Change the answer.", -1))
          ], 16, pm)
        ], 16))), 128))
      ], 16),
      I("div", ve(Ae(y(O)("footer"))), [
        r.value ? (f(), v("p", b({ key: 0 }, y(O)("footer-text"), { class: y(rt) }), L(r.value), 17)) : A("", !0),
        F(Ei, {
          name: "send-all",
          label: "Send answers",
          blocked: e.disabled,
          "nothing-to-send": e.controller.missingRequired.value.length > 0,
          "described-by": e.cardErrorIds,
          onSend: o[0] || (o[0] = (a) => e.controller.submitAll())
        }, null, 8, ["blocked", "nothing-to-send", "described-by"])
      ], 16),
      I("p", ve(Ae(y(O)("keys"))), " Enter sends. Pick a row to change it. ← goes back to the last question. ", 16)
    ], 64));
  }
}), hm = ["aria-busy"], bm = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, vm = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, gm = {
  "aria-live": "polite",
  class: "sr-only"
}, ym = "You are offline. Your choices are kept.", wm = "Sending your answer…", km = /* @__PURE__ */ ce({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "step-change", "collapsed-change"],
  setup(e, { expose: t, emit: n }) {
    const r = e, i = n, o = Wf(r.state.definition, r.state.data, (w) => {
      r.offline || r.submitting || i("submit", w);
    }), a = P(() => !!r.offline || r.submitting), l = `${Bt()}-q`, s = U(null);
    le(o.inReview, (w) => i("step-change", w ? "review" : "active"), { immediate: !0 }), le(o.collapsed, (w) => i("collapsed-change", w), { immediate: !0 });
    const d = U({}), c = U([]);
    le(() => r.submitting, (w) => {
      w && (o.quiet(), d.value = {}, c.value = []);
    });
    function u(w) {
      return Pe(d.value, w) ?? "";
    }
    const p = P(() => new Set(r.state.definition.fields.map((w) => w.id))), m = P(() => {
      const w = Object.entries(d.value).filter(([D]) => !p.value.has(D)).map(([, D]) => D);
      return [...c.value, ...w].join(" ");
    }), g = `${l}-general-err`, x = `${l}-banner`, $ = P(() => sn(m.value && g, r.banner && x));
    le(
      () => Object.fromEntries(r.state.definition.fields.map((w) => {
        const D = o.ans(w);
        return [w.id, JSON.stringify({ ...D, notes: [...D.notes] })];
      })),
      (w, D) => {
        if (!D)
          return;
        const C = new Set(
          r.state.definition.fields.map((R) => R.id).filter((R) => w[R] !== D[R] && Pe(d.value, R))
        );
        C.size !== 0 && (d.value = Object.fromEntries(
          Object.entries(d.value).filter(([R]) => !C.has(R))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(w, D) {
        const C = {};
        for (const [K, W] of Object.entries(w ?? {}))
          C[K] = W.map((Y) => Y.message).join(" ");
        d.value = C, c.value = (D ?? []).map((K) => K.message);
        const R = r.state.definition.fields.findIndex((K) => Pe(C, K.id));
        R >= 0 ? o.go(R, "first") : Ne(V);
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
          (w) => w.chosen.length > 0 || be(w.other) !== "" || [...w.notes.values()].some((D) => be(D) !== "")
        );
      }
    });
    const T = `${et("option-main")}, ${et("other-input")}`;
    function _(w) {
      const D = s.value;
      if (!D)
        return;
      let C = null;
      if (w === "card" ? C = D : w === "first" ? C = D.querySelector(`${et("option", "selected")} ${et("option-main")}`) ?? D.querySelector(T) : C = Array.from(D.querySelectorAll("[data-focus]")).find((R) => R.dataset.focus === w) ?? null, !!C && (C.focus(), C.tagName === "TEXTAREA")) {
        const R = C;
        R.setSelectionRange(R.value.length, R.value.length);
      }
    }
    le(o.focusSeq, () => {
      Ne(() => {
        const w = o.focusTarget.value;
        w && _(w);
      });
    });
    function V() {
      !s.value || !ui(s.value) || o.requestFocus(o.inReview.value ? "send-all" : "first");
    }
    le(() => r.banner, (w) => {
      w && Ne(V);
    });
    function k() {
      o.collapsed.value = !o.collapsed.value;
    }
    function E(w) {
      const D = w.composedPath()[0];
      if (D?.tagName === "TEXTAREA" || w.isComposing || w.ctrlKey || w.metaKey || w.altKey || o.collapsed.value || a.value)
        return;
      if (o.inReview.value) {
        w.key === "ArrowLeft" && (w.preventDefault(), o.go(o.n - 1, "first"));
        return;
      }
      const C = o.currentQuestion.value;
      if (!C)
        return;
      const R = o.ans(C), K = w.shiftKey ? /^Digit([1-9])$/.exec(w.code) : /^([1-9])$/.exec(w.key);
      if (K) {
        const Y = Number(K[1]) - 1;
        if (Y >= C.options.length + (C.allow_other ? 1 : 0))
          return;
        w.preventDefault(), w.shiftKey && Y < C.options.length ? o.toggleNote(C, C.options[Y].value, !0) : o.activate(C, Y);
        return;
      }
      const W = xi(D?.dataset?.focus);
      if (w.key === "ArrowDown" || w.key === "ArrowUp") {
        const Y = Array.from(s.value?.querySelectorAll(T) ?? []);
        if (Y.length === 0)
          return;
        w.preventDefault();
        const ne = Y.indexOf(D), re = w.key === "ArrowDown" ? (ne + 1) % Y.length : ne <= 0 ? Y.length - 1 : ne - 1;
        Y[re]?.focus();
        return;
      }
      if (o.multi && (w.key === "ArrowRight" || w.key === "ArrowLeft")) {
        w.preventDefault(), o.go(o.index.value + (w.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((w.key === "n" || w.key === "N") && W >= 0) {
        w.preventDefault(), o.toggleNote(C, C.options[W].value, !0);
        return;
      }
      if (W >= 0 && (w.key === " " || w.key === "Enter" && !C.multiple)) {
        w.preventDefault(), o.activate(C, W);
        return;
      }
      w.key === "Enter" && C.multiple && !D?.matches?.("button") && (w.preventDefault(), R.chosen.length > 0 || be(R.other) ? o.commit(C) : C.required && (o.error.value = ri, o.requestFocus(W >= 0 ? bt(W) : "first")));
    }
    return (w, D) => (f(), v("section", b({
      ref_key: "cardRoot",
      ref: s,
      class: "w-form"
    }, y(O)("card"), {
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: E
    }), [
      e.offline ? (f(), v("p", bm, L(ym))) : A("", !0),
      e.submitting ? (f(), v("p", vm, L(wm))) : A("", !0),
      m.value ? (f(), N(Ue, {
        key: 2,
        id: g,
        severity: "error"
      }, {
        default: Q(() => [
          de(L(m.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      F($i, {
        definition: e.state.definition,
        icon: "tabler:messages"
      }, null, 8, ["definition"]),
      F(Jf, {
        multi: y(o).multi,
        index: y(o).index.value,
        n: y(o).n,
        review: y(o).inReview.value,
        "question-text": y(o).currentQuestion.value?.label ?? "",
        collapsed: y(o).collapsed.value,
        qid: l,
        onPrev: D[0] || (D[0] = (C) => y(o).go(y(o).index.value - 1, "first")),
        onNext: D[1] || (D[1] = (C) => y(o).go(y(o).index.value + 1, "first")),
        onToggleCollapse: k
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (f(), N(Ue, {
        key: 3,
        id: x,
        severity: e.banner.retryable ? "warn" : "error",
        retry: e.banner.retryable,
        onRetry: D[2] || (D[2] = (C) => i("retry"))
      }, {
        default: Q(() => [
          de(L(e.banner.message), 1)
        ]),
        _: 1
      }, 8, ["severity", "retry"])) : A("", !0),
      y(o).collapsed.value ? A("", !0) : (f(), v(Z, { key: 4 }, [
        y(o).inReview.value ? (f(), N(mm, {
          key: 0,
          definition: e.state.definition,
          controller: y(o),
          "card-error-ids": $.value,
          disabled: a.value
        }, null, 8, ["definition", "controller", "card-error-ids", "disabled"])) : y(o).currentQuestion.value ? (f(), N(dm, {
          key: 1,
          question: y(o).currentQuestion.value,
          controller: y(o),
          qid: l,
          stale: !!e.state.stale,
          "server-error": u(y(o).currentQuestion.value.id),
          "card-error-ids": $.value,
          disabled: a.value
        }, null, 8, ["question", "controller", "stale", "server-error", "card-error-ids", "disabled"])) : A("", !0)
      ], 64)),
      I("p", gm, L(y(o).liveMessage.value), 1)
    ], 16, hm));
  }
}), Sm = ["aria-label"], xm = /* @__PURE__ */ ce({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = P(() => n.state.definition.fields.map((o) => ({
      field: o,
      items: fr(o, Pe(n.state.data, o.id))
    }))), i = U(null);
    return t({
      /** Moves focus to the status line after a send, so focus is not lost when the form swaps to this view. */
      focusStatus() {
        i.value?.focus();
      }
    }), (o, a) => (f(), v("section", b({ class: "w-form" }, y(O)("card", "answered"), {
      "aria-label": `${e.state.definition.title}, answered`
    }), [
      F($i, {
        definition: e.state.definition,
        icon: "tabler:circle-check"
      }, null, 8, ["definition"]),
      I("dl", ve(Ae(y(O)("summary"))), [
        (f(!0), v(Z, null, he(r.value, (l) => (f(), v("div", b({
          key: l.field.id
        }, { ref_for: !0 }, y(O)("summary-item")), [
          I("dt", b({ ref_for: !0 }, y(O)("summary-question")), [
            F(Qe, {
              text: l.field.label
            }, null, 8, ["text"])
          ], 16),
          I("dd", b({ ref_for: !0 }, y(O)("summary-answer")), [
            l.items ? (f(), N(Oi, {
              key: 0,
              items: l.items
            }, null, 8, ["items"])) : (f(), v("span", b({
              key: 1,
              ref_for: !0
            }, y(O)("answer-empty")), "Skipped", 16))
          ], 16)
        ], 16))), 128))
      ], 16),
      F(ki, {
        ref_key: "statusRef",
        ref: i,
        state: e.state
      }, null, 8, ["state"])
    ], 16, Sm));
  }
}), $m = { class: "max-w-full min-w-0" }, Cm = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Tm = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Pm = {
  key: 5,
  "no-bg": "",
  title: "Loading form…"
}, Em = "Could not refresh this form. Showing what you last saw.", Om = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", _m = "This form was answered. Your answer is in the chat.", Dm = /* @__PURE__ */ ce({
  __name: "wippy-form",
  setup(e) {
    const t = `${ei} If you already answered it, your answer is in the chat.`, n = Uu(), r = qu(), i = Fu(), o = P(() => n.value.definition), a = P(() => n.value.state), l = P(() => a.value === "idle"), { status: s, state: d, errorMessage: c, reloadError: u, reload: p, refresh: m } = Vu(i, a);
    Fl(d, m);
    const { submitting: g, submit: x } = ju(i), { isOnline: $ } = Hu(() => p()), T = U(null), _ = U(!1);
    let V = !1;
    le(i, () => {
      _.value = !1, T.value = null, V = !1;
    });
    const k = U(null), E = U(null);
    let w = !1;
    le(() => d.value?.status, (J, H) => {
      if (!(J !== "idle" || H !== "active") && !(g.value || V)) {
        if (w) {
          w = !1;
          return;
        }
        k.value?.hasUnsentInput() && (_.value = !0);
      }
    });
    function D(J) {
      return !!J?.fields?.some((H) => !Ul(H.type));
    }
    const C = P(() => {
      const J = n.value.formVersion;
      if (J !== void 0 && !ro(J))
        return !0;
      const H = d.value?.form_version;
      return H !== void 0 && !ro(H) ? !0 : D(o.value) || D(d.value?.definition);
    }), R = P(() => {
      const J = d.value;
      return J && Yl(J) ? J : null;
    }), K = P(() => s.value === "unsupported" ? l.value ? { severity: "secondary", message: _m } : { severity: "warn", message: t } : i.value ? null : { severity: "secondary", message: ti }), W = U("active"), Y = U(!1), ne = P(() => C.value || s.value === "unsupported" ? "unsupported" : d.value === null ? "loading" : d.value.status === "idle" ? "answered" : R.value ? W.value : "active"), re = P(() => !C.value && R.value !== null && d.value?.status === "active" && Y.value);
    zu(ne, re);
    async function ie(J) {
      if (!d.value)
        return;
      T.value = null;
      const H = await x(d.value.form_version, d.value.content_version, J);
      if (!H.ignored) {
        if (H.ok && H.accepted) {
          const M = H.accepted;
          w = d.value.status !== "idle", d.value = {
            ...d.value,
            status: "idle",
            stale: !1,
            late: M.late,
            content_version: M.content_version,
            data: J,
            answer_message_id: M.answer_message_id,
            delivery: M.delivery
          }, Ne(() => E.value?.focusStatus()), p();
          return;
        }
        if (H.fieldErrors || H.formErrors) {
          k.value?.setServerErrors(H.fieldErrors, H.formErrors);
          return;
        }
        if (H.code === "network_error" && (V = !0), H.code === "already_submitted") {
          V || (_.value = !0), await m(), Ne(() => E.value?.focusStatus());
          return;
        }
        H.shouldReload && p(), T.value = { message: H.message ?? Qt, retryable: H.retryable };
      }
    }
    function pe() {
      k.value?.retry();
    }
    return (J, H) => (f(), v("div", $m, [
      y(r).length > 0 ? (f(), N(Ue, {
        key: 0,
        severity: "error"
      }, {
        default: Q(() => [...H[2] || (H[2] = [
          de(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : o.value?.fields?.length ? C.value ? (f(), N(Ue, {
        key: 2,
        severity: "warn"
      }, {
        default: Q(() => [...H[4] || (H[4] = [
          de(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : K.value ? (f(), N(jf, {
        key: 3,
        definition: o.value,
        severity: K.value.severity,
        message: K.value.message
      }, null, 8, ["definition", "severity", "message"])) : y(d) ? (f(), v(Z, { key: 4 }, [
        y(u) ? (f(), v("p", Cm, L(Em))) : A("", !0),
        y(d).status === "active" && R.value ? (f(), N(km, {
          key: y(d).artifact_id,
          ref_key: "activeRef",
          ref: k,
          state: R.value,
          submitting: y(g),
          banner: T.value,
          offline: !y($),
          onSubmit: ie,
          onRetry: pe,
          onStepChange: H[0] || (H[0] = (M) => {
            W.value = M;
          }),
          onCollapsedChange: H[1] || (H[1] = (M) => {
            Y.value = M;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : y(d).status === "active" ? (f(), N(Bf, {
          key: y(d).artifact_id,
          ref_key: "activeRef",
          ref: k,
          state: y(d),
          submitting: y(g),
          banner: T.value,
          offline: !y($),
          onSubmit: ie,
          onRetry: pe
        }, null, 8, ["state", "submitting", "banner", "offline"])) : (f(), v(Z, { key: 3 }, [
          _.value ? (f(), v("p", Tm, L(Om))) : A("", !0),
          R.value ? (f(), N(xm, {
            key: y(d).artifact_id,
            ref_key: "summaryRef",
            ref: E,
            state: R.value
          }, null, 8, ["state"])) : (f(), N(Kf, {
            key: y(d).artifact_id,
            ref_key: "summaryRef",
            ref: E,
            state: y(d)
          }, null, 8, ["state"]))
        ], 64))
      ], 64)) : y(s) === "loading" || y(s) === "idle" ? (f(), v("wippy-loading", Pm)) : y(s) === "error" ? (f(), N(Ue, {
        key: 6,
        severity: "error",
        retry: "",
        onRetry: y(p)
      }, {
        default: Q(() => [
          de(L(y(c) || y(ni)), 1)
        ]),
        _: 1
      }, 8, ["onRetry"])) : A("", !0) : (f(), N(Ue, {
        key: 1,
        severity: "error"
      }, {
        default: Q(() => [...H[3] || (H[3] = [
          de(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), Am = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.visible{visibility:visible}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.isolate{isolation:isolate}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.inline{display:inline}.flex{display:flex}.table{display:table}.min-w-0{min-width:0px}.max-w-full{max-width:100%}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.items-center{align-items:center}.gap-2{gap:.5rem}.rounded{border-radius:.25rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.text-warn-700{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-700) calc(100% * var(--tw-text-opacity, 1)),transparent)}.shadow{--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, 14px);--_q-size: var(--wippy-form-question-size, 15px);--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, var(--p-content-background));--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_muted-row: var(--wippy-form-text-muted-on-row, var(--p-text-hover-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 40%, var(--p-content-border-color)));--_row-hover: var(--wippy-form-row-hover, color-mix(in srgb, var(--p-content-border-color) 90%, var(--p-text-color)));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-content-border-color)));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, 10px);--_row-py: var(--wippy-form-row-padding-y, 6px);--_row-px: var(--wippy-form-row-padding-x, 10px);--_gap: var(--wippy-form-gap, 4px);--_key: var(--wippy-form-key-size, 20px);--_field-gap: var(--wippy-form-field-gap, 16px);--_label-weight: var(--wippy-form-label-weight, 500);--_date-width: var(--wippy-form-date-width, 20rem);display:block;container-type:inline-size}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted-row)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted-row);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted-row);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted-row)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted-row);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:var(--_key);height:var(--_key);padding:0 4px;font-family:var(--_font);font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;color:var(--_muted-row);border:1px solid var(--_key-border);border-radius:5px}@supports (text-box: trim-both cap alphabetic){.w-form__option-key{text-box:trim-both cap alphabetic}}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form .w-form__send--sending{pointer-events:auto;cursor:progress}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted-row);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted-row);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted-row);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted-row)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;width:-moz-fit-content;width:fit-content;max-width:100%;border-radius:var(--_row-radius);font-size:12px;color:var(--_muted)}.w-form__status:focus-visible{outline-width:var(--p-focus-ring-width, 1px);outline-style:var(--p-focus-ring-style, solid);outline-color:var(--wippy-form-focus, var(--p-focus-ring-color, var(--_accent)));outline-offset:var(--p-focus-ring-offset, 2px)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}.w-form__fields{gap:var(--_field-gap)}.w-form__fields-title{margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;overflow-wrap:anywhere}.w-form__fields-error{list-style:none;margin:0;padding:0;font-size:var(--_small)}.w-form__field{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0;padding:0;border:0}.w-form__field-label{padding:0;font-weight:var(--_label-weight);overflow-wrap:anywhere}.w-form__field-row{display:flex;align-items:flex-start;gap:8px}.w-form__field--inline .w-form__field-control{flex:none}.w-form__field-description{margin:0;font-size:var(--_small);color:var(--_muted)}.w-form__field-control{min-width:0}.w-form__field-value{margin:0;overflow-wrap:anywhere;white-space:pre-wrap}.w-form__field-value--empty{color:var(--_muted)}.w-form__field-item{margin:0}.w-form__field-note{display:block;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__field-error{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;font-size:var(--_small)}.w-form__field-options{display:flex;flex-direction:column;gap:6px}.w-form__field-option{display:flex;align-items:flex-start;gap:8px}.w-form__field-option-label{overflow-wrap:anywhere}.w-form__field-option-description{display:block;font-size:var(--_small);color:var(--_muted)}.w-form__field-other{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}.w-form__field-input--date{width:min(100%,var(--_date-width));max-width:100%}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}.motion-reduce\\:animate-none{animation:none}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}.dark\\:text-warn-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-warn-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class Mm extends Nl {
  static get wippyConfig() {
    return {
      propsSchema: Rl.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Am
    };
  }
  static get vueConfig() {
    return {
      rootComponent: Dm,
      plugins: [dl],
      providers(t, n) {
        t.provide(mr, n);
      }
    };
  }
}
ra(import.meta.url, Mm);
//# sourceMappingURL=index.js.map
