<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OApiFilter](./oweb.oapifilter.md)

## OApiFilter type

<b>Signature:</b>

```typescript
export declare type OApiFilter = {
    0: Exclude<OApiFilterCondition, 'is_null' | 'is_not_null'>;
    1: string | number | (string | number)[];
    2?: 'or' | 'and';
} | {
    0: 'is_null' | 'is_not_null';
    1?: 'or' | 'and';
};
```
<b>References:</b> [OApiFilterCondition](./oweb.oapifiltercondition.md)

