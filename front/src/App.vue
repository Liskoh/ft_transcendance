<script setup lang="ts">


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
  ];

  function getCommandToSend() : AbstractCommand {
    for (let i = 0; i < commands.length; i++) {
      if (commands[i].prefix.toLowerCase() === commandName.toLowerCase()) {
        return commands[i];
      }
    }
  }

  const commandToSend = getCommandToSend();

  if (commandToSend) {
    commandToSend.emitCommand(commandToSend.getCommandData(channelId, commandArgs));
  }

  switch (commandName) {
    case `/${Command.INVITE}`:
      SOCKET_SERVER.emit('inviteUser',
          {
            channelId: channelId,
            nickname: commandArgs[0],
          }
      );
      break;
    case `/${Command.SET_PASSWORD}`:
      //TODO setPassword(channelId, commandArgs);
      break;
    case `/${Command.UNSET_PASSWORD}`:
      //TODO unsetPassword(channelId, commandArgs);
      break;
    case `/${Command.PUNISH}`:
      const date = new Date(commandArgs[2]);

      SOCKET_SERVER.emit('applyPunishment',
          {
            channelId: channelId,
            nickname: commandArgs[0],
            punishmentType: commandArgs[1],
            date: date,
          }
      );
      break;
    case `/${Command.UN_PUNISH}`:
      SOCKET_SERVER.emit('cancelPunishment',
          {
            channelId: channelId,
            nickname: commandArgs[0],
            punishmentType: commandArgs[1],
          }
      );
      break;

    case `/${Command.SET_ADMIN}`:
      SOCKET_SERVER.emit('toggleAdminRole',
          {
            channelId: channelId,
            nickname: commandArgs[0],
            giveAdminRole: true,
          }
      );
      break;
    case `/${Command.UNSET_ADMIN}`:
      SOCKET_SERVER.emit('toggleAdminRole',
          {
            channelId: channelId,
            nickname: commandArgs[0],
            giveAdminRole: false,
          }
      );
      break;

    case `/${Command.CHANGE_CHANNEL_TYPE}`:
      SOCKET_SERVER.emit('changeChannelType',
          {
            channelId: channelId,
            channelType: commandArgs[0],
          }
      );
      break;

    default:
      // help(channelId, commandArgs);
      break;
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
    name : 'default',
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

const getChannel= () =>{
  SOCKET_SERVER.emit('getChannel', {
    id: 1,
  });
}

/*  Theme picker  */

const themeClass: string[] = ['t-dark', 't-light', 't-bonus'];

let selectedTheme: number = 0;

function switchTheme(themeId :number) : void
{
	if (themeId < 0 || themeId >= themeClass.length || themeId === selectedTheme)
		return ;
	
	if (selectedTheme === 2)
		themeId = 0; /* force back to dark when leaving bonus theme */

	let pBody = document.getElementById('bodyid');

	if (!pBody)
		return ;

	pBody.classList.replace(themeClass[selectedTheme], themeClass[themeId]);
	selectedTheme = themeId;

	const pFavicon :HTMLLinkElement | null = document.querySelector("link[rel='icon']");
	
	if (!pFavicon)
		return ;

	pFavicon.href = ((themeId < 2) ? '/42logo.png' : '/42logotrans.png');
}

</script>

<template>
	<div class="c-page">
		<header>
			<nav class="c-nav">
				<RouterLink to="/home">Home</RouterLink>
				<RouterLink to="/playerprofile">Profile</RouterLink>
				<RouterLink to="/game">Game</RouterLink>
				<RouterLink to="/gameresult">Game result</RouterLink>
				<RouterLink to="/pong">Pong</RouterLink>
			</nav>
			<div class="c-theme-picker">
				<div class="c-theme-picker-button" @click.exact="() => {switchTheme((selectedTheme + 1) % 2);}" @click.shift.exact="() => {switchTheme(2);}">
					<span>Dark</span>
					<span class="c-theme-separator">/</span>
					<span>Light</span>
				</div>
			</div>
		</header>

		<div class="c-subpage">
			<RouterView/>
			<!--
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
			<button @click="sendChatMessage">SENDMESSAGE</button>
			<button @click="getChannel">GETCHANNEL</button>-->
  			<a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-daf495cf13fd1f090c114ac2c7c8c9c0c15d11dee8de959157b2c07821a76d0d&redirect_uri=http%3A%2F%2Flocalhost:8000%2Fauth%2Fintra&response_type=code">LOGIN</a>
		</div>
		<footer>
			<div>
				ft_transcendance by x, y, z, w and h.
			</div>
		</footer>
	</div>


</template>

<style>
header {
	display: flex;
	place-items: center;
	background: var(--color-background-header);
	height: 7rem;
	border-radius: 0px;
	border-bottom: 8px solid var(--color-border-header);
}

footer {
	display: flex;
	place-items: center;
	justify-content: center;
	background: var(--color-background-header);
	height: 5rem;
	border-top: 8px solid var(--color-border-header);
	color: var(--color-text-soft);
}


nav {
  /*width: 100%;*/
  font-size: 24px;
  text-align: center;
}
.c-nav {
  flex: 20;
}

nav a.router-link-exact-active {
  color: var(--color-nav-accent);
  text-decoration: underline;
}

nav li {
  margin-right: 1rem;
}

nav a {
	display: inline-block;
	padding: 2px 0 2px 0;
	border-left: 1px solid var(--color-border);
}

nav a:hover {
  text-decoration: #3a768f;
}

a {
	color: var(--color-text);
	text-decoration: none;
	margin: 0 20px 0 20px;
}

.c-page {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.c-subpage {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
}

.c-theme-picker {
	flex: 3;
	display: flex;
	justify-content: center;
	user-select: none;
}

.c-theme-picker-button {
	cursor: pointer;
	border: 2px solid #202020;
	border-radius: 25px;
	padding: 4px;
	background: var(--color-theme-button-background);
}

.c-theme-separator {
	margin: 0 6px 0 6px;
	color: #202020;
	font-weight: bold;
}

</style>
