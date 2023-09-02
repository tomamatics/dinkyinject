import 'reflect-metadata';

const META_KEY_INJECT = Symbol('inject');
const META_KEY_POST_INJECT = Symbol('postInject');

export type InjectionKey = string | Function;

export function Inject(injectionKey?: InjectionKey): (target: Object, propertyKey: string) => void {
    return function (target: Object, propertyKey: string): void {
        Reflect.metadata(META_KEY_INJECT, injectionKey || propertyKey)(target, propertyKey);
    };
}

export function PostInject(): (target: Object, propertyKey: string) => void {
    return function (target: Object, propertyKey: string): void {
        Reflect.metadata(META_KEY_POST_INJECT, true)(target, propertyKey);
    };
}

export function getInjectionKey(target: Object, propertyKey: string): InjectionKey {
    return Reflect.getMetadata(META_KEY_INJECT, target, propertyKey);
}

function isPostInjectMethod(target: Object, propertyKey: string): boolean {
    return Reflect.hasMetadata(META_KEY_POST_INJECT, target, propertyKey);
}

export type ServiceFactory<T> = () => T;

export class InjectableService<T>
{
    constructor(public injectionKey: InjectionKey, public instance: T | ServiceFactory<T>) {
    }
}

export class InjectorFactory {
    private _services: InjectableService<unknown>[] = [];

    public registerService<T>(injectionKey: string | Function, service: T | ServiceFactory<T>): void {
        const index = this._services.findIndex(d => d.injectionKey === injectionKey);
        if (index >= 0) {
            this._services.splice(index, 1);
        }

        this._services.push(new InjectableService(injectionKey, service));
    }

    public createInjector(): Injector {
        return new Injector([...this._services]);
    }
}

export class Injector {
    constructor(private _services: InjectableService<unknown>[]) {
        this._services.push(new InjectableService<Injector>(Injector, this));
        this.resolveInjectableServices();
    }

    public inject<T>(target: T): T {
        if (this.isObject(target)) {
            Object.keys(target).forEach(propertyKey => {
                const injectionKey = getInjectionKey(target, propertyKey);

                if (injectionKey) {
                    const serviceInstance = this.get(injectionKey);

                    if (serviceInstance) {
                        target[propertyKey] = serviceInstance;
                    }
                }
            });

            this.callPostInjectMethods(target);
        }

        return target;
    }

    public get<T>(injectionKey: InjectionKey): T {
        const service = this._services.find(d => d.injectionKey === injectionKey);

        if (service) {
            if (service.instance instanceof Function) {
                service.instance = service.instance();
            }

            return service.instance as T;
        }

        return null;
    }

    private resolveInjectableServices(): void {
        this._services.forEach(({ injectionKey }) => {
            this.inject(this.get(injectionKey));
        });
    }

    private callPostInjectMethods(target: object) {
        this.getPostInjectMethods(target).forEach(method => {
            setTimeout(() => target[method]());
        });
    }

    private getPostInjectMethods(target: object) {
        const properties = new Set<string>();
        let currentObject = target

        do {
            Object.getOwnPropertyNames(currentObject).forEach(
                prop => properties.add(prop)
            );
        }
        while ((currentObject = Object.getPrototypeOf(currentObject)));

        const methods = [...properties.values()]
            .filter(prop => typeof target[prop] === 'function')
            .filter(method => isPostInjectMethod(target, method));

        return methods;
    }

    private isObject(obj: unknown): obj is object {
        return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
    }
}
