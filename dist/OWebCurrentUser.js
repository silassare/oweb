import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { id, isPlainObject } from './utils/Utils';
import { GoblEntity } from 'gobl-utils-ts';
export default class OWebCurrentUser extends OWebEvent {
    constructor(appContext) {
        super();
        this.appContext = appContext;
        this._keyStore = new OWebKeyStorage(appContext, 'current_user');
        console.log('[OWebCurrentUser] ready!');
    }
    /**
     * Returns current user data.
     */
    getCurrentUser() {
        const data = this._keyStore.getItem('user_data');
        let user;
        if (data && data.id && typeof data.getId === 'function') {
            return data;
        }
        else if (isPlainObject(data) &&
            // tslint:disable-next-line: no-conditional-assignment
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
        this._keyStore.setItem('user_data', user);
        return this._notifyChange();
    }
    /**
     * Sets current user session expire time.
     *
     * @param expire
     */
    setSessionExpire(expire) {
        this._keyStore.setItem('session_expire', expire);
        return this;
    }
    /**
     * Returns current user session expire time.
     */
    getSessionExpire() {
        const expire = this._keyStore.getItem('session_expire');
        return isNaN(expire) ? 0 : expire;
    }
    /**
     * Clear user data.
     */
    clear() {
        this._keyStore.clear();
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
OWebCurrentUser.SELF = id();
OWebCurrentUser.EVT_USER_DATA_UPDATE = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxNQUFNLENBQUMsT0FBTyxPQUFPLGVBQWdCLFNBQVEsU0FBUztJQU1yRCxZQUE2QixVQUFtQjtRQUMvQyxLQUFLLEVBQUUsQ0FBQztRQURvQixlQUFVLEdBQVYsVUFBVSxDQUFTO1FBRy9DLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjO1FBQ2IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxJQUFJLENBQUM7UUFFVCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDeEQsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNLElBQ04sYUFBYSxDQUFDLElBQUksQ0FBQztZQUNuQixzREFBc0Q7WUFDdEQsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFDekM7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNaO2FBQU07WUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVEO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsSUFBUztRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQyxPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGdCQUFnQixDQUFDLE1BQWM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0I7UUFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGFBQWE7UUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQzs7QUFoRmUsb0JBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNaLG9DQUFvQixHQUFHLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcclxuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XHJcbmltcG9ydCBPV2ViS2V5U3RvcmFnZSBmcm9tICcuL09XZWJLZXlTdG9yYWdlJztcclxuaW1wb3J0IHsgaWQsIGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuaW1wb3J0IHsgR29ibEVudGl0eSB9IGZyb20gJ2dvYmwtdXRpbHMtdHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkN1cnJlbnRVc2VyIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9VU0VSX0RBVEFfVVBEQVRFID0gaWQoKTtcclxuXHJcblx0cHJpdmF0ZSBfa2V5U3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5fa2V5U3RvcmUgPSBuZXcgT1dlYktleVN0b3JhZ2UoYXBwQ29udGV4dCwgJ2N1cnJlbnRfdXNlcicpO1xyXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViQ3VycmVudFVzZXJdIHJlYWR5IScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKi9cclxuXHRnZXRDdXJyZW50VXNlcigpOiBhbnkge1xyXG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3VzZXJfZGF0YScpO1xyXG5cdFx0bGV0IHVzZXI7XHJcblxyXG5cdFx0aWYgKGRhdGEgJiYgZGF0YS5pZCAmJiB0eXBlb2YgZGF0YS5nZXRJZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdH0gZWxzZSBpZiAoXHJcblx0XHRcdGlzUGxhaW5PYmplY3QoZGF0YSkgJiZcclxuXHRcdFx0Ly8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XHJcblx0XHRcdCh1c2VyID0gR29ibEVudGl0eS50b0luc3RhbmNlKGRhdGEsIHRydWUpKVxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiB1c2VyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcignW09XZWJDdXJyZW50VXNlcl0gaW52YWxpZCB1c2VyIGRhdGEhJywgZGF0YSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIGRhdGEuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXNlclxyXG5cdCAqL1xyXG5cdHNldEN1cnJlbnRVc2VyKHVzZXI6IGFueSk6IHRoaXMge1xyXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViQ3VycmVudFVzZXJdIHNldHRpbmcgbmV3IHVzZXIgLT4nLCB1c2VyKTtcclxuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3VzZXJfZGF0YScsIHVzZXIpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZXhwaXJlXHJcblx0ICovXHJcblx0c2V0U2Vzc2lvbkV4cGlyZShleHBpcmU6IG51bWJlcik6IHRoaXMge1xyXG5cdFx0dGhpcy5fa2V5U3RvcmUuc2V0SXRlbSgnc2Vzc2lvbl9leHBpcmUnLCBleHBpcmUpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBzZXNzaW9uIGV4cGlyZSB0aW1lLlxyXG5cdCAqL1xyXG5cdGdldFNlc3Npb25FeHBpcmUoKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJyk7XHJcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlTdG9yZS5jbGVhcigpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX25vdGlmeUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVHJpZ2dlciBub3RpZmljYXRpb24gZm9yIHVzZXIgZGF0YSBjaGFuZ2UuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25vdGlmeUNoYW5nZSgpOiB0aGlzIHtcclxuXHRcdHRoaXMudHJpZ2dlcihPV2ViQ3VycmVudFVzZXIuRVZUX1VTRVJfREFUQV9VUERBVEUsIFt0aGlzXSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn1cclxuIl19