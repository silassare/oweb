import OWebEvent from './OWebEvent';
import { id, logger } from './utils';
export default class OWebView extends OWebEvent {
    static SELF = id();
    static EVT_VIEW_FREEZE = id();
    static EVT_VIEW_UNFREEZE = id();
    static EVT_VIEW_DIALOG = id();
    _freezeCounter = 0;
    constructor() {
        super();
        logger.info('[OWebView] ready!');
    }
    /**
     * Checks if the view is frozen.
     */
    isFrozen() {
        return Boolean(this._freezeCounter);
    }
    /**
     * To freeze the view.
     */
    freeze() {
        ++this._freezeCounter;
        if (this._freezeCounter === 1) {
            this.trigger(OWebView.EVT_VIEW_FREEZE);
        }
        return this;
    }
    /**
     * Unfreeze the view.
     */
    unfreeze() {
        if (this.isFrozen()) {
            --this._freezeCounter;
            if (!this.isFrozen()) {
                this.trigger(OWebView.EVT_VIEW_UNFREEZE);
            }
        }
        return this;
    }
    /**
     * Trigger dialog event to the view.
     * @param dialog
     * @param canUseAlert
     */
    dialog(dialog, canUseAlert = false) {
        let d = dialog;
        if (d.error) {
            d = {
                type: d.error ? 'error' : 'done',
                text: d.msg,
                data: d.data || {},
            };
        }
        this.trigger(OWebView.EVT_VIEW_DIALOG, [d, canUseAlert]);
    }
    /**
     * Register freeze event handler.
     *
     * @param handler
     */
    onFreeze(handler) {
        return this.on(OWebView.EVT_VIEW_FREEZE, handler);
    }
    /**
     * Register unfreeze event handler.
     *
     * @param handler
     */
    onUnFreeze(handler) {
        return this.on(OWebView.EVT_VIEW_UNFREEZE, handler);
    }
    /**
     * Register dialog event handler.
     *
     * @param handler
     */
    onDialog(handler) {
        return this.on(OWebView.EVT_VIEW_DIALOG, handler);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBVXJDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sUUFBUyxTQUFRLFNBQVM7SUFDOUMsTUFBTSxDQUFVLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUM1QixNQUFNLENBQVUsZUFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sQ0FBVSxpQkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN6QyxNQUFNLENBQVUsZUFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBRS9CLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFM0I7UUFDQyxLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ1AsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDTCxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7UUFFdEIsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN2QztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNQLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ3BCLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUV0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3pDO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUNMLE1BQW1ELEVBQ25ELFdBQVcsR0FBRyxLQUFLO1FBRW5CLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUVmLElBQUssQ0FBdUIsQ0FBQyxLQUFLLEVBQUU7WUFDbkMsQ0FBQyxHQUFHO2dCQUNILElBQUksRUFBRyxDQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUN2RCxJQUFJLEVBQUcsQ0FBdUIsQ0FBQyxHQUFHO2dCQUNsQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO2FBQ2xCLENBQUM7U0FDRjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLE9BQTZCO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFDLE9BQTZCO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQ1AsT0FBd0U7UUFFeEUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IHsgaWQsIGxvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgT0FwaVJlc3BvbnNlIH0gZnJvbSAnLi9vem9uZSc7XG5pbXBvcnQgeyBPTmV0RXJyb3IgfSBmcm9tICcuL09XZWJOZXQnO1xuXG5leHBvcnQgdHlwZSBPVmlld0RpYWxvZyA9IHtcblx0dHlwZTogJ2luZm8nIHwgJ2Vycm9yJyB8ICdkb25lJztcblx0dGV4dDogc3RyaW5nO1xuXHRkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVmlldyBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9WSUVXX0ZSRUVaRSA9IGlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfVklFV19VTkZSRUVaRSA9IGlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfVklFV19ESUFMT0cgPSBpZCgpO1xuXG5cdHByaXZhdGUgX2ZyZWV6ZUNvdW50ZXIgPSAwO1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViVmlld10gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSB2aWV3IGlzIGZyb3plbi5cblx0ICovXG5cdGlzRnJvemVuKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMuX2ZyZWV6ZUNvdW50ZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRvIGZyZWV6ZSB0aGUgdmlldy5cblx0ICovXG5cdGZyZWV6ZSgpOiB0aGlzIHtcblx0XHQrK3RoaXMuX2ZyZWV6ZUNvdW50ZXI7XG5cblx0XHRpZiAodGhpcy5fZnJlZXplQ291bnRlciA9PT0gMSkge1xuXHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJWaWV3LkVWVF9WSUVXX0ZSRUVaRSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVW5mcmVlemUgdGhlIHZpZXcuXG5cdCAqL1xuXHR1bmZyZWV6ZSgpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5pc0Zyb3plbigpKSB7XG5cdFx0XHQtLXRoaXMuX2ZyZWV6ZUNvdW50ZXI7XG5cblx0XHRcdGlmICghdGhpcy5pc0Zyb3plbigpKSB7XG5cdFx0XHRcdHRoaXMudHJpZ2dlcihPV2ViVmlldy5FVlRfVklFV19VTkZSRUVaRSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlciBkaWFsb2cgZXZlbnQgdG8gdGhlIHZpZXcuXG5cdCAqIEBwYXJhbSBkaWFsb2dcblx0ICogQHBhcmFtIGNhblVzZUFsZXJ0XG5cdCAqL1xuXHRkaWFsb2coXG5cdFx0ZGlhbG9nOiBPVmlld0RpYWxvZyB8IE9BcGlSZXNwb25zZTxhbnk+IHwgT05ldEVycm9yLFxuXHRcdGNhblVzZUFsZXJ0ID0gZmFsc2Vcblx0KTogdm9pZCB7XG5cdFx0bGV0IGQgPSBkaWFsb2c7XG5cblx0XHRpZiAoKGQgYXMgT0FwaVJlc3BvbnNlPGFueT4pLmVycm9yKSB7XG5cdFx0XHRkID0ge1xuXHRcdFx0XHR0eXBlOiAoZCBhcyBPQXBpUmVzcG9uc2U8YW55PikuZXJyb3IgPyAnZXJyb3InIDogJ2RvbmUnLFxuXHRcdFx0XHR0ZXh0OiAoZCBhcyBPQXBpUmVzcG9uc2U8YW55PikubXNnLFxuXHRcdFx0XHRkYXRhOiBkLmRhdGEgfHwge30sXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMudHJpZ2dlcihPV2ViVmlldy5FVlRfVklFV19ESUFMT0csIFtkLCBjYW5Vc2VBbGVydF0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGZyZWV6ZSBldmVudCBoYW5kbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25GcmVlemUoaGFuZGxlcjogKHRoaXM6IHRoaXMpID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViVmlldy5FVlRfVklFV19GUkVFWkUsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIHVuZnJlZXplIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblVuRnJlZXplKGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYlZpZXcuRVZUX1ZJRVdfVU5GUkVFWkUsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGRpYWxvZyBldmVudCBoYW5kbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25EaWFsb2coXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIGRpYWxvZzogT1ZpZXdEaWFsb2csIGNhblVzZUFsZXJ0OiBib29sZWFuKSA9PiB2b2lkXG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJWaWV3LkVWVF9WSUVXX0RJQUxPRywgaGFuZGxlcik7XG5cdH1cbn1cbiJdfQ==