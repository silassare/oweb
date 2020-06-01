import OWebEvent from './OWebEvent';
import { id, _info } from './utils/Utils';
let OWebView = /** @class */ (() => {
    class OWebView extends OWebEvent {
        constructor() {
            super();
            this._freezeCounter = 0;
            _info('[OWebView] ready!');
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
    OWebView.SELF = id();
    OWebView.EVT_VIEW_FREEZE = id();
    OWebView.EVT_VIEW_UNFREEZE = id();
    OWebView.EVT_VIEW_DIALOG = id();
    return OWebView;
})();
export default OWebView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBUzFDO0lBQUEsTUFBcUIsUUFBUyxTQUFRLFNBQVM7UUFROUM7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQUhELG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1lBSWxDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRDs7V0FFRztRQUNILFFBQVE7WUFDUCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsTUFBTTtZQUNMLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUV0QixJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUN2QztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOztXQUVHO1FBQ0gsUUFBUTtZQUNQLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNwQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBRXRCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ3pDO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUNMLE1BQXdDLEVBQ3hDLGNBQXVCLEtBQUs7WUFFNUIsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO1lBRWYsSUFBSyxDQUF3QixDQUFDLEtBQUssRUFBRTtnQkFDcEMsQ0FBQyxHQUFHO29CQUNILElBQUksRUFBRyxDQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO29CQUN4RCxJQUFJLEVBQUcsQ0FBd0IsQ0FBQyxHQUFHO29CQUNuQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO2lCQUNsQixDQUFDO2FBQ0Y7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILFFBQVEsQ0FBQyxPQUE2QjtZQUNyQyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILFVBQVUsQ0FBQyxPQUE2QjtZQUN2QyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsUUFBUSxDQUNQLE9BSVM7WUFFVCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDOztJQXBHZSxhQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWix3QkFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3ZCLDBCQUFpQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3pCLHdCQUFlLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFrR3hDLGVBQUM7S0FBQTtlQXRHb0IsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xyXG5pbXBvcnQgeyBpZCwgX2luZm8gfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuaW1wb3J0IHsgSU9ab25lQXBpSlNPTiB9IGZyb20gJy4vb3pvbmUnO1xyXG5cclxuZXhwb3J0IHR5cGUgdFZpZXdEaWFsb2cgPSB7XHJcblx0dHlwZTogJ2luZm8nIHwgJ2Vycm9yJyB8ICdkb25lJztcclxuXHR0ZXh0OiBzdHJpbmc7XHJcblx0ZGF0YT86IHt9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlZpZXcgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX1ZJRVdfRlJFRVpFID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX1ZJRVdfVU5GUkVFWkUgPSBpZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfVklFV19ESUFMT0cgPSBpZCgpO1xyXG5cclxuXHRwcml2YXRlIF9mcmVlemVDb3VudGVyOiBudW1iZXIgPSAwO1xyXG5cclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRfaW5mbygnW09XZWJWaWV3XSByZWFkeSEnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiB0aGUgdmlldyBpcyBmcm96ZW4uXHJcblx0ICovXHJcblx0aXNGcm96ZW4oKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLl9mcmVlemVDb3VudGVyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRvIGZyZWV6ZSB0aGUgdmlldy5cclxuXHQgKi9cclxuXHRmcmVlemUoKSB7XHJcblx0XHQrK3RoaXMuX2ZyZWV6ZUNvdW50ZXI7XHJcblxyXG5cdFx0aWYgKHRoaXMuX2ZyZWV6ZUNvdW50ZXIgPT09IDEpIHtcclxuXHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJWaWV3LkVWVF9WSUVXX0ZSRUVaRSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVbmZyZWV6ZSB0aGUgdmlldy5cclxuXHQgKi9cclxuXHR1bmZyZWV6ZSgpIHtcclxuXHRcdGlmICh0aGlzLmlzRnJvemVuKCkpIHtcclxuXHRcdFx0LS10aGlzLl9mcmVlemVDb3VudGVyO1xyXG5cclxuXHRcdFx0aWYgKCF0aGlzLmlzRnJvemVuKCkpIHtcclxuXHRcdFx0XHR0aGlzLnRyaWdnZXIoT1dlYlZpZXcuRVZUX1ZJRVdfVU5GUkVFWkUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUcmlnZ2VyIGRpYWxvZyBldmVudCB0byB0aGUgdmlldy5cclxuXHQgKiBAcGFyYW0gZGlhbG9nXHJcblx0ICogQHBhcmFtIGNhblVzZUFsZXJ0XHJcblx0ICovXHJcblx0ZGlhbG9nKFxyXG5cdFx0ZGlhbG9nOiB0Vmlld0RpYWxvZyB8IElPWm9uZUFwaUpTT048YW55PixcclxuXHRcdGNhblVzZUFsZXJ0OiBib29sZWFuID0gZmFsc2UsXHJcblx0KSB7XHJcblx0XHRsZXQgZCA9IGRpYWxvZztcclxuXHJcblx0XHRpZiAoKGQgYXMgSU9ab25lQXBpSlNPTjxhbnk+KS5lcnJvcikge1xyXG5cdFx0XHRkID0ge1xyXG5cdFx0XHRcdHR5cGU6IChkIGFzIElPWm9uZUFwaUpTT048YW55PikuZXJyb3IgPyAnZXJyb3InIDogJ2RvbmUnLFxyXG5cdFx0XHRcdHRleHQ6IChkIGFzIElPWm9uZUFwaUpTT048YW55PikubXNnLFxyXG5cdFx0XHRcdGRhdGE6IGQuZGF0YSB8fCB7fSxcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYlZpZXcuRVZUX1ZJRVdfRElBTE9HLCBbZCwgY2FuVXNlQWxlcnRdKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVyIGZyZWV6ZSBldmVudCBoYW5kbGVyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGhhbmRsZXJcclxuXHQgKi9cclxuXHRvbkZyZWV6ZShoYW5kbGVyOiAodGhpczogdGhpcykgPT4gdm9pZCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYlZpZXcuRVZUX1ZJRVdfRlJFRVpFLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVyIHVuZnJlZXplIGV2ZW50IGhhbmRsZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaGFuZGxlclxyXG5cdCAqL1xyXG5cdG9uVW5GcmVlemUoaGFuZGxlcjogKHRoaXM6IHRoaXMpID0+IHZvaWQpIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJWaWV3LkVWVF9WSUVXX1VORlJFRVpFLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVyIGRpYWxvZyBldmVudCBoYW5kbGVyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGhhbmRsZXJcclxuXHQgKi9cclxuXHRvbkRpYWxvZyhcclxuXHRcdGhhbmRsZXI6IChcclxuXHRcdFx0dGhpczogdGhpcyxcclxuXHRcdFx0ZGlhbG9nOiB0Vmlld0RpYWxvZyxcclxuXHRcdFx0Y2FuVXNlQWxlcnQ6IGJvb2xlYW4sXHJcblx0XHQpID0+IHZvaWQsXHJcblx0KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViVmlldy5FVlRfVklFV19ESUFMT0csIGhhbmRsZXIpO1xyXG5cdH1cclxufVxyXG4iXX0=