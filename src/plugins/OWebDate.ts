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

/*

 */
export type ODateValue = Date | number | string;

const FORMAT_REG =
	/(?<!\\)(?:\\\\)*(ms|ss|ii|hh|mm|ll|A|a|s|i|H|h|y|Y|m|F|M|d|l|L|D)/g;

export default class OWebDate {
	constructor(
		private _appContext: OWebApp,
		private date: ODateValue = new Date()
	) {}

	/**
	 * Format date with a given format.
	 */
	format(format = 'OW_TIME_DEFAULT_FORMAT', isLangKey = false): string {
		const o = this.describe() as any;

		if (isLangKey) {
			return this._appContext.i18n.toHuman(format, o);
		}

		return format.replace(FORMAT_REG, function stringChunkReplacer(...args) {
			return o[args[1]];
		});
	}

	fromNow(): string {
		return this.format(this.compare(this.date, Date.now()).format, true);
	}

	compare(_startDate: ODateValue, _endDate: ODateValue) {
		const startDate = new Date(_startDate);
		const endDate = new Date(_endDate);
		let format: string;

		const start = {
			time: startDate.getTime(),
			year: startDate.getFullYear(),
			month: startDate.getMonth(),
			date: startDate.getDate(),
			hour: startDate.getHours(),
			minute: startDate.getMinutes(),
		};
		const end = {
			time: endDate.getTime(),
			year: endDate.getFullYear(),
			month: endDate.getMonth(),
			date: endDate.getDate(),
			hour: endDate.getHours(),
			minute: endDate.getMinutes(),
		};

		const aSecond = 1000;
		const aMinute = 60 * aSecond;
		const anHour = 60 * aMinute;
		const aDay = 24 * anHour;
		const aWeek = 7 * aDay;

		const inPast = start.time > end.time;
		const msCount = Math.abs(start.time - end.time);
		const nSeconds = Math.floor(msCount / aSecond);
		const nMinutes = Math.floor(msCount / aMinute);
		const nHours = Math.floor(msCount / anHour);
		const nDays = Math.floor(msCount / aDay);
		const nWeeks = Math.floor(msCount / aWeek);
		const nMonths =
			Math.abs(end.year - start.year) * 12 + (end.month - start.month);
		const nYears = Math.floor(nMonths / 12);

		if (nSeconds < 5) {
			format = inPast ? 'OW_TIME_JUST_NOW' : 'OW_TIME_IN_FEW_SECONDS';
		} else if (nSeconds < 10) {
			format = inPast ? 'OW_TIME_FEW_SECONDS_AGO' : 'OW_TIME_IN_FEW_SECONDS';
		} else if (nSeconds < 55) {
			format = inPast ? 'OW_TIME_N_SECONDS_AGO' : 'OW_TIME_IN_N_SECONDS';
		} else if (nSeconds < 60) {
			format = inPast
				? 'OW_TIME_LESS_THAN_A_MINUTE_AGO'
				: 'OW_TIME_IN_LESS_THAN_A_MINUTE';
		} else if (nSeconds < 70) {
			format = inPast
				? 'OW_TIME_ABOUT_A_MINUTE_AGO'
				: 'OW_TIME_IN_ABOUT_A_MINUTE';
		} else if (nMinutes < 55) {
			format = inPast ? 'OW_TIME_N_MINUTES_AGO' : 'OW_TIME_IN_N_MINUTES';
		} else if (nMinutes < 70) {
			format = inPast
				? 'OW_TIME_ABOUT_AN_HOUR_AGO'
				: 'OW_TIME_IN_ABOUT_AN_HOUR';
		} else if (nHours < 24) {
			format = inPast ? 'OW_TIME_N_HOURS_AGO' : 'OW_TIME_IN_N_HOURS';
		} else if (nDays < 7) {
			format = inPast ? 'OW_TIME_N_DAYS_AGO' : 'OW_TIME_IN_N_DAYS';
		} else if (nWeeks < 4) {
			format = inPast ? 'OW_TIME_N_WEEKS_AGO' : 'OW_TIME_IN_N_WEEKS';
		} else if (nMonths < 12) {
			format = inPast ? 'OW_TIME_N_MONTHS_AGO' : 'OW_TIME_IN_N_MONTHS';
		} else {
			format = inPast ? 'OW_TIME_N_YEARS_AGO' : 'OW_TIME_IN_N_YEARS';
		}

		// used in an elapse time or duration counter
		const cSeconds = Math.floor((msCount / aSecond) % 60);
		const cMinutes = Math.floor((msCount / aMinute) % 60);
		const cHours = Math.floor((msCount / anHour) % 24);
		const cDays = Math.floor(msCount / aDay);

		return {
			format,
			nSeconds,
			nMinutes,
			nHours,
			nDays,
			nWeeks,
			nMonths,
			nYears,
			inPast,
			cDays,
			cHours,
			cMinutes,
			cSeconds,
		};
	}

	/**
	 * Returns date description object.
	 */
	describe() {
		const i18n = this._appContext.i18n,
			dayNamesShort = i18n.toHuman('OW_TIME_DAY_NAMES_SHORT').split(','),
			dayNamesFull = i18n.toHuman('OW_TIME_DAY_NAMES_FULL').split(','),
			monthNamesShort = i18n.toHuman('OW_TIME_MONTH_NAMES_SHORT').split(','),
			monthNamesFull = i18n.toHuman('OW_TIME_MONTH_NAMES_FULL').split(','),
			date = new Date(this.date),
			y: number = (date as any).getYear(),
			Y: number = date.getFullYear(),
			m: number = date.getMonth(),
			mm = String(m < 9 ? '0' + (m + 1) : m + 1),
			d: number = date.getDate(),
			l: number = date.getDay(),
			ll: number = l + 1, // l? l : 7,
			L: string = dayNamesFull[l],
			D: string = dayNamesShort[l],
			M: string = monthNamesShort[m],
			F: string = monthNamesFull[m],
			H: number = date.getHours(),
			h: number = H === 12 ? 12 : H % 12,
			hh = String(m <= 9 ? '0' + m : m),
			i: number = date.getMinutes(),
			ii = String(i < 10 ? '0' + i : i),
			s: number = date.getSeconds(),
			ss = String(s < 10 ? '0' + s : s),
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
			...this.compare(this.date, Date.now()),
		};
	}

	/**
	 * Date setter.
	 *
	 * @param date
	 */
	setDate(date: ODateValue): this {
		this.date = new Date(date);
		return this;
	}

	/**
	 * Date getter.
	 */
	getDate(): ODateValue {
		return this.date;
	}

	/**
	 * Returns unix like timestamp.
	 */
	static timestamp(): number {
		return Number(String(Date.now()).slice(0, -3));
	}
}
