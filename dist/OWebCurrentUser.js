import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { id, isPlainObject, logger } from './utils/Utils';
import { toInstance } from 'gobl-utils-ts';
let OWebCurrentUser = /** @class */ (() => {
    class OWebCurrentUser extends OWebEvent {
        constructor(appContext) {
            super();
            this.appContext = appContext;
            this._keyStore = new OWebKeyStorage(appContext, 'current_user');
            logger.info('[OWebCurrentUser] ready!');
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
                (user = toInstance(data, true))) {
                return user;
            }
            else {
                logger.error('[OWebCurrentUser] invalid user data.', data);
            }
            return undefined;
        }
        /**
         * Sets current user data.
         *
         * @param user
         */
        setCurrentUser(user) {
            logger.debug('[OWebCurrentUser] setting new user', user);
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
    return OWebCurrentUser;
})();
export default OWebCurrentUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0M7SUFBQSxNQUFxQixlQUFnQixTQUFRLFNBQVM7UUFNckQsWUFBNkIsVUFBbUI7WUFDL0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztZQUcvQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsY0FBYztZQUNiLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pELElBQUksSUFBSSxDQUFDO1lBRVQsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQzthQUNaO2lCQUFNLElBQ04sYUFBYSxDQUFDLElBQUksQ0FBQztnQkFDbkIsc0RBQXNEO2dCQUN0RCxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQzlCO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ1o7aUJBQU07Z0JBQ04sTUFBTSxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMzRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsY0FBYyxDQUFDLElBQVM7WUFDdkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxnQkFBZ0IsQ0FBQyxNQUFjO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOztXQUVHO1FBQ0gsZ0JBQWdCO1lBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN4RCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDbkMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsS0FBSztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdkIsT0FBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSyxhQUFhO1lBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7O0lBaEZlLG9CQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWixvQ0FBb0IsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQWdGN0Msc0JBQUM7S0FBQTtlQWxGb0IsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xyXG5pbXBvcnQgT1dlYktleVN0b3JhZ2UgZnJvbSAnLi9PV2ViS2V5U3RvcmFnZSc7XHJcbmltcG9ydCB7IGlkLCBpc1BsYWluT2JqZWN0LCBsb2dnZXIgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuaW1wb3J0IHsgdG9JbnN0YW5jZSB9IGZyb20gJ2dvYmwtdXRpbHMtdHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkN1cnJlbnRVc2VyIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9VU0VSX0RBVEFfVVBEQVRFID0gaWQoKTtcclxuXHJcblx0cHJpdmF0ZSBfa2V5U3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5fa2V5U3RvcmUgPSBuZXcgT1dlYktleVN0b3JhZ2UoYXBwQ29udGV4dCwgJ2N1cnJlbnRfdXNlcicpO1xyXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViQ3VycmVudFVzZXJdIHJlYWR5IScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKi9cclxuXHRnZXRDdXJyZW50VXNlcigpOiBhbnkge1xyXG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3VzZXJfZGF0YScpO1xyXG5cdFx0bGV0IHVzZXI7XHJcblxyXG5cdFx0aWYgKGRhdGEgJiYgZGF0YS5pZCAmJiB0eXBlb2YgZGF0YS5nZXRJZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdH0gZWxzZSBpZiAoXHJcblx0XHRcdGlzUGxhaW5PYmplY3QoZGF0YSkgJiZcclxuXHRcdFx0Ly8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XHJcblx0XHRcdCh1c2VyID0gdG9JbnN0YW5jZShkYXRhLCB0cnVlKSlcclxuXHRcdCkge1xyXG5cdFx0XHRyZXR1cm4gdXNlcjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGxvZ2dlci5lcnJvcignW09XZWJDdXJyZW50VXNlcl0gaW52YWxpZCB1c2VyIGRhdGEuJywgZGF0YSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIGRhdGEuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXNlclxyXG5cdCAqL1xyXG5cdHNldEN1cnJlbnRVc2VyKHVzZXI6IGFueSk6IHRoaXMge1xyXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkN1cnJlbnRVc2VyXSBzZXR0aW5nIG5ldyB1c2VyJywgdXNlcik7XHJcblx0XHR0aGlzLl9rZXlTdG9yZS5zZXRJdGVtKCd1c2VyX2RhdGEnLCB1c2VyKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5fbm90aWZ5Q2hhbmdlKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTZXRzIGN1cnJlbnQgdXNlciBzZXNzaW9uIGV4cGlyZSB0aW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGV4cGlyZVxyXG5cdCAqL1xyXG5cdHNldFNlc3Npb25FeHBpcmUoZXhwaXJlOiBudW1iZXIpOiB0aGlzIHtcclxuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJywgZXhwaXJlKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cclxuXHQgKi9cclxuXHRnZXRTZXNzaW9uRXhwaXJlKCk6IG51bWJlciB7XHJcblx0XHRjb25zdCBleHBpcmUgPSB0aGlzLl9rZXlTdG9yZS5nZXRJdGVtKCdzZXNzaW9uX2V4cGlyZScpO1xyXG5cdFx0cmV0dXJuIGlzTmFOKGV4cGlyZSkgPyAwIDogZXhwaXJlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2xlYXIgdXNlciBkYXRhLlxyXG5cdCAqL1xyXG5cdGNsZWFyKCk6IHRoaXMge1xyXG5cdFx0dGhpcy5fa2V5U3RvcmUuY2xlYXIoKTtcclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRyaWdnZXIgbm90aWZpY2F0aW9uIGZvciB1c2VyIGRhdGEgY2hhbmdlLlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ub3RpZnlDaGFuZ2UoKTogdGhpcyB7XHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkN1cnJlbnRVc2VyLkVWVF9VU0VSX0RBVEFfVVBEQVRFLCBbdGhpc10pO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG59XHJcbiJdfQ==