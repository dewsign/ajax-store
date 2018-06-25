import { mapGetters, mapActions } from 'vuex'

export default (store, relationships = []) => ({

    computed: {

        ...mapGetters(store, [
            'items',
            'selected',
            'hasItems',
            'translations',
        ]),

        ...mapGetters([
            'locale',
            'languages',
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
            'deleteSelected',
        ]),

        /**
         * Set the current item in the store to that of the current route parameter
         */
        setSelectedItemFromRoute() {
            this.selectItem({ id: parseInt(this.$route.params.id) })
        },

        /**
         * Load relationships model data
         */
        loadRequiredRelationships(locale = null) {
            relationships.map(related => this.$store.dispatch(`${related}/fillItems`, locale))
        },

        /**
         * Load all data for the current module and any relationships for all required languages.
         * Typically this method should be used for initial population of data as it will only
         * request data if it doesn't already exist client site (hasn't been loaded yet)
         */
        populateAllDatasets() {
            const languages = this.languages.length ? this.languages : ['en']

            languages.map((language) => {
                this.fillItems(language)
                this.loadRequiredRelationships(language)
                return true
            })
        },

    },

    watch: {
        languages: {
            handler() {
                /**
                 * Ensure we have all required content for all languages when the languages change
                 */
                this.populateAllDatasets()
            },
        },

        translations: {
            handler(availableTranslations) {
                this.$store.dispatch('setTranslations', availableTranslations)
            },
        },
    },

    mounted() {
        this.setSelectedItemFromRoute()
        this.populateAllDatasets()
        this.$store.dispatch('setTranslations', this.translations)
    },

})
