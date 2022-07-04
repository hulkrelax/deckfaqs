export default interface MyRouter {
    get MainRunningApp(): AppOverview | undefined
    NavigateToRunningApp(replace?: boolean): void
    CreateBrowserView(name: string): any
}
export declare const MyRouter: MyRouter
