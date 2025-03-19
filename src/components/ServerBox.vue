<!-- ServerBox.vue -->
<template>
    <div :class="['serverbox', { selected: selected, unselected: !selected }]" @click="$emit('select', server.roomID)">
        <div class="box-title">房间: {{ server.roomID }}</div>
        <div class="inner-box">
            <p>游戏: {{ server.gameID }}</p>
            <p>端口: {{ server.serverPort }}</p>
            <p>状态: {{ server.status }}</p>
            <div class="button-container">
                <button @click.stop="$emit('start', server.roomID)">进行游戏</button>
                <button @click.stop="$emit('close', server.roomID)">关闭房间</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    server: Object,
    selected: Boolean
});
</script>

<style scoped>
/* 保留原有serverbox样式 */
.serverbox {
    width: 200px;
    height: 200px;
    background-color: grey;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    box-sizing: border-box;
}

.serverbox.selected {
    background-color: green;
}

.serverbox.unselected {
    background-color: grey;
}

.truncate {
    width: 150px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}

.inner-box {
    font-size:small;
    width: 100%;
    flex-grow: 1;
    background-color: white;
    border: 1px solid black;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
}

.serverbox p{
    color:black;
    margin:0
}
</style>