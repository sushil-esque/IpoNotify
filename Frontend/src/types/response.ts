export interface Response<T> {
    message: string
    data: Array<T> | T;
}