<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\BaseController;

class ContactController extends BaseController
{
	/**
	 * Create a new contact submission.
	 *
	 * @param Illuminate\Http\Request $request - the Http request object
	 * @return object
	 */
	public function postCreate(Request $request) {

		// parse parameters
		//
		$name = $request->input('name');
		$username = $request->input('username');
		$email = $request->input('email');
		$subject = $request->input('subject');
		$messageText = $request->input('message');

		// send email
		//
		Mail::send('emails.contact-us', [
			'name' => $name,
			'username' => $username,
			'email' => $email,
			'subject' => $subject,
			'message_text' => $messageText,
			'app_name' => config('app.name'),
			'client_url' => config('app.client_url')
		], function($message) use ($name, $username, $email, $subject, $messageText) {
			$message->to(config('mail.username') . '@' . config('mail.host'));
			$message->subject($subject);
		});

		// return sent information
		//
		return [
			'name' => $name,
			'username' => $username,
			'email' => $email,
			'subject' => $subject,
			'message' => $messageText
		];
	}
}