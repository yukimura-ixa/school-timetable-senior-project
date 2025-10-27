
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model class_schedule
 * 
 */
export type class_schedule = $Result.DefaultSelection<Prisma.$class_schedulePayload>
/**
 * Model gradelevel
 * 
 */
export type gradelevel = $Result.DefaultSelection<Prisma.$gradelevelPayload>
/**
 * Model room
 * 
 */
export type room = $Result.DefaultSelection<Prisma.$roomPayload>
/**
 * Model subject
 * 
 */
export type subject = $Result.DefaultSelection<Prisma.$subjectPayload>
/**
 * Model program
 * 
 */
export type program = $Result.DefaultSelection<Prisma.$programPayload>
/**
 * Model teacher
 * 
 */
export type teacher = $Result.DefaultSelection<Prisma.$teacherPayload>
/**
 * Model timeslot
 * 
 */
export type timeslot = $Result.DefaultSelection<Prisma.$timeslotPayload>
/**
 * Model teachers_responsibility
 * 
 */
export type teachers_responsibility = $Result.DefaultSelection<Prisma.$teachers_responsibilityPayload>
/**
 * Model table_config
 * 
 */
export type table_config = $Result.DefaultSelection<Prisma.$table_configPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model VerificationToken
 * 
 */
export type VerificationToken = $Result.DefaultSelection<Prisma.$VerificationTokenPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const SemesterStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  LOCKED: 'LOCKED',
  ARCHIVED: 'ARCHIVED'
};

export type SemesterStatus = (typeof SemesterStatus)[keyof typeof SemesterStatus]


export const day_of_week: {
  MON: 'MON',
  TUE: 'TUE',
  WED: 'WED',
  THU: 'THU',
  FRI: 'FRI',
  SAT: 'SAT',
  SUN: 'SUN'
};

export type day_of_week = (typeof day_of_week)[keyof typeof day_of_week]


export const subject_credit: {
  CREDIT_05: 'CREDIT_05',
  CREDIT_10: 'CREDIT_10',
  CREDIT_15: 'CREDIT_15',
  CREDIT_20: 'CREDIT_20'
};

export type subject_credit = (typeof subject_credit)[keyof typeof subject_credit]


export const semester: {
  SEMESTER_1: 'SEMESTER_1',
  SEMESTER_2: 'SEMESTER_2'
};

export type semester = (typeof semester)[keyof typeof semester]


export const breaktime: {
  BREAK_JUNIOR: 'BREAK_JUNIOR',
  BREAK_SENIOR: 'BREAK_SENIOR',
  BREAK_BOTH: 'BREAK_BOTH',
  NOT_BREAK: 'NOT_BREAK'
};

export type breaktime = (typeof breaktime)[keyof typeof breaktime]

}

export type SemesterStatus = $Enums.SemesterStatus

export const SemesterStatus: typeof $Enums.SemesterStatus

export type day_of_week = $Enums.day_of_week

export const day_of_week: typeof $Enums.day_of_week

export type subject_credit = $Enums.subject_credit

export const subject_credit: typeof $Enums.subject_credit

export type semester = $Enums.semester

export const semester: typeof $Enums.semester

export type breaktime = $Enums.breaktime

export const breaktime: typeof $Enums.breaktime

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Class_schedules
 * const class_schedules = await prisma.class_schedule.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Class_schedules
   * const class_schedules = await prisma.class_schedule.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.class_schedule`: Exposes CRUD operations for the **class_schedule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Class_schedules
    * const class_schedules = await prisma.class_schedule.findMany()
    * ```
    */
  get class_schedule(): Prisma.class_scheduleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gradelevel`: Exposes CRUD operations for the **gradelevel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Gradelevels
    * const gradelevels = await prisma.gradelevel.findMany()
    * ```
    */
  get gradelevel(): Prisma.gradelevelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.room`: Exposes CRUD operations for the **room** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rooms
    * const rooms = await prisma.room.findMany()
    * ```
    */
  get room(): Prisma.roomDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subject`: Exposes CRUD operations for the **subject** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subjects
    * const subjects = await prisma.subject.findMany()
    * ```
    */
  get subject(): Prisma.subjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.program`: Exposes CRUD operations for the **program** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Programs
    * const programs = await prisma.program.findMany()
    * ```
    */
  get program(): Prisma.programDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.teacher`: Exposes CRUD operations for the **teacher** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teachers
    * const teachers = await prisma.teacher.findMany()
    * ```
    */
  get teacher(): Prisma.teacherDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.timeslot`: Exposes CRUD operations for the **timeslot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Timeslots
    * const timeslots = await prisma.timeslot.findMany()
    * ```
    */
  get timeslot(): Prisma.timeslotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.teachers_responsibility`: Exposes CRUD operations for the **teachers_responsibility** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teachers_responsibilities
    * const teachers_responsibilities = await prisma.teachers_responsibility.findMany()
    * ```
    */
  get teachers_responsibility(): Prisma.teachers_responsibilityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.table_config`: Exposes CRUD operations for the **table_config** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Table_configs
    * const table_configs = await prisma.table_config.findMany()
    * ```
    */
  get table_config(): Prisma.table_configDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verificationToken`: Exposes CRUD operations for the **VerificationToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VerificationTokens
    * const verificationTokens = await prisma.verificationToken.findMany()
    * ```
    */
  get verificationToken(): Prisma.VerificationTokenDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.18.0
   * Query Engine version: 34b5a692b7bd79939a9a2c3ef97d816e749cda2f
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    class_schedule: 'class_schedule',
    gradelevel: 'gradelevel',
    room: 'room',
    subject: 'subject',
    program: 'program',
    teacher: 'teacher',
    timeslot: 'timeslot',
    teachers_responsibility: 'teachers_responsibility',
    table_config: 'table_config',
    User: 'User',
    Account: 'Account',
    Session: 'Session',
    VerificationToken: 'VerificationToken'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "class_schedule" | "gradelevel" | "room" | "subject" | "program" | "teacher" | "timeslot" | "teachers_responsibility" | "table_config" | "user" | "account" | "session" | "verificationToken"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      class_schedule: {
        payload: Prisma.$class_schedulePayload<ExtArgs>
        fields: Prisma.class_scheduleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.class_scheduleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.class_scheduleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          findFirst: {
            args: Prisma.class_scheduleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.class_scheduleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          findMany: {
            args: Prisma.class_scheduleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>[]
          }
          create: {
            args: Prisma.class_scheduleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          createMany: {
            args: Prisma.class_scheduleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.class_scheduleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>[]
          }
          delete: {
            args: Prisma.class_scheduleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          update: {
            args: Prisma.class_scheduleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          deleteMany: {
            args: Prisma.class_scheduleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.class_scheduleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.class_scheduleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>[]
          }
          upsert: {
            args: Prisma.class_scheduleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$class_schedulePayload>
          }
          aggregate: {
            args: Prisma.Class_scheduleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClass_schedule>
          }
          groupBy: {
            args: Prisma.class_scheduleGroupByArgs<ExtArgs>
            result: $Utils.Optional<Class_scheduleGroupByOutputType>[]
          }
          count: {
            args: Prisma.class_scheduleCountArgs<ExtArgs>
            result: $Utils.Optional<Class_scheduleCountAggregateOutputType> | number
          }
        }
      }
      gradelevel: {
        payload: Prisma.$gradelevelPayload<ExtArgs>
        fields: Prisma.gradelevelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.gradelevelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.gradelevelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          findFirst: {
            args: Prisma.gradelevelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.gradelevelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          findMany: {
            args: Prisma.gradelevelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>[]
          }
          create: {
            args: Prisma.gradelevelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          createMany: {
            args: Prisma.gradelevelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.gradelevelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>[]
          }
          delete: {
            args: Prisma.gradelevelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          update: {
            args: Prisma.gradelevelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          deleteMany: {
            args: Prisma.gradelevelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.gradelevelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.gradelevelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>[]
          }
          upsert: {
            args: Prisma.gradelevelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$gradelevelPayload>
          }
          aggregate: {
            args: Prisma.GradelevelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGradelevel>
          }
          groupBy: {
            args: Prisma.gradelevelGroupByArgs<ExtArgs>
            result: $Utils.Optional<GradelevelGroupByOutputType>[]
          }
          count: {
            args: Prisma.gradelevelCountArgs<ExtArgs>
            result: $Utils.Optional<GradelevelCountAggregateOutputType> | number
          }
        }
      }
      room: {
        payload: Prisma.$roomPayload<ExtArgs>
        fields: Prisma.roomFieldRefs
        operations: {
          findUnique: {
            args: Prisma.roomFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.roomFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          findFirst: {
            args: Prisma.roomFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.roomFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          findMany: {
            args: Prisma.roomFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>[]
          }
          create: {
            args: Prisma.roomCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          createMany: {
            args: Prisma.roomCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.roomCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>[]
          }
          delete: {
            args: Prisma.roomDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          update: {
            args: Prisma.roomUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          deleteMany: {
            args: Prisma.roomDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.roomUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.roomUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>[]
          }
          upsert: {
            args: Prisma.roomUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$roomPayload>
          }
          aggregate: {
            args: Prisma.RoomAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoom>
          }
          groupBy: {
            args: Prisma.roomGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoomGroupByOutputType>[]
          }
          count: {
            args: Prisma.roomCountArgs<ExtArgs>
            result: $Utils.Optional<RoomCountAggregateOutputType> | number
          }
        }
      }
      subject: {
        payload: Prisma.$subjectPayload<ExtArgs>
        fields: Prisma.subjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.subjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.subjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          findFirst: {
            args: Prisma.subjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.subjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          findMany: {
            args: Prisma.subjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>[]
          }
          create: {
            args: Prisma.subjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          createMany: {
            args: Prisma.subjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.subjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>[]
          }
          delete: {
            args: Prisma.subjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          update: {
            args: Prisma.subjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          deleteMany: {
            args: Prisma.subjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.subjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.subjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>[]
          }
          upsert: {
            args: Prisma.subjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subjectPayload>
          }
          aggregate: {
            args: Prisma.SubjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubject>
          }
          groupBy: {
            args: Prisma.subjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.subjectCountArgs<ExtArgs>
            result: $Utils.Optional<SubjectCountAggregateOutputType> | number
          }
        }
      }
      program: {
        payload: Prisma.$programPayload<ExtArgs>
        fields: Prisma.programFieldRefs
        operations: {
          findUnique: {
            args: Prisma.programFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.programFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          findFirst: {
            args: Prisma.programFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.programFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          findMany: {
            args: Prisma.programFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>[]
          }
          create: {
            args: Prisma.programCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          createMany: {
            args: Prisma.programCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.programCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>[]
          }
          delete: {
            args: Prisma.programDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          update: {
            args: Prisma.programUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          deleteMany: {
            args: Prisma.programDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.programUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.programUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>[]
          }
          upsert: {
            args: Prisma.programUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$programPayload>
          }
          aggregate: {
            args: Prisma.ProgramAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgram>
          }
          groupBy: {
            args: Prisma.programGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgramGroupByOutputType>[]
          }
          count: {
            args: Prisma.programCountArgs<ExtArgs>
            result: $Utils.Optional<ProgramCountAggregateOutputType> | number
          }
        }
      }
      teacher: {
        payload: Prisma.$teacherPayload<ExtArgs>
        fields: Prisma.teacherFieldRefs
        operations: {
          findUnique: {
            args: Prisma.teacherFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.teacherFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          findFirst: {
            args: Prisma.teacherFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.teacherFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          findMany: {
            args: Prisma.teacherFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>[]
          }
          create: {
            args: Prisma.teacherCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          createMany: {
            args: Prisma.teacherCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.teacherCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>[]
          }
          delete: {
            args: Prisma.teacherDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          update: {
            args: Prisma.teacherUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          deleteMany: {
            args: Prisma.teacherDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.teacherUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.teacherUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>[]
          }
          upsert: {
            args: Prisma.teacherUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teacherPayload>
          }
          aggregate: {
            args: Prisma.TeacherAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeacher>
          }
          groupBy: {
            args: Prisma.teacherGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeacherGroupByOutputType>[]
          }
          count: {
            args: Prisma.teacherCountArgs<ExtArgs>
            result: $Utils.Optional<TeacherCountAggregateOutputType> | number
          }
        }
      }
      timeslot: {
        payload: Prisma.$timeslotPayload<ExtArgs>
        fields: Prisma.timeslotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.timeslotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.timeslotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          findFirst: {
            args: Prisma.timeslotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.timeslotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          findMany: {
            args: Prisma.timeslotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>[]
          }
          create: {
            args: Prisma.timeslotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          createMany: {
            args: Prisma.timeslotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.timeslotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>[]
          }
          delete: {
            args: Prisma.timeslotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          update: {
            args: Prisma.timeslotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          deleteMany: {
            args: Prisma.timeslotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.timeslotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.timeslotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>[]
          }
          upsert: {
            args: Prisma.timeslotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$timeslotPayload>
          }
          aggregate: {
            args: Prisma.TimeslotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTimeslot>
          }
          groupBy: {
            args: Prisma.timeslotGroupByArgs<ExtArgs>
            result: $Utils.Optional<TimeslotGroupByOutputType>[]
          }
          count: {
            args: Prisma.timeslotCountArgs<ExtArgs>
            result: $Utils.Optional<TimeslotCountAggregateOutputType> | number
          }
        }
      }
      teachers_responsibility: {
        payload: Prisma.$teachers_responsibilityPayload<ExtArgs>
        fields: Prisma.teachers_responsibilityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.teachers_responsibilityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.teachers_responsibilityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          findFirst: {
            args: Prisma.teachers_responsibilityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.teachers_responsibilityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          findMany: {
            args: Prisma.teachers_responsibilityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>[]
          }
          create: {
            args: Prisma.teachers_responsibilityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          createMany: {
            args: Prisma.teachers_responsibilityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.teachers_responsibilityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>[]
          }
          delete: {
            args: Prisma.teachers_responsibilityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          update: {
            args: Prisma.teachers_responsibilityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          deleteMany: {
            args: Prisma.teachers_responsibilityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.teachers_responsibilityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.teachers_responsibilityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>[]
          }
          upsert: {
            args: Prisma.teachers_responsibilityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$teachers_responsibilityPayload>
          }
          aggregate: {
            args: Prisma.Teachers_responsibilityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeachers_responsibility>
          }
          groupBy: {
            args: Prisma.teachers_responsibilityGroupByArgs<ExtArgs>
            result: $Utils.Optional<Teachers_responsibilityGroupByOutputType>[]
          }
          count: {
            args: Prisma.teachers_responsibilityCountArgs<ExtArgs>
            result: $Utils.Optional<Teachers_responsibilityCountAggregateOutputType> | number
          }
        }
      }
      table_config: {
        payload: Prisma.$table_configPayload<ExtArgs>
        fields: Prisma.table_configFieldRefs
        operations: {
          findUnique: {
            args: Prisma.table_configFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.table_configFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          findFirst: {
            args: Prisma.table_configFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.table_configFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          findMany: {
            args: Prisma.table_configFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>[]
          }
          create: {
            args: Prisma.table_configCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          createMany: {
            args: Prisma.table_configCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.table_configCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>[]
          }
          delete: {
            args: Prisma.table_configDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          update: {
            args: Prisma.table_configUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          deleteMany: {
            args: Prisma.table_configDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.table_configUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.table_configUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>[]
          }
          upsert: {
            args: Prisma.table_configUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$table_configPayload>
          }
          aggregate: {
            args: Prisma.Table_configAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTable_config>
          }
          groupBy: {
            args: Prisma.table_configGroupByArgs<ExtArgs>
            result: $Utils.Optional<Table_configGroupByOutputType>[]
          }
          count: {
            args: Prisma.table_configCountArgs<ExtArgs>
            result: $Utils.Optional<Table_configCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      VerificationToken: {
        payload: Prisma.$VerificationTokenPayload<ExtArgs>
        fields: Prisma.VerificationTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findFirst: {
            args: Prisma.VerificationTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findMany: {
            args: Prisma.VerificationTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          create: {
            args: Prisma.VerificationTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          createMany: {
            args: Prisma.VerificationTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          delete: {
            args: Prisma.VerificationTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          update: {
            args: Prisma.VerificationTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          deleteMany: {
            args: Prisma.VerificationTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          upsert: {
            args: Prisma.VerificationTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          aggregate: {
            args: Prisma.VerificationTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerificationToken>
          }
          groupBy: {
            args: Prisma.VerificationTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationTokenCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    class_schedule?: class_scheduleOmit
    gradelevel?: gradelevelOmit
    room?: roomOmit
    subject?: subjectOmit
    program?: programOmit
    teacher?: teacherOmit
    timeslot?: timeslotOmit
    teachers_responsibility?: teachers_responsibilityOmit
    table_config?: table_configOmit
    user?: UserOmit
    account?: AccountOmit
    session?: SessionOmit
    verificationToken?: VerificationTokenOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type Class_scheduleCountOutputType
   */

  export type Class_scheduleCountOutputType = {
    teachers_responsibility: number
  }

  export type Class_scheduleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teachers_responsibility?: boolean | Class_scheduleCountOutputTypeCountTeachers_responsibilityArgs
  }

  // Custom InputTypes
  /**
   * Class_scheduleCountOutputType without action
   */
  export type Class_scheduleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Class_scheduleCountOutputType
     */
    select?: Class_scheduleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Class_scheduleCountOutputType without action
   */
  export type Class_scheduleCountOutputTypeCountTeachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teachers_responsibilityWhereInput
  }


  /**
   * Count Type GradelevelCountOutputType
   */

  export type GradelevelCountOutputType = {
    class_schedule: number
    teachers_responsibility: number
    program: number
  }

  export type GradelevelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | GradelevelCountOutputTypeCountClass_scheduleArgs
    teachers_responsibility?: boolean | GradelevelCountOutputTypeCountTeachers_responsibilityArgs
    program?: boolean | GradelevelCountOutputTypeCountProgramArgs
  }

  // Custom InputTypes
  /**
   * GradelevelCountOutputType without action
   */
  export type GradelevelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradelevelCountOutputType
     */
    select?: GradelevelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GradelevelCountOutputType without action
   */
  export type GradelevelCountOutputTypeCountClass_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
  }

  /**
   * GradelevelCountOutputType without action
   */
  export type GradelevelCountOutputTypeCountTeachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teachers_responsibilityWhereInput
  }

  /**
   * GradelevelCountOutputType without action
   */
  export type GradelevelCountOutputTypeCountProgramArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: programWhereInput
  }


  /**
   * Count Type RoomCountOutputType
   */

  export type RoomCountOutputType = {
    class_schedule: number
  }

  export type RoomCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | RoomCountOutputTypeCountClass_scheduleArgs
  }

  // Custom InputTypes
  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoomCountOutputType
     */
    select?: RoomCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeCountClass_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
  }


  /**
   * Count Type SubjectCountOutputType
   */

  export type SubjectCountOutputType = {
    class_schedule: number
    teachers_responsibility: number
  }

  export type SubjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | SubjectCountOutputTypeCountClass_scheduleArgs
    teachers_responsibility?: boolean | SubjectCountOutputTypeCountTeachers_responsibilityArgs
  }

  // Custom InputTypes
  /**
   * SubjectCountOutputType without action
   */
  export type SubjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubjectCountOutputType
     */
    select?: SubjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SubjectCountOutputType without action
   */
  export type SubjectCountOutputTypeCountClass_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
  }

  /**
   * SubjectCountOutputType without action
   */
  export type SubjectCountOutputTypeCountTeachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teachers_responsibilityWhereInput
  }


  /**
   * Count Type ProgramCountOutputType
   */

  export type ProgramCountOutputType = {
    subject: number
    gradelevel: number
  }

  export type ProgramCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subject?: boolean | ProgramCountOutputTypeCountSubjectArgs
    gradelevel?: boolean | ProgramCountOutputTypeCountGradelevelArgs
  }

  // Custom InputTypes
  /**
   * ProgramCountOutputType without action
   */
  export type ProgramCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProgramCountOutputType
     */
    select?: ProgramCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProgramCountOutputType without action
   */
  export type ProgramCountOutputTypeCountSubjectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: subjectWhereInput
  }

  /**
   * ProgramCountOutputType without action
   */
  export type ProgramCountOutputTypeCountGradelevelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: gradelevelWhereInput
  }


  /**
   * Count Type TeacherCountOutputType
   */

  export type TeacherCountOutputType = {
    teachers_responsibility: number
  }

  export type TeacherCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teachers_responsibility?: boolean | TeacherCountOutputTypeCountTeachers_responsibilityArgs
  }

  // Custom InputTypes
  /**
   * TeacherCountOutputType without action
   */
  export type TeacherCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeacherCountOutputType
     */
    select?: TeacherCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TeacherCountOutputType without action
   */
  export type TeacherCountOutputTypeCountTeachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teachers_responsibilityWhereInput
  }


  /**
   * Count Type TimeslotCountOutputType
   */

  export type TimeslotCountOutputType = {
    class_schedule: number
  }

  export type TimeslotCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | TimeslotCountOutputTypeCountClass_scheduleArgs
  }

  // Custom InputTypes
  /**
   * TimeslotCountOutputType without action
   */
  export type TimeslotCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeslotCountOutputType
     */
    select?: TimeslotCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TimeslotCountOutputType without action
   */
  export type TimeslotCountOutputTypeCountClass_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
  }


  /**
   * Count Type Teachers_responsibilityCountOutputType
   */

  export type Teachers_responsibilityCountOutputType = {
    class_schedule: number
  }

  export type Teachers_responsibilityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | Teachers_responsibilityCountOutputTypeCountClass_scheduleArgs
  }

  // Custom InputTypes
  /**
   * Teachers_responsibilityCountOutputType without action
   */
  export type Teachers_responsibilityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Teachers_responsibilityCountOutputType
     */
    select?: Teachers_responsibilityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Teachers_responsibilityCountOutputType without action
   */
  export type Teachers_responsibilityCountOutputTypeCountClass_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    accounts: number
    sessions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | UserCountOutputTypeCountAccountsArgs
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model class_schedule
   */

  export type AggregateClass_schedule = {
    _count: Class_scheduleCountAggregateOutputType | null
    _avg: Class_scheduleAvgAggregateOutputType | null
    _sum: Class_scheduleSumAggregateOutputType | null
    _min: Class_scheduleMinAggregateOutputType | null
    _max: Class_scheduleMaxAggregateOutputType | null
  }

  export type Class_scheduleAvgAggregateOutputType = {
    RoomID: number | null
  }

  export type Class_scheduleSumAggregateOutputType = {
    RoomID: number | null
  }

  export type Class_scheduleMinAggregateOutputType = {
    ClassID: string | null
    TimeslotID: string | null
    SubjectCode: string | null
    RoomID: number | null
    GradeID: string | null
    IsLocked: boolean | null
  }

  export type Class_scheduleMaxAggregateOutputType = {
    ClassID: string | null
    TimeslotID: string | null
    SubjectCode: string | null
    RoomID: number | null
    GradeID: string | null
    IsLocked: boolean | null
  }

  export type Class_scheduleCountAggregateOutputType = {
    ClassID: number
    TimeslotID: number
    SubjectCode: number
    RoomID: number
    GradeID: number
    IsLocked: number
    _all: number
  }


  export type Class_scheduleAvgAggregateInputType = {
    RoomID?: true
  }

  export type Class_scheduleSumAggregateInputType = {
    RoomID?: true
  }

  export type Class_scheduleMinAggregateInputType = {
    ClassID?: true
    TimeslotID?: true
    SubjectCode?: true
    RoomID?: true
    GradeID?: true
    IsLocked?: true
  }

  export type Class_scheduleMaxAggregateInputType = {
    ClassID?: true
    TimeslotID?: true
    SubjectCode?: true
    RoomID?: true
    GradeID?: true
    IsLocked?: true
  }

  export type Class_scheduleCountAggregateInputType = {
    ClassID?: true
    TimeslotID?: true
    SubjectCode?: true
    RoomID?: true
    GradeID?: true
    IsLocked?: true
    _all?: true
  }

  export type Class_scheduleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which class_schedule to aggregate.
     */
    where?: class_scheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of class_schedules to fetch.
     */
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: class_scheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` class_schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` class_schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned class_schedules
    **/
    _count?: true | Class_scheduleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Class_scheduleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Class_scheduleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Class_scheduleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Class_scheduleMaxAggregateInputType
  }

  export type GetClass_scheduleAggregateType<T extends Class_scheduleAggregateArgs> = {
        [P in keyof T & keyof AggregateClass_schedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClass_schedule[P]>
      : GetScalarType<T[P], AggregateClass_schedule[P]>
  }




  export type class_scheduleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithAggregationInput | class_scheduleOrderByWithAggregationInput[]
    by: Class_scheduleScalarFieldEnum[] | Class_scheduleScalarFieldEnum
    having?: class_scheduleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Class_scheduleCountAggregateInputType | true
    _avg?: Class_scheduleAvgAggregateInputType
    _sum?: Class_scheduleSumAggregateInputType
    _min?: Class_scheduleMinAggregateInputType
    _max?: Class_scheduleMaxAggregateInputType
  }

  export type Class_scheduleGroupByOutputType = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID: number | null
    GradeID: string
    IsLocked: boolean
    _count: Class_scheduleCountAggregateOutputType | null
    _avg: Class_scheduleAvgAggregateOutputType | null
    _sum: Class_scheduleSumAggregateOutputType | null
    _min: Class_scheduleMinAggregateOutputType | null
    _max: Class_scheduleMaxAggregateOutputType | null
  }

  type GetClass_scheduleGroupByPayload<T extends class_scheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Class_scheduleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Class_scheduleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Class_scheduleGroupByOutputType[P]>
            : GetScalarType<T[P], Class_scheduleGroupByOutputType[P]>
        }
      >
    >


  export type class_scheduleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ClassID?: boolean
    TimeslotID?: boolean
    SubjectCode?: boolean
    RoomID?: boolean
    GradeID?: boolean
    IsLocked?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
    teachers_responsibility?: boolean | class_schedule$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | Class_scheduleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["class_schedule"]>

  export type class_scheduleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ClassID?: boolean
    TimeslotID?: boolean
    SubjectCode?: boolean
    RoomID?: boolean
    GradeID?: boolean
    IsLocked?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["class_schedule"]>

  export type class_scheduleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ClassID?: boolean
    TimeslotID?: boolean
    SubjectCode?: boolean
    RoomID?: boolean
    GradeID?: boolean
    IsLocked?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["class_schedule"]>

  export type class_scheduleSelectScalar = {
    ClassID?: boolean
    TimeslotID?: boolean
    SubjectCode?: boolean
    RoomID?: boolean
    GradeID?: boolean
    IsLocked?: boolean
  }

  export type class_scheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ClassID" | "TimeslotID" | "SubjectCode" | "RoomID" | "GradeID" | "IsLocked", ExtArgs["result"]["class_schedule"]>
  export type class_scheduleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
    teachers_responsibility?: boolean | class_schedule$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | Class_scheduleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type class_scheduleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
  }
  export type class_scheduleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    room?: boolean | class_schedule$roomArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    timeslot?: boolean | timeslotDefaultArgs<ExtArgs>
  }

  export type $class_schedulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "class_schedule"
    objects: {
      gradelevel: Prisma.$gradelevelPayload<ExtArgs>
      room: Prisma.$roomPayload<ExtArgs> | null
      subject: Prisma.$subjectPayload<ExtArgs>
      timeslot: Prisma.$timeslotPayload<ExtArgs>
      teachers_responsibility: Prisma.$teachers_responsibilityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      ClassID: string
      TimeslotID: string
      SubjectCode: string
      RoomID: number | null
      GradeID: string
      IsLocked: boolean
    }, ExtArgs["result"]["class_schedule"]>
    composites: {}
  }

  type class_scheduleGetPayload<S extends boolean | null | undefined | class_scheduleDefaultArgs> = $Result.GetResult<Prisma.$class_schedulePayload, S>

  type class_scheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<class_scheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Class_scheduleCountAggregateInputType | true
    }

  export interface class_scheduleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['class_schedule'], meta: { name: 'class_schedule' } }
    /**
     * Find zero or one Class_schedule that matches the filter.
     * @param {class_scheduleFindUniqueArgs} args - Arguments to find a Class_schedule
     * @example
     * // Get one Class_schedule
     * const class_schedule = await prisma.class_schedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends class_scheduleFindUniqueArgs>(args: SelectSubset<T, class_scheduleFindUniqueArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Class_schedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {class_scheduleFindUniqueOrThrowArgs} args - Arguments to find a Class_schedule
     * @example
     * // Get one Class_schedule
     * const class_schedule = await prisma.class_schedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends class_scheduleFindUniqueOrThrowArgs>(args: SelectSubset<T, class_scheduleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Class_schedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleFindFirstArgs} args - Arguments to find a Class_schedule
     * @example
     * // Get one Class_schedule
     * const class_schedule = await prisma.class_schedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends class_scheduleFindFirstArgs>(args?: SelectSubset<T, class_scheduleFindFirstArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Class_schedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleFindFirstOrThrowArgs} args - Arguments to find a Class_schedule
     * @example
     * // Get one Class_schedule
     * const class_schedule = await prisma.class_schedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends class_scheduleFindFirstOrThrowArgs>(args?: SelectSubset<T, class_scheduleFindFirstOrThrowArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Class_schedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Class_schedules
     * const class_schedules = await prisma.class_schedule.findMany()
     * 
     * // Get first 10 Class_schedules
     * const class_schedules = await prisma.class_schedule.findMany({ take: 10 })
     * 
     * // Only select the `ClassID`
     * const class_scheduleWithClassIDOnly = await prisma.class_schedule.findMany({ select: { ClassID: true } })
     * 
     */
    findMany<T extends class_scheduleFindManyArgs>(args?: SelectSubset<T, class_scheduleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Class_schedule.
     * @param {class_scheduleCreateArgs} args - Arguments to create a Class_schedule.
     * @example
     * // Create one Class_schedule
     * const Class_schedule = await prisma.class_schedule.create({
     *   data: {
     *     // ... data to create a Class_schedule
     *   }
     * })
     * 
     */
    create<T extends class_scheduleCreateArgs>(args: SelectSubset<T, class_scheduleCreateArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Class_schedules.
     * @param {class_scheduleCreateManyArgs} args - Arguments to create many Class_schedules.
     * @example
     * // Create many Class_schedules
     * const class_schedule = await prisma.class_schedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends class_scheduleCreateManyArgs>(args?: SelectSubset<T, class_scheduleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Class_schedules and returns the data saved in the database.
     * @param {class_scheduleCreateManyAndReturnArgs} args - Arguments to create many Class_schedules.
     * @example
     * // Create many Class_schedules
     * const class_schedule = await prisma.class_schedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Class_schedules and only return the `ClassID`
     * const class_scheduleWithClassIDOnly = await prisma.class_schedule.createManyAndReturn({
     *   select: { ClassID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends class_scheduleCreateManyAndReturnArgs>(args?: SelectSubset<T, class_scheduleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Class_schedule.
     * @param {class_scheduleDeleteArgs} args - Arguments to delete one Class_schedule.
     * @example
     * // Delete one Class_schedule
     * const Class_schedule = await prisma.class_schedule.delete({
     *   where: {
     *     // ... filter to delete one Class_schedule
     *   }
     * })
     * 
     */
    delete<T extends class_scheduleDeleteArgs>(args: SelectSubset<T, class_scheduleDeleteArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Class_schedule.
     * @param {class_scheduleUpdateArgs} args - Arguments to update one Class_schedule.
     * @example
     * // Update one Class_schedule
     * const class_schedule = await prisma.class_schedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends class_scheduleUpdateArgs>(args: SelectSubset<T, class_scheduleUpdateArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Class_schedules.
     * @param {class_scheduleDeleteManyArgs} args - Arguments to filter Class_schedules to delete.
     * @example
     * // Delete a few Class_schedules
     * const { count } = await prisma.class_schedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends class_scheduleDeleteManyArgs>(args?: SelectSubset<T, class_scheduleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Class_schedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Class_schedules
     * const class_schedule = await prisma.class_schedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends class_scheduleUpdateManyArgs>(args: SelectSubset<T, class_scheduleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Class_schedules and returns the data updated in the database.
     * @param {class_scheduleUpdateManyAndReturnArgs} args - Arguments to update many Class_schedules.
     * @example
     * // Update many Class_schedules
     * const class_schedule = await prisma.class_schedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Class_schedules and only return the `ClassID`
     * const class_scheduleWithClassIDOnly = await prisma.class_schedule.updateManyAndReturn({
     *   select: { ClassID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends class_scheduleUpdateManyAndReturnArgs>(args: SelectSubset<T, class_scheduleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Class_schedule.
     * @param {class_scheduleUpsertArgs} args - Arguments to update or create a Class_schedule.
     * @example
     * // Update or create a Class_schedule
     * const class_schedule = await prisma.class_schedule.upsert({
     *   create: {
     *     // ... data to create a Class_schedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Class_schedule we want to update
     *   }
     * })
     */
    upsert<T extends class_scheduleUpsertArgs>(args: SelectSubset<T, class_scheduleUpsertArgs<ExtArgs>>): Prisma__class_scheduleClient<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Class_schedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleCountArgs} args - Arguments to filter Class_schedules to count.
     * @example
     * // Count the number of Class_schedules
     * const count = await prisma.class_schedule.count({
     *   where: {
     *     // ... the filter for the Class_schedules we want to count
     *   }
     * })
    **/
    count<T extends class_scheduleCountArgs>(
      args?: Subset<T, class_scheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Class_scheduleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Class_schedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Class_scheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Class_scheduleAggregateArgs>(args: Subset<T, Class_scheduleAggregateArgs>): Prisma.PrismaPromise<GetClass_scheduleAggregateType<T>>

    /**
     * Group by Class_schedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {class_scheduleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends class_scheduleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: class_scheduleGroupByArgs['orderBy'] }
        : { orderBy?: class_scheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, class_scheduleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClass_scheduleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the class_schedule model
   */
  readonly fields: class_scheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for class_schedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__class_scheduleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gradelevel<T extends gradelevelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, gradelevelDefaultArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    room<T extends class_schedule$roomArgs<ExtArgs> = {}>(args?: Subset<T, class_schedule$roomArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    subject<T extends subjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, subjectDefaultArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    timeslot<T extends timeslotDefaultArgs<ExtArgs> = {}>(args?: Subset<T, timeslotDefaultArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    teachers_responsibility<T extends class_schedule$teachers_responsibilityArgs<ExtArgs> = {}>(args?: Subset<T, class_schedule$teachers_responsibilityArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the class_schedule model
   */
  interface class_scheduleFieldRefs {
    readonly ClassID: FieldRef<"class_schedule", 'String'>
    readonly TimeslotID: FieldRef<"class_schedule", 'String'>
    readonly SubjectCode: FieldRef<"class_schedule", 'String'>
    readonly RoomID: FieldRef<"class_schedule", 'Int'>
    readonly GradeID: FieldRef<"class_schedule", 'String'>
    readonly IsLocked: FieldRef<"class_schedule", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * class_schedule findUnique
   */
  export type class_scheduleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter, which class_schedule to fetch.
     */
    where: class_scheduleWhereUniqueInput
  }

  /**
   * class_schedule findUniqueOrThrow
   */
  export type class_scheduleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter, which class_schedule to fetch.
     */
    where: class_scheduleWhereUniqueInput
  }

  /**
   * class_schedule findFirst
   */
  export type class_scheduleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter, which class_schedule to fetch.
     */
    where?: class_scheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of class_schedules to fetch.
     */
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for class_schedules.
     */
    cursor?: class_scheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` class_schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` class_schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of class_schedules.
     */
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * class_schedule findFirstOrThrow
   */
  export type class_scheduleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter, which class_schedule to fetch.
     */
    where?: class_scheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of class_schedules to fetch.
     */
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for class_schedules.
     */
    cursor?: class_scheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` class_schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` class_schedules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of class_schedules.
     */
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * class_schedule findMany
   */
  export type class_scheduleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter, which class_schedules to fetch.
     */
    where?: class_scheduleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of class_schedules to fetch.
     */
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing class_schedules.
     */
    cursor?: class_scheduleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` class_schedules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` class_schedules.
     */
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * class_schedule create
   */
  export type class_scheduleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * The data needed to create a class_schedule.
     */
    data: XOR<class_scheduleCreateInput, class_scheduleUncheckedCreateInput>
  }

  /**
   * class_schedule createMany
   */
  export type class_scheduleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many class_schedules.
     */
    data: class_scheduleCreateManyInput | class_scheduleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * class_schedule createManyAndReturn
   */
  export type class_scheduleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * The data used to create many class_schedules.
     */
    data: class_scheduleCreateManyInput | class_scheduleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * class_schedule update
   */
  export type class_scheduleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * The data needed to update a class_schedule.
     */
    data: XOR<class_scheduleUpdateInput, class_scheduleUncheckedUpdateInput>
    /**
     * Choose, which class_schedule to update.
     */
    where: class_scheduleWhereUniqueInput
  }

  /**
   * class_schedule updateMany
   */
  export type class_scheduleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update class_schedules.
     */
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyInput>
    /**
     * Filter which class_schedules to update
     */
    where?: class_scheduleWhereInput
    /**
     * Limit how many class_schedules to update.
     */
    limit?: number
  }

  /**
   * class_schedule updateManyAndReturn
   */
  export type class_scheduleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * The data used to update class_schedules.
     */
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyInput>
    /**
     * Filter which class_schedules to update
     */
    where?: class_scheduleWhereInput
    /**
     * Limit how many class_schedules to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * class_schedule upsert
   */
  export type class_scheduleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * The filter to search for the class_schedule to update in case it exists.
     */
    where: class_scheduleWhereUniqueInput
    /**
     * In case the class_schedule found by the `where` argument doesn't exist, create a new class_schedule with this data.
     */
    create: XOR<class_scheduleCreateInput, class_scheduleUncheckedCreateInput>
    /**
     * In case the class_schedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<class_scheduleUpdateInput, class_scheduleUncheckedUpdateInput>
  }

  /**
   * class_schedule delete
   */
  export type class_scheduleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    /**
     * Filter which class_schedule to delete.
     */
    where: class_scheduleWhereUniqueInput
  }

  /**
   * class_schedule deleteMany
   */
  export type class_scheduleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which class_schedules to delete
     */
    where?: class_scheduleWhereInput
    /**
     * Limit how many class_schedules to delete.
     */
    limit?: number
  }

  /**
   * class_schedule.room
   */
  export type class_schedule$roomArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    where?: roomWhereInput
  }

  /**
   * class_schedule.teachers_responsibility
   */
  export type class_schedule$teachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    where?: teachers_responsibilityWhereInput
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    cursor?: teachers_responsibilityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * class_schedule without action
   */
  export type class_scheduleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
  }


  /**
   * Model gradelevel
   */

  export type AggregateGradelevel = {
    _count: GradelevelCountAggregateOutputType | null
    _avg: GradelevelAvgAggregateOutputType | null
    _sum: GradelevelSumAggregateOutputType | null
    _min: GradelevelMinAggregateOutputType | null
    _max: GradelevelMaxAggregateOutputType | null
  }

  export type GradelevelAvgAggregateOutputType = {
    Year: number | null
    Number: number | null
  }

  export type GradelevelSumAggregateOutputType = {
    Year: number | null
    Number: number | null
  }

  export type GradelevelMinAggregateOutputType = {
    GradeID: string | null
    Year: number | null
    Number: number | null
  }

  export type GradelevelMaxAggregateOutputType = {
    GradeID: string | null
    Year: number | null
    Number: number | null
  }

  export type GradelevelCountAggregateOutputType = {
    GradeID: number
    Year: number
    Number: number
    _all: number
  }


  export type GradelevelAvgAggregateInputType = {
    Year?: true
    Number?: true
  }

  export type GradelevelSumAggregateInputType = {
    Year?: true
    Number?: true
  }

  export type GradelevelMinAggregateInputType = {
    GradeID?: true
    Year?: true
    Number?: true
  }

  export type GradelevelMaxAggregateInputType = {
    GradeID?: true
    Year?: true
    Number?: true
  }

  export type GradelevelCountAggregateInputType = {
    GradeID?: true
    Year?: true
    Number?: true
    _all?: true
  }

  export type GradelevelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which gradelevel to aggregate.
     */
    where?: gradelevelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of gradelevels to fetch.
     */
    orderBy?: gradelevelOrderByWithRelationInput | gradelevelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: gradelevelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` gradelevels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` gradelevels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned gradelevels
    **/
    _count?: true | GradelevelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GradelevelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GradelevelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GradelevelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GradelevelMaxAggregateInputType
  }

  export type GetGradelevelAggregateType<T extends GradelevelAggregateArgs> = {
        [P in keyof T & keyof AggregateGradelevel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGradelevel[P]>
      : GetScalarType<T[P], AggregateGradelevel[P]>
  }




  export type gradelevelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: gradelevelWhereInput
    orderBy?: gradelevelOrderByWithAggregationInput | gradelevelOrderByWithAggregationInput[]
    by: GradelevelScalarFieldEnum[] | GradelevelScalarFieldEnum
    having?: gradelevelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GradelevelCountAggregateInputType | true
    _avg?: GradelevelAvgAggregateInputType
    _sum?: GradelevelSumAggregateInputType
    _min?: GradelevelMinAggregateInputType
    _max?: GradelevelMaxAggregateInputType
  }

  export type GradelevelGroupByOutputType = {
    GradeID: string
    Year: number
    Number: number
    _count: GradelevelCountAggregateOutputType | null
    _avg: GradelevelAvgAggregateOutputType | null
    _sum: GradelevelSumAggregateOutputType | null
    _min: GradelevelMinAggregateOutputType | null
    _max: GradelevelMaxAggregateOutputType | null
  }

  type GetGradelevelGroupByPayload<T extends gradelevelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GradelevelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GradelevelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GradelevelGroupByOutputType[P]>
            : GetScalarType<T[P], GradelevelGroupByOutputType[P]>
        }
      >
    >


  export type gradelevelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    GradeID?: boolean
    Year?: boolean
    Number?: boolean
    class_schedule?: boolean | gradelevel$class_scheduleArgs<ExtArgs>
    teachers_responsibility?: boolean | gradelevel$teachers_responsibilityArgs<ExtArgs>
    program?: boolean | gradelevel$programArgs<ExtArgs>
    _count?: boolean | GradelevelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gradelevel"]>

  export type gradelevelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    GradeID?: boolean
    Year?: boolean
    Number?: boolean
  }, ExtArgs["result"]["gradelevel"]>

  export type gradelevelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    GradeID?: boolean
    Year?: boolean
    Number?: boolean
  }, ExtArgs["result"]["gradelevel"]>

  export type gradelevelSelectScalar = {
    GradeID?: boolean
    Year?: boolean
    Number?: boolean
  }

  export type gradelevelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"GradeID" | "Year" | "Number", ExtArgs["result"]["gradelevel"]>
  export type gradelevelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | gradelevel$class_scheduleArgs<ExtArgs>
    teachers_responsibility?: boolean | gradelevel$teachers_responsibilityArgs<ExtArgs>
    program?: boolean | gradelevel$programArgs<ExtArgs>
    _count?: boolean | GradelevelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type gradelevelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type gradelevelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $gradelevelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "gradelevel"
    objects: {
      class_schedule: Prisma.$class_schedulePayload<ExtArgs>[]
      teachers_responsibility: Prisma.$teachers_responsibilityPayload<ExtArgs>[]
      program: Prisma.$programPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      GradeID: string
      Year: number
      Number: number
    }, ExtArgs["result"]["gradelevel"]>
    composites: {}
  }

  type gradelevelGetPayload<S extends boolean | null | undefined | gradelevelDefaultArgs> = $Result.GetResult<Prisma.$gradelevelPayload, S>

  type gradelevelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<gradelevelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GradelevelCountAggregateInputType | true
    }

  export interface gradelevelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['gradelevel'], meta: { name: 'gradelevel' } }
    /**
     * Find zero or one Gradelevel that matches the filter.
     * @param {gradelevelFindUniqueArgs} args - Arguments to find a Gradelevel
     * @example
     * // Get one Gradelevel
     * const gradelevel = await prisma.gradelevel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends gradelevelFindUniqueArgs>(args: SelectSubset<T, gradelevelFindUniqueArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Gradelevel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {gradelevelFindUniqueOrThrowArgs} args - Arguments to find a Gradelevel
     * @example
     * // Get one Gradelevel
     * const gradelevel = await prisma.gradelevel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends gradelevelFindUniqueOrThrowArgs>(args: SelectSubset<T, gradelevelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Gradelevel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelFindFirstArgs} args - Arguments to find a Gradelevel
     * @example
     * // Get one Gradelevel
     * const gradelevel = await prisma.gradelevel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends gradelevelFindFirstArgs>(args?: SelectSubset<T, gradelevelFindFirstArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Gradelevel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelFindFirstOrThrowArgs} args - Arguments to find a Gradelevel
     * @example
     * // Get one Gradelevel
     * const gradelevel = await prisma.gradelevel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends gradelevelFindFirstOrThrowArgs>(args?: SelectSubset<T, gradelevelFindFirstOrThrowArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Gradelevels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Gradelevels
     * const gradelevels = await prisma.gradelevel.findMany()
     * 
     * // Get first 10 Gradelevels
     * const gradelevels = await prisma.gradelevel.findMany({ take: 10 })
     * 
     * // Only select the `GradeID`
     * const gradelevelWithGradeIDOnly = await prisma.gradelevel.findMany({ select: { GradeID: true } })
     * 
     */
    findMany<T extends gradelevelFindManyArgs>(args?: SelectSubset<T, gradelevelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Gradelevel.
     * @param {gradelevelCreateArgs} args - Arguments to create a Gradelevel.
     * @example
     * // Create one Gradelevel
     * const Gradelevel = await prisma.gradelevel.create({
     *   data: {
     *     // ... data to create a Gradelevel
     *   }
     * })
     * 
     */
    create<T extends gradelevelCreateArgs>(args: SelectSubset<T, gradelevelCreateArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Gradelevels.
     * @param {gradelevelCreateManyArgs} args - Arguments to create many Gradelevels.
     * @example
     * // Create many Gradelevels
     * const gradelevel = await prisma.gradelevel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends gradelevelCreateManyArgs>(args?: SelectSubset<T, gradelevelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Gradelevels and returns the data saved in the database.
     * @param {gradelevelCreateManyAndReturnArgs} args - Arguments to create many Gradelevels.
     * @example
     * // Create many Gradelevels
     * const gradelevel = await prisma.gradelevel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Gradelevels and only return the `GradeID`
     * const gradelevelWithGradeIDOnly = await prisma.gradelevel.createManyAndReturn({
     *   select: { GradeID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends gradelevelCreateManyAndReturnArgs>(args?: SelectSubset<T, gradelevelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Gradelevel.
     * @param {gradelevelDeleteArgs} args - Arguments to delete one Gradelevel.
     * @example
     * // Delete one Gradelevel
     * const Gradelevel = await prisma.gradelevel.delete({
     *   where: {
     *     // ... filter to delete one Gradelevel
     *   }
     * })
     * 
     */
    delete<T extends gradelevelDeleteArgs>(args: SelectSubset<T, gradelevelDeleteArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Gradelevel.
     * @param {gradelevelUpdateArgs} args - Arguments to update one Gradelevel.
     * @example
     * // Update one Gradelevel
     * const gradelevel = await prisma.gradelevel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends gradelevelUpdateArgs>(args: SelectSubset<T, gradelevelUpdateArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Gradelevels.
     * @param {gradelevelDeleteManyArgs} args - Arguments to filter Gradelevels to delete.
     * @example
     * // Delete a few Gradelevels
     * const { count } = await prisma.gradelevel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends gradelevelDeleteManyArgs>(args?: SelectSubset<T, gradelevelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Gradelevels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Gradelevels
     * const gradelevel = await prisma.gradelevel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends gradelevelUpdateManyArgs>(args: SelectSubset<T, gradelevelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Gradelevels and returns the data updated in the database.
     * @param {gradelevelUpdateManyAndReturnArgs} args - Arguments to update many Gradelevels.
     * @example
     * // Update many Gradelevels
     * const gradelevel = await prisma.gradelevel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Gradelevels and only return the `GradeID`
     * const gradelevelWithGradeIDOnly = await prisma.gradelevel.updateManyAndReturn({
     *   select: { GradeID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends gradelevelUpdateManyAndReturnArgs>(args: SelectSubset<T, gradelevelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Gradelevel.
     * @param {gradelevelUpsertArgs} args - Arguments to update or create a Gradelevel.
     * @example
     * // Update or create a Gradelevel
     * const gradelevel = await prisma.gradelevel.upsert({
     *   create: {
     *     // ... data to create a Gradelevel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Gradelevel we want to update
     *   }
     * })
     */
    upsert<T extends gradelevelUpsertArgs>(args: SelectSubset<T, gradelevelUpsertArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Gradelevels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelCountArgs} args - Arguments to filter Gradelevels to count.
     * @example
     * // Count the number of Gradelevels
     * const count = await prisma.gradelevel.count({
     *   where: {
     *     // ... the filter for the Gradelevels we want to count
     *   }
     * })
    **/
    count<T extends gradelevelCountArgs>(
      args?: Subset<T, gradelevelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GradelevelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Gradelevel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradelevelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GradelevelAggregateArgs>(args: Subset<T, GradelevelAggregateArgs>): Prisma.PrismaPromise<GetGradelevelAggregateType<T>>

    /**
     * Group by Gradelevel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {gradelevelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends gradelevelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: gradelevelGroupByArgs['orderBy'] }
        : { orderBy?: gradelevelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, gradelevelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGradelevelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the gradelevel model
   */
  readonly fields: gradelevelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for gradelevel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__gradelevelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    class_schedule<T extends gradelevel$class_scheduleArgs<ExtArgs> = {}>(args?: Subset<T, gradelevel$class_scheduleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    teachers_responsibility<T extends gradelevel$teachers_responsibilityArgs<ExtArgs> = {}>(args?: Subset<T, gradelevel$teachers_responsibilityArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    program<T extends gradelevel$programArgs<ExtArgs> = {}>(args?: Subset<T, gradelevel$programArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the gradelevel model
   */
  interface gradelevelFieldRefs {
    readonly GradeID: FieldRef<"gradelevel", 'String'>
    readonly Year: FieldRef<"gradelevel", 'Int'>
    readonly Number: FieldRef<"gradelevel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * gradelevel findUnique
   */
  export type gradelevelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter, which gradelevel to fetch.
     */
    where: gradelevelWhereUniqueInput
  }

  /**
   * gradelevel findUniqueOrThrow
   */
  export type gradelevelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter, which gradelevel to fetch.
     */
    where: gradelevelWhereUniqueInput
  }

  /**
   * gradelevel findFirst
   */
  export type gradelevelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter, which gradelevel to fetch.
     */
    where?: gradelevelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of gradelevels to fetch.
     */
    orderBy?: gradelevelOrderByWithRelationInput | gradelevelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for gradelevels.
     */
    cursor?: gradelevelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` gradelevels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` gradelevels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of gradelevels.
     */
    distinct?: GradelevelScalarFieldEnum | GradelevelScalarFieldEnum[]
  }

  /**
   * gradelevel findFirstOrThrow
   */
  export type gradelevelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter, which gradelevel to fetch.
     */
    where?: gradelevelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of gradelevels to fetch.
     */
    orderBy?: gradelevelOrderByWithRelationInput | gradelevelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for gradelevels.
     */
    cursor?: gradelevelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` gradelevels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` gradelevels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of gradelevels.
     */
    distinct?: GradelevelScalarFieldEnum | GradelevelScalarFieldEnum[]
  }

  /**
   * gradelevel findMany
   */
  export type gradelevelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter, which gradelevels to fetch.
     */
    where?: gradelevelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of gradelevels to fetch.
     */
    orderBy?: gradelevelOrderByWithRelationInput | gradelevelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing gradelevels.
     */
    cursor?: gradelevelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` gradelevels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` gradelevels.
     */
    skip?: number
    distinct?: GradelevelScalarFieldEnum | GradelevelScalarFieldEnum[]
  }

  /**
   * gradelevel create
   */
  export type gradelevelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * The data needed to create a gradelevel.
     */
    data: XOR<gradelevelCreateInput, gradelevelUncheckedCreateInput>
  }

  /**
   * gradelevel createMany
   */
  export type gradelevelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many gradelevels.
     */
    data: gradelevelCreateManyInput | gradelevelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * gradelevel createManyAndReturn
   */
  export type gradelevelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * The data used to create many gradelevels.
     */
    data: gradelevelCreateManyInput | gradelevelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * gradelevel update
   */
  export type gradelevelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * The data needed to update a gradelevel.
     */
    data: XOR<gradelevelUpdateInput, gradelevelUncheckedUpdateInput>
    /**
     * Choose, which gradelevel to update.
     */
    where: gradelevelWhereUniqueInput
  }

  /**
   * gradelevel updateMany
   */
  export type gradelevelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update gradelevels.
     */
    data: XOR<gradelevelUpdateManyMutationInput, gradelevelUncheckedUpdateManyInput>
    /**
     * Filter which gradelevels to update
     */
    where?: gradelevelWhereInput
    /**
     * Limit how many gradelevels to update.
     */
    limit?: number
  }

  /**
   * gradelevel updateManyAndReturn
   */
  export type gradelevelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * The data used to update gradelevels.
     */
    data: XOR<gradelevelUpdateManyMutationInput, gradelevelUncheckedUpdateManyInput>
    /**
     * Filter which gradelevels to update
     */
    where?: gradelevelWhereInput
    /**
     * Limit how many gradelevels to update.
     */
    limit?: number
  }

  /**
   * gradelevel upsert
   */
  export type gradelevelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * The filter to search for the gradelevel to update in case it exists.
     */
    where: gradelevelWhereUniqueInput
    /**
     * In case the gradelevel found by the `where` argument doesn't exist, create a new gradelevel with this data.
     */
    create: XOR<gradelevelCreateInput, gradelevelUncheckedCreateInput>
    /**
     * In case the gradelevel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<gradelevelUpdateInput, gradelevelUncheckedUpdateInput>
  }

  /**
   * gradelevel delete
   */
  export type gradelevelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    /**
     * Filter which gradelevel to delete.
     */
    where: gradelevelWhereUniqueInput
  }

  /**
   * gradelevel deleteMany
   */
  export type gradelevelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which gradelevels to delete
     */
    where?: gradelevelWhereInput
    /**
     * Limit how many gradelevels to delete.
     */
    limit?: number
  }

  /**
   * gradelevel.class_schedule
   */
  export type gradelevel$class_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    cursor?: class_scheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * gradelevel.teachers_responsibility
   */
  export type gradelevel$teachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    where?: teachers_responsibilityWhereInput
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    cursor?: teachers_responsibilityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * gradelevel.program
   */
  export type gradelevel$programArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    where?: programWhereInput
    orderBy?: programOrderByWithRelationInput | programOrderByWithRelationInput[]
    cursor?: programWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProgramScalarFieldEnum | ProgramScalarFieldEnum[]
  }

  /**
   * gradelevel without action
   */
  export type gradelevelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
  }


  /**
   * Model room
   */

  export type AggregateRoom = {
    _count: RoomCountAggregateOutputType | null
    _avg: RoomAvgAggregateOutputType | null
    _sum: RoomSumAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  export type RoomAvgAggregateOutputType = {
    RoomID: number | null
  }

  export type RoomSumAggregateOutputType = {
    RoomID: number | null
  }

  export type RoomMinAggregateOutputType = {
    RoomID: number | null
    RoomName: string | null
    Building: string | null
    Floor: string | null
  }

  export type RoomMaxAggregateOutputType = {
    RoomID: number | null
    RoomName: string | null
    Building: string | null
    Floor: string | null
  }

  export type RoomCountAggregateOutputType = {
    RoomID: number
    RoomName: number
    Building: number
    Floor: number
    _all: number
  }


  export type RoomAvgAggregateInputType = {
    RoomID?: true
  }

  export type RoomSumAggregateInputType = {
    RoomID?: true
  }

  export type RoomMinAggregateInputType = {
    RoomID?: true
    RoomName?: true
    Building?: true
    Floor?: true
  }

  export type RoomMaxAggregateInputType = {
    RoomID?: true
    RoomName?: true
    Building?: true
    Floor?: true
  }

  export type RoomCountAggregateInputType = {
    RoomID?: true
    RoomName?: true
    Building?: true
    Floor?: true
    _all?: true
  }

  export type RoomAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which room to aggregate.
     */
    where?: roomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rooms to fetch.
     */
    orderBy?: roomOrderByWithRelationInput | roomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: roomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned rooms
    **/
    _count?: true | RoomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RoomAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RoomSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoomMaxAggregateInputType
  }

  export type GetRoomAggregateType<T extends RoomAggregateArgs> = {
        [P in keyof T & keyof AggregateRoom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoom[P]>
      : GetScalarType<T[P], AggregateRoom[P]>
  }




  export type roomGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: roomWhereInput
    orderBy?: roomOrderByWithAggregationInput | roomOrderByWithAggregationInput[]
    by: RoomScalarFieldEnum[] | RoomScalarFieldEnum
    having?: roomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoomCountAggregateInputType | true
    _avg?: RoomAvgAggregateInputType
    _sum?: RoomSumAggregateInputType
    _min?: RoomMinAggregateInputType
    _max?: RoomMaxAggregateInputType
  }

  export type RoomGroupByOutputType = {
    RoomID: number
    RoomName: string
    Building: string
    Floor: string
    _count: RoomCountAggregateOutputType | null
    _avg: RoomAvgAggregateOutputType | null
    _sum: RoomSumAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  type GetRoomGroupByPayload<T extends roomGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoomGroupByOutputType[P]>
            : GetScalarType<T[P], RoomGroupByOutputType[P]>
        }
      >
    >


  export type roomSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RoomID?: boolean
    RoomName?: boolean
    Building?: boolean
    Floor?: boolean
    class_schedule?: boolean | room$class_scheduleArgs<ExtArgs>
    _count?: boolean | RoomCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["room"]>

  export type roomSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RoomID?: boolean
    RoomName?: boolean
    Building?: boolean
    Floor?: boolean
  }, ExtArgs["result"]["room"]>

  export type roomSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RoomID?: boolean
    RoomName?: boolean
    Building?: boolean
    Floor?: boolean
  }, ExtArgs["result"]["room"]>

  export type roomSelectScalar = {
    RoomID?: boolean
    RoomName?: boolean
    Building?: boolean
    Floor?: boolean
  }

  export type roomOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"RoomID" | "RoomName" | "Building" | "Floor", ExtArgs["result"]["room"]>
  export type roomInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | room$class_scheduleArgs<ExtArgs>
    _count?: boolean | RoomCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type roomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type roomIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $roomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "room"
    objects: {
      class_schedule: Prisma.$class_schedulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      RoomID: number
      RoomName: string
      Building: string
      Floor: string
    }, ExtArgs["result"]["room"]>
    composites: {}
  }

  type roomGetPayload<S extends boolean | null | undefined | roomDefaultArgs> = $Result.GetResult<Prisma.$roomPayload, S>

  type roomCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<roomFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoomCountAggregateInputType | true
    }

  export interface roomDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['room'], meta: { name: 'room' } }
    /**
     * Find zero or one Room that matches the filter.
     * @param {roomFindUniqueArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends roomFindUniqueArgs>(args: SelectSubset<T, roomFindUniqueArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Room that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {roomFindUniqueOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends roomFindUniqueOrThrowArgs>(args: SelectSubset<T, roomFindUniqueOrThrowArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Room that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomFindFirstArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends roomFindFirstArgs>(args?: SelectSubset<T, roomFindFirstArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Room that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomFindFirstOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends roomFindFirstOrThrowArgs>(args?: SelectSubset<T, roomFindFirstOrThrowArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rooms
     * const rooms = await prisma.room.findMany()
     * 
     * // Get first 10 Rooms
     * const rooms = await prisma.room.findMany({ take: 10 })
     * 
     * // Only select the `RoomID`
     * const roomWithRoomIDOnly = await prisma.room.findMany({ select: { RoomID: true } })
     * 
     */
    findMany<T extends roomFindManyArgs>(args?: SelectSubset<T, roomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Room.
     * @param {roomCreateArgs} args - Arguments to create a Room.
     * @example
     * // Create one Room
     * const Room = await prisma.room.create({
     *   data: {
     *     // ... data to create a Room
     *   }
     * })
     * 
     */
    create<T extends roomCreateArgs>(args: SelectSubset<T, roomCreateArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rooms.
     * @param {roomCreateManyArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends roomCreateManyArgs>(args?: SelectSubset<T, roomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rooms and returns the data saved in the database.
     * @param {roomCreateManyAndReturnArgs} args - Arguments to create many Rooms.
     * @example
     * // Create many Rooms
     * const room = await prisma.room.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rooms and only return the `RoomID`
     * const roomWithRoomIDOnly = await prisma.room.createManyAndReturn({
     *   select: { RoomID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends roomCreateManyAndReturnArgs>(args?: SelectSubset<T, roomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Room.
     * @param {roomDeleteArgs} args - Arguments to delete one Room.
     * @example
     * // Delete one Room
     * const Room = await prisma.room.delete({
     *   where: {
     *     // ... filter to delete one Room
     *   }
     * })
     * 
     */
    delete<T extends roomDeleteArgs>(args: SelectSubset<T, roomDeleteArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Room.
     * @param {roomUpdateArgs} args - Arguments to update one Room.
     * @example
     * // Update one Room
     * const room = await prisma.room.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends roomUpdateArgs>(args: SelectSubset<T, roomUpdateArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rooms.
     * @param {roomDeleteManyArgs} args - Arguments to filter Rooms to delete.
     * @example
     * // Delete a few Rooms
     * const { count } = await prisma.room.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends roomDeleteManyArgs>(args?: SelectSubset<T, roomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends roomUpdateManyArgs>(args: SelectSubset<T, roomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rooms and returns the data updated in the database.
     * @param {roomUpdateManyAndReturnArgs} args - Arguments to update many Rooms.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rooms and only return the `RoomID`
     * const roomWithRoomIDOnly = await prisma.room.updateManyAndReturn({
     *   select: { RoomID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends roomUpdateManyAndReturnArgs>(args: SelectSubset<T, roomUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Room.
     * @param {roomUpsertArgs} args - Arguments to update or create a Room.
     * @example
     * // Update or create a Room
     * const room = await prisma.room.upsert({
     *   create: {
     *     // ... data to create a Room
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Room we want to update
     *   }
     * })
     */
    upsert<T extends roomUpsertArgs>(args: SelectSubset<T, roomUpsertArgs<ExtArgs>>): Prisma__roomClient<$Result.GetResult<Prisma.$roomPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomCountArgs} args - Arguments to filter Rooms to count.
     * @example
     * // Count the number of Rooms
     * const count = await prisma.room.count({
     *   where: {
     *     // ... the filter for the Rooms we want to count
     *   }
     * })
    **/
    count<T extends roomCountArgs>(
      args?: Subset<T, roomCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoomAggregateArgs>(args: Subset<T, RoomAggregateArgs>): Prisma.PrismaPromise<GetRoomAggregateType<T>>

    /**
     * Group by Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {roomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends roomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: roomGroupByArgs['orderBy'] }
        : { orderBy?: roomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, roomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the room model
   */
  readonly fields: roomFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for room.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__roomClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    class_schedule<T extends room$class_scheduleArgs<ExtArgs> = {}>(args?: Subset<T, room$class_scheduleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the room model
   */
  interface roomFieldRefs {
    readonly RoomID: FieldRef<"room", 'Int'>
    readonly RoomName: FieldRef<"room", 'String'>
    readonly Building: FieldRef<"room", 'String'>
    readonly Floor: FieldRef<"room", 'String'>
  }
    

  // Custom InputTypes
  /**
   * room findUnique
   */
  export type roomFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter, which room to fetch.
     */
    where: roomWhereUniqueInput
  }

  /**
   * room findUniqueOrThrow
   */
  export type roomFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter, which room to fetch.
     */
    where: roomWhereUniqueInput
  }

  /**
   * room findFirst
   */
  export type roomFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter, which room to fetch.
     */
    where?: roomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rooms to fetch.
     */
    orderBy?: roomOrderByWithRelationInput | roomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for rooms.
     */
    cursor?: roomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of rooms.
     */
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * room findFirstOrThrow
   */
  export type roomFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter, which room to fetch.
     */
    where?: roomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rooms to fetch.
     */
    orderBy?: roomOrderByWithRelationInput | roomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for rooms.
     */
    cursor?: roomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of rooms.
     */
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * room findMany
   */
  export type roomFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter, which rooms to fetch.
     */
    where?: roomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of rooms to fetch.
     */
    orderBy?: roomOrderByWithRelationInput | roomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing rooms.
     */
    cursor?: roomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` rooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` rooms.
     */
    skip?: number
    distinct?: RoomScalarFieldEnum | RoomScalarFieldEnum[]
  }

  /**
   * room create
   */
  export type roomCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * The data needed to create a room.
     */
    data: XOR<roomCreateInput, roomUncheckedCreateInput>
  }

  /**
   * room createMany
   */
  export type roomCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many rooms.
     */
    data: roomCreateManyInput | roomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * room createManyAndReturn
   */
  export type roomCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * The data used to create many rooms.
     */
    data: roomCreateManyInput | roomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * room update
   */
  export type roomUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * The data needed to update a room.
     */
    data: XOR<roomUpdateInput, roomUncheckedUpdateInput>
    /**
     * Choose, which room to update.
     */
    where: roomWhereUniqueInput
  }

  /**
   * room updateMany
   */
  export type roomUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update rooms.
     */
    data: XOR<roomUpdateManyMutationInput, roomUncheckedUpdateManyInput>
    /**
     * Filter which rooms to update
     */
    where?: roomWhereInput
    /**
     * Limit how many rooms to update.
     */
    limit?: number
  }

  /**
   * room updateManyAndReturn
   */
  export type roomUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * The data used to update rooms.
     */
    data: XOR<roomUpdateManyMutationInput, roomUncheckedUpdateManyInput>
    /**
     * Filter which rooms to update
     */
    where?: roomWhereInput
    /**
     * Limit how many rooms to update.
     */
    limit?: number
  }

  /**
   * room upsert
   */
  export type roomUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * The filter to search for the room to update in case it exists.
     */
    where: roomWhereUniqueInput
    /**
     * In case the room found by the `where` argument doesn't exist, create a new room with this data.
     */
    create: XOR<roomCreateInput, roomUncheckedCreateInput>
    /**
     * In case the room was found with the provided `where` argument, update it with this data.
     */
    update: XOR<roomUpdateInput, roomUncheckedUpdateInput>
  }

  /**
   * room delete
   */
  export type roomDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
    /**
     * Filter which room to delete.
     */
    where: roomWhereUniqueInput
  }

  /**
   * room deleteMany
   */
  export type roomDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which rooms to delete
     */
    where?: roomWhereInput
    /**
     * Limit how many rooms to delete.
     */
    limit?: number
  }

  /**
   * room.class_schedule
   */
  export type room$class_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    cursor?: class_scheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * room without action
   */
  export type roomDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the room
     */
    select?: roomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the room
     */
    omit?: roomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: roomInclude<ExtArgs> | null
  }


  /**
   * Model subject
   */

  export type AggregateSubject = {
    _count: SubjectCountAggregateOutputType | null
    _avg: SubjectAvgAggregateOutputType | null
    _sum: SubjectSumAggregateOutputType | null
    _min: SubjectMinAggregateOutputType | null
    _max: SubjectMaxAggregateOutputType | null
  }

  export type SubjectAvgAggregateOutputType = {
    ProgramID: number | null
  }

  export type SubjectSumAggregateOutputType = {
    ProgramID: number | null
  }

  export type SubjectMinAggregateOutputType = {
    SubjectCode: string | null
    SubjectName: string | null
    Credit: $Enums.subject_credit | null
    Category: string | null
    ProgramID: number | null
  }

  export type SubjectMaxAggregateOutputType = {
    SubjectCode: string | null
    SubjectName: string | null
    Credit: $Enums.subject_credit | null
    Category: string | null
    ProgramID: number | null
  }

  export type SubjectCountAggregateOutputType = {
    SubjectCode: number
    SubjectName: number
    Credit: number
    Category: number
    ProgramID: number
    _all: number
  }


  export type SubjectAvgAggregateInputType = {
    ProgramID?: true
  }

  export type SubjectSumAggregateInputType = {
    ProgramID?: true
  }

  export type SubjectMinAggregateInputType = {
    SubjectCode?: true
    SubjectName?: true
    Credit?: true
    Category?: true
    ProgramID?: true
  }

  export type SubjectMaxAggregateInputType = {
    SubjectCode?: true
    SubjectName?: true
    Credit?: true
    Category?: true
    ProgramID?: true
  }

  export type SubjectCountAggregateInputType = {
    SubjectCode?: true
    SubjectName?: true
    Credit?: true
    Category?: true
    ProgramID?: true
    _all?: true
  }

  export type SubjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which subject to aggregate.
     */
    where?: subjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subjects to fetch.
     */
    orderBy?: subjectOrderByWithRelationInput | subjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: subjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned subjects
    **/
    _count?: true | SubjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubjectMaxAggregateInputType
  }

  export type GetSubjectAggregateType<T extends SubjectAggregateArgs> = {
        [P in keyof T & keyof AggregateSubject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubject[P]>
      : GetScalarType<T[P], AggregateSubject[P]>
  }




  export type subjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: subjectWhereInput
    orderBy?: subjectOrderByWithAggregationInput | subjectOrderByWithAggregationInput[]
    by: SubjectScalarFieldEnum[] | SubjectScalarFieldEnum
    having?: subjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubjectCountAggregateInputType | true
    _avg?: SubjectAvgAggregateInputType
    _sum?: SubjectSumAggregateInputType
    _min?: SubjectMinAggregateInputType
    _max?: SubjectMaxAggregateInputType
  }

  export type SubjectGroupByOutputType = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category: string
    ProgramID: number | null
    _count: SubjectCountAggregateOutputType | null
    _avg: SubjectAvgAggregateOutputType | null
    _sum: SubjectSumAggregateOutputType | null
    _min: SubjectMinAggregateOutputType | null
    _max: SubjectMaxAggregateOutputType | null
  }

  type GetSubjectGroupByPayload<T extends subjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubjectGroupByOutputType[P]>
            : GetScalarType<T[P], SubjectGroupByOutputType[P]>
        }
      >
    >


  export type subjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    SubjectCode?: boolean
    SubjectName?: boolean
    Credit?: boolean
    Category?: boolean
    ProgramID?: boolean
    class_schedule?: boolean | subject$class_scheduleArgs<ExtArgs>
    program?: boolean | subject$programArgs<ExtArgs>
    teachers_responsibility?: boolean | subject$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | SubjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subject"]>

  export type subjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    SubjectCode?: boolean
    SubjectName?: boolean
    Credit?: boolean
    Category?: boolean
    ProgramID?: boolean
    program?: boolean | subject$programArgs<ExtArgs>
  }, ExtArgs["result"]["subject"]>

  export type subjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    SubjectCode?: boolean
    SubjectName?: boolean
    Credit?: boolean
    Category?: boolean
    ProgramID?: boolean
    program?: boolean | subject$programArgs<ExtArgs>
  }, ExtArgs["result"]["subject"]>

  export type subjectSelectScalar = {
    SubjectCode?: boolean
    SubjectName?: boolean
    Credit?: boolean
    Category?: boolean
    ProgramID?: boolean
  }

  export type subjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"SubjectCode" | "SubjectName" | "Credit" | "Category" | "ProgramID", ExtArgs["result"]["subject"]>
  export type subjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | subject$class_scheduleArgs<ExtArgs>
    program?: boolean | subject$programArgs<ExtArgs>
    teachers_responsibility?: boolean | subject$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | SubjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type subjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    program?: boolean | subject$programArgs<ExtArgs>
  }
  export type subjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    program?: boolean | subject$programArgs<ExtArgs>
  }

  export type $subjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "subject"
    objects: {
      class_schedule: Prisma.$class_schedulePayload<ExtArgs>[]
      program: Prisma.$programPayload<ExtArgs> | null
      teachers_responsibility: Prisma.$teachers_responsibilityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      SubjectCode: string
      SubjectName: string
      Credit: $Enums.subject_credit
      Category: string
      ProgramID: number | null
    }, ExtArgs["result"]["subject"]>
    composites: {}
  }

  type subjectGetPayload<S extends boolean | null | undefined | subjectDefaultArgs> = $Result.GetResult<Prisma.$subjectPayload, S>

  type subjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<subjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubjectCountAggregateInputType | true
    }

  export interface subjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['subject'], meta: { name: 'subject' } }
    /**
     * Find zero or one Subject that matches the filter.
     * @param {subjectFindUniqueArgs} args - Arguments to find a Subject
     * @example
     * // Get one Subject
     * const subject = await prisma.subject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends subjectFindUniqueArgs>(args: SelectSubset<T, subjectFindUniqueArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Subject that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {subjectFindUniqueOrThrowArgs} args - Arguments to find a Subject
     * @example
     * // Get one Subject
     * const subject = await prisma.subject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends subjectFindUniqueOrThrowArgs>(args: SelectSubset<T, subjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectFindFirstArgs} args - Arguments to find a Subject
     * @example
     * // Get one Subject
     * const subject = await prisma.subject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends subjectFindFirstArgs>(args?: SelectSubset<T, subjectFindFirstArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Subject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectFindFirstOrThrowArgs} args - Arguments to find a Subject
     * @example
     * // Get one Subject
     * const subject = await prisma.subject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends subjectFindFirstOrThrowArgs>(args?: SelectSubset<T, subjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Subjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subjects
     * const subjects = await prisma.subject.findMany()
     * 
     * // Get first 10 Subjects
     * const subjects = await prisma.subject.findMany({ take: 10 })
     * 
     * // Only select the `SubjectCode`
     * const subjectWithSubjectCodeOnly = await prisma.subject.findMany({ select: { SubjectCode: true } })
     * 
     */
    findMany<T extends subjectFindManyArgs>(args?: SelectSubset<T, subjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Subject.
     * @param {subjectCreateArgs} args - Arguments to create a Subject.
     * @example
     * // Create one Subject
     * const Subject = await prisma.subject.create({
     *   data: {
     *     // ... data to create a Subject
     *   }
     * })
     * 
     */
    create<T extends subjectCreateArgs>(args: SelectSubset<T, subjectCreateArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Subjects.
     * @param {subjectCreateManyArgs} args - Arguments to create many Subjects.
     * @example
     * // Create many Subjects
     * const subject = await prisma.subject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends subjectCreateManyArgs>(args?: SelectSubset<T, subjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subjects and returns the data saved in the database.
     * @param {subjectCreateManyAndReturnArgs} args - Arguments to create many Subjects.
     * @example
     * // Create many Subjects
     * const subject = await prisma.subject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subjects and only return the `SubjectCode`
     * const subjectWithSubjectCodeOnly = await prisma.subject.createManyAndReturn({
     *   select: { SubjectCode: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends subjectCreateManyAndReturnArgs>(args?: SelectSubset<T, subjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Subject.
     * @param {subjectDeleteArgs} args - Arguments to delete one Subject.
     * @example
     * // Delete one Subject
     * const Subject = await prisma.subject.delete({
     *   where: {
     *     // ... filter to delete one Subject
     *   }
     * })
     * 
     */
    delete<T extends subjectDeleteArgs>(args: SelectSubset<T, subjectDeleteArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Subject.
     * @param {subjectUpdateArgs} args - Arguments to update one Subject.
     * @example
     * // Update one Subject
     * const subject = await prisma.subject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends subjectUpdateArgs>(args: SelectSubset<T, subjectUpdateArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Subjects.
     * @param {subjectDeleteManyArgs} args - Arguments to filter Subjects to delete.
     * @example
     * // Delete a few Subjects
     * const { count } = await prisma.subject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends subjectDeleteManyArgs>(args?: SelectSubset<T, subjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subjects
     * const subject = await prisma.subject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends subjectUpdateManyArgs>(args: SelectSubset<T, subjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subjects and returns the data updated in the database.
     * @param {subjectUpdateManyAndReturnArgs} args - Arguments to update many Subjects.
     * @example
     * // Update many Subjects
     * const subject = await prisma.subject.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Subjects and only return the `SubjectCode`
     * const subjectWithSubjectCodeOnly = await prisma.subject.updateManyAndReturn({
     *   select: { SubjectCode: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends subjectUpdateManyAndReturnArgs>(args: SelectSubset<T, subjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Subject.
     * @param {subjectUpsertArgs} args - Arguments to update or create a Subject.
     * @example
     * // Update or create a Subject
     * const subject = await prisma.subject.upsert({
     *   create: {
     *     // ... data to create a Subject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subject we want to update
     *   }
     * })
     */
    upsert<T extends subjectUpsertArgs>(args: SelectSubset<T, subjectUpsertArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Subjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectCountArgs} args - Arguments to filter Subjects to count.
     * @example
     * // Count the number of Subjects
     * const count = await prisma.subject.count({
     *   where: {
     *     // ... the filter for the Subjects we want to count
     *   }
     * })
    **/
    count<T extends subjectCountArgs>(
      args?: Subset<T, subjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubjectAggregateArgs>(args: Subset<T, SubjectAggregateArgs>): Prisma.PrismaPromise<GetSubjectAggregateType<T>>

    /**
     * Group by Subject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends subjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: subjectGroupByArgs['orderBy'] }
        : { orderBy?: subjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, subjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the subject model
   */
  readonly fields: subjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for subject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__subjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    class_schedule<T extends subject$class_scheduleArgs<ExtArgs> = {}>(args?: Subset<T, subject$class_scheduleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    program<T extends subject$programArgs<ExtArgs> = {}>(args?: Subset<T, subject$programArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    teachers_responsibility<T extends subject$teachers_responsibilityArgs<ExtArgs> = {}>(args?: Subset<T, subject$teachers_responsibilityArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the subject model
   */
  interface subjectFieldRefs {
    readonly SubjectCode: FieldRef<"subject", 'String'>
    readonly SubjectName: FieldRef<"subject", 'String'>
    readonly Credit: FieldRef<"subject", 'subject_credit'>
    readonly Category: FieldRef<"subject", 'String'>
    readonly ProgramID: FieldRef<"subject", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * subject findUnique
   */
  export type subjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter, which subject to fetch.
     */
    where: subjectWhereUniqueInput
  }

  /**
   * subject findUniqueOrThrow
   */
  export type subjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter, which subject to fetch.
     */
    where: subjectWhereUniqueInput
  }

  /**
   * subject findFirst
   */
  export type subjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter, which subject to fetch.
     */
    where?: subjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subjects to fetch.
     */
    orderBy?: subjectOrderByWithRelationInput | subjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subjects.
     */
    cursor?: subjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subjects.
     */
    distinct?: SubjectScalarFieldEnum | SubjectScalarFieldEnum[]
  }

  /**
   * subject findFirstOrThrow
   */
  export type subjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter, which subject to fetch.
     */
    where?: subjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subjects to fetch.
     */
    orderBy?: subjectOrderByWithRelationInput | subjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subjects.
     */
    cursor?: subjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subjects.
     */
    distinct?: SubjectScalarFieldEnum | SubjectScalarFieldEnum[]
  }

  /**
   * subject findMany
   */
  export type subjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter, which subjects to fetch.
     */
    where?: subjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subjects to fetch.
     */
    orderBy?: subjectOrderByWithRelationInput | subjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing subjects.
     */
    cursor?: subjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subjects.
     */
    skip?: number
    distinct?: SubjectScalarFieldEnum | SubjectScalarFieldEnum[]
  }

  /**
   * subject create
   */
  export type subjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * The data needed to create a subject.
     */
    data: XOR<subjectCreateInput, subjectUncheckedCreateInput>
  }

  /**
   * subject createMany
   */
  export type subjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many subjects.
     */
    data: subjectCreateManyInput | subjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * subject createManyAndReturn
   */
  export type subjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * The data used to create many subjects.
     */
    data: subjectCreateManyInput | subjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * subject update
   */
  export type subjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * The data needed to update a subject.
     */
    data: XOR<subjectUpdateInput, subjectUncheckedUpdateInput>
    /**
     * Choose, which subject to update.
     */
    where: subjectWhereUniqueInput
  }

  /**
   * subject updateMany
   */
  export type subjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update subjects.
     */
    data: XOR<subjectUpdateManyMutationInput, subjectUncheckedUpdateManyInput>
    /**
     * Filter which subjects to update
     */
    where?: subjectWhereInput
    /**
     * Limit how many subjects to update.
     */
    limit?: number
  }

  /**
   * subject updateManyAndReturn
   */
  export type subjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * The data used to update subjects.
     */
    data: XOR<subjectUpdateManyMutationInput, subjectUncheckedUpdateManyInput>
    /**
     * Filter which subjects to update
     */
    where?: subjectWhereInput
    /**
     * Limit how many subjects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * subject upsert
   */
  export type subjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * The filter to search for the subject to update in case it exists.
     */
    where: subjectWhereUniqueInput
    /**
     * In case the subject found by the `where` argument doesn't exist, create a new subject with this data.
     */
    create: XOR<subjectCreateInput, subjectUncheckedCreateInput>
    /**
     * In case the subject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<subjectUpdateInput, subjectUncheckedUpdateInput>
  }

  /**
   * subject delete
   */
  export type subjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    /**
     * Filter which subject to delete.
     */
    where: subjectWhereUniqueInput
  }

  /**
   * subject deleteMany
   */
  export type subjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which subjects to delete
     */
    where?: subjectWhereInput
    /**
     * Limit how many subjects to delete.
     */
    limit?: number
  }

  /**
   * subject.class_schedule
   */
  export type subject$class_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    cursor?: class_scheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * subject.program
   */
  export type subject$programArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    where?: programWhereInput
  }

  /**
   * subject.teachers_responsibility
   */
  export type subject$teachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    where?: teachers_responsibilityWhereInput
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    cursor?: teachers_responsibilityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * subject without action
   */
  export type subjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
  }


  /**
   * Model program
   */

  export type AggregateProgram = {
    _count: ProgramCountAggregateOutputType | null
    _avg: ProgramAvgAggregateOutputType | null
    _sum: ProgramSumAggregateOutputType | null
    _min: ProgramMinAggregateOutputType | null
    _max: ProgramMaxAggregateOutputType | null
  }

  export type ProgramAvgAggregateOutputType = {
    ProgramID: number | null
    AcademicYear: number | null
  }

  export type ProgramSumAggregateOutputType = {
    ProgramID: number | null
    AcademicYear: number | null
  }

  export type ProgramMinAggregateOutputType = {
    ProgramID: number | null
    ProgramName: string | null
    Semester: $Enums.semester | null
    AcademicYear: number | null
  }

  export type ProgramMaxAggregateOutputType = {
    ProgramID: number | null
    ProgramName: string | null
    Semester: $Enums.semester | null
    AcademicYear: number | null
  }

  export type ProgramCountAggregateOutputType = {
    ProgramID: number
    ProgramName: number
    Semester: number
    AcademicYear: number
    _all: number
  }


  export type ProgramAvgAggregateInputType = {
    ProgramID?: true
    AcademicYear?: true
  }

  export type ProgramSumAggregateInputType = {
    ProgramID?: true
    AcademicYear?: true
  }

  export type ProgramMinAggregateInputType = {
    ProgramID?: true
    ProgramName?: true
    Semester?: true
    AcademicYear?: true
  }

  export type ProgramMaxAggregateInputType = {
    ProgramID?: true
    ProgramName?: true
    Semester?: true
    AcademicYear?: true
  }

  export type ProgramCountAggregateInputType = {
    ProgramID?: true
    ProgramName?: true
    Semester?: true
    AcademicYear?: true
    _all?: true
  }

  export type ProgramAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which program to aggregate.
     */
    where?: programWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of programs to fetch.
     */
    orderBy?: programOrderByWithRelationInput | programOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: programWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` programs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` programs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned programs
    **/
    _count?: true | ProgramCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProgramAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProgramSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgramMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgramMaxAggregateInputType
  }

  export type GetProgramAggregateType<T extends ProgramAggregateArgs> = {
        [P in keyof T & keyof AggregateProgram]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgram[P]>
      : GetScalarType<T[P], AggregateProgram[P]>
  }




  export type programGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: programWhereInput
    orderBy?: programOrderByWithAggregationInput | programOrderByWithAggregationInput[]
    by: ProgramScalarFieldEnum[] | ProgramScalarFieldEnum
    having?: programScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgramCountAggregateInputType | true
    _avg?: ProgramAvgAggregateInputType
    _sum?: ProgramSumAggregateInputType
    _min?: ProgramMinAggregateInputType
    _max?: ProgramMaxAggregateInputType
  }

  export type ProgramGroupByOutputType = {
    ProgramID: number
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    _count: ProgramCountAggregateOutputType | null
    _avg: ProgramAvgAggregateOutputType | null
    _sum: ProgramSumAggregateOutputType | null
    _min: ProgramMinAggregateOutputType | null
    _max: ProgramMaxAggregateOutputType | null
  }

  type GetProgramGroupByPayload<T extends programGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgramGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgramGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgramGroupByOutputType[P]>
            : GetScalarType<T[P], ProgramGroupByOutputType[P]>
        }
      >
    >


  export type programSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ProgramID?: boolean
    ProgramName?: boolean
    Semester?: boolean
    AcademicYear?: boolean
    subject?: boolean | program$subjectArgs<ExtArgs>
    gradelevel?: boolean | program$gradelevelArgs<ExtArgs>
    _count?: boolean | ProgramCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["program"]>

  export type programSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ProgramID?: boolean
    ProgramName?: boolean
    Semester?: boolean
    AcademicYear?: boolean
  }, ExtArgs["result"]["program"]>

  export type programSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ProgramID?: boolean
    ProgramName?: boolean
    Semester?: boolean
    AcademicYear?: boolean
  }, ExtArgs["result"]["program"]>

  export type programSelectScalar = {
    ProgramID?: boolean
    ProgramName?: boolean
    Semester?: boolean
    AcademicYear?: boolean
  }

  export type programOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ProgramID" | "ProgramName" | "Semester" | "AcademicYear", ExtArgs["result"]["program"]>
  export type programInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subject?: boolean | program$subjectArgs<ExtArgs>
    gradelevel?: boolean | program$gradelevelArgs<ExtArgs>
    _count?: boolean | ProgramCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type programIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type programIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $programPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "program"
    objects: {
      subject: Prisma.$subjectPayload<ExtArgs>[]
      gradelevel: Prisma.$gradelevelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      ProgramID: number
      ProgramName: string
      Semester: $Enums.semester
      AcademicYear: number
    }, ExtArgs["result"]["program"]>
    composites: {}
  }

  type programGetPayload<S extends boolean | null | undefined | programDefaultArgs> = $Result.GetResult<Prisma.$programPayload, S>

  type programCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<programFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProgramCountAggregateInputType | true
    }

  export interface programDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['program'], meta: { name: 'program' } }
    /**
     * Find zero or one Program that matches the filter.
     * @param {programFindUniqueArgs} args - Arguments to find a Program
     * @example
     * // Get one Program
     * const program = await prisma.program.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends programFindUniqueArgs>(args: SelectSubset<T, programFindUniqueArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Program that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {programFindUniqueOrThrowArgs} args - Arguments to find a Program
     * @example
     * // Get one Program
     * const program = await prisma.program.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends programFindUniqueOrThrowArgs>(args: SelectSubset<T, programFindUniqueOrThrowArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Program that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programFindFirstArgs} args - Arguments to find a Program
     * @example
     * // Get one Program
     * const program = await prisma.program.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends programFindFirstArgs>(args?: SelectSubset<T, programFindFirstArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Program that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programFindFirstOrThrowArgs} args - Arguments to find a Program
     * @example
     * // Get one Program
     * const program = await prisma.program.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends programFindFirstOrThrowArgs>(args?: SelectSubset<T, programFindFirstOrThrowArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Programs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Programs
     * const programs = await prisma.program.findMany()
     * 
     * // Get first 10 Programs
     * const programs = await prisma.program.findMany({ take: 10 })
     * 
     * // Only select the `ProgramID`
     * const programWithProgramIDOnly = await prisma.program.findMany({ select: { ProgramID: true } })
     * 
     */
    findMany<T extends programFindManyArgs>(args?: SelectSubset<T, programFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Program.
     * @param {programCreateArgs} args - Arguments to create a Program.
     * @example
     * // Create one Program
     * const Program = await prisma.program.create({
     *   data: {
     *     // ... data to create a Program
     *   }
     * })
     * 
     */
    create<T extends programCreateArgs>(args: SelectSubset<T, programCreateArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Programs.
     * @param {programCreateManyArgs} args - Arguments to create many Programs.
     * @example
     * // Create many Programs
     * const program = await prisma.program.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends programCreateManyArgs>(args?: SelectSubset<T, programCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Programs and returns the data saved in the database.
     * @param {programCreateManyAndReturnArgs} args - Arguments to create many Programs.
     * @example
     * // Create many Programs
     * const program = await prisma.program.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Programs and only return the `ProgramID`
     * const programWithProgramIDOnly = await prisma.program.createManyAndReturn({
     *   select: { ProgramID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends programCreateManyAndReturnArgs>(args?: SelectSubset<T, programCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Program.
     * @param {programDeleteArgs} args - Arguments to delete one Program.
     * @example
     * // Delete one Program
     * const Program = await prisma.program.delete({
     *   where: {
     *     // ... filter to delete one Program
     *   }
     * })
     * 
     */
    delete<T extends programDeleteArgs>(args: SelectSubset<T, programDeleteArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Program.
     * @param {programUpdateArgs} args - Arguments to update one Program.
     * @example
     * // Update one Program
     * const program = await prisma.program.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends programUpdateArgs>(args: SelectSubset<T, programUpdateArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Programs.
     * @param {programDeleteManyArgs} args - Arguments to filter Programs to delete.
     * @example
     * // Delete a few Programs
     * const { count } = await prisma.program.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends programDeleteManyArgs>(args?: SelectSubset<T, programDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Programs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Programs
     * const program = await prisma.program.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends programUpdateManyArgs>(args: SelectSubset<T, programUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Programs and returns the data updated in the database.
     * @param {programUpdateManyAndReturnArgs} args - Arguments to update many Programs.
     * @example
     * // Update many Programs
     * const program = await prisma.program.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Programs and only return the `ProgramID`
     * const programWithProgramIDOnly = await prisma.program.updateManyAndReturn({
     *   select: { ProgramID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends programUpdateManyAndReturnArgs>(args: SelectSubset<T, programUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Program.
     * @param {programUpsertArgs} args - Arguments to update or create a Program.
     * @example
     * // Update or create a Program
     * const program = await prisma.program.upsert({
     *   create: {
     *     // ... data to create a Program
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Program we want to update
     *   }
     * })
     */
    upsert<T extends programUpsertArgs>(args: SelectSubset<T, programUpsertArgs<ExtArgs>>): Prisma__programClient<$Result.GetResult<Prisma.$programPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Programs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programCountArgs} args - Arguments to filter Programs to count.
     * @example
     * // Count the number of Programs
     * const count = await prisma.program.count({
     *   where: {
     *     // ... the filter for the Programs we want to count
     *   }
     * })
    **/
    count<T extends programCountArgs>(
      args?: Subset<T, programCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgramCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Program.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgramAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProgramAggregateArgs>(args: Subset<T, ProgramAggregateArgs>): Prisma.PrismaPromise<GetProgramAggregateType<T>>

    /**
     * Group by Program.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {programGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends programGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: programGroupByArgs['orderBy'] }
        : { orderBy?: programGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, programGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgramGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the program model
   */
  readonly fields: programFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for program.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__programClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    subject<T extends program$subjectArgs<ExtArgs> = {}>(args?: Subset<T, program$subjectArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    gradelevel<T extends program$gradelevelArgs<ExtArgs> = {}>(args?: Subset<T, program$gradelevelArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the program model
   */
  interface programFieldRefs {
    readonly ProgramID: FieldRef<"program", 'Int'>
    readonly ProgramName: FieldRef<"program", 'String'>
    readonly Semester: FieldRef<"program", 'semester'>
    readonly AcademicYear: FieldRef<"program", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * program findUnique
   */
  export type programFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter, which program to fetch.
     */
    where: programWhereUniqueInput
  }

  /**
   * program findUniqueOrThrow
   */
  export type programFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter, which program to fetch.
     */
    where: programWhereUniqueInput
  }

  /**
   * program findFirst
   */
  export type programFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter, which program to fetch.
     */
    where?: programWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of programs to fetch.
     */
    orderBy?: programOrderByWithRelationInput | programOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for programs.
     */
    cursor?: programWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` programs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` programs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of programs.
     */
    distinct?: ProgramScalarFieldEnum | ProgramScalarFieldEnum[]
  }

  /**
   * program findFirstOrThrow
   */
  export type programFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter, which program to fetch.
     */
    where?: programWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of programs to fetch.
     */
    orderBy?: programOrderByWithRelationInput | programOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for programs.
     */
    cursor?: programWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` programs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` programs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of programs.
     */
    distinct?: ProgramScalarFieldEnum | ProgramScalarFieldEnum[]
  }

  /**
   * program findMany
   */
  export type programFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter, which programs to fetch.
     */
    where?: programWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of programs to fetch.
     */
    orderBy?: programOrderByWithRelationInput | programOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing programs.
     */
    cursor?: programWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` programs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` programs.
     */
    skip?: number
    distinct?: ProgramScalarFieldEnum | ProgramScalarFieldEnum[]
  }

  /**
   * program create
   */
  export type programCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * The data needed to create a program.
     */
    data: XOR<programCreateInput, programUncheckedCreateInput>
  }

  /**
   * program createMany
   */
  export type programCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many programs.
     */
    data: programCreateManyInput | programCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * program createManyAndReturn
   */
  export type programCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * The data used to create many programs.
     */
    data: programCreateManyInput | programCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * program update
   */
  export type programUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * The data needed to update a program.
     */
    data: XOR<programUpdateInput, programUncheckedUpdateInput>
    /**
     * Choose, which program to update.
     */
    where: programWhereUniqueInput
  }

  /**
   * program updateMany
   */
  export type programUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update programs.
     */
    data: XOR<programUpdateManyMutationInput, programUncheckedUpdateManyInput>
    /**
     * Filter which programs to update
     */
    where?: programWhereInput
    /**
     * Limit how many programs to update.
     */
    limit?: number
  }

  /**
   * program updateManyAndReturn
   */
  export type programUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * The data used to update programs.
     */
    data: XOR<programUpdateManyMutationInput, programUncheckedUpdateManyInput>
    /**
     * Filter which programs to update
     */
    where?: programWhereInput
    /**
     * Limit how many programs to update.
     */
    limit?: number
  }

  /**
   * program upsert
   */
  export type programUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * The filter to search for the program to update in case it exists.
     */
    where: programWhereUniqueInput
    /**
     * In case the program found by the `where` argument doesn't exist, create a new program with this data.
     */
    create: XOR<programCreateInput, programUncheckedCreateInput>
    /**
     * In case the program was found with the provided `where` argument, update it with this data.
     */
    update: XOR<programUpdateInput, programUncheckedUpdateInput>
  }

  /**
   * program delete
   */
  export type programDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
    /**
     * Filter which program to delete.
     */
    where: programWhereUniqueInput
  }

  /**
   * program deleteMany
   */
  export type programDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which programs to delete
     */
    where?: programWhereInput
    /**
     * Limit how many programs to delete.
     */
    limit?: number
  }

  /**
   * program.subject
   */
  export type program$subjectArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the subject
     */
    select?: subjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the subject
     */
    omit?: subjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: subjectInclude<ExtArgs> | null
    where?: subjectWhereInput
    orderBy?: subjectOrderByWithRelationInput | subjectOrderByWithRelationInput[]
    cursor?: subjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubjectScalarFieldEnum | SubjectScalarFieldEnum[]
  }

  /**
   * program.gradelevel
   */
  export type program$gradelevelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the gradelevel
     */
    select?: gradelevelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the gradelevel
     */
    omit?: gradelevelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: gradelevelInclude<ExtArgs> | null
    where?: gradelevelWhereInput
    orderBy?: gradelevelOrderByWithRelationInput | gradelevelOrderByWithRelationInput[]
    cursor?: gradelevelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GradelevelScalarFieldEnum | GradelevelScalarFieldEnum[]
  }

  /**
   * program without action
   */
  export type programDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the program
     */
    select?: programSelect<ExtArgs> | null
    /**
     * Omit specific fields from the program
     */
    omit?: programOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: programInclude<ExtArgs> | null
  }


  /**
   * Model teacher
   */

  export type AggregateTeacher = {
    _count: TeacherCountAggregateOutputType | null
    _avg: TeacherAvgAggregateOutputType | null
    _sum: TeacherSumAggregateOutputType | null
    _min: TeacherMinAggregateOutputType | null
    _max: TeacherMaxAggregateOutputType | null
  }

  export type TeacherAvgAggregateOutputType = {
    TeacherID: number | null
  }

  export type TeacherSumAggregateOutputType = {
    TeacherID: number | null
  }

  export type TeacherMinAggregateOutputType = {
    TeacherID: number | null
    Prefix: string | null
    Firstname: string | null
    Lastname: string | null
    Department: string | null
    Email: string | null
    Role: string | null
  }

  export type TeacherMaxAggregateOutputType = {
    TeacherID: number | null
    Prefix: string | null
    Firstname: string | null
    Lastname: string | null
    Department: string | null
    Email: string | null
    Role: string | null
  }

  export type TeacherCountAggregateOutputType = {
    TeacherID: number
    Prefix: number
    Firstname: number
    Lastname: number
    Department: number
    Email: number
    Role: number
    _all: number
  }


  export type TeacherAvgAggregateInputType = {
    TeacherID?: true
  }

  export type TeacherSumAggregateInputType = {
    TeacherID?: true
  }

  export type TeacherMinAggregateInputType = {
    TeacherID?: true
    Prefix?: true
    Firstname?: true
    Lastname?: true
    Department?: true
    Email?: true
    Role?: true
  }

  export type TeacherMaxAggregateInputType = {
    TeacherID?: true
    Prefix?: true
    Firstname?: true
    Lastname?: true
    Department?: true
    Email?: true
    Role?: true
  }

  export type TeacherCountAggregateInputType = {
    TeacherID?: true
    Prefix?: true
    Firstname?: true
    Lastname?: true
    Department?: true
    Email?: true
    Role?: true
    _all?: true
  }

  export type TeacherAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teacher to aggregate.
     */
    where?: teacherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers to fetch.
     */
    orderBy?: teacherOrderByWithRelationInput | teacherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: teacherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned teachers
    **/
    _count?: true | TeacherCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TeacherAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TeacherSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeacherMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeacherMaxAggregateInputType
  }

  export type GetTeacherAggregateType<T extends TeacherAggregateArgs> = {
        [P in keyof T & keyof AggregateTeacher]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeacher[P]>
      : GetScalarType<T[P], AggregateTeacher[P]>
  }




  export type teacherGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teacherWhereInput
    orderBy?: teacherOrderByWithAggregationInput | teacherOrderByWithAggregationInput[]
    by: TeacherScalarFieldEnum[] | TeacherScalarFieldEnum
    having?: teacherScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeacherCountAggregateInputType | true
    _avg?: TeacherAvgAggregateInputType
    _sum?: TeacherSumAggregateInputType
    _min?: TeacherMinAggregateInputType
    _max?: TeacherMaxAggregateInputType
  }

  export type TeacherGroupByOutputType = {
    TeacherID: number
    Prefix: string
    Firstname: string
    Lastname: string
    Department: string
    Email: string
    Role: string
    _count: TeacherCountAggregateOutputType | null
    _avg: TeacherAvgAggregateOutputType | null
    _sum: TeacherSumAggregateOutputType | null
    _min: TeacherMinAggregateOutputType | null
    _max: TeacherMaxAggregateOutputType | null
  }

  type GetTeacherGroupByPayload<T extends teacherGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeacherGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeacherGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeacherGroupByOutputType[P]>
            : GetScalarType<T[P], TeacherGroupByOutputType[P]>
        }
      >
    >


  export type teacherSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TeacherID?: boolean
    Prefix?: boolean
    Firstname?: boolean
    Lastname?: boolean
    Department?: boolean
    Email?: boolean
    Role?: boolean
    teachers_responsibility?: boolean | teacher$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | TeacherCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teacher"]>

  export type teacherSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TeacherID?: boolean
    Prefix?: boolean
    Firstname?: boolean
    Lastname?: boolean
    Department?: boolean
    Email?: boolean
    Role?: boolean
  }, ExtArgs["result"]["teacher"]>

  export type teacherSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TeacherID?: boolean
    Prefix?: boolean
    Firstname?: boolean
    Lastname?: boolean
    Department?: boolean
    Email?: boolean
    Role?: boolean
  }, ExtArgs["result"]["teacher"]>

  export type teacherSelectScalar = {
    TeacherID?: boolean
    Prefix?: boolean
    Firstname?: boolean
    Lastname?: boolean
    Department?: boolean
    Email?: boolean
    Role?: boolean
  }

  export type teacherOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"TeacherID" | "Prefix" | "Firstname" | "Lastname" | "Department" | "Email" | "Role", ExtArgs["result"]["teacher"]>
  export type teacherInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    teachers_responsibility?: boolean | teacher$teachers_responsibilityArgs<ExtArgs>
    _count?: boolean | TeacherCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type teacherIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type teacherIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $teacherPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "teacher"
    objects: {
      teachers_responsibility: Prisma.$teachers_responsibilityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      TeacherID: number
      Prefix: string
      Firstname: string
      Lastname: string
      Department: string
      Email: string
      Role: string
    }, ExtArgs["result"]["teacher"]>
    composites: {}
  }

  type teacherGetPayload<S extends boolean | null | undefined | teacherDefaultArgs> = $Result.GetResult<Prisma.$teacherPayload, S>

  type teacherCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<teacherFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TeacherCountAggregateInputType | true
    }

  export interface teacherDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['teacher'], meta: { name: 'teacher' } }
    /**
     * Find zero or one Teacher that matches the filter.
     * @param {teacherFindUniqueArgs} args - Arguments to find a Teacher
     * @example
     * // Get one Teacher
     * const teacher = await prisma.teacher.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends teacherFindUniqueArgs>(args: SelectSubset<T, teacherFindUniqueArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Teacher that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {teacherFindUniqueOrThrowArgs} args - Arguments to find a Teacher
     * @example
     * // Get one Teacher
     * const teacher = await prisma.teacher.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends teacherFindUniqueOrThrowArgs>(args: SelectSubset<T, teacherFindUniqueOrThrowArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Teacher that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherFindFirstArgs} args - Arguments to find a Teacher
     * @example
     * // Get one Teacher
     * const teacher = await prisma.teacher.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends teacherFindFirstArgs>(args?: SelectSubset<T, teacherFindFirstArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Teacher that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherFindFirstOrThrowArgs} args - Arguments to find a Teacher
     * @example
     * // Get one Teacher
     * const teacher = await prisma.teacher.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends teacherFindFirstOrThrowArgs>(args?: SelectSubset<T, teacherFindFirstOrThrowArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Teachers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teachers
     * const teachers = await prisma.teacher.findMany()
     * 
     * // Get first 10 Teachers
     * const teachers = await prisma.teacher.findMany({ take: 10 })
     * 
     * // Only select the `TeacherID`
     * const teacherWithTeacherIDOnly = await prisma.teacher.findMany({ select: { TeacherID: true } })
     * 
     */
    findMany<T extends teacherFindManyArgs>(args?: SelectSubset<T, teacherFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Teacher.
     * @param {teacherCreateArgs} args - Arguments to create a Teacher.
     * @example
     * // Create one Teacher
     * const Teacher = await prisma.teacher.create({
     *   data: {
     *     // ... data to create a Teacher
     *   }
     * })
     * 
     */
    create<T extends teacherCreateArgs>(args: SelectSubset<T, teacherCreateArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Teachers.
     * @param {teacherCreateManyArgs} args - Arguments to create many Teachers.
     * @example
     * // Create many Teachers
     * const teacher = await prisma.teacher.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends teacherCreateManyArgs>(args?: SelectSubset<T, teacherCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teachers and returns the data saved in the database.
     * @param {teacherCreateManyAndReturnArgs} args - Arguments to create many Teachers.
     * @example
     * // Create many Teachers
     * const teacher = await prisma.teacher.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teachers and only return the `TeacherID`
     * const teacherWithTeacherIDOnly = await prisma.teacher.createManyAndReturn({
     *   select: { TeacherID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends teacherCreateManyAndReturnArgs>(args?: SelectSubset<T, teacherCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Teacher.
     * @param {teacherDeleteArgs} args - Arguments to delete one Teacher.
     * @example
     * // Delete one Teacher
     * const Teacher = await prisma.teacher.delete({
     *   where: {
     *     // ... filter to delete one Teacher
     *   }
     * })
     * 
     */
    delete<T extends teacherDeleteArgs>(args: SelectSubset<T, teacherDeleteArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Teacher.
     * @param {teacherUpdateArgs} args - Arguments to update one Teacher.
     * @example
     * // Update one Teacher
     * const teacher = await prisma.teacher.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends teacherUpdateArgs>(args: SelectSubset<T, teacherUpdateArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Teachers.
     * @param {teacherDeleteManyArgs} args - Arguments to filter Teachers to delete.
     * @example
     * // Delete a few Teachers
     * const { count } = await prisma.teacher.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends teacherDeleteManyArgs>(args?: SelectSubset<T, teacherDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teachers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teachers
     * const teacher = await prisma.teacher.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends teacherUpdateManyArgs>(args: SelectSubset<T, teacherUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teachers and returns the data updated in the database.
     * @param {teacherUpdateManyAndReturnArgs} args - Arguments to update many Teachers.
     * @example
     * // Update many Teachers
     * const teacher = await prisma.teacher.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Teachers and only return the `TeacherID`
     * const teacherWithTeacherIDOnly = await prisma.teacher.updateManyAndReturn({
     *   select: { TeacherID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends teacherUpdateManyAndReturnArgs>(args: SelectSubset<T, teacherUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Teacher.
     * @param {teacherUpsertArgs} args - Arguments to update or create a Teacher.
     * @example
     * // Update or create a Teacher
     * const teacher = await prisma.teacher.upsert({
     *   create: {
     *     // ... data to create a Teacher
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Teacher we want to update
     *   }
     * })
     */
    upsert<T extends teacherUpsertArgs>(args: SelectSubset<T, teacherUpsertArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Teachers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherCountArgs} args - Arguments to filter Teachers to count.
     * @example
     * // Count the number of Teachers
     * const count = await prisma.teacher.count({
     *   where: {
     *     // ... the filter for the Teachers we want to count
     *   }
     * })
    **/
    count<T extends teacherCountArgs>(
      args?: Subset<T, teacherCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeacherCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Teacher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeacherAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeacherAggregateArgs>(args: Subset<T, TeacherAggregateArgs>): Prisma.PrismaPromise<GetTeacherAggregateType<T>>

    /**
     * Group by Teacher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teacherGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends teacherGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: teacherGroupByArgs['orderBy'] }
        : { orderBy?: teacherGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, teacherGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeacherGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the teacher model
   */
  readonly fields: teacherFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for teacher.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__teacherClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    teachers_responsibility<T extends teacher$teachers_responsibilityArgs<ExtArgs> = {}>(args?: Subset<T, teacher$teachers_responsibilityArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the teacher model
   */
  interface teacherFieldRefs {
    readonly TeacherID: FieldRef<"teacher", 'Int'>
    readonly Prefix: FieldRef<"teacher", 'String'>
    readonly Firstname: FieldRef<"teacher", 'String'>
    readonly Lastname: FieldRef<"teacher", 'String'>
    readonly Department: FieldRef<"teacher", 'String'>
    readonly Email: FieldRef<"teacher", 'String'>
    readonly Role: FieldRef<"teacher", 'String'>
  }
    

  // Custom InputTypes
  /**
   * teacher findUnique
   */
  export type teacherFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter, which teacher to fetch.
     */
    where: teacherWhereUniqueInput
  }

  /**
   * teacher findUniqueOrThrow
   */
  export type teacherFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter, which teacher to fetch.
     */
    where: teacherWhereUniqueInput
  }

  /**
   * teacher findFirst
   */
  export type teacherFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter, which teacher to fetch.
     */
    where?: teacherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers to fetch.
     */
    orderBy?: teacherOrderByWithRelationInput | teacherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teachers.
     */
    cursor?: teacherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teachers.
     */
    distinct?: TeacherScalarFieldEnum | TeacherScalarFieldEnum[]
  }

  /**
   * teacher findFirstOrThrow
   */
  export type teacherFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter, which teacher to fetch.
     */
    where?: teacherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers to fetch.
     */
    orderBy?: teacherOrderByWithRelationInput | teacherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teachers.
     */
    cursor?: teacherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teachers.
     */
    distinct?: TeacherScalarFieldEnum | TeacherScalarFieldEnum[]
  }

  /**
   * teacher findMany
   */
  export type teacherFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter, which teachers to fetch.
     */
    where?: teacherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers to fetch.
     */
    orderBy?: teacherOrderByWithRelationInput | teacherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing teachers.
     */
    cursor?: teacherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers.
     */
    skip?: number
    distinct?: TeacherScalarFieldEnum | TeacherScalarFieldEnum[]
  }

  /**
   * teacher create
   */
  export type teacherCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * The data needed to create a teacher.
     */
    data: XOR<teacherCreateInput, teacherUncheckedCreateInput>
  }

  /**
   * teacher createMany
   */
  export type teacherCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many teachers.
     */
    data: teacherCreateManyInput | teacherCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * teacher createManyAndReturn
   */
  export type teacherCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * The data used to create many teachers.
     */
    data: teacherCreateManyInput | teacherCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * teacher update
   */
  export type teacherUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * The data needed to update a teacher.
     */
    data: XOR<teacherUpdateInput, teacherUncheckedUpdateInput>
    /**
     * Choose, which teacher to update.
     */
    where: teacherWhereUniqueInput
  }

  /**
   * teacher updateMany
   */
  export type teacherUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update teachers.
     */
    data: XOR<teacherUpdateManyMutationInput, teacherUncheckedUpdateManyInput>
    /**
     * Filter which teachers to update
     */
    where?: teacherWhereInput
    /**
     * Limit how many teachers to update.
     */
    limit?: number
  }

  /**
   * teacher updateManyAndReturn
   */
  export type teacherUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * The data used to update teachers.
     */
    data: XOR<teacherUpdateManyMutationInput, teacherUncheckedUpdateManyInput>
    /**
     * Filter which teachers to update
     */
    where?: teacherWhereInput
    /**
     * Limit how many teachers to update.
     */
    limit?: number
  }

  /**
   * teacher upsert
   */
  export type teacherUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * The filter to search for the teacher to update in case it exists.
     */
    where: teacherWhereUniqueInput
    /**
     * In case the teacher found by the `where` argument doesn't exist, create a new teacher with this data.
     */
    create: XOR<teacherCreateInput, teacherUncheckedCreateInput>
    /**
     * In case the teacher was found with the provided `where` argument, update it with this data.
     */
    update: XOR<teacherUpdateInput, teacherUncheckedUpdateInput>
  }

  /**
   * teacher delete
   */
  export type teacherDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
    /**
     * Filter which teacher to delete.
     */
    where: teacherWhereUniqueInput
  }

  /**
   * teacher deleteMany
   */
  export type teacherDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teachers to delete
     */
    where?: teacherWhereInput
    /**
     * Limit how many teachers to delete.
     */
    limit?: number
  }

  /**
   * teacher.teachers_responsibility
   */
  export type teacher$teachers_responsibilityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    where?: teachers_responsibilityWhereInput
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    cursor?: teachers_responsibilityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * teacher without action
   */
  export type teacherDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teacher
     */
    select?: teacherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the teacher
     */
    omit?: teacherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teacherInclude<ExtArgs> | null
  }


  /**
   * Model timeslot
   */

  export type AggregateTimeslot = {
    _count: TimeslotCountAggregateOutputType | null
    _avg: TimeslotAvgAggregateOutputType | null
    _sum: TimeslotSumAggregateOutputType | null
    _min: TimeslotMinAggregateOutputType | null
    _max: TimeslotMaxAggregateOutputType | null
  }

  export type TimeslotAvgAggregateOutputType = {
    AcademicYear: number | null
  }

  export type TimeslotSumAggregateOutputType = {
    AcademicYear: number | null
  }

  export type TimeslotMinAggregateOutputType = {
    TimeslotID: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    StartTime: Date | null
    EndTime: Date | null
    Breaktime: $Enums.breaktime | null
    DayOfWeek: $Enums.day_of_week | null
  }

  export type TimeslotMaxAggregateOutputType = {
    TimeslotID: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    StartTime: Date | null
    EndTime: Date | null
    Breaktime: $Enums.breaktime | null
    DayOfWeek: $Enums.day_of_week | null
  }

  export type TimeslotCountAggregateOutputType = {
    TimeslotID: number
    AcademicYear: number
    Semester: number
    StartTime: number
    EndTime: number
    Breaktime: number
    DayOfWeek: number
    _all: number
  }


  export type TimeslotAvgAggregateInputType = {
    AcademicYear?: true
  }

  export type TimeslotSumAggregateInputType = {
    AcademicYear?: true
  }

  export type TimeslotMinAggregateInputType = {
    TimeslotID?: true
    AcademicYear?: true
    Semester?: true
    StartTime?: true
    EndTime?: true
    Breaktime?: true
    DayOfWeek?: true
  }

  export type TimeslotMaxAggregateInputType = {
    TimeslotID?: true
    AcademicYear?: true
    Semester?: true
    StartTime?: true
    EndTime?: true
    Breaktime?: true
    DayOfWeek?: true
  }

  export type TimeslotCountAggregateInputType = {
    TimeslotID?: true
    AcademicYear?: true
    Semester?: true
    StartTime?: true
    EndTime?: true
    Breaktime?: true
    DayOfWeek?: true
    _all?: true
  }

  export type TimeslotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which timeslot to aggregate.
     */
    where?: timeslotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of timeslots to fetch.
     */
    orderBy?: timeslotOrderByWithRelationInput | timeslotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: timeslotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` timeslots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` timeslots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned timeslots
    **/
    _count?: true | TimeslotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TimeslotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TimeslotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TimeslotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TimeslotMaxAggregateInputType
  }

  export type GetTimeslotAggregateType<T extends TimeslotAggregateArgs> = {
        [P in keyof T & keyof AggregateTimeslot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTimeslot[P]>
      : GetScalarType<T[P], AggregateTimeslot[P]>
  }




  export type timeslotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: timeslotWhereInput
    orderBy?: timeslotOrderByWithAggregationInput | timeslotOrderByWithAggregationInput[]
    by: TimeslotScalarFieldEnum[] | TimeslotScalarFieldEnum
    having?: timeslotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TimeslotCountAggregateInputType | true
    _avg?: TimeslotAvgAggregateInputType
    _sum?: TimeslotSumAggregateInputType
    _min?: TimeslotMinAggregateInputType
    _max?: TimeslotMaxAggregateInputType
  }

  export type TimeslotGroupByOutputType = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date
    EndTime: Date
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
    _count: TimeslotCountAggregateOutputType | null
    _avg: TimeslotAvgAggregateOutputType | null
    _sum: TimeslotSumAggregateOutputType | null
    _min: TimeslotMinAggregateOutputType | null
    _max: TimeslotMaxAggregateOutputType | null
  }

  type GetTimeslotGroupByPayload<T extends timeslotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TimeslotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TimeslotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TimeslotGroupByOutputType[P]>
            : GetScalarType<T[P], TimeslotGroupByOutputType[P]>
        }
      >
    >


  export type timeslotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TimeslotID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    StartTime?: boolean
    EndTime?: boolean
    Breaktime?: boolean
    DayOfWeek?: boolean
    class_schedule?: boolean | timeslot$class_scheduleArgs<ExtArgs>
    _count?: boolean | TimeslotCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["timeslot"]>

  export type timeslotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TimeslotID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    StartTime?: boolean
    EndTime?: boolean
    Breaktime?: boolean
    DayOfWeek?: boolean
  }, ExtArgs["result"]["timeslot"]>

  export type timeslotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    TimeslotID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    StartTime?: boolean
    EndTime?: boolean
    Breaktime?: boolean
    DayOfWeek?: boolean
  }, ExtArgs["result"]["timeslot"]>

  export type timeslotSelectScalar = {
    TimeslotID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    StartTime?: boolean
    EndTime?: boolean
    Breaktime?: boolean
    DayOfWeek?: boolean
  }

  export type timeslotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"TimeslotID" | "AcademicYear" | "Semester" | "StartTime" | "EndTime" | "Breaktime" | "DayOfWeek", ExtArgs["result"]["timeslot"]>
  export type timeslotInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    class_schedule?: boolean | timeslot$class_scheduleArgs<ExtArgs>
    _count?: boolean | TimeslotCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type timeslotIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type timeslotIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $timeslotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "timeslot"
    objects: {
      class_schedule: Prisma.$class_schedulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      TimeslotID: string
      AcademicYear: number
      Semester: $Enums.semester
      StartTime: Date
      EndTime: Date
      Breaktime: $Enums.breaktime
      DayOfWeek: $Enums.day_of_week
    }, ExtArgs["result"]["timeslot"]>
    composites: {}
  }

  type timeslotGetPayload<S extends boolean | null | undefined | timeslotDefaultArgs> = $Result.GetResult<Prisma.$timeslotPayload, S>

  type timeslotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<timeslotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TimeslotCountAggregateInputType | true
    }

  export interface timeslotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['timeslot'], meta: { name: 'timeslot' } }
    /**
     * Find zero or one Timeslot that matches the filter.
     * @param {timeslotFindUniqueArgs} args - Arguments to find a Timeslot
     * @example
     * // Get one Timeslot
     * const timeslot = await prisma.timeslot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends timeslotFindUniqueArgs>(args: SelectSubset<T, timeslotFindUniqueArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Timeslot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {timeslotFindUniqueOrThrowArgs} args - Arguments to find a Timeslot
     * @example
     * // Get one Timeslot
     * const timeslot = await prisma.timeslot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends timeslotFindUniqueOrThrowArgs>(args: SelectSubset<T, timeslotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Timeslot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotFindFirstArgs} args - Arguments to find a Timeslot
     * @example
     * // Get one Timeslot
     * const timeslot = await prisma.timeslot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends timeslotFindFirstArgs>(args?: SelectSubset<T, timeslotFindFirstArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Timeslot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotFindFirstOrThrowArgs} args - Arguments to find a Timeslot
     * @example
     * // Get one Timeslot
     * const timeslot = await prisma.timeslot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends timeslotFindFirstOrThrowArgs>(args?: SelectSubset<T, timeslotFindFirstOrThrowArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Timeslots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Timeslots
     * const timeslots = await prisma.timeslot.findMany()
     * 
     * // Get first 10 Timeslots
     * const timeslots = await prisma.timeslot.findMany({ take: 10 })
     * 
     * // Only select the `TimeslotID`
     * const timeslotWithTimeslotIDOnly = await prisma.timeslot.findMany({ select: { TimeslotID: true } })
     * 
     */
    findMany<T extends timeslotFindManyArgs>(args?: SelectSubset<T, timeslotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Timeslot.
     * @param {timeslotCreateArgs} args - Arguments to create a Timeslot.
     * @example
     * // Create one Timeslot
     * const Timeslot = await prisma.timeslot.create({
     *   data: {
     *     // ... data to create a Timeslot
     *   }
     * })
     * 
     */
    create<T extends timeslotCreateArgs>(args: SelectSubset<T, timeslotCreateArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Timeslots.
     * @param {timeslotCreateManyArgs} args - Arguments to create many Timeslots.
     * @example
     * // Create many Timeslots
     * const timeslot = await prisma.timeslot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends timeslotCreateManyArgs>(args?: SelectSubset<T, timeslotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Timeslots and returns the data saved in the database.
     * @param {timeslotCreateManyAndReturnArgs} args - Arguments to create many Timeslots.
     * @example
     * // Create many Timeslots
     * const timeslot = await prisma.timeslot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Timeslots and only return the `TimeslotID`
     * const timeslotWithTimeslotIDOnly = await prisma.timeslot.createManyAndReturn({
     *   select: { TimeslotID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends timeslotCreateManyAndReturnArgs>(args?: SelectSubset<T, timeslotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Timeslot.
     * @param {timeslotDeleteArgs} args - Arguments to delete one Timeslot.
     * @example
     * // Delete one Timeslot
     * const Timeslot = await prisma.timeslot.delete({
     *   where: {
     *     // ... filter to delete one Timeslot
     *   }
     * })
     * 
     */
    delete<T extends timeslotDeleteArgs>(args: SelectSubset<T, timeslotDeleteArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Timeslot.
     * @param {timeslotUpdateArgs} args - Arguments to update one Timeslot.
     * @example
     * // Update one Timeslot
     * const timeslot = await prisma.timeslot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends timeslotUpdateArgs>(args: SelectSubset<T, timeslotUpdateArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Timeslots.
     * @param {timeslotDeleteManyArgs} args - Arguments to filter Timeslots to delete.
     * @example
     * // Delete a few Timeslots
     * const { count } = await prisma.timeslot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends timeslotDeleteManyArgs>(args?: SelectSubset<T, timeslotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Timeslots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Timeslots
     * const timeslot = await prisma.timeslot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends timeslotUpdateManyArgs>(args: SelectSubset<T, timeslotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Timeslots and returns the data updated in the database.
     * @param {timeslotUpdateManyAndReturnArgs} args - Arguments to update many Timeslots.
     * @example
     * // Update many Timeslots
     * const timeslot = await prisma.timeslot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Timeslots and only return the `TimeslotID`
     * const timeslotWithTimeslotIDOnly = await prisma.timeslot.updateManyAndReturn({
     *   select: { TimeslotID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends timeslotUpdateManyAndReturnArgs>(args: SelectSubset<T, timeslotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Timeslot.
     * @param {timeslotUpsertArgs} args - Arguments to update or create a Timeslot.
     * @example
     * // Update or create a Timeslot
     * const timeslot = await prisma.timeslot.upsert({
     *   create: {
     *     // ... data to create a Timeslot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Timeslot we want to update
     *   }
     * })
     */
    upsert<T extends timeslotUpsertArgs>(args: SelectSubset<T, timeslotUpsertArgs<ExtArgs>>): Prisma__timeslotClient<$Result.GetResult<Prisma.$timeslotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Timeslots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotCountArgs} args - Arguments to filter Timeslots to count.
     * @example
     * // Count the number of Timeslots
     * const count = await prisma.timeslot.count({
     *   where: {
     *     // ... the filter for the Timeslots we want to count
     *   }
     * })
    **/
    count<T extends timeslotCountArgs>(
      args?: Subset<T, timeslotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TimeslotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Timeslot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeslotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TimeslotAggregateArgs>(args: Subset<T, TimeslotAggregateArgs>): Prisma.PrismaPromise<GetTimeslotAggregateType<T>>

    /**
     * Group by Timeslot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {timeslotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends timeslotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: timeslotGroupByArgs['orderBy'] }
        : { orderBy?: timeslotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, timeslotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTimeslotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the timeslot model
   */
  readonly fields: timeslotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for timeslot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__timeslotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    class_schedule<T extends timeslot$class_scheduleArgs<ExtArgs> = {}>(args?: Subset<T, timeslot$class_scheduleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the timeslot model
   */
  interface timeslotFieldRefs {
    readonly TimeslotID: FieldRef<"timeslot", 'String'>
    readonly AcademicYear: FieldRef<"timeslot", 'Int'>
    readonly Semester: FieldRef<"timeslot", 'semester'>
    readonly StartTime: FieldRef<"timeslot", 'DateTime'>
    readonly EndTime: FieldRef<"timeslot", 'DateTime'>
    readonly Breaktime: FieldRef<"timeslot", 'breaktime'>
    readonly DayOfWeek: FieldRef<"timeslot", 'day_of_week'>
  }
    

  // Custom InputTypes
  /**
   * timeslot findUnique
   */
  export type timeslotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter, which timeslot to fetch.
     */
    where: timeslotWhereUniqueInput
  }

  /**
   * timeslot findUniqueOrThrow
   */
  export type timeslotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter, which timeslot to fetch.
     */
    where: timeslotWhereUniqueInput
  }

  /**
   * timeslot findFirst
   */
  export type timeslotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter, which timeslot to fetch.
     */
    where?: timeslotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of timeslots to fetch.
     */
    orderBy?: timeslotOrderByWithRelationInput | timeslotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for timeslots.
     */
    cursor?: timeslotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` timeslots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` timeslots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of timeslots.
     */
    distinct?: TimeslotScalarFieldEnum | TimeslotScalarFieldEnum[]
  }

  /**
   * timeslot findFirstOrThrow
   */
  export type timeslotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter, which timeslot to fetch.
     */
    where?: timeslotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of timeslots to fetch.
     */
    orderBy?: timeslotOrderByWithRelationInput | timeslotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for timeslots.
     */
    cursor?: timeslotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` timeslots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` timeslots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of timeslots.
     */
    distinct?: TimeslotScalarFieldEnum | TimeslotScalarFieldEnum[]
  }

  /**
   * timeslot findMany
   */
  export type timeslotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter, which timeslots to fetch.
     */
    where?: timeslotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of timeslots to fetch.
     */
    orderBy?: timeslotOrderByWithRelationInput | timeslotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing timeslots.
     */
    cursor?: timeslotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` timeslots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` timeslots.
     */
    skip?: number
    distinct?: TimeslotScalarFieldEnum | TimeslotScalarFieldEnum[]
  }

  /**
   * timeslot create
   */
  export type timeslotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * The data needed to create a timeslot.
     */
    data: XOR<timeslotCreateInput, timeslotUncheckedCreateInput>
  }

  /**
   * timeslot createMany
   */
  export type timeslotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many timeslots.
     */
    data: timeslotCreateManyInput | timeslotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * timeslot createManyAndReturn
   */
  export type timeslotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * The data used to create many timeslots.
     */
    data: timeslotCreateManyInput | timeslotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * timeslot update
   */
  export type timeslotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * The data needed to update a timeslot.
     */
    data: XOR<timeslotUpdateInput, timeslotUncheckedUpdateInput>
    /**
     * Choose, which timeslot to update.
     */
    where: timeslotWhereUniqueInput
  }

  /**
   * timeslot updateMany
   */
  export type timeslotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update timeslots.
     */
    data: XOR<timeslotUpdateManyMutationInput, timeslotUncheckedUpdateManyInput>
    /**
     * Filter which timeslots to update
     */
    where?: timeslotWhereInput
    /**
     * Limit how many timeslots to update.
     */
    limit?: number
  }

  /**
   * timeslot updateManyAndReturn
   */
  export type timeslotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * The data used to update timeslots.
     */
    data: XOR<timeslotUpdateManyMutationInput, timeslotUncheckedUpdateManyInput>
    /**
     * Filter which timeslots to update
     */
    where?: timeslotWhereInput
    /**
     * Limit how many timeslots to update.
     */
    limit?: number
  }

  /**
   * timeslot upsert
   */
  export type timeslotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * The filter to search for the timeslot to update in case it exists.
     */
    where: timeslotWhereUniqueInput
    /**
     * In case the timeslot found by the `where` argument doesn't exist, create a new timeslot with this data.
     */
    create: XOR<timeslotCreateInput, timeslotUncheckedCreateInput>
    /**
     * In case the timeslot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<timeslotUpdateInput, timeslotUncheckedUpdateInput>
  }

  /**
   * timeslot delete
   */
  export type timeslotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
    /**
     * Filter which timeslot to delete.
     */
    where: timeslotWhereUniqueInput
  }

  /**
   * timeslot deleteMany
   */
  export type timeslotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which timeslots to delete
     */
    where?: timeslotWhereInput
    /**
     * Limit how many timeslots to delete.
     */
    limit?: number
  }

  /**
   * timeslot.class_schedule
   */
  export type timeslot$class_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    cursor?: class_scheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * timeslot without action
   */
  export type timeslotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the timeslot
     */
    select?: timeslotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the timeslot
     */
    omit?: timeslotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: timeslotInclude<ExtArgs> | null
  }


  /**
   * Model teachers_responsibility
   */

  export type AggregateTeachers_responsibility = {
    _count: Teachers_responsibilityCountAggregateOutputType | null
    _avg: Teachers_responsibilityAvgAggregateOutputType | null
    _sum: Teachers_responsibilitySumAggregateOutputType | null
    _min: Teachers_responsibilityMinAggregateOutputType | null
    _max: Teachers_responsibilityMaxAggregateOutputType | null
  }

  export type Teachers_responsibilityAvgAggregateOutputType = {
    RespID: number | null
    TeacherID: number | null
    AcademicYear: number | null
    TeachHour: number | null
  }

  export type Teachers_responsibilitySumAggregateOutputType = {
    RespID: number | null
    TeacherID: number | null
    AcademicYear: number | null
    TeachHour: number | null
  }

  export type Teachers_responsibilityMinAggregateOutputType = {
    RespID: number | null
    TeacherID: number | null
    GradeID: string | null
    SubjectCode: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    TeachHour: number | null
  }

  export type Teachers_responsibilityMaxAggregateOutputType = {
    RespID: number | null
    TeacherID: number | null
    GradeID: string | null
    SubjectCode: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    TeachHour: number | null
  }

  export type Teachers_responsibilityCountAggregateOutputType = {
    RespID: number
    TeacherID: number
    GradeID: number
    SubjectCode: number
    AcademicYear: number
    Semester: number
    TeachHour: number
    _all: number
  }


  export type Teachers_responsibilityAvgAggregateInputType = {
    RespID?: true
    TeacherID?: true
    AcademicYear?: true
    TeachHour?: true
  }

  export type Teachers_responsibilitySumAggregateInputType = {
    RespID?: true
    TeacherID?: true
    AcademicYear?: true
    TeachHour?: true
  }

  export type Teachers_responsibilityMinAggregateInputType = {
    RespID?: true
    TeacherID?: true
    GradeID?: true
    SubjectCode?: true
    AcademicYear?: true
    Semester?: true
    TeachHour?: true
  }

  export type Teachers_responsibilityMaxAggregateInputType = {
    RespID?: true
    TeacherID?: true
    GradeID?: true
    SubjectCode?: true
    AcademicYear?: true
    Semester?: true
    TeachHour?: true
  }

  export type Teachers_responsibilityCountAggregateInputType = {
    RespID?: true
    TeacherID?: true
    GradeID?: true
    SubjectCode?: true
    AcademicYear?: true
    Semester?: true
    TeachHour?: true
    _all?: true
  }

  export type Teachers_responsibilityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teachers_responsibility to aggregate.
     */
    where?: teachers_responsibilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers_responsibilities to fetch.
     */
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: teachers_responsibilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers_responsibilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers_responsibilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned teachers_responsibilities
    **/
    _count?: true | Teachers_responsibilityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Teachers_responsibilityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Teachers_responsibilitySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Teachers_responsibilityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Teachers_responsibilityMaxAggregateInputType
  }

  export type GetTeachers_responsibilityAggregateType<T extends Teachers_responsibilityAggregateArgs> = {
        [P in keyof T & keyof AggregateTeachers_responsibility]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeachers_responsibility[P]>
      : GetScalarType<T[P], AggregateTeachers_responsibility[P]>
  }




  export type teachers_responsibilityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: teachers_responsibilityWhereInput
    orderBy?: teachers_responsibilityOrderByWithAggregationInput | teachers_responsibilityOrderByWithAggregationInput[]
    by: Teachers_responsibilityScalarFieldEnum[] | Teachers_responsibilityScalarFieldEnum
    having?: teachers_responsibilityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Teachers_responsibilityCountAggregateInputType | true
    _avg?: Teachers_responsibilityAvgAggregateInputType
    _sum?: Teachers_responsibilitySumAggregateInputType
    _min?: Teachers_responsibilityMinAggregateInputType
    _max?: Teachers_responsibilityMaxAggregateInputType
  }

  export type Teachers_responsibilityGroupByOutputType = {
    RespID: number
    TeacherID: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    _count: Teachers_responsibilityCountAggregateOutputType | null
    _avg: Teachers_responsibilityAvgAggregateOutputType | null
    _sum: Teachers_responsibilitySumAggregateOutputType | null
    _min: Teachers_responsibilityMinAggregateOutputType | null
    _max: Teachers_responsibilityMaxAggregateOutputType | null
  }

  type GetTeachers_responsibilityGroupByPayload<T extends teachers_responsibilityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Teachers_responsibilityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Teachers_responsibilityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Teachers_responsibilityGroupByOutputType[P]>
            : GetScalarType<T[P], Teachers_responsibilityGroupByOutputType[P]>
        }
      >
    >


  export type teachers_responsibilitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RespID?: boolean
    TeacherID?: boolean
    GradeID?: boolean
    SubjectCode?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    TeachHour?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
    class_schedule?: boolean | teachers_responsibility$class_scheduleArgs<ExtArgs>
    _count?: boolean | Teachers_responsibilityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teachers_responsibility"]>

  export type teachers_responsibilitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RespID?: boolean
    TeacherID?: boolean
    GradeID?: boolean
    SubjectCode?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    TeachHour?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teachers_responsibility"]>

  export type teachers_responsibilitySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    RespID?: boolean
    TeacherID?: boolean
    GradeID?: boolean
    SubjectCode?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    TeachHour?: boolean
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teachers_responsibility"]>

  export type teachers_responsibilitySelectScalar = {
    RespID?: boolean
    TeacherID?: boolean
    GradeID?: boolean
    SubjectCode?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    TeachHour?: boolean
  }

  export type teachers_responsibilityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"RespID" | "TeacherID" | "GradeID" | "SubjectCode" | "AcademicYear" | "Semester" | "TeachHour", ExtArgs["result"]["teachers_responsibility"]>
  export type teachers_responsibilityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
    class_schedule?: boolean | teachers_responsibility$class_scheduleArgs<ExtArgs>
    _count?: boolean | Teachers_responsibilityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type teachers_responsibilityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
  }
  export type teachers_responsibilityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gradelevel?: boolean | gradelevelDefaultArgs<ExtArgs>
    subject?: boolean | subjectDefaultArgs<ExtArgs>
    teacher?: boolean | teacherDefaultArgs<ExtArgs>
  }

  export type $teachers_responsibilityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "teachers_responsibility"
    objects: {
      gradelevel: Prisma.$gradelevelPayload<ExtArgs>
      subject: Prisma.$subjectPayload<ExtArgs>
      teacher: Prisma.$teacherPayload<ExtArgs>
      class_schedule: Prisma.$class_schedulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      RespID: number
      TeacherID: number
      GradeID: string
      SubjectCode: string
      AcademicYear: number
      Semester: $Enums.semester
      TeachHour: number
    }, ExtArgs["result"]["teachers_responsibility"]>
    composites: {}
  }

  type teachers_responsibilityGetPayload<S extends boolean | null | undefined | teachers_responsibilityDefaultArgs> = $Result.GetResult<Prisma.$teachers_responsibilityPayload, S>

  type teachers_responsibilityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<teachers_responsibilityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Teachers_responsibilityCountAggregateInputType | true
    }

  export interface teachers_responsibilityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['teachers_responsibility'], meta: { name: 'teachers_responsibility' } }
    /**
     * Find zero or one Teachers_responsibility that matches the filter.
     * @param {teachers_responsibilityFindUniqueArgs} args - Arguments to find a Teachers_responsibility
     * @example
     * // Get one Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends teachers_responsibilityFindUniqueArgs>(args: SelectSubset<T, teachers_responsibilityFindUniqueArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Teachers_responsibility that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {teachers_responsibilityFindUniqueOrThrowArgs} args - Arguments to find a Teachers_responsibility
     * @example
     * // Get one Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends teachers_responsibilityFindUniqueOrThrowArgs>(args: SelectSubset<T, teachers_responsibilityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Teachers_responsibility that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityFindFirstArgs} args - Arguments to find a Teachers_responsibility
     * @example
     * // Get one Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends teachers_responsibilityFindFirstArgs>(args?: SelectSubset<T, teachers_responsibilityFindFirstArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Teachers_responsibility that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityFindFirstOrThrowArgs} args - Arguments to find a Teachers_responsibility
     * @example
     * // Get one Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends teachers_responsibilityFindFirstOrThrowArgs>(args?: SelectSubset<T, teachers_responsibilityFindFirstOrThrowArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Teachers_responsibilities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teachers_responsibilities
     * const teachers_responsibilities = await prisma.teachers_responsibility.findMany()
     * 
     * // Get first 10 Teachers_responsibilities
     * const teachers_responsibilities = await prisma.teachers_responsibility.findMany({ take: 10 })
     * 
     * // Only select the `RespID`
     * const teachers_responsibilityWithRespIDOnly = await prisma.teachers_responsibility.findMany({ select: { RespID: true } })
     * 
     */
    findMany<T extends teachers_responsibilityFindManyArgs>(args?: SelectSubset<T, teachers_responsibilityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Teachers_responsibility.
     * @param {teachers_responsibilityCreateArgs} args - Arguments to create a Teachers_responsibility.
     * @example
     * // Create one Teachers_responsibility
     * const Teachers_responsibility = await prisma.teachers_responsibility.create({
     *   data: {
     *     // ... data to create a Teachers_responsibility
     *   }
     * })
     * 
     */
    create<T extends teachers_responsibilityCreateArgs>(args: SelectSubset<T, teachers_responsibilityCreateArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Teachers_responsibilities.
     * @param {teachers_responsibilityCreateManyArgs} args - Arguments to create many Teachers_responsibilities.
     * @example
     * // Create many Teachers_responsibilities
     * const teachers_responsibility = await prisma.teachers_responsibility.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends teachers_responsibilityCreateManyArgs>(args?: SelectSubset<T, teachers_responsibilityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teachers_responsibilities and returns the data saved in the database.
     * @param {teachers_responsibilityCreateManyAndReturnArgs} args - Arguments to create many Teachers_responsibilities.
     * @example
     * // Create many Teachers_responsibilities
     * const teachers_responsibility = await prisma.teachers_responsibility.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teachers_responsibilities and only return the `RespID`
     * const teachers_responsibilityWithRespIDOnly = await prisma.teachers_responsibility.createManyAndReturn({
     *   select: { RespID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends teachers_responsibilityCreateManyAndReturnArgs>(args?: SelectSubset<T, teachers_responsibilityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Teachers_responsibility.
     * @param {teachers_responsibilityDeleteArgs} args - Arguments to delete one Teachers_responsibility.
     * @example
     * // Delete one Teachers_responsibility
     * const Teachers_responsibility = await prisma.teachers_responsibility.delete({
     *   where: {
     *     // ... filter to delete one Teachers_responsibility
     *   }
     * })
     * 
     */
    delete<T extends teachers_responsibilityDeleteArgs>(args: SelectSubset<T, teachers_responsibilityDeleteArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Teachers_responsibility.
     * @param {teachers_responsibilityUpdateArgs} args - Arguments to update one Teachers_responsibility.
     * @example
     * // Update one Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends teachers_responsibilityUpdateArgs>(args: SelectSubset<T, teachers_responsibilityUpdateArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Teachers_responsibilities.
     * @param {teachers_responsibilityDeleteManyArgs} args - Arguments to filter Teachers_responsibilities to delete.
     * @example
     * // Delete a few Teachers_responsibilities
     * const { count } = await prisma.teachers_responsibility.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends teachers_responsibilityDeleteManyArgs>(args?: SelectSubset<T, teachers_responsibilityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teachers_responsibilities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teachers_responsibilities
     * const teachers_responsibility = await prisma.teachers_responsibility.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends teachers_responsibilityUpdateManyArgs>(args: SelectSubset<T, teachers_responsibilityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teachers_responsibilities and returns the data updated in the database.
     * @param {teachers_responsibilityUpdateManyAndReturnArgs} args - Arguments to update many Teachers_responsibilities.
     * @example
     * // Update many Teachers_responsibilities
     * const teachers_responsibility = await prisma.teachers_responsibility.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Teachers_responsibilities and only return the `RespID`
     * const teachers_responsibilityWithRespIDOnly = await prisma.teachers_responsibility.updateManyAndReturn({
     *   select: { RespID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends teachers_responsibilityUpdateManyAndReturnArgs>(args: SelectSubset<T, teachers_responsibilityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Teachers_responsibility.
     * @param {teachers_responsibilityUpsertArgs} args - Arguments to update or create a Teachers_responsibility.
     * @example
     * // Update or create a Teachers_responsibility
     * const teachers_responsibility = await prisma.teachers_responsibility.upsert({
     *   create: {
     *     // ... data to create a Teachers_responsibility
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Teachers_responsibility we want to update
     *   }
     * })
     */
    upsert<T extends teachers_responsibilityUpsertArgs>(args: SelectSubset<T, teachers_responsibilityUpsertArgs<ExtArgs>>): Prisma__teachers_responsibilityClient<$Result.GetResult<Prisma.$teachers_responsibilityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Teachers_responsibilities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityCountArgs} args - Arguments to filter Teachers_responsibilities to count.
     * @example
     * // Count the number of Teachers_responsibilities
     * const count = await prisma.teachers_responsibility.count({
     *   where: {
     *     // ... the filter for the Teachers_responsibilities we want to count
     *   }
     * })
    **/
    count<T extends teachers_responsibilityCountArgs>(
      args?: Subset<T, teachers_responsibilityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Teachers_responsibilityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Teachers_responsibility.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Teachers_responsibilityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Teachers_responsibilityAggregateArgs>(args: Subset<T, Teachers_responsibilityAggregateArgs>): Prisma.PrismaPromise<GetTeachers_responsibilityAggregateType<T>>

    /**
     * Group by Teachers_responsibility.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {teachers_responsibilityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends teachers_responsibilityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: teachers_responsibilityGroupByArgs['orderBy'] }
        : { orderBy?: teachers_responsibilityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, teachers_responsibilityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeachers_responsibilityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the teachers_responsibility model
   */
  readonly fields: teachers_responsibilityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for teachers_responsibility.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__teachers_responsibilityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gradelevel<T extends gradelevelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, gradelevelDefaultArgs<ExtArgs>>): Prisma__gradelevelClient<$Result.GetResult<Prisma.$gradelevelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    subject<T extends subjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, subjectDefaultArgs<ExtArgs>>): Prisma__subjectClient<$Result.GetResult<Prisma.$subjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    teacher<T extends teacherDefaultArgs<ExtArgs> = {}>(args?: Subset<T, teacherDefaultArgs<ExtArgs>>): Prisma__teacherClient<$Result.GetResult<Prisma.$teacherPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    class_schedule<T extends teachers_responsibility$class_scheduleArgs<ExtArgs> = {}>(args?: Subset<T, teachers_responsibility$class_scheduleArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$class_schedulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the teachers_responsibility model
   */
  interface teachers_responsibilityFieldRefs {
    readonly RespID: FieldRef<"teachers_responsibility", 'Int'>
    readonly TeacherID: FieldRef<"teachers_responsibility", 'Int'>
    readonly GradeID: FieldRef<"teachers_responsibility", 'String'>
    readonly SubjectCode: FieldRef<"teachers_responsibility", 'String'>
    readonly AcademicYear: FieldRef<"teachers_responsibility", 'Int'>
    readonly Semester: FieldRef<"teachers_responsibility", 'semester'>
    readonly TeachHour: FieldRef<"teachers_responsibility", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * teachers_responsibility findUnique
   */
  export type teachers_responsibilityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter, which teachers_responsibility to fetch.
     */
    where: teachers_responsibilityWhereUniqueInput
  }

  /**
   * teachers_responsibility findUniqueOrThrow
   */
  export type teachers_responsibilityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter, which teachers_responsibility to fetch.
     */
    where: teachers_responsibilityWhereUniqueInput
  }

  /**
   * teachers_responsibility findFirst
   */
  export type teachers_responsibilityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter, which teachers_responsibility to fetch.
     */
    where?: teachers_responsibilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers_responsibilities to fetch.
     */
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teachers_responsibilities.
     */
    cursor?: teachers_responsibilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers_responsibilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers_responsibilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teachers_responsibilities.
     */
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * teachers_responsibility findFirstOrThrow
   */
  export type teachers_responsibilityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter, which teachers_responsibility to fetch.
     */
    where?: teachers_responsibilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers_responsibilities to fetch.
     */
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for teachers_responsibilities.
     */
    cursor?: teachers_responsibilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers_responsibilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers_responsibilities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of teachers_responsibilities.
     */
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * teachers_responsibility findMany
   */
  export type teachers_responsibilityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter, which teachers_responsibilities to fetch.
     */
    where?: teachers_responsibilityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of teachers_responsibilities to fetch.
     */
    orderBy?: teachers_responsibilityOrderByWithRelationInput | teachers_responsibilityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing teachers_responsibilities.
     */
    cursor?: teachers_responsibilityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` teachers_responsibilities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` teachers_responsibilities.
     */
    skip?: number
    distinct?: Teachers_responsibilityScalarFieldEnum | Teachers_responsibilityScalarFieldEnum[]
  }

  /**
   * teachers_responsibility create
   */
  export type teachers_responsibilityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * The data needed to create a teachers_responsibility.
     */
    data: XOR<teachers_responsibilityCreateInput, teachers_responsibilityUncheckedCreateInput>
  }

  /**
   * teachers_responsibility createMany
   */
  export type teachers_responsibilityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many teachers_responsibilities.
     */
    data: teachers_responsibilityCreateManyInput | teachers_responsibilityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * teachers_responsibility createManyAndReturn
   */
  export type teachers_responsibilityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * The data used to create many teachers_responsibilities.
     */
    data: teachers_responsibilityCreateManyInput | teachers_responsibilityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * teachers_responsibility update
   */
  export type teachers_responsibilityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * The data needed to update a teachers_responsibility.
     */
    data: XOR<teachers_responsibilityUpdateInput, teachers_responsibilityUncheckedUpdateInput>
    /**
     * Choose, which teachers_responsibility to update.
     */
    where: teachers_responsibilityWhereUniqueInput
  }

  /**
   * teachers_responsibility updateMany
   */
  export type teachers_responsibilityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update teachers_responsibilities.
     */
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyInput>
    /**
     * Filter which teachers_responsibilities to update
     */
    where?: teachers_responsibilityWhereInput
    /**
     * Limit how many teachers_responsibilities to update.
     */
    limit?: number
  }

  /**
   * teachers_responsibility updateManyAndReturn
   */
  export type teachers_responsibilityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * The data used to update teachers_responsibilities.
     */
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyInput>
    /**
     * Filter which teachers_responsibilities to update
     */
    where?: teachers_responsibilityWhereInput
    /**
     * Limit how many teachers_responsibilities to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * teachers_responsibility upsert
   */
  export type teachers_responsibilityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * The filter to search for the teachers_responsibility to update in case it exists.
     */
    where: teachers_responsibilityWhereUniqueInput
    /**
     * In case the teachers_responsibility found by the `where` argument doesn't exist, create a new teachers_responsibility with this data.
     */
    create: XOR<teachers_responsibilityCreateInput, teachers_responsibilityUncheckedCreateInput>
    /**
     * In case the teachers_responsibility was found with the provided `where` argument, update it with this data.
     */
    update: XOR<teachers_responsibilityUpdateInput, teachers_responsibilityUncheckedUpdateInput>
  }

  /**
   * teachers_responsibility delete
   */
  export type teachers_responsibilityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
    /**
     * Filter which teachers_responsibility to delete.
     */
    where: teachers_responsibilityWhereUniqueInput
  }

  /**
   * teachers_responsibility deleteMany
   */
  export type teachers_responsibilityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which teachers_responsibilities to delete
     */
    where?: teachers_responsibilityWhereInput
    /**
     * Limit how many teachers_responsibilities to delete.
     */
    limit?: number
  }

  /**
   * teachers_responsibility.class_schedule
   */
  export type teachers_responsibility$class_scheduleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the class_schedule
     */
    select?: class_scheduleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the class_schedule
     */
    omit?: class_scheduleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: class_scheduleInclude<ExtArgs> | null
    where?: class_scheduleWhereInput
    orderBy?: class_scheduleOrderByWithRelationInput | class_scheduleOrderByWithRelationInput[]
    cursor?: class_scheduleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Class_scheduleScalarFieldEnum | Class_scheduleScalarFieldEnum[]
  }

  /**
   * teachers_responsibility without action
   */
  export type teachers_responsibilityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the teachers_responsibility
     */
    select?: teachers_responsibilitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the teachers_responsibility
     */
    omit?: teachers_responsibilityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: teachers_responsibilityInclude<ExtArgs> | null
  }


  /**
   * Model table_config
   */

  export type AggregateTable_config = {
    _count: Table_configCountAggregateOutputType | null
    _avg: Table_configAvgAggregateOutputType | null
    _sum: Table_configSumAggregateOutputType | null
    _min: Table_configMinAggregateOutputType | null
    _max: Table_configMaxAggregateOutputType | null
  }

  export type Table_configAvgAggregateOutputType = {
    AcademicYear: number | null
    configCompleteness: number | null
  }

  export type Table_configSumAggregateOutputType = {
    AcademicYear: number | null
    configCompleteness: number | null
  }

  export type Table_configMinAggregateOutputType = {
    ConfigID: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    status: $Enums.SemesterStatus | null
    publishedAt: Date | null
    isPinned: boolean | null
    lastAccessedAt: Date | null
    configCompleteness: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Table_configMaxAggregateOutputType = {
    ConfigID: string | null
    AcademicYear: number | null
    Semester: $Enums.semester | null
    status: $Enums.SemesterStatus | null
    publishedAt: Date | null
    isPinned: boolean | null
    lastAccessedAt: Date | null
    configCompleteness: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Table_configCountAggregateOutputType = {
    ConfigID: number
    AcademicYear: number
    Semester: number
    Config: number
    status: number
    publishedAt: number
    isPinned: number
    lastAccessedAt: number
    configCompleteness: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Table_configAvgAggregateInputType = {
    AcademicYear?: true
    configCompleteness?: true
  }

  export type Table_configSumAggregateInputType = {
    AcademicYear?: true
    configCompleteness?: true
  }

  export type Table_configMinAggregateInputType = {
    ConfigID?: true
    AcademicYear?: true
    Semester?: true
    status?: true
    publishedAt?: true
    isPinned?: true
    lastAccessedAt?: true
    configCompleteness?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Table_configMaxAggregateInputType = {
    ConfigID?: true
    AcademicYear?: true
    Semester?: true
    status?: true
    publishedAt?: true
    isPinned?: true
    lastAccessedAt?: true
    configCompleteness?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Table_configCountAggregateInputType = {
    ConfigID?: true
    AcademicYear?: true
    Semester?: true
    Config?: true
    status?: true
    publishedAt?: true
    isPinned?: true
    lastAccessedAt?: true
    configCompleteness?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Table_configAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which table_config to aggregate.
     */
    where?: table_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of table_configs to fetch.
     */
    orderBy?: table_configOrderByWithRelationInput | table_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: table_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` table_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` table_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned table_configs
    **/
    _count?: true | Table_configCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Table_configAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Table_configSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Table_configMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Table_configMaxAggregateInputType
  }

  export type GetTable_configAggregateType<T extends Table_configAggregateArgs> = {
        [P in keyof T & keyof AggregateTable_config]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTable_config[P]>
      : GetScalarType<T[P], AggregateTable_config[P]>
  }




  export type table_configGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: table_configWhereInput
    orderBy?: table_configOrderByWithAggregationInput | table_configOrderByWithAggregationInput[]
    by: Table_configScalarFieldEnum[] | Table_configScalarFieldEnum
    having?: table_configScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Table_configCountAggregateInputType | true
    _avg?: Table_configAvgAggregateInputType
    _sum?: Table_configSumAggregateInputType
    _min?: Table_configMinAggregateInputType
    _max?: Table_configMaxAggregateInputType
  }

  export type Table_configGroupByOutputType = {
    ConfigID: string
    AcademicYear: number
    Semester: $Enums.semester
    Config: JsonValue
    status: $Enums.SemesterStatus
    publishedAt: Date | null
    isPinned: boolean
    lastAccessedAt: Date
    configCompleteness: number
    createdAt: Date
    updatedAt: Date
    _count: Table_configCountAggregateOutputType | null
    _avg: Table_configAvgAggregateOutputType | null
    _sum: Table_configSumAggregateOutputType | null
    _min: Table_configMinAggregateOutputType | null
    _max: Table_configMaxAggregateOutputType | null
  }

  type GetTable_configGroupByPayload<T extends table_configGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Table_configGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Table_configGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Table_configGroupByOutputType[P]>
            : GetScalarType<T[P], Table_configGroupByOutputType[P]>
        }
      >
    >


  export type table_configSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ConfigID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    Config?: boolean
    status?: boolean
    publishedAt?: boolean
    isPinned?: boolean
    lastAccessedAt?: boolean
    configCompleteness?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["table_config"]>

  export type table_configSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ConfigID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    Config?: boolean
    status?: boolean
    publishedAt?: boolean
    isPinned?: boolean
    lastAccessedAt?: boolean
    configCompleteness?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["table_config"]>

  export type table_configSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ConfigID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    Config?: boolean
    status?: boolean
    publishedAt?: boolean
    isPinned?: boolean
    lastAccessedAt?: boolean
    configCompleteness?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["table_config"]>

  export type table_configSelectScalar = {
    ConfigID?: boolean
    AcademicYear?: boolean
    Semester?: boolean
    Config?: boolean
    status?: boolean
    publishedAt?: boolean
    isPinned?: boolean
    lastAccessedAt?: boolean
    configCompleteness?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type table_configOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ConfigID" | "AcademicYear" | "Semester" | "Config" | "status" | "publishedAt" | "isPinned" | "lastAccessedAt" | "configCompleteness" | "createdAt" | "updatedAt", ExtArgs["result"]["table_config"]>

  export type $table_configPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "table_config"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      ConfigID: string
      AcademicYear: number
      Semester: $Enums.semester
      Config: Prisma.JsonValue
      status: $Enums.SemesterStatus
      publishedAt: Date | null
      isPinned: boolean
      lastAccessedAt: Date
      configCompleteness: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["table_config"]>
    composites: {}
  }

  type table_configGetPayload<S extends boolean | null | undefined | table_configDefaultArgs> = $Result.GetResult<Prisma.$table_configPayload, S>

  type table_configCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<table_configFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Table_configCountAggregateInputType | true
    }

  export interface table_configDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['table_config'], meta: { name: 'table_config' } }
    /**
     * Find zero or one Table_config that matches the filter.
     * @param {table_configFindUniqueArgs} args - Arguments to find a Table_config
     * @example
     * // Get one Table_config
     * const table_config = await prisma.table_config.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends table_configFindUniqueArgs>(args: SelectSubset<T, table_configFindUniqueArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Table_config that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {table_configFindUniqueOrThrowArgs} args - Arguments to find a Table_config
     * @example
     * // Get one Table_config
     * const table_config = await prisma.table_config.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends table_configFindUniqueOrThrowArgs>(args: SelectSubset<T, table_configFindUniqueOrThrowArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Table_config that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configFindFirstArgs} args - Arguments to find a Table_config
     * @example
     * // Get one Table_config
     * const table_config = await prisma.table_config.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends table_configFindFirstArgs>(args?: SelectSubset<T, table_configFindFirstArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Table_config that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configFindFirstOrThrowArgs} args - Arguments to find a Table_config
     * @example
     * // Get one Table_config
     * const table_config = await prisma.table_config.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends table_configFindFirstOrThrowArgs>(args?: SelectSubset<T, table_configFindFirstOrThrowArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Table_configs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Table_configs
     * const table_configs = await prisma.table_config.findMany()
     * 
     * // Get first 10 Table_configs
     * const table_configs = await prisma.table_config.findMany({ take: 10 })
     * 
     * // Only select the `ConfigID`
     * const table_configWithConfigIDOnly = await prisma.table_config.findMany({ select: { ConfigID: true } })
     * 
     */
    findMany<T extends table_configFindManyArgs>(args?: SelectSubset<T, table_configFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Table_config.
     * @param {table_configCreateArgs} args - Arguments to create a Table_config.
     * @example
     * // Create one Table_config
     * const Table_config = await prisma.table_config.create({
     *   data: {
     *     // ... data to create a Table_config
     *   }
     * })
     * 
     */
    create<T extends table_configCreateArgs>(args: SelectSubset<T, table_configCreateArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Table_configs.
     * @param {table_configCreateManyArgs} args - Arguments to create many Table_configs.
     * @example
     * // Create many Table_configs
     * const table_config = await prisma.table_config.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends table_configCreateManyArgs>(args?: SelectSubset<T, table_configCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Table_configs and returns the data saved in the database.
     * @param {table_configCreateManyAndReturnArgs} args - Arguments to create many Table_configs.
     * @example
     * // Create many Table_configs
     * const table_config = await prisma.table_config.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Table_configs and only return the `ConfigID`
     * const table_configWithConfigIDOnly = await prisma.table_config.createManyAndReturn({
     *   select: { ConfigID: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends table_configCreateManyAndReturnArgs>(args?: SelectSubset<T, table_configCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Table_config.
     * @param {table_configDeleteArgs} args - Arguments to delete one Table_config.
     * @example
     * // Delete one Table_config
     * const Table_config = await prisma.table_config.delete({
     *   where: {
     *     // ... filter to delete one Table_config
     *   }
     * })
     * 
     */
    delete<T extends table_configDeleteArgs>(args: SelectSubset<T, table_configDeleteArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Table_config.
     * @param {table_configUpdateArgs} args - Arguments to update one Table_config.
     * @example
     * // Update one Table_config
     * const table_config = await prisma.table_config.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends table_configUpdateArgs>(args: SelectSubset<T, table_configUpdateArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Table_configs.
     * @param {table_configDeleteManyArgs} args - Arguments to filter Table_configs to delete.
     * @example
     * // Delete a few Table_configs
     * const { count } = await prisma.table_config.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends table_configDeleteManyArgs>(args?: SelectSubset<T, table_configDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Table_configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Table_configs
     * const table_config = await prisma.table_config.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends table_configUpdateManyArgs>(args: SelectSubset<T, table_configUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Table_configs and returns the data updated in the database.
     * @param {table_configUpdateManyAndReturnArgs} args - Arguments to update many Table_configs.
     * @example
     * // Update many Table_configs
     * const table_config = await prisma.table_config.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Table_configs and only return the `ConfigID`
     * const table_configWithConfigIDOnly = await prisma.table_config.updateManyAndReturn({
     *   select: { ConfigID: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends table_configUpdateManyAndReturnArgs>(args: SelectSubset<T, table_configUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Table_config.
     * @param {table_configUpsertArgs} args - Arguments to update or create a Table_config.
     * @example
     * // Update or create a Table_config
     * const table_config = await prisma.table_config.upsert({
     *   create: {
     *     // ... data to create a Table_config
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Table_config we want to update
     *   }
     * })
     */
    upsert<T extends table_configUpsertArgs>(args: SelectSubset<T, table_configUpsertArgs<ExtArgs>>): Prisma__table_configClient<$Result.GetResult<Prisma.$table_configPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Table_configs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configCountArgs} args - Arguments to filter Table_configs to count.
     * @example
     * // Count the number of Table_configs
     * const count = await prisma.table_config.count({
     *   where: {
     *     // ... the filter for the Table_configs we want to count
     *   }
     * })
    **/
    count<T extends table_configCountArgs>(
      args?: Subset<T, table_configCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Table_configCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Table_config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Table_configAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Table_configAggregateArgs>(args: Subset<T, Table_configAggregateArgs>): Prisma.PrismaPromise<GetTable_configAggregateType<T>>

    /**
     * Group by Table_config.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {table_configGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends table_configGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: table_configGroupByArgs['orderBy'] }
        : { orderBy?: table_configGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, table_configGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTable_configGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the table_config model
   */
  readonly fields: table_configFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for table_config.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__table_configClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the table_config model
   */
  interface table_configFieldRefs {
    readonly ConfigID: FieldRef<"table_config", 'String'>
    readonly AcademicYear: FieldRef<"table_config", 'Int'>
    readonly Semester: FieldRef<"table_config", 'semester'>
    readonly Config: FieldRef<"table_config", 'Json'>
    readonly status: FieldRef<"table_config", 'SemesterStatus'>
    readonly publishedAt: FieldRef<"table_config", 'DateTime'>
    readonly isPinned: FieldRef<"table_config", 'Boolean'>
    readonly lastAccessedAt: FieldRef<"table_config", 'DateTime'>
    readonly configCompleteness: FieldRef<"table_config", 'Int'>
    readonly createdAt: FieldRef<"table_config", 'DateTime'>
    readonly updatedAt: FieldRef<"table_config", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * table_config findUnique
   */
  export type table_configFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter, which table_config to fetch.
     */
    where: table_configWhereUniqueInput
  }

  /**
   * table_config findUniqueOrThrow
   */
  export type table_configFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter, which table_config to fetch.
     */
    where: table_configWhereUniqueInput
  }

  /**
   * table_config findFirst
   */
  export type table_configFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter, which table_config to fetch.
     */
    where?: table_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of table_configs to fetch.
     */
    orderBy?: table_configOrderByWithRelationInput | table_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for table_configs.
     */
    cursor?: table_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` table_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` table_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of table_configs.
     */
    distinct?: Table_configScalarFieldEnum | Table_configScalarFieldEnum[]
  }

  /**
   * table_config findFirstOrThrow
   */
  export type table_configFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter, which table_config to fetch.
     */
    where?: table_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of table_configs to fetch.
     */
    orderBy?: table_configOrderByWithRelationInput | table_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for table_configs.
     */
    cursor?: table_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` table_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` table_configs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of table_configs.
     */
    distinct?: Table_configScalarFieldEnum | Table_configScalarFieldEnum[]
  }

  /**
   * table_config findMany
   */
  export type table_configFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter, which table_configs to fetch.
     */
    where?: table_configWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of table_configs to fetch.
     */
    orderBy?: table_configOrderByWithRelationInput | table_configOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing table_configs.
     */
    cursor?: table_configWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` table_configs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` table_configs.
     */
    skip?: number
    distinct?: Table_configScalarFieldEnum | Table_configScalarFieldEnum[]
  }

  /**
   * table_config create
   */
  export type table_configCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * The data needed to create a table_config.
     */
    data: XOR<table_configCreateInput, table_configUncheckedCreateInput>
  }

  /**
   * table_config createMany
   */
  export type table_configCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many table_configs.
     */
    data: table_configCreateManyInput | table_configCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * table_config createManyAndReturn
   */
  export type table_configCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * The data used to create many table_configs.
     */
    data: table_configCreateManyInput | table_configCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * table_config update
   */
  export type table_configUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * The data needed to update a table_config.
     */
    data: XOR<table_configUpdateInput, table_configUncheckedUpdateInput>
    /**
     * Choose, which table_config to update.
     */
    where: table_configWhereUniqueInput
  }

  /**
   * table_config updateMany
   */
  export type table_configUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update table_configs.
     */
    data: XOR<table_configUpdateManyMutationInput, table_configUncheckedUpdateManyInput>
    /**
     * Filter which table_configs to update
     */
    where?: table_configWhereInput
    /**
     * Limit how many table_configs to update.
     */
    limit?: number
  }

  /**
   * table_config updateManyAndReturn
   */
  export type table_configUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * The data used to update table_configs.
     */
    data: XOR<table_configUpdateManyMutationInput, table_configUncheckedUpdateManyInput>
    /**
     * Filter which table_configs to update
     */
    where?: table_configWhereInput
    /**
     * Limit how many table_configs to update.
     */
    limit?: number
  }

  /**
   * table_config upsert
   */
  export type table_configUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * The filter to search for the table_config to update in case it exists.
     */
    where: table_configWhereUniqueInput
    /**
     * In case the table_config found by the `where` argument doesn't exist, create a new table_config with this data.
     */
    create: XOR<table_configCreateInput, table_configUncheckedCreateInput>
    /**
     * In case the table_config was found with the provided `where` argument, update it with this data.
     */
    update: XOR<table_configUpdateInput, table_configUncheckedUpdateInput>
  }

  /**
   * table_config delete
   */
  export type table_configDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
    /**
     * Filter which table_config to delete.
     */
    where: table_configWhereUniqueInput
  }

  /**
   * table_config deleteMany
   */
  export type table_configDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which table_configs to delete
     */
    where?: table_configWhereInput
    /**
     * Limit how many table_configs to delete.
     */
    limit?: number
  }

  /**
   * table_config without action
   */
  export type table_configDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the table_config
     */
    select?: table_configSelect<ExtArgs> | null
    /**
     * Omit specific fields from the table_config
     */
    omit?: table_configOmit<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    password: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    password: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    password: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string | null
    email: string
    emailVerified: Date | null
    image: string | null
    password: string | null
    role: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "password" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      accounts: Prisma.$AccountPayload<ExtArgs>[]
      sessions: Prisma.$SessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string
      emailVerified: Date | null
      image: string | null
      password: string | null
      role: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly emailVerified: FieldRef<"User", 'DateTime'>
    readonly image: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.accounts
   */
  export type User$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountAvgAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountSumAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountMinAggregateOutputType = {
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AccountMaxAggregateOutputType = {
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AccountCountAggregateOutputType = {
    userId: number
    type: number
    provider: number
    providerAccountId: number
    refresh_token: number
    access_token: number
    expires_at: number
    token_type: number
    scope: number
    id_token: number
    session_state: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AccountAvgAggregateInputType = {
    expires_at?: true
  }

  export type AccountSumAggregateInputType = {
    expires_at?: true
  }

  export type AccountMinAggregateInputType = {
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AccountMaxAggregateInputType = {
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AccountCountAggregateInputType = {
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _avg?: AccountAvgAggregateInputType
    _sum?: AccountSumAggregateInputType
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    createdAt: Date
    updatedAt: Date
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "type" | "provider" | "providerAccountId" | "refresh_token" | "access_token" | "expires_at" | "token_type" | "scope" | "id_token" | "session_state" | "createdAt" | "updatedAt", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      userId: string
      type: string
      provider: string
      providerAccountId: string
      refresh_token: string | null
      access_token: string | null
      expires_at: number | null
      token_type: string | null
      scope: string | null
      id_token: string | null
      session_state: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const accountWithUserIdOnly = await prisma.account.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `userId`
     * const accountWithUserIdOnly = await prisma.account.createManyAndReturn({
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `userId`
     * const accountWithUserIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { userId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly userId: FieldRef<"Account", 'String'>
    readonly type: FieldRef<"Account", 'String'>
    readonly provider: FieldRef<"Account", 'String'>
    readonly providerAccountId: FieldRef<"Account", 'String'>
    readonly refresh_token: FieldRef<"Account", 'String'>
    readonly access_token: FieldRef<"Account", 'String'>
    readonly expires_at: FieldRef<"Account", 'Int'>
    readonly token_type: FieldRef<"Account", 'String'>
    readonly scope: FieldRef<"Account", 'String'>
    readonly id_token: FieldRef<"Account", 'String'>
    readonly session_state: FieldRef<"Account", 'String'>
    readonly createdAt: FieldRef<"Account", 'DateTime'>
    readonly updatedAt: FieldRef<"Account", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    sessionToken: string | null
    userId: string | null
    expires: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    sessionToken: string | null
    userId: string | null
    expires: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionCountAggregateOutputType = {
    sessionToken: number
    userId: number
    expires: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    sessionToken?: true
    userId?: true
    expires?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionMaxAggregateInputType = {
    sessionToken?: true
    userId?: true
    expires?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionCountAggregateInputType = {
    sessionToken?: true
    userId?: true
    expires?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    sessionToken: string
    userId: string
    expires: Date
    createdAt: Date
    updatedAt: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"sessionToken" | "userId" | "expires" | "createdAt" | "updatedAt", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      sessionToken: string
      userId: string
      expires: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `sessionToken`
     * const sessionWithSessionTokenOnly = await prisma.session.findMany({ select: { sessionToken: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `sessionToken`
     * const sessionWithSessionTokenOnly = await prisma.session.createManyAndReturn({
     *   select: { sessionToken: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `sessionToken`
     * const sessionWithSessionTokenOnly = await prisma.session.updateManyAndReturn({
     *   select: { sessionToken: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly sessionToken: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expires: FieldRef<"Session", 'DateTime'>
    readonly createdAt: FieldRef<"Session", 'DateTime'>
    readonly updatedAt: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model VerificationToken
   */

  export type AggregateVerificationToken = {
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  export type VerificationTokenMinAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenMaxAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenCountAggregateOutputType = {
    identifier: number
    token: number
    expires: number
    _all: number
  }


  export type VerificationTokenMinAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenMaxAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenCountAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
    _all?: true
  }

  export type VerificationTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationToken to aggregate.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VerificationTokens
    **/
    _count?: true | VerificationTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type GetVerificationTokenAggregateType<T extends VerificationTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateVerificationToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerificationToken[P]>
      : GetScalarType<T[P], AggregateVerificationToken[P]>
  }




  export type VerificationTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationTokenWhereInput
    orderBy?: VerificationTokenOrderByWithAggregationInput | VerificationTokenOrderByWithAggregationInput[]
    by: VerificationTokenScalarFieldEnum[] | VerificationTokenScalarFieldEnum
    having?: VerificationTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationTokenCountAggregateInputType | true
    _min?: VerificationTokenMinAggregateInputType
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type VerificationTokenGroupByOutputType = {
    identifier: string
    token: string
    expires: Date
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  type GetVerificationTokenGroupByPayload<T extends VerificationTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
        }
      >
    >


  export type VerificationTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectScalar = {
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }

  export type VerificationTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"identifier" | "token" | "expires", ExtArgs["result"]["verificationToken"]>

  export type $VerificationTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VerificationToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      identifier: string
      token: string
      expires: Date
    }, ExtArgs["result"]["verificationToken"]>
    composites: {}
  }

  type VerificationTokenGetPayload<S extends boolean | null | undefined | VerificationTokenDefaultArgs> = $Result.GetResult<Prisma.$VerificationTokenPayload, S>

  type VerificationTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationTokenCountAggregateInputType | true
    }

  export interface VerificationTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VerificationToken'], meta: { name: 'VerificationToken' } }
    /**
     * Find zero or one VerificationToken that matches the filter.
     * @param {VerificationTokenFindUniqueArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationTokenFindUniqueArgs>(args: SelectSubset<T, VerificationTokenFindUniqueArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VerificationToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationTokenFindUniqueOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationTokenFindFirstArgs>(args?: SelectSubset<T, VerificationTokenFindFirstArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VerificationTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany()
     * 
     * // Get first 10 VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany({ take: 10 })
     * 
     * // Only select the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.findMany({ select: { identifier: true } })
     * 
     */
    findMany<T extends VerificationTokenFindManyArgs>(args?: SelectSubset<T, VerificationTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VerificationToken.
     * @param {VerificationTokenCreateArgs} args - Arguments to create a VerificationToken.
     * @example
     * // Create one VerificationToken
     * const VerificationToken = await prisma.verificationToken.create({
     *   data: {
     *     // ... data to create a VerificationToken
     *   }
     * })
     * 
     */
    create<T extends VerificationTokenCreateArgs>(args: SelectSubset<T, VerificationTokenCreateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VerificationTokens.
     * @param {VerificationTokenCreateManyArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationTokenCreateManyArgs>(args?: SelectSubset<T, VerificationTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VerificationTokens and returns the data saved in the database.
     * @param {VerificationTokenCreateManyAndReturnArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.createManyAndReturn({
     *   select: { identifier: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VerificationToken.
     * @param {VerificationTokenDeleteArgs} args - Arguments to delete one VerificationToken.
     * @example
     * // Delete one VerificationToken
     * const VerificationToken = await prisma.verificationToken.delete({
     *   where: {
     *     // ... filter to delete one VerificationToken
     *   }
     * })
     * 
     */
    delete<T extends VerificationTokenDeleteArgs>(args: SelectSubset<T, VerificationTokenDeleteArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VerificationToken.
     * @param {VerificationTokenUpdateArgs} args - Arguments to update one VerificationToken.
     * @example
     * // Update one VerificationToken
     * const verificationToken = await prisma.verificationToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationTokenUpdateArgs>(args: SelectSubset<T, VerificationTokenUpdateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VerificationTokens.
     * @param {VerificationTokenDeleteManyArgs} args - Arguments to filter VerificationTokens to delete.
     * @example
     * // Delete a few VerificationTokens
     * const { count } = await prisma.verificationToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationTokenDeleteManyArgs>(args?: SelectSubset<T, VerificationTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationTokenUpdateManyArgs>(args: SelectSubset<T, VerificationTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens and returns the data updated in the database.
     * @param {VerificationTokenUpdateManyAndReturnArgs} args - Arguments to update many VerificationTokens.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.updateManyAndReturn({
     *   select: { identifier: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VerificationToken.
     * @param {VerificationTokenUpsertArgs} args - Arguments to update or create a VerificationToken.
     * @example
     * // Update or create a VerificationToken
     * const verificationToken = await prisma.verificationToken.upsert({
     *   create: {
     *     // ... data to create a VerificationToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationToken we want to update
     *   }
     * })
     */
    upsert<T extends VerificationTokenUpsertArgs>(args: SelectSubset<T, VerificationTokenUpsertArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenCountArgs} args - Arguments to filter VerificationTokens to count.
     * @example
     * // Count the number of VerificationTokens
     * const count = await prisma.verificationToken.count({
     *   where: {
     *     // ... the filter for the VerificationTokens we want to count
     *   }
     * })
    **/
    count<T extends VerificationTokenCountArgs>(
      args?: Subset<T, VerificationTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationTokenAggregateArgs>(args: Subset<T, VerificationTokenAggregateArgs>): Prisma.PrismaPromise<GetVerificationTokenAggregateType<T>>

    /**
     * Group by VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationTokenGroupByArgs['orderBy'] }
        : { orderBy?: VerificationTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VerificationToken model
   */
  readonly fields: VerificationTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VerificationToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VerificationToken model
   */
  interface VerificationTokenFieldRefs {
    readonly identifier: FieldRef<"VerificationToken", 'String'>
    readonly token: FieldRef<"VerificationToken", 'String'>
    readonly expires: FieldRef<"VerificationToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VerificationToken findUnique
   */
  export type VerificationTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findUniqueOrThrow
   */
  export type VerificationTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findFirst
   */
  export type VerificationTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findFirstOrThrow
   */
  export type VerificationTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findMany
   */
  export type VerificationTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationTokens to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken create
   */
  export type VerificationTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to create a VerificationToken.
     */
    data: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
  }

  /**
   * VerificationToken createMany
   */
  export type VerificationTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken createManyAndReturn
   */
  export type VerificationTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken update
   */
  export type VerificationTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to update a VerificationToken.
     */
    data: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
    /**
     * Choose, which VerificationToken to update.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken updateMany
   */
  export type VerificationTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken updateManyAndReturn
   */
  export type VerificationTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken upsert
   */
  export type VerificationTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The filter to search for the VerificationToken to update in case it exists.
     */
    where: VerificationTokenWhereUniqueInput
    /**
     * In case the VerificationToken found by the `where` argument doesn't exist, create a new VerificationToken with this data.
     */
    create: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
    /**
     * In case the VerificationToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
  }

  /**
   * VerificationToken delete
   */
  export type VerificationTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter which VerificationToken to delete.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken deleteMany
   */
  export type VerificationTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationTokens to delete
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to delete.
     */
    limit?: number
  }

  /**
   * VerificationToken without action
   */
  export type VerificationTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const Class_scheduleScalarFieldEnum: {
    ClassID: 'ClassID',
    TimeslotID: 'TimeslotID',
    SubjectCode: 'SubjectCode',
    RoomID: 'RoomID',
    GradeID: 'GradeID',
    IsLocked: 'IsLocked'
  };

  export type Class_scheduleScalarFieldEnum = (typeof Class_scheduleScalarFieldEnum)[keyof typeof Class_scheduleScalarFieldEnum]


  export const GradelevelScalarFieldEnum: {
    GradeID: 'GradeID',
    Year: 'Year',
    Number: 'Number'
  };

  export type GradelevelScalarFieldEnum = (typeof GradelevelScalarFieldEnum)[keyof typeof GradelevelScalarFieldEnum]


  export const RoomScalarFieldEnum: {
    RoomID: 'RoomID',
    RoomName: 'RoomName',
    Building: 'Building',
    Floor: 'Floor'
  };

  export type RoomScalarFieldEnum = (typeof RoomScalarFieldEnum)[keyof typeof RoomScalarFieldEnum]


  export const SubjectScalarFieldEnum: {
    SubjectCode: 'SubjectCode',
    SubjectName: 'SubjectName',
    Credit: 'Credit',
    Category: 'Category',
    ProgramID: 'ProgramID'
  };

  export type SubjectScalarFieldEnum = (typeof SubjectScalarFieldEnum)[keyof typeof SubjectScalarFieldEnum]


  export const ProgramScalarFieldEnum: {
    ProgramID: 'ProgramID',
    ProgramName: 'ProgramName',
    Semester: 'Semester',
    AcademicYear: 'AcademicYear'
  };

  export type ProgramScalarFieldEnum = (typeof ProgramScalarFieldEnum)[keyof typeof ProgramScalarFieldEnum]


  export const TeacherScalarFieldEnum: {
    TeacherID: 'TeacherID',
    Prefix: 'Prefix',
    Firstname: 'Firstname',
    Lastname: 'Lastname',
    Department: 'Department',
    Email: 'Email',
    Role: 'Role'
  };

  export type TeacherScalarFieldEnum = (typeof TeacherScalarFieldEnum)[keyof typeof TeacherScalarFieldEnum]


  export const TimeslotScalarFieldEnum: {
    TimeslotID: 'TimeslotID',
    AcademicYear: 'AcademicYear',
    Semester: 'Semester',
    StartTime: 'StartTime',
    EndTime: 'EndTime',
    Breaktime: 'Breaktime',
    DayOfWeek: 'DayOfWeek'
  };

  export type TimeslotScalarFieldEnum = (typeof TimeslotScalarFieldEnum)[keyof typeof TimeslotScalarFieldEnum]


  export const Teachers_responsibilityScalarFieldEnum: {
    RespID: 'RespID',
    TeacherID: 'TeacherID',
    GradeID: 'GradeID',
    SubjectCode: 'SubjectCode',
    AcademicYear: 'AcademicYear',
    Semester: 'Semester',
    TeachHour: 'TeachHour'
  };

  export type Teachers_responsibilityScalarFieldEnum = (typeof Teachers_responsibilityScalarFieldEnum)[keyof typeof Teachers_responsibilityScalarFieldEnum]


  export const Table_configScalarFieldEnum: {
    ConfigID: 'ConfigID',
    AcademicYear: 'AcademicYear',
    Semester: 'Semester',
    Config: 'Config',
    status: 'status',
    publishedAt: 'publishedAt',
    isPinned: 'isPinned',
    lastAccessedAt: 'lastAccessedAt',
    configCompleteness: 'configCompleteness',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Table_configScalarFieldEnum = (typeof Table_configScalarFieldEnum)[keyof typeof Table_configScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    userId: 'userId',
    type: 'type',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    refresh_token: 'refresh_token',
    access_token: 'access_token',
    expires_at: 'expires_at',
    token_type: 'token_type',
    scope: 'scope',
    id_token: 'id_token',
    session_state: 'session_state',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    sessionToken: 'sessionToken',
    userId: 'userId',
    expires: 'expires',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const VerificationTokenScalarFieldEnum: {
    identifier: 'identifier',
    token: 'token',
    expires: 'expires'
  };

  export type VerificationTokenScalarFieldEnum = (typeof VerificationTokenScalarFieldEnum)[keyof typeof VerificationTokenScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'subject_credit'
   */
  export type Enumsubject_creditFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'subject_credit'>
    


  /**
   * Reference to a field of type 'subject_credit[]'
   */
  export type ListEnumsubject_creditFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'subject_credit[]'>
    


  /**
   * Reference to a field of type 'semester'
   */
  export type EnumsemesterFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'semester'>
    


  /**
   * Reference to a field of type 'semester[]'
   */
  export type ListEnumsemesterFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'semester[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'breaktime'
   */
  export type EnumbreaktimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'breaktime'>
    


  /**
   * Reference to a field of type 'breaktime[]'
   */
  export type ListEnumbreaktimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'breaktime[]'>
    


  /**
   * Reference to a field of type 'day_of_week'
   */
  export type Enumday_of_weekFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'day_of_week'>
    


  /**
   * Reference to a field of type 'day_of_week[]'
   */
  export type ListEnumday_of_weekFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'day_of_week[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'SemesterStatus'
   */
  export type EnumSemesterStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SemesterStatus'>
    


  /**
   * Reference to a field of type 'SemesterStatus[]'
   */
  export type ListEnumSemesterStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SemesterStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type class_scheduleWhereInput = {
    AND?: class_scheduleWhereInput | class_scheduleWhereInput[]
    OR?: class_scheduleWhereInput[]
    NOT?: class_scheduleWhereInput | class_scheduleWhereInput[]
    ClassID?: StringFilter<"class_schedule"> | string
    TimeslotID?: StringFilter<"class_schedule"> | string
    SubjectCode?: StringFilter<"class_schedule"> | string
    RoomID?: IntNullableFilter<"class_schedule"> | number | null
    GradeID?: StringFilter<"class_schedule"> | string
    IsLocked?: BoolFilter<"class_schedule"> | boolean
    gradelevel?: XOR<GradelevelScalarRelationFilter, gradelevelWhereInput>
    room?: XOR<RoomNullableScalarRelationFilter, roomWhereInput> | null
    subject?: XOR<SubjectScalarRelationFilter, subjectWhereInput>
    timeslot?: XOR<TimeslotScalarRelationFilter, timeslotWhereInput>
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }

  export type class_scheduleOrderByWithRelationInput = {
    ClassID?: SortOrder
    TimeslotID?: SortOrder
    SubjectCode?: SortOrder
    RoomID?: SortOrderInput | SortOrder
    GradeID?: SortOrder
    IsLocked?: SortOrder
    gradelevel?: gradelevelOrderByWithRelationInput
    room?: roomOrderByWithRelationInput
    subject?: subjectOrderByWithRelationInput
    timeslot?: timeslotOrderByWithRelationInput
    teachers_responsibility?: teachers_responsibilityOrderByRelationAggregateInput
  }

  export type class_scheduleWhereUniqueInput = Prisma.AtLeast<{
    ClassID?: string
    AND?: class_scheduleWhereInput | class_scheduleWhereInput[]
    OR?: class_scheduleWhereInput[]
    NOT?: class_scheduleWhereInput | class_scheduleWhereInput[]
    TimeslotID?: StringFilter<"class_schedule"> | string
    SubjectCode?: StringFilter<"class_schedule"> | string
    RoomID?: IntNullableFilter<"class_schedule"> | number | null
    GradeID?: StringFilter<"class_schedule"> | string
    IsLocked?: BoolFilter<"class_schedule"> | boolean
    gradelevel?: XOR<GradelevelScalarRelationFilter, gradelevelWhereInput>
    room?: XOR<RoomNullableScalarRelationFilter, roomWhereInput> | null
    subject?: XOR<SubjectScalarRelationFilter, subjectWhereInput>
    timeslot?: XOR<TimeslotScalarRelationFilter, timeslotWhereInput>
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }, "ClassID">

  export type class_scheduleOrderByWithAggregationInput = {
    ClassID?: SortOrder
    TimeslotID?: SortOrder
    SubjectCode?: SortOrder
    RoomID?: SortOrderInput | SortOrder
    GradeID?: SortOrder
    IsLocked?: SortOrder
    _count?: class_scheduleCountOrderByAggregateInput
    _avg?: class_scheduleAvgOrderByAggregateInput
    _max?: class_scheduleMaxOrderByAggregateInput
    _min?: class_scheduleMinOrderByAggregateInput
    _sum?: class_scheduleSumOrderByAggregateInput
  }

  export type class_scheduleScalarWhereWithAggregatesInput = {
    AND?: class_scheduleScalarWhereWithAggregatesInput | class_scheduleScalarWhereWithAggregatesInput[]
    OR?: class_scheduleScalarWhereWithAggregatesInput[]
    NOT?: class_scheduleScalarWhereWithAggregatesInput | class_scheduleScalarWhereWithAggregatesInput[]
    ClassID?: StringWithAggregatesFilter<"class_schedule"> | string
    TimeslotID?: StringWithAggregatesFilter<"class_schedule"> | string
    SubjectCode?: StringWithAggregatesFilter<"class_schedule"> | string
    RoomID?: IntNullableWithAggregatesFilter<"class_schedule"> | number | null
    GradeID?: StringWithAggregatesFilter<"class_schedule"> | string
    IsLocked?: BoolWithAggregatesFilter<"class_schedule"> | boolean
  }

  export type gradelevelWhereInput = {
    AND?: gradelevelWhereInput | gradelevelWhereInput[]
    OR?: gradelevelWhereInput[]
    NOT?: gradelevelWhereInput | gradelevelWhereInput[]
    GradeID?: StringFilter<"gradelevel"> | string
    Year?: IntFilter<"gradelevel"> | number
    Number?: IntFilter<"gradelevel"> | number
    class_schedule?: Class_scheduleListRelationFilter
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
    program?: ProgramListRelationFilter
  }

  export type gradelevelOrderByWithRelationInput = {
    GradeID?: SortOrder
    Year?: SortOrder
    Number?: SortOrder
    class_schedule?: class_scheduleOrderByRelationAggregateInput
    teachers_responsibility?: teachers_responsibilityOrderByRelationAggregateInput
    program?: programOrderByRelationAggregateInput
  }

  export type gradelevelWhereUniqueInput = Prisma.AtLeast<{
    GradeID?: string
    AND?: gradelevelWhereInput | gradelevelWhereInput[]
    OR?: gradelevelWhereInput[]
    NOT?: gradelevelWhereInput | gradelevelWhereInput[]
    Year?: IntFilter<"gradelevel"> | number
    Number?: IntFilter<"gradelevel"> | number
    class_schedule?: Class_scheduleListRelationFilter
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
    program?: ProgramListRelationFilter
  }, "GradeID">

  export type gradelevelOrderByWithAggregationInput = {
    GradeID?: SortOrder
    Year?: SortOrder
    Number?: SortOrder
    _count?: gradelevelCountOrderByAggregateInput
    _avg?: gradelevelAvgOrderByAggregateInput
    _max?: gradelevelMaxOrderByAggregateInput
    _min?: gradelevelMinOrderByAggregateInput
    _sum?: gradelevelSumOrderByAggregateInput
  }

  export type gradelevelScalarWhereWithAggregatesInput = {
    AND?: gradelevelScalarWhereWithAggregatesInput | gradelevelScalarWhereWithAggregatesInput[]
    OR?: gradelevelScalarWhereWithAggregatesInput[]
    NOT?: gradelevelScalarWhereWithAggregatesInput | gradelevelScalarWhereWithAggregatesInput[]
    GradeID?: StringWithAggregatesFilter<"gradelevel"> | string
    Year?: IntWithAggregatesFilter<"gradelevel"> | number
    Number?: IntWithAggregatesFilter<"gradelevel"> | number
  }

  export type roomWhereInput = {
    AND?: roomWhereInput | roomWhereInput[]
    OR?: roomWhereInput[]
    NOT?: roomWhereInput | roomWhereInput[]
    RoomID?: IntFilter<"room"> | number
    RoomName?: StringFilter<"room"> | string
    Building?: StringFilter<"room"> | string
    Floor?: StringFilter<"room"> | string
    class_schedule?: Class_scheduleListRelationFilter
  }

  export type roomOrderByWithRelationInput = {
    RoomID?: SortOrder
    RoomName?: SortOrder
    Building?: SortOrder
    Floor?: SortOrder
    class_schedule?: class_scheduleOrderByRelationAggregateInput
  }

  export type roomWhereUniqueInput = Prisma.AtLeast<{
    RoomID?: number
    RoomName?: string
    AND?: roomWhereInput | roomWhereInput[]
    OR?: roomWhereInput[]
    NOT?: roomWhereInput | roomWhereInput[]
    Building?: StringFilter<"room"> | string
    Floor?: StringFilter<"room"> | string
    class_schedule?: Class_scheduleListRelationFilter
  }, "RoomID" | "RoomName">

  export type roomOrderByWithAggregationInput = {
    RoomID?: SortOrder
    RoomName?: SortOrder
    Building?: SortOrder
    Floor?: SortOrder
    _count?: roomCountOrderByAggregateInput
    _avg?: roomAvgOrderByAggregateInput
    _max?: roomMaxOrderByAggregateInput
    _min?: roomMinOrderByAggregateInput
    _sum?: roomSumOrderByAggregateInput
  }

  export type roomScalarWhereWithAggregatesInput = {
    AND?: roomScalarWhereWithAggregatesInput | roomScalarWhereWithAggregatesInput[]
    OR?: roomScalarWhereWithAggregatesInput[]
    NOT?: roomScalarWhereWithAggregatesInput | roomScalarWhereWithAggregatesInput[]
    RoomID?: IntWithAggregatesFilter<"room"> | number
    RoomName?: StringWithAggregatesFilter<"room"> | string
    Building?: StringWithAggregatesFilter<"room"> | string
    Floor?: StringWithAggregatesFilter<"room"> | string
  }

  export type subjectWhereInput = {
    AND?: subjectWhereInput | subjectWhereInput[]
    OR?: subjectWhereInput[]
    NOT?: subjectWhereInput | subjectWhereInput[]
    SubjectCode?: StringFilter<"subject"> | string
    SubjectName?: StringFilter<"subject"> | string
    Credit?: Enumsubject_creditFilter<"subject"> | $Enums.subject_credit
    Category?: StringFilter<"subject"> | string
    ProgramID?: IntNullableFilter<"subject"> | number | null
    class_schedule?: Class_scheduleListRelationFilter
    program?: XOR<ProgramNullableScalarRelationFilter, programWhereInput> | null
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }

  export type subjectOrderByWithRelationInput = {
    SubjectCode?: SortOrder
    SubjectName?: SortOrder
    Credit?: SortOrder
    Category?: SortOrder
    ProgramID?: SortOrderInput | SortOrder
    class_schedule?: class_scheduleOrderByRelationAggregateInput
    program?: programOrderByWithRelationInput
    teachers_responsibility?: teachers_responsibilityOrderByRelationAggregateInput
  }

  export type subjectWhereUniqueInput = Prisma.AtLeast<{
    SubjectCode?: string
    AND?: subjectWhereInput | subjectWhereInput[]
    OR?: subjectWhereInput[]
    NOT?: subjectWhereInput | subjectWhereInput[]
    SubjectName?: StringFilter<"subject"> | string
    Credit?: Enumsubject_creditFilter<"subject"> | $Enums.subject_credit
    Category?: StringFilter<"subject"> | string
    ProgramID?: IntNullableFilter<"subject"> | number | null
    class_schedule?: Class_scheduleListRelationFilter
    program?: XOR<ProgramNullableScalarRelationFilter, programWhereInput> | null
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }, "SubjectCode">

  export type subjectOrderByWithAggregationInput = {
    SubjectCode?: SortOrder
    SubjectName?: SortOrder
    Credit?: SortOrder
    Category?: SortOrder
    ProgramID?: SortOrderInput | SortOrder
    _count?: subjectCountOrderByAggregateInput
    _avg?: subjectAvgOrderByAggregateInput
    _max?: subjectMaxOrderByAggregateInput
    _min?: subjectMinOrderByAggregateInput
    _sum?: subjectSumOrderByAggregateInput
  }

  export type subjectScalarWhereWithAggregatesInput = {
    AND?: subjectScalarWhereWithAggregatesInput | subjectScalarWhereWithAggregatesInput[]
    OR?: subjectScalarWhereWithAggregatesInput[]
    NOT?: subjectScalarWhereWithAggregatesInput | subjectScalarWhereWithAggregatesInput[]
    SubjectCode?: StringWithAggregatesFilter<"subject"> | string
    SubjectName?: StringWithAggregatesFilter<"subject"> | string
    Credit?: Enumsubject_creditWithAggregatesFilter<"subject"> | $Enums.subject_credit
    Category?: StringWithAggregatesFilter<"subject"> | string
    ProgramID?: IntNullableWithAggregatesFilter<"subject"> | number | null
  }

  export type programWhereInput = {
    AND?: programWhereInput | programWhereInput[]
    OR?: programWhereInput[]
    NOT?: programWhereInput | programWhereInput[]
    ProgramID?: IntFilter<"program"> | number
    ProgramName?: StringFilter<"program"> | string
    Semester?: EnumsemesterFilter<"program"> | $Enums.semester
    AcademicYear?: IntFilter<"program"> | number
    subject?: SubjectListRelationFilter
    gradelevel?: GradelevelListRelationFilter
  }

  export type programOrderByWithRelationInput = {
    ProgramID?: SortOrder
    ProgramName?: SortOrder
    Semester?: SortOrder
    AcademicYear?: SortOrder
    subject?: subjectOrderByRelationAggregateInput
    gradelevel?: gradelevelOrderByRelationAggregateInput
  }

  export type programWhereUniqueInput = Prisma.AtLeast<{
    ProgramID?: number
    ProgramName_Semester_AcademicYear?: programProgramNameSemesterAcademicYearCompoundUniqueInput
    AND?: programWhereInput | programWhereInput[]
    OR?: programWhereInput[]
    NOT?: programWhereInput | programWhereInput[]
    ProgramName?: StringFilter<"program"> | string
    Semester?: EnumsemesterFilter<"program"> | $Enums.semester
    AcademicYear?: IntFilter<"program"> | number
    subject?: SubjectListRelationFilter
    gradelevel?: GradelevelListRelationFilter
  }, "ProgramID" | "ProgramName_Semester_AcademicYear">

  export type programOrderByWithAggregationInput = {
    ProgramID?: SortOrder
    ProgramName?: SortOrder
    Semester?: SortOrder
    AcademicYear?: SortOrder
    _count?: programCountOrderByAggregateInput
    _avg?: programAvgOrderByAggregateInput
    _max?: programMaxOrderByAggregateInput
    _min?: programMinOrderByAggregateInput
    _sum?: programSumOrderByAggregateInput
  }

  export type programScalarWhereWithAggregatesInput = {
    AND?: programScalarWhereWithAggregatesInput | programScalarWhereWithAggregatesInput[]
    OR?: programScalarWhereWithAggregatesInput[]
    NOT?: programScalarWhereWithAggregatesInput | programScalarWhereWithAggregatesInput[]
    ProgramID?: IntWithAggregatesFilter<"program"> | number
    ProgramName?: StringWithAggregatesFilter<"program"> | string
    Semester?: EnumsemesterWithAggregatesFilter<"program"> | $Enums.semester
    AcademicYear?: IntWithAggregatesFilter<"program"> | number
  }

  export type teacherWhereInput = {
    AND?: teacherWhereInput | teacherWhereInput[]
    OR?: teacherWhereInput[]
    NOT?: teacherWhereInput | teacherWhereInput[]
    TeacherID?: IntFilter<"teacher"> | number
    Prefix?: StringFilter<"teacher"> | string
    Firstname?: StringFilter<"teacher"> | string
    Lastname?: StringFilter<"teacher"> | string
    Department?: StringFilter<"teacher"> | string
    Email?: StringFilter<"teacher"> | string
    Role?: StringFilter<"teacher"> | string
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }

  export type teacherOrderByWithRelationInput = {
    TeacherID?: SortOrder
    Prefix?: SortOrder
    Firstname?: SortOrder
    Lastname?: SortOrder
    Department?: SortOrder
    Email?: SortOrder
    Role?: SortOrder
    teachers_responsibility?: teachers_responsibilityOrderByRelationAggregateInput
  }

  export type teacherWhereUniqueInput = Prisma.AtLeast<{
    TeacherID?: number
    Email?: string
    AND?: teacherWhereInput | teacherWhereInput[]
    OR?: teacherWhereInput[]
    NOT?: teacherWhereInput | teacherWhereInput[]
    Prefix?: StringFilter<"teacher"> | string
    Firstname?: StringFilter<"teacher"> | string
    Lastname?: StringFilter<"teacher"> | string
    Department?: StringFilter<"teacher"> | string
    Role?: StringFilter<"teacher"> | string
    teachers_responsibility?: Teachers_responsibilityListRelationFilter
  }, "TeacherID" | "Email">

  export type teacherOrderByWithAggregationInput = {
    TeacherID?: SortOrder
    Prefix?: SortOrder
    Firstname?: SortOrder
    Lastname?: SortOrder
    Department?: SortOrder
    Email?: SortOrder
    Role?: SortOrder
    _count?: teacherCountOrderByAggregateInput
    _avg?: teacherAvgOrderByAggregateInput
    _max?: teacherMaxOrderByAggregateInput
    _min?: teacherMinOrderByAggregateInput
    _sum?: teacherSumOrderByAggregateInput
  }

  export type teacherScalarWhereWithAggregatesInput = {
    AND?: teacherScalarWhereWithAggregatesInput | teacherScalarWhereWithAggregatesInput[]
    OR?: teacherScalarWhereWithAggregatesInput[]
    NOT?: teacherScalarWhereWithAggregatesInput | teacherScalarWhereWithAggregatesInput[]
    TeacherID?: IntWithAggregatesFilter<"teacher"> | number
    Prefix?: StringWithAggregatesFilter<"teacher"> | string
    Firstname?: StringWithAggregatesFilter<"teacher"> | string
    Lastname?: StringWithAggregatesFilter<"teacher"> | string
    Department?: StringWithAggregatesFilter<"teacher"> | string
    Email?: StringWithAggregatesFilter<"teacher"> | string
    Role?: StringWithAggregatesFilter<"teacher"> | string
  }

  export type timeslotWhereInput = {
    AND?: timeslotWhereInput | timeslotWhereInput[]
    OR?: timeslotWhereInput[]
    NOT?: timeslotWhereInput | timeslotWhereInput[]
    TimeslotID?: StringFilter<"timeslot"> | string
    AcademicYear?: IntFilter<"timeslot"> | number
    Semester?: EnumsemesterFilter<"timeslot"> | $Enums.semester
    StartTime?: DateTimeFilter<"timeslot"> | Date | string
    EndTime?: DateTimeFilter<"timeslot"> | Date | string
    Breaktime?: EnumbreaktimeFilter<"timeslot"> | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFilter<"timeslot"> | $Enums.day_of_week
    class_schedule?: Class_scheduleListRelationFilter
  }

  export type timeslotOrderByWithRelationInput = {
    TimeslotID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    StartTime?: SortOrder
    EndTime?: SortOrder
    Breaktime?: SortOrder
    DayOfWeek?: SortOrder
    class_schedule?: class_scheduleOrderByRelationAggregateInput
  }

  export type timeslotWhereUniqueInput = Prisma.AtLeast<{
    TimeslotID?: string
    AND?: timeslotWhereInput | timeslotWhereInput[]
    OR?: timeslotWhereInput[]
    NOT?: timeslotWhereInput | timeslotWhereInput[]
    AcademicYear?: IntFilter<"timeslot"> | number
    Semester?: EnumsemesterFilter<"timeslot"> | $Enums.semester
    StartTime?: DateTimeFilter<"timeslot"> | Date | string
    EndTime?: DateTimeFilter<"timeslot"> | Date | string
    Breaktime?: EnumbreaktimeFilter<"timeslot"> | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFilter<"timeslot"> | $Enums.day_of_week
    class_schedule?: Class_scheduleListRelationFilter
  }, "TimeslotID">

  export type timeslotOrderByWithAggregationInput = {
    TimeslotID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    StartTime?: SortOrder
    EndTime?: SortOrder
    Breaktime?: SortOrder
    DayOfWeek?: SortOrder
    _count?: timeslotCountOrderByAggregateInput
    _avg?: timeslotAvgOrderByAggregateInput
    _max?: timeslotMaxOrderByAggregateInput
    _min?: timeslotMinOrderByAggregateInput
    _sum?: timeslotSumOrderByAggregateInput
  }

  export type timeslotScalarWhereWithAggregatesInput = {
    AND?: timeslotScalarWhereWithAggregatesInput | timeslotScalarWhereWithAggregatesInput[]
    OR?: timeslotScalarWhereWithAggregatesInput[]
    NOT?: timeslotScalarWhereWithAggregatesInput | timeslotScalarWhereWithAggregatesInput[]
    TimeslotID?: StringWithAggregatesFilter<"timeslot"> | string
    AcademicYear?: IntWithAggregatesFilter<"timeslot"> | number
    Semester?: EnumsemesterWithAggregatesFilter<"timeslot"> | $Enums.semester
    StartTime?: DateTimeWithAggregatesFilter<"timeslot"> | Date | string
    EndTime?: DateTimeWithAggregatesFilter<"timeslot"> | Date | string
    Breaktime?: EnumbreaktimeWithAggregatesFilter<"timeslot"> | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekWithAggregatesFilter<"timeslot"> | $Enums.day_of_week
  }

  export type teachers_responsibilityWhereInput = {
    AND?: teachers_responsibilityWhereInput | teachers_responsibilityWhereInput[]
    OR?: teachers_responsibilityWhereInput[]
    NOT?: teachers_responsibilityWhereInput | teachers_responsibilityWhereInput[]
    RespID?: IntFilter<"teachers_responsibility"> | number
    TeacherID?: IntFilter<"teachers_responsibility"> | number
    GradeID?: StringFilter<"teachers_responsibility"> | string
    SubjectCode?: StringFilter<"teachers_responsibility"> | string
    AcademicYear?: IntFilter<"teachers_responsibility"> | number
    Semester?: EnumsemesterFilter<"teachers_responsibility"> | $Enums.semester
    TeachHour?: IntFilter<"teachers_responsibility"> | number
    gradelevel?: XOR<GradelevelScalarRelationFilter, gradelevelWhereInput>
    subject?: XOR<SubjectScalarRelationFilter, subjectWhereInput>
    teacher?: XOR<TeacherScalarRelationFilter, teacherWhereInput>
    class_schedule?: Class_scheduleListRelationFilter
  }

  export type teachers_responsibilityOrderByWithRelationInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    GradeID?: SortOrder
    SubjectCode?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    TeachHour?: SortOrder
    gradelevel?: gradelevelOrderByWithRelationInput
    subject?: subjectOrderByWithRelationInput
    teacher?: teacherOrderByWithRelationInput
    class_schedule?: class_scheduleOrderByRelationAggregateInput
  }

  export type teachers_responsibilityWhereUniqueInput = Prisma.AtLeast<{
    RespID?: number
    AND?: teachers_responsibilityWhereInput | teachers_responsibilityWhereInput[]
    OR?: teachers_responsibilityWhereInput[]
    NOT?: teachers_responsibilityWhereInput | teachers_responsibilityWhereInput[]
    TeacherID?: IntFilter<"teachers_responsibility"> | number
    GradeID?: StringFilter<"teachers_responsibility"> | string
    SubjectCode?: StringFilter<"teachers_responsibility"> | string
    AcademicYear?: IntFilter<"teachers_responsibility"> | number
    Semester?: EnumsemesterFilter<"teachers_responsibility"> | $Enums.semester
    TeachHour?: IntFilter<"teachers_responsibility"> | number
    gradelevel?: XOR<GradelevelScalarRelationFilter, gradelevelWhereInput>
    subject?: XOR<SubjectScalarRelationFilter, subjectWhereInput>
    teacher?: XOR<TeacherScalarRelationFilter, teacherWhereInput>
    class_schedule?: Class_scheduleListRelationFilter
  }, "RespID">

  export type teachers_responsibilityOrderByWithAggregationInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    GradeID?: SortOrder
    SubjectCode?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    TeachHour?: SortOrder
    _count?: teachers_responsibilityCountOrderByAggregateInput
    _avg?: teachers_responsibilityAvgOrderByAggregateInput
    _max?: teachers_responsibilityMaxOrderByAggregateInput
    _min?: teachers_responsibilityMinOrderByAggregateInput
    _sum?: teachers_responsibilitySumOrderByAggregateInput
  }

  export type teachers_responsibilityScalarWhereWithAggregatesInput = {
    AND?: teachers_responsibilityScalarWhereWithAggregatesInput | teachers_responsibilityScalarWhereWithAggregatesInput[]
    OR?: teachers_responsibilityScalarWhereWithAggregatesInput[]
    NOT?: teachers_responsibilityScalarWhereWithAggregatesInput | teachers_responsibilityScalarWhereWithAggregatesInput[]
    RespID?: IntWithAggregatesFilter<"teachers_responsibility"> | number
    TeacherID?: IntWithAggregatesFilter<"teachers_responsibility"> | number
    GradeID?: StringWithAggregatesFilter<"teachers_responsibility"> | string
    SubjectCode?: StringWithAggregatesFilter<"teachers_responsibility"> | string
    AcademicYear?: IntWithAggregatesFilter<"teachers_responsibility"> | number
    Semester?: EnumsemesterWithAggregatesFilter<"teachers_responsibility"> | $Enums.semester
    TeachHour?: IntWithAggregatesFilter<"teachers_responsibility"> | number
  }

  export type table_configWhereInput = {
    AND?: table_configWhereInput | table_configWhereInput[]
    OR?: table_configWhereInput[]
    NOT?: table_configWhereInput | table_configWhereInput[]
    ConfigID?: StringFilter<"table_config"> | string
    AcademicYear?: IntFilter<"table_config"> | number
    Semester?: EnumsemesterFilter<"table_config"> | $Enums.semester
    Config?: JsonFilter<"table_config">
    status?: EnumSemesterStatusFilter<"table_config"> | $Enums.SemesterStatus
    publishedAt?: DateTimeNullableFilter<"table_config"> | Date | string | null
    isPinned?: BoolFilter<"table_config"> | boolean
    lastAccessedAt?: DateTimeFilter<"table_config"> | Date | string
    configCompleteness?: IntFilter<"table_config"> | number
    createdAt?: DateTimeFilter<"table_config"> | Date | string
    updatedAt?: DateTimeFilter<"table_config"> | Date | string
  }

  export type table_configOrderByWithRelationInput = {
    ConfigID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    Config?: SortOrder
    status?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    isPinned?: SortOrder
    lastAccessedAt?: SortOrder
    configCompleteness?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type table_configWhereUniqueInput = Prisma.AtLeast<{
    ConfigID?: string
    AND?: table_configWhereInput | table_configWhereInput[]
    OR?: table_configWhereInput[]
    NOT?: table_configWhereInput | table_configWhereInput[]
    AcademicYear?: IntFilter<"table_config"> | number
    Semester?: EnumsemesterFilter<"table_config"> | $Enums.semester
    Config?: JsonFilter<"table_config">
    status?: EnumSemesterStatusFilter<"table_config"> | $Enums.SemesterStatus
    publishedAt?: DateTimeNullableFilter<"table_config"> | Date | string | null
    isPinned?: BoolFilter<"table_config"> | boolean
    lastAccessedAt?: DateTimeFilter<"table_config"> | Date | string
    configCompleteness?: IntFilter<"table_config"> | number
    createdAt?: DateTimeFilter<"table_config"> | Date | string
    updatedAt?: DateTimeFilter<"table_config"> | Date | string
  }, "ConfigID">

  export type table_configOrderByWithAggregationInput = {
    ConfigID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    Config?: SortOrder
    status?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    isPinned?: SortOrder
    lastAccessedAt?: SortOrder
    configCompleteness?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: table_configCountOrderByAggregateInput
    _avg?: table_configAvgOrderByAggregateInput
    _max?: table_configMaxOrderByAggregateInput
    _min?: table_configMinOrderByAggregateInput
    _sum?: table_configSumOrderByAggregateInput
  }

  export type table_configScalarWhereWithAggregatesInput = {
    AND?: table_configScalarWhereWithAggregatesInput | table_configScalarWhereWithAggregatesInput[]
    OR?: table_configScalarWhereWithAggregatesInput[]
    NOT?: table_configScalarWhereWithAggregatesInput | table_configScalarWhereWithAggregatesInput[]
    ConfigID?: StringWithAggregatesFilter<"table_config"> | string
    AcademicYear?: IntWithAggregatesFilter<"table_config"> | number
    Semester?: EnumsemesterWithAggregatesFilter<"table_config"> | $Enums.semester
    Config?: JsonWithAggregatesFilter<"table_config">
    status?: EnumSemesterStatusWithAggregatesFilter<"table_config"> | $Enums.SemesterStatus
    publishedAt?: DateTimeNullableWithAggregatesFilter<"table_config"> | Date | string | null
    isPinned?: BoolWithAggregatesFilter<"table_config"> | boolean
    lastAccessedAt?: DateTimeWithAggregatesFilter<"table_config"> | Date | string
    configCompleteness?: IntWithAggregatesFilter<"table_config"> | number
    createdAt?: DateTimeWithAggregatesFilter<"table_config"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"table_config"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    password?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    accounts?: AccountOrderByRelationAggregateInput
    sessions?: SessionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    password?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    emailVerified?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AccountOrderByWithRelationInput = {
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    provider_providerAccountId?: AccountProviderProviderAccountIdCompoundUniqueInput
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "provider_providerAccountId">

  export type AccountOrderByWithAggregationInput = {
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AccountCountOrderByAggregateInput
    _avg?: AccountAvgOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
    _sum?: AccountSumOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    userId?: StringWithAggregatesFilter<"Account"> | string
    type?: StringWithAggregatesFilter<"Account"> | string
    provider?: StringWithAggregatesFilter<"Account"> | string
    providerAccountId?: StringWithAggregatesFilter<"Account"> | string
    refresh_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    access_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    expires_at?: IntNullableWithAggregatesFilter<"Account"> | number | null
    token_type?: StringNullableWithAggregatesFilter<"Account"> | string | null
    scope?: StringNullableWithAggregatesFilter<"Account"> | string | null
    id_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    session_state?: StringNullableWithAggregatesFilter<"Account"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    sessionToken?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "sessionToken">

  export type SessionOrderByWithAggregationInput = {
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    sessionToken?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expires?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type VerificationTokenWhereInput = {
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    token?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }

  export type VerificationTokenOrderByWithRelationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenWhereUniqueInput = Prisma.AtLeast<{
    identifier_token?: VerificationTokenIdentifierTokenCompoundUniqueInput
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    token?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }, "identifier_token">

  export type VerificationTokenOrderByWithAggregationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
    _count?: VerificationTokenCountOrderByAggregateInput
    _max?: VerificationTokenMaxOrderByAggregateInput
    _min?: VerificationTokenMinOrderByAggregateInput
  }

  export type VerificationTokenScalarWhereWithAggregatesInput = {
    AND?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    OR?: VerificationTokenScalarWhereWithAggregatesInput[]
    NOT?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    identifier?: StringWithAggregatesFilter<"VerificationToken"> | string
    token?: StringWithAggregatesFilter<"VerificationToken"> | string
    expires?: DateTimeWithAggregatesFilter<"VerificationToken"> | Date | string
  }

  export type class_scheduleCreateInput = {
    ClassID: string
    IsLocked?: boolean
    gradelevel: gradelevelCreateNestedOneWithoutClass_scheduleInput
    room?: roomCreateNestedOneWithoutClass_scheduleInput
    subject: subjectCreateNestedOneWithoutClass_scheduleInput
    timeslot: timeslotCreateNestedOneWithoutClass_scheduleInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUpdateInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    gradelevel?: gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput
    room?: roomUpdateOneWithoutClass_scheduleNestedInput
    subject?: subjectUpdateOneRequiredWithoutClass_scheduleNestedInput
    timeslot?: timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleCreateManyInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
  }

  export type class_scheduleUpdateManyMutationInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type class_scheduleUncheckedUpdateManyInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type gradelevelCreateInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleCreateNestedManyWithoutGradelevelInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutGradelevelInput
    program?: programCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelUncheckedCreateInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutGradelevelInput
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutGradelevelInput
    program?: programUncheckedCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelUpdateInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUpdateManyWithoutGradelevelNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutGradelevelNestedInput
    program?: programUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelUncheckedUpdateInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutGradelevelNestedInput
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutGradelevelNestedInput
    program?: programUncheckedUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelCreateManyInput = {
    GradeID: string
    Year: number
    Number: number
  }

  export type gradelevelUpdateManyMutationInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
  }

  export type gradelevelUncheckedUpdateManyInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
  }

  export type roomCreateInput = {
    RoomName: string
    Building?: string
    Floor?: string
    class_schedule?: class_scheduleCreateNestedManyWithoutRoomInput
  }

  export type roomUncheckedCreateInput = {
    RoomID?: number
    RoomName: string
    Building?: string
    Floor?: string
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutRoomInput
  }

  export type roomUpdateInput = {
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUpdateManyWithoutRoomNestedInput
  }

  export type roomUncheckedUpdateInput = {
    RoomID?: IntFieldUpdateOperationsInput | number
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type roomCreateManyInput = {
    RoomID?: number
    RoomName: string
    Building?: string
    Floor?: string
  }

  export type roomUpdateManyMutationInput = {
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
  }

  export type roomUncheckedUpdateManyInput = {
    RoomID?: IntFieldUpdateOperationsInput | number
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
  }

  export type subjectCreateInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    class_schedule?: class_scheduleCreateNestedManyWithoutSubjectInput
    program?: programCreateNestedOneWithoutSubjectInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutSubjectInput
  }

  export type subjectUncheckedCreateInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    ProgramID?: number | null
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutSubjectInput
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutSubjectInput
  }

  export type subjectUpdateInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUpdateManyWithoutSubjectNestedInput
    program?: programUpdateOneWithoutSubjectNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutSubjectNestedInput
  }

  export type subjectUncheckedUpdateInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    ProgramID?: NullableIntFieldUpdateOperationsInput | number | null
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutSubjectNestedInput
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutSubjectNestedInput
  }

  export type subjectCreateManyInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    ProgramID?: number | null
  }

  export type subjectUpdateManyMutationInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
  }

  export type subjectUncheckedUpdateManyInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    ProgramID?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type programCreateInput = {
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    subject?: subjectCreateNestedManyWithoutProgramInput
    gradelevel?: gradelevelCreateNestedManyWithoutProgramInput
  }

  export type programUncheckedCreateInput = {
    ProgramID?: number
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    subject?: subjectUncheckedCreateNestedManyWithoutProgramInput
    gradelevel?: gradelevelUncheckedCreateNestedManyWithoutProgramInput
  }

  export type programUpdateInput = {
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    subject?: subjectUpdateManyWithoutProgramNestedInput
    gradelevel?: gradelevelUpdateManyWithoutProgramNestedInput
  }

  export type programUncheckedUpdateInput = {
    ProgramID?: IntFieldUpdateOperationsInput | number
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    subject?: subjectUncheckedUpdateManyWithoutProgramNestedInput
    gradelevel?: gradelevelUncheckedUpdateManyWithoutProgramNestedInput
  }

  export type programCreateManyInput = {
    ProgramID?: number
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
  }

  export type programUpdateManyMutationInput = {
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
  }

  export type programUncheckedUpdateManyInput = {
    ProgramID?: IntFieldUpdateOperationsInput | number
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
  }

  export type teacherCreateInput = {
    Prefix: string
    Firstname: string
    Lastname: string
    Department?: string
    Email: string
    Role?: string
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutTeacherInput
  }

  export type teacherUncheckedCreateInput = {
    TeacherID?: number
    Prefix: string
    Firstname: string
    Lastname: string
    Department?: string
    Email: string
    Role?: string
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutTeacherInput
  }

  export type teacherUpdateInput = {
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutTeacherNestedInput
  }

  export type teacherUncheckedUpdateInput = {
    TeacherID?: IntFieldUpdateOperationsInput | number
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutTeacherNestedInput
  }

  export type teacherCreateManyInput = {
    TeacherID?: number
    Prefix: string
    Firstname: string
    Lastname: string
    Department?: string
    Email: string
    Role?: string
  }

  export type teacherUpdateManyMutationInput = {
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
  }

  export type teacherUncheckedUpdateManyInput = {
    TeacherID?: IntFieldUpdateOperationsInput | number
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
  }

  export type timeslotCreateInput = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date | string
    EndTime: Date | string
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
    class_schedule?: class_scheduleCreateNestedManyWithoutTimeslotInput
  }

  export type timeslotUncheckedCreateInput = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date | string
    EndTime: Date | string
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutTimeslotInput
  }

  export type timeslotUpdateInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
    class_schedule?: class_scheduleUpdateManyWithoutTimeslotNestedInput
  }

  export type timeslotUncheckedUpdateInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutTimeslotNestedInput
  }

  export type timeslotCreateManyInput = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date | string
    EndTime: Date | string
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
  }

  export type timeslotUpdateManyMutationInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
  }

  export type timeslotUncheckedUpdateManyInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
  }

  export type teachers_responsibilityCreateInput = {
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    gradelevel: gradelevelCreateNestedOneWithoutTeachers_responsibilityInput
    subject: subjectCreateNestedOneWithoutTeachers_responsibilityInput
    teacher: teacherCreateNestedOneWithoutTeachers_responsibilityInput
    class_schedule?: class_scheduleCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUncheckedCreateInput = {
    RespID?: number
    TeacherID: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUpdateInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    subject?: subjectUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    teacher?: teacherUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    class_schedule?: class_scheduleUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityCreateManyInput = {
    RespID?: number
    TeacherID: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
  }

  export type teachers_responsibilityUpdateManyMutationInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type teachers_responsibilityUncheckedUpdateManyInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type table_configCreateInput = {
    ConfigID: string
    AcademicYear: number
    Semester: $Enums.semester
    Config: JsonNullValueInput | InputJsonValue
    status?: $Enums.SemesterStatus
    publishedAt?: Date | string | null
    isPinned?: boolean
    lastAccessedAt?: Date | string
    configCompleteness?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type table_configUncheckedCreateInput = {
    ConfigID: string
    AcademicYear: number
    Semester: $Enums.semester
    Config: JsonNullValueInput | InputJsonValue
    status?: $Enums.SemesterStatus
    publishedAt?: Date | string | null
    isPinned?: boolean
    lastAccessedAt?: Date | string
    configCompleteness?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type table_configUpdateInput = {
    ConfigID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    Config?: JsonNullValueInput | InputJsonValue
    status?: EnumSemesterStatusFieldUpdateOperationsInput | $Enums.SemesterStatus
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    lastAccessedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    configCompleteness?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type table_configUncheckedUpdateInput = {
    ConfigID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    Config?: JsonNullValueInput | InputJsonValue
    status?: EnumSemesterStatusFieldUpdateOperationsInput | $Enums.SemesterStatus
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    lastAccessedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    configCompleteness?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type table_configCreateManyInput = {
    ConfigID: string
    AcademicYear: number
    Semester: $Enums.semester
    Config: JsonNullValueInput | InputJsonValue
    status?: $Enums.SemesterStatus
    publishedAt?: Date | string | null
    isPinned?: boolean
    lastAccessedAt?: Date | string
    configCompleteness?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type table_configUpdateManyMutationInput = {
    ConfigID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    Config?: JsonNullValueInput | InputJsonValue
    status?: EnumSemesterStatusFieldUpdateOperationsInput | $Enums.SemesterStatus
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    lastAccessedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    configCompleteness?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type table_configUncheckedUpdateManyInput = {
    ConfigID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    Config?: JsonNullValueInput | InputJsonValue
    status?: EnumSemesterStatusFieldUpdateOperationsInput | $Enums.SemesterStatus
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isPinned?: BoolFieldUpdateOperationsInput | boolean
    lastAccessedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    configCompleteness?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutAccountsInput
  }

  export type AccountUncheckedCreateInput = {
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateManyInput = {
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateInput = {
    sessionToken: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    sessionToken: string
    userId: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionUpdateInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    sessionToken: string
    userId: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUncheckedCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateManyInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateManyMutationInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateManyInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type GradelevelScalarRelationFilter = {
    is?: gradelevelWhereInput
    isNot?: gradelevelWhereInput
  }

  export type RoomNullableScalarRelationFilter = {
    is?: roomWhereInput | null
    isNot?: roomWhereInput | null
  }

  export type SubjectScalarRelationFilter = {
    is?: subjectWhereInput
    isNot?: subjectWhereInput
  }

  export type TimeslotScalarRelationFilter = {
    is?: timeslotWhereInput
    isNot?: timeslotWhereInput
  }

  export type Teachers_responsibilityListRelationFilter = {
    every?: teachers_responsibilityWhereInput
    some?: teachers_responsibilityWhereInput
    none?: teachers_responsibilityWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type teachers_responsibilityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type class_scheduleCountOrderByAggregateInput = {
    ClassID?: SortOrder
    TimeslotID?: SortOrder
    SubjectCode?: SortOrder
    RoomID?: SortOrder
    GradeID?: SortOrder
    IsLocked?: SortOrder
  }

  export type class_scheduleAvgOrderByAggregateInput = {
    RoomID?: SortOrder
  }

  export type class_scheduleMaxOrderByAggregateInput = {
    ClassID?: SortOrder
    TimeslotID?: SortOrder
    SubjectCode?: SortOrder
    RoomID?: SortOrder
    GradeID?: SortOrder
    IsLocked?: SortOrder
  }

  export type class_scheduleMinOrderByAggregateInput = {
    ClassID?: SortOrder
    TimeslotID?: SortOrder
    SubjectCode?: SortOrder
    RoomID?: SortOrder
    GradeID?: SortOrder
    IsLocked?: SortOrder
  }

  export type class_scheduleSumOrderByAggregateInput = {
    RoomID?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type Class_scheduleListRelationFilter = {
    every?: class_scheduleWhereInput
    some?: class_scheduleWhereInput
    none?: class_scheduleWhereInput
  }

  export type ProgramListRelationFilter = {
    every?: programWhereInput
    some?: programWhereInput
    none?: programWhereInput
  }

  export type class_scheduleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type programOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type gradelevelCountOrderByAggregateInput = {
    GradeID?: SortOrder
    Year?: SortOrder
    Number?: SortOrder
  }

  export type gradelevelAvgOrderByAggregateInput = {
    Year?: SortOrder
    Number?: SortOrder
  }

  export type gradelevelMaxOrderByAggregateInput = {
    GradeID?: SortOrder
    Year?: SortOrder
    Number?: SortOrder
  }

  export type gradelevelMinOrderByAggregateInput = {
    GradeID?: SortOrder
    Year?: SortOrder
    Number?: SortOrder
  }

  export type gradelevelSumOrderByAggregateInput = {
    Year?: SortOrder
    Number?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type roomCountOrderByAggregateInput = {
    RoomID?: SortOrder
    RoomName?: SortOrder
    Building?: SortOrder
    Floor?: SortOrder
  }

  export type roomAvgOrderByAggregateInput = {
    RoomID?: SortOrder
  }

  export type roomMaxOrderByAggregateInput = {
    RoomID?: SortOrder
    RoomName?: SortOrder
    Building?: SortOrder
    Floor?: SortOrder
  }

  export type roomMinOrderByAggregateInput = {
    RoomID?: SortOrder
    RoomName?: SortOrder
    Building?: SortOrder
    Floor?: SortOrder
  }

  export type roomSumOrderByAggregateInput = {
    RoomID?: SortOrder
  }

  export type Enumsubject_creditFilter<$PrismaModel = never> = {
    equals?: $Enums.subject_credit | Enumsubject_creditFieldRefInput<$PrismaModel>
    in?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    notIn?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    not?: NestedEnumsubject_creditFilter<$PrismaModel> | $Enums.subject_credit
  }

  export type ProgramNullableScalarRelationFilter = {
    is?: programWhereInput | null
    isNot?: programWhereInput | null
  }

  export type subjectCountOrderByAggregateInput = {
    SubjectCode?: SortOrder
    SubjectName?: SortOrder
    Credit?: SortOrder
    Category?: SortOrder
    ProgramID?: SortOrder
  }

  export type subjectAvgOrderByAggregateInput = {
    ProgramID?: SortOrder
  }

  export type subjectMaxOrderByAggregateInput = {
    SubjectCode?: SortOrder
    SubjectName?: SortOrder
    Credit?: SortOrder
    Category?: SortOrder
    ProgramID?: SortOrder
  }

  export type subjectMinOrderByAggregateInput = {
    SubjectCode?: SortOrder
    SubjectName?: SortOrder
    Credit?: SortOrder
    Category?: SortOrder
    ProgramID?: SortOrder
  }

  export type subjectSumOrderByAggregateInput = {
    ProgramID?: SortOrder
  }

  export type Enumsubject_creditWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.subject_credit | Enumsubject_creditFieldRefInput<$PrismaModel>
    in?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    notIn?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    not?: NestedEnumsubject_creditWithAggregatesFilter<$PrismaModel> | $Enums.subject_credit
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsubject_creditFilter<$PrismaModel>
    _max?: NestedEnumsubject_creditFilter<$PrismaModel>
  }

  export type EnumsemesterFilter<$PrismaModel = never> = {
    equals?: $Enums.semester | EnumsemesterFieldRefInput<$PrismaModel>
    in?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumsemesterFilter<$PrismaModel> | $Enums.semester
  }

  export type SubjectListRelationFilter = {
    every?: subjectWhereInput
    some?: subjectWhereInput
    none?: subjectWhereInput
  }

  export type GradelevelListRelationFilter = {
    every?: gradelevelWhereInput
    some?: gradelevelWhereInput
    none?: gradelevelWhereInput
  }

  export type subjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type gradelevelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type programProgramNameSemesterAcademicYearCompoundUniqueInput = {
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
  }

  export type programCountOrderByAggregateInput = {
    ProgramID?: SortOrder
    ProgramName?: SortOrder
    Semester?: SortOrder
    AcademicYear?: SortOrder
  }

  export type programAvgOrderByAggregateInput = {
    ProgramID?: SortOrder
    AcademicYear?: SortOrder
  }

  export type programMaxOrderByAggregateInput = {
    ProgramID?: SortOrder
    ProgramName?: SortOrder
    Semester?: SortOrder
    AcademicYear?: SortOrder
  }

  export type programMinOrderByAggregateInput = {
    ProgramID?: SortOrder
    ProgramName?: SortOrder
    Semester?: SortOrder
    AcademicYear?: SortOrder
  }

  export type programSumOrderByAggregateInput = {
    ProgramID?: SortOrder
    AcademicYear?: SortOrder
  }

  export type EnumsemesterWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.semester | EnumsemesterFieldRefInput<$PrismaModel>
    in?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumsemesterWithAggregatesFilter<$PrismaModel> | $Enums.semester
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsemesterFilter<$PrismaModel>
    _max?: NestedEnumsemesterFilter<$PrismaModel>
  }

  export type teacherCountOrderByAggregateInput = {
    TeacherID?: SortOrder
    Prefix?: SortOrder
    Firstname?: SortOrder
    Lastname?: SortOrder
    Department?: SortOrder
    Email?: SortOrder
    Role?: SortOrder
  }

  export type teacherAvgOrderByAggregateInput = {
    TeacherID?: SortOrder
  }

  export type teacherMaxOrderByAggregateInput = {
    TeacherID?: SortOrder
    Prefix?: SortOrder
    Firstname?: SortOrder
    Lastname?: SortOrder
    Department?: SortOrder
    Email?: SortOrder
    Role?: SortOrder
  }

  export type teacherMinOrderByAggregateInput = {
    TeacherID?: SortOrder
    Prefix?: SortOrder
    Firstname?: SortOrder
    Lastname?: SortOrder
    Department?: SortOrder
    Email?: SortOrder
    Role?: SortOrder
  }

  export type teacherSumOrderByAggregateInput = {
    TeacherID?: SortOrder
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EnumbreaktimeFilter<$PrismaModel = never> = {
    equals?: $Enums.breaktime | EnumbreaktimeFieldRefInput<$PrismaModel>
    in?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    not?: NestedEnumbreaktimeFilter<$PrismaModel> | $Enums.breaktime
  }

  export type Enumday_of_weekFilter<$PrismaModel = never> = {
    equals?: $Enums.day_of_week | Enumday_of_weekFieldRefInput<$PrismaModel>
    in?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    notIn?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    not?: NestedEnumday_of_weekFilter<$PrismaModel> | $Enums.day_of_week
  }

  export type timeslotCountOrderByAggregateInput = {
    TimeslotID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    StartTime?: SortOrder
    EndTime?: SortOrder
    Breaktime?: SortOrder
    DayOfWeek?: SortOrder
  }

  export type timeslotAvgOrderByAggregateInput = {
    AcademicYear?: SortOrder
  }

  export type timeslotMaxOrderByAggregateInput = {
    TimeslotID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    StartTime?: SortOrder
    EndTime?: SortOrder
    Breaktime?: SortOrder
    DayOfWeek?: SortOrder
  }

  export type timeslotMinOrderByAggregateInput = {
    TimeslotID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    StartTime?: SortOrder
    EndTime?: SortOrder
    Breaktime?: SortOrder
    DayOfWeek?: SortOrder
  }

  export type timeslotSumOrderByAggregateInput = {
    AcademicYear?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumbreaktimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.breaktime | EnumbreaktimeFieldRefInput<$PrismaModel>
    in?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    not?: NestedEnumbreaktimeWithAggregatesFilter<$PrismaModel> | $Enums.breaktime
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumbreaktimeFilter<$PrismaModel>
    _max?: NestedEnumbreaktimeFilter<$PrismaModel>
  }

  export type Enumday_of_weekWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.day_of_week | Enumday_of_weekFieldRefInput<$PrismaModel>
    in?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    notIn?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    not?: NestedEnumday_of_weekWithAggregatesFilter<$PrismaModel> | $Enums.day_of_week
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumday_of_weekFilter<$PrismaModel>
    _max?: NestedEnumday_of_weekFilter<$PrismaModel>
  }

  export type TeacherScalarRelationFilter = {
    is?: teacherWhereInput
    isNot?: teacherWhereInput
  }

  export type teachers_responsibilityCountOrderByAggregateInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    GradeID?: SortOrder
    SubjectCode?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    TeachHour?: SortOrder
  }

  export type teachers_responsibilityAvgOrderByAggregateInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    AcademicYear?: SortOrder
    TeachHour?: SortOrder
  }

  export type teachers_responsibilityMaxOrderByAggregateInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    GradeID?: SortOrder
    SubjectCode?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    TeachHour?: SortOrder
  }

  export type teachers_responsibilityMinOrderByAggregateInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    GradeID?: SortOrder
    SubjectCode?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    TeachHour?: SortOrder
  }

  export type teachers_responsibilitySumOrderByAggregateInput = {
    RespID?: SortOrder
    TeacherID?: SortOrder
    AcademicYear?: SortOrder
    TeachHour?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumSemesterStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SemesterStatus | EnumSemesterStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterStatusFilter<$PrismaModel> | $Enums.SemesterStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type table_configCountOrderByAggregateInput = {
    ConfigID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    Config?: SortOrder
    status?: SortOrder
    publishedAt?: SortOrder
    isPinned?: SortOrder
    lastAccessedAt?: SortOrder
    configCompleteness?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type table_configAvgOrderByAggregateInput = {
    AcademicYear?: SortOrder
    configCompleteness?: SortOrder
  }

  export type table_configMaxOrderByAggregateInput = {
    ConfigID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    status?: SortOrder
    publishedAt?: SortOrder
    isPinned?: SortOrder
    lastAccessedAt?: SortOrder
    configCompleteness?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type table_configMinOrderByAggregateInput = {
    ConfigID?: SortOrder
    AcademicYear?: SortOrder
    Semester?: SortOrder
    status?: SortOrder
    publishedAt?: SortOrder
    isPinned?: SortOrder
    lastAccessedAt?: SortOrder
    configCompleteness?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type table_configSumOrderByAggregateInput = {
    AcademicYear?: SortOrder
    configCompleteness?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumSemesterStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SemesterStatus | EnumSemesterStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterStatusWithAggregatesFilter<$PrismaModel> | $Enums.SemesterStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSemesterStatusFilter<$PrismaModel>
    _max?: NestedEnumSemesterStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type AccountProviderProviderAccountIdCompoundUniqueInput = {
    provider: string
    providerAccountId: string
  }

  export type AccountCountOrderByAggregateInput = {
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountAvgOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountSumOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type SessionCountOrderByAggregateInput = {
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationTokenIdentifierTokenCompoundUniqueInput = {
    identifier: string
    token: string
  }

  export type VerificationTokenCountOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMaxOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMinOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type gradelevelCreateNestedOneWithoutClass_scheduleInput = {
    create?: XOR<gradelevelCreateWithoutClass_scheduleInput, gradelevelUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: gradelevelCreateOrConnectWithoutClass_scheduleInput
    connect?: gradelevelWhereUniqueInput
  }

  export type roomCreateNestedOneWithoutClass_scheduleInput = {
    create?: XOR<roomCreateWithoutClass_scheduleInput, roomUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: roomCreateOrConnectWithoutClass_scheduleInput
    connect?: roomWhereUniqueInput
  }

  export type subjectCreateNestedOneWithoutClass_scheduleInput = {
    create?: XOR<subjectCreateWithoutClass_scheduleInput, subjectUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: subjectCreateOrConnectWithoutClass_scheduleInput
    connect?: subjectWhereUniqueInput
  }

  export type timeslotCreateNestedOneWithoutClass_scheduleInput = {
    create?: XOR<timeslotCreateWithoutClass_scheduleInput, timeslotUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: timeslotCreateOrConnectWithoutClass_scheduleInput
    connect?: timeslotWhereUniqueInput
  }

  export type teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput = {
    create?: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput> | teachers_responsibilityCreateWithoutClass_scheduleInput[] | teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput | teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput = {
    create?: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput> | teachers_responsibilityCreateWithoutClass_scheduleInput[] | teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput | teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput = {
    create?: XOR<gradelevelCreateWithoutClass_scheduleInput, gradelevelUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: gradelevelCreateOrConnectWithoutClass_scheduleInput
    upsert?: gradelevelUpsertWithoutClass_scheduleInput
    connect?: gradelevelWhereUniqueInput
    update?: XOR<XOR<gradelevelUpdateToOneWithWhereWithoutClass_scheduleInput, gradelevelUpdateWithoutClass_scheduleInput>, gradelevelUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type roomUpdateOneWithoutClass_scheduleNestedInput = {
    create?: XOR<roomCreateWithoutClass_scheduleInput, roomUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: roomCreateOrConnectWithoutClass_scheduleInput
    upsert?: roomUpsertWithoutClass_scheduleInput
    disconnect?: roomWhereInput | boolean
    delete?: roomWhereInput | boolean
    connect?: roomWhereUniqueInput
    update?: XOR<XOR<roomUpdateToOneWithWhereWithoutClass_scheduleInput, roomUpdateWithoutClass_scheduleInput>, roomUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type subjectUpdateOneRequiredWithoutClass_scheduleNestedInput = {
    create?: XOR<subjectCreateWithoutClass_scheduleInput, subjectUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: subjectCreateOrConnectWithoutClass_scheduleInput
    upsert?: subjectUpsertWithoutClass_scheduleInput
    connect?: subjectWhereUniqueInput
    update?: XOR<XOR<subjectUpdateToOneWithWhereWithoutClass_scheduleInput, subjectUpdateWithoutClass_scheduleInput>, subjectUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput = {
    create?: XOR<timeslotCreateWithoutClass_scheduleInput, timeslotUncheckedCreateWithoutClass_scheduleInput>
    connectOrCreate?: timeslotCreateOrConnectWithoutClass_scheduleInput
    upsert?: timeslotUpsertWithoutClass_scheduleInput
    connect?: timeslotWhereUniqueInput
    update?: XOR<XOR<timeslotUpdateToOneWithWhereWithoutClass_scheduleInput, timeslotUpdateWithoutClass_scheduleInput>, timeslotUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput> | teachers_responsibilityCreateWithoutClass_scheduleInput[] | teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput | teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutClass_scheduleInput | teachers_responsibilityUpsertWithWhereUniqueWithoutClass_scheduleInput[]
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutClass_scheduleInput | teachers_responsibilityUpdateWithWhereUniqueWithoutClass_scheduleInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutClass_scheduleInput | teachers_responsibilityUpdateManyWithWhereWithoutClass_scheduleInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput> | teachers_responsibilityCreateWithoutClass_scheduleInput[] | teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput | teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutClass_scheduleInput | teachers_responsibilityUpsertWithWhereUniqueWithoutClass_scheduleInput[]
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutClass_scheduleInput | teachers_responsibilityUpdateWithWhereUniqueWithoutClass_scheduleInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutClass_scheduleInput | teachers_responsibilityUpdateManyWithWhereWithoutClass_scheduleInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type class_scheduleCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput> | class_scheduleCreateWithoutGradelevelInput[] | class_scheduleUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutGradelevelInput | class_scheduleCreateOrConnectWithoutGradelevelInput[]
    createMany?: class_scheduleCreateManyGradelevelInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type teachers_responsibilityCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput> | teachers_responsibilityCreateWithoutGradelevelInput[] | teachers_responsibilityUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutGradelevelInput | teachers_responsibilityCreateOrConnectWithoutGradelevelInput[]
    createMany?: teachers_responsibilityCreateManyGradelevelInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type programCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput> | programCreateWithoutGradelevelInput[] | programUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: programCreateOrConnectWithoutGradelevelInput | programCreateOrConnectWithoutGradelevelInput[]
    connect?: programWhereUniqueInput | programWhereUniqueInput[]
  }

  export type class_scheduleUncheckedCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput> | class_scheduleCreateWithoutGradelevelInput[] | class_scheduleUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutGradelevelInput | class_scheduleCreateOrConnectWithoutGradelevelInput[]
    createMany?: class_scheduleCreateManyGradelevelInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type teachers_responsibilityUncheckedCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput> | teachers_responsibilityCreateWithoutGradelevelInput[] | teachers_responsibilityUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutGradelevelInput | teachers_responsibilityCreateOrConnectWithoutGradelevelInput[]
    createMany?: teachers_responsibilityCreateManyGradelevelInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type programUncheckedCreateNestedManyWithoutGradelevelInput = {
    create?: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput> | programCreateWithoutGradelevelInput[] | programUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: programCreateOrConnectWithoutGradelevelInput | programCreateOrConnectWithoutGradelevelInput[]
    connect?: programWhereUniqueInput | programWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type class_scheduleUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput> | class_scheduleCreateWithoutGradelevelInput[] | class_scheduleUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutGradelevelInput | class_scheduleCreateOrConnectWithoutGradelevelInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutGradelevelInput | class_scheduleUpsertWithWhereUniqueWithoutGradelevelInput[]
    createMany?: class_scheduleCreateManyGradelevelInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutGradelevelInput | class_scheduleUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutGradelevelInput | class_scheduleUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type teachers_responsibilityUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput> | teachers_responsibilityCreateWithoutGradelevelInput[] | teachers_responsibilityUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutGradelevelInput | teachers_responsibilityCreateOrConnectWithoutGradelevelInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutGradelevelInput | teachers_responsibilityUpsertWithWhereUniqueWithoutGradelevelInput[]
    createMany?: teachers_responsibilityCreateManyGradelevelInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutGradelevelInput | teachers_responsibilityUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutGradelevelInput | teachers_responsibilityUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type programUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput> | programCreateWithoutGradelevelInput[] | programUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: programCreateOrConnectWithoutGradelevelInput | programCreateOrConnectWithoutGradelevelInput[]
    upsert?: programUpsertWithWhereUniqueWithoutGradelevelInput | programUpsertWithWhereUniqueWithoutGradelevelInput[]
    set?: programWhereUniqueInput | programWhereUniqueInput[]
    disconnect?: programWhereUniqueInput | programWhereUniqueInput[]
    delete?: programWhereUniqueInput | programWhereUniqueInput[]
    connect?: programWhereUniqueInput | programWhereUniqueInput[]
    update?: programUpdateWithWhereUniqueWithoutGradelevelInput | programUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: programUpdateManyWithWhereWithoutGradelevelInput | programUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: programScalarWhereInput | programScalarWhereInput[]
  }

  export type class_scheduleUncheckedUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput> | class_scheduleCreateWithoutGradelevelInput[] | class_scheduleUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutGradelevelInput | class_scheduleCreateOrConnectWithoutGradelevelInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutGradelevelInput | class_scheduleUpsertWithWhereUniqueWithoutGradelevelInput[]
    createMany?: class_scheduleCreateManyGradelevelInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutGradelevelInput | class_scheduleUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutGradelevelInput | class_scheduleUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput> | teachers_responsibilityCreateWithoutGradelevelInput[] | teachers_responsibilityUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutGradelevelInput | teachers_responsibilityCreateOrConnectWithoutGradelevelInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutGradelevelInput | teachers_responsibilityUpsertWithWhereUniqueWithoutGradelevelInput[]
    createMany?: teachers_responsibilityCreateManyGradelevelInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutGradelevelInput | teachers_responsibilityUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutGradelevelInput | teachers_responsibilityUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type programUncheckedUpdateManyWithoutGradelevelNestedInput = {
    create?: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput> | programCreateWithoutGradelevelInput[] | programUncheckedCreateWithoutGradelevelInput[]
    connectOrCreate?: programCreateOrConnectWithoutGradelevelInput | programCreateOrConnectWithoutGradelevelInput[]
    upsert?: programUpsertWithWhereUniqueWithoutGradelevelInput | programUpsertWithWhereUniqueWithoutGradelevelInput[]
    set?: programWhereUniqueInput | programWhereUniqueInput[]
    disconnect?: programWhereUniqueInput | programWhereUniqueInput[]
    delete?: programWhereUniqueInput | programWhereUniqueInput[]
    connect?: programWhereUniqueInput | programWhereUniqueInput[]
    update?: programUpdateWithWhereUniqueWithoutGradelevelInput | programUpdateWithWhereUniqueWithoutGradelevelInput[]
    updateMany?: programUpdateManyWithWhereWithoutGradelevelInput | programUpdateManyWithWhereWithoutGradelevelInput[]
    deleteMany?: programScalarWhereInput | programScalarWhereInput[]
  }

  export type class_scheduleCreateNestedManyWithoutRoomInput = {
    create?: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput> | class_scheduleCreateWithoutRoomInput[] | class_scheduleUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutRoomInput | class_scheduleCreateOrConnectWithoutRoomInput[]
    createMany?: class_scheduleCreateManyRoomInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type class_scheduleUncheckedCreateNestedManyWithoutRoomInput = {
    create?: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput> | class_scheduleCreateWithoutRoomInput[] | class_scheduleUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutRoomInput | class_scheduleCreateOrConnectWithoutRoomInput[]
    createMany?: class_scheduleCreateManyRoomInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type class_scheduleUpdateManyWithoutRoomNestedInput = {
    create?: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput> | class_scheduleCreateWithoutRoomInput[] | class_scheduleUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutRoomInput | class_scheduleCreateOrConnectWithoutRoomInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutRoomInput | class_scheduleUpsertWithWhereUniqueWithoutRoomInput[]
    createMany?: class_scheduleCreateManyRoomInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutRoomInput | class_scheduleUpdateWithWhereUniqueWithoutRoomInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutRoomInput | class_scheduleUpdateManyWithWhereWithoutRoomInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type class_scheduleUncheckedUpdateManyWithoutRoomNestedInput = {
    create?: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput> | class_scheduleCreateWithoutRoomInput[] | class_scheduleUncheckedCreateWithoutRoomInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutRoomInput | class_scheduleCreateOrConnectWithoutRoomInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutRoomInput | class_scheduleUpsertWithWhereUniqueWithoutRoomInput[]
    createMany?: class_scheduleCreateManyRoomInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutRoomInput | class_scheduleUpdateWithWhereUniqueWithoutRoomInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutRoomInput | class_scheduleUpdateManyWithWhereWithoutRoomInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type class_scheduleCreateNestedManyWithoutSubjectInput = {
    create?: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput> | class_scheduleCreateWithoutSubjectInput[] | class_scheduleUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutSubjectInput | class_scheduleCreateOrConnectWithoutSubjectInput[]
    createMany?: class_scheduleCreateManySubjectInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type programCreateNestedOneWithoutSubjectInput = {
    create?: XOR<programCreateWithoutSubjectInput, programUncheckedCreateWithoutSubjectInput>
    connectOrCreate?: programCreateOrConnectWithoutSubjectInput
    connect?: programWhereUniqueInput
  }

  export type teachers_responsibilityCreateNestedManyWithoutSubjectInput = {
    create?: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput> | teachers_responsibilityCreateWithoutSubjectInput[] | teachers_responsibilityUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutSubjectInput | teachers_responsibilityCreateOrConnectWithoutSubjectInput[]
    createMany?: teachers_responsibilityCreateManySubjectInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type class_scheduleUncheckedCreateNestedManyWithoutSubjectInput = {
    create?: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput> | class_scheduleCreateWithoutSubjectInput[] | class_scheduleUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutSubjectInput | class_scheduleCreateOrConnectWithoutSubjectInput[]
    createMany?: class_scheduleCreateManySubjectInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type teachers_responsibilityUncheckedCreateNestedManyWithoutSubjectInput = {
    create?: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput> | teachers_responsibilityCreateWithoutSubjectInput[] | teachers_responsibilityUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutSubjectInput | teachers_responsibilityCreateOrConnectWithoutSubjectInput[]
    createMany?: teachers_responsibilityCreateManySubjectInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type Enumsubject_creditFieldUpdateOperationsInput = {
    set?: $Enums.subject_credit
  }

  export type class_scheduleUpdateManyWithoutSubjectNestedInput = {
    create?: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput> | class_scheduleCreateWithoutSubjectInput[] | class_scheduleUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutSubjectInput | class_scheduleCreateOrConnectWithoutSubjectInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutSubjectInput | class_scheduleUpsertWithWhereUniqueWithoutSubjectInput[]
    createMany?: class_scheduleCreateManySubjectInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutSubjectInput | class_scheduleUpdateWithWhereUniqueWithoutSubjectInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutSubjectInput | class_scheduleUpdateManyWithWhereWithoutSubjectInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type programUpdateOneWithoutSubjectNestedInput = {
    create?: XOR<programCreateWithoutSubjectInput, programUncheckedCreateWithoutSubjectInput>
    connectOrCreate?: programCreateOrConnectWithoutSubjectInput
    upsert?: programUpsertWithoutSubjectInput
    disconnect?: programWhereInput | boolean
    delete?: programWhereInput | boolean
    connect?: programWhereUniqueInput
    update?: XOR<XOR<programUpdateToOneWithWhereWithoutSubjectInput, programUpdateWithoutSubjectInput>, programUncheckedUpdateWithoutSubjectInput>
  }

  export type teachers_responsibilityUpdateManyWithoutSubjectNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput> | teachers_responsibilityCreateWithoutSubjectInput[] | teachers_responsibilityUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutSubjectInput | teachers_responsibilityCreateOrConnectWithoutSubjectInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutSubjectInput | teachers_responsibilityUpsertWithWhereUniqueWithoutSubjectInput[]
    createMany?: teachers_responsibilityCreateManySubjectInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutSubjectInput | teachers_responsibilityUpdateWithWhereUniqueWithoutSubjectInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutSubjectInput | teachers_responsibilityUpdateManyWithWhereWithoutSubjectInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type class_scheduleUncheckedUpdateManyWithoutSubjectNestedInput = {
    create?: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput> | class_scheduleCreateWithoutSubjectInput[] | class_scheduleUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutSubjectInput | class_scheduleCreateOrConnectWithoutSubjectInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutSubjectInput | class_scheduleUpsertWithWhereUniqueWithoutSubjectInput[]
    createMany?: class_scheduleCreateManySubjectInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutSubjectInput | class_scheduleUpdateWithWhereUniqueWithoutSubjectInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutSubjectInput | class_scheduleUpdateManyWithWhereWithoutSubjectInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutSubjectNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput> | teachers_responsibilityCreateWithoutSubjectInput[] | teachers_responsibilityUncheckedCreateWithoutSubjectInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutSubjectInput | teachers_responsibilityCreateOrConnectWithoutSubjectInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutSubjectInput | teachers_responsibilityUpsertWithWhereUniqueWithoutSubjectInput[]
    createMany?: teachers_responsibilityCreateManySubjectInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutSubjectInput | teachers_responsibilityUpdateWithWhereUniqueWithoutSubjectInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutSubjectInput | teachers_responsibilityUpdateManyWithWhereWithoutSubjectInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type subjectCreateNestedManyWithoutProgramInput = {
    create?: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput> | subjectCreateWithoutProgramInput[] | subjectUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: subjectCreateOrConnectWithoutProgramInput | subjectCreateOrConnectWithoutProgramInput[]
    createMany?: subjectCreateManyProgramInputEnvelope
    connect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
  }

  export type gradelevelCreateNestedManyWithoutProgramInput = {
    create?: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput> | gradelevelCreateWithoutProgramInput[] | gradelevelUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: gradelevelCreateOrConnectWithoutProgramInput | gradelevelCreateOrConnectWithoutProgramInput[]
    connect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
  }

  export type subjectUncheckedCreateNestedManyWithoutProgramInput = {
    create?: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput> | subjectCreateWithoutProgramInput[] | subjectUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: subjectCreateOrConnectWithoutProgramInput | subjectCreateOrConnectWithoutProgramInput[]
    createMany?: subjectCreateManyProgramInputEnvelope
    connect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
  }

  export type gradelevelUncheckedCreateNestedManyWithoutProgramInput = {
    create?: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput> | gradelevelCreateWithoutProgramInput[] | gradelevelUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: gradelevelCreateOrConnectWithoutProgramInput | gradelevelCreateOrConnectWithoutProgramInput[]
    connect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
  }

  export type EnumsemesterFieldUpdateOperationsInput = {
    set?: $Enums.semester
  }

  export type subjectUpdateManyWithoutProgramNestedInput = {
    create?: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput> | subjectCreateWithoutProgramInput[] | subjectUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: subjectCreateOrConnectWithoutProgramInput | subjectCreateOrConnectWithoutProgramInput[]
    upsert?: subjectUpsertWithWhereUniqueWithoutProgramInput | subjectUpsertWithWhereUniqueWithoutProgramInput[]
    createMany?: subjectCreateManyProgramInputEnvelope
    set?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    disconnect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    delete?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    connect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    update?: subjectUpdateWithWhereUniqueWithoutProgramInput | subjectUpdateWithWhereUniqueWithoutProgramInput[]
    updateMany?: subjectUpdateManyWithWhereWithoutProgramInput | subjectUpdateManyWithWhereWithoutProgramInput[]
    deleteMany?: subjectScalarWhereInput | subjectScalarWhereInput[]
  }

  export type gradelevelUpdateManyWithoutProgramNestedInput = {
    create?: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput> | gradelevelCreateWithoutProgramInput[] | gradelevelUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: gradelevelCreateOrConnectWithoutProgramInput | gradelevelCreateOrConnectWithoutProgramInput[]
    upsert?: gradelevelUpsertWithWhereUniqueWithoutProgramInput | gradelevelUpsertWithWhereUniqueWithoutProgramInput[]
    set?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    disconnect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    delete?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    connect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    update?: gradelevelUpdateWithWhereUniqueWithoutProgramInput | gradelevelUpdateWithWhereUniqueWithoutProgramInput[]
    updateMany?: gradelevelUpdateManyWithWhereWithoutProgramInput | gradelevelUpdateManyWithWhereWithoutProgramInput[]
    deleteMany?: gradelevelScalarWhereInput | gradelevelScalarWhereInput[]
  }

  export type subjectUncheckedUpdateManyWithoutProgramNestedInput = {
    create?: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput> | subjectCreateWithoutProgramInput[] | subjectUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: subjectCreateOrConnectWithoutProgramInput | subjectCreateOrConnectWithoutProgramInput[]
    upsert?: subjectUpsertWithWhereUniqueWithoutProgramInput | subjectUpsertWithWhereUniqueWithoutProgramInput[]
    createMany?: subjectCreateManyProgramInputEnvelope
    set?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    disconnect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    delete?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    connect?: subjectWhereUniqueInput | subjectWhereUniqueInput[]
    update?: subjectUpdateWithWhereUniqueWithoutProgramInput | subjectUpdateWithWhereUniqueWithoutProgramInput[]
    updateMany?: subjectUpdateManyWithWhereWithoutProgramInput | subjectUpdateManyWithWhereWithoutProgramInput[]
    deleteMany?: subjectScalarWhereInput | subjectScalarWhereInput[]
  }

  export type gradelevelUncheckedUpdateManyWithoutProgramNestedInput = {
    create?: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput> | gradelevelCreateWithoutProgramInput[] | gradelevelUncheckedCreateWithoutProgramInput[]
    connectOrCreate?: gradelevelCreateOrConnectWithoutProgramInput | gradelevelCreateOrConnectWithoutProgramInput[]
    upsert?: gradelevelUpsertWithWhereUniqueWithoutProgramInput | gradelevelUpsertWithWhereUniqueWithoutProgramInput[]
    set?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    disconnect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    delete?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    connect?: gradelevelWhereUniqueInput | gradelevelWhereUniqueInput[]
    update?: gradelevelUpdateWithWhereUniqueWithoutProgramInput | gradelevelUpdateWithWhereUniqueWithoutProgramInput[]
    updateMany?: gradelevelUpdateManyWithWhereWithoutProgramInput | gradelevelUpdateManyWithWhereWithoutProgramInput[]
    deleteMany?: gradelevelScalarWhereInput | gradelevelScalarWhereInput[]
  }

  export type teachers_responsibilityCreateNestedManyWithoutTeacherInput = {
    create?: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput> | teachers_responsibilityCreateWithoutTeacherInput[] | teachers_responsibilityUncheckedCreateWithoutTeacherInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutTeacherInput | teachers_responsibilityCreateOrConnectWithoutTeacherInput[]
    createMany?: teachers_responsibilityCreateManyTeacherInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type teachers_responsibilityUncheckedCreateNestedManyWithoutTeacherInput = {
    create?: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput> | teachers_responsibilityCreateWithoutTeacherInput[] | teachers_responsibilityUncheckedCreateWithoutTeacherInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutTeacherInput | teachers_responsibilityCreateOrConnectWithoutTeacherInput[]
    createMany?: teachers_responsibilityCreateManyTeacherInputEnvelope
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
  }

  export type teachers_responsibilityUpdateManyWithoutTeacherNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput> | teachers_responsibilityCreateWithoutTeacherInput[] | teachers_responsibilityUncheckedCreateWithoutTeacherInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutTeacherInput | teachers_responsibilityCreateOrConnectWithoutTeacherInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutTeacherInput | teachers_responsibilityUpsertWithWhereUniqueWithoutTeacherInput[]
    createMany?: teachers_responsibilityCreateManyTeacherInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutTeacherInput | teachers_responsibilityUpdateWithWhereUniqueWithoutTeacherInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutTeacherInput | teachers_responsibilityUpdateManyWithWhereWithoutTeacherInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutTeacherNestedInput = {
    create?: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput> | teachers_responsibilityCreateWithoutTeacherInput[] | teachers_responsibilityUncheckedCreateWithoutTeacherInput[]
    connectOrCreate?: teachers_responsibilityCreateOrConnectWithoutTeacherInput | teachers_responsibilityCreateOrConnectWithoutTeacherInput[]
    upsert?: teachers_responsibilityUpsertWithWhereUniqueWithoutTeacherInput | teachers_responsibilityUpsertWithWhereUniqueWithoutTeacherInput[]
    createMany?: teachers_responsibilityCreateManyTeacherInputEnvelope
    set?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    disconnect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    delete?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    connect?: teachers_responsibilityWhereUniqueInput | teachers_responsibilityWhereUniqueInput[]
    update?: teachers_responsibilityUpdateWithWhereUniqueWithoutTeacherInput | teachers_responsibilityUpdateWithWhereUniqueWithoutTeacherInput[]
    updateMany?: teachers_responsibilityUpdateManyWithWhereWithoutTeacherInput | teachers_responsibilityUpdateManyWithWhereWithoutTeacherInput[]
    deleteMany?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
  }

  export type class_scheduleCreateNestedManyWithoutTimeslotInput = {
    create?: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput> | class_scheduleCreateWithoutTimeslotInput[] | class_scheduleUncheckedCreateWithoutTimeslotInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTimeslotInput | class_scheduleCreateOrConnectWithoutTimeslotInput[]
    createMany?: class_scheduleCreateManyTimeslotInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type class_scheduleUncheckedCreateNestedManyWithoutTimeslotInput = {
    create?: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput> | class_scheduleCreateWithoutTimeslotInput[] | class_scheduleUncheckedCreateWithoutTimeslotInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTimeslotInput | class_scheduleCreateOrConnectWithoutTimeslotInput[]
    createMany?: class_scheduleCreateManyTimeslotInputEnvelope
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumbreaktimeFieldUpdateOperationsInput = {
    set?: $Enums.breaktime
  }

  export type Enumday_of_weekFieldUpdateOperationsInput = {
    set?: $Enums.day_of_week
  }

  export type class_scheduleUpdateManyWithoutTimeslotNestedInput = {
    create?: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput> | class_scheduleCreateWithoutTimeslotInput[] | class_scheduleUncheckedCreateWithoutTimeslotInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTimeslotInput | class_scheduleCreateOrConnectWithoutTimeslotInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutTimeslotInput | class_scheduleUpsertWithWhereUniqueWithoutTimeslotInput[]
    createMany?: class_scheduleCreateManyTimeslotInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutTimeslotInput | class_scheduleUpdateWithWhereUniqueWithoutTimeslotInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutTimeslotInput | class_scheduleUpdateManyWithWhereWithoutTimeslotInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type class_scheduleUncheckedUpdateManyWithoutTimeslotNestedInput = {
    create?: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput> | class_scheduleCreateWithoutTimeslotInput[] | class_scheduleUncheckedCreateWithoutTimeslotInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTimeslotInput | class_scheduleCreateOrConnectWithoutTimeslotInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutTimeslotInput | class_scheduleUpsertWithWhereUniqueWithoutTimeslotInput[]
    createMany?: class_scheduleCreateManyTimeslotInputEnvelope
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutTimeslotInput | class_scheduleUpdateWithWhereUniqueWithoutTimeslotInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutTimeslotInput | class_scheduleUpdateManyWithWhereWithoutTimeslotInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type gradelevelCreateNestedOneWithoutTeachers_responsibilityInput = {
    create?: XOR<gradelevelCreateWithoutTeachers_responsibilityInput, gradelevelUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: gradelevelCreateOrConnectWithoutTeachers_responsibilityInput
    connect?: gradelevelWhereUniqueInput
  }

  export type subjectCreateNestedOneWithoutTeachers_responsibilityInput = {
    create?: XOR<subjectCreateWithoutTeachers_responsibilityInput, subjectUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: subjectCreateOrConnectWithoutTeachers_responsibilityInput
    connect?: subjectWhereUniqueInput
  }

  export type teacherCreateNestedOneWithoutTeachers_responsibilityInput = {
    create?: XOR<teacherCreateWithoutTeachers_responsibilityInput, teacherUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: teacherCreateOrConnectWithoutTeachers_responsibilityInput
    connect?: teacherWhereUniqueInput
  }

  export type class_scheduleCreateNestedManyWithoutTeachers_responsibilityInput = {
    create?: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput> | class_scheduleCreateWithoutTeachers_responsibilityInput[] | class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput | class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type class_scheduleUncheckedCreateNestedManyWithoutTeachers_responsibilityInput = {
    create?: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput> | class_scheduleCreateWithoutTeachers_responsibilityInput[] | class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput | class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
  }

  export type gradelevelUpdateOneRequiredWithoutTeachers_responsibilityNestedInput = {
    create?: XOR<gradelevelCreateWithoutTeachers_responsibilityInput, gradelevelUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: gradelevelCreateOrConnectWithoutTeachers_responsibilityInput
    upsert?: gradelevelUpsertWithoutTeachers_responsibilityInput
    connect?: gradelevelWhereUniqueInput
    update?: XOR<XOR<gradelevelUpdateToOneWithWhereWithoutTeachers_responsibilityInput, gradelevelUpdateWithoutTeachers_responsibilityInput>, gradelevelUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type subjectUpdateOneRequiredWithoutTeachers_responsibilityNestedInput = {
    create?: XOR<subjectCreateWithoutTeachers_responsibilityInput, subjectUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: subjectCreateOrConnectWithoutTeachers_responsibilityInput
    upsert?: subjectUpsertWithoutTeachers_responsibilityInput
    connect?: subjectWhereUniqueInput
    update?: XOR<XOR<subjectUpdateToOneWithWhereWithoutTeachers_responsibilityInput, subjectUpdateWithoutTeachers_responsibilityInput>, subjectUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type teacherUpdateOneRequiredWithoutTeachers_responsibilityNestedInput = {
    create?: XOR<teacherCreateWithoutTeachers_responsibilityInput, teacherUncheckedCreateWithoutTeachers_responsibilityInput>
    connectOrCreate?: teacherCreateOrConnectWithoutTeachers_responsibilityInput
    upsert?: teacherUpsertWithoutTeachers_responsibilityInput
    connect?: teacherWhereUniqueInput
    update?: XOR<XOR<teacherUpdateToOneWithWhereWithoutTeachers_responsibilityInput, teacherUpdateWithoutTeachers_responsibilityInput>, teacherUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type class_scheduleUpdateManyWithoutTeachers_responsibilityNestedInput = {
    create?: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput> | class_scheduleCreateWithoutTeachers_responsibilityInput[] | class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput | class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutTeachers_responsibilityInput | class_scheduleUpsertWithWhereUniqueWithoutTeachers_responsibilityInput[]
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutTeachers_responsibilityInput | class_scheduleUpdateWithWhereUniqueWithoutTeachers_responsibilityInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutTeachers_responsibilityInput | class_scheduleUpdateManyWithWhereWithoutTeachers_responsibilityInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityNestedInput = {
    create?: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput> | class_scheduleCreateWithoutTeachers_responsibilityInput[] | class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput[]
    connectOrCreate?: class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput | class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput[]
    upsert?: class_scheduleUpsertWithWhereUniqueWithoutTeachers_responsibilityInput | class_scheduleUpsertWithWhereUniqueWithoutTeachers_responsibilityInput[]
    set?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    disconnect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    delete?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    connect?: class_scheduleWhereUniqueInput | class_scheduleWhereUniqueInput[]
    update?: class_scheduleUpdateWithWhereUniqueWithoutTeachers_responsibilityInput | class_scheduleUpdateWithWhereUniqueWithoutTeachers_responsibilityInput[]
    updateMany?: class_scheduleUpdateManyWithWhereWithoutTeachers_responsibilityInput | class_scheduleUpdateManyWithWhereWithoutTeachers_responsibilityInput[]
    deleteMany?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
  }

  export type EnumSemesterStatusFieldUpdateOperationsInput = {
    set?: $Enums.SemesterStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type AccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    upsert?: UserUpsertWithoutAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumsubject_creditFilter<$PrismaModel = never> = {
    equals?: $Enums.subject_credit | Enumsubject_creditFieldRefInput<$PrismaModel>
    in?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    notIn?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    not?: NestedEnumsubject_creditFilter<$PrismaModel> | $Enums.subject_credit
  }

  export type NestedEnumsubject_creditWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.subject_credit | Enumsubject_creditFieldRefInput<$PrismaModel>
    in?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    notIn?: $Enums.subject_credit[] | ListEnumsubject_creditFieldRefInput<$PrismaModel>
    not?: NestedEnumsubject_creditWithAggregatesFilter<$PrismaModel> | $Enums.subject_credit
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsubject_creditFilter<$PrismaModel>
    _max?: NestedEnumsubject_creditFilter<$PrismaModel>
  }

  export type NestedEnumsemesterFilter<$PrismaModel = never> = {
    equals?: $Enums.semester | EnumsemesterFieldRefInput<$PrismaModel>
    in?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumsemesterFilter<$PrismaModel> | $Enums.semester
  }

  export type NestedEnumsemesterWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.semester | EnumsemesterFieldRefInput<$PrismaModel>
    in?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    notIn?: $Enums.semester[] | ListEnumsemesterFieldRefInput<$PrismaModel>
    not?: NestedEnumsemesterWithAggregatesFilter<$PrismaModel> | $Enums.semester
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumsemesterFilter<$PrismaModel>
    _max?: NestedEnumsemesterFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumbreaktimeFilter<$PrismaModel = never> = {
    equals?: $Enums.breaktime | EnumbreaktimeFieldRefInput<$PrismaModel>
    in?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    not?: NestedEnumbreaktimeFilter<$PrismaModel> | $Enums.breaktime
  }

  export type NestedEnumday_of_weekFilter<$PrismaModel = never> = {
    equals?: $Enums.day_of_week | Enumday_of_weekFieldRefInput<$PrismaModel>
    in?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    notIn?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    not?: NestedEnumday_of_weekFilter<$PrismaModel> | $Enums.day_of_week
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumbreaktimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.breaktime | EnumbreaktimeFieldRefInput<$PrismaModel>
    in?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.breaktime[] | ListEnumbreaktimeFieldRefInput<$PrismaModel>
    not?: NestedEnumbreaktimeWithAggregatesFilter<$PrismaModel> | $Enums.breaktime
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumbreaktimeFilter<$PrismaModel>
    _max?: NestedEnumbreaktimeFilter<$PrismaModel>
  }

  export type NestedEnumday_of_weekWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.day_of_week | Enumday_of_weekFieldRefInput<$PrismaModel>
    in?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    notIn?: $Enums.day_of_week[] | ListEnumday_of_weekFieldRefInput<$PrismaModel>
    not?: NestedEnumday_of_weekWithAggregatesFilter<$PrismaModel> | $Enums.day_of_week
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumday_of_weekFilter<$PrismaModel>
    _max?: NestedEnumday_of_weekFilter<$PrismaModel>
  }

  export type NestedEnumSemesterStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SemesterStatus | EnumSemesterStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterStatusFilter<$PrismaModel> | $Enums.SemesterStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumSemesterStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SemesterStatus | EnumSemesterStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SemesterStatus[] | ListEnumSemesterStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSemesterStatusWithAggregatesFilter<$PrismaModel> | $Enums.SemesterStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSemesterStatusFilter<$PrismaModel>
    _max?: NestedEnumSemesterStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type gradelevelCreateWithoutClass_scheduleInput = {
    GradeID: string
    Year: number
    Number: number
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutGradelevelInput
    program?: programCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelUncheckedCreateWithoutClass_scheduleInput = {
    GradeID: string
    Year: number
    Number: number
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutGradelevelInput
    program?: programUncheckedCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelCreateOrConnectWithoutClass_scheduleInput = {
    where: gradelevelWhereUniqueInput
    create: XOR<gradelevelCreateWithoutClass_scheduleInput, gradelevelUncheckedCreateWithoutClass_scheduleInput>
  }

  export type roomCreateWithoutClass_scheduleInput = {
    RoomName: string
    Building?: string
    Floor?: string
  }

  export type roomUncheckedCreateWithoutClass_scheduleInput = {
    RoomID?: number
    RoomName: string
    Building?: string
    Floor?: string
  }

  export type roomCreateOrConnectWithoutClass_scheduleInput = {
    where: roomWhereUniqueInput
    create: XOR<roomCreateWithoutClass_scheduleInput, roomUncheckedCreateWithoutClass_scheduleInput>
  }

  export type subjectCreateWithoutClass_scheduleInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    program?: programCreateNestedOneWithoutSubjectInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutSubjectInput
  }

  export type subjectUncheckedCreateWithoutClass_scheduleInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    ProgramID?: number | null
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutSubjectInput
  }

  export type subjectCreateOrConnectWithoutClass_scheduleInput = {
    where: subjectWhereUniqueInput
    create: XOR<subjectCreateWithoutClass_scheduleInput, subjectUncheckedCreateWithoutClass_scheduleInput>
  }

  export type timeslotCreateWithoutClass_scheduleInput = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date | string
    EndTime: Date | string
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
  }

  export type timeslotUncheckedCreateWithoutClass_scheduleInput = {
    TimeslotID: string
    AcademicYear: number
    Semester: $Enums.semester
    StartTime: Date | string
    EndTime: Date | string
    Breaktime: $Enums.breaktime
    DayOfWeek: $Enums.day_of_week
  }

  export type timeslotCreateOrConnectWithoutClass_scheduleInput = {
    where: timeslotWhereUniqueInput
    create: XOR<timeslotCreateWithoutClass_scheduleInput, timeslotUncheckedCreateWithoutClass_scheduleInput>
  }

  export type teachers_responsibilityCreateWithoutClass_scheduleInput = {
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    gradelevel: gradelevelCreateNestedOneWithoutTeachers_responsibilityInput
    subject: subjectCreateNestedOneWithoutTeachers_responsibilityInput
    teacher: teacherCreateNestedOneWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput = {
    RespID?: number
    TeacherID: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
  }

  export type teachers_responsibilityCreateOrConnectWithoutClass_scheduleInput = {
    where: teachers_responsibilityWhereUniqueInput
    create: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput>
  }

  export type gradelevelUpsertWithoutClass_scheduleInput = {
    update: XOR<gradelevelUpdateWithoutClass_scheduleInput, gradelevelUncheckedUpdateWithoutClass_scheduleInput>
    create: XOR<gradelevelCreateWithoutClass_scheduleInput, gradelevelUncheckedCreateWithoutClass_scheduleInput>
    where?: gradelevelWhereInput
  }

  export type gradelevelUpdateToOneWithWhereWithoutClass_scheduleInput = {
    where?: gradelevelWhereInput
    data: XOR<gradelevelUpdateWithoutClass_scheduleInput, gradelevelUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type gradelevelUpdateWithoutClass_scheduleInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutGradelevelNestedInput
    program?: programUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelUncheckedUpdateWithoutClass_scheduleInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutGradelevelNestedInput
    program?: programUncheckedUpdateManyWithoutGradelevelNestedInput
  }

  export type roomUpsertWithoutClass_scheduleInput = {
    update: XOR<roomUpdateWithoutClass_scheduleInput, roomUncheckedUpdateWithoutClass_scheduleInput>
    create: XOR<roomCreateWithoutClass_scheduleInput, roomUncheckedCreateWithoutClass_scheduleInput>
    where?: roomWhereInput
  }

  export type roomUpdateToOneWithWhereWithoutClass_scheduleInput = {
    where?: roomWhereInput
    data: XOR<roomUpdateWithoutClass_scheduleInput, roomUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type roomUpdateWithoutClass_scheduleInput = {
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
  }

  export type roomUncheckedUpdateWithoutClass_scheduleInput = {
    RoomID?: IntFieldUpdateOperationsInput | number
    RoomName?: StringFieldUpdateOperationsInput | string
    Building?: StringFieldUpdateOperationsInput | string
    Floor?: StringFieldUpdateOperationsInput | string
  }

  export type subjectUpsertWithoutClass_scheduleInput = {
    update: XOR<subjectUpdateWithoutClass_scheduleInput, subjectUncheckedUpdateWithoutClass_scheduleInput>
    create: XOR<subjectCreateWithoutClass_scheduleInput, subjectUncheckedCreateWithoutClass_scheduleInput>
    where?: subjectWhereInput
  }

  export type subjectUpdateToOneWithWhereWithoutClass_scheduleInput = {
    where?: subjectWhereInput
    data: XOR<subjectUpdateWithoutClass_scheduleInput, subjectUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type subjectUpdateWithoutClass_scheduleInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    program?: programUpdateOneWithoutSubjectNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutSubjectNestedInput
  }

  export type subjectUncheckedUpdateWithoutClass_scheduleInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    ProgramID?: NullableIntFieldUpdateOperationsInput | number | null
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutSubjectNestedInput
  }

  export type timeslotUpsertWithoutClass_scheduleInput = {
    update: XOR<timeslotUpdateWithoutClass_scheduleInput, timeslotUncheckedUpdateWithoutClass_scheduleInput>
    create: XOR<timeslotCreateWithoutClass_scheduleInput, timeslotUncheckedCreateWithoutClass_scheduleInput>
    where?: timeslotWhereInput
  }

  export type timeslotUpdateToOneWithWhereWithoutClass_scheduleInput = {
    where?: timeslotWhereInput
    data: XOR<timeslotUpdateWithoutClass_scheduleInput, timeslotUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type timeslotUpdateWithoutClass_scheduleInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
  }

  export type timeslotUncheckedUpdateWithoutClass_scheduleInput = {
    TimeslotID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    StartTime?: DateTimeFieldUpdateOperationsInput | Date | string
    EndTime?: DateTimeFieldUpdateOperationsInput | Date | string
    Breaktime?: EnumbreaktimeFieldUpdateOperationsInput | $Enums.breaktime
    DayOfWeek?: Enumday_of_weekFieldUpdateOperationsInput | $Enums.day_of_week
  }

  export type teachers_responsibilityUpsertWithWhereUniqueWithoutClass_scheduleInput = {
    where: teachers_responsibilityWhereUniqueInput
    update: XOR<teachers_responsibilityUpdateWithoutClass_scheduleInput, teachers_responsibilityUncheckedUpdateWithoutClass_scheduleInput>
    create: XOR<teachers_responsibilityCreateWithoutClass_scheduleInput, teachers_responsibilityUncheckedCreateWithoutClass_scheduleInput>
  }

  export type teachers_responsibilityUpdateWithWhereUniqueWithoutClass_scheduleInput = {
    where: teachers_responsibilityWhereUniqueInput
    data: XOR<teachers_responsibilityUpdateWithoutClass_scheduleInput, teachers_responsibilityUncheckedUpdateWithoutClass_scheduleInput>
  }

  export type teachers_responsibilityUpdateManyWithWhereWithoutClass_scheduleInput = {
    where: teachers_responsibilityScalarWhereInput
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleInput>
  }

  export type teachers_responsibilityScalarWhereInput = {
    AND?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
    OR?: teachers_responsibilityScalarWhereInput[]
    NOT?: teachers_responsibilityScalarWhereInput | teachers_responsibilityScalarWhereInput[]
    RespID?: IntFilter<"teachers_responsibility"> | number
    TeacherID?: IntFilter<"teachers_responsibility"> | number
    GradeID?: StringFilter<"teachers_responsibility"> | string
    SubjectCode?: StringFilter<"teachers_responsibility"> | string
    AcademicYear?: IntFilter<"teachers_responsibility"> | number
    Semester?: EnumsemesterFilter<"teachers_responsibility"> | $Enums.semester
    TeachHour?: IntFilter<"teachers_responsibility"> | number
  }

  export type class_scheduleCreateWithoutGradelevelInput = {
    ClassID: string
    IsLocked?: boolean
    room?: roomCreateNestedOneWithoutClass_scheduleInput
    subject: subjectCreateNestedOneWithoutClass_scheduleInput
    timeslot: timeslotCreateNestedOneWithoutClass_scheduleInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateWithoutGradelevelInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    IsLocked?: boolean
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleCreateOrConnectWithoutGradelevelInput = {
    where: class_scheduleWhereUniqueInput
    create: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput>
  }

  export type class_scheduleCreateManyGradelevelInputEnvelope = {
    data: class_scheduleCreateManyGradelevelInput | class_scheduleCreateManyGradelevelInput[]
    skipDuplicates?: boolean
  }

  export type teachers_responsibilityCreateWithoutGradelevelInput = {
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    subject: subjectCreateNestedOneWithoutTeachers_responsibilityInput
    teacher: teacherCreateNestedOneWithoutTeachers_responsibilityInput
    class_schedule?: class_scheduleCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUncheckedCreateWithoutGradelevelInput = {
    RespID?: number
    TeacherID: number
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityCreateOrConnectWithoutGradelevelInput = {
    where: teachers_responsibilityWhereUniqueInput
    create: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput>
  }

  export type teachers_responsibilityCreateManyGradelevelInputEnvelope = {
    data: teachers_responsibilityCreateManyGradelevelInput | teachers_responsibilityCreateManyGradelevelInput[]
    skipDuplicates?: boolean
  }

  export type programCreateWithoutGradelevelInput = {
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    subject?: subjectCreateNestedManyWithoutProgramInput
  }

  export type programUncheckedCreateWithoutGradelevelInput = {
    ProgramID?: number
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    subject?: subjectUncheckedCreateNestedManyWithoutProgramInput
  }

  export type programCreateOrConnectWithoutGradelevelInput = {
    where: programWhereUniqueInput
    create: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput>
  }

  export type class_scheduleUpsertWithWhereUniqueWithoutGradelevelInput = {
    where: class_scheduleWhereUniqueInput
    update: XOR<class_scheduleUpdateWithoutGradelevelInput, class_scheduleUncheckedUpdateWithoutGradelevelInput>
    create: XOR<class_scheduleCreateWithoutGradelevelInput, class_scheduleUncheckedCreateWithoutGradelevelInput>
  }

  export type class_scheduleUpdateWithWhereUniqueWithoutGradelevelInput = {
    where: class_scheduleWhereUniqueInput
    data: XOR<class_scheduleUpdateWithoutGradelevelInput, class_scheduleUncheckedUpdateWithoutGradelevelInput>
  }

  export type class_scheduleUpdateManyWithWhereWithoutGradelevelInput = {
    where: class_scheduleScalarWhereInput
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyWithoutGradelevelInput>
  }

  export type class_scheduleScalarWhereInput = {
    AND?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
    OR?: class_scheduleScalarWhereInput[]
    NOT?: class_scheduleScalarWhereInput | class_scheduleScalarWhereInput[]
    ClassID?: StringFilter<"class_schedule"> | string
    TimeslotID?: StringFilter<"class_schedule"> | string
    SubjectCode?: StringFilter<"class_schedule"> | string
    RoomID?: IntNullableFilter<"class_schedule"> | number | null
    GradeID?: StringFilter<"class_schedule"> | string
    IsLocked?: BoolFilter<"class_schedule"> | boolean
  }

  export type teachers_responsibilityUpsertWithWhereUniqueWithoutGradelevelInput = {
    where: teachers_responsibilityWhereUniqueInput
    update: XOR<teachers_responsibilityUpdateWithoutGradelevelInput, teachers_responsibilityUncheckedUpdateWithoutGradelevelInput>
    create: XOR<teachers_responsibilityCreateWithoutGradelevelInput, teachers_responsibilityUncheckedCreateWithoutGradelevelInput>
  }

  export type teachers_responsibilityUpdateWithWhereUniqueWithoutGradelevelInput = {
    where: teachers_responsibilityWhereUniqueInput
    data: XOR<teachers_responsibilityUpdateWithoutGradelevelInput, teachers_responsibilityUncheckedUpdateWithoutGradelevelInput>
  }

  export type teachers_responsibilityUpdateManyWithWhereWithoutGradelevelInput = {
    where: teachers_responsibilityScalarWhereInput
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyWithoutGradelevelInput>
  }

  export type programUpsertWithWhereUniqueWithoutGradelevelInput = {
    where: programWhereUniqueInput
    update: XOR<programUpdateWithoutGradelevelInput, programUncheckedUpdateWithoutGradelevelInput>
    create: XOR<programCreateWithoutGradelevelInput, programUncheckedCreateWithoutGradelevelInput>
  }

  export type programUpdateWithWhereUniqueWithoutGradelevelInput = {
    where: programWhereUniqueInput
    data: XOR<programUpdateWithoutGradelevelInput, programUncheckedUpdateWithoutGradelevelInput>
  }

  export type programUpdateManyWithWhereWithoutGradelevelInput = {
    where: programScalarWhereInput
    data: XOR<programUpdateManyMutationInput, programUncheckedUpdateManyWithoutGradelevelInput>
  }

  export type programScalarWhereInput = {
    AND?: programScalarWhereInput | programScalarWhereInput[]
    OR?: programScalarWhereInput[]
    NOT?: programScalarWhereInput | programScalarWhereInput[]
    ProgramID?: IntFilter<"program"> | number
    ProgramName?: StringFilter<"program"> | string
    Semester?: EnumsemesterFilter<"program"> | $Enums.semester
    AcademicYear?: IntFilter<"program"> | number
  }

  export type class_scheduleCreateWithoutRoomInput = {
    ClassID: string
    IsLocked?: boolean
    gradelevel: gradelevelCreateNestedOneWithoutClass_scheduleInput
    subject: subjectCreateNestedOneWithoutClass_scheduleInput
    timeslot: timeslotCreateNestedOneWithoutClass_scheduleInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateWithoutRoomInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    GradeID: string
    IsLocked?: boolean
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleCreateOrConnectWithoutRoomInput = {
    where: class_scheduleWhereUniqueInput
    create: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput>
  }

  export type class_scheduleCreateManyRoomInputEnvelope = {
    data: class_scheduleCreateManyRoomInput | class_scheduleCreateManyRoomInput[]
    skipDuplicates?: boolean
  }

  export type class_scheduleUpsertWithWhereUniqueWithoutRoomInput = {
    where: class_scheduleWhereUniqueInput
    update: XOR<class_scheduleUpdateWithoutRoomInput, class_scheduleUncheckedUpdateWithoutRoomInput>
    create: XOR<class_scheduleCreateWithoutRoomInput, class_scheduleUncheckedCreateWithoutRoomInput>
  }

  export type class_scheduleUpdateWithWhereUniqueWithoutRoomInput = {
    where: class_scheduleWhereUniqueInput
    data: XOR<class_scheduleUpdateWithoutRoomInput, class_scheduleUncheckedUpdateWithoutRoomInput>
  }

  export type class_scheduleUpdateManyWithWhereWithoutRoomInput = {
    where: class_scheduleScalarWhereInput
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyWithoutRoomInput>
  }

  export type class_scheduleCreateWithoutSubjectInput = {
    ClassID: string
    IsLocked?: boolean
    gradelevel: gradelevelCreateNestedOneWithoutClass_scheduleInput
    room?: roomCreateNestedOneWithoutClass_scheduleInput
    timeslot: timeslotCreateNestedOneWithoutClass_scheduleInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateWithoutSubjectInput = {
    ClassID: string
    TimeslotID: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleCreateOrConnectWithoutSubjectInput = {
    where: class_scheduleWhereUniqueInput
    create: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput>
  }

  export type class_scheduleCreateManySubjectInputEnvelope = {
    data: class_scheduleCreateManySubjectInput | class_scheduleCreateManySubjectInput[]
    skipDuplicates?: boolean
  }

  export type programCreateWithoutSubjectInput = {
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    gradelevel?: gradelevelCreateNestedManyWithoutProgramInput
  }

  export type programUncheckedCreateWithoutSubjectInput = {
    ProgramID?: number
    ProgramName: string
    Semester: $Enums.semester
    AcademicYear: number
    gradelevel?: gradelevelUncheckedCreateNestedManyWithoutProgramInput
  }

  export type programCreateOrConnectWithoutSubjectInput = {
    where: programWhereUniqueInput
    create: XOR<programCreateWithoutSubjectInput, programUncheckedCreateWithoutSubjectInput>
  }

  export type teachers_responsibilityCreateWithoutSubjectInput = {
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    gradelevel: gradelevelCreateNestedOneWithoutTeachers_responsibilityInput
    teacher: teacherCreateNestedOneWithoutTeachers_responsibilityInput
    class_schedule?: class_scheduleCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUncheckedCreateWithoutSubjectInput = {
    RespID?: number
    TeacherID: number
    GradeID: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityCreateOrConnectWithoutSubjectInput = {
    where: teachers_responsibilityWhereUniqueInput
    create: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput>
  }

  export type teachers_responsibilityCreateManySubjectInputEnvelope = {
    data: teachers_responsibilityCreateManySubjectInput | teachers_responsibilityCreateManySubjectInput[]
    skipDuplicates?: boolean
  }

  export type class_scheduleUpsertWithWhereUniqueWithoutSubjectInput = {
    where: class_scheduleWhereUniqueInput
    update: XOR<class_scheduleUpdateWithoutSubjectInput, class_scheduleUncheckedUpdateWithoutSubjectInput>
    create: XOR<class_scheduleCreateWithoutSubjectInput, class_scheduleUncheckedCreateWithoutSubjectInput>
  }

  export type class_scheduleUpdateWithWhereUniqueWithoutSubjectInput = {
    where: class_scheduleWhereUniqueInput
    data: XOR<class_scheduleUpdateWithoutSubjectInput, class_scheduleUncheckedUpdateWithoutSubjectInput>
  }

  export type class_scheduleUpdateManyWithWhereWithoutSubjectInput = {
    where: class_scheduleScalarWhereInput
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyWithoutSubjectInput>
  }

  export type programUpsertWithoutSubjectInput = {
    update: XOR<programUpdateWithoutSubjectInput, programUncheckedUpdateWithoutSubjectInput>
    create: XOR<programCreateWithoutSubjectInput, programUncheckedCreateWithoutSubjectInput>
    where?: programWhereInput
  }

  export type programUpdateToOneWithWhereWithoutSubjectInput = {
    where?: programWhereInput
    data: XOR<programUpdateWithoutSubjectInput, programUncheckedUpdateWithoutSubjectInput>
  }

  export type programUpdateWithoutSubjectInput = {
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUpdateManyWithoutProgramNestedInput
  }

  export type programUncheckedUpdateWithoutSubjectInput = {
    ProgramID?: IntFieldUpdateOperationsInput | number
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUncheckedUpdateManyWithoutProgramNestedInput
  }

  export type teachers_responsibilityUpsertWithWhereUniqueWithoutSubjectInput = {
    where: teachers_responsibilityWhereUniqueInput
    update: XOR<teachers_responsibilityUpdateWithoutSubjectInput, teachers_responsibilityUncheckedUpdateWithoutSubjectInput>
    create: XOR<teachers_responsibilityCreateWithoutSubjectInput, teachers_responsibilityUncheckedCreateWithoutSubjectInput>
  }

  export type teachers_responsibilityUpdateWithWhereUniqueWithoutSubjectInput = {
    where: teachers_responsibilityWhereUniqueInput
    data: XOR<teachers_responsibilityUpdateWithoutSubjectInput, teachers_responsibilityUncheckedUpdateWithoutSubjectInput>
  }

  export type teachers_responsibilityUpdateManyWithWhereWithoutSubjectInput = {
    where: teachers_responsibilityScalarWhereInput
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyWithoutSubjectInput>
  }

  export type subjectCreateWithoutProgramInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    class_schedule?: class_scheduleCreateNestedManyWithoutSubjectInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutSubjectInput
  }

  export type subjectUncheckedCreateWithoutProgramInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutSubjectInput
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutSubjectInput
  }

  export type subjectCreateOrConnectWithoutProgramInput = {
    where: subjectWhereUniqueInput
    create: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput>
  }

  export type subjectCreateManyProgramInputEnvelope = {
    data: subjectCreateManyProgramInput | subjectCreateManyProgramInput[]
    skipDuplicates?: boolean
  }

  export type gradelevelCreateWithoutProgramInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleCreateNestedManyWithoutGradelevelInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelUncheckedCreateWithoutProgramInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutGradelevelInput
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelCreateOrConnectWithoutProgramInput = {
    where: gradelevelWhereUniqueInput
    create: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput>
  }

  export type subjectUpsertWithWhereUniqueWithoutProgramInput = {
    where: subjectWhereUniqueInput
    update: XOR<subjectUpdateWithoutProgramInput, subjectUncheckedUpdateWithoutProgramInput>
    create: XOR<subjectCreateWithoutProgramInput, subjectUncheckedCreateWithoutProgramInput>
  }

  export type subjectUpdateWithWhereUniqueWithoutProgramInput = {
    where: subjectWhereUniqueInput
    data: XOR<subjectUpdateWithoutProgramInput, subjectUncheckedUpdateWithoutProgramInput>
  }

  export type subjectUpdateManyWithWhereWithoutProgramInput = {
    where: subjectScalarWhereInput
    data: XOR<subjectUpdateManyMutationInput, subjectUncheckedUpdateManyWithoutProgramInput>
  }

  export type subjectScalarWhereInput = {
    AND?: subjectScalarWhereInput | subjectScalarWhereInput[]
    OR?: subjectScalarWhereInput[]
    NOT?: subjectScalarWhereInput | subjectScalarWhereInput[]
    SubjectCode?: StringFilter<"subject"> | string
    SubjectName?: StringFilter<"subject"> | string
    Credit?: Enumsubject_creditFilter<"subject"> | $Enums.subject_credit
    Category?: StringFilter<"subject"> | string
    ProgramID?: IntNullableFilter<"subject"> | number | null
  }

  export type gradelevelUpsertWithWhereUniqueWithoutProgramInput = {
    where: gradelevelWhereUniqueInput
    update: XOR<gradelevelUpdateWithoutProgramInput, gradelevelUncheckedUpdateWithoutProgramInput>
    create: XOR<gradelevelCreateWithoutProgramInput, gradelevelUncheckedCreateWithoutProgramInput>
  }

  export type gradelevelUpdateWithWhereUniqueWithoutProgramInput = {
    where: gradelevelWhereUniqueInput
    data: XOR<gradelevelUpdateWithoutProgramInput, gradelevelUncheckedUpdateWithoutProgramInput>
  }

  export type gradelevelUpdateManyWithWhereWithoutProgramInput = {
    where: gradelevelScalarWhereInput
    data: XOR<gradelevelUpdateManyMutationInput, gradelevelUncheckedUpdateManyWithoutProgramInput>
  }

  export type gradelevelScalarWhereInput = {
    AND?: gradelevelScalarWhereInput | gradelevelScalarWhereInput[]
    OR?: gradelevelScalarWhereInput[]
    NOT?: gradelevelScalarWhereInput | gradelevelScalarWhereInput[]
    GradeID?: StringFilter<"gradelevel"> | string
    Year?: IntFilter<"gradelevel"> | number
    Number?: IntFilter<"gradelevel"> | number
  }

  export type teachers_responsibilityCreateWithoutTeacherInput = {
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    gradelevel: gradelevelCreateNestedOneWithoutTeachers_responsibilityInput
    subject: subjectCreateNestedOneWithoutTeachers_responsibilityInput
    class_schedule?: class_scheduleCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityUncheckedCreateWithoutTeacherInput = {
    RespID?: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutTeachers_responsibilityInput
  }

  export type teachers_responsibilityCreateOrConnectWithoutTeacherInput = {
    where: teachers_responsibilityWhereUniqueInput
    create: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput>
  }

  export type teachers_responsibilityCreateManyTeacherInputEnvelope = {
    data: teachers_responsibilityCreateManyTeacherInput | teachers_responsibilityCreateManyTeacherInput[]
    skipDuplicates?: boolean
  }

  export type teachers_responsibilityUpsertWithWhereUniqueWithoutTeacherInput = {
    where: teachers_responsibilityWhereUniqueInput
    update: XOR<teachers_responsibilityUpdateWithoutTeacherInput, teachers_responsibilityUncheckedUpdateWithoutTeacherInput>
    create: XOR<teachers_responsibilityCreateWithoutTeacherInput, teachers_responsibilityUncheckedCreateWithoutTeacherInput>
  }

  export type teachers_responsibilityUpdateWithWhereUniqueWithoutTeacherInput = {
    where: teachers_responsibilityWhereUniqueInput
    data: XOR<teachers_responsibilityUpdateWithoutTeacherInput, teachers_responsibilityUncheckedUpdateWithoutTeacherInput>
  }

  export type teachers_responsibilityUpdateManyWithWhereWithoutTeacherInput = {
    where: teachers_responsibilityScalarWhereInput
    data: XOR<teachers_responsibilityUpdateManyMutationInput, teachers_responsibilityUncheckedUpdateManyWithoutTeacherInput>
  }

  export type class_scheduleCreateWithoutTimeslotInput = {
    ClassID: string
    IsLocked?: boolean
    gradelevel: gradelevelCreateNestedOneWithoutClass_scheduleInput
    room?: roomCreateNestedOneWithoutClass_scheduleInput
    subject: subjectCreateNestedOneWithoutClass_scheduleInput
    teachers_responsibility?: teachers_responsibilityCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateWithoutTimeslotInput = {
    ClassID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
    teachers_responsibility?: teachers_responsibilityUncheckedCreateNestedManyWithoutClass_scheduleInput
  }

  export type class_scheduleCreateOrConnectWithoutTimeslotInput = {
    where: class_scheduleWhereUniqueInput
    create: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput>
  }

  export type class_scheduleCreateManyTimeslotInputEnvelope = {
    data: class_scheduleCreateManyTimeslotInput | class_scheduleCreateManyTimeslotInput[]
    skipDuplicates?: boolean
  }

  export type class_scheduleUpsertWithWhereUniqueWithoutTimeslotInput = {
    where: class_scheduleWhereUniqueInput
    update: XOR<class_scheduleUpdateWithoutTimeslotInput, class_scheduleUncheckedUpdateWithoutTimeslotInput>
    create: XOR<class_scheduleCreateWithoutTimeslotInput, class_scheduleUncheckedCreateWithoutTimeslotInput>
  }

  export type class_scheduleUpdateWithWhereUniqueWithoutTimeslotInput = {
    where: class_scheduleWhereUniqueInput
    data: XOR<class_scheduleUpdateWithoutTimeslotInput, class_scheduleUncheckedUpdateWithoutTimeslotInput>
  }

  export type class_scheduleUpdateManyWithWhereWithoutTimeslotInput = {
    where: class_scheduleScalarWhereInput
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyWithoutTimeslotInput>
  }

  export type gradelevelCreateWithoutTeachers_responsibilityInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleCreateNestedManyWithoutGradelevelInput
    program?: programCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelUncheckedCreateWithoutTeachers_responsibilityInput = {
    GradeID: string
    Year: number
    Number: number
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutGradelevelInput
    program?: programUncheckedCreateNestedManyWithoutGradelevelInput
  }

  export type gradelevelCreateOrConnectWithoutTeachers_responsibilityInput = {
    where: gradelevelWhereUniqueInput
    create: XOR<gradelevelCreateWithoutTeachers_responsibilityInput, gradelevelUncheckedCreateWithoutTeachers_responsibilityInput>
  }

  export type subjectCreateWithoutTeachers_responsibilityInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    class_schedule?: class_scheduleCreateNestedManyWithoutSubjectInput
    program?: programCreateNestedOneWithoutSubjectInput
  }

  export type subjectUncheckedCreateWithoutTeachers_responsibilityInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
    ProgramID?: number | null
    class_schedule?: class_scheduleUncheckedCreateNestedManyWithoutSubjectInput
  }

  export type subjectCreateOrConnectWithoutTeachers_responsibilityInput = {
    where: subjectWhereUniqueInput
    create: XOR<subjectCreateWithoutTeachers_responsibilityInput, subjectUncheckedCreateWithoutTeachers_responsibilityInput>
  }

  export type teacherCreateWithoutTeachers_responsibilityInput = {
    Prefix: string
    Firstname: string
    Lastname: string
    Department?: string
    Email: string
    Role?: string
  }

  export type teacherUncheckedCreateWithoutTeachers_responsibilityInput = {
    TeacherID?: number
    Prefix: string
    Firstname: string
    Lastname: string
    Department?: string
    Email: string
    Role?: string
  }

  export type teacherCreateOrConnectWithoutTeachers_responsibilityInput = {
    where: teacherWhereUniqueInput
    create: XOR<teacherCreateWithoutTeachers_responsibilityInput, teacherUncheckedCreateWithoutTeachers_responsibilityInput>
  }

  export type class_scheduleCreateWithoutTeachers_responsibilityInput = {
    ClassID: string
    IsLocked?: boolean
    gradelevel: gradelevelCreateNestedOneWithoutClass_scheduleInput
    room?: roomCreateNestedOneWithoutClass_scheduleInput
    subject: subjectCreateNestedOneWithoutClass_scheduleInput
    timeslot: timeslotCreateNestedOneWithoutClass_scheduleInput
  }

  export type class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
  }

  export type class_scheduleCreateOrConnectWithoutTeachers_responsibilityInput = {
    where: class_scheduleWhereUniqueInput
    create: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput>
  }

  export type gradelevelUpsertWithoutTeachers_responsibilityInput = {
    update: XOR<gradelevelUpdateWithoutTeachers_responsibilityInput, gradelevelUncheckedUpdateWithoutTeachers_responsibilityInput>
    create: XOR<gradelevelCreateWithoutTeachers_responsibilityInput, gradelevelUncheckedCreateWithoutTeachers_responsibilityInput>
    where?: gradelevelWhereInput
  }

  export type gradelevelUpdateToOneWithWhereWithoutTeachers_responsibilityInput = {
    where?: gradelevelWhereInput
    data: XOR<gradelevelUpdateWithoutTeachers_responsibilityInput, gradelevelUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type gradelevelUpdateWithoutTeachers_responsibilityInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUpdateManyWithoutGradelevelNestedInput
    program?: programUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelUncheckedUpdateWithoutTeachers_responsibilityInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutGradelevelNestedInput
    program?: programUncheckedUpdateManyWithoutGradelevelNestedInput
  }

  export type subjectUpsertWithoutTeachers_responsibilityInput = {
    update: XOR<subjectUpdateWithoutTeachers_responsibilityInput, subjectUncheckedUpdateWithoutTeachers_responsibilityInput>
    create: XOR<subjectCreateWithoutTeachers_responsibilityInput, subjectUncheckedCreateWithoutTeachers_responsibilityInput>
    where?: subjectWhereInput
  }

  export type subjectUpdateToOneWithWhereWithoutTeachers_responsibilityInput = {
    where?: subjectWhereInput
    data: XOR<subjectUpdateWithoutTeachers_responsibilityInput, subjectUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type subjectUpdateWithoutTeachers_responsibilityInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUpdateManyWithoutSubjectNestedInput
    program?: programUpdateOneWithoutSubjectNestedInput
  }

  export type subjectUncheckedUpdateWithoutTeachers_responsibilityInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    ProgramID?: NullableIntFieldUpdateOperationsInput | number | null
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutSubjectNestedInput
  }

  export type teacherUpsertWithoutTeachers_responsibilityInput = {
    update: XOR<teacherUpdateWithoutTeachers_responsibilityInput, teacherUncheckedUpdateWithoutTeachers_responsibilityInput>
    create: XOR<teacherCreateWithoutTeachers_responsibilityInput, teacherUncheckedCreateWithoutTeachers_responsibilityInput>
    where?: teacherWhereInput
  }

  export type teacherUpdateToOneWithWhereWithoutTeachers_responsibilityInput = {
    where?: teacherWhereInput
    data: XOR<teacherUpdateWithoutTeachers_responsibilityInput, teacherUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type teacherUpdateWithoutTeachers_responsibilityInput = {
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
  }

  export type teacherUncheckedUpdateWithoutTeachers_responsibilityInput = {
    TeacherID?: IntFieldUpdateOperationsInput | number
    Prefix?: StringFieldUpdateOperationsInput | string
    Firstname?: StringFieldUpdateOperationsInput | string
    Lastname?: StringFieldUpdateOperationsInput | string
    Department?: StringFieldUpdateOperationsInput | string
    Email?: StringFieldUpdateOperationsInput | string
    Role?: StringFieldUpdateOperationsInput | string
  }

  export type class_scheduleUpsertWithWhereUniqueWithoutTeachers_responsibilityInput = {
    where: class_scheduleWhereUniqueInput
    update: XOR<class_scheduleUpdateWithoutTeachers_responsibilityInput, class_scheduleUncheckedUpdateWithoutTeachers_responsibilityInput>
    create: XOR<class_scheduleCreateWithoutTeachers_responsibilityInput, class_scheduleUncheckedCreateWithoutTeachers_responsibilityInput>
  }

  export type class_scheduleUpdateWithWhereUniqueWithoutTeachers_responsibilityInput = {
    where: class_scheduleWhereUniqueInput
    data: XOR<class_scheduleUpdateWithoutTeachers_responsibilityInput, class_scheduleUncheckedUpdateWithoutTeachers_responsibilityInput>
  }

  export type class_scheduleUpdateManyWithWhereWithoutTeachers_responsibilityInput = {
    where: class_scheduleScalarWhereInput
    data: XOR<class_scheduleUpdateManyMutationInput, class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityInput>
  }

  export type AccountCreateWithoutUserInput = {
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountUncheckedCreateWithoutUserInput = {
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountCreateOrConnectWithoutUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountCreateManyUserInputEnvelope = {
    data: AccountCreateManyUserInput | AccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionCreateWithoutUserInput = {
    sessionToken: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    sessionToken: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
  }

  export type AccountUpdateManyWithWhereWithoutUserInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
  }

  export type UserCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
  }

  export type UserUpsertWithoutAccountsInput = {
    update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email: string
    emailVerified?: Date | string | null
    image?: string | null
    password?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
  }

  export type teachers_responsibilityUpdateWithoutClass_scheduleInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    subject?: subjectUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    teacher?: teacherUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateWithoutClass_scheduleInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type class_scheduleCreateManyGradelevelInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    RoomID?: number | null
    IsLocked?: boolean
  }

  export type teachers_responsibilityCreateManyGradelevelInput = {
    RespID?: number
    TeacherID: number
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
  }

  export type class_scheduleUpdateWithoutGradelevelInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    room?: roomUpdateOneWithoutClass_scheduleNestedInput
    subject?: subjectUpdateOneRequiredWithoutClass_scheduleNestedInput
    timeslot?: timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateWithoutGradelevelInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateManyWithoutGradelevelInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type teachers_responsibilityUpdateWithoutGradelevelInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    subject?: subjectUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    teacher?: teacherUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    class_schedule?: class_scheduleUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateWithoutGradelevelInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutGradelevelInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type programUpdateWithoutGradelevelInput = {
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    subject?: subjectUpdateManyWithoutProgramNestedInput
  }

  export type programUncheckedUpdateWithoutGradelevelInput = {
    ProgramID?: IntFieldUpdateOperationsInput | number
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
    subject?: subjectUncheckedUpdateManyWithoutProgramNestedInput
  }

  export type programUncheckedUpdateManyWithoutGradelevelInput = {
    ProgramID?: IntFieldUpdateOperationsInput | number
    ProgramName?: StringFieldUpdateOperationsInput | string
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    AcademicYear?: IntFieldUpdateOperationsInput | number
  }

  export type class_scheduleCreateManyRoomInput = {
    ClassID: string
    TimeslotID: string
    SubjectCode: string
    GradeID: string
    IsLocked?: boolean
  }

  export type class_scheduleUpdateWithoutRoomInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    gradelevel?: gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput
    subject?: subjectUpdateOneRequiredWithoutClass_scheduleNestedInput
    timeslot?: timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateWithoutRoomInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateManyWithoutRoomInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type class_scheduleCreateManySubjectInput = {
    ClassID: string
    TimeslotID: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
  }

  export type teachers_responsibilityCreateManySubjectInput = {
    RespID?: number
    TeacherID: number
    GradeID: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
  }

  export type class_scheduleUpdateWithoutSubjectInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    gradelevel?: gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput
    room?: roomUpdateOneWithoutClass_scheduleNestedInput
    timeslot?: timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateWithoutSubjectInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateManyWithoutSubjectInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type teachers_responsibilityUpdateWithoutSubjectInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    teacher?: teacherUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    class_schedule?: class_scheduleUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateWithoutSubjectInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutSubjectInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    TeacherID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type subjectCreateManyProgramInput = {
    SubjectCode: string
    SubjectName: string
    Credit: $Enums.subject_credit
    Category?: string
  }

  export type subjectUpdateWithoutProgramInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUpdateManyWithoutSubjectNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutSubjectNestedInput
  }

  export type subjectUncheckedUpdateWithoutProgramInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutSubjectNestedInput
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutSubjectNestedInput
  }

  export type subjectUncheckedUpdateManyWithoutProgramInput = {
    SubjectCode?: StringFieldUpdateOperationsInput | string
    SubjectName?: StringFieldUpdateOperationsInput | string
    Credit?: Enumsubject_creditFieldUpdateOperationsInput | $Enums.subject_credit
    Category?: StringFieldUpdateOperationsInput | string
  }

  export type gradelevelUpdateWithoutProgramInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUpdateManyWithoutGradelevelNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelUncheckedUpdateWithoutProgramInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutGradelevelNestedInput
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutGradelevelNestedInput
  }

  export type gradelevelUncheckedUpdateManyWithoutProgramInput = {
    GradeID?: StringFieldUpdateOperationsInput | string
    Year?: IntFieldUpdateOperationsInput | number
    Number?: IntFieldUpdateOperationsInput | number
  }

  export type teachers_responsibilityCreateManyTeacherInput = {
    RespID?: number
    GradeID: string
    SubjectCode: string
    AcademicYear: number
    Semester: $Enums.semester
    TeachHour: number
  }

  export type teachers_responsibilityUpdateWithoutTeacherInput = {
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    gradelevel?: gradelevelUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    subject?: subjectUpdateOneRequiredWithoutTeachers_responsibilityNestedInput
    class_schedule?: class_scheduleUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateWithoutTeacherInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
    class_schedule?: class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityNestedInput
  }

  export type teachers_responsibilityUncheckedUpdateManyWithoutTeacherInput = {
    RespID?: IntFieldUpdateOperationsInput | number
    GradeID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    AcademicYear?: IntFieldUpdateOperationsInput | number
    Semester?: EnumsemesterFieldUpdateOperationsInput | $Enums.semester
    TeachHour?: IntFieldUpdateOperationsInput | number
  }

  export type class_scheduleCreateManyTimeslotInput = {
    ClassID: string
    SubjectCode: string
    RoomID?: number | null
    GradeID: string
    IsLocked?: boolean
  }

  export type class_scheduleUpdateWithoutTimeslotInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    gradelevel?: gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput
    room?: roomUpdateOneWithoutClass_scheduleNestedInput
    subject?: subjectUpdateOneRequiredWithoutClass_scheduleNestedInput
    teachers_responsibility?: teachers_responsibilityUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateWithoutTimeslotInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    teachers_responsibility?: teachers_responsibilityUncheckedUpdateManyWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateManyWithoutTimeslotInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type class_scheduleUpdateWithoutTeachers_responsibilityInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
    gradelevel?: gradelevelUpdateOneRequiredWithoutClass_scheduleNestedInput
    room?: roomUpdateOneWithoutClass_scheduleNestedInput
    subject?: subjectUpdateOneRequiredWithoutClass_scheduleNestedInput
    timeslot?: timeslotUpdateOneRequiredWithoutClass_scheduleNestedInput
  }

  export type class_scheduleUncheckedUpdateWithoutTeachers_responsibilityInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type class_scheduleUncheckedUpdateManyWithoutTeachers_responsibilityInput = {
    ClassID?: StringFieldUpdateOperationsInput | string
    TimeslotID?: StringFieldUpdateOperationsInput | string
    SubjectCode?: StringFieldUpdateOperationsInput | string
    RoomID?: NullableIntFieldUpdateOperationsInput | number | null
    GradeID?: StringFieldUpdateOperationsInput | string
    IsLocked?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AccountCreateManyUserInput = {
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCreateManyUserInput = {
    sessionToken: string
    expires: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AccountUpdateWithoutUserInput = {
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateWithoutUserInput = {
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountUncheckedUpdateManyWithoutUserInput = {
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUpdateWithoutUserInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}