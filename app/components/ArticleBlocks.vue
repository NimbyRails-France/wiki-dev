<script setup lang="ts">
import type { Block } from '~/content/schema'
defineProps<{ blocks: Block[] }>()
const { path } = useWikiLocale()
</script>
<template>
  <template v-for="(block, i) in blocks" :key="i">
    <p v-if="block.kind === 'text'">{{ block.text }}</p>
    <CodeBlock
      v-else-if="block.kind === 'code'"
      :code="block.code"
      :title="block.title"
      :language="block.language"
    />
    <aside v-else-if="block.kind === 'note'" class="note">
      <strong>{{ block.title }}</strong>
      <p>{{ block.text }}</p>
    </aside>
    <ul v-else-if="block.kind === 'list'" class="prose-list">
      <li v-for="item in block.items" :key="item">{{ item }}</li>
    </ul>
    <div
      v-else-if="block.kind === 'table'"
      class="table-scroll"
      tabindex="0"
      role="region"
      :aria-label="block.columns.join(', ')"
    >
      <table>
        <thead>
          <tr>
            <th v-for="column in block.columns" :key="column" scope="col">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowId) in block.rows" :key="rowId">
            <td v-for="(cell, cellId) in row" :key="cellId">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="block.kind === 'links'" class="related-links">
      <NuxtLink v-for="item in block.items" :key="item.to" :to="path(item.to)"
        >{{ item.label }} <span aria-hidden="true">↗</span></NuxtLink
      >
    </div>
  </template>
</template>
