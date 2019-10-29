import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import Utils from './utils/Utils';
import { GoblEntity } from 'gobl-utils-ts';
export default class OWebCurrentUser extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this._key_store = new OWebKeyStorage(app_context, OWebCurrentUser.SELF);
        console.log('[OWebCurrentUser] ready!');
    }
    /**
     * Returns current user data.
     */
    getCurrentUser() {
        let data = this._key_store.getItem('user_data');
        let user = undefined;
        if (data instanceof GoblEntity) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsTUFBTSxDQUFDLE9BQU8sT0FBTyxlQUFnQixTQUFRLFNBQVM7SUFNckQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFHaEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjO1FBQ2IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBRXJCLElBQUksSUFBSSxZQUFZLFVBQVUsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQztTQUNaO2FBQU0sSUFDTixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztZQUN6QixDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUN6QztZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTTtZQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxJQUFTO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNDLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZ0JBQWdCLENBQUMsTUFBYztRQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQjtRQUNmLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYTtRQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDOztBQS9FZSxvQkFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNsQixvQ0FBb0IsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IE9XZWJLZXlTdG9yYWdlIGZyb20gJy4vT1dlYktleVN0b3JhZ2UnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XHJcbmltcG9ydCB7IEdvYmxFbnRpdHkgfSBmcm9tICdnb2JsLXV0aWxzLXRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDdXJyZW50VXNlciBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgPSBVdGlscy5pZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfVVNFUl9EQVRBX1VQREFURSA9IFV0aWxzLmlkKCk7XHJcblxyXG5cdHByaXZhdGUgX2tleV9zdG9yZTogT1dlYktleVN0b3JhZ2U7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5fa2V5X3N0b3JlID0gbmV3IE9XZWJLZXlTdG9yYWdlKGFwcF9jb250ZXh0LCBPV2ViQ3VycmVudFVzZXIuU0VMRik7XHJcblx0XHRjb25zb2xlLmxvZygnW09XZWJDdXJyZW50VXNlcl0gcmVhZHkhJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBkYXRhLlxyXG5cdCAqL1xyXG5cdGdldEN1cnJlbnRVc2VyKCk6IGFueSB7XHJcblx0XHRsZXQgZGF0YSA9IHRoaXMuX2tleV9zdG9yZS5nZXRJdGVtKCd1c2VyX2RhdGEnKTtcclxuXHRcdGxldCB1c2VyID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdGlmIChkYXRhIGluc3RhbmNlb2YgR29ibEVudGl0eSkge1xyXG5cdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdH0gZWxzZSBpZiAoXHJcblx0XHRcdFV0aWxzLmlzUGxhaW5PYmplY3QoZGF0YSkgJiZcclxuXHRcdFx0KHVzZXIgPSBHb2JsRW50aXR5LnRvSW5zdGFuY2UoZGF0YSwgdHJ1ZSkpXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuIHVzZXI7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCdbT1dlYkN1cnJlbnRVc2VyXSBpbnZhbGlkIHVzZXIgZGF0YSEnLCBkYXRhKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1c2VyXHJcblx0ICovXHJcblx0c2V0Q3VycmVudFVzZXIodXNlcjogYW55KTogdGhpcyB7XHJcblx0XHRjb25zb2xlLmxvZygnW09XZWJDdXJyZW50VXNlcl0gc2V0dGluZyBuZXcgdXNlciAtPicsIHVzZXIpO1xyXG5cdFx0dGhpcy5fa2V5X3N0b3JlLnNldEl0ZW0oJ3VzZXJfZGF0YScsIHVzZXIpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZXhwaXJlXHJcblx0ICovXHJcblx0c2V0U2Vzc2lvbkV4cGlyZShleHBpcmU6IG51bWJlcik6IHRoaXMge1xyXG5cdFx0dGhpcy5fa2V5X3N0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJywgZXhwaXJlKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cclxuXHQgKi9cclxuXHRnZXRTZXNzaW9uRXhwaXJlKCk6IG51bWJlciB7XHJcblx0XHRsZXQgZXhwaXJlID0gdGhpcy5fa2V5X3N0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJyk7XHJcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlfc3RvcmUuY2xlYXIoKTtcclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRyaWdnZXIgbm90aWZpY2F0aW9uIGZvciB1c2VyIGRhdGEgY2hhbmdlLlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ub3RpZnlDaGFuZ2UoKTogdGhpcyB7XHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkN1cnJlbnRVc2VyLkVWVF9VU0VSX0RBVEFfVVBEQVRFLCBbdGhpc10pO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59XHJcbiJdfQ==