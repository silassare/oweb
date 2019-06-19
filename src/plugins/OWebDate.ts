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
import OWebApp from "../OWebApp";

export type tDateValue = Date | number | string;
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

	constructor(private app_context: OWebApp, private date: tDateValue = new Date()) {
	}

	/**
	 * Format date with a given lang key.
	 *
	 * @param langKey
	 */
	format(langKey: string): string {
		return this.app_context.i18n.toHuman(langKey, this.describe());
	}

	/**
	 * Returns date description object.
	 */
	describe(): tDateDesc {
		let i18n              = this.app_context.i18n,
			day_names_short   = i18n.toHuman("OO_TIME_DAY_NAMES_SHORT").split(","),
			day_names_full    = i18n.toHuman("OO_TIME_DAY_NAMES_FULL").split(","),
			month_names_short = i18n.toHuman("OO_TIME_MONTH_NAMES_SHORT").split(","),
			month_names_full  = i18n.toHuman("OO_TIME_MONTH_NAMES_FULL").split(","),
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

	/**
	 * Date setter.
	 *
	 * @param date
	 */
	setDate(date: tDateValue): this {
		this.date = new Date(date);
		return this;
	}

	/**
	 * Date getter.
	 */
	getDate(): tDateValue {
		return this.date;
	}

	/**
	 * Returns unix like timestamp.
	 */
	static timestamp(): number {
		return Number(String(Date.now()).slice(0, -3));
	}
};