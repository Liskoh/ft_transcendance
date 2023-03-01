<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import io from 'socket.io-client'
import HelloWorld from './components/HelloWorld.vue'
import {SOCKET_SERVER} from "@/consts";
import {AbstractCommand} from "@/commands/abstract.command";
import {InviteCommand} from "@/commands/impl/invite.command";
import {PunishCommand} from "@/commands/impl/punish.command";
import {UnPunishCommand} from "@/commands/impl/un-punish.command";
import {ChangeChannelTypeCommand} from "@/commands/impl/change-channel-type.command";
import {SetUnsetAdminCommand} from "@/commands/impl/set-unset-admin.command";


const parseCommand = (channelId: number, command: string) => {

  const enum Command {
    INVITE = 'invite',
    SET_PASSWORD = 'set-password',
    UNSET_PASSWORD = 'unset-password',
    PUNISH = 'punish',
    UN_PUNISH = 'un-punish',
    SET_ADMIN = 'set-admin',
    UNSET_ADMIN = 'unset-admin',
    CHANGE_CHANNEL_TYPE = 'change-channel-type',
  }

  const commandArray = command.split(' ');
  const commandName = commandArray[0];
  const commandArgs = commandArray.slice(1);

  //If the command is not a command, return
  if (commandName[0] !== '/') {
    return;
  }


  //TODO SET THIS ON A MANAGER: COMMANDS
  const commands: AbstractCommand[] = [
    new InviteCommand('/invite', 'inviteUser'),
    new ChangeChannelTypeCommand('/change-channel-type', 'changeChannelType'),
    new PunishCommand('/punish', 'applyPunishment'),
    new UnPunishCommand('/un-punish', 'cancelPunishment'),
    new SetUnsetAdminCommand('/set-admin', 'toggleAdminRole', true),
    new SetUnsetAdminCommand('/unset-admin', 'toggleAdminRole', false),
  ];

  function getCommandToSend(): AbstractCommand {
    for (let i = 0; i < commands.length; i++) {
      if (commands[i].prefix.toLowerCase() === commandName.toLowerCase()) {
        return commands[i];
      }
    }
  }

  const commandToSend = getCommandToSend();

  if (commandToSend) {
    commandToSend.emitCommand(commandToSend.getCommandData(channelId, commandArgs));
    // console.log(commandToSend.getCommandData(channelId, commandArgs));
    return;
  }

  //in case of we cant find the command
  for (const command of commands) {
    console.log(command.getCommandHelp());
  }
}
const logout = () => {
  // Code pour exécuter la déconnexion de l'utilisateur ici

  //
  SOCKET_SERVER.on('connect', () => {
    console.log('Socket connected');
    SOCKET_SERVER.emit('logout');
  });

  SOCKET_SERVER.on('applyPunishmentSuccess', () => {
    console.log('Punishment applied');
  });

  SOCKET_SERVER.on('cancelPunishmentSuccess', () => {
    console.log('Punishment canceled successfully');
  });

  SOCKET_SERVER.on('toggleAdminRoleSuccess', () => {
    console.log('Admin role toggled successfully');
  });


  SOCKET_SERVER.on('userBlocked', () => {
    console.log('User blocked');
  });

  SOCKET_SERVER.on('userError', data => {
    console.log('error ' + data.message);
  });

  SOCKET_SERVER.on('channelError', data => {
    console.log('error ' + data.message);
  });

  SOCKET_SERVER.on('userBlocked', data => {
    if (!data.id || !data.nickname) {
      console.log("NULL VALUES");
    }

    SOCKET_SERVER.on('joinChannelSuccess', data => {
      console.log("joined channeld with succes");
    });

    SOCKET_SERVER.on('leaveChannelSuccess', data => {
      console.log("left channeld with succes");
    });

    SOCKET_SERVER.on('changeChannelTypeSuccess', data => {
      console.log("joined channeld with succes");
    });

    SOCKET_SERVER.on('getChannelSuccess', data => {
      console.log("get channel data with succes", data);
    });
    // console.log("User blocked" + data.id + " " + data.nickname);
  });

  SOCKET_SERVER.emit('blockUser', {login: 'hjordan'});

  // SOCKET_SERVER.on('blockUser', data  => {
  //   console.log('Logged in successfully');
  //   console.log(data);
  // });

  // socket.on('logout', () => {
  //   console.log('Logged out successfully');
  //   socket.disconnect();
  // });
}

const leaveChannel = () => {
  SOCKET_SERVER.emit('leaveChannel', {id: 1});
}

const joinChannel = () => {
  SOCKET_SERVER.emit('joinChannel', {
    id: 1,
    password: '1234Y34GFYSDGF8T7',
  });
}

const createChannel = () => {
  SOCKET_SERVER.emit('createChannel', {
    name: 'default',
    channelType: 'PUBLIC',
    // password: '1234Y34GFYSDGF8T7',
  });
}

const sendChatMessage = () => {
  SOCKET_SERVER.emit('sendMessage', {
    channelId: 1,
    text: 'Hello world from client!',
  });
}

const getChannel = () => {
  SOCKET_SERVER.emit('getChannel', {
    id: 1,
  });
}

import axios from 'axios';

let username: string;

async function login() {
  await axios.post('http://localhost:8000/auth/login', {
    login: username,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    console.log(response);
  }).catch(error => {
    console.log('error');
  });
}

</script>

<template>
  <div class="wrapper">
    <!--    <input v-model="text" @keyup.enter="handleKeyPress" type="text" />-->
  </div>
  <header>
    <!--    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125"/>-->

    <div class="wrapper">
      <!--      <HelloWorld msg="You did it!"/>-->

      <div>
        <p>Username: {{ username }}</p>
        <form @submit.prevent="login">
          <input v-model="username" type="text" placeholder="Username">
          <button type="submit">Login</button>
        </form>
      </div>

      <nav>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/playerprofile">Your profile</RouterLink>
        <RouterLink to="/game">Game</RouterLink>
        <RouterLink to="/gameresult">Game result</RouterLink>
        <RouterLink to="/pong">Pong</RouterLink>

        <button @click="logout">SOCKET</button>
        <button @click="joinChannel">JOIN CHANNEL</button>
        <button @click="leaveChannel">LEAVE CHANNEL</button>
        <button @click="parseCommand(1, '/punish u1o40tkN ban 2024-06-01T00:00:00')">BAN</button>
        <button @click="parseCommand(1, '/punish u1o40tkN mute 2024-06-01T00:00:00')">MUTE</button>
        <button @click="parseCommand(1, '/punish u1o40tkN kick 2024-06-01T00:00:00')">KICK</button>
        <button @click="parseCommand(1, '/un-punish u1o40tkN ban')">UN-BAN</button>
        <button @click="parseCommand(1, '/un-punish u1o40tkN mute')">UN-MUTE</button>
        <button @click="parseCommand(1, '/set-admin u1o40tkN')">SET-ADMIN</button>
        <button @click="parseCommand(1, '/unset-admin u1o40tkN')">UNSET-ADMIN</button>
        <button @click="createChannel">CREATE-CHANNEL</button>
        <button @click="parseCommand(1, '/invite u1o40tkN')">invite</button>
        <button @click="parseCommand(1, '/change-channel-type private')">change-channel-type</button>
        <button @click="parseCommand(1, '/h2763ggf u1o40tkN')">WRONG COMMAND</button>
        <button @click="sendChatMessage">SENDMESSAGE</button>
        <button @click="getChannel">GETCHANNEL</button>

      </nav>
    </div>
  </header>

  <RouterView/>
  <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8a1970373872e17eb5f24b04324c141e145ae1f4e9cc6c86de28dbbe8586b6e1&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth%2Fintra%2F&response_type=code">LOGIN</a>
</template>

<style scoped>

header {
  position: static;
  line-height: 1.5;
  max-height: 100vh;
}


.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
