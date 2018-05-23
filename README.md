# AJAX Vuex Store

[![npm](https://img.shields.io/npm/v/ajax-store.svg?style=for-the-badge)](https://www.npmjs.com/package/ajax-store)

Authors:

* [Marco Mark](mailto:marco.mark@dewsign.co.uk)
* [Sam Wrigley](mailto:sam.wrigley@dewsign.co.uk)

## Overview

A namespaced Vuex store module that makes use of AJAX to get and update the store's data from the given API end-point.

## Usage

To use the AJAX Vuex store in your application, start by extending the `AjaxStore` class from your own store class, such as below:

```js
import { AjaxStore } from 'ajax-store'

class ExampleStore extends AjaxStore {
    constructor() {
        super({
            action: 'https://example.com',
            method: 'GET', // Default
        })
    }
}

export default ExampleStore
```

You can specify the AJAX request 'action' and 'method' when calling the parent class' constructor.

Import your newly created namespaced store module into your Vuex store, for example:

```js
import Vue from 'vue'
import Vuex from 'vuex'

import ExampleStore from './ExampleStore'

Vue.use(Vuex)

const VuexStore = new Vuex.Store({
    modules: {
        example: new ExampleStore(),
    },
})

export default VuexStore
```

To get data from the namespaced Vuex store (or to update it) in your Vue component, you can make use of the Vuex `mapGetters` and `mapActions` helper methods. Below is an example implementation of a Vue component that checks if the namespaced Vuex store contains any items during the `created` lifecycle hook. If the store contains no items, then the `updateItems` action is dispatched to get the items from the given API end-point specified in your namespaced store module using AJAX.

```js
import { mapGetters, mapActions } from 'vuex'

created() {
    if (!this.hasItems) this.updateItems()
},

computed: {
    ...mapGetters('example', [
        'items',
        'hasItems',
    ]),
},

methods: {
    ...mapActions('example', [
        'updateItems',
    ]),
},
```

## PusherAgent for Laravel Echo with Pusher

The agent will listen for any updates from the api and commit them into the current state to ensure all connected clients are in-sync and remove the need for regular ajax calls to fetch the latest data.

IMPORTANT: The agent will automatically listen to `private` pusher channels with the same name as the Vuex Store Module defined earlier. In this case `example` (`private-example`). This should also match the name of your Laravel Model class.

When creating your root Vue instance, add the PusherAgent plugin and mixin.

```js
import Vue from 'vue'
import { PusherAgent } from 'ajax-store'

Vue.use(PusherAgent.plugin, {
    key: 'your pusher key',
    cluster: 'eu',
    encrypted: true,
})

new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App,
    },
    mixins: [
        PusherAgent.mixin,
    ]
})
```
