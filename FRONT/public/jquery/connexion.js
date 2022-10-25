$(function() {
    $("#se_connecter").click(function() {
         valid = true;
        if($("#mail").val() == "") {
           $("#mail").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });
  $(function() {
    $("#se_connecter").click(function() {
         valid = true;
        if($("#mdp").val() == "") {
           $("#mdp").css("border-color","#FF0000");
          valid = false;
        }
         return valid;
    });
  });

  // -----------------------------------------------------------------------------------//

 $(function() {
    $("#se_connecter").click(function() {
         valid = true;
    
      if ($("#mail").val() == "" ) {
          $("#mail").next(".error-message").fadeIn().text("❌ Veuillez entrer une adresse mail");
          valid = false;
      }
      
      if($("#mdp").val() == "" ) {
          $("#mdp").next(".error-message").fadeIn().text("❌ Veuillez entrer un mot de passe");
         valid = false;
      }
      return valid;
    });
  });