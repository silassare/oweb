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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1c3RvbUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXN0b21FcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sZUFBZ0IsU0FBUSxLQUFLO0lBR2pELFlBQVksT0FBWSxFQUFFLE9BQVksRUFBRTtRQUN2QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEdBQVUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDdkI7YUFBTTtZQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLHlDQUF5QyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxLQUFLLEdBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ25DO0lBQ0YsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBPV2ViIGN1c3RvbSBlcnJvciBjbGFzcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkN1c3RvbUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRyZWFkb25seSBkYXRhOiBhbnk7XG5cblx0Y29uc3RydWN0b3IobWVzc2FnZTogYW55LCBkYXRhOiBhbnkgPSB7fSkge1xuXHRcdHN1cGVyKG1lc3NhZ2UpO1xuXHRcdHRoaXMuZGF0YSA9IGRhdGE7XG5cblx0XHRpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGxldCBlICAgICAgICA9IGFyZ3VtZW50c1swXTtcblx0XHRcdHRoaXMubWVzc2FnZSA9IGUubWVzc2FnZTtcblx0XHRcdHRoaXMuc3RhY2sgICA9IGUuc3RhY2s7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJbT1dlYkN1c3RvbUVycm9yXSBzb21ldGhpbmcgd2VudCB3cm9uZy5cIjtcblx0XHRcdHRoaXMuc3RhY2sgICA9IChuZXcgRXJyb3IoKSkuc3RhY2s7XG5cdFx0fVxuXHR9XG59Il19