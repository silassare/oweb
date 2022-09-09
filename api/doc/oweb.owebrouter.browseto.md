<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebRouter](./oweb.owebrouter.md) &gt; [browseTo](./oweb.owebrouter.browseto.md)

## OWebRouter.browseTo() method

Browse to a specific location

<b>Signature:</b>

```typescript
browseTo(url: string, state?: ORouteStateObject, push?: boolean, ignoreSameLocation?: boolean): this;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  url | string | the next url |
|  state | [ORouteStateObject](./oweb.oroutestateobject.md) | <i>(Optional)</i> the initial state |
|  push | boolean | <i>(Optional)</i> should we push into the history state |
|  ignoreSameLocation | boolean | <i>(Optional)</i> ignore browsing again to same location |

<b>Returns:</b>

this
