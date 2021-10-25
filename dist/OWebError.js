export default class OWebError extends Error {
    data;
    /**
     * OWebError constructor.
     *
     * @param message
     * @param data
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxLQUFLO0lBQ2xDLElBQUksQ0FBTTtJQUVuQjs7Ozs7T0FLRztJQUNILFlBQVksT0FBd0IsRUFBRSxPQUFZLEVBQUU7UUFDbkQsSUFBSSxPQUFPLFlBQVksS0FBSyxFQUFFO1lBQzdCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQztZQUVsQixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDdkI7YUFBTTtZQUNOLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVmLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLG1DQUFtQyxDQUFDO1lBQzlELElBQUksQ0FBQyxLQUFLLEdBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdHJlYWRvbmx5IGRhdGE6IGFueTtcblxuXHQvKipcblx0ICogT1dlYkVycm9yIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWVzc2FnZVxuXHQgKiBAcGFyYW0gZGF0YVxuXHQgKi9cblx0Y29uc3RydWN0b3IobWVzc2FnZT86IEVycm9yIHwgc3RyaW5nLCBkYXRhOiBhbnkgPSB7fSkge1xuXHRcdGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGNvbnN0IGUgPSBtZXNzYWdlO1xuXG5cdFx0XHRzdXBlcihlLm1lc3NhZ2UpO1xuXHRcdFx0dGhpcy5tZXNzYWdlID0gZS5tZXNzYWdlO1xuXHRcdFx0dGhpcy5zdGFjayAgID0gZS5zdGFjaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3VwZXIobWVzc2FnZSk7XG5cblx0XHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgJ1tPV2ViRXJyb3JdIHNvbWV0aGluZyB3ZW50IHdyb25nLic7XG5cdFx0XHR0aGlzLnN0YWNrICAgPSBuZXcgRXJyb3IoKS5zdGFjaztcblx0XHR9XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0fVxufVxuIl19