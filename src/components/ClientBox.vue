<!-- ClientBox.vue -->
<template>
    <div class="clientbox">
        <div class="box-title">VR机 {{ client.clientID }}</div>
        <div class="inner-box">
            <p class="status">状态:{{ client.status }}</p>
            <div class="button-container">
                <button :disabled="isGameConnected" @click="$emit('join', client.clientID)">加入房间</button>
                <button :disabled="!isGameConnected" @click="$emit('quit', client.clientID)">退出游戏</button>
            </div>
            <p>房间:{{ client.roomID }}</p>
            <progress :value="client.progress * 100" max="100"></progress>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    client: Object
});

const isGameConnected = computed(() =>
    props.client.status === "joined_game"
);

</script>

<style scoped>
/* 保留原有clientbox样式 */
.clientbox {
    color:black;
    width: 200px;
    height: 200px;
    padding: 10px;
    background-color: rgb(16, 105, 115);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}
.box-title{
    color:white;
}

.inner-box{
    font-size:small;
    width: 100%;
    flex-grow: 1;
    padding:5px;
    background-color: white;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    box-sizing: border-box;
}

.inner-box p {
    margin: 0;
    font-size: small;
}

.clientbox button{
    margin: 5px 0px;
    padding: 10px 20px;
}

progress {
    width: 100%;
}
</style>