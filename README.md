# DinkyInject
A simple and lightweight Dependency Injector

## Installation

    npm i dinkyinject

## Usage

    import { Inject, Injector } from 'dinkyinject';

    // define a service
    interface IUserRepository {
        loadUser(): any[];
    }

    class MyUserRepository implements IUserRepository {
        loadUser(): any[] {
            return ['Peter', 'Lois', 'Brian', 'Stewie']
        }
    }

    // define another service
    interface IMyService {
        readonly repository: IUserRepository;
    }

    class MyService implements IMyService {
        @Inject('userRepository')
        public repository: IUserRepository = null;
    }

    // create injector and register services
    const injector = new Injector([
        { injectionKey: 'userRepository', instance: () => new MyUserRepository() },
        { injectionKey: MyService, instance: new MyService() }
    ]);

    // retrieve autowired service from injector
    const service = injector.get<IMyService>(MyService);

    // 'Peter', 'Lois', 'Brian', 'Stewie'
    console.log(service.repository.loadUser());