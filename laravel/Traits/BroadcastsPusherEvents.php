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
        /**
         * For some reason the updated event wasn't triggering so we are hooking into the saving model event
         * This is triggered on create and save and we fire the appropriate event based on wasRecentlyCreated
         */
        static::saved(function ($model) {
            if ($model->wasRecentlyCreated) {
                Event::fire(new ModelUpdate($model, 'Created', App::getLocale()));

                $model->wasRecentlyCreated = false;

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
