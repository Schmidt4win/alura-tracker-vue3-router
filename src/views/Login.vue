<template>
    <div class="login-container" >
      <div class="card login-card">
        <div class="card-content">
          <div class="img-container has-text-centered">
            <img src="../assets/logo.jpg" alt="Logo" />
          </div>
          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input class="input" type="text" v-model="name" />
            </div>
          </div>
          <div class="field">
            <label class="label">Password</label>
            <div class="control">
              <input class="input" type="password" v-model="password" />
            </div>
          </div>
          
          <div class="field">
            <div class="control">
              <button class="button is-primary" @click="login">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';

export default {
  name: "LoginVue",
  data() {
    return {
      name: '',
      password: '',
      category: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(
          'https://api.heatmap.conectnet.net/login',
          {
            name: this.name,
            password: this.password,
          }
        );
        if (response.status === 201) {
          // Save token and username in local storage
          const token = response.data.token;
          const username = response.data.username;
          const expiration = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 hours from now
          const authData = {
            token: token,
            username: username,
            expiration: expiration,
          };
          localStorage.setItem('authData', JSON.stringify(authData));

          // Redirect to home route
          this.$router.push('/');
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};

  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #496678;
  }
  
  .login-card {
    width: 400px;
  }
  
  .img-container {
    margin-bottom: 1.5rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  </style>
  