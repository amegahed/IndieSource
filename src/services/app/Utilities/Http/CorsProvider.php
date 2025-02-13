<?php 

namespace App\Http;

use Illuminate\Support\ServiceProvider;
use App\Http\Cors;

class CorsProvider extends ServiceProvider
{
	public function register()
	{
		//$this->app->middleware(Cors::class);
		$this->app->middleware(new Cors($this->app));
	}
}