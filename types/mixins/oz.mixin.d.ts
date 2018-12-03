import Vue from "vue";
import OWebApp from "../OWebApp";
import { tFileQuality } from "../OWebFS";
export default function (app: OWebApp): import("vue/types/vue").VueConstructor<{
    oz_file_link: (file: string, quality?: tFileQuality, def?: string | undefined) => string;
} & Record<never, any> & Vue>;
