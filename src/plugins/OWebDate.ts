/**
 * D The day of the week short name
 * L  The day of the week full name
 * l The day of the week 0 to 6
 * ll The day of the week 1 to 7
 * d The day of the month
 * M The name of the month in three or four letters
 * F The full name of the month
 * m The number of the month 0 to 11
 * mm The number of the month 01 to 12
 * Y The year in four digits
 * y The year in two digits
 * h The hour using 0 to 12
 * H The hour using 0 to 23
 * i The minutes 0 to 59
 * s The seconds 0 to 59
 * a am / pm Display
 * A AM / PM display
 *
 * ii The minutes 00, 01,..., 59
 * ss The seconds 00, 01,..., 59
 * hh The hour 01,..., 12
 */
import OWebApp from '../OWebApp';

export type tDateValue = Date | number | string;
export type tDateDesc = {
	D: string;
	L: string;
	l: number;
	ll: number;
	d: number;
	M: string;
	F: string;
	m: number;
	mm: string;
	Y: number;
	y: number;
	h: number;
	hh: string;
	H: number;
	i: number;
	ii: string;
	s: number;
	ss: string;
	ms: number;
	a: string;
	A: string;
};

const FORMAT_REG = /ms|ss|ii|hh|mm|ll|A|a|s|i|H|h|y|Y|m|F|M|d|l|L|D/g;

export default class OWebDate {
	constructor(
		private appContext: OWebApp,
		private date: tDateValue = new Date(),
	) {}

	/**
	 * Format date with a given lang key.
	 *
	 * @param format
	 */
	format(format: string): string {
		const o = this.describe() as any;
		return format.replace(FORMAT_REG, function (k) {
			return k in o ? o[k] : k;
		});
	}

	/**
	 * Returns date description object.
	 */
	describe(): tDateDesc {
		const i18n = this.appContext.i18n,
			dayNamesShort = i18n.toHuman('OW_TIME_DAY_NAMES_SHORT').split(','),
			dayNamesFull = i18n.toHuman('OW_TIME_DAY_NAMES_FULL').split(','),
			monthNamesShort = i18n
				.toHuman('OW_TIME_MONTH_NAMES_SHORT')
				.split(','),
			monthNamesFull = i18n
				.toHuman('OW_TIME_MONTH_NAMES_FULL')
				.split(','),
			date = new Date(this.date),
			y: number = (date as any).getYear(),
			Y: number = date.getFullYear(),
			m: number = date.getMonth(),
			mm: string = String(m < 9 ? '0' + (m + 1) : m + 1),
			d: number = date.getDate(),
			l: number = date.getDay(),
			ll: number = l + 1, // l? l : 7,
			L: string = dayNamesFull[l],
			D: string = dayNamesShort[l],
			M: string = monthNamesShort[m],
			F: string = monthNamesFull[m],
			H: number = date.getHours(),
			h: number = H === 12 ? 12 : H % 12,
			hh: string = String(m <= 9 ? '0' + m : m),
			i: number = date.getMinutes(),
			ii: string = String(i < 10 ? '0' + i : i),
			s: number = date.getSeconds(),
			ss: string = String(s < 10 ? '0' + s : s),
			ms: number = date.getMilliseconds(),
			a: string = H < 12 ? 'am' : 'pm',
			A: string = a.toUpperCase();

		return {
			D,
			L,
			l,
			ll,
			d,
			M,
			F,
			m,
			mm,
			Y,
			y,
			h,
			hh,
			H,
			i,
			ii,
			s,
			ss,
			ms,
			a,
			A,
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
}
