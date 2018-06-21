/* eslint-disable no-param-reassign */

import axios from 'axios'
import { set } from 'vue'
import { find, findIndex } from 'lodash'

class AjaxStore {
    constructor(options = {}) {
        this.action = options.action || ''
        this.method = options.method || 'GET'

        return this.getStore()
    }

    getActionUrlForLocale(locale = 'en') {
        return this.action.replace('__locale__', locale)
    }

    getStore() {
        return {
            namespaced: true,

            state: {
                errors: [],
                items: {},
                selected: null,
            },

            getters: {
                errors: state => state.errors,

                /**
                 * Return the items within this store module for the current language
                 */
                items: (state, { locale }) => {
                    /**
                     * We need to check if the language objects already exists in the array and
                     * create a new Object if it doesn't to maintain Vue reactivity.
                     */
                    if (!state.items[locale]) {
                        const newLanguage = { [locale]: [] }

                        set(state, 'items', Object.assign(newLanguage, state.items))
                    }

                    return state.items[locale]
                },

                /**
                 * Map the local locale getter to the root locale getter for easier usability
                 * within this module.
                 */
                locale: (state, getters, rootState, { locale }) => locale,

                /**
                 * Return the currently selected item in the active locale or the default
                 * locale if one doesn't exist.
                 */
                selected: ({ selected }, { items, selectedDefault }) =>
                    find(items, selected) || selectedDefault || {},

                /**
                 * Return the selected item in the default locale
                 * to use when creating new translations.
                 */
                selectedDefault: ({ selected, items }) => find(items.en, selected) || {},

                /**
                 * Get the index of the selected item in the active locale.
                 */
                selectedIndex: ({ selected }, { items }) => findIndex(items, selected),

                /**
                 * Determine if the current locale has any items so that we can load them if not.
                 */
                hasItems: (state, { items }) => {
                    if (!items) return false

                    return items.length !== 0
                },

                /**
                 * Returns an array of locale identifiers in which the currently selected item
                 * exists in order to determine what translations are available.
                 */
                translations: ({ items, selected }, getters, rootState, { languages }) =>
                    languages.filter(language =>
                        find(items[language], selected) instanceof Object),
            },

            mutations: {

                selectItem: (state, selection) => {
                    set(state, 'selected', selection)
                },

                createItem: ({ items }, { locale, item }) => {
                    items[locale].push(item)
                },

                updateItem: ({ items }, { index, item, locale }) => {
                    set(items[locale], index, item)
                },

                deleteItem: ({ items }, { locale, data }) => {
                    set(items, locale, items[locale].filter(({ id }) => id !== data.id))
                },

                updateItems: ({ items }, { data, locale }) => {
                    set(items, locale, data)
                },

                updateErrors: (state, errors) => {
                    set(state, 'errors', errors)
                },

            },

            actions: {

                /**
                 * Set the selected item in this store. The selection should be a nested object
                 * identifier. E.g. { id: 4 }.
                 */
                selectItem: ({ commit }, selection = null) => {
                    commit('selectItem', selection)
                },

                /**
                 * Helper method to update the current item. NOTE: It actually matches the item from
                 * the value and doesn't use the selected getter.
                 */
                updateSelected: ({ dispatch, getters: { locale } }, value) => {
                    dispatch('itemUpdated', {
                        data: value,
                        locale,
                    })
                },

                /**
                 * Helper method to delete the current item. NOTE: It actually matches the item from
                 * the value and doesn't use the selected getter.
                 */
                deleteSelected: ({ dispatch, getters: { locale } }, value) => {
                    dispatch('itemDeleted', {
                        data: value,
                        locale,
                    })
                },

                /**
                 * Re-populate the items for a locale from an API Endpoint.
                 * Replaces the current list of items.
                 */
                updateItems: ({ dispatch, commit, getters }, forceLocale = null) => {
                    dispatch('setLoading', true, { root: true })

                    axios({
                        method: this.method,
                        url: this.getActionUrlForLocale(forceLocale || getters.locale),
                    })
                        .then(({ data }) => {
                            dispatch('setLoading', false, { root: true })
                            commit('updateItems', {
                                locale: forceLocale || getters.locale,
                                data,
                            })
                        })
                        .catch((error) => {
                            dispatch('setLoading', false, { root: true })
                            commit('updateErrors', error)
                        })
                },

                /**
                 * Event listener action called by pusher.
                 * Updates an item or creates it if it doesn't already exist.
                 */
                itemUpdated: ({ commit, state }, { locale, data }) => {
                    const { id } = data
                    const index = findIndex(state.items[locale], { id })

                    const itemMethod = index > -1 ? 'updateItem' : 'createItem'

                    commit(itemMethod, {
                        item: data,
                        index,
                        locale,
                    })
                },

                /**
                 * Event listener action called by pusher.
                 * Creates a new item.
                 */
                itemCreated: ({ commit }, { locale, data }) => {
                    commit('createItem', {
                        locale,
                        item: data,
                    })
                },

                /**
                 * Event listener action called by pusher.
                 * Deleted an item.
                 */
                itemDeleted: ({ commit }, { locale, data }) => {
                    commit('deleteItem', { locale, data })
                },

                /**
                 * Try to populate the items if there aren't any already. Works like updateItems but
                 * doesn't force a local update. Typically used when switching locale.
                 */
                fillItems: ({ getters, dispatch }, forceLocale = null) => {
                    if (getters.hasItems) return

                    dispatch('updateItems', forceLocale)
                },

            },
        }
    }
}

export default AjaxStore
