var NomIdimage=null; //id de la imagen disponible 

var foto_calidad;
var foto_tamano;


if(localStorage.foto_calidad==""){
	foto_calidad = "100";
}else{
	foto_calidad = localStorage.foto_calidad;
}	//alert(foto_calidad);

if(localStorage.foto_tamano==""){
	foto_tamano = "640";
}else{
	foto_tamano = localStorage.foto_tamano;
}	//alert(foto_tamano);

function elimina_foto(num){
	$("#bloque"+num).attr('src')=="";
	$("#bloque"+num).remove();
	$("#api-camera").trigger("create");
}

function onFail(message) {
	$("img").each(function() {
		if($(this).attr('src')=="" || $(this).attr('src')==null){
			$(this).remove();
		}
	});		
	
	//alert('Falla al capturar Foto'); //message
}
    
function take_pic() {
	//VERIFICA SI EXISTEN ELEMENTOS IMG, SI HAY VERIFICA SI HAY DISPONIBILIDAD PARA CAPTURA DE FOTOGRAFÍA
	var img_disponible = false;
	$("img").each(function() {
		if($(this).attr('src')=="" || $(this).attr('src')==null){
			NomIdimage=$(this).attr('id');
			img_disponible = true;
			return false; 											//Espacio Disponible
		}
	});																	//	alert(img_disponible);
	//SI NO EXISTE CREA EL ELEMENTO IMG PARA ALMACENAR LA FOTO
	if(img_disponible==false){
		$("#lista_fotos").append(
			'<div id="bloque'+i_foto+'"> ' +
				'<img id="cameraImage'+i_foto+'" src="" width="320" height="210" align="center"/>'+
				'<button type="button" onclick="elimina_foto('+i_foto+');" id="btn_elimina'+i_foto+'" data-theme="a" data-icon="arrow-u" data-mini="true" data-iconpos="left" data-role="button"> '+ 
				'Eliminar Foto</button>'+
			'</div>');
			
			
		
		//$('#btn_elimina'+i_foto+'').button();
		NomIdimage = "cameraImage"+i_foto;
		i_foto++;
	}
	$("#api-camera").trigger("create");
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, 
								{ 	quality : foto_calidad//,
									//sourceType : Camera.PictureSourceType.CAMERA
						    		,destinationType : Camera.DestinationType.DATA_URL /**/ 
						    		//,encodingType: Camera.EncodingType.JPEG
						    		,targetWidth: foto_tamano
						    		,targetHeight: foto_tamano	
						    		});

}

// api-camera
function onPhotoDataSuccess(imageData) {	//alert("camara ok");
    image = document.getElementById(NomIdimage);
    image.style.display = 'block';	//alert(imageData);
    image.src = "data:image/jpeg;base64," + imageData;				//alert(imageData);
    //$("#api-camera").trigger("create");
    imageData = null;
}

function onPhotoURISuccess(imageURI) {
      // Get image handle
      var largeImage = document.getElementById(NomIdimage);

      // Unhide image elements
      largeImage.style.display = 'block';

      // Show the captured photo
      largeImage.src = imageURI;
      imageURI = null;
    }