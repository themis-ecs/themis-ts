type ProxyHandlerKeys<T extends object> = keyof ProxyHandler<T>;

const proxyMethods: ReadonlyArray<ProxyHandlerKeys<object>> = [
  'apply',
  'construct',
  'defineProperty',
  'deleteProperty',
  'get',
  'getOwnPropertyDescriptor',
  'getPrototypeOf',
  'has',
  'isExtensible',
  'ownKeys',
  'preventExtensions',
  'set',
  'setPrototypeOf'
];

/**
 * @internal
 */
export function createProxy<T>(provider: () => T): T {
  const target = {} as object;
  let instance: unknown | undefined = undefined;
  const instanceProvider: () => unknown = (): unknown => {
    if (instance === undefined) {
      instance = provider();
    }
    return instance;
  };
  return new Proxy<object>(target, createHandler(instanceProvider)) as unknown as T;
}

function createHandler(instanceProvider: () => unknown): ProxyHandler<object> {
  const handler: ProxyHandler<object> = {};
  proxyMethods.forEach((methodName): void => {
    const method = Reflect[methodName];
    handler[methodName] = (...args: unknown[]) => {
      args[0] = instanceProvider();
      return method(...(args as [never, unknown, unknown, unknown]));
    };
  });
  return handler;
}
