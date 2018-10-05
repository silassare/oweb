import OWebApp from "../OWebApp";
export default function (app: OWebApp): import("vue/types/vue").VueConstructor<{
    ow_local_time: (time: string) => number;
    ow_route_link: (path: string) => string;
} & Record<never, any> & {
    oz_file_link: (file_id: string, file_key?: string | undefined, file_quality?: 0 | 2 | 3 | 1, def?: string | undefined) => string;
} & import("vue/types/vue").Vue>;
