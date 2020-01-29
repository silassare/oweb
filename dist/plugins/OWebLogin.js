import OWebEvent from '../OWebEvent';
import Utils from '../utils/Utils';
export default class OWebLogin extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    loginWithEmail(form) {
        let m = this, ofv = this.app_context.getFormValidator(form, ['email', 'pass']);
        if (ofv.validate()) {
            let data = {
                email: ofv.getField('email'),
                pass: ofv.getField('pass'),
            };
            m._tryLogin(data);
        }
    }
    loginWithPhone(form) {
        let m = this, ofv = this.app_context.getFormValidator(form, ['phone', 'pass']);
        if (ofv.validate()) {
            let data = {
                phone: ofv.getField('phone'),
                pass: ofv.getField('pass'),
            };
            m._tryLogin(data);
        }
    }
    onError(handler) {
        return this.on(OWebLogin.EVT_LOGIN_ERROR, handler);
    }
    onSuccess(handler) {
        return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
    }
    _tryLogin(data) {
        let m = this, url = this.app_context.url.get('OZ_SERVER_LOGIN_SERVICE');
        this.app_context.request('POST', url, data, function (response) {
            m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
        }, function (response) {
            m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
        }, true);
    }
}
OWebLogin.SELF = Utils.id();
OWebLogin.EVT_LOGIN_ERROR = Utils.id();
OWebLogin.EVT_LOGIN_SUCCESS = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkxvZ2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYkxvZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUNyQyxPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQztBQUVuQyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVUsU0FBUSxTQUFTO0lBSy9DLFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO0lBRWpELENBQUM7SUFFRCxjQUFjLENBQUMsSUFBcUI7UUFDbkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNYLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRWxFLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQ25CLElBQUksSUFBSSxHQUFHO2dCQUNWLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDNUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzFCLENBQUM7WUFFRixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xCO0lBQ0YsQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFxQjtRQUNuQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQ1gsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFbEUsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxJQUFJLEdBQUc7Z0JBQ1YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUM1QixJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDMUIsQ0FBQztZQUVGLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEI7SUFDRixDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQXFEO1FBQzVELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBcUQ7UUFDOUQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQVM7UUFDbEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNYLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUUzRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDdkIsTUFBTSxFQUNOLEdBQUcsRUFDSCxJQUFJLEVBQ0osVUFBUyxRQUFzQjtZQUM5QixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxFQUNELFVBQVMsUUFBYTtZQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUMsRUFDRCxJQUFJLENBQ0osQ0FBQztJQUNILENBQUM7O0FBNURlLGNBQUksR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDbEIseUJBQWUsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDN0IsMkJBQWlCLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi4vT1dlYkFwcCc7XHJcbmltcG9ydCB7IGlDb21SZXNwb25zZSB9IGZyb20gJy4uL09XZWJDb20nO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4uL09XZWJFdmVudCc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi91dGlscy9VdGlscyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViTG9naW4gZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gVXRpbHMuaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0xPR0lOX0VSUk9SID0gVXRpbHMuaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0xPR0lOX1NVQ0NFU1MgPSBVdGlscy5pZCgpO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcF9jb250ZXh0OiBPV2ViQXBwKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdH1cclxuXHJcblx0bG9naW5XaXRoRW1haWwoZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XHJcblx0XHRsZXQgbSA9IHRoaXMsXHJcblx0XHRcdG9mdiA9IHRoaXMuYXBwX2NvbnRleHQuZ2V0Rm9ybVZhbGlkYXRvcihmb3JtLCBbJ2VtYWlsJywgJ3Bhc3MnXSk7XHJcblxyXG5cdFx0aWYgKG9mdi52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdGxldCBkYXRhID0ge1xyXG5cdFx0XHRcdGVtYWlsOiBvZnYuZ2V0RmllbGQoJ2VtYWlsJyksXHJcblx0XHRcdFx0cGFzczogb2Z2LmdldEZpZWxkKCdwYXNzJyksXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRtLl90cnlMb2dpbihkYXRhKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGxvZ2luV2l0aFBob25lKGZvcm06IEhUTUxGb3JtRWxlbWVudCkge1xyXG5cdFx0bGV0IG0gPSB0aGlzLFxyXG5cdFx0XHRvZnYgPSB0aGlzLmFwcF9jb250ZXh0LmdldEZvcm1WYWxpZGF0b3IoZm9ybSwgWydwaG9uZScsICdwYXNzJ10pO1xyXG5cclxuXHRcdGlmIChvZnYudmFsaWRhdGUoKSkge1xyXG5cdFx0XHRsZXQgZGF0YSA9IHtcclxuXHRcdFx0XHRwaG9uZTogb2Z2LmdldEZpZWxkKCdwaG9uZScpLFxyXG5cdFx0XHRcdHBhc3M6IG9mdi5nZXRGaWVsZCgncGFzcycpLFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0bS5fdHJ5TG9naW4oZGF0YSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRvbkVycm9yKGhhbmRsZXI6ICh0aGlzOiB0aGlzLCByZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkKTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTG9naW4uRVZUX0xPR0lOX0VSUk9SLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uU3VjY2VzcyhoYW5kbGVyOiAodGhpczogdGhpcywgcmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkxvZ2luLkVWVF9MT0dJTl9TVUNDRVNTLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdF90cnlMb2dpbihkYXRhOiBhbnkpIHtcclxuXHRcdGxldCBtID0gdGhpcyxcclxuXHRcdFx0dXJsID0gdGhpcy5hcHBfY29udGV4dC51cmwuZ2V0KCdPWl9TRVJWRVJfTE9HSU5fU0VSVklDRScpO1xyXG5cclxuXHRcdHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcclxuXHRcdFx0J1BPU1QnLFxyXG5cdFx0XHR1cmwsXHJcblx0XHRcdGRhdGEsXHJcblx0XHRcdGZ1bmN0aW9uKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcclxuXHRcdFx0XHRtLnRyaWdnZXIoT1dlYkxvZ2luLkVWVF9MT0dJTl9TVUNDRVNTLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0ZnVuY3Rpb24ocmVzcG9uc2U6IGFueSkge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViTG9naW4uRVZUX0xPR0lOX0VSUk9SLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0dHJ1ZVxyXG5cdFx0KTtcclxuXHR9XHJcbn1cclxuIl19