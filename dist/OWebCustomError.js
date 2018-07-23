"use strict";
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
    getData() {
        return this.data;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1c3RvbUVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXN0b21FcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixNQUFNLENBQUMsT0FBTyxzQkFBdUIsU0FBUSxLQUFLO0lBR2pELFlBQVksT0FBWSxFQUFFLE9BQVksRUFBRTtRQUN2QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEdBQVUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDdkI7YUFBTTtZQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLHlDQUF5QyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxLQUFLLEdBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ25DO0lBQ0YsQ0FBQztJQUVELE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUNEIn0=