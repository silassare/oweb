<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebService](./oweb.owebservice.md) &gt; [getItem](./oweb.owebservice.getitem.md)

## OWebService.getItem() method

Gets an entity with the given id.

All requested relations names are joined with `|`<!-- -->. example: `relation1|relation2|relationX`<!-- -->.

<b>Signature:</b>

```typescript
getItem(id: string, relations?: string): OWebXHR<OApiGetResponse<Entity>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  id | string | The entity id. |
|  relations | string | <i>(Optional)</i> The relations string. |

<b>Returns:</b>

OWebXHR&lt;[OApiGetResponse](./oweb.oapigetresponse.md)<!-- -->&lt;Entity&gt;&gt;
