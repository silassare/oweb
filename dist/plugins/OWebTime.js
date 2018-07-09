"use strict";
/**
 * D The day of the week in three letters
 * l (L lowercase) The entire day of the week 0 to 6
 * ll (LL lowercase) The entire day of the week 1 to 7
 * d The day of the month
 * M The name of the month in three or four letters
 * F The full name of the month
 * m The number of the month 0 to 11
 * mm The number of the month 01 to 12
 * Y The year in four digits
 * y The year in two digits
 * h Time from 0 to 12
 * H Time from 0 to 23
 * i The minutes 0 to 59
 * s The seconds 0 to 59
 * a am / pm Display
 * A AM / PM display
 *
 * // OWebTime
 * ii The minutes 00, 01,..., 59
 * ss The seconds 00, 01,..., 59
 */
import Utils from "../utils/Utils";
import OWebLang from "../OWebLang";
export default class OWebTime {
    constructor(time) {
        this.time = time;
    }
    format(langKey, langCode) {
        return OWebLang.toHuman(langKey, this.describe(langCode), langCode);
    }
    describe(langCode) {
        let day_names_short = OWebLang.toHuman("OO_TIME_DAY_NAMES_SHORT", langCode).split(","), day_names_full = OWebLang.toHuman("OO_TIME_DAY_NAMES_FULL", langCode).split(","), month_names_short = OWebLang.toHuman("OO_TIME_MONTH_NAMES_SHORT", langCode).split(","), month_names_full = OWebLang.toHuman("OO_TIME_MONTH_NAMES_FULL", langCode).split(","), date = new Date(this.time), y = date.getYear(), Y = date.getFullYear(), m = date.getMonth(), mm = String(m < 9 ? "0" + (m + 1) : m + 1), d = date.getDate(), l = date.getDay(), ll = l + 1, // l? l : 7,
        L = day_names_full[l], LL = day_names_full[l], D = day_names_short[l], M = month_names_short[m], F = month_names_full[m], H = date.getHours(), i = date.getMinutes(), ii = String(i < 10 ? "0" + i : i), s = date.getSeconds(), ss = String(s < 10 ? "0" + s : s), ms = date.getMilliseconds(), h = (H === 12) ? 12 : H % 12, a = (H < 12) ? "am" : "pm", A = a.toUpperCase();
        return {
            D: D,
            l: l,
            L: L,
            ll: ll,
            LL: LL,
            d: d,
            M: M,
            F: F,
            m: m,
            mm: mm,
            Y: Y,
            y: y,
            h: h,
            H: H,
            i: i,
            ii: ii,
            s: s,
            ss: ss,
            ms: ms,
            a: a,
            A: A
        };
    }
}
;
OWebLang.addPlugin("oweb_time", function (data = {}, langCode) {
    if (data["owebTime"]) {
        let t = new OWebTime(data["owebTime"]);
        return Utils.assign(data, t.describe(langCode));
    }
    return data;
}).setLangData("fr", {
    "OO_TIME_DAY_NAMES_SHORT": "dim.,lun.,mar.,mer.,jeu.,ven.,sam.",
    "OO_TIME_DAY_NAMES_FULL": "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
    "OO_TIME_MONTH_NAMES_SHORT": "janv.,f\xe9vr.,mars,avr.,mai,juin,juil.,ao\xfbt,sept.,oct.,nov.,d\xe9c.",
    "OO_TIME_MONTH_NAMES_FULL": "janvier,f\xe9vrier,mars,avril,mai,juin,juillet,ao\xfbt,septembre,octobre,novembre,d\xe9cembre"
}).setLangData("en", {
    "OO_TIME_DAY_NAMES_SHORT": "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
    "OO_TIME_DAY_NAMES_FULL": "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    "OO_TIME_MONTH_NAMES_SHORT": "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
    "OO_TIME_MONTH_NAMES_FULL": "January,February,March,April,May,June,July,August,September,October,November,December"
});
//# sourceMappingURL=OWebTime.js.map