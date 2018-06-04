import { mapGetters, mapActions } from 'vuex'

export default store => ({

    computed: {

        ...mapGetters(store, [
            'items',
            'selected',
            'hasItems',
        ]),

        ...mapGetters([
            'locale',
            'loading',
        ]),

    },

    methods: {

        /**
         * Import store actions to handle interactions with the current store
         */
        ...mapActions(store, [
            'fillItems',
            'selectItem',
            'setLocale',
            'updateItems',
            'updateSelected',
        ]),

        /**
         * Set the current item in the store to that of the current route parameter
         */
        setSelectedItemFromRoute() {
            this.selectItem({ id: parseInt(this.$route.params.id) })
        },

    },

    mounted() {
        this.setSelectedItemFromRoute()
        this.fillItems()
    },

})
