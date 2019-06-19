import OWebEvent from "../OWebEvent";
import Utils from "../utils/Utils";
export default class OWebPassword extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    editPass(form, uid) {
        let m = this, url = m.app_context.url.get("OZ_SERVER_PASSWORD_SERVICE"), required = uid ? ["pass", "vpass"] : ["cpass", "pass", "vpass"], ofv = this.app_context.getFormValidator(form, required), formData;
        if (!ofv.validate()) {
            return;
        }
        formData = ofv.getFormData(required);
        formData.append("action", "edit");
        if (uid) {
            formData.append("uid", uid);
        }
        m.app_context.request("POST", url, formData, function (response) {
            m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
        }, function (response) {
            m.trigger(OWebPassword.EVT_PASS_EDIT_ERROR, [response]);
        }, true);
    }
    onError(handler) {
        return this.on(OWebPassword.EVT_PASS_EDIT_ERROR, handler);
    }
    onSuccess(handler) {
        return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
    }
}
OWebPassword.SELF = Utils.id();
OWebPassword.EVT_PASS_EDIT_SUCCESS = Utils.id();
OWebPassword.EVT_PASS_EDIT_ERROR = Utils.id();
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhc3N3b3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYlBhc3N3b3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUNyQyxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQztBQUVuQyxNQUFNLENBQUMsT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBTWxELFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO0lBRWpELENBQUM7SUFFRCxRQUFRLENBQUMsSUFBcUIsRUFBRSxHQUFZO1FBQzNDLElBQUksQ0FBQyxHQUFVLElBQUksRUFDbEIsR0FBRyxHQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxFQUM5RCxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUMvRCxHQUFHLEdBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQzVELFFBQVEsQ0FBQztRQUVWLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDcEIsT0FBTztTQUNQO1FBRUQsUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFbEMsSUFBSSxHQUFHLEVBQUU7WUFDUixRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM1QjtRQUVELENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsUUFBYTtZQUNuRSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxFQUFFLFVBQVUsUUFBYTtZQUN6QixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUFxRDtRQUM1RCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBcUQ7UUFDOUQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDOztBQXZDZSxpQkFBSSxHQUFvQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDbkMsa0NBQXFCLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ25DLGdDQUFtQixHQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQXNDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gXCIuLi9PV2ViQXBwXCI7XHJcbmltcG9ydCB7aUNvbVJlc3BvbnNlfSBmcm9tIFwiLi4vT1dlYkNvbVwiO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuLi9PV2ViRXZlbnRcIjtcclxuaW1wb3J0IFV0aWxzIGZyb20gXCIuLi91dGlscy9VdGlsc1wiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlBhc3N3b3JkIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgICAgICAgICAgICAgICAgICA9IFV0aWxzLmlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQVNTX0VESVRfU1VDQ0VTUyA9IFV0aWxzLmlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQVNTX0VESVRfRVJST1IgICA9IFV0aWxzLmlkKCk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0fVxyXG5cclxuXHRlZGl0UGFzcyhmb3JtOiBIVE1MRm9ybUVsZW1lbnQsIHVpZD86IHN0cmluZykge1xyXG5cdFx0bGV0IG0gICAgICAgID0gdGhpcyxcclxuXHRcdFx0dXJsICAgICAgPSBtLmFwcF9jb250ZXh0LnVybC5nZXQoXCJPWl9TRVJWRVJfUEFTU1dPUkRfU0VSVklDRVwiKSxcclxuXHRcdFx0cmVxdWlyZWQgPSB1aWQgPyBbXCJwYXNzXCIsIFwidnBhc3NcIl0gOiBbXCJjcGFzc1wiLCBcInBhc3NcIiwgXCJ2cGFzc1wiXSxcclxuXHRcdFx0b2Z2ICAgICAgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgcmVxdWlyZWQpLFxyXG5cdFx0XHRmb3JtRGF0YTtcclxuXHJcblx0XHRpZiAoIW9mdi52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRmb3JtRGF0YSA9IG9mdi5nZXRGb3JtRGF0YShyZXF1aXJlZCk7XHJcblx0XHRmb3JtRGF0YS5hcHBlbmQoXCJhY3Rpb25cIiwgXCJlZGl0XCIpO1xyXG5cclxuXHRcdGlmICh1aWQpIHtcclxuXHRcdFx0Zm9ybURhdGEuYXBwZW5kKFwidWlkXCIsIHVpZCk7XHJcblx0XHR9XHJcblxyXG5cdFx0bS5hcHBfY29udGV4dC5yZXF1ZXN0KFwiUE9TVFwiLCB1cmwsIGZvcm1EYXRhLCBmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cdFx0XHRtLnRyaWdnZXIoT1dlYlBhc3N3b3JkLkVWVF9QQVNTX0VESVRfU1VDQ0VTUywgW3Jlc3BvbnNlXSk7XHJcblx0XHR9LCBmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xyXG5cdFx0XHRtLnRyaWdnZXIoT1dlYlBhc3N3b3JkLkVWVF9QQVNTX0VESVRfRVJST1IsIFtyZXNwb25zZV0pO1xyXG5cdFx0fSwgdHJ1ZSk7XHJcblx0fVxyXG5cclxuXHRvbkVycm9yKGhhbmRsZXI6ICh0aGlzOiB0aGlzLCByZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkKTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViUGFzc3dvcmQuRVZUX1BBU1NfRURJVF9FUlJPUiwgaGFuZGxlcik7XHJcblx0fVxyXG5cclxuXHRvblN1Y2Nlc3MoaGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHZvaWQpOiB0aGlzIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJQYXNzd29yZC5FVlRfUEFTU19FRElUX1NVQ0NFU1MsIGhhbmRsZXIpO1xyXG5cdH1cclxufTtcclxuIl19