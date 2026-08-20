type ToCamelCase<S extends string> = S extends `${infer Head}_${infer Tail}` ? `${Head}${Capitalize<ToCamelCase<Tail>>}` : S

type AppType<T> = {
    [K in keyof T as K extends string ? ToCamelCase<K> : K]: T[K]
}

function toCamelCase<T extends Record<string, unknown>>(obj: T): AppType<T> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
            value
        ])
    ) as AppType<T>
}

export {
    toCamelCase
}
