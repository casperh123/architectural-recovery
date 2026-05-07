<script lang="ts">
	import { getGraph} from './graph.remote';
	import { renderGraph } from '$lib/sourceAnalysis/renderer';

	let container: HTMLDivElement | null = null;
	let cy: any;
  let depth = $state(3);
  let moduleFilter: Set<string> | undefined = $state(undefined);
  let scopedPath = $state("");
  let modulePaths: string[] | undefined = $state(undefined);

  const depthRange = Array.from({length: 10}, (_, i) => i);
	const graphQuery = $derived(getGraph([depth, scopedPath]));

	$effect(() => {
    (async () => {
      const { graph, modules, nodes } = await graphQuery;

      if(modulePaths == undefined) {
        modulePaths = modules;
      }
     
      if (cy) cy.destroy();

      cy = renderGraph(container!, graph, moduleFilter, nodes);
    })();
	});
</script>

<header class="header">
<div class="header-inner-wrapper max-width">
    <button onclick={() => graphQuery.refresh()} class="btn btn-primary">
	    Refresh graph
    </button> 
    <input type="text" bind:value={scopedPath} list="modules"/>
    <datalist id="modules">
      {#each modulePaths as module}
        <option value={module}>{module}</option>
      {/each}
    </datalist>
    <select class="select" bind:value={depth}>
      <option disabled={true}>Depth</option>
      {#each depthRange as depth}
          <option>{depth}</option>
      {/each}
    </select>
  </div>
</header>

{#if graphQuery.loading}
	<p>Loading...</p>
{:else}
	<div bind:this={container} style="height: 100vh;"></div>
{/if}

<style>
  .header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 20px;
  }

  .header-inner-wrapper {
    display: flex;
    width: 100%;
    flex-direction: row;
    gap: 20px;
  }
  
  .select-wrapper {
    display: flex;
    flex-direction: row;
  }
</style>
