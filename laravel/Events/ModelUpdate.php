<?php

namespace Dewsign\PusherAgent\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ModelUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $module;
    public $data;
    public $event;
    public $locale;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($model, $event, $locale = 'en')
    {
        $classArray = explode('\\', get_class($model));
        $module = strtolower(end($classArray));

        $this->module = $module;
        $this->data = $model;
        $this->event = $event;
        $this->locale = $locale;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel($this->module);
    }
}
