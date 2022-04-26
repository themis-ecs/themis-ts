<p align="center" style="font-size: 36px">
  Themis Entity Component System
</p>
<p align="center">A modern, lightweight and easy to use ECS for Typescript</p>
<p align="center">
<a href="" target="_blank"><img src="https://img.shields.io/github/workflow/status/themis-ecs/themis-ts/Main" alt="Build" /></a>
<a href="" target="_blank"><img src="https://img.shields.io/npm/dw/themis-ts" alt="Downloads" /></a>
<a href="" target="_blank"><img src="https://img.shields.io/github/license/themis-ecs/themis-ts" alt="License" /></a>
<a href="" target="_blank"><img src="https://img.shields.io/github/last-commit/themis-ecs/themis-ts" alt="Last Commit" /></a>
<a href="" target="_blank"><img src="https://img.shields.io/npm/v/themis-ts" alt="NPM" /></a>

</p>

## 📝 Description

**Themis ECS** aims to be a modern, performant, lightweight, zero-dependencies and easy to use **Entity Component
System** with a clean and intuitive API written in **TypeScript**.

## 🚀 Getting Started

To get started with Themis there is little to do:

### Project Setup

Install Themis ECS in your TypeScript project using ```npm install themis-ts reflect-metadata``` and add the following to your ```tsconfig.json``` file
```json
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
```

### Basics

In Themis ECS you define your world in modules. There are two types of modules, top level modules and submodules. 
A module is used to organize your code, it contains your systems, providers and submodules. Systems are an ECS specific
feature, whereas providers are used for dependency injection. Did you know? Themis helps you write better code by
providing you with a lightweight dependency injection framework. In a top level module, Themis automatically creates
a pipeline which contains all the systems you have registered in the top level module and all of its submodules.
A bit confused? Well, let's hop into some code to see everything in action and work on the details later:

Let's create a simple system:
```typescript
@System()
class MySystem implements OnInit, OnUpdate {
    
    init(): void {
        console.log('hello from MySystem');
    }
    
    update(dt: number): void {
        console.log('hello from update, dt is ', dt);
    }
}
```

Now let's create our first module:
```typescript
@Module({
    systems: [MySystem],
    providers: [],
    imports: []
})
class MyModule {
    
    init(pipeline: Pipeline): void {
        console.log('hello from MyModule');
        setInterval(() => pipeline.update(42), 1000);
    }
}
```

The last thing we need to do now, is to create our Themis World using the ```WorldBuilder``` class. We will register
our newly created module ```MyModule```

```typescript
new WorldBuilder().module(MyModule).build();
```

As you can see in the example above, the class ```MyModule``` uses ```Pipeline``` in its update method. As stated before,
a pipeline is automatically setup by Themis for you and contains all the systems you have defined in the top level module
and all its nested submodules. You can use the pipeline object for periodic updates to your systems, which will result
in calling all defined update methods in your systems.

### Create Entities and add Components

Let us head back to our system MySystem and inject the ```World``` interface using the constructor. We can then use this interface to create 
an entity and add components to the entity.

```typescript
class MyComponentA {
    value: number = 13;
}

class MyComponentB {
    value: string = 'the brown fox is not quick today';
}

@System()
class MySystem implements OnInit, OnUpdate {

    constructor(private world: World) {}

    init(): void {
        console.log('hello from MySystem');
        const entity = this.world.createEntity();
        entity.addComponent(MyComponentA);
        entity.addComponent(MyComponentB);
    }

    update(dt: number): void {
        console.log('hello from update, dt is ', dt);
    }
}
```

### Query for Entities

Most of the time, when using an ECS, we are interested in entities, which match a specific query described by the
components present or absent on these entities. In Themis you can define a query using the ```ComponentQuery```
decorator. Let us create a new system which queries for all entities, which contain ```MyComponentA``` and 
```MyComponentB```:

```typescript
@System()
class MyComponentQuerySystem implements OnUpdate {
    
  @ComponentQuery(all(MyComponentA, MyComponentB))
  private query!: Query;
  
  update(): void {
    this.query.entities.forEach((entity) => {
        console.log(entity.getComponent(MyComponentA).value); // 13
        console.log(entity.getComponent(MyComponentB).value); // 'the brown fox is not quick today'
    });
  }
}
```

Here we use the ```all``` function, which means, that all components have to be present on the entity to match the query.
There are two more predefined functions ```any``` and ```none```, which means that only one or none of the components.

To use the System, simply add it to the systems array of ```MyModule```.

### Submodules

In the example above, we have added all of our systems directly to the top level module. It is more convenient to
create one or multiple submodules for your systems and add those submodules to the import array of your top level module.
Especially if your codebase grows, this will help you to keep everything modular and well organized.

```typescript
@Module({
  systems: [MySystem, MyComponentQuerySystem],
  providers: [],
  imports: []
})
class MySubModule {
    
  init(): void {
    console.log('hello from MySubModule');
  }
}

@Module({
  systems: [],
  providers: [],
  imports: [MySubModule]
})
class MyModule {
    
  init(pipeline: Pipeline): void {
    console.log('hello from MyModule');
    setInterval(() => pipeline.update(42), 1000);
  }
}
```

Notice how the submodule does not have the pipeline parameter? As stated before, this is only available in top level
modules. But do not worry, your systems, which were defined in the submodule, are still present in the pipeline of
the top level module. Themis merges them. How they are merged and in which order are they performed you ask? Well that
is easy to answer:

Say we have a top level module named A, and submodules named a, b and c. Module A defines systems A1 and A2,
the submodule a defines systems a1, a2 and submodules b and c define systems b1, b2, b3 and c1.

They are registered in the following order:
```typescript
@Module({
  systems: [a1, a2]
})
class a {}

@Module({
  systems: [b1, b2, b3]
})
class b {}

@Module({
  systems: [c1]
})
class c {}


@Module({
  systems: [A1, A2],
  imports: [a, b, c]
})
class A {
  init(pipeline: Pipeline): void {
    // ...
  }
}
```

The order of execution will then be:
```a1``` ```a2``` ```b1``` ```b2``` ```b3``` ```c1``` ```A1``` ```A2```

This order also applies for nested submodules. In fact, you traverse the tree by depth-first post-order.

### Dependency Injection and Providers

Themis will automatically inject modules and systems.

You can register custom dependencies to Themis by using the ```Provider``` interface. There are 3 types of providers:
* Class Provider
* Value Provider
* Factory Provider

If you try to resolve a class with zero dependencies, no providers are needed and Themis will just use the type you have
defined:

```typescript
@Inject()
private myClass: MyClass;
```

To perform this injection, Themis will try to resolve MyClass. 

If the constructor of MyClass has dependencies, Themis will try to resolve them and inject them into the constructor
call. Be sure to have the ```Injectable``` decorator present on MyClass for Themis to be able to detect the dependencies.

```typescript
// No Injectable decorator needed, as the constructor has no dependencies
class MyService {
    constructor() {
        // ...
    }
}

@Injectable()
class MyClass {
    constructor(service: MyService) {
        // service will be resolved by Themis
    }
}
```

To change the strategy Themis uses when resolving dependencies, you can use one of the providers listed above in your modules.

❗ **Beware**: Providers are not limited to their modules, if you register a provider in an arbitrary module, these will
also be used in every other module. Be sure to not register two providers for the same identifier, as this will override
previously defined providers for that identifier. ❗


#### Class Provider
```typescript

const classProvider = { provide: MyClass, useClass: MyClassImpl };

@Module({
    systems: [],
    providers: [classProvider],
    imports: []
})
class MyModule {
    
   @Inject()
   private myClass!: MyClass; // Themis will resolve MyClassImpl and inject the instance
}
```

#### Value Provider
```typescript

const valueProvider = { provide: 'MyValue', useValue: 42 };

@Module({
    systems: [],
    providers: [valueProvider],
    imports: []
})
class MyModule {
    
    @Inject('MyValue')
    private myValue!: number; // Themis will inject 42
}
```

#### Factory Provider
```typescript

const factoryProvider = { provide: MyClass, useFactory: () => new MyClassImpl() }

    @Module({
    systems: [],
    providers: [factoryProvider],
    imports: []
})
class MyModule {
    
    @Inject()
    private myClass!: MyClass; // Themis will call the factory and inject the returned value
}
```

## 📚 Further Reading

Themis offers a variety of features to help you write better code.

<ul>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Entities-and-Components">Entities and Components</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Aliases">Aliases</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Blueprints">Blueprints</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Events">Events</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Component-Queries">Component Queries</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Providers">Providers</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Systems">Systems</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Modules">Modules</a></li>
    <li><a href="https://github.com/themis-ecs/themis-ts/wiki/Logging">Logging</a></li>
</ul>
