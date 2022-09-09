<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebDataStore](./oweb.owebdatastore.md)

## OWebDataStore class

<b>Signature:</b>

```typescript
export default class OWebDataStore extends OWebEvent 
```
<b>Extends:</b> OWebEvent

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(\_appContext)](./oweb.owebdatastore._constructor_.md) |  | Constructs a new instance of the <code>OWebDataStore</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [EVT\_DATA\_STORE\_CLEARED](./oweb.owebdatastore.evt_data_store_cleared.md) | <code>static</code> | string |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [clear()](./oweb.owebdatastore.clear.md) |  | Clear the data store. |
|  [get(key)](./oweb.owebdatastore.get.md) |  | Gets data with the given key.<!-- -->When the key is a regexp all data with a key name that match the given regexp will be returned in an object. |
|  [onClear(cb)](./oweb.owebdatastore.onclear.md) |  | Register data store clear event handler. |
|  [remove(key)](./oweb.owebdatastore.remove.md) |  | Removes data with the given key.<!-- -->When the key is a regexp all data with a key name that match the given regexp will be removed. |
|  [set(key, value)](./oweb.owebdatastore.set.md) |  | Sets key/value pair in the store. |
