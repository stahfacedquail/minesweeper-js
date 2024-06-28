<script lang="ts">
  import type { CellValue } from "$lib/services/types";
  import { createEventDispatcher } from "svelte";

  export let value: CellValue;
  export let open: boolean;
  export let flagged: boolean;
  export let disabled: boolean;

  let displayValue: string;
  $: if (open) {
    if (value === "X")
      displayValue = "💣";
    else if (value > 0)
      displayValue = `${value}`;
  } else if (flagged) {
    displayValue = "🚩";
  } else {
    displayValue = "";
  }
  
  const dispatch = createEventDispatcher();

  function onClick() {
    if (open || flagged) return;

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