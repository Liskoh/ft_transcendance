import {createStore} from "vuex";
import {Channel} from "@/models/channel.model";
import {User} from "@/models/user.model";
import {Socket} from "socket.io-client";

export const store = createStore({
    state: {
        joinedChannels: <Channel[]>[],
        availableChannels: <Channel[]>[],
        currentChannelId: 0,
        currentChannel: <Channel | unknown>null,
        channelSocket: <Socket | unknown>null,
    },
    getters: {
        getJoinedChannels: state => state.joinedChannels,
        getAvailableChannels: state => state.availableChannels,
        getCurrentChannelId: state => state.currentChannelId,

        getCurrentChannel: state => state.currentChannel,

        getChannelSocket: state => state.channelSocket,
    },
    mutations: {
        setJoinedChannels(state, joinedChannels) {
            state.joinedChannels = joinedChannels;
        },

        setAvailableChannels(state, availableChannels) {
            state.availableChannels = availableChannels;
        },

        setCurrentChannel(state, currentChannel) {
            state.currentChannel = currentChannel;
        },


        setChannelSocket(state, channelSocket) {
            state.channelSocket = channelSocket;
        }
    }
});