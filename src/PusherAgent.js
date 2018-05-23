import Echo from 'laravel-echo'
import PusherJs from 'pusher-js'

export default {

    plugin: {
        install(Vue, {
            key, cluster = 'eu',
            encrypted = true,
            namespace = 'Dewsign.PusherAgent.Events',
        }) {
            window.Pusher = PusherJs

            Object.defineProperty(Vue.prototype, '$echo', {
                value: new Echo({
                    broadcaster: 'pusher',
                    key,
                    cluster,
                    encrypted,
                    namespace,
                }),
            })
        },
    },

    mixin: {
        /**
         * Here we loop over every loaded Vuex module and listen to broadcasts within a private
         * channel of the same name. That allows our AjaxStore to action all changes made to the
         * database backend to all current CMS users.
         *
         * TODO: Move into AjaxStore package
         */
        mounted() {
            /* eslint-disable no-underscore-dangle */
            Object.keys(this.$store._modules.root._children).forEach((module) => {
                this.$echo.private(module).listen('ModelUpdate', ({ locale, event, data }) => {
                    this.$store.dispatch(`${module}/item${event}`, { locale, data })
                })
                console.log(`Connected ${module}`)
            })
        },
    },

}
