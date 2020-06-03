import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import { ozNet } from '../ozone';
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
            const m = this, url = m.appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE'), net = ozNet(url, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFjY291bnRSZWNvdmVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL09XZWJBY2NvdW50UmVjb3ZlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFOUIsT0FBTyxFQUFpQixLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEQ7SUFBQSxNQUFxQixtQkFBb0IsU0FBUSxTQUFTO1FBVXpELFlBQTZCLFVBQW1CO1lBQy9DLEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVM7UUFFaEQsQ0FBQztRQUVELFNBQVMsQ0FBQyxJQUFvQztZQUM3QyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQ3BCO2dCQUNDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2dCQUNiLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxhQUFhO2FBQ3ZDLEVBQ0QsbUJBQW1CLENBQUMsZ0JBQWdCLENBQ3BDLENBQUM7UUFDSCxDQUFDO1FBRUQsWUFBWSxDQUFDLElBQXNCO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FDcEI7Z0JBQ0MsSUFBSSxFQUFFLG1CQUFtQixDQUFDLGdCQUFnQjtnQkFDMUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2YsRUFDRCxtQkFBbUIsQ0FBQyxXQUFXLENBQy9CLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxDQUFDLElBQXFDO1lBQzVDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUM7YUFDN0MsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELE9BQU8sQ0FDTixPQUE2RDtZQUU3RCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxVQUFVLENBQ1QsT0FHUztZQUVULE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsU0FBUyxDQUNSLE9BQTZEO1lBRTdELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVPLFNBQVMsQ0FBQyxJQUF1QixFQUFFLFFBQWlCO1lBQzNELE1BQU0sQ0FBQyxHQUFHLElBQUksRUFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLEVBQ2hFLEdBQUcsR0FBRyxLQUFLLENBQXFCLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsVUFBVSxDQUFDLFFBQVE7b0JBQ2xCLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVELENBQUM7YUFDRCxDQUFDLENBQUM7WUFFSixPQUFPLEdBQUc7aUJBQ1IsVUFBVSxDQUFDLFVBQVUsUUFBUTtnQkFDN0IsSUFBSSxRQUFRLEVBQUU7b0JBQ2IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRTt3QkFDL0MsUUFBUTt3QkFDUixRQUFRO3FCQUNSLENBQUMsQ0FBQztpQkFDSDtxQkFBTTtvQkFDTixDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQzFEO1lBQ0YsQ0FBQyxDQUFDO2lCQUNELFNBQVMsQ0FBQyxVQUFVLFFBQVE7Z0JBQzVCLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN6RCxDQUFDLENBQUM7aUJBQ0QsSUFBSSxFQUFFLENBQUM7UUFDVixDQUFDOztJQXpGZSx3QkFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ1osb0NBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDeEIsa0NBQWMsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUN0QixnQ0FBWSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBRXBCLGlDQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLG9DQUFnQixHQUFHLENBQUMsQ0FBQztJQUNyQiwrQkFBVyxHQUFHLENBQUMsQ0FBQztJQW1GakMsMEJBQUM7S0FBQTtlQTNGb0IsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi4vT1dlYkFwcCc7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB7IElOZXRSZXNwb25zZSB9IGZyb20gJy4uL09XZWJOZXQnO1xyXG5pbXBvcnQgeyBJT1pvbmVBcGlKU09OLCBvek5ldCB9IGZyb20gJy4uL296b25lJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJBY2NvdW50UmVjb3ZlcnkgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FSX05FWFRfU1RFUCA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUl9TVUNDRVNTID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FSX0VSUk9SID0gaWQoKTtcclxuXHJcblx0c3RhdGljIHJlYWRvbmx5IEFSX1NURVBfU1RBUlQgPSAxO1xyXG5cdHN0YXRpYyByZWFkb25seSBBUl9TVEVQX1ZBTElEQVRFID0gMjtcclxuXHRzdGF0aWMgcmVhZG9ubHkgQVJfU1RFUF9FTkQgPSAzO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0fVxyXG5cclxuXHRzdGVwU3RhcnQoZGF0YTogeyBwaG9uZTogc3RyaW5nOyBjYzI6IHN0cmluZyB9KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc2VuZEZvcm0oXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwaG9uZTogZGF0YS5waG9uZSxcclxuXHRcdFx0XHRjYzI6IGRhdGEuY2MyLFxyXG5cdFx0XHRcdHN0ZXA6IE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9TVEFSVCxcclxuXHRcdFx0fSxcclxuXHRcdFx0T1dlYkFjY291bnRSZWNvdmVyeS5BUl9TVEVQX1ZBTElEQVRFLFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHN0ZXBWYWxpZGF0ZShkYXRhOiB7IGNvZGU6IHN0cmluZyB9KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fc2VuZEZvcm0oXHJcblx0XHRcdHtcclxuXHRcdFx0XHRzdGVwOiBPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfVkFMSURBVEUsXHJcblx0XHRcdFx0Y29kZTogZGF0YS5jb2RlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRPV2ViQWNjb3VudFJlY292ZXJ5LkFSX1NURVBfRU5ELFxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdHN0ZXBFbmQoZGF0YTogeyBwYXNzOiBzdHJpbmc7IHZwYXNzOiBzdHJpbmcgfSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3NlbmRGb3JtKHtcclxuXHRcdFx0cGFzczogZGF0YS5wYXNzLFxyXG5cdFx0XHR2cGFzczogZGF0YS52cGFzcyxcclxuXHRcdFx0c3RlcDogU3RyaW5nKE9XZWJBY2NvdW50UmVjb3ZlcnkuQVJfU1RFUF9FTkQpLFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvbkVycm9yKFxyXG5cdFx0aGFuZGxlcjogKHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8SU9ab25lQXBpSlNPTjxhbnk+PikgPT4gdm9pZCxcclxuXHQpOiB0aGlzIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBY2NvdW50UmVjb3ZlcnkuRVZUX0FSX0VSUk9SLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uTmV4dFN0ZXAoXHJcblx0XHRoYW5kbGVyOiAoXHJcblx0XHRcdHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8SU9ab25lQXBpSlNPTjxhbnk+PixcclxuXHRcdFx0c3RlcDogbnVtYmVyLFxyXG5cdFx0KSA9PiB2b2lkLFxyXG5cdCk6IHRoaXMge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfTkVYVF9TVEVQLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdG9uU3VjY2VzcyhcclxuXHRcdGhhbmRsZXI6IChyZXNwb25zZTogSU5ldFJlc3BvbnNlPElPWm9uZUFwaUpTT048YW55Pj4pID0+IHZvaWQsXHJcblx0KTogdGhpcyB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9TVUNDRVNTLCBoYW5kbGVyKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3NlbmRGb3JtKGRhdGE6IEZvcm1EYXRhIHwgb2JqZWN0LCBuZXh0U3RlcD86IG51bWJlcikge1xyXG5cdFx0Y29uc3QgbSA9IHRoaXMsXHJcblx0XHRcdHVybCA9IG0uYXBwQ29udGV4dC51cmwuZ2V0KCdPWl9TRVJWRVJfQUNDT1VOVF9SRUNPVkVSWV9TRVJWSUNFJyksXHJcblx0XHRcdG5ldCA9IG96TmV0PElPWm9uZUFwaUpTT048YW55Pj4odXJsLCB7XHJcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXHJcblx0XHRcdFx0Ym9keTogZGF0YSxcclxuXHRcdFx0XHRpc0dvb2ROZXdzKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gQm9vbGVhbihyZXNwb25zZS5qc29uICYmIHJlc3BvbnNlLmpzb24uZXJyb3IgPT09IDApO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBuZXRcclxuXHRcdFx0Lm9uR29vZE5ld3MoZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0aWYgKG5leHRTdGVwKSB7XHJcblx0XHRcdFx0XHRtLnRyaWdnZXIoT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfTkVYVF9TVEVQLCBbXHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlLFxyXG5cdFx0XHRcdFx0XHRuZXh0U3RlcCxcclxuXHRcdFx0XHRcdF0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRtLnRyaWdnZXIoT1dlYkFjY291bnRSZWNvdmVyeS5FVlRfQVJfU1VDQ0VTUywgW3Jlc3BvbnNlXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQub25CYWROZXdzKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViQWNjb3VudFJlY292ZXJ5LkVWVF9BUl9FUlJPUiwgW3Jlc3BvbnNlXSk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5zZW5kKCk7XHJcblx0fVxyXG59XHJcbiJdfQ==