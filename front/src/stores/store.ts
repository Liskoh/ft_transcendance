import {createStore} from "vuex";
import {Channel} from "@/models/channel.model";
import {User} from "@/models/user.model";
import io, {Socket} from "socket.io-client";
import * as process from "process";
import {VUE_APP_BACK_PORT, VUE_APP_WEB_HOST} from "@/consts";
import {Duel} from "@/models/duel.model";
import {SocketType} from "@/utils/socket-type.enum";

export const store = createStore({
    state: {
        joinedChannels: <Channel[]>[],
        availableChannels: <Channel[]>[],
        directChannels: <Channel[]>[],
        waitingDuels: <Duel[]>[],
        playing: <boolean>false,
        me: <User | unknown>null,
        friends: <User[]>[],
        blockedUsers: <User[]>[],
        currentChannel: <Channel | unknown>null,
        channelSocket: <Socket | unknown>null,
        userSocket: <Socket | unknown>null,
        pongSocket: <Socket | unknown>null,
        onGame: <boolean>false,
    },
    getters: {
        getJoinedChannels: state => state.joinedChannels,
        getAvailableChannels: state => state.availableChannels,
        getDirectChannels: state => state.directChannels,

        getCurrentChannel: state => state.currentChannel,

        getChannelSocket: state => () => {
            // if (state.channelSocket === null || !state.channelSocket.connected) {
            //     state.channelSocket = io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/channels', {
            //         extraHeaders: {
            //             Authorization: 'Bearer ' + localStorage.getItem('token')
            //         }
            //     });
            // }
            return state.channelSocket;
        },
        getUserSocket: state => () => {
            if (state.userSocket === null || !state.userSocket.connected) {
                state.userSocket = io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/users', {
                    extraHeaders: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
            }
            return state.userSocket;
        },
        getPongSocket: state => () => {
            if (state.pongSocket === null || !state.pongSocket.connected) {
                state.pongSocket = io('http://' + VUE_APP_WEB_HOST + ':' + VUE_APP_BACK_PORT + '/game', {
                    extraHeaders: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
            }
            return state.pongSocket;
        },

        isPlaying: state => {
            return state.playing;
        },

        getMe: state => () => {
            return state.me;
        },

        getFriends: state => () => {
            return state.friends;
        },

        getBlockedUsers: state => () => {
            return state.blockedUsers;
        },

        getWaitingDuels: state => state.waitingDuels,

        //getters:
        getChannelById: state => (id: number) => {
            return state.joinedChannels.find(channel => channel.id === id);
        },

        isOnGame: state => state.onGame,
    },
    actions: {
        connectUserSocket() {
            this.getters.getUserSocket();
        },
        hasToken(): boolean {
            return localStorage.getItem('token') !== null;
        },
    },
    mutations: {
        setJoinedChannels(state, joinedChannels) {
            state.joinedChannels = joinedChannels;
        },

        setAvailableChannels(state, availableChannels) {
            state.availableChannels = availableChannels;
        },

        setDirectChannels(state, directChannels) {
            state.directChannels = directChannels;
        },

        setCurrentChannel(state, currentChannel) {
            state.currentChannel = currentChannel;
        },

        setChannelSocket(state, channelSocket) {
            state.channelSocket = channelSocket;
        },

        setPongSocket(state, pongSocket) {
            state.pongSocket = pongSocket;
        },

        setWaitingDuels(state, waitingDuels) {
            state.waitingDuels = waitingDuels;
        },

        setMe(state, me) {
            state.me = me;
        },

        setFriends(state, friends) {
            state.friends = friends;
        },

        setBlockedUsers(state, blockedUsers) {
            state.blockedUsers = blockedUsers;
        },

        setOnGame(state, onGame) {
            state.onGame = onGame;
        },
    }
});