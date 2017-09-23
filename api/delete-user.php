<?php
session_start();

// get currently logged in user's id
$sUser = $_SESSION['sUser'];
$jUser = json_decode($sUser);


if (isset($_POST['sUserId'])) {
 /*  echo '{"message": "Delete with the user id that were sent"}'; */
  $sCurrentUserId = $_POST['sUserId'];
} else {
 /*  echo '{"message": "User deleted"}'; */
  $sCurrentUserId = $jUser->id;
}



// get all users
$sUsers = file_get_contents('../data/users.txt');
$aUsers = json_decode($sUsers);

for ($i = 0; $i < count($aUsers); $i++) {
  if ($aUsers[$i]->id == $sCurrentUserId) {
    array_splice($aUsers, $i, 1);
    $sUsers = json_encode($aUsers);
    file_put_contents('../data/users.txt', $sUsers);
    echo '{"message": "User deleted"}';

    // If the deleted user is the one logged in (if the delete
    // were called from the edit-profile-page)
    if ($jUser->id == $sCurrentUserId){
      session_destroy();
    }

    exit();
  }
}

?>