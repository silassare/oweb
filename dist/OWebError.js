export default class OWebError extends Error {
    /**
     * OWebError constructor.
     *
     * @param message
     * @param data
     */
    constructor(message, data = {}) {
        super(message);
        this.data = data;
        if (message instanceof Error) {
            const e = message;
            this.message = e.message;
            this.stack = e.stack;
        }
        else {
            this.message = message || '[OWebCustomError] something went wrong.';
            this.stack = new Error().stack;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxLQUFLO0lBRzNDOzs7OztPQUtHO0lBQ0gsWUFBWSxPQUFZLEVBQUUsT0FBWSxFQUFFO1FBQ3ZDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksT0FBTyxZQUFZLEtBQUssRUFBRTtZQUM3QixNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNyQjthQUFNO1lBQ04sSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUkseUNBQXlDLENBQUM7WUFDcEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztTQUMvQjtJQUNGLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJFcnJvciBleHRlbmRzIEVycm9yIHtcblx0cmVhZG9ubHkgZGF0YTogYW55O1xuXG5cdC8qKlxuXHQgKiBPV2ViRXJyb3IgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXNzYWdlXG5cdCAqIEBwYXJhbSBkYXRhXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihtZXNzYWdlOiBhbnksIGRhdGE6IGFueSA9IHt9KSB7XG5cdFx0c3VwZXIobWVzc2FnZSk7XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblxuXHRcdGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGNvbnN0IGUgPSBtZXNzYWdlO1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gZS5tZXNzYWdlO1xuXHRcdFx0dGhpcy5zdGFjayA9IGUuc3RhY2s7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgJ1tPV2ViQ3VzdG9tRXJyb3JdIHNvbWV0aGluZyB3ZW50IHdyb25nLic7XG5cdFx0XHR0aGlzLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG5cdFx0fVxuXHR9XG59XG4iXX0=