"use strict";
import OWebEvent from "../OWebEvent";
export default class OWebPassword extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    stepStart(form) {
        let ofv = this.app_context.getFormValidator(form, ["phone"]), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(["phone", "cc2"]);
            formData.set("step", String(OWebPassword.PASSWORD_EDIT_STEP_START));
            this._sendForm(form, formData, OWebPassword.PASSWORD_EDIT_STEP_VALIDATE);
        }
    }
    stepValidate(form) {
        let ofv = this.app_context.getFormValidator(form, ["code"]);
        if (ofv.validate()) {
            this._sendForm(form, {
                "step": OWebPassword.PASSWORD_EDIT_STEP_VALIDATE,
                "code": ofv.getField("code")
            }, OWebPassword.PASSWORD_EDIT_STEP_END);
        }
    }
    stepEnd(form) {
        let required = ["pass", "vpass"], ofv = this.app_context.getFormValidator(form, required), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(required);
            formData.set("step", String(OWebPassword.PASSWORD_EDIT_STEP_END));
            this._sendForm(form, formData);
        }
    }
    _sendForm(form, data, next_step) {
        let m = this, url = m.app_context.url.get("OZ_SERVER_PASSWORD_EDIT_SERVICE");
        m.app_context.request("POST", url, data, function (response) {
            if (next_step) {
                m.trigger(OWebPassword.EVT_NEXT_STEP, [{ "response": response, "step": next_step, }]);
            }
            else {
                m.trigger(OWebPassword.EVT_PASSWORD_EDIT_SUCCESS, [{ "response": response }]);
            }
        }, function (response) {
            m.trigger(OWebPassword.EVT_PASSWORD_EDIT_ERROR, [{ "response": response }]);
        }, true);
    }
}
OWebPassword.PASSWORD_EDIT_STEP_START = 1;
OWebPassword.PASSWORD_EDIT_STEP_VALIDATE = 2;
OWebPassword.PASSWORD_EDIT_STEP_END = 3;
OWebPassword.EVT_NEXT_STEP = "OWebPassword:next_step";
OWebPassword.EVT_PASSWORD_EDIT_SUCCESS = "OWebPassword:success";
OWebPassword.EVT_PASSWORD_EDIT_ERROR = "OWebPassword:error";
OWebPassword.SELF = "OWebPassword";
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhc3N3b3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYlBhc3N3b3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUdyQyxNQUFNLENBQUMsT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBV2xELFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO0lBRWpELENBQUM7SUFFRCxTQUFTLENBQUMsSUFBcUI7UUFDOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUMzRCxRQUFRLENBQUM7UUFFVixJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNuQixRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUN6RTtJQUNGLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBcUI7UUFDakMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTVELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO2dCQUNwQixNQUFNLEVBQUUsWUFBWSxDQUFDLDJCQUEyQjtnQkFDaEQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzVCLEVBQUUsWUFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDeEM7SUFFRixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQXFCO1FBQzVCLElBQUksUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUMvQixHQUFHLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQzVELFFBQVEsQ0FBQztRQUVWLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBRWxFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0lBQ0YsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFxQixFQUFFLElBQVMsRUFBRSxTQUFrQjtRQUM3RCxJQUFJLENBQUMsR0FBSyxJQUFJLEVBQ2IsR0FBRyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBRWhFLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFVBQVUsUUFBYTtZQUMvRCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsR0FBRSxDQUFDLENBQUMsQ0FBQzthQUNwRjtpQkFBTTtnQkFDTixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUM1RTtRQUNGLENBQUMsRUFBRSxVQUFVLFFBQWE7WUFDekIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQzs7QUE5RGUscUNBQXdCLEdBQU0sQ0FBQyxDQUFDO0FBQ2hDLHdDQUEyQixHQUFHLENBQUMsQ0FBQztBQUNoQyxtQ0FBc0IsR0FBUSxDQUFDLENBQUM7QUFFaEMsMEJBQWEsR0FBZSx3QkFBd0IsQ0FBQztBQUNyRCxzQ0FBeUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNuRCxvQ0FBdUIsR0FBSyxvQkFBb0IsQ0FBQztBQUNqRCxpQkFBSSxHQUF3QixjQUFjLENBQUM7QUF3RDNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSBcIi4uL09XZWJFdmVudFwiO1xyXG5pbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi4vT1dlYkFwcFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlBhc3N3b3JkIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IFBBU1NXT1JEX0VESVRfU1RFUF9TVEFSVCAgICA9IDE7XHJcblx0c3RhdGljIHJlYWRvbmx5IFBBU1NXT1JEX0VESVRfU1RFUF9WQUxJREFURSA9IDI7XHJcblx0c3RhdGljIHJlYWRvbmx5IFBBU1NXT1JEX0VESVRfU1RFUF9FTkQgICAgICA9IDM7XHJcblxyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfTkVYVF9TVEVQICAgICAgICAgICAgID0gXCJPV2ViUGFzc3dvcmQ6bmV4dF9zdGVwXCI7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQVNTV09SRF9FRElUX1NVQ0NFU1MgPSBcIk9XZWJQYXNzd29yZDpzdWNjZXNzXCI7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQVNTV09SRF9FRElUX0VSUk9SICAgPSBcIk9XZWJQYXNzd29yZDplcnJvclwiO1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGICAgICAgICAgICAgICAgICAgICAgID0gXCJPV2ViUGFzc3dvcmRcIjtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHR9XHJcblxyXG5cdHN0ZXBTdGFydChmb3JtOiBIVE1MRm9ybUVsZW1lbnQpIHtcclxuXHRcdGxldCBvZnYgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgW1wicGhvbmVcIl0pLFxyXG5cdFx0XHRmb3JtRGF0YTtcclxuXHJcblx0XHRpZiAob2Z2LnZhbGlkYXRlKCkpIHtcclxuXHRcdFx0Zm9ybURhdGEgPSBvZnYuZ2V0Rm9ybURhdGEoW1wicGhvbmVcIiwgXCJjYzJcIl0pO1xyXG5cdFx0XHRmb3JtRGF0YS5zZXQoXCJzdGVwXCIsIFN0cmluZyhPV2ViUGFzc3dvcmQuUEFTU1dPUkRfRURJVF9TVEVQX1NUQVJUKSk7XHJcblx0XHRcdHRoaXMuX3NlbmRGb3JtKGZvcm0sIGZvcm1EYXRhLCBPV2ViUGFzc3dvcmQuUEFTU1dPUkRfRURJVF9TVEVQX1ZBTElEQVRFKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0ZXBWYWxpZGF0ZShmb3JtOiBIVE1MRm9ybUVsZW1lbnQpIHtcclxuXHRcdGxldCBvZnYgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgW1wiY29kZVwiXSk7XHJcblxyXG5cdFx0aWYgKG9mdi52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdHRoaXMuX3NlbmRGb3JtKGZvcm0sIHtcclxuXHRcdFx0XHRcInN0ZXBcIjogT1dlYlBhc3N3b3JkLlBBU1NXT1JEX0VESVRfU1RFUF9WQUxJREFURSxcclxuXHRcdFx0XHRcImNvZGVcIjogb2Z2LmdldEZpZWxkKFwiY29kZVwiKVxyXG5cdFx0XHR9LCBPV2ViUGFzc3dvcmQuUEFTU1dPUkRfRURJVF9TVEVQX0VORCk7XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0c3RlcEVuZChmb3JtOiBIVE1MRm9ybUVsZW1lbnQpIHtcclxuXHRcdGxldCByZXF1aXJlZCA9IFtcInBhc3NcIiwgXCJ2cGFzc1wiXSxcclxuXHRcdFx0b2Z2ICAgICAgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgcmVxdWlyZWQpLFxyXG5cdFx0XHRmb3JtRGF0YTtcclxuXHJcblx0XHRpZiAob2Z2LnZhbGlkYXRlKCkpIHtcclxuXHRcdFx0Zm9ybURhdGEgPSBvZnYuZ2V0Rm9ybURhdGEocmVxdWlyZWQpO1xyXG5cdFx0XHRmb3JtRGF0YS5zZXQoXCJzdGVwXCIsIFN0cmluZyhPV2ViUGFzc3dvcmQuUEFTU1dPUkRfRURJVF9TVEVQX0VORCkpO1xyXG5cclxuXHRcdFx0dGhpcy5fc2VuZEZvcm0oZm9ybSwgZm9ybURhdGEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0X3NlbmRGb3JtKGZvcm06IEhUTUxGb3JtRWxlbWVudCwgZGF0YTogYW55LCBuZXh0X3N0ZXA/OiBudW1iZXIpIHtcclxuXHRcdGxldCBtICAgPSB0aGlzLFxyXG5cdFx0XHR1cmwgPSBtLmFwcF9jb250ZXh0LnVybC5nZXQoXCJPWl9TRVJWRVJfUEFTU1dPUkRfRURJVF9TRVJWSUNFXCIpO1xyXG5cclxuXHRcdG0uYXBwX2NvbnRleHQucmVxdWVzdChcIlBPU1RcIiwgdXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cdFx0XHRpZiAobmV4dF9zdGVwKSB7XHJcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJQYXNzd29yZC5FVlRfTkVYVF9TVEVQLCBbe1wicmVzcG9uc2VcIjogcmVzcG9uc2UsIFwic3RlcFwiOiBuZXh0X3N0ZXAsfV0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViUGFzc3dvcmQuRVZUX1BBU1NXT1JEX0VESVRfU1VDQ0VTUywgW3tcInJlc3BvbnNlXCI6IHJlc3BvbnNlfV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9LCBmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cdFx0XHRtLnRyaWdnZXIoT1dlYlBhc3N3b3JkLkVWVF9QQVNTV09SRF9FRElUX0VSUk9SLCBbe1wicmVzcG9uc2VcIjogcmVzcG9uc2V9XSk7XHJcblx0XHR9LCB0cnVlKTtcclxuXHR9XHJcbn07XHJcbiJdfQ==