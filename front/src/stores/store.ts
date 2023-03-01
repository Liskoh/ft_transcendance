import {createStore} from "vuex";
import {Channel} from "@/models/channel.model";
import {User} from "@/models/user.model";
import {Socket} from "socket.io-client";
import {SOCKET_SERVER} from "@/consts";

const store = createStore({
   state: {
       joinedChannels: <Channel[]> [],
       availableChannels: <Channel[]> [],
       currentChannelId: 0,
       channelSocket: <Socket | unknown> null,
   },
    getters: {
        getJoinedChannels: state => state.joinedChannels,
        getAvailableChannels: state => state.availableChannels,
        getCurrentChannelId: state => state.currentChannelId,

        getCurrentChannel: state => {
            return state.joinedChannels.find(channel => channel.id === state.currentChannelId);
        },

        getChannelSocket: state => state.channelSocket,
    },
    mutations: {
        setJoinedChannels(state, joinedChannels) {
            state.joinedChannels = joinedChannels;
        },

        setAvailableChannels(state, availableChannels) {
            state.availableChannels = availableChannels;
        },

        setCurrentChannelId(state, currentChannelId) {
            state.currentChannelId = currentChannelId;
        },

        setChannelSocket(state) {
            state.channelSocket = SOCKET_SERVER;
        }
    }
});