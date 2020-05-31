import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
export default class OWebLogout extends OWebEvent {
    constructor(appContext) {
        super();
        this.appContext = appContext;
    }
    onError(handler) {
        return this.on(OWebLogout.EVT_LOGOUT_ERROR, handler);
    }
    onSuccess(handler) {
        return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
    }
    logout() {
        const m = this, url = this.appContext.url.get('OZ_SERVER_LOGOUT_SERVICE');
        this.appContext.request('POST', url, null, function (response) {
            m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
        }, function (response) {
            m.trigger(OWebLogout.EVT_LOGOUT_ERROR, [response]);
        }, true);
    }
}
OWebLogout.SELF = id();
OWebLogout.EVT_LOGOUT_ERROR = id();
OWebLogout.EVT_LOGOUT_SUCCESS = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkxvZ291dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJMb2dvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwQyxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVcsU0FBUSxTQUFTO0lBS2hELFlBQTZCLFVBQW1CO1FBQy9DLEtBQUssRUFBRSxDQUFDO1FBRG9CLGVBQVUsR0FBVixVQUFVLENBQVM7SUFFaEQsQ0FBQztJQUVELE9BQU8sQ0FBQyxPQUFxRDtRQUM1RCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxTQUFTLENBQUMsT0FBcUQ7UUFDOUQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsTUFBTTtRQUNMLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFDYixHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQ3RCLE1BQU0sRUFDTixHQUFHLEVBQ0gsSUFBSSxFQUNKLFVBQVUsUUFBYTtZQUN0QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxFQUNELFVBQVUsUUFBYTtZQUN0QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxFQUNELElBQUksQ0FDSixDQUFDO0lBQ0gsQ0FBQzs7QUFoQ2UsZUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ1osMkJBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDeEIsNkJBQWtCLEdBQUcsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuLi9PV2ViQXBwJztcbmltcG9ydCB7IElDb21SZXNwb25zZSB9IGZyb20gJy4uL09XZWJDb20nO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuLi9PV2ViRXZlbnQnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJMb2dvdXQgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfTE9HT1VUX0VSUk9SID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9MT0dPVVRfU1VDQ0VTUyA9IGlkKCk7XG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBDb250ZXh0OiBPV2ViQXBwKSB7XG5cdFx0c3VwZXIoKTtcblx0fVxuXG5cdG9uRXJyb3IoaGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTG9nb3V0LkVWVF9MT0dPVVRfRVJST1IsIGhhbmRsZXIpO1xuXHR9XG5cblx0b25TdWNjZXNzKGhhbmRsZXI6ICh0aGlzOiB0aGlzLCByZXNwb25zZTogSUNvbVJlc3BvbnNlKSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkxvZ291dC5FVlRfTE9HT1VUX1NVQ0NFU1MsIGhhbmRsZXIpO1xuXHR9XG5cblx0bG9nb3V0KCkge1xuXHRcdGNvbnN0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5hcHBDb250ZXh0LnVybC5nZXQoJ09aX1NFUlZFUl9MT0dPVVRfU0VSVklDRScpO1xuXG5cdFx0dGhpcy5hcHBDb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnUE9TVCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRudWxsLFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBhbnkpIHtcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJMb2dvdXQuRVZUX0xPR09VVF9TVUNDRVNTLCBbcmVzcG9uc2VdKTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2U6IGFueSkge1xuXHRcdFx0XHRtLnRyaWdnZXIoT1dlYkxvZ291dC5FVlRfTE9HT1VUX0VSUk9SLCBbcmVzcG9uc2VdKTtcblx0XHRcdH0sXG5cdFx0XHR0cnVlLFxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==