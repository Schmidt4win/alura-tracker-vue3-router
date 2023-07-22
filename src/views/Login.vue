<template>
  <div class="login-container">
    <div class="card login-card">
      <div class="card-content">
        <div class="img-container has-text-centered">
          <img src="../assets/logo.jpg" alt="Logo" class="rounded-image" />
        </div>
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input class="input" type="text" v-model="name" @keydown.enter="login" />
          </div>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input class="input" type="password" v-model="password" @keydown.enter="login" />
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

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
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
          const username = response.data.name;
          const expiration = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 hours from now
          const authData = {
            token: token,
            username: username,
            expiration: expiration,
          };
          console.log(username)
          localStorage.setItem('authData', JSON.stringify(authData));

          // Redirect to home route
          this.$router.push('/');
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background:  rgb(12, 1, 73);
  padding: 1.50rem;
}

.login-card {
  width: 400px;
  padding: 1.25rem;
  background-color: aliceblue;
  border-radius: 10px;
  background: #ff811a;
}

.img-container {
  margin-bottom: 1.5rem;
  padding: 1.50rem;
  border-radius: 50%;
  max-width: 200px;
  max-height: 200px;
  background: aliceblue;

}

.rounded-image {
  border-radius: 10px;
}

.card-content {
  padding: 1.5rem;
  padding: 1.50rem;
  border-radius: 10px;
}

.button {
  border: 1px solid #e96d13;
  background-color: #496678;
  color: #e96d13;
  transition: background-color 0.3s, color 0.3s;
}

.button:hover {
  background-color: aliceblue;
  color: #496678;
}

.input:focus {
  box-shadow: 0 0 0 0.125em #496678;
}
</style>

         
          