## Remove Sub-Entities

- [removeSubEntityFromEntityById](#removesubentityfromentitybyid)
- [removeSubEntitiesFromEntityById](#removesubentitiesfromentitybyid)
- [removeSubEntityFromEntityByFilters](#removesubentityfromentitybyfilters)
- [removeSubEntitiesFromEntityByFilters](#removesubentitiesfromentitybyfilters)

### <a name="removesubentityfromentitybyid"></a> removeSubEntityFromEntityById

```ts
class AbstractDataStore {
  removeSubEntityFromEntityById<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` by id `_id`, then remove sub-entity with id `subEntityId` from path `subEntityPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="removesubentitiesfromentitybyid"></a> removeSubEntitiesFromEntityById

```ts
class AbstractDataStore {
  removeSubEntitiesFromEntityById<T extends BackkEntity>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    _id: string,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` by id `_id`, then removes sub-entities matching [JSON path](https://github.com/json-path/JsonPath) `subEntitiesJsonPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="removesubentityfromentitybyfilters"></a> removeSubEntityFromEntityByFilters

```ts
class AbstractDataStore {
  removeSubEntityFromEntityByFilters<T extends BackkEntity>(
    subEntityPath: string,
    subEntityId: string,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` matching filter(s) defined in `filters`, then removes sub-entity with id `subEntityId` from path `subEntityPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.

### <a name="removesubentitiesfromentitybyfilters"></a> removeSubEntitiesFromEntityByFilters

```ts
class AbstractDataStore {
  removeSubEntitiesFromEntityByFilters<T extends BackkEntity, U extends object>(
    subEntitiesJsonPath: string,
    EntityClass: { new (): T },
    filters: Array<MongoDbQuery<T> | SqlExpression | UserDefinedFilter> | Partial<T> | object,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Finds an entity of class `EntityClass` matching filter(s) defined in `filters`, then removes sub-entities matching [JSON path](https://github.com/json-path/JsonPath) `subEntitiesJsonPath`.

`entityPreHooks` are executed before the delete operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole delete operation fails.

`postHook` is executed after the delete operation. If post-hook fails, the whole delete operation fails. A post-hook can be used
for example to notify other microservices about the operation.

Returns nothing or error.