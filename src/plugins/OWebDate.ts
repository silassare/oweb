import OWebLang from "../OWebLang";
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
 * // OWebDate
 * ii The minutes 00, 01,..., 59
 * ss The seconds 00, 01,..., 59
 */
import Utils from "../utils/Utils";

export type tDateDesc = {
	D: string,
	l: number,
	L: string,
	ll: number,
	LL: string,
	d: number,
	M: string,
	F: string,
	m: number,
	mm: string,
	Y: number,
	y: number,
	h: number,
	H: number,
	i: number,
	ii: string,
	s: number,
	ss: string,
	ms: number,
	a: string,
	A: string
};
export default class OWebDate {

	constructor(private readonly date: string) {
	}

	format(langKey: string, langCode: string): string {
		return OWebLang.toHuman(langKey, this.describe(langCode), langCode);
	}

	describe(langCode?: string): tDateDesc {
		let day_names_short   = OWebLang.toHuman("OO_TIME_DAY_NAMES_SHORT", langCode).split(","),
			day_names_full    = OWebLang.toHuman("OO_TIME_DAY_NAMES_FULL", langCode).split(","),
			month_names_short = OWebLang.toHuman("OO_TIME_MONTH_NAMES_SHORT", langCode).split(","),
			month_names_full  = OWebLang.toHuman("OO_TIME_MONTH_NAMES_FULL", langCode).split(","),
			date              = new Date(this.date),
			y: number         = (date as any).getYear(),
			Y: number         = date.getFullYear(),
			m: number         = date.getMonth(),
			mm: string        = String(m < 9 ? "0" + (m + 1) : m + 1),
			d: number         = date.getDate(),
			l: number         = date.getDay(),
			ll: number        = l + 1,// l? l : 7,
			L: string         = day_names_full[l],
			LL: string        = day_names_full[l],
			D: string         = day_names_short[l],
			M: string         = month_names_short[m],
			F: string         = month_names_full[m],
			H: number         = date.getHours(),
			i: number         = date.getMinutes(),
			ii: string        = String(i < 10 ? "0" + i : i),
			s: number         = date.getSeconds(),
			ss: string        = String(s < 10 ? "0" + s : s),
			ms: number        = date.getMilliseconds(),
			h: number         = (H === 12) ? 12 : H % 12,
			a: string         = (H < 12) ? "am" : "pm",
			A: string         = a.toUpperCase();

		return {
			D : D,
			l : l,
			L : L,
			ll: ll,
			LL: LL,
			d : d,
			M : M,
			F : F,
			m : m,
			mm: mm,
			Y : Y,
			y : y,
			h : h,
			H : H,
			i : i,
			ii: ii,
			s : s,
			ss: ss,
			ms: ms,
			a : a,
			A : A
		};
	}

	static fromInputValue(date_str: string): OWebDate | false {
		let val   = date_str.replace(/ /g, ""),
			reg_a = /^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/,// standard
			reg_b = /^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/;// when browser threat date field as text field (in firefox)

		if (reg_a.test(val)) {
			return new OWebDate(date_str);
		}
		if (reg_b.test(val)) {
			return new OWebDate(`${RegExp.$3}-${RegExp.$2}-${RegExp.$1}`);
		}

		return false;
	}

	static timestamp(): number {
		return Number(String(Date.now()).slice(0, -3));
	}
};

OWebLang.addPlugin("oweb_date", function (data: any = {}, langCode: string) {
	if (data["owebDate"]) {
		let t = new OWebDate(data["owebDate"]);
		return Utils.assign(data, t.describe(langCode));
	}

	return data;
}).setLangData("fr", {
	"OO_TIME_DAY_NAMES_SHORT"  : "dim.,lun.,mar.,mer.,jeu.,ven.,sam.",
	"OO_TIME_DAY_NAMES_FULL"   : "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
	"OO_TIME_MONTH_NAMES_SHORT": "janv.,f\xe9vr.,mars,avr.,mai,juin,juil.,ao\xfbt,sept.,oct.,nov.,d\xe9c.",
	"OO_TIME_MONTH_NAMES_FULL" : "janvier,f\xe9vrier,mars,avril,mai,juin,juillet,ao\xfbt,septembre,octobre,novembre,d\xe9cembre"
}).setLangData("en", {
	"OO_TIME_DAY_NAMES_SHORT"  : "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
	"OO_TIME_DAY_NAMES_FULL"   : "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
	"OO_TIME_MONTH_NAMES_SHORT": "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
	"OO_TIME_MONTH_NAMES_FULL" : "January,February,March,April,May,June,July,August,September,October,November,December"
});