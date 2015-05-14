<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Example
 *
 * This is an example of a few basic user interaction methods you could use
 * all done with a hardcoded array.
 *
 * @package		CodeIgniter
 * @subpackage	Rest Server
 * @category	Controller
 * @author		Phil Sturgeon
 * @link		http://philsturgeon.co.uk/code/
*/

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class Example extends REST_Controller
{
    function expenses_get()
    {
error_reporting( E_ALL );
        $expenses = array();
echo __line__.'.';
        require_once APPPATH.'/third_party/php-google-spreadsheet-client-master/src/Google/Spreadsheet/Autoloader.php';
echo __line__.'.';
        $accessToken = 'AIzaSyB9CYVZLGYdpOPZjCGTi5akl-fjNXdt5OA';echo __line__.'.';
        $request = new Google\Spreadsheet\Request($accessToken);echo __line__.'.';
        $serviceRequest = new Google\Spreadsheet\DefaultServiceRequest($request);echo __line__.'.';
        Google\Spreadsheet\ServiceRequestFactory::setInstance($serviceRequest);echo __line__.'.';
echo __line__.'.';
        $spreadsheetService = new Google\Spreadsheet\SpreadsheetService();echo __line__.'.';
        $spreadsheetFeed = $spreadsheetService->getSpreadsheets();echo __line__.'.';
        $spreadsheet = $spreadsheetFeed->getByTitle('MySpreadsheet');echo __line__.'.';
        $worksheetFeed = $spreadsheet->getWorksheets();echo __line__.'.';
        $worksheet = $worksheetFeed->getByTitle('Sheet 1');echo __line__.'.';
        $listFeed = $worksheet->getListFeed();echo __line__.'.';
echo __line__.'.';
        foreach ($listFeed->getEntries() as $entry) {
            $values = $entry->getValues();
        }
echo __line__.'.';
        if($expenses)
        {echo __line__.'.';
            $this->response($users, 200); // 200 being the HTTP response code
        }
        else
        {echo __line__.'.';
            $this->response(array('error' => 'Couldn\'t find any users!'), 404);
        }
echo __line__.'.';

    }


    function expensesz_get()
    {
error_reporting( E_ALL );
        require_once APPPATH.'/third_party/php-google-spreadsheet-client-master/src/Google/Spreadsheet/Autoloader.php';

     require_once APPPATH.'/third_party/Zend/Loader/Autoloader.php';
    }
	function user_get()
    {
        if(!$this->get('id'))
        {
        	$this->response(NULL, 400);
        }

        // $user = $this->some_model->getSomething( $this->get('id') );
    	$users = array(
			1 => array('id' => 1, 'name' => 'Some Guy', 'email' => 'example1@example.com', 'fact' => 'Loves swimming'),
			2 => array('id' => 2, 'name' => 'Person Face', 'email' => 'example2@example.com', 'fact' => 'Has a huge face'),
			3 => array('id' => 3, 'name' => 'Scotty', 'email' => 'example3@example.com', 'fact' => 'Is a Scott!', array('hobbies' => array('fartings', 'bikes'))),
		);
		
    	$user = @$users[$this->get('id')];
    	
        if($user)
        {
            $this->response($user, 200); // 200 being the HTTP response code
        }

        else
        {
            $this->response(array('error' => 'User could not be found'), 404);
        }
    }
    
    function user_post()
    {
        //$this->some_model->updateUser( $this->get('id') );
        $message = array('id' => $this->get('id'), 'name' => $this->post('name'), 'email' => $this->post('email'), 'message' => 'ADDED!');
        
        $this->response($message, 200); // 200 being the HTTP response code
    }
    
    function user_delete()
    {
    	//$this->some_model->deletesomething( $this->get('id') );
        $message = array('id' => $this->get('id'), 'message' => 'DELETED!');
        
        $this->response($message, 200); // 200 being the HTTP response code
    }
    
    function users_get()
    {
        //$users = $this->some_model->getSomething( $this->get('limit') );
        $users = array(
			array('id' => 1, 'name' => 'Some Guy', 'email' => 'example1@example.com'),
			array('id' => 2, 'name' => 'Person Face', 'email' => 'example2@example.com'),
			3 => array('id' => 3, 'name' => 'Scotty', 'email' => 'example3@example.com', 'fact' => array('hobbies' => array('fartings', 'bikes'))),
		);
        
        if($users)
        {
            $this->response($users, 200); // 200 being the HTTP response code
        }

        else
        {
            $this->response(array('error' => 'Couldn\'t find any users!'), 404);
        }
    }


	public function send_post()
	{
		var_dump($this->request->body);
	}


	public function send_put()
	{
		var_dump($this->put('foo'));
	}
}