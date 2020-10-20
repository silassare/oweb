import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { logger } from './utils';
export default class OWebUser extends OWebEvent {
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
        const expire = this._keyStore.getItem('session_expire');
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
        const expire = this._keyStore.getItem('session_token');
        return isNaN(expire) ? 0 : expire;
    }
    /**
     * Clear user data.
     */
    clear() {
        this._keyStore.clear();
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFL0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFxQixTQUFRLFNBQVM7SUFHMUQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFFaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLE1BQU0sR0FBRyxHQUFNLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxlQUFlO1FBQ3BELE1BQU0sSUFBSSxHQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxVQUFVO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVU7UUFDekQsT0FBTyxNQUFNLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDYixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLElBQWdCO1FBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxNQUFjO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsS0FBYTtRQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlO1FBQ2QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IE9XZWJLZXlTdG9yYWdlIGZyb20gJy4vT1dlYktleVN0b3JhZ2UnO1xuaW1wb3J0IHtsb2dnZXJ9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVXNlcjxVc2VyRW50aXR5PiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgX2tleVN0b3JlOiBPV2ViS2V5U3RvcmFnZTtcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLl9rZXlTdG9yZSA9IG5ldyBPV2ViS2V5U3RvcmFnZShfYXBwQ29udGV4dCwgJ2N1cnJlbnRfdXNlcicpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB1c2VyIHNlc3Npb24gaXMgYWN0aXZlLlxuXHQgKi9cblx0c2Vzc2lvbkFjdGl2ZSgpOiBib29sZWFuIHtcblx0XHRjb25zdCBub3cgICAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgLy8gbWlsbGlzZWNvbmRzXG5cdFx0Y29uc3QgaG91ciAgID0gNjAgKiA2MDsgLy8gc2Vjb25kc1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuZ2V0U2Vzc2lvbkV4cGlyZSgpIC0gaG91cjsgLy8gc2Vjb25kc1xuXHRcdHJldHVybiBleHBpcmUgKiAxMDAwID4gbm93O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIGF1dGhlbnRpY2F0ZWQuXG5cdCAqL1xuXHR1c2VyVmVyaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEJvb2xlYW4odGhpcy5nZXRDdXJyZW50VXNlcigpICYmIHRoaXMuc2Vzc2lvbkFjdGl2ZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBkYXRhLlxuXHQgKi9cblx0Z2V0Q3VycmVudFVzZXIoKTogVXNlckVudGl0eSB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3VzZXJfZGF0YScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VycmVudCB1c2VyIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VyXG5cdCAqL1xuXHRzZXRDdXJyZW50VXNlcih1c2VyOiBVc2VyRW50aXR5KTogdGhpcyB7XG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkN1cnJlbnRVc2VyXSBzZXR0aW5nIG5ldyB1c2VyJywgdXNlcik7XG5cdFx0dGhpcy5fa2V5U3RvcmUuc2V0SXRlbSgndXNlcl9kYXRhJywgdXNlcik7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1cnJlbnQgdXNlciBzZXNzaW9uIGV4cGlyZSB0aW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwaXJlXG5cdCAqL1xuXHRzZXRTZXNzaW9uRXhwaXJlKGV4cGlyZTogbnVtYmVyKTogdGhpcyB7XG5cdFx0dGhpcy5fa2V5U3RvcmUuc2V0SXRlbSgnc2Vzc2lvbl9leHBpcmUnLCBleHBpcmUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgY3VycmVudCB1c2VyIHNlc3Npb24gZXhwaXJlIHRpbWUuXG5cdCAqL1xuXHRnZXRTZXNzaW9uRXhwaXJlKCk6IG51bWJlciB7XG5cdFx0Y29uc3QgZXhwaXJlID0gdGhpcy5fa2V5U3RvcmUuZ2V0SXRlbSgnc2Vzc2lvbl9leHBpcmUnKTtcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBjdXJyZW50IHVzZXIgc2Vzc2lvbiB0b2tlbi5cblx0ICpcblx0ICogQHBhcmFtIHRva2VuXG5cdCAqL1xuXHRzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZyk6IHRoaXMge1xuXHRcdHRoaXMuX2tleVN0b3JlLnNldEl0ZW0oJ3Nlc3Npb25fdG9rZW4nLCB0b2tlbik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBjdXJyZW50IHVzZXIgc2Vzc2lvbiB0b2tlbi5cblx0ICovXG5cdGdldFNlc3Npb25Ub2tlbigpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMuX2tleVN0b3JlLmdldEl0ZW0oJ3Nlc3Npb25fdG9rZW4nKTtcblx0XHRyZXR1cm4gaXNOYU4oZXhwaXJlKSA/IDAgOiBleHBpcmU7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgdXNlciBkYXRhLlxuXHQgKi9cblx0Y2xlYXIoKTogdGhpcyB7XG5cdFx0dGhpcy5fa2V5U3RvcmUuY2xlYXIoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSJdfQ==