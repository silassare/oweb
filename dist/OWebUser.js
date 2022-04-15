import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { logger } from './utils';
import OWebSignUp from './plugins/OWebSignUp';
import OWebLogin from './plugins/OWebLogin';
import OWebLogout from './plugins/OWebLogout';
import OWebAccountRecovery from './plugins/OWebAccountRecovery';
import OWebPassword from './plugins/OWebPassword';
export default class OWebUser extends OWebEvent {
    _appContext;
    _keyStore;
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
        this._keyStore = new OWebKeyStorage(_appContext, 'current_user');
    }
    /**
     * Returns a new {@link OWebLogin} instance.
     */
    login() {
        return new OWebLogin(this._appContext);
    }
    /**
     * Returns a new {@link OWebLogout} instance.
     */
    logout() {
        return new OWebLogout(this._appContext);
    }
    /**
     * Returns a new {@link OWebSignUp} instance.
     */
    signUp() {
        return new OWebSignUp(this._appContext);
    }
    /**
     * Returns a new {@link OWebPassword} instance.
     */
    password() {
        return new OWebPassword(this._appContext);
    }
    /**
     * Returns a new {@link OWebAccountRecovery} instance.
     */
    accountRecovery() {
        return new OWebAccountRecovery(this._appContext);
    }
    /**
     * Checks if user session is active.
     */
    sessionActive() {
        const now = new Date().getTime(); // milliseconds
        const hour = 60 * 60; // seconds
        const expire = this.getSessionExpire() - hour; // seconds
        return expire * 1000 > now;
    }
    /**
     * Checks if the current user has been authenticated.
     *
     * @deprecated use {@link OWebUser.isVerified }
     */
    userVerified() {
        return this.isVerified();
    }
    /**
     * Sets current user data.
     *
     * @param user
     *
     * @deprecated use {@link OWebUser.setCurrent}
     */
    setCurrentUser(user) {
        return this.setCurrent(user);
    }
    /**
     * Returns current user data.
     *
     * @deprecated use {@link OWebUser.getCurrent}
     */
    getCurrentUser() {
        return this.getCurrent();
    }
    /**
     * Checks if the current user has been authenticated.
     */
    isVerified() {
        return Boolean(this.getCurrent() && this.sessionActive());
    }
    /**
     * Returns current user data.
     */
    getCurrent() {
        return this._keyStore.getItem('user_data');
    }
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrent(user) {
        logger.debug('[OWebUser] setting new user', user);
        this._keyStore.setItem('user_data', user);
        return this;
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
        const expire = Number(this._keyStore.getItem('session_expire'));
        return isNaN(expire) ? 0 : expire;
    }
    /**
     * Sets current user session token.
     *
     * @param token
     */
    setSessionToken(token) {
        this._keyStore.setItem('session_token', token);
        return this;
    }
    /**
     * Returns current user session token.
     */
    getSessionToken() {
        return this._keyStore.getItem('session_token');
    }
    /**
     * Clear user data.
     */
    clear() {
        this._keyStore.clear();
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDakMsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxTQUFTLE1BQU0scUJBQXFCLENBQUM7QUFDNUMsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxtQkFBbUIsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUVsRCxNQUFNLENBQUMsT0FBTyxPQUFPLFFBQW1DLFNBQVEsU0FBUztJQUdsRDtJQUZkLFNBQVMsQ0FBaUI7SUFFbEMsWUFBc0IsV0FBb0I7UUFDekMsS0FBSyxFQUFFLENBQUM7UUFEYSxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUV6QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osT0FBTyxJQUFJLFNBQVMsQ0FBYSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTTtRQUNMLE9BQU8sSUFBSSxVQUFVLENBQWEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDTCxPQUFPLElBQUksVUFBVSxDQUF1QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNQLE9BQU8sSUFBSSxZQUFZLENBQWEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNILGVBQWU7UUFDZCxPQUFPLElBQUksbUJBQW1CLENBQXVCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1osTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLGVBQWU7UUFDakQsTUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLFVBQVU7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVTtRQUN6RCxPQUFPLE1BQU0sR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWTtRQUNYLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxjQUFjLENBQUMsSUFBZ0I7UUFDOUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYztRQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDVCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVTtRQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQWEsV0FBVyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsSUFBZ0I7UUFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGdCQUFnQixDQUFDLE1BQWM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0I7UUFDZixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxLQUFhO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILGVBQWU7UUFDZCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBa0IsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IE9XZWJBcHAsIHsgT1VzZXIgfSBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IE9XZWJLZXlTdG9yYWdlIGZyb20gJy4vT1dlYktleVN0b3JhZ2UnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYlNpZ25VcCBmcm9tICcuL3BsdWdpbnMvT1dlYlNpZ25VcCc7XG5pbXBvcnQgT1dlYkxvZ2luIGZyb20gJy4vcGx1Z2lucy9PV2ViTG9naW4nO1xuaW1wb3J0IE9XZWJMb2dvdXQgZnJvbSAnLi9wbHVnaW5zL09XZWJMb2dvdXQnO1xuaW1wb3J0IE9XZWJBY2NvdW50UmVjb3ZlcnkgZnJvbSAnLi9wbHVnaW5zL09XZWJBY2NvdW50UmVjb3ZlcnknO1xuaW1wb3J0IE9XZWJQYXNzd29yZCBmcm9tICcuL3BsdWdpbnMvT1dlYlBhc3N3b3JkJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlVzZXI8VXNlckVudGl0eSBleHRlbmRzIE9Vc2VyPiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgX2tleVN0b3JlOiBPV2ViS2V5U3RvcmFnZTtcblxuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2tleVN0b3JlID0gbmV3IE9XZWJLZXlTdG9yYWdlKF9hcHBDb250ZXh0LCAnY3VycmVudF91c2VyJyk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG5ldyB7QGxpbmsgT1dlYkxvZ2lufSBpbnN0YW5jZS5cblx0ICovXG5cdGxvZ2luKCkge1xuXHRcdHJldHVybiBuZXcgT1dlYkxvZ2luPFVzZXJFbnRpdHk+KHRoaXMuX2FwcENvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBuZXcge0BsaW5rIE9XZWJMb2dvdXR9IGluc3RhbmNlLlxuXHQgKi9cblx0bG9nb3V0KCkge1xuXHRcdHJldHVybiBuZXcgT1dlYkxvZ291dDxVc2VyRW50aXR5Pih0aGlzLl9hcHBDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbmV3IHtAbGluayBPV2ViU2lnblVwfSBpbnN0YW5jZS5cblx0ICovXG5cdHNpZ25VcDxTdGFydCwgVmFsaWRhdGUsIEVuZD4oKSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViU2lnblVwPFN0YXJ0LCBWYWxpZGF0ZSwgRW5kPih0aGlzLl9hcHBDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbmV3IHtAbGluayBPV2ViUGFzc3dvcmR9IGluc3RhbmNlLlxuXHQgKi9cblx0cGFzc3dvcmQoKSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViUGFzc3dvcmQ8VXNlckVudGl0eT4odGhpcy5fYXBwQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG5ldyB7QGxpbmsgT1dlYkFjY291bnRSZWNvdmVyeX0gaW5zdGFuY2UuXG5cdCAqL1xuXHRhY2NvdW50UmVjb3Zlcnk8U3RhcnQsIFZhbGlkYXRlLCBFbmQ+KCkge1xuXHRcdHJldHVybiBuZXcgT1dlYkFjY291bnRSZWNvdmVyeTxTdGFydCwgVmFsaWRhdGUsIEVuZD4odGhpcy5fYXBwQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyBtaWxsaXNlY29uZHNcblx0XHRjb25zdCBob3VyID0gNjAgKiA2MDsgLy8gc2Vjb25kc1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuZ2V0U2Vzc2lvbkV4cGlyZSgpIC0gaG91cjsgLy8gc2Vjb25kc1xuXHRcdHJldHVybiBleHBpcmUgKiAxMDAwID4gbm93O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIGF1dGhlbnRpY2F0ZWQuXG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkIHVzZSB7QGxpbmsgT1dlYlVzZXIuaXNWZXJpZmllZCB9XG5cdCAqL1xuXHR1c2VyVmVyaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuaXNWZXJpZmllZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VyXG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkIHVzZSB7QGxpbmsgT1dlYlVzZXIuc2V0Q3VycmVudH1cblx0ICovXG5cdHNldEN1cnJlbnRVc2VyKHVzZXI6IFVzZXJFbnRpdHkpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRDdXJyZW50KHVzZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIGRhdGEuXG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkIHVzZSB7QGxpbmsgT1dlYlVzZXIuZ2V0Q3VycmVudH1cblx0ICovXG5cdGdldEN1cnJlbnRVc2VyKCk6IFVzZXJFbnRpdHkgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDdXJyZW50KCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGJlZW4gYXV0aGVudGljYXRlZC5cblx0ICovXG5cdGlzVmVyaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEJvb2xlYW4odGhpcy5nZXRDdXJyZW50KCkgJiYgdGhpcy5zZXNzaW9uQWN0aXZlKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIGRhdGEuXG5cdCAqL1xuXHRnZXRDdXJyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLl9rZXlTdG9yZS5nZXRJdGVtPFVzZXJFbnRpdHk+KCd1c2VyX2RhdGEnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1cnJlbnQgdXNlciBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXNlclxuXHQgKi9cblx0c2V0Q3VycmVudCh1c2VyOiBVc2VyRW50aXR5KTogdGhpcyB7XG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlVzZXJdIHNldHRpbmcgbmV3IHVzZXInLCB1c2VyKTtcblx0XHR0aGlzLl9rZXlTdG9yZS5zZXRJdGVtKCd1c2VyX2RhdGEnLCB1c2VyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHBpcmVcblx0ICovXG5cdHNldFNlc3Npb25FeHBpcmUoZXhwaXJlOiBudW1iZXIpOiB0aGlzIHtcblx0XHR0aGlzLl9rZXlTdG9yZS5zZXRJdGVtKCdzZXNzaW9uX2V4cGlyZScsIGV4cGlyZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cblx0ICovXG5cdGdldFNlc3Npb25FeHBpcmUoKTogbnVtYmVyIHtcblx0XHRjb25zdCBleHBpcmUgPSBOdW1iZXIodGhpcy5fa2V5U3RvcmUuZ2V0SXRlbSgnc2Vzc2lvbl9leHBpcmUnKSk7XG5cdFx0cmV0dXJuIGlzTmFOKGV4cGlyZSkgPyAwIDogZXhwaXJlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIHNlc3Npb24gdG9rZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSB0b2tlblxuXHQgKi9cblx0c2V0U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpOiB0aGlzIHtcblx0XHR0aGlzLl9rZXlTdG9yZS5zZXRJdGVtKCdzZXNzaW9uX3Rva2VuJywgdG9rZW4pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIHNlc3Npb24gdG9rZW4uXG5cdCAqL1xuXHRnZXRTZXNzaW9uVG9rZW4oKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fdG9rZW4nKSBhcyBzdHJpbmcgfCBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFyIHVzZXIgZGF0YS5cblx0ICovXG5cdGNsZWFyKCk6IHRoaXMge1xuXHRcdHRoaXMuX2tleVN0b3JlLmNsZWFyKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==