<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let value: string | number;
  export let open = false;
  export let disabled: boolean;
  
  const dispatch = createEventDispatcher();

  function onClick() {
    if (open) return;

    dispatch("clicked");
  }
</script>

<button
  style:color={ open ? "initial" : "transparent" }
  style:background-color={ open ? "yellow" : "initial" }
  on:click={onClick}
  {disabled}
>{ value }</button>

<style lang="scss">
  button {
    width: 2rem;
    height: 2rem;
  }
</style>