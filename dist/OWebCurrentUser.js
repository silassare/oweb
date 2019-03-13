import OWebEvent from "./OWebEvent";
import OWebKeyStorage from "./OWebKeyStorage";
import Utils from "./utils/Utils";
export default class OWebCurrentUser extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this._key_store = new OWebKeyStorage(app_context, OWebCurrentUser.SELF);
        console.log("[OWebCurrentUser] ready!");
    }
    /**
     * Returns current user data.
     */
    getCurrentUser() {
        let user = this._key_store.getItem("user_data");
        if (user) {
            if ("id" in user) {
                return user;
            }
            else {
                console.error("[OWebCurrentUser] invalid user data!");
            }
        }
        return undefined;
    }
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrentUser(user) {
        console.log("[OWebCurrentUser] setting new user ->", user);
        this._key_store.setItem("user_data", user);
        return this._notifyChange();
    }
    /**
     * Sets current user session expire time.
     *
     * @param expire
     */
    setSessionExpire(expire) {
        this._key_store.setItem("session_expire", expire);
        return this;
    }
    /**
     * Returns current user session expire time.
     */
    getSessionExpire() {
        let expire = this._key_store.getItem("session_expire");
        return isNaN(expire) ? 0 : expire;
    }
    /**
     * Clear user data.
     */
    clear() {
        this._key_store.clear();
        return this._notifyChange();
    }
    /**
     * Trigger notification for user data change.
     *
     * @private
     */
    _notifyChange() {
        this.trigger(OWebCurrentUser.EVT_USER_DATA_UPDATE, [this]);
        return this;
    }
}
OWebCurrentUser.SELF = Utils.id();
OWebCurrentUser.EVT_USER_DATA_UPDATE = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBRWxDLE1BQU0sQ0FBQyxPQUFPLHNCQUF1QixTQUFRLFNBQVM7SUFNckQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFHaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjO1FBQ2IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFaEQsSUFBSSxJQUFJLEVBQUU7WUFDVCxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2FBQ3REO1NBQ0Q7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxJQUFTO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNDLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZ0JBQWdCLENBQUMsTUFBYztRQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQjtRQUNmLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYTtRQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDOztBQTNFZSxvQkFBSSxHQUFtQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDbEMsb0NBQW9CLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4vT1dlYkFwcFwiO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xyXG5pbXBvcnQgT1dlYktleVN0b3JhZ2UgZnJvbSBcIi4vT1dlYktleVN0b3JhZ2VcIjtcclxuaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ3VycmVudFVzZXIgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGICAgICAgICAgICAgICAgICA9IFV0aWxzLmlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9VU0VSX0RBVEFfVVBEQVRFID0gVXRpbHMuaWQoKTtcclxuXHJcblx0cHJpdmF0ZSBfa2V5X3N0b3JlOiBPV2ViS2V5U3RvcmFnZTtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl9rZXlfc3RvcmUgPSBuZXcgT1dlYktleVN0b3JhZ2UoYXBwX2NvbnRleHQsIE9XZWJDdXJyZW50VXNlci5TRUxGKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJDdXJyZW50VXNlcl0gcmVhZHkhXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKi9cclxuXHRnZXRDdXJyZW50VXNlcigpOiBhbnkge1xyXG5cdFx0bGV0IHVzZXIgPSB0aGlzLl9rZXlfc3RvcmUuZ2V0SXRlbShcInVzZXJfZGF0YVwiKTtcclxuXHJcblx0XHRpZiAodXNlcikge1xyXG5cdFx0XHRpZiAoXCJpZFwiIGluIHVzZXIpIHtcclxuXHRcdFx0XHRyZXR1cm4gdXNlcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKFwiW09XZWJDdXJyZW50VXNlcl0gaW52YWxpZCB1c2VyIGRhdGEhXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIGRhdGEuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXNlclxyXG5cdCAqL1xyXG5cdHNldEN1cnJlbnRVc2VyKHVzZXI6IGFueSk6IHRoaXMge1xyXG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYkN1cnJlbnRVc2VyXSBzZXR0aW5nIG5ldyB1c2VyIC0+XCIsIHVzZXIpO1xyXG5cdFx0dGhpcy5fa2V5X3N0b3JlLnNldEl0ZW0oXCJ1c2VyX2RhdGFcIiwgdXNlcik7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuX25vdGlmeUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBleHBpcmVcclxuXHQgKi9cclxuXHRzZXRTZXNzaW9uRXhwaXJlKGV4cGlyZTogbnVtYmVyKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlfc3RvcmUuc2V0SXRlbShcInNlc3Npb25fZXhwaXJlXCIsIGV4cGlyZSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXHJcblx0ICovXHJcblx0Z2V0U2Vzc2lvbkV4cGlyZSgpOiBudW1iZXIge1xyXG5cdFx0bGV0IGV4cGlyZSA9IHRoaXMuX2tleV9zdG9yZS5nZXRJdGVtKFwic2Vzc2lvbl9leHBpcmVcIik7XHJcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlfc3RvcmUuY2xlYXIoKTtcclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRyaWdnZXIgbm90aWZpY2F0aW9uIGZvciB1c2VyIGRhdGEgY2hhbmdlLlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ub3RpZnlDaGFuZ2UoKTogdGhpcyB7XHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkN1cnJlbnRVc2VyLkVWVF9VU0VSX0RBVEFfVVBEQVRFLCBbdGhpc10pO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59Il19