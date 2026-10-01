import { ref as U, readonly as da, getCurrentInstance as tr, onMounted as Zt, nextTick as Je, watch as ue, reactive as Vn, renderSlot as Y, openBlock as p, createBlock as F, Teleport as Zr, createCommentVNode as M, useId as Et, mergeProps as x, h as ca, createApp as pa, inject as Dt, createElementBlock as b, createElementVNode as I, createTextVNode as oe, toDisplayString as N, resolveComponent as Le, resolveDirective as Ln, withDirectives as Ue, resolveDynamicComponent as be, withCtx as Z, normalizeClass as $, Transition as Qr, onUnmounted as Qt, computed as y, watchEffect as fa, defineComponent as pe, Fragment as X, renderList as ce, unref as P, createVNode as z, normalizeStyle as ma, vShow as nr, withKeys as le, onBeforeUnmount as ha, withModifiers as Xr } from "vue";
import { addCollection as ba, Icon as Ce } from "@iconify/vue";
import * as Bn from "@wippy-fe/proxy";
import { config as rr, addIcons as va, on as Ge, applyThemeMode as Lt, host as ga, hostCss as ya, loadCss as wa, define as ka } from "@wippy-fe/proxy";
import { getActivePinia as Sa, createPinia as xa, setActivePinia as $a } from "pinia";
var Ca = Object.defineProperty, or = Object.getOwnPropertySymbols, Ta = Object.prototype.hasOwnProperty, Pa = Object.prototype.propertyIsEnumerable, ar = (e, t, n) => t in e ? Ca(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, _a = (e, t) => {
  for (var n in t || (t = {})) Ta.call(t, n) && ar(e, n, t[n]);
  if (or) for (var n of or(t)) Pa.call(t, n) && ar(e, n, t[n]);
  return e;
};
function Me(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function pn(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), a = Array.isArray(t), o, i, l;
  if (r && a) {
    if (i = e.length, i != t.length) return !1;
    for (o = i; o-- !== 0; ) if (!pn(e[o], t[o], n)) return !1;
    return !0;
  }
  if (r != a) return !1;
  let s = e instanceof Date, d = t instanceof Date;
  if (s != d) return !1;
  if (s && d) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, u = t instanceof RegExp;
  if (c != u) return !1;
  if (c && u) return e.toString() == t.toString();
  let f = Object.keys(e);
  if (i = f.length, i !== Object.keys(t).length) return !1;
  for (o = i; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, f[o])) return !1;
  for (o = i; o-- !== 0; ) if (l = f[o], !pn(e[l], t[l], n)) return !1;
  return !0;
}
function Oa(e, t) {
  return pn(e, t);
}
function Nn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function ie(e) {
  return !Me(e);
}
function ir(e, t) {
  return null;
}
function jn(e, t, n) {
  return n ? ir() === ir() : Oa(e, t);
}
function Ea(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (jn(e, n)) return !0;
  }
  return !1;
}
function Ae(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Jr(e = {}, t = {}) {
  let n = _a({}, e);
  return Object.keys(t).forEach((r) => {
    let a = r;
    Ae(t[a]) && a in e && Ae(e[a]) ? n[a] = Jr(e[a], t[a]) : n[a] = t[a];
  }), n;
}
function Da(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Jr(t, n), {});
}
function ke(e, ...t) {
  return Nn(e) ? e(...t) : e;
}
function we(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Ee(e) {
  return we(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Fn(e, t = "", n = {}) {
  let r = Ee(t).split("."), a = r.shift();
  if (a) {
    if (Ae(e)) {
      let o = Object.keys(e).find((i) => Ee(i) === a) || "";
      return Fn(ke(e[o], n), r.join("."), n);
    }
    return;
  }
  return ke(e, n);
}
function eo(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Ma(e) {
  return e instanceof Date;
}
function Aa(e) {
  return ie(e) && !isNaN(e);
}
function Ia() {
  return new Intl.Collator(void 0, { numeric: !0 }).compare;
}
function qe(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Va(...e) {
  return Da(...e);
}
function lt(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function La(e) {
  return we(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function to(e) {
  return we(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function Rn() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((a) => {
      a(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ve(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let a = typeof r;
      if (a === "string" || a === "number") t.push(r);
      else if (a === "object") {
        let o = Array.isArray(r) ? [ve(...r)] : Object.entries(r).map(([i, l]) => l ? i : void 0);
        t = o.length ? t.concat(o.filter((i) => !!i)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Ba(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Na(e, t) {
  if (e && t) {
    let n = (r) => {
      Ba(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function nn(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function fn(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function no(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], a = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = a.width || e.offsetWidth, t.height = a.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function ro() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], a = e.innerWidth || n.clientWidth || r.clientWidth, o = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: a, height: o };
}
function mn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function ja() {
  let e = document.documentElement;
  return (window.pageXOffset || mn(e)) - (e.clientLeft || 0);
}
function Fa() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function Ra(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function za(e, t, n = !0) {
  var r, a, o, i;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : no(e), s = l.height, d = l.width, c = t.offsetHeight, u = t.offsetWidth, f = t.getBoundingClientRect(), m = Fa(), v = ja(), g = ro(), w, S, V = "top";
    f.top + c + s > g.height ? (w = f.top + m - s, V = "bottom", w < 0 && (w = m)) : w = c + f.top + m, f.left + d > g.width ? S = Math.max(0, f.left + v + u - d) : S = f.left + v, Ra(e) ? e.style.insetInlineEnd = S + "px" : e.style.insetInlineStart = S + "px", e.style.top = w + "px", e.style.transformOrigin = V, n && (e.style.marginTop = V === "bottom" ? `calc(${(a = (r = fn(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? a : "2px"} * -1)` : (i = (o = fn(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? i : "");
  }
}
function Ha(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function zt(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ua(e, t, n = !0, r = void 0) {
  var a;
  if (e) {
    let o = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : no(e), i = t.offsetHeight, l = t.getBoundingClientRect(), s = ro(), d, c, u = r ?? "top";
    if (!r && l.top + i + o.height > s.height ? (d = -1 * o.height, u = "bottom", l.top + d < 0 && (d = -1 * l.top)) : d = i, o.width > s.width ? c = l.left * -1 : l.left + o.width > s.width ? c = (l.left + o.width - s.width) * -1 : c = 0, e.style.top = d + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = u, n) {
      let f = (a = fn(/-anchor-gutter$/)) == null ? void 0 : a.value;
      e.style.marginTop = u === "bottom" ? `calc(${f ?? "2px"} * -1)` : f ?? "";
    }
  }
}
function zn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function qa(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && zn(e));
}
function tt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ht(e, t = {}) {
  if (tt(e)) {
    let n = (r, a) => {
      var o, i;
      let l = (o = e?.$attrs) != null && o[r] ? [(i = e?.$attrs) == null ? void 0 : i[r]] : [];
      return [a].flat().reduce((s, d) => {
        if (d != null) {
          let c = typeof d;
          if (c === "string" || c === "number") s.push(d);
          else if (c === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([f, m]) => r === "style" && (m || m === 0) ? `${f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? f : void 0);
            s = u.length ? s.concat(u.filter((f) => !!f)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([r, a]) => {
      if (a != null) {
        let o = r.match(/^on(.+)/);
        o ? e.addEventListener(o[1].toLowerCase(), a) : r === "p-bind" || r === "pBind" ? Ht(e, a) : (a = r === "class" ? [...new Set(n("class", a))].join(" ").trim() : r === "style" ? n("style", a).join(";").trim() : a, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = a), e.setAttribute(r, a));
      }
    });
  }
}
function Ya(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Ht(r, t), r.append(...n), r;
  }
}
function Fe(e, t) {
  return tt(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Pe(e, t) {
  return tt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function He(e, t) {
  if (tt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function sr(e, t = "") {
  let n = Fe(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let a of n) getComputedStyle(a).display != "none" && getComputedStyle(a).visibility != "hidden" && r.push(a);
  return r;
}
function lr(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function rt(e) {
  var t;
  if (e) {
    let n = (t = zn(e)) == null ? void 0 : t.childNodes, r = 0;
    if (n) for (let a = 0; a < n.length; a++) {
      if (n[a] === e) return r;
      n[a].nodeType === 1 && r++;
    }
  }
  return -1;
}
function Ka(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || mn(document.documentElement) || mn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Wa(e, t) {
  return e ? e.offsetHeight : 0;
}
function oo(e, t = []) {
  let n = zn(e);
  return n === null ? t : oo(n, t.concat([n]));
}
function Ga(e) {
  let t = [];
  if (e) {
    let n = oo(e), r = /(auto|scroll)/, a = (o) => {
      try {
        let i = window.getComputedStyle(o, null);
        return r.test(i.getPropertyValue("overflow")) || r.test(i.getPropertyValue("overflowX")) || r.test(i.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let i = o.nodeType === 1 && o.dataset.scrollselectors;
      if (i) {
        let l = i.split(",");
        for (let s of l) {
          let d = Pe(o, s);
          d && a(d) && t.push(d);
        }
      }
      o.nodeType !== 9 && a(o) && t.push(o);
    }
  }
  return t;
}
function ur(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function ao() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Za() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function io(e, t = "", n) {
  tt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Bt = {};
function Qa(e = "pui_id_") {
  return Object.hasOwn(Bt, e) || (Bt[e] = 0), Bt[e]++, `${e}${Bt[e]}`;
}
function Xa() {
  let e = [], t = (i, l, s = 999) => {
    let d = a(i, l, s), c = d.value + (d.key === i ? 0 : s) + 1;
    return e.push({ key: i, value: c }), c;
  }, n = (i) => {
    e = e.filter((l) => l.value !== i);
  }, r = (i, l) => a(i).value, a = (i, l, s = 0) => [...e].reverse().find((d) => !0) || { key: i, value: s }, o = (i) => i && parseInt(i.style.zIndex, 10) || 0;
  return { get: o, set: (i, l, s) => {
    l && (l.style.zIndex = String(t(i, !0, s)));
  }, clear: (i) => {
    i && (n(o(i)), i.style.zIndex = "");
  }, getCurrent: (i) => r(i) };
}
var rn = Xa(), Ja = Object.defineProperty, ei = Object.defineProperties, ti = Object.getOwnPropertyDescriptors, Ut = Object.getOwnPropertySymbols, so = Object.prototype.hasOwnProperty, lo = Object.prototype.propertyIsEnumerable, dr = (e, t, n) => t in e ? Ja(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, _e = (e, t) => {
  for (var n in t || (t = {})) so.call(t, n) && dr(e, n, t[n]);
  if (Ut) for (var n of Ut(t)) lo.call(t, n) && dr(e, n, t[n]);
  return e;
}, on = (e, t) => ei(e, ti(t)), Ve = (e, t) => {
  var n = {};
  for (var r in e) so.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Ut) for (var r of Ut(e)) t.indexOf(r) < 0 && lo.call(e, r) && (n[r] = e[r]);
  return n;
}, ni = Rn(), me = ni, ut = /{([^}]*)}/g, uo = /(\d+\s+[\+\-\*\/]\s+\d+)/g, co = /var\([^)]+\)/g;
function cr(e) {
  return we(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function ri(e) {
  return Ae(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function oi(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function hn(e = "", t = "") {
  return oi(`${we(e, !1) && we(t, !1) ? `${e}-` : e}${t}`);
}
function po(e = "", t = "") {
  return `--${hn(e, t)}`;
}
function ai(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function fo(e, t = "", n = "", r = [], a) {
  if (we(e)) {
    let o = e.trim();
    if (ai(o)) return;
    if (qe(o, ut)) {
      let i = o.replaceAll(ut, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((d) => !r.some((c) => qe(d, c)));
        return `var(${po(n, to(s.join("-")))}${ie(a) ? `, ${a}` : ""})`;
      });
      return qe(i.replace(co, "0"), uo) ? `calc(${i})` : i;
    }
    return o;
  } else if (Aa(e)) return e;
}
function ii(e, t, n) {
  we(t, !1) && e.push(`${t}:${n};`);
}
function Ze(e, t) {
  return e ? `${e}{${t}}` : "";
}
function mo(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(i, l) {
    let s = [], d = 0, c = "", u = null, f = 0;
    for (; d <= i.length; ) {
      let m = i[d];
      if ((m === '"' || m === "'" || m === "`") && i[d - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && f++, m === ")" && f--, (m === "," || d === i.length) && f === 0)) {
        let v = c.trim();
        v.startsWith("dt(") ? s.push(mo(v, l)) : s.push(r(v)), c = "", d++;
        continue;
      }
      m !== void 0 && (c += m), d++;
    }
    return s;
  }
  function r(i) {
    let l = i[0];
    if ((l === '"' || l === "'" || l === "`") && i[i.length - 1] === l) return i.slice(1, -1);
    let s = Number(i);
    return isNaN(s) ? i : s;
  }
  let a = [], o = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") o.push(i), i += 2;
  else if (e[i] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && a.push([l, i]);
  }
  if (!a.length) return e;
  for (let i = a.length - 1; i >= 0; i--) {
    let [l, s] = a[i], d = e.slice(l + 3, s), c = n(d, t), u = t(...c);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var Ye = (...e) => si(ae.getTheme(), ...e), si = (e = {}, t, n, r) => {
  if (t) {
    let { variable: a, options: o } = ae.defaults || {}, { prefix: i, transform: l } = e?.options || o || {}, s = qe(t, ut) ? t : `{${t}}`;
    return r === "value" || Me(r) && l === "strict" ? ae.getTokenValue(t) : fo(s, void 0, i, [a.excludedKeyRegex], n);
  }
  return "";
};
function Nt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, a, o) => {
      var i;
      return r + a + ((i = ke(t[o], { dt: Ye })) != null ? i : "");
    }, "");
    return mo(n, Ye);
  }
  return ke(e, { dt: Ye });
}
function li(e, t = {}) {
  let n = ae.defaults.variable, { prefix: r = n.prefix, selector: a = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = t, i = [], l = [], s = [{ node: e, path: r }];
  for (; s.length; ) {
    let { node: c, path: u } = s.pop();
    for (let f in c) {
      let m = c[f], v = ri(m), g = qe(f, o) ? hn(u) : hn(u, to(f));
      if (Ae(v)) s.push({ node: v, path: g });
      else {
        let w = po(g), S = fo(v, g, r, [o]);
        ii(l, w, S);
        let V = g;
        r && V.startsWith(r + "-") && (V = V.slice(r.length + 1)), i.push(V.replace(/-/g, "."));
      }
    }
  }
  let d = l.join("");
  return { value: l, tokens: i, declarations: d, css: Ze(a, d) };
}
var Te = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    return (r = t.map((a) => a.resolve(n)).find((a) => a.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return li(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: a }) {
  var o, i, l, s, d, c, u;
  let { preset: f, options: m } = t, v, g, w, S, V, A, h;
  if (ie(f) && m.transform !== "strict") {
    let { primitive: C, semantic: L, extend: B } = f, k = L || {}, { colorScheme: E } = k, j = Ve(k, ["colorScheme"]), q = B || {}, { colorScheme: K } = q, H = Ve(q, ["colorScheme"]), ee = E || {}, { dark: W } = ee, T = Ve(ee, ["dark"]), G = K || {}, { dark: O } = G, D = Ve(G, ["dark"]), R = ie(C) ? this._toVariables({ primitive: C }, m) : {}, Q = ie(j) ? this._toVariables({ semantic: j }, m) : {}, se = ie(T) ? this._toVariables({ light: T }, m) : {}, xe = ie(W) ? this._toVariables({ dark: W }, m) : {}, je = ie(H) ? this._toVariables({ semantic: H }, m) : {}, It = ie(D) ? this._toVariables({ light: D }, m) : {}, Ie = ie(O) ? this._toVariables({ dark: O }, m) : {}, [Vt, Ko] = [(o = R.declarations) != null ? o : "", R.tokens], [Wo, Go] = [(i = Q.declarations) != null ? i : "", Q.tokens || []], [Zo, Qo] = [(l = se.declarations) != null ? l : "", se.tokens || []], [Xo, Jo] = [(s = xe.declarations) != null ? s : "", xe.tokens || []], [ea, ta] = [(d = je.declarations) != null ? d : "", je.tokens || []], [na, ra] = [(c = It.declarations) != null ? c : "", It.tokens || []], [oa, aa] = [(u = Ie.declarations) != null ? u : "", Ie.tokens || []];
    v = this.transformCSS(e, Vt, "light", "variable", m, r, a), g = Ko;
    let ia = this.transformCSS(e, `${Wo}${Zo}`, "light", "variable", m, r, a), sa = this.transformCSS(e, `${Xo}`, "dark", "variable", m, r, a);
    w = `${ia}${sa}`, S = [.../* @__PURE__ */ new Set([...Go, ...Qo, ...Jo])];
    let la = this.transformCSS(e, `${ea}${na}color-scheme:light`, "light", "variable", m, r, a), ua = this.transformCSS(e, `${oa}color-scheme:dark`, "dark", "variable", m, r, a);
    V = `${la}${ua}`, A = [.../* @__PURE__ */ new Set([...ta, ...ra, ...aa])], h = ke(f.css, { dt: Ye });
  }
  return { primitive: { css: v, tokens: g }, semantic: { css: w, tokens: S }, global: { css: V, tokens: A }, style: h };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: a, defaults: o, selector: i }) {
  var l, s, d;
  let c, u, f;
  if (ie(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), v = t, { colorScheme: g, extend: w, css: S } = v, V = Ve(v, ["colorScheme", "extend", "css"]), A = w || {}, { colorScheme: h } = A, C = Ve(A, ["colorScheme"]), L = g || {}, { dark: B } = L, k = Ve(L, ["dark"]), E = h || {}, { dark: j } = E, q = Ve(E, ["dark"]), K = ie(V) ? this._toVariables({ [m]: _e(_e({}, V), C) }, n) : {}, H = ie(k) ? this._toVariables({ [m]: _e(_e({}, k), q) }, n) : {}, ee = ie(B) ? this._toVariables({ [m]: _e(_e({}, B), j) }, n) : {}, [W, T] = [(l = K.declarations) != null ? l : "", K.tokens || []], [G, O] = [(s = H.declarations) != null ? s : "", H.tokens || []], [D, R] = [(d = ee.declarations) != null ? d : "", ee.tokens || []], Q = this.transformCSS(m, `${W}${G}`, "light", "variable", n, a, o, i), se = this.transformCSS(m, D, "dark", "variable", n, a, o, i);
    c = `${Q}${se}`, u = [.../* @__PURE__ */ new Set([...T, ...O, ...R])], f = ke(S, { dt: Ye });
  }
  return { css: c, tokens: u, style: f };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: a }) {
  var o;
  let { preset: i, options: l } = t, s = (o = i?.components) == null ? void 0 : o[e];
  return this.getPreset({ name: e, preset: s, options: l, params: n, set: r, defaults: a });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: a }) {
  var o, i;
  let l = e.replace("-directive", ""), { preset: s, options: d } = t, c = ((o = s?.components) == null ? void 0 : o[l]) || ((i = s?.directives) == null ? void 0 : i[l]);
  return this.getPreset({ name: l, preset: c, options: d, params: n, set: r, defaults: a });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: a } = t;
  return a ? `@layer ${ke(a.order || a.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: a, defaults: o }) {
  let i = this.getCommon({ name: e, theme: t, params: n, set: a, defaults: o }), l = Object.entries(r).reduce((s, [d, c]) => s.push(`${d}="${c}"`) && s, []).join(" ");
  return Object.entries(i || {}).reduce((s, [d, c]) => {
    if (Ae(c) && Object.hasOwn(c, "css")) {
      let u = lt(c.css), f = `${d}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${f}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: a, defaults: o }) {
  var i;
  let l = { name: e, theme: t, params: n, set: a, defaults: o }, s = (i = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : i.css, d = Object.entries(r).reduce((c, [u, f]) => c.push(`${u}="${f}"`) && c, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${lt(s)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", a = {}) {
  let o = function(l, s = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    d.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && ut.test(this.value)) {
      let u = this.value.trim().replace(ut, (f) => {
        var m;
        let v = f.slice(1, -1), g = this.tokens[v];
        if (!g) return console.warn(`Token not found for path: ${v}`), "__UNRESOLVED__";
        let w = g.computed(l, s, d);
        return Array.isArray(w) && w.length === 2 ? `light-dark(${w[0].value},${w[1].value})` : (m = w?.value) != null ? m : "__UNRESOLVED__";
      });
      c = uo.test(u.replace(co, "0")) ? `calc(${u})` : u;
    }
    return Me(s.binding) && delete s.binding, d.pop(), { colorScheme: l, path: this.path, paths: s, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, i = (l, s, d) => {
    Object.entries(l).forEach(([c, u]) => {
      let f = qe(c, t.variable.excludedKeyRegex) ? s : s ? `${s}.${cr(c)}` : cr(c), m = d ? `${d}.${c}` : c;
      Ae(u) ? i(u, f, m) : (a[f] || (a[f] = { paths: [], computed: (v, g = {}, w = []) => {
        if (a[f].paths.length === 1) return a[f].paths[0].computed(a[f].paths[0].scheme, g.binding, w);
        if (v && v !== "none") for (let S = 0; S < a[f].paths.length; S++) {
          let V = a[f].paths[S];
          if (V.scheme === v) return V.computed(v, g.binding, w);
        }
        return a[f].paths.map((S) => S.computed(S.scheme, g[S.scheme], w));
      } }), a[f].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: a }));
    });
  };
  return i(e, n, r), a;
}, getTokenValue(e, t, n) {
  var r;
  let a = ((l) => l.split(".").filter((s) => !qe(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), o = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(r = e[a]) == null ? void 0 : r.computed(o)].flat().filter((l) => l);
  return i.length === 1 ? i[0].value : i.reduce((l = {}, s) => {
    let d = s, { colorScheme: c } = d, u = Ve(d, ["colorScheme"]);
    return l[c] = u, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ze(ie(t) ? `${e}${t},${e} ${t}` : e, r) : Ze(e, Ze(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, a = {}, o, i, l) {
  if (ie(t)) {
    let { cssLayer: s } = a;
    if (r !== "style") {
      let d = this.getColorSchemeOption(a, i);
      t = n === "dark" ? d.reduce((c, { type: u, selector: f }) => (ie(f) && (c += f.includes("[CSS]") ? f.replace("[CSS]", t) : this.getSelectorRule(f, l, u, t)), c), "") : Ze(l ?? ":root,:host", t);
    }
    if (s) {
      let d = { name: "primeui" };
      Ae(s) && (d.name = ke(s.name, { name: e, type: r })), ie(d.name) && (t = Ze(`@layer ${d.name}`, t), o?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, ae = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = on(_e({}, t), { options: _e(_e({}, this.defaults.options), t.options) }), this._tokens = Te.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), me.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = on(_e({}, this.theme), { preset: e }), this._tokens = Te.createTokens(e, this.defaults), this.clearLoadedStyleNames(), me.emit("preset:change", e), me.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = on(_e({}, this.theme), { options: e }), this.clearLoadedStyleNames(), me.emit("options:change", e), me.emit("theme:change", this.theme);
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
  return Te.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return Te.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Te.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Te.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let a = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return Te.getPreset(a);
}, getLayerOrderCSS(e = "") {
  return Te.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return Te.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return Te.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return Te.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), me.emit(`theme:${t}:load`, e), !this._loadingStyles.size && me.emit("theme:load"));
} }, he = {
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
}, ui = `
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
function dt(e) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, dt(e);
}
function pr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function fr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? pr(Object(n), !0).forEach(function(r) {
      di(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : pr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function di(e, t, n) {
  return (t = ci(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ci(e) {
  var t = pi(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function pi(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function fi(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  tr() && tr().components ? Zt(e) : t ? e() : Je(e);
}
var mi = 0;
function hi(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = U(!1), r = U(e), a = U(null), o = ao() ? window.document : void 0, i = t.document, l = i === void 0 ? o : i, s = t.immediate, d = s === void 0 ? !0 : s, c = t.manual, u = c === void 0 ? !1 : c, f = t.name, m = f === void 0 ? "style_".concat(++mi) : f, v = t.id, g = v === void 0 ? void 0 : v, w = t.media, S = w === void 0 ? void 0 : w, V = t.nonce, A = V === void 0 ? void 0 : V, h = t.first, C = h === void 0 ? !1 : h, L = t.onMounted, B = L === void 0 ? void 0 : L, k = t.onUpdated, E = k === void 0 ? void 0 : k, j = t.onLoad, q = j === void 0 ? void 0 : j, K = t.props, H = K === void 0 ? {} : K, ee = function() {
  }, W = function(O) {
    var D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var R = fr(fr({}, H), D), Q = R.name || m, se = R.id || g, xe = R.nonce || A;
      a.value = l.querySelector('style[data-primevue-style-id="'.concat(Q, '"]')) || l.getElementById(se) || l.createElement("style"), a.value.isConnected || (r.value = O || e, Ht(a.value, {
        type: "text/css",
        id: se,
        media: S,
        nonce: xe
      }), C ? l.head.prepend(a.value) : l.head.appendChild(a.value), io(a.value, "data-primevue-style-id", Q), Ht(a.value, R), a.value.onload = function(je) {
        return q?.(je, {
          name: Q
        });
      }, B?.(Q)), !n.value && (ee = ue(r, function(je) {
        a.value.textContent = je, E?.(Q);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, T = function() {
    !l || !n.value || (ee(), qa(a.value) && l.head.removeChild(a.value), n.value = !1, a.value = null);
  };
  return d && !u && fi(W), {
    id: g,
    name: m,
    el: a,
    css: r,
    unload: T,
    load: W,
    isLoaded: da(n)
  };
}
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
var mr, hr, br, vr;
function gr(e, t) {
  return yi(e) || gi(e, t) || vi(e, t) || bi();
}
function bi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vi(e, t) {
  if (e) {
    if (typeof e == "string") return yr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yr(e, t) : void 0;
  }
}
function yr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function gi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, a, o, i, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, a = c;
    } finally {
      try {
        if (!s && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw a;
      }
    }
    return l;
  }
}
function yi(e) {
  if (Array.isArray(e)) return e;
}
function wr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function an(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wr(Object(n), !0).forEach(function(r) {
      wi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function wi(e, t, n) {
  return (t = ki(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ki(e) {
  var t = Si(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Si(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function jt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var xi = function(t) {
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
}, $i = {}, Ci = {}, re = {
  name: "base",
  css: xi,
  style: ui,
  classes: $i,
  inlineStyles: Ci,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, a = r(Nt(mr || (mr = jt(["", ""])), t));
    return ie(a) ? hi(lt(a), an({
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
      var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return ae.transformCSS(n.name || t.name, "".concat(a).concat(Nt(hr || (hr = jt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return ae.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return ae.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return ae.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return ae.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return ae.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ke(this.css, {
        dt: Ye
      }) || "", a = lt(Nt(br || (br = jt(["", "", ""])), r, t)), o = Object.entries(n).reduce(function(i, l) {
        var s = gr(l, 2), d = s[0], c = s[1];
        return i.push("".concat(d, '="').concat(c, '"')) && i;
      }, []).join(" ");
      return ie(a) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(a, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return ae.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [ae.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var a = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Nt(vr || (vr = jt(["", ""])), ke(this.style, {
        dt: Ye
      })), i = lt(ae.transformCSS(a, o)), l = Object.entries(n).reduce(function(s, d) {
        var c = gr(d, 2), u = c[0], f = c[1];
        return s.push("".concat(u, '="').concat(f, '"')) && s;
      }, []).join(" ");
      ie(i) && r.push('<style type="text/css" data-primevue-style-id="'.concat(a, '" ').concat(l, ">").concat(i, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return an(an({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ze = Rn();
function pt(e) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pt(e);
}
function kr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ft(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kr(Object(n), !0).forEach(function(r) {
      Ti(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ti(e, t, n) {
  return (t = Pi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Pi(e) {
  var t = _i(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function _i(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Oi = {
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
    text: [he.STARTS_WITH, he.CONTAINS, he.NOT_CONTAINS, he.ENDS_WITH, he.EQUALS, he.NOT_EQUALS],
    numeric: [he.EQUALS, he.NOT_EQUALS, he.LESS_THAN, he.LESS_THAN_OR_EQUAL_TO, he.GREATER_THAN, he.GREATER_THAN_OR_EQUAL_TO],
    date: [he.DATE_IS, he.DATE_IS_NOT, he.DATE_BEFORE, he.DATE_AFTER]
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
}, Ei = Symbol();
function Di(e, t) {
  var n = {
    config: Vn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Ei, n), Mi(), Ai(e, n), n;
}
var Qe = [];
function Mi() {
  me.clear(), Qe.forEach(function(e) {
    return e?.();
  }), Qe = [];
}
function Ai(e, t) {
  var n = U(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !ae.isStyleNameLoaded("common")) {
      var c, u, f = ((c = re.getCommonTheme) === null || c === void 0 ? void 0 : c.call(re)) || {}, m = f.primitive, v = f.semantic, g = f.global, w = f.style, S = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      re.load(m?.css, Ft({
        name: "primitive-variables"
      }, S)), re.load(v?.css, Ft({
        name: "semantic-variables"
      }, S)), re.load(g?.css, Ft({
        name: "global-variables"
      }, S)), re.loadStyle(Ft({
        name: "global-style"
      }, S), w), ae.setLoadedStyleName("common");
    }
  };
  me.on("theme:change", function(s) {
    n.value || (e.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var a = ue(t.config, function(s, d) {
    ze.emit("config:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = ue(function() {
    return t.config.ripple;
  }, function(s, d) {
    ze.emit("config:ripple:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ue(function() {
    return t.config.theme;
  }, function(s, d) {
    n.value || ae.setTheme(s), t.config.unstyled || r(), n.value = !1, ze.emit("config:theme:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ue(function() {
    return t.config.unstyled;
  }, function(s, d) {
    !s && t.config.theme && r(), ze.emit("config:unstyled:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Qe.push(a), Qe.push(o), Qe.push(i), Qe.push(l);
}
var Ii = {
  install: function(t, n) {
    var r = Va(Oi, n);
    Di(t, r);
  }
}, Hn = {
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
    this.mounted = ao();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Vi(e, t, n, r, a, o) {
  return o.inline ? Y(e.$slots, "default", {
    key: 0
  }) : a.mounted ? (p(), F(Zr, {
    key: 1,
    to: n.appendTo
  }, [Y(e.$slots, "default")], 8, ["to"])) : M("", !0);
}
Hn.render = Vi;
var Re = {
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
function Li() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Et();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Sr = re.extend({
  name: "common"
});
function ft(e) {
  "@babel/helpers - typeof";
  return ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ft(e);
}
function Bi(e) {
  return vo(e) || Ni(e) || bo(e) || ho();
}
function Ni(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ot(e, t) {
  return vo(e) || ji(e, t) || bo(e, t) || ho();
}
function ho() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bo(e, t) {
  if (e) {
    if (typeof e == "string") return bn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bn(e, t) : void 0;
  }
}
function bn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ji(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, a, o, i, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, a = c;
    } finally {
      try {
        if (!s && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw a;
      }
    }
    return l;
  }
}
function vo(e) {
  if (Array.isArray(e)) return e;
}
function xr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function te(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xr(Object(n), !0).forEach(function(r) {
      it(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function it(e, t, n) {
  return (t = Fi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fi(e) {
  var t = Ri(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function Ri(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var nt = {
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
        me.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        me.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, a, o, i, l, s, d, c, u, f = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, v = f ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (a = v || m) === null || a === void 0 || (a = a.hooks) === null || a === void 0 || (o = a.onBeforeCreate) === null || o === void 0 || o.call(a);
    var g = (i = this.$primevueConfig) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i._usept, w = g ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, S = g ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (c = S || w) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (u = c.onBeforeCreate) === null || u === void 0 || u.call(c), this.$attrSelector = Li(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Pe(tt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = te({
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
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), a = 1; a < n; a++)
        r[a - 1] = arguments[a];
      return Nn(t) ? t.apply(void 0, r) : x.apply(void 0, r);
    },
    _load: function() {
      Re.isStyleNameLoaded("base") || (re.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Re.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Re.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Sr.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Re.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      ie(t) && re.load(t, te({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!ae.isStyleNameLoaded("common")) {
          var r, a, o = ((r = this.$style) === null || r === void 0 || (a = r.getCommonTheme) === null || a === void 0 ? void 0 : a.call(r)) || {}, i = o.primitive, l = o.semantic, s = o.global, d = o.style;
          re.load(i?.css, te({
            name: "primitive-variables"
          }, this.$styleOptions)), re.load(l?.css, te({
            name: "semantic-variables"
          }, this.$styleOptions)), re.load(s?.css, te({
            name: "global-variables"
          }, this.$styleOptions)), re.loadStyle(te({
            name: "global-style"
          }, this.$styleOptions), d), ae.setLoadedStyleName("common");
        }
        if (!ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, u, f, m, v = ((c = this.$style) === null || c === void 0 || (u = c.getComponentTheme) === null || u === void 0 ? void 0 : u.call(c)) || {}, g = v.css, w = v.style;
          (f = this.$style) === null || f === void 0 || f.load(g, te({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(te({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), w), ae.setLoadedStyleName(this.$style.name);
        }
        if (!ae.isStyleNameLoaded("layer-order")) {
          var S, V, A = (S = this.$style) === null || S === void 0 || (V = S.getLayerOrderThemeCSS) === null || V === void 0 ? void 0 : V.call(S);
          re.load(A, te({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), ae.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, a, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, i = o.css, l = (a = this.$style) === null || a === void 0 ? void 0 : a.load(i, te({
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
      Re.clearLoadedStyleNames(), me.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      me.off("theme:change", this._loadCoreStyles), me.off("theme:change", this._load), me.off("theme:change", this._themeScopedListener);
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
      return Fn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, i = /./g.test(r) && !!a[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, f = o ? i ? this._useGlobalPT(this._getPTClassValue, r, a) : this._useDefaultPT(this._getPTClassValue, r, a) : void 0, m = i ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, te(te({}, a), {}, {
        global: f || {}
      })), v = this._getPTDatasets(r);
      return d || !d && m ? u ? this._mergeProps(u, f, m, v) : te(te(te({}, f), m), v) : te(te({}, m), v);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), a = 1; a < n; a++)
        r[a - 1] = arguments[a];
      return x(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", a = "data-pc-", o = r === "root" && ie((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && te(te({}, r === "root" && te(te(it({}, "".concat(a, "name"), Ee(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && it({}, "".concat(a, "extend"), Ee(this.$.type.name))), {}, it({}, "".concat(this.$attrSelector), ""))), {}, it({}, "".concat(a, "section"), Ee(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return we(t) || eo(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var s, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = a ? a(l) : l, u = Ee(r), f = Ee(n.$name);
        return (s = d ? u !== f ? c?.[u] : void 0 : c?.[u]) !== null && s !== void 0 ? s : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: o(t.originalValue),
        value: o(t.value)
      } : o(t, !0);
    },
    _usePT: function(t, n, r, a) {
      var o = function(g) {
        return n(g, r, a);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var i, l = t._usept || ((i = this.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, f = o(t.originalValue), m = o(t.value);
        return f === void 0 && m === void 0 ? void 0 : we(m) ? m : we(f) ? f : d || !d && m ? u ? this._mergeProps(u, f, m) : te(te({}, f), m) : m;
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
      return this._getPTValue(this.pt, t, te(te({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = x(this.$_attrsWithoutPT, this.ptm(n, r));
      return a?.hasOwnProperty("id") && ((t = a.id) !== null && t !== void 0 || (a.id = this.$id)), a;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, te({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, te(te({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var a = this._getOptionValue(this.$style.inlineStyles, t, te(te({}, this.$params), r)), o = this._getOptionValue(Sr.inlineStyles, t, te(te({}, this.$params), r));
        return [o, a];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ke(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, te({}, n.$params)) || ke(r, te({}, n.$params));
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
        var a = ot(r, 1), o = a[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return te(te({
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
        var n = ot(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = ot(n, 2), a = r[0], o = r[1], i = a.split(":"), l = Bi(i), s = bn(l).slice(1);
        return s?.reduce(function(d, c, u, f) {
          return !d[c] && (d[c] = u === f.length - 1 ? o : {}), d[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ot(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = ot(n, 2), a = r[0], o = r[1];
        return t[a] = o, t;
      }, {});
    }
  }
}, zi = `
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
`, Hi = re.extend({
  name: "baseicon",
  css: zi
});
function mt(e) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, mt(e);
}
function $r(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Cr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $r(Object(n), !0).forEach(function(r) {
      Ui(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $r(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ui(e, t, n) {
  return (t = qi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qi(e) {
  var t = Yi(e, "string");
  return mt(t) == "symbol" ? t : t + "";
}
function Yi(e, t) {
  if (mt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ne = {
  name: "BaseIcon",
  extends: nt,
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
  style: Hi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Me(this.label);
      return Cr(Cr({}, !this.isUnstyled && {
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
function ht(e) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ht(e);
}
function Tr(e, t) {
  return Zi(e) || Gi(e, t) || Wi(e, t) || Ki();
}
function Ki() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wi(e, t) {
  if (e) {
    if (typeof e == "string") return Pr(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pr(e, t) : void 0;
  }
}
function Pr(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Gi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, a, o, i, l = [], s = !0, d = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(s = (r = o.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, a = c;
    } finally {
      try {
        if (!s && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (d) throw a;
      }
    }
    return l;
  }
}
function Zi(e) {
  if (Array.isArray(e)) return e;
}
function _r(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _r(Object(n), !0).forEach(function(r) {
      vn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _r(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function vn(e, t, n) {
  return (t = Qi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qi(e) {
  var t = Xi(e, "string");
  return ht(t) == "symbol" ? t : t + "";
}
function Xi(e, t) {
  if (ht(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var J = {
  _getMeta: function() {
    return [Ae(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ke(Ae(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, a, o;
    return (r = (t == null || (a = t.instance) === null || a === void 0 ? void 0 : a.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Fn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var V = J._getOptionValue.apply(J, arguments);
      return we(V) || eo(V) ? {
        class: V
      } : V;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = d.mergeSections, u = c === void 0 ? !0 : c, f = d.mergeProps, m = f === void 0 ? !1 : f, v = l ? J._useDefaultPT(r, r.defaultPT(), s, o, i) : void 0, g = J._usePT(r, J._getPT(a, r.$name), s, o, ne(ne({}, i), {}, {
      global: v || {}
    })), w = J._getPTDatasets(r, o);
    return u || !u && g ? m ? J._mergeProps(r, m, v, g, w) : ne(ne(ne({}, v), g), w) : ne(ne({}, g), w);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return ne(ne({}, n === "root" && vn({}, "".concat(r, "name"), Ee(t.$name))), {}, vn({}, "".concat(r, "section"), Ee(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, a = function(i) {
      var l, s = r ? r(i) : i, d = Ee(n);
      return (l = s?.[d]) !== null && l !== void 0 ? l : s;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: a(t.originalValue),
      value: a(t.value)
    } : a(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, i = function(w) {
      return r(w, a, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, d = s.mergeSections, c = d === void 0 ? !0 : d, u = s.mergeProps, f = u === void 0 ? !1 : u, m = i(n.originalValue), v = i(n.value);
      return m === void 0 && v === void 0 ? void 0 : we(v) ? v : we(m) ? m : c || !c && v ? f ? J._mergeProps(t, f, m, v) : ne(ne({}, m), v) : v;
    }
    return i(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, a = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return J._usePT(t, n, r, a, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, a = arguments.length > 2 ? arguments[2] : void 0, o = J._getConfig(r, a), i = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    J._loadCoreStyles(n, i), J._loadThemeStyles(n, i), J._loadScopedThemeStyles(n, i), J._removeThemeListeners(n), n.$loadStyles = function() {
      return J._loadThemeStyles(n, i);
    }, J._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!Re.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      re.loadCSS(a), (o = r.$style) === null || o === void 0 || o.loadCSS(a), Re.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(a != null && a.isUnstyled() || (a == null || (t = a.theme) === null || t === void 0 ? void 0 : t.call(a)) === "none")) {
      if (!ae.isStyleNameLoaded("common")) {
        var i, l, s = ((i = a.$style) === null || i === void 0 || (l = i.getCommonTheme) === null || l === void 0 ? void 0 : l.call(i)) || {}, d = s.primitive, c = s.semantic, u = s.global, f = s.style;
        re.load(d?.css, ne({
          name: "primitive-variables"
        }, o)), re.load(c?.css, ne({
          name: "semantic-variables"
        }, o)), re.load(u?.css, ne({
          name: "global-variables"
        }, o)), re.loadStyle(ne({
          name: "global-style"
        }, o), f), ae.setLoadedStyleName("common");
      }
      if (!ae.isStyleNameLoaded((n = a.$style) === null || n === void 0 ? void 0 : n.name) && (r = a.$style) !== null && r !== void 0 && r.name) {
        var m, v, g, w, S = ((m = a.$style) === null || m === void 0 || (v = m.getDirectiveTheme) === null || v === void 0 ? void 0 : v.call(m)) || {}, V = S.css, A = S.style;
        (g = a.$style) === null || g === void 0 || g.load(V, ne({
          name: "".concat(a.$style.name, "-variables")
        }, o)), (w = a.$style) === null || w === void 0 || w.loadStyle(ne({
          name: "".concat(a.$style.name, "-style")
        }, o), A), ae.setLoadedStyleName(a.$style.name);
      }
      if (!ae.isStyleNameLoaded("layer-order")) {
        var h, C, L = (h = a.$style) === null || h === void 0 || (C = h.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call(h);
        re.load(L, ne({
          name: "layer-order",
          first: !0
        }, o)), ae.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var a, o, i, l = ((a = t.$style) === null || a === void 0 || (o = a.getPresetTheme) === null || o === void 0 ? void 0 : o.call(a, r, "[".concat(t.$attrSelector, "]"))) || {}, s = l.css, d = (i = t.$style) === null || i === void 0 ? void 0 : i.load(s, ne({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Re.clearLoadedStyleNames(), me.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    me.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, a, o, i) {
    var l, s, d = "on".concat(La(n)), c = J._getConfig(a, o), u = r?.$instance, f = J._usePT(u, J._getPT(a == null || (l = a.value) === null || l === void 0 ? void 0 : l.pt, t), J._getOptionValue, "hooks.".concat(d)), m = J._useDefaultPT(u, c == null || (s = c.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[t], J._getOptionValue, "hooks.".concat(d)), v = {
      el: r,
      binding: a,
      vnode: o,
      prevVnode: i
    };
    f?.(u, v), m?.(u, v);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
      r[a - 2] = arguments[a];
    return Nn(t) ? t.apply(void 0, r) : x.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, s, d, c, u) {
      var f, m, v, g;
      s._$instances = s._$instances || {};
      var w = J._getConfig(d, c), S = s._$instances[t] || {}, V = Me(S) ? ne(ne({}, n), n?.methods) : {};
      s._$instances[t] = ne(ne({}, S), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: s,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: S.$el || s || void 0,
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
        $primevueConfig: w,
        $attrSelector: (f = s.$pd) === null || f === void 0 || (f = f[t]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return J._getPT(w?.pt, void 0, function(h) {
            var C;
            return h == null || (C = h.directives) === null || C === void 0 ? void 0 : C[t];
          });
        },
        isUnstyled: function() {
          var h, C;
          return ((h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (C = s._$instances[t]) === null || C === void 0 || (C = C.$binding) === null || C === void 0 || (C = C.value) === null || C === void 0 ? void 0 : C.unstyled : w?.unstyled;
        },
        theme: function() {
          var h;
          return (h = s._$instances[t]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return J._getPTValue(s._$instances[t], (h = s._$instances[t]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, C, ne({}, L));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return J._getPTValue(s._$instances[t], h, C, L, !1);
        },
        cx: function() {
          var h, C, L = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", B = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = s._$instances[t]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : J._getOptionValue((C = s._$instances[t]) === null || C === void 0 || (C = C.$style) === null || C === void 0 ? void 0 : C.classes, L, ne({}, B));
        },
        sx: function() {
          var h, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, B = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return L ? J._getOptionValue((h = s._$instances[t]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, C, ne({}, B)) : void 0;
        }
      }, V), s.$instance = s._$instances[t], (m = (v = s.$instance)[l]) === null || m === void 0 || m.call(v, s, d, c, u), s["$".concat(t)] = s.$instance, J._hook(t, l, s, d, c, u), s.$pd || (s.$pd = {}), s.$pd[t] = ne(ne({}, (g = s.$pd) === null || g === void 0 ? void 0 : g[t]), {}, {
        name: t,
        instance: s._$instances[t]
      });
    }, a = function(l) {
      var s, d, c, u = l._$instances[t], f = u?.watch, m = function(w) {
        var S, V = w.newValue, A = w.oldValue;
        return f == null || (S = f.config) === null || S === void 0 ? void 0 : S.call(u, V, A);
      }, v = function(w) {
        var S, V = w.newValue, A = w.oldValue;
        return f == null || (S = f["config.ripple"]) === null || S === void 0 ? void 0 : S.call(u, V, A);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": v
      }, f == null || (s = f.config) === null || s === void 0 || s.call(u, u?.$primevueConfig), ze.on("config:change", m), f == null || (d = f["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (c = u.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), ze.on("config:ripple:change", v);
    }, o = function(l) {
      var s = l._$instances[t].$watchersCallback;
      s && (ze.off("config:change", s.config), ze.off("config:ripple:change", s["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, d, c) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Qa("pd")
        }, r("created", l, s, d, c);
      },
      beforeMount: function(l, s, d, c) {
        var u;
        J._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("beforeMount", l, s, d, c), a(l);
      },
      mounted: function(l, s, d, c) {
        var u;
        J._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("mounted", l, s, d, c);
      },
      beforeUpdate: function(l, s, d, c) {
        r("beforeUpdate", l, s, d, c);
      },
      updated: function(l, s, d, c) {
        var u;
        J._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("updated", l, s, d, c);
      },
      beforeUnmount: function(l, s, d, c) {
        var u;
        o(l), J._removeThemeListeners((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", l, s, d, c);
      },
      unmounted: function(l, s, d, c) {
        var u;
        (u = l.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", l, s, d, c);
      }
    };
  },
  extend: function() {
    var t = J._getMeta.apply(J, arguments), n = Tr(t, 2), r = n[0], a = n[1];
    return ne({
      extend: function() {
        var i = J._getMeta.apply(J, arguments), l = Tr(i, 2), s = l[0], d = l[1];
        return J.extend(s, ne(ne(ne({}, a), a?.methods), d));
      }
    }, J._extend(r, a));
  }
}, Ji = `
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
`, es = {
  root: "p-ink"
}, ts = re.extend({
  name: "ripple-directive",
  style: Ji,
  classes: es
}), ns = J.extend({
  style: ts
});
function bt(e) {
  "@babel/helpers - typeof";
  return bt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, bt(e);
}
function rs(e) {
  return ss(e) || is(e) || as(e) || os();
}
function os() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function as(e, t) {
  if (e) {
    if (typeof e == "string") return gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? gn(e, t) : void 0;
  }
}
function is(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ss(e) {
  if (Array.isArray(e)) return gn(e);
}
function gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Or(e, t, n) {
  return (t = ls(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ls(e) {
  var t = us(e, "string");
  return bt(t) == "symbol" ? t : t + "";
}
function us(e, t) {
  if (bt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (bt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Un = ns.extend("ripple", {
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
      n || (n = Ya("span", Or(Or({
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
      var n = this, r = t.currentTarget, a = this.getInk(r);
      if (!(!a || getComputedStyle(a, null).display === "none")) {
        if (!this.isUnstyled() && nn(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"), !lr(a) && !ur(a)) {
          var o = Math.max(zt(r), Wa(r));
          a.style.height = o + "px", a.style.width = o + "px";
        }
        var i = Ka(r), l = t.pageX - i.left + document.body.scrollTop - ur(a) / 2, s = t.pageY - i.top + document.body.scrollLeft - lr(a) / 2;
        a.style.top = s + "px", a.style.left = l + "px", !this.isUnstyled() && Na(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          a && (!n.isUnstyled() && nn(a, "p-ink-active"), a.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && nn(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? rs(t.children).find(function(n) {
        return He(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function vt(e) {
  "@babel/helpers - typeof";
  return vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vt(e);
}
function ds(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function cs(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, fs(r.key), r);
  }
}
function ps(e, t, n) {
  return t && cs(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function fs(e) {
  var t = ms(e, "string");
  return vt(t) == "symbol" ? t : t + "";
}
function ms(e, t) {
  if (vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var hs = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    ds(this, e), this.element = t, this.listener = n;
  }
  return ps(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Ga(this.element);
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
})(), bs = Rn();
const vs = "data-wippy-overlay-layer";
function go() {
  return typeof window < "u" && typeof window.document < "u";
}
function yo() {
  return go() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function gs() {
  return yo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("top", "anchor(--a bottom)");
}
const ys = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ws = 0;
const qt = /* @__PURE__ */ new WeakMap();
function Er(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("top", `anchor(${t} bottom)`, "important"), n.setProperty("left", `anchor(${t} left)`, "important"), n.setProperty("position-try-fallbacks", "flip-block");
}
function ks(e, t) {
  if (!ys.test(e.className))
    return;
  const n = e.style.cssText;
  Er(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!qt.has(e)) {
    const r = new MutationObserver(() => {
      e.style.getPropertyPriority("top") !== "important" && Er(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), qt.set(e, r);
  }
}
function qn(e) {
  const t = qt.get(e);
  t && (t.disconnect(), qt.delete(e));
}
function Ss(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function yn(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Yt = /* @__PURE__ */ new Set(), Yn = /* @__PURE__ */ new WeakMap();
let Dr = !1, wn = !1;
function xs() {
  wn = !1;
  for (const e of Yt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && qn(t);
      Yt.delete(e), Yn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && yn(e);
  }
}
function Mr() {
  wn || (wn = !0, requestAnimationFrame(xs));
}
function $s(e) {
  const t = document.createElement("div");
  t.setAttribute(vs, "");
  const n = yo();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  yn(t);
  const r = new MutationObserver((a) => {
    const o = t.__wippyAnchorName;
    for (const i of a) {
      if (o)
        for (const l of Array.from(i.addedNodes))
          l instanceof HTMLElement && ks(l, o);
      for (const l of Array.from(i.removedNodes))
        l instanceof HTMLElement && qn(l);
    }
    t.isConnected && t.childElementCount > 0 && yn(t);
  });
  return r.observe(t, { childList: !0 }), Yn.set(t, r), Yt.add(t), Dr || (Dr = !0, window.addEventListener("scroll", Mr, { capture: !0, passive: !0 }), window.addEventListener("resize", Mr, { passive: !0 })), t;
}
function Ar(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = $s(e.hostRoot), gs())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ws}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Ir(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && qn(t);
    Yt.delete(e.layer), Yn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Vr = !1;
function Cs() {
  if (Vr)
    return;
  Vr = !0;
  const e = Hn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    go() && (this.hostRoot = Ss(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Ar(this), this.$watch("inline", (t) => {
      t ? Ir(this) : Ar(this);
    })));
  }, e.render = function() {
    return this.inline ? Y(this.$slots, "default", { key: 0 }) : this.mounted ? ca(Zr, { key: 1, to: this.resolvedTarget || document.body }, [
      Y(this.$slots, "default")
    ]) : M("", !0);
  }, e.unmounted = function() {
    Ir(this);
  };
}
const Ts = {
  install: (e) => {
    Cs(), e.use(Ii, { theme: "none" });
  }
};
var kn = "data-wippy-visible";
function Lr(e) {
  const t = e.getAttribute(kn);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Ps = Object.defineProperty, _s = (e, t, n) => t in e ? Ps(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, de = (e, t, n) => _s(e, typeof t != "symbol" ? t + "" : t, n), Os = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Es = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Br(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Ds(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, a] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && a && typeof a == "object") {
          for (const [i, l] of Object.entries(a)) {
            const s = typeof l == "string" ? Br(i) : null;
            s && t.add(s);
          }
          continue;
        }
        const o = typeof a == "string" ? Br(r) : null;
        o && t.add(o);
      }
  return [...t].sort();
}
function Ms(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Es} {
${t}
}`;
}
function As(e, t) {
  const n = Ms(t);
  n && wo(e, n, "@wippy-fe/css-variables-bridge");
}
function Is(e, t) {
  const r = (t ?? Os).map(async (a) => {
    const o = ya[a];
    if (!o)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${a}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await wa(o);
    } catch (i) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${a}" (${o}):`, i), null;
    }
  });
  return Promise.all(r).then((a) => {
    for (const o of a) {
      if (!o)
        continue;
      const i = document.createElement("style");
      i.textContent = o, i.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(i);
    }
  });
}
function Vs(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function wo(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const a = new CSSStyleSheet();
    a.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, a];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Ls(e, t) {
  wo(e, t, "@wippy-fe/custom-css");
}
function ko(e) {
  return e.__wippyHost ?? null;
}
function Bs(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ns(e, t, n) {
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
function sn(e, t) {
  const n = {}, r = [];
  for (const [a, o] of Object.entries(t.properties)) {
    const i = e.getAttribute(a), l = Bs(a);
    if (i === null) {
      o.default !== void 0 && (n[l] = o.default);
      continue;
    }
    const s = Ns(a, i, o);
    s.error ? r.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: r };
}
var js = class {
  constructor(e, t) {
    de(this, "_props"), de(this, "_errors"), de(this, "_content"), de(this, "_hostVisibility"), de(this, "_propsListeners", /* @__PURE__ */ new Set()), de(this, "_contentListeners", /* @__PURE__ */ new Set()), de(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), de(this, "_disposed", !1), de(this, "_emitToDom"), de(this, "props"), de(this, "events"), de(this, "content"), de(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, a) {
        return n._subscribeProps(r, a);
      }
    }, this.events = {
      emit(r, a) {
        n._disposed || n._emitToDom(r, a);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, a) {
        return n._subscribeContent(r, a);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, a) {
        return n._subscribeHostVisibility(r, a);
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
}, Fs = class extends HTMLElement {
  constructor() {
    super(), de(this, "_internals"), de(this, "_contentObserver", null), de(this, "_initialized", !1), de(this, "_container", null), de(this, "_reactive", null), de(this, "_lastProps", null), de(this, "_lastErrors", []), de(this, "_lastContent", null), de(this, "_themeUnsub", null), de(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = Lr(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, kn])];
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
    return ko(this);
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
        const o = sn(this, e.propsSchema);
        e.validateProps && o.errors.push(...e.validateProps(o.props)), n = o.props, r = o.errors, this._lastProps = n, this._lastErrors = r;
      }
      const a = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = a), this._reactive = new js(
        { props: n, errors: r, content: a, hasContent: t, hostVisibility: this._hostVisible },
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
        this.onInit(n), e.inlineCss && Vs(n, e.inlineCss);
        try {
          const d = rr?.theming, c = Ds(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          As(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = rr?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            c && Ls(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Is(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && r.classList.add(...s), n.appendChild(r), this._container = r, va(ba);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Ge("@theme", (s) => this._applyTheme(s)));
      const { props: a, errors: o } = sn(this, e.propsSchema);
      e.validateProps && o.push(...e.validateProps(a));
      const i = a;
      this._lastProps = i, this._lastErrors = o;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, i, o, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = ga.getThemeMode?.()) {
    Lt(e, this), this._container && Lt(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Lt("auto", this), this._container && Lt("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === kn) {
      const l = this._hostVisible, s = Lr(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: a, errors: o } = sn(this, r.propsSchema);
    r.validateProps && o.push(...r.validateProps(a));
    const i = a;
    this._lastProps = i, this._lastErrors = o, this._reactive?.notifyProps(i, o), this.onPropsChanged(i, o);
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
function Rs(e) {
  return e.__wippyHostBus ?? null;
}
function zs(e) {
  return e.dataset.wippyPanelId ?? null;
}
var Hs = Object.defineProperty, Us = (e, t, n) => t in e ? Hs(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, We = (e, t, n) => Us(e, typeof t != "symbol" ? t + "" : t, n), So = /* @__PURE__ */ Symbol("wippy:emit"), xo = /* @__PURE__ */ Symbol("wippy:props"), $o = /* @__PURE__ */ Symbol("wippy:props_error"), qs = /* @__PURE__ */ Symbol("wippy:content"), Ys = /* @__PURE__ */ Symbol("wippy:panel-id"), Ks = /* @__PURE__ */ Symbol("wippy:layout-bus"), Ws = /* @__PURE__ */ Symbol("wippy:host"), Gs = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Zs() {
  const e = Dt(xo);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Qs() {
  const e = Dt(So);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function Xs() {
  const e = Dt($o);
  if (!e)
    throw new Error("usePropsErrors() must be called inside a WippyVueElement");
  return e;
}
var Js = class extends Fs {
  constructor() {
    super(...arguments), We(this, "_vueApp", null), We(this, "_propsRef", U({})), We(this, "_errorsRef", U([])), We(this, "_contentRef", U(null)), We(this, "_hostVisibilityRef", U(null)), We(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, a, o) {
    const i = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = a ?? null, this._hostVisibilityRef.value = this.hostVisible;
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
      const c = Sa(), u = pa(d.rootComponent);
      this._vueApp = u;
      const f = xa();
      if (d.piniaPlugins)
        for (const m of d.piniaPlugins)
          f.use(m);
      if (u.use(f), d.plugins)
        for (const m of d.plugins)
          u.use(m);
      u.provide(xo, this._propsRef), u.provide($o, this._errorsRef), u.provide(So, this.emitEvent.bind(this)), u.provide(qs, this._contentRef), u.provide(Gs, this._hostVisibilityRef), u.provide(Ys, zs(this)), u.provide(Ks, Rs(this)), u.provide(Ws, ko(this)), d.providers && d.providers(u, this), u.mount(t), c && $a(c);
    };
    if (i.rootComponent)
      s(i);
    else if (i.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), i.lazyConfig().then((c) => {
        l.signal.aborted || (d.remove(), s(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const u = c instanceof Error ? c.message : String(c), f = document.createElement("wippy-error");
        f.setAttribute("title", "Failed to load"), f.setAttribute("message", u), d.replaceWith(f), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
};
const el = { props: { type: "object", properties: { "form-version": { type: "number", default: 1, description: 'Form definition schema version: 1 is a choice-only form, 2 is a form with at least one standard field (`text`, `textarea`, `number`, `email`, `date`, `checkbox`). A higher value, from this prop or from the loaded state\'s own `form_version`, disables the interactive form and shows the notice "This form needs a newer version of the app." instead, and so does a field whose type this version does not know.' }, definition: { type: "object", default: null, description: 'Immutable form definition: `title`, optional `description`, optional `submit_label`, optional `answered_message` (not displayed), and `fields`. Every field is `{ id, type, label, description?, required }` plus the keys of its type: `choice` adds `options: [{value, label, description?}]`, `multiple`, `allow_other`; `text` and `textarea` add `min_length`, `max_length`, `placeholder` and `default` (`text` also `pattern`, a full-match expression that only the server evaluates and answers with a 422 `pattern_mismatch` on the field); `number` adds `min`, `max`, `step`, `integer`, `placeholder`, `default`; `email` adds `placeholder`, `default`; `date` adds `min`, `max` (`YYYY-MM-DD`) and `default`; `checkbox` adds `default` (only `false`). When every field is `type: "choice"` the question-card UI renders; otherwise the fields form renders.' }, state: { type: "string", default: "active", description: 'Package-tag lifecycle state mirrored from the artifact: "active" (still answerable) or "idle" (already answered, shown read-only). Changing this prop triggers a reload of the canonical form state from the Host.' }, density: { type: "string", default: "compact", description: 'Question-card sizing: "compact" (default) or "comfortable", a larger size/spacing scale. Read purely through the `:host([density="comfortable"])` CSS selector — no JS reads it — but must be a declared prop so the package-tag mount path can set it as an attribute.' } } } }, tl = {
  wippy: el
};
var Co = {
  name: "SpinnerIcon",
  extends: Ne
};
function nl(e) {
  return il(e) || al(e) || ol(e) || rl();
}
function rl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ol(e, t) {
  if (e) {
    if (typeof e == "string") return Sn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Sn(e, t) : void 0;
  }
}
function al(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function il(e) {
  if (Array.isArray(e)) return Sn(e);
}
function Sn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function sl(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), nl(t[0] || (t[0] = [I("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Co.render = sl;
var ll = `
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
`, ul = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": ie(n.value) && String(n.value).length === 1,
      "p-badge-dot": Me(n.value) && !r.$slots.default,
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
}, dl = re.extend({
  name: "badge",
  style: ll,
  classes: ul
}), cl = {
  name: "BaseBadge",
  extends: nt,
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
  style: dl,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function gt(e) {
  "@babel/helpers - typeof";
  return gt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gt(e);
}
function Nr(e, t, n) {
  return (t = pl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pl(e) {
  var t = fl(e, "string");
  return gt(t) == "symbol" ? t : t + "";
}
function fl(e, t) {
  if (gt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (gt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var To = {
  name: "Badge",
  extends: cl,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ve(Nr(Nr({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ml = ["data-p"];
function hl(e, t, n, r, a, o) {
  return p(), b("span", x({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [Y(e.$slots, "default", {}, function() {
    return [oe(N(e.value), 1)];
  })], 16, ml);
}
To.render = hl;
var bl = `
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
function yt(e) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yt(e);
}
function Oe(e, t, n) {
  return (t = vl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vl(e) {
  var t = gl(e, "string");
  return yt(t) == "symbol" ? t : t + "";
}
function gl(e, t) {
  if (yt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var yl = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", Oe(Oe(Oe(Oe(Oe(Oe(Oe(Oe(Oe({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", Oe({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, wl = re.extend({
  name: "button",
  style: bl,
  classes: yl
}), kl = {
  name: "BaseButton",
  extends: nt,
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
  style: wl,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function wt(e) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wt(e);
}
function ge(e, t, n) {
  return (t = Sl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Sl(e) {
  var t = xl(e, "string");
  return wt(t) == "symbol" ? t : t + "";
}
function xl(e, t) {
  if (wt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (wt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Se = {
  name: "Button",
  extends: kl,
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
      return x(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Me(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ve(ge(ge(ge(ge(ge(ge(ge(ge(ge(ge({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ve(ge(ge({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ve(ge(ge({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Co,
    Badge: To
  },
  directives: {
    ripple: Un
  }
}, $l = ["data-p"], Cl = ["data-p"];
function Tl(e, t, n, r, a, o) {
  var i = Le("SpinnerIcon"), l = Le("Badge"), s = Ln("ripple");
  return e.asChild ? Y(e.$slots, "default", {
    key: 1,
    class: $(e.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : Ue((p(), F(be(e.as), x({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: Z(function() {
      return [Y(e.$slots, "default", {}, function() {
        return [e.loading ? Y(e.$slots, "loadingicon", x({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (p(), b("span", x({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (p(), F(i, x({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Y(e.$slots, "icon", x({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (p(), b("span", x({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": o.dataIconP
          }, e.ptm("icon")), null, 16, $l)) : M("", !0)];
        }), e.label ? (p(), b("span", x({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": o.dataLabelP
        }), N(e.label), 17, Cl)) : M("", !0), e.badge ? (p(), F(l, {
          key: 3,
          value: e.badge,
          class: $(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : M("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
Se.render = Tl;
var Kn = {
  name: "TimesIcon",
  extends: Ne
};
function Pl(e) {
  return Dl(e) || El(e) || Ol(e) || _l();
}
function _l() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ol(e, t) {
  if (e) {
    if (typeof e == "string") return xn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xn(e, t) : void 0;
  }
}
function El(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Dl(e) {
  if (Array.isArray(e)) return xn(e);
}
function xn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ml(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Pl(t[0] || (t[0] = [I("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Kn.render = Ml;
var Al = `
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
`, Il = {
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
}, Vl = re.extend({
  name: "message",
  style: Al,
  classes: Il
}), Ll = {
  name: "BaseMessage",
  extends: nt,
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
  style: Vl,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function kt(e) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kt(e);
}
function jr(e, t, n) {
  return (t = Bl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bl(e) {
  var t = Nl(e, "string");
  return kt(t) == "symbol" ? t : t + "";
}
function Nl(e, t) {
  if (kt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (kt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $e = {
  name: "Message",
  extends: Ll,
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
      return ve(jr(jr({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: Un
  },
  components: {
    TimesIcon: Kn
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
function Fr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Rr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Fr(Object(n), !0).forEach(function(r) {
      jl(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Fr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function jl(e, t, n) {
  return (t = Fl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fl(e) {
  var t = Rl(e, "string");
  return St(t) == "symbol" ? t : t + "";
}
function Rl(e, t) {
  if (St(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (St(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zl = ["data-p"], Hl = ["data-p"], Ul = ["data-p"], ql = ["aria-label", "data-p"], Yl = ["data-p"];
function Kl(e, t, n, r, a, o) {
  var i = Le("TimesIcon"), l = Ln("ripple");
  return p(), F(Qr, x({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: Z(function() {
      return [a.visible ? (p(), b("div", x({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, e.ptm("root")), [I("div", x({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? Y(e.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (p(), b("div", x({
        key: 1,
        class: e.cx("content"),
        "data-p": o.dataP
      }, e.ptm("content")), [Y(e.$slots, "icon", {
        class: $(e.cx("icon"))
      }, function() {
        return [(p(), F(be(e.icon ? "span" : null), x({
          class: [e.cx("icon"), e.icon],
          "data-p": o.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (p(), b("div", x({
        key: 0,
        class: e.cx("text"),
        "data-p": o.dataP
      }, e.ptm("text")), [Y(e.$slots, "default")], 16, Ul)) : M("", !0), e.closable ? Ue((p(), b("button", x({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(s) {
          return o.close(s);
        }),
        "data-p": o.dataP
      }, Rr(Rr({}, e.closeButtonProps), e.ptm("closeButton"))), [Y(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (p(), b("i", x({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, Yl)) : (p(), F(i, x({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, ql)), [[l]]) : M("", !0)], 16, Hl))], 16)], 16, zl)) : M("", !0)];
    }),
    _: 3
  }, 16);
}
$e.render = Kl;
const Wl = () => Zs(), Gl = () => Qs(), Zl = Xs, Ql = 2e3;
function Xl() {
  const e = Bn.ws;
  return e && typeof e.send == "function" ? e : void 0;
}
function Jl(e, t) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function a() {
    n && clearTimeout(n), n = null;
  }
  ue(() => [e.value?.artifact_id, e.value?.status, e.value?.delivery], () => {
    const o = e.value;
    if (!o || o.status !== "idle" || o.delivery !== "pending" || r.has(o.artifact_id))
      return;
    a();
    const i = o.artifact_id;
    n = setTimeout(async () => {
      n = null;
      const l = await t();
      !l || l.artifact_id !== i || l.delivery !== "pending" || r.has(i) || (r.add(i), Xl()?.send({ type: "session_open", session_id: l.session_id }));
    }, Ql);
  }, { immediate: !0 }), Qt(a);
}
const eu = 5e3;
function tu(e, t) {
  const n = U("idle"), r = U(null), a = U(null), o = U(null);
  let i = 0, l = null, s = null, d = null, c = null;
  function u() {
    return Bn.artifactState;
  }
  let f = null, m = !1;
  function v() {
    m || f || (m = !0, f = setTimeout(() => {
      f = null, w();
    }, eu));
  }
  async function g() {
    const k = u();
    if (typeof k != "function") {
      n.value = "unsupported", a.value = "This form needs a newer Web Host.";
      return;
    }
    const E = e.value;
    if (!E) {
      n.value = "idle", r.value = null, o.value = null;
      return;
    }
    const j = ++i, q = r.value === null;
    q && (n.value = "loading");
    try {
      const K = await k(E).get();
      if (j !== i)
        return;
      r.value = K, n.value = "loaded", a.value = null, o.value = null, m = !1;
    } catch (K) {
      if (j !== i)
        return;
      const H = K instanceof Error ? K.message : "Could not load this form.";
      q ? (n.value = "error", a.value = H) : (o.value = H, v());
    }
  }
  function w() {
    return l ? (s || (s = l.then(() => (s = null, w()))), s) : (l = g().finally(() => {
      l = null;
    }), l);
  }
  function S(k) {
    c !== k && (d?.(), d = null, c = k, k && (d = Ge(`artifact:${k}`, () => {
      w();
    })));
  }
  ue(e, (k) => {
    i++, r.value = null, o.value = null, S(k), w();
  }, { immediate: !0 }), ue(t, () => {
    w();
  });
  const V = y(() => {
    const k = r.value;
    return k?.session_id && (k.status === "active" && !k.stale || k.status === "idle" && k.delivery && k.delivery !== "complete") ? k.session_id : null;
  });
  let A = null, h = null;
  ue(V, (k) => {
    A?.(), A = null, h?.(), h = null, k && (A = Ge(`session:${k}:message:*`, (E) => {
      E.data?.type !== "chunk" && w();
    }), h = Ge(`session:${k}`, () => {
      w();
    }));
  }, { immediate: !0 });
  const C = Ge("@visibility", (k) => {
    k && w();
  }), L = Ge("@reconnect", () => {
    w();
  });
  Qt(() => {
    i++, f && clearTimeout(f), f = null, d?.(), d = null, A?.(), A = null, h?.(), h = null, C(), L();
  });
  async function B() {
    return await w(), r.value;
  }
  return { status: n, state: r, errorMessage: a, reloadError: o, reload: () => {
    w();
  }, refresh: B };
}
function nu() {
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
const ru = Symbol.for("wippy.artifactStateError");
function Po(e) {
  return typeof e == "object" && e !== null && e[ru] === !0;
}
function ou(e) {
  return Po(e) ? { status: e.status, code: e.code, message: e.message, known: !0, noResponse: e.status === void 0 && e.code === "network_error" } : { known: !1, message: e instanceof Error ? e.message : void 0, noResponse: !1 };
}
function zr(e) {
  return !Po(e) || e.status !== 422 ? null : { errors: e.errors ?? {}, formErrors: e.formErrors ?? [] };
}
function Hr(e) {
  const t = ou(e);
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
const au = "Network problem. Your answer may not have been saved. Check your connection, then select Retry.";
function iu(e) {
  return new Promise((t) => setTimeout(t, e));
}
function su(e) {
  return JSON.stringify(e);
}
function lu(e) {
  const t = U(!1), n = U(null), r = U(null);
  let a = 0;
  ue(e, () => {
    a++, i();
  });
  function o(d) {
    const c = su(d);
    if (n.value && r.value === c)
      return n.value;
    const u = nu();
    return n.value = u, r.value = c, u;
  }
  function i() {
    n.value = null, r.value = null;
  }
  function l() {
    return Bn.artifactState;
  }
  async function s(d, c, u) {
    const f = e.value;
    if (!f)
      return { ok: !1, message: "This form cannot be submitted here." };
    const m = l();
    if (typeof m != "function")
      return { ok: !1, message: "This form needs a newer Web Host." };
    const v = a, g = o(u), w = {
      form_version: d,
      request_id: g,
      expected_content_version: c,
      answers: u
    };
    t.value = !0;
    try {
      let S;
      try {
        S = await m(f).submit(w);
      } catch (V) {
        if (v !== a)
          return { ok: !1, ignored: !0 };
        const A = zr(V);
        if (A)
          return { ok: !1, fieldErrors: A.errors, formErrors: A.formErrors };
        const h = Hr(V);
        if (!h.uncertain)
          return { ok: !1, message: h.message, code: h.code, retryable: h.retryable, shouldReload: h.shouldReload };
        if (await iu(800), v !== a)
          return { ok: !1, ignored: !0 };
        try {
          S = await m(f).submit(w);
        } catch (C) {
          if (v !== a)
            return { ok: !1, ignored: !0 };
          const L = zr(C);
          if (L)
            return { ok: !1, fieldErrors: L.errors, formErrors: L.formErrors };
          const B = Hr(C), k = B.uncertain ? au : B.message, E = B.uncertain ? !0 : B.retryable;
          return { ok: !1, message: k, code: B.code, retryable: E, shouldReload: B.shouldReload };
        }
      }
      return v !== a ? { ok: !1, ignored: !0 } : (i(), { ok: !0, accepted: S });
    } finally {
      t.value = !1;
    }
  }
  return { submitting: t, submit: s, resetIdentity: i };
}
const Wn = Symbol("wippy-form:element"), Rt = "data-wippy-artifact-id";
function uu() {
  const e = Dt(Wn), t = U(e?.getAttribute(Rt) ?? null);
  if (e) {
    let n = null;
    Zt(() => {
      t.value = e.getAttribute(Rt), n = new MutationObserver(() => {
        t.value = e.getAttribute(Rt);
      }), n.observe(e, { attributes: !0, attributeFilter: [Rt] });
    }), Qt(() => {
      n?.disconnect(), n = null;
    });
  }
  return t;
}
function du(e, t) {
  const n = Dt(Wn);
  n && fa(() => {
    n.setAttribute("card-state", e.value), n.toggleAttribute("collapsed", t.value);
  });
}
function cu(e) {
  const t = U(typeof navigator > "u" ? !0 : navigator.onLine);
  function n() {
    t.value = !0, e();
  }
  function r() {
    t.value = !1;
  }
  return Zt(() => {
    window.addEventListener("online", n), window.addEventListener("offline", r);
  }), Qt(() => {
    window.removeEventListener("online", n), window.removeEventListener("offline", r);
  }), { isOnline: t };
}
const pu = /* @__PURE__ */ new Set([1, 2]);
function Ur(e) {
  return pu.has(e);
}
const fu = /* @__PURE__ */ new Set(["choice", "text", "textarea", "number", "email", "date", "checkbox"]);
function mu(e) {
  return fu.has(e);
}
function Gn(e) {
  return e.type === "choice";
}
function hu(e) {
  return e.fields.length > 0 && e.fields.every(Gn);
}
function bu(e) {
  return hu(e.definition);
}
function Kt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Ke(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.value == "string" && typeof e.note == "string";
}
function qr(e) {
  return typeof e == "string" ? e : Ke(e) ? e.value : null;
}
function vu(e, t) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some((n) => qr(n) === t) : qr(e) === t;
}
function st(e) {
  if (e === void 0)
    return "";
  if (Array.isArray(e)) {
    const t = e.find(Kt);
    return t ? t.other : "";
  }
  return Kt(e) ? e.other : "";
}
function _o(e) {
  return e === void 0 ? !1 : Array.isArray(e) ? e.some(Kt) : Kt(e);
}
function gu(e, t) {
  if (e === void 0)
    return "";
  const r = (Array.isArray(e) ? e : [e]).find((a) => Ke(a) && a.value === t);
  return r && Ke(r) ? r.note : "";
}
const yu = 1e12, wu = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
function ku(e) {
  const t = e.trim();
  if (t === "")
    return { kind: "empty" };
  if (!wu.test(t))
    return { kind: "invalid" };
  const n = Number(t);
  return Number.isFinite(n) ? { kind: "number", value: n === 0 ? 0 : n } : { kind: "invalid" };
}
function De(e) {
  const t = String(e), n = t.indexOf("e");
  if (n === -1)
    return t;
  const r = t.startsWith("-"), a = t.slice(r ? 1 : 0, n), o = Number(t.slice(n + 1)), i = a.indexOf("."), l = a.replace(".", ""), s = (i === -1 ? a.length : i) + o;
  let d;
  return s <= 0 ? d = `0.${"0".repeat(-s)}${l}` : s >= l.length ? d = l + "0".repeat(s - l.length) : d = `${l.slice(0, s)}.${l.slice(s)}`, r ? `-${d}` : d;
}
function ln(e) {
  const t = e.indexOf(".");
  return t === -1 ? 0 : e.length - t - 1;
}
function un(e, t) {
  const n = e.startsWith("-"), r = n ? e.slice(1) : e, a = r.indexOf("."), o = a === -1 ? r : r.slice(0, a), i = a === -1 ? "" : r.slice(a + 1), l = BigInt(`${o}${i.padEnd(t, "0")}`);
  return n ? -l : l;
}
function Su(e, t, n) {
  const r = De(e), a = De(t), o = De(n), i = Math.max(ln(r), ln(a), ln(o)), l = un(o, i);
  return l === 0n ? !1 : (un(r, i) - un(a, i)) % l === 0n;
}
function fe(e) {
  return e.trim();
}
function Zn(e) {
  return Array.from(e).length;
}
function Qn(e) {
  return fe(e) === "";
}
function xu(e) {
  return e.replace(/\r\n?/g, `
`);
}
function $u(e, t) {
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
const Cu = 500, Tu = 2e3, Yr = 8e3, Pu = 254, _u = 64, Xn = "This question is required.", Ou = { answer: void 0, errors: [] };
function ye(e, t) {
  return { answer: void 0, errors: [{ code: e, message: t }] };
}
function Xt(e) {
  return e.required ? ye("required", Xn) : Ou;
}
function Eu(e) {
  return e.type === "textarea" ? Math.min(e.max_length ?? Yr, Yr) : Math.min(e.max_length ?? Cu, Tu);
}
function Oo(e, t) {
  const n = e.type === "textarea", r = typeof t == "string" ? t : "", a = n ? xu(r) : r;
  if ($u(a, n))
    return ye("invalid_text", "Remove control characters from this answer.");
  if (Qn(a))
    return Xt(e);
  const o = Zn(a), i = e.min_length ?? 0;
  if (o < i)
    return ye("too_short", `Use at least ${i} characters.`);
  const l = Eu(e);
  return o > l ? ye("too_long", `Use at most ${l} characters.`) : { answer: a, errors: [] };
}
const Du = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*$/, Mu = /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;
function Au(e) {
  if (e.length > Pu)
    return !1;
  const t = e.split("@");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (n.length === 0 || n.length > _u || !Du.test(n))
    return !1;
  const a = r.split(".");
  return a.length >= 2 && a.every((o) => Mu.test(o));
}
function Iu(e, t) {
  const n = fe(typeof t == "string" ? t : "");
  return n === "" ? Xt(e) : Au(n) ? { answer: n, errors: [] } : ye("invalid_email", "Enter a valid email address.");
}
function Vu(e, t) {
  const n = ku(typeof t == "string" ? t : "");
  if (n.kind === "empty")
    return Xt(e);
  if (n.kind === "invalid" || Math.abs(n.value) > yu)
    return ye("invalid_number", "Enter a number, using a dot for decimals (for example 12 or -3.5).");
  const { value: r } = n;
  if (e.integer && !Number.isInteger(r))
    return ye("not_integer", "Enter a whole number.");
  if (e.min !== void 0 && r < e.min)
    return ye("below_min", `Enter ${De(e.min)} or more.`);
  if (e.max !== void 0 && r > e.max)
    return ye("above_max", `Enter ${De(e.max)} or less.`);
  if (e.step !== void 0 && e.step > 0 && !Su(r, e.min ?? 0, e.step)) {
    const a = e.min !== void 0 ? ` starting at ${De(e.min)}` : "";
    return ye("not_on_step", `Enter a value in steps of ${De(e.step)}${a}.`);
  }
  return { answer: r, errors: [] };
}
const Lu = /^(\d{4})-(\d{2})-(\d{2})$/;
function Bu(e, t) {
  return t === 2 ? e % 4 === 0 && e % 100 !== 0 || e % 400 === 0 ? 29 : 28 : [4, 6, 9, 11].includes(t) ? 30 : 31;
}
function Xe(e) {
  const t = Lu.exec(e);
  if (!t)
    return !1;
  const n = Number(t[1]), r = Number(t[2]), a = Number(t[3]);
  return n >= 1 && r >= 1 && r <= 12 && a >= 1 && a <= Bu(n, r);
}
function Nu(e, t) {
  const n = typeof t == "string" ? t : "";
  return Qn(n) ? Xt(e) : Xe(n) ? e.min && Xe(e.min) && n < e.min ? ye("below_min", `Choose ${e.min} or later.`) : e.max && Xe(e.max) && n > e.max ? ye("above_max", `Choose ${e.max} or earlier.`) : { answer: n, errors: [] } : ye("invalid_date", "Enter a valid date as YYYY-MM-DD.");
}
function ju(e, t) {
  const n = t === !0;
  return e.required && !n ? ye("required", Xn) : { answer: n, errors: [] };
}
function Jt(e, t) {
  return typeof t == "string" ? t : typeof e.default == "string" ? e.default : void 0;
}
function en(e, t) {
  return typeof t == "string" && !Qn(t) ? t : null;
}
const Fu = { evaluate: Oo, initialDraft: Jt, display: en }, Ru = { evaluate: Oo, initialDraft: Jt, display: en }, zu = { evaluate: Iu, initialDraft: Jt, display: en }, Hu = { evaluate: Nu, initialDraft: Jt, display: en }, Uu = {
  evaluate: Vu,
  // The draft of a number field is the typed text, so the strict parser sees what the user wrote.
  initialDraft: (e, t) => typeof t == "number" ? De(t) : typeof e.default == "number" ? De(e.default) : void 0,
  display: (e, t) => typeof t == "number" ? De(t) : null
}, qu = {
  evaluate: ju,
  // Only `false` can be a default, so an unchecked start is always right.
  initialDraft: (e, t) => typeof t == "boolean" ? t : !1,
  display: (e, t) => typeof t == "boolean" ? t ? "Yes" : "No" : null
}, Eo = {
  text: Fu,
  textarea: Ru,
  email: zu,
  number: Uu,
  date: Hu,
  checkbox: qu
}, Yu = 2e3, Ku = 1e3, Wu = "Enter the other answer.", Gu = "Use at most 2,000 characters.";
function xt(e) {
  return !!e && typeof e == "object" && !Array.isArray(e) && typeof e.other == "string";
}
function Do(e) {
  return Zn(fe(e)) > Yu;
}
function Zu(e) {
  return Zn(fe(e)) > Ku;
}
function $n(e) {
  return fe(e);
}
function Qu(e) {
  return fe(e);
}
function Wt(e, t) {
  const n = Qu(t);
  return n ? { value: e, note: n } : e;
}
function Xu(e, t) {
  if (e.multiple) {
    const n = Array.isArray(t) ? t : [], r = e.options.map((s) => s.value), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
    for (const s of n)
      typeof s == "string" && r.includes(s) ? o.add(s) : Ke(s) && r.includes(s.value) && (o.add(s.value), a.set(s.value, s));
    const i = r.filter((s) => o.has(s)).map((s) => {
      const d = a.get(s);
      return d ? Wt(s, d.note) : s;
    }), l = n.find(xt);
    if (l) {
      const s = $n(l.other);
      s.length > 0 && i.push({ other: s });
    }
    return i.length > 0 ? i : void 0;
  }
  if (!(t === void 0 || typeof t == "number" || typeof t == "boolean" || Array.isArray(t))) {
    if (xt(t)) {
      const n = $n(t.other);
      return n.length > 0 ? { other: n } : void 0;
    }
    if (Ke(t) && e.options.some((n) => n.value === t.value))
      return Wt(t.value, t.note);
    if (typeof t == "string" && e.options.some((n) => n.value === t))
      return t;
  }
}
function Ju(e, t) {
  return e.multiple ? Array.isArray(t) ? t.find(xt) : void 0 : xt(t) ? t : void 0;
}
function ed(e, t) {
  const n = Xu(e, t), r = Ju(e, t);
  return r && $n(r.other).length === 0 ? { answer: n, errors: [{ code: "blank", message: Wu }] } : r && Do(r.other) ? { answer: n, errors: [{ code: "too_long", message: Gu }] } : n === void 0 && e.required ? { answer: n, errors: [{ code: "required", message: Xn }] } : { answer: n, errors: [] };
}
function td(e, t) {
  if (t !== void 0)
    return e.multiple ? Array.isArray(t) ? [...t] : [t] : t;
}
const nd = {
  choice: { evaluate: ed, initialDraft: td },
  ...Eo
};
function Mo(e) {
  return nd[e.type];
}
function Ao(e, t) {
  return Mo(e)?.evaluate(e, t) ?? { answer: void 0, errors: [] };
}
function rd(e, t) {
  return Ao(e, t).answer;
}
function od(e, t) {
  const n = {};
  for (const r of e.fields) {
    const a = rd(r, t[r.id]);
    a !== void 0 && (n[r.id] = a);
  }
  return n;
}
function ad(e, t) {
  const n = {};
  for (const r of e.fields) {
    const { errors: a } = Ao(r, t[r.id]);
    a.length > 0 && (n[r.id] = a);
  }
  return n;
}
function Kr(e, t) {
  return JSON.stringify(e.fields.map((n) => {
    const r = t[n.id], a = r === void 0 || r === "" || Array.isArray(r) && r.length === 0;
    return [n.id, a ? null : r];
  }));
}
function Jn(e, t) {
  if (t === void 0 || !Gn(e) || typeof t == "number" || typeof t == "boolean")
    return null;
  const n = Array.isArray(t) ? t : [t], r = [];
  for (const o of e.options) {
    const i = n.find((l) => typeof l == "string" ? l === o.value : Ke(l) && l.value === o.value);
    i && r.push({ label: o.label, note: Ke(i) ? i.note : void 0 });
  }
  const a = n.find(xt);
  return a && r.push({ label: a.other, own: !0 }), r.length > 0 ? r : null;
}
function id(e, t) {
  if (Gn(e)) {
    const r = Jn(e, t);
    return r ? { kind: "choice", items: r } : { kind: "empty" };
  }
  const n = Eo[e.type].display(e, t);
  return n === null ? { kind: "empty" } : { kind: "text", text: n };
}
function sd(e, t) {
  const n = {};
  for (const r of e.fields) {
    const a = Mo(r)?.initialDraft(r, t?.[r.id]);
    a !== void 0 && (n[r.id] = a);
  }
  return n;
}
function _(e, ...t) {
  const n = t.filter((r) => !!r);
  return {
    part: [e, ...n.map((r) => `${e}-${r}`)].join(" "),
    class: [`w-form__${e}`, ...n.map((r) => `w-form__${e}--${r}`)].join(" ")
  };
}
var Io = {
  name: "CheckIcon",
  extends: Ne
};
function ld(e) {
  return pd(e) || cd(e) || dd(e) || ud();
}
function ud() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dd(e, t) {
  if (e) {
    if (typeof e == "string") return Cn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Cn(e, t) : void 0;
  }
}
function cd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pd(e) {
  if (Array.isArray(e)) return Cn(e);
}
function Cn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function fd(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ld(t[0] || (t[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Io.render = fd;
var Vo = {
  name: "MinusIcon",
  extends: Ne
};
function md(e) {
  return gd(e) || vd(e) || bd(e) || hd();
}
function hd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bd(e, t) {
  if (e) {
    if (typeof e == "string") return Tn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tn(e, t) : void 0;
  }
}
function vd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gd(e) {
  if (Array.isArray(e)) return Tn(e);
}
function Tn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function yd(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), md(t[0] || (t[0] = [I("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vo.render = yd;
var wd = {
  name: "BaseEditableHolder",
  extends: nt,
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
      var r, a;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (a = this.formField).onChange) === null || r === void 0 || r.call(a, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(ie);
    }
  },
  computed: {
    $filled: function() {
      return ie(this.d_value);
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
}, Mt = {
  name: "BaseInput",
  extends: wd,
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
}, kd = `
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
`, Sd = {
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
}, xd = re.extend({
  name: "checkbox",
  style: kd,
  classes: Sd
}), $d = {
  name: "BaseCheckbox",
  extends: Mt,
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
  style: xd,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function $t(e) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $t(e);
}
function Cd(e, t, n) {
  return (t = Td(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Td(e) {
  var t = Pd(e, "string");
  return $t(t) == "symbol" ? t : t + "";
}
function Pd(e, t) {
  if ($t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function _d(e) {
  return Md(e) || Dd(e) || Ed(e) || Od();
}
function Od() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ed(e, t) {
  if (e) {
    if (typeof e == "string") return Pn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pn(e, t) : void 0;
  }
}
function Dd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Md(e) {
  if (Array.isArray(e)) return Pn(e);
}
function Pn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ct = {
  name: "Checkbox",
  extends: $d,
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
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, a;
        this.binary ? a = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? a = r.filter(function(o) {
          return !jn(o, n.value);
        }) : a = r ? [].concat(_d(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(a, t) : this.writeValue(a, t), this.$emit("change", t);
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
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Ea(this.value, t);
    },
    dataP: function() {
      return ve(Cd({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Io,
    MinusIcon: Vo
  }
}, Ad = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Id = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Vd = ["data-p"];
function Ld(e, t, n, r, a, o) {
  var i = Le("CheckIcon"), l = Le("MinusIcon");
  return p(), b("div", x({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": a.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [I("input", x({
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
  }, o.getPTOptions("input")), null, 16, Id), I("div", x({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [Y(e.$slots, "icon", {
    checked: o.checked,
    indeterminate: a.d_indeterminate,
    class: $(e.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (p(), F(i, x({
      key: 0,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : a.d_indeterminate ? (p(), F(l, x({
      key: 1,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : M("", !0)];
  })], 16, Vd)], 16, Ad);
}
Ct.render = Ld;
function Bd(e) {
  const n = String(e).split("`");
  if (n.length % 2 === 0) {
    const r = n.pop() ?? "";
    n[n.length - 1] += `\`${r}`;
  }
  return n.map((r, a) => ({ text: r, code: a % 2 === 1 })).filter((r) => r.text !== "");
}
function Wr(e) {
  return String(e).replaceAll("`", "");
}
function Lo(e) {
  return String(e).split(/\r\n|\r|\n/);
}
const Nd = {
  key: 0,
  class: "w-form__field-row"
}, jd = ["part"], Fd = ["part"], Rd = ["part"], zd = ["part"], Hd = ["part"], Ud = ["part"], qd = ["part"], Yd = { key: 0 }, Kd = ["part"], Wd = ["part"], Gd = ["part"], Zd = ["part"], At = /* @__PURE__ */ pe({
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
    const n = e, r = Et(), a = `${r}-control`, o = `${r}-desc`, i = `${r}-err`, l = U(null), s = y(() => !n.readonly && n.errors.length > 0), d = y(() => {
      const B = [];
      return n.field.description && B.push(o), s.value && B.push(i), B.length > 0 ? B.join(" ") : void 0;
    }), c = y(() => n.layout === "group" ? "fieldset" : "div"), u = y(() => n.layout === "group" ? "legend" : n.readonly ? "span" : "label"), f = y(() => n.layout === "inline" && !n.readonly), m = y(() => _(
      "field",
      n.layout !== "stacked" && n.layout,
      !!n.field.required && "required",
      s.value && "invalid",
      n.readonly && "readonly",
      n.disabled && "disabled"
    )), v = y(() => _("field-label")), g = y(() => _("field-marker")), w = y(() => _("field-description")), S = y(() => _("field-control")), V = y(() => _("field-error")), A = y(() => !!n.field.required && !n.readonly), h = y(() => id(n.field, n.modelValue)), C = y(() => _("field-value", h.value.kind === "empty" && "empty")), L = y(() => _("field-note"));
    return t({
      /** Focuses the first focusable control, e.g. the first invalid field after a failed submit. */
      focusFirstControl() {
        l.value?.querySelector("input, textarea")?.focus();
      }
    }), (B, k) => (p(), F(be(c.value), {
      ref_key: "rootEl",
      ref: l,
      part: m.value.part,
      class: $(m.value.class),
      "aria-describedby": e.layout === "group" ? d.value : void 0
    }, {
      default: Z(() => [
        f.value ? (p(), b("div", Nd, [
          I("div", {
            part: S.value.part,
            class: $(S.value.class)
          }, [
            Y(B.$slots, "default", {
              id: a,
              describedBy: d.value,
              invalid: s.value
            })
          ], 10, jd),
          I("label", {
            for: a,
            part: v.value.part,
            class: $(v.value.class)
          }, [
            oe(N(e.field.label), 1),
            A.value ? (p(), b("span", {
              key: 0,
              part: g.value.part,
              class: $(`${g.value.class} text-danger-600 dark:text-danger-400`)
            }, " (required)", 10, Rd)) : M("", !0)
          ], 10, Fd)
        ])) : (p(), F(be(u.value), {
          key: 1,
          for: u.value === "label" ? a : void 0,
          part: v.value.part,
          class: $(v.value.class)
        }, {
          default: Z(() => [
            oe(N(e.field.label), 1),
            A.value ? (p(), b("span", {
              key: 0,
              part: g.value.part,
              class: $(`${g.value.class} text-danger-600 dark:text-danger-400`)
            }, " (required)", 10, zd)) : M("", !0)
          ]),
          _: 1
        }, 8, ["for", "part", "class"])),
        e.field.description ? (p(), b("p", {
          key: 2,
          id: o,
          part: w.value.part,
          class: $(w.value.class)
        }, N(e.field.description), 11, Hd)) : M("", !0),
        e.readonly ? (p(), b(X, { key: 3 }, [
          h.value.kind === "empty" ? (p(), b("p", {
            key: 0,
            part: C.value.part,
            class: $(C.value.class)
          }, " Skipped ", 10, Ud)) : h.value.kind === "text" ? (p(), b("p", {
            key: 1,
            part: C.value.part,
            class: $(C.value.class)
          }, [
            (p(!0), b(X, null, ce(P(Lo)(h.value.text), (E, j) => (p(), b(X, { key: j }, [
              j > 0 ? (p(), b("br", Yd)) : M("", !0),
              oe(N(E), 1)
            ], 64))), 128))
          ], 10, qd)) : (p(), b("div", {
            key: 2,
            part: C.value.part,
            class: $(C.value.class)
          }, [
            (p(!0), b(X, null, ce(h.value.items, (E, j) => (p(), b("p", {
              key: j,
              class: "w-form__field-item"
            }, [
              oe(N(E.own ? `Other: ${E.label}` : E.label) + " ", 1),
              E.note ? (p(), b("span", {
                key: 0,
                part: L.value.part,
                class: $(L.value.class)
              }, N(E.note), 11, Wd)) : M("", !0)
            ]))), 128))
          ], 10, Kd))
        ], 64)) : f.value ? M("", !0) : (p(), b("div", {
          key: 4,
          part: S.value.part,
          class: $(S.value.class)
        }, [
          Y(B.$slots, "default", {
            id: a,
            describedBy: d.value,
            invalid: s.value
          })
        ], 10, Gd)),
        s.value ? (p(), b("ul", {
          key: 5,
          id: i,
          part: V.value.part,
          class: $(`${V.value.class} text-danger-600 dark:text-danger-400`)
        }, [
          (p(!0), b(X, null, ce(e.errors, (E, j) => (p(), b("li", { key: j }, N(E.message), 1))), 128))
        ], 10, Zd)) : M("", !0)
      ]),
      _: 3
    }, 8, ["part", "class", "aria-describedby"]));
  }
}), Qd = /* @__PURE__ */ pe({
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
    const r = e, a = n, o = y(() => r.modelValue === !0), i = y(() => _("field-input"));
    function l(d) {
      return {
        input: {
          "aria-describedby": d,
          "aria-required": r.field.required ? "true" : void 0
        }
      };
    }
    const s = U(null);
    return t({ focusFirstControl: () => s.value?.focusFirstControl() }), (d, c) => (p(), F(At, {
      ref_key: "shell",
      ref: s,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "inline"
    }, {
      default: Z(({ id: u, describedBy: f, invalid: m }) => [
        z(P(Ct), {
          "model-value": o.value,
          binary: "",
          "input-id": u,
          disabled: e.disabled,
          invalid: m,
          pt: l(f),
          part: i.value.part,
          class: $(i.value.class),
          "onUpdate:modelValue": c[0] || (c[0] = (v) => a("update:modelValue", !!v))
        }, null, 8, ["model-value", "input-id", "disabled", "invalid", "pt", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var Xd = `
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
`, Jd = {
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
}, ec = re.extend({
  name: "inputtext",
  style: Xd,
  classes: Jd
}), tc = {
  name: "BaseInputText",
  extends: Mt,
  style: ec,
  provide: function() {
    return {
      $pcInputText: this,
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
function nc(e, t, n) {
  return (t = rc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function rc(e) {
  var t = oc(e, "string");
  return Tt(t) == "symbol" ? t : t + "";
}
function oc(e, t) {
  if (Tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pt = {
  name: "InputText",
  extends: tc,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return x(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ve(nc({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, ac = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ic(e, t, n, r, a, o) {
  return p(), b("input", x({
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
  }, o.attrs), null, 16, ac);
}
Pt.render = ic;
var sc = `
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
`, lc = {
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
}, uc = re.extend({
  name: "radiobutton",
  style: sc,
  classes: lc
}), dc = {
  name: "BaseRadioButton",
  extends: Mt,
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
  style: uc,
  provide: function() {
    return {
      $pcRadioButton: this,
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
function cc(e, t, n) {
  return (t = pc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pc(e) {
  var t = fc(e, "string");
  return _t(t) == "symbol" ? t : t + "";
}
function fc(e, t) {
  if (_t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (_t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _n = {
  name: "RadioButton",
  extends: dc,
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
      return t != null && (this.binary ? !!t : jn(t, this.value));
    },
    dataP: function() {
      return ve(cc({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, mc = ["data-p-checked", "data-p-disabled", "data-p"], hc = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "aria-labelledby", "aria-label", "aria-invalid"], bc = ["data-p"], vc = ["data-p"];
function gc(e, t, n, r, a, o) {
  return p(), b("div", x({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [I("input", x({
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
  }, o.getPTOptions("input")), null, 16, hc), I("div", x({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [I("div", x({
    class: e.cx("icon")
  }, o.getPTOptions("icon"), {
    "data-p": o.dataP
  }), null, 16, vc)], 16, bc)], 16, mc);
}
_n.render = gc;
const yc = ["part", "role", "aria-required"], wc = ["part"], kc = ["for", "part"], Sc = ["part"], xc = ["part"], $c = ["part"], Cc = ["part"], Tc = ["part"], Pc = ["for", "part"], _c = ["part"], Oc = ["part"], Ec = ["part"], Dc = ["part"], at = "choice-field-other-sentinel", Mc = /* @__PURE__ */ pe({
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
    const r = e, a = n, o = Et(), i = `${o}-other`, l = `${i}-label`, s = `${o}-other-text`, d = `${s}-label`;
    function c(T) {
      return `${o}-opt-${T}`;
    }
    const u = U(null), f = U(null), m = y(() => _("field-options")), v = y(() => _("field-option")), g = y(() => _("field-option", "other")), w = y(() => _("field-option-input")), S = y(() => _("field-option-label")), V = y(() => _("field-option-description")), A = y(() => _("field-other")), h = y(() => _("field-other-input")), C = y(() => r.modelValue), L = y(() => r.errors.some((T) => T.code === "blank"));
    function B(T) {
      return !!T && typeof T == "object" && !Array.isArray(T) && typeof T.other == "string";
    }
    const k = y({
      get() {
        const T = C.value;
        return typeof T == "string" ? T : B(T) ? at : "";
      },
      set(T) {
        T === at ? a("update:modelValue", { other: E.value }) : T === "" ? a("update:modelValue", void 0) : a("update:modelValue", T);
      }
    }), E = U(st(C.value));
    ue(C, (T) => {
      r.field.multiple || (E.value = st(T));
    }), ue(E, (T) => {
      !r.field.multiple && k.value === at && a("update:modelValue", { other: T });
    });
    const j = y(() => {
      const T = C.value;
      return Array.isArray(T) ? T.filter((G) => typeof G == "string") : [];
    }), q = y(() => r.field.multiple && _o(C.value)), K = U(st(C.value));
    ue(C, (T) => {
      r.field.multiple && (K.value = st(T));
    });
    function H(T, G, O) {
      const D = [...T];
      G && D.push({ other: O }), a("update:modelValue", D.length > 0 ? D : void 0);
    }
    function ee(T, G) {
      const O = new Set(j.value);
      G ? O.add(T) : O.delete(T), H(r.field.options.filter((D) => O.has(D.value)).map((D) => D.value), q.value, K.value);
    }
    function W(T) {
      H(j.value, T, K.value);
    }
    return ue(K, (T) => {
      q.value && H(j.value, !0, T);
    }), t({
      focusFirstControl() {
        u.value?.focusFirstControl();
      },
      // For a blank Other answer the text box is what needs fixing.
      focusOtherText() {
        const T = f.value?.querySelector(`[id="${s}"]`);
        T ? T.focus() : u.value?.focusFirstControl();
      }
    }), (T, G) => (p(), F(At, {
      ref_key: "shell",
      ref: u,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "group"
    }, {
      default: Z(({ invalid: O }) => [
        I("div", {
          ref_key: "bodyEl",
          ref: f,
          part: m.value.part,
          class: $(m.value.class),
          role: e.field.multiple ? "group" : "radiogroup",
          "aria-required": e.field.required ? "true" : void 0
        }, [
          e.field.multiple ? (p(), b(X, { key: 1 }, [
            (p(!0), b(X, null, ce(e.field.options, (D, R) => (p(), b("div", {
              key: D.value,
              part: v.value.part,
              class: $(v.value.class)
            }, [
              z(P(Ct), {
                "model-value": j.value.includes(D.value),
                binary: "",
                "input-id": c(R),
                disabled: e.disabled,
                invalid: O,
                part: w.value.part,
                class: $(w.value.class),
                "onUpdate:modelValue": (Q) => ee(D.value, !!Q)
              }, null, 8, ["model-value", "input-id", "disabled", "invalid", "part", "class", "onUpdate:modelValue"]),
              I("label", {
                for: c(R),
                part: S.value.part,
                class: $(S.value.class)
              }, [
                oe(N(D.label) + " ", 1),
                D.description ? (p(), b("span", {
                  key: 0,
                  part: V.value.part,
                  class: $(V.value.class)
                }, N(D.description), 11, _c)) : M("", !0)
              ], 10, Pc)
            ], 10, Tc))), 128)),
            e.field.allow_other ? (p(), b("div", {
              key: 0,
              part: g.value.part,
              class: $(g.value.class)
            }, [
              z(P(Ct), {
                "model-value": q.value,
                binary: "",
                "input-id": i,
                disabled: e.disabled,
                invalid: O,
                part: w.value.part,
                class: $(w.value.class),
                "onUpdate:modelValue": G[3] || (G[3] = (D) => W(!!D))
              }, null, 8, ["model-value", "disabled", "invalid", "part", "class"]),
              I("div", {
                part: A.value.part,
                class: $(A.value.class)
              }, [
                I("label", {
                  id: l,
                  for: i,
                  part: S.value.part,
                  class: $(S.value.class)
                }, "Other", 10, Dc),
                I("label", {
                  id: d,
                  for: s,
                  class: "w-form__sr"
                }, "Other answer"),
                z(P(Pt), {
                  id: s,
                  modelValue: K.value,
                  "onUpdate:modelValue": G[4] || (G[4] = (D) => K.value = D),
                  disabled: e.disabled || !q.value,
                  invalid: O && L.value,
                  part: h.value.part,
                  class: $(h.value.class),
                  size: "small",
                  fluid: ""
                }, null, 8, ["modelValue", "disabled", "invalid", "part", "class"])
              ], 10, Ec)
            ], 10, Oc)) : M("", !0)
          ], 64)) : (p(), b(X, { key: 0 }, [
            (p(!0), b(X, null, ce(e.field.options, (D, R) => (p(), b("div", {
              key: D.value,
              part: v.value.part,
              class: $(v.value.class)
            }, [
              z(P(_n), {
                modelValue: k.value,
                "onUpdate:modelValue": G[0] || (G[0] = (Q) => k.value = Q),
                "input-id": c(R),
                name: P(o),
                value: D.value,
                disabled: e.disabled,
                invalid: O,
                part: w.value.part,
                class: $(w.value.class)
              }, null, 8, ["modelValue", "input-id", "name", "value", "disabled", "invalid", "part", "class"]),
              I("label", {
                for: c(R),
                part: S.value.part,
                class: $(S.value.class)
              }, [
                oe(N(D.label) + " ", 1),
                D.description ? (p(), b("span", {
                  key: 0,
                  part: V.value.part,
                  class: $(V.value.class)
                }, N(D.description), 11, Sc)) : M("", !0)
              ], 10, kc)
            ], 10, wc))), 128)),
            e.field.allow_other ? (p(), b("div", {
              key: 0,
              part: g.value.part,
              class: $(g.value.class)
            }, [
              z(P(_n), {
                modelValue: k.value,
                "onUpdate:modelValue": G[1] || (G[1] = (D) => k.value = D),
                "input-id": i,
                name: P(o),
                value: at,
                disabled: e.disabled,
                invalid: O,
                part: w.value.part,
                class: $(w.value.class)
              }, null, 8, ["modelValue", "name", "disabled", "invalid", "part", "class"]),
              I("div", {
                part: A.value.part,
                class: $(A.value.class)
              }, [
                I("label", {
                  id: l,
                  for: i,
                  part: S.value.part,
                  class: $(S.value.class)
                }, "Other", 10, Cc),
                I("label", {
                  id: d,
                  for: s,
                  class: "w-form__sr"
                }, "Other answer"),
                z(P(Pt), {
                  id: s,
                  modelValue: E.value,
                  "onUpdate:modelValue": G[2] || (G[2] = (D) => E.value = D),
                  disabled: e.disabled || k.value !== at,
                  invalid: O && L.value,
                  part: h.value.part,
                  class: $(h.value.class),
                  size: "small",
                  fluid: ""
                }, null, 8, ["modelValue", "disabled", "invalid", "part", "class"])
              ], 10, $c)
            ], 10, xc)) : M("", !0)
          ], 64))
        ], 10, yc)
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var Bo = {
  name: "CalendarIcon",
  extends: Ne
};
function Ac(e) {
  return Bc(e) || Lc(e) || Vc(e) || Ic();
}
function Ic() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vc(e, t) {
  if (e) {
    if (typeof e == "string") return On(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? On(e, t) : void 0;
  }
}
function Lc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Bc(e) {
  if (Array.isArray(e)) return On(e);
}
function On(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Nc(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ac(t[0] || (t[0] = [I("path", {
    d: "M10.7838 1.51351H9.83783V0.567568C9.83783 0.417039 9.77804 0.272676 9.6716 0.166237C9.56516 0.0597971 9.42079 0 9.27027 0C9.11974 0 8.97538 0.0597971 8.86894 0.166237C8.7625 0.272676 8.7027 0.417039 8.7027 0.567568V1.51351H5.29729V0.567568C5.29729 0.417039 5.2375 0.272676 5.13106 0.166237C5.02462 0.0597971 4.88025 0 4.72973 0C4.5792 0 4.43484 0.0597971 4.3284 0.166237C4.22196 0.272676 4.16216 0.417039 4.16216 0.567568V1.51351H3.21621C2.66428 1.51351 2.13494 1.73277 1.74467 2.12305C1.35439 2.51333 1.13513 3.04266 1.13513 3.59459V11.9189C1.13513 12.4709 1.35439 13.0002 1.74467 13.3905C2.13494 13.7807 2.66428 14 3.21621 14H10.7838C11.3357 14 11.865 13.7807 12.2553 13.3905C12.6456 13.0002 12.8649 12.4709 12.8649 11.9189V3.59459C12.8649 3.04266 12.6456 2.51333 12.2553 2.12305C11.865 1.73277 11.3357 1.51351 10.7838 1.51351ZM3.21621 2.64865H4.16216V3.59459C4.16216 3.74512 4.22196 3.88949 4.3284 3.99593C4.43484 4.10237 4.5792 4.16216 4.72973 4.16216C4.88025 4.16216 5.02462 4.10237 5.13106 3.99593C5.2375 3.88949 5.29729 3.74512 5.29729 3.59459V2.64865H8.7027V3.59459C8.7027 3.74512 8.7625 3.88949 8.86894 3.99593C8.97538 4.10237 9.11974 4.16216 9.27027 4.16216C9.42079 4.16216 9.56516 4.10237 9.6716 3.99593C9.77804 3.88949 9.83783 3.74512 9.83783 3.59459V2.64865H10.7838C11.0347 2.64865 11.2753 2.74831 11.4527 2.92571C11.6301 3.10311 11.7297 3.34371 11.7297 3.59459V5.67568H2.27027V3.59459C2.27027 3.34371 2.36993 3.10311 2.54733 2.92571C2.72473 2.74831 2.96533 2.64865 3.21621 2.64865ZM10.7838 12.8649H3.21621C2.96533 12.8649 2.72473 12.7652 2.54733 12.5878C2.36993 12.4104 2.27027 12.1698 2.27027 11.9189V6.81081H11.7297V11.9189C11.7297 12.1698 11.6301 12.4104 11.4527 12.5878C11.2753 12.7652 11.0347 12.8649 10.7838 12.8649Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bo.render = Nc;
var No = {
  name: "ChevronDownIcon",
  extends: Ne
};
function jc(e) {
  return Hc(e) || zc(e) || Rc(e) || Fc();
}
function Fc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rc(e, t) {
  if (e) {
    if (typeof e == "string") return En(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? En(e, t) : void 0;
  }
}
function zc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hc(e) {
  if (Array.isArray(e)) return En(e);
}
function En(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Uc(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), jc(t[0] || (t[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
No.render = Uc;
var jo = {
  name: "ChevronLeftIcon",
  extends: Ne
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
    if (typeof e == "string") return Dn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dn(e, t) : void 0;
  }
}
function Wc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gc(e) {
  if (Array.isArray(e)) return Dn(e);
}
function Dn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Zc(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), qc(t[0] || (t[0] = [I("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jo.render = Zc;
var Fo = {
  name: "ChevronRightIcon",
  extends: Ne
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
    if (typeof e == "string") return Mn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mn(e, t) : void 0;
  }
}
function ep(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function tp(e) {
  if (Array.isArray(e)) return Mn(e);
}
function Mn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function np(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Qc(t[0] || (t[0] = [I("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Fo.render = np;
var Ro = {
  name: "ChevronUpIcon",
  extends: Ne
};
function rp(e) {
  return sp(e) || ip(e) || ap(e) || op();
}
function op() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ap(e, t) {
  if (e) {
    if (typeof e == "string") return An(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? An(e, t) : void 0;
  }
}
function ip(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function sp(e) {
  if (Array.isArray(e)) return An(e);
}
function An(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function lp(e, t, n, r, a, o) {
  return p(), b("svg", x({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), rp(t[0] || (t[0] = [I("path", {
    d: "M12.2097 10.4113C12.1057 10.4118 12.0027 10.3915 11.9067 10.3516C11.8107 10.3118 11.7237 10.2532 11.6506 10.1792L6.93602 5.46461L2.22139 10.1476C2.07272 10.244 1.89599 10.2877 1.71953 10.2717C1.54307 10.2556 1.3771 10.1808 1.24822 10.0593C1.11933 9.93766 1.035 9.77633 1.00874 9.6011C0.982477 9.42587 1.0158 9.2469 1.10338 9.09287L6.37701 3.81923C6.52533 3.6711 6.72639 3.58789 6.93602 3.58789C7.14565 3.58789 7.3467 3.6711 7.49502 3.81923L12.7687 9.09287C12.9168 9.24119 13 9.44225 13 9.65187C13 9.8615 12.9168 10.0626 12.7687 10.2109C12.616 10.3487 12.4151 10.4207 12.2097 10.4113Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ro.render = lp;
var up = `
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
`, dp = {
  root: function(t) {
    var n = t.props;
    return {
      position: n.appendTo === "self" || n.showClear ? "relative" : void 0
    };
  }
}, cp = {
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
    var n = t.instance, r = t.props, a = t.state, o = t.date, i = "";
    if (n.isRangeSelection() && n.isSelected(o) && o.selectable) {
      var l = typeof a.rawValue[0] == "string" ? n.parseValue(a.rawValue[0])[0] : a.rawValue[0], s = typeof a.rawValue[1] == "string" ? n.parseValue(a.rawValue[1])[0] : a.rawValue[1];
      i = n.isDateEquals(l, o) || n.isDateEquals(s, o) ? "p-datepicker-day-selected" : "p-datepicker-day-selected-range";
    }
    return ["p-datepicker-day", {
      "p-datepicker-day-selected": !n.isRangeSelection() && n.isSelected(o) && o.selectable,
      "p-disabled": r.disabled || !o.selectable
    }, i];
  },
  monthView: "p-datepicker-month-view",
  month: function(t) {
    var n = t.instance, r = t.props, a = t.month, o = t.index;
    return ["p-datepicker-month", {
      "p-datepicker-month-selected": n.isMonthSelected(o),
      "p-disabled": r.disabled || !a.selectable
    }];
  },
  yearView: "p-datepicker-year-view",
  year: function(t) {
    var n = t.instance, r = t.props, a = t.year;
    return ["p-datepicker-year", {
      "p-datepicker-year-selected": n.isYearSelected(a.value),
      "p-disabled": r.disabled || !a.selectable
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
}, pp = re.extend({
  name: "datepicker",
  style: up,
  classes: cp,
  inlineStyles: dp
}), fp = {
  name: "BaseDatePicker",
  extends: Mt,
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
  style: pp,
  provide: function() {
    return {
      $pcDatePicker: this,
      $parentInstance: this
    };
  }
};
function Gr(e, t, n) {
  return (t = mp(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function mp(e) {
  var t = hp(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function hp(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function dn(e) {
  return gp(e) || vp(e) || zo(e) || bp();
}
function bp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vp(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gp(e) {
  if (Array.isArray(e)) return In(e);
}
function cn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = zo(e)) || t) {
      n && (e = n);
      var r = 0, a = function() {
      };
      return { s: a, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(d) {
        throw d;
      }, f: a };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, i = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return i = d.done, d;
  }, e: function(d) {
    l = !0, o = d;
  }, f: function() {
    try {
      i || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function zo(e, t) {
  if (e) {
    if (typeof e == "string") return In(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? In(e, t) : void 0;
  }
}
function In(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ho = {
  name: "DatePicker",
  extends: fp,
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
        this.rawValue = typeof t == "string" ? this.safeParse(t) : t, this.updateCurrentMetaData(), !this.typeUpdate && !this.inline && this.input && (this.input.value = this.formatValue(this.rawValue)), this.typeUpdate = !1, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Me(t) ? "none" : "block");
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
    this.timePickerTimer && clearTimeout(this.timePickerTimer), this.destroyResponsiveStyleElement(), this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindMatchMediaListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && this.autoZIndex && rn.clear(this.overlay), this.overlay = null;
  },
  methods: {
    isSelected: function(t) {
      if (this.rawValue) {
        if (this.isSingleSelection())
          return this.isDateEquals(this.parseValueForComparison(this.rawValue), t);
        if (this.isMultipleSelection()) {
          var n = !1, r = cn(this.rawValue), a;
          try {
            for (r.s(); !(a = r.n()).done; ) {
              var o = a.value;
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
          var i = this.parseValueForComparison(this.rawValue[0]);
          if (this.rawValue[1]) {
            var l = this.parseValueForComparison(this.rawValue[1]);
            return this.isDateEquals(i, t) || this.isDateEquals(l, t) || this.isDateBetween(i, l, t);
          } else
            return this.isDateEquals(i, t);
        }
      }
      return !1;
    },
    isMonthSelected: function(t) {
      var n = this;
      if (this.isMultipleSelection()) {
        var r;
        return (r = this.rawValue) === null || r === void 0 ? void 0 : r.some(function(m) {
          var v = n.parseValueForComparison(m);
          return v.getMonth() === t && v.getFullYear() === n.currentYear;
        });
      } else if (this.isRangeSelection()) {
        var a, o, i = (a = this.rawValue) !== null && a !== void 0 && a[0] ? this.parseValueForComparison(this.rawValue[0]) : null, l = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null;
        if (l) {
          var s = new Date(this.currentYear, t, 1), d = new Date(i.getFullYear(), i.getMonth(), 1), c = new Date(l.getFullYear(), l.getMonth(), 1);
          return s >= d && s <= c;
        } else
          return i?.getFullYear() === this.currentYear && i?.getMonth() === t;
      } else {
        var u, f;
        return ((u = this.rawValue) === null || u === void 0 ? void 0 : u.getMonth()) === t && ((f = this.rawValue) === null || f === void 0 ? void 0 : f.getFullYear()) === this.currentYear;
      }
    },
    isYearSelected: function(t) {
      var n = this;
      if (this.isMultipleSelection()) {
        var r;
        return (r = this.rawValue) === null || r === void 0 ? void 0 : r.some(function(u) {
          var f = n.parseValueForComparison(u);
          return f.getFullYear() === t;
        });
      } else if (this.isRangeSelection()) {
        var a, o, i = (a = this.rawValue) !== null && a !== void 0 && a[0] ? this.parseValueForComparison(this.rawValue[0]) : null, l = (o = this.rawValue) !== null && o !== void 0 && o[1] ? this.parseValueForComparison(this.rawValue[1]) : null, s = i ? i.getFullYear() : null, d = l ? l.getFullYear() : null;
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
      var a = !1, o = this.parseValueForComparison(t), i = this.parseValueForComparison(n);
      if (o && i) {
        var l = new Date(r.year, r.month, r.day);
        return o.getTime() <= l.getTime() && i.getTime() >= l.getTime();
      }
      return a;
    },
    getFirstDayOfMonthIndex: function(t, n) {
      var r = /* @__PURE__ */ new Date();
      r.setDate(1), r.setMonth(t), r.setFullYear(n);
      var a = r.getDay() + this.sundayIndex;
      return a >= 7 ? a - 7 : a;
    },
    getDaysCountInMonth: function(t, n) {
      return 32 - this.daylightSavingAdjust(new Date(n, t, 32)).getDate();
    },
    getDaysCountInPrevMonth: function(t, n) {
      var r = this.getPreviousMonthAndYear(t, n);
      return this.getDaysCountInMonth(r.month, r.year);
    },
    getPreviousMonthAndYear: function(t, n) {
      var r, a;
      return t === 0 ? (r = 11, a = n - 1) : (r = t - 1, a = n), {
        month: r,
        year: a
      };
    },
    getNextMonthAndYear: function(t, n) {
      var r, a;
      return t === 11 ? (r = 0, a = n + 1) : (r = t + 1, a = n), {
        month: r,
        year: a
      };
    },
    daylightSavingAdjust: function(t) {
      return t ? (t.setHours(t.getHours() > 12 ? t.getHours() + 2 : 0), t) : null;
    },
    isToday: function(t, n, r, a) {
      return t.getDate() === n && t.getMonth() === r && t.getFullYear() === a;
    },
    isSelectable: function(t, n, r, a) {
      var o = !0, i = !0, l = !0, s = !0;
      return a && !this.selectOtherMonths ? !1 : (this.minDate && (this.minDate.getFullYear() > r || this.minDate.getFullYear() === r && (this.minDate.getMonth() > n || this.minDate.getMonth() === n && this.minDate.getDate() > t)) && (o = !1), this.maxDate && (this.maxDate.getFullYear() < r || this.maxDate.getFullYear() === r && (this.maxDate.getMonth() < n || this.maxDate.getMonth() === n && this.maxDate.getDate() < t)) && (i = !1), this.disabledDates && (l = !this.isDateDisabled(t, n, r)), this.disabledDays && (s = !this.isDayDisabled(t, n, r)), o && i && l && s);
    },
    onOverlayEnter: function(t) {
      var n = this.inline ? void 0 : {
        position: "absolute",
        top: "0"
      };
      Ha(t, n), this.autoZIndex && rn.set("overlay", t, this.baseZIndex || this.$primevue.config.zIndex.overlay), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), this.alignOverlay(), this.$emit("show");
    },
    onOverlayEnterComplete: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener();
    },
    onOverlayAfterLeave: function(t) {
      this.autoZIndex && rn.clear(t);
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
      this.scrollHandler || (this.scrollHandler = new hs(this.$refs.container, function() {
        t.overlayVisible && (t.overlayVisible = !1);
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !Za() && (t.overlayVisible = !1);
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
      this.overlay && (this.appendTo === "self" || this.inline ? Ua(this.overlay, this.$el) : (this.view === "date" ? (this.overlay.style.width = zt(this.overlay) + "px", this.overlay.style.minWidth = zt(this.$el) + "px") : this.overlay.style.width = zt(this.$el) + "px", za(this.overlay, this.$el)));
    },
    onButtonClick: function() {
      this.isEnabled() && (this.overlayVisible ? this.overlayVisible = !1 : (this.input.focus(), this.overlayVisible = !0));
    },
    isDateDisabled: function(t, n, r) {
      if (this.disabledDates) {
        var a = cn(this.disabledDates), o;
        try {
          for (a.s(); !(o = a.n()).done; ) {
            var i = o.value;
            if (i.getFullYear() === r && i.getMonth() === n && i.getDate() === t)
              return !0;
          }
        } catch (l) {
          a.e(l);
        } finally {
          a.f();
        }
      }
      return !1;
    },
    isDayDisabled: function(t, n, r) {
      if (this.disabledDays) {
        var a = new Date(r, n, t), o = a.getDay();
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
        if (Fe(this.overlay, 'table td span:not([data-p-disabled="true"])').forEach(function(o) {
          return o.tabIndex = -1;
        }), t && t.currentTarget.focus(), this.isMultipleSelection() && this.isSelected(n)) {
          var a = this.rawValue.filter(function(o) {
            return !r.isDateEquals(r.parseValueForComparison(o), n);
          });
          this.updateModel(a);
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
      var a = null;
      if (this.isSingleSelection())
        a = r;
      else if (this.isMultipleSelection())
        a = this.rawValue ? [].concat(dn(this.rawValue), [r]) : [r];
      else if (this.isRangeSelection())
        if (this.rawValue && this.rawValue.length) {
          var o = this.parseValueForComparison(this.rawValue[0]), i = this.rawValue[1];
          !i && r.getTime() >= o.getTime() ? (i = r, this.focusedDateIndex = 1) : (o = r, i = null, this.focusedDateIndex = 0), a = [o, i];
        } else
          a = [r, null], this.focusedDateIndex = 0;
      a !== null && this.updateModel(a), this.isRangeSelection() && this.hideOnRangeSelection && a[1] !== null && setTimeout(function() {
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
          Array.isArray(t) && (r = t.map(function(i) {
            return n.parseValueForComparison(i);
          })), this.writeValue(r);
        }
      else if (this.updateModelType == "string") {
        if (this.isSingleSelection())
          this.writeValue(this.formatDateTime(t));
        else if (this.isMultipleSelection()) {
          var a = null;
          Array.isArray(t) && (a = t.map(function(i) {
            return n.formatDateTime(i);
          })), this.writeValue(a);
        } else if (this.isRangeSelection()) {
          var o = null;
          Array.isArray(t) && (o = t.map(function(i) {
            return i == null ? null : typeof i == "string" ? i : n.formatDateTime(i);
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
              var a = typeof t[r] == "string" ? this.formatDateTime(this.parseValueForComparison(t[r])) : this.formatDateTime(t[r]);
              n += a, r !== t.length - 1 && (n += ", ");
            }
          else if (this.isRangeSelection() && t && t.length) {
            var o = this.parseValueForComparison(t[0]), i = this.parseValueForComparison(t[1]);
            n = this.formatDateTime(o), i && (n += " - " + this.formatDateTime(i));
          }
        } catch {
          n = t;
        }
      return n;
    },
    formatDateTime: function(t) {
      var n = null;
      return Ma(t) && ie(t) ? this.timeOnly ? n = this.formatTime(t) : (n = this.formatDate(t, this.datePattern), this.showTime && (n += " " + this.formatTime(t))) : this.updateModelType === "string" && (n = t), n;
    },
    formatDate: function(t, n) {
      if (!t)
        return "";
      var r, a = function(c) {
        var u = r + 1 < n.length && n.charAt(r + 1) === c;
        return u && r++, u;
      }, o = function(c, u, f) {
        var m = "" + u;
        if (a(c))
          for (; m.length < f; )
            m = "0" + m;
        return m;
      }, i = function(c, u, f, m) {
        return a(c) ? m[u] : f[u];
      }, l = "", s = !1;
      if (t)
        for (r = 0; r < n.length; r++)
          if (s)
            n.charAt(r) === "'" && !a("'") ? s = !1 : l += n.charAt(r);
          else
            switch (n.charAt(r)) {
              case "d":
                l += o("d", t.getDate(), 2);
                break;
              case "D":
                l += i("D", t.getDay(), this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
                break;
              case "o":
                l += o("o", Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 864e5), 3);
                break;
              case "m":
                l += o("m", t.getMonth() + 1, 2);
                break;
              case "M":
                l += i("M", t.getMonth(), this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
                break;
              case "y":
                l += a("y") ? t.getFullYear() : (t.getFullYear() % 100 < 10 ? "0" : "") + t.getFullYear() % 100;
                break;
              case "@":
                l += t.getTime();
                break;
              case "!":
                l += t.getTime() * 1e4 + this.ticksTo1970;
                break;
              case "'":
                a("'") ? l += "'" : s = !0;
                break;
              default:
                l += n.charAt(r);
            }
      return l;
    },
    formatTime: function(t) {
      if (!t)
        return "";
      var n = "", r = t.getHours(), a = t.getMinutes(), o = t.getSeconds();
      return this.hourFormat === "12" && r > 11 && r !== 12 && (r -= 12), this.hourFormat === "12" ? n += r === 0 ? 12 : r < 10 ? "0" + r : r : n += r < 10 ? "0" + r : r, n += ":", n += a < 10 ? "0" + a : a, this.showSeconds && (n += ":", n += o < 10 ? "0" + o : o), this.hourFormat === "12" && (n += t.getHours() > 11 ? " ".concat(this.$primevue.config.locale.pm) : " ".concat(this.$primevue.config.locale.am)), n;
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
    repeat: function(t, n, r, a) {
      var o = this, i = n || 500;
      switch (this.clearTimePickerTimer(), this.timePickerTimer = setTimeout(function() {
        o.repeat(t, 100, r, a);
      }, i), r) {
        case 0:
          a === 1 ? this.incrementHour(t) : this.decrementHour(t);
          break;
        case 1:
          a === 1 ? this.incrementMinute(t) : this.decrementMinute(t);
          break;
        case 2:
          a === 1 ? this.incrementSecond(t) : this.decrementSecond(t);
          break;
      }
    },
    convertTo24Hour: function(t, n) {
      return this.hourFormat == "12" ? t === 12 ? n ? 12 : 0 : n ? t + 12 : t : t;
    },
    validateTime: function(t, n, r, a) {
      var o = this.viewDate, i = this.convertTo24Hour(t, a);
      this.isRangeSelection() && (o = this.rawValue ? this.rawValue[1] || this.rawValue[0] : o), this.isMultipleSelection() && (o = this.rawValue ? this.rawValue[this.rawValue.length - 1] : o);
      var l = o ? o.toDateString() : null;
      return !(this.minDate && l && this.minDate.toDateString() === l && (this.minDate.getHours() > i || this.minDate.getHours() === i && (this.minDate.getMinutes() > n || this.minDate.getMinutes() === n && this.minDate.getSeconds() > r)) || this.maxDate && l && this.maxDate.toDateString() === l && (this.maxDate.getHours() < i || this.maxDate.getHours() === i && (this.maxDate.getMinutes() < n || this.maxDate.getMinutes() === n && this.maxDate.getSeconds() < r)));
    },
    incrementHour: function(t) {
      var n = this.currentHour, r = this.currentHour + Number(this.stepHour), a = this.pm;
      this.hourFormat == "24" ? r = r >= 24 ? r - 24 : r : this.hourFormat == "12" && (n < 12 && r > 11 && (a = !this.pm), r = r >= 13 ? r - 12 : r), this.validateTime(r, this.currentMinute, this.currentSecond, a) && (this.currentHour = r, this.pm = a), t.preventDefault();
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
      this.isRangeSelection() && (n = this.rawValue ? this.rawValue[this.focusedDateIndex] || this.rawValue[0] : n), this.isMultipleSelection() && (n = this.rawValue ? this.rawValue[this.rawValue.length - 1] : n), n = n ? new Date(n.getTime()) : /* @__PURE__ */ new Date(), this.hourFormat == "12" ? this.currentHour === 12 ? n.setHours(this.pm ? 12 : 0) : n.setHours(this.pm ? this.currentHour + 12 : this.currentHour) : n.setHours(this.currentHour), n.setMinutes(this.currentMinute), n.setSeconds(this.currentSecond), this.isRangeSelection() && (this.rawValue && this.focusedDateIndex === 1 && this.rawValue[1] ? n = [this.rawValue[0], n] : this.rawValue && this.focusedDateIndex === 0 ? n = [n, this.rawValue[1]] : n = [n, null]), this.isMultipleSelection() && (n = this.rawValue ? [].concat(dn(this.rawValue.slice(0, -1)), [n]) : [n]), this.updateModel(n), this.$emit("date-select", n), setTimeout(function() {
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
      return this.isSingleSelection() ? this.isSelectable(t.getDate(), t.getMonth(), t.getFullYear(), !1) || (r = !1) : t.every(function(a) {
        return n.isSelectable(a.getDate(), a.getMonth(), a.getFullYear(), !1);
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
        var a = cn(r), o;
        try {
          for (a.s(); !(o = a.n()).done; ) {
            var i = o.value;
            n.push(this.parseDateTime(i.trim()));
          }
        } catch (d) {
          a.e(d);
        } finally {
          a.f();
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
      var n, r = this.$primevue.config.locale.am, a = this.$primevue.config.locale.pm, o = "".concat(r, "|").concat(a, "|am|pm"), i = t.match(new RegExp("(?:(.+?) )?(\\d{2}:\\d{2}(?::\\d{2})?)(?:\\s+(".concat(o, "))?"), "i"));
      if (this.timeOnly)
        n = /* @__PURE__ */ new Date(), this.populateTime(n, i[2], i[3]);
      else {
        var l = this.datePattern;
        this.showTime ? (n = this.parseDate(i[1], l), this.populateTime(n, i[2], i[3])) : n = this.parseDate(t, l);
      }
      return n;
    },
    populateTime: function(t, n, r) {
      if (this.hourFormat == "12" && !r)
        throw "Invalid Time";
      this.pm = r.toLowerCase() === this.$primevue.config.locale.pm.toLowerCase() || r.toLowerCase() === "pm";
      var a = this.parseTime(n);
      t.setHours(a.hour), t.setMinutes(a.minute), t.setSeconds(a.second);
    },
    parseTime: function(t) {
      var n = t.split(":"), r = this.showSeconds ? 3 : 2, a = /^[0-9][0-9]$/;
      if (n.length !== r || !n[0].match(a) || !n[1].match(a) || this.showSeconds && !n[2].match(a))
        throw "Invalid time";
      var o = parseInt(n[0]), i = parseInt(n[1]), l = this.showSeconds ? parseInt(n[2]) : null;
      if (isNaN(o) || isNaN(i) || o > 23 || i > 59 || this.hourFormat == "12" && o > 12 || this.showSeconds && (isNaN(l) || l > 59))
        throw "Invalid time";
      return this.hourFormat == "12" && o !== 12 && this.pm ? o += 12 : this.hourFormat == "12" && o == 12 && !this.pm && (o = 0), {
        hour: o,
        minute: i,
        second: l
      };
    },
    parseDate: function(t, n) {
      if (n == null || t == null)
        throw "Invalid arguments";
      if (t = et(t) === "object" ? t.toString() : t + "", t === "")
        return null;
      var r, a, o, i = 0, l = typeof this.shortYearCutoff != "string" ? this.shortYearCutoff : (/* @__PURE__ */ new Date()).getFullYear() % 100 + parseInt(this.shortYearCutoff, 10), s = -1, d = -1, c = -1, u = -1, f = !1, m, v = function(A) {
        var h = r + 1 < n.length && n.charAt(r + 1) === A;
        return h && r++, h;
      }, g = function(A) {
        var h = v(A), C = A === "@" ? 14 : A === "!" ? 20 : A === "y" && h ? 4 : A === "o" ? 3 : 2, L = A === "y" ? C : 1, B = new RegExp("^\\d{" + L + "," + C + "}"), k = t.substring(i).match(B);
        if (!k)
          throw "Missing number at position " + i;
        return i += k[0].length, parseInt(k[0], 10);
      }, w = function(A, h, C) {
        for (var L = -1, B = v(A) ? C : h, k = [], E = 0; E < B.length; E++)
          k.push([E, B[E]]);
        k.sort(function(K, H) {
          return -(K[1].length - H[1].length);
        });
        for (var j = 0; j < k.length; j++) {
          var q = k[j][1];
          if (t.substr(i, q.length).toLowerCase() === q.toLowerCase()) {
            L = k[j][0], i += q.length;
            break;
          }
        }
        if (L !== -1)
          return L + 1;
        throw "Unknown name at position " + i;
      }, S = function() {
        if (t.charAt(i) !== n.charAt(r))
          throw "Unexpected literal at position " + i;
        i++;
      };
      for (this.currentView === "month" && (c = 1), this.currentView === "year" && (c = 1, d = 1), r = 0; r < n.length; r++)
        if (f)
          n.charAt(r) === "'" && !v("'") ? f = !1 : S();
        else
          switch (n.charAt(r)) {
            case "d":
              c = g("d");
              break;
            case "D":
              w("D", this.$primevue.config.locale.dayNamesShort, this.$primevue.config.locale.dayNames);
              break;
            case "o":
              u = g("o");
              break;
            case "m":
              d = g("m");
              break;
            case "M":
              d = w("M", this.$primevue.config.locale.monthNamesShort, this.$primevue.config.locale.monthNames);
              break;
            case "y":
              s = g("y");
              break;
            case "@":
              m = new Date(g("@")), s = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "!":
              m = new Date((g("!") - this.ticksTo1970) / 1e4), s = m.getFullYear(), d = m.getMonth() + 1, c = m.getDate();
              break;
            case "'":
              v("'") ? S() : f = !0;
              break;
            default:
              S();
          }
      if (i < t.length && (o = t.substr(i), !/^\s+/.test(o)))
        throw "Extra/unparsed characters found in date: " + o;
      if (s === -1 ? s = (/* @__PURE__ */ new Date()).getFullYear() : s < 100 && (s += (/* @__PURE__ */ new Date()).getFullYear() - (/* @__PURE__ */ new Date()).getFullYear() % 100 + (s <= l ? 0 : -100)), u > -1) {
        d = 1, c = u;
        do {
          if (a = this.getDaysCountInMonth(d - 1, s), c <= a)
            break;
          d++, c -= a;
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
      var a = t.currentTarget, o = a.parentElement, i = rt(o);
      switch (t.code) {
        case "ArrowDown": {
          a.tabIndex = "-1";
          var l = o.parentElement.nextElementSibling;
          if (l) {
            var s = rt(o.parentElement), d = Array.from(o.parentElement.parentElement.children), c = d.slice(s + 1), u = c.find(function(G) {
              var O = G.children[i].children[0];
              return !He(O, "data-p-disabled");
            });
            if (u) {
              var f = u.children[i].children[0];
              f.tabIndex = "0", f.focus();
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
          if (a.tabIndex = "-1", t.altKey)
            this.overlayVisible = !1, this.focused = !0;
          else {
            var m = o.parentElement.previousElementSibling;
            if (m) {
              var v = rt(o.parentElement), g = Array.from(o.parentElement.parentElement.children), w = g.slice(0, v).reverse(), S = w.find(function(G) {
                var O = G.children[i].children[0];
                return !He(O, "data-p-disabled");
              });
              if (S) {
                var V = S.children[i].children[0];
                V.tabIndex = "0", V.focus();
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
          a.tabIndex = "-1";
          var A = o.previousElementSibling;
          if (A) {
            var h = Array.from(o.parentElement.children), C = h.slice(0, i).reverse(), L = C.find(function(G) {
              var O = G.children[0];
              return !He(O, "data-p-disabled");
            });
            if (L) {
              var B = L.children[0];
              B.tabIndex = "0", B.focus();
            } else
              this.navigateToMonth(t, !0, r);
          } else
            this.navigateToMonth(t, !0, r);
          t.preventDefault();
          break;
        }
        case "ArrowRight": {
          a.tabIndex = "-1";
          var k = o.nextElementSibling;
          if (k) {
            var E = Array.from(o.parentElement.children), j = E.slice(i + 1), q = j.find(function(G) {
              var O = G.children[0];
              return !He(O, "data-p-disabled");
            });
            if (q) {
              var K = q.children[0];
              K.tabIndex = "0", K.focus();
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
          a.tabIndex = "-1";
          var H = o.parentElement, ee = H.children[0].children[0];
          He(ee, "data-p-disabled") ? this.navigateToMonth(t, !0, r) : (ee.tabIndex = "0", ee.focus()), t.preventDefault();
          break;
        }
        case "End": {
          a.tabIndex = "-1";
          var W = o.parentElement, T = W.children[W.children.length - 1].children[0];
          He(T, "data-p-disabled") ? this.navigateToMonth(t, !1, r) : (T.tabIndex = "0", T.focus()), t.preventDefault();
          break;
        }
        case "PageUp": {
          a.tabIndex = "-1", t.shiftKey ? (this.navigationState = {
            backward: !0
          }, this.navBackward(t)) : this.navigateToMonth(t, !0, r), t.preventDefault();
          break;
        }
        case "PageDown": {
          a.tabIndex = "-1", t.shiftKey ? (this.navigationState = {
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
          var a = this.overlay.children[r - 1], o = Fe(a, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])'), i = o[o.length - 1];
          i.tabIndex = "0", i.focus();
        }
      else if (this.numberOfMonths === 1 || r === this.numberOfMonths - 1)
        this.navigationState = {
          backward: !1
        }, this.navForward(t);
      else {
        var l = this.overlay.children[r + 1], s = Pe(l, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        s.tabIndex = "0", s.focus();
      }
    },
    onMonthCellKeydown: function(t, n) {
      var r = t.currentTarget;
      switch (t.code) {
        case "ArrowUp":
        case "ArrowDown": {
          r.tabIndex = "-1";
          var a = r.parentElement.children, o = rt(r), i = a[t.code === "ArrowDown" ? o + 3 : o - 3];
          i && (i.tabIndex = "0", i.focus()), t.preventDefault();
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
          var a = r.parentElement.children, o = rt(r), i = a[t.code === "ArrowDown" ? o + 2 : o - 2];
          i && (i.tabIndex = "0", i.focus()), t.preventDefault();
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
            this.currentView === "month" ? n = Fe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]:not([data-p-disabled="true"])') : this.currentView === "year" ? n = Fe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]:not([data-p-disabled="true"])') : n = Fe(this.overlay, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])'), n && n.length > 0 && (t = n[n.length - 1]);
          } else
            this.currentView === "month" ? t = Pe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]:not([data-p-disabled="true"])') : this.currentView === "year" ? t = Pe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]:not([data-p-disabled="true"])') : t = Pe(this.overlay, 'table td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
          t && (t.tabIndex = "0", t.focus());
        }
        this.navigationState = null;
      } else
        this.initFocusableCell();
    },
    initFocusableCell: function() {
      var t;
      if (this.currentView === "month") {
        var n = Fe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"]'), r = Pe(this.overlay, '[data-pc-section="monthview"] [data-pc-section="month"][data-p-selected="true"]');
        n.forEach(function(l) {
          return l.tabIndex = -1;
        }), t = r || n[0];
      } else if (this.currentView === "year") {
        var a = Fe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"]'), o = Pe(this.overlay, '[data-pc-section="yearview"] [data-pc-section="year"][data-p-selected="true"]');
        a.forEach(function(l) {
          return l.tabIndex = -1;
        }), t = o || a[0];
      } else if (t = Pe(this.overlay, 'span[data-p-selected="true"]'), !t) {
        var i = Pe(this.overlay, 'td[data-p-today="true"] span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
        i ? t = i : t = Pe(this.overlay, '.p-datepicker-calendar td span:not([data-p-disabled="true"]):not([data-p-ink="true"])');
      }
      t && (t.tabIndex = "0", !this.preventFocus && this.overlay && !this.overlay.contains(document.activeElement) && t.focus(), this.preventFocus = !1);
    },
    trapFocus: function(t) {
      t.preventDefault();
      var n = sr(this.overlay);
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
              var a = n.findIndex(function(o) {
                return o.tagName === "SPAN";
              });
              a === -1 && (a = n.findIndex(function(o) {
                return o.tagName === "BUTTON";
              })), a !== -1 ? n[a].focus() : n[0].focus();
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
        this.selectionStart = this.input.selectionStart, this.selectionEnd = this.input.selectionEnd, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Me(t.target.value) ? "none" : "block");
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
      var n, r, a;
      this.$emit("blur", {
        originalEvent: t,
        value: t.target.value
      }), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r), this.focused = !1, t.target.value = this.formatValue(this.rawValue), (a = this.$refs.clearIcon) !== null && a !== void 0 && (a = a.$el) !== null && a !== void 0 && a.style && (this.$refs.clearIcon.$el.style.display = Me(t.target.value) ? "none" : "block");
    },
    onKeyDown: function(t) {
      if (t.code === "ArrowDown" && this.overlay)
        this.trapFocus(t);
      else if (t.code === "ArrowDown" && !this.overlay)
        this.overlayVisible = !0;
      else if (t.code === "Escape")
        this.overlayVisible && (this.overlayVisible = !1, t.preventDefault(), t.stopPropagation());
      else if (t.code === "Tab")
        this.overlay && sr(this.overlay).forEach(function(a) {
          return a.tabIndex = "-1";
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
      t.stopPropagation(), this.inline || bs.emit("overlay-click", {
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
          this.responsiveStyleElement = document.createElement("style"), this.responsiveStyleElement.type = "text/css", io(this.responsiveStyleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.body.appendChild(this.responsiveStyleElement);
        }
        var n = "";
        if (this.responsiveOptions)
          for (var r = Ia(), a = dn(this.responsiveOptions).filter(function(u) {
            return !!(u.breakpoint && u.numMonths);
          }).sort(function(u, f) {
            return -1 * r(u.breakpoint, f.breakpoint);
          }), o = 0; o < a.length; o++) {
            for (var i = a[o], l = i.breakpoint, s = i.numMonths, d = `
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
      return ve({
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
              var a = this.parseValueForComparison(t[1]);
              t = new Date(a.getFullYear(), a.getMonth() - this.numberOfMonths + 1, 1);
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
        var r = this.currentMonth + n, a = this.currentYear;
        r > 11 && (r = r % 11 - 1, a = a + 1);
        for (var o = [], i = this.getFirstDayOfMonthIndex(r, a), l = this.getDaysCountInMonth(r, a), s = this.getDaysCountInPrevMonth(r, a), d = 1, c = /* @__PURE__ */ new Date(), u = [], f = Math.ceil((l + i) / 7), m = 0; m < f; m++) {
          var v = [];
          if (m == 0) {
            for (var g = s - i + 1; g <= s; g++) {
              var w = this.getPreviousMonthAndYear(r, a);
              v.push({
                day: g,
                month: w.month,
                year: w.year,
                otherMonth: !0,
                today: this.isToday(c, g, w.month, w.year),
                selectable: this.isSelectable(g, w.month, w.year, !0)
              });
            }
            for (var S = 7 - v.length, V = 0; V < S; V++)
              v.push({
                day: d,
                month: r,
                year: a,
                today: this.isToday(c, d, r, a),
                selectable: this.isSelectable(d, r, a, !1)
              }), d++;
          } else
            for (var A = 0; A < 7; A++) {
              if (d > l) {
                var h = this.getNextMonthAndYear(r, a);
                v.push({
                  day: d - l,
                  month: h.month,
                  year: h.year,
                  otherMonth: !0,
                  today: this.isToday(c, d - l, h.month, h.year),
                  selectable: this.isSelectable(d - l, h.month, h.year, !0)
                });
              } else
                v.push({
                  day: d,
                  month: r,
                  year: a,
                  today: this.isToday(c, d, r, a),
                  selectable: this.isSelectable(d, r, a, !1)
                });
              d++;
            }
          this.showWeek && u.push(this.getWeekNumber(new Date(v[0].year, v[0].month, v[0].day))), o.push(v);
        }
        t.push({
          month: r,
          year: a,
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
      for (var t = this, n = [], r = function(i) {
        if (t.minDate) {
          var l = t.minDate.getMonth(), s = t.minDate.getFullYear();
          if (t.currentYear < s || t.currentYear === s && i < l)
            return !1;
        }
        if (t.maxDate) {
          var d = t.maxDate.getMonth(), c = t.maxDate.getFullYear();
          if (t.currentYear > c || t.currentYear === c && i > d)
            return !1;
        }
        return !0;
      }, a = 0; a <= 11; a++)
        n.push({
          value: this.$primevue.config.locale.monthNamesShort[a],
          selectable: r(a)
        });
      return n;
    },
    yearPickerValues: function() {
      for (var t = this, n = [], r = this.currentYear - this.currentYear % 10, a = function(l) {
        return !(t.minDate && t.minDate.getFullYear() > l || t.maxDate && t.maxDate.getFullYear() < l);
      }, o = 0; o < 10; o++)
        n.push({
          value: r + o,
          selectable: a(r + o)
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
      return ve({
        fluid: this.$fluid
      });
    },
    panelDataP: function() {
      return ve(Gr({
        inline: this.inline
      }, "portal-" + this.appendTo, "portal-" + this.appendTo));
    },
    inputIconDataP: function() {
      return ve(Gr({}, this.size, this.size));
    },
    timePickerDataP: function() {
      return ve({
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
    InputText: Pt,
    Button: Se,
    Portal: Hn,
    CalendarIcon: Bo,
    ChevronLeftIcon: jo,
    ChevronRightIcon: Fo,
    ChevronUpIcon: Ro,
    ChevronDownIcon: No,
    TimesIcon: Kn
  },
  directives: {
    ripple: Un
  }
}, yp = ["id", "data-p"], wp = ["disabled", "aria-label", "aria-expanded", "aria-controls"], kp = ["data-p"], Sp = ["id", "role", "aria-modal", "aria-label", "data-p"], xp = ["disabled", "aria-label"], $p = ["disabled", "aria-label"], Cp = ["disabled", "aria-label"], Tp = ["disabled", "aria-label"], Pp = ["data-p-disabled"], _p = ["abbr"], Op = ["data-p-disabled"], Ep = ["aria-label", "data-p-today", "data-p-other-month"], Dp = ["onClick", "onKeydown", "aria-selected", "aria-disabled", "data-p"], Mp = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], Ap = ["onClick", "onKeydown", "data-p-disabled", "data-p-selected"], Ip = ["data-p"];
function Vp(e, t, n, r, a, o) {
  var i = Le("InputText"), l = Le("TimesIcon"), s = Le("Button"), d = Le("Portal"), c = Ln("ripple");
  return p(), b("span", x({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    style: e.sx("root"),
    "data-p": o.containerDataP
  }, e.ptmi("root")), [e.inline ? M("", !0) : (p(), F(i, {
    key: 0,
    ref: o.inputRef,
    id: e.inputId,
    role: "combobox",
    class: $([e.inputClass, e.cx("pcInputText")]),
    style: ma(e.inputStyle),
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
    "aria-expanded": a.overlayVisible,
    "aria-controls": a.overlayVisible ? o.panelId : void 0,
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
  }, null, 8, ["id", "class", "style", "defaultValue", "placeholder", "name", "size", "invalid", "variant", "fluid", "required", "unstyled", "aria-expanded", "aria-controls", "aria-labelledby", "aria-label", "disabled", "readonly", "onInput", "onClick", "onFocus", "onBlur", "onKeydown", "data-p-has-dropdown", "data-p-has-e-icon", "pt"])), e.showClear && !e.inline ? Y(e.$slots, "clearicon", {
    key: 1,
    class: $(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [z(l, x({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: o.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : M("", !0), e.showIcon && e.iconDisplay === "button" && !e.inline ? Y(e.$slots, "dropdownbutton", {
    key: 2,
    toggleCallback: o.onButtonClick
  }, function() {
    return [I("button", x({
      class: e.cx("dropdown"),
      disabled: e.disabled,
      onClick: t[0] || (t[0] = function() {
        return o.onButtonClick && o.onButtonClick.apply(o, arguments);
      }),
      type: "button",
      "aria-label": e.$primevue.config.locale.chooseDate,
      "aria-haspopup": "dialog",
      "aria-expanded": a.overlayVisible,
      "aria-controls": o.panelId
    }, e.ptm("dropdown")), [Y(e.$slots, "dropdownicon", {
      class: $(e.icon)
    }, function() {
      return [(p(), F(be(e.icon ? "span" : "CalendarIcon"), x({
        class: e.icon
      }, e.ptm("dropdownIcon")), null, 16, ["class"]))];
    })], 16, wp)];
  }) : e.showIcon && e.iconDisplay === "input" && !e.inline ? (p(), b(X, {
    key: 3
  }, [e.$slots.inputicon || e.showIcon ? (p(), b("span", x({
    key: 0,
    class: e.cx("inputIconContainer"),
    "data-p": o.inputIconDataP
  }, e.ptm("inputIconContainer")), [Y(e.$slots, "inputicon", {
    class: $(e.cx("inputIcon")),
    clickCallback: o.onButtonClick
  }, function() {
    return [(p(), F(be(e.icon ? "i" : "CalendarIcon"), x({
      class: [e.icon, e.cx("inputIcon")],
      onClick: o.onButtonClick
    }, e.ptm("inputicon")), null, 16, ["class", "onClick"]))];
  })], 16, kp)) : M("", !0)], 64)) : M("", !0), z(d, {
    appendTo: e.appendTo,
    disabled: e.inline
  }, {
    default: Z(function() {
      return [z(Qr, x({
        name: "p-anchored-overlay",
        onEnter: t[58] || (t[58] = function(u) {
          return o.onOverlayEnter(u);
        }),
        onAfterEnter: o.onOverlayEnterComplete,
        onAfterLeave: o.onOverlayAfterLeave,
        onLeave: o.onOverlayLeave
      }, e.ptm("transition")), {
        default: Z(function() {
          return [e.inline || a.overlayVisible ? (p(), b("div", x({
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
          }, e.ptm("panel")), [e.timeOnly ? M("", !0) : (p(), b(X, {
            key: 0
          }, [I("div", x({
            class: e.cx("calendarContainer")
          }, e.ptm("calendarContainer")), [(p(!0), b(X, null, ce(o.months, function(u, f) {
            return p(), b("div", x({
              key: u.month + u.year,
              class: e.cx("calendar")
            }, {
              ref_for: !0
            }, e.ptm("calendar")), [I("div", x({
              class: e.cx("header")
            }, {
              ref_for: !0
            }, e.ptm("header")), [Y(e.$slots, "header"), Y(e.$slots, "prevbutton", {
              actionCallback: function(v) {
                return o.onPrevButtonClick(v);
              },
              keydownCallback: function(v) {
                return o.onContainerButtonKeydown(v);
              }
            }, function() {
              return [Ue(z(s, x({
                ref_for: !0,
                ref: o.previousButtonRef,
                class: e.cx("pcPrevButton"),
                disabled: e.disabled,
                "aria-label": a.currentView === "year" ? e.$primevue.config.locale.prevDecade : a.currentView === "month" ? e.$primevue.config.locale.prevYear : e.$primevue.config.locale.prevMonth,
                unstyled: e.unstyled,
                onClick: o.onPrevButtonClick,
                onKeydown: o.onContainerButtonKeydown
              }, {
                ref_for: !0
              }, e.navigatorButtonProps, {
                pt: e.ptm("pcPrevButton"),
                "data-pc-group-section": "navigator"
              }), {
                icon: Z(function(m) {
                  return [Y(e.$slots, "previcon", {}, function() {
                    return [(p(), F(be(e.prevIcon ? "span" : "ChevronLeftIcon"), x({
                      class: [e.prevIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcPrevButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[nr, f === 0]])];
            }), I("div", x({
              class: e.cx("title")
            }, {
              ref_for: !0
            }, e.ptm("title")), [e.$primevue.config.locale.showMonthAfterYear ? (p(), b(X, {
              key: 0
            }, [a.currentView !== "year" ? (p(), b("button", x({
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
            }), N(o.getYear(u)), 17, xp)) : M("", !0), a.currentView === "date" ? (p(), b("button", x({
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
            }), N(o.getMonthName(u.month)), 17, $p)) : M("", !0)], 64)) : (p(), b(X, {
              key: 1
            }, [a.currentView === "date" ? (p(), b("button", x({
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
            }), N(o.getMonthName(u.month)), 17, Cp)) : M("", !0), a.currentView !== "year" ? (p(), b("button", x({
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
            }), N(o.getYear(u)), 17, Tp)) : M("", !0)], 64)), a.currentView === "year" ? (p(), b("span", x({
              key: 2,
              class: e.cx("decade")
            }, {
              ref_for: !0
            }, e.ptm("decade")), [Y(e.$slots, "decade", {
              years: o.yearPickerValues
            }, function() {
              return [oe(N(o.yearPickerValues[0].value) + " - " + N(o.yearPickerValues[o.yearPickerValues.length - 1].value), 1)];
            })], 16)) : M("", !0)], 16), Y(e.$slots, "nextbutton", {
              actionCallback: function(v) {
                return o.onNextButtonClick(v);
              },
              keydownCallback: function(v) {
                return o.onContainerButtonKeydown(v);
              }
            }, function() {
              return [Ue(z(s, x({
                ref_for: !0,
                ref: o.nextButtonRef,
                class: e.cx("pcNextButton"),
                disabled: e.disabled,
                "aria-label": a.currentView === "year" ? e.$primevue.config.locale.nextDecade : a.currentView === "month" ? e.$primevue.config.locale.nextYear : e.$primevue.config.locale.nextMonth,
                unstyled: e.unstyled,
                onClick: o.onNextButtonClick,
                onKeydown: o.onContainerButtonKeydown
              }, {
                ref_for: !0
              }, e.navigatorButtonProps, {
                pt: e.ptm("pcNextButton"),
                "data-pc-group-section": "navigator"
              }), {
                icon: Z(function(m) {
                  return [Y(e.$slots, "nexticon", {}, function() {
                    return [(p(), F(be(e.nextIcon ? "span" : "ChevronRightIcon"), x({
                      class: [e.nextIcon, m.class]
                    }, {
                      ref_for: !0
                    }, e.ptm("pcNextButton").icon), null, 16, ["class"]))];
                  })];
                }),
                _: 3
              }, 16, ["class", "disabled", "aria-label", "unstyled", "onClick", "onKeydown", "pt"]), [[nr, e.numberOfMonths === 1 ? !0 : f === e.numberOfMonths - 1]])];
            })], 16), a.currentView === "date" ? (p(), b("table", x({
              key: 0,
              class: e.cx("dayView"),
              role: "grid"
            }, {
              ref_for: !0
            }, e.ptm("dayView")), [I("thead", x({
              ref_for: !0
            }, e.ptm("tableHeader")), [I("tr", x({
              ref_for: !0
            }, e.ptm("tableHeaderRow")), [e.showWeek ? (p(), b("th", x({
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
            }), [Y(e.$slots, "weekheaderlabel", {}, function() {
              return [I("span", x({
                ref_for: !0
              }, e.ptm("weekHeaderLabel", {
                context: {
                  disabled: e.showWeek
                }
              }), {
                "data-pc-group-section": "tableheadercelllabel"
              }), N(o.weekHeaderLabel), 17)];
            })], 16, Pp)) : M("", !0), (p(!0), b(X, null, ce(o.weekDays, function(m) {
              return p(), b("th", x({
                key: m,
                scope: "col",
                abbr: m
              }, {
                ref_for: !0
              }, e.ptm("tableHeaderCell"), {
                "data-pc-group-section": "tableheadercell",
                class: e.cx("weekDayCell")
              }), [I("span", x({
                class: e.cx("weekDay")
              }, {
                ref_for: !0
              }, e.ptm("weekDay"), {
                "data-pc-group-section": "tableheadercelllabel"
              }), N(m), 17)], 16, _p);
            }), 128))], 16)], 16), I("tbody", x({
              ref_for: !0
            }, e.ptm("tableBody")), [(p(!0), b(X, null, ce(u.dates, function(m, v) {
              return p(), b("tr", x({
                key: m[0].day + "" + m[0].month
              }, {
                ref_for: !0
              }, e.ptm("tableBodyRow")), [e.showWeek ? (p(), b("td", x({
                key: 0,
                class: e.cx("weekNumber")
              }, {
                ref_for: !0
              }, e.ptm("weekNumber"), {
                "data-pc-group-section": "tablebodycell"
              }), [I("span", x({
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
              }), [Y(e.$slots, "weeklabel", {
                weekNumber: u.weekNumbers[v]
              }, function() {
                return [u.weekNumbers[v] < 10 ? (p(), b("span", x({
                  key: 0,
                  style: {
                    visibility: "hidden"
                  }
                }, {
                  ref_for: !0
                }, e.ptm("weekLabel")), "0", 16)) : M("", !0), oe(" " + N(u.weekNumbers[v]), 1)];
              })], 16, Op)], 16)) : M("", !0), (p(!0), b(X, null, ce(m, function(g) {
                return p(), b("td", x({
                  key: g.day + "" + g.month,
                  "aria-label": g.day,
                  class: e.cx("dayCell", {
                    date: g
                  })
                }, {
                  ref_for: !0
                }, e.ptm("dayCell", {
                  context: {
                    date: g,
                    today: g.today,
                    otherMonth: g.otherMonth,
                    selected: o.isSelected(g),
                    disabled: !g.selectable
                  }
                }), {
                  "data-p-today": g.today,
                  "data-p-other-month": g.otherMonth,
                  "data-pc-group-section": "tablebodycell"
                }), [e.showOtherMonths || !g.otherMonth ? Ue((p(), b("span", x({
                  key: 0,
                  class: e.cx("day", {
                    date: g
                  }),
                  onClick: function(S) {
                    return o.onDateSelect(S, g);
                  },
                  draggable: "false",
                  onKeydown: function(S) {
                    return o.onDateCellKeydown(S, g, f);
                  },
                  "aria-selected": o.isSelected(g),
                  "aria-disabled": !g.selectable
                }, {
                  ref_for: !0
                }, e.ptm("day", {
                  context: {
                    date: g,
                    today: g.today,
                    otherMonth: g.otherMonth,
                    selected: o.isSelected(g),
                    disabled: !g.selectable
                  }
                }), {
                  "data-p": o.dayDataP(g),
                  "data-pc-group-section": "tablebodycelllabel"
                }), [Y(e.$slots, "date", {
                  date: g
                }, function() {
                  return [oe(N(g.day), 1)];
                })], 16, Dp)), [[c]]) : M("", !0), o.isSelected(g) ? (p(), b("div", x({
                  key: 1,
                  class: "p-hidden-accessible",
                  "aria-live": "polite"
                }, {
                  ref_for: !0
                }, e.ptm("hiddenSelectedDay"), {
                  "data-p-hidden-accessible": !0
                }), N(g.day), 17)) : M("", !0)], 16, Ep);
              }), 128))], 16);
            }), 128))], 16)], 16)) : M("", !0)], 16);
          }), 128))], 16), a.currentView === "month" ? (p(), b("div", x({
            key: 0,
            class: e.cx("monthView")
          }, e.ptm("monthView")), [(p(!0), b(X, null, ce(o.monthPickerValues, function(u, f) {
            return Ue((p(), b("span", x({
              key: u,
              onClick: function(v) {
                return o.onMonthSelect(v, {
                  month: u,
                  index: f
                });
              },
              onKeydown: function(v) {
                return o.onMonthCellKeydown(v, {
                  month: u,
                  index: f
                });
              },
              class: e.cx("month", {
                month: u,
                index: f
              })
            }, {
              ref_for: !0
            }, e.ptm("month", {
              context: {
                month: u,
                monthIndex: f,
                selected: o.isMonthSelected(f),
                disabled: !u.selectable
              }
            }), {
              "data-p-disabled": !u.selectable,
              "data-p-selected": o.isMonthSelected(f)
            }), [oe(N(u.value) + " ", 1), o.isMonthSelected(f) ? (p(), b("div", x({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenMonth"), {
              "data-p-hidden-accessible": !0
            }), N(u.value), 17)) : M("", !0)], 16, Mp)), [[c]]);
          }), 128))], 16)) : M("", !0), a.currentView === "year" ? (p(), b("div", x({
            key: 1,
            class: e.cx("yearView")
          }, e.ptm("yearView")), [(p(!0), b(X, null, ce(o.yearPickerValues, function(u) {
            return Ue((p(), b("span", x({
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
            }), [oe(N(u.value) + " ", 1), o.isYearSelected(u.value) ? (p(), b("div", x({
              key: 0,
              class: "p-hidden-accessible",
              "aria-live": "polite"
            }, {
              ref_for: !0
            }, e.ptm("hiddenYear"), {
              "data-p-hidden-accessible": !0
            }), N(u.value), 17)) : M("", !0)], 16, Ap)), [[c]]);
          }), 128))], 16)) : M("", !0)], 64)), (e.showTime || e.timeOnly) && a.currentView === "date" ? (p(), b("div", x({
            key: 1,
            class: e.cx("timePicker"),
            "data-p": o.timePickerDataP
          }, e.ptm("timePicker")), [I("div", x({
            class: e.cx("hourPicker")
          }, e.ptm("hourPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [Y(e.$slots, "hourincrementbutton", {
            callbacks: o.hourIncrementCallbacks
          }, function() {
            return [z(s, x({
              class: e.cx("pcIncrementButton"),
              "aria-label": e.$primevue.config.locale.nextHour,
              unstyled: e.unstyled,
              onMousedown: t[9] || (t[9] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }),
              onMouseup: t[10] || (t[10] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[12] || (t[12] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["enter"])), t[13] || (t[13] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, 1);
              }, ["space"]))],
              onMouseleave: t[11] || (t[11] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[14] || (t[14] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[15] || (t[15] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "incrementicon", {}, function() {
                  return [(p(), F(be(e.incrementIcon ? "span" : "ChevronUpIcon"), x({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onKeydown", "pt"])];
          }), I("span", x(e.ptm("hour"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentHour), 17), Y(e.$slots, "hourdecrementbutton", {
            callbacks: o.hourDecrementCallbacks
          }, function() {
            return [z(s, x({
              class: e.cx("pcDecrementButton"),
              "aria-label": e.$primevue.config.locale.prevHour,
              unstyled: e.unstyled,
              onMousedown: t[16] || (t[16] = function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }),
              onMouseup: t[17] || (t[17] = function(u) {
                return o.onTimePickerElementMouseUp(u);
              }),
              onKeydown: [o.onContainerButtonKeydown, t[19] || (t[19] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["enter"])), t[20] || (t[20] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 0, -1);
              }, ["space"]))],
              onMouseleave: t[18] || (t[18] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[21] || (t[21] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[22] || (t[22] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "decrementicon", {}, function() {
                  return [(p(), F(be(e.decrementIcon ? "span" : "ChevronDownIcon"), x({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onKeydown", "pt"])];
          })], 16), I("div", x(e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", x(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16), I("div", x({
            class: e.cx("minutePicker")
          }, e.ptm("minutePicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [Y(e.$slots, "minuteincrementbutton", {
            callbacks: o.minuteIncrementCallbacks
          }, function() {
            return [z(s, x({
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
              onKeydown: [o.onContainerButtonKeydown, t[26] || (t[26] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["enter"])), t[27] || (t[27] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, 1);
              }, ["space"]))],
              onMouseleave: t[25] || (t[25] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[28] || (t[28] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[29] || (t[29] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "incrementicon", {}, function() {
                  return [(p(), F(be(e.incrementIcon ? "span" : "ChevronUpIcon"), x({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", x(e.ptm("minute"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentMinute), 17), Y(e.$slots, "minutedecrementbutton", {
            callbacks: o.minuteDecrementCallbacks
          }, function() {
            return [z(s, x({
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
              onKeydown: [o.onContainerButtonKeydown, t[33] || (t[33] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["enter"])), t[34] || (t[34] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 1, -1);
              }, ["space"]))],
              onMouseleave: t[32] || (t[32] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[35] || (t[35] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[36] || (t[36] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "decrementicon", {}, function() {
                  return [(p(), F(be(e.decrementIcon ? "span" : "ChevronDownIcon"), x({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16), e.showSeconds ? (p(), b("div", x({
            key: 0,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", x(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16)) : M("", !0), e.showSeconds ? (p(), b("div", x({
            key: 1,
            class: e.cx("secondPicker")
          }, e.ptm("secondPicker"), {
            "data-pc-group-section": "timepickerContainer"
          }), [Y(e.$slots, "secondincrementbutton", {
            callbacks: o.secondIncrementCallbacks
          }, function() {
            return [z(s, x({
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
              onKeydown: [o.onContainerButtonKeydown, t[40] || (t[40] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["enter"])), t[41] || (t[41] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, 1);
              }, ["space"]))],
              onMouseleave: t[39] || (t[39] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[42] || (t[42] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[43] || (t[43] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcIncrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "incrementicon", {}, function() {
                  return [(p(), F(be(e.incrementIcon ? "span" : "ChevronUpIcon"), x({
                    class: [e.incrementIcon, u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", x(e.ptm("second"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(o.formattedCurrentSecond), 17), Y(e.$slots, "seconddecrementbutton", {
            callbacks: o.secondDecrementCallbacks
          }, function() {
            return [z(s, x({
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
              onKeydown: [o.onContainerButtonKeydown, t[47] || (t[47] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["enter"])), t[48] || (t[48] = le(function(u) {
                return o.onTimePickerElementMouseDown(u, 2, -1);
              }, ["space"]))],
              onMouseleave: t[46] || (t[46] = function(u) {
                return o.onTimePickerElementMouseLeave();
              }),
              onKeyup: [t[49] || (t[49] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["enter"])), t[50] || (t[50] = le(function(u) {
                return o.onTimePickerElementMouseUp(u);
              }, ["space"]))]
            }, e.timepickerButtonProps, {
              pt: e.ptm("pcDecrementButton"),
              "data-pc-group-section": "timepickerbutton"
            }), {
              icon: Z(function(u) {
                return [Y(e.$slots, "decrementicon", {}, function() {
                  return [(p(), F(be(e.decrementIcon ? "span" : "ChevronDownIcon"), x({
                    class: [e.decrementIcon, u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          })], 16)) : M("", !0), e.hourFormat == "12" ? (p(), b("div", x({
            key: 2,
            class: e.cx("separatorContainer")
          }, e.ptm("separatorContainer"), {
            "data-pc-group-section": "timepickerContainer"
          }), [I("span", x(e.ptm("separator"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(e.timeSeparator), 17)], 16)) : M("", !0), e.hourFormat == "12" ? (p(), b("div", x({
            key: 3,
            class: e.cx("ampmPicker")
          }, e.ptm("ampmPicker")), [Y(e.$slots, "ampmincrementbutton", {
            toggleCallback: function(f) {
              return o.toggleAMPM(f);
            },
            keydownCallback: function(f) {
              return o.onContainerButtonKeydown(f);
            }
          }, function() {
            return [z(s, x({
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
              icon: Z(function(u) {
                return [Y(e.$slots, "incrementicon", {
                  class: $(e.cx("incrementIcon"))
                }, function() {
                  return [(p(), F(be(e.incrementIcon ? "span" : "ChevronUpIcon"), x({
                    class: [e.cx("incrementIcon"), u.class]
                  }, e.ptm("pcIncrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "unstyled", "onKeydown", "pt"])];
          }), I("span", x(e.ptm("ampm"), {
            "data-pc-group-section": "timepickerlabel"
          }), N(a.pm ? e.$primevue.config.locale.pm : e.$primevue.config.locale.am), 17), Y(e.$slots, "ampmdecrementbutton", {
            toggleCallback: function(f) {
              return o.toggleAMPM(f);
            },
            keydownCallback: function(f) {
              return o.onContainerButtonKeydown(f);
            }
          }, function() {
            return [z(s, x({
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
              icon: Z(function(u) {
                return [Y(e.$slots, "decrementicon", {
                  class: $(e.cx("decrementIcon"))
                }, function() {
                  return [(p(), F(be(e.decrementIcon ? "span" : "ChevronDownIcon"), x({
                    class: [e.cx("decrementIcon"), u.class]
                  }, e.ptm("pcDecrementButton").icon, {
                    "data-pc-group-section": "timepickerlabel"
                  }), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "disabled", "onKeydown", "pt"])];
          })], 16)) : M("", !0)], 16, Ip)) : M("", !0), e.showButtonBar ? (p(), b("div", x({
            key: 2,
            class: e.cx("buttonbar")
          }, e.ptm("buttonbar")), [Y(e.$slots, "buttonbar", {
            todayCallback: function(f) {
              return o.onTodayButtonClick(f);
            },
            clearCallback: function(f) {
              return o.onClearButtonClick(f);
            }
          }, function() {
            return [Y(e.$slots, "todaybutton", {
              actionCallback: function(f) {
                return o.onTodayButtonClick(f);
              },
              keydownCallback: function(f) {
                return o.onContainerButtonKeydown(f);
              }
            }, function() {
              return [z(s, x({
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
            }), Y(e.$slots, "clearbutton", {
              actionCallback: function(f) {
                return o.onClearButtonClick(f);
              },
              keydownCallback: function(f) {
                return o.onContainerButtonKeydown(f);
              }
            }, function() {
              return [z(s, x({
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
          })], 16)) : M("", !0), Y(e.$slots, "footer")], 16, Sp)) : M("", !0)];
        }),
        _: 3
      }, 16, ["onAfterEnter", "onAfterLeave", "onLeave"])];
    }),
    _: 3
  }, 8, ["appendTo", "disabled"])], 16, yp);
}
Ho.render = Vp;
const Lp = "[data-wippy-theme-root]", Bp = ["w-theme-dark", "w-theme-light"];
function Np(e) {
  const t = U("");
  let n = null;
  return Zt(() => {
    const r = e()?.closest(Lp);
    if (!r)
      return;
    const a = () => {
      t.value = Bp.find((o) => r.classList.contains(o)) ?? "";
    };
    a(), n = new MutationObserver(a), n.observe(r, { attributes: !0, attributeFilter: ["class"] });
  }), ha(() => {
    n?.disconnect(), n = null;
  }), t;
}
const jp = /* @__PURE__ */ pe({
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
    const r = e, a = n;
    function o(k) {
      return typeof k == "string" ? k : "";
    }
    const i = U(o(r.modelValue));
    let l = !0;
    const s = U(Xe(i.value) ? i.value : null), d = y(() => s.value);
    let c = i.value;
    function u(k) {
      c = k, a("update:modelValue", k);
    }
    ue(() => r.modelValue, (k) => {
      const E = o(k);
      E !== c && (c = E, i.value = E, l = !0, s.value = Xe(E) ? E : null);
    });
    function f(k) {
      if (!k || !Xe(k))
        return;
      const [E, j, q] = k.split("-").map(Number), K = new Date(2e3, j - 1, q);
      return K.setFullYear(E), K;
    }
    const m = y(() => f(r.field.min)), v = y(() => f(r.field.max));
    let g = !1;
    function w(k) {
      g = !0, queueMicrotask(() => {
        g = !1;
      });
      const E = typeof k == "string" ? k : "";
      s.value = E === "" ? null : E, l = !0, i.value = E, u(E);
    }
    function S(k) {
      i.value = k.target.value, !g && (l = !1, u(i.value));
    }
    function V(k) {
      if (l) {
        i.value = s.value ?? "";
        return;
      }
      const E = k.originalEvent.target;
      Je(() => {
        E.value !== i.value && (E.value = i.value);
      });
    }
    const A = y(() => _("field-input")), h = y(() => _("field-calendar")), C = U(null), L = Np(() => C.value?.$el);
    function B(k) {
      return {
        pcInputText: {
          root: {
            value: i.value,
            "aria-describedby": k,
            "aria-required": r.field.required ? "true" : void 0
          }
        },
        panel: {
          part: h.value.part,
          class: [h.value.class, L.value]
        }
      };
    }
    return t({ focusFirstControl: () => C.value?.focusFirstControl() }), (k, E) => (p(), F(At, {
      ref_key: "shell",
      ref: C,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Z(({ id: j, describedBy: q, invalid: K }) => [
        z(P(Ho), {
          "model-value": d.value,
          "input-id": j,
          "update-model-type": "string",
          "date-format": "yy-mm-dd",
          placeholder: "YYYY-MM-DD",
          "min-date": m.value,
          "max-date": v.value,
          disabled: e.disabled,
          invalid: K,
          pt: B(q),
          part: A.value.part,
          class: $(A.value.class),
          "show-on-focus": !1,
          "show-icon": "",
          size: "small",
          fluid: "",
          "onUpdate:modelValue": w,
          onInput: S,
          onBlur: V
        }, null, 8, ["model-value", "input-id", "min-date", "max-date", "disabled", "invalid", "pt", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), Fp = /* @__PURE__ */ pe({
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
    const r = e, a = n, o = {
      text: { type: "text" },
      email: { type: "email", inputmode: "email", autocomplete: "email", autocapitalize: "off", spellcheck: "false" },
      number: { type: "text", inputmode: "decimal", autocomplete: "off", spellcheck: "false" }
    }, i = y(() => o[r.field.type]), l = y(() => typeof r.modelValue == "string" ? r.modelValue : ""), s = y(() => _("field-input")), d = U(null);
    return t({ focusFirstControl: () => d.value?.focusFirstControl() }), (c, u) => (p(), F(At, {
      ref_key: "shell",
      ref: d,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Z(({ id: f, describedBy: m, invalid: v }) => [
        z(P(Pt), x(i.value, {
          id: f,
          "model-value": l.value,
          placeholder: e.field.placeholder,
          disabled: e.disabled,
          invalid: v,
          "aria-describedby": m,
          "aria-required": e.field.required ? "true" : void 0,
          part: s.value.part,
          class: s.value.class,
          size: "small",
          fluid: "",
          "onUpdate:modelValue": u[0] || (u[0] = (g) => a("update:modelValue", String(g ?? "")))
        }), null, 16, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
});
var Rp = `
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
`, zp = {
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
}, Hp = re.extend({
  name: "textarea",
  style: Rp,
  classes: zp
}), Up = {
  name: "BaseTextarea",
  extends: Mt,
  props: {
    autoResize: Boolean
  },
  style: Hp,
  provide: function() {
    return {
      $pcTextarea: this,
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
function qp(e, t, n) {
  return (t = Yp(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Yp(e) {
  var t = Kp(e, "string");
  return Ot(t) == "symbol" ? t : t + "";
}
function Kp(e, t) {
  if (Ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var er = {
  name: "Textarea",
  extends: Up,
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
        var t = this.$el.style.height, n = parseInt(t) || 0, r = this.$el.scrollHeight, a = !n || r > n, o = n && r < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : a && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return x(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ve(qp({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Wp = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Gp(e, t, n, r, a, o) {
  return p(), b("textarea", x({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Wp);
}
er.render = Gp;
const Zp = /* @__PURE__ */ pe({
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
    const r = e, a = n, o = y(() => typeof r.modelValue == "string" ? r.modelValue : ""), i = y(() => _("field-input")), l = U(null);
    return t({ focusFirstControl: () => l.value?.focusFirstControl() }), (s, d) => (p(), F(At, {
      ref_key: "shell",
      ref: l,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      layout: "stacked"
    }, {
      default: Z(({ id: c, describedBy: u, invalid: f }) => [
        z(P(er), {
          id: c,
          "model-value": o.value,
          placeholder: e.field.placeholder,
          disabled: e.disabled,
          invalid: f,
          "aria-describedby": u,
          "aria-required": e.field.required ? "true" : void 0,
          part: i.value.part,
          class: $(i.value.class),
          rows: "3",
          "auto-resize": "",
          fluid: "",
          "onUpdate:modelValue": d[0] || (d[0] = (m) => a("update:modelValue", String(m ?? "")))
        }, null, 8, ["id", "model-value", "placeholder", "disabled", "invalid", "aria-describedby", "aria-required", "part", "class"])
      ]),
      _: 1
    }, 8, ["field", "model-value", "errors", "disabled", "readonly"]));
  }
}), tn = /* @__PURE__ */ pe({
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
    const r = n, a = U(null);
    return t({
      focusFirstControl: () => a.value?.focusFirstControl(),
      // Only a choice field has an Other box; any other type falls back to its control.
      focusOtherText() {
        a.value?.focusOtherText ? a.value.focusOtherText() : a.value?.focusFirstControl();
      }
    }), (o, i) => e.field.type === "choice" ? (p(), F(Mc, {
      key: 0,
      ref_key: "control",
      ref: a,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": i[0] || (i[0] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "text" || e.field.type === "email" || e.field.type === "number" ? (p(), F(Fp, {
      key: 1,
      ref_key: "control",
      ref: a,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": i[1] || (i[1] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "textarea" ? (p(), F(Zp, {
      key: 2,
      ref_key: "control",
      ref: a,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": i[2] || (i[2] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "date" ? (p(), F(jp, {
      key: 3,
      ref_key: "control",
      ref: a,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": i[3] || (i[3] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : e.field.type === "checkbox" ? (p(), F(Qd, {
      key: 4,
      ref_key: "control",
      ref: a,
      field: e.field,
      "model-value": e.modelValue,
      errors: e.errors,
      disabled: e.disabled,
      readonly: e.readonly,
      "onUpdate:modelValue": i[4] || (i[4] = (l) => r("update:modelValue", l))
    }, null, 8, ["field", "model-value", "errors", "disabled", "readonly"])) : M("", !0);
  }
}), Qp = ["part"], Xp = {
  role: "status",
  class: "w-form__sr"
}, Jp = ["part"], ef = ["part"], tf = ["part"], nf = ["part"], rf = ["part"], of = { class: "flex items-center gap-2" }, af = "You are offline. Your choices are kept.", sf = /* @__PURE__ */ pe({
  __name: "active-form",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry"],
  setup(e, { expose: t, emit: n }) {
    const r = e, a = n, o = Vn(
      sd(r.state.definition, r.state.data)
    ), i = Kr(r.state.definition, o), l = U({}), s = U([]), d = {}, c = U("");
    let u = !1;
    function f(H, ee) {
      d[H] = ee;
    }
    const m = y(() => !r.submitting && !r.offline);
    function v(H, ee = []) {
      const W = r.state.definition.fields.find((T) => H.includes(T.id))?.id;
      W && Je(() => {
        const T = d[W];
        ee.includes(W) ? T?.focusOtherText() : T?.focusFirstControl();
      });
    }
    function g(H) {
      return H === 1 ? "1 question needs attention." : `${H} questions need attention.`;
    }
    function w(H) {
      u = !0, c.value = g(H);
    }
    const S = y(() => Object.keys(l.value).length + (s.value.length > 0 ? 1 : 0));
    ue(S, (H) => {
      u && (c.value = H === 0 ? "" : g(H), H === 0 && (u = !1));
    });
    function V(H, ee) {
      l.value = H ?? {}, s.value = ee ?? [];
      const W = Object.keys(l.value);
      v(W);
      const T = W.length + (s.value.length > 0 ? 1 : 0);
      T > 0 && w(T);
    }
    function A(H, ee) {
      if (o[H] = ee, l.value[H]) {
        const { [H]: W, ...T } = l.value;
        l.value = T;
      }
    }
    function h() {
      return od(r.state.definition, o);
    }
    function C() {
      const H = ad(r.state.definition, o), ee = Object.keys(H);
      if (ee.length > 0) {
        l.value = H, s.value = [];
        const W = ee.filter((T) => H[T].some((G) => G.code === "blank"));
        v(ee, W), w(ee.length);
        return;
      }
      l.value = {}, s.value = [], a("submit", h());
    }
    ue(() => r.banner, (H) => {
      H && (u = !1, c.value = H.message);
    });
    const L = y(() => _("card")), B = y(() => _("fields")), k = y(() => _("fields-title")), E = y(() => _("form-description")), j = y(() => _("notice")), q = y(() => _("fields-error")), K = y(() => _("send"));
    return t({
      setServerErrors: V,
      retry: () => a("submit", h()),
      // See QuestionCardActive's own `hasUnsentInput` — a form the user changed
      // counts as unsent input a background "answered elsewhere" swap would
      // otherwise silently discard without explanation. An untouched form does
      // not, even one whose controls start filled from defaults or a checkbox.
      hasUnsentInput: () => Kr(r.state.definition, o) !== i
    }), (H, ee) => (p(), b("form", {
      part: `${L.value.part} ${B.value.part}`,
      class: $(`w-form ${L.value.class} ${B.value.class}`),
      novalidate: "",
      onSubmit: Xr(C, ["prevent"])
    }, [
      I("div", Xp, N(c.value), 1),
      e.offline ? (p(), b("p", {
        key: 0,
        role: "status",
        part: j.value.part,
        class: $(j.value.class)
      }, N(af), 10, Jp)) : M("", !0),
      I("div", null, [
        I("h2", {
          part: k.value.part,
          class: $(k.value.class)
        }, N(e.state.definition.title), 11, ef),
        e.state.definition.description ? (p(), b("p", {
          key: 0,
          part: E.value.part,
          class: $(E.value.class)
        }, N(e.state.definition.description), 11, tf)) : M("", !0),
        e.state.stale ? (p(), b("p", {
          key: 1,
          part: j.value.part,
          class: $(j.value.class)
        }, " Asked earlier — the conversation has moved on. You can still answer; the assistant will use it as context and confirm before acting on the earlier request. ", 10, nf)) : M("", !0)
      ]),
      (p(!0), b(X, null, ce(e.state.definition.fields, (W) => (p(), F(tn, {
        key: W.id,
        ref_for: !0,
        ref: (T) => f(W.id, T),
        field: W,
        "model-value": o[W.id],
        errors: l.value[W.id] ?? [],
        disabled: e.submitting,
        readonly: !1,
        "onUpdate:modelValue": (T) => A(W.id, T)
      }, null, 8, ["field", "model-value", "errors", "disabled", "onUpdate:modelValue"]))), 128)),
      s.value.length > 0 ? (p(), b("ul", {
        key: 1,
        part: q.value.part,
        class: $(`${q.value.class} text-danger-600 dark:text-danger-400`)
      }, [
        (p(!0), b(X, null, ce(s.value, (W, T) => (p(), b("li", { key: T }, N(W.message), 1))), 128))
      ], 10, rf)) : M("", !0),
      e.banner ? (p(), F(P($e), {
        key: 2,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: Z(() => [
          I("div", of, [
            I("span", null, N(e.banner.message), 1),
            e.banner.retryable ? (p(), F(P(Se), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: ee[0] || (ee[0] = (W) => a("retry"))
            }, {
              default: Z(() => [...ee[1] || (ee[1] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            })) : M("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : M("", !0),
      I("div", null, [
        z(P(Se), {
          type: "submit",
          label: e.state.definition.submit_label || "Submit",
          loading: e.submitting,
          disabled: !m.value,
          part: K.value.part,
          class: $(K.value.class)
        }, null, 8, ["label", "loading", "disabled", "part", "class"])
      ])
    ], 42, Qp));
  }
}), lf = ["part"], uf = ["part"], df = ["part"], cf = ["part"], pf = { key: 0 }, ff = { key: 1 }, mf = { key: 2 }, hf = { key: 3 }, bf = { key: 4 }, vf = /* @__PURE__ */ pe({
  __name: "idle-form",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    function n(d) {
      if (!d)
        return null;
      const c = new Date(d);
      return Number.isNaN(c.getTime()) ? null : c.toLocaleString();
    }
    const r = U(null), a = y(() => _("card", "answered")), o = y(() => _("fields")), i = y(() => _("fields-title")), l = y(() => _("form-description")), s = y(() => _("status"));
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        r.value?.focus();
      }
    }), (d, c) => (p(), b("div", {
      part: `${a.value.part} ${o.value.part}`,
      class: $(`w-form ${a.value.class} ${o.value.class}`)
    }, [
      I("div", null, [
        I("h2", {
          part: i.value.part,
          class: $(i.value.class)
        }, N(e.state.definition.title), 11, uf),
        e.state.definition.description ? (p(), b("p", {
          key: 0,
          part: l.value.part,
          class: $(l.value.class)
        }, N(e.state.definition.description), 11, df)) : M("", !0)
      ]),
      (p(!0), b(X, null, ce(e.state.definition.fields, (u) => (p(), F(tn, {
        key: u.id,
        field: u,
        "model-value": e.state.data ? e.state.data[u.id] : void 0,
        errors: [],
        disabled: !0,
        readonly: !0
      }, null, 8, ["field", "model-value"]))), 128)),
      I("div", {
        ref_key: "statusEl",
        ref: r,
        tabindex: "-1",
        part: s.value.part,
        class: $(s.value.class)
      }, [
        e.state.late ? (p(), b("p", pf, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : M("", !0),
        e.state.delivery === "pending" ? (p(), b("p", ff, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), b("p", mf, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), b("p", hf, " The assistant stopped before answering. Send a message to continue. ")) : M("", !0),
        n(e.state.submitted_at) ? (p(), b("p", bf, " Answered " + N(n(e.state.submitted_at)), 1)) : M("", !0)
      ], 10, cf)
    ], 10, lf));
  }
}), gf = ["part"], yf = ["part"], wf = ["part"], kf = /* @__PURE__ */ pe({
  __name: "needs-newer-host-notice",
  props: {
    definition: {},
    answered: { type: Boolean }
  },
  setup(e) {
    const t = y(() => _("card", "unsupported")), n = y(() => _("fields")), r = y(() => _("fields-title")), a = y(() => _("form-description"));
    return (o, i) => (p(), b("div", {
      part: `${t.value.part} ${n.value.part}`,
      class: $(`w-form ${t.value.class} ${n.value.class}`)
    }, [
      I("div", null, [
        I("h2", {
          part: r.value.part,
          class: $(r.value.class)
        }, N(e.definition.title), 11, yf),
        e.definition.description ? (p(), b("p", {
          key: 0,
          part: a.value.part,
          class: $(a.value.class)
        }, N(e.definition.description), 11, wf)) : M("", !0)
      ]),
      (p(!0), b(X, null, ce(e.definition.fields, (l) => (p(), F(tn, {
        key: l.id,
        field: l,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      e.answered ? (p(), F(P($e), {
        key: 0,
        severity: "secondary",
        closable: !1
      }, {
        default: Z(() => [...i[0] || (i[0] = [
          oe(" This form was answered. Your answer is in the chat. ", -1)
        ])]),
        _: 1
      })) : (p(), F(P($e), {
        key: 1,
        severity: "warn",
        closable: !1
      }, {
        default: Z(() => [...i[1] || (i[1] = [
          oe(" This form needs a newer Web Host. If you already answered it, your answer is in the chat. ", -1)
        ])]),
        _: 1
      }))
    ], 10, gf));
  }
}), Sf = ["part"], xf = ["part"], $f = ["part"], Cf = /* @__PURE__ */ pe({
  __name: "no-artifact-notice",
  props: {
    definition: {}
  },
  setup(e) {
    const t = y(() => _("card", "unsupported")), n = y(() => _("fields")), r = y(() => _("fields-title")), a = y(() => _("form-description"));
    return (o, i) => (p(), b("div", {
      part: `${t.value.part} ${n.value.part}`,
      class: $(`w-form ${t.value.class} ${n.value.class}`)
    }, [
      I("div", null, [
        I("h2", {
          part: r.value.part,
          class: $(r.value.class)
        }, N(e.definition.title), 11, xf),
        e.definition.description ? (p(), b("p", {
          key: 0,
          part: a.value.part,
          class: $(a.value.class)
        }, N(e.definition.description), 11, $f)) : M("", !0)
      ]),
      (p(!0), b(X, null, ce(e.definition.fields, (l) => (p(), F(tn, {
        key: l.id,
        field: l,
        "model-value": void 0,
        errors: [],
        disabled: !0,
        readonly: !1
      }, null, 8, ["field"]))), 128)),
      z(P($e), {
        severity: "secondary",
        closable: !1
      }, {
        default: Z(() => [...i[0] || (i[0] = [
          oe(" This form cannot be submitted here. ", -1)
        ])]),
        _: 1
      })
    ], 10, Sf));
  }
}), Gt = 9;
function Tf(e, t, n) {
  const r = e.fields.length, a = r > 1, o = /* @__PURE__ */ new Set([0]), i = U(0), l = U(!1), s = U(""), d = U(""), c = U(null), u = U(0), f = Vn(
    Object.fromEntries(e.fields.map((O) => {
      const D = t?.[O.id], R = O.options.filter((Ie) => vu(D, Ie.value)).map((Ie) => Ie.value), Q = {};
      for (const Ie of R) {
        const Vt = gu(D, Ie);
        Vt && (Q[Ie] = Vt);
      }
      const se = _o(D), xe = st(D), je = R.length > 0 || se && fe(xe) !== "", It = { chosen: R, other: xe, useOther: se, notes: Q, noteOpen: null, done: je };
      return [O.id, It];
    }))
  );
  function m(O) {
    return f[O.id];
  }
  function v(O) {
    const D = m(O);
    return O.multiple ? D.chosen.length > 0 || fe(D.other) !== "" : D.chosen.length > 0 || D.useOther && fe(D.other) !== "";
  }
  function g(O) {
    return m(O).done && v(O);
  }
  const w = y(() => a && i.value === r), S = y(() => w.value ? null : e.fields[i.value] ?? null), V = y(
    () => e.fields.map((O, D) => ({ field: O, index: D })).filter(({ field: O }) => O.required && !g(O))
  );
  function A(O) {
    d.value = "", setTimeout(() => {
      d.value = O;
    }, 30);
  }
  function h(O) {
    c.value = O, u.value++;
  }
  function C(O) {
    return Math.min(O.options.length + (O.allow_other ? 1 : 0), Gt);
  }
  function L(O) {
    const D = C(O), R = D > 1 ? `1–${D}` : "1", Q = Math.min(O.options.length, Gt), se = Q > 1 ? `Shift+1–${Q}` : "Shift+1", xe = a ? " ← and → change questions." : "";
    return O.multiple ? `${R} ticks, ${se} adds a note, Enter sends.${xe}` : `${R} answers, ${se} adds a note first.${xe}`;
  }
  function B(O) {
    const D = m(O);
    if (O.multiple) {
      const R = O.options.filter((se) => D.chosen.includes(se.value)).map((se) => Wt(se.value, D.notes[se.value] ?? "")), Q = fe(D.other);
      return Q && R.push({ other: Q }), R.length > 0 ? R : void 0;
    }
    if (D.useOther)
      return { other: fe(D.other) };
    if (D.chosen[0])
      return Wt(D.chosen[0], D.notes[D.chosen[0]] ?? "");
  }
  function k(O) {
    return g(O) ? Jn(O, B(O)) : null;
  }
  function E() {
    const O = {};
    for (const D of e.fields) {
      if (!g(D))
        continue;
      const R = B(D);
      R !== void 0 && (O[D.id] = R);
    }
    return O;
  }
  function j(O, D = "first") {
    const R = S.value;
    R && R.multiple && !m(R).done && v(R) && (m(R).done = !0);
    const Q = a ? r : r - 1;
    if (i.value = Math.max(0, Math.min(O, Q)), s.value = "", w.value || o.add(i.value), w.value) {
      const se = V.value[0];
      h(se ? `review-item-${se.index}` : "send-all");
    } else
      h(D);
    A(w.value ? "Review your answers" : `Question ${i.value + 1} of ${r}`);
  }
  function q() {
    V.value.length > 0 || n(E());
  }
  function K(O) {
    if (m(O).done = !0, s.value = "", !a) {
      n(E());
      return;
    }
    const D = e.fields.findIndex((R, Q) => Q > i.value && !o.has(Q));
    j(D === -1 ? r : D);
  }
  function H(O, D) {
    const R = m(O);
    if (D >= O.options.length) {
      h("other");
      return;
    }
    const Q = O.options[D].value;
    if (R.noteOpen === Q && !O.multiple) {
      h(`note-${Q}`);
      return;
    }
    if (O.multiple) {
      R.chosen = R.chosen.includes(Q) ? R.chosen.filter((se) => se !== Q) : [...R.chosen, Q], v(O) || (R.done = !1), s.value = "", h(`opt-${D}`), A(R.chosen.includes(Q) ? "Ticked" : "Unticked");
      return;
    }
    R.chosen = [Q], R.useOther = !1, K(O);
  }
  function ee(O, D, R = !1) {
    const Q = m(O), se = O.options.findIndex((xe) => xe.value === D);
    Q.noteOpen === D && !R ? (Q.noteOpen = null, h(`opt-${se}`)) : (Q.noteOpen = D, h(`note-${D}`));
  }
  function W(O, D, R) {
    m(O).notes[D] = R;
  }
  function T(O, D) {
    const R = m(O);
    if (R.noteOpen = null, O.multiple) {
      R.chosen.includes(D) || (R.chosen = [...R.chosen, D]), h(`opt-${O.options.findIndex((Q) => Q.value === D)}`), A("Note saved");
      return;
    }
    R.chosen = [D], R.useOther = !1, K(O);
  }
  function G(O) {
    const D = m(O), R = fe(D.other);
    if (O.multiple) {
      if (!R && D.chosen.length === 0)
        return;
    } else {
      if (!R)
        return;
      D.useOther = !0, D.chosen = [];
    }
    K(O);
  }
  return {
    n: r,
    multi: a,
    index: i,
    collapsed: l,
    error: s,
    liveMessage: d,
    focusTarget: c,
    focusSeq: u,
    answers: f,
    inReview: w,
    currentQuestion: S,
    missingRequired: V,
    ans: m,
    hasContent: v,
    answered: g,
    answerItemsFor: k,
    keysText: L,
    activate: H,
    toggleNote: ee,
    setNote: W,
    sendNote: T,
    sendOther: G,
    commit: K,
    go: j,
    submitAll: q,
    requestFocus: h,
    buildAnswers: E
  };
}
const Pf = {
  key: 0,
  part: "code",
  class: "w-form__code"
}, Be = /* @__PURE__ */ pe({
  __name: "question-card-rich-text",
  props: {
    text: {}
  },
  setup(e) {
    const t = e;
    return (n, r) => (p(!0), b(X, null, ce(P(Bd)(t.text), (a, o) => (p(), b(X, { key: o }, [
      a.code ? (p(), b("code", Pf, N(a.text), 1)) : (p(), b(X, { key: 1 }, [
        oe(N(a.text), 1)
      ], 64))
    ], 64))), 128));
  }
}), _f = ["part"], Of = ["part"], Ef = ["part"], Df = { "aria-hidden": "true" }, Mf = { class: "w-form__sr" }, Af = ["id", "part"], If = ["part"], Vf = /* @__PURE__ */ pe({
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
    const n = e, r = t, a = y(() => _("header", !n.multi && "single")), o = y(() => _("nav")), i = y(() => _("prev")), l = y(() => _("counter")), s = y(() => _("next")), d = y(() => _("question")), c = y(() => _("actions")), u = y(() => _("collapse")), f = y(() => n.review ? "Review" : `${n.index + 1}/${n.n}`), m = y(() => n.review ? "Review" : `Question ${n.index + 1} of ${n.n}`), v = y(() => n.index === n.n - 1 ? "Review answers" : "Next question");
    return (g, w) => (p(), b("div", {
      part: a.value.part,
      class: $(a.value.class)
    }, [
      e.multi ? (p(), b("div", {
        key: 0,
        part: o.value.part,
        class: $(o.value.class),
        role: "group",
        "aria-label": "Questions"
      }, [
        z(P(Se), {
          type: "button",
          text: "",
          size: "small",
          part: i.value.part,
          class: $(i.value.class),
          "aria-label": "Previous question",
          title: "Previous question",
          disabled: e.index === 0,
          onClick: w[0] || (w[0] = (S) => r("prev"))
        }, {
          icon: Z(() => [
            z(P(Ce), { icon: "tabler:chevron-left" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"]),
        I("span", {
          part: l.value.part,
          class: $(l.value.class)
        }, [
          I("span", Df, N(f.value), 1),
          I("span", Mf, N(m.value), 1)
        ], 10, Ef),
        z(P(Se), {
          type: "button",
          text: "",
          size: "small",
          part: s.value.part,
          class: $(s.value.class),
          "aria-label": v.value,
          title: v.value,
          disabled: e.review,
          onClick: w[1] || (w[1] = (S) => r("next"))
        }, {
          icon: Z(() => [
            z(P(Ce), { icon: "tabler:chevron-right" })
          ]),
          _: 1
        }, 8, ["part", "class", "aria-label", "title", "disabled"])
      ], 10, Of)) : M("", !0),
      I("h3", {
        id: e.qid,
        part: d.value.part,
        class: $(d.value.class)
      }, [
        e.review ? (p(), b(X, { key: 0 }, [
          oe(" Check your answers, then send them. ")
        ], 64)) : (p(), F(Be, {
          key: 1,
          text: e.questionText
        }, null, 8, ["text"]))
      ], 10, Af),
      I("div", {
        part: c.value.part,
        class: $(c.value.class)
      }, [
        z(P(Se), {
          type: "button",
          text: "",
          size: "small",
          part: u.value.part,
          class: $(u.value.class),
          "aria-expanded": e.collapsed ? "false" : "true",
          "aria-label": e.collapsed ? "Show answers" : "Hide answers",
          title: e.collapsed ? "Show answers" : "Hide answers",
          onClick: w[2] || (w[2] = (S) => r("toggleCollapse"))
        }, {
          icon: Z(() => [
            z(P(Ce), {
              icon: e.collapsed ? "tabler:chevron-down" : "tabler:chevron-up"
            }, null, 8, ["icon"])
          ]),
          _: 1
        }, 8, ["part", "class", "aria-expanded", "aria-label", "title"])
      ], 10, If)
    ], 10, _f));
  }
});
var Lf = `
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
`, Bf = {
  root: "p-inputgroup"
}, Nf = re.extend({
  name: "inputgroup",
  style: Lf,
  classes: Bf
}), jf = {
  name: "BaseInputGroup",
  extends: nt,
  style: Nf,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Uo = {
  name: "InputGroup",
  extends: jf,
  inheritAttrs: !1
};
function Ff(e, t, n, r, a, o) {
  return p(), b("div", x({
    class: e.cx("root")
  }, e.ptmi("root")), [Y(e.$slots, "default")], 16);
}
Uo.render = Ff;
const qo = /* @__PURE__ */ pe({
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
    const n = e, r = t, a = y(() => _("composer", n.kind)), o = y(() => _(`${n.kind}-input`)), i = y(() => _(`${n.kind}-send`));
    function l(s) {
      s.key === "Enter" && !s.shiftKey && !s.isComposing ? (s.preventDefault(), n.enabled && r("send")) : s.key === "Escape" && !s.isComposing && (s.preventDefault(), r("escape"));
    }
    return (s, d) => (p(), F(P(Uo), {
      part: a.value.part,
      class: $(a.value.class)
    }, {
      default: Z(() => [
        z(P(er), {
          "model-value": e.modelValue,
          part: o.value.part,
          class: $(o.value.class),
          rows: "1",
          "auto-resize": "",
          placeholder: e.placeholder,
          "aria-label": e.label,
          "aria-invalid": e.invalid ? "true" : void 0,
          "aria-describedby": e.describedBy,
          enterkeyhint: "send",
          "data-focus": e.dataFocus,
          "onUpdate:modelValue": d[0] || (d[0] = (c) => r("update:modelValue", String(c ?? ""))),
          onKeydown: l
        }, null, 8, ["model-value", "part", "class", "placeholder", "aria-label", "aria-invalid", "aria-describedby", "data-focus"]),
        z(P(Se), {
          type: "button",
          text: "",
          rounded: "",
          part: i.value.part,
          class: $(i.value.class),
          disabled: !e.enabled,
          "aria-label": e.sendLabel,
          title: e.sendLabel,
          onClick: d[1] || (d[1] = (c) => r("send"))
        }, {
          icon: Z(() => [
            z(P(Ce), { icon: "tabler:send-2" })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled", "aria-label", "title"])
      ]),
      _: 1
    }, 8, ["part", "class"]));
  }
}), Rf = ["part"], zf = ["part", "role", "aria-checked", "aria-disabled", "tabindex", "data-focus", "aria-keyshortcuts"], Hf = ["part"], Uf = ["part"], qf = ["part"], Yf = ["part"], Kf = ["part"], Wf = { key: 1 }, Gf = ["part"], Zf = /* @__PURE__ */ pe({
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
    const n = e, r = t, a = y(() => _("option", n.selected && "selected", n.note && "has-note", n.editing && "editing")), o = y(() => _("option-main")), i = y(() => _("option-label")), l = y(() => _("option-mark")), s = y(() => _("option-description")), d = y(() => _("option-note")), c = y(() => _("note-toggle", n.note && "has-note", n.editing && "editing")), u = y(() => _("option-key")), f = y(() => _("error")), m = `${Et()}-note-err`;
    function v(V) {
      n.disabled || V.target.closest(".w-form__note-toggle, .w-form__composer") || r("activate");
    }
    const g = y(() => `${n.note ? "Edit the note on" : "Add a note to"} ${Wr(n.option.label)}`), w = y(() => n.multiple ? "Note for this answer. Enter saves it." : "Note for this answer. Enter answers with it."), S = y(() => n.multiple ? "Save the note" : "Answer with this note");
    return (V, A) => (p(), b("div", {
      part: a.value.part,
      class: $(a.value.class),
      onClick: v
    }, [
      I("div", {
        part: o.value.part,
        class: $(o.value.class),
        role: e.multiple ? "checkbox" : "radio",
        "aria-checked": e.selected ? "true" : "false",
        "aria-disabled": e.disabled ? "true" : void 0,
        tabindex: e.multiple || e.rovingTabbable ? 0 : -1,
        "data-focus": `opt-${e.index}`,
        "aria-keyshortcuts": e.keyLabel ? `${e.keyLabel} Shift+${e.keyLabel} N` : "N"
      }, [
        I("span", {
          part: i.value.part,
          class: $(i.value.class)
        }, [
          e.multiple ? (p(), F(P(Ct), {
            key: 0,
            "model-value": e.selected,
            binary: "",
            readonly: "",
            size: "small",
            tabindex: -1,
            "aria-hidden": "true",
            part: l.value.part,
            class: $(l.value.class)
          }, null, 8, ["model-value", "part", "class"])) : e.selected ? (p(), b("span", {
            key: 1,
            part: l.value.part,
            class: $(l.value.class),
            "aria-hidden": "true"
          }, [
            z(P(Ce), { icon: "tabler:check" })
          ], 10, Uf)) : M("", !0),
          z(Be, {
            text: e.option.label
          }, null, 8, ["text"])
        ], 10, Hf),
        e.option.description ? (p(), b("span", {
          key: 0,
          part: s.value.part,
          class: $(s.value.class)
        }, [
          z(Be, {
            text: e.option.description
          }, null, 8, ["text"])
        ], 10, qf)) : M("", !0),
        e.note && !e.editing ? (p(), b("span", {
          key: 1,
          part: d.value.part,
          class: $(d.value.class)
        }, [
          z(P(Ce), {
            icon: "tabler:note",
            "aria-hidden": "true"
          }),
          I("span", null, N(e.note), 1)
        ], 10, Yf)) : M("", !0)
      ], 10, zf),
      z(P(Se), {
        type: "button",
        text: "",
        size: "small",
        tabindex: -1,
        disabled: e.disabled,
        part: c.value.part,
        class: $(c.value.class),
        "aria-expanded": e.editing ? "true" : "false",
        "aria-label": g.value,
        title: e.note ? "Edit the note" : "Add a note",
        onClick: A[0] || (A[0] = Xr((h) => r("toggle-note"), ["stop"]))
      }, {
        icon: Z(() => [
          z(P(Ce), { icon: "tabler:note" })
        ]),
        _: 1
      }, 8, ["disabled", "part", "class", "aria-expanded", "aria-label", "title"]),
      e.keyLabel ? (p(), b("kbd", {
        key: 0,
        part: u.value.part,
        class: $(u.value.class),
        "aria-hidden": "true"
      }, N(e.keyLabel), 11, Kf)) : (p(), b("span", Wf)),
      e.editing ? (p(), b(X, { key: 2 }, [
        z(qo, {
          kind: "note",
          "model-value": e.noteDraft,
          placeholder: w.value,
          label: `Note for ${P(Wr)(e.option.label)}`,
          "send-label": S.value,
          enabled: !e.noteTooLong && !e.disabled,
          invalid: e.noteTooLong,
          "described-by": e.noteTooLong ? m : void 0,
          "data-focus": `note-${e.option.value}`,
          "onUpdate:modelValue": A[1] || (A[1] = (h) => r("update:noteDraft", h)),
          onSend: A[2] || (A[2] = (h) => r("send-note")),
          onEscape: A[3] || (A[3] = (h) => r("escape-note"))
        }, null, 8, ["model-value", "placeholder", "label", "send-label", "enabled", "invalid", "described-by", "data-focus"]),
        e.noteTooLong ? (p(), b("p", {
          key: 0,
          id: m,
          part: f.value.part,
          class: $(f.value.class),
          role: "alert"
        }, " Use at most 1,000 characters. ", 10, Gf)) : M("", !0)
      ], 64)) : M("", !0)
    ], 10, Rf));
  }
}), Qf = ["part"], Xf = ["part"], Jf = ["part"], em = ["part", "role", "aria-labelledby", "aria-describedby"], tm = ["part"], nm = {
  key: 0,
  part: "option-key",
  class: "w-form__option-key",
  "aria-hidden": "true"
}, rm = { key: 1 }, om = ["part"], am = ["part"], im = ["id"], sm = ["part"], lm = /* @__PURE__ */ pe({
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
    const t = e, n = y(() => _("notice")), r = y(() => _("description")), a = y(() => _("hint")), o = y(() => _("options")), i = y(() => _("footer")), l = y(() => _("send")), s = y(() => _("error")), d = y(() => _("keys")), c = y(() => {
      const k = [];
      return t.question.multiple && k.push("Choose any that apply."), t.question.required || k.push("Optional."), k.join(" ");
    }), u = y(() => t.controller.error.value || t.serverError || "");
    function f(k) {
      return k < Gt ? String(k + 1) : null;
    }
    const m = y(() => {
      const k = t.question.options.length + 1;
      return k <= Gt ? String(k) : null;
    });
    function v() {
      return t.controller.ans(t.question);
    }
    const g = y(() => {
      const k = v(), E = t.question.multiple ? fe(k.other) !== "" : k.useOther && k.done;
      return _("option", "other", E && "selected");
    }), w = y(() => {
      const k = v();
      return fe(k.other) !== "" || t.question.multiple && k.chosen.length > 0;
    }), S = y(() => Do(v().other)), V = `${t.qid}-other-err`, A = y(() => {
      const k = [];
      return S.value && k.push(V), u.value && k.push(`${t.qid}-err`), k.join(" ") || void 0;
    }), h = y(() => S.value || !!u.value);
    function C(k) {
      k.target.closest(".w-form__composer") || t.controller.requestFocus("other");
    }
    const L = U(0);
    ue(() => t.question.id, () => {
      if (t.question.multiple)
        return;
      const k = v(), E = k.useOther ? -1 : t.question.options.findIndex((j) => j.value === k.chosen[0]);
      L.value = E >= 0 ? E : 0;
    }, { immediate: !0 });
    function B(k) {
      if (t.question.multiple)
        return;
      const E = k.target?.dataset?.focus ?? "";
      E.startsWith("opt-") && (L.value = Number(E.slice(4)));
    }
    return (k, E) => (p(), b(X, null, [
      e.stale ? (p(), b("p", {
        key: 0,
        part: n.value.part,
        class: $(n.value.class)
      }, " Asked earlier. You can still answer; the assistant uses it as context and asks again before acting on the earlier request. ", 10, Qf)) : M("", !0),
      e.question.description ? (p(), b("p", {
        key: 1,
        part: r.value.part,
        class: $(r.value.class)
      }, [
        z(Be, {
          text: e.question.description
        }, null, 8, ["text"])
      ], 10, Xf)) : M("", !0),
      c.value ? (p(), b("p", {
        key: 2,
        part: a.value.part,
        class: $(a.value.class)
      }, N(c.value), 11, Jf)) : M("", !0),
      I("div", {
        part: o.value.part,
        class: $(o.value.class),
        role: e.question.multiple ? "group" : "radiogroup",
        "aria-labelledby": e.qid,
        "aria-describedby": `${e.qid}-err`,
        onFocusin: B
      }, [
        (p(!0), b(X, null, ce(e.question.options, (j, q) => (p(), F(Zf, {
          key: j.value,
          option: j,
          index: q,
          multiple: e.question.multiple,
          selected: e.question.multiple ? e.controller.ans(e.question).chosen.includes(j.value) : !e.controller.ans(e.question).useOther && e.controller.ans(e.question).chosen[0] === j.value,
          note: P(fe)(e.controller.ans(e.question).notes[j.value] || ""),
          editing: e.controller.ans(e.question).noteOpen === j.value,
          "note-draft": e.controller.ans(e.question).notes[j.value] || "",
          "key-label": f(q),
          "note-too-long": P(Zu)(e.controller.ans(e.question).notes[j.value] || ""),
          disabled: !!e.disabled,
          "roving-tabbable": q === L.value,
          onActivate: (K) => e.controller.activate(e.question, q),
          onToggleNote: (K) => e.controller.toggleNote(e.question, j.value),
          "onUpdate:noteDraft": (K) => e.controller.setNote(e.question, j.value, K),
          onSendNote: (K) => e.controller.sendNote(e.question, j.value),
          onEscapeNote: (K) => e.controller.toggleNote(e.question, j.value, !1)
        }, null, 8, ["option", "index", "multiple", "selected", "note", "editing", "note-draft", "key-label", "note-too-long", "disabled", "roving-tabbable", "onActivate", "onToggleNote", "onUpdate:noteDraft", "onSendNote", "onEscapeNote"]))), 128)),
        e.question.allow_other ? (p(), b("div", {
          key: 0,
          part: g.value.part,
          class: $(g.value.class),
          onClick: C
        }, [
          z(qo, {
            kind: "other",
            "model-value": v().other,
            placeholder: e.question.multiple ? "Add your own answer (optional). Enter sends." : "Type your own answer",
            label: "Your own answer",
            "send-label": e.question.multiple ? "Send the ticked answers" : "Send this answer",
            enabled: w.value && !e.disabled && !S.value,
            invalid: h.value,
            "described-by": A.value,
            "data-focus": "other",
            "onUpdate:modelValue": E[0] || (E[0] = (j) => {
              v().other = j;
            }),
            onSend: E[1] || (E[1] = (j) => e.controller.sendOther(e.question)),
            onEscape: E[2] || (E[2] = (j) => e.controller.requestFocus("card"))
          }, null, 8, ["model-value", "placeholder", "send-label", "enabled", "invalid", "described-by"]),
          m.value ? (p(), b("kbd", nm, N(m.value), 1)) : (p(), b("span", rm)),
          S.value ? (p(), b("p", {
            key: 2,
            id: V,
            part: s.value.part,
            class: $(s.value.class),
            role: "alert"
          }, " Use at most 2,000 characters. ", 10, om)) : M("", !0)
        ], 10, tm)) : M("", !0)
      ], 42, em),
      e.question.multiple && !e.question.allow_other ? (p(), b("div", {
        key: 3,
        part: i.value.part,
        class: $(i.value.class)
      }, [
        z(P(Se), {
          type: "button",
          part: l.value.part,
          class: $(l.value.class),
          "data-focus": "send",
          disabled: e.controller.ans(e.question).chosen.length === 0 || e.disabled,
          onClick: E[3] || (E[3] = (j) => e.controller.commit(e.question))
        }, {
          default: Z(() => [
            E[4] || (E[4] = oe(" Send ", -1)),
            z(P(Ce), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, am)) : M("", !0),
      u.value ? (p(), F(P($e), {
        key: 4,
        id: `${e.qid}-err`,
        severity: "error",
        variant: "simple",
        size: "small",
        part: s.value.part,
        class: $(s.value.class),
        role: "alert"
      }, {
        default: Z(() => [
          oe(N(u.value), 1)
        ]),
        _: 1
      }, 8, ["id", "part", "class"])) : (p(), b("p", {
        key: 5,
        id: `${e.qid}-err`,
        class: "hidden"
      }, null, 8, im)),
      I("p", {
        part: d.value.part,
        class: $(d.value.class)
      }, N(e.controller.keysText(e.question)), 11, sm)
    ], 64));
  }
}), um = ["part"], dm = ["part"], cm = { key: 0 }, pm = ["part"], Yo = /* @__PURE__ */ pe({
  __name: "question-card-answer-items",
  props: {
    items: {}
  },
  setup(e) {
    const t = e, n = y(() => _("answer-item")), r = y(() => _("answer-note")), a = y(() => _("answer-own"));
    return (o, i) => (p(!0), b(X, null, ce(t.items, (l, s) => (p(), b("span", {
      key: s,
      part: n.value.part,
      class: $(n.value.class)
    }, [
      l.own ? (p(), b(X, { key: 0 }, [
        I("span", {
          part: a.value.part,
          class: $(a.value.class)
        }, "Own answer: ", 10, dm),
        (p(!0), b(X, null, ce(P(Lo)(l.label), (d, c) => (p(), b(X, { key: c }, [
          c > 0 ? (p(), b("br", cm)) : M("", !0),
          oe(N(d), 1)
        ], 64))), 128))
      ], 64)) : (p(), F(Be, {
        key: 1,
        text: l.label
      }, null, 8, ["text"])),
      P(fe)(l.note || "") ? (p(), b("span", {
        key: 2,
        part: r.value.part,
        class: $(r.value.class)
      }, [
        z(P(Ce), {
          icon: "tabler:note",
          "aria-hidden": "true"
        }),
        I("span", null, N(P(fe)(l.note)), 1)
      ], 10, pm)) : M("", !0)
    ], 10, um))), 128));
  }
}), fm = ["part"], mm = ["part"], hm = ["part", "aria-label", "data-focus", "onClick"], bm = ["part"], vm = ["part"], gm = ["part"], ym = ["part"], wm = ["part"], km = ["part"], Sm = ["part"], xm = /* @__PURE__ */ pe({
  __name: "question-card-review",
  props: {
    definition: {},
    controller: {},
    disabled: { type: Boolean }
  },
  setup(e) {
    const t = e, n = y(() => _("review")), r = y(() => _("footer")), a = y(() => _("footer-text")), o = y(() => _("send-all")), i = y(() => _("keys")), l = y(() => _("review-number")), s = y(() => _("review-question")), d = y(() => _("review-answer")), c = y(() => _("answer-empty"));
    function u(g) {
      return _("review-item", g && "missing");
    }
    function f() {
      return _("review-edit");
    }
    const m = y(() => t.controller.missingRequired.value), v = y(() => {
      const g = m.value;
      return g.length === 0 ? "" : g.length === 1 ? `Question ${g[0].index + 1} still needs an answer.` : `Questions ${g.map((w) => w.index + 1).join(" and ")} still need answers.`;
    });
    return (g, w) => (p(), b(X, null, [
      I("ol", {
        part: n.value.part,
        class: $(n.value.class)
      }, [
        (p(!0), b(X, null, ce(e.definition.fields, (S, V) => (p(), b("li", {
          key: S.id,
          part: u(!e.controller.answerItemsFor(S) && S.required).part,
          class: $(u(!e.controller.answerItemsFor(S) && S.required).class)
        }, [
          I("button", {
            type: "button",
            part: f().part,
            class: $(f().class),
            "aria-label": `Question ${V + 1}: change the answer`,
            "data-focus": `review-item-${V}`,
            onClick: (A) => e.controller.go(V, "first")
          }, [
            I("span", {
              part: l.value.part,
              class: $(l.value.class),
              "aria-hidden": "true"
            }, N(V + 1), 11, bm),
            I("span", {
              part: s.value.part,
              class: $(s.value.class)
            }, [
              z(Be, {
                text: S.label
              }, null, 8, ["text"])
            ], 10, vm),
            I("span", {
              part: d.value.part,
              class: $(d.value.class)
            }, [
              e.controller.answerItemsFor(S) ? (p(), F(Yo, {
                key: 0,
                items: e.controller.answerItemsFor(S)
              }, null, 8, ["items"])) : S.required ? (p(), b(X, { key: 1 }, [
                oe(" Not answered yet ")
              ], 64)) : (p(), b("span", {
                key: 2,
                part: c.value.part,
                class: $(c.value.class)
              }, "Skipped", 10, ym))
            ], 10, gm)
          ], 10, hm)
        ], 10, mm))), 128))
      ], 10, fm),
      I("div", {
        part: r.value.part,
        class: $(r.value.class)
      }, [
        v.value ? (p(), b("p", {
          key: 0,
          part: a.value.part,
          class: $(a.value.class)
        }, N(v.value), 11, km)) : M("", !0),
        z(P(Se), {
          type: "button",
          part: o.value.part,
          class: $(o.value.class),
          "data-focus": "send-all",
          disabled: m.value.length > 0 || e.disabled,
          onClick: w[0] || (w[0] = (S) => e.controller.submitAll())
        }, {
          default: Z(() => [
            w[1] || (w[1] = oe(" Send answers ", -1)),
            z(P(Ce), {
              icon: "tabler:send-2",
              "aria-hidden": "true"
            })
          ]),
          _: 1
        }, 8, ["part", "class", "disabled"])
      ], 10, wm),
      I("p", {
        part: i.value.part,
        class: $(i.value.class)
      }, " Enter sends. Pick a row to change it. ← goes back to the last question. ", 10, Sm)
    ], 64));
  }
}), $m = ["part", "aria-busy"], Cm = {
  key: 0,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, Tm = {
  key: 1,
  role: "status",
  class: "text-xs text-muted-color m-0 mb-2"
}, Pm = ["part"], _m = ["part"], Om = { class: "flex items-center gap-2" }, Em = {
  "aria-live": "polite",
  class: "w-form__sr"
}, Dm = "You are offline. Your choices are kept.", Mm = "Sending your answer…", Am = /* @__PURE__ */ pe({
  __name: "question-card-active",
  props: {
    state: {},
    submitting: { type: Boolean },
    banner: {},
    offline: { type: Boolean }
  },
  emits: ["submit", "retry", "update:state", "update:collapsed"],
  setup(e, { expose: t, emit: n }) {
    const r = e, a = n, o = Tf(r.state.definition, r.state.data, (h) => {
      r.offline || r.submitting || a("submit", h);
    }), i = y(() => !!r.offline || r.submitting), l = `${Et()}-q`, s = U(null);
    ue(o.inReview, (h) => a("update:state", h ? "review" : "active"), { immediate: !0 }), ue(o.collapsed, (h) => a("update:collapsed", h), { immediate: !0 });
    const d = U({}), c = U([]);
    function u(h) {
      const C = [...c.value];
      return d.value[h] && C.push(d.value[h]), C.join(" ");
    }
    const f = y(() => new Set(r.state.definition.fields.map((h) => h.id))), m = y(() => {
      const h = Object.entries(d.value).filter(([C]) => !f.value.has(C)).map(([, C]) => C);
      return [...c.value, ...h].join(" ");
    });
    ue(
      () => Object.fromEntries(r.state.definition.fields.map((h) => [h.id, JSON.stringify(o.ans(h))])),
      (h, C) => {
        if (!C)
          return;
        const L = new Set(
          r.state.definition.fields.map((B) => B.id).filter((B) => h[B] !== C[B] && d.value[B])
        );
        L.size !== 0 && (d.value = Object.fromEntries(
          Object.entries(d.value).filter(([B]) => !L.has(B))
        ));
      },
      { deep: !0 }
    ), t({
      setServerErrors(h, C) {
        const L = {};
        for (const [k, E] of Object.entries(h ?? {}))
          L[k] = E.map((j) => j.message).join(" ");
        d.value = L, c.value = (C ?? []).map((k) => k.message);
        const B = r.state.definition.fields.findIndex((k) => L[k.id]);
        B >= 0 && o.go(B, "first");
      },
      retry() {
        a("submit", o.buildAnswers());
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
        return Object.values(o.answers).some(
          (h) => h.chosen.length > 0 || fe(h.other) !== "" || Object.values(h.notes).some((C) => fe(C) !== "")
        );
      }
    });
    const v = y(() => _("card")), g = y(() => _("title")), w = y(() => _("form-description"));
    function S(h) {
      const C = s.value;
      if (!C)
        return;
      let L = null;
      if (h === "card" ? L = C : h === "first" ? L = C.querySelector(".w-form__option--selected .w-form__option-main") ?? C.querySelector(".w-form__option-main, .w-form__other-input") : L = Array.from(C.querySelectorAll("[data-focus]")).find((B) => B.dataset.focus === h) ?? null, !!L && (L.focus(), L.tagName === "TEXTAREA")) {
        const B = L;
        B.setSelectionRange(B.value.length, B.value.length);
      }
    }
    ue(o.focusSeq, () => {
      Je(() => {
        const h = o.focusTarget.value;
        h && S(h);
      });
    });
    function V() {
      o.collapsed.value = !o.collapsed.value, o.requestFocus("card");
    }
    function A(h) {
      const C = h.composedPath()[0];
      if (C?.tagName === "TEXTAREA" || h.isComposing || h.ctrlKey || h.metaKey || h.altKey || o.collapsed.value || i.value)
        return;
      if (o.inReview.value) {
        h.key === "ArrowLeft" && (h.preventDefault(), o.go(o.n - 1, "first"));
        return;
      }
      const L = o.currentQuestion.value;
      if (!L)
        return;
      const B = o.ans(L), k = h.shiftKey ? /^Digit([1-9])$/.exec(h.code) : /^([1-9])$/.exec(h.key);
      if (k) {
        const q = Number(k[1]) - 1;
        if (q >= L.options.length + (L.allow_other ? 1 : 0))
          return;
        h.preventDefault(), h.shiftKey && q < L.options.length ? o.toggleNote(L, L.options[q].value, !0) : o.activate(L, q);
        return;
      }
      const E = C?.dataset?.focus ?? "", j = E.startsWith("opt-") ? Number(E.slice(4)) : -1;
      if (h.key === "ArrowDown" || h.key === "ArrowUp") {
        const q = Array.from(s.value?.querySelectorAll(".w-form__option-main, .w-form__other-input") ?? []);
        if (q.length === 0)
          return;
        h.preventDefault();
        const K = q.indexOf(C), H = h.key === "ArrowDown" ? (K + 1) % q.length : K <= 0 ? q.length - 1 : K - 1;
        q[H]?.focus();
        return;
      }
      if (o.multi && (h.key === "ArrowRight" || h.key === "ArrowLeft")) {
        h.preventDefault(), o.go(o.index.value + (h.key === "ArrowRight" ? 1 : -1), "first");
        return;
      }
      if ((h.key === "n" || h.key === "N") && j >= 0) {
        h.preventDefault(), o.toggleNote(L, L.options[j].value, !0);
        return;
      }
      if (j >= 0 && (h.key === " " || h.key === "Enter" && !L.multiple)) {
        h.preventDefault(), o.activate(L, j);
        return;
      }
      h.key === "Enter" && L.multiple && !C?.matches?.("button") && (h.preventDefault(), B.chosen.length > 0 || fe(B.other) ? o.commit(L) : (o.error.value = "Tick at least one answer, or type your own.", o.requestFocus(j >= 0 ? E : "first")));
    }
    return (h, C) => (p(), b("section", {
      ref_key: "cardRoot",
      ref: s,
      part: v.value.part,
      class: $(`w-form ${v.value.class}`),
      role: "group",
      "aria-labelledby": l,
      "aria-busy": e.submitting ? "true" : "false",
      tabindex: "-1",
      onKeydown: A
    }, [
      e.offline ? (p(), b("p", Cm, N(Dm))) : M("", !0),
      e.submitting ? (p(), b("p", Tm, N(Mm))) : M("", !0),
      m.value ? (p(), F(P($e), {
        key: 2,
        severity: "error",
        closable: !1
      }, {
        default: Z(() => [
          oe(N(m.value), 1)
        ]),
        _: 1
      })) : M("", !0),
      I("p", {
        part: g.value.part,
        class: $(g.value.class)
      }, [
        z(P(Ce), {
          icon: "tabler:messages",
          "aria-hidden": "true"
        }),
        oe(" " + N(e.state.definition.title), 1)
      ], 10, Pm),
      e.state.definition.description ? (p(), b("p", {
        key: 3,
        part: w.value.part,
        class: $(w.value.class)
      }, [
        z(Be, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, _m)) : M("", !0),
      z(Vf, {
        multi: P(o).multi,
        index: P(o).index.value,
        n: P(o).n,
        review: P(o).inReview.value,
        "question-text": P(o).currentQuestion.value?.label ?? "",
        collapsed: P(o).collapsed.value,
        qid: l,
        onPrev: C[0] || (C[0] = (L) => P(o).go(P(o).index.value - 1, "first")),
        onNext: C[1] || (C[1] = (L) => P(o).go(P(o).index.value + 1, "first")),
        onToggleCollapse: V
      }, null, 8, ["multi", "index", "n", "review", "question-text", "collapsed"]),
      e.banner ? (p(), F(P($e), {
        key: 4,
        severity: e.banner.retryable ? "warn" : "error",
        closable: !1
      }, {
        default: Z(() => [
          I("div", Om, [
            I("span", null, N(e.banner.message), 1),
            e.banner.retryable ? (p(), F(P(Se), {
              key: 0,
              type: "button",
              link: "",
              size: "small",
              onClick: C[2] || (C[2] = (L) => a("retry"))
            }, {
              default: Z(() => [...C[3] || (C[3] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            })) : M("", !0)
          ])
        ]),
        _: 1
      }, 8, ["severity"])) : M("", !0),
      P(o).collapsed.value ? M("", !0) : (p(), b(X, { key: 5 }, [
        P(o).inReview.value ? (p(), F(xm, {
          key: 0,
          definition: e.state.definition,
          controller: P(o),
          disabled: i.value
        }, null, 8, ["definition", "controller", "disabled"])) : P(o).currentQuestion.value ? (p(), F(lm, {
          key: 1,
          question: P(o).currentQuestion.value,
          controller: P(o),
          qid: l,
          stale: !!e.state.stale,
          "server-error": u(P(o).currentQuestion.value.id),
          disabled: i.value
        }, null, 8, ["question", "controller", "stale", "server-error", "disabled"])) : M("", !0)
      ], 64)),
      I("p", Em, N(P(o).liveMessage.value), 1)
    ], 42, $m));
  }
}), Im = ["part", "aria-label"], Vm = ["part"], Lm = ["part"], Bm = ["part"], Nm = ["part"], jm = ["part"], Fm = ["part"], Rm = ["part"], zm = ["part"], Hm = { key: 0 }, Um = { key: 1 }, qm = { key: 2 }, Ym = { key: 3 }, Km = { key: 4 }, Wm = /* @__PURE__ */ pe({
  __name: "question-card-summary",
  props: {
    state: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    function r(g) {
      if (!g)
        return null;
      const w = new Date(g);
      return Number.isNaN(w.getTime()) ? null : w.toLocaleString();
    }
    const a = y(() => _("card", "answered")), o = y(() => _("title")), i = y(() => _("form-description")), l = y(() => _("summary")), s = y(() => _("summary-item")), d = y(() => _("summary-question")), c = y(() => _("summary-answer")), u = y(() => _("answer-empty")), f = y(() => _("status"));
    function m(g) {
      const w = n.state.definition.fields.find((S) => S.id === g);
      return w ? Jn(w, n.state.data ? n.state.data[g] : void 0) : null;
    }
    const v = U(null);
    return t({
      /** Moves focus to the status text after a successful submit, so focus isn't lost when the form swaps to this read-only view. */
      focusStatus() {
        v.value?.focus();
      }
    }), (g, w) => (p(), b("section", {
      part: a.value.part,
      class: $(`w-form ${a.value.class}`),
      "aria-label": `${e.state.definition.title}, answered`
    }, [
      I("p", {
        part: o.value.part,
        class: $(o.value.class)
      }, [
        z(P(Ce), {
          icon: "tabler:circle-check",
          "aria-hidden": "true"
        }),
        oe(" " + N(e.state.definition.title), 1)
      ], 10, Vm),
      e.state.definition.description ? (p(), b("p", {
        key: 0,
        part: i.value.part,
        class: $(i.value.class)
      }, [
        z(Be, {
          text: e.state.definition.description
        }, null, 8, ["text"])
      ], 10, Lm)) : M("", !0),
      I("dl", {
        part: l.value.part,
        class: $(l.value.class)
      }, [
        (p(!0), b(X, null, ce(e.state.definition.fields, (S) => (p(), b("div", {
          key: S.id,
          part: s.value.part,
          class: $(s.value.class)
        }, [
          I("dt", {
            part: d.value.part,
            class: $(d.value.class)
          }, [
            z(Be, {
              text: S.label
            }, null, 8, ["text"])
          ], 10, jm),
          I("dd", {
            part: c.value.part,
            class: $(c.value.class)
          }, [
            m(S.id) ? (p(), F(Yo, {
              key: 0,
              items: m(S.id)
            }, null, 8, ["items"])) : (p(), b("span", {
              key: 1,
              part: u.value.part,
              class: $(u.value.class)
            }, "Skipped", 10, Rm))
          ], 10, Fm)
        ], 10, Nm))), 128))
      ], 10, Bm),
      I("div", {
        ref_key: "statusEl",
        ref: v,
        tabindex: "-1",
        part: f.value.part,
        class: $(f.value.class)
      }, [
        e.state.late ? (p(), b("p", Hm, " Late answer — this was answered after the conversation moved on. The assistant will confirm before acting on the earlier request. ")) : M("", !0),
        e.state.delivery === "pending" ? (p(), b("p", Um, " Submitted. Waiting for the assistant. ")) : e.state.delivery === "running" ? (p(), b("p", qm, " The assistant is reading your answer. ")) : e.state.delivery === "interrupted" ? (p(), b("p", Ym, " The assistant stopped before answering. Send a message to continue. ")) : M("", !0),
        r(e.state.submitted_at) ? (p(), b("p", Km, " Answered " + N(r(e.state.submitted_at)), 1)) : M("", !0)
      ], 10, zm)
    ], 10, Im));
  }
}), Gm = { class: "p-3 max-w-full min-w-0" }, Zm = {
  key: 0,
  class: "text-xs text-muted-color mb-2"
}, Qm = {
  key: 0,
  role: "status",
  class: "text-sm text-color mb-3"
}, Xm = {
  key: 6,
  "no-bg": "",
  title: "Loading form…"
}, Jm = { class: "flex items-center gap-2" }, eh = "Could not refresh this form. Showing what you last saw.", th = "This form was already answered elsewhere, so your draft was not saved. The saved answer is shown below.", nh = /* @__PURE__ */ pe({
  __name: "wippy-form",
  setup(e) {
    const t = Wl(), n = Zl(), r = Gl(), a = uu(), o = y(() => t.value.definition), i = y(() => t.value.state), l = y(() => i.value === "idle"), { status: s, state: d, errorMessage: c, reloadError: u, reload: f, refresh: m } = tu(a, i);
    Jl(d, m);
    const { submitting: v, submit: g } = lu(a), { isOnline: w } = cu(() => f()), S = U(null), V = U(!1);
    ue(a, () => {
      V.value = !1;
    });
    const A = U(null), h = U(null);
    let C = !1;
    ue(() => d.value?.status, (W, T) => {
      if (W !== "idle" || T !== "active")
        return;
      if (C) {
        C = !1;
        return;
      }
      (A.value?.hasUnsentInput?.() ?? !0) && (V.value = !0);
    });
    function L(W) {
      return !!W?.fields?.some((T) => !mu(T.type));
    }
    const B = y(() => {
      const W = t.value.formVersion;
      if (W !== void 0 && !Ur(W))
        return !0;
      const T = d.value?.form_version;
      return T !== void 0 && !Ur(T) ? !0 : L(o.value) || L(d.value?.definition);
    }), k = y(() => {
      const W = d.value;
      return W && bu(W) ? W : null;
    }), E = U("active"), j = U(!1), q = y(() => B.value || s.value === "unsupported" ? "unsupported" : d.value === null ? "loading" : d.value.status === "idle" ? "answered" : k.value ? E.value : "active"), K = y(() => !B.value && k.value !== null && d.value?.status === "active" && j.value);
    du(q, K);
    async function H(W) {
      if (!d.value)
        return;
      S.value = null;
      const T = await g(d.value.form_version, d.value.content_version, W);
      if (!T.ignored) {
        if (T.ok && T.accepted) {
          const G = T.accepted;
          C = !0, d.value = {
            ...d.value,
            status: "idle",
            stale: !1,
            late: G.late,
            content_version: G.content_version,
            data: W,
            answer_message_id: G.answer_message_id,
            delivery: G.delivery
          }, r("answer-submitted", { requestId: G.request_id, answerMessageId: G.answer_message_id, late: G.late }), Je(() => h.value?.focusStatus()), f();
          return;
        }
        if (T.fieldErrors || T.formErrors) {
          A.value?.setServerErrors(T.fieldErrors, T.formErrors);
          return;
        }
        if (T.code === "already_submitted") {
          V.value = !0, await m(), Je(() => h.value?.focusStatus());
          return;
        }
        T.shouldReload && f(), S.value = { message: T.message ?? "Could not submit this form.", retryable: T.retryable };
      }
    }
    function ee() {
      A.value?.retry();
    }
    return (W, T) => (p(), b("div", Gm, [
      P(n).length > 0 ? (p(), F(P($e), {
        key: 0,
        severity: "error",
        closable: !1
      }, {
        default: Z(() => [...T[2] || (T[2] = [
          oe(" Invalid form configuration. ", -1)
        ])]),
        _: 1
      })) : o.value ? B.value ? (p(), F(P($e), {
        key: 2,
        severity: "warn",
        closable: !1
      }, {
        default: Z(() => [...T[4] || (T[4] = [
          oe(" This form needs a newer version of the app. ", -1)
        ])]),
        _: 1
      })) : P(s) === "unsupported" ? (p(), F(kf, {
        key: 3,
        definition: o.value,
        answered: l.value
      }, null, 8, ["definition", "answered"])) : P(a) ? P(d) ? (p(), b(X, { key: 5 }, [
        P(u) ? (p(), b("p", Zm, N(eh))) : M("", !0),
        P(d).status === "active" && k.value ? (p(), F(Am, {
          key: P(a),
          ref_key: "activeFormRef",
          ref: A,
          state: k.value,
          submitting: P(v),
          banner: S.value,
          offline: !P(w),
          onSubmit: H,
          onRetry: ee,
          "onUpdate:state": T[0] || (T[0] = (G) => {
            E.value = G;
          }),
          "onUpdate:collapsed": T[1] || (T[1] = (G) => {
            j.value = G;
          })
        }, null, 8, ["state", "submitting", "banner", "offline"])) : P(d).status === "active" ? (p(), F(sf, {
          key: P(a),
          ref_key: "activeFormRef",
          ref: A,
          state: P(d),
          submitting: P(v),
          banner: S.value,
          offline: !P(w),
          onSubmit: H,
          onRetry: ee
        }, null, 8, ["state", "submitting", "banner", "offline"])) : P(d).status === "idle" ? (p(), b(X, { key: 3 }, [
          V.value ? (p(), b("p", Qm, N(th))) : M("", !0),
          k.value ? (p(), F(Wm, {
            key: P(a),
            ref_key: "idleFormRef",
            ref: h,
            state: k.value
          }, null, 8, ["state"])) : (p(), F(vf, {
            key: P(a),
            ref_key: "idleFormRef",
            ref: h,
            state: P(d)
          }, null, 8, ["state"]))
        ], 64)) : M("", !0)
      ], 64)) : P(s) === "loading" || P(s) === "idle" ? (p(), b("wippy-loading", Xm)) : P(s) === "error" ? (p(), F(P($e), {
        key: 7,
        severity: "error",
        closable: !1
      }, {
        default: Z(() => [
          I("div", Jm, [
            I("span", null, N(P(c) || "Could not load this form."), 1),
            z(P(Se), {
              type: "button",
              link: "",
              size: "small",
              onClick: P(f)
            }, {
              default: Z(() => [...T[5] || (T[5] = [
                oe(" Retry ", -1)
              ])]),
              _: 1
            }, 8, ["onClick"])
          ])
        ]),
        _: 1
      })) : M("", !0) : (p(), F(Cf, {
        key: 4,
        definition: o.value
      }, null, 8, ["definition"])) : (p(), F(P($e), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: Z(() => [...T[3] || (T[3] = [
          oe(" This form has no definition to render. ", -1)
        ])]),
        _: 1
      }))
    ]));
  }
}), rh = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}.container{width:100%}@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1280px}}@media(min-width:1536px){.container{max-width:1536px}}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.isolate{isolation:isolate}.m-0{margin:0}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.block{display:block}.inline{display:inline}.flex{display:flex}.table{display:table}.hidden{display:none}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.items-center{align-items:center}.gap-2{gap:.5rem}.rounded{border-radius:.25rem}.p-3{padding:.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.text-danger-600{--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-600) calc(100% * var(--tw-text-opacity, 1)),transparent)}.shadow{--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1);--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.blur{--tw-blur: blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.text-color{color:var(--p-text-color)}.text-muted-color{color:var(--p-text-muted-color)}@keyframes enter{0%{opacity:var(--p-enter-opacity, 1);transform:translate3d(var(--p-enter-translate-x, 0),var(--p-enter-translate-y, 0),0) scale3d(var(--p-enter-scale, 1),var(--p-enter-scale, 1),var(--p-enter-scale, 1)) rotate(var(--p-enter-rotate, 0))}}@keyframes leave{to{opacity:var(--p-leave-opacity, 1);transform:translate3d(var(--p-leave-translate-x, 0),var(--p-leave-translate-y, 0),0) scale3d(var(--p-leave-scale, 1),var(--p-leave-scale, 1),var(--p-leave-scale, 1)) rotate(var(--p-leave-rotate, 0))}}:host,[data-wippy-theme-root]{max-width:100%;overflow-wrap:break-word}:host{--_font: var(--wippy-form-font, inherit);--_size: var(--wippy-form-font-size, var(--_d-size));--_q-size: var(--wippy-form-question-size, var(--_d-q-size));--_q-weight: var(--wippy-form-question-weight, 600);--_small: var(--wippy-form-small-size, 13px);--_surface: var(--wippy-form-surface, transparent);--_border: var(--wippy-form-border, transparent);--_text: var(--wippy-form-text, var(--p-text-color));--_muted: var(--wippy-form-text-muted, var(--p-text-muted-color));--_row: var(--wippy-form-row, color-mix(in srgb, var(--p-content-hover-background) 45%, transparent));--_row-hover: var(--wippy-form-row-hover, var(--p-content-hover-background));--_accent: var(--wippy-form-accent, var(--p-primary-color));--_accent-soft: var(--wippy-form-accent-soft, var(--p-highlight-background));--_on-accent: var(--wippy-form-accent-contrast, var(--p-primary-contrast-color));--_danger: var(--wippy-form-danger, var(--p-danger-500, #b91c1c));--_focus: var(--wippy-form-focus, var(--_accent));--_key-border: var(--wippy-form-key-border, var(--p-content-border-color));--_code-bg: var(--wippy-form-code-bg, color-mix(in srgb, var(--p-text-color) 8%, transparent));--_radius: var(--wippy-form-radius, 12px);--_row-radius: var(--wippy-form-row-radius, 8px);--_pad: var(--wippy-form-padding, var(--_d-pad));--_row-py: var(--wippy-form-row-padding-y, var(--_d-row-py));--_row-px: var(--wippy-form-row-padding-x, var(--_d-row-px));--_gap: var(--wippy-form-gap, var(--_d-gap));--_key: var(--wippy-form-key-size, var(--_d-key));--_field-gap: var(--wippy-form-field-gap, var(--_d-field-gap));--_label-weight: var(--wippy-form-label-weight, 500);--_d-size: 14px;--_d-q-size: 15px;--_d-pad: 12px;--_d-row-py: 6px;--_d-row-px: 10px;--_d-gap: 4px;--_d-key: 20px;--_d-field-gap: 16px;display:block;container-type:inline-size}:host([density="comfortable"]){--_d-size: 15px;--_d-q-size: 17px;--_d-pad: 16px;--_d-row-py: 10px;--_d-row-px: 12px;--_d-gap: 6px;--_d-key: 24px;--_d-field-gap: 20px}.w-form{font-family:var(--_font);font-size:var(--_size);line-height:1.4;color:var(--_text);background:var(--_surface);border:1px solid var(--_border);border-radius:var(--_radius);padding:var(--_pad);outline:none;display:flex;flex-direction:column}.w-form:focus-visible,.w-form__status:focus-visible{outline:2px solid var(--_focus);outline-offset:2px}.w-form__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.w-form__code{font-family:ui-monospace,Cascadia Code,Consolas,monospace;font-size:.9em;background:var(--_code-bg);padding:0 .3em;border-radius:4px;overflow-wrap:anywhere}.w-form__title{margin:0 0 6px;font-size:var(--_small);color:var(--_muted);display:flex;gap:6px;align-items:center}.w-form__title svg{width:14px;height:14px;color:var(--_accent);flex:none}.w-form__form-description{margin:0 0 8px;font-size:var(--_small);color:var(--_muted)}.w-form__header{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"nav question actions";-moz-column-gap:10px;column-gap:10px;row-gap:6px;align-items:start}.w-form__header--single{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"question actions"}.w-form__nav{grid-area:nav;display:inline-flex;align-items:center;height:24px;border:1px solid var(--_border);border-radius:999px;background:var(--_row)}.w-form .w-form__prev,.w-form .w-form__next{color:var(--_muted)}.w-form .w-form__prev svg,.w-form .w-form__next svg{width:14px;height:14px}.w-form__counter{min-width:2.8em;text-align:center;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--_accent)}.w-form__question{grid-area:question;margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;max-width:72ch;overflow-wrap:anywhere}:host([collapsed]) .w-form__question{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__actions{grid-area:actions;display:flex;gap:2px}.w-form .w-form__collapse{color:var(--_muted)}.w-form__notice{margin:8px 0 0;padding:6px 8px;font-size:var(--_small);color:var(--_muted);background:var(--_row);border-radius:var(--_row-radius);max-width:72ch}.w-form__description,.w-form__hint{margin:4px 0 0;font-size:var(--_small);color:var(--_muted)}.w-form__options{display:grid;gap:var(--_gap);margin-top:8px}.w-form__option{display:grid;grid-template-columns:minmax(0,1fr) auto auto;-moz-column-gap:6px;column-gap:6px;align-items:center;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer}.w-form__option:hover{background:var(--_row-hover)}.w-form__option:has(.w-form__option-main:focus-visible){outline:2px solid var(--_focus);outline-offset:1px}.w-form__option--selected{background:var(--_accent-soft);border-color:var(--_accent)}.w-form__option--selected:hover{background:color-mix(in srgb,var(--_accent-soft) 85%,var(--_accent))}.w-form__option--other{grid-template-columns:minmax(0,1fr) auto;cursor:text}.w-form__option-main{display:grid;gap:1px;min-width:0;outline:none}.w-form__option-label{font-weight:500;overflow-wrap:anywhere;display:inline-flex;align-items:center;gap:7px}.w-form__option-description{font-size:var(--_small);color:var(--_muted);overflow-wrap:anywhere}.w-form__option-mark{display:inline-grid;place-items:center;color:var(--_accent);flex:none}span.w-form__option-mark{width:15px;height:15px}.w-form__option-mark svg{width:13px;height:13px;stroke-width:3}.w-form__option-note{display:flex;gap:5px;align-items:baseline;margin-top:2px;font-size:var(--_small);overflow-wrap:anywhere;white-space:pre-wrap;color:var(--_muted)}.w-form__option-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form .w-form__note-toggle{color:var(--_muted);opacity:0}.w-form__option:hover .w-form__note-toggle,.w-form__option:focus-within .w-form__note-toggle,.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{opacity:1}.w-form__option--has-note .w-form__note-toggle,.w-form__option--editing .w-form__note-toggle{color:var(--_accent)}@media(hover:none){.w-form .w-form__note-toggle{opacity:1}}.w-form__option-key{min-width:var(--_key);height:var(--_key);padding:0 4px;display:grid;place-items:center;font:500 12px/1 var(--_font);font-variant-numeric:tabular-nums;color:var(--_muted);border:1px solid var(--_key-border);border-radius:5px}.w-form__option--selected .w-form__option-key{background:var(--_accent);border-color:var(--_accent);color:var(--_on-accent)}.w-form__composer--note{grid-column:1 / -1;margin-top:6px}.w-form__note-input,.w-form__other-input{flex:1 1 auto;min-width:0;max-height:10em}.w-form__error{margin:6px 0 0}.w-form__error:not(.p-message){color:var(--_danger)}.w-form__keys{margin:8px 0 0;font-size:12px;color:var(--_muted)}.w-form__footer{display:flex;flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px 12px;margin-top:10px}.w-form__footer-text{margin:0 auto 0 0;font-size:var(--_small);color:var(--_danger)}.w-form__send,.w-form__send-all{gap:6px}.w-form__send-all svg{width:14px;height:14px}.w-form__review{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:var(--_gap)}.w-form__review-edit{width:100%;text-align:left;display:grid;grid-template-columns:auto minmax(0,1fr);-moz-column-gap:8px;column-gap:8px;row-gap:2px;padding:var(--_row-py) var(--_row-px);background:var(--_row);border:1px solid transparent;border-radius:var(--_row-radius);cursor:pointer;font:inherit;color:inherit}.w-form__review-edit:hover{background:var(--_row-hover)}.w-form__review-number{grid-row:1 / span 2;font-size:12px;font-weight:600;color:var(--_muted);font-variant-numeric:tabular-nums;padding-top:1px}.w-form__review-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-form__review-answer{font-weight:500}.w-form__review-item--missing .w-form__review-edit{border-color:var(--_danger)}.w-form__review-item--missing .w-form__review-answer{color:var(--_danger);font-weight:400}.w-form__answer-item{display:block;overflow-wrap:anywhere}.w-form__answer-note{display:flex;gap:5px;align-items:baseline;font-weight:400;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__answer-note svg{width:12px;height:12px;position:relative;top:1px;flex:none}.w-form__answer-empty,.w-form__answer-own{font-weight:400;color:var(--_muted)}.w-form__summary{margin:0;display:grid;gap:8px}.w-form__summary-item{display:grid;gap:1px}.w-form__summary-question{font-size:var(--_small);color:var(--_muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.w-form__summary-answer{margin:0;font-weight:500}.w-form__status{margin:10px 0 0;font-size:12px;color:var(--_muted)}.w-form__card--answered .w-form__title{font-size:var(--_q-size);font-weight:var(--_q-weight);color:var(--_text)}.w-form__card--answered .w-form__title svg{width:16px;height:16px;color:var(--_accent)}.w-form__fields{gap:var(--_field-gap)}.w-form__fields-title{margin:0;font-size:var(--_q-size);font-weight:var(--_q-weight);line-height:1.35;overflow-wrap:anywhere}.w-form__fields-error{list-style:none;margin:0;padding:0;font-size:var(--_small)}.w-form__field{display:flex;flex-direction:column;gap:6px;min-width:0;margin:0;padding:0;border:0}.w-form__field-label{padding:0;font-weight:var(--_label-weight);overflow-wrap:anywhere}.w-form__field-row{display:flex;align-items:flex-start;gap:8px}.w-form__field--inline .w-form__field-control{flex:none}.w-form__field-description{margin:0;font-size:var(--_small);color:var(--_muted)}.w-form__field-control{min-width:0}.w-form__field-value{margin:0;overflow-wrap:anywhere}.w-form__field-value--empty{color:var(--_muted)}.w-form__field-item{margin:0}.w-form__field-note{display:block;font-size:var(--_small);color:var(--_muted);white-space:pre-wrap}.w-form__field-error{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;font-size:var(--_small)}.w-form__field-options{display:flex;flex-direction:column;gap:6px}.w-form__field-option{display:flex;align-items:flex-start;gap:8px}.w-form__field-option-label{overflow-wrap:anywhere}.w-form__field-option-description{display:block;font-size:var(--_small);color:var(--_muted)}.w-form__field-other{display:flex;flex-direction:column;gap:4px;flex:1 1 auto;min-width:0}.w-form__field-calendar{min-width:0!important}@container (max-width: 520px){.w-form__header:not(.w-form__header--single){grid-template-columns:auto 1fr auto;grid-template-areas:"nav . actions" "question question question"}.w-form__keys{display:none}}@media(hover:none){.w-form__keys{display:none}}@media(prefers-reduced-motion:reduce){.w-form *{transition:none!important}}@media(prefers-color-scheme:dark){.dark\\:text-danger-400:not(.w-theme-light *):not(.w-theme-light){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}}.dark\\:text-danger-400:is(.w-theme-dark,.w-theme-dark *){--tw-text-opacity: 1;color:color-mix(in srgb,var(--p-danger-400) calc(100% * var(--tw-text-opacity, 1)),transparent)}';
class oh extends Js {
  static get wippyConfig() {
    return {
      propsSchema: tl.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: rh
    };
  }
  static get vueConfig() {
    return {
      rootComponent: nh,
      plugins: [Ts],
      providers(t, n) {
        t.provide(Wn, n);
      }
    };
  }
}
ka(import.meta.url, oh);
//# sourceMappingURL=index.js.map
