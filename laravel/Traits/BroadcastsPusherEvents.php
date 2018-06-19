<?php

namespace Dewsign\PusherAgent\Traits;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Event;
use Dewsign\PusherAgent\Events\ModelUpdate;

trait BroadcastsPusherEvents
{
    static public function bootBroadcastsPusherEvents()
    {
        static::created(function ($model) {
            Event::fire(new ModelUpdate($model, 'Created', App::getLocale()));
        });

        /**
         * For some reason the updated event wasn't triggering to we are hooking into the saving
         * model even but only actioning it if the item wasn't recently created.
         */
        static::saved(function ($model) {
            if ($model->wasRecentlyCreated) {
                return;
            }

            Event::fire(new ModelUpdate($model, 'Updated', App::getLocale()));
        });

        /**
         * NOTICE: For some reason this doesn't get fired but we keep it here incase that unexpected
         * behaviour changes and the event actually gets dispatched. Won't hurt.
         */
        static::updated(function ($model) {
            Event::fire(new ModelUpdate($model, 'Updated', App::getLocale()));
        });

        static::deleting(function ($model) {
            Event::fire(new ModelUpdate($model, 'Deleted', App::getLocale()));
        });
    }

    /**
     * Removes a translations and fires the model delted event for pusher.
     *
     * @param string $locale
     * @return void
     */
    public function deleteTranslation(string $locale)
    {
        $model = $this;

        $this->forgetAllTranslations($locale);
        $this->save();

        Event::fire(new ModelUpdate($model, 'Deleted', $locale));

    }
}
