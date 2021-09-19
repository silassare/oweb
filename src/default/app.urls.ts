import { OUrlList } from '../OWebApp';

export default {
	OZ_SERVER_GET_FILE_URI:
		'files/ozone-{oz_file_id}-{oz_file_key}-{oz_file_quality}',
	OZ_SERVER_TNET_SERVICE: 'tnet/',
	OZ_SERVER_LOGIN_SERVICE: 'login/',
	OZ_SERVER_LOGOUT_SERVICE: 'logout/',
	OZ_SERVER_SIGNUP_SERVICE: 'signup/',
	OZ_SERVER_ACCOUNT_RECOVERY_SERVICE: 'account-recovery/',
	OZ_SERVER_PASSWORD_SERVICE: 'password/',
	OZ_SERVER_CAPTCHA_SERVICE: 'captcha/',
	OZ_SERVER_UPLOAD_SERVICE: 'upload/',

	OW_APP_PATH_SIGN_UP: '/register',
	OW_APP_PATH_LOGIN: '/login',
	OW_APP_PATH_LOGOUT: '/logout',
	OW_APP_PATH_HOME: '/',
} as OUrlList;
