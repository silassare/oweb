const FORMAT_REG = /ms|ss|ii|hh|mm|ll|A|a|s|i|H|h|y|Y|m|F|M|d|l|L|D/g;
export default class OWebDate {
    constructor(_appContext, date = new Date()) {
        this._appContext = _appContext;
        this.date = date;
    }
    /**
     * Format date with a given lang key.
     *
     * @param format
     */
    format(format) {
        const o = this.describe();
        return format.replace(FORMAT_REG, function (k) {
            return k in o ? o[k] : k;
        });
    }
    /**
     * Returns date description object.
     */
    describe() {
        const i18n = this._appContext.i18n, dayNamesShort = i18n.toHuman('OW_TIME_DAY_NAMES_SHORT').split(','), dayNamesFull = i18n.toHuman('OW_TIME_DAY_NAMES_FULL').split(','), monthNamesShort = i18n
            .toHuman('OW_TIME_MONTH_NAMES_SHORT')
            .split(','), monthNamesFull = i18n
            .toHuman('OW_TIME_MONTH_NAMES_FULL')
            .split(','), date = new Date(this.date), y = date.getYear(), Y = date.getFullYear(), m = date.getMonth(), mm = String(m < 9 ? '0' + (m + 1) : m + 1), d = date.getDate(), l = date.getDay(), ll = l + 1, // l? l : 7,
        L = dayNamesFull[l], D = dayNamesShort[l], M = monthNamesShort[m], F = monthNamesFull[m], H = date.getHours(), h = H === 12 ? 12 : H % 12, hh = String(m <= 9 ? '0' + m : m), i = date.getMinutes(), ii = String(i < 10 ? '0' + i : i), s = date.getSeconds(), ss = String(s < 10 ? '0' + s : s), ms = date.getMilliseconds(), a = H < 12 ? 'am' : 'pm', A = a.toUpperCase();
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
    setDate(date) {
        this.date = new Date(date);
        return this;
    }
    /**
     * Date getter.
     */
    getDate() {
        return this.date;
    }
    /**
     * Returns unix like timestamp.
     */
    static timestamp() {
        return Number(String(Date.now()).slice(0, -3));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9PV2ViRGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrREEsTUFBTSxVQUFVLEdBQUcsa0RBQWtELENBQUM7QUFFdEUsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBQzVCLFlBQ1MsV0FBb0IsRUFDcEIsT0FBbUIsSUFBSSxJQUFJLEVBQUU7UUFEN0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFDcEIsU0FBSSxHQUFKLElBQUksQ0FBeUI7SUFDbkMsQ0FBQztJQUVKOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsTUFBYztRQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFTLENBQUM7UUFDakMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7WUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDUCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFDakMsYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ2xFLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNoRSxlQUFlLEdBQUcsSUFBSTthQUNwQixPQUFPLENBQUMsMkJBQTJCLENBQUM7YUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNaLGNBQWMsR0FBRyxJQUFJO2FBQ25CLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQzthQUNuQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVB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XG4gKiBMICBUaGUgZGF5IG9mIHRoZSB3ZWVrIGZ1bGwgbmFtZVxuICogbCBUaGUgZGF5IG9mIHRoZSB3ZWVrIDAgdG8gNlxuICogbGwgVGhlIGRheSBvZiB0aGUgd2VlayAxIHRvIDdcbiAqIGQgVGhlIGRheSBvZiB0aGUgbW9udGhcbiAqIE0gVGhlIG5hbWUgb2YgdGhlIG1vbnRoIGluIHRocmVlIG9yIGZvdXIgbGV0dGVyc1xuICogRiBUaGUgZnVsbCBuYW1lIG9mIHRoZSBtb250aFxuICogbSBUaGUgbnVtYmVyIG9mIHRoZSBtb250aCAwIHRvIDExXG4gKiBtbSBUaGUgbnVtYmVyIG9mIHRoZSBtb250aCAwMSB0byAxMlxuICogWSBUaGUgeWVhciBpbiBmb3VyIGRpZ2l0c1xuICogeSBUaGUgeWVhciBpbiB0d28gZGlnaXRzXG4gKiBoIFRoZSBob3VyIHVzaW5nIDAgdG8gMTJcbiAqIEggVGhlIGhvdXIgdXNpbmcgMCB0byAyM1xuICogaSBUaGUgbWludXRlcyAwIHRvIDU5XG4gKiBzIFRoZSBzZWNvbmRzIDAgdG8gNTlcbiAqIGEgYW0gLyBwbSBEaXNwbGF5XG4gKiBBIEFNIC8gUE0gZGlzcGxheVxuICpcbiAqIGlpIFRoZSBtaW51dGVzIDAwLCAwMSwuLi4sIDU5XG4gKiBzcyBUaGUgc2Vjb25kcyAwMCwgMDEsLi4uLCA1OVxuICogaGggVGhlIGhvdXIgMDEsLi4uLCAxMlxuICovXG5pbXBvcnQgT1dlYkFwcCBmcm9tICcuLi9PV2ViQXBwJztcblxuZXhwb3J0IHR5cGUgT0RhdGVWYWx1ZSA9IERhdGUgfCBudW1iZXIgfCBzdHJpbmc7XG5leHBvcnQgdHlwZSBPRGF0ZURlc2MgPSB7XG5cdEQ6IHN0cmluZztcblx0TDogc3RyaW5nO1xuXHRsOiBudW1iZXI7XG5cdGxsOiBudW1iZXI7XG5cdGQ6IG51bWJlcjtcblx0TTogc3RyaW5nO1xuXHRGOiBzdHJpbmc7XG5cdG06IG51bWJlcjtcblx0bW06IHN0cmluZztcblx0WTogbnVtYmVyO1xuXHR5OiBudW1iZXI7XG5cdGg6IG51bWJlcjtcblx0aGg6IHN0cmluZztcblx0SDogbnVtYmVyO1xuXHRpOiBudW1iZXI7XG5cdGlpOiBzdHJpbmc7XG5cdHM6IG51bWJlcjtcblx0c3M6IHN0cmluZztcblx0bXM6IG51bWJlcjtcblx0YTogc3RyaW5nO1xuXHRBOiBzdHJpbmc7XG59O1xuXG5jb25zdCBGT1JNQVRfUkVHID0gL21zfHNzfGlpfGhofG1tfGxsfEF8YXxzfGl8SHxofHl8WXxtfEZ8TXxkfGx8THxEL2c7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJEYXRlIHtcblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBfYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRwcml2YXRlIGRhdGU6IE9EYXRlVmFsdWUgPSBuZXcgRGF0ZSgpLFxuXHQpIHt9XG5cblx0LyoqXG5cdCAqIEZvcm1hdCBkYXRlIHdpdGggYSBnaXZlbiBsYW5nIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1hdFxuXHQgKi9cblx0Zm9ybWF0KGZvcm1hdDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRjb25zdCBvID0gdGhpcy5kZXNjcmliZSgpIGFzIGFueTtcblx0XHRyZXR1cm4gZm9ybWF0LnJlcGxhY2UoRk9STUFUX1JFRywgZnVuY3Rpb24gKGspIHtcblx0XHRcdHJldHVybiBrIGluIG8gPyBvW2tdIDogaztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGRhdGUgZGVzY3JpcHRpb24gb2JqZWN0LlxuXHQgKi9cblx0ZGVzY3JpYmUoKTogT0RhdGVEZXNjIHtcblx0XHRjb25zdCBpMThuID0gdGhpcy5fYXBwQ29udGV4dC5pMThuLFxuXHRcdFx0ZGF5TmFtZXNTaG9ydCA9IGkxOG4udG9IdW1hbignT1dfVElNRV9EQVlfTkFNRVNfU0hPUlQnKS5zcGxpdCgnLCcpLFxuXHRcdFx0ZGF5TmFtZXNGdWxsID0gaTE4bi50b0h1bWFuKCdPV19USU1FX0RBWV9OQU1FU19GVUxMJykuc3BsaXQoJywnKSxcblx0XHRcdG1vbnRoTmFtZXNTaG9ydCA9IGkxOG5cblx0XHRcdFx0LnRvSHVtYW4oJ09XX1RJTUVfTU9OVEhfTkFNRVNfU0hPUlQnKVxuXHRcdFx0XHQuc3BsaXQoJywnKSxcblx0XHRcdG1vbnRoTmFtZXNGdWxsID0gaTE4blxuXHRcdFx0XHQudG9IdW1hbignT1dfVElNRV9NT05USF9OQU1FU19GVUxMJylcblx0XHRcdFx0LnNwbGl0KCcsJyksXG5cdFx0XHRkYXRlID0gbmV3IERhdGUodGhpcy5kYXRlKSxcblx0XHRcdHk6IG51bWJlciA9IChkYXRlIGFzIGFueSkuZ2V0WWVhcigpLFxuXHRcdFx0WTogbnVtYmVyID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxuXHRcdFx0bTogbnVtYmVyID0gZGF0ZS5nZXRNb250aCgpLFxuXHRcdFx0bW0gPSBTdHJpbmcobSA8IDkgPyAnMCcgKyAobSArIDEpIDogbSArIDEpLFxuXHRcdFx0ZDogbnVtYmVyID0gZGF0ZS5nZXREYXRlKCksXG5cdFx0XHRsOiBudW1iZXIgPSBkYXRlLmdldERheSgpLFxuXHRcdFx0bGw6IG51bWJlciA9IGwgKyAxLCAvLyBsPyBsIDogNyxcblx0XHRcdEw6IHN0cmluZyA9IGRheU5hbWVzRnVsbFtsXSxcblx0XHRcdEQ6IHN0cmluZyA9IGRheU5hbWVzU2hvcnRbbF0sXG5cdFx0XHRNOiBzdHJpbmcgPSBtb250aE5hbWVzU2hvcnRbbV0sXG5cdFx0XHRGOiBzdHJpbmcgPSBtb250aE5hbWVzRnVsbFttXSxcblx0XHRcdEg6IG51bWJlciA9IGRhdGUuZ2V0SG91cnMoKSxcblx0XHRcdGg6IG51bWJlciA9IEggPT09IDEyID8gMTIgOiBIICUgMTIsXG5cdFx0XHRoaCA9IFN0cmluZyhtIDw9IDkgPyAnMCcgKyBtIDogbSksXG5cdFx0XHRpOiBudW1iZXIgPSBkYXRlLmdldE1pbnV0ZXMoKSxcblx0XHRcdGlpID0gU3RyaW5nKGkgPCAxMCA/ICcwJyArIGkgOiBpKSxcblx0XHRcdHM6IG51bWJlciA9IGRhdGUuZ2V0U2Vjb25kcygpLFxuXHRcdFx0c3MgPSBTdHJpbmcocyA8IDEwID8gJzAnICsgcyA6IHMpLFxuXHRcdFx0bXM6IG51bWJlciA9IGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCksXG5cdFx0XHRhOiBzdHJpbmcgPSBIIDwgMTIgPyAnYW0nIDogJ3BtJyxcblx0XHRcdEE6IHN0cmluZyA9IGEudG9VcHBlckNhc2UoKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRELFxuXHRcdFx0TCxcblx0XHRcdGwsXG5cdFx0XHRsbCxcblx0XHRcdGQsXG5cdFx0XHRNLFxuXHRcdFx0Rixcblx0XHRcdG0sXG5cdFx0XHRtbSxcblx0XHRcdFksXG5cdFx0XHR5LFxuXHRcdFx0aCxcblx0XHRcdGhoLFxuXHRcdFx0SCxcblx0XHRcdGksXG5cdFx0XHRpaSxcblx0XHRcdHMsXG5cdFx0XHRzcyxcblx0XHRcdG1zLFxuXHRcdFx0YSxcblx0XHRcdEEsXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEYXRlIHNldHRlci5cblx0ICpcblx0ICogQHBhcmFtIGRhdGVcblx0ICovXG5cdHNldERhdGUoZGF0ZTogT0RhdGVWYWx1ZSk6IHRoaXMge1xuXHRcdHRoaXMuZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIERhdGUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0RGF0ZSgpOiBPRGF0ZVZhbHVlIHtcblx0XHRyZXR1cm4gdGhpcy5kYXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdW5peCBsaWtlIHRpbWVzdGFtcC5cblx0ICovXG5cdHN0YXRpYyB0aW1lc3RhbXAoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gTnVtYmVyKFN0cmluZyhEYXRlLm5vdygpKS5zbGljZSgwLCAtMykpO1xuXHR9XG59XG4iXX0=