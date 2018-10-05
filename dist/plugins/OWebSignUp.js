import OWebEvent from "../OWebEvent";
export default class OWebSignUp extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    stepStart(form) {
        let ofv = this.app_context.getFormValidator(form, ["phone"]);
        if (ofv.validate()) {
            let form_data = ofv.getFormData(["phone", "cc2"]);
            form_data.set("step", String(OWebSignUp.SIGN_UP_STEP_START));
            this._sendForm(form, form_data, OWebSignUp.SIGN_UP_STEP_VALIDATE);
        }
    }
    stepValidate(form) {
        let ofv = this.app_context.getFormValidator(form, ["code"]);
        if (ofv.validate()) {
            let code = ofv.getField("code");
            this._sendForm(form, {
                "step": OWebSignUp.SIGN_UP_STEP_VALIDATE,
                "code": code
            }, OWebSignUp.SIGN_UP_STEP_END);
        }
    }
    stepEnd(form) {
        let required = ["uname", "pass", "vpass", "birth_date", "gender"], excluded = [], mailInput, agreeChk;
        if (mailInput = form.querySelector("input[name=email]")) {
            if (!mailInput.value.trim().length) {
                excluded.push("email");
            }
            else {
                required.push("email");
            }
        }
        let ofv = this.app_context.getFormValidator(form, required, excluded), formData;
        if (ofv.validate()) {
            if ((agreeChk = form.querySelector("input[name=oweb_signup_cgu_agree_checkbox]")) && !agreeChk.checked) {
                let error = {
                    error: 1,
                    msg: "OZ_ERROR_SHOULD_ACCEPT_CGU",
                    utime: 0
                };
                this.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [error]);
                return false;
            }
            formData = ofv.getFormData(required);
            formData.set("step", String(OWebSignUp.SIGN_UP_STEP_END));
            this._sendForm(form, formData);
        }
    }
    onError(handler) {
        return this.on(OWebSignUp.EVT_SIGN_UP_ERROR, handler);
    }
    onNextStep(handler) {
        return this.on(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, handler);
    }
    onSuccess(handler) {
        return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
    }
    _sendForm(form, data, next_step) {
        let m = this, url = this.app_context.url.get("OZ_SERVER_SIGNUP_SERVICE");
        this.app_context.request("POST", url, data, function (response) {
            if (next_step) {
                m.trigger(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, [response, next_step]);
            }
            else {
                m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
            }
        }, function (response) {
            m.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [response]);
        }, true);
    }
}
OWebSignUp.SIGN_UP_STEP_START = 1;
OWebSignUp.SIGN_UP_STEP_VALIDATE = 2;
OWebSignUp.SIGN_UP_STEP_END = 3;
OWebSignUp.EVT_SIGN_UP_NEXT_STEP = "OWebSignUp:next_step";
OWebSignUp.EVT_SIGN_UP_SUCCESS = "OWebSignUp:success";
OWebSignUp.EVT_SIGN_UP_ERROR = "OWebSignUp:error";
OWebSignUp.SELF = "OWebSignUp";
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNpZ25VcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJTaWduVXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBRXJDLE1BQU0sQ0FBQyxPQUFPLGlCQUFrQixTQUFRLFNBQVM7SUFXaEQsWUFBNkIsV0FBb0I7UUFDaEQsS0FBSyxFQUFFLENBQUE7UUFEcUIsZ0JBQVcsR0FBWCxXQUFXLENBQVM7SUFFakQsQ0FBQztJQUVELFNBQVMsQ0FBQyxJQUFxQjtRQUM5QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFN0QsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2xELFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUNsRTtJQUNGLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBcUI7UUFDakMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTVELElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBRW5CLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BCLE1B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Q3REO1FBQ0YsQ0FBQyxFQUFFLFVBQVUsUUFBYTtZQUN6QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1YsQ0FBQzs7QUFyR2UsNkJBQWtCLEdBQU0sQ0FBQyxDQUFDO0FBQzFCLGdDQUFxQixHQUFHLENBQUMsQ0FBQztBQUMxQiwyQkFBZ0IsR0FBUSxDQUFDLENBQUM7QUFFMUIsZ0NBQXFCLEdBQUcsc0JBQXNCLENBQUM7QUFDL0MsOEJBQW1CLEdBQUssb0JBQW9CLENBQUM7QUFDN0MsNEJBQWlCLEdBQU8sa0JBQWtCLENBQUM7QUFDM0MsZUFBSSxHQUFvQixZQUFZLENBQUM7QUErRnJELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi4vT1dlYkFwcFwiO1xyXG5pbXBvcnQge2lDb21SZXNwb25zZX0gZnJvbSBcIi4uL09XZWJDb21cIjtcclxuaW1wb3J0IE9XZWJFdmVudCBmcm9tIFwiLi4vT1dlYkV2ZW50XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViU2lnblVwIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IFNJR05fVVBfU1RFUF9TVEFSVCAgICA9IDE7XHJcblx0c3RhdGljIHJlYWRvbmx5IFNJR05fVVBfU1RFUF9WQUxJREFURSA9IDI7XHJcblx0c3RhdGljIHJlYWRvbmx5IFNJR05fVVBfU1RFUF9FTkQgICAgICA9IDM7XHJcblxyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfU0lHTl9VUF9ORVhUX1NURVAgPSBcIk9XZWJTaWduVXA6bmV4dF9zdGVwXCI7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSUdOX1VQX1NVQ0NFU1MgICA9IFwiT1dlYlNpZ25VcDpzdWNjZXNzXCI7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSUdOX1VQX0VSUk9SICAgICA9IFwiT1dlYlNpZ25VcDplcnJvclwiO1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGICAgICAgICAgICAgICAgICAgPSBcIk9XZWJTaWduVXBcIjtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKVxyXG5cdH1cclxuXHJcblx0c3RlcFN0YXJ0KGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xyXG5cdFx0bGV0IG9mdiA9IHRoaXMuYXBwX2NvbnRleHQuZ2V0Rm9ybVZhbGlkYXRvcihmb3JtLCBbXCJwaG9uZVwiXSk7XHJcblxyXG5cdFx0aWYgKG9mdi52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdGxldCBmb3JtX2RhdGEgPSBvZnYuZ2V0Rm9ybURhdGEoW1wicGhvbmVcIiwgXCJjYzJcIl0pO1xyXG5cdFx0XHRmb3JtX2RhdGEuc2V0KFwic3RlcFwiLCBTdHJpbmcoT1dlYlNpZ25VcC5TSUdOX1VQX1NURVBfU1RBUlQpKTtcclxuXHRcdFx0dGhpcy5fc2VuZEZvcm0oZm9ybSwgZm9ybV9kYXRhLCBPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9WQUxJREFURSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGVwVmFsaWRhdGUoZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XHJcblx0XHRsZXQgb2Z2ID0gdGhpcy5hcHBfY29udGV4dC5nZXRGb3JtVmFsaWRhdG9yKGZvcm0sIFtcImNvZGVcIl0pO1xyXG5cclxuXHRcdGlmIChvZnYudmFsaWRhdGUoKSkge1xyXG5cclxuXHRcdFx0bGV0IGNvZGUgPSBvZnYuZ2V0RmllbGQoXCJjb2RlXCIpO1xyXG5cclxuXHRcdFx0dGhpcy5fc2VuZEZvcm0oZm9ybSwge1xyXG5cdFx0XHRcdFwic3RlcFwiOiBPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9WQUxJREFURSxcclxuXHRcdFx0XHRcImNvZGVcIjogY29kZVxyXG5cdFx0XHR9LCBPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9FTkQpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHN0ZXBFbmQoZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XHJcblxyXG5cdFx0bGV0IHJlcXVpcmVkID0gW1widW5hbWVcIiwgXCJwYXNzXCIsIFwidnBhc3NcIiwgXCJiaXJ0aF9kYXRlXCIsIFwiZ2VuZGVyXCJdLFxyXG5cdFx0XHRleGNsdWRlZCA9IFtdLFxyXG5cdFx0XHRtYWlsSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsLFxyXG5cdFx0XHRhZ3JlZUNoazogSFRNTElucHV0RWxlbWVudCB8IG51bGw7XHJcblxyXG5cdFx0aWYgKG1haWxJbnB1dCA9IGZvcm0ucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9ZW1haWxdXCIpKSB7XHJcblx0XHRcdGlmICghbWFpbElucHV0LnZhbHVlLnRyaW0oKS5sZW5ndGgpIHtcclxuXHRcdFx0XHRleGNsdWRlZC5wdXNoKFwiZW1haWxcIik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmVxdWlyZWQucHVzaChcImVtYWlsXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IG9mdiA9IHRoaXMuYXBwX2NvbnRleHQuZ2V0Rm9ybVZhbGlkYXRvcihmb3JtLCByZXF1aXJlZCwgZXhjbHVkZWQpLFxyXG5cdFx0XHRmb3JtRGF0YTtcclxuXHJcblx0XHRpZiAob2Z2LnZhbGlkYXRlKCkpIHtcclxuXHJcblx0XHRcdGlmICgoYWdyZWVDaGsgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoXCJpbnB1dFtuYW1lPW93ZWJfc2lnbnVwX2NndV9hZ3JlZV9jaGVja2JveF1cIikpICYmICFhZ3JlZUNoay5jaGVja2VkKSB7XHJcblx0XHRcdFx0bGV0IGVycm9yOiBpQ29tUmVzcG9uc2UgPSB7XHJcblx0XHRcdFx0XHRlcnJvcjogMSxcclxuXHRcdFx0XHRcdG1zZyAgOiBcIk9aX0VSUk9SX1NIT1VMRF9BQ0NFUFRfQ0dVXCIsXHJcblx0XHRcdFx0XHR1dGltZTogMFxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJTaWduVXAuRVZUX1NJR05fVVBfRVJST1IsIFtlcnJvcl0pO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9ybURhdGEgPSBvZnYuZ2V0Rm9ybURhdGEocmVxdWlyZWQpO1xyXG5cdFx0XHRmb3JtRGF0YS5zZXQoXCJzdGVwXCIsIFN0cmluZyhPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9FTkQpKTtcclxuXHJcblx0XHRcdHRoaXMuX3NlbmRGb3JtKGZvcm0sIGZvcm1EYXRhKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRvbkVycm9yKGhhbmRsZXI6IChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkKTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViU2lnblVwLkVWVF9TSUdOX1VQX0VSUk9SLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uTmV4dFN0ZXAoaGFuZGxlcjogKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UsIHN0ZXA6IG51bWJlcikgPT4gdm9pZCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYlNpZ25VcC5FVlRfU0lHTl9VUF9ORVhUX1NURVAsIGhhbmRsZXIpO1xyXG5cdH1cclxuXHJcblx0b25TdWNjZXNzKGhhbmRsZXI6IChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkKTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViU2lnblVwLkVWVF9TSUdOX1VQX1NVQ0NFU1MsIGhhbmRsZXIpO1xyXG5cdH1cclxuXHJcblx0X3NlbmRGb3JtKGZvcm06IEhUTUxGb3JtRWxlbWVudCwgZGF0YTogYW55LCBuZXh0X3N0ZXA/OiBudW1iZXIpIHtcclxuXHRcdGxldCBtICAgPSB0aGlzLFxyXG5cdFx0XHR1cmwgPSB0aGlzLmFwcF9jb250ZXh0LnVybC5nZXQoXCJPWl9TRVJWRVJfU0lHTlVQX1NFUlZJQ0VcIik7XHJcblxyXG5cdFx0dGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFwiUE9TVFwiLCB1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XHJcblx0XHRcdGlmIChuZXh0X3N0ZXApIHtcclxuXHRcdFx0XHRtLnRyaWdnZXIoT1dlYlNpZ25VcC5FVlRfU0lHTl9VUF9ORVhUX1NURVAsIFtyZXNwb25zZSwgbmV4dF9zdGVwXSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJTaWduVXAuRVZUX1NJR05fVVBfU1VDQ0VTUywgW3Jlc3BvbnNlXSk7XHJcblx0XHRcdH1cclxuXHRcdH0sIGZ1bmN0aW9uIChyZXNwb25zZTogYW55KSB7XHJcblx0XHRcdG0udHJpZ2dlcihPV2ViU2lnblVwLkVWVF9TSUdOX1VQX0VSUk9SLCBbcmVzcG9uc2VdKTtcclxuXHRcdH0sIHRydWUpO1xyXG5cdH1cclxufTtcclxuIl19