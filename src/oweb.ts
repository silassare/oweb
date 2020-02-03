import OWebApp from './OWebApp';
import OWebCom from './OWebCom';
import OWebConfigs from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebCustomError from './OWebCustomError';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebFS from './OWebFS';
import OWebKeyStorage from './OWebKeyStorage';
import OWebI18n from './OWebI18n';
import OWebRouter, { OWebRoute, OWebRouteContext } from './OWebRouter';
import OWebService from './OWebService';
import OWebServiceStore from './OWebServiceStore';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebDate from './plugins/OWebDate';
import OWebLogin from './plugins/OWebLogin';
import OWebLogout from './plugins/OWebLogout';
import OWebPager from './OWebPager';
import OWebPassword from './plugins/OWebPassword';
import OWebAccountRecovery from './plugins/OWebAccountRecovery';
import OWebSignUp from './plugins/OWebSignUp';
import OWebTNet from './plugins/OWebTNet';
import PathResolver from './utils/PathResolver';
import scriptLoader from './utils/scriptLoader';
import Utils from './utils/Utils';
import OWebPageBase from './OWebPageBase';
import { createApp } from './createApp';
import OWebTelInput from 'oweb-tel-input';

export { tConfigList } from './OWebConfigs';

export { tUrlList } from './OWebUrl';

export { tComOptions, iComResponse } from './OWebCom';

export { tFormValidator } from './OWebFormValidator';

export { tFileAliasInfo, tFileQuality } from './OWebFS';

export {
	tI18nData,
	tI18nDefinition,
	tI18nPluralize,
	tI18nOptions,
} from './OWebI18n';

export {
	tRoutePath,
	tRoutePathOptions,
	tRouteStateObject,
	tRouteStateItem,
	tRouteAction,
	tRouteInfo,
	tRouteTarget,
	tRouteTokensMap,
	iRouteDispatcher,
} from './OWebRouter';

export { tViewDialog } from './OWebView';

export { tDateDesc } from './plugins/OWebDate';

export { iPage, iPageRoute, iPageRouteFull } from './OWebPager';

export { tScriptFile } from './utils/scriptLoader';

export {
	tServiceFail,
	tServiceAddSuccess,
	tServiceDeleteAllSuccess,
	tServiceGetAllSuccess,
	tServiceGetSuccess,
	tServiceUpdateAllSuccess,
	tServiceUpdateSuccess,
	tServiceDeleteSuccess,
	tServiceGetRelationItemsSuccess,
	tServiceGetRelationSuccess,
	tServiceRequestOptions,
	iServiceGetRelationItemResponse,
	iServiceAddResponse,
	iServiceDeleteAllResponse,
	iServiceDeleteResponse,
	iServiceGetAllResponse,
	iServiceGetRelationItemsResponse,
	iServiceGetResponse,
	iServiceUpdateAllData,
	iServiceUpdateResponse,
} from './OWebService';

export {
	OWebEvent,
	OWebApp,
	OWebCom,
	OWebConfigs,
	OWebCurrentUser,
	OWebCustomError,
	OWebDataStore,
	OWebFormValidator,
	OWebFS,
	OWebKeyStorage,
	OWebI18n,
	OWebRouter,
	OWebRoute,
	OWebRouteContext,
	OWebUrl,
	OWebView,
	OWebService,
	OWebServiceStore,
	OWebPager,
	OWebPageBase,
	// Plugins

	OWebLogin,
	OWebLogout,
	OWebPassword,
	OWebAccountRecovery,
	OWebSignUp,
	OWebDate,
	OWebTNet,
	OWebTelInput,
	// Utilities

	Utils,
	PathResolver,
	scriptLoader,
	createApp,
};

// side-effect import
import './default/index';
