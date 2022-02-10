/* eslint-disable @typescript-eslint/no-explicit-any */
import { getInjectionKey, Inject, Injector } from '../src/injector';

describe('injectionKey', () => {
    it('should match property name', () => {
        class MyService {
            @Inject()
            public firstService: any;
        }

        const service = new MyService();

        const key = getInjectionKey(service, 'firstService');

        expect(key).toBe('firstService');
    });

    it('should match decorator argument', () => {
        class MyService {
            @Inject('userService')
            public firstService: any;
        }

        const service = new MyService();

        const key = getInjectionKey(service, 'firstService');

        expect(key).toBe('userService');
    });
});

describe('injector', () => {
    it('should inject dependencies', () => {
        interface IFirstService {
            second: ISecondService;
        }

        interface ISecondService {
            first: IFirstService;
        }

        class FirstService {
            @Inject('secondService')
            public second: ISecondService = null;
        }

        class SecondService {
            @Inject('firstService')
            public first: IFirstService = null;
        }

        class MyService {
            @Inject()
            public unknownService: any = null;

            @Inject()
            public unknownServiceWithDefault: any = new FirstService();

            @Inject()
            public secondService: SecondService = null;

            @Inject()
            public firstService: FirstService = null;

            @Inject()
            public someString: string = null;

            @Inject()
            public someNumber: number = null;

            @Inject()
            public someBoolean: boolean = null;
        }

        const injector = new Injector([
            { injectionKey: 'firstService', instance: new FirstService() },
            { injectionKey: 'secondService', instance: () => new SecondService() },
            { injectionKey: 'someString', instance: 'abc' },
            { injectionKey: 'someNumber', instance: 123 },
            { injectionKey: 'someBoolean', instance: true }
        ]);
        const myService = injector.inject(new MyService());

        expect(myService.firstService).toBeInstanceOf(FirstService);
        expect(myService.secondService).toBeInstanceOf(SecondService);
        expect(myService.firstService).toBe(myService.secondService.first);
        expect(myService.secondService).toBe(myService.firstService.second);
        expect(myService.unknownService).toBe(null);
        expect(myService.unknownServiceWithDefault).toBeInstanceOf(FirstService);
        expect(myService.someString).toBe('abc');
        expect(myService.someNumber).toBe(123);
        expect(myService.someBoolean).toBe(true);
    });

    it('should inject base class dependencies', () => {
        class AnotherService {
        }

        abstract class ServiceBase {
            @Inject()
            public anotherService: AnotherService = null;
        }

        class MyService extends ServiceBase {
        }

        const injector = new Injector([
            { injectionKey: 'anotherService', instance: new AnotherService() }
        ]);

        const myService = injector.inject(new MyService());

        expect(myService.anotherService).not.toBeNull();
        expect(myService.anotherService).toBeInstanceOf(AnotherService);
    });
});
