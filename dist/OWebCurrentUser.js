import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import Utils from './utils/Utils';
import { GoblEntity } from 'gobl-utils-ts';
export default class OWebCurrentUser extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this._key_store = new OWebKeyStorage(app_context, 'current_user');
        console.log('[OWebCurrentUser] ready!');
    }
    /**
     * Returns current user data.
     */
    getCurrentUser() {
        let data = this._key_store.getItem('user_data');
        let user = undefined;
        if (data && data.id && typeof data.getId === 'function') {
            return data;
        }
        else if (Utils.isPlainObject(data) &&
            (user = GoblEntity.toInstance(data, true))) {
            return user;
        }
        else {
            console.error('[OWebCurrentUser] invalid user data!', data);
        }
        return undefined;
    }
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrentUser(user) {
        console.log('[OWebCurrentUser] setting new user ->', user);
        this._key_store.setItem('user_data', user);
        return this._notifyChange();
    }
    /**
     * Sets current user session expire time.
     *
     * @param expire
     */
    setSessionExpire(expire) {
        this._key_store.setItem('session_expire', expire);
        return this;
    }
    /**
     * Returns current user session expire time.
     */
    getSessionExpire() {
        let expire = this._key_store.getItem('session_expire');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsTUFBTSxDQUFDLE9BQU8sT0FBTyxlQUFnQixTQUFRLFNBQVM7SUFNckQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFHaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDYixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7UUFFckIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO1lBQ3hELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxJQUNOLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO1lBQ3pCLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ3pDO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1RDtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLElBQVM7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0MsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxNQUFjO1FBQzlCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2YsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxhQUFhO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7O0FBL0VlLG9CQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2xCLG9DQUFvQixHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xyXG5pbXBvcnQgT1dlYktleVN0b3JhZ2UgZnJvbSAnLi9PV2ViS2V5U3RvcmFnZSc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuaW1wb3J0IHsgR29ibEVudGl0eSB9IGZyb20gJ2dvYmwtdXRpbHMtdHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkN1cnJlbnRVc2VyIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IFV0aWxzLmlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9VU0VSX0RBVEFfVVBEQVRFID0gVXRpbHMuaWQoKTtcclxuXHJcblx0cHJpdmF0ZSBfa2V5X3N0b3JlOiBPV2ViS2V5U3RvcmFnZTtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl9rZXlfc3RvcmUgPSBuZXcgT1dlYktleVN0b3JhZ2UoYXBwX2NvbnRleHQsICdjdXJyZW50X3VzZXInKTtcclxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYkN1cnJlbnRVc2VyXSByZWFkeSEnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Z2V0Q3VycmVudFVzZXIoKTogYW55IHtcclxuXHRcdGxldCBkYXRhID0gdGhpcy5fa2V5X3N0b3JlLmdldEl0ZW0oJ3VzZXJfZGF0YScpO1xyXG5cdFx0bGV0IHVzZXIgPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0aWYgKGRhdGEgJiYgZGF0YS5pZCAmJiB0eXBlb2YgZGF0YS5nZXRJZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdH0gZWxzZSBpZiAoXHJcblx0XHRcdFV0aWxzLmlzUGxhaW5PYmplY3QoZGF0YSkgJiZcclxuXHRcdFx0KHVzZXIgPSBHb2JsRW50aXR5LnRvSW5zdGFuY2UoZGF0YSwgdHJ1ZSkpXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuIHVzZXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCdbT1dlYkN1cnJlbnRVc2VyXSBpbnZhbGlkIHVzZXIgZGF0YSEnLCBkYXRhKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1c2VyXHJcblx0ICovXHJcblx0c2V0Q3VycmVudFVzZXIodXNlcjogYW55KTogdGhpcyB7XHJcblx0XHRjb25zb2xlLmxvZygnW09XZWJDdXJyZW50VXNlcl0gc2V0dGluZyBuZXcgdXNlciAtPicsIHVzZXIpO1xyXG5cdFx0dGhpcy5fa2V5X3N0b3JlLnNldEl0ZW0oJ3VzZXJfZGF0YScsIHVzZXIpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZXhwaXJlXHJcblx0ICovXHJcblx0c2V0U2Vzc2lvbkV4cGlyZShleHBpcmU6IG51bWJlcik6IHRoaXMge1xyXG5cdFx0dGhpcy5fa2V5X3N0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJywgZXhwaXJlKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cclxuXHQgKi9cclxuXHRnZXRTZXNzaW9uRXhwaXJlKCk6IG51bWJlciB7XHJcblx0XHRsZXQgZXhwaXJlID0gdGhpcy5fa2V5X3N0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJyk7XHJcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlfc3RvcmUuY2xlYXIoKTtcclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRyaWdnZXIgbm90aWZpY2F0aW9uIGZvciB1c2VyIGRhdGEgY2hhbmdlLlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ub3RpZnlDaGFuZ2UoKTogdGhpcyB7XHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkN1cnJlbnRVc2VyLkVWVF9VU0VSX0RBVEFfVVBEQVRFLCBbdGhpc10pO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59XHJcbiJdfQ==