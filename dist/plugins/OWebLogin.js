import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import { ozNet } from '../ozone';
let OWebLogin = /** @class */ (() => {
    class OWebLogin extends OWebEvent {
        constructor(appContext) {
            super();
            this.appContext = appContext;
        }
        loginWithEmail(data) {
            return this._tryLogin({
                email: data.email,
                pass: data.pass,
            });
        }
        loginWithPhone(data) {
            return this._tryLogin({
                phone: data.phone,
                pass: data.pass,
            });
        }
        onError(handler) {
            return this.on(OWebLogin.EVT_LOGIN_ERROR, handler);
        }
        onSuccess(handler) {
            return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
        }
        _tryLogin(data) {
            const m = this, url = m.appContext.url.get('OZ_SERVER_LOGIN_SERVICE'), net = ozNet(url, {
                method: 'POST',
                body: data,
                isGoodNews(response) {
                    return Boolean(response.json && response.json.error === 0);
                },
            });
            return net
                .onGoodNews(function (response) {
                m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
            })
                .onBadNews(function (response) {
                m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
            })
                .send();
        }
    }
    OWebLogin.SELF = id();
    OWebLogin.EVT_LOGIN_ERROR = id();
    OWebLogin.EVT_LOGIN_SUCCESS = id();
    return OWebLogin;
})();
export default OWebLogin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkxvZ2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYkxvZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUNyQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRzlCLE9BQU8sRUFBaUIsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWhEO0lBQUEsTUFBcUIsU0FBVSxTQUFRLFNBQVM7UUFLL0MsWUFBNkIsVUFBbUI7WUFDL0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUVoRCxDQUFDO1FBRUQsY0FBYyxDQUFDLElBQXFDO1lBQ25ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDZixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsY0FBYyxDQUFDLElBQXFDO1lBQ25ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDZixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxDQUNOLE9BR1M7WUFFVCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQsU0FBUyxDQUNSLE9BR1M7WUFFVCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFTyxTQUFTLENBQUMsSUFBdUI7WUFDeEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFDckQsR0FBRyxHQUFHLEtBQUssQ0FBb0MsR0FBRyxFQUFFO2dCQUNuRCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxJQUFJLEVBQUUsSUFBSTtnQkFDVixVQUFVLENBQUMsUUFBUTtvQkFDbEIsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVKLE9BQU8sR0FBRztpQkFDUixVQUFVLENBQUMsVUFBVSxRQUFRO2dCQUM3QixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQyxDQUFDO2lCQUNELFNBQVMsQ0FBQyxVQUFVLFFBQVE7Z0JBQzVCLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDO2lCQUNELElBQUksRUFBRSxDQUFDO1FBQ1YsQ0FBQzs7SUEzRGUsY0FBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ1oseUJBQWUsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN2QiwyQkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQTBEMUMsZ0JBQUM7S0FBQTtlQTdEb0IsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4uL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4uL09XZWJFdmVudCc7XHJcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBJTmV0UmVzcG9uc2UgfSBmcm9tICcuLi9PV2ViTmV0JztcclxuaW1wb3J0IHsgR29ibFNpbmdsZVBLRW50aXR5IH0gZnJvbSAnZ29ibC11dGlscy10cyc7XHJcbmltcG9ydCB7IElPWm9uZUFwaUpTT04sIG96TmV0IH0gZnJvbSAnLi4vb3pvbmUnO1xyXG5cclxuZXhwb3J0IHR5cGUgdExvZ2luUmVzcG9uc2VEYXRhID0gR29ibFNpbmdsZVBLRW50aXR5O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkxvZ2luIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9MT0dJTl9FUlJPUiA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9MT0dJTl9TVUNDRVNTID0gaWQoKTtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBDb250ZXh0OiBPV2ViQXBwKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdH1cclxuXHJcblx0bG9naW5XaXRoRW1haWwoZGF0YTogeyBlbWFpbDogc3RyaW5nOyBwYXNzOiBzdHJpbmcgfSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3RyeUxvZ2luKHtcclxuXHRcdFx0ZW1haWw6IGRhdGEuZW1haWwsXHJcblx0XHRcdHBhc3M6IGRhdGEucGFzcyxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0bG9naW5XaXRoUGhvbmUoZGF0YTogeyBwaG9uZTogc3RyaW5nOyBwYXNzOiBzdHJpbmcgfSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3RyeUxvZ2luKHtcclxuXHRcdFx0cGhvbmU6IGRhdGEucGhvbmUsXHJcblx0XHRcdHBhc3M6IGRhdGEucGFzcyxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0b25FcnJvcihcclxuXHRcdGhhbmRsZXI6IChcclxuXHRcdFx0dGhpczogdGhpcyxcclxuXHRcdFx0cmVzcG9uc2U6IElOZXRSZXNwb25zZTxJT1pvbmVBcGlKU09OPGFueT4+LFxyXG5cdFx0KSA9PiB2b2lkLFxyXG5cdCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkxvZ2luLkVWVF9MT0dJTl9FUlJPUiwgaGFuZGxlcik7XHJcblx0fVxyXG5cclxuXHRvblN1Y2Nlc3MoXHJcblx0XHRoYW5kbGVyOiAoXHJcblx0XHRcdHRoaXM6IHRoaXMsXHJcblx0XHRcdHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8SU9ab25lQXBpSlNPTjx0TG9naW5SZXNwb25zZURhdGE+PixcclxuXHRcdCkgPT4gdm9pZCxcclxuXHQpOiB0aGlzIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJMb2dpbi5FVlRfTE9HSU5fU1VDQ0VTUywgaGFuZGxlcik7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF90cnlMb2dpbihkYXRhOiBGb3JtRGF0YSB8IG9iamVjdCkge1xyXG5cdFx0Y29uc3QgbSA9IHRoaXMsXHJcblx0XHRcdHVybCA9IG0uYXBwQ29udGV4dC51cmwuZ2V0KCdPWl9TRVJWRVJfTE9HSU5fU0VSVklDRScpLFxyXG5cdFx0XHRuZXQgPSBvek5ldDxJT1pvbmVBcGlKU09OPHRMb2dpblJlc3BvbnNlRGF0YT4+KHVybCwge1xyXG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRcdGJvZHk6IGRhdGEsXHJcblx0XHRcdFx0aXNHb29kTmV3cyhyZXNwb25zZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIEJvb2xlYW4ocmVzcG9uc2UuanNvbiAmJiByZXNwb25zZS5qc29uLmVycm9yID09PSAwKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV0XHJcblx0XHRcdC5vbkdvb2ROZXdzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViTG9naW4uRVZUX0xPR0lOX1NVQ0NFU1MsIFtyZXNwb25zZV0pO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQub25CYWROZXdzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViTG9naW4uRVZUX0xPR0lOX0VSUk9SLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LnNlbmQoKTtcclxuXHR9XHJcbn1cclxuIl19