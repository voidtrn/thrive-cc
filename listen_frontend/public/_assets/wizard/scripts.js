
function scroll_to_class(element_class, removed_height) {
    var scroll_to = $(element_class).offset().top - removed_height;
    if($(window).scrollTop() != scroll_to) {
        $('html, body').stop().animate({scrollTop: scroll_to}, 500);
    }
}

function bar_progress(progress_line_object, direction) {
    var number_of_steps = progress_line_object.data('number-of-steps');
    var now_value = progress_line_object.data('now-value');
    var new_value = 0;
    if(direction == 'right') {
        new_value = now_value + ( 100 / number_of_steps );
    }
    else if(direction == 'left') {
        new_value = now_value - ( 100 / number_of_steps );
    }
    progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
}




//step 1 = idea
//step 2 = category
//step 3 = preview -- gak akan pernah tercapai karena setelah 3 adalah submit button
var stepCount;

var inputStringStep1;
var inputStringStep2;
var inputStringStep3;

jQuery(document).ready(function() {
    
    /*
        Form
    */
    $('.f1 fieldset:first').fadeIn('slow');
    
    $('.f1 input[type="text"], .f1 input[type="password"], .f1 textarea').on('focus', function() {
        $(this).removeClass('input-error');
    });
    
    stepCount = 1; //step 1

    // next step
    $('.f1 .btn-next').on('click', function() {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        var currentValue = '';
        
        //pre-error display
        parent_fieldset.find('input[type="text"], input[type="password"], textarea').each(function() {
            currentValue = $(this).val();
            if(currentValue == "" && !next_step) {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });

        if(next_step) {
            // fields validation
            switch(stepCount){
                case 1: //upload
                    // console.log('fup_image');
                    // console.log($(this).parents('.step-1').find('#upload-filename')[0].textContent);
                    // console.log($(this).parents('.step-1').find('#fup_image')[0].value);

                    if(currentValue.length < 10 ||
                        $(this).parents('.step-1').find('#fup_image')[0].value == '') 
                    {
                        next_step = false;  
                        $(this).parents('.step-1').find('.wizard-alert').addClass('warning');
                    }

                    if(next_step) 
                    {
                        inputStringStep1 = currentValue; 
                        $(this).parents('.step-1').find('.wizard-alert.warning').removeClass('warning');   
                    }
                    break;

                case 2: //user

                    if(currentValue.indexOf('@@') > -1 ||
                        currentValue.indexOf('@ ') > -1 ||
                        currentValue.indexOf('@') == -1 ||
                        currentValue.substr(currentValue.length - 1) == '@') {
                            next_step = false;
                            $(this).parents('.step-2').find('.wizard-alert').addClass('warning');
                    }
                    else {
                        $.ajax({
                          url: serverFilePath, //serverFilePath di declare di vw_master.php --> jQuery gak bisa php
                          dataType: 'json', // Choosing a JSON datatype
                          cache: true,
                          async: false,
                        }).done(function(retdata) 
                        {
                            //cek data dari user.json
                            var data = retdata;
                            var temp = currentValue.trim().split(' ');
                            var values = [];
                            for(var i=0;i<temp.length;i++) {
                                values.push({data: temp[i], isFound: false});
                            }
                            data = _.filter(data, function(item) {
                                for(var i=0;i<values.length;i++) {
                                    if(values[i].isFound) continue;
                                    if(item.display.toLowerCase() == values[i].data.toLowerCase()) {
                                        values[i].isFound = true;
                                        break;
                                    }
                                }

                                return false; //gak perlu tau value apa yang cocok dari json
                            });

                            for(var i=0;i<values.length;i++) {
                                if(!values[i].isFound) {
                                    next_step = false;
                                    $(this).parents('.step-2').find('.wizard-alert').addClass('warning');
                                }
                            }
                        }).fail(function(retdata)
                        {
                        });

                    }

                    if(next_step) {
                        $(this).parents('.step-2').find('.wizard-alert.warning').removeClass('warning');
                        inputStringStep2 = currentValue;
                        var mentionedPerson = currentValue.split("@").length - 1;
                        console.log('mentionedPerson (todo: harus diapain???)');
                        console.log(mentionedPerson);

                        $("p#p_user")[0].innerHTML = ((tour_lang === "ENG") ? "User" :  "Rekan") + " (" + mentionedPerson + ")";
                    }

                    break;

                case 3: //energy
                    var okSpan = $("span.glyphicon-ok");
                    var selectedEnergyCount = 0;
                    // for(var i=0;i<okSpan.length;i++){
                    //     if(okSpan[i].clientHeight > 0)
                    //         selectedEnergyCount++;
                    // }
                    // var removeSpan = $("span.glyphicon-remove");
                    var total = 0;
                    // for(var i=0;i<removeSpan.length;i++){
                    //     if(removeSpan[i].clientHeight > 0)
                    //         notSelectedEnergyCount++;
                    // }



                    var strEnergy = '';

                    $('.glyphy').each(function(){
                      var dataLayer = $(this).data('index');
                      //console.log('dataLayer : ' + dataLayer);
                      total+=1;
                      $('.glyphy[data-index="'+ dataLayer +'"]').each(function(){
                        var bool = $(this).find('input[type=checkbox]').is(':checked');
                        if(bool)
                        {
                            selectedEnergyCount+=1;
                            strEnergy = strEnergy.concat($(this).find('input[type=hidden]').val() + ' ');
                            console.log($(this).find('input[type=hidden]').val());    
                        }                        
                     });
                    });
                    console.log('energy yang diselect:');
                    console.log(selectedEnergyCount + ' dari ' + total);
                    console.log(strEnergy);
 
                    if(selectedEnergyCount <= 0)
                    {
                        $(this).parents('.step-3').find('.wizard-alert').addClass('warning');
                        next_step = false;
                    }

                    if(next_step) 
                    {
                        $(this).parents('.step-3').find('.wizard-alert.warning').removeClass('warning');
                        inputStringStep3 = strEnergy.trim();
                        $("p#p_energy")[0].innerHTML = ((tour_lang === "ENG") ? "Energy" :  "Energi") + " (" + selectedEnergyCount + ")";


                        // console.log('masuk 4');
                        // console.log($("span#upload-filename"));
                        // console.log($("div#div_preview_image"));

                        //langsung masuk ke preview
                        //generate string dari step 1-3 untuk ditampilkan disini
                        var strPost = 
                            inputStringStep1 + ' ' + 
                            inputStringStep2 + ' ' + 
                            inputStringStep3;
                        $("#post_preview").val(strPost);
                        $("textarea#txa_post_preview")[0].innerHTML = strPost;
                        $("div#div_preview_image")[0].innerHTML = $("span#upload-filename")[0].outerHTML;
                    }
                    break;
                case 4: //submit -- seharusnya gak akan pernah masuk sini
                default:
                    break;
            }
        }
        
        //post-error display
        parent_fieldset.find('input[type="text"], input[type="password"], textarea').each(function() {
            if(!next_step) {
                $(this).addClass('input-error');
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        
        if( next_step ) {
            stepCount++;
            parent_fieldset.fadeOut(400, function() {
                // change icons
                current_active_step.removeClass('active').addClass('activated').next().addClass('active');
                // progress bar
                bar_progress(progress_line, 'right');
                // show next step
                $(this).next().fadeIn();
                // scroll window to beginning of the form
                scroll_to_class( $('.f1'), 60 );

                // if(stepCount == 3) {
                //     console.log('masuk 4');
                //     // console.log($("span#upload-filename"));
                //     // console.log($("div#div_preview_image"));

                //     //langsung masuk ke preview
                //     //generate string dari step 1-3 untuk ditampilkan disini
                //     var strPost = 
                //         inputStringStep1 + ' ' + 
                //         inputStringStep2 + ' ' + 
                //         inputStringStep3;
                //     $("#post_preview").val(strPost);
                //     $("textarea#txa_post_preview")[0].innerHTML = strPost;
                    

                //     $("div#div_preview_image")[0].innerHTML = $("span#upload-filename")[0].outerHTML;
                // }
            });
        }

    });
    
    // previous step
    $('.f1 .btn-previous').on('click', function() {
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');
        
        $(this).parents('fieldset').fadeOut(400, function() {
            stepCount--;
            
            // change icons
            current_active_step.removeClass('active').prev().removeClass('activated').addClass('active');
            // progress bar
            bar_progress(progress_line, 'left');
            // show previous step
            $(this).prev().fadeIn();
            // scroll window to beginning of the form
            scroll_to_class( $('.f1'), 60 );
        });
    });
    
    // submit
    $('.f1').on('submit', function(e) {
        
        // fields validation
        $(this).find('input[type="text"], input[type="password"], textarea').each(function() {
            if( $(this).val() == "" ) {
                e.preventDefault();
                $(this).addClass('input-error');
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        // fields validation
        
    });
    
    
});
