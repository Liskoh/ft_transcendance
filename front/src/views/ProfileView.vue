<template>
  <div>
    <h1>User Details</h1>
    <div>
      <label for="name">Name:</label>
      <span id="name">{{ nickname }}</span>
    </div>
  </div>
</template>

<script>
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";

export default {
  name: 'ProfileView',
  props: {
    nickname: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      user: null,
    };
  },
  created() {
    // await this.fetchProfile(this.login);
  },
  // methods: {
  //    async fetchProfile(nickname: string): Promise<any> {
  //     try {
  //       const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/profile/${this.login}`;
  //       const response = await fetch(input);
  //
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log(data);
  //       } else {
  //         console.log('Erreur lors de la récupération du profil');
  //       }
  //       // Faire quelque chose avec les données de l'utilisateur
  //     } catch (error) {
  //       console.error('Erreur lors de la récupération du profil :', error);
  //     }
  //   },
  //   async fetchAvatar(login: string): Promise<any> {
  //     try {
  //       const input = `http://${VUE_APP_WEB_HOST}:${VUE_APP_BACK_PORT}/users/avatar/${login}`;
  //       console.log(input);
  //       const token = localStorage.getItem('token');
  //       const options = {
  //         method: 'GET',
  //         headers: {
  //           Authorization: 'Bearer ' + localStorage.getItem('token')
  //         },
  //       };
  //       const response = await fetch(input, options);
  //       if (response.ok) {
  //         console.log('avatar fetched ok');
  //         const blob = await response.blob();
  //         return URL.createObjectURL(blob);
  //       } else {
  //         return '/default.jpg';
  //       }
  //     } catch (error) {
  //       return '/default.jpg';
  //     }
  //   },
  // },
};
</script>