<template>
    <button 
    @click="handleClick" 
    :data-game-id="config.gameId">{{ config.displayName }}</button>
</template>
<script setup>
const props = defineProps({
    config:{
        type: Object,
        required: true,
        validator: value =>{
            return 'gameId' in value && 'displayName' in value
        }
    }
})

const emit = defineEmits(['game-start'])

const handleClick = ()=>{
    emit('game-start', props.config.gameId)
}
</script>

<style scoped>
.game-button {
  padding: 12px 24px;
  margin: 8px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.game-button:hover {
  background: #1976D2;
}
</style>