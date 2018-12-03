import OWebEvent from "../OWebEvent";
import Utils from "../utils/Utils";
export default class OWebAccountRecovery extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    stepStart(form) {
        let ofv = this.app_context.getFormValidator(form, ["phone"]), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(["phone", "cc2"]);
            formData.set("step", String(OWebAccountRecovery.AR_STEP_START));
            this._sendForm(form, formData, OWebAccountRecovery.AR_STEP_VALIDATE);
        }
    }
    stepValidate(form) {
        let ofv = this.app_context.getFormValidator(form, ["code"]);
        if (ofv.validate()) {
            this._sendForm(form, {
                "step": OWebAccountRecovery.AR_STEP_VALIDATE,
                "code": ofv.getField("code")
            }, OWebAccountRecovery.AR_STEP_END);
        }
    }
    stepEnd(form) {
        let required = ["pass", "vpass"], ofv = this.app_context.getFormValidator(form, required), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(required);
            formData.set("step", String(OWebAccountRecovery.AR_STEP_END));
            this._sendForm(form, formData);
        }
    }
    onError(handler) {
        return this.on(OWebAccountRecovery.EVT_AR_ERROR, handler);
    }
    onNextStep(handler) {
        return this.on(OWebAccountRecovery.EVT_AR_NEXT_STEP, handler);
    }
    onSuccess(handler) {
        return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
    }
    _sendForm(form, data, next_step) {
        let m = this, url = m.app_context.url.get("OZ_SERVER_ACCOUNT_RECOVERY_SERVICE");
        m.app_context.request("POST", url, data, function (response) {
            if (next_step) {
                m.trigger(OWebAccountRecovery.EVT_AR_NEXT_STEP, [response, next_step]);
            }
            else {
                m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
            }
        }, function (response) {
            m.trigger(OWebAccountRecovery.EVT_AR_ERROR, [response]);
        }, true);
    }
}
OWebAccountRecovery.SELF = Utils.id();
OWebAccountRecovery.EVT_AR_NEXT_STEP = Utils.id();
OWebAccountRecovery.EVT_AR_SUCCESS = Utils.id();
OWebAccountRecovery.EVT_AR_ERROR = Utils.id();
OWebAccountRecovery.AR_STEP_START = 1;
OWebAccountRecovery.AR_STEP_VALIDATE = 2;
OWebAccountRecovery.AR_STEP_END = 3;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFjY291bnRSZWNvdmVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJBY2NvdW50UmVjb3ZlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBQ3JDLE9BQU8sS0FBSyxNQUFNLGdCQUFnQixDQUFDO0FBRW5DLE1BQU0sQ0FBQyxPQUFPLDBCQUEyQixTQUFRLFNBQVM7SUFXekQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7SUFFakQsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFxQjtRQUM5QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQzNELFFBQVEsQ0FBQztRQUVWLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0MsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDckU7SUFDRixDQUFDO0lBRUQsWUFBWSxDQUFDLElBQXFCO1FBQ2pDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU1RCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDcEIsTUFBTSxFQUFFLG1CQUFtQixDQUFDLGdCQUFnQjtnQkFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzVCLEVBQUUsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDcEM7SUFFRixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQXFCO1FBQzVCLElBQUksUUFBUSxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUMvQixHQUFHLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQzVELFFBQVEsQ0FBQztRQUVWLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0lBQ0YsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUF5QztRQUNoRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxVQUFVLENBQUMsT0FBdUQ7UUFDakUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBeUM7UUFDbEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQXFCLEVBQUUsSUFBUyxFQUFFLFNBQWtCO1FBQzdELElBQUksQ0FBQyxHQUFLLElBQUksRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFFbkUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxRQUFhO1lBQy9ELElBQUksU0FBUyxFQUFFO2dCQUNkLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN2RTtpQkFBTTtnQkFDTixDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7UUFDRixDQUFDLEVBQUUsVUFBVSxRQUFhO1lBQ3pCLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDOztBQTFFZSx3QkFBSSxHQUFlLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUM5QixvQ0FBZ0IsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDOUIsa0NBQWMsR0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDOUIsZ0NBQVksR0FBTyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFFOUIsaUNBQWEsR0FBTSxDQUFDLENBQUM7QUFDckIsb0NBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLCtCQUFXLEdBQVEsQ0FBQyxDQUFDO0FBb0VyQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4uL09XZWJBcHBcIjtcclxuaW1wb3J0IHtpQ29tUmVzcG9uc2V9IGZyb20gXCIuLi9PV2ViQ29tXCI7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSBcIi4uL09XZWJFdmVudFwiO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4uL3V0aWxzL1V0aWxzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQWNjb3VudFJlY292ZXJ5IGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgICAgICAgICAgICAgPSBVdGlscy5pZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfQVJfTkVYVF9TVEVQID0gVXRpbHMuaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FSX1NVQ0NFU1MgICA9IFV0aWxzLmlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUl9FUlJPUiAgICAgPSBVdGlscy5pZCgpO1xyXG5cclxuXHRzdGF0aWMgcmVhZG9ubHkgQVJfU1RFUF9TVEFSVCAgICA9IDE7XHJcblx0c3RhdGljIHJlYWRvbmx5IEFSX1NURVBfVkFMSURBVEUgPSAyO1xyXG5cdHN0YXRpYyByZWFkb25seSBBUl9TVEVQX0VORCAgICAgID0gMztcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHR9XHJcblxyXG5cdHN0ZXBTdGFydChmb3JtOiBIVE1MRm9ybUVsZW1lbnQpIHtcclxuXHRcdGxldCBvZnYgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgW1wicGhvbmVcIl0pLFxyXG5cdFx0XHRmb3JtRGF0YTtcclxuXHJcblx0XHRpZiAob2Z2LnZhbGlkYXRlKCkpIHtcclxuXHRcdFx0Zm9ybURhdGEgPSBvZnYuZ2V0Rm9ybURhdGEoW1wicGhvbmVcIiwgXCJjYzJcIl0pO1xyXG5cdFx0XHRmb3JtRGF0YS5zZXQoXCJzdGVwXCIsIFN0cmluZyhPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfU1RBUlQpKTtcclxuXHRcdFx0dGhpcy5fc2VuZEZvcm0oZm9ybSwgZm9ybURhdGEsIE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9WQUxJREFURSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGVwVmFsaWRhdGUoZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XHJcblx0XHRsZXQgb2Z2ID0gdGhpcy5hcHBfY29udGV4dC5nZXRGb3JtVmFsaWRhdG9yKGZvcm0sIFtcImNvZGVcIl0pO1xyXG5cclxuXHRcdGlmIChvZnYudmFsaWRhdGUoKSkge1xyXG5cdFx0XHR0aGlzLl9zZW5kRm9ybShmb3JtLCB7XHJcblx0XHRcdFx0XCJzdGVwXCI6IE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9WQUxJREFURSxcclxuXHRcdFx0XHRcImNvZGVcIjogb2Z2LmdldEZpZWxkKFwiY29kZVwiKVxyXG5cdFx0XHR9LCBPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfRU5EKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRzdGVwRW5kKGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xyXG5cdFx0bGV0IHJlcXVpcmVkID0gW1wicGFzc1wiLCBcInZwYXNzXCJdLFxyXG5cdFx0XHRvZnYgICAgICA9IHRoaXMuYXBwX2NvbnRleHQuZ2V0Rm9ybVZhbGlkYXRvcihmb3JtLCByZXF1aXJlZCksXHJcblx0XHRcdGZvcm1EYXRhO1xyXG5cclxuXHRcdGlmIChvZnYudmFsaWRhdGUoKSkge1xyXG5cdFx0XHRmb3JtRGF0YSA9IG9mdi5nZXRGb3JtRGF0YShyZXF1aXJlZCk7XHJcblx0XHRcdGZvcm1EYXRhLnNldChcInN0ZXBcIiwgU3RyaW5nKE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9FTkQpKTtcclxuXHJcblx0XHRcdHRoaXMuX3NlbmRGb3JtKGZvcm0sIGZvcm1EYXRhKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdG9uRXJyb3IoaGFuZGxlcjogKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHZvaWQpOiB0aGlzIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBY2NvdW50UmVjb3ZlcnkuRVZUX0FSX0VSUk9SLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uTmV4dFN0ZXAoaGFuZGxlcjogKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UsIHN0ZXA6IG51bWJlcikgPT4gdm9pZCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfTkVYVF9TVEVQLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uU3VjY2VzcyhoYW5kbGVyOiAocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfU1VDQ0VTUywgaGFuZGxlcik7XHJcblx0fVxyXG5cclxuXHRfc2VuZEZvcm0oZm9ybTogSFRNTEZvcm1FbGVtZW50LCBkYXRhOiBhbnksIG5leHRfc3RlcD86IG51bWJlcikge1xyXG5cdFx0bGV0IG0gICA9IHRoaXMsXHJcblx0XHRcdHVybCA9IG0uYXBwX2NvbnRleHQudXJsLmdldChcIk9aX1NFUlZFUl9BQ0NPVU5UX1JFQ09WRVJZX1NFUlZJQ0VcIik7XHJcblxyXG5cdFx0bS5hcHBfY29udGV4dC5yZXF1ZXN0KFwiUE9TVFwiLCB1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XHJcblx0XHRcdGlmIChuZXh0X3N0ZXApIHtcclxuXHRcdFx0XHRtLnRyaWdnZXIoT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfTkVYVF9TVEVQLCBbcmVzcG9uc2UsIG5leHRfc3RlcF0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9TVUNDRVNTLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcclxuXHRcdFx0bS50cmlnZ2VyKE9XZWJBY2NvdW50UmVjb3ZlcnkuRVZUX0FSX0VSUk9SLCBbcmVzcG9uc2VdKTtcclxuXHRcdH0sIHRydWUpO1xyXG5cdH1cclxufTtcclxuIl19