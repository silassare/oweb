import OWebApp from "./OWebApp";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebCom from "./OWebCom";
export declare type tSvcSuccessCb = () => void;
export declare type tSvcFailCb = () => void;
export declare type tSvcReqOptions = {
    max?: number;
    page?: number;
    filters?: any;
};
export default class OWebService {
    private readonly app_context;
    private readonly item_id_name;
    private readonly _key_store;
    private readonly _base_data;
    constructor(app_context: OWebApp, service_name: string, item_id_name: string);
    getServiceURI(): string;
    getItemURI(id: any): string;
    getItemRelationURI(id: string, relation: string): string;
    getCacheManager(): OWebKeyStorage;
    addItem(formData: any, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean): OWebCom;
    deleteItem(id: string, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean): OWebCom;
    updateItem(id: string, formData: any, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean): OWebCom;
    updateAllItems(options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean): OWebCom;
    getItem(id: string, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean, load_cache_first?: boolean): OWebCom;
    getAllItems(options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    getRelationItems(id: string, relation: string, options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
}
