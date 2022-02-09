# DinkyInject
A simple and lightweight Dependency Injector

## Installation

    npm i dinkyinject

## Usage

    import { Inject, InjectorFactory } from 'dinkyinject';

    // first service
    interface IUserRepository {
        loadUser(): any[];
    }

    class MyUserRepository implements IUserRepository {
        loadUser(): any[] {
            return ['Peter', 'Lois', 'Brian', 'Stewie']
        }
    }

    // second service
    interface IMyService {
        readonly repository: IUserRepository;
    }

    class MyService implements IMyService {
        @Inject('userRepository')
        public repository: IUserRepository = null;
    }

    // create injector factory
    const factory = new InjectorFactory();

    // register services
    factory.registerService('userRepository', () => new MyUserRepository())
    factory.registerService(MyService, new MyService())

    // create injector
    const injector = factory.createInjector();

    // resolve autowired service
    const service = injector.get<IMyService>(MyService);

    // 'Peter', 'Lois', 'Brian', 'Stewie'
    console.log(service.repository.loadUser());