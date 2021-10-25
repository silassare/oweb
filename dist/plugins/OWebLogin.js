import OWebEvent from '../OWebEvent';
import { id } from '../utils';
export default class OWebLogin extends OWebEvent {
    _appContext;
    static SELF = id();
    static EVT_LOGIN_FAIL = id();
    static EVT_LOGIN_SUCCESS = id();
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
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
    onLoginFail(handler) {
        return this.on(OWebLogin.EVT_LOGIN_FAIL, handler);
    }
    onLoginSuccess(handler) {
        return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
    }
    _tryLogin(data) {
        const m = this, url = m._appContext.url.get('OZ_SERVER_LOGIN_SERVICE'), net = m._appContext.oz.request(url, {
            method: 'POST',
            body: data,
        });
        return net
            .onGoodNews(function goodNewsHandler(response) {
            m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
        })
            .onFail(function failHandler(err) {
            m.trigger(OWebLogin.EVT_LOGIN_FAIL, [err]);
        })
            .send();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkxvZ2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYkxvZ2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUNyQyxPQUFPLEVBQUMsRUFBRSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBSzVCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBZ0IsU0FBUSxTQUFTO0lBS3hCO0lBSjdCLE1BQU0sQ0FBVSxJQUFJLEdBQWdCLEVBQUUsRUFBRSxDQUFDO0lBQ3pDLE1BQU0sQ0FBVSxjQUFjLEdBQU0sRUFBRSxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFVLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBRXpDLFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO0lBRWpELENBQUM7SUFFRCxjQUFjLENBQUMsSUFBcUM7UUFDbkQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3JCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixJQUFJLEVBQUcsSUFBSSxDQUFDLElBQUk7U0FDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFxQztRQUNuRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLElBQUksRUFBRyxJQUFJLENBQUMsSUFBSTtTQUNoQixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsV0FBVyxDQUNWLE9BQTZDO1FBRTdDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxjQUFjLENBQ2IsT0FHUztRQUVULE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVPLFNBQVMsQ0FBQyxJQUFlO1FBQ2hDLE1BQU0sQ0FBQyxHQUFLLElBQUksRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQ3RELEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQXFCLEdBQUcsRUFBRTtZQUN2RCxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBSSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRU4sT0FBTyxHQUFHO2FBQ1IsVUFBVSxDQUFDLFNBQVMsZUFBZSxDQUFDLFFBQVE7WUFDNUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxTQUFTLFdBQVcsQ0FBQyxHQUFHO1lBQy9CLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxFQUFFLENBQUM7SUFDVixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4uL09XZWJFdmVudCc7XG5pbXBvcnQge2lkfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge09OZXRFcnJvciwgT05ldFJlc3BvbnNlfSBmcm9tICcuLi9PV2ViTmV0JztcbmltcG9ydCB7T0FwaVJlc3BvbnNlfSBmcm9tICcuLi9vem9uZSc7XG5pbXBvcnQge09Gb3JtRGF0YX0gZnJvbSAnLi4vT1dlYkZvcm1WYWxpZGF0b3InO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViTG9naW48VXNlcj4gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgICAgPSBpZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0xPR0lOX0ZBSUwgICAgPSBpZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0xPR0lOX1NVQ0NFU1MgPSBpZCgpO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0bG9naW5XaXRoRW1haWwoZGF0YTogeyBlbWFpbDogc3RyaW5nOyBwYXNzOiBzdHJpbmcgfSk6IFByb21pc2U8T05ldFJlc3BvbnNlPE9BcGlSZXNwb25zZTxVc2VyPj4+IHtcblx0XHRyZXR1cm4gdGhpcy5fdHJ5TG9naW4oe1xuXHRcdFx0ZW1haWw6IGRhdGEuZW1haWwsXG5cdFx0XHRwYXNzIDogZGF0YS5wYXNzLFxuXHRcdH0pO1xuXHR9XG5cblx0bG9naW5XaXRoUGhvbmUoZGF0YTogeyBwaG9uZTogc3RyaW5nOyBwYXNzOiBzdHJpbmcgfSk6IFByb21pc2U8T05ldFJlc3BvbnNlPE9BcGlSZXNwb25zZTxVc2VyPj4+IHtcblx0XHRyZXR1cm4gdGhpcy5fdHJ5TG9naW4oe1xuXHRcdFx0cGhvbmU6IGRhdGEucGhvbmUsXG5cdFx0XHRwYXNzIDogZGF0YS5wYXNzLFxuXHRcdH0pO1xuXHR9XG5cblx0b25Mb2dpbkZhaWwoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIGVycjogT05ldEVycm9yKSA9PiB2b2lkXG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJMb2dpbi5FVlRfTE9HSU5fRkFJTCwgaGFuZGxlcik7XG5cdH1cblxuXHRvbkxvZ2luU3VjY2Vzcyhcblx0XHRoYW5kbGVyOiAoXG5cdFx0XHR0aGlzOiB0aGlzLFxuXHRcdFx0cmVzcG9uc2U6IE9OZXRSZXNwb25zZTxPQXBpUmVzcG9uc2U8VXNlcj4+LFxuXHRcdCkgPT4gdm9pZFxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTG9naW4uRVZUX0xPR0lOX1NVQ0NFU1MsIGhhbmRsZXIpO1xuXHR9XG5cblx0cHJpdmF0ZSBfdHJ5TG9naW4oZGF0YTogT0Zvcm1EYXRhKSB7XG5cdFx0Y29uc3QgbSAgID0gdGhpcyxcblx0XHRcdCAgdXJsID0gbS5fYXBwQ29udGV4dC51cmwuZ2V0KCdPWl9TRVJWRVJfTE9HSU5fU0VSVklDRScpLFxuXHRcdFx0ICBuZXQgPSBtLl9hcHBDb250ZXh0Lm96LnJlcXVlc3Q8T0FwaVJlc3BvbnNlPFVzZXI+Pih1cmwsIHtcblx0XHRcdFx0ICBtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0ICBib2R5ICA6IGRhdGEsXG5cdFx0XHQgIH0pO1xuXG5cdFx0cmV0dXJuIG5ldFxuXHRcdFx0Lm9uR29vZE5ld3MoZnVuY3Rpb24gZ29vZE5ld3NIYW5kbGVyKHJlc3BvbnNlKSB7XG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViTG9naW4uRVZUX0xPR0lOX1NVQ0NFU1MsIFtyZXNwb25zZV0pO1xuXHRcdFx0fSlcblx0XHRcdC5vbkZhaWwoZnVuY3Rpb24gZmFpbEhhbmRsZXIoZXJyKSB7XG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViTG9naW4uRVZUX0xPR0lOX0ZBSUwsIFtlcnJdKTtcblx0XHRcdH0pXG5cdFx0XHQuc2VuZCgpO1xuXHR9XG59XG4iXX0=