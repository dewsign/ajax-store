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
                locale: 'en',
                loading: false,
            },

            getters: {
                errors: state => state.errors,
                /**
                 * Return the items within this store module for the current language
                 */
                items: (state) => {
                    /**
                     * We need to check if the language objects already exists in the array and
                     * create a new Object if it doesn't to maintain Vue reactivity.
                     */
                    if (!state.items[state.locale]) {
                        const newLanguage = {}
                        newLanguage[state.locale] = []

                        set(state, 'items', Object.assign(newLanguage, state.items))
                    }

                    return state.items[state.locale]
                },
                selected: ({ items, locale, selected }) => find(items[locale], selected) || {},
                selectedIndex: ({ items, locale, selected }) => findIndex(items[locale], selected),
                locale: state => state.locale,
                loading: state => state.loading,
                hasItems: ({ items, locale }) => {
                    if (!items[locale]) return false

                    return items[locale].length !== 0
                },
            },

            mutations: {

                setLocale: (state, locale) => {
                    set(state, 'locale', locale)
                },

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

                updateItems: ({ items, locale }, newItems) => {
                    set(items, locale, newItems)
                },

                updateLoading: (state, loading) => {
                    set(state, 'loading', loading)
                },

                updateErrors: (state, errors) => {
                    set(state, 'errors', errors)
                },

            },

            actions: {

                setLocale: ({ commit }, locale = 'en') => {
                    commit('setLocale', locale)
                },

                selectItem: ({ commit }, selection = null) => {
                    commit('selectItem', selection)
                },

                updateSelected: ({ commit, getters }, value) => {
                    commit('updateSelected', {
                        item: value,
                        index: getters.selectedIndex,
                    })
                },

                updateItems: ({ commit, state }) => {
                    commit('updateLoading', true)

                    axios({
                        method: this.method,
                        url: this.getActionUrlForLocale(state.locale),
                    })
                        .then((response) => {
                            commit('updateLoading', false)
                            commit('updateItems', response.data)
                        })
                        .catch((error) => {
                            commit('updateLoading', false)
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

                updateLoading: ({ commit }, loading) => {
                    commit('updateLoading', loading)
                },
            },
        }
    }
}

export default AjaxStore
