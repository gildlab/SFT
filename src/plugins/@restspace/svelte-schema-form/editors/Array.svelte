<script>import { emptyValue, schemaLabel } from "../types/schema";
import SubSchemaForm from "../SubSchemaForm.svelte";
import { stringToHtml } from "../utilities";
export let params;
export let schema;
export let value;
let collapserOpenState = params.path.length === 0 || !params.collapsible ? "open" : "closed";
const toggle = () => {
    collapserOpenState = collapserOpenState === "open" ? "closed" : "open";
};
const onAdd = () => {
    params.pathChanged(params.path, [
        ...(value || []),
        emptyValue(schema.items)
    ]);
};
const onDelete = (idx) => () => {
    params.pathChanged(params.path, [
        ...value.slice(0, idx),
        ...value.slice(idx + 1)
    ]);
};
const onDuplicate = (idx) => () => {
    params.pathChanged(params.path, [
        ...value.slice(0, idx),
        value[idx],
        JSON.parse(JSON.stringify(value[idx])),
        ...value.slice(idx + 1)
    ]);
};
const onUp = (idx) => () => {
    if (idx > 0) {
        params.pathChanged(params.path, [
            ...value.slice(0, idx - 1),
            value[idx],
            value[idx - 1],
            ...value.slice(idx + 1)
        ]);
    }
};
const onDown = (idx) => () => {
    if (idx < value.length - 1) {
        params.pathChanged(params.path, [
            ...value.slice(0, idx),
            value[idx + 1],
            value[idx],
            ...value.slice(idx + 2)
        ]);
    }
};
$: legendText = schemaLabel(schema, params.path);
$: showWrapper = (value && value.length > 0) || schema.emptyDisplay !== false;
$: emptyText = (!value || value.length === 0) && typeof schema.emptyDisplay === 'string' && schema.emptyDisplay;
$: readOnly = params.containerReadOnly || schema.readOnly || false;
$: controls = schema.controls === undefined ? (readOnly ? '' : 'add, reorder, delete, duplicate') : schema.controls;
</script>

{#if showWrapper}
<fieldset name={params.path.join('.')} class="subset array depth-{params.path.length}">
	{#if params.collapsible || legendText}
	<legend class="subset-label array-label">
		{#if params.collapsible }
		<span class="collapser {collapserOpenState}" on:click={toggle}></span>
		{/if}
		<span class="subset-label-title object-label-title">{@html stringToHtml(legendText)}</span>
		{#if schema.description}
		<span class="subset-label-description object-label-description">{@html stringToHtml(schema.description)}</span>
		{/if}
	</legend>
	{/if}

	{#if collapserOpenState === "open"}
		{#if !emptyText}
			{#each value || [] as item, idx (idx)}
			<svelte:component this={SubSchemaForm}
				params={{
					...params,
					path: [ ...params.path, idx.toString() ],
					containerParent: "array",
					containerReadOnly: params.containerReadOnly || schema.readOnly || false
				}}
				value={item}
				bind:schema={schema.items}
			/>
			<div class="list-controls">
				{#if controls.includes('delete')}
				<button type="button" class="list-control delete" title="delete" on:click={onDelete(idx)}></button>
				{/if}
				{#if controls.includes('duplicate')}
				<button type="button" class="list-control duplicate" title="duplicate" on:click={onDuplicate(idx)}></button>
				{/if}
				{#if controls.includes('reorder') && idx > 0}
					<button type="button" class="list-control up" title="move up" on:click={onUp(idx)}></button>
				{/if}
				{#if controls.includes('reorder') && idx < (value || []).length - 1}
					<button type="button" class="list-control down" title="move down" on:click={onDown(idx)}></button>
				{/if}
			</div>

			{/each}
		{:else}
			<div class="emptyText">{emptyText}</div>
		{/if}
		{#if controls.includes('add')}
		<button type="button" class="list-control add" title="add item" on:click={onAdd}></button>
		{/if}
	{/if}
</fieldset>
{/if}