import OWebApp from "../OWebApp";
import { tFileQuality } from "../OWebFS";
export default function (app: OWebApp): {
    oz_file_link: (file: string, quality?: tFileQuality, def?: string | undefined) => string;
};
