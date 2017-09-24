<?php 
session_start();

// Get the image
$sFileExtension = pathinfo($_FILES['fileProfilePicture']['name'], PATHINFO_EXTENSION);
$sFolder = '../images/profile-pictures/';
$sFileName = uniqid().'.'.$sFileExtension;
$sSaveFileTo = $sFolder.$sFileName;
move_uploaded_file( $_FILES['fileProfilePicture']['tmp_name'], $sSaveFileTo);

$sUsers = file_get_contents('../data/users.txt');
$aUsers = json_decode($sUsers);

$jNewUser = json_decode("{}");
$jNewUser->id = uniqid();
$jNewUser->role = $_POST['txtUserRole'];
$jNewUser->firstName = $_POST['txtFirstName'];
$jNewUser->lastName = $_POST['txtLastName'];
$jNewUser->password = $_POST['txtPassword']; // Are we suppose to encrypt this?
$jNewUser->email = $_POST['txtEmail'];
$jNewUser->phone = $_POST['txtPhone'];
$jNewUser->profilePicture = $sFileName; 
// ^^^ The api doesn't tell the client where the 
// immage is since the api cant possible know 
// where the image will be requested from.
// Therefor only the name is saved, and the
// client have to specify where the imagefolder is

array_push($aUsers, $jNewUser);
$sUsers = json_encode($aUsers);
file_put_contents('../data/users.txt', $sUsers);

// Maybe do a check and only echo succes
// if user is actually added 
$sNewUser = json_encode($jNewUser);
$_SESSION['sUser'] = $sNewUser;
echo '{
  "message":"succes",
  "user":'.$sNewUser.'
}';
?>