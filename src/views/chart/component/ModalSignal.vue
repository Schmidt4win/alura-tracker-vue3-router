<template>
  <div class="modal" v-if="selectedClient">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h3>{{ selectedClient.name }}</h3>
      <div v-for="(data, date_time) in clientDataByDate" :key="date_time">
        <p>Status: {{ data.Status }}</p>
        <p>Power Level: {{ parseFloat(data['Power Level']) }}</p>
        <p>RSSI: {{ parseFloat(data.RSSI) }}</p>
        <p>Data: {{ date_time }}</p>
        <hr />
      </div>
    </div>
  </div>
</template>

  
  <script lang="ts">
  export default {
    name: "ModalSignal",
    props: {
      selectedClient: {
        type: Object,
        default: null,
      },
      clientDataByDate: {
        type: Object,
        default: () => ({}),
      },
    },
    methods: {
      closeModal() {
        this.$emit("close");
      },
    },
  };
  </script>
  
  <style scoped>
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close {
  color: #aaa;
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
  
  