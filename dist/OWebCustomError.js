/**
 * OWeb custom error class.
 */
export default class OWebCustomError extends Error {
    constructor(message, data = {}) {
        super(message);
        this.data = data;
        if (arguments[0] instanceof Error) {
            const e = arguments[0];
            this.message = e.message;
            this.stack = e.stack;
        }
        else {
            this.message = message || '[OWebCustomError] something went wrong.';
            this.stack = new Error().stack;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1c3RvbUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXN0b21FcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sZUFBZ0IsU0FBUSxLQUFLO0lBR2pELFlBQVksT0FBWSxFQUFFLE9BQVksRUFBRTtRQUN2QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUU7WUFDbEMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDckI7YUFBTTtZQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLHlDQUF5QyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7U0FDL0I7SUFDRixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE9XZWIgY3VzdG9tIGVycm9yIGNsYXNzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ3VzdG9tRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdHJlYWRvbmx5IGRhdGE6IGFueTtcblxuXHRjb25zdHJ1Y3RvcihtZXNzYWdlOiBhbnksIGRhdGE6IGFueSA9IHt9KSB7XG5cdFx0c3VwZXIobWVzc2FnZSk7XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblxuXHRcdGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBFcnJvcikge1xuXHRcdFx0Y29uc3QgZSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdHRoaXMubWVzc2FnZSA9IGUubWVzc2FnZTtcblx0XHRcdHRoaXMuc3RhY2sgPSBlLnN0YWNrO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICdbT1dlYkN1c3RvbUVycm9yXSBzb21ldGhpbmcgd2VudCB3cm9uZy4nO1xuXHRcdFx0dGhpcy5zdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrO1xuXHRcdH1cblx0fVxufVxuIl19