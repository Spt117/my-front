export type SegmentParams<T extends Object = any> = T extends Record<string, any> ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never } : T;
