$(function() {
    $("#s_inscrire").click(function() {
         valid = true;
        if($("#username").val() == "") {
           $("#username").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });

  $(function() {
    $("#s_inscrire").click(function() {
         valid = true;
        if($("#email").val() == "") {
           $("#email").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });

  $(function() {
    $("#s_inscrire").click(function() {
         valid = true;
        if($("#password").val() == "") {
           $("#password").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });

  // -----------------------------------------------------------------------------------//

 $(function() {
    $("#s_inscrire").click(function() {
         valid = true;
    
      if ($("#username").val() == "" ) {
          $("#username").next(".error-message").fadeIn().text("❌ Veuillez entrer un nom d'utilisateur");
          valid = false;
      }
      
      if($("#email").val() == "" ) {
          $("#email").next(".error-message").fadeIn().text("❌ Veuillez entrer un mail");
         valid = false;
      }

      if ($("#password").val() == "" ) {
        $("#password").next(".error-message").fadeIn().text("❌ Veuillez entrer un mot de passe");
        valid = false;
      }
      return valid;
  });
});