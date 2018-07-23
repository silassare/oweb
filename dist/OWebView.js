"use strict";
import OWebEvent from "./OWebEvent";
export default class OWebView extends OWebEvent {
    constructor() {
        super();
        this._freeze_counter = 0;
        console.log("[OWebView] ready!");
    }
    isFrozen() {
        return Boolean(this._freeze_counter);
    }
    freeze() {
        ++this._freeze_counter;
        if (this._freeze_counter === 1) {
            this.trigger(OWebView.EVT_VIEW_FREEZE);
        }
        return this;
    }
    unfreeze() {
        if (this.isFrozen()) {
            --this._freeze_counter;
            if (!this.isFrozen()) {
                this.trigger(OWebView.EVT_VIEW_UNFREEZE);
            }
        }
        return this;
    }
    dialog(dialog) {
        let d = dialog;
        if (dialog.error) {
            d = {
                "type": dialog.error ? "error" : "done",
                "text": dialog.msg,
                "data": dialog.data || {}
            };
            // console.error("[OWebView] please use new dialog mode -> ", d, "instead of ->", dialog);
        }
        this.trigger(OWebView.EVT_VIEW_DIALOG, [d]);
    }
}
OWebView.EVT_VIEW_FREEZE = "OWebView:freeze";
OWebView.EVT_VIEW_UNFREEZE = "OWebView:unfreeze";
OWebView.EVT_VIEW_DIALOG = "OWebView:dialog";
OWebView.SELF = "OWebView";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBUXBDLE1BQU0sQ0FBQyxPQUFPLGVBQWdCLFNBQVEsU0FBUztJQVM5QztRQUNDLEtBQUssRUFBRSxDQUFDO1FBSEQsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFJbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxRQUFRO1FBQ1AsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxNQUFNO1FBQ0wsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRXZCLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDdkM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxRQUFRO1FBQ1AsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDcEIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO1lBRXZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDekM7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUF5QjtRQUMvQixJQUFJLENBQUMsR0FBZ0IsTUFBTSxDQUFDO1FBRTVCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNqQixDQUFDLEdBQUc7Z0JBQ0gsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtnQkFDdkMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHO2dCQUNsQixNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO2FBQ3pCLENBQUM7WUFFRiwwRkFBMEY7U0FDMUY7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7O0FBcERlLHdCQUFlLEdBQUssaUJBQWlCLENBQUM7QUFDdEMsMEJBQWlCLEdBQUcsbUJBQW1CLENBQUM7QUFDeEMsd0JBQWUsR0FBSyxpQkFBaUIsQ0FBQztBQUN0QyxhQUFJLEdBQWdCLFVBQVUsQ0FBQyJ9