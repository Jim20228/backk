## Create Entities

- [createEntity](#createentity)
- [createEntities](#createEntities)

### <a name="createentity"></a> createEntity

```ts
interface DataStore {
  createEntity<T extends BackkEntity>(
    EntityClass: { new (): T },
    entity: Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<One<T>>;
}
```

Creates a new entity `entity` of class `EntityClass` in the data store.

`options.preHooks` are executed before the create operation and if any of the pre-hooks fails, the whole create operation fails. See [Hooks](HOOKS.MD) for details.

`options.postHook` is executed after successful create operation. If post-hook fails, the whole create operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` are applied to query that returns the just created entity. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details. If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

Returns the created entity or error.

Fetching entity for `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50

### <a name="createEntities"></a> createEntities

```ts
interface DataStore {
  createEntities<T extends BackkEntity>(
    EntityClass: { new (): T },
    entities: Array<Omit<T, '_id' | 'createdAtTimestamp' | 'version' | 'lastModifiedTimestamp'>>,
    options?: {
      preHooks?: PreHook | PreHook[];
      postQueryOperations?: PostQueryOperations;
      postHook?: PostHook<T>;
    }
  ): PromiseErrorOr<Many<T>>;
}
```

Creates new entities `entities` of class `EntityClass` in the data store.

`options.preHooks` are executed before each create operation and if any of the pre-hooks fails, the whole create operation fails. See [Hooks](HOOKS.MD) for details.

`options.postHook` is executed after each successful create operation. If post-hook fails, the whole create operation fails. See [Hooks](HOOKS.MD) for details.

`options.postQueryOperations` are applied to each query that returns the just created entity. See [PostQueryOperations](POST_QUERY_OPERATIONS.MD) for details.  If not supplied, instance of `DefaultPostQueryOperationsImpl` is used.

Returns the created entities or error.

Fetching entity for `options.postHook` uses `options.postQueryOperations`. If `options.postQueryOperations` is not supplied, instance of `DefaultPostQueryOperationsImpl` is used.
Instance of `DefaultPostQueryOperationsImpl` will fetch all entity fields, sort sub-entities by `id`, return the first page of sub-entities with page size of 50

