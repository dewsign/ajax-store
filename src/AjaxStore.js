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
                items: (state, getters) => {
                    /**
                     * We need to check if the language objects already exists in the array and
                     * create a new Object if it doesn't to maintain Vue reactivity.
                     */
                    if (!state.items[getters.locale]) {
                        const newLanguage = { [getters.locale]: [] }

                        set(state, 'items', Object.assign(newLanguage, state.items))
                    }

                    return state.items[getters.locale]
                },
                /**
                 * Map the local locale getter to the root locale getter for easier usability
                 * within this modeule.
                 */
                locale: (state, getters, rootState, { locale }) => locale,
                selected: ({ selected }, { items }) => find(items, selected) || {},
                selectedIndex: ({ selected }, { items }) => findIndex(items, selected),
                hasItems: (state, { items }) => {
                    if (!items) return false

                    return items.length !== 0
                },
            },

            mutations: {

                selectItem: (state, selection) => {
                    set(state, 'selected', selection)
                },

                createItem: ({ items }, { locale, data }) => {
                    items[locale].push(data)
                },

                updateItem: ({ items }, { index, item, locale }) => {
                    set(items[locale], index, item)
                },

                deleteItem: ({ items }, { locale, data }) => {
                    set(items, locale, items[locale].filter(({ id }) => id !== data.id))
                },

                updateSelected: ({ items, locale }, { index, item }) => {
                    set(items[locale], index, item)
                },

                updateItems: ({ items }, { data, locale }) => {
                    set(items, locale, data)
                },

                updateErrors: (state, errors) => {
                    set(state, 'errors', errors)
                },

            },

            actions: {

                selectItem: ({ commit }, selection = null) => {
                    commit('selectItem', selection)
                },

                updateSelected: ({ commit, getters }, value) => {
                    commit('updateSelected', {
                        item: value,
                        index: getters.selectedIndex,
                    })
                },

                updateItems: ({ dispatch, commit, getters }) => {
                    dispatch('setLoading', true, { root: true })

                    axios({
                        method: this.method,
                        url: this.getActionUrlForLocale(getters.locale),
                    })
                        .then(({ data }) => {
                            dispatch('setLoading', false, { root: true })
                            commit('updateItems', {
                                locale: getters.locale,
                                data,
                            })
                        })
                        .catch((error) => {
                            dispatch('setLoading', false, { root: true })
                            commit('updateErrors', error)
                        })
                },

                itemUpdated: ({ commit, state }, { locale, data }) => {
                    const { id } = data

                    commit('updateItem', {
                        item: data,
                        index: findIndex(state.items[locale], { id }),
                        locale,
                    })
                },

                itemCreated: ({ commit }, { locale, data }) => {
                    commit('createItem', { locale, data })
                },

                itemDeleted: ({ commit }, { locale, data }) => {
                    commit('deleteItem', { locale, data })
                },

                /**
                 * Try to populate the items if there aren't any already. Works like updateItems but
                 * doesn't force a local update. Typically used when switching locale.
                 */
                fillItems: ({ getters, dispatch }) => {
                    if (getters.hasItems) return

                    dispatch('updateItems')
                },

            },
        }
    }
}

export default AjaxStore
