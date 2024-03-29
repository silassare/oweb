<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebRoute](./oweb.owebroute.md) &gt; [parseDynamicPath](./oweb.owebroute.parsedynamicpath.md)

## OWebRoute.parseDynamicPath() method

Parse dynamic path and returns appropriate regexp and tokens list.

```js
let format = "path/to/:id/file/:index/name.:format";
let options = {
		id: "num",
		index: "alpha",
		format:	"alpha-num"
};
let info = parseDynamicPath(format,options);

info === {
    reg: RegExp,
    tokens: ["id","index","format"]
};
```

<b>Signature:</b>

```typescript
static parseDynamicPath(path: string, options: ORoutePathOptions): ORouteInfo;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  path | string | The path format string. |
|  options | ORoutePathOptions | The path options. |

<b>Returns:</b>

ORouteInfo

