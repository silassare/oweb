import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { logger } from './utils';
export default class OWebUser extends OWebEvent {
    _appContext;
    _keyStore;
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
        this._keyStore = new OWebKeyStorage(_appContext, 'current_user');
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
     */
    userVerified() {
        return Boolean(this.getCurrentUser() && this.sessionActive());
    }
    /**
     * Returns current user data.
     */
    getCurrentUser() {
        return this._keyStore.getItem('user_data');
    }
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrentUser(user) {
        logger.debug('[OWebCurrentUser] setting new user', user);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFakMsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFtQyxTQUFRLFNBQVM7SUFHM0M7SUFGckIsU0FBUyxDQUFpQjtJQUVsQyxZQUE2QixXQUFvQjtRQUNoRCxLQUFLLEVBQUUsQ0FBQztRQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUVoRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1osTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLGVBQWU7UUFDakQsTUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLFVBQVU7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVTtRQUN6RCxPQUFPLE1BQU0sR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILFlBQVk7UUFDWCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsY0FBYztRQUNiLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFzQixDQUFDO0lBQ2pFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLElBQWdCO1FBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxNQUFjO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlO1FBQ2QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQWtCLENBQUM7SUFDakUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCBPV2ViQXBwLCB7IE9Vc2VyIH0gZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViS2V5U3RvcmFnZSBmcm9tICcuL09XZWJLZXlTdG9yYWdlJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVXNlcjxVc2VyRW50aXR5IGV4dGVuZHMgT1VzZXI+IGV4dGVuZHMgT1dlYkV2ZW50IHtcblx0cHJpdmF0ZSBfa2V5U3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2tleVN0b3JlID0gbmV3IE9XZWJLZXlTdG9yYWdlKF9hcHBDb250ZXh0LCAnY3VycmVudF91c2VyJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyBtaWxsaXNlY29uZHNcblx0XHRjb25zdCBob3VyID0gNjAgKiA2MDsgLy8gc2Vjb25kc1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuZ2V0U2Vzc2lvbkV4cGlyZSgpIC0gaG91cjsgLy8gc2Vjb25kc1xuXHRcdHJldHVybiBleHBpcmUgKiAxMDAwID4gbm93O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIGF1dGhlbnRpY2F0ZWQuXG5cdCAqL1xuXHR1c2VyVmVyaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEJvb2xlYW4odGhpcy5nZXRDdXJyZW50VXNlcigpICYmIHRoaXMuc2Vzc2lvbkFjdGl2ZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBkYXRhLlxuXHQgKi9cblx0Z2V0Q3VycmVudFVzZXIoKTogVXNlckVudGl0eSB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9rZXlTdG9yZS5nZXRJdGVtKCd1c2VyX2RhdGEnKSBhcyBVc2VyRW50aXR5IHwgbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1cnJlbnQgdXNlciBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXNlclxuXHQgKi9cblx0c2V0Q3VycmVudFVzZXIodXNlcjogVXNlckVudGl0eSk6IHRoaXMge1xuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJDdXJyZW50VXNlcl0gc2V0dGluZyBuZXcgdXNlcicsIHVzZXIpO1xuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3VzZXJfZGF0YScsIHVzZXIpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgc2Vzc2lvbiBleHBpcmUgdGltZS5cblx0ICpcblx0ICogQHBhcmFtIGV4cGlyZVxuXHQgKi9cblx0c2V0U2Vzc2lvbkV4cGlyZShleHBpcmU6IG51bWJlcik6IHRoaXMge1xuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fZXhwaXJlJywgZXhwaXJlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBzZXNzaW9uIGV4cGlyZSB0aW1lLlxuXHQgKi9cblx0Z2V0U2Vzc2lvbkV4cGlyZSgpOiBudW1iZXIge1xuXHRcdGNvbnN0IGV4cGlyZSA9IE51bWJlcih0aGlzLl9rZXlTdG9yZS5nZXRJdGVtKCdzZXNzaW9uX2V4cGlyZScpKTtcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgc2Vzc2lvbiB0b2tlbi5cblx0ICpcblx0ICogQHBhcmFtIHRva2VuXG5cdCAqL1xuXHRzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZyk6IHRoaXMge1xuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fdG9rZW4nLCB0b2tlbik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiB0b2tlbi5cblx0ICovXG5cdGdldFNlc3Npb25Ub2tlbigpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fa2V5U3RvcmUuZ2V0SXRlbSgnc2Vzc2lvbl90b2tlbicpIGFzIHN0cmluZyB8IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgdXNlciBkYXRhLlxuXHQgKi9cblx0Y2xlYXIoKTogdGhpcyB7XG5cdFx0dGhpcy5fa2V5U3RvcmUuY2xlYXIoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuIl19