<script lang="ts">
	import { getGraph } from './graph.remote';
	import { renderGraph } from '$lib/sourceAnalysis/renderer';

	let container: HTMLDivElement | null = null;
	let cy: any;

	const graphQuery = getGraph();

	$effect(() => {
		(async () => {
			const graph = await graphQuery;

			if (cy) cy.destroy();

			cy = renderGraph(container!, graph);
		})();
	});
</script>

<header class="header">
  <div class="header-inner-wrapper max-width">
    <h1>Hej!</h1>
    
    <button onclick={() => graphQuery.refresh()} class="btn">
	    Refresh graph
    </button>
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
  }
</style>
