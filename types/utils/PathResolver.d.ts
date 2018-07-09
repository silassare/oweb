declare let PathResolver: {
    DS: string;
    resolve: (ro_ot: string, path: string) => string;
    job: (path: string) => string;
    normalize: (path: string) => string;
    isRelative: (path: any) => boolean;
};
export default PathResolver;
