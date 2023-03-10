<template>
  <div>
    <h1>User Details</h1>
    <div>
      <label for="name">Name:</label>
      <span id="name">{{ login }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  props: {
    login: {
      type: String,
      required: true,
    },
  },
  data() {
  },
  created() {
  },
  methods: {
  },
};
</script>