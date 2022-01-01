export default class OWebError extends Error {
    data;
    constructor(message, data = {}) {
        if (message instanceof Error) {
            const e = message;
            super(e.message);
            this.message = e.message;
            this.stack = e.stack;
        }
        else {
            super(message);
            this.message = message || '[OWebError] something went wrong.';
            this.stack = new Error().stack;
        }
        this.data = data;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxLQUFLO0lBQ2xDLElBQUksQ0FBTTtJQVFuQixZQUFZLE9BQXdCLEVBQUUsT0FBWSxFQUFFO1FBQ25ELElBQUksT0FBTyxZQUFZLEtBQUssRUFBRTtZQUM3QixNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7WUFFbEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ3JCO2FBQU07WUFDTixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxtQ0FBbUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRyZWFkb25seSBkYXRhOiBhbnk7XG5cblx0LyoqXG5cdCAqIE9XZWJFcnJvciBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIG1lc3NhZ2Vcblx0ICogQHBhcmFtIGRhdGFcblx0ICovXG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBFcnJvciB8IHN0cmluZywgZGF0YTogYW55ID0ge30pIHtcblx0XHRpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG5cdFx0XHRjb25zdCBlID0gbWVzc2FnZTtcblxuXHRcdFx0c3VwZXIoZS5tZXNzYWdlKTtcblx0XHRcdHRoaXMubWVzc2FnZSA9IGUubWVzc2FnZTtcblx0XHRcdHRoaXMuc3RhY2sgPSBlLnN0YWNrO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdXBlcihtZXNzYWdlKTtcblxuXHRcdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnW09XZWJFcnJvcl0gc29tZXRoaW5nIHdlbnQgd3JvbmcuJztcblx0XHRcdHRoaXMuc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaztcblx0XHR9XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0fVxufVxuIl19