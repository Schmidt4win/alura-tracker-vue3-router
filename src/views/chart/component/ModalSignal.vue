<template>
    <div class="modal" v-if="selectedClient">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>{{ selectedClient.name }}</h3>
        <Box class="box-inside-modal">
        
          <apexchart
            type="line"
            :options="chartOptions"
            :series="chartSeries"
            width="100%"
            height="400"
          />
        </Box>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import Box from '@/components/Box.vue';
  import VueApexCharts from 'vue3-apexcharts';
  
  export default defineComponent({
    name: 'ModalSignal',
   
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
    components: {
      apexchart: VueApexCharts,
      Box
    },
    computed: {
      chartOptions() {
        return {
          chart: {
            height: 350,
            type: 'line',
            dropShadow: {
              enabled: true,
              color: '#000',
              top: 18,
              left: 7,
              blur: 10,
              opacity: 0.2,
            },
            toolbar: {
              show: false,
            },
          },
          colors: ['#77B6EA', '#545454'],
          dataLabels: {
            enabled: true,
          },
          stroke: {
            curve: 'smooth',
          },
          title: {
            text: 'Historico de Sinal',
            align: 'left',
          },
          grid: {
            borderColor: '#e7e7e7',
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5,
            },
          },
          markers: {
            size: 2,
          },
          xaxis: {
            categories: Object.keys(this.clientDataByDate), // Use the dates as categories
            title: {
              text: 'Data da Leitura',
            },
          },
          yaxis: {
            title: {
              text: 'Diferença',
              
            },
          },
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5,
          },
        };
      },
      chartSeries() {
        // Convert your clientDataByDate object into a format suitable for ApexCharts
        const series = [
          {
            name: 'Tx',
            data: Object.values(this.clientDataByDate).map((data) =>
              parseFloat(data.RSSI)
            ),
          },
          {
            name: 'Rx',
            data: Object.values(this.clientDataByDate).map((data) =>
              parseFloat(data['Power Level'])
            ),
          },
        ];
        return series;
      },
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
    },
  });
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
    background-color: rgb(12, 1, 73);
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    border-radius: 5px; /* Rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Add a box shadow */
  }

  .close {
    color: #aaa;
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.2s ease; /* Add a smooth color transition on hover */
  }

  .close:hover,
  .close:focus {
    color: #333;
    text-decoration: none;
    cursor: pointer;
  }

  /* Styling the modal title */
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: aliceblue;
  }

  /* Style for the Box inside the modal */
  .box-inside-modal {
    margin-top: 1rem;
  }
</style>
  