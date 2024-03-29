import { OI18nDefinition } from '../../OWebI18n';

export default {
	OW_ERROR_REQUEST_FAILED: 'Error: The request failed.',
	OW_ERROR_REQUEST_TIMED_OUT: 'Error: Request is taking too long to complete.',
	OW_ERROR_REQUEST_ABORTED: 'Error: The request was aborted.',

	OZ_ERROR_NETWORK: 'Error: Internet connection problems.',
	OZ_ERROR_SERVER: 'Error: Failed to retrieve information.',
	OZ_ERROR_YOU_ARE_NOT_ADMIN: 'Error: You are not an administrator.',
	OZ_ERROR_NOT_FOUND: 'Error: Resource not found.',
	OZ_ERROR_SHOULD_ACCEPT_CGU: 'You must accept the Terms of Use.',
	OZ_IMAGE_NOT_VALID:
		'Invalid image file. Please choose an image of type png, jpeg, or gif.',
	OZ_PROFILE_PIC_SET_TO_DEFAULT: 'Default profile picture chosen.',
	OZ_PROFILE_PIC_CHANGED: 'Profile picture change.',
	OZ_FORM_CONTAINS_EMPTY_FIELD: 'The `{label}` field is empty.',
	OZ_FILE_TOO_BIG: 'File too heavy, maximum 100Mb.',
	OZ_FILE_IS_EMPTY: 'Empty file.',
	OZ_ERROR_INVALID_FORM:
		'The request is invalid. You may not be authorized to perform this action.',
	OZ_FIELD_PHONE_ALREADY_REGISTERED:
		'{phone} is already linked to another account.',
	OZ_FIELD_EMAIL_ALREADY_REGISTERED:
		'{email} is already associated with another account.',
	OZ_FIELD_PHONE_INVALID: 'The number is invalid.',
	OZ_FIELD_PHONE_NOT_REGISTERED: 'This number is not registered.',
	OZ_FIELD_EMAIL_NOT_REGISTERED: 'This email address is not registered.',
	OZ_FIELD_PASS_INVALID: 'The password is incorrect.',
	OZ_FIELD_COUNTRY_NOT_ALLOWED:
		'The specified country is not valid. The service may not be in your country yet.',
	OZ_AUTH_CODE_SENT: 'A code was sent to you at: {phone}',
	OZ_AUTH_CODE_NEW_SENT: 'A new code has been sent to you at: {phone}',
	OZ_AUTH_CODE_OK: 'Correct verification code!',
	OZ_AUTH_CODE_INVALID: 'The code is invalid',
	OZ_AUTH_CODE_EXCEED_MAX_FAIL:
		'You have reached the maximum number of failures allowed for the same code.',
	OZ_AUTH_CODE_EXPIRED: 'The code has already expired.',
	OZ_AUTH_PROCESS_INVALID: 'Please restart the authentication process',
	OZ_PHONE_AUTH_NOT_STARTED: 'Repeat the validation of the number.',
	OZ_PHONE_AUTH_NOT_VALIDATED: 'You have not validated your number.',
	OZ_PASSWORD_SAME_OLD_AND_NEW_PASS: 'Your old and new password are the same.',
	OZ_PASSWORD_EDIT_SUCCESS: 'Your password has been changed.',
	OZ_FIELD_USER_NAME_INVALID:
		'The surname and first names contain unauthorized characters.',
	OZ_FIELD_USER_NAME_TOO_SHORT: 'The name and surname is too short.',
	OZ_FIELD_USER_NAME_TOO_LONG: 'The name and surname is too long.',
	OZ_FIELD_USER_NAME_CONTAINS_KEYWORDS:
		'The first and last names must not contain keywords ...',
	OZ_FIELD_EMAIL_INVALID: 'The email address is invalid.',
	OZ_FIELD_GENDER_INVALID: 'Please indicate your gender.',
	OZ_FIELD_BIRTH_DATE_INVALID:
		'The date of birth is invalid ({min} years minimum and {max} years maximum).',
	OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL: 'Passwords are not the same.',
	OZ_FIELD_PASS_TOO_LONG:
		'The password is too long. ({max} characters maximum)',
	OZ_FIELD_PASS_TOO_SHORT:
		'The password is too short. ({min} characters minimum)',
	OZ_SIGNUP_SUCCESS: 'Successful registration.',
	OZ_ERROR_INTERNAL: 'Internal error ...',
	OZ_ERROR_YOU_MUST_LOGIN: 'You must log in first.',
	OZ_ERROR_NOT_ALLOWED:
		'An error has occurred. You may not be allowed to perform this action.',
	OZ_USER_ONLINE: 'You are connected.',
	OZ_USER_LOGOUT: 'You have logged out.',
	OZ_LOGOUT_FAIL: 'The disconnect failed.',
	OZ_FILE_UPLOAD_FAIL: 'Failed to send file (s)',
	OZ_FILE_ALIAS_UNKNOWN: 'Unknown alias file.',
	OZ_FILE_ALIAS_PARSE_ERROR: 'Alias file, parse error.',
	OZ_FILE_ALIAS_NOT_FOUND:
		'The alias file or the targeted file can not be found ...',

	OW_TIME_DAY_NAMES_SHORT: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
	OW_TIME_DAY_NAMES_FULL:
		'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	OW_TIME_MONTH_NAMES_SHORT: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
	OW_TIME_MONTH_NAMES_FULL:
		'January,February,March,April,May,June,July,August,September,October,November,December',

	OW_TIME_JUST_NOW: 'now',
	OW_TIME_IN_FEW_SECONDS: 'in a few seconds',
	OW_TIME_FEW_SECONDS_AGO: 'few seconds ago',
	OW_TIME_N_SECONDS_AGO: '{nSeconds}s ago',
	OW_TIME_IN_N_SECONDS: 'in {nSeconds}s',
	OW_TIME_LESS_THAN_A_MINUTE_AGO: 'less than a minute',
	OW_TIME_IN_LESS_THAN_A_MINUTE: 'in less than a minute',
	OW_TIME_ABOUT_A_MINUTE_AGO: 'a minute ago',
	OW_TIME_IN_ABOUT_A_MINUTE: 'in a minute',
	OW_TIME_N_MINUTES_AGO: '{nMinutes}min ago',
	OW_TIME_IN_N_MINUTES: 'in {nMinutes}min',
	OW_TIME_ABOUT_AN_HOUR_AGO: '1 hour ago',
	OW_TIME_IN_ABOUT_AN_HOUR: 'in 1 hour',
	OW_TIME_N_HOURS_AGO: '{nHours} hour ago ~ {nHours} hours ago',
	OW_TIME_IN_N_HOURS: 'in {nHours} hour ~ in {nHours} hours',
	OW_TIME_N_DAYS_AGO: '{nDays} day ago ~ {nDays} days ago',
	OW_TIME_IN_N_DAYS: 'in {nDays} day ~ in {nDays} days',
	OW_TIME_N_WEEKS_AGO: '{nWeeks} week ago ~ {nWeeks} weeks ago',
	OW_TIME_IN_N_WEEKS: 'in {nWeeks} week ~ in {nWeeks} weeks',
	OW_TIME_N_MONTHS_AGO: '{nMonths} month ago ~ {nMonths} months ago',
	OW_TIME_IN_N_MONTHS: 'in {nMonths} month ~ in {nMonths} months',
	OW_TIME_N_YEARS_AGO: '{nYears}year ago ~ {nYears}years ago',
	OW_TIME_IN_N_YEARS: 'in {nYears}year ~ in {nYears}years',
} as OI18nDefinition;
