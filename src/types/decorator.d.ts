/* eslint-disable @typescript-eslint/no-explicit-any */

type StrictClassMethodDecorator =
  | ((target: Func, context: StrictClassMethodDecoratorContext) => Func)
  | ((target: Func, context: StrictClassMethodDecoratorContext) => void);

interface StrictClassDecoratorContext {
  readonly kind: 'class';
  readonly name: string;
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

interface StrictClassMethodDecoratorContext {
  readonly kind: 'method';
  readonly name: Key;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: {
    has(object: object): boolean;
    get(object: object): any;
  };
  addInitializer(initializer: (this: Instance) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

interface StrictClassGetterDecoratorContext {
  readonly kind: 'getter';
  readonly name: Key;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: {
    has(object: object): boolean;
    get(object: object): any;
  };
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

interface StrictClassSetterDecoratorContext {
  readonly kind: 'setter';
  readonly name: Key;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: {
    has(object: object): boolean;
    set(object: object, value: any): void;
  };
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

interface StrictClassFieldDecoratorContext {
  readonly kind: 'field';
  readonly name: Key;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: {
    has(object: object): boolean;
    get(object: object): any;
    set(object: object, value: any): void;
  };
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

interface StrictClassAccessorDecoratorContext {
  readonly kind: 'accessor';
  readonly name: Key;
  readonly static: boolean;
  readonly private: boolean;
  readonly access: {
    has(object: object): boolean;
    get(object: object): any;
    set(object: object, value: any): void;
  };
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadataObject;
}

type StrictDecoratorContext =
  | StrictClassDecoratorContext
  | StrictClassMethodDecoratorContext
  | StrictClassGetterDecoratorContext
  | StrictClassSetterDecoratorContext
  | StrictClassFieldDecoratorContext
  | StrictClassAccessorDecoratorContext;
