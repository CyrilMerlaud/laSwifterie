$(function() {
    $("#edit_profil").click(function() {
         valid = true;
        if($("#username").val() == "") {
           $("#username").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });
  


// -----------------------------------------------------------------------------------//

 $(function() {
    $("#edit_profil").click(function() {
         valid = true;
    
      if ($("#username").val() == "" ) {
          $("#username").next(".error-message").fadeIn().text("❌ Vous n'avez pas modifié votre Pseudo");
          valid = false;
      }
    });
  });
