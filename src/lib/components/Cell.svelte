<script lang="ts">
  import type { CellValue } from "$lib/services/types";
  import { createEventDispatcher } from "svelte";

  export let value: CellValue | undefined;
  export let open: boolean;
  export let flagged: boolean;
  export let disabled: boolean;

  let displayValue: string;
  $: if (open) {
    if (value === undefined)
      displayValue = "";  // should never be the case; mines should be assigned the moment any cell is clicked
    else if (value === "X")
      displayValue = "💣";
    else if (value > 0)
      displayValue = `${value}`;
    else
      displayValue = "";
  } else if (flagged) {
    displayValue = "🚩";
  } else {
    displayValue = "";
  }
  
  const dispatch = createEventDispatcher();

  function onClick() {
    if (flagged) return;

    dispatch("clicked");
  }

  function onRightClick() {
    if (open) return;

    dispatch("flagged");
  }
</script>

<button
  style:background-color={ open ? "yellow" : "initial" }
  on:click={onClick}
  on:contextmenu|preventDefault={onRightClick}
  {disabled}
>{ displayValue }</button>

<style lang="scss">
  button {
    width: 2rem;
    height: 2rem;
  }
</style>