## Update Entities

- [updateEntity](#updateentity)
- [updateEntityByFilters](#updateentitybyfilters)
- [updateEntitiesByFilters](#updateentitiesbyfilters)

### <a name="updateentity"></a> updateEntity

```ts
interface DataStore {
  updateEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entityUpdate: RecursivePartial<T> & { _id: string },
    options?: {
      preHooks?: PreHook | PreHook[];
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Updates an entity of class `EntityClass` identified by `_id` in the data store.
Only fields present in `entityUpdate` are updated. `entityUpdate` must always have `_id` property present.

`options.preHooks` are executed before the update operation. See [Hooks](HOOKS.MD) for details.

`options.entityPreHooks` are executed before the update operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole update operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before update. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.  If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after the update operation. If post-hook fails, the whole update operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Returns nothing or error.

Fetching entity for `options.entityPreHooks` or `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50

### <a name="updateentitybyfilters"></a> updateEntityByFilters

```ts
interface DataStore {
  updateEntityByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>,
    options?: {
      entityPreHooks?: EntityPreHook<T> | EntityPreHook<T>[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<null>;
}
```

Updates the entity of class `EntityClass` identified by filter(s) `filters` in the data store.
Only fields present in `entityUpdate` are updated.

`filters` defines filter(s). See [Query Filters](QUERY_FILTERS.MD) for details.

`options.entityPreHooks` are executed before the update operation, and they get the current entity as argument.
if any of the pre-hooks fails, the whole update operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` is used to define post query operations for querying the entity before update. (E.g. for use in `entityPreHooks`). See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.  If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

`options.postHook` is executed after the update operation. If post-hook fails, the whole update operation fails. A post-hook can be used
for example to notify other microservices about the operation. See [Hooks](HOOKS.MD) for details.

Returns nothing or error.

Fetching entity for `options.entityPreHooks` or `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50


### <a name="updateentitiesbyfilters"></a> updateEntitiesByFilters

```ts
interface DataStore {
  updateEntitiesByFilters<T extends BackkEntity>(
    EntityClass: { new (): T },
    filters: QueryFilters<T>,
    entityUpdate: RecursivePartial<T>
  ): PromiseErrorOr<null>;
}
```

Updates the entities of class `EntityClass` identified by filter(s) `filters` in the data store.
Only fields present in `entityUpdate` are updated.

`filters` defines filter(s). See [Query Filters](QUERY_FILTERS.MD) for details.

Returns nothing or error.
