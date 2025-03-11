<!-- ControlPanel.vue -->
<template>
  <div>
      <h2>房间管理</h2>
      <div class="servers">
          <div class="button-container">           

              <GameButton 
                v-for="game in games"
                :key="game.gameId"
                :config="game"
                @game-start="startServerGame" />

          </div>
          <div class="server_container">
              <ServerBox v-for="server in servers" :key="server.roomID" :server="server"
                  :selected="selectedRoomID === server.roomID" @select="selectRoom" @close="closeRoom" />
          </div>
      </div>

      <hr />

      <h2>VR设备管理</h2>
      <div class="client_container">
          <ClientBox v-for="client in clients" :key="client.clientID" :client="client"
              :selected-room-id="selectedRoomID" @join="joinRoom" @quit="clientQuitGame" />
      </div>

      <hr />
      <button @click="clearInfo">清空信息</button>
      <ul id="websocket_events">
          <li v-for="(event, index) in events" :key="index">{{ event }}</li>
      </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ServerBox from './Components/ServerBox.vue';
import ClientBox from './Components/ClientBox.vue';
import GameButton from './components/GameButton.vue';

const games = ref([]);
const events = ref([]);
const servers = ref([]);
const clients = ref([]);
const selectedRoomID = ref(null);
let ws = null;

const loadGames = async()=>{
  try {
    games.value = await window.electronAPI.getGames()
  } catch (error) {
    console.error('Failed to load games:', error)
  }
}


// WebSocket处理
const setupWebSocket = () => {
  ws = new WebSocket("ws://127.0.0.1:7000/?role=controlpanel");

  ws.onmessage = (event) => {
      // const data = JSON.parse(event.data);
      // handleMessage(data);
      const rawData = event.data;
      append(rawData);

      try{
          const data = JSON.parse(rawData);
          handleMessage(data);
      }catch(e){
          console.error('JSON解析失败',e);
      }
  };

  ws.onopen = () => append("Connected to WebSocket!");
  ws.onclose = () => append("Connection closed");
  ws.onerror = () => append("Error happens");
};

// 消息处理
const handleMessage = (data) => {

  switch (data.command) {
      case 'update_single_client_info':
          updateClient(data.command_params);
          break;
      case 'update_single_server_info':
          updateServer(data.command_params);
          break;
      case 'client_offline':
          removeClient(data.command_params.clientID);
          break;
      case 'update_all_info':
          handleFullUpdate(data.command_params);
          break;
  }
};

// 更新客户端列表
const updateClient = (params) => {
  const index = clients.value.findIndex(c => c.clientID === params.clientID);
  if (index > -1) {
      clients.value[index] = { ...clients.value[index], ...params };
  } else {
      clients.value.push(params);
  }
};

// 更新服务器列表
const updateServer = (params) => {
  const index = servers.value.findIndex(s => s.roomID === params.roomID);
  if (index > -1) {
      servers.value[index] = { ...servers.value[index], ...params };
  } else {
      servers.value.push(params);
  }
};

// 处理全量更新
const handleFullUpdate = (params) => {
  servers.value = params.servers.map(s => ({
      roomID: s[0],
      ...s[1]
  }));

  clients.value = params.clients.map(c => ({
      clientID: c[0],
      ...c[1]
  }));

  if (servers.value.length > 0) {
      selectRoom(servers.value[0].roomID);
  }
};

// 其他方法
const append = (text) => events.value.push(text);
const clearInfo = () => events.value = [];
const startServerGame = (gameID) => sendCommand('start_gameserver', { gameID });
const selectRoom = (roomID) => selectedRoomID.value = roomID;

const closeRoom = (roomID) => {
  sendCommand('stop_gameserver', { roomID });
  servers.value = servers.value.filter(s => s.roomID !== roomID);
};

const joinRoom = (clientID) => {
  if (!selectedRoomID.value) return;

  const server = servers.value.find(s => s.roomID === selectedRoomID.value);
  sendCommand('connect_to_server', {
      clientID,
      roomID: selectedRoomID.value,
      gameID: server.gameID,
      serverPort: server.serverPort
  }, 'gameclient', clientID);
};

const clientQuitGame = (clientID) => sendCommand('quit_gameclient', {}, 'gameclient', clientID);

const sendCommand = (command, params, targetType = 'os', clientID = null) => {
  const message = {
      message_type: "command",
      target: { type: targetType },
      command,
      command_params: params
  };

  if (clientID) message.target.clientID = clientID;
  ws.send(JSON.stringify(message));
};

onMounted(()=>{
  setupWebSocket();
  loadGames();
});
onBeforeUnmount(() => ws?.close());
</script>

<style scoped>
/* 保留原有CSS样式 */
.server_container,
.client_container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 10px;
}

h2{
  padding:5px;
  margin:0px;
  margin-block-start: 0;
  margin-block-end:0;
}

.button-container {
  margin-bottom: 20px;
}

#websocket_events li {
  color: rgb(90, 90, 90);
  font-size: small;
  font-family: sans-serif;
}

.button-container button{
  padding:10px 20px;
  margin: 0 10px;
}

ul#websocket_events{
  text-align: left;
}
</style>