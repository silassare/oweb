import Vue from "vue";
import OWebApp from "../OWebApp";
export default function (app: OWebApp): import("vue/types/vue").VueConstructor<{
    oz_file_link: (file_id: string, file_key?: string | undefined, file_quality?: 0 | 2 | 3 | 1, def?: string | undefined) => string;
} & Record<never, any> & Vue>;
