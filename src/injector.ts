import 'reflect-metadata';

const injectMetadataKey = Symbol('inject');

export type InjectionKey = string | Function;

export function Inject(injectionKey?: InjectionKey): (target: Object, propertyKey: string) => void {
    return function (target: Object, propertyKey: string): void {
        Reflect.metadata(injectMetadataKey, injectionKey || propertyKey)(target, propertyKey);
    };
}

export function getInjectionKey(target: Object, propertyKey: string): InjectionKey {
    return Reflect.getMetadata(injectMetadataKey, target, propertyKey);
}

export type ServiceFactory<T> = () => T;

export class InjectableService<T extends object>
{
    constructor(public injectionKey: InjectionKey, public instance: T | ServiceFactory<T>) {
    }
}

export class InjectorFactory {
    private _services: InjectableService<object>[] = [];

    public registerService<T extends object>(injectionKey: string | Function, service: T | ServiceFactory<T>): void {
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
    constructor(private _services: InjectableService<object>[]) {
        this._services.push(new InjectableService<Injector>(Injector, this));
        this.resolveInjectableServices();
    }

    public inject<T extends object>(target: T): T {
        if (target) {
            Object.keys(target).forEach(propertyKey => {
                const injectionKey = getInjectionKey(target, propertyKey);

                if (injectionKey) {
                    const serviceInstance = this.get(injectionKey);

                    if (serviceInstance) {
                        target[propertyKey] = serviceInstance;
                    }
                }
            });
        }

        return target;
    }

    public get<T extends object>(injectionKey: InjectionKey): T {
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
}
