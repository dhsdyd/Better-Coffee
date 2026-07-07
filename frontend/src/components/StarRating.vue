<template>
  <div class="star-rating">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ active: i <= modelValue, readonly }"
      @click="handleClick(i)"
    >★</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
function handleClick(val) {
  if (props.readonly) return
  emit('update:modelValue', val)
}
</script>

<style scoped>
.star-rating { display: inline-flex; align-items: center; }
.star { color: #DDDDDD; margin-right: 4px; font-size: 28px; user-select: none; cursor: pointer; transition: color 0.2s; }
.star.active { color: #FFB800; }
.star.readonly { cursor: default; }
.star:not(.readonly):active { transform: scale(0.9); }
</style>
