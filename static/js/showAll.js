var DV; // main class reference variable

// A $( document ).ready() block.
$( document ).ready(function() {
    // update_method_list();
    show_single_plots();
    // update_var_tot_image();
});

function show_single_plots(district){
    $.ajax({
        url: '/plot_beat_single_png',
        data: JSON.stringify({district:district}),
        type: 'POST',
        success: function(res) {
            if(res.msg != "success") alert(res.msg)
            else{
                console.log(res)
                // console.log(len(res.fig))
                res.fig.forEach(function(img,i){
                  $('#main_div').append('<div class="col-lg-4"><image src='+"data:image/png;base64, "+ img+'></div>');
                })
                // $('#image').attr('src',src);
            }
        },
        error: function(error) {
            console.log(error);
        }
    })

}


/*
initialize UI accordion
*/
// $('#attribute_list')
//   .accordion({
//     selector: {
//       trigger: '.title .icon',
//       update_method_list()
//     }
//
//   });

/*
Function to read a csv file
*/
$('#file_input').on('change', function(e) {

 	if (!e.target.files.length) return;  //check file length

    var file = e.target.files[0];
    var ext = file.name.split('.').pop();

    if (ext != "csv") {  // not a csv
        file_error("File format error");
    } else {
    	var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
    	  	$.ajax({
	            url: '/read_csv',
	            data: JSON.stringify({content:reader.result}),
	            type: 'POST',
	            success: function(res) {
	            	// console.log(res);
                    $("#update_button").show()
	            	update_attribute_list(res.attributes)
                update_method_list()
	            },
	            error: function(error) {
	                console.log(error);
	            }
	        })
        }
    }
});

/*
Update the attribute list
when a new csv file is read
*/
function update_attribute_list(attributes){
    $("#attribute_list").empty()
    for(var i=0;i<attributes.length;i++){
        $("#attribute_list").append('<div class="title">'+
                                        '<i class="dropdown icon"></i>'+
                                        attributes[i]+
                                        '<input class="attr" type="checkbox" value="'+attributes[i]+
                                        '" style="margin-left:5px;">'+
                                    '</div>'+
                                    '<div class="content">'+
                                        '<p class="transition hidden">nothing yet</p>'+
                                    '</div>')
        // $("#attribute_list").append('<option value="'+attributes[i]+'">'+attributes[i]+'</option>')
    }
}


function update_beat_list(beatlist){
    $(".bList").empty()
    for(var i=0;i<beatlist.length;i++){
      $(".bList").append('<option value="'+beatlist[i]+'">'+beatlist[i]+'</option>')

    }
  }

// district_list =[1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 14, 15, 16, 17, 18,
//        19, 20, 22, 24, 25]
var beat_dictionary = {};

 function update_district_list(){
     // $("#method_list").empty()

     $.ajax({
         url: '/get_data',
         type: 'POST',
         success: function(res) {
             if(res.msg != "success") alert(res.msg)
             else{
                 console.log(res)
                 beat_dictionary=res.data
                 district_list = Object.keys(res.data);
                 $(".dList").append('<option value="select">Select</option>')
                 for(var i=0;i<district_list.length;i++){
                   $(".dList").append('<option value="'+district_list[i]+'">'+district_list[i]+'</option>')

                 }

             }
         },
         error: function(error) {
             console.log(error);
         }
     })

     // $(".dList").append('<option selected value="avg">Average</option>' +
     // 	                	     '<option value="sum">Summation</option>'
     //                             )

         // $("#attribute_list").append('<option value="'+attributes[i]+'">'+attributes[i]+'</option>')
 }
/*
Update the main viz
when a user clicks the update button
*/
function update(highlight=false){
    $.ajax({
        url: '/plot_png',
        data: JSON.stringify({b1:$("#b1").val(),b2:$("#b2").val(),district:$("#district").val()
                            }),
        type: 'POST',
        success: function(res) {
            if(res.msg != "success") alert(res.msg)
            else{
                console.log(res)
                src = "data:image/png;base64, "+res.fig;
                $('#image').attr('src',src);
            }
        },
        error: function(error) {
            console.log(error);
        }
    })

}

function update_dist_image(highlight=false){
    // $("#imageDist").empty()
    $.ajax({
        url: '/plot_dist_png',
        data: JSON.stringify({district:$("#district").val()
                            }),
        type: 'POST',
        success: function(res) {
            if(res.msg != "success") alert(res.msg)
            else{
                console.log(res)
                src = "data:image/png;base64, "+res.fig;
                width="450"
                height="450"
                $('#imageDist').attr('src',src);
                $('#imageDist').attr('width',width);
                $('#imageDist').attr('height',height);
            }
        },
        error: function(error) {
            console.log(error);
        }
    })

}



function update_var_tot_image(highlight=false){
    // $("#imageDist").empty()
    $.ajax({
        url: '/plot_var_tot_png',
        data: JSON.stringify(),
        type: 'GET',
        success: function(res) {
            if(res.msg != "success") alert(res.msg)
            else{
                console.log(res)
                src1 = "data:image/png;base64, "+res.fig1;
                src2 = "data:image/png;base64, "+res.fig2;
                width="350"
                height="350"
                $('#imageVar').attr('src',src1);
                $('#imageVar').attr('width',width);
                $('#imageVar').attr('height',height);
                $('#imageTotal').attr('src',src2);
                $('#imageTotal').attr('width',width);
                $('#imageTotal').attr('height',height);
            }
        },
        error: function(error) {
            console.log(error);
        }
    })

}



/*
event listener for update button click
*/
$("#update_button").on("click",function(){update()})


/*
event listener for showall button click
// */
// $("#showButton").on("click",function (){
//         location.href = "/templates/showAll.html";})


/*
event listener for a change
in the total number of groups
*/
$("#total_groups").on("change",function(){
  total_groups = parseFloat($(this).val())
  $("#total_groups_text").html(total_groups)
  updateV2()
})

/*
event listener for a change in method
*/

$("#district").on("change",function(){
  district = $(this).val()
  if(district!="Select"){
    console.log("changed",district,beat_dictionary[district])
    update_beat_list(beat_dictionary[district])
    update_dist_image()

  }
})

$("#method_list").on("change",function(){
  method = $(this).val()
  updateV2()
})

$("#inverse").change(function() {
    if(DV) {
        DV.create_nested_data(this.checked)
        DV.draw_treemap()
    }
});
