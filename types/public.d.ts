export declare function onChildAdded(
  query: Query,
  callback: (
    snapshot: DataSnapshot,
    previousChildName?: string | null
  ) => unknown,
  cancelCallback?: (error: Error) => unknown
): Unsubscribe;
