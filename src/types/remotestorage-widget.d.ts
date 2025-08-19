declare module 'remotestorage-widget' {
  export default class Widget {
    constructor(remoteStorage: RemoteStorage);
    attach(elementId: string): void;
  }
}
