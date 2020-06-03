import OWebFormValidator from '../OWebFormValidator';
import OWebDate from '../plugins/OWebDate';
import OWebInput from 'oweb-tel-input';
import { isValidAge } from '../utils';
OWebFormValidator.addFieldValidators({
    code: (value, name, fv) => {
        const codeReg = new RegExp(fv.getConfig('OZ_CODE_REG'));
        fv.assert(codeReg.test(value), 'OZ_AUTH_CODE_INVALID');
    },
    uname: (value, name, fv) => {
        value = value.replace(/\s+/g, ' ').trim();
        fv.assert(value.length >= fv.getConfig('OZ_USER_NAME_MIN_LENGTH'), 'OZ_FIELD_USER_NAME_TOO_SHORT')
            .assert(value.length <= fv.getConfig('OZ_USER_NAME_MAX_LENGTH'), 'OZ_FIELD_USER_NAME_TOO_LONG')
            .setField(name, value);
    },
    login_pass: (value, name, fv) => {
        const pass = value, min = fv.getConfig('OZ_PASS_MIN_LENGTH'), max = fv.getConfig('OZ_PASS_MAX_LENGTH');
        fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(pass.length <= max, 'OZ_FIELD_PASS_INVALID');
    },
    cpass: (value, name, fv) => {
        const pass = value, min = fv.getConfig('OZ_PASS_MIN_LENGTH'), max = fv.getConfig('OZ_PASS_MAX_LENGTH');
        fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(pass.length <= max, 'OZ_FIELD_PASS_INVALID');
    },
    pass: (value, name, fv) => {
        const pass = value, min = fv.getConfig('OZ_PASS_MIN_LENGTH'), max = fv.getConfig('OZ_PASS_MAX_LENGTH');
        fv.assert(pass.length >= min, 'OZ_FIELD_PASS_TOO_SHORT', {
            min,
            max,
        }).assert(pass.length <= max, 'OZ_FIELD_PASS_TOO_LONG', {
            min,
            max,
        });
    },
    vpass: (value, name, fv) => {
        fv.assert(value === fv.getField('pass'), 'OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL');
    },
    birth_date: (value, name, fv) => {
        const od = new OWebDate(fv.getAppContext(), value), date = od.describe(), minAge = fv.getConfig('OZ_USER_MIN_AGE'), maxAge = fv.getConfig('OZ_USER_MAX_AGE'), isValid = date &&
            isValidAge(date.d, parseInt(date.mm), date.Y, minAge, maxAge);
        fv.assert(isValid, 'OZ_FIELD_BIRTH_DATE_INVALID', {
            input: value,
            min: minAge,
            max: maxAge,
        });
        date && fv.setField(name, `${date.Y}-${date.mm}-${date.d}`);
    },
    gender: (value, name, fv) => {
        const genders = fv.getConfig('OZ_USER_ALLOWED_GENDERS');
        fv.assert(genders.indexOf(value) >= 0, 'OZ_FIELD_GENDER_INVALID');
    },
    phone: (value, name, fv) => {
        fv.assert(OWebInput.isPhoneNumberPossible(value), 'OZ_FIELD_PHONE_INVALID');
        const t = new OWebInput({ number: value }), phone = t.getInput(), cc2 = t.getCurrentCountry().cc2;
        fv.setField(name, phone.replace(/[ -]/g, ''));
        // we set only if it is not already done
        // we may have multiple phone field or a cc2 field
        if (!fv.getField('cc2')) {
            fv.setField('cc2', cc2);
        }
    },
    email: (value, name, fv) => {
        /**
         * Email matching regex
         *
         * source: http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
         *        - TLD not required
         *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
         *        - must have TLD
         *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
         */
        const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        const email = value.replace(/\s/g, ' ').trim();
        fv.assert(emailReg.test(email), 'OZ_FIELD_EMAIL_INVALID').setField(name, email);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVmYXVsdC9mdi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGlCQUFpQixNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sU0FBUyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUM7SUFDcEMsSUFBSSxFQUFFLENBQUMsS0FBVSxFQUFFLElBQVksRUFBRSxFQUFxQixFQUFFLEVBQUU7UUFDekQsTUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3hELEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFVLEVBQUUsSUFBWSxFQUFFLEVBQXFCLEVBQUUsRUFBRTtRQUMxRCxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFMUMsRUFBRSxDQUFDLE1BQU0sQ0FDUixLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsRUFDdkQsOEJBQThCLENBQzlCO2FBQ0MsTUFBTSxDQUNOLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxFQUN2RCw2QkFBNkIsQ0FDN0I7YUFDQSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDRCxVQUFVLEVBQUUsQ0FBQyxLQUFVLEVBQUUsSUFBWSxF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QUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUvQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxRQUFRLENBQ2pFLElBQUksRUFDSixLQUFLLENBQ0wsQ0FBQztJQUNILENBQUM7Q0FDRCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkZvcm1WYWxpZGF0b3IgZnJvbSAnLi4vT1dlYkZvcm1WYWxpZGF0b3InO1xuaW1wb3J0IE9XZWJEYXRlIGZyb20gJy4uL3BsdWdpbnMvT1dlYkRhdGUnO1xuaW1wb3J0IE9XZWJJbnB1dCBmcm9tICdvd2ViLXRlbC1pbnB1dCc7XG5pbXBvcnQgeyBpc1ZhbGlkQWdlIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5PV2ViRm9ybVZhbGlkYXRvci5hZGRGaWVsZFZhbGlkYXRvcnMoe1xuXHRjb2RlOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHRjb25zdCBjb2RlUmVnID0gbmV3IFJlZ0V4cChmdi5nZXRDb25maWcoJ09aX0NPREVfUkVHJykpO1xuXHRcdGZ2LmFzc2VydChjb2RlUmVnLnRlc3QodmFsdWUpLCAnT1pfQVVUSF9DT0RFX0lOVkFMSUQnKTtcblx0fSxcblx0dW5hbWU6ICh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybVZhbGlkYXRvcikgPT4ge1xuXHRcdHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcblxuXHRcdGZ2LmFzc2VydChcblx0XHRcdHZhbHVlLmxlbmd0aCA+PSBmdi5nZXRDb25maWcoJ09aX1VTRVJfTkFNRV9NSU5fTEVOR1RIJyksXG5cdFx0XHQnT1pfRklFTERfVVNFUl9OQU1FX1RPT19TSE9SVCcsXG5cdFx0KVxuXHRcdFx0LmFzc2VydChcblx0XHRcdFx0dmFsdWUubGVuZ3RoIDw9IGZ2LmdldENvbmZpZygnT1pfVVNFUl9OQU1FX01BWF9MRU5HVEgnKSxcblx0XHRcdFx0J09aX0ZJRUxEX1VTRVJfTkFNRV9UT09fTE9ORycsXG5cdFx0XHQpXG5cdFx0XHQuc2V0RmllbGQobmFtZSwgdmFsdWUpO1xuXHR9LFxuXHRsb2dpbl9wYXNzOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHRjb25zdCBwYXNzID0gdmFsdWUsXG5cdFx0XHRtaW4gPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUlOX0xFTkdUSCcpLFxuXHRcdFx0bWF4ID0gZnYuZ2V0Q29uZmlnKCdPWl9QQVNTX01BWF9MRU5HVEgnKTtcblx0XHRmdi5hc3NlcnQocGFzcy5sZW5ndGggPj0gbWluLCAnT1pfRklFTERfUEFTU19JTlZBTElEJykuYXNzZXJ0KFxuXHRcdFx0cGFzcy5sZW5ndGggPD0gbWF4LFxuXHRcdFx0J09aX0ZJRUxEX1BBU1NfSU5WQUxJRCcsXG5cdFx0KTtcblx0fSxcblx0Y3Bhc3M6ICh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybVZhbGlkYXRvcikgPT4ge1xuXHRcdGNvbnN0IHBhc3MgPSB2YWx1ZSxcblx0XHRcdG1pbiA9IGZ2LmdldENvbmZpZygnT1pfUEFTU19NSU5fTEVOR1RIJyksXG5cdFx0XHRtYXggPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUFYX0xFTkdUSCcpO1xuXHRcdGZ2LmFzc2VydChwYXNzLmxlbmd0aCA+PSBtaW4sICdPWl9GSUVMRF9QQVNTX0lOVkFMSUQnKS5hc3NlcnQoXG5cdFx0XHRwYXNzLmxlbmd0aCA8PSBtYXgsXG5cdFx0XHQnT1pfRklFTERfUEFTU19JTlZBTElEJyxcblx0XHQpO1xuXHR9LFxuXHRwYXNzOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHRjb25zdCBwYXNzID0gdmFsdWUsXG5cdFx0XHRtaW4gPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUlOX0xFTkdUSCcpLFxuXHRcdFx0bWF4ID0gZnYuZ2V0Q29uZmlnKCdPWl9QQVNTX01BWF9MRU5HVEgnKTtcblx0XHRmdi5hc3NlcnQocGFzcy5sZW5ndGggPj0gbWluLCAnT1pfRklFTERfUEFTU19UT09fU0hPUlQnLCB7XG5cdFx0XHRtaW4sXG5cdFx0XHRtYXgsXG5cdFx0fSkuYXNzZXJ0KHBhc3MubGVuZ3RoIDw9IG1heCwgJ09aX0ZJRUxEX1BBU1NfVE9PX0xPTkcnLCB7XG5cdFx0XHRtaW4sXG5cdFx0XHRtYXgsXG5cdFx0fSk7XG5cdH0sXG5cdHZwYXNzOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHRmdi5hc3NlcnQoXG5cdFx0XHR2YWx1ZSA9PT0gZnYuZ2V0RmllbGQoJ3Bhc3MnKSxcblx0XHRcdCdPWl9GSUVMRF9QQVNTX0FORF9WUEFTU19OT1RfRVFVQUwnLFxuXHRcdCk7XG5cdH0sXG5cdGJpcnRoX2RhdGU6ICh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybVZhbGlkYXRvcikgPT4ge1xuXHRcdGNvbnN0IG9kID0gbmV3IE9XZWJEYXRlKGZ2LmdldEFwcENvbnRleHQoKSwgdmFsdWUpLFxuXHRcdFx0ZGF0ZSA9IG9kLmRlc2NyaWJlKCksXG5cdFx0XHRtaW5BZ2UgPSBmdi5nZXRDb25maWcoJ09aX1VTRVJfTUlOX0FHRScpLFxuXHRcdFx0bWF4QWdlID0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX01BWF9BR0UnKSxcblx0XHRcdGlzVmFsaWQgPVxuXHRcdFx0XHRkYXRlICYmXG5cdFx0XHRcdGlzVmFsaWRBZ2UoZGF0ZS5kLCBwYXJzZUludChkYXRlLm1tKSwgZGF0ZS5ZLCBtaW5BZ2UsIG1heEFnZSk7XG5cblx0XHRmdi5hc3NlcnQoaXNWYWxpZCwgJ09aX0ZJRUxEX0JJUlRIX0RBVEVfSU5WQUxJRCcsIHtcblx0XHRcdGlucHV0OiB2YWx1ZSxcblx0XHRcdG1pbjogbWluQWdlLFxuXHRcdFx0bWF4OiBtYXhBZ2UsXG5cdFx0fSk7XG5cblx0XHRkYXRlICYmIGZ2LnNldEZpZWxkKG5hbWUsIGAke2RhdGUuWX0tJHtkYXRlLm1tfS0ke2RhdGUuZH1gKTtcblx0fSxcblx0Z2VuZGVyOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHRjb25zdCBnZW5kZXJzID0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX0FMTE9XRURfR0VOREVSUycpO1xuXHRcdGZ2LmFzc2VydChnZW5kZXJzLmluZGV4T2YodmFsdWUpID49IDAsICdPWl9GSUVMRF9HRU5ERVJfSU5WQUxJRCcpO1xuXHR9LFxuXHRwaG9uZTogKHZhbHVlOiBhbnksIG5hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtVmFsaWRhdG9yKSA9PiB7XG5cdFx0ZnYuYXNzZXJ0KFxuXHRcdFx0T1dlYklucHV0LmlzUGhvbmVOdW1iZXJQb3NzaWJsZSh2YWx1ZSksXG5cdFx0XHQnT1pfRklFTERfUEhPTkVfSU5WQUxJRCcsXG5cdFx0KTtcblxuXHRcdGNvbnN0IHQgPSBuZXcgT1dlYklucHV0KHsgbnVtYmVyOiB2YWx1ZSB9KSxcblx0XHRcdHBob25lID0gdC5nZXRJbnB1dCgpLFxuXHRcdFx0Y2MyID0gdC5nZXRDdXJyZW50Q291bnRyeSgpLmNjMjtcblxuXHRcdGZ2LnNldEZpZWxkKG5hbWUsIHBob25lLnJlcGxhY2UoL1sgLV0vZywgJycpKTtcblxuXHRcdC8vIHdlIHNldCBvbmx5IGlmIGl0IGlzIG5vdCBhbHJlYWR5IGRvbmVcblx0XHQvLyB3ZSBtYXkgaGF2ZSBtdWx0aXBsZSBwaG9uZSBmaWVsZCBvciBhIGNjMiBmaWVsZFxuXHRcdGlmICghZnYuZ2V0RmllbGQoJ2NjMicpKSB7XG5cdFx0XHRmdi5zZXRGaWVsZCgnY2MyJywgY2MyKTtcblx0XHR9XG5cdH0sXG5cdGVtYWlsOiAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHtcblx0XHQvKipcblx0XHQgKiBFbWFpbCBtYXRjaGluZyByZWdleFxuXHRcdCAqXG5cdFx0ICogc291cmNlOiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI3ZhbGlkLWUtbWFpbC1hZGRyZXNzXG5cdFx0ICogICAgICAgIC0gVExEIG5vdCByZXF1aXJlZFxuXHRcdCAqICAgICAgICAgICAgL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvXG5cdFx0ICogICAgICAgIC0gbXVzdCBoYXZlIFRMRFxuXHRcdCAqICAgICAgICAgICAgL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyQvXG5cdFx0ICovXG5cdFx0Y29uc3QgZW1haWxSZWcgPSAvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrJC87XG5cdFx0Y29uc3QgZW1haWwgPSB2YWx1ZS5yZXBsYWNlKC9cXHMvZywgJyAnKS50cmltKCk7XG5cblx0XHRmdi5hc3NlcnQoZW1haWxSZWcudGVzdChlbWFpbCksICdPWl9GSUVMRF9FTUFJTF9JTlZBTElEJykuc2V0RmllbGQoXG5cdFx0XHRuYW1lLFxuXHRcdFx0ZW1haWwsXG5cdFx0KTtcblx0fSxcbn0pO1xuIl19