<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [oweb](./oweb.md) &gt; [OWebApp](./oweb.owebapp.md) &gt; [form](./oweb.owebapp.form.md)

## OWebApp.form() method

Returns new oweb form instance.

<b>Signature:</b>

```typescript
form(form: OWebFormDefinition | HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean): OWebForm;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  form | [OWebFormDefinition](./oweb.owebformdefinition.md) \| HTMLFormElement | The html form element. |
|  required | string\[\] | <i>(Optional)</i> The required fields names list. |
|  excluded | string\[\] | <i>(Optional)</i> The fields names to exclude. |
|  checkAll | boolean | <i>(Optional)</i> Force the validator to check all fields. |
|  verbose | boolean | <i>(Optional)</i> Log warning. |

<b>Returns:</b>

OWebForm

