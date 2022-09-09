<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebService](./oweb.owebservice.md) &gt; [getRelationItems](./oweb.owebservice.getrelationitems.md)

## OWebService.getRelationItems() method

Gets multiple items relation for a given entity id.

<b>Signature:</b>

```typescript
getRelationItems<R>(id: string, relation: string, options: OApiServiceRequestOptions): OWebXHR<OApiGetPaginatedRelationItemsResponse<R>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  id | string | The entity id. |
|  relation | string | The relation name. |
|  options | [OApiServiceRequestOptions](./oweb.oapiservicerequestoptions.md) |  |

<b>Returns:</b>

OWebXHR&lt;[OApiGetPaginatedRelationItemsResponse](./oweb.oapigetpaginatedrelationitemsresponse.md)<!-- -->&lt;R&gt;&gt;
