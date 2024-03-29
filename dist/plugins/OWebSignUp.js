import OWebEvent from '../OWebEvent';
import { id } from '../utils';
export default class OWebSignUp extends OWebEvent {
    _appContext;
    static SELF = id();
    static EVT_SIGN_UP_SUCCESS = id();
    static EVT_SIGN_UP_FAIL = id();
    static SIGN_UP_STEP_START = 1;
    static SIGN_UP_STEP_VALIDATE = 2;
    static SIGN_UP_STEP_END = 3;
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
    }
    stepStart(data) {
        return this._sendForm({
            phone: data.phone,
            cc2: data.cc2,
            step: OWebSignUp.SIGN_UP_STEP_START,
        }, OWebSignUp.SIGN_UP_STEP_VALIDATE);
    }
    stepValidate(data) {
        return this._sendForm({
            step: OWebSignUp.SIGN_UP_STEP_VALIDATE,
            code: data.code,
        }, OWebSignUp.SIGN_UP_STEP_END);
    }
    stepEnd(data) {
        const form = {
            step: OWebSignUp.SIGN_UP_STEP_END,
            ...data,
        };
        if (!form.email) {
            delete form.email;
        }
        return this._sendForm(form);
    }
    onSignUpFail(handler) {
        return this.on(OWebSignUp.EVT_SIGN_UP_FAIL, handler);
    }
    onSignUpSuccess(handler) {
        return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
    }
    _sendForm(data, nextStep) {
        const m = this, url = m._appContext.url.get('OZ_SERVER_SIGNUP_SERVICE'), net = m._appContext.oz.request(url, {
            method: 'POST',
            body: data,
        });
        return net
            .onGoodNews(function goodNewsHandler(response) {
            if (!nextStep) {
                m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
            }
        })
            .onFail(function failHandler(err) {
            m.trigger(OWebSignUp.EVT_SIGN_UP_FAIL, [err]);
        })
            .send();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNpZ25VcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJTaWduVXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFLOUIsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFpQyxTQUFRLFNBQVM7SUFTekM7SUFSN0IsTUFBTSxDQUFVLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUNwQixNQUFNLENBQVUsbUJBQW1CLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDM0MsTUFBTSxDQUFVLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBRWhELE1BQU0sQ0FBVSxrQkFBa0IsR0FBRyxDQUFDLENBQUM7SUFDdkMsTUFBTSxDQUFVLHFCQUFxQixHQUFHLENBQUMsQ0FBQztJQUMxQyxNQUFNLENBQVUsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJDLFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO0lBRWpELENBQUM7SUFFRCxTQUFTLENBQUMsSUFHVDtRQUNBLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FDcEI7WUFDQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxrQkFBa0I7U0FDbkMsRUFDRCxVQUFVLENBQUMscUJBQXFCLENBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRUQsWUFBWSxDQUFDLElBRVo7UUFDQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQ3BCO1lBQ0MsSUFBSSxFQUFFLFVBQVUsQ0FBQyxxQkFBcUI7WUFDdEMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2YsRUFDRCxVQUFVLENBQUMsZ0JBQWdCLENBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBT1A7UUFDQSxNQUFNLElBQUksR0FBRztZQUNaLElBQUksRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1lBQ2pDLEdBQUcsSUFBSTtTQUNQLENBQUM7UUFFRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbEI7UUFFRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQU0sSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUE2QztRQUN6RCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxlQUFlLENBQ2QsT0FBd0U7UUFFeEUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU8sU0FBUyxDQUFJLElBQWtCLEVBQUUsUUFBaUI7UUFDekQsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFDdkQsR0FBRyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBa0IsR0FBRyxFQUFFO1lBQ3BELE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLElBQUk7U0FDVixDQUFDLENBQUM7UUFFSixPQUFPLEdBQUc7YUFDUixVQUFVLENBQUMsU0FBUyxlQUFlLENBQUMsUUFBUTtZQUM1QyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNkLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUN0RDtRQUNGLENBQUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxTQUFTLFdBQVcsQ0FBQyxHQUFHO1lBQy9CLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUM7YUFDRCxJQUFJLEVBQUUsQ0FBQztJQUNWLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi4vT1dlYkV2ZW50JztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgT05ldEVycm9yLCBPTmV0UmVzcG9uc2UgfSBmcm9tICcuLi9PV2ViTmV0JztcbmltcG9ydCB7IE9BcGlSZXNwb25zZSB9IGZyb20gJy4uL296b25lJztcbmltcG9ydCB7IE9XZWJGb3JtRGF0YSB9IGZyb20gJy4uL09XZWJGb3JtJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlNpZ25VcDxTdGFydCwgVmFsaWRhdGUsIEVuZD4gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEVWVF9TSUdOX1VQX1NVQ0NFU1MgPSBpZCgpO1xuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBFVlRfU0lHTl9VUF9GQUlMID0gaWQoKTtcblxuXHRzdGF0aWMgcmVhZG9ubHkgU0lHTl9VUF9TVEVQX1NUQVJUID0gMTtcblx0c3RhdGljIHJlYWRvbmx5IFNJR05fVVBfU1RFUF9WQUxJREFURSA9IDI7XG5cdHN0YXRpYyByZWFkb25seSBTSUdOX1VQX1NURVBfRU5EID0gMztcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdHN0ZXBTdGFydChkYXRhOiB7XG5cdFx0cGhvbmU6IHN0cmluZztcblx0XHRjYzI6IHN0cmluZztcblx0fSk6IFByb21pc2U8T05ldFJlc3BvbnNlPE9BcGlSZXNwb25zZTxTdGFydD4+PiB7XG5cdFx0cmV0dXJuIHRoaXMuX3NlbmRGb3JtPFN0YXJ0Pihcblx0XHRcdHtcblx0XHRcdFx0cGhvbmU6IGRhdGEucGhvbmUsXG5cdFx0XHRcdGNjMjogZGF0YS5jYzIsXG5cdFx0XHRcdHN0ZXA6IE9XZWJTaWduVXAuU0lHTl9VUF9TVEVQX1NUQVJULFxuXHRcdFx0fSxcblx0XHRcdE9XZWJTaWduVXAuU0lHTl9VUF9TVEVQX1ZBTElEQVRFXG5cdFx0KTtcblx0fVxuXG5cdHN0ZXBWYWxpZGF0ZShkYXRhOiB7XG5cdFx0Y29kZTogc3RyaW5nO1xuXHR9KTogUHJvbWlzZTxPTmV0UmVzcG9uc2U8T0FwaVJlc3BvbnNlPFZhbGlkYXRlPj4+IHtcblx0XHRyZXR1cm4gdGhpcy5fc2VuZEZvcm08VmFsaWRhdGU+KFxuXHRcdFx0e1xuXHRcdFx0XHRzdGVwOiBPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9WQUxJREFURSxcblx0XHRcdFx0Y29kZTogZGF0YS5jb2RlLFxuXHRcdFx0fSxcblx0XHRcdE9XZWJTaWduVXAuU0lHTl9VUF9TVEVQX0VORFxuXHRcdCk7XG5cdH1cblxuXHRzdGVwRW5kKGRhdGE6IHtcblx0XHR1bmFtZTogc3RyaW5nO1xuXHRcdHBhc3M6IHN0cmluZztcblx0XHR2cGFzczogc3RyaW5nO1xuXHRcdGJpcnRoX2RhdGU6IHN0cmluZztcblx0XHRnZW5kZXI6IHN0cmluZztcblx0XHRlbWFpbD86IHN0cmluZztcblx0fSk6IFByb21pc2U8T05ldFJlc3BvbnNlPE9BcGlSZXNwb25zZTxFbmQ+Pj4ge1xuXHRcdGNvbnN0IGZvcm0gPSB7XG5cdFx0XHRzdGVwOiBPV2ViU2lnblVwLlNJR05fVVBfU1RFUF9FTkQsXG5cdFx0XHQuLi5kYXRhLFxuXHRcdH07XG5cblx0XHRpZiAoIWZvcm0uZW1haWwpIHtcblx0XHRcdGRlbGV0ZSBmb3JtLmVtYWlsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9zZW5kRm9ybTxFbmQ+KGZvcm0pO1xuXHR9XG5cblx0b25TaWduVXBGYWlsKGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBlcnI6IE9OZXRFcnJvcikgPT4gdm9pZCk6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJTaWduVXAuRVZUX1NJR05fVVBfRkFJTCwgaGFuZGxlcik7XG5cdH1cblxuXHRvblNpZ25VcFN1Y2Nlc3MoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBPTmV0UmVzcG9uc2U8T0FwaVJlc3BvbnNlPEVuZD4+KSA9PiB2b2lkXG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJTaWduVXAuRVZUX1NJR05fVVBfU1VDQ0VTUywgaGFuZGxlcik7XG5cdH1cblxuXHRwcml2YXRlIF9zZW5kRm9ybTxSPihkYXRhOiBPV2ViRm9ybURhdGEsIG5leHRTdGVwPzogbnVtYmVyKSB7XG5cdFx0Y29uc3QgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSBtLl9hcHBDb250ZXh0LnVybC5nZXQoJ09aX1NFUlZFUl9TSUdOVVBfU0VSVklDRScpLFxuXHRcdFx0bmV0ID0gbS5fYXBwQ29udGV4dC5vei5yZXF1ZXN0PE9BcGlSZXNwb25zZTxSPj4odXJsLCB7XG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRib2R5OiBkYXRhLFxuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gbmV0XG5cdFx0XHQub25Hb29kTmV3cyhmdW5jdGlvbiBnb29kTmV3c0hhbmRsZXIocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKCFuZXh0U3RlcCkge1xuXHRcdFx0XHRcdG0udHJpZ2dlcihPV2ViU2lnblVwLkVWVF9TSUdOX1VQX1NVQ0NFU1MsIFtyZXNwb25zZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0Lm9uRmFpbChmdW5jdGlvbiBmYWlsSGFuZGxlcihlcnIpIHtcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJTaWduVXAuRVZUX1NJR05fVVBfRkFJTCwgW2Vycl0pO1xuXHRcdFx0fSlcblx0XHRcdC5zZW5kKCk7XG5cdH1cbn1cbiJdfQ==