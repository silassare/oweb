import {OAppConfigs} from '../OWebApp';

export default {
	'OW_APP_NAME'              : '',
	'OW_APP_VERSION'           : '',
	'OW_APP_LOCAL_BASE_URL'    : '',
	'OW_APP_ROUTER_HASH_MODE'  : false,
	'OW_APP_ALLOWED_COUNTRIES' : [],
	'OW_APP_LOGO_SRC'          : '',
	'OW_APP_ANDROID_ID'        : '',
	'OW_APP_UPDATER_SCRIPT_SRC': '',

	'OZ_API_KEY_HEADER_NAME'         : 'x-ozone-api-key',
	'OZ_API_ALLOW_REAL_METHOD_HEADER': true,
	'OZ_API_REAL_METHOD_HEADER_NAME' : 'x-ozone-real-method',
	'OZ_API_KEY'                     : '',
	'OZ_API_BASE_URL'                : '',

	'OZ_CODE_REG'            : '^[0-9]{6}$',
	'OZ_USER_NAME_MIN_LENGTH': 3,
	'OZ_USER_NAME_MAX_LENGTH': 60,
	'OZ_PASS_MIN_LENGTH'     : 6,
	'OZ_PASS_MAX_LENGTH'     : 60,
	'OZ_USER_MIN_AGE'        : 12,
	'OZ_USER_MAX_AGE'        : 100,
	'OZ_PPIC_MIN_SIZE'       : 150,
	'OZ_USER_ALLOWED_GENDERS': ['Male', 'Female'],
} as OAppConfigs;
