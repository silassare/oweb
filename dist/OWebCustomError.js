/**
 * OWeb custom error class.
 */
export default class OWebCustomError extends Error {
    constructor(message, data = {}) {
        super(message);
        this.data = data;
        if (arguments[0] instanceof Error) {
            let e = arguments[0];
            this.message = e.message;
            this.stack = e.stack;
        }
        else {
            this.message = message || "[OWebCustomError] something went wrong.";
            this.stack = (new Error()).stack;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1c3RvbUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXN0b21FcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLHNCQUF1QixTQUFRLEtBQUs7SUFHakQsWUFBWSxPQUFZLEVBQUUsT0FBWSxFQUFFO1FBQ3ZDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsR0FBVSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUN2QjthQUFNO1lBQ04sSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUkseUNBQXlDLENBQUM7WUFDcEUsSUFBSSxDQUFDLEtBQUssR0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDbkM7SUFDRixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE9XZWIgY3VzdG9tIGVycm9yIGNsYXNzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ3VzdG9tRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdHJlYWRvbmx5IGRhdGE6IGFueTtcblxuXHRjb25zdHJ1Y3RvcihtZXNzYWdlOiBhbnksIGRhdGE6IGFueSA9IHt9KSB7XG5cdFx0c3VwZXIobWVzc2FnZSk7XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblxuXHRcdGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBFcnJvcikge1xuXHRcdFx0bGV0IGUgICAgICAgID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gZS5tZXNzYWdlO1xuXHRcdFx0dGhpcy5zdGFjayAgID0gZS5zdGFjaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCBcIltPV2ViQ3VzdG9tRXJyb3JdIHNvbWV0aGluZyB3ZW50IHdyb25nLlwiO1xuXHRcdFx0dGhpcy5zdGFjayAgID0gKG5ldyBFcnJvcigpKS5zdGFjaztcblx0XHR9XG5cdH1cbn0iXX0=