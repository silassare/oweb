import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
let OWebAccountRecovery = /** @class */ (() => {
    class OWebAccountRecovery extends OWebEvent {
        constructor(appContext) {
            super();
            this.appContext = appContext;
        }
        stepStart(data) {
            return this._sendForm({
                phone: data.phone,
                cc2: data.cc2,
                step: OWebAccountRecovery.AR_STEP_START,
            }, OWebAccountRecovery.AR_STEP_VALIDATE);
        }
        stepValidate(data) {
            return this._sendForm({
                step: OWebAccountRecovery.AR_STEP_VALIDATE,
                code: data.code,
            }, OWebAccountRecovery.AR_STEP_END);
        }
        stepEnd(data) {
            return this._sendForm({
                pass: data.pass,
                vpass: data.vpass,
                step: String(OWebAccountRecovery.AR_STEP_END),
            });
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
        _sendForm(data, nextStep) {
            const m = this, url = m.appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE'), net = m.appContext.net(url, {
                method: 'POST',
                body: data,
                isGoodNews(response) {
                    return Boolean(response.json && response.json.error === 0);
                },
            });
            return net
                .onGoodNews(function (response) {
                if (nextStep) {
                    m.trigger(OWebAccountRecovery.EVT_AR_NEXT_STEP, [
                        response,
                        nextStep,
                    ]);
                }
                else {
                    m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
                }
            })
                .onBadNews(function (response) {
                m.trigger(OWebAccountRecovery.EVT_AR_ERROR, [response]);
            })
                .send();
        }
    }
    OWebAccountRecovery.SELF = id();
    OWebAccountRecovery.EVT_AR_NEXT_STEP = id();
    OWebAccountRecovery.EVT_AR_SUCCESS = id();
    OWebAccountRecovery.EVT_AR_ERROR = id();
    OWebAccountRecovery.AR_STEP_START = 1;
    OWebAccountRecovery.AR_STEP_VALIDATE = 2;
    OWebAccountRecovery.AR_STEP_END = 3;
    return OWebAccountRecovery;
})();
export default OWebAccountRecovery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFjY291bnRSZWNvdmVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJBY2NvdW50UmVjb3ZlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUlwQztJQUFBLE1BQXFCLG1CQUFvQixTQUFRLFNBQVM7UUFVekQsWUFBNkIsVUFBbUI7WUFDL0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUVoRCxDQUFDO1FBRUQsU0FBUyxDQUFDLElBQW9DO1lBQzdDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FDcEI7Z0JBQ0MsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsSUFBSSxFQUFFLG1CQUFtQixDQUFDLGFBQWE7YUFDdkMsRUFDRCxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FDcEMsQ0FBQztRQUNILENBQUM7UUFFRCxZQUFZLENBQUMsSUFBc0I7WUFDbEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUNwQjtnQkFDQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsZ0JBQWdCO2dCQUMxQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDZixFQUNELG1CQUFtQixDQUFDLFdBQVcsQ0FDL0IsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsSUFBcUM7WUFDNUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7Z0JBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNqQixJQUFJLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQzthQUM3QyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxDQUNOLE9BQTZEO1lBRTdELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELFVBQVUsQ0FDVCxPQUdTO1lBRVQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCxTQUFTLENBQ1IsT0FBNkQ7WUFFN0QsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU8sU0FBUyxDQUFDLElBQXVCLEVBQUUsUUFBaUI7WUFDM0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUNiLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsRUFDaEUsR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFxQixHQUFHLEVBQUU7Z0JBQy9DLE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJO2dCQUNWLFVBQVUsQ0FBQyxRQUFRO29CQUNsQixPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBRUosT0FBTyxHQUFHO2lCQUNSLFVBQVUsQ0FBQyxVQUFVLFFBQVE7Z0JBQzdCLElBQUksUUFBUSxFQUFFO29CQUNiLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUU7d0JBQy9DLFFBQVE7d0JBQ1IsUUFBUTtxQkFDUixDQUFDLENBQUM7aUJBQ0g7cUJBQU07b0JBQ04sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUMxRDtZQUNGLENBQUMsQ0FBQztpQkFDRCxTQUFTLENBQUMsVUFBVSxRQUFRO2dCQUM1QixDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDO2lCQUNELElBQUksRUFBRSxDQUFDO1FBQ1YsQ0FBQzs7SUF6RmUsd0JBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUNaLG9DQUFnQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3hCLGtDQUFjLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDdEIsZ0NBQVksR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUVwQixpQ0FBYSxHQUFHLENBQUMsQ0FBQztJQUNsQixvQ0FBZ0IsR0FBRyxDQUFDLENBQUM7SUFDckIsK0JBQVcsR0FBRyxDQUFDLENBQUM7SUFtRmpDLDBCQUFDO0tBQUE7ZUEzRm9CLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4uL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4uL09XZWJFdmVudCc7XHJcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMvVXRpbHMnO1xyXG5pbXBvcnQgeyBJTmV0UmVzcG9uc2UgfSBmcm9tICcuLi9PV2ViTmV0JztcclxuaW1wb3J0IHsgSU9ab25lQXBpSlNPTiB9IGZyb20gJy4uL296b25lJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJBY2NvdW50UmVjb3ZlcnkgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FSX05FWFRfU1RFUCA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUl9TVUNDRVNTID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FSX0VSUk9SID0gaWQoKTtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IEFSX1NURVBfU1RBUlQgPSAxO1xyXG5cdHN0YXRpYyByZWFkb25seSBBUl9TVEVQX1ZBTElEQVRFID0gMjtcclxuXHRzdGF0aWMgcmVhZG9ubHkgQVJfU1RFUF9FTkQgPSAzO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0fVxyXG5cclxuXHRzdGVwU3RhcnQoZGF0YTogeyBwaG9uZTogc3RyaW5nOyBjYzI6IHN0cmluZyB9KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc2VuZEZvcm0oXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwaG9uZTogZGF0YS5waG9uZSxcclxuXHRcdFx0XHRjYzI6IGRhdGEuY2MyLFxyXG5cdFx0XHRcdHN0ZXA6IE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9TVEFSVCxcclxuXHRcdFx0fSxcclxuXHRcdFx0T1dlYkFjY291bnRSZWNvdmVyeS5BUl9TVEVQX1ZBTElEQVRFLFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHN0ZXBWYWxpZGF0ZShkYXRhOiB7IGNvZGU6IHN0cmluZyB9KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc2VuZEZvcm0oXHJcblx0XHRcdHtcclxuXHRcdFx0XHRzdGVwOiBPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfVkFMSURBVEUsXHJcblx0XHRcdFx0Y29kZTogZGF0YS5jb2RlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfRU5ELFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHN0ZXBFbmQoZGF0YTogeyBwYXNzOiBzdHJpbmc7IHZwYXNzOiBzdHJpbmcgfSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NlbmRGb3JtKHtcclxuXHRcdFx0cGFzczogZGF0YS5wYXNzLFxyXG5cdFx0XHR2cGFzczogZGF0YS52cGFzcyxcclxuXHRcdFx0c3RlcDogU3RyaW5nKE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9FTkQpLFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvbkVycm9yKFxyXG5cdFx0aGFuZGxlcjogKHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8SU9ab25lQXBpSlNPTjxhbnk+PikgPT4gdm9pZCxcclxuXHQpOiB0aGlzIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBY2NvdW50UmVjb3ZlcnkuRVZUX0FSX0VSUk9SLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uTmV4dFN0ZXAoXHJcblx0XHRoYW5kbGVyOiAoXHJcblx0XHRcdHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8SU9ab25lQXBpSlNPTjxhbnk+PixcclxuXHRcdFx0c3RlcDogbnVtYmVyLFxyXG5cdFx0KSA9PiB2b2lkLFxyXG5cdCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfTkVYVF9TVEVQLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uU3VjY2VzcyhcclxuXHRcdGhhbmRsZXI6IChyZXNwb25zZTogSU5ldFJlc3BvbnNlPElPWm9uZUFwaUpTT048YW55Pj4pID0+IHZvaWQsXHJcblx0KTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9TVUNDRVNTLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3NlbmRGb3JtKGRhdGE6IEZvcm1EYXRhIHwgb2JqZWN0LCBuZXh0U3RlcD86IG51bWJlcikge1xyXG5cdFx0Y29uc3QgbSA9IHRoaXMsXHJcblx0XHRcdHVybCA9IG0uYXBwQ29udGV4dC51cmwuZ2V0KCdPWl9TRVJWRVJfQUNDT1VOVF9SRUNPVkVSWV9TRVJWSUNFJyksXHJcblx0XHRcdG5ldCA9IG0uYXBwQ29udGV4dC5uZXQ8SU9ab25lQXBpSlNPTjxhbnk+Pih1cmwsIHtcclxuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0XHRib2R5OiBkYXRhLFxyXG5cdFx0XHRcdGlzR29vZE5ld3MocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRcdHJldHVybiBCb29sZWFuKHJlc3BvbnNlLmpzb24gJiYgcmVzcG9uc2UuanNvbi5lcnJvciA9PT0gMCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ldFxyXG5cdFx0XHQub25Hb29kTmV3cyhmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuXHRcdFx0XHRpZiAobmV4dFN0ZXApIHtcclxuXHRcdFx0XHRcdG0udHJpZ2dlcihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9ORVhUX1NURVAsIFtcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2UsXHJcblx0XHRcdFx0XHRcdG5leHRTdGVwLFxyXG5cdFx0XHRcdFx0XSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdG0udHJpZ2dlcihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9TVUNDRVNTLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHRcdC5vbkJhZE5ld3MoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJBY2NvdW50UmVjb3ZlcnkuRVZUX0FSX0VSUk9SLCBbcmVzcG9uc2VdKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LnNlbmQoKTtcclxuXHR9XHJcbn1cclxuIl19