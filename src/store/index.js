import {createStore} from 'vuex'

export default createStore({
    state: {
        isLogin: false,
        existed: false,
        form: {
            userqq: '',
            userpwd: '',
            username: '',
            id: '',
            invitenum: '',
        },
        lastShow: null,
    },
    getters: {},
    mutations: {
        setIsLogin(state, value) {
            state.isLogin = value;
        },
        setForm(state, value) {
            state.form = value;
        },
        setUserQQ(state, value) {
            state.form.userqq = value;
        },
        setUserPwd(state, value) {
            state.form.userpwd = value;
        },
        setId(state, value) {
            state.form.id = value;
        },
        setUsername(state, value) {
            state.form.username = value;
        },
        setInviteNum(state, value) {
            state.form.invitenum = value;
        },
        setLastShow(state, value) {
            state.lastShow = value
        }
    },
    actions: {},
    modules: {}
})
