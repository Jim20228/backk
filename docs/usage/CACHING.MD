## Caching

- [Caching Service Function Responses](#cachingservicefunctionresponses)
- [Generic Local In-Memory Caching](#genericlocalinmemorycaching)

### <a name="cachingservicefunctionresponses"></a> Caching Service Function Responses
Backk can cache service function responses in a Redis instance.
In order to cache service function response, you need to provide a response cache config service implementation class 
that extends the `ResponseCacheConfigService` abstract class.

You need to implement the needed methods in your class:

```ts
import { ResponseCacheConfigService } from 'backk';

class ResponseCacheConfigServiceImpl extends ResponseCacheConfigService {
  shouldCacheServiceFunctionCallResponse(serviceFunctionName: string, serviceFunctionArgument: object): boolean {
    // Provide implementation...
  }

  getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number {
    // Provide implementation...
  }
}
```

If you want to disable caching in development environment, implement `shouldCacheServiceFunctionCallResponse`
to return false always when `NODE_ENV` environment variable is `development`.

Instantiate your response cache config service in your microservice implementation class:
```ts
class MicroserviceImpl extends Microservice {
  private readonly responseCacheConfigService = new ResponseCacheConfigServiceImpl();
}
```

Backk will automatically cache service function call response based
on the result of call to `shouldCacheServiceFunctionCallResponse`. If the call returns `true`, Backk will
check if cache already contains a response for same service function name and same service function argument.
If the response is found from the cache, it is returned from the cache instead of executing the actual
service function.

Response cache service requires following environment variables to be defined:
- `REDIS_CACHE_HOST` which denotes the Redis cache server host
- `REDIS_CACHE_PORT` which denotes the Redis cache server port
- `REDIS_CACHE_PASSWORD` which denotes the Redis server password


### <a name="genericlocalinmemorycaching"></a> Generic Local In-Memory Caching
You can use local in-memory caching by importing `MemoryCache` from `memory-cache-node` and
create a new memory cache:

```ts
import { MemoryCache } from 'memory-cache-node';

const myCache = new MemoryCache(5 * 60, Values._100K);
```

For more documentation, please refer to [memory-cache-node](https://github.com/pksilen/memory-cache-node)


