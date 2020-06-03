import OWebEvent from './OWebEvent';
import { id, logger } from './utils';
let OWebView = /** @class */ (() => {
    class OWebView extends OWebEvent {
        constructor() {
            super();
            this._freezeCounter = 0;
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
    OWebView.SELF = id();
    OWebView.EVT_VIEW_FREEZE = id();
    OWebView.EVT_VIEW_UNFREEZE = id();
    OWebView.EVT_VIEW_DIALOG = id();
    return OWebView;
})();
export default OWebView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBU3JDO0lBQUEsTUFBcUIsUUFBUyxTQUFRLFNBQVM7UUFROUM7WUFDQyxLQUFLLEVBQUUsQ0FBQztZQUhELG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1lBSWxDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxRQUFRO1lBQ1AsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRDs7V0FFRztRQUNILE1BQU07WUFDTCxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7WUFFdEIsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDdkM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRDs7V0FFRztRQUNILFFBQVE7WUFDUCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDcEIsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUV0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUN6QzthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE1BQU0sQ0FDTCxNQUF3QyxFQUN4QyxjQUF1QixLQUFLO1lBRTVCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUVmLElBQUssQ0FBd0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BDLENBQUMsR0FBRztvQkFDSCxJQUFJLEVBQUcsQ0FBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtvQkFDeEQsSUFBSSxFQUFHLENBQXdCLENBQUMsR0FBRztvQkFDbkMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtpQkFDbEIsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxRQUFRLENBQUMsT0FBNkI7WUFDckMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxVQUFVLENBQUMsT0FBNkI7WUFDdkMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILFFBQVEsQ0FDUCxPQUlTO1lBRVQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsQ0FBQzs7SUFwR2UsYUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ1osd0JBQWUsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN2QiwwQkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN6Qix3QkFBZSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBa0d4QyxlQUFDO0tBQUE7ZUF0R29CLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgaWQsIGxvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBJT1pvbmVBcGlKU09OIH0gZnJvbSAnLi9vem9uZSc7XHJcblxyXG5leHBvcnQgdHlwZSB0Vmlld0RpYWxvZyA9IHtcclxuXHR0eXBlOiAnaW5mbycgfCAnZXJyb3InIHwgJ2RvbmUnO1xyXG5cdHRleHQ6IHN0cmluZztcclxuXHRkYXRhPzoge307XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVmlldyBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgPSBpZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfVklFV19GUkVFWkUgPSBpZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfVklFV19VTkZSRUVaRSA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9WSUVXX0RJQUxPRyA9IGlkKCk7XHJcblxyXG5cdHByaXZhdGUgX2ZyZWV6ZUNvdW50ZXI6IG51bWJlciA9IDA7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdGxvZ2dlci5pbmZvKCdbT1dlYlZpZXddIHJlYWR5IScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB2aWV3IGlzIGZyb3plbi5cclxuXHQgKi9cclxuXHRpc0Zyb3plbigpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiBCb29sZWFuKHRoaXMuX2ZyZWV6ZUNvdW50ZXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVG8gZnJlZXplIHRoZSB2aWV3LlxyXG5cdCAqL1xyXG5cdGZyZWV6ZSgpIHtcclxuXHRcdCsrdGhpcy5fZnJlZXplQ291bnRlcjtcclxuXHJcblx0XHRpZiAodGhpcy5fZnJlZXplQ291bnRlciA9PT0gMSkge1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoT1dlYlZpZXcuRVZUX1ZJRVdfRlJFRVpFKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVuZnJlZXplIHRoZSB2aWV3LlxyXG5cdCAqL1xyXG5cdHVuZnJlZXplKCkge1xyXG5cdFx0aWYgKHRoaXMuaXNGcm96ZW4oKSkge1xyXG5cdFx0XHQtLXRoaXMuX2ZyZWV6ZUNvdW50ZXI7XHJcblxyXG5cdFx0XHRpZiAoIXRoaXMuaXNGcm96ZW4oKSkge1xyXG5cdFx0XHRcdHRoaXMudHJpZ2dlcihPV2ViVmlldy5FVlRfVklFV19VTkZSRUVaRSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRyaWdnZXIgZGlhbG9nIGV2ZW50IHRvIHRoZSB2aWV3LlxyXG5cdCAqIEBwYXJhbSBkaWFsb2dcclxuXHQgKiBAcGFyYW0gY2FuVXNlQWxlcnRcclxuXHQgKi9cclxuXHRkaWFsb2coXHJcblx0XHRkaWFsb2c6IHRWaWV3RGlhbG9nIHwgSU9ab25lQXBpSlNPTjxhbnk+LFxyXG5cdFx0Y2FuVXNlQWxlcnQ6IGJvb2xlYW4gPSBmYWxzZSxcclxuXHQpIHtcclxuXHRcdGxldCBkID0gZGlhbG9nO1xyXG5cclxuXHRcdGlmICgoZCBhcyBJT1pvbmVBcGlKU09OPGFueT4pLmVycm9yKSB7XHJcblx0XHRcdGQgPSB7XHJcblx0XHRcdFx0dHlwZTogKGQgYXMgSU9ab25lQXBpSlNPTjxhbnk+KS5lcnJvciA/ICdlcnJvcicgOiAnZG9uZScsXHJcblx0XHRcdFx0dGV4dDogKGQgYXMgSU9ab25lQXBpSlNPTjxhbnk+KS5tc2csXHJcblx0XHRcdFx0ZGF0YTogZC5kYXRhIHx8IHt9LFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMudHJpZ2dlcihPV2ViVmlldy5FVlRfVklFV19ESUFMT0csIFtkLCBjYW5Vc2VBbGVydF0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXIgZnJlZXplIGV2ZW50IGhhbmRsZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaGFuZGxlclxyXG5cdCAqL1xyXG5cdG9uRnJlZXplKGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViVmlldy5FVlRfVklFV19GUkVFWkUsIGhhbmRsZXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXIgdW5mcmVlemUgZXZlbnQgaGFuZGxlci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBoYW5kbGVyXHJcblx0ICovXHJcblx0b25VbkZyZWV6ZShoYW5kbGVyOiAodGhpczogdGhpcykgPT4gdm9pZCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYlZpZXcuRVZUX1ZJRVdfVU5GUkVFWkUsIGhhbmRsZXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXIgZGlhbG9nIGV2ZW50IGhhbmRsZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaGFuZGxlclxyXG5cdCAqL1xyXG5cdG9uRGlhbG9nKFxyXG5cdFx0aGFuZGxlcjogKFxyXG5cdFx0XHR0aGlzOiB0aGlzLFxyXG5cdFx0XHRkaWFsb2c6IHRWaWV3RGlhbG9nLFxyXG5cdFx0XHRjYW5Vc2VBbGVydDogYm9vbGVhbixcclxuXHRcdCkgPT4gdm9pZCxcclxuXHQpIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJWaWV3LkVWVF9WSUVXX0RJQUxPRywgaGFuZGxlcik7XHJcblx0fVxyXG59XHJcbiJdfQ==