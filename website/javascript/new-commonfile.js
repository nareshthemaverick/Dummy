var signup = "";
var hostName = location.hostname;
var isIDC = hostName !== 'localhost';
var protocol = location.protocol+'//'
var endPoint = '/nuSource/api/v1/';
var INSTITUTIONID = INST_SETTINGS['institute_id'];
var instPortalName = INST_SETTINGS['portal_name'];
var baseDir = (hostName === "localhost") ? '/edmingle' : '';
var domainRoot = protocol+hostName+baseDir+'/';
var apiProtocol = protocol;
var googleClientId = '1072211908875-fq11f2s7flf63cmu9gld1bomfro2q5t4.apps.googleusercontent.com';

if (hostName === 'localhost' || hostName.indexOf('edupanion') !== -1 || hostName.indexOf('edmaester') !== -1 ){
  googleClientId = '403925975394-15n3dke3n5kd7v4ndjshcnbbbckg3sd8.apps.googleusercontent.com';
}

if (hostName === 'localhost'){
  apiEndHost = "localhost/edmingle";
} else if ( hostName.indexOf('edupanion') !== -1 ) {
  apiEndHost = instPortalName + '-api.edupanion.com';
} else if(hostName.indexOf('edmaester') !== -1) {
  apiEndHost = (instPortalName ? instPortalName : "edmaester")+'-api.edupanion.com';
} else if(hostName.indexOf('elasticbeanstalk') !== -1) {
  apiEndHost = hostName;
} else {
  apiProtocol = 'https://';
  apiEndHost = instPortalName + '-api.edmingle.com';
}

var apiEndpoint = apiProtocol+apiEndHost+endPoint;

var CONTACT_NUMBER;
var EMAIL_ID;
var SIGNUP_COURSE_LANDING = false;
var isLogin = 0;
var validateSignUp = "";
var actualHostName = INST_SETTINGS['host_name']; // URL on which edmingle app works for client
/* The redirection app and studentapp should based on actualHostName so that even if the client is using Sign Up SDK,
they get redirected to the right URL after login/signup from their own website*/

var custom_fields_data=[];
var otpSentCount
var timeupdate


var appLocation = isIDC ? protocol+actualHostName + '/app/' : "http://"+actualHostName+"/edmingle/app/";
var studentappLocation = isIDC ? protocol+actualHostName + '/myaccount/' : "http://"+actualHostName+"/edmingle/myaccount/";
var studentMyCoursesLocation = isIDC ? protocol+hostName + '/myaccount/' : "http://"+hostName+"/edmingle/myaccount/";
var studentMyWalletLocation = isIDC ? protocol+hostName + '/myaccount/#/wallet' : "http://"+hostName+"/edmingle/myaccount/#/wallet";
var bookingSuccess = isIDC ? protocol+hostName+'/payments/bookingsuccess.php' : "http://"+hostName+"/edmingle/payments/bookingsuccess.php";

var isContactNumberErr;
if(hostName === 'localhost'){
  studentappLocation = protocol+hostName + '/edmingle/myaccount/';
}
// else if(INST_SETTINGS['portal_name'] === 'leapup' || INST_SETTINGS['portal_name'] === 'prashant' || INST_SETTINGS['portal_name'] === 'vyoma'){
//  studentappLocation = protocol+actualHostName + '/myaccount/'
//  studentMyCoursesLocation = protocol+actualHostName + '/myaccount/'
// }
else if(INST_SETTINGS['portal_name'] === 'thediploma' || INST_SETTINGS['portal_name'] === 'edufliks' || INST_SETTINGS['portal_name'] === 'itiguru'  || INST_SETTINGS['portal_name'] === 'setwinitiguru'){
  studentappLocation = protocol+hostName;
}
// if(INST_SETTINGS['portal_name'] === 'setwinitiguru'){
//   studentMyCoursesLocation = protocol+actualHostName + '/myaccount/'
// }



if(localStorage.getItem('redirect_from')){
  appLocation = localStorage.getItem('redirect_from');
  studentappLocation = localStorage.getItem('redirect_from');
}
var countryCode = "IN";
var IS_OTP_REQ = INST_SETTINGS['enable_otp_signup'];
var user_contact_no, user_email, user_name;

var USER_INFO = {};

$(document).ready(function() {
    if(localStorage.getItem('apikey')){
		$.ajax({
			url: apiEndpoint+'user/usermeta',
			headers:{ APIKEY: localStorage.getItem('apikey')},
			cache: false
		}).done(function(json){
			localStorage.setItem('curr_org_id',json.user.org_data[0]['organization_id']);
      localStorage.setItem('role',json.user.org_data[0]['role'] === "student" ? 1 : 0);
      user_contact_no = json.user.contact_number;
      user_email = json.user.email;
      user_name = json.user.name;
      afterUserMeta(json);
		}).fail(function(err){
			var resp = JSON.parse(err.responseText);
			if(resp.code === 10002){
				localStorage.removeItem('apikey');
      }
      if(!ISSIGNUPSDK){
          userMetaFail();
      } else {
        window.parent.postMessage({
            'processLogout': 1
        }, "*");
      }
		});
    }else{
      if(!ISSIGNUPSDK){
          userMetaFail();
      } else {
        window.parent.postMessage({
            'processLogout': 1
        }, "*");
      }
    }

    //startApp();
    function  returnNextAction() {
      let next = 'dashboard'
      if(SIGNUP_COURSE_LANDING){
        next = 'SIGNUP_COURSE_LANDING';
      }else if(FREE_PREVIEW_CLICKED){
        next = 'FREE_PREVIEW_CLICKED';
      } else if(SIGNUP_BUYNOW) {
        storeCheckoutData();
        next = 'SIGNUP_BUYNOW';
      }
      return next;
    }
    $('.g-sign-in-button').click(function(){
      let edminglenextaction = returnNextAction();
      if(!ISSIGNUPSDK){
        window.location.href = apiEndpoint+'googlelogin?edminglenextaction='+edminglenextaction+'&redirect_url='+window.location.href;

      }else{
          window.parent.postMessage({
            'initGoogleSignin': 1,
            'apiEndpoint' : apiEndpoint,
            'edminglenextaction':edminglenextaction
          }, "*");
      }
    });
    if(INST_SETTINGS['enable_google_login']){
      if(typeof google_auth_code !== "undefined" && google_auth_code){
        googleAuthentication(google_auth_code)
      }
    }


    $('.f-sign-in-button').click(function(){
      let edminglenextaction = returnNextAction();
      if(!ISSIGNUPSDK){
        window.location.href = apiEndpoint+'facebooklogin?edminglenextaction='+edminglenextaction+'&redirect_url='+window.location.href;
      }else{
        window.parent.postMessage({
          'initFacebookSignin': 1,
          'apiEndpoint' : apiEndpoint,
          'edminglenextaction':edminglenextaction
        }, "*");
      }
    });
    if(INST_SETTINGS['enable_fb_login']){
      if(typeof facebook_auth_code !== "undefined" && facebook_auth_code){
        facebookAuthentication(facebook_auth_code)
      }
    }



    if(INST_SETTINGS['is_sso_enabled']){
      if(typeof jwt_payload !== "undefined" && jwt_payload){
        ssoAuthenticate();
      }
    }
    if(INST_SETTINGS['is_sso_enabled']){
      $('.signup-modal , .login-modal').on("click", function(e){

          e.preventDefault();
          // $('.signup_modal.reveal-modal .close-modal , .login-modal.reveal-modal .close-modal').trigger('click');
          window.location.href = INST_SETTINGS['sso_client_url']+'?redirect_url='+window.location.href

      });
    }
    $(document).on('click','.show_hide_button', function(){
        if($(this).siblings('input').attr('type') == 'text'){
          $(this).siblings('input').attr('type' , 'password');
          $(this).find('.fa').removeClass('fa-eye-slash').addClass('fa-eye');
          if(ISSIGNUPSDK){
            $(this).find('button').text('show');
          }

        }else if($(this).siblings('input').attr('type') == 'password'){
          $(this).siblings('input').attr('type' , 'text');
          $(this).find('.fa').removeClass('fa-eye').addClass('fa-eye-slash');
          if(ISSIGNUPSDK){
            $(this).find('button').text('hide');
          }

        }
    });




    $(".login-form").submit(function(e) {
        e.preventDefault();
        if(ISSIGNUPSDK){
          var thisForm = this;
          if(INST_SETTINGS['portal_name'] === 'vyoma'){
              checkIfPswdExist(this).done(function(json){
                if(json.is_reset){
                    login(thisForm);
                } else {
                  showPswdNotResetMsg(thisForm);
                  $('.div-overlay').css('display', 'none');
                }
              }).fail(function(err){
                $('.div-overlay').css('display', 'none');
              });
          } else {
              login(this);
          }
        } else {
          login(this);
        }
    });
    $(".pswd-form").submit(function(e) {
        e.preventDefault();
        forgot_password_otp_initialize();
        forgotPasswordOTP(this);
    });
    $("#forgot-pswd-form").submit(function(e){
        e.preventDefault();
        forgotPassword();
    });
    $('#reset-pswd-form').submit(function(e){
        e.preventDefault();
        resetPassword();
    });
    $('.reset-pswd-form').submit(function(e){
        e.preventDefault();
        resetPasswordOTP(this);
    });

    $.ajax({
      url : apiEndpoint+'public/customfields',
      type : 'GET',
      data : {
        form_type : 1,
      },
      success : function(customFieldsResponse){

        var cfield_type ='';

        var customFields = customFieldsResponse.custom_fields.sort(function(a, b) {
            return a.display_index - b.display_index
          });
          custom_fields_data = customFields;

          renderOnlineSignupFields(customFields,ISSIGNUPSDK)
      }
    });


    var renderOnlineSignupFields = function (customFields , ISSIGNUPSDK) {
      var renderFields = customFields.map((field,index)=>{
        switch(field.field_type){
            case 1:
              cfield_type = "text"
              break;
            case 2:
              cfield_type = "number"
              break;
            case 3:
              cfield_type = "select"
              break;
            case 4:
              cfield_type = "date"
              break;
            default:
              cfield_type = "text"

        }
        if(field.field_type == 3){
            return (ISSIGNUPSDK) ?
            `
            <div class="form-group">
              <label>${field.field_display_name}:</label>

                <select class="custom-select form-control" name="${field.field_name}" id="field-${field.field_id}" >
                  <option label="select"></option>
                  ${
                  JSON.parse(field.possible_values).map((option)=>{
                    return (option.status == 1) ? `<option value="${option.value}">${option.name}</option>` : ``
                  }).join('')
                  }
                </select>

                <small class="text-danger error-field" id="field-error-${field.field_id}"></small>
              </div>

            `
            :
            `
            <div class="input-with-label text-left">
              <span>${field.field_display_name}:</span>
                <div class="select-option" style="margin:0;">
                <select  class="custom-select" name="${field.field_name}" id="field-${field.field_id}" >
                  <option label="select"></option>
                  ${
                    JSON.parse(field.possible_values).map((option)=>{
                      return (option.status == 1) ? `<option value="${option.value}">${option.name}</option>` : ``
                    }).join('')
                  }
                </select>
                </div>
              <small class="text-danger error-field" id="field-error-${field.field_id}"></small>
            </div>

            `;
          }
        else{
          if(field.field_type != 5 && field.field_type != 4){
            return (ISSIGNUPSDK) ?
            `
            <div class="form-group">
              <label>${field.field_display_name}:</label>
              <input class="form-control" type="${cfield_type}" name="${field.field_name}" id="field-${field.field_id}"  placeholder="${field.field_display_name}" >
              <small class="">${field.field_help_text}</small>
              <small class="text-danger error-field" id="field-error-${field.field_id}"></small>
            </div>

            `
            :
            `

              <div class="input-with-label text-left">
                  <span>${field.field_display_name}:</span>
                  <input type="${cfield_type}" name="${field.field_name}" id="field-${field.field_id}"  placeholder="${field.field_display_name}" >
                  <small class="">${field.field_help_text}</small>
                  <small class="text-danger error-field" id="field-error-${field.field_id}"></small>
              </div>

              `;
          }
          return ``;
        }
      })

      $('.custom_fields').html(renderFields);
    }





    $(".signup-form.student").submit(function(e) {
        e.preventDefault();
        var submitBtn = $(this).find("input[type='submit']")[1];
        if(countryCode !== 'IN' && !submitBtn) {
          //paypal has to work only if checkout button is clicked and hence we need to prevent signup from here
          return;
        }
        signup(this,"1",undefined,custom_fields_data);
    });
    $(".validation-mobno").submit(function(e) {
        e.preventDefault();
        validateMobNo(this);
        if(INST_SETTINGS['enable_otp_signup']){
          signup_resend_otp_initialize()

        }    
    });
    $(".verify-cn-otp-form").submit(function(e) {
        e.preventDefault();
        verifyOTP(this);
    });
    $(".validation-email").submit(function(e) {
        e.preventDefault();
        validateEmailAdd(this);
        if(INST_SETTINGS['enable_otp_signup']){
          signup_resend_otp_initialize()

        }
    });
    $(".change-user.change-mobno a").click(function(){
      reEnterNumber();
    });
    $(".change-user.change-email a").click(function(){
      reEnterEmail();
    });
    $('.show-ref-link').click(function(e){
      e.preventDefault();
      $(this).parent().hide();
      $('.referral-code').show();
    });
    $('.fgot-pswd-link').click(function(){
      $('.login-area').hide();
      $('.fgot-pswd-area').show();
    });
    $('.fgot-pswd-login, .login-modal').click(function(){
      $('.login-area').show();
      $('.fgot-pswd-area').hide();
      $('.reset-pswd-area').hide();
      $('.pswd-reset-success').hide();
      $('.reset-pswd-form-area').show();
    });
    $(".open-login").click(function(e){
      e.preventDefault();
      // if free preview and signup course landing comes true , because we make below variable true
      // so that we can track FREE_PREVIEW_CLICKED and  SIGNUP_COURSE_LANDING after modal changes



      let freePrevCLicked = false;
      let signupCourseLanding = false;
      if(FREE_PREVIEW_CLICKED){
        freePrevCLicked = true;
      }
      if(SIGNUP_COURSE_LANDING){
        signupCourseLanding = true;
      }


      $('.signup_modal.reveal-modal .close-modal').trigger('click');
      var loginModal = $('.login-modal');

      if(loginModal.length >1){
        loginModal[0].click();
      } else {
        $('.login-modal').trigger('click');
      }
      if(CONTACT_NUMBER){
        $('.login-form #login-email').val(CONTACT_NUMBER);
      }
      // For Sign up SDK
      $('.signup-modal2').modal('hide');
      $('.login-modal2').modal({backdrop:'static'});

      if(freePrevCLicked){
        FREE_PREVIEW_CLICKED = true;
       }
       if(signupCourseLanding){
         SIGNUP_COURSE_LANDING = true;
       }

    });
    $(".open-signup").click(function(e){
      e.preventDefault();
      // if free preview and signup course landing comes true , because we make below variable true
      // so that we can track FREE_PREVIEW_CLICKED and  SIGNUP_COURSE_LANDING after modal changes
      let freePrevCLicked = false;
      let signupCourseLanding = false;
      if(FREE_PREVIEW_CLICKED){
        freePrevCLicked = true;
      }
      if(SIGNUP_COURSE_LANDING){
        signupCourseLanding = true;
      }
      $('.login_modal.reveal-modal .close-modal').trigger('click');
      if(INST_SETTINGS['enable_signup'] == 0 ){
        $('.login-modal').trigger('click');
      }else{
        $('.signup-modal').trigger('click');
      }

      // For Sign up SDK
      $('.login-modal2').modal('hide');
      $('.signup-modal2').modal({backdrop:'static'});
      if(freePrevCLicked){
        FREE_PREVIEW_CLICKED = true;
       }
       if(signupCourseLanding){
         SIGNUP_COURSE_LANDING = true;
       }
    });
    //
    // $('.signup-modal').on('click',function (e) {
    //   e.preventDefault();
    //   if(INST_SETTINGS['enable_signup'] == 0 ){
    //     $('.signup_modal.reveal-modal .close-modal').trigger('click');
    //     $('.login-modal').trigger('click');
    //   }else{
    //     $('.login_modal.reveal-modal .close-modal').trigger('click');
    //     $('.signup-modal').trigger('click');
    //   }
    // });



    $('.login-modal2 , .signup-modal2').on('hidden.bs.modal', function () {
      SIGNUP_COURSE_LANDING = false;
      FREE_PREVIEW_CLICKED = false;
    });

    if(typeof mainJsDocumentReady === "function"){
      mainJsDocumentReady();
    }
});
var openAuthModal = function () {
  if(INST_SETTINGS['enable_signup'] == 0 ){
        $('.signup_modal.reveal-modal .close-modal').trigger('click');
        var loginModal = $('.login-modal');
        if(loginModal.length >1){
          loginModal[0].click();
        } else {
          $('.login-modal').trigger('click');
        }
      }else{
        $('.login_modal.reveal-modal .close-modal').trigger('click');
        var signupModal = $('.signup-modal');
        if(signupModal.length >1){
          signupModal[0].click();
        } else {
          $('.signup-modal').trigger('click');
        }

      }
}
var validateMobNo = function(form){
  CONTACT_NUMBER = contactNumber;
	var contactNumber = $(form).find("input[name='contact-number']").val();
	var email = $(form).find("input[name='email1']").val();
	if(contactNumber === undefined || contactNumber.trim() === ''){
    $(form).find("input[name='contact-number']").addClass('field-error');
    var errField = $(form).find(".error-field.error-cn");
    errField.html('Contact Number is required!');
    errField.css('display', 'block');
  	isContactNumberErr = true;
	} else if(!validateContactNumber(contactNumber)){
      isContactNumberErr = true;
      var errField = $(form).find(".error-field.error-cn");
      errField.html('Invalid Contact Number!');
      errField.css('display', 'block');
	} else {
		isContactNumberErr = false;
    $(form).find("input[name='contact-number']").removeClass('field-error');
    $(form).find(".error-field.error-cn").css('display', 'none');
	}

	if(isContactNumberErr){
		return false;
	}
  if(IS_OTP_REQ){
      var data = {contact_number: contactNumber, institution_id:INSTITUTIONID};
      $('.div-overlay').css('display', 'inherit');
      $.post(apiEndpoint+'user/otp', {
          JSONString: JSON.stringify(data)
      }).done(function(json){
          $('.div-overlay').css('display', 'none');
          $(form).find('.form-error').css("display", "none");
          $('.validation-form').find("input[type='submit']").css('display', 'none');
          $("input[name='contact-number'").attr('disabled', true);
          $('.change-user').css('display','inherit');
          $('.signup-form.after-validation,.verify-cn-otp-form.after-validation').css('display','inherit');
          startTimer(timeupdate);

        }).fail(function(error){
          var resp = JSON.parse(error.responseText);
          $('.div-overlay').css('display', 'none');
          if(resp.code === 10011){
            //user already exist
            $(form).find('.form-error').css("display", "inherit");
          } else {
            showMessage(resp.message, false);
          }
      });
    } else {
      $.get(apiEndpoint+'student/search', {student_mobile_number: contactNumber}).done(function(json){
          $(form).find('.form-error').css("display", "none");
          var userDetails = json.user_details;
          CONTACT_NUMBER = contactNumber;
          $('.div-overlay').css('display', 'none');
          $(form).find('.form-error').css("display", "inherit");
      }).fail(function(error){
        $(form).find('.form-error').css("display", "none");
        $('.validation-form').find("input[type='submit']").css('display', 'none');
        $("input[name='contact-number']").attr('disabled', true);
        $('.change-user').css('display','inherit');
        $('.signup-form.after-validation').css('display','inherit');
      });
    }
}

var validateEmailAdd = function(form){
  var emailAdd = $(form).find("input[name='email']").val().trim();
  if(emailAdd === undefined || emailAdd === '' || !validateEmail(emailAdd)){
    isEmailErr = true;
    $(form).find("input[name='email']").addClass('field-error');
    var errField = $(form).find(".error-field.error-email");
    if(emailAdd === undefined || emailAdd === ''){
      errField.html('Email address is required!');
    } else {
      errField.html('Email address is invalid!');
    }
    errField.css('display', 'block');
  } else {
    isEmailErr = false;
    $(form).find("input[name='email']").removeClass('field-error');
    $(form).find(".error-field.error-email").css('display', 'none');
  }

  if(isEmailErr){
    return false;
  }
  if(IS_OTP_REQ){
      var data = {email: emailAdd, institution_id:INSTITUTIONID};
      $('.div-overlay').css('display', 'inherit');
      $.post(apiEndpoint+'email/signup/otp', {
          JSONString: JSON.stringify(data)
      }).done(function(json){
          $('.div-overlay').css('display', 'none');
          $(form).find('.form-error').css("display", "none");
          $('.validation-form').find("input[type='submit']").css('display', 'none');
          $("input[name='email']").attr('disabled', true);
          $('.change-user').css('display','inherit');
          $('.signup-form.after-validation,.verify-cn-otp-form.after-validation').css('display','inherit');
          startTimer(timeupdate);

        }).fail(function(error){
          var resp = JSON.parse(error.responseText);
          $('.div-overlay').css('display', 'none');
          if(resp.code === 10011){
            //user already exist
            $(form).find('.form-error').css("display", "inherit");
          } else {
            showMessage(resp.message, false);
          }
      });
    } else {
      $.get(apiEndpoint+'student/search', {student_email: emailAdd}).done(function(json){
          $(form).find('.form-error').css("display", "none");
          var userDetails = json.user_details[0];
          $('.div-overlay').css('display', 'none');
          $(form).find('.form-error').css("display", "inherit");
      }).fail(function(error){
        $(form).find('.form-error').css("display", "none");
        $('.validation-form').find("input[type='submit']").css('display', 'none');
        $("input[name='email']").attr('disabled', true);
        $('.change-user').css('display','inherit');
        $('.signup-form.after-validation').css('display','inherit');
      });
    }
}

var showMessage = function(message, isSuccess, msgEle){
    var div = isSuccess ? $('.form-success') : $('.form-error');
    div.html(message);
    div.fadeIn(1000);
    setTimeout(function() {
        div.fadeOut('slow');
    }, 3000);
};

var reEnterNumber = function(){
  var cn = $("input[name='contact-number'");
  cn.removeAttr('disabled');
  cn.val('');
  cn.focus();
  $('.validation-form').find("input[type='submit']").css('display', 'inherit');
  $('.change-user').css('display','none');
  $('.after-validation').css('display','none');
};
var reEnterEmail = function(){
  var cn = $("input[name='email'");
  cn.removeAttr('disabled');
  cn.val('');
  cn.focus();
  $('.validation-form').find("input[type='submit']").css('display', 'inherit');
  $('.change-user').css('display','none');
  $('.after-validation').css('display','none');
};

var forgotPassword = function(){
    $('#forgot-pswd-fail').css("display", "none");
    $('#forgot-pswd-success').css("display", "none");
    $('#forgot-pswd-success').css("display", "inherit");
    var email = $("#forgot-pswd-email").val().toLowerCase();
    if(email === undefined || email.trim() === '' || !validateEmail(email)){
        $('#forgot-pswd-email-group').addClass('has-error');
    }
    else {
        $('#forgot-pswd-email-group').removeClass('has-error');
        $('#forgot-pswd-fail').css("display", "none");
        $("#forgot-pswd-email").val("");
        var JSONString = JSON.stringify({ email:email});
        $.post(apiEndpoint+'user/forgotpassword', { JSONString: JSONString}).done(function(json){
            $('#forgot-pswd-success').html('A password reset link has been sent to your email.');
        }).fail(function(error){
            $('#forgot-pswd-success').css("display", "none");
            $('#forgot-pswd-fail').css("display", "inherit");
        });
    }
}
var forgotPasswordOTP = function(form){
    $(form).find('.form-error').css("display", "none");
    var cn = $(form).find('#fgot-pswd-cn').val();
    var isEmail = isNaN(cn);
    var isEdmingleHost = hostName.indexOf('edupanion')!= -1 || hostName.indexOf('edmingle')!= -1 ;

    if(!isEmail && isEdmingleHost){
        var errField = $(form).find(".error-field.error-cn");
        errField.html('Password reset using contact number is not allowed for this site. Kindly use your email address or contact admin.');
        errField.css('display', 'block');
        return false;
    }

    if(cn === undefined || cn.trim() === ''){
        isFPError = true;
        var errField = $(form).find(".error-field.error-cn");
        errField.html('Contact number or Email Address is required!');
        errField.css('display', 'block');
        return;
    } else {

      isFPError = false;
      $(form).find(".error-field.error-cn").css('display', 'none');

      if(isEmail){
        if(!validateEmail(cn)){
            isFPError = true;
            var errField = $(form).find(".error-field.error-cn");
            errField.html('Invalid Email!');
            errField.css('display', 'block');
        }
        EMAIL_ID = cn;
      } else {
        CONTACT_NUMBER = cn;
      }
    }
    if(isFPError){
        return;
    } else {
        var obj;
        if(isEmail){
          $('.otp_sent_type').text('email');
            obj = {"email": cn};
        } else {
          $('.otp_sent_type').text('contact number');
            obj = {"contact_number": cn};
        }
        var JSONString = JSON.stringify(obj);
        $('.div-overlay').css('display', 'inherit');
        $.post(apiEndpoint+(isEmail ? 'user/forgotpassword' : 'forgotpassword/otp'), { JSONString: JSONString}).done(function(json){
            $('.div-overlay').css('display', 'none');
            $('.fgot-pswd-area').hide();
            $('.reset-pswd-area').show();
            $('.fgot-pswd-area-1').hide();
            startTimer(timeupdate);
        }).fail(function(error){
            $('.div-overlay').css('display', 'none');
            showMessage(JSON.parse(error.responseText).message, false);
        });
    }
}
var resetPassword = function(e){
    var email = $("#reset-pswd-email").val();
    var token = $("#reset-pswd-token").val();
    var newPswd = $("#reset-pswd").val();
    var newPswdConfirm = $("#reset-pswd-confirm").val();
    var errorBoard = $("#reset-pswd-fail");
    var successBoard = $("#reset-pswd-success");
    var newPswdGrp = $("#reset-pswd-group");
    var confirmPswdGrp = $("#reset-pswd-confirm-group");
    var isEmailErr, isTokenErr, isPswdErr, isConfirmPswdErr;
    if(email === undefined || email.trim() === ''){
        isEmailErr = true;
    }
    else{
        isEmailErr = false;
    }
    if(token === undefined || token.trim() === ''){
        isTokenErr = true;
    }
    else {
        isTokenErr = false;
    }

    if(isEmailErr || isTokenErr){
        errorBoard.css('display', 'inherit');
        errorBoard.html('Unauthorized Request');
        return false;
    }

    if(newPswd === undefined || newPswd.trim() === ''){
        newPswdGrp.addClass('has-error');
        isConfirmPswdErr = true;
    }
    else {
        newPswdGrp.removeClass('has-error');
        isConfirmPswdErr = false;
    }
    if(newPswdConfirm === undefined || newPswdConfirm.trim() === ''){
        confirmPswdGrp.addClass('has-error');
        isConfirmPswdErr = true;
    }
    else {
        confirmPswdGrp.removeClass('has-error');
        isConfirmPswdErr = false;
    }

    if(newPswd !== newPswdConfirm){
      errorBoard.css('display', 'inherit');
      errorBoard.html('Passwords do not match!');
      return false;
    }

    if(!isPswdErr && !isConfirmPswdErr){
        var JSONString = JSON.stringify({
            email: email,
            token: token,
            password: newPswd,
            confirm_password: newPswdConfirm
        });
        $.post(apiEndpoint + 'user/resetpassword', {
            JSONString: JSONString
        }).done(function (json) {
            successBoard.html(json.message);
            successBoard.css("display", "inherit");
            errorBoard.css('display', 'none');
            $('#reset-pswd-form').css('display', "none");
            $('#show-on-success').css('display', "inherit");
            $("#reset-pswd").val("");
            $("#reset-pswd-confirm").val("");
            $('.fgot-pswd-area-1').show();
        }).fail(function (error) {
            successBoard.css("display", "none");
            $('#show-on-success').css('display', "none");
            errorBoard.css('display', 'inherit');
            errorBoard.html('Unauthorized Request');
        });
    }
}

var resetPasswordOTP = function(form){
    var newPswd = $(form).find('#reset-pswd-newp').val();
    var newPswdConfirm = $(form).find('#reset-pswd-newpcfm').val();
    var otp = $(form).find('#reset-pswd-otp').val();

    var isPswdErr, isConfirmPswdErr, isOTPErr;

    if(newPswd === undefined || newPswd.trim() === ''){
        isNewPswdErr = true;
        var errField = $(form).find(".error-field.error-newp");
        errField.html('Password is required!');
        errField.css('display', 'block');
        return;
    }else {
      isNewPswdErr = false;
      $(form).find(".error-field.error-newp").css('display', 'none');
    }
    if(newPswdConfirm === undefined || newPswdConfirm.trim() === ''){
        isConfirmPswdErr = true;
        var errField = $(form).find(".error-field.error-newpcfm");
        errField.html('Please confirm your password!');
        errField.css('display', 'block');
        return;
    }else {
        isConfirmPswdErr = false;
        $(form).find(".error-field.error-newpcfm").css('display', 'none');
    }
    if(otp === undefined || otp.trim() === ''){
        isOTPErr = true;
        var errField = $(form).find(".error-field.error-otp");
        errField.html('Please fill in the recieved OTP!');
        errField.css('display', 'block');
        return;
    }else {
        isOTPErr = false;
        $(form).find(".error-field.error-otp").css('display', 'none');
    }

    if(!isPswdErr && !isConfirmPswdErr){
        var obj = {
            password: newPswd,
            otp: otp,
            confirm_password: newPswdConfirm
        };
        if(EMAIL_ID){
          obj.email = EMAIL_ID;
        } else {
          obj.contact_number = CONTACT_NUMBER;
        }
        var JSONString = JSON.stringify(obj);
        $('.div-overlay').css('display', 'inherit');
        $.post(apiEndpoint + 'resetpassword/otp', {
            JSONString: JSONString
        }).done(function (json) {
            $('.pswd-reset-success').show();
            $('.div-overlay').css('display', 'none');
            $('.reset-pswd-form-area').hide();
            $('.fgot-pswd-area-1').show();
            $('#fgot-pswd-cn').val("");
        }).fail(function (error) {
            $('.div-overlay').css('display', 'none');
            showMessage(JSON.parse(error.responseText).message, false);
        });
    }
}
var validateEmail = function(email){
    var re = /^[_a-zA-Z0-9-+]+(\.[_a-zA-Z0-9-+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/g;
    return re.test(email);
}
var validateContactNumber = function(data){
  var pattern = /^[+\s0-9]+$/;
  return pattern.test(data);
};
function gotoApplication(){
    var location = localStorage.getItem('role') == 1 || localStorage.getItem('role') == 'student' ? studentappLocation : appLocation;
	  window.location = location;
}

var validateLoginData = function(form){
  var email = $(form).find("#login-email").val().toLowerCase();
  var password = $(form).find("#login-pswd").val();
  //var persistent_login = $(form).find("#persistent_login").find('input').prop('checked');

  var persistent_login = true;
  var isEmailErr,isPswdErr;
  if(email === undefined || email.trim() === ''){
    isEmailErr = true;
    $(form).find("#credsError").css("display", "none");
    $(form).find("#login-email").addClass('field-error is-invalid');
  } else {
    isEmailErr = false;
    $(form).find("#login-email").removeClass('field-error is-invalid');
  }
  if(password === undefined || password.trim() === ''){
      isPswdErr = true;
      $(form).find('#credsError').css("display", "none");
      $(form).find('#login-pswd').addClass('field-error is-invalid');
  } else {
      isPswdErr = false;
      $(form).find('#login-pswd').removeClass('field-error is-invalid');
  }
  if(!isEmailErr && !isPswdErr){
    return { username:email, password:password, persistent_login: persistent_login };
  } else {
    return false;
  }
};
var login = function(form){
    var jsonData = validateLoginData(form);
    if(jsonData){
        $('.div-overlay').css('display', 'inherit');
        var JSONString = JSON.stringify(jsonData);
        $.post(apiEndpoint+'tutor/login', { JSONString:JSONString }).done(function(json){
            $(form).find('#credsError').css("display", "none");
            afterSuccesfulLogin(json);

        }).fail(function(error){
            $(form).find('#credsError').css("display", "inherit");
            $(form).find('#credsError').html(JSON.parse(error.responseText).message);
            $(form).find("#login-pswd").val("");
            $('.div-overlay').css('display', 'none');
        });
    }
    else {
        return false;
    }
}
var ssoAuthenticate =  function(){
  if(typeof jwt_payload !== "undefined" && jwt_payload){
    $.ajax({
      url: apiEndpoint+'sso',
      type : 'GET',
      data : {
          jwt : jwt_payload,
      },
      success : function(Response){
        let is_course_page = false;
        if (/courses/.test(window.location.href)){
          is_course_page = true;
        }

        afterSuccesfulLogin(Response , is_course_page );


      },
      error: function (request, status, error) {

      alert(JSON.parse(request.responseText).message);
      window.location.href = window.location.href.replace(window.location.search,'');
      }

    });
  }
}



var googleUser = {};
  var startApp = function() {
    if(typeof(gapi) === 'object'){
      gapi.load('auth2', function(){

        auth2 = gapi.auth2.init({
          client_id: googleClientId,
          cookiepolicy: 'single_host_origin',
          scope : 'profile email',

        });
        attachSignin(document.querySelectorAll('.customBtn'));
      });
    }
  };

  function attachSignin(elements) {

    elements.forEach((element) => {
      auth2.attachClickHandler(element, {},
        function(googleUser,accessCode,bundleid) {
            var profile = googleUser.getBasicProfile();
            var id_token = googleUser.getAuthResponse().id_token;
            var data = { id_token:id_token, class_code:accessCode, bundle_id:Number(bundleid) };
            var JSONString = JSON.stringify(data);
            if(localStorage.getItem('apikey') === null || localStorage.getItem('apikey') == ''){
              serverCallForSocial(JSONString);
            }
        }, function(error) {
          console.log(JSON.stringify(error, undefined, 2));
        });
    })

  }

var googleAuthentication = function(google_auth_code){
  if(typeof google_auth_code !== "undefined" && google_auth_code){
    var data = { code:google_auth_code};
    var JSONString = JSON.stringify(data);
    serverCallForSocial(JSONString);
  }
}

var facebookAuthentication = function(facebook_auth_code){
  if(typeof facebook_auth_code !== "undefined" && facebook_auth_code){
    var data = { facebook_code:facebook_auth_code};
    var JSONString = JSON.stringify(data);
    serverCallForSocial(JSONString);
  }
}
var setcourseEnrollment=  function (edminglenextaction) {
  if(edminglenextaction){
    if(edminglenextaction == 'FREE_PREVIEW_CLICKED'){
      FREE_PREVIEW_CLICKED = true;
    }else if(edminglenextaction == 'SIGNUP_COURSE_LANDING'){
      SIGNUP_COURSE_LANDING = true;
    }else if(edminglenextaction == 'SIGNUP_BUYNOW'){
      SIGNUP_BUYNOW = true;
    }
  }
}
var serverCallForSocial = function(JSONString){
$('.div-overlay').css('display', 'inherit');
$('body').addClass('blur');
$.post(apiEndpoint+'socialsignin', { JSONString:JSONString }).done(function(json){
  if(!ISSIGNUPSDK){
    let URLObj = new URL(window.location.href);
    let edminglenextaction = URLObj.searchParams.get('edminglenextaction');
    setcourseEnrollment(edminglenextaction);
  }

  // let is_course_page = false;
  // if(!ISSIGNUPSDK){
  //   if (/courses/.test(window.location.href)){
  //     is_course_page = true;
  //   }
  // }
  afterSuccesfulLogin(json);

}).fail(function(error){
  let message = JSON.parse(error.responseText).message;
  if(!ISSIGNUPSDK){
    launchInfoModal(message ,  false, '<i class="fa fa-exclamation-circle text-warning"></i>', 'OK',function(){
      window.location.href = window.location.href.replace(window.location.search,'');
    });
  }else{
    launchInfoModal(message ,  false, '<i class="fa fa-exclamation-circle text-warning"></i>', 'OK',function(){
      window.parent.postMessage({
        'removeoAuthCode': 1,
      }, "*");
    })
  }

});
}
var updateCheckoutData =  function (_cb) {

  let local = JSON.parse(localStorage.getItem('checkoutData'));

  if(local) {
    if(local.pc) {
      $("#promo-code-text").val(local.pc);
      $(".promo-code-form").trigger('submit');
    }
    if(local.inst) {
      $('#installments').val(local.inst);

    }
  }

  loadPaymentSplits().done(() => {
    localStorage.removeItem('checkoutData');
    _cb();
  });



}
var storeCheckoutData = function () {
  var pc = $("#promo-code-text").val();
  var inst = $('#installments').val();

  localStorage.setItem('checkoutData',JSON.stringify({
    pc,inst
  }));
}
var afterSuccesfulLogin = function (json , is_course_page = false) {
  var jsonObj = json;
  localStorage.setItem('apikey', jsonObj.user.apikey);
  localStorage.setItem('username',jsonObj.user.username);
  localStorage.setItem('name',jsonObj.user.name);
  localStorage.setItem('role',jsonObj.user.role);
  let isSingleBundle = false;
  if(BUNDLE){
    isSingleBundle = true;
  }
  if(ISSIGNUPSDK){
      isLogin = 1;
      window.parent.postMessage({
          'usermeta': jsonObj,
          'isLogin': 1,
          'message': 'UserMeta Data'
      }, "*");
      if(FREE_PREVIEW_CLICKED){
        FREE_PREVIEW_SIGNUP_DONE = true;

        freePreviewSignuFromLanding(isSingleBundle);
      }
      else if(SIGNUP_COURSE_LANDING){
        handleSignUpFromLanding()
      } else {
        var redUrl = localStorage.getItem('role') == 1 ? studentappLocation : appLocation;
        //if(redUrl[redUrl.length-1] === "/"){redUrl = redUrl.substring(0, redUrl.length - 1)}
        redUrl = redUrl+'?edauthtoken='+jsonObj.user.apikey;
        jsonObj.redirectUrl = redUrl;
        window.parent.postMessage({
            'redirectUrl': redUrl
        }, "*");
      }
  } else if(FREE_PREVIEW_CLICKED){
    FREE_PREVIEW_SIGNUP_DONE = true;
    // $('.enrollFree_'+selected_bundle_id).trigger('click');
    freePreviewSignuFromLanding(isSingleBundle);
  } else if(SIGNUP_COURSE_LANDING){
    updateJoinLinks("student");
    handleSignUpFromLanding();
  } else if(SIGNUP_BUYNOW){
    updateJoinLinks("student");
    updateCheckoutData(() => {
      $('.join_'+BUNDLE.institution_bundle_id).trigger('click');
    });
    // joinPkgExistingStud(BUNDLE.bundle_id, BUNDLE.academic_year, BUNDLE.organization_id);
    // $('.join_'+BUNDLE.institution_bundle_id).trigger('click');

  } else{
      if(location.href.indexOf('course-program') !== -1 || location.href.indexOf('firc-registration') !== -1){
          location.reload();
      } else {
        if(!is_course_page){
          gotoApplication();
        }
        else{
          window.location.href = window.location.href.replace(window.location.search,'');
        }

      }
  }
}

signup = function(form, role, validatedJson , custom_fields_array){
    role = 1;
    var JSONString = validatedJson ? validatedJson : validateSignUp(form, role ,custom_fields_array);
    //  console.log('inside_signup',JSONString);
    if(JSONString){
        var signupUrl = IS_OTP_REQ ? 'student/signup' : 'user/signup';
        return $.post(apiEndpoint+signupUrl, { JSONString:JSONString }).done(function(json){
            $(form).find('.form-error').css("display", "none");
            afterSuccesfulLogin(json);
        }).fail(function(error){
            $('.div-overlay').css('display', 'none');
            showMessage(JSON.parse(error.responseText).message, false);
            $(form).find("input[name='password']").val("");
        });

    } else {
      return {
        done: function(){},
        fail: function(){}
      }
    }
};

validateSignUp = function(form, role ,custom_fields_array){
    var name = $(form).find("input[name='name']").val();
    var otp = $(form).find("input[name='otp']").val();
    var emailEle = $(form).find("input[name='email']").length ? $(form).find("input[name='email']") : $(form).prev().find("input[name='email']");
    var email = emailEle.val().toLowerCase().trim();

    var cnEle = $(form).find("input[name='contact-number']").length ? $(form).find("input[name='contact-number']") : $(form).prev().find("input[name='contact-number']");
    var contactNumber = cnEle.val();
    var state = $(form).find("select[name='state']").val();
    var password = $(form).find("input[name='password']").val();
    var orgId = $(form).find("input[name='organization_id']").val();
    var referralCode = $(form).find("input[name='referral_code']").val();
    var isStateErr, isEmailErr, isContactNumberErr, isNameErr, isPswdErr, isCFErr = false;

    if(IS_OTP_REQ && (otp === undefined || otp.trim() === '')){
        var isOTPErr = true;
        $(form).find("input[name='otp']").addClass('field-error');
        var errField = $(form).find(".error-field.error-otp");
        errField.html('OTP is required!');
        errField.css('display', 'block');
		      return;
	  } else {
        var isOTPErr = false;
        $(form).find("input[name='otp']").removeClass('field-error');
        $(form).find(".error-field.error-otp").css('display', 'none');
    }

    var isEmailEmpty = email === undefined || email.trim() === '';
    var isEgyptClient = instPortalName == 'fatahelmasr';

    if(!isEgyptClient && (isEmailEmpty || !validateEmail(email)) || (isEgyptClient && !isEmailEmpty && !validateEmail(email))) {
        var isEmailErr = true;
        $(form).find("input[name='email']").addClass('field-error');
        var errField = $(form).find(".error-field.error-email");
        if(email === undefined || email.trim() === ''){
        errField.html('Email address is required!');
        } else {
        errField.html('Email address is invalid!');
        }
        errField.css('display', 'block');
        return;
  	} else {
          var isEmailErr = false;
          $(form).find("input[name='email']").removeClass('field-error');
          $(form).find(".error-field.error-email").css('display', 'none');
    }
    if(name === undefined || name.trim() === ''){
        var isNameErr = true;
        $(form).find("input[name='name']").addClass('field-error');
        var errField = $(form).find(".error-field.error-name");
        errField.html('Name is required!');
        errField.css('display', 'block');
        return;
	   } else {
        var isNameErr = false;
        $(form).find("input[name='name']").removeClass('field-error');
        $(form).find(".error-field.error-name").css('display', 'none');
    }
    if(password === undefined || password.trim() === ''){
        var isPswdErr = true;
        $(form).find("input[name='password']").addClass('field-error');
        var errField = $(form).find(".error-field.error-pswd");
        errField.html('Password is required!');
        errField.css('display', 'block');
        return;
	  } else {
        var isPswdErr = false;
        $(form).find("input[name='password']").removeClass('field-error');
        $(form).find(".error-field.error-pswd").css('display', 'none');
    }
    var customFieldsError = false
      custom_fields_array.forEach(field => {
        if(field.field_type != 5 && field.field_type != 4){
          if(field.is_online_mandatory == 1){
            let field_val = $(form).find(`#field-${field.field_id}`).val();
            if(field_val === undefined || field_val.trim() === ''){
              customFieldsError = true;
              $(form).find(`#field-${field.field_id}`).addClass('field-error');
              var errField = $(form).find(`.error-field#field-error-${field.field_id}`);
              errField.html(`${field.field_display_name} is required!`);
              errField.css('display', 'block');
            }
            else{
              $(form).find(`#field-${field.field_id}`).removeClass('field-error');
              $(form).find(`.error-field#field-error-${field.field_id}`).css('display', 'none');
            }

          }
        }
      })






    if(isCFErr || isStateErr || isEmailErr || isPswdErr || isNameErr || isOTPErr || isContactNumberErr || customFieldsError){
        return false;
    }

    $('.div-overlay').css('display', 'inherit');


    let custom_fields_with_val = custom_fields_array.map(field => {
      let field_val = $(form).find(`#field-${field.field_id}`).val();
      if(field_val){
        return {...field , field_value : field_val}
      }
      return;
    })
    custom_fields_with_val = custom_fields_with_val.filter(field => {
      return field != null;
    });

    return JSON.stringify({
      contact_number: contactNumber,
      role:role,
      name:name,
      email:email,
      password: password,
      country_code:countryCode,
      organization_id: orgId,
      institute_id:INSTITUTIONID,
      otp: otp,
      email_only_otp: (IS_OTP_REQ && INST_SETTINGS['signup_primary_field'] === 2) ? 1 : undefined,
      referral_code: referralCode,
      state: state === -1 ? undefined : Number(state),
      timezone_offset: new Date().getTimezoneOffset(),
      custom_fields :  custom_fields_with_val
     });
  }
/*Resend otp code*/
var otpRemainingTimedisplay ,  timerotp;
var forgot_password_otp_initialize =  function () {
  otpRemainingTimedisplay = document.querySelectorAll('.otp_time');
  otpRemainingTimedisplay = otpRemainingTimedisplay[otpRemainingTimedisplay.length - 1]
  otpSentCount = 1;
  timeupdate = 60 * 1;
 $('.resend_otp:last').prop('disabled',true).removeClass('not-allowed')
 $('.otp_time_container:last').addClass('make_visible');
 otpRemainingTimedisplay.textContent = '1:00'
 clearInterval(timerotp);
}

var signup_resend_otp_initialize =  function () {
  otpRemainingTimedisplay = document.querySelectorAll('.otp_time_signup');
  otpRemainingTimedisplay = otpRemainingTimedisplay[otpRemainingTimedisplay.length - 1]
  otpSentCount = 1;
  timeupdate = 60 * 1;
  $('.signup_resend_otp:last').prop('disabled',true).removeClass('not-allowed')
  $('.signup_otp_time_container:last').addClass('make_visible');
  otpRemainingTimedisplay.textContent = '1:00'
  clearInterval(timerotp);
}


$(document).on('click','.resend_otp',function(e){
  $('.resend_otp').prop('disabled',true);
  e.preventDefault();
  if(otpSentCount == 2){
    $('.resend_otp').prop('disabled',true).addClass('not-allowed');
    $('.otp_time_container:last').removeClass('make_visible');
    resendOtp()
  }
  else{
    resendOtp()
  }
});

$(document).on('click','.signup_resend_otp',function(e){
  $(this).prop('disabled',true);
  e.preventDefault();
  if(otpSentCount == 2){
    $(this).prop('disabled',true).addClass('not-allowed');
    $('.signup_otp_time_container:last').removeClass('make_visible');
    signupResendOtp()
  }
  else{
    signupResendOtp()
  }
});

var startTimer =  function (duration) {

    var timer = duration, minutes, seconds;
     timerotp =  setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        otpRemainingTimedisplay.textContent  = minutes + ":" + seconds;

        if (--timer < 0) {

            clearInterval(timerotp);
            $('.resend_otp').prop('disabled',false);
            $('.signup_resend_otp').prop('disabled',false);
        }
    }, 1000);
}

const resendOtp = function(){
  let cn = $('.pswd-form #fgot-pswd-cn:last').val()
  var isEmail = isNaN(cn);
  if(isEmail){
    obj = {"email": cn};
  } else {
      obj = {"contact_number": cn};
  }
  var JSONString = JSON.stringify(obj);
  $.ajax({
    url : apiEndpoint+(isEmail ? 'user/forgotpassword' : 'forgotpassword/otp'),
    type : 'POST',
    data : { JSONString: JSONString},
    success : function(Response){
      let div = $('.otp_message_show')
      if(Response.message == 'Success'){

        div.html(`<p class="alert alert-success">OTP sent succesfully</p>`);
        div.fadeIn(1000);
        setTimeout(function() {
            div.fadeOut('slow');
        }, 3000);
        if(otpSentCount <= 1){
          startTimer(timeupdate);
        $('.resend_otp').prop('disabled',true)
        }

        otpSentCount+=1;

      }
      else{
        div.html(`<p class="alert alert-danger">Some error occured , retry!!</p>`);
        div.fadeIn(1000);
        setTimeout(function() {
            div.fadeOut('slow');
        }, 3000);
      }

    }
  })
}
const signupResendOtp = function(){
  let cn = $('.signup_field:last').val()
  var isEmail = isNaN(cn);
  if(isEmail){
    obj = {email: cn, institution_id:INSTITUTIONID}
  } else {
      obj = {contact_number: cn, institution_id:INSTITUTIONID};;
  }
  var JSONString = JSON.stringify(obj);
  $.ajax({
    url : apiEndpoint+(isEmail ? 'email/signup/otp' : 'user/otp'),
    type : 'POST',
    data : { JSONString: JSONString},
    success : function(Response){
      let div = $('.otp_message_show')
      if(Response.message == 'Success'){

        div.html(`<p class="alert alert-success">OTP sent succesfully</p>`);
        div.fadeIn(1000);
        setTimeout(function() {
            div.fadeOut('slow');
        }, 3000);
        if(otpSentCount <= 1){
          startTimer(timeupdate);
        $('.signup_resend_otp').prop('disabled',true)
        }

        otpSentCount+=1;

      }
      else{
        div.html(`<p class="alert alert-danger">Some error occured , retry!!</p>`);
        div.fadeIn(1000);
        setTimeout(function() {
            div.fadeOut('slow');
        }, 3000);
      }

    }
  })
}
