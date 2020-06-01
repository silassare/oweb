import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { id, isPlainObject, _info, _debug, _error } from './utils/Utils';
import { toInstance } from 'gobl-utils-ts';
let OWebCurrentUser = /** @class */ (() => {
    class OWebCurrentUser extends OWebEvent {
        constructor(appContext) {
            super();
            this.appContext = appContext;
            this._keyStore = new OWebKeyStorage(appContext, 'current_user');
            _info('[OWebCurrentUser] ready!');
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
                _error('[OWebCurrentUser] invalid user data.', data);
            }
            return undefined;
        }
        /**
         * Sets current user data.
         *
         * @param user
         */
        setCurrentUser(user) {
            _debug('[OWebCurrentUser] setting new user', user);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkN1cnJlbnRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJDdXJyZW50VXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekUsT0FBTyxFQUFjLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV2RDtJQUFBLE1BQXFCLGVBQWdCLFNBQVEsU0FBUztRQU1yRCxZQUE2QixVQUFtQjtZQUMvQyxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFTO1lBRy9DLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hFLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRDs7V0FFRztRQUNILGNBQWM7WUFDYixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksQ0FBQztZQUVULElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRTtnQkFDeEQsT0FBTyxJQUFJLENBQUM7YUFDWjtpQkFBTSxJQUNOLGFBQWEsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLHNEQUFzRDtnQkFDdEQsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUM5QjtnQkFDRCxPQUFPLElBQUksQ0FBQzthQUNaO2lCQUFNO2dCQUNOLE1BQU0sQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNyRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsY0FBYyxDQUFDLElBQVM7WUFDdkIsTUFBTSxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUxQyxPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILGdCQUFnQixDQUFDLE1BQWM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxnQkFBZ0I7WUFDZixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxLQUFLO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNLLGFBQWE7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQzs7SUFoRmUsb0JBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUNaLG9DQUFvQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBZ0Y3QyxzQkFBQztLQUFBO2VBbEZvQixlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcclxuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XHJcbmltcG9ydCBPV2ViS2V5U3RvcmFnZSBmcm9tICcuL09XZWJLZXlTdG9yYWdlJztcclxuaW1wb3J0IHsgaWQsIGlzUGxhaW5PYmplY3QsIF9pbmZvLCBfZGVidWcsIF9lcnJvciB9IGZyb20gJy4vdXRpbHMvVXRpbHMnO1xyXG5pbXBvcnQgeyBHb2JsRW50aXR5LCB0b0luc3RhbmNlIH0gZnJvbSAnZ29ibC11dGlscy10cyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ3VycmVudFVzZXIgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX1VTRVJfREFUQV9VUERBVEUgPSBpZCgpO1xyXG5cclxuXHRwcml2YXRlIF9rZXlTdG9yZTogT1dlYktleVN0b3JhZ2U7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLl9rZXlTdG9yZSA9IG5ldyBPV2ViS2V5U3RvcmFnZShhcHBDb250ZXh0LCAnY3VycmVudF91c2VyJyk7XHJcblx0XHRfaW5mbygnW09XZWJDdXJyZW50VXNlcl0gcmVhZHkhJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBkYXRhLlxyXG5cdCAqL1xyXG5cdGdldEN1cnJlbnRVc2VyKCk6IGFueSB7XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy5fa2V5U3RvcmUuZ2V0SXRlbSgndXNlcl9kYXRhJyk7XHJcblx0XHRsZXQgdXNlcjtcclxuXHJcblx0XHRpZiAoZGF0YSAmJiBkYXRhLmlkICYmIHR5cGVvZiBkYXRhLmdldElkID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHJldHVybiBkYXRhO1xyXG5cdFx0fSBlbHNlIGlmIChcclxuXHRcdFx0aXNQbGFpbk9iamVjdChkYXRhKSAmJlxyXG5cdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcclxuXHRcdFx0KHVzZXIgPSB0b0luc3RhbmNlKGRhdGEsIHRydWUpKVxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiB1c2VyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0X2Vycm9yKCdbT1dlYkN1cnJlbnRVc2VyXSBpbnZhbGlkIHVzZXIgZGF0YS4nLCBkYXRhKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgZGF0YS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1c2VyXHJcblx0ICovXHJcblx0c2V0Q3VycmVudFVzZXIodXNlcjogYW55KTogdGhpcyB7XHJcblx0XHRfZGVidWcoJ1tPV2ViQ3VycmVudFVzZXJdIHNldHRpbmcgbmV3IHVzZXInLCB1c2VyKTtcclxuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3VzZXJfZGF0YScsIHVzZXIpO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLl9ub3RpZnlDaGFuZ2UoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZXhwaXJlXHJcblx0ICovXHJcblx0c2V0U2Vzc2lvbkV4cGlyZShleHBpcmU6IG51bWJlcik6IHRoaXMge1xyXG5cdFx0dGhpcy5fa2V5U3RvcmUuc2V0SXRlbSgnc2Vzc2lvbl9leHBpcmUnLCBleHBpcmUpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBzZXNzaW9uIGV4cGlyZSB0aW1lLlxyXG5cdCAqL1xyXG5cdGdldFNlc3Npb25FeHBpcmUoKTogbnVtYmVyIHtcclxuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJyk7XHJcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB1c2VyIGRhdGEuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogdGhpcyB7XHJcblx0XHR0aGlzLl9rZXlTdG9yZS5jbGVhcigpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX25vdGlmeUNoYW5nZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVHJpZ2dlciBub3RpZmljYXRpb24gZm9yIHVzZXIgZGF0YSBjaGFuZ2UuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25vdGlmeUNoYW5nZSgpOiB0aGlzIHtcclxuXHRcdHRoaXMudHJpZ2dlcihPV2ViQ3VycmVudFVzZXIuRVZUX1VTRVJfREFUQV9VUERBVEUsIFt0aGlzXSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcbn1cclxuIl19