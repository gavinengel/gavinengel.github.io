<?php defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';
session_start();

date_default_timezone_set('America/New_York');

class V0 extends REST_Controller
{

    // Google Spreadsheet ID (You can get it from the URL when you view the spreadsheet)
    var $GSheetID = "";

    function logout_get()
    {
      $_SESSION = array();

      // If it's desired to kill the session, also delete the session cookie.
      // Note: This will destroy the session, and not just the session data!
      if (ini_get("session.use_cookies")) {
          $params = session_get_cookie_params();
          setcookie(session_name(), '', time() - 42000,
              $params["path"], $params["domain"],
              $params["secure"], $params["httponly"]
          );
      }

      // Finally, destroy the session.
      session_destroy();

      $this->__rpcResponse();
    }

    function loggedin_get() 
    {
        $error = (@$_SESSION['logged_in'])? '' : 'not logged in';

        $this->__rpcResponse($error);
    }

    function signin_get()
    {
        $this->__signin();
    }

    function signin_post()
    {
        $this->__signin();
    }

    function __signin()
    {
        $error  = 'Please enter valid email and password.  You submitted: '.@$_REQUEST['username'];

        //TODO dont use eregi, its deprecated
        if (@$_REQUEST['username'] && @$_REQUEST['clienthashedpassword']) {
            
            // sanitize inputs
            $tmp = strtolower($_REQUEST['username']);
            $tmp = filter_var($tmp, FILTER_SANITIZE_EMAIL);
            $username  = $tmp;
            
            $clienthashedpassword = trim($_REQUEST['clienthashedpassword']);

            // check whether the username is a valid email address
            if (filter_var($username, FILTER_VALIDATE_EMAIL)) {

                // check login ...
                $user = $this->__getUserByEmail($username);

                if ($user) {

                  // correct password?
                  if (hash('sha512', $user['salt'].$clienthashedpassword) == $user['passwordhash']) {
                    $error  = '';        

                  }
                  else {
                    $error  = 'Invalid password.';
                  }
                }
                else {

                  // add new user
                  $this->__prepGdata();
                  $newsalt = md5(uniqid());
                  $user = array(
                      'uuid' => $this->__getGUID(),
                      'email' => $username,
                      'salt' => $newsalt,
                      'passwordhash' => hash('sha512', $newsalt.$clienthashedpassword),
                      'created' => date('Y-m-d H:i:s'),

                  );
                  $insertedListEntry = $this->spreadsheetService->insertRow($user,
                                                                      $this->GSheetID,
                                                                      $this->__getWorksheetGid(1));
                  $error  = '';        
                }
            }
            else {
                $error  = 'Please enter valid email address.  You submitted: '.$username;
            }
            


        }

        if (!$error) {
            $_SESSION['logged_in'] = $user;
        }
        
        $this->__rpcResponse($error);

    }
    

    function __expenses()
    {

      ///
      $this->__prepGdata();

      $query = new Zend_Gdata_Spreadsheets_CellQuery();
      $query->setSpreadsheetKey($this->GSheetID);
      $query->setWorksheetId($this->__getWorksheetGid(2));
      $cellFeed = $this->spreadsheetService->getCellFeed($query);
      // edit the amount to 123.45 for uuid ED598F21-DDFD-7871-3357-2E07FC3C46A1
      //$uuidsearch = 'ED598F21-DDFD-7871-3357-2E07FC3C46A1';
      //$rowofuuid = 0;
      $displaycols = array('amount', 'date', 'time', 'description', 'comment', 'tags', 'user');
      $headers = array();
      $normalized = array();
      foreach($cellFeed as $cellEntry) {
        $row = $cellEntry->cell->getRow();
        $col = $cellEntry->cell->getColumn();
        $val = $cellEntry->cell->getText();
        if ($row == 1) {
          $headers[$col] = $val;
        }
        else {
          // only add the 6 items to normalized
          if (array_search($headers[$col], $displaycols)!==false) {

              $normalized[$row][$headers[$col]] = $val; 
          }
          
        }
        
      }

      // loop through normalized data; use 6 different array inserts into aaDatarow
      $aaData = array();
      foreach ($normalized as $normalizedrow) {
        $aaDatarow = array();
        // only for logged in user
        if (@$_SESSION['logged_in']['uuid'] == $normalizedrow['user']) {
          foreach ($displaycols as $displaycol) {
            if ($displaycol=='user') continue; // TODO make this better
            $append = @$normalizedrow[$displaycol];
            if ($displaycol=='amount') $append = '$'.$append;
            $aaDatarow[] = $append;
          }

          $aaData[]  = $aaDatarow;
        }
        
      }

      // build aadata json
      $aaDatajson = json_encode($aaData);

      ///
      $json = @$_REQUEST['callback'].'({
        "sEcho": 1,
        "iTotalRecords": "'.count($aaData).'",
        "iTotalDisplayRecords": "'.count($aaData).'",
        "aaData": '.$aaDatajson.'
      });';
        echo $json;exit;
    }

    function expenses_get()
    {
        $this->__expenses();
    }

    function expenses_post()
    {
        $this->__expenses();
    }

    function __addexpense()
    {
        $error = 'Please complete all required fields.';

        if (@$_REQUEST['amount'] && @$_REQUEST['date']) {

            $errors = array();

            if (!preg_match("/^[0-9.]+$/", $_REQUEST['amount'])) $errors[]  = 'Amount is not valid.';
            if ( 
              $_REQUEST['date'] != date('m/d/Y', strtotime($_REQUEST['date'])) || 
              strlen($_REQUEST['date'])!=10
            ) { $errors[]  = 'Date is not valid.'; }


            if ($errors)
            {
               $error = implode(' ', $errors);
            }
            else {
                $this->__prepGdata();

                $rowData = array(
                    'uuid' => $this->__getGUID(),
                    'user' => $_SESSION['logged_in']['uuid'],
                    'date' => $_REQUEST['date'],
                    'time' => @$_REQUEST['time'],
                    'description' => @htmlentities($_REQUEST['description']),
                    'amount' => $_REQUEST['amount'],
                    'comment' => @htmlentities($_REQUEST['comment']),
                    'tags'  =>  @htmlentities($_REQUEST['tags']),
                    'created' => date('Y-m-d H:i:s'),

                );
                $insertedListEntry = $this->spreadsheetService->insertRow($rowData,
                                                                    $this->GSheetID,
                                                                    $this->__getWorksheetGid(2));
                $error = '';
            }
        }

        $this->__rpcResponse($error);


    }

    function addexpense_get()
    {
        $this->__addexpense();
    }

    function addexpense_post()
    {
        $this->__addexpense();
    }

  // thanks: http://guid.us/GUID/PHP
  private function __getGUID(){
      if (function_exists('com_create_guid')){
          return com_create_guid();
      }else{
          mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
          $charid = strtoupper(md5(uniqid(rand(), true)));
          $hyphen = chr(45);// "-"
          $uuid = ''//chr(123)// "{"
              .substr($charid, 0, 8).$hyphen
              .substr($charid, 8, 4).$hyphen
              .substr($charid,12, 4).$hyphen
              .substr($charid,16, 4).$hyphen
              .substr($charid,20,12)
              //.chr(125)
              ;// "}"
          return $uuid;
      }
  }

  // thanks: http://stackoverflow.com/questions/11290337/how-to-convert-google-spreadsheets-worksheet-string-id-to-integer-index-gid
  private function __getWorksheetGid($int = 0) {
      $worksheetID = '';

      if (1 <= $int && $int <= 10) {
          $gids = array(
              1 => 'od6', 
              2 => 'od7', 
              3 => 'od4', 
              4 => 'od5', 
              5 => 'oda', 
              6 => 'odb', 
              7 => 'od8', 
              8 => 'od9', 
              9 => 'ocy', 
              10 => 'ocz', 
          );

          $worksheetID = $gids[$int];
      }

      return $worksheetID;
  }

  private function __getUserByEmail($email='') {
    $existinguser = array();

    if ($email) {

      $this->__prepGdata();

      $query = new Zend_Gdata_Spreadsheets_ListQuery();
      $query->setSpreadsheetKey($this->GSheetID);
      $query->setWorksheetId($this->__getWorksheetGid(1));
      $rowFeed = $this->spreadsheetService->getListFeed($query);


      foreach($rowFeed->entries as $rowEntry) {

        $customEntry = $rowEntry->getCustomByName('email');
        if ($customEntry->getText() == $email) {
          // add this row to $existinguser

          foreach($rowEntry->getCustom() as $customEntry) {
            $existinguser[$customEntry->getColumnName()] = $customEntry->getText();
          }

        }
      }

    }

    return $existinguser;
  }
  private function __prepGdata() {

      error_log('session '.print_r(@$_SESSION, true));

      if (!@$this->spreadsheetService) {
          $addpath = FCPATH.APPPATH.'third_party';
          set_include_path(get_include_path() . PATH_SEPARATOR . $addpath);

          // Gmail email address and password for google spreadsheet
          if (@$_ENV["OPENSHIFT_DATA_DIR"])
          {
              require($_ENV["OPENSHIFT_DATA_DIR"].'gdata.php');
              $gdata = $config['gdata'];
          }
          else
          {
              $this->config->load('gdata');
              $gdata = $this->config->item('gdata');
          } 
          
          if ($gdata['user'] && $gdata['pass'] && $gdata['sheet_id']) {
            $this->GSheetID = $gdata['sheet_id'];

            // Include the loader and Google API classes for spreadsheets
            require_once APPPATH.'third_party/Zend/Loader.php';
            Zend_Loader::loadClass( 'Zend_Gdata' );
            Zend_Loader::loadClass( 'Zend_Gdata_ClientLogin' );
            Zend_Loader::loadClass( 'Zend_Gdata_Spreadsheets' );
            Zend_Loader::loadClass( 'Zend_Http_Client' );

            // Authenticate on Google Docs and create a Zend_Gdata_Spreadsheets object.
            $service = Zend_Gdata_Spreadsheets::AUTH_SERVICE_NAME;
            $client = Zend_Gdata_ClientLogin::getHttpClient( $gdata['user'], $gdata['pass'], $service );
            $this->spreadsheetService = new Zend_Gdata_Spreadsheets( $client );
          }
          else {

            $this->__rpcResponse('Missing Google Spreadsheet credentials in application/config/gdata.php');
          }
      }

  }

  private function __rpcResponse($error='') {

        $result = ($error)? 'fail' : 'success';

        $message = array(
            'jsonrpc'   => '2.0',
            'result' => $result,
            'error' => $error,
            'id'    => 0,
        );

        $this->response($message, 200); // 200 being the HTTP response code
        exit;

  }

  /////
}